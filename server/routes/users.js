var express = require('express');
var router = express.Router();
// var ibm_db = require('ibm_db');
var secrets = require('../secrets.js');

router.post('/authenticate', (req, res, next) => {
  console.log(req.sessionStore);
  // db.query('SELECT username, pw_hash, pw_salt FROM tplayer', (err, data) => {
  //   // if(err || data === null){
  //   // }
  //   console.log(err);
  //   console.log(data);
  //   res.json(data);
  // });
  res.json(req);
});

router.post('/register', (req, res) => {
  // db.query('SELECT 1 FROM tplayer WHERE ')
});

module.exports = router;
