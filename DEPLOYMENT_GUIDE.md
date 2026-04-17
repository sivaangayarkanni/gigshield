# 🚀 DEPLOYMENT GUIDE - EARNSURE

## 📋 Deployment Options

### Option 1: Vercel (Recommended - Easiest)
- **Frontend:** Vercel (Free tier available)
- **Backend:** Vercel Serverless Functions
- **Database:** MongoDB Atlas (Free tier)
- **Setup Time:** 10 minutes

### Option 2: Railway (Best for Full Stack)
- **Frontend:** Railway
- **Backend:** Railway
- **Database:** MongoDB Atlas
- **Setup Time:** 15 minutes

### Option 3: Heroku (Classic)
- **Frontend:** Heroku
- **Backend:** Heroku
- **Database:** MongoDB Atlas
- **Setup Time:** 20 minutes

---

## 🎯 QUICK DEPLOYMENT (Vercel + Railway)

### Step 1: Deploy Backend to Railway (5 minutes)

#### 1.1 Create Railway Account
- Go to https://railway.app
- Sign up with GitHub
- Authorize Railway

#### 1.2 Create New Project
- Click "New Project"
- Select "Deploy from GitHub"
- Select your repository: `sivaangayarkanni/phase-3-earnsure`
- Select branch: `main`

#### 1.3 Configure Environment Variables
In Railway dashboard, add these variables:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/earnsure
VITE_GEMINI_API_KEY=your_gemini_key
GEMINI_API_KEY=your_gemini_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FAST2SMS_API_KEY=your_fast2sms_key
```

#### 1.4 Deploy
- Railway auto-deploys on push
- Wait for build to complete
- Get your backend URL: `https://your-project.railway.app`

---

### Step 2: Deploy Frontend to Vercel (5 minutes)

#### 2.1 Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub
- Authorize Vercel

#### 2.2 Import Project
- Click "New Project"
- Select your GitHub repository
- Select root directory: `.` (root)
- Click "Deploy"

#### 2.3 Configure Environment Variables
In Vercel dashboard, add:

```env
VITE_API_URL=https://your-project.railway.app
VITE_GEMINI_API_KEY=your_gemini_key
```

#### 2.4 Deploy
- Vercel auto-deploys on push
- Wait for build to complete
- Get your frontend URL: `https://your-project.vercel.app`

---

## 📊 FULL DEPLOYMENT SETUP

### Prerequisites
- GitHub account with repository
- MongoDB Atlas account (free tier)
- Razorpay account
- Gemini API key
- Railway or Heroku account

### Step 1: MongoDB Atlas Setup

#### 1.1 Create Cluster
- Go to https://www.mongodb.com/cloud/atlas
- Sign up or login
- Create new project
- Create new cluster (free tier)
- Wait for cluster to be ready

#### 1.2 Create Database User
- Go to Database Access
- Add new database user
- Username: `earnsure_user`
- Password: Generate secure password
- Add user

#### 1.3 Get Connection String
- Go to Clusters
- Click "Connect"
- Select "Connect your application"
- Copy connection string
- Replace `<password>` with your password
- Replace `<dbname>` with `earnsure`

Example:
```
mongodb+srv://earnsure_user:password@cluster0.abc.mongodb.net/earnsure?retryWrites=true&w=majority
```

#### 1.4 Whitelist IP
- Go to Network Access
- Add IP Address
- Select "Allow access from anywhere" (for development)
- Or add specific IPs for production

---

### Step 2: Backend Deployment (Railway)

#### 2.1 Push Code to GitHub
```bash
git add -A
git commit -m "Ready for deployment"
git push origin main
```

#### 2.2 Create Railway Project
- Go to https://railway.app
- Click "New Project"
- Select "Deploy from GitHub"
- Authorize GitHub
- Select repository
- Select branch: `main`

#### 2.3 Configure Build Settings
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

#### 2.4 Add Environment Variables
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
VITE_GEMINI_API_KEY=your_gemini_key
GEMINI_API_KEY=your_gemini_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FAST2SMS_API_KEY=your_fast2sms_key
```

#### 2.5 Deploy
- Click "Deploy"
- Wait for build to complete
- Get your backend URL from Railway dashboard

---

### Step 3: Frontend Deployment (Vercel)

#### 3.1 Create Vercel Project
- Go to https://vercel.com
- Click "New Project"
- Select your GitHub repository
- Click "Import"

#### 3.2 Configure Project
- Framework: Vite
- Root directory: `.` (root)
- Build command: `npm run build`
- Output directory: `dist`

#### 3.3 Add Environment Variables
```env
VITE_API_URL=https://your-railway-backend.railway.app
VITE_GEMINI_API_KEY=your_gemini_key
```

#### 3.4 Deploy
- Click "Deploy"
- Wait for build to complete
- Get your frontend URL from Vercel dashboard

---

## 🔧 ALTERNATIVE: Heroku Deployment

### Backend Deployment

#### 1. Create Heroku Account
- Go to https://www.heroku.com
- Sign up
- Install Heroku CLI

#### 2. Login to Heroku
```bash
heroku login
```

#### 3. Create App
```bash
heroku create earnsure-backend
```

#### 4. Add MongoDB
```bash
heroku addons:create mongolab:sandbox
```

#### 5. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set VITE_GEMINI_API_KEY=your_key
heroku config:set RAZORPAY_KEY_ID=your_key_id
heroku config:set RAZORPAY_KEY_SECRET=your_key_secret
```

#### 6. Deploy
```bash
git push heroku main
```

#### 7. View Logs
```bash
heroku logs --tail
```

---

### Frontend Deployment

#### 1. Create Heroku App
```bash
heroku create earnsure-frontend
```

#### 2. Add Buildpack
```bash
heroku buildpacks:add heroku/nodejs
```

#### 3. Set Environment Variables
```bash
heroku config:set VITE_API_URL=https://earnsure-backend.herokuapp.com
heroku config:set VITE_GEMINI_API_KEY=your_key
```

#### 4. Deploy
```bash
git push heroku main
```

---

## 🌐 CUSTOM DOMAIN SETUP

### For Vercel Frontend

#### 1. Add Domain
- Go to Vercel dashboard
- Select your project
- Go to Settings → Domains
- Add your domain
- Follow DNS configuration

#### 2. Update DNS Records
- Go to your domain registrar
- Add CNAME record pointing to Vercel
- Wait for DNS propagation (24-48 hours)

### For Railway Backend

#### 1. Add Domain
- Go to Railway dashboard
- Select your project
- Go to Settings → Domains
- Add your domain
- Follow DNS configuration

---

## 🔐 PRODUCTION SECURITY CHECKLIST

### Environment Variables
- [ ] All sensitive keys in environment variables
- [ ] No hardcoded secrets in code
- [ ] Different keys for dev/prod
- [ ] Rotate keys regularly

### Database
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Database user with limited permissions
- [ ] Backups enabled
- [ ] Encryption at rest enabled

### API Security
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints

### Payment Security
- [ ] Razorpay signature verification
- [ ] PCI compliance
- [ ] Webhook validation
- [ ] Test mode for development

### Monitoring
- [ ] Error logging enabled
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Alert notifications

---

## 📊 DEPLOYMENT CHECKLIST

### Before Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] API keys obtained
- [ ] Domain registered (optional)

### During Deployment
- [ ] Build completes successfully
- [ ] No deployment errors
- [ ] Environment variables set
- [ ] Database connected
- [ ] APIs responding

### After Deployment
- [ ] Frontend loads
- [ ] Backend API responds
- [ ] Authentication works
- [ ] Payment integration works
- [ ] Real-time updates work
- [ ] Database queries work

---

## 🧪 POST-DEPLOYMENT TESTING

### Test Backend
```bash
# Test API
curl https://your-backend.railway.app/api/realtime/weather?lat=28.6139&lon=77.2090

# Test payment
curl -X POST https://your-backend.railway.app/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount":99,"planId":"premium","userId":"u1","planName":"Premium"}'

# Test optimization
curl -X POST https://your-backend.railway.app/api/optimization/analyze \
  -H "Content-Type: application/json" \
  -d '{"workerId":"w1","lat":28.6139,"lon":77.2090,"baseEarnings":300}'
```

### Test Frontend
- Open https://your-frontend.vercel.app
- Test signup/login
- Test dashboard
- Test earnings optimizer
- Test payment flow
- Test admin portal

### Test Real-Time
- Open DevTools (F12)
- Go to Network tab
- Verify API calls to:
  - api.open-meteo.com
  - air-quality.open-meteo.com
  - router.project-osrm.org
  - your-backend.railway.app

---

## 🚨 TROUBLESHOOTING

### Backend Won't Start
```bash
# Check logs
heroku logs --tail
# or
railway logs

# Check environment variables
heroku config
# or
railway variables

# Restart
heroku restart
# or
railway restart
```

### Frontend Build Fails
```bash
# Check build logs in Vercel dashboard
# Verify environment variables
# Check package.json scripts
# Verify Node version compatibility
```

### Database Connection Error
```bash
# Check MongoDB URI
# Verify IP whitelist
# Check database user credentials
# Verify network connectivity
```

### Payment Integration Not Working
```bash
# Check Razorpay keys
# Verify webhook URL
# Check payment logs
# Test with test card
```

---

## 📈 MONITORING & MAINTENANCE

### Set Up Monitoring
- [ ] Sentry for error tracking
- [ ] New Relic for performance
- [ ] Datadog for infrastructure
- [ ] PagerDuty for alerts

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Review security logs weekly
- [ ] Backup database daily
- [ ] Monitor API performance
- [ ] Check error rates

### Scaling
- [ ] Monitor database size
- [ ] Monitor API response times
- [ ] Monitor concurrent users
- [ ] Plan for horizontal scaling
- [ ] Consider caching layer (Redis)

---

## 🎯 DEPLOYMENT SUMMARY

### Quick Deploy (15 minutes)
1. Push to GitHub
2. Deploy backend to Railway (5 min)
3. Deploy frontend to Vercel (5 min)
4. Configure environment variables (5 min)
5. Test all features

### Full Production Setup (1 hour)
1. Set up MongoDB Atlas
2. Configure Razorpay
3. Deploy backend to Railway
4. Deploy frontend to Vercel
5. Set up custom domain
6. Configure monitoring
7. Run security checks
8. Test all features

---

## 📞 DEPLOYMENT SUPPORT

### Railway Support
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Email: support@railway.app

### Vercel Support
- Docs: https://vercel.com/docs
- Discord: https://discord.gg/vercel
- Email: support@vercel.com

### MongoDB Support
- Docs: https://docs.mongodb.com
- Community: https://community.mongodb.com
- Email: support@mongodb.com

---

## ✅ DEPLOYMENT COMPLETE

Your EarnSure application is now deployed and ready for production!

**Frontend:** https://your-frontend.vercel.app
**Backend:** https://your-backend.railway.app

**Next Steps:**
1. Test all features
2. Set up monitoring
3. Configure custom domain
4. Enable SSL/TLS
5. Set up backups
6. Monitor performance

---

**Built with ❤️ for gig workers. Deployed and ready. 🚀**
