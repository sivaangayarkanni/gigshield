const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database', 'earnsure.db');
const db = new Database(dbPath);

console.log('\n' + '='.repeat(70));
console.log('🔄 MIGRATING DATABASE TO NEW SCHEMA');
console.log('='.repeat(70) + '\n');

try {
  // Check if columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const columnNames = tableInfo.map(col => col.name);
  
  console.log('📋 Current columns:', columnNames.join(', '));
  
  // Add email column if it doesn't exist
  if (!columnNames.includes('email')) {
    console.log('➕ Adding email column...');
    db.exec('ALTER TABLE users ADD COLUMN email TEXT');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE email IS NOT NULL');
    console.log('✅ Email column added');
  }
  
  // Add password_hash column if it doesn't exist
  if (!columnNames.includes('password_hash')) {
    console.log('➕ Adding password_hash column...');
    db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
    console.log('✅ Password hash column added');
  }
  
  // Add new bank fields if they don't exist
  if (!columnNames.includes('ifsc_code')) {
    console.log('➕ Adding ifsc_code column...');
    db.exec('ALTER TABLE users ADD COLUMN ifsc_code TEXT');
    console.log('✅ IFSC code column added');
  }
  
  if (!columnNames.includes('upi_id')) {
    console.log('➕ Adding upi_id column...');
    db.exec('ALTER TABLE users ADD COLUMN upi_id TEXT');
    console.log('✅ UPI ID column added');
  }
  
  // Update existing users with default password
  console.log('\n🔐 Setting default passwords for existing users...');
  const defaultPassword = bcrypt.hashSync('password123', 10);
  
  const usersWithoutPassword = db.prepare('SELECT id, name, phone FROM users WHERE password_hash IS NULL').all();
  
  if (usersWithoutPassword.length > 0) {
    const updateStmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    
    usersWithoutPassword.forEach(user => {
      updateStmt.run(defaultPassword, user.id);
      console.log(`  ✅ Set password for user: ${user.name} (ID: ${user.id})`);
    });
    
    console.log(`\n⚠️  Default password for existing users: password123`);
    console.log(`   Users should change their password after first login`);
  } else {
    console.log('  ℹ️  All users already have passwords');
  }
  
  // Create default admin if doesn't exist
  console.log('\n👤 Checking admin account...');
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ? AND email IS NOT NULL').get('ADMIN');
  
  if (!adminExists) {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (role, name, email, password_hash, star_rating, wallet_balance)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('ADMIN', 'Super Admin', 'admin@earnsure.com', adminPassword, 5, 0);
    console.log('✅ Admin account created');
    console.log('   Email: admin@earnsure.com');
    console.log('   Password: admin123');
  } else {
    console.log('  ℹ️  Admin account already exists');
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ DATABASE MIGRATION COMPLETED SUCCESSFULLY');
  console.log('='.repeat(70));
  
  console.log('\n📝 SUMMARY:');
  console.log('  • Email authentication enabled');
  console.log('  • Password-based login implemented');
  console.log('  • Existing users can login with: password123');
  console.log('  • Admin login: admin@earnsure.com / admin123');
  console.log('  • New users can signup with email/phone + password');
  console.log('\n🚀 Ready to start backend server!\n');
  
} catch (error) {
  console.error('\n❌ MIGRATION FAILED:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  db.close();
}
