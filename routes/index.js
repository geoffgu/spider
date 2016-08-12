const Express = require('express');
const Router = Express.Router();

/* GET home page. */
Router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = Router;
