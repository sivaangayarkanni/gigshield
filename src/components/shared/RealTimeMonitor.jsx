import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Activity, CloudRain, Wind, Thermometer, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * RealTimeMonitor - Shows live telemetry and trigger status
 */
const RealTimeMonitor = ({ workerId, compact = false }) => {
  const socket = useSocket();
  const [liveData, setLiveData] = useState({
    weather: null,
    aqi: null,
    traffic: null,
    lastUpdate: null
  });
  const [triggers, setTriggers] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    setIsConnected(socket.connected);

    // Connection status
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Weather updates
    socket.on('weather_update', (data) => {
      setLiveData(prev => ({
        ...prev,
        weather: data,
        aqi: data.aqi ? { aqi: data.aqi, ...data.aqiDetails } : prev.aqi,
        lastUpdate: new Date().toISOString()
      }));
    });

    // Traffic updates
    socket.on('traffic_update', (data) => {
      setLiveData(prev => ({
        ...prev,
        traffic: data,
        lastUpdate: new Date().toISOString()
      }));
    });

    // Trigger alerts
    socket.on('trigger_alert', (data) => {
      setTriggers(prev => [...data, ...prev].slice(0, 5));
    });

    // Instant payout
    socket.on('instant_payout', (data) => {
      setPayouts(prev => [data, ...prev].slice(0, 3));
    });

    // Payout rejected
    socket.on('payout_rejected', (data) => {
      setTriggers(prev => [{
        type: 'PAYOUT_REJECTED',
        severity: 'WARNING',
        message: data.reason,
        timestamp: new Date().toISOString()
      }, ...prev].slice(0, 5));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('weather_update');
      socket.off('traffic_update');
      socket.off('trigger_alert');
      socket.off('instant_payout');
      socket.off('payout_rejected');
    };
  }, [socket]);

  if (compact) {
    return (
      <div className="real-time-monitor-compact">
        <div className="status-indicator">
          <Activity 
            size={16} 
            className={isConnected ? 'text-green-400 animate-pulse' : 'text-gray-400'} 
          />
          <span className="text-xs ml-1">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
        {liveData.weather && (
          <div className="live-stats">
            <span className="stat">
              <Thermometer size={14} />
              {liveData.weather.temperature}°C
            </span>
            <span className="stat">
              <CloudRain size={14} />
              {liveData.weather.precipitation}mm
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="real-time-monitor">
      <div className="monitor-header">
        <div className="flex items-center gap-2">
          <Activity 
            size={20} 
            className={isConnected ? 'text-green-400 animate-pulse' : 'text-gray-400'} 
          />
          <h3 className="text-lg font-semibold">Real-Time Telemetry</h3>
        </div>
        {liveData.lastUpdate && (
          <span className="text-xs text-gray-400">
            Updated {new Date(liveData.lastUpdate).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Live Data Grid */}
      {liveData.weather && (
        <div className="telemetry-grid">
          <div className="telemetry-card">
            <Thermometer className="icon text-orange-400" />
            <div className="data">
              <span className="value">{liveData.weather.temperature}°C</span>
              <span className="label">Temperature</span>
            </div>
          </div>

          <div className="telemetry-card">
            <CloudRain className="icon text-blue-400" />
            <div className="data">
              <span className="value">{liveData.weather.precipitation}mm</span>
              <span className="label">Rainfall</span>
            </div>
          </div>

          <div className="telemetry-card">
            <Wind className="icon text-cyan-400" />
            <div className="data">
              <span className="value">{liveData.weather.windSpeed} km/h</span>
              <span className="label">Wind Speed</span>
            </div>
          </div>

          {liveData.aqi && (
            <div className="telemetry-card">
              <AlertTriangle className={`icon ${liveData.aqi.aqi > 200 ? 'text-red-400' : 'text-yellow-400'}`} />
              <div className="data">
                <span className="value">{liveData.aqi.aqi}</span>
                <span className="label">AQI</span>
              </div>
            </div>
          )}

          {liveData.traffic && (
            <div className="telemetry-card">
              <Activity className="icon text-purple-400" />
              <div className="data">
                <span className="value">{liveData.traffic.avgLatency}x</span>
                <span className="label">Traffic</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Triggers */}
      {triggers.length > 0 && (
        <div className="triggers-section">
          <h4 className="text-sm font-semibold mb-2">Active Triggers</h4>
          <div className="triggers-list">
            {triggers.map((trigger, idx) => (
              <div 
                key={idx} 
                className={`trigger-item severity-${trigger.severity?.toLowerCase()}`}
              >
                <AlertTriangle size={16} />
                <div className="trigger-info">
                  <span className="trigger-type">{trigger.type}</span>
                  <span className="trigger-message">{trigger.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Payouts */}
      {payouts.length > 0 && (
        <div className="payouts-section">
          <h4 className="text-sm font-semibold mb-2">Recent Payouts</h4>
          <div className="payouts-list">
            {payouts.map((payout, idx) => (
              <div key={idx} className="payout-item">
                <CheckCircle size={16} className="text-green-400" />
                <div className="payout-info">
                  <span className="payout-amount">₹{payout.amount}</span>
                  <span className="payout-reason">
                    {payout.starRating}⭐ {payout.starLabel} - {payout.trigger}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .real-time-monitor {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .monitor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .telemetry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .telemetry-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .telemetry-card .icon {
          width: 24px;
          height: 24px;
        }

        .telemetry-card .data {
          display: flex;
          flex-direction: column;
        }

        .telemetry-card .value {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
        }

        .telemetry-card .label {
          font-size: 0.75rem;
          color: rgba(148, 163, 184, 0.8);
        }

        .triggers-section,
        .payouts-section {
          margin-top: 1.5rem;
        }

        .triggers-list,
        .payouts-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .trigger-item,
        .payout-item {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 6px;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .trigger-item.severity-severe {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.1);
        }

        .trigger-item.severity-high {
          border-color: rgba(251, 146, 60, 0.3);
          background: rgba(251, 146, 60, 0.1);
        }

        .trigger-info,
        .payout-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .trigger-type,
        .payout-amount {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
        }

        .trigger-message,
        .payout-reason {
          font-size: 0.75rem;
          color: rgba(148, 163, 184, 0.8);
        }

        .real-time-monitor-compact {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
        }

        .live-stats {
          display: flex;
          gap: 1rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default RealTimeMonitor;
