import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { 
  TrendingDown, TrendingUp, AlertTriangle, MapPin, Clock, 
  DollarSign, CloudRain, Wind, Activity, Navigation, CheckCircle 
} from 'lucide-react';

/**
 * EarningsImpactPredictor - UNIQUE KILLER FEATURE
 * 
 * Predicts real-time earnings impact and suggests optimal delivery zones
 * This is what makes EarnSure revolutionary!
 */
const EarningsImpactPredictor = () => {
  const { workerState, riderCoords, isOnline } = useSimulation();
  const socket = useSocket();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch prediction
  const fetchPrediction = async () => {
    if (!workerState || !riderCoords) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.get('http://localhost:5000/api/realtime/predict-impact', {
        params: {
          workerId: workerState.id,
          lat: riderCoords[0],
          lon: riderCoords[1]
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.data.success && response.data.prediction) {
        setPrediction(response.data.prediction);
      } else {
        console.error('Invalid prediction response:', response.data);
        setPrediction(null);
      }
    } catch (error) {
      console.error('Prediction error:', error.message);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPrediction();
  }, [workerState, riderCoords]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchPrediction();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, workerState, riderCoords]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('earnings_prediction', (data) => {
      setPrediction(data);
    });

    socket.on('urgent_alert', (alert) => {
      // Show urgent notification
      console.log('Urgent Alert:', alert);
    });

    return () => {
      socket.off('earnings_prediction');
      socket.off('urgent_alert');
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="earnings-predictor-container">
        <div className="predictor-loading">
          <div className="loading-spinner">
            <Activity className="spinner-icon" size={48} />
          </div>
          <h3>Analyzing Conditions...</h3>
          <p className="loading-message">
            Fetching live weather, AQI, and traffic data for your location
          </p>
          <div className="loading-steps">
            <div className="loading-step">
              <span className="step-icon">🌤️</span>
              <span>Weather forecast</span>
            </div>
            <div className="loading-step">
              <span className="step-icon">🏭</span>
              <span>Air quality index</span>
            </div>
            <div className="loading-step">
              <span className="step-icon">🚦</span>
              <span>Traffic analysis</span>
            </div>
            <div className="loading-step">
              <span className="step-icon">💰</span>
              <span>Earnings calculation</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          .earnings-predictor-container {
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
          }

          .predictor-loading {
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(6, 182, 212, 0.3);
            border-radius: 16px;
            padding: 3rem 2rem;
            text-align: center;
          }

          .loading-spinner {
            margin-bottom: 1.5rem;
          }

          .spinner-icon {
            color: #06b6d4;
            animation: spin 2s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .predictor-loading h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: white;
          }

          .loading-message {
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 2rem;
          }

          .loading-steps {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            max-width: 600px;
            margin: 0 auto;
          }

          .loading-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            background: rgba(6, 182, 212, 0.1);
            border-radius: 8px;
            animation: pulse 2s ease-in-out infinite;
          }

          .loading-step:nth-child(1) { animation-delay: 0s; }
          .loading-step:nth-child(2) { animation-delay: 0.2s; }
          .loading-step:nth-child(3) { animation-delay: 0.4s; }
          .loading-step:nth-child(4) { animation-delay: 0.6s; }

          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }

          .step-icon {
            font-size: 1.5rem;
          }

          .loading-step span:last-child {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.8);
          }
        `}</style>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="earnings-predictor-container">
        <div className="predictor-error">
          <div className="error-icon">
            <AlertTriangle size={48} />
          </div>
          <h3>Unable to Load Prediction</h3>
          <p className="error-message">
            We couldn't analyze your current conditions. This might be due to:
          </p>
          <ul className="error-reasons">
            <li>Backend server not running</li>
            <li>GPS location not available</li>
            <li>Weather API temporarily unavailable</li>
          </ul>
          <div className="error-actions">
            <button className="retry-btn" onClick={fetchPrediction}>
              🔄 Retry Analysis
            </button>
            <button className="manual-btn" onClick={() => window.location.href = '/worker/home'}>
              ← Back to Home
            </button>
          </div>
          <div className="error-help">
            <p><strong>Troubleshooting:</strong></p>
            <ol>
              <li>Ensure backend is running: <code>cd backend && npm start</code></li>
              <li>Check GPS permissions are enabled</li>
              <li>Verify you're online and connected</li>
            </ol>
          </div>
        </div>

        <style jsx>{`
          .earnings-predictor-container {
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
          }

          .predictor-error {
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(239, 68, 68, 0.3);
            border-radius: 16px;
            padding: 3rem 2rem;
            text-align: center;
          }

          .error-icon {
            color: #ef4444;
            margin-bottom: 1.5rem;
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }

          .predictor-error h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: white;
          }

          .error-message {
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 1rem;
          }

          .error-reasons {
            list-style: none;
            padding: 0;
            margin: 1.5rem 0;
            text-align: left;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
          }

          .error-reasons li {
            padding: 0.75rem 1rem;
            background: rgba(239, 68, 68, 0.1);
            border-left: 3px solid #ef4444;
            margin-bottom: 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
          }

          .error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin: 2rem 0;
          }

          .retry-btn, .manual-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }

          .retry-btn {
            background: linear-gradient(135deg, #06b6d4, #3b82f6);
            color: white;
          }

          .retry-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
          }

          .manual-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .manual-btn:hover {
            background: rgba(255, 255, 255, 0.15);
          }

          .error-help {
            margin-top: 2rem;
            padding: 1.5rem;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            text-align: left;
          }

          .error-help p {
            margin-bottom: 0.75rem;
            color: rgba(255, 255, 255, 0.9);
          }

          .error-help ol {
            margin: 0;
            padding-left: 1.5rem;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.875rem;
          }

          .error-help li {
            margin-bottom: 0.5rem;
          }

          .error-help code {
            background: rgba(0, 0, 0, 0.4);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #06b6d4;
          }
        `}</style>
      </div>
    );
  }

  const { currentConditions, impact, recommendations, alternativeZones } = prediction;

  return (
    <div className="earnings-predictor">
      {/* Header */}
      <div className="predictor-header">
        <div className="header-title">
          <Activity size={24} className="pulse-icon" />
          <div>
            <h2>Earnings Impact Predictor</h2>
            <p className="subtitle">AI-powered delivery optimization</p>
          </div>
        </div>
        <button 
          className={`refresh-btn ${autoRefresh ? 'active' : ''}`}
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          {autoRefresh ? '🔄 Auto' : '⏸️ Paused'}
        </button>
      </div>

      {/* Current Impact Card */}
      <div className={`impact-card severity-${impact.current.severity.toLowerCase()}`}>
        <div className="impact-header">
          <div className="impact-score">
            <span className="score-value">{impact.current.impactScore}</span>
            <span className="score-label">Impact Score</span>
          </div>
          <div className="impact-severity">
            <span className={`severity-badge ${impact.current.severity.toLowerCase()}`}>
              {impact.current.severity}
            </span>
          </div>
        </div>

        <div className="earnings-comparison">
          <div className="earnings-item">
            <span className="label">Normal Earnings</span>
            <span className="value">₹{impact.current.earnings.normal}/hr</span>
          </div>
          <TrendingDown className="trend-icon" />
          <div className="earnings-item current">
            <span className="label">Current Expected</span>
            <span className="value">₹{impact.current.earnings.current}/hr</span>
          </div>
        </div>

        <div className="loss-indicator">
          <AlertTriangle size={16} />
          <span>Potential Loss: ₹{impact.current.earnings.loss}/hr ({impact.current.earnings.lossPercentage}%)</span>
        </div>

        {/* Impact Factors */}
        <div className="impact-factors">
          <h4>Impact Factors:</h4>
          <div className="factors-grid">
            {impact.current.factors.map((factor, idx) => (
              <div key={idx} className="factor-chip">
                <span className="factor-name">{factor.type}</span>
                <span className="factor-impact">{factor.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6-Hour Forecast */}
      <div className="forecast-section">
        <h3>
          <Clock size={20} />
          Next 6 Hours Forecast
        </h3>
        <div className="hourly-forecast">
          {impact.next6Hours.map((hour, idx) => (
            <div key={idx} className={`hour-card severity-${hour.severity.toLowerCase()}`}>
              <div className="hour-time">+{hour.hour}h</div>
              <div className="hour-conditions">
                <CloudRain size={16} />
                <span>{hour.precipitation}mm</span>
              </div>
              <div className="hour-temp">
                <Wind size={16} />
                <span>{hour.temperature}°C</span>
              </div>
              <div className="hour-earnings">
                <DollarSign size={16} />
                <span>₹{hour.expectedEarnings}</span>
              </div>
              <div className={`hour-severity ${hour.severity.toLowerCase()}`}>
                {hour.severity}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Impact Summary */}
      <div className="total-impact-summary">
        <h3>6-Hour Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Potential Loss</span>
            <span className="summary-value loss">₹{impact.total.totalEarningsLoss}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avg Impact Score</span>
            <span className="summary-value">{impact.total.avgImpactScore}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Severe Hours</span>
            <span className="summary-value">{impact.total.severeHours}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">High Impact Hours</span>
            <span className="summary-value">{impact.total.highHours}</span>
          </div>
        </div>
        <div className={`overall-recommendation ${impact.total.recommendation.toLowerCase().replace(/_/g, '-')}`}>
          <strong>Recommendation:</strong> {impact.total.recommendation.replace(/_/g, ' ')}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>
            <CheckCircle size={20} />
            Smart Recommendations
          </h3>
          <div className="recommendations-list">
            {recommendations.map((rec, idx) => (
              <div key={idx} className={`recommendation-card priority-${rec.priority.toLowerCase()}`}>
                <div className="rec-icon">{rec.icon}</div>
                <div className="rec-content">
                  <div className="rec-header">
                    <span className="rec-title">{rec.title}</span>
                    <span className={`rec-priority ${rec.priority.toLowerCase()}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="rec-message">{rec.message}</p>
                  <button className="rec-action">{rec.action}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Zones */}
      {alternativeZones && alternativeZones.length > 0 && (
        <div className="alternative-zones-section">
          <h3>
            <MapPin size={20} />
            Better Zones Nearby
          </h3>
          <div className="zones-list">
            {alternativeZones.map((zone, idx) => (
              <div key={idx} className="zone-card">
                <div className="zone-header">
                  <div className="zone-name">
                    <Navigation size={18} />
                    <span>{zone.name}</span>
                  </div>
                  <span className="zone-distance">{zone.distance}km away</span>
                </div>
                <div className="zone-conditions">
                  <div className="condition-item">
                    <CloudRain size={14} />
                    <span>{zone.conditions.precipitation}mm</span>
                  </div>
                  <div className="condition-item">
                    <Wind size={14} />
                    <span>{zone.conditions.temperature}°C</span>
                  </div>
                  <div className="condition-item">
                    <Activity size={14} />
                    <span>AQI {zone.conditions.aqi}</span>
                  </div>
                </div>
                <div className="zone-improvement">
                  <TrendingUp size={16} className="text-green-400" />
                  <span>+₹{zone.improvement.earningsIncrease}/hr</span>
                  <span className="improvement-badge">
                    {zone.improvement.impactReduction}% better
                  </span>
                </div>
                <button 
                  className="zone-navigate"
                  onClick={() => {
                    // Open Google Maps with directions from current location to zone
                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${riderCoords[0]},${riderCoords[1]}&destination=${zone.coordinates.lat},${zone.coordinates.lon}&travelmode=driving`;
                    window.open(mapsUrl, '_blank');
                  }}
                >
                  🗺️ Navigate with Google Maps
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .earnings-predictor {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .predictor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-title h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .subtitle {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .refresh-btn {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn.active {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.5);
        }

        .impact-card {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 2px solid rgba(148, 163, 184, 0.1);
        }

        .impact-card.severity-severe {
          border-color: rgba(239, 68, 68, 0.5);
          background: rgba(239, 68, 68, 0.05);
        }

        .impact-card.severity-high {
          border-color: rgba(251, 146, 60, 0.5);
          background: rgba(251, 146, 60, 0.05);
        }

        .impact-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .impact-score {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .score-value {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1;
        }

        .score-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .severity-badge {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .severity-badge.severe {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .severity-badge.high {
          background: rgba(251, 146, 60, 0.2);
          color: #fb923c;
        }

        .severity-badge.moderate {
          background: rgba(234, 179, 8, 0.2);
          color: #eab308;
        }

        .earnings-comparison {
          display: flex;
          align-items: center;
          justify-content: space-around;
          margin: 1.5rem 0;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
        }

        .earnings-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .earnings-item .label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.25rem;
        }

        .earnings-item .value {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .loss-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
          color: #ef4444;
          font-weight: 600;
          margin-top: 1rem;
        }

        .impact-factors {
          margin-top: 1.5rem;
        }

        .impact-factors h4 {
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .factors-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .factor-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          font-size: 0.75rem;
        }

        .factor-impact {
          color: #fb923c;
          font-weight: 600;
        }

        .forecast-section {
          margin-bottom: 2rem;
        }

        .forecast-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .hourly-forecast {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .hour-card {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid rgba(148, 163, 184, 0.1);
          text-align: center;
        }

        .hour-time {
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .hour-conditions, .hour-temp, .hour-earnings {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          margin: 0.5rem 0;
        }

        .hour-severity {
          margin-top: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 600;
        }

        .hour-severity.severe {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .hour-severity.high {
          background: rgba(251, 146, 60, 0.2);
          color: #fb923c;
        }

        .total-impact-summary {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }

        .summary-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.5rem;
        }

        .summary-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .summary-value.loss {
          color: #ef4444;
        }

        .overall-recommendation {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
        }

        .recommendations-section, .alternative-zones-section {
          margin-bottom: 2rem;
        }

        .recommendations-section h3, .alternative-zones-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .recommendations-list, .zones-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recommendation-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 12px;
          border-left: 4px solid;
        }

        .recommendation-card.priority-urgent {
          border-left-color: #ef4444;
        }

        .recommendation-card.priority-high {
          border-left-color: #fb923c;
        }

        .rec-icon {
          font-size: 2rem;
        }

        .rec-content {
          flex: 1;
        }

        .rec-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .rec-title {
          font-weight: 700;
        }

        .rec-priority {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 600;
        }

        .rec-priority.urgent {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .rec-message {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0.5rem 0;
        }

        .rec-action {
          padding: 0.5rem 1rem;
          background: rgba(6, 182, 212, 0.2);
          border: 1px solid rgba(6, 182, 212, 0.5);
          border-radius: 6px;
          color: #06b6d4;
          cursor: pointer;
          font-weight: 600;
        }

        .zone-card {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .zone-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .zone-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
        }

        .zone-distance {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .zone-conditions {
          display: flex;
          gap: 1rem;
          margin: 0.75rem 0;
        }

        .condition-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
        }

        .zone-improvement {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 8px;
          margin: 0.75rem 0;
        }

        .improvement-badge {
          margin-left: auto;
          padding: 0.25rem 0.5rem;
          background: rgba(16, 185, 129, 0.2);
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #10b981;
        }

        .zone-navigate {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .pulse-icon {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default EarningsImpactPredictor;
