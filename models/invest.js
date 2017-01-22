var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InvestSchema = new Schema({
  name: { type: String }
}, {
  strict: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

InvestSchema.index({ investDetailLink: 1 });
InvestSchema.index({ name: 1 });

mongoose.model('Invest', InvestSchema);
