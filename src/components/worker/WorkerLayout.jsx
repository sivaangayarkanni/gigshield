import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import WeatherRadar from './WeatherRadar';
import EarningsForecast from './EarningsForecast';
import './WorkerLayout.css';

const WorkerLayout = () => {
  const { logout, workerState, walletBalance, isOnline, activeCity, geoError, lastLocationUpdate } = useSimulation();
  const navigate = useNavigate();
  const [devBypass, setDevBypass] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isRaining = workerState?.isOnline && (activeCity !== 'Delhi NCR') ? true : false; // Placeholder for weather trigger (will link to sensorData dynamically if passed, else just static check). Wait, let's just make it a global stormy background class for the worker portal to satisfy the 'innovative rain bg' request.

  return (
    <div className="worker-root stormy-bg">
      <div className="rain-overlay"></div>
      <header className="worker-header">
        <div className="header-left">
          <span className="logo-text">GigShield</span>
          <div className="header-divider"></div>
          <div className="header-location">
            <span className="location-icon">📍</span>
            <span>{activeCity}</span>
            <span className="platform-tag">{workerState?.platform || 'Zomato'}</span>
          </div>
        </div>

        <nav className="worker-nav">
          <NavLink to="/worker/home" className={({isActive}) => isActive ? 'nav-tab active' : 'nav-tab'}>
            🏠 Overview
          </NavLink>
          <NavLink to="/worker/policy" className={({isActive}) => isActive ? 'nav-tab active' : 'nav-tab'}>
            🛡️ Coverage
          </NavLink>
          <NavLink to="/worker/proof" className={({isActive}) => isActive ? 'nav-tab active' : 'nav-tab'}>
            📋 Claims
          </NavLink>
        </nav>

        <div className="header-right">
          <div className="wallet-display">
            <span className="wallet-label">Balance</span>
            <span className="wallet-amount">₹{walletBalance.toLocaleString()}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="worker-main-content">
        {(!devBypass && (!lastLocationUpdate || geoError)) ? (
          <div className="geo-lock-overlay" style={{ background: 'rgba(10,10,10,0.95)', padding: '4rem', textAlign: 'center', borderRadius: '1rem', border: '1px solid var(--accent-rose)', boxShadow: '0 0 30px rgba(255,0,85,0.2)' }}>
            <h2 style={{ color: 'var(--accent-rose)', fontSize: '2rem', marginBottom: '1rem' }}>📍 Live Location Required</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>GigShield requires constant GPS telemetry to provide automated external disruption payouts in {activeCity}. Please allow location access in your browser.</p>
            {geoError && <p style={{ color: 'var(--accent-rose)', fontSize: '0.9rem', marginTop: '1rem' }}>Error: {geoError}</p>}
            
            {/* Developer Bypass */}
            <button 
               onClick={() => { window.location.reload(); }} 
               className="btn btn-outline" 
               style={{ marginTop: '2rem', marginRight: '1rem', opacity: 0.8 }}
            >
               Retry
            </button>
            <button 
               onClick={() => setDevBypass(true)}
               className="btn btn-primary" 
               style={{ marginTop: '2rem' }}
            >
               Auto-Mock Location (Bypass)
            </button>
          </div>
        ) : (
        <div className="worker-split-layout">
          <div className="worker-feed-area">
             <Outlet />
          </div>
          <div className="worker-protection-sidebar">
             <h4 className="sidebar-title">Global Protection</h4>
             <WeatherRadar />
             <div style={{ marginTop: '1.5rem' }}>
                <EarningsForecast />
             </div>
          </div>
        </div>
        )}
      </main>

      <footer className="worker-footer">
        <div className="footer-status">
          <span className="status-dot"></span>
          <span>Parametric System Active • {isOnline ? 'Online' : 'Offline Mode (Synced)'}</span>
        </div>
        <span className="footer-copy">© 2026 GigShield • Professional Grade Protection</span>
      </footer>
    </div>
  );
};

export default WorkerLayout;