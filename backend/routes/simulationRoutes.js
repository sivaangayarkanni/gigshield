const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Endpoint hit after front-end microservice simulation reaches Payout Success
router.post('/payout', async (req, res) => {
  const { workerId, amount } = req.body;
  try {
    const worker = await User.findById(workerId);
    if (!worker) return res.status(404).json({ error: "Worker not found" });

    worker.walletBalance += amount;
    await worker.save();
    
    return res.status(200).json({ success: true, newBalance: worker.walletBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
