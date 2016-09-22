'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InvestSchema = new Schema({
  name: { type: String }
}, {
  strict: false
});

InvestSchema.index({ investDetailLink: 1 });

mongoose.model('Invest', InvestSchema);
