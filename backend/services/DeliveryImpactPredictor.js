const axios = require('axios');

/**
 * DeliveryImpactPredictor - UNIQUE FEATURE
 * 
 * Predicts real-time earnings impact and suggests optimal delivery zones
 * based on weather, AQI, traffic, and historical delivery data.
 * 
 * This is the killer feature that makes EarnSure unique!
 */
class DeliveryImpactPredictor {
  constructor(weatherService, trafficService, io) {
    this.weatherService = weatherService;
    this.trafficService = trafficService;
    this.io = io;
    
    // Historical delivery data (in production, this would be from platform APIs)
    this.deliveryMetrics = {
      avgOrdersPerHour: {
        normal: 3.5,
        rain: 2.1,
        heavyRain: 1.2,
        highAQI: 2.8,
        extremeHeat: 2.3,
        highTraffic: 2.0
      },
      avgEarningsPerOrder: {
        normal: 45,
        rain: 55,
        heavyRain: 70,
        highAQI: 50,
        extremeHeat: 48,
        highTraffic: 42
      },
      deliveryTimeMultiplier: {
        normal: 1.0,
        rain: 1.3,
        heavyRain: 1.8,
        highAQI: 1.1,
        extremeHeat: 1.2,
        highTraffic: 1.6
      }
    };
  }

  /**
   * Predict earnings impact for next 6 hours
   */
  async predictEarningsImpact(workerId, lat, lon) {
    console.log(`[DeliveryImpactPredictor] Starting prediction for worker ${workerId} at ${lat}, ${lon}`);
    
    try {
      // Validate inputs
      if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        throw new Error(`Invalid coordinates: lat=${lat}, lon=${lon}`);
      }

      // Get current and forecast data with individual error handling
      console.log('[DeliveryImpactPredictor] Fetching weather data...');
      const weather = await this.weatherService.getWeatherData(lat, lon);
      if (!weather) throw new Error('Weather data unavailable');
      
      console.log('[DeliveryImpactPredictor] Fetching AQI data...');
      const aqi = await this.weatherService.getAQIData(lat, lon);
      if (!aqi) throw new Error('AQI data unavailable');
      
      console.log('[DeliveryImpactPredictor] Fetching traffic data...');
      const traffic = await this.trafficService.monitorZoneTraffic(lat, lon);
      if (!traffic) throw new Error('Traffic data unavailable');
      
      console.log('[DeliveryImpactPredictor] Fetching forecast data...');
      const forecast = await this.weatherService.getForecast(lat, lon);
      if (!forecast || !forecast.hourly) throw new Error('Forecast data unavailable');

      console.log('[DeliveryImpactPredictor] Analyzing current conditions...');
      // Analyze current conditions
      const currentImpact = this.analyzeCurrentConditions(weather, aqi, traffic);
      
      console.log('[DeliveryImpactPredictor] Predicting hourly impact...');
      // Predict next 6 hours
      const hourlyPredictions = this.predictHourlyImpact(forecast, aqi, traffic);
      
      console.log('[DeliveryImpactPredictor] Calculating total impact...');
      // Calculate total impact
      const totalImpact = this.calculateTotalImpact(currentImpact, hourlyPredictions);
      
      console.log('[DeliveryImpactPredictor] Generating recommendations...');
      // Generate recommendations
      const recommendations = this.generateRecommendations(currentImpact, hourlyPredictions, lat, lon);
      
      console.log('[DeliveryImpactPredictor] Finding alternative zones...');
      // Find alternative zones (non-blocking)
      let alternativeZones = [];
      try {
        alternativeZones = await Promise.race([
          this.findBetterZones(lat, lon, currentImpact),
          new Promise((resolve) => setTimeout(() => resolve([]), 5000)) // 5s timeout
        ]);
      } catch (zoneError) {
        console.warn('[DeliveryImpactPredictor] Alternative zones failed:', zoneError.message);
      }

      const result = {
        currentConditions: {
          weather: {
            temperature: weather.temperature,
            precipitation: weather.precipitation,
            windSpeed: weather.windSpeed
          },
          aqi: aqi.aqi,
          traffic: traffic.avgLatency,
          severity: currentImpact.severity
        },
        impact: {
          current: currentImpact,
          next6Hours: hourlyPredictions,
          total: totalImpact
        },
        recommendations,
        alternativeZones,
        timestamp: new Date().toISOString()
      };

      console.log('[DeliveryImpactPredictor] ✅ Prediction completed successfully');
      return result;
    } catch (error) {
      console.error('[DeliveryImpactPredictor] ❌ Error:', error.message);
      console.error('[DeliveryImpactPredictor] Stack:', error.stack);
      throw error; // Re-throw to let route handler deal with it
    }
  }

  /**
   * Analyze current conditions and calculate impact
   */
  analyzeCurrentConditions(weather, aqi, traffic) {
    let condition = 'normal';
    let impactScore = 0;
    let factors = [];

    // Weather impact
    if (weather.precipitation >= 50) {
      condition = 'heavyRain';
      impactScore += 70;
      factors.push({ type: 'Heavy Rain', impact: 'Severe', score: 70 });
    } else if (weather.precipitation >= 10) {
      condition = 'rain';
      impactScore += 40;
      factors.push({ type: 'Rain', impact: 'Moderate', score: 40 });
    }

    // AQI impact
    if (aqi.aqi >= 300) {
      impactScore += 60;
      factors.push({ type: 'Critical AQI', impact: 'Severe', score: 60 });
    } else if (aqi.aqi >= 200) {
      impactScore += 30;
      factors.push({ type: 'High AQI', impact: 'Moderate', score: 30 });
    }

    // Temperature impact
    if (weather.temperature >= 42) {
      impactScore += 50;
      factors.push({ type: 'Extreme Heat', impact: 'High', score: 50 });
    } else if (weather.temperature >= 38) {
      impactScore += 25;
      factors.push({ type: 'High Heat', impact: 'Moderate', score: 25 });
    }

    // Traffic impact
    if (traffic.avgLatency >= 3.0) {
      impactScore += 55;
      factors.push({ type: 'Severe Traffic', impact: 'High', score: 55 });
    } else if (traffic.avgLatency >= 2.0) {
      impactScore += 30;
      factors.push({ type: 'Heavy Traffic', impact: 'Moderate', score: 30 });
    }

    // Calculate earnings impact
    const ordersPerHour = this.deliveryMetrics.avgOrdersPerHour[condition] || this.deliveryMetrics.avgOrdersPerHour.normal;
    const earningsPerOrder = this.deliveryMetrics.avgEarningsPerOrder[condition] || this.deliveryMetrics.avgEarningsPerOrder.normal;
    const normalEarnings = this.deliveryMetrics.avgOrdersPerHour.normal * this.deliveryMetrics.avgEarningsPerOrder.normal;
    const currentEarnings = ordersPerHour * earningsPerOrder;
    const earningsLoss = normalEarnings - currentEarnings;
    const lossPercentage = (earningsLoss / normalEarnings) * 100;

    return {
      condition,
      impactScore: Math.min(100, impactScore),
      severity: impactScore >= 70 ? 'SEVERE' : impactScore >= 40 ? 'HIGH' : impactScore >= 20 ? 'MODERATE' : 'LOW',
      factors,
      earnings: {
        normal: Math.round(normalEarnings),
        current: Math.round(currentEarnings),
        loss: Math.round(earningsLoss),
        lossPercentage: Math.round(lossPercentage)
      },
      deliveryMetrics: {
        ordersPerHour: ordersPerHour.toFixed(1),
        avgEarningsPerOrder: Math.round(earningsPerOrder),
        deliveryTime: `${Math.round(25 * (this.deliveryMetrics.deliveryTimeMultiplier[condition] || 1))} min`
      }
    };
  }

  /**
   * Predict hourly impact for next 6 hours
   */
  predictHourlyImpact(forecast, currentAqi, currentTraffic) {
    if (!forecast || !forecast.hourly) return [];

    const predictions = [];
    const hours = Math.min(6, forecast.hourly.time.length);

    for (let i = 0; i < hours; i++) {
      const temp = forecast.hourly.temperature_2m[i];
      const precip = forecast.hourly.precipitation[i];
      const precipProb = forecast.hourly.precipitation_probability ? forecast.hourly.precipitation_probability[i] : 0;

      let condition = 'normal';
      let impactScore = 0;

      if (precip >= 50) {
        condition = 'heavyRain';
        impactScore = 70;
      } else if (precip >= 10) {
        condition = 'rain';
        impactScore = 40;
      }

      if (temp >= 42) impactScore += 50;
      else if (temp >= 38) impactScore += 25;

      // Assume AQI and traffic remain similar (in production, would forecast these too)
      if (currentAqi.aqi >= 300) impactScore += 60;
      else if (currentAqi.aqi >= 200) impactScore += 30;

      const ordersPerHour = this.deliveryMetrics.avgOrdersPerHour[condition] || this.deliveryMetrics.avgOrdersPerHour.normal;
      const earningsPerOrder = this.deliveryMetrics.avgEarningsPerOrder[condition] || this.deliveryMetrics.avgEarningsPerOrder.normal;
      const expectedEarnings = ordersPerHour * earningsPerOrder;

      predictions.push({
        hour: i + 1,
        time: forecast.hourly.time[i],
        temperature: temp,
        precipitation: precip,
        precipitationProbability: precipProb,
        condition,
        impactScore: Math.min(100, impactScore),
        severity: impactScore >= 70 ? 'SEVERE' : impactScore >= 40 ? 'HIGH' : impactScore >= 20 ? 'MODERATE' : 'LOW',
        expectedEarnings: Math.round(expectedEarnings),
        ordersPerHour: ordersPerHour.toFixed(1)
      });
    }

    return predictions;
  }

  /**
   * Calculate total impact summary
   */
  calculateTotalImpact(currentImpact, hourlyPredictions) {
    const totalLoss = currentImpact.earnings.loss + 
      hourlyPredictions.reduce((sum, h) => sum + (this.deliveryMetrics.avgOrdersPerHour.normal * this.deliveryMetrics.avgEarningsPerOrder.normal - h.expectedEarnings), 0);

    const avgImpactScore = (currentImpact.impactScore + 
      hourlyPredictions.reduce((sum, h) => sum + h.impactScore, 0)) / (hourlyPredictions.length + 1);

    const severeHours = hourlyPredictions.filter(h => h.severity === 'SEVERE').length;
    const highHours = hourlyPredictions.filter(h => h.severity === 'HIGH').length;

    return {
      totalEarningsLoss: Math.round(totalLoss),
      avgImpactScore: Math.round(avgImpactScore),
      overallSeverity: avgImpactScore >= 70 ? 'SEVERE' : avgImpactScore >= 40 ? 'HIGH' : avgImpactScore >= 20 ? 'MODERATE' : 'LOW',
      severeHours,
      highHours,
      recommendation: this.getOverallRecommendation(avgImpactScore, severeHours, highHours)
    };
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(currentImpact, hourlyPredictions, lat, lon) {
    const recommendations = [];

    // Current condition recommendations
    if (currentImpact.severity === 'SEVERE') {
      recommendations.push({
        priority: 'URGENT',
        type: 'SAFETY',
        title: 'Consider Taking Break',
        message: `Severe conditions detected. Your safety is priority. Expected loss: ₹${currentImpact.earnings.loss}/hour. Insurance will cover this.`,
        action: 'View Safe Zones',
        icon: '⚠️'
      });
    }

    // Weather-based recommendations
    const nextSevereHour = hourlyPredictions.find(h => h.severity === 'SEVERE');
    if (nextSevereHour) {
      recommendations.push({
        priority: 'HIGH',
        type: 'TIMING',
        title: `Severe Conditions in ${nextSevereHour.hour} Hour(s)`,
        message: `Heavy disruption expected. Consider completing current orders and taking shelter.`,
        action: 'View Forecast',
        icon: '🌧️'
      });
    }

    // Earnings optimization
    const bestHour = hourlyPredictions.reduce((best, h) => 
      h.expectedEarnings > best.expectedEarnings ? h : best, hourlyPredictions[0]);
    
    if (bestHour && bestHour.expectedEarnings > currentImpact.earnings.current * 1.2) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'OPTIMIZATION',
        title: `Better Conditions in ${bestHour.hour} Hour(s)`,
        message: `Expected earnings: ₹${bestHour.expectedEarnings}/hour (${Math.round((bestHour.expectedEarnings / currentImpact.earnings.current - 1) * 100)}% increase)`,
        action: 'Set Reminder',
        icon: '📈'
      });
    }

    // Insurance recommendations
    if (currentImpact.impactScore >= 60) {
      recommendations.push({
        priority: 'INFO',
        type: 'INSURANCE',
        title: 'Parametric Coverage Active',
        message: `You're protected! If conditions worsen, instant payout will be triggered automatically.`,
        action: 'View Coverage',
        icon: '🛡️'
      });
    }

    return recommendations;
  }

  /**
   * Find alternative zones with better conditions
   */
  async findBetterZones(currentLat, currentLon, currentImpact) {
    // Define nearby zones (5km, 10km, 15km radius)
    const zones = [
      { name: 'North Zone', lat: currentLat + 0.045, lon: currentLon, distance: 5 },
      { name: 'South Zone', lat: currentLat - 0.045, lon: currentLon, distance: 5 },
      { name: 'East Zone', lat: currentLat, lon: currentLon + 0.045, distance: 5 },
      { name: 'West Zone', lat: currentLat, lon: currentLon - 0.045, distance: 5 },
      { name: 'Northeast Zone', lat: currentLat + 0.09, lon: currentLon + 0.09, distance: 10 },
      { name: 'Northwest Zone', lat: currentLat + 0.09, lon: currentLon - 0.09, distance: 10 }
    ];

    const betterZones = [];

    for (const zone of zones) {
      try {
        const weather = await this.weatherService.getWeatherData(zone.lat, zone.lon);
        const aqi = await this.weatherService.getAQIData(zone.lat, zone.lon);
        const traffic = await this.trafficService.monitorZoneTraffic(zone.lat, zone.lon);

        const zoneImpact = this.analyzeCurrentConditions(weather, aqi, traffic);

        // If this zone is significantly better
        if (zoneImpact.impactScore < currentImpact.impactScore - 20) {
          betterZones.push({
            name: zone.name,
            distance: zone.distance,
            coordinates: { lat: zone.lat, lon: zone.lon },
            conditions: {
              temperature: weather.temperature,
              precipitation: weather.precipitation,
              aqi: aqi.aqi,
              traffic: traffic.avgLatency
            },
            impact: {
              score: zoneImpact.impactScore,
              severity: zoneImpact.severity,
              expectedEarnings: zoneImpact.earnings.current
            },
            improvement: {
              earningsIncrease: zoneImpact.earnings.current - currentImpact.earnings.current,
              impactReduction: currentImpact.impactScore - zoneImpact.impactScore
            }
          });
        }
      } catch (error) {
        console.error(`Error checking zone ${zone.name}:`, error.message);
      }
    }

    // Sort by improvement
    betterZones.sort((a, b) => b.improvement.earningsIncrease - a.improvement.earningsIncrease);

    return betterZones.slice(0, 3); // Return top 3
  }

  /**
   * Get overall recommendation
   */
  getOverallRecommendation(avgImpactScore, severeHours, highHours) {
    if (avgImpactScore >= 70 || severeHours >= 2) {
      return 'AVOID_DELIVERY';
    } else if (avgImpactScore >= 50 || highHours >= 3) {
      return 'PROCEED_WITH_CAUTION';
    } else if (avgImpactScore >= 30) {
      return 'MONITOR_CONDITIONS';
    } else {
      return 'OPTIMAL_CONDITIONS';
    }
  }

  /**
   * Start real-time monitoring for a worker
   */
  startMonitoring(workerId, lat, lon) {
    const intervalId = setInterval(async () => {
      const prediction = await this.predictEarningsImpact(workerId, lat, lon);
      
      if (prediction && this.io) {
        this.io.to(workerId.toString()).emit('earnings_prediction', prediction);

        // Send urgent alerts
        if (prediction.impact.current.severity === 'SEVERE') {
          this.io.to(workerId.toString()).emit('urgent_alert', {
            type: 'SEVERE_CONDITIONS',
            message: `Severe conditions detected! Expected loss: ₹${prediction.impact.current.earnings.loss}/hour`,
            recommendations: prediction.recommendations
          });
        }
      }
    }, 300000); // Every 5 minutes

    return intervalId;
  }
}

module.exports = DeliveryImpactPredictor;
