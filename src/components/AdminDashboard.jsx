import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { activeCity, setActiveCity, currentEventState, fireTrigger, logs, metrics } = useSimulation();

  return (
    <div className="admin-dashboard-grid">
      <div className="dashboard-card control-panel glass-panel">
        <div className="card-header">
          <div className="card-icon">🎛️</div>
          <h2 className="card-title">System Controls</h2>
        </div>
        
        <div className="control-group">
          <label className="control-label">Active Pool</label>
          <select 
            className="control-select" 
            value={activeCity} 
            onChange={(e) => setActiveCity(e.target.value)}
          >
            <option value="Delhi NCR">Delhi NCR (AQI)</option>
            <option value="Mumbai">Mumbai (Rain)</option>
            <option value="Bangalore">Bangalore (Traffic)</option>
          </select>
        </div>

        <div className="trigger-section">
          <div className="section-label">Trigger Simulation</div>
          <p className="section-desc">Fire parametric events to test the payout flow</p>
          
          <button 
            className="btn btn-trigger primary"
            onClick={() => fireTrigger('AQI_CRITICAL', 'AQI > 350 detected')}
            disabled={!!currentEventState}
          >
            <span className="trigger-icon">🌫️</span>
            <div className="trigger-text">
              <span className="trigger-name">AQI Critical</span>
              <span className="trigger-desc">AQI &gt; 300 in zone</span>
            </div>
          </button>
          
          <button 
            className="btn btn-trigger secondary"
            onClick={() => fireTrigger('PANDEMIC_ALERT', 'WHO Alert', 'EXCLUSION')}
            disabled={!!currentEventState}
          >
            <span className="trigger-icon">🦠</span>
            <div className="trigger-text">
              <span className="trigger-name">Pandemic Alert</span>
              <span className="trigger-desc">Test Exclusion (Reject)</span>
            </div>
          </button>
          
          <button 
            className="btn btn-trigger secondary"
            onClick={() => fireTrigger('MINOR_RAIN', '30mm/hr', 'CAUSALITY')}
            disabled={!!currentEventState}
          >
            <span className="trigger-icon">🌧️</span>
            <div className="trigger-text">
              <span className="trigger-name">Minor Rain</span>
              <span className="trigger-desc">Test Causality Check</span>
            </div>
          </button>
        </div>
      </div>

      <div className="dashboard-card metrics-panel glass-panel">
        <div className="card-header">
          <div className="card-icon">📊</div>
          <h2 className="card-title">Actuarial Metrics</h2>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-label">Active Covers</span>
              <span className="metric-badge success">+12%</span>
            </div>
            <div className="metric-value">{metrics.totalWorkersCovered.toLocaleString()}</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-label">Total Payouts</span>
            </div>
            <div className="metric-value highlight">₹ {(metrics.totalPayouts / 100000).toFixed(1)}L</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-label">Loss Ratio</span>
              <span className={`metric-badge ${metrics.lossRatio > 85 ? 'danger' : 'success'}`}>
                {metrics.lossRatio > 85 ? 'CRITICAL' : 'HEALTHY'}
              </span>
            </div>
            <div className={`metric-value ${metrics.lossRatio > 85 ? 'text-danger' : 'text-success'}`}>
              {metrics.lossRatio.toFixed(1)}%
              {metrics.lossRatio > 85 && <span className="alert-text">Suspend enrollment</span>}
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-label">Burning Cost (BCR)</span>
            </div>
            <div className="metric-value">{metrics.bcr.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-card validation-panel glass-panel">
        <div className="card-header">
          <div className="card-icon">🔄</div>
          <h2 className="card-title">Hybrid Validation Pipeline</h2>
        </div>
        
        <div className="validation-flow">
          {!currentEventState ? (
            <div className="flow-idle">
              <div className="idle-icon">💤</div>
              <p>System Idle</p>
              <span>Waiting for parametric triggers...</span>
            </div>
          ) : (
            <div className="flow-steps">
              <div className={`flow-step ${currentEventState.stage === 'POLICY_CHECK' ? 'active' : ''} ${['CAUSALITY_CHECK','FRAUD_CHECK','PAYOUT_RELEASE'].includes(currentEventState.stage) ? 'done' : ''} ${currentEventState.reason === 'Exclusion Violation' ? 'failed' : ''}`}>
                <div className="step-indicator">
                  {['CAUSALITY_CHECK','FRAUD_CHECK','PAYOUT_RELEASE'].includes(currentEventState.stage) ? '✓' : currentEventState.stage === 'POLICY_CHECK' ? '●' : '1'}
                </div>
                <div className="step-content">
                  <span className="step-title">Policy & Exclusions</span>
                  <span className="step-status">
                    {currentEventState.stage === 'POLICY_CHECK' ? 'Validating...' : currentEventState.reason === 'Exclusion Violation' ? 'Failed' : 'Passed'}
                  </span>
                </div>
              </div>
              
              <div className={`flow-step ${currentEventState.stage === 'CAUSALITY_CHECK' ? 'active' : ''} ${['FRAUD_CHECK','PAYOUT_RELEASE'].includes(currentEventState.stage) ? 'done' : ''} ${currentEventState.reason === 'Failed Causality' ? 'failed' : ''}`}>
                <div className="step-indicator">
                  {['FRAUD_CHECK','PAYOUT_RELEASE'].includes(currentEventState.stage) ? '✓' : currentEventState.stage === 'CAUSALITY_CHECK' ? '●' : '2'}
                </div>
                <div className="step-content">
                  <span className="step-title">Causality Validation</span>
                  <span className="step-status">
                    {currentEventState.stage === 'CAUSALITY_CHECK' ? 'Checking...' : currentEventState.reason === 'Failed Causality' ? 'Failed' : 'Passed'}
                  </span>
                </div>
              </div>
              
              <div className={`flow-step ${currentEventState.stage === 'FRAUD_CHECK' ? 'active' : ''} ${currentEventState.stage === 'PAYOUT_RELEASE' ? 'done' : ''}`}>
                <div className="step-indicator">
                  {currentEventState.stage === 'PAYOUT_RELEASE' ? '✓' : currentEventState.stage === 'FRAUD_CHECK' ? '●' : '3'}
                </div>
                <div className="step-content">
                  <span className="step-title">AI Fraud Check</span>
                  <span className="step-status">
                    {currentEventState.stage === 'FRAUD_CHECK' ? 'Scanning...' : currentEventState.stage === 'PAYOUT_RELEASE' ? 'Passed' : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className={`flow-step ${currentEventState.stage === 'PAYOUT_RELEASE' ? 'done' : ''}`}>
                <div className="step-indicator">
                  {currentEventState.stage === 'PAYOUT_RELEASE' ? '✓' : '4'}
                </div>
                <div className="step-content">
                  <span className="step-title">Payout Release</span>
                  <span className="step-status">
                    {currentEventState.stage === 'PAYOUT_RELEASE' ? '₹500 Sent' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card logs-panel glass-panel">
        <div className="card-header">
          <div className="card-icon">📡</div>
          <h2 className="card-title">Event Stream</h2>
          <span className="live-badge">
            <span className="live-dot"></span>
            LIVE
          </span>
        </div>
        
        <div className="terminal-logs">
          {logs.map(log => (
            <div key={log.id} className={`log-entry ${log.type}`}>
              <span className="log-time">{log.timestamp}</span>
              <span className="log-msg">{log.message}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="log-empty">
              <span>Waiting for events...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;