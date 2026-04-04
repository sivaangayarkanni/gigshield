import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';

const PLATFORMS = [
  { id: 'zomato', name: 'Zomato', color: '#E23744', key: 'ZOMATO2026' },
  { id: 'swiggy', name: 'Swiggy', color: '#FC8019', key: 'SWIGGY2026' },
  { id: 'blinkit', name: 'Blinkit', color: '#F8C300', key: 'BLINKIT26' },
  { id: 'zepto', name: 'Zepto', color: '#8B5CF6', key: 'ZEPTO2026' },
  { id: 'dunzo', name: 'Dunzo', color: '#00B8A9', key: 'DUNZO2026' },
];

const PartnerLogin = () => {
  const { loginPartner, userRole } = useSimulation();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [partnerKey, setPartnerKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userRole === 'PARTNER') navigate('/partner/dashboard', { replace: true });
  }, [userRole, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedPlatform) { setError('Please select your platform first.'); return; }
    if (partnerKey === selectedPlatform.key) {
      loginPartner();
    } else {
      setError('Invalid partner key. Check the demo credentials below.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050508 0%, #09040f 50%, #030810 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(90deg, #F97316, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GigShield</span>
          <p style={{ color: '#64748B', fontSize: '13px', marginTop: '4px' }}>Partner Intelligence Portal</p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '2rem', boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{ color: 'white', fontWeight: 900, marginBottom: '0.25rem', fontSize: '1.3rem' }}>Enterprise Access</h2>
          <p style={{ color: '#64748B', fontSize: '12px', marginBottom: '1.5rem' }}>Sign in with your logistics platform credentials</p>

          {/* Platform Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Select Platform</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => { setSelectedPlatform(p); setPartnerKey(''); setError(''); }}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedPlatform?.id === p.id ? `${p.color}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selectedPlatform?.id === p.id ? p.color : 'rgba(255,255,255,0.08)'}`,
                    color: selectedPlatform?.id === p.id ? p.color : '#94A3B8',
                    boxShadow: selectedPlatform?.id === p.id ? `0 0 15px ${p.color}30` : 'none',
                  }}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Partner Access Key</label>
              <input
                type="password"
                value={partnerKey}
                onChange={e => { setPartnerKey(e.target.value); setError(''); }}
                placeholder="Enter your enterprise key"
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? '#EF4444' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', letterSpacing: '3px', boxSizing: 'border-box' }}
              />
            </div>

            {error && <p style={{ color: '#EF4444', fontSize: '12px', marginBottom: '1rem' }}>⚠ {error}</p>}

            <button type="submit"
              style={{
                width: '100%', padding: '0.85rem',
                background: selectedPlatform ? `linear-gradient(135deg, ${selectedPlatform.color}, ${selectedPlatform.color}99)` : 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: '10px', color: selectedPlatform ? 'white' : '#334155',
                fontWeight: 800, fontSize: '14px', cursor: selectedPlatform ? 'pointer' : 'not-allowed',
                boxShadow: selectedPlatform ? `0 0 20px ${selectedPlatform.color}40` : 'none',
                transition: 'all 0.3s', letterSpacing: '0.03em',
              }}>
              {selectedPlatform ? `Sign in as ${selectedPlatform.name} Partner` : 'Select a platform to continue'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '10px' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#F97316', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>🔑 Demo Credentials</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {PLATFORMS.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>{p.name}:</span>
                  <code style={{ color: 'white', fontWeight: 700, letterSpacing: '2px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                    onClick={() => { setSelectedPlatform(p); setPartnerKey(p.key); }}
                  >{p.key}</code>
                </div>
              ))}
            </div>
            <p style={{ color: '#475569', fontSize: '10px', marginTop: '8px' }}>Click any key to auto-fill</p>
          </div>

          <button onClick={() => navigate('/')} style={{ marginTop: '1.5rem', width: '100%', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '12px' }}>
            ← Back to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerLogin;
