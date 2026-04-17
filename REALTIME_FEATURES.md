# Real-Time Features Documentation

## Overview
All demo features in EarnSure now work with **real-time data** from live APIs and services. The system continuously monitors weather, traffic, and location data to trigger instant parametric payouts.

---

## 🌐 Live Data Sources

### 1. **Weather Data (Open-Meteo API)**
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Data Points**:
  - Temperature (°C)
  - Precipitation (mm)
  - Wind Speed (km/h)
  - Humidity (%)
  - Visibility (km)
  - Weather codes
- **Update Frequency**: Every 30 seconds
- **Coverage**: Global

### 2. **Air Quality Index (Open-Meteo AQI)**
- **Endpoint**: `https://air-quality-api.open-meteo.com/v1/air-quality`
- **Data Points**:
  - US AQI Index
  - PM2.5 and PM10
  - CO, NO2, SO2, O3 levels
- **Update Frequency**: Every 30 seconds
- **Coverage**: Global

### 3. **Traffic Data (OSRM)**
- **Endpoint**: `https://router.project-osrm.org/route/v1/driving`
- **Data Points**:
  - Route distance (km)
  - Travel duration (minutes)
  - Traffic latency multiplier
- **Update Frequency**: Every 60 seconds
- **Coverage**: Global road network

### 4. **Geocoding (Nominatim)**
- **Endpoint**: `https://nominatim.openstreetmap.org/reverse`
- **Data Points**:
  - City name
  - State/Region
  - Country
  - Full address
- **Update Frequency**: On location change
- **Coverage**: Global

---

## 🚀 Real-Time Services

### Backend Services

#### 1. **RealTimeWeatherService**
```javascript
// Location: backend/services/RealTimeWeatherService.js
```
**Features**:
- Fetches live weather data from Open-Meteo
- Monitors AQI levels continuously
- Reverse geocodes coordinates to city names
- Caches data for 5 minutes to reduce API calls
- Checks trigger thresholds automatically
- Emits Socket.io events for real-time updates

**Key Methods**:
- `getWeatherData(lat, lon)` - Fetch current weather
- `getAQIData(lat, lon)` - Fetch air quality
- `reverseGeocode(lat, lon)` - Get location name
- `startMonitoring(workerId, lat, lon)` - Begin real-time monitoring
- `checkTriggers(workerId, weather, aqi)` - Evaluate trigger conditions

#### 2. **RealTimeTrafficService**
```javascript
// Location: backend/services/RealTimeTrafficService.js
```
**Features**:
- Calculates route distances and durations using OSRM
- Monitors traffic latency by comparing current vs baseline times
- Generates sample routes within a zone for comprehensive monitoring
- Detects severe traffic conditions (3x+ normal)
- Emits traffic alerts via Socket.io

**Key Methods**:
- `getRouteInfo(startLat, startLon, endLat, endLon)` - Calculate route
- `calculateTrafficLatency(...)` - Determine traffic multiplier
- `monitorZoneTraffic(cityLat, cityLon, radius)` - Zone-wide monitoring
- `startMonitoring(workerId, lat, lon)` - Begin traffic monitoring

#### 3. **RealTimePayoutEngine**
```javascript
// Location: backend/services/RealTimePayoutEngine.js
```
**Features**:
- Orchestrates weather and traffic monitoring
- Evaluates parametric trigger conditions every 30 seconds
- Processes instant payouts when triggers are met
- Implements SRAP (Smart Rating Adjustment Protocol)
- Runs fraud detection checks
- Prevents duplicate claims
- Emits payout notifications via Socket.io

**Key Methods**:
- `startWorkerMonitoring(workerId, lat, lon)` - Start monitoring
- `stopWorkerMonitoring(workerId)` - Stop monitoring
- `checkParametricTriggers(workerId, lat, lon)` - Check conditions
- `processPayout(workerId, policy, trigger, conditions)` - Execute payout
- `runFraudCheck(workerId, location, conditions)` - Fraud detection

---

## 📡 Real-Time API Endpoints

### Base URL: `http://localhost:5000/api/realtime`

#### 1. **GET /weather**
Fetch current weather and AQI data.

**Query Parameters**:
- `lat` (required): Latitude
- `lon` (required): Longitude

**Response**:
```json
{
  "success": true,
  "weather": {
    "temperature": 32.5,
    "precipitation": 0.2,
    "humidity": 65,
    "windSpeed": 12,
    "visibility": 10,
    "timestamp": "2026-04-15T10:30:00Z"
  },
  "aqi": {
    "aqi": 142,
    "pm25": 45,
    "pm10": 78
  }
}
```

#### 2. **GET /forecast**
Get 24-hour weather forecast.

**Query Parameters**:
- `lat` (required): Latitude
- `lon` (required): Longitude

**Response**:
```json
{
  "success": true,
  "forecast": {
    "hourly": {
      "time": ["2026-04-15T00:00", ...],
      "temperature_2m": [28, 29, 30, ...],
      "precipitation": [0, 0, 0.5, ...]
    }
  }
}
```

#### 3. **GET /traffic**
Get real-time traffic data for a zone.

**Query Parameters**:
- `lat` (required): Latitude
- `lon` (required): Longitude

**Response**:
```json
{
  "success": true,
  "traffic": {
    "avgLatency": 1.8,
    "samples": 4,
    "severity": "MODERATE",
    "timestamp": "2026-04-15T10:30:00Z"
  }
}
```

#### 4. **GET /geocode**
Reverse geocode coordinates to location name.

**Query Parameters**:
- `lat` (required): Latitude
- `lon` (required): Longitude

**Response**:
```json
{
  "success": true,
  "location": {
    "city": "Delhi",
    "state": "Delhi",
    "country": "India",
    "displayName": "Delhi, India"
  }
}
```

#### 5. **POST /monitor/start**
Start real-time monitoring for a worker.

**Body**:
```json
{
  "workerId": "60d21b4667d0d8992e610c85",
  "lat": 28.6139,
  "lon": 77.2090
}
```

**Response**:
```json
{
  "success": true,
  "message": "Real-time monitoring started",
  "workerId": "60d21b4667d0d8992e610c85"
}
```

#### 6. **POST /monitor/stop**
Stop monitoring for a worker.

**Body**:
```json
{
  "workerId": "60d21b4667d0d8992e610c85"
}
```

#### 7. **GET /monitor/status**
Get status of all active monitors.

**Response**:
```json
{
  "success": true,
  "activeMonitors": 3,
  "monitors": [
    {
      "workerId": "...",
      "location": { "lat": 28.6139, "lon": 77.2090 },
      "active": true
    }
  ]
}
```

---

## 🔌 Socket.io Events

### Client → Server

#### `join_room`
Join a personal room for receiving notifications.
```javascript
socket.emit('join_room', userId);
```

#### `start_monitoring`
Request to start real-time monitoring.
```javascript
socket.emit('start_monitoring', {
  workerId: '...',
  lat: 28.6139,
  lon: 77.2090
});
```

#### `stop_monitoring`
Request to stop monitoring.
```javascript
socket.emit('stop_monitoring', { workerId: '...' });
```

### Server → Client

#### `weather_update`
Real-time weather data update.
```javascript
socket.on('weather_update', (data) => {
  // data: { temperature, precipitation, humidity, windSpeed, aqi, ... }
});
```

#### `traffic_update`
Real-time traffic data update.
```javascript
socket.on('traffic_update', (data) => {
  // data: { avgLatency, severity, timestamp }
});
```

#### `trigger_alert`
Parametric trigger detected.
```javascript
socket.on('trigger_alert', (triggers) => {
  // triggers: [{ type, value, severity, message }]
});
```

#### `instant_payout`
Instant payout processed.
```javascript
socket.on('instant_payout', (data) => {
  // data: { claimId, amount, starRating, starLabel, trigger, conditions }
});
```

#### `payout_rejected`
Payout rejected (e.g., 1-star probation).
```javascript
socket.on('payout_rejected', (data) => {
  // data: { reason, policy, trigger }
});
```

#### `claim_review`
Claim flagged for manual review.
```javascript
socket.on('claim_review', (data) => {
  // data: { claimId, reason, fraudScore }
});
```

---

## 🎯 Parametric Triggers

### Trigger Conditions

| Metric | Threshold | Operator | Payout Trigger |
|--------|-----------|----------|----------------|
| AQI | 300 | >= | Critical air quality |
| Rainfall | 50mm | >= | Heavy rain |
| Temperature | 42°C | >= | Extreme heat |
| Traffic Latency | 3.0x | >= | Severe congestion |

### SRAP (Smart Rating Adjustment Protocol)

Payout amounts based on platform star rating:

| Star Rating | Tier | Payout Amount |
|-------------|------|---------------|
| 5⭐ | Platinum | ₹750 |
| 4⭐ | Gold | ₹625 |
| 3⭐ | Silver | ₹500 |
| 2⭐ | Bronze | ₹350 |
| 1⭐ | Probation | ₹0 (Suspended) |

---

## 🛡️ Fraud Detection

### Automated Checks

1. **Location Consistency** (30 points)
   - Flags if worker moved >50km in short time

2. **Time of Day** (20 points)
   - Flags activity outside 6 AM - 11 PM

3. **Claim Frequency** (25 points)
   - Flags if >3 claims in 24 hours

4. **Worker Rating** (15 points)
   - Flags if rating <2.5 stars

**Fraud Score Threshold**: 70+
- Score <70: Instant payout
- Score ≥70: Manual review required

---

## 🎨 Frontend Integration

### React Hook: `useRealTimeData`

```javascript
import { useRealTimeData } from '../hooks/useRealTimeData';

function MyComponent() {
  const {
    weather,
    aqi,
    traffic,
    forecast,
    location,
    triggers,
    loading,
    isMonitoring,
    refresh,
    startMonitoring,
    stopMonitoring
  } = useRealTimeData(workerId, lat, lon, enabled);

  // Use the data...
}
```

### Component: `RealTimeMonitor`

```javascript
import RealTimeMonitor from './components/shared/RealTimeMonitor';

<RealTimeMonitor workerId={workerId} compact={false} />
```

**Features**:
- Live telemetry display
- Active trigger alerts
- Recent payout notifications
- Connection status indicator
- Auto-updating every 30 seconds

---

## 🚦 Setup Instructions

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Start Backend Server
```bash
cd backend
npm start
```

The server will start on `http://localhost:5000` with:
- ✅ Real-time weather monitoring
- ✅ Traffic analysis
- ✅ Parametric trigger engine
- ✅ Socket.io real-time communication

### 3. Start Frontend
```bash
npm run dev
```

The frontend will connect to the backend and start receiving real-time updates.

---

## 📊 Monitoring Dashboard

### Admin Intelligence Portal
Access: `/admin/intelligence` (Key: `EARNSURE2026`)

**Real-Time Features**:
- Live worker monitoring status
- Active trigger alerts across all zones
- Payout processing logs
- Fraud detection alerts
- System health metrics

### Worker Dashboard
Access: `/worker/home` (Any 10-digit phone)

**Real-Time Features**:
- Live weather and AQI display
- Traffic conditions
- Instant payout notifications
- Trigger alerts
- Wallet balance updates

---

## 🔧 Configuration

### Environment Variables

Create `.env` in backend folder:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your-connection-string
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone
```

### Monitoring Intervals

Adjust in respective service files:

- Weather updates: 30 seconds
- Traffic updates: 60 seconds
- Trigger checks: 30 seconds
- Cache TTL: 5 minutes

---

## 🎯 Testing Real-Time Features

### 1. Test Weather Integration
```bash
curl "http://localhost:5000/api/realtime/weather?lat=28.6139&lon=77.2090"
```

### 2. Test Traffic Monitoring
```bash
curl "http://localhost:5000/api/realtime/traffic?lat=28.6139&lon=77.2090"
```

### 3. Test Manual Trigger
```bash
curl -X POST http://localhost:5000/api/realtime/trigger/test \
  -H "Content-Type: application/json" \
  -d '{"workerId":"test123","type":"AQI_CRITICAL","value":350}'
```

### 4. Monitor Socket Events
Open browser console and check for:
- `weather_update` events
- `traffic_update` events
- `trigger_alert` events
- `instant_payout` events

---

## 📈 Performance Optimization

### Caching Strategy
- Weather data: 5-minute cache
- Traffic baselines: Persistent cache
- Location geocoding: Session cache

### Rate Limiting
- Open-Meteo: No strict limits (free tier)
- OSRM: No authentication required
- Nominatim: 1 request/second (respected via caching)

### Scalability
- Socket.io rooms for targeted updates
- Worker-specific monitoring intervals
- Automatic cleanup on disconnect

---

## 🐛 Troubleshooting

### Issue: Weather data not updating
**Solution**: Check backend logs for API errors. Fallback to direct Open-Meteo API if backend is down.

### Issue: Socket.io not connecting
**Solution**: Verify backend is running on port 5000. Check CORS settings.

### Issue: Triggers not firing
**Solution**: Ensure monitoring is started via `start_monitoring` socket event or API call.

### Issue: Duplicate payouts
**Solution**: System prevents duplicates within 1-hour window. Check claim history in database.

---

## 📝 API Rate Limits

| Service | Limit | Notes |
|---------|-------|-------|
| Open-Meteo Weather | 10,000/day | Free tier, no key required |
| Open-Meteo AQI | 10,000/day | Free tier, no key required |
| OSRM Routing | Unlimited | Public instance |
| Nominatim | 1 req/sec | Respect usage policy |

---

## 🎉 Success Indicators

When everything is working:

✅ Backend console shows:
- `✅ MongoDB Connected Successfully`
- `🚀 GigShield Backend running on port 5000`
- `⚡ New client connected`
- `🔍 Starting real-time monitoring for worker...`

✅ Frontend shows:
- Live weather data updating
- Real-time AQI values
- Traffic latency indicators
- Instant payout notifications
- Green "Live" status indicator

✅ Parametric triggers fire automatically when:
- AQI exceeds 300
- Rainfall exceeds 50mm
- Temperature exceeds 42°C
- Traffic latency exceeds 3.0x

---

**All demo features are now fully operational with real-time data!** 🚀
