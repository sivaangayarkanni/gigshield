import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import NationalRiskMap from '../shared/NationalRiskMap';
import LiveLocationDisplay from '../shared/LiveLocationDisplay';
import './HomeTab.css';

const HomeTab = () => {
  const navigate = useNavigate();
  const { 
    currentEventState, 
    sensorData, 
    workerState,
    walletBalance,
    isOnline,
    toggleOnlineStatus,
    activeCity,
    fireTrigger,
    realWeatherMode,
    policyState,
    MANDATORY_EXCLUSIONS
  } = useSimulation();

  const getRiskLevel = () => {
    if (sensorData.aqi > 300 || sensorData.rainfall > 50 || sensorData.temperature > 42) {
      return { level: 'HIGH', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.15)' };
    }
    if (sensorData.aqi > 200 || sensorData.rainfall > 30 || sensorData.temperature > 38) {
      return { level: 'MODERATE', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.15)' };
    }
    return { level: 'LOW', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
  };

  const risk = getRiskLevel();

  const getStageDisplay = () => {
    if (!currentEventState) return null;
    
    const stages = {
      'TRIGGER_ACTIVE': { label: 'Trigger Detected', color: 'warning', icon: '⚡' },
      'POLICY_CHECK': { label: 'Checking Policy...', color: 'info', icon: '📋' },
      'CAUSALITY_CHECK': { label: 'Validating Causality...', color: 'info', icon: '🧠' },
      'FRAUD_CHECK': { label: 'Fraud Detection...', color: 'info', icon: '🔍' },
      'PAYOUT_RELEASE': { label: 'Payout Processing...', color: 'success', icon: '💰' },
      'REJECTED': { label: 'Claim Rejected', color: 'danger', icon: '❌' },
      'MANUAL_REVIEW': { label: 'Manual Review', color: 'warning', icon: '👤' }
    };
    
    return stages[currentEventState.stage] || null;
  };

  const stageInfo = getStageDisplay();

  return (
    <div className="home-tab-root">
      <div className="home-grid">
        <div className="main-panel">
          <div className="balance-card">
            <div className="balance-header">
              <div>
                <span className="balance-label">Wallet Balance</span>
                {/* Star Rating Badge */}
                {workerState?.starRating && (
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                      {Array.from({ length: workerState.starRating }).map((_, i) => (
                        <span key={i} style={{ color: workerState.starRating >= 4 ? '#F59E0B' : workerState.starRating === 3 ? '#94A3B8' : '#CD7C41', fontSize: '14px' }}>★</span>
                      ))}
                      {Array.from({ length: 5 - workerState.starRating }).map((_, i) => (
                        <span key={i} style={{ color: '#1E293B', fontSize: '14px' }}>★</span>
                      ))}
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em',
                      color: workerState.starRating === 5 ? '#F59E0B' : workerState.starRating === 4 ? '#FBBF24' : '#94A3B8',
                      padding: '2px 8px',
                      border: `1px solid ${workerState.starRating >= 4 ? '#F59E0B30' : '#94A3B820'}`,
                      borderRadius: '4px',
                    }}>{workerState.starLabel} Rider</span>
                  </div>
                )}
                <div className="online-toggle" style={{ marginTop: '8px' }}>
                  <button 
                    className={`status-toggle ${isOnline ? 'online' : 'offline'}`}
                    onClick={toggleOnlineStatus}
                  >
                    <span className="toggle-dot"></span>
                    {isOnline ? 'Online' : 'Offline'}
                  </button>
                </div>
              </div>
              <span className={`policy-badge ${policyState.active ? 'active' : 'inactive'}`}>
                {policyState.active ? '🛡️ Covered' : '⚠️ Uncovered'}
              </span>
            </div>
            <div className="balance-amount">
              <span className="currency">₹</span>
              <span className="value">{walletBalance.toLocaleString()}</span>
            </div>
            <div className="bank-account-info" style={{ marginTop: '15px', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '12px', color: '#A1A1AA', display: 'flex', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div>
                  <span style={{ display: 'block', color: 'var(--accent-orange)', fontWeight: 800, letterSpacing: '1px', marginBottom: '2px' }}>STATE BANK OF INDIA</span>
                  <span style={{ letterSpacing: '2px', fontWeight: 600, color: 'white' }}>XXXX-XXXX-1234</span>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', color: 'var(--accent-emerald)', fontWeight: 800, marginBottom: '2px' }}>✔ Auto-Pay Active</span>
                  <span style={{ fontWeight: 600 }}>IFSC: SBIN0001234</span>
               </div>
            </div>
            <div className="balance-footer" style={{ marginTop: '1.5rem' }}>
              <div className="balance-stat">
                <span className="stat-value">{workerState?.payoutsReceived || 0}</span>
                <span className="stat-label">Payouts</span>
              </div>
              <div className="balance-stat">
                <span className="stat-value">₹{((workerState?.payoutsReceived || 0) * (workerState?.starRating ? [0,0,350,500,625,750][workerState.starRating] : 500)).toLocaleString()}</span>
                <span className="stat-label">Total Earned</span>
              </div>
              <div className="balance-stat">
                <span className="stat-value">₹35</span>
                <span className="stat-label">Weekly Premium</span>
              </div>
              <div className="balance-stat">
                <span className="stat-value">{workerState?.activeDays || 0}</span>
                <span className="stat-label">Active Days</span>
              </div>
            </div>
            {/* Payout Tier Info */}
            {workerState?.starRating && (
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', background: 'rgba(249,115,22,0.08)', borderRadius: '8px', border: '1px solid rgba(249,115,22,0.15)', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Your payout per trigger:</span>
                <span style={{ color: 'var(--accent-orange)', fontWeight: 900, fontSize: '1rem' }}>
                  ₹{[0, 0, 350, 500, 625, 750][workerState.starRating]}
                </span>
              </div>
            )}
          </div>

          {stageInfo && (
            <div className={`event-banner ${stageInfo.color}`}>
              <span className="event-icon">{stageInfo.icon}</span>
              <div className="event-content">
                <span className="event-label">{stageInfo.label}</span>
                {currentEventState.type && (
                  <span className="event-type">{currentEventState.type}</span>
                )}
                {currentEventState.reason && (
                  <span className="event-reason">{currentEventState.reason}</span>
                )}
              </div>
              {currentEventState.progress !== undefined && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${currentEventState.progress}%`}}></div>
                </div>
              )}
            </div>
          )}

          <div className="map-card">
            <div className="map-header">
              <div className="map-title-group">
                <span className="map-title">Live Weather Map</span>
                <span className="map-subtitle">{activeCity} • Zone Coverage</span>
              </div>
              <span className="map-status">
                <span className="status-pulse"></span>
                Live
              </span>
            </div>
            <div className="map-container">
              <NationalRiskMap height="400px" showRider={true} />
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-header">
              <span className="telemetry-title">Real-time Telemetry</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {realWeatherMode ? (
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#10B981', padding: '2px 8px', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '4px' }}>📡 LIVE WEATHER</span>
                ) : (
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', padding: '2px 8px', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '4px' }}>🔄 SIMULATED</span>
                )}
                <span className="live-badge">
                  <span className="live-dot"></span>
                  LIVE
                </span>
              </div>
            </div>
            <div className="telemetry-grid">
              <div className="telemetry-item">
                <div className="telemetry-icon" style={{background: 'linear-gradient(135deg, #F97316, #EA580C)'}}>🌫️</div>
                <div className="telemetry-data">
                  <span className="telemetry-value" style={{color: sensorData.aqi > 250 ? '#F97316' : '#F8FAFC'}}>
                    {sensorData.aqi}
                  </span>
                  <span className="telemetry-label">AQI Index</span>
                  <span className="telemetry-status">{sensorData.aqi > 300 ? 'Critical' : sensorData.aqi > 200 ? 'Poor' : 'Normal'}</span>
                </div>
                <div className="telemetry-bar">
                  <div className="bar-fill" style={{width: `${(sensorData.aqi / 500) * 100}%`, background: sensorData.aqi > 250 ? '#F97316' : '#10B981'}}></div>
                </div>
              </div>
              
              <div className="telemetry-item">
                <div className="telemetry-icon" style={{background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)'}}>🌧️</div>
                <div className="telemetry-data">
                  <span className="telemetry-value">{sensorData.rainfall.toFixed(1)}</span>
                  <span className="telemetry-label">Rain mm/hr</span>
                  <span className="telemetry-status">{sensorData.rainfall > 50 ? 'Heavy' : sensorData.rainfall > 10 ? 'Light' : 'None'}</span>
                </div>
                <div className="telemetry-bar">
                  <div className="bar-fill" style={{width: `${Math.min(sensorData.rainfall, 100)}%`, background: '#3B82F6'}}></div>
                </div>
              </div>
              
              <div className="telemetry-item">
                <div className="telemetry-icon" style={{background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)'}}>🔥</div>
                <div className="telemetry-data">
                  <span className="telemetry-value">{sensorData.temperature.toFixed(0)}°</span>
                  <span className="telemetry-label">Temperature</span>
                  <span className="telemetry-status">{sensorData.temperature > 42 ? 'Extreme' : sensorData.temperature > 38 ? 'High' : 'Normal'}</span>
                </div>
                <div className="telemetry-bar">
                  <div className="bar-fill" style={{width: `${(sensorData.temperature / 50) * 100}%`, background: sensorData.temperature > 40 ? '#F97316' : '#10B981'}}></div>
                </div>
              </div>

              <div className="telemetry-item">
                <div className="telemetry-icon" style={{background: 'linear-gradient(135deg, #EC4899, #BE185D)'}}>🚦</div>
                <div className="telemetry-data">
                  <span className="telemetry-value">{sensorData.trafficLatency.toFixed(1)}x</span>
                  <span className="telemetry-label">Traffic Factor</span>
                  <span className="telemetry-status">{sensorData.trafficLatency > 2 ? 'Congested' : sensorData.trafficLatency > 1 ? 'Moderate' : 'Clear'}</span>
                </div>
                <div className="telemetry-bar">
                  <div className="bar-fill" style={{width: `${Math.min(sensorData.trafficLatency * 25, 100)}%`, background: sensorData.trafficLatency > 2 ? '#EC4899' : '#10B981'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="side-panel">
          <div className="risk-card">
            <div className="risk-header">
              <span className="risk-title">Risk Level</span>
            </div>
            <div className="risk-display" style={{background: risk.bg, borderColor: risk.color}}>
              <span className="risk-level" style={{color: risk.color}}>{risk.level}</span>
              <span className="risk-desc">
                {sensorData.aqi > 250 ? 'Poor air quality' : sensorData.rainfall > 10 ? 'Rain expected' : 'Conditions normal'}
              </span>
            </div>
          </div>

          <LiveLocationDisplay />

          <div className="triggers-card">
            <div className="triggers-header">
              <span className="triggers-title">Active Triggers</span>
            </div>
            <div className="triggers-list">
              <div className={`trigger-item ${sensorData.aqi > 300 ? 'active' : ''}`}>
                <span className="trigger-icon">🌫️</span>
                <span className="trigger-name">AQI &gt; 300</span>
                <span className={`trigger-status ${sensorData.aqi > 300 ? 'on' : 'off'}`}>
                  {sensorData.aqi > 300 ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className={`trigger-item ${sensorData.rainfall > 50 ? 'active' : ''}`}>
                <span className="trigger-icon">🌧️</span>
                <span className="trigger-name">Rain &gt; 50mm</span>
                <span className={`trigger-status ${sensorData.rainfall > 50 ? 'on' : 'off'}`}>
                  {sensorData.rainfall > 50 ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className={`trigger-item ${sensorData.temperature > 42 ? 'active' : ''}`}>
                <span className="trigger-icon">🔥</span>
                <span className="trigger-name">Heat &gt; 42°C</span>
                <span className={`trigger-status ${sensorData.temperature > 42 ? 'on' : 'off'}`}>
                  {sensorData.temperature > 42 ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className={`trigger-item ${sensorData.trafficLatency > 2 ? 'active' : ''}`}>
                <span className="trigger-icon">🚧</span>
                <span className="trigger-name">Traffic Surge</span>
                <span className={`trigger-status ${sensorData.trafficLatency > 2 ? 'on' : 'off'}`}>
                  {sensorData.trafficLatency > 2 ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>

          <div className="exclusions-card">
            <div className="exclusions-header">
              <span className="exclusions-title">⚠️ Policy Exclusions</span>
            </div>
            <div className="exclusions-list">
              {MANDATORY_EXCLUSIONS.slice(0, 4).map((exclusion, i) => (
                <div key={i} className="exclusion-item">{exclusion}</div>
              ))}
            </div>
          </div>

        <div className="quick-actions-card">
            <div className="quick-actions-header">
              <span className="quick-title">Quick Actions</span>
            </div>
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={() => navigate('/worker/proof')}>
                <span className="action-icon">💰</span>
                <span>History</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/worker/policy')}>
                <span className="action-icon">🛡️</span>
                <span>Policy</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/worker/proof')}>
                <span className="action-icon">📋</span>
                <span>Evidence</span>
              </button>
              <button className="quick-action-btn" onClick={() => fireTrigger('HEAVY_RAIN', 'Rain: 85mm')} style={{ border: '1px solid var(--accent-magenta)' }}>
                <span className="action-icon">⛈️</span>
                <span style={{ color: 'var(--accent-magenta)' }}>Simulate Storm</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;