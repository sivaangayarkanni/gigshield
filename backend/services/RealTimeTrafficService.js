const axios = require('axios');

/**
 * RealTimeTrafficService
 * Monitors traffic conditions and delivery delays
 */
class RealTimeTrafficService {
  constructor(io) {
    this.io = io;
    this.baselineCache = new Map();
  }

  /**
   * Calculate route distance and duration using OSRM (Open Source Routing Machine)
   */
  async getRouteInfo(startLat, startLon, endLat, endLon) {
    try {
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}`,
        {
          params: {
            overview: 'false',
            steps: 'false'
          }
        }
      );

      if (response.data.code === 'Ok' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        return {
          distance: route.distance / 1000, // Convert to km
          duration: route.duration / 60, // Convert to minutes
          timestamp: new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('OSRM Routing Error:', error.message);
      return null;
    }
  }

  /**
   * Calculate traffic latency multiplier
   * Compares current duration with baseline (off-peak) duration
   */
  async calculateTrafficLatency(startLat, startLon, endLat, endLon) {
    const routeKey = `${startLat.toFixed(3)},${startLon.toFixed(3)}-${endLat.toFixed(3)},${endLon.toFixed(3)}`;
    
    const currentRoute = await this.getRouteInfo(startLat, startLon, endLat, endLon);
    if (!currentRoute) return { latency: 1.0, error: 'Route calculation failed' };

    // Get or set baseline (assume first call or off-peak is baseline)
    let baseline = this.baselineCache.get(routeKey);
    if (!baseline) {
      baseline = currentRoute.duration;
      this.baselineCache.set(routeKey, baseline);
    }

    const latency = currentRoute.duration / baseline;

    return {
      latency: parseFloat(latency.toFixed(2)),
      currentDuration: currentRoute.duration,
      baselineDuration: baseline,
      distance: currentRoute.distance,
      severity: latency >= 3.0 ? 'SEVERE' : latency >= 2.0 ? 'HIGH' : latency >= 1.5 ? 'MODERATE' : 'LOW',
      timestamp: currentRoute.timestamp
    };
  }

  /**
   * Monitor traffic for a specific zone
   * Uses multiple sample routes within the zone
   */
  async monitorZoneTraffic(cityLat, cityLon, radius = 5) {
    console.log(`[TrafficService] Monitoring zone traffic for ${cityLat}, ${cityLon}`);
    
    const samplePoints = this.generateSamplePoints(cityLat, cityLon, radius, 4);
    const latencies = [];

    for (let i = 0; i < samplePoints.length - 1; i++) {
      const start = samplePoints[i];
      const end = samplePoints[i + 1];
      try {
        const result = await this.calculateTrafficLatency(start.lat, start.lon, end.lat, end.lon);
        if (result.latency) {
          latencies.push(result.latency);
        }
      } catch (error) {
        console.warn(`[TrafficService] Failed to get latency for route ${i}:`, error.message);
      }
    }

    if (latencies.length === 0) {
      console.warn('[TrafficService] No traffic data available, using default');
      // Return default values instead of error
      return {
        avgLatency: 1.2,
        samples: 0,
        severity: 'LOW',
        timestamp: new Date().toISOString(),
        note: 'Using default values - traffic API unavailable'
      };
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const result = {
      avgLatency: parseFloat(avgLatency.toFixed(2)),
      samples: latencies.length,
      severity: avgLatency >= 3.0 ? 'SEVERE' : avgLatency >= 2.0 ? 'HIGH' : avgLatency >= 1.5 ? 'MODERATE' : 'LOW',
      timestamp: new Date().toISOString()
    };
    
    console.log('[TrafficService] ✅ Traffic data fetched successfully');
    return result;
  }

  /**
   * Generate sample points around a center for traffic monitoring
   */
  generateSamplePoints(centerLat, centerLon, radiusKm, count) {
    const points = [];
    const radiusDeg = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const lat = centerLat + radiusDeg * Math.cos(angle);
      const lon = centerLon + radiusDeg * Math.sin(angle);
      points.push({ lat, lon });
    }

    return points;
  }

  /**
   * Start real-time traffic monitoring for a worker
   */
  startMonitoring(workerId, lat, lon) {
    const intervalId = setInterval(async () => {
      const traffic = await this.monitorZoneTraffic(lat, lon);

      if (this.io && traffic.avgLatency) {
        this.io.to(workerId.toString()).emit('traffic_update', traffic);

        // Check for severe traffic trigger
        if (traffic.avgLatency >= 3.0) {
          this.io.to(workerId.toString()).emit('trigger_alert', [{
            type: 'TRAFFIC_SURGE',
            value: traffic.avgLatency,
            severity: 'SEVERE',
            message: `Severe traffic congestion: ${traffic.avgLatency}x normal`
          }]);
        }
      }
    }, 60000); // Update every minute

    return intervalId;
  }

  /**
   * Estimate delivery delay based on current traffic
   */
  async estimateDeliveryDelay(pickupLat, pickupLon, dropLat, dropLon) {
    const route = await this.getRouteInfo(pickupLat, pickupLon, dropLat, dropLon);
    if (!route) return null;

    const traffic = await this.calculateTrafficLatency(pickupLat, pickupLon, dropLat, dropLon);
    
    return {
      estimatedTime: route.duration,
      trafficDelay: route.duration - traffic.baselineDuration,
      distance: route.distance,
      latency: traffic.latency,
      severity: traffic.severity
    };
  }
}

module.exports = RealTimeTrafficService;
