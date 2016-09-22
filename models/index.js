'use strict';

const mongoose = require('mongoose');
const dbConfig = require('../db/config');

// var opts = {
//   db: { native_parser: true },
//   server: {
//     poolSize: 5 ,
//     auto_reconnect: true,
//     socketOptions: { keepAlive: 1 }
//   },
//   replset: { rs_name: 'foba' }
// }

mongoose.connect(dbConfig.dbLogin);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  // we're connected!
  console.log('mongodb server start!');
});

// models
require('./company');
require('./founder');
require('./invest');

exports.Company = mongoose.model('Company');
exports.Founder = mongoose.model('Founder');
exports.Invest = mongoose.model('Invest');
