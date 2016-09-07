'use strict';

const mongoose = require('mongoose');
const dbConfig = require('../db/config');

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

exports.Company = mongoose.model('Company');
exports.Founder = mongoose.model('Founder');
