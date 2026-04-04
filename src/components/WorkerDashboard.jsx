import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import './WorkerDashboard.css';

const WorkerDashboard = () => {
  const { currentEventState, workerState } = useSimulation();
  const [showExclusions, setShowExclusions] = useState(false);

  const getStageLabel = () => {
    if (!currentEventState) return null;
    const stages = {
      'TRIGGER_ACTIVE': { label: 'Trigger Active', color: 'warning' },
      'POLICY_CHECK': { label: 'Verifying Policy...', color: 'info' },
      'CAUSALITY_CHECK': { label: 'Validating Impact...', color: 'info' },
      'FRAUD_CHECK': { label: 'Security Check...', color: 'info' },
      'PAYOUT_RELEASE': { label: 'Payout Complete!', color: 'success' },
      'REJECTED': { label: 'Ineligible', color: 'danger' }
    };
    return stages[currentEventState.stage];
  };

  const stageInfo = getStageLabel();

  return (
    <div className="worker-app-wrapper">
      <div className="mobile-device">
        <div className="status-bar">
          <span className="time">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="icons">📶 🔋</span>
        </div>

        <div className="app-header-worker">
          <div className="profile-info">
            <div className="avatar">
              {workerState.name?.slice(0, 2).toUpperCase() || 'WK'}
            </div>
            <div className="profile-details">
              <div className="name">{workerState.name || 'Worker'}</div>
              <div className="zone">
                <span className="location-icon">📍</span>
                <span>{workerState.zone || 'Delhi NCR'}</span>
                <span className="platform-badge">{workerState.platform || 'Swiggy'}</span>
              </div>
            </div>
          </div>
          <div className="notification-bell">🔔</div>
        </div>

        <div className="app-content-worker">
          <div className="policy-card">
            <div className="policy-header">
              <div className="policy-brand">
                <span className="logo-text">EarnSure</span>
                <span className="policy-status">Active Cover</span>
              </div>
              <div className={`status-indicator ${workerState.policyActive ? 'active' : 'inactive'}`}>
                <span className="status-dot"></span>
                {workerState.policyActive ? 'Protected' : 'Inactive'}
              </div>
            </div>
            
            <div className="policy-amount">
              <span className="amount-label">Weekly Premium</span>
              <span className="amount-value">₹{workerState.weeklyPremium || 35}</span>
            </div>

            <div className="policy-stats">
              <div className="stat">
                <span className="stat-value">{workerState.activeDays || 12}</span>
                <span className="stat-label">Active Days</span>
              </div>
              <div className="stat">
                <span className="stat-value">₹{(workerState.payoutsReceived || 0) * 500}</span>
                <span className="stat-label">Total Earned</span>
              </div>
              <div className="stat">
                <span className="stat-value">{workerState.payoutsReceived || 0}</span>
                <span className="stat-label">Payouts</span>
              </div>
            </div>

            <div className="exclusion-toggle" onClick={() => setShowExclusions(!showExclusions)}>
              <span className="exclamation">⚠️</span>
              <span>Policy Exclusions</span>
              <span className="toggle-arrow">{showExclusions ? '▲' : '▼'}</span>
            </div>
            
            {showExclusions && (
              <div className="exclusion-list">
                <p>Not covered: War, Terrorism, Pandemic, Illegal activity, Substance abuse, Intentional self-harm, Government lockdowns.</p>
              </div>
            )}
          </div>

          {stageInfo && (
            <div className={`event-banner ${stageInfo.color}`}>
              <div className="event-icon">
                {stageInfo.color === 'success' ? '✓' : stageInfo.color === 'danger' ? '✕' : '⚡'}
              </div>
              <div className="event-content">
                <h4>{stageInfo.label}</h4>
                {currentEventState.stage === 'TRIGGER_ACTIVE' && (
                  <p>Running pre-payout validation...</p>
                )}
                {currentEventState.stage === 'PAYOUT_RELEASE' && (
                  <p>₹500 credited to your UPI</p>
                )}
                {currentEventState.stage === 'REJECTED' && (
                  <p>{currentEventState.reason}</p>
                )}
                {['POLICY_CHECK', 'CAUSALITY_CHECK', 'FRAUD_CHECK'].includes(currentEventState.stage) && (
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="wallet-card">
            <div className="wallet-header">
              <span className="wallet-label">EarnSure Wallet</span>
              <span className="wallet-icon">💳</span>
            </div>
            <div className="wallet-balance">
              <span className="currency">₹</span>
              <span className="amount">{(workerState.walletBalance || 0).toLocaleString()}</span>
            </div>
            <div className="wallet-actions">
              <button className="wallet-btn">History</button>
              <button className="wallet-btn">Link UPI</button>
            </div>
          </div>

          <div className="quick-actions">
            <button className="action-btn">
              <span className="action-icon">🛡️</span>
              <span>My Policy</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📊</span>
              <span>Activity</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">💬</span>
              <span>Support</span>
            </button>
          </div>
        </div>
        
        <div className="bottom-nav">
          <div className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🛡️</span>
            <span>Policy</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">👤</span>
            <span>Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;