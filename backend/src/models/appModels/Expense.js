const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  removed: { type: Boolean, default: false },

  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ['parts', 'salary', 'utilities', 'tools', 'rent', 'other'],
  },
  description: { type: String, required: true, trim: true },
  reference: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin', autopopulate: true },
  updated: { type: Date, default: Date.now },
  created: { type: Date, default: Date.now },
});

expenseSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Expense', expenseSchema);
