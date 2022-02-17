const express = require("express");
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const basicAuth = require('basic-auth');
const moment = require('moment');
const { check } = require('express-validator');
const { decodeBase64 } = require("bcryptjs");


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'cloud'
});

const app = express();


connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Server!');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Auth


// Validation Blocks

let signupValidation = [
  check('firstname', 'Name is requied').not().isEmpty(),
  check('lastname', 'Name is requied').not().isEmpty(),
  check('emailaddress', 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
  check('password', 'Password must be 8 or more characters').isLength({ min: 8 })
];

let loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
  check('password', 'Password must be 8 or more characters').isLength({ min: 8 })
];

// First API Get Request

app.get('/', (req, res) => {
  res.send('authorized');
});

// API Request to create new user with hashed password

app.post('/register', signupValidation, (req, res, next) => {
  connection.query(`SELECT * FROM users WHERE LOWER(emailaddress) = LOWER(${connection.escape(req.body.emailaddress)});`,
    (err, result) => {
      if (result.length) {
        return res.status(400).send({msg: 'This user is already in use!'});
      } else {
        // username is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) { 
            return res.status(500).send({msg: err});
          } else {
            // has hashed pw => add to database
            console.log(hash);
            connection.query(`INSERT INTO users (firstname, lastname, emailaddress, password) VALUES ('${req.body.firstname}', '${req.body.lastname}', ${connection.escape(req.body.emailaddress)}, '${hash}')`,
            (err, result) => {
              if (err) {
              throw err;
              return res.status(400).send({msg: err});
          }
              return res.status(201).send({msg: 'The user has been registerd with us!'});
                  });
            }
        });
      }
    });
})

// API Endpoint to authenticate user login.

app.post('/authenticated', loginValidation, (req, res, next) => {

  // console.log(req);

  const user = basicAuth(req);

  connection.query(`SELECT * FROM users WHERE emailaddress = ${connection.escape(user.name)};`, (err, result) => {


      // user does not exists
      if (err) {
        throw err;
        return res.status(400).send({msg: err});
      }
      
      if (!result.length) {
          return res.status(401).send({msg: 'Email or password is incorrect!'});
      }

      // check password
      bcrypt.compare(user.pass, result[0]['password'], (bErr, bResult) => {
          // wrong password
          if (bErr) { 
              throw bErr;
              return res.status(401).send({msg: 'Email or password is incorrect!'});
          }
      
          if (bResult) {
            
              // const token = jwt.sign({id:result[0].id},'the-super-strong-secrect',{ expiresIn: '1h' });
              // console.log(token);
              // connection.query(`UPDATE users SET account_updated = now() WHERE id = '${result[0].id}'`);
              return res.status(200).send({msg: 'Logged in!', user: result[0]});
          }
          return res.status(401).send({msg: 'Username or password is incorrect!'});
      });
  });
});

// Update User Information

app.post('/update', loginValidation, (req, res, next) => {

  const user = basicAuth(req);

  connection.query(`SELECT * FROM users WHERE emailaddress = ${connection.escape(user.name)};`, (err, result) => {
    if (err) {
      throw err;
      return res.status(400).send({msg: err});
    }

    if (!result.length) {
      return res.status(401).send({msg: 'Email or password is incorrect!'});
    }

    // check password
    bcrypt.compare(user.pass, result[0]['password'], (bErr, bResult) => {
      if (req.body.firstname != result[0].firstname) {
        connection.query(`UPDATE users SET firstname = '${req.body.firstname}', account_updated = '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}'  WHERE emailaddress = '${result[0].emailaddress}'`);
        return res.status(201).send({msg: 'The firstname has been updated!'});
      } else if (req.body.lastname != result[0].lastname) {
        connection.query(`UPDATE users SET lastname = '${req.body.lastname}', account_updated = '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}'  WHERE emailaddress = '${result[0].emailaddress}'`);
        return res.status(201).send({msg: 'The lastname has been updated!'});
      } else if (req.body.newpassword == req.body.confirmnewpassword) {
          bcrypt.hash(req.body.newpassword, 10, (err, hash) => {
          if (err) { 
            return res.status(500).send({msg: err});
          } else {
            // new hashed pw => add to database
            connection.query(`UPDATE users SET password = '${hash}', account_updated = '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}' WHERE emailaddress = '${result[0].emailaddress}'`,
              (err, result) => {
                  if (err) {
                  throw err;
                  return res.status(400).send({msg: err});
              }
              return res.status(201).send({msg: 'The password has been updated!'});
              });
            }
        });
      } else {
        return res.status(400).send({msg: "Something went wrong!"});
      }
    });
  });
});

// GET User Information

app.post('/get-user', signupValidation, (req, res, next) => {

  const user = basicAuth(req);

  // if(
  //   !req.headers.authorization ||
  //   !req.headers.authorization.startsWith('Bearer') ||
  //   !req.headers.authorization.split(' ')[1]
  // ) 
  // {
  //   return res.status(422).json({
  //     message: "Please provide the token",
  //   });
  // }
  
  // const theToken = req.headers.authorization.split(' ')[1];
  
  // const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
  
  connection.query('SELECT emailaddress, firstname, lastname, account_created, account_updated FROM users where emailaddress=?', user.name, function (error, results, fields) {

    if (error) throw error;
      return res.send({ error: false, data: results[0], message: 'Fetch Successfully.' });
    }

  );
});

// Listen on Port 8080

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});