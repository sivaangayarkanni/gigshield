import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';

const AdminLogin = () => {
  const [adminPassword, setAdminPassword] = useState('');
  const { loginAdmin, userRole } = useSimulation();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === 'ADMIN') {
      navigate('/admin/intelligence', { replace: true });
    }
  }, [userRole, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'EARNSURE2026') {
      loginAdmin();
    } else {
      setError('Invalid admin key. Check the demo credentials below.');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-orange)' }}>Super Admin Access</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Secured Node Initialization</p>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '12px', background: 'rgba(255,0,85,0.1)', color: 'var(--accent-magenta)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--accent-magenta)' }}>DEMO ENVIRONMENT</span>
        </div>
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '10px', textAlign: 'left' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-orange)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>🔑 Demo Credentials</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Admin Access Key:</span>
            <code style={{ fontSize: '14px', fontWeight: 900, color: 'white', letterSpacing: '3px', background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>EARNSURE2026</code>
          </div>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input 
              type="password" 
              style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-accent)', borderRadius: '8px', color: 'white', letterSpacing: '4px', textAlign: 'center' }}
              value={adminPassword} 
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter Admin Key"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ width: '100%' }} disabled={!adminPassword}>
            Authenticate
          </button>
        </form>
        <button onClick={() => navigate('/')} style={{ marginTop: '2rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          ← Back to Landing
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
