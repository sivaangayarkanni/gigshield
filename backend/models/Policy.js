const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['SURGE_GAP', 'HEAT_STROKE', 'STORM_COVER'], required: true },
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'PENDING'], default: 'ACTIVE' },
  premium: { type: Number, required: true },
  coverageAmount: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  parametricTriggers: [{
    metric: String,
    threshold: Number,
    operator: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);
