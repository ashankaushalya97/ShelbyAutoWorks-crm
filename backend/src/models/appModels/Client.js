const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  removed: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },

  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  // name is computed from firstName + lastName — kept for search/autocomplete compatibility
  name: { type: String, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  address: { type: String, trim: true },

  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  assigned: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

// Keep name in sync with firstName + lastName on create
schema.pre('save', function (next) {
  this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  next();
});

// Keep name in sync on update
schema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate();
  const firstName = update.firstName || update.$set?.firstName;
  const lastName = update.lastName || update.$set?.lastName;
  if (firstName !== undefined || lastName !== undefined) {
    const f = firstName ?? '';
    const l = lastName ?? '';
    this.set({ name: `${f} ${l}`.trim() });
  }
  next();
});

schema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Client', schema);
