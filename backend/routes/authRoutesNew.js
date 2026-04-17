const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { userOps, sessionOps } = require('../database/sqlite');

// ============================================================
// WORKER SIGNUP
// ============================================================
router.post('/worker/signup', async (req, res) => {
  const { name, phone, email, password, platform, zone } = req.body;
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`[SIGNUP] 📝 NEW WORKER REGISTRATION`);
  console.log(`[SIGNUP] Name: ${name}`);
  console.log(`[SIGNUP] Email: ${email}`);
  console.log(`[SIGNUP] Phone: ${phone}`);
  console.log(`[SIGNUP] Platform: ${platform}`);
  console.log('='.repeat(70));
  
  // Validation
  if (!name || !password || (!email && !phone)) {
    return res.status(400).json({ 
      error: "Name, password, and either email or phone are required" 
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ 
      error: "Password must be at least 6 characters long" 
    });
  }
  
  try {
    // Check if user already exists
    if (email) {
      const existingUser = userOps.findByEmail(email);
      if (existingUser) {
        console.log('[SIGNUP] ❌ Email already registered');
        return res.status(400).json({ error: "Email already registered" });
      }
    }
    
    if (phone) {
      const existingUser = userOps.findByPhone(phone);
      if (existingUser) {
        console.log('[SIGNUP] ❌ Phone already registered');
        return res.status(400).json({ error: "Phone number already registered" });
      }
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = userOps.create({
      role: 'WORKER',
      name,
      email: email || null,
      phone: phone || null,
      passwordHash,
      platform: platform || null,
      zone: zone || null,
      walletBalance: 0,
      activeDays: 0,
      weeklyPremium: 35,
      starRating: 3
    });
    
    // Create session
    const sessionToken = sessionOps.create(newUser.id, 168); // 7 days
    
    console.log('[SIGNUP] ✅ Worker registered successfully');
    console.log(`[SIGNUP] User ID: ${newUser.id}`);
    console.log('='.repeat(70) + '\n');
    
    // Return user data (without password)
    const { password_hash, ...userData } = userOps.findById(newUser.id);
    
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      sessionToken,
      user: userData
    });
    
  } catch (error) {
    console.error('[SIGNUP] ❌ Error:', error.message);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ============================================================
// WORKER LOGIN
// ============================================================
router.post('/worker/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or phone
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`[LOGIN] 🔐 WORKER LOGIN ATTEMPT`);
  console.log(`[LOGIN] Identifier: ${identifier}`);
  console.log(`[LOGIN] Time: ${new Date().toLocaleString()}`);
  console.log('='.repeat(70));
  
  if (!identifier || !password) {
    return res.status(400).json({ error: "Email/phone and password are required" });
  }
  
  try {
    // Find user by email or phone
    const user = userOps.findByEmailOrPhone(identifier);
    
    if (!user) {
      console.log('[LOGIN] ❌ User not found');
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    if (user.role !== 'WORKER') {
      console.log('[LOGIN] ❌ Not a worker account');
      return res.status(403).json({ error: "Invalid account type" });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('[LOGIN] ❌ Invalid password');
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Create session
    const sessionToken = sessionOps.create(user.id, 168); // 7 days
    
    console.log('[LOGIN] ✅ Login successful');
    console.log(`[LOGIN] User ID: ${user.id}`);
    console.log(`[LOGIN] Name: ${user.name}`);
    console.log('='.repeat(70) + '\n');
    
    // Return user data (without password)
    const { password_hash, ...userData } = user;
    
    return res.status(200).json({
      success: true,
      message: "Login successful",
      sessionToken,
      user: userData
    });
    
  } catch (error) {
    console.error('[LOGIN] ❌ Error:', error.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ============================================================
// ADMIN LOGIN
// ============================================================
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`[ADMIN LOGIN] 🔐 ADMIN LOGIN ATTEMPT`);
  console.log(`[ADMIN LOGIN] Email: ${email}`);
  console.log(`[ADMIN LOGIN] Time: ${new Date().toLocaleString()}`);
  console.log('='.repeat(70));
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  
  try {
    // Find admin by email
    const user = userOps.findByEmail(email);
    
    if (!user) {
      console.log('[ADMIN LOGIN] ❌ User not found');
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    if (user.role !== 'ADMIN') {
      console.log('[ADMIN LOGIN] ❌ Not an admin account');
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('[ADMIN LOGIN] ❌ Invalid password');
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Create session
    const sessionToken = sessionOps.create(user.id, 24); // 24 hours for admin
    
    console.log('[ADMIN LOGIN] ✅ Login successful');
    console.log(`[ADMIN LOGIN] User ID: ${user.id}`);
    console.log(`[ADMIN LOGIN] Name: ${user.name}`);
    console.log('='.repeat(70) + '\n');
    
    // Return user data (without password)
    const { password_hash, ...userData } = user;
    
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      sessionToken,
      user: userData
    });
    
  } catch (error) {
    console.error('[ADMIN LOGIN] ❌ Error:', error.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ============================================================
// PARTNER LOGIN
// ============================================================
router.post('/partner/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`[PARTNER LOGIN] 🔐 PARTNER LOGIN ATTEMPT`);
  console.log(`[PARTNER LOGIN] Email: ${email}`);
  console.log('='.repeat(70));
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  
  try {
    const user = userOps.findByEmail(email);
    
    if (!user || user.role !== 'PARTNER') {
      console.log('[PARTNER LOGIN] ❌ Invalid credentials');
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('[PARTNER LOGIN] ❌ Invalid password');
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const sessionToken = sessionOps.create(user.id, 24);
    
    console.log('[PARTNER LOGIN] ✅ Login successful');
    console.log('='.repeat(70) + '\n');
    
    const { password_hash, ...userData } = user;
    
    return res.status(200).json({
      success: true,
      message: "Partner login successful",
      sessionToken,
      user: userData
    });
    
  } catch (error) {
    console.error('[PARTNER LOGIN] ❌ Error:', error.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ============================================================
// VERIFY SESSION (Middleware endpoint)
// ============================================================
router.get('/verify-session', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: "No session token provided" });
  }
  
  try {
    const user = sessionOps.verify(token);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }
    
    // Return user data (without password)
    const { password_hash, ...userData } = user;
    
    return res.status(200).json({
      success: true,
      user: userData
    });
    
  } catch (error) {
    console.error('[VERIFY] Error:', error.message);
    return res.status(500).json({ error: "Session verification failed" });
  }
});

// ============================================================
// LOGOUT
// ============================================================
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    sessionOps.delete(token);
    console.log('[LOGOUT] ✅ Session terminated');
  }
  
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

// ============================================================
// GET USER PROFILE
// ============================================================
router.get('/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  try {
    const user = sessionOps.verify(token);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid session" });
    }
    
    const { password_hash, ...userData } = user;
    
    return res.status(200).json({
      success: true,
      user: userData
    });
    
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

module.exports = router;
