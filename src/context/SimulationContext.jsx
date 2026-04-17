import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../components/shared/NotificationSystem';

const SimulationContext = createContext();

export const useSimulation = () => useContext(SimulationContext);



const CITY_COORDS = {
  'Delhi NCR': { lat: 28.6139, lon: 77.2090 },
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Bangalore': { lat: 12.9716, lon: 77.5946 },
  'Chennai': { lat: 13.0827, lon: 80.2707 },
  'Kolkata': { lat: 22.5726, lon: 88.3639 },
  'Hyderabad': { lat: 17.3850, lon: 78.4867 },
  'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Jaipur': { lat: 26.9124, lon: 75.7873 },
  'Surat': { lat: 21.1702, lon: 72.8311 },
  'Lucknow': { lat: 26.8467, lon: 80.9462 },
  'Kanpur': { lat: 26.4499, lon: 80.3319 },
  'Nagpur': { lat: 21.1458, lon: 79.0882 },
  'Indore': { lat: 22.7196, lon: 75.8577 },
  'Bhopal': { lat: 23.2599, lon: 77.4126 },
  'Visakhapatnam': { lat: 17.6868, lon: 83.2185 }
};

const INITIAL_THRESHOLDS = {
  AQI: { warning: 200, critical: 300, severe: 400 },
  RAINFALL: { light: 10, moderate: 30, heavy: 50 },
  TEMPERATURE: { high: 40, extreme: 42 },
  TRAFFIC: { moderate: 1.5, high: 2.0, severe: 3.0 }
};

// Payout varies by platform star rating
const STAR_PAYOUT_TABLE = {
  5: 750,  // Platinum Rider
  4: 625,  // Gold Rider
  3: 500,  // Silver Rider (default)
  2: 350,  // Bronze Rider
  1: 0,    // Probation – no payout
};


const MANDATORY_EXCLUSIONS = [
  'War, Terrorism, Civil Unrest',
  'Pandemic / Epidemic (Government Declared)',
  'Illegal Activity',
  'Substance Abuse',
  'Intentional Self-harm',
  'Government Mandated Lockdowns'
];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

export const SimulationProvider = ({ children }) => {
  const { addNotification } = useNotifications();
  const [userRole, setUserRole] = useState(null);

  const [userSession, setUserSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeCity, setActiveCity] = useState("Delhi NCR");
  const [activeZone, setActiveZone] = useState("North Zone");
  const [currentEventState, setCurrentEventState] = useState(null);
  const [logs, setLogs] = useState([]);
  const [sensorData, setSensorData] = useState({
    aqi: 142, rainfall: 0.5, temperature: 32, trafficLatency: 1.2,
    visibility: 10, humidity: 65, windSpeed: 12, confidence: 0.98, lastUpdated: new Date().toISOString()
  });
  const [riderCoords, setRiderCoords] = useState([28.6139, 77.2090]);
  const [isOnline, setIsOnline] = useState(true);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(2450);
  const [weeklyPremium] = useState(35);
  const [premiumDue, setPremiumDue] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [realWeatherMode, setRealWeatherMode] = useState(false);
  // Dynamic payout based on star rating
  const getTargetPayout = () => {
    const stars = workerState?.starRating ?? 3;
    return STAR_PAYOUT_TABLE[stars] ?? 500;
  };
  const [metrics, setMetrics] = useState({
    totalWorkersCovered: 14500, totalPayouts: 3200000, lossRatio: 64.2,
    bcr: 0.58, totalPremiumCollected: 14500 * 350, triggerFrequency: { AQI: 45, Rain: 32, Heat: 18, Traffic: 15 }, riskScore: 72
  });
  const [workerState, setWorkerState] = useState(null);
  const [manualReviewQueue, setManualReviewQueue] = useState([]);
  const [pastClaims, setPastClaims] = useState([]);
  const [evidenceUploads, setEvidenceUploads] = useState([]);
  const [fraudChecks, setFraudChecks] = useState([]);
  const [fraudScore, setFraudScore] = useState(0);
  const [policyState, setPolicyState] = useState({
    active: true, tier: 'Standard', startDate: '2026-01-01', endDate: '2026-12-31',
    exclusions: MANDATORY_EXCLUSIONS, version: '4.0'
  });

  const [thresholds, setThresholds] = useState(INITIAL_THRESHOLDS);
  const [premiumRate, setPremiumRate] = useState(35); // Dynamic rate

  const [lastPremiumDate, setLastPremiumDate] = useState(new Date().toISOString());

  const addKafkaLog = useCallback((topic, payload, type = "info") => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [{ id: Date.now() + Math.random(), timestamp, topic, message: payload, type,
      metadata: { city: activeCity, workerId: workerState?.id, sessionId: userSession?.id } }, ...prev].slice(0, 100));
  }, [activeCity, workerState?.id, userSession?.id]);

  // ACTUARIAL: Adjust premium based on risk factors
  useEffect(() => {
    const baseRate = 35;
    const riskMultiplier = metrics.riskScore / 70; // 70 is neutral
    const newRate = Math.round(baseRate * riskMultiplier);
    setPremiumRate(newRate);
  }, [metrics.riskScore]);

  // AUTO-PREMIUM: Charge every 7 virtual days (simulated by a timer here for demo)
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'WORKER') return;
    const interval = setInterval(() => {
      const now = new Date();
      addKafkaLog('actuarial', `Weekly premium cycle check: ₹${premiumRate}`, 'info');
      setPremiumDue(premiumRate);
    }, 60000); // Every minute for demo represents a week
    return () => clearInterval(interval);
  }, [isAuthenticated, userRole, premiumRate, addKafkaLog]);

  const runFraudCheck = useCallback((workerId, eventData) => {
    let score = 0, reasons = [];
    const speed = lastLocationUpdate ? Math.random() * 50 : 0;
    if (speed > 100) { score += 30; reasons.push('Impossible travel speed'); }
    const dist = calculateDistance(riderCoords[0], riderCoords[1], eventData.lat, eventData.lon);
    if (dist > 10) { score += 25; reasons.push(`Worker ${dist.toFixed(1)}km from zone`); }
    if (!isOnline) { score += 20; reasons.push('Worker offline during event'); }
    const recentClaim = pastClaims.find(c => c.timestamp > Date.now() - 3600000);
    if (recentClaim) { score += 40; reasons.push('Duplicate claim'); }
    const result = { id: Date.now(), workerId, eventData, score, reasons, timestamp: new Date().toISOString(), status: score > 50 ? 'FLAGGED' : 'CLEARED' };
    setFraudChecks(prev => [result, ...prev].slice(0, 50));
    setFraudScore(score);
    addKafkaLog('fraud_engine', `Fraud: ${score} - ${result.status}`, score > 50 ? 'error' : 'success');
    return result;
  }, [riderCoords, isOnline, pastClaims, lastLocationUpdate, addKafkaLog]);

  const calculateCausality = useCallback((eventData, sensorSnapshot) => {
    let score = 0, factors = [];
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 22) { score += 30; factors.push('Active hours'); }
    const dist = calculateDistance(riderCoords[0], riderCoords[1], eventData.lat, eventData.lon);
    if (dist < 5) { score += 40; factors.push(`Within ${dist.toFixed(1)}km`); }
    else if (dist < 10) { score += 20; factors.push(`Vicinity ${dist.toFixed(1)}km`); }
    if (eventData.type === 'AQI_CRITICAL' && sensorSnapshot.aqi > 250) { score += 30; factors.push('AQI confirmed'); }
    if (eventData.type?.includes('RAIN') && sensorSnapshot.rainfall > 20) { score += 30; factors.push('Rain confirmed'); }
    if (workerState?.isOnline) { score += 20; factors.push('Worker online'); }
    const result = { score: Math.min(100, score), factors, decision: score >= 50 ? 'APPROVED' : 'REJECTED', timestamp: new Date().toISOString() };
    addKafkaLog('causality', `Causality: ${result.score}% - ${result.decision}`, result.decision === 'APPROVED' ? 'success' : 'warning');
    return result;
  }, [riderCoords, workerState, addKafkaLog]);

  const fireTrigger = useCallback((type, value) => {
    if (currentEventState) return;
    const eventData = { type, value, lat: riderCoords[0], lon: riderCoords[1], city: activeCity, timestamp: new Date().toISOString() };
    setCurrentEventState({ stage: 'TRIGGER_ACTIVE', ...eventData, progress: 0 });
    addKafkaLog('trigger', `⚡ TRIGGER: ${type} in ${activeCity} - ${value}`, 'danger');
    addNotification("Parametric Alert", `Severe ${type} detected in ${activeCity}. Monitoring grid node.`, "warning");

    
    setTimeout(() => {
      setCurrentEventState(prev => ({ ...prev, stage: 'POLICY_CHECK', progress: 25 }));
      addKafkaLog('policy', 'Checking policy eligibility...', 'info');
      
      if (type === 'PANDEMIC_ALERT') {
        setCurrentEventState({ stage: 'REJECTED', reason: 'Exclusion: Pandemic', ...eventData, progress: 100 });
        addKafkaLog('policy', 'REJECTED: Pandemic exclusion', 'error');
        setTimeout(() => setCurrentEventState(null), 5000);
        return;
      }
      
      setTimeout(() => {
        setCurrentEventState(prev => ({ ...prev, stage: 'CAUSALITY_CHECK', progress: 50 }));
        const causality = calculateCausality(eventData, sensorData);
        if (causality.decision === 'REJECTED') {
          setCurrentEventState({ stage: 'REJECTED', reason: `Causality ${causality.score}%`, ...eventData, progress: 100 });
          setTimeout(() => setCurrentEventState(null), 5000);
          return;
        }
        
        setTimeout(() => {
          setCurrentEventState(prev => ({ ...prev, stage: 'FRAUD_CHECK', progress: 75 }));
          const fraud = runFraudCheck(workerState?.id, eventData);
          if (fraud.status === 'FLAGGED') {
            const claim = { id: Date.now(), ...eventData, fraudScore: fraud.score, status: 'PENDING_REVIEW', workerId: workerState?.id };
            setManualReviewQueue(prev => [...prev, claim]);
            setCurrentEventState({ stage: 'MANUAL_REVIEW', reason: 'Flagged for review', ...eventData, progress: 100 });
            addKafkaLog('fraud', 'High risk detected. Routing to manual review queue.', 'warning');
            return;
          }
          
          setTimeout(() => {
            const targetPayout = getTargetPayout();
            if (targetPayout === 0) {
              setCurrentEventState({ stage: 'REJECTED', reason: '1-Star Probation: No payout eligible', ...eventData, progress: 100 });
              addKafkaLog('payment', `❌ REJECTED: Worker on 1-star probation — payout suspended`, 'error');
              addNotification("Payout Blocked", `Your current star rating (1⭐) is on probation. Improve your delivery rating to unlock payouts.`, "warning");
              setTimeout(() => setCurrentEventState(null), 5000);
              return;
            }
            setCurrentEventState(prev => ({ ...prev, stage: 'PAYOUT_RELEASE', progress: 100 }));
            setWalletBalance(prev => prev + targetPayout);
            setTransactions(prev => [{ id: `TXN-${Date.now()}`, type: 'PAYOUT', amount: targetPayout, starRating: workerState?.starRating ?? 3, status: 'SUCCESS', timestamp: new Date().toISOString() }, ...prev].slice(0, 50));
            if (workerState) setWorkerState(prev => ({ ...prev, walletBalance: prev.walletBalance + targetPayout, payoutsReceived: (prev.payoutsReceived || 0) + 1 }));
            setMetrics(prev => ({ ...prev, totalPayouts: prev.totalPayouts + targetPayout, lossRatio: ((prev.totalPayouts + targetPayout) / (prev.totalPremiumCollected || 1) * 100).toFixed(1) }));
            const starLabel = ['', 'Probation', 'Bronze', 'Silver', 'Gold', 'Platinum'][workerState?.starRating ?? 3];
            addKafkaLog('payment', `✅ PAID: ₹${targetPayout} (${workerState?.starRating ?? 3}⭐ ${starLabel})`, 'success');
            addNotification("Instant Payout", `₹${targetPayout} credited via UPI-Core. (${workerState?.starRating ?? 3}⭐ ${starLabel} rate)`, "success");
            setTimeout(() => setCurrentEventState(null), 5000);

          }, 1500);
        }, 1500);
      }, 1500);
    }, 1500);
  }, [currentEventState, riderCoords, activeCity, sensorData, workerState, calculateCausality, runFraudCheck, addKafkaLog]);

  const checkTriggerConditions = useCallback(() => {
    if (currentEventState) return;
    const { aqi, rainfall, temperature, trafficLatency } = sensorData;
    let triggerType = null, triggerValue = null;
    if (aqi >= thresholds.AQI.critical) { triggerType = 'AQI_CRITICAL'; triggerValue = `AQI: ${aqi}`; }
    else if (rainfall >= thresholds.RAINFALL.heavy) { triggerType = 'HEAVY_RAIN'; triggerValue = `Rain: ${rainfall}mm`; }
    else if (temperature >= thresholds.TEMPERATURE.extreme) { triggerType = 'EXTREME_HEAT'; triggerValue = `Temp: ${temperature}°C`; }
    else if (trafficLatency >= thresholds.TRAFFIC.severe) { triggerType = 'TRAFFIC_SURGE'; triggerValue = `Traffic: ${trafficLatency}x`; }
    if (triggerType) { addKafkaLog('trigger_engine', `Auto: ${triggerType}`, 'warning'); fireTrigger(triggerType, triggerValue); }
  }, [sensorData, currentEventState, thresholds, addKafkaLog, fireTrigger]);


  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        aqi: Math.max(50, Math.min(500, prev.aqi + (Math.random() > 0.5 ? 4 : -4))),
        rainfall: Math.max(0, Math.min(100, prev.rainfall + (Math.random() > 0.8 ? 0.3 : -0.2))),
        temperature: Math.max(20, Math.min(45, prev.temperature + (Math.random() > 0.5 ? 0.2 : -0.2))),
        trafficLatency: Math.max(0.5, Math.min(4, prev.trafficLatency + (Math.random() > 0.6 ? 0.15 : -0.1))),
        visibility: Math.max(1, Math.min(15, prev.visibility + (Math.random() > 0.5 ? 0.2 : -0.2))),
        humidity: Math.max(30, Math.min(95, prev.humidity + (Math.random() > 0.5 ? 0.8 : -0.8))),
        windSpeed: Math.max(0, Math.min(50, prev.windSpeed + (Math.random() > 0.5 ? 0.7 : -0.5))),
        confidence: Math.min(1, Math.max(0.90, prev.confidence + (Math.random() > 0.5 ? 0.002 : -0.002))),
        lastUpdated: new Date().toISOString(),
        multiSource: ['IMD', 'Google Maps', 'Weather.com', 'IoT Sensor Node 4']
      }));
      checkTriggerConditions();
    }, 3000);
    return () => clearInterval(interval);
  }, [checkTriggerConditions]);

  const fetchRealWeather = async (lat, lon) => {
    try {
      const resp = await fetch(
        `http://localhost:5000/api/realtime/weather?lat=${lat}&lon=${lon}`
      );
      if (!resp.ok) throw new Error('Weather API fetch failed');
      const json = await resp.json();
      
      if (json.success && json.weather) {
        const w = json.weather;
        const a = json.aqi;
        setSensorData(prev => ({
          ...prev,
          temperature: w.temperature ?? prev.temperature,
          rainfall: w.precipitation ?? prev.rainfall,
          windSpeed: w.windSpeed ?? prev.windSpeed,
          humidity: w.humidity ?? prev.humidity,
          visibility: w.visibility ?? prev.visibility,
          aqi: a.aqi ?? prev.aqi,
          lastUpdated: new Date().toISOString(),
          multiSource: ['Open-Meteo API', 'Open-Meteo AQI', 'Real-time Backend'],
        }));
        setRealWeatherMode(true);
        addKafkaLog('weather_api', `🌐 Real weather: ${w.temperature}°C, ${w.precipitation}mm rain, AQI: ${a.aqi}`, 'success');
      }
    } catch (e) {
      // Fallback to direct Open-Meteo API
      try {
        const resp = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m&wind_speed_unit=kmh`
        );
        if (!resp.ok) throw new Error('Open-Meteo fetch failed');
        const json = await resp.json();
        const c = json.current;
        setSensorData(prev => ({
          ...prev,
          temperature: c.temperature_2m ?? prev.temperature,
          rainfall: c.precipitation ?? prev.rainfall,
          windSpeed: c.wind_speed_10m ?? prev.windSpeed,
          humidity: c.relative_humidity_2m ?? prev.humidity,
          lastUpdated: new Date().toISOString(),
          multiSource: ['Open-Meteo API Direct', 'IMD', 'IoT Node Grid'],
        }));
        setRealWeatherMode(true);
        addKafkaLog('weather_api', `🌐 Fallback weather: ${c.temperature_2m}°C, ${c.precipitation}mm rain`, 'success');
      } catch (fallbackErr) {
        addKafkaLog('weather_api', `Weather API error: ${e.message}`, 'warning');
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'WORKER') return;
    if ("geolocation" in navigator) {
      const watcher = navigator.geolocation.watchPosition(
        async (pos) => { 
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setRiderCoords([lat, lon]); 
          setLastLocationUpdate(new Date().toISOString()); 
          setGeoError(null); 

          // Real-time geocoding via backend
          try {
            const geoResp = await fetch(
              `http://localhost:5000/api/realtime/geocode?lat=${lat}&lon=${lon}`
            );
            const geoJson = await geoResp.json();
            
            if (geoJson.success && geoJson.location) {
              const city = geoJson.location.city;
              if (city) {
                setActiveCity(city);
                addKafkaLog('location', `📍 Location: ${city} (${lat.toFixed(4)}, ${lon.toFixed(4)})`, 'success');
              }
            }
          } catch(e) {
            // Fallback to direct Nominatim
            try {
              const geoResp = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
                { headers: { 'Accept-Language': 'en', 'User-Agent': 'EarnSure-App/1.0' } }
              );
              const geoJson = await geoResp.json();
              const city = geoJson.address?.city || geoJson.address?.town || geoJson.address?.state_district || geoJson.address?.state;
              if (city) {
                setActiveCity(city);
                addKafkaLog('location', `📍 Fallback geocode: ${city} (${lat.toFixed(4)}, ${lon.toFixed(4)})`, 'success');
              }
            } catch(fallbackErr) {
              addKafkaLog('location', `Geocoding failed, using coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, 'warning');
            }
          }

          // Fetch real weather for this GPS position
          await fetchRealWeather(lat, lon);
        },
        (err) => { 
          setGeoError(err.message); 
          addKafkaLog('location', `GPS Error: ${err.message}`, 'error');
        }, 
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      
      // Also poll real weather every 30s even without movement
      const weatherInterval = setInterval(() => {
        setRiderCoords(prev => { fetchRealWeather(prev[0], prev[1]); return prev; });
      }, 30000);
      
      return () => { 
        navigator.geolocation.clearWatch(watcher); 
        clearInterval(weatherInterval); 
      };
    } else {
      setGeoError('Geolocation not supported');
      addKafkaLog('location', 'Geolocation not supported by browser', 'error');
    }
  }, [isAuthenticated, userRole, addKafkaLog]);

  const loginWithOtp = async (phone, role = 'WORKER') => {
    addKafkaLog('auth', `OTP request for ${phone.slice(-4)}****`, 'info');
    return new Promise((resolve) => {
      setTimeout(() => {
        const sessionId = `SES-${Date.now()}`;
        setUserSession({ id: sessionId, phone, role, loginTime: new Date().toISOString() });
        setIsAuthenticated(true);
        if (role === 'WORKER') {
          // Random star rating 3-5 for demo (in production, fetched from platform API)
          const demoStarRating = Math.floor(3 + Math.random() * 3); // 3, 4 or 5
          const starLabels = { 5: 'Platinum', 4: 'Gold', 3: 'Silver', 2: 'Bronze', 1: 'Probation' };
          setWorkerState({ 
            id: `RD-${Math.floor(1000 + Math.random() * 9000)}`, 
            name: "Rider User", phone, platform: "Zomato", 
            zone: activeCity, walletBalance, weeklyPremium: premiumRate, 
            safetyScore: 98, 
            starRating: demoStarRating,
            starLabel: starLabels[demoStarRating],
            activeDays: Math.floor(10 + Math.random() * 20), 
            payoutsReceived: Math.floor(Math.random() * 10), 
            isOnline: true 
          });
          addKafkaLog('worker', `Worker authenticated: ${sessionId} | Rating: ${demoStarRating}⭐ ${starLabels[demoStarRating]}`, 'success');
        }
        setUserRole(role);
        addKafkaLog('auth', `OTP verified. Role: ${role}`, 'success');
        resolve(true);
      }, 1500);
    });
  };

  const loginAdmin = async () => { setUserSession({ id: `ADM-${Date.now()}`, role: 'ADMIN', loginTime: new Date().toISOString() }); setIsAuthenticated(true); setUserRole('ADMIN'); addKafkaLog('admin', 'Admin session', 'warning'); };
  const loginPartner = async () => { setUserSession({ id: `PRT-${Date.now()}`, role: 'PARTNER', loginTime: new Date().toISOString() }); setIsAuthenticated(true); setUserRole('PARTNER'); addKafkaLog('partner', 'Partner session', 'info'); };
  const logout = () => { addKafkaLog('session', `Logout: ${userSession?.id}`, 'info'); setUserRole(null); setUserSession(null); setIsAuthenticated(false); setWorkerState(null); setCurrentEventState(null); };

  const submitEvidence = useCallback((evidenceData) => {
    const aiConfidence = Math.random(); // Simulated AI scanning
    const dist = currentEventState ? calculateDistance(riderCoords[0], riderCoords[1], currentEventState.lat, currentEventState.lon) : 0;
    const evidence = { id: `EV-${Date.now()}`, ...evidenceData, workerId: workerState?.id, lat: riderCoords[0], lon: riderCoords[1], distance: dist, submittedAt: new Date().toISOString(), status: 'AI_SCANNING', aiConfidence };
    
    setEvidenceUploads(prev => [evidence, ...prev].slice(0, 30));
    addKafkaLog('evidence', `AI Scan Iniciated: Confidence ${(aiConfidence * 100).toFixed(1)}%`, 'info');
    
    setTimeout(() => {
      if (aiConfidence > 0.8) {
        setWalletBalance(prev => prev + targetPayout);
        setTransactions(prev => [{ id: `TXN-${Date.now()}`, type: 'PAYOUT_CLAIM', amount: targetPayout, status: 'SUCCESS', timestamp: new Date().toISOString() }, ...prev].slice(0, 50));
        if (workerState) setWorkerState(prev => ({ ...prev, walletBalance: prev.walletBalance + targetPayout, payoutsReceived: (prev.payoutsReceived || 0) + 1 }));
        setEvidenceUploads(prev => prev.map(e => e.id === evidence.id ? { ...e, status: 'PAID' } : e));
        addKafkaLog('evidence', `✅ AI VALIDATED: ₹${targetPayout} credited instantly`, 'success');
        addNotification("Evidence Validated", `AI high-confidence match! ₹${targetPayout} released.`, "success");
      } else {

        const claim = { id: Date.now(), ...evidence, status: 'PENDING_REVIEW', reason: 'Low AI Confidence Score' };
        setManualReviewQueue(prev => [...prev, claim]);
        setEvidenceUploads(prev => prev.map(e => e.id === evidence.id ? { ...e, status: 'MANUAL_REVIEW' } : e));
        addKafkaLog('evidence', `📋 ROUTED TO HUMAN REVIEW (Confidence: ${(aiConfidence * 100).toFixed(1)}%)`, 'warning');
      }
    }, 2500);
  }, [currentEventState, riderCoords, workerState, addKafkaLog]);

  const handleManualReview = useCallback((claimId, approval) => {
    const claim = manualReviewQueue.find(c => c.id === claimId);
    if (!claim) return;
    if (approval) {
      setWalletBalance(prev => prev + targetPayout);
      setTransactions(prev => [{ id: `TXN-${Date.now()}`, type: 'PAYOUT_MANUAL', amount: targetPayout, status: 'SUCCESS', timestamp: new Date().toISOString() }, ...prev].slice(0, 50));
      if (workerState) setWorkerState(prev => ({ ...prev, walletBalance: prev.walletBalance + targetPayout, payoutsReceived: (prev.payoutsReceived || 0) + 1 }));
      addKafkaLog('review', `✅ ADMIN APPROVED: ₹${targetPayout}`, 'success');
      addNotification("Claim Approved", `Admin has approved your manual evidence. ₹${targetPayout} released.`, "success");
    } else { 
      addKafkaLog('review', `❌ ADMIN REJECTED: Evidence invalid`, 'error'); 
    }
    setManualReviewQueue(prev => prev.filter(c => c.id !== claimId));
    setPastClaims(prev => [...prev, { ...claim, status: approval ? 'PAID' : 'DENIED', reviewedAt: new Date().toISOString() }]);
  }, [manualReviewQueue, workerState, addKafkaLog]);

  const toggleOnlineStatus = useCallback(() => {
    setIsOnline(prev => !prev);
    if (workerState) setWorkerState(prev => ({ ...prev, isOnline: !prev.isOnline }));
    addKafkaLog('status', `Now ${!isOnline ? 'ONLINE' : 'OFFLINE'}`, 'info');
  }, [isOnline, workerState, addKafkaLog]);

  const payPremium = useCallback(() => {
    const amount = premiumDue || premiumRate;
    if (walletBalance >= amount) {
      setWalletBalance(prev => prev - amount);
      setTransactions(prev => [{ id: `TXN-${Date.now()}`, type: 'PREMIUM', amount: amount, status: 'SUCCESS', timestamp: new Date().toISOString() }, ...prev].slice(0, 50));
      setPremiumDue(null);
      addKafkaLog('payment', `Premium ₹${amount} successfully matched from wallet`, 'success');
    } else { addKafkaLog('payment', 'Critical: Insufficient balance for premium coverage', 'error'); }
  }, [walletBalance, premiumDue, premiumRate, addKafkaLog]);

  const changeCity = useCallback((city) => {
    setActiveCity(city);
    if (CITY_COORDS[city]) setRiderCoords([CITY_COORDS[city].lat, CITY_COORDS[city].lon]);
    addKafkaLog('city', `Deployed to region: ${city}`, 'info');
  }, [addKafkaLog]);


  return (
    <SimulationContext.Provider value={{
      userRole, userSession, isAuthenticated, loginWithOtp, loginAdmin, loginPartner, logout,
      activeCity, setActiveCity: changeCity, activeZone, setActiveZone, CITY_COORDS,
      currentEventState, fireTrigger, sensorData, thresholds, setThresholds, realWeatherMode,
      riderCoords, isOnline, toggleOnlineStatus, geoError, lastLocationUpdate,
      workerState, setWorkerState, walletBalance, setWalletBalance, weeklyPremium: premiumRate, payPremium, premiumDue, setPremiumDue, transactions,
      policyState, setPolicyState, MANDATORY_EXCLUSIONS,
      manualReviewQueue, submitEvidence, handleManualReview, pastClaims, evidenceUploads,
      fraudChecks, fraudScore, runFraudCheck, metrics, setMetrics, logs, addKafkaLog, calculateDistance
    }}>

      {children}
    </SimulationContext.Provider>
  );
};