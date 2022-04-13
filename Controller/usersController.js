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
    region: process.env.AWS_REGION
});
var sns = new AWS.SNS({});

// Create a User

async function createUser(req, res, next) {
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
            isVerified: 0
        };

        User.create(user).then(udata => {
                let link = ' http://demo.domain.tld/v1/verifyUserEmail?email=' + data.id + '&token=' + uuidv4();
                const data_link = {
                    email: udata.id,
                    link: link
                }

                const params = {

                    Message: JSON.stringify(data_link),
                    TopicArn: 'arn:aws:sns:us-east-1:981331903688:verify_email:01f8cc09-369a-416f-a0ae-3b332f8f80a7'

                }
                let publishTextPromise = SNS.publish(params).promise();
                publishTextPromise.then(
                    function (data) {

                        console.log(`Message sent to the topic ${params.TopicArn}`);
                        console.log("MessageID is " + data.MessageId);
                        // res.status(204).send();
                        logger.info("/create user 201");
                        logger.info("Message sent to the topic ${params.TopicArn}");
                        sdc.increment('endpoint.userCreate');
                        res.status(201).send({
                            id: udata.id,
                            first_name: udata.first_name,
                            last_name: udata.last_name,
                            username: udata.username,
                            account_created: udata.createdAt,
                            account_updated: udata.updatedAt
                        });

                    }).catch(

                    function (err) {
                        console.error(err, err.stack);
                        res.status(500).send(err);

                    });

            })
            .catch(err => {
                logger.error(" Error while creating the user! 500");
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the user!"
                });
            });
    }
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
    updateUser: updateUser
};