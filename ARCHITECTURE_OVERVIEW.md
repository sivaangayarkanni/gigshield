# 🏗️ EarnSure Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Worker       │  │ Admin        │  │ Partner      │         │
│  │ Dashboard    │  │ Dashboard    │  │ Dashboard    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Real-Time Components                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • LiveLocationDisplay  → GPS coordinates & city          │  │
│  │ • RealTimeMonitor      → Weather/AQI/Traffic telemetry   │  │
│  │ • GigBot               → AI chatbot with live context    │  │
│  │ • EarningsImpactPredictor → Earnings loss calculator     │  │
│  │ • NationalRiskMap      → Live risk visualization         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Context Providers                           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • SimulationContext → GPS tracking, sensor data          │  │
│  │ • SocketContext     → Real-time WebSocket connection     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes                            │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ /api/auth          → OTP login, registration             │  │
│  │ /api/realtime      → Weather, AQI, traffic, geocoding    │  │
│  │ /api/chatbot       → AI chatbot messages                 │  │
│  │ /api/admin         → Admin operations, manual review     │  │
│  │ /api/payment       → Wallet, transactions                │  │
│  │ /api/trigger       → Manual trigger simulation           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Real-Time Services                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • RealTimeWeatherService                                 │  │
│  │   - Open-Meteo API integration                           │  │
│  │   - Weather + AQI data fetching                          │  │
│  │   - Reverse geocoding (Nominatim)                        │  │
│  │                                                           │  │
│  │ • RealTimeTrafficService                                 │  │
│  │   - OSRM API integration                                 │  │
│  │   - Multi-route traffic analysis                         │  │
│  │   - Congestion detection                                 │  │
│  │                                                           │  │
│  │ • RealTimePayoutEngine                                   │  │
│  │   - Continuous condition monitoring                      │  │
│  │   - Automatic trigger detection                          │  │
│  │   - Instant payout processing                            │  │
│  │   - Fraud & causality checks                             │  │
│  │                                                           │  │
│  │ • AIInsuranceAgent                                       │  │
│  │   - Gemini 2.0 Flash integration                         │  │
│  │   - Live context awareness                               │  │
│  │   - Conversation history management                      │  │
│  │                                                           │  │
│  │ • DeliveryImpactPredictor                                │  │
│  │   - 6-hour forecast generation                           │  │
│  │   - Earnings loss calculation                            │  │
│  │   - Alternative zone suggestions                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Database (SQLite)                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Tables:                                                   │  │
│  │ • users          → Worker/admin accounts                 │  │
│  │ • policies       → Insurance policies                    │  │
│  │ • claims         → Payout history                        │  │
│  │ • otp_storage    → OTP verification                      │  │
│  │ • sessions       → Auth sessions                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              WebSocket (Socket.io)                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Events:                                                   │  │
│  │ • instant_payout    → Real-time payout notifications     │  │
│  │ • trigger_alert     → Condition threshold alerts         │  │
│  │ • payout_rejected   → Rejection notifications            │  │
│  │ • impact_update     → Earnings predictor updates         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP APIs
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL APIS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Open-Meteo   │  │ OSRM         │  │ Nominatim    │         │
│  │ Weather API  │  │ Traffic API  │  │ Geocoding    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ Google       │  │ Twilio       │                            │
│  │ Gemini AI    │  │ SMS API      │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    DEVICE SENSORS                                │
├─────────────────────────────────────────────────────────────────┤
│  • GPS (navigator.geolocation)                                  │
│  • Network connectivity                                          │
│  • Browser permissions                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Live Location Tracking

```
┌─────────────────┐
│  User Device    │
│  (Browser)      │
└────────┬────────┘
         │ 1. navigator.geolocation.watchPosition()
         ↓
┌─────────────────────────────────────┐
│  SimulationContext.jsx              │
│  - Captures GPS coordinates         │
│  - Updates every few seconds        │
└────────┬────────────────────────────┘
         │ 2. Coordinates: [lat, lon]
         ↓
┌─────────────────────────────────────┐
│  Backend API Call                   │
│  GET /api/realtime/geocode          │
│  ?lat={lat}&lon={lon}               │
└────────┬────────────────────────────┘
         │ 3. Reverse geocoding
         ↓
┌─────────────────────────────────────┐
│  Nominatim API                      │
│  (OpenStreetMap)                    │
└────────┬────────────────────────────┘
         │ 4. Returns: { city, state }
         ↓
┌─────────────────────────────────────┐
│  SimulationContext                  │
│  - Updates activeCity state         │
│  - Triggers weather fetch           │
└────────┬────────────────────────────┘
         │ 5. Display updates
         ↓
┌─────────────────────────────────────┐
│  LiveLocationDisplay Component      │
│  - Shows city name                  │
│  - Shows coordinates                │
│  - Shows accuracy                   │
└─────────────────────────────────────┘
```

---

## Data Flow: AI Chatbot with Location Context

```
┌─────────────────┐
│  User Types:    │
│  "Where am I?"  │
└────────┬────────┘
         │ 1. User message
         ↓
┌─────────────────────────────────────┐
│  GigBot Component                   │
│  - Collects live context:           │
│    • lat, lon (from GPS)            │
│    • weather data                   │
│    • AQI data                       │
│    • traffic data                   │
│    • worker state                   │
└────────┬────────────────────────────┘
         │ 2. POST /api/chatbot/message
         │    { userId, message, context }
         ↓
┌─────────────────────────────────────┐
│  AIInsuranceAgent Service           │
│  - Builds enhanced prompt           │
│  - Includes live location data      │
│  - Formats context for AI           │
└────────┬────────────────────────────┘
         │ 3. API call with context
         ↓
┌─────────────────────────────────────┐
│  Google Gemini 2.0 Flash API        │
│  - Processes prompt with context    │
│  - Generates contextual response    │
└────────┬────────────────────────────┘
         │ 4. AI response
         ↓
┌─────────────────────────────────────┐
│  AIInsuranceAgent                   │
│  - Adds suggestions                 │
│  - Stores in history                │
└────────┬────────────────────────────┘
         │ 5. Returns response
         ↓
┌─────────────────────────────────────┐
│  GigBot Component                   │
│  - Displays response:               │
│    "📍 Your location:               │
│     City: Mumbai                    │
│     Coords: 19.0760°N, 72.8777°E"  │
└─────────────────────────────────────┘
```

---

## Data Flow: Automatic Parametric Trigger

```
┌─────────────────────────────────────┐
│  GPS Location Update                │
│  lat: 19.0760, lon: 72.8777         │
└────────┬────────────────────────────┘
         │ Every 30 seconds
         ↓
┌─────────────────────────────────────┐
│  RealTimeWeatherService             │
│  GET Open-Meteo API                 │
│  - Weather data                     │
│  - AQI data                         │
└────────┬────────────────────────────┘
         │ Returns: { temp, rain, aqi }
         ↓
┌─────────────────────────────────────┐
│  RealTimeTrafficService             │
│  GET OSRM API                       │
│  - Multi-route analysis             │
│  - Traffic latency calculation      │
└────────┬────────────────────────────┘
         │ Returns: { avgLatency }
         ↓
┌─────────────────────────────────────┐
│  RealTimePayoutEngine               │
│  - Checks thresholds:               │
│    • AQI ≥ 300?                     │
│    • Rain ≥ 50mm?                   │
│    • Temp ≥ 42°C?                   │
│    • Traffic ≥ 3.0x?                │
└────────┬────────────────────────────┘
         │ If threshold met
         ↓
┌─────────────────────────────────────┐
│  Trigger Detection                  │
│  - Creates event                    │
│  - Emits Socket.io event            │
└────────┬────────────────────────────┘
         │ Trigger activated
         ↓
┌─────────────────────────────────────┐
│  Validation Pipeline                │
│  1. Policy Check                    │
│     - Active policy?                │
│     - Exclusions?                   │
│  2. Causality Check                 │
│     - Worker in affected zone?      │
│     - Distance < 5km?               │
│     - Active during event?          │
│  3. Fraud Check                     │
│     - Impossible travel?            │
│     - Duplicate claim?              │
│     - Worker offline?               │
└────────┬────────────────────────────┘
         │ All checks passed
         ↓
┌─────────────────────────────────────┐
│  Payout Calculation                 │
│  - Get worker star rating           │
│  - Calculate amount:                │
│    5⭐ → ₹750                        │
│    4⭐ → ₹625                        │
│    3⭐ → ₹500                        │
│    2⭐ → ₹350                        │
│    1⭐ → ₹0 (probation)             │
└────────┬────────────────────────────┘
         │ Amount calculated
         ↓
┌─────────────────────────────────────┐
│  Instant Payout                     │
│  - Update wallet balance            │
│  - Create transaction record        │
│  - Save to SQLite database          │
│  - Emit Socket.io notification      │
└────────┬────────────────────────────┘
         │ Payout complete
         ↓
┌─────────────────────────────────────┐
│  Frontend Notification              │
│  "💰 Instant Payout                 │
│   ₹500 credited via UPI-Core"       │
└─────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **State Management**: Context API
- **Real-Time**: Socket.io Client
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Maps**: Leaflet (for NationalRiskMap)
- **Styling**: CSS Modules + Custom CSS

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite3 (better-sqlite3)
- **Real-Time**: Socket.io
- **HTTP Client**: Axios
- **Environment**: dotenv

### External Services
- **Weather**: Open-Meteo API (free, no key)
- **AQI**: Open-Meteo Air Quality API (free)
- **Traffic**: OSRM API (free, open-source)
- **Geocoding**: Nominatim/OpenStreetMap (free)
- **AI**: Google Gemini 2.0 Flash (requires API key)
- **SMS**: Twilio (optional, for real OTP)

### Database Schema (SQLite)

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'WORKER',
  star_rating INTEGER DEFAULT 3,
  wallet_balance INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Policies table
CREATE TABLE policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  policy_type TEXT DEFAULT 'PARAMETRIC',
  status TEXT DEFAULT 'ACTIVE',
  premium_amount INTEGER DEFAULT 35,
  coverage_amount INTEGER DEFAULT 500,
  start_date DATETIME,
  end_date DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Claims table
CREATE TABLE claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  policy_id INTEGER NOT NULL,
  trigger_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'APPROVED',
  lat REAL,
  lon REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (policy_id) REFERENCES policies(id)
);

-- OTP storage
CREATE TABLE otp_storage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  verified INTEGER DEFAULT 0
);

-- Sessions
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Security Features

### Authentication
- **OTP-based login**: No passwords, SMS verification
- **Session tokens**: 24-hour expiry
- **Role-based access**: WORKER, ADMIN, PARTNER roles
- **SQLite storage**: Local database, no cloud dependencies

### Fraud Prevention
- **Causality scoring**: Distance-based verification
- **Duplicate detection**: Prevents multiple claims for same event
- **Speed analysis**: Detects impossible travel patterns
- **Online status check**: Verifies worker was active during event
- **Manual review queue**: High-risk claims flagged for human review

### Data Privacy
- **GPS permissions**: Explicit user consent required
- **Local storage**: Sensitive data in SQLite, not cloud
- **HTTPS required**: GPS only works on secure origins
- **No PII in logs**: Coordinates and IDs only

---

## Performance Optimizations

### Frontend
- **Lazy loading**: Components loaded on-demand
- **Debounced updates**: GPS updates throttled to prevent spam
- **Memoization**: React.memo for expensive components
- **Virtual scrolling**: For large lists (claims, logs)
- **Code splitting**: Separate bundles for worker/admin/partner

### Backend
- **Connection pooling**: SQLite prepared statements
- **Caching**: Weather/traffic data cached for 30 seconds
- **Batch processing**: Multiple triggers processed together
- **Async operations**: Non-blocking I/O for API calls
- **Rate limiting**: Prevents API abuse

### Real-Time
- **Socket.io rooms**: Users only receive their own events
- **Event throttling**: Max 1 trigger per minute per worker
- **Selective broadcasting**: Only affected users notified
- **Heartbeat monitoring**: Detects disconnected clients

---

## Scalability Considerations

### Current Architecture (MVP)
- **Single server**: Node.js + SQLite
- **Capacity**: ~1,000 concurrent users
- **Database**: File-based SQLite
- **Deployment**: Single instance

### Production Scaling Path
1. **Database**: Migrate to PostgreSQL/MySQL
2. **Caching**: Add Redis for session/data caching
3. **Load balancing**: Multiple Node.js instances
4. **Message queue**: RabbitMQ/Kafka for trigger processing
5. **Microservices**: Separate weather/traffic/payout services
6. **CDN**: Static assets on CloudFront/Cloudflare
7. **Monitoring**: Prometheus + Grafana
8. **Logging**: ELK stack (Elasticsearch, Logstash, Kibana)

---

## Deployment Architecture

### Development
```
localhost:5173  → Frontend (Vite dev server)
localhost:5000  → Backend (Node.js)
earnsure.db     → SQLite database
```

### Production (Recommended)
```
┌─────────────────────────────────────┐
│  Cloudflare CDN                     │
│  - Static assets                    │
│  - DDoS protection                  │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Nginx Reverse Proxy                │
│  - SSL termination                  │
│  - Load balancing                   │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Node.js Cluster (PM2)              │
│  - 4x worker processes              │
│  - Auto-restart on crash            │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  PostgreSQL Database                │
│  - Replicated for HA                │
│  - Automated backups                │
└─────────────────────────────────────┘
```

---

## Monitoring & Observability

### Metrics to Track
- **GPS accuracy**: Average accuracy in meters
- **API latency**: Response times for external APIs
- **Trigger frequency**: Triggers per hour/day
- **Payout success rate**: % of successful payouts
- **Fraud detection rate**: % of claims flagged
- **User engagement**: Active users, session duration
- **Error rates**: API failures, GPS errors

### Logging Strategy
- **Info**: User actions, trigger activations, payouts
- **Warning**: API failures, low GPS accuracy, fraud flags
- **Error**: Database errors, critical failures
- **Debug**: Detailed API responses, state changes

---

## Future Enhancements

### Phase 2 (Q2 2026)
- [ ] Progressive Web App (PWA) with offline support
- [ ] Push notifications for triggers
- [ ] Multi-language support (Hindi, Tamil, Telugu)
- [ ] Voice commands integration
- [ ] Wearable device support (smartwatch alerts)

### Phase 3 (Q3 2026)
- [ ] Blockchain integration for immutable records
- [ ] Machine learning for fraud detection
- [ ] Predictive analytics for risk assessment
- [ ] Integration with more gig platforms (Uber, Ola, Dunzo)
- [ ] Peer-to-peer insurance pools

### Phase 4 (Q4 2026)
- [ ] International expansion (Southeast Asia)
- [ ] Cryptocurrency payouts
- [ ] Decentralized autonomous organization (DAO)
- [ ] NFT-based policy certificates
- [ ] Metaverse integration

---

**Document Version**: 1.0
**Last Updated**: April 15, 2026
**Status**: Production Ready ✅
