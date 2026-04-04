const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');

// --- USER CRUD ---
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- POLICY CRUD ---
router.get('/policies', async (req, res) => {
  try {
    const policies = await Policy.find().populate('workerId');
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/policies', async (req, res) => {
  try {
    const policy = new Policy(req.body);
    await policy.save();
    res.status(201).json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/policies/:id', async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/policies/:id', async (req, res) => {
  try {
    await Policy.findByIdAndDelete(req.params.id);
    res.json({ message: 'Policy deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CLAIM CRUD ---
router.get('/claims', async (req, res) => {
  try {
    const claims = await Claim.find().populate('workerId policyId');
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/claims/:id', async (req, res) => {
  try {
    const claim = await Claim.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Notify via socket
    const io = req.app.get('socketio');
    if (claim.status === 'APPROVED') {
        io.to(claim.workerId.toString()).emit('claim_approved', { amount: claim.amount, reason: claim.triggerReason });
    }

    res.json(claim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
