/**
 * NotificationService
 * Handlers for real-time mobile-style alerts and OTPs.
 */
class NotificationService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Send a Real-time OTP to a worker
   */
  async sendOTP(workerId) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[NotificationService] Sending OTP ${otp} to worker ${workerId}...`);

    this.io.to(workerId.toString()).emit('otp_received', {
      otp: otp,
      expiry: 300, // 5 minutes
      message: 'Your GigShield Verification Code'
    });

    return otp;
  }

  /**
   * Push a Payout Notification
   */
  async pushPayoutAlert(workerId, amount, reason) {
    this.io.to(workerId.toString()).emit('payout_received', {
      title: '💵 Instant Payout Received!',
      body: `You just received $${amount} for: ${reason}`,
      timestamp: new Date().toLocaleTimeString()
    });
  }
}

module.exports = NotificationService;
