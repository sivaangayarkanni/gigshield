const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: { type: String, enum: ['WORKER', 'ADMIN'], required: true },
  phone: { type: String, sparse: true },
  name: { type: String, required: true },
  platform: { type: String }, // Zomato/Swiggy/Zepto/Uber
  zone: { type: String },
  walletBalance: { type: Number, default: 0 },
  bankAccountNo: { type: String, default: "XXXX-XXXX-1234" },
  bankName: { type: String, default: "State Bank of India" },
  activeDays: { type: Number, default: 0 },
  weeklyPremium: { type: Number, default: 35 },
  policyActive: { type: Boolean, default: true },
  starRating: { type: Number, min: 1, max: 5, default: 3 },
  lastKnownLocation: {
    lat: { type: Number },
    lng: { type: Number },
    timestamp: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
