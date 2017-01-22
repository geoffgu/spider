var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanySchema = new Schema({
  name: { type: String }
}, {
  strict: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

CompanySchema.index({ cpyDetailLink: 1 });
CompanySchema.index({ name: 1 });

mongoose.model('Company', CompanySchema);
