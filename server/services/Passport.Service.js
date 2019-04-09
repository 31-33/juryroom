const passport = require('passport');
const LocalStrategy = require('passport-local');
// const ibm_db = require('ibm_db');
// const secrets = require('../secrets.js');
//
// let db = null;
// ibm_db.open(secrets.dsn, (err, conn) => {
//   if(err) console.log(err);
//   else {
//     db = conn;
//     console.log("db connection initialized");
//   }
// });


passport.use(new LocalStrategy({
  // passport callback
  (username, password, done) => {
    
  }
})
