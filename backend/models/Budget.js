const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const budgetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // e.g., "2025-04"
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Budget', budgetSchema);