const express = require('express');
const router = express.Router();
const { userOps, policyOps, claimOps } = require('../database/sqlite');

// --- USER CRUD ---
router.get('/users', async (req, res) => {
  try {
    const users = userOps.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const user = userOps.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = userOps.update(parseInt(req.params.id), req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    userOps.delete(parseInt(req.params.id));
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- POLICY CRUD ---
router.get('/policies', async (req, res) => {
  try {
    const policies = policyOps.getAll();
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/policies', async (req, res) => {
  try {
    const policy = policyOps.create(req.body);
    res.status(201).json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/policies/:id', async (req, res) => {
  try {
    const policy = policyOps.update(parseInt(req.params.id), req.body);
    res.json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/policies/:id', async (req, res) => {
  try {
    policyOps.delete(parseInt(req.params.id));
    res.json({ message: 'Policy deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CLAIM CRUD ---
router.get('/claims', async (req, res) => {
  try {
    const claims = claimOps.getAll();
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/claims/:id', async (req, res) => {
  try {
    const claim = claimOps.update(parseInt(req.params.id), req.body);
    
    // Notify via socket
    const io = req.app.get('socketio');
    if (claim.status === 'APPROVED' && io) {
      io.to(claim.worker_id.toString()).emit('claim_approved', { 
        amount: claim.amount, 
        reason: claim.trigger_reason 
      });
    }

    res.json(claim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
