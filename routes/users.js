const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a hi');
});

router.get('/hi', function(req, res, next) {
  res.send('respond with a hihi');
});

module.exports = router;
