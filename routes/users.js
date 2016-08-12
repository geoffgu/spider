const Express = require('express');
const Router = Express.Router();

/* GET users listing. */
Router.get('/', function(req, res, next) {
  res.send('respond with a hi');
});

Router.get('/hi', function(req, res, next) {
  res.send('respond with a hihi');
});

module.exports = Router;
