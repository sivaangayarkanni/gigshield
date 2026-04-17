const express = require('express');
const router = express.Router();

/**
 * Real-time API endpoints for live data
 */

// Get real-time weather for a location
router.get('/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const weatherService = req.app.get('weatherService');
    const weather = await weatherService.getWeatherData(parseFloat(lat), parseFloat(lon));
    const aqi = await weatherService.getAQIData(parseFloat(lat), parseFloat(lon));

    res.json({
      success: true,
      weather,
      aqi,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get weather forecast
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const weatherService = req.app.get('weatherService');
    const forecast = await weatherService.getForecast(parseFloat(lat), parseFloat(lon));

    res.json({
      success: true,
      forecast,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get real-time traffic data
router.get('/traffic', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const trafficService = req.app.get('trafficService');
    const traffic = await trafficService.monitorZoneTraffic(parseFloat(lat), parseFloat(lon));

    res.json({
      success: true,
      traffic,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reverse geocode coordinates
router.get('/geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const weatherService = req.app.get('weatherService');
    const location = await weatherService.reverseGeocode(parseFloat(lat), parseFloat(lon));

    res.json({
      success: true,
      location,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start monitoring for a worker
router.post('/monitor/start', async (req, res) => {
  try {
    const { workerId, lat, lon } = req.body;
    
    if (!workerId || !lat || !lon) {
      return res.status(400).json({ error: 'Worker ID, latitude, and longitude required' });
    }

    const payoutEngine = req.app.get('payoutEngine');
    await payoutEngine.startWorkerMonitoring(workerId, parseFloat(lat), parseFloat(lon));

    res.json({
      success: true,
      message: 'Real-time monitoring started',
      workerId,
      location: { lat, lon }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop monitoring for a worker
router.post('/monitor/stop', async (req, res) => {
  try {
    const { workerId } = req.body;
    
    if (!workerId) {
      return res.status(400).json({ error: 'Worker ID required' });
    }

    const payoutEngine = req.app.get('payoutEngine');
    payoutEngine.stopWorkerMonitoring(workerId);

    res.json({
      success: true,
      message: 'Monitoring stopped',
      workerId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monitoring status
router.get('/monitor/status', (req, res) => {
  try {
    const payoutEngine = req.app.get('payoutEngine');
    const status = payoutEngine.getMonitoringStatus();

    res.json({
      success: true,
      activeMonitors: status.length,
      monitors: status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get earnings impact prediction (UNIQUE FEATURE!)
router.get('/predict-impact', async (req, res) => {
  try {
    const { workerId, lat, lon } = req.query;
    
    console.log(`[API] Predict-impact request: workerId=${workerId}, lat=${lat}, lon=${lon}`);
    
    if (!workerId || !lat || !lon) {
      console.error('[API] Missing required parameters');
      return res.status(400).json({ 
        success: false,
        error: 'Worker ID, latitude, and longitude required' 
      });
    }

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      console.error('[API] Invalid coordinates');
      return res.status(400).json({ 
        success: false,
        error: 'Invalid latitude or longitude values' 
      });
    }

    const impactPredictor = req.app.get('impactPredictor');
    
    if (!impactPredictor) {
      console.error('[API] Impact predictor service not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Impact predictor service not available' 
      });
    }

    console.log('[API] Calling predictEarningsImpact...');
    const prediction = await impactPredictor.predictEarningsImpact(
      workerId,
      parsedLat,
      parsedLon
    );

    if (!prediction) {
      console.error('[API] Prediction returned null');
      return res.status(500).json({ 
        success: false,
        error: 'Failed to generate prediction - service returned null' 
      });
    }

    console.log('[API] ✅ Prediction successful');
    res.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] ❌ Predict-impact error:', error.message);
    console.error('[API] Stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Manual trigger test (for demo purposes)
router.post('/trigger/test', async (req, res) => {
  try {
    const { workerId, type, value } = req.body;
    
    if (!workerId || !type) {
      return res.status(400).json({ error: 'Worker ID and trigger type required' });
    }

    const io = req.app.get('socketio');
    io.to(workerId.toString()).emit('trigger_alert', [{
      type,
      value: value || 'TEST',
      severity: 'HIGH',
      message: `Test trigger: ${type}`,
      timestamp: new Date().toISOString()
    }]);

    res.json({
      success: true,
      message: 'Test trigger sent',
      workerId,
      type
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
