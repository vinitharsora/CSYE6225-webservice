const db = require('../config/sequelizeDB.js');
const User = db.users;
const bcrypt = require('bcrypt');
const {
    v4: uuidv4
} = require('uuid');
const dbConfig = require('../config/configDB.js');
const logger = require("../config/logger");
const SDC = require('statsd-client');
const sdc = new SDC({
    host: dbConfig.METRICS_HOSTNAME,
    port: dbConfig.METRICS_PORT
});
const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1'
});
var sns = new AWS.SNS({});

// //Delete all User
async function deleteAllUser(req, res, next){
    // db.User.destroy({
    //     where: {},
    //     truncate: true
    //   });
    console.log('delete')
    await User.sync({ force: true });
    console.log('delete all')
    res.status(201).send();
   
}

// Create a User

async function createUser(req, res, next) {
    console.log('create userrr')
    var hash = await bcrypt.hash(req.body.password, 10);
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(req.body.username)) {
        logger.info("/create user 400");
        res.status(400).send({
            message: 'Enter your Email ID in correct format. Example: abc@xyz.com'
        });
    }
    const getUser = await User.findOne({
        where: {
            username: req.body.username
        }
    }).catch(err => {
        logger.error("/create user error 500");
        res.status(500).send({
            message: err.message || 'Some error occurred while creating the user'
        });
    });
    if (getUser) {
        res.status(400).send({
            message: 'User already exists!'
        });
    } else {
        var user = {
            id: uuidv4(),
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            password: hash,
            username: req.body.username,
            isVerified: false
        };
        console.log('above user');
        User.create(user).then(async udata => {
                console.log('after user');
                let link = ' http://demo.vinitharsora.me/v1/verifyUserEmail?email=' + udata.username + '&token=' + uuidv4();
                const data_link = {
                    email: udata.id,
                    link: link
                }
                const randomnanoID = uuidv4();
                var dynamoDatabase = new AWS.DynamoDB({
                    apiVersion: '2012-08-10',
                    region: 'us-east-1'
                });
                const initialTime = Math.round(Date.now() / 1000);
                const expiryTime = initialTime + 4 * 60;
                console.log('above parameter');
                // Create the Service interface for dynamoDB
                var parameter = {
                    TableName: 'csye6225',
                    Item: {
                        'Token': {
                            S: randomnanoID
                        },
                        'TimeToLive': {
                            N: expiryTime.toString()
                        }
                    }
                };

                //saving the token onto the dynamo DB
                // await dynamoDatabase.putItem(parameter).promise();

                var msg ={
                    'username': udata.username,
                    'token': randomnanoID
                };
                console.log(JSON.stringify(msg));

                const params = {

                    Message: JSON.stringify(msg),
                    Subject: randomnanoID,
                    TopicArn: 'arn:aws:sns:us-east-1:981331903688:verify_email'

                }
                var publishTextPromise = await sns.publish(params).promise();

                console.log('publishTextPromise', publishTextPromise);
                res.status(201).send({
                    id: udata.id,
                    first_name: udata.first_name,
                    last_name: udata.last_name,
                    username: udata.username,
                    account_created: udata.createdAt,
                    account_updated: udata.updatedAt,
                    isVerified: udata.isVerified
                });

                // publishTextPromise.then(
                //     function (data) {
                //         console.log('publishTextPromise.then', data);
                //         console.log(`Message sent to the topic ${params.TargetArn}`);
                //         console.log("MessageID is " + data);
                //         logger.info("/create user 201");
                //         logger.info(`Message sent to the topic ${params.TargetArn}`);
                //         sdc.increment('endpoint.userCreate');
                //         res.status(201).send({
                //             id: udata.id,
                //             first_name: udata.first_name,
                //             last_name: udata.last_name,
                //             username: udata.username,
                //             account_created: udata.createdAt,
                //             account_updated: udata.updatedAt,
                //             isVerified: udata.isVerified
                //         });

                //     }).catch(

                //     function (err) {
                //         console.error(err, err.stack);
                //         res.status(500).send(err);

                //     });

            })
            .catch(err => {
                logger.error(" Error while creating the user! 500");
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the user!"
                });
            });
    }
    // try {

    //     if (!request.body || !request.body.username || !request.body.first_name || !request.body.last_name || !request.body.password) {

    //         let response = {
    //             statusCode: 400,
    //             message: "Bad Request"
    //         };
    //         return response;
    //     }

    //     if (request.body.password) {
    //         const encryptedPass = bcrypt.hashSync(request.body.password, 10);
    //         request.body.password = encryptedPass;
    //     }

    //     const newUser1 = new User(request.body);
    //     if (!emailValidator.validate(request.body.username)) {
    //         const profileResponse = {
    //             statusCode: 400,
    //             message: "Bad Request"
    //         };
    //         return profileResponse;
    //     }

    //     let profileExists = await User.findOne({
    //         where: {
    //             username: request.body.username
    //         }
    //     })

    //     if (profileExists) {

    //         const profileResponse = {
    //             statusCode: 400,
    //             message: "Bad Request"
    //         };
    //         return profileResponse;
    //     }

    //     //in case of a new user
    //     else {
    //         const response = await newUser1.save();
    //         //To send message to Dynamo DB
    //         var dynamoDatabase = new AWS.DynamoDB({
    //             apiVersion: '2012-08-10',
    //             region: 'us-east-1'
    //         });
    //         const initialTime = Math.round(Date.now() / 1000);
    //         const expiryTime = initialTime + 4 * 60;
    //         const randomnanoID = uuidv4();

    //         // Create the Service interface for dynamoDB
    //         var parameter = {
    //             TableName: 'myDynamoTokenTable',
    //             Item: {
    //                 'Token': {
    //                     S: randomnanoID
    //                 },
    //                 'TimeToLive': {
    //                     N: expiryTime.toString()
    //                 }
    //             }
    //         };

    //         //saving the token onto the dynamo DB
    //         await dynamoDatabase.putItem(parameter).promise();

    //         //To send message onto SNS
    //         //var sns = new AWS.SNS({apiVersion: '2010-03-31'});

    //         // Create publish parameters
    //         var params = {
    //             Message: response.username,
    //             Subject: randomnanoID,
    //             TopicArn: 'arn:aws:sns:us-east-1:861022598256:verify_email:9ea6311f-e589-4175-ae3e-961c4865ce4f'

    //         };

    //         //var topicARN= 'arn:aws:sns:us-east-1:172869529067:VerifyingEmail';

    //         var publishTextPromise = new AWS.SNS({
    //             apiVersion: '2010-03-31',
    //             region: 'us-east-1'
    //         });
    //         await publishTextPromise.publish(params).promise();

    //         //returning response of the creating user.
    //         const returnProfile = {
    //             statusCode: 200,
    //             message: {
    //                 id: response.id,
    //                 first_name: response.first_name,
    //                 last_name: response.last_name,
    //                 username: response.username,
    //                 account_created: response.createdAt,
    //                 account_updated: response.updatedAt
    //             }
    //         };
    //         return returnProfile;
    //     }
    // } catch (e) {
    //     let response1 = {
    //         statusCode: 500,
    //         message: e.message
    //     };
    //     return response1;
    // }
}

//Get a User

async function getUser(req, res, next) {
    const user = await getUserByUsername(req.user.username);
    if (user) {
        logger.info("get user 200");
        res.status(200).send({
            id: user.dataValues.id,
            first_name: user.dataValues.first_name,
            last_name: user.dataValues.last_name,
            username: user.dataValues.username,
            account_created: user.dataValues.createdAt,
            account_updated: user.dataValues.updatedAt
        });
    } else {
        res.status(400).send({
            message: 'User not found!'
        });
    }
}

// Update a user

async function updateUser(req, res, next) {
    if (req.body.username != req.user.username) {
        logger.error("can not update user 400");
        res.status(400);
    }
    if (!req.body.first_name || !req.body.last_name || !req.body.username || !req.body.password) {
        logger.error("/update user failed 400");
        res.status(400).send({
            message: 'Enter all parameters!'
        });
    }
    User.update({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: await bcrypt.hash(req.body.password, 10)
    }, {
        where: {
            username: req.user.username
        }
    }).then((result) => {
        if (result == 1) {
            logger.info("update user 204");
            sdc.increment('endpoint.userUpdate');
            res.sendStatus(204);
        } else {
            res.sendStatus(400);
        }
    }).catch(err => {
        res.status(500).send({
            message: 'Error Updating the user'
        });
    });
}

async function getUserByUsername(username) {

    return User.findOne({
        where: {
            username: username
        }
    });
}

async function comparePasswords(existingPassword, currentPassword) {
    return bcrypt.compare(existingPassword, currentPassword);
}

module.exports = {
    createUser: createUser,
    getUser: getUser,
    getUserByUsername: getUserByUsername,
    comparePasswords: comparePasswords,
    updateUser: updateUser,
    deleteAllUser: deleteAllUser
};