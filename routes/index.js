const express = require('express');
const router = express.Router();
const models = require('../models');
var Founder = models.Founder;

/* GET home page. */
router.get('/', function(req, res, next) {
  Founder.find({}, 'name avatar founderDetailLink', function (err, founders) {
    if (err) console.error(err);
    console.log(JSON.stringify(founders));
    res.render('index', { title: 'Express', founders: founders });
  });
});

module.exports = router;
