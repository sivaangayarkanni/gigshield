import React, { useState } from 'react';

const EXCLUSIONS = [
  'War, Terrorism, or Civil Unrest',
  'Pandemic / Epidemic (Government Declared)',
  'Illegal Activity by the Claimant',
  'Substance Abuse or Intoxication',
  'Intentional Self-harm or Fraud',
  'Government Mandated Curfews or Lockdowns',
  'Natural Disasters Outside Covered Zones',
  'Claims Filed Beyond 24 Hours of Event',
  'Workers with Active Account Suspension',
  'Trips Cancelled by Platform (Not Weather)',
  'Losses from Vehicle Theft or Accident',
  'Claims Without Valid Platform-Verified Trip Data',
];

const STAR_PAYOUT = [
  { stars: 5, label: 'Platinum Rider', payout: 750, color: '#F59E0B', desc: 'Top 10% performers — highest priority payout' },
  { stars: 4, label: 'Gold Rider', payout: 625, color: '#FBBF24', desc: 'Consistently excellent — premium payout rate' },
  { stars: 3, label: 'Silver Rider', payout: 500, color: '#94A3B8', desc: 'Standard coverage — base payout rate' },
  { stars: 2, label: 'Bronze Rider', payout: 350, color: '#CD7C41', desc: 'Below average — reduced payout until rating improves' },
  { stars: 1, label: 'Probation', payout: 0, color: '#EF4444', desc: 'Suspended from payout — rating must be rebuilt' },
];

const TermsPage = ({ onAccept, onDecline }) => {
  const [agreed, setAgreed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: '📋 Overview' },
    { id: 'payout', label: '⚡ Auto Payout' },
    { id: 'ratings', label: '⭐ Star Ratings' },
    { id: 'exclusions', label: '🚫 Exclusions' },
    { id: 'privacy', label: '🔒 Privacy' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050508 0%, #0a0a14 50%, #05080a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', width: '100%', maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(90deg, #F97316, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EarnSure</span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#EC4899', padding: '3px 8px', border: '1px solid #EC4899', borderRadius: '4px', letterSpacing: '1px' }}>DEMO</span>
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Terms of Service & Privacy Policy</h1>
        <p style={{ color: '#64748B', fontSize: '13px' }}>Please read and accept before accessing the platform • IRDAI Sandbox Registered</p>
      </div>

      {/* Main Card */}
      <div style={{
        width: '100%', maxWidth: '800px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Tab Nav */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              padding: '1rem 1.2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeSection === s.id ? '2px solid #06B6D4' : '2px solid transparent',
              color: activeSection === s.id ? '#06B6D4' : '#64748B',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              letterSpacing: '0.03em',
              transition: 'all 0.2s',
            }}>{s.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', maxHeight: '55vh', overflowY: 'auto' }}>

          {activeSection === 'overview' && (
            <div>
              <h2 style={{ color: '#06B6D4', fontWeight: 800, marginBottom: '1rem', fontSize: '1.1rem' }}>About EarnSure</h2>
              <p style={{ color: '#94A3B8', lineHeight: 1.8, marginBottom: '1rem', fontSize: '14px' }}>
                EarnSure is a parametric insurance platform designed exclusively for gig economy workers in India — including food delivery riders on Zomato, Swiggy, Blinkit, Zepto, Dunzo, Porter, and BigBasket.
              </p>
              <p style={{ color: '#94A3B8', lineHeight: 1.8, marginBottom: '1rem', fontSize: '14px' }}>
                Unlike traditional insurance, EarnSure uses <strong style={{ color: 'white' }}>smart-contract logic</strong> to automatically release payouts when predefined weather or environmental conditions are met in your delivery zone — with zero paperwork.
              </p>
              <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '12px', padding: '1rem', marginTop: '1.5rem' }}>
                <p style={{ color: '#F97316', fontWeight: 700, fontSize: '13px', marginBottom: '0.5rem' }}>⚠️ Important: Demo Notice</p>
                <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.7 }}>
                  This is a demo prototype. Payouts are simulated. No real money is transferred. Real IRDAI registration and partner API integrations are required for production deployment.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'payout' && (
            <div>
              <h2 style={{ color: '#06B6D4', fontWeight: 800, marginBottom: '1rem', fontSize: '1.1rem' }}>Automatic Payout System</h2>
              <p style={{ color: '#94A3B8', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '14px' }}>
                EarnSure monitors your <strong style={{ color: 'white' }}>live GPS location</strong> and cross-references it against real-time weather and environmental data from trusted sources (Open-Meteo, IMD, IoT Sensor Grid). When disruption thresholds are breached in your exact delivery zone, payouts are automatically authorized.
              </p>

              <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: '14px' }}>Covered Trigger Events</h3>
              {[
                { icon: '🌧️', name: 'Heavy Rainfall', threshold: 'Precipitation > 50mm/hr in your GPS zone', payout: 'Variable by star rating' },
                { icon: '🌫️', name: 'Critical Air Quality', threshold: 'AQI > 300 PM2.5 in your delivery region', payout: 'Variable by star rating' },
                { icon: '🔥', name: 'Extreme Heat', threshold: 'Temperature > 42°C in your cluster', payout: 'Variable by star rating' },
                { icon: '🚧', name: 'Severe Traffic Gridlock', threshold: 'Traffic latency factor > 3.0x baseline', payout: 'Variable by star rating' },
              ].map(t => (
                <div key={t.name} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                  <div>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{t.name}</p>
                    <p style={{ color: '#64748B', fontSize: '12px' }}>{t.threshold}</p>
                    <p style={{ color: '#10B981', fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>{t.payout}</p>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '1.5rem', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px', padding: '1rem' }}>
                <p style={{ color: '#10B981', fontWeight: 700, fontSize: '13px' }}>📍 Location is Mandatory</p>
                <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.7, marginTop: '0.5rem' }}>
                  Continuous GPS access is required while using the platform. Without live location data, the auto-payout engine cannot verify that you were in the disruption zone and payouts will not be processed.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'ratings' && (
            <div>
              <h2 style={{ color: '#06B6D4', fontWeight: 800, marginBottom: '0.5rem', fontSize: '1.1rem' }}>Star Rating & Payout Formula</h2>
              <p style={{ color: '#94A3B8', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '14px' }}>
                Your payout amount is directly tied to your <strong style={{ color: 'white' }}>platform star rating</strong> as reported by your delivery platform (Zomato, Swiggy, Blinkit, etc.). EarnSure retrieves this rating via authorized Platform Partner API integrations. Higher ratings reflect reliability and unlock higher payouts.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {STAR_PAYOUT.map(tier => (
                  <div key={tier.stars} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    background: `rgba(${tier.stars === 5 ? '245,158,11' : tier.stars === 1 ? '239,68,68' : '255,255,255'},0.05)`,
                    border: `1px solid ${tier.color}30`,
                    borderRadius: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        {Array.from({ length: tier.stars }).map((_, i) => (
                          <span key={i} style={{ color: tier.color, fontSize: '14px' }}>★</span>
                        ))}
                        {Array.from({ length: 5 - tier.stars }).map((_, i) => (
                          <span key={i} style={{ color: '#334155', fontSize: '14px' }}>★</span>
                        ))}
                      </div>
                      <div>
                        <p style={{ color: tier.color, fontWeight: 800, fontSize: '13px' }}>{tier.label}</p>
                        <p style={{ color: '#64748B', fontSize: '11px' }}>{tier.desc}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: 'white', fontWeight: 900, fontSize: '1.1rem' }}>
                        {tier.payout > 0 ? `₹${tier.payout}` : 'No Payout'}
                      </p>
                      <p style={{ color: '#64748B', fontSize: '10px' }}>per trigger event</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '12px', padding: '1rem' }}>
                <p style={{ color: '#06B6D4', fontWeight: 700, fontSize: '13px', marginBottom: '0.5rem' }}>🏆 How Ratings Work</p>
                <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.7 }}>
                  Your rating is managed entirely by your delivery platform (e.g., Zomato, Swiggy). EarnSure reads it via secure API but does not modify it. Maintain high delivery standards, punctuality, and customer satisfaction to unlock premium payout tiers. Ratings are refreshed weekly.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'exclusions' && (
            <div>
              <h2 style={{ color: '#EF4444', fontWeight: 800, marginBottom: '0.5rem', fontSize: '1.1rem' }}>Policy Exclusions</h2>
              <p style={{ color: '#94A3B8', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '14px' }}>
                The following events and circumstances are <strong style={{ color: '#EF4444' }}>explicitly excluded</strong> from EarnSure coverage. Claims related to these will be automatically rejected by the system.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {EXCLUSIONS.map((excl, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(239,68,68,0.04)',
                    border: '1px solid rgba(239,68,68,0.1)',
                    borderRadius: '8px',
                  }}>
                    <span style={{ color: '#EF4444', fontSize: '14px', marginTop: '1px', fontWeight: 900, minWidth: '20px' }}>{i + 1}.</span>
                    <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.6 }}>{excl}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '1rem' }}>
                <p style={{ color: '#EF4444', fontWeight: 700, fontSize: '13px' }}>⚠️ Fraud Prevention</p>
                <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.7, marginTop: '0.5rem' }}>
                  All claims are subject to automated AI fraud analysis. Suspicious patterns, impossible travel speeds, or mismatched GPS data will route claims to manual review. Fraudulent claims result in permanent account termination.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div>
              <h2 style={{ color: '#06B6D4', fontWeight: 800, marginBottom: '1rem', fontSize: '1.1rem' }}>Privacy Policy</h2>
              {[
                { title: 'Location Data', icon: '📍', text: 'We collect continuous GPS coordinates while the app is active. This data is used solely to verify your presence in a disruption zone for payout eligibility. Location data is encrypted and never sold to third parties.' },
                { title: 'Platform Star Ratings', icon: '⭐', text: 'We retrieve your delivery platform star rating via authorized Partner APIs. This data is read-only — EarnSure cannot modify your rating. It is used only to calculate your payout tier.' },
                { title: 'Bank Account Details', icon: '🏦', text: 'Your bank account and IFSC details are stored with AES-256 encryption. They are used exclusively for UPI-based payout disbursement and are never shared with any third party.' },
                { title: 'Phone Number & OTP', icon: '📱', text: 'Your mobile number is used for identity verification via OTP. It may also be used for critical insurance alerts (severe weather, payout processed). No marketing messages.' },
                { title: 'Weather & Sensor Data', icon: '🌡️', text: 'We collect real-time weather data from Open-Meteo API, IMD feeds, and IoT sensor networks. This environmental data is used exclusively for trigger verification and is not personally linked to you.' },
                { title: 'Data Retention', icon: '💾', text: 'Claim records are retained for 7 years as required by IRDAI regulations. Personal data may be deleted upon account closure, subject to statutory retention requirements.' },
              ].map(item => (
                <div key={item.title} style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '13px', marginBottom: '0.4rem' }}>{item.icon} {item.title}</p>
                  <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.7 }}>{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Accept Section */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem 2rem', background: 'rgba(0,0,0,0.2)' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1.25rem' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: '3px', accentColor: '#06B6D4', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.6 }}>
              I have read and agree to the EarnSure <strong style={{ color: 'white' }}>Terms of Service</strong>, understand the{' '}
              <strong style={{ color: '#EF4444' }}>Policy Exclusions</strong>, the{' '}
              <strong style={{ color: '#F59E0B' }}>Star Rating payout system</strong>, and consent to the collection of my{' '}
              <strong style={{ color: '#06B6D4' }}>live GPS location</strong> for parametric insurance purposes.
            </span>
          </label>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onDecline}
              style={{ flex: 1, padding: '0.85rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#64748B', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={!agreed}
              style={{
                flex: 2, padding: '0.85rem',
                background: agreed ? 'linear-gradient(135deg, #06B6D4, #0891B2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${agreed ? '#06B6D4' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px',
                color: agreed ? 'white' : '#334155',
                fontWeight: 800, fontSize: '14px',
                cursor: agreed ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                boxShadow: agreed ? '0 0 20px rgba(6,182,212,0.3)' : 'none',
                letterSpacing: '0.03em',
              }}
            >
              {agreed ? '✓ Accept & Enter EarnSure' : 'Read all tabs & check the box to proceed'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p style={{ color: '#1E293B', fontSize: '11px', marginTop: '1.5rem', textAlign: 'center' }}>
        IRDAI Sandbox License #49281 • EarnSure Insurance Services © 2026 • Demo Prototype
      </p>
    </div>
  );
};

export default TermsPage;
