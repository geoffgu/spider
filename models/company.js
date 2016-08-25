'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanySchema = new Schema({
  name: { type: String }
}, {
  strict: false
});

mongoose.model('Company', CompanySchema);