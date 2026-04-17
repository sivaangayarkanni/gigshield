// Quick test script for Fast2SMS API
const axios = require('axios');

const API_KEY = 'JTI1jvhkwz5R9iguxbaymOJJTRbgDIdjKPrJGSiF4IvPsgC060fLxvKYlZyU';
const PHONE = '9043898989'; // Your phone number
const OTP = '1234'; // Test OTP

async function testFast2SMS() {
  console.log('Testing Fast2SMS API...');
  console.log('Phone:', PHONE);
  console.log('OTP:', OTP);
  console.log('API Key:', API_KEY.substring(0, 10) + '...');
  
  try {
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: API_KEY,
        route: 'otp',
        variables_values: OTP,
        flash: 0,
        numbers: PHONE
      },
      timeout: 15000
    });
    
    console.log('\n✅ Response received:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.return === true) {
      console.log('\n✅✅✅ SUCCESS! SMS should be sent to your phone!');
      console.log('Check your phone for OTP:', OTP);
    } else {
      console.log('\n❌ Failed:', response.data.message);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testFast2SMS();
