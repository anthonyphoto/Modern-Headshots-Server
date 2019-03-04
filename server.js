'use strict';
require('dotenv').config();  //AK: is this reading a .env file and store DATABASE_URL and JWT_SECRET = does it work the same in heroku? 
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

// Here we use destructuring assignment with renaming so the two variables
// called router (from ./users and ./auth) have different names
// For example:
// const actorSurnames = { james: "Stewart", robert: "De Niro" };
// const { james: jimmy, robert: bobby } = actorSurnames;
// console.log(jimmy); // Stewart - the variable name is jimmy, not james
// console.log(bobby); // De Niro - the variable name is bobby, not robert

/* const { router } = require('./users');    
const usersRouter = router;
*/
const { router: usersRouter } = require('./users');  
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { router: eventRouter } = require('./events/router.js');  // Resume router

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');

const app = express();

// Logging
app.use(morgan('common'));

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {   //AK: What is this for?
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

// app.use(express.static('public'));  // client repo is separate
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/events/', eventRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });  

//AK: Added for admin check
function adminAuth(req, res, next) {
  console.log(req.user.admin);
  if (!req.user.admin) {
    return res.status(404).json({ message: "Sorry.  Only admin can access this page."})
  }
  next();
}

// A protected endpoint which needs a valid JWT to access it
app.get('/api/protected', [jwtAuth, adminAuth], (req, res) => {  
  console.log(req.user);
  return res.json({
    data: 'rosebud'
  });
});

app.get('/users/:id', jwtAuth, (req, res) => {
console.log(req.user);

  return res.json(req.params);
});

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
