const express = require("express");
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require("uuid");
const auth = require('basic-auth');
const moment = require('moment');
const { check } = require('express-validator');
const { decodeBase64 } = require("bcryptjs");
const e = require("express");


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
  check('first_name', 'Name is requied').not().isEmpty(),
  check('last_name', 'Name is requied').not().isEmpty(),
  check('username', 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
  check('password', 'Password must be 8 or more characters').isLength({ min: 8 })
];

let loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
  check('password', 'Password must be 8 or more characters').isLength({ min: 8 })
];

// Helper function to validate user

const validateUser = (user) => {

  // Validate username to database user

  let res;

  connection.query('SELECT username, password FROM users where username=?', user.name, function (error, results) {
    if (results.length != 0) {
      // decrypt the hash
      bcrypt.compare(user.pass, results[0]['password'], (bErr, bResult) => {
        if (bResult) {
          return true;
        } else {
          return false;
        }
      });
    } else {
      return false;
    }
  });
}

// First API Get Request

app.get('/healthz', (req, res) => {
  const user = auth(req);
  res.status(200).send('');

  // connection.query('SELECT username, password FROM users where username=?', user.name, function (error, results) {
  //   if (results.length != 0) {
  //     // decrypt the hash
  //     bcrypt.compare(user.pass, results[0]['password'], (bErr, bResult) => {
  //       if (bResult) {
  //         res.status(200).send('');
  //       } else {
  //         res.status(401).send('Incorrect Password!');
  //       }
  //     });
  //   } else {
  //     res.status(401).send('Incorrect Username!');
  //   }
  // });
});

// API Request to create new user with hashed password

app.post('/v1/user', signupValidation, (req, res, next) => {
  connection.query(`SELECT * FROM users WHERE LOWER(username) = LOWER(${connection.escape(req.body.username)});`,
    (err, result) => {
      if (result.length) {
        return res.status(400).send("");
      } else {
        // username is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({ msg: err });
          } else {
            // has hashed pw => add to database
            connection.query(`INSERT INTO users (id, first_name, last_name, username, password) VALUES ('${uuidv4()}', '${req.body.first_name}', '${req.body.last_name}', ${connection.escape(req.body.username)}, '${hash}')`,
              (err, result) => {
                if (err) {
                  throw err;
                  return res.status(400).send("");
                }
                connection.query('SELECT id, username, first_name, last_name, account_created, account_updated FROM users where username=?', req.body.username, function (error, resultsMain, fields) {
                  console.log(resultsMain)
                  if (error) throw error;
                  return res.status(201).send(resultsMain[0]);
                }

                );

                // return res.status(201).send({ msg: 'The user has been registerd with us!' });
              }
            );
          }
        });
      }
    });
})

// API Endpoint to authenticate user login.

// app.post('/authenticated', loginValidation, (req, res, next) => {

//   // console.log(req);

//   const user = auth(req);

//   connection.query(`SELECT * FROM users WHERE username = ${connection.escape(user.name)};`, (err, result) => {


//       // user does not exists
//       if (err) {
//         throw err;
//         return res.status(400).send({msg: err});
//       }

//       if (!result.length) {
//           return res.status(401).send({msg: 'Email or password is incorrect!'});
//       }

//       // check password
//       bcrypt.compare(user.pass, result[0]['password'], (bErr, bResult) => {
//           // wrong password
//           if (bErr) { 
//               throw bErr;
//               return res.status(401).send({msg: 'Email or password is incorrect!'});
//           }

//           if (bResult) {

//               // const token = jwt.sign({id:result[0].id},'the-super-strong-secrect',{ expiresIn: '1h' });
//               // console.log(token);
//               // connection.query(`UPDATE users SET account_updated = now() WHERE id = '${result[0].id}'`);
//               return res.status(200).send({msg: 'Logged in!', user: result[0]});
//           }
//           return res.status(401).send({msg: 'Username or password is incorrect!'});
//       });
//   });
// });

// Update User Information

app.put('/v1/user/self', loginValidation, (req, res, next) => {

  // connection.query('UPDATE users SET ? WHERE ?', [{ 'first_name': 'htfhfghfghfhg' }, { 'username': '1.5@northeastern.edu' }],
  // // connection.query(` UPDATE users SET first_name = '5645654' WHERE username = '1.5@northeastern.edu' `,
  //   (err, result) => {
  //     if (err) {
  //       throw err;
  //       return res.status(400).send("");
  //     }else{
  //       return res.status(201).send("");
  //     }
  //   }
  // );

  const user = auth(req);

  connection.query('SELECT first_name, last_name, username, password FROM users where username=?', user.name, function (error, results) {
    if (results.length != 0) {
      // decrypt the hash
      bcrypt.compare(user.pass, results[0]['password'], (bErr, bResult) => {
        if (bResult) {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).send({ msg: err });
            } else {
              // has hashed pw => add to database
              console.log('vinit@' + user.name);
              connection.query(` UPDATE users SET first_name = '${req.body.first_name}',
               last_name = '${req.body.last_name}',
               password = '${hash}',
               account_updated = '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}'

              
                WHERE username = '${user.name}' `,
                //  '${user.name}' connection.query(`INSERT INTO users (id, first_name, last_name, username, password) VALUES ('${uuidv4()}', '${req.body.first_name}', '${req.body.last_name}', ${connection.escape(req.body.username)}, '${hash}')`,
                (err, result) => {
                  console.log('vinit@11' + user.name);
                  if (err) {
                    console.log('vinit@22' + user.name);
                    throw err;
                    return res.status(400).send("");
                  } else {
                    console.log('vinit@33' + user.name);
                    return res.status(204).send("");
                  }
                }
              );

            }
          });


          // -----------------
          // if (req.body.first_name != results[0].first_name) {
          //   connection.query(`UPDATE users SET first_name = '${req.body.first_name}', account_updated = '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}'  WHERE username = '${results[0].username}'`);
          //   return res.status(201).send({ msg: 'The first_name has been updated!' });
          // } else if (req.body.last_name != results[0].last_name) {
          //   connection.query(`UPDATE users SET last_name = '${req.body.last_name}', account_updated = '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}'  WHERE username = '${results[0].username}'`);
          //   return res.status(201).send({ msg: 'The last_name has been updated!' });
          // } else if (req.body.newpassword == req.body.confirmnewpassword) {
          //   bcrypt.hash(req.body.newpassword, 10, (err, hash) => {
          //     if (err) {
          //       return res.status(500).send({ msg: err });
          //     } else {
          //       // new hashed pw => add to database
          //       connection.query(`UPDATE users SET password = '${hash}', account_updated = '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}' WHERE username = '${results[0].username}'`,
          //         (err, result) => {
          //           if (err) {
          //             throw err;
          //             return res.status(400).send({ msg: err });
          //           }
          //           return res.status(201).send({ msg: 'The password has been updated!' });
          //         });
          //     }
          //   });
          // } else {
          //   return res.status(400).send({ msg: "Something went wrong!" });
          // }
        } else {
          res.status(401).send('Incorrect Password!');
        }
      });
    } else {
      res.status(401).send('Incorrect Username!');
    }
  });

  // connection.query(`SELECT * FROM users WHERE username = ${connection.escape(user.name)};`, (err, result) => {
  //   if (err) {
  //     throw err;
  //     return res.status(400).send({msg: err});
  //   }

  //   if (!result.length) {
  //     return res.status(401).send({msg: 'Email or password is incorrect!'});
  //   }

  //   // check password
  //   bcrypt.compare(user.pass, result[0]['password'], (bErr, bResult) => {
  //     if (req.body.first_name != result[0].first_name) {
  //       connection.query(`UPDATE users SET first_name = '${req.body.first_name}', account_updated = '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}'  WHERE username = '${result[0].username}'`);
  //       return res.status(201).send({msg: 'The first_name has been updated!'});
  //     } else if (req.body.last_name != result[0].last_name) {
  //       connection.query(`UPDATE users SET last_name = '${req.body.last_name}', account_updated = '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}'  WHERE username = '${result[0].username}'`);
  //       return res.status(201).send({msg: 'The last_name has been updated!'});
  //     } else if (req.body.newpassword == req.body.confirmnewpassword) {
  //         bcrypt.hash(req.body.newpassword, 10, (err, hash) => {
  //         if (err) { 
  //           return res.status(500).send({msg: err});
  //         } else {
  //           // new hashed pw => add to database
  //           connection.query(`UPDATE users SET password = '${hash}', account_updated = '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}' WHERE username = '${result[0].username}'`,
  //             (err, result) => {
  //                 if (err) {
  //                 throw err;
  //                 return res.status(400).send({msg: err});
  //             }
  //             return res.status(201).send({msg: 'The password has been updated!'});
  //             });
  //           }
  //       });
  //     } else {
  //       return res.status(400).send({msg: "Something went wrong!"});
  //     }
  //   });
  // });
});

// GET User Information

app.get('/v1/user/self', signupValidation, (req, res, next) => {
  console.log("vinit")

  const user = auth(req);

  connection.query('SELECT username, password FROM users where username=?', user.name, function (error, results) {
    if (results.length != 0) {
      console.log("vinit1")
      // decrypt the hash
      bcrypt.compare(user.pass, results[0]['password'], (bErr, bResult) => {
        if (bResult) {
          console.log("vinit2")
          connection.query('SELECT id, username, first_name, last_name, account_created, account_updated FROM users where username=?', user.name, function (error, resultsMain, fields) {
            console.log(resultsMain)
            if (error) throw error;
            return res.status(200).send(resultsMain[0]);
          }

          );
        } else {
          res.status(401).send('');
        }
      });
    } else {
      res.status(401).send('');
    }
  });
});

// Listen on Port 8081

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
