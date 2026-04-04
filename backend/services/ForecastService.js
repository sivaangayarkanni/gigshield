/**
 * ForecastService
 * Calculates potential income loss due to upcoming weather events.
 */
class ForecastService {
  /**
   * Get predicted risk for a worker's specific zone
   * @param {Object} weather - { currentTemp, predictedRain, humidity }
   * @param {Number} avgEearnings - Average daily earnings for the worker
   */
  async calculateEarningsAtRisk(weather, avgEarnings) {
    let riskFactor = 0;

    // 1. Rain Risk (Weighted heavily for delivery workers)
    if (weather.predictedRain > 0.5) riskFactor += 0.4; // 40% loss predicted
    if (weather.predictedRain > 2.0) riskFactor += 0.8; // 80% loss predicted

    // 2. Heat Risk
    if (weather.currentTemp > 40) riskFactor += 0.3; // 30% loss due to mandatory breaks

    // 3. Calculation
    const predictedLoss = avgEarnings * Math.min(riskFactor, 1.0);
    const insuranceCoverage = predictedLoss * 0.9; // GigShield covers 90% of the gap

    return {
      predictedLoss: Math.round(predictedLoss),
      insuranceCoverage: Math.round(insuranceCoverage),
      netRisk: Math.round(predictedLoss - insuranceCoverage),
      riskLevel: riskFactor > 0.7 ? 'SEVERE' : riskFactor > 0.3 ? 'MODERATE' : 'LOW',
      recommendation: riskFactor > 0.7 
        ? "Switch to High-Storm Coverage mode. Payouts are 2x faster today." 
        : "Standard protection active. Stay hydrated!"
    };
  }
}

module.exports = new ForecastService();
