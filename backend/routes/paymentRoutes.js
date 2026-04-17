const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order for premium payment
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, planId, userId, planName } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and userId are required' 
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      description: `EarnSure Premium - ${planName || 'Monthly Plan'}`,
      customer_notify: 1,
      notes: {
        userId,
        planId,
        planName
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('❌ Order creation error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature
 */
router.post('/verify', async (req, res) => {
  try {
    const { orderId, paymentId, signature, userId } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing payment details' 
      });
    }

    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === signature;

    if (!isSignatureValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    if (payment.status !== 'captured') {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment not captured' 
      });
    }

    // Payment verified successfully
    const io = req.app.get('socketio');
    if (io) {
      io.to(userId).emit('payment_success', {
        paymentId,
        orderId,
        amount: payment.amount / 100,
        message: '✅ Payment successful! Your policy is now active.',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      paymentId,
      orderId,
      amount: payment.amount / 100,
      status: 'VERIFIED',
      message: 'Payment verified successfully. Policy activated!'
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * POST /api/payment/refund
 * Process refund for a payment
 */
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment ID required' 
      });
    }

    const refundOptions = {
      amount: amount ? Math.round(amount * 100) : undefined,
      notes: {
        reason: reason || 'Customer requested refund'
      }
    };

    const refund = await razorpay.payments.refund(paymentId, refundOptions);

    res.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('❌ Refund error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * GET /api/payment/status/:paymentId
 * Get payment status
 */
router.get('/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      paymentId: payment.id,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      createdAt: new Date(payment.created_at * 1000).toISOString()
    });
  } catch (error) {
    console.error('❌ Status check error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * POST /api/payment/webhook
 * Razorpay webhook for payment events
 */
router.post('/webhook', async (req, res) => {
  try {
    const { event, payload } = req.body;

    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const io = req.app.get('socketio');

    switch (event) {
      case 'payment.authorized':
        console.log('✅ Payment authorized:', payload.payment.entity.id);
        if (io) {
          io.emit('payment_authorized', payload.payment.entity);
        }
        break;

      case 'payment.failed':
        console.log('❌ Payment failed:', payload.payment.entity.id);
        if (io) {
          io.emit('payment_failed', payload.payment.entity);
        }
        break;

      case 'payment.captured':
        console.log('✅ Payment captured:', payload.payment.entity.id);
        if (io) {
          io.emit('payment_captured', payload.payment.entity);
        }
        break;

      case 'refund.created':
        console.log('💰 Refund created:', payload.refund.entity.id);
        if (io) {
          io.emit('refund_created', payload.refund.entity);
        }
        break;

      default:
        console.log('📢 Webhook event:', event);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
