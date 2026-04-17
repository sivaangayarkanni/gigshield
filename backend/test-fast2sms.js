const axios = require('axios');
require('dotenv').config();

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const TEST_PHONE = '9043898989'; // Your phone number

console.log('\n' + '='.repeat(70));
console.log('🧪 FAST2SMS API TEST SCRIPT');
console.log('='.repeat(70));
console.log(`📱 Test Phone: ${TEST_PHONE}`);
console.log(`🔑 API Key: ${FAST2SMS_API_KEY ? FAST2SMS_API_KEY.substring(0, 15) + '...' : 'NOT FOUND'}`);
console.log('='.repeat(70) + '\n');

if (!FAST2SMS_API_KEY || FAST2SMS_API_KEY === 'your_fast2sms_api_key') {
  console.error('❌ ERROR: FAST2SMS_API_KEY not configured in backend/.env');
  console.log('\n📝 Steps to fix:');
  console.log('1. Open backend/.env');
  console.log('2. Add: FAST2SMS_API_KEY=your_actual_api_key');
  console.log('3. Save and run this test again');
  process.exit(1);
}

async function testFast2SMS() {
  const testOTP = '1234';
  
  try {
    console.log('🚀 Sending test SMS using Quick route (simplest method)...\n');
    
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    const message = `Your EarnSure OTP is ${testOTP}. Valid for 5 minutes.`;
    
    const params = {
      authorization: FAST2SMS_API_KEY,
      route: 'q',  // Quick route - simplest, no verification needed
      message: message,
      language: 'english',
      flash: 0,
      numbers: TEST_PHONE
    };
    
    console.log('📤 Request Details:');
    console.log(`   URL: ${url}`);
    console.log(`   Route: q (quick - no verification required)`);
    console.log(`   Phone: ${TEST_PHONE}`);
    console.log(`   Message: ${message}`);
    console.log(`   API Key: ${FAST2SMS_API_KEY.substring(0, 10)}...`);
    console.log('');
    
    const response = await axios.get(url, {
      params: params,
      timeout: 15000,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    console.log('📥 Response:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Data: ${JSON.stringify(response.data, null, 2)}`);
    console.log('');

    if (response.data && response.data.return === true) {
      console.log('✅✅✅ SUCCESS! SMS SENT!');
      console.log(`📱 Check your phone (${TEST_PHONE}) for OTP: ${testOTP}`);
      console.log(`📝 Message ID: ${response.data.request_id || 'N/A'}`);
      console.log('');
      console.log('🎉 Fast2SMS is working correctly!');
      console.log('💡 If you didn\'t receive the SMS:');
      console.log('   1. Check if your Fast2SMS account is verified');
      console.log('   2. Check if you have SMS credits');
      console.log('   3. Log in to https://www.fast2sms.com/dashboard');
      console.log('   4. Check "Reports" section for delivery status');
    } else {
      console.log('❌ FAILED! Fast2SMS returned false');
      console.log('📋 Full response:', response.data);
      console.log('');
      console.log('🔍 Possible issues:');
      console.log('   1. Invalid API key');
      console.log('   2. Account not verified');
      console.log('   3. No SMS credits');
      console.log('   4. Phone number format issue');
      console.log('');
      console.log('💡 Next steps:');
      console.log('   1. Log in to https://www.fast2sms.com');
      console.log('   2. Verify your account');
      console.log('   3. Check your credits balance');
      console.log('   4. Try regenerating your API key');
    }
    
  } catch (error) {
    console.log('❌❌❌ ERROR!');
    console.log(`   Message: ${error.message}`);
    
    if (error.response) {
      console.log(`   HTTP Status: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    console.log('');
    console.log('🔍 Common issues:');
    console.log('   1. Invalid API key - Check backend/.env');
    console.log('   2. Network issue - Check internet connection');
    console.log('   3. Fast2SMS service down - Try again later');
    console.log('   4. Account suspended - Check Fast2SMS dashboard');
    console.log('');
    
    // Check for specific error codes
    if (error.response && error.response.data) {
      const errorCode = error.response.data.status_code;
      const errorMsg = error.response.data.message;
      
      if (errorCode === 999 || errorMsg.includes('transaction')) {
        console.log('🚨 ACCOUNT ACTIVATION REQUIRED!');
        console.log('='.repeat(70));
        console.log('Your Fast2SMS account needs credits to use the API.');
        console.log('');
        console.log('📝 Quick Fix (5 minutes):');
        console.log('   1. Go to: https://www.fast2sms.com/dashboard');
        console.log('   2. Click "Wallet" or "Recharge"');
        console.log('   3. Add minimum ₹100 (gets you ~1000 SMS)');
        console.log('   4. Run this test again');
        console.log('');
        console.log('💰 Pricing: ₹100 = ~1000 SMS messages (very affordable!)');
        console.log('');
        console.log('🎯 Alternative: Use Twilio free trial ($15 credit, no payment)');
        console.log('   - Sign up: https://www.twilio.com/try-twilio');
        console.log('   - Get free trial number and credentials');
        console.log('   - Update backend/.env with Twilio credentials');
        console.log('');
        console.log('📖 See SMS_SETUP_GUIDE.md for detailed instructions');
        console.log('='.repeat(70));
      } else if (errorCode === 996 || errorMsg.includes('verification')) {
        console.log('🚨 WEBSITE VERIFICATION REQUIRED!');
        console.log('='.repeat(70));
        console.log('Your Fast2SMS account needs website verification for OTP route.');
        console.log('');
        console.log('📝 Options:');
        console.log('   1. Complete website verification in Fast2SMS dashboard');
        console.log('   2. OR add ₹100 credits to use Quick route (no verification)');
        console.log('   3. OR use Twilio (no verification needed)');
        console.log('='.repeat(70));
      }
    }
    
    console.log('');
    console.log('💡 Try these:');
    console.log('   1. Verify API key at https://www.fast2sms.com/dashboard');
    console.log('   2. Check account status and credits');
    console.log('   3. Try regenerating API key');
    console.log('   4. Contact Fast2SMS support if issue persists');
  }
}

// Run the test
testFast2SMS().then(() => {
  console.log('\n' + '='.repeat(70));
  console.log('🏁 Test completed');
  console.log('='.repeat(70) + '\n');
}).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
