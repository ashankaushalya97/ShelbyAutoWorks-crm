const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  removed: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },

  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true,
    autopopulate: true,
  },
  make: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number },
  licensePlate: { type: String, required: true, trim: true, uppercase: true },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  updated: { type: Date, default: Date.now },
  created: { type: Date, default: Date.now },
});

vehicleSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Vehicle', vehicleSchema);
