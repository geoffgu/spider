const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FounderSchema = new Schema({
  name: { type: String }
}, {
  strict: false
});

FounderSchema.index({ founderDetailLink: 1 });

mongoose.model('Founder', FounderSchema);
