var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FounderSchema = new Schema({
  name: { type: String }
}, {
  strict: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

FounderSchema.index({ founderDetailLink: 1 });
FounderSchema.index({ name: 1 });

mongoose.model('Founder', FounderSchema);
