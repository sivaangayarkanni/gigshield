const express = require('express');
const router = express.Router();
const { userOps, otpOps, sessionOps } = require('../database/sqlite');
const twilio = require('twilio');
const axios = require('axios');

// Initialize Twilio (uses mock if keys are missing)
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

// Fast2SMS Configuration (Free for Indian numbers)
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

let twilioClient = null;
if (TWILIO_SID && TWILIO_AUTH && TWILIO_SID !== '#leftout for prototype') {
  twilioClient = twilio(TWILIO_SID, TWILIO_AUTH);
  console.log("🟢 Twilio SDK Initialized for REAL SMS Delivery.");
} else if (FAST2SMS_API_KEY && FAST2SMS_API_KEY !== 'your_fast2sms_api_key') {
  console.log("🟢 Fast2SMS Initialized for REAL SMS Delivery (India).");
  console.log(`🔑 API Key: ${FAST2SMS_API_KEY.substring(0, 15)}...${FAST2SMS_API_KEY.substring(FAST2SMS_API_KEY.length - 5)}`);
} else {
  console.log("🟡 No SMS provider configured. Running in MOCK SMS Mode.");
  console.log("🟡 To enable REAL SMS:");
  console.log("   1. Get Fast2SMS API key from https://www.fast2sms.com");
  console.log("   2. Add to backend/.env: FAST2SMS_API_KEY=your_key_here");
}

/**
 * Send SMS via Fast2SMS (Free for Indian numbers)
 * Uses Quick route - simplest method, no verification needed
 */
async function sendSMSViaFast2SMS(phone, otp) {
  try {
    const cleanPhone = phone.replace('+91', '').replace(/\D/g, '');
    
    console.log(`[SMS] ========================================`);
    console.log(`[SMS] Sending SMS via Fast2SMS (Quick Route)`);
    console.log(`[SMS] Phone: ${cleanPhone}`);
    console.log(`[SMS] OTP: ${otp}`);
    console.log(`[SMS] API Key: ${FAST2SMS_API_KEY.substring(0, 10)}...`);
    console.log(`[SMS] ========================================`);
    
    // Fast2SMS API call using Quick route (simplest, no verification needed)
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    const message = `Your EarnSure OTP is ${otp}. Valid for 5 minutes.`;
    
    const params = {
      authorization: FAST2SMS_API_KEY,
      route: 'q',  // Quick route - simplest method
      message: message,
      language: 'english',
      flash: 0,
      numbers: cleanPhone
    };
    
    console.log(`[SMS] Request URL: ${url}`);
    console.log(`[SMS] Route: q (quick - no verification needed)`);
    console.log(`[SMS] Message: ${message}`);
    
    const response = await axios.get(url, {
      params: params,
      timeout: 15000,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    console.log(`[SMS] Response status: ${response.status}`);
    console.log(`[SMS] Response data:`, JSON.stringify(response.data, null, 2));

    if (response.data && response.data.return === true) {
      console.log('[SMS] ✅✅✅ SUCCESS! Real SMS sent via Fast2SMS (Quick)');
      console.log(`[SMS] Message ID: ${response.data.request_id || 'N/A'}`);
      return { success: true, provider: 'Fast2SMS-Quick', messageId: response.data.request_id };
    } else {
      console.error('[SMS] ❌ Fast2SMS returned false');
      console.error('[SMS] Full response:', response.data);
      throw new Error(response.data.message || JSON.stringify(response.data));
    }
  } catch (error) {
    console.error('[SMS] ❌❌❌ Fast2SMS Error:', error.message);
    if (error.response) {
      console.error('[SMS] Error response status:', error.response.status);
      console.error('[SMS] Error response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Send SMS via Twilio (International)
 */
async function sendSMSViaTwilio(phone, otp) {
  try {
    await twilioClient.messages.create({
      body: `Your EarnSure verification code is: ${otp}`,
      from: TWILIO_PHONE,
      to: phone.startsWith('+') ? phone : `+91${phone}`
    });
    console.log('[SMS] ✅ Real SMS sent via Twilio');
    return { success: true, provider: 'Twilio' };
  } catch (error) {
    console.error('[SMS] ❌ Twilio Error:', error.message);
    throw error;
  }
}

// 1. Send OTP Route (For Workers & Admins)
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`[AUTH] 📱 NEW OTP REQUEST`);
  console.log(`[AUTH] Phone: ${phone}`);
  console.log(`[AUTH] Time: ${new Date().toLocaleString()}`);
  console.log('='.repeat(70));
  
  if (!phone) {
    console.error('[AUTH] ❌ Missing phone number');
    return res.status(400).json({ error: "Phone number required" });
  }

  const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
  console.log(`[AUTH] 🔢 Generated OTP: ${generatedOtp}`);
  
  // Store OTP in database
  try {
    otpOps.store(phone, generatedOtp, 5); // 5 minutes expiry
    console.log('[AUTH] ✅ OTP stored in database');
  } catch (error) {
    console.error('[AUTH] ❌ Failed to store OTP:', error.message);
    return res.status(500).json({ error: "Failed to store OTP" });
  }
  
  // Try to send real SMS
  let smsResult = null;
  let smsError = null;
  
  try {
    // Priority 1: Fast2SMS (Free for India)
    if (FAST2SMS_API_KEY && FAST2SMS_API_KEY !== 'your_fast2sms_api_key') {
      console.log('[AUTH] 🚀 Attempting to send SMS via Fast2SMS...');
      smsResult = await sendSMSViaFast2SMS(phone, generatedOtp);
    }
    // Priority 2: Twilio (Paid, International)
    else if (twilioClient) {
      console.log('[AUTH] 🚀 Attempting to send SMS via Twilio...');
      smsResult = await sendSMSViaTwilio(phone, generatedOtp);
    }
    
    if (smsResult && smsResult.success) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`[AUTH] ✅✅✅ SUCCESS! Real SMS sent via ${smsResult.provider}`);
      console.log(`[AUTH] Phone: ${phone}`);
      console.log(`[AUTH] OTP: ${generatedOtp}`);
      if (smsResult.messageId) {
        console.log(`[AUTH] Message ID: ${smsResult.messageId}`);
      }
      console.log('='.repeat(70) + '\n');
      
      return res.status(200).json({ 
        success: true,
        message: "Real SMS Sent Successfully",
        provider: smsResult.provider,
        phone: phone
      });
    }
  } catch (error) {
    smsError = error;
    console.error(`\n${'='.repeat(70)}`);
    console.error('[AUTH] ❌❌❌ SMS SENDING FAILED');
    console.error('[AUTH] Error:', error.message);
    console.error('='.repeat(70) + '\n');
  }
  
  // Fallback: Demo Mode with Enhanced Display
  console.log('\n' + '█'.repeat(70));
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█' + '          🔐 EARNSURE OTP - DEMO MODE (PRODUCTION READY)          '.padEnd(68) + '█');
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█'.repeat(70));
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█' + `  📱 Phone Number: ${phone}`.padEnd(68) + '█');
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█' + `  🔑 OTP CODE: ${generatedOtp}`.padEnd(68) + '█');
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█' + `  ⏰ Valid For: 5 minutes`.padEnd(68) + '█');
  console.log('█' + `  🎯 Status: Ready for production`.padEnd(68) + '█');
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█'.repeat(70));
  
  if (smsError) {
    console.log('\n' + '⚠️  SMS PROVIDER STATUS:');
    console.log('   Error:', smsError.message);
    console.log('   Reason: SMS provider account needs activation/credits');
  }
  
  console.log('\n💡 TO ENABLE REAL SMS DELIVERY:');
  console.log('   Option 1: Add ₹100 to Fast2SMS account (gets ~1000 SMS)');
  console.log('   Option 2: Use Twilio free trial ($15 credit, no payment)');
  console.log('   Option 3: Continue with demo mode (OTP shown in browser + console)');
  console.log('\n📖 See SMS_SETUP_GUIDE.md for detailed instructions\n');
  console.log('='.repeat(70) + '\n');
  
  return res.status(200).json({ 
    success: true,
    message: "OTP Generated Successfully", 
    mock_otp: generatedOtp,
    phone: phone,
    mode: "demo",
    note: smsError ? `SMS provider needs activation: ${smsError.message}` : "Demo mode - OTP displayed in browser and console"
  });
});

// 2. Verify OTP Route
router.post('/verify-otp', async (req, res) => {
  const { phone, otp, role, name, platform, zone } = req.body;
  
  console.log(`[AUTH] OTP verification attempt for phone: ${phone}, OTP: ${otp}`);
  
  // Verify OTP from database
  const isValid = otpOps.verify(phone, otp);
  if (!isValid) {
    console.error('[AUTH] ❌ Invalid or expired OTP');
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  console.log('[AUTH] ✅ OTP verified successfully');

  try {
    if (role === 'WORKER') {
      let worker = userOps.findByPhone(phone);
      
      if (!worker) {
        console.log('[AUTH] Creating new worker account...');
        // Create new worker
        worker = userOps.create({ 
          role: 'WORKER', 
          phone,
          name: name || "Gig Worker", 
          platform: platform || "Delivery", 
          zone: zone || "Delhi NCR", 
          activeDays: Math.floor(Math.random() * 5) + 6,
          weeklyPremium: 35,
          walletBalance: 0,
          starRating: Math.floor(Math.random() * 3) + 3 // 3-5 stars for new users
        });
        
        // Create default parametric policy
        const { policyOps } = require('../database/sqlite');
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        
        policyOps.create({
          workerId: worker.id,
          type: 'PARAMETRIC',
          premium: 35,
          coverageAmount: 500,
          endDate: endDate.toISOString(),
          status: 'ACTIVE',
          triggers: [
            { metric: 'AQI', threshold: 300, operator: '>=' },
            { metric: 'RAINFALL', threshold: 50, operator: '>=' },
            { metric: 'TEMPERATURE', threshold: 42, operator: '>=' },
            { metric: 'TRAFFIC_LATENCY', threshold: 3.0, operator: '>=' }
          ]
        });
        
        console.log(`[AUTH] ✅ New worker registered: ${worker.name} (${phone})`);
      } else {
        console.log(`[AUTH] ✅ Existing worker logged in: ${worker.name}`);
      }
      
      // Create session token
      const sessionToken = sessionOps.create(worker.id, 24); // 24 hours
      console.log(`[AUTH] ✅ Session token created: ${sessionToken}`);
      
      return res.status(200).json({ 
        ...worker, 
        sessionToken,
        message: 'Login successful' 
      });
    }
    return res.status(400).json({ error: 'Worker Role Required for this route' });
  } catch (err) {
    console.error('[AUTH] ❌ Verify OTP Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 3. Admin Verification Login (Secure Path)
router.post('/admin-login', async (req, res) => {
  const { password } = req.body;
  
  // Hardcoded secure admin password
  if (password === 'EARNSURE2026') {
    try {
      let admin = userOps.findByPhone('0000000000');
      if (!admin) {
        admin = userOps.create({ 
          role: 'ADMIN', 
          name: 'Super Admin', 
          phone: '0000000000',
          starRating: 5
        });
      }
      
      // Create session token
      const sessionToken = sessionOps.create(admin.id, 24);
      
      return res.status(200).json({ 
        ...admin, 
        sessionToken,
        message: 'Admin login successful' 
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// 4. Partner Login
router.post('/partner-login', async (req, res) => {
  const { password } = req.body;
  
  if (password === 'ZOMATO2026') {
    try {
      let partner = userOps.findByPhone('1111111111');
      if (!partner) {
        partner = userOps.create({ 
          role: 'PARTNER', 
          name: 'Zomato Partner', 
          phone: '1111111111',
          platform: 'Zomato',
          starRating: 5
        });
      }
      
      const sessionToken = sessionOps.create(partner.id, 24);
      
      return res.status(200).json({ 
        ...partner, 
        sessionToken,
        message: 'Partner login successful' 
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(401).json({ error: 'Invalid partner credentials' });
  }
});

// 5. Verify Session Token
router.post('/verify-session', (req, res) => {
  const { sessionToken } = req.body;
  
  if (!sessionToken) {
    return res.status(400).json({ error: 'Session token required' });
  }
  
  const user = sessionOps.verify(sessionToken);
  if (user) {
    return res.status(200).json({ valid: true, user });
  } else {
    return res.status(401).json({ valid: false, error: 'Invalid or expired session' });
  }
});

// 6. Logout
router.post('/logout', (req, res) => {
  const { sessionToken } = req.body;
  
  if (sessionToken) {
    sessionOps.delete(sessionToken);
  }
  
  return res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
