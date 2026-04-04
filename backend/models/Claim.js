const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'], default: 'PENDING' },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['PARAMETRIC', 'MANUAL'], default: 'PARAMETRIC' },
  triggerReason: { type: String }, // e.g., 'Rain > 10mm', 'Heat > 40°C', 'Low Surge'
  gpsLocation: {
    lat: Number,
    lng: Number,
    isVerified: { type: Boolean, default: false }
  },
  fraudScore: { type: Number, default: 0 },
  payoutDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
