const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanySchema = new Schema({
  name: { type: String }
}, {
  strict: false
});

CompanySchema.index({ cpyDetailLink: 1 });

mongoose.model('Company', CompanySchema);
