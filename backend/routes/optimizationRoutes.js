const express = require('express');
const router = express.Router();

/**
 * POST /api/optimization/analyze
 * Analyzes earnings potential and provides optimization recommendations
 */
router.post('/analyze', async (req, res) => {
  try {
    const { workerId, lat, lon, baseEarnings = 300 } = req.body;

    if (!workerId || lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        message: 'workerId, lat, and lon are required'
      });
    }

    const earningsOptimizer = req.app.get('earningsOptimizer');
    const result = await earningsOptimizer.optimizeEarnings(
      workerId,
      parseFloat(lat),
      parseFloat(lon),
      baseEarnings
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Optimization error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/optimization/start-monitoring
 * Starts continuous earnings monitoring for a worker
 */
router.post('/start-monitoring', async (req, res) => {
  try {
    const { workerId, lat, lon, baseEarnings = 300 } = req.body;

    if (!workerId || lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        message: 'workerId, lat, and lon are required'
      });
    }

    const earningsOptimizer = req.app.get('earningsOptimizer');
    const intervalId = earningsOptimizer.startMonitoring(
      workerId,
      parseFloat(lat),
      parseFloat(lon),
      baseEarnings
    );

    // Store interval ID for later cleanup
    if (!req.app.locals.monitoringIntervals) {
      req.app.locals.monitoringIntervals = {};
    }
    req.app.locals.monitoringIntervals[workerId] = intervalId;

    res.json({
      success: true,
      message: 'Monitoring started',
      workerId,
      updateInterval: '30 seconds'
    });
  } catch (error) {
    console.error('❌ Monitoring start error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/optimization/stop-monitoring
 * Stops earnings monitoring for a worker
 */
router.post('/stop-monitoring', async (req, res) => {
  try {
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        success: false,
        message: 'workerId is required'
      });
    }

    const earningsOptimizer = req.app.get('earningsOptimizer');
    const intervalId = req.app.locals.monitoringIntervals?.[workerId];

    if (intervalId) {
      earningsOptimizer.stopMonitoring(intervalId);
      delete req.app.locals.monitoringIntervals[workerId];
    }

    res.json({
      success: true,
      message: 'Monitoring stopped',
      workerId
    });
  } catch (error) {
    console.error('❌ Monitoring stop error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/optimization/zones
 * Get optimal zones for current location
 */
router.get('/zones', async (req, res) => {
  try {
    const { lat, lon, baseEarnings = 300 } = req.query;

    if (lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        message: 'lat and lon are required'
      });
    }

    const earningsOptimizer = req.app.get('earningsOptimizer');
    const zones = await earningsOptimizer.findOptimalZones(
      parseFloat(lat),
      parseFloat(lon)
    );

    // Analyze each zone
    const analyzedZones = await Promise.all(
      zones.map(zone => earningsOptimizer.analyzeZone(zone, baseEarnings))
    );

    // Filter out null results and sort by earnings
    const validZones = analyzedZones
      .filter(z => z !== null)
      .sort((a, b) => b.projectedEarnings - a.projectedEarnings)
      .slice(0, 10);

    res.json({
      success: true,
      zones: validZones,
      count: validZones.length
    });
  } catch (error) {
    console.error('❌ Zones error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
