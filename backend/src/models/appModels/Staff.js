const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  removed: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },

  name: { type: String, required: true, trim: true },
  role: { type: String, default: 'Trainee', trim: true },
  monthlySalary: { type: Number, required: true },
  startDate: { type: Date },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Staff', staffSchema);
