const express = require('express');
const router = express.Router();

/**
 * POST /api/payment/initiate
 * Initiates a premium payment session (Quantum Pay)
 */
router.post('/initiate', async (req, res) => {
  try {
    const { planId, amount, userId } = req.body;

    // In a real system, this would call a payment gateway like Razorpay
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Simulate a short processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    res.json({
      success: true,
      transactionId,
      status: 'INITIATED',
      message: 'Payment session created successfully.',
      planId,
      amount,
      userId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/payment/confirm
 * Confirms a payment and activates a policy
 */
router.post('/confirm', async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID required.' });
    }

    // Emit a real-time notification via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.emit('payment_confirmed', {
        transactionId,
        message: '🛡️ Your GigShield Shield is now ACTIVE!',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      transactionId,
      status: 'CONFIRMED',
      message: 'Policy activated. Protection shield is now live.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
