const express = require('express');
const router = express.Router();
const User = require('../models/User');
const twilio = require('twilio');

// Initialize Twilio (uses mock if keys are missing)
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;
if (TWILIO_SID && TWILIO_AUTH) {
  twilioClient = twilio(TWILIO_SID, TWILIO_AUTH);
  console.log("🟢 Twilio SDK Initialized for REAL SMS Delivery.");
} else {
  console.log("🟡 Twilio Keys not found. Running in MOCK SMS Mode.");
}

// Store OTPs temporarily in memory (In production, use Redis)
const otpStore = new Map();

// 1. Send OTP Route (For Workers & Admins)
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(phone, { otp: generatedOtp, expires: Date.now() + 300000 }); // 5 min expiry
  
  if (twilioClient) {
    try {
      await twilioClient.messages.create({
        body: `Your GigShield verification code is: ${generatedOtp}`,
        from: TWILIO_PHONE,
        to: phone.startsWith('+') ? phone : `+91${phone}`
      });
      return res.status(200).json({ message: "Real SMS Sent Successfully" });
    } catch (err) {
      console.error("Twilio Error:", err.message);
      return res.status(500).json({ error: "Failed to send real SMS. Check credentials." });
    }
  } else {
    // MOCK SMS MODE
    console.log(`\n=================================================`);
    console.log(`📱 MOCK SMS TO ${phone}`);
    console.log(`📲 [GigShield] Your verification code is: ${generatedOtp}`);
    console.log(`=================================================\n`);
    return res.status(200).json({ message: "Mock SMS Sent", mock_otp: generatedOtp });
  }
});

// 2. Verify OTP Route
router.post('/verify-otp', async (req, res) => {
  const { phone, otp, role, name, platform, zone } = req.body;
  
  const record = otpStore.get(phone);
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  otpStore.delete(phone); // OTP used successfully

  try {
    if (role === 'WORKER') {
      let worker = await User.findOne({ phone, role: 'WORKER' });
      if (!worker) {
        worker = new User({ 
          role: 'WORKER', 
          phone,
          name: name || "Gig Worker", 
          platform: platform || "Delivery", 
          zone: zone || "Delhi NCR", 
          activeDays: Math.floor(Math.random() * 5) + 6,
          weeklyPremium: 35,
          walletBalance: 0
        });
        await worker.save();
      }
      return res.status(200).json(worker);
    }
    return res.status(400).json({ error: 'Worker Role Required for this route' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Admin Verification Login (Secure Path)
router.post('/admin-login', async (req, res) => {
  const { password } = req.body;
  
  // Hardcoded secure admin password for Phase 3
  if (password === 'GIGSHIELD26') {
    let admin = await User.findOne({ role: 'ADMIN' });
    if (!admin) {
      admin = new User({ role: 'ADMIN', name: 'Super Admin', phone: '0000000000' });
      await admin.save();
    }
    return res.status(200).json(admin);
  } else {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

module.exports = router;
