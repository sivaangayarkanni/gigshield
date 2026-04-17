# 🧪 Testing the New Authentication System

## ✅ What Changed

**OLD SYSTEM (OTP-based):**
- Phone number + OTP verification
- Required SMS provider (Fast2SMS/Twilio)
- Demo mode with browser notifications
- Routes: `/api/auth/*`

**NEW SYSTEM (Password-based):**
- Email/Phone + Password authentication
- No SMS required
- Real SQLite database
- Routes: `/api/v2/auth/*`
- Secure bcrypt password hashing
- Session token management

---

## 🚀 Quick Start

### Step 1: Start Backend

```bash
cd backend
npm start
```

**Expected Output:**
```
✅ SQLite database initialized successfully
🚀 EarnSure Backend running on port 5000
📊 Database: SQLite (earnsure.db)
```

### Step 2: Start Frontend

```bash
# In a new terminal
npm run dev
```

### Step 3: Test Authentication

Open browser to `http://localhost:5173`

---

## 👤 Test Accounts

### Default Admin
```
Email: admin@earnsure.com
Password: admin123
```

### Create New Worker
1. Click "Get Protected"
2. Click "Sign Up" tab
3. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: test123 (min 6 chars)
   - Platform: Zomato (optional)
4. Click "Create Account"

---

## 🧪 Automated Testing

Run the test script to verify all endpoints:

```bash
cd backend
node test-auth.js
```

**Expected Output:**
```
✅ Worker signup working
✅ Worker login working
✅ Session verification working
✅ Profile fetch working
✅ Admin login working
✅ Logout working
✅ Session invalidation working
```

---

## 📱 Frontend Features

### Landing Page
- **Login Tab**: Email/phone + password
- **Signup Tab**: Full registration form
- **No OTP**: Instant login after signup
- **Session Persistence**: 7-day sessions

### Worker Dashboard
- Real wallet balance (starts at ₹0)
- No demo credits
- Real policy data from SQLite
- Live location tracking
- Real-time weather/traffic monitoring

### Admin Dashboard
- Login with admin@earnsure.com
- View all workers
- Manage policies and claims
- Real data from SQLite

---

## 🔍 Manual Testing Steps

### Test 1: Worker Signup
1. Go to landing page
2. Click "Get Protected"
3. Click "Sign Up" tab
4. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
5. Click "Create Account"
6. **Expected**: Redirected to worker dashboard

### Test 2: Worker Login
1. Logout (if logged in)
2. Click "Get Protected"
3. Click "Login" tab
4. Enter:
   - Email: test@example.com
   - Password: test123
5. Click "Login"
6. **Expected**: Redirected to worker dashboard

### Test 3: Admin Login
1. Go to `/admin-login`
2. Enter:
   - Email: admin@earnsure.com
   - Password: admin123
3. Click "Login"
4. **Expected**: Redirected to admin dashboard

### Test 4: Session Persistence
1. Login as worker
2. Close browser
3. Reopen browser
4. Go to app URL
5. **Expected**: Still logged in (7-day session)

### Test 5: Invalid Credentials
1. Try to login with wrong password
2. **Expected**: Error message "Invalid credentials"

### Test 6: Duplicate Email
1. Try to signup with existing email
2. **Expected**: Error message "Email already registered"

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process if needed
taskkill /PID <process_id> /F

# Restart backend
cd backend
npm start
```

### Database issues
```bash
# Delete and recreate database
cd backend
rm database/earnsure.db
npm start
```

### Frontend can't connect
- Check backend is running on port 5000
- Check browser console for errors
- Verify API URL is `http://localhost:5000`

### Login not working
- Check backend console for errors
- Verify database has users table
- Run migration: `node migrate-database.js`

---

## 📊 Database Inspection

### View all users
```bash
cd backend
sqlite3 database/earnsure.db "SELECT id, name, email, phone, role, wallet_balance FROM users;"
```

### View sessions
```bash
sqlite3 database/earnsure.db "SELECT user_id, session_token, expires_at FROM sessions;"
```

### Reset admin password
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('newpassword', 10));"
# Copy the hash, then:
sqlite3 database/earnsure.db "UPDATE users SET password_hash='<hash>' WHERE email='admin@earnsure.com';"
```

---

## 🎯 Key Features to Demo

### 1. Secure Authentication
- Show signup form with validation
- Show login with email/password
- Show session persistence

### 2. Real Database
- Show SQLite database file
- Show user data persists after restart
- Show wallet balance is real (not demo)

### 3. No SMS Dependency
- Explain no SMS costs
- Instant signup/login
- No waiting for OTP

### 4. Production Ready
- Password hashing (bcrypt)
- Session management
- Proper error handling
- Input validation

---

## 📝 API Testing with cURL

### Signup
```bash
curl -X POST http://localhost:5000/api/v2/auth/worker/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure123",
    "platform": "Zomato"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v2/auth/worker/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "secure123"
  }'
```

### Verify Session
```bash
curl -X GET http://localhost:5000/api/v2/auth/verify-session \
  -H "Authorization: Bearer <your_token_here>"
```

---

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Can create new worker account
- [ ] Can login with email/password
- [ ] Can login with phone/password
- [ ] Session persists after page refresh
- [ ] Admin can login
- [ ] Wallet balance shows ₹0 (not demo credits)
- [ ] Database file exists and has data
- [ ] No OTP/SMS required

---

## 🎉 You're Ready!

Your authentication system is now:
- ✅ Secure (bcrypt password hashing)
- ✅ Real (SQLite database)
- ✅ Free (no SMS costs)
- ✅ Production-ready (proper error handling)
- ✅ User-friendly (traditional login/signup)

**No more demo mode. No more SMS dependency. Just real, secure authentication!**
