const Database = require('better-sqlite3');
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'earnsure.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  console.log('🔧 Initializing SQLite database...');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL CHECK(role IN ('WORKER', 'ADMIN', 'PARTNER')),
      phone TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      name TEXT NOT NULL,
      platform TEXT,
      zone TEXT,
      wallet_balance REAL DEFAULT 0,
      bank_account_no TEXT,
      bank_name TEXT,
      ifsc_code TEXT,
      upi_id TEXT,
      active_days INTEGER DEFAULT 0,
      weekly_premium REAL DEFAULT 35,
      policy_active INTEGER DEFAULT 1,
      star_rating INTEGER DEFAULT 3 CHECK(star_rating BETWEEN 1 AND 5),
      last_known_lat REAL,
      last_known_lng REAL,
      last_location_update TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Policies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('SURGE_GAP', 'HEAT_STROKE', 'STORM_COVER', 'PARAMETRIC')),
      status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'EXPIRED', 'PENDING')),
      premium REAL NOT NULL,
      coverage_amount REAL NOT NULL,
      start_date TEXT DEFAULT CURRENT_TIMESTAMP,
      end_date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Parametric triggers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS parametric_triggers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      policy_id INTEGER NOT NULL,
      metric TEXT NOT NULL,
      threshold REAL NOT NULL,
      operator TEXT NOT NULL,
      FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE
    )
  `);

  // Claims table
  db.exec(`
    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id INTEGER NOT NULL,
      policy_id INTEGER,
      status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID')),
      amount REAL NOT NULL,
      type TEXT DEFAULT 'PARAMETRIC' CHECK(type IN ('PARAMETRIC', 'MANUAL')),
      trigger_reason TEXT,
      gps_lat REAL,
      gps_lng REAL,
      gps_verified INTEGER DEFAULT 0,
      fraud_score REAL DEFAULT 0,
      payout_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE SET NULL
    )
  `);

  // OTP storage table
  db.exec(`
    CREATE TABLE IF NOT EXISTS otp_storage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      otp TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_policies_worker ON policies(worker_id);
    CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
    CREATE INDEX IF NOT EXISTS idx_claims_worker ON claims(worker_id);
    CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
    CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_storage(phone);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
  `);

  // Insert default admin if not exists
  const bcrypt = require('bcryptjs');
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('ADMIN');
  if (!adminExists) {
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (role, name, email, password_hash, star_rating, wallet_balance)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('ADMIN', 'Super Admin', 'admin@earnsure.com', defaultPassword, 5, 0);
    console.log('✅ Default admin user created (email: admin@earnsure.com, password: admin123)');
  }

  console.log('✅ SQLite database initialized successfully');
}

// User operations
const userOps = {
  create: (userData) => {
    const stmt = db.prepare(`
      INSERT INTO users (role, phone, email, password_hash, name, platform, zone, star_rating, wallet_balance, active_days, weekly_premium)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      userData.role,
      userData.phone || null,
      userData.email || null,
      userData.passwordHash,
      userData.name,
      userData.platform || null,
      userData.zone || null,
      userData.starRating || 3,
      userData.walletBalance || 0,
      userData.activeDays || 0,
      userData.weeklyPremium || 35
    );
    return { id: result.lastInsertRowid, ...userData };
  },

  findByPhone: (phone) => {
    return db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  },

  findByEmail: (email) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findByEmailOrPhone: (identifier) => {
    return db.prepare('SELECT * FROM users WHERE email = ? OR phone = ?').get(identifier, identifier);
  },

  findById: (id) => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  findByRole: (role) => {
    return db.prepare('SELECT * FROM users WHERE role = ?').all(role);
  },

  getAll: () => {
    return db.prepare('SELECT * FROM users').all();
  },

  update: (id, updates) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = db.prepare(`UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
    return userOps.findById(id);
  },

  updateLocation: (id, lat, lng) => {
    const stmt = db.prepare(`
      UPDATE users 
      SET last_known_lat = ?, last_known_lng = ?, last_location_update = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(lat, lng, id);
  },

  updateWallet: (id, amount) => {
    const stmt = db.prepare(`
      UPDATE users 
      SET wallet_balance = wallet_balance + ?
      WHERE id = ?
    `);
    stmt.run(amount, id);
    return userOps.findById(id);
  },

  delete: (id) => {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }
};

// Policy operations
const policyOps = {
  create: (policyData) => {
    const stmt = db.prepare(`
      INSERT INTO policies (worker_id, type, premium, coverage_amount, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      policyData.workerId,
      policyData.type,
      policyData.premium,
      policyData.coverageAmount,
      policyData.endDate,
      policyData.status || 'ACTIVE'
    );
    
    // Add parametric triggers if provided
    if (policyData.triggers && policyData.triggers.length > 0) {
      const triggerStmt = db.prepare(`
        INSERT INTO parametric_triggers (policy_id, metric, threshold, operator)
        VALUES (?, ?, ?, ?)
      `);
      policyData.triggers.forEach(trigger => {
        triggerStmt.run(result.lastInsertRowid, trigger.metric, trigger.threshold, trigger.operator);
      });
    }
    
    return { id: result.lastInsertRowid, ...policyData };
  },

  findById: (id) => {
    const policy = db.prepare('SELECT * FROM policies WHERE id = ?').get(id);
    if (policy) {
      policy.triggers = db.prepare('SELECT * FROM parametric_triggers WHERE policy_id = ?').all(id);
    }
    return policy;
  },

  findByWorker: (workerId) => {
    return db.prepare('SELECT * FROM policies WHERE worker_id = ?').all(workerId);
  },

  findActive: (workerId) => {
    return db.prepare(`
      SELECT * FROM policies 
      WHERE worker_id = ? AND status = 'ACTIVE' AND end_date > datetime('now')
    `).all(workerId);
  },

  getAll: () => {
    return db.prepare('SELECT * FROM policies').all();
  },

  update: (id, updates) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = db.prepare(`UPDATE policies SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
    return policyOps.findById(id);
  },

  delete: (id) => {
    db.prepare('DELETE FROM policies WHERE id = ?').run(id);
  }
};

// Claim operations
const claimOps = {
  create: (claimData) => {
    const stmt = db.prepare(`
      INSERT INTO claims (worker_id, policy_id, amount, type, status, trigger_reason, 
                         gps_lat, gps_lng, gps_verified, fraud_score, payout_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      claimData.workerId,
      claimData.policyId || null,
      claimData.amount,
      claimData.type || 'PARAMETRIC',
      claimData.status || 'PENDING',
      claimData.triggerReason || null,
      claimData.gpsLat || null,
      claimData.gpsLng || null,
      claimData.gpsVerified ? 1 : 0,
      claimData.fraudScore || 0,
      claimData.payoutDate || null
    );
    return { id: result.lastInsertRowid, ...claimData };
  },

  findById: (id) => {
    return db.prepare('SELECT * FROM claims WHERE id = ?').get(id);
  },

  findByWorker: (workerId) => {
    return db.prepare('SELECT * FROM claims WHERE worker_id = ? ORDER BY created_at DESC').all(workerId);
  },

  getAll: () => {
    return db.prepare('SELECT * FROM claims ORDER BY created_at DESC').all();
  },

  update: (id, updates) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = db.prepare(`UPDATE claims SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
    return claimOps.findById(id);
  },

  countRecent: (workerId, hours = 24) => {
    return db.prepare(`
      SELECT COUNT(*) as count FROM claims 
      WHERE worker_id = ? AND created_at > datetime('now', '-${hours} hours')
    `).get(workerId).count;
  }
};

// OTP operations
const otpOps = {
  store: (phone, otp, expiryMinutes = 5) => {
    // Clean old OTPs for this phone
    db.prepare('DELETE FROM otp_storage WHERE phone = ?').run(phone);
    
    const expiresAt = new Date(Date.now() + expiryMinutes * 60000).toISOString();
    const stmt = db.prepare(`
      INSERT INTO otp_storage (phone, otp, expires_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(phone, otp, expiresAt);
  },

  verify: (phone, otp) => {
    const record = db.prepare(`
      SELECT * FROM otp_storage 
      WHERE phone = ? AND otp = ? AND expires_at > datetime('now')
      ORDER BY created_at DESC LIMIT 1
    `).get(phone, otp);
    
    if (record) {
      // Delete used OTP
      db.prepare('DELETE FROM otp_storage WHERE id = ?').run(record.id);
      return true;
    }
    return false;
  },

  cleanup: () => {
    // Clean expired OTPs
    db.prepare('DELETE FROM otp_storage WHERE expires_at < datetime("now")').run();
  }
};

// Session operations
const sessionOps = {
  create: (userId, expiryHours = 24) => {
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiryHours * 3600000).toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO sessions (user_id, session_token, expires_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(userId, token, expiresAt);
    return token;
  },

  verify: (token) => {
    const session = db.prepare(`
      SELECT * FROM sessions 
      WHERE session_token = ? AND expires_at > datetime('now')
    `).get(token);
    
    if (session) {
      return userOps.findById(session.user_id);
    }
    return null;
  },

  delete: (token) => {
    db.prepare('DELETE FROM sessions WHERE session_token = ?').run(token);
  },

  cleanup: () => {
    // Clean expired sessions
    db.prepare('DELETE FROM sessions WHERE expires_at < datetime("now")').run();
  }
};

// Cleanup expired records periodically
setInterval(() => {
  otpOps.cleanup();
  sessionOps.cleanup();
}, 300000); // Every 5 minutes

module.exports = {
  db,
  initializeDatabase,
  userOps,
  policyOps,
  claimOps,
  otpOps,
  sessionOps
};
