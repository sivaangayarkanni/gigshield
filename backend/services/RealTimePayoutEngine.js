const { userOps, policyOps, claimOps } = require('../database/sqlite');

/**
 * RealTimePayoutEngine
 * Handles instant parametric payouts with fraud detection
 */
class RealTimePayoutEngine {
  constructor(io, weatherService, trafficService) {
    this.io = io;
    this.weatherService = weatherService;
    this.trafficService = trafficService;
    this.activeMonitors = new Map();
  }

  /**
   * Start monitoring for a worker
   */
  async startWorkerMonitoring(workerId, lat, lon) {
    if (this.activeMonitors.has(workerId.toString())) {
      return; // Already monitoring
    }

    console.log(`[PayoutEngine] Starting monitoring for worker ${workerId}`);

    // Start weather and traffic monitoring
    const weatherInterval = this.weatherService.startMonitoring(workerId, lat, lon);
    const trafficInterval = this.trafficService.startMonitoring(workerId, lat, lon);

    // Store interval IDs for cleanup
    this.activeMonitors.set(workerId.toString(), {
      weatherInterval,
      trafficInterval,
      lat,
      lon
    });

    // Start parametric trigger checking
    const triggerInterval = setInterval(async () => {
      await this.checkParametricTriggers(workerId, lat, lon);
    }, 30000); // Check every 30 seconds

    this.activeMonitors.get(workerId.toString()).triggerInterval = triggerInterval;
  }

  /**
   * Stop monitoring for a worker
   */
  stopWorkerMonitoring(workerId) {
    const monitor = this.activeMonitors.get(workerId.toString());
    if (monitor) {
      clearInterval(monitor.weatherInterval);
      clearInterval(monitor.trafficInterval);
      clearInterval(monitor.triggerInterval);
      this.activeMonitors.delete(workerId.toString());
      console.log(`[PayoutEngine] Stopped monitoring for worker ${workerId}`);
    }
  }

  /**
   * Check if parametric triggers are met
   */
  async checkParametricTriggers(workerId, lat, lon) {
    try {
      // Get active policies for this worker
      const policies = policyOps.findActive(workerId);

      if (policies.length === 0) return;

      // Get current conditions
      const weather = await this.weatherService.getWeatherData(lat, lon);
      const aqi = await this.weatherService.getAQIData(lat, lon);
      const traffic = await this.trafficService.monitorZoneTraffic(lat, lon);

      // Check each policy's triggers
      for (const policy of policies) {
        // Get triggers for this policy
        const triggers = policy.triggers || [];
        
        for (const trigger of triggers) {
          const shouldTrigger = this.evaluateTrigger(trigger, weather, aqi, traffic);
          
          if (shouldTrigger) {
            await this.processPayout(workerId, policy, trigger, {
              weather,
              aqi,
              traffic,
              location: { lat, lon }
            });
          }
        }
      }
    } catch (error) {
      console.error('[PayoutEngine] Error checking triggers:', error.message);
    }
  }

  /**
   * Evaluate if a trigger condition is met
   */
  evaluateTrigger(trigger, weather, aqi, traffic) {
    let value;

    switch (trigger.metric) {
      case 'AQI':
        value = aqi.aqi;
        break;
      case 'RAINFALL':
        value = weather.precipitation;
        break;
      case 'TEMPERATURE':
        value = weather.temperature;
        break;
      case 'TRAFFIC_LATENCY':
        value = traffic.avgLatency;
        break;
      default:
        return false;
    }

    switch (trigger.operator) {
      case '>':
        return value > trigger.threshold;
      case '>=':
        return value >= trigger.threshold;
      case '<':
        return value < trigger.threshold;
      case '<=':
        return value <= trigger.threshold;
      case '==':
        return value === trigger.threshold;
      default:
        return false;
    }
  }

  /**
   * Process instant payout
   */
  async processPayout(workerId, policy, trigger, conditions) {
    try {
      // Check if claim already exists for this event (prevent duplicates)
      const recentCount = claimOps.countRecent(workerId, 1);
      const recentClaims = claimOps.findByWorker(workerId);
      const recentClaim = recentClaims.find(c => {
        const createdAt = new Date(c.created_at);
        return Date.now() - createdAt.getTime() < 3600000 && c.trigger_reason && c.trigger_reason.includes(trigger.metric);
      });

      if (recentClaim) {
        console.log(`[PayoutEngine] Duplicate claim prevented for worker ${workerId}`);
        return;
      }

      // Get worker details for star rating
      const worker = userOps.findById(workerId);
      if (!worker) return;

      // Calculate payout based on star rating (SRAP - Smart Rating Adjustment Protocol)
      const starPayoutTable = {
        5: 750,  // Platinum
        4: 625,  // Gold
        3: 500,  // Silver
        2: 350,  // Bronze
        1: 0     // Probation
      };

      const starRating = worker.star_rating || 3;
      const payoutAmount = starPayoutTable[starRating] || policy.coverage_amount;

      // If worker is on probation (1 star), reject payout
      if (starRating === 1) {
        this.io.to(workerId.toString()).emit('payout_rejected', {
          reason: '1-Star Probation: Improve your rating to unlock payouts',
          policy: policy.type,
          trigger: trigger.metric
        });
        return;
      }

      // Run fraud check
      const fraudScore = await this.runFraudCheck(workerId, conditions.location, conditions);

      // Create claim
      const claim = claimOps.create({
        workerId,
        policyId: policy.id,
        status: fraudScore > 70 ? 'PENDING' : 'APPROVED',
        amount: payoutAmount,
        type: 'PARAMETRIC',
        triggerReason: `${trigger.metric} ${trigger.operator} ${trigger.threshold}`,
        gpsLat: conditions.location.lat,
        gpsLng: conditions.location.lon,
        gpsVerified: fraudScore < 70,
        fraudScore,
        payoutDate: fraudScore < 70 ? new Date().toISOString() : null
      });

      if (fraudScore > 70) {
        // Flag for manual review
        this.io.to(workerId.toString()).emit('claim_review', {
          claimId: claim.id,
          reason: 'Flagged for manual review due to high fraud score',
          fraudScore
        });
        console.log(`[PayoutEngine] Claim ${claim.id} flagged for review (Fraud: ${fraudScore})`);
      } else {
        // Instant payout
        userOps.updateWallet(workerId, payoutAmount);

        const starLabel = ['', 'Probation', 'Bronze', 'Silver', 'Gold', 'Platinum'][starRating];

        this.io.to(workerId.toString()).emit('instant_payout', {
          claimId: claim.id,
          amount: payoutAmount,
          starRating,
          starLabel,
          trigger: trigger.metric,
          conditions: {
            aqi: conditions.aqi.aqi,
            rainfall: conditions.weather.precipitation,
            temperature: conditions.weather.temperature,
            traffic: conditions.traffic.avgLatency
          },
          timestamp: new Date().toISOString()
        });

        console.log(`[PayoutEngine] ✅ Instant payout: ₹${payoutAmount} to worker ${workerId} (${starRating}⭐ ${starLabel})`);
      }
    } catch (error) {
      console.error('[PayoutEngine] Payout processing error:', error.message);
    }
  }

  /**
   * Run fraud detection checks - REVOLUTIONARY 7-LAYER SYSTEM
   */
  async runFraudCheck(workerId, location, conditions) {
    try {
      const FraudAnalysis = require('./FraudAnalysis');
      
      // Use comprehensive fraud analysis with all 7 unique methods
      const result = await FraudAnalysis.calculateComprehensiveFraudScore(workerId, {
        lat: location.lat,
        lon: location.lon,
        timestamp: Date.now(),
        weather: {
          temperature: conditions.weather?.temperature,
          precipitation: conditions.weather?.precipitation
        },
        deviceInfo: conditions.deviceInfo || null
      });

      console.log(`[PayoutEngine] Fraud Analysis Complete:`);
      console.log(`  - Score: ${result.fraudScore}/100`);
      console.log(`  - Confidence: ${result.confidence}`);
      console.log(`  - Recommendation: ${result.recommendation}`);
      if (result.checks.length > 0) {
        console.log(`  - Suspicious Checks: ${result.checks.map(c => c.name).join(', ')}`);
      }

      return result.fraudScore;
    } catch (error) {
      console.error('[PayoutEngine] Fraud check error:', error.message);
      return 50; // Default moderate risk
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get monitoring status for all workers
   */
  getMonitoringStatus() {
    const status = [];
    this.activeMonitors.forEach((monitor, workerId) => {
      status.push({
        workerId,
        location: { lat: monitor.lat, lon: monitor.lon },
        active: true
      });
    });
    return status;
  }
}

module.exports = RealTimePayoutEngine;
