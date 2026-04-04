import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import NationalRiskMap from '../shared/NationalRiskMap';
import { useNavigate } from 'react-router-dom';

const CITY_STATS = [
  { city: 'Mumbai', riders: 3240, atRisk: 320, payouts: 142, cost: '₹71,000', rating: 4.2 },
  { city: 'Delhi NCR', riders: 2890, atRisk: 450, payouts: 198, cost: '₹99,000', rating: 3.9 },
  { city: 'Bangalore', riders: 2100, atRisk: 180, payouts: 87, cost: '₹43,500', rating: 4.5 },
  { city: 'Chennai', riders: 1560, atRisk: 210, payouts: 95, cost: '₹47,500', rating: 4.1 },
  { city: 'Hyderabad', riders: 1420, atRisk: 95, payouts: 41, cost: '₹20,500', rating: 4.4 },
  { city: 'Kolkata', riders: 1030, atRisk: 140, payouts: 63, cost: '₹31,500', rating: 3.8 },
];

const STAR_DIST = [
  { stars: 5, count: 2840, color: '#F59E0B', label: 'Platinum' },
  { stars: 4, count: 4920, color: '#FBBF24', label: 'Gold' },
  { stars: 3, count: 4180, color: '#94A3B8', label: 'Silver' },
  { stars: 2, count: 1830, color: '#CD7C41', label: 'Bronze' },
  { stars: 1, count: 470, color: '#EF4444', label: 'Probation' },
];

const ALERTS = [
  { time: '2m ago', city: 'Mumbai', type: 'Heavy Rain Alert', severity: 'HIGH', riders: 320, color: '#3B82F6' },
  { time: '18m ago', city: 'Delhi NCR', type: 'AQI Critical', severity: 'CRITICAL', riders: 450, color: '#F97316' },
  { time: '1h ago', city: 'Chennai', type: 'Extreme Heat', severity: 'MODERATE', riders: 90, color: '#EF4444' },
  { time: '3h ago', city: 'Kolkata', type: 'Gridlock Surge', severity: 'LOW', riders: 55, color: '#A855F7' },
];

const PartnerDashboard = () => {
  const { logout, sensorData, transactions, activeCity } = useSimulation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const payouts = transactions.filter(t => t.type?.includes('PAYOUT'));
  const totalRiders = CITY_STATS.reduce((s, c) => s + c.riders, 0);
  const totalAtRisk = CITY_STATS.reduce((s, c) => s + c.atRisk, 0);

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'fleet', label: '🚴 Fleet by City' },
    { id: 'ratings', label: '⭐ Star Distribution' },
    { id: 'alerts', label: `🔔 Risk Alerts ${ALERTS.length > 0 ? `(${ALERTS.length})` : ''}` },
    { id: 'payouts', label: '⚡ Live Payouts' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050508', fontFamily: "'Inter', sans-serif", color: 'white' }}>
      {/* Sticky Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,5,8,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, background: 'linear-gradient(90deg, #F97316, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GigShield</span>
          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Partner Intelligence Portal</span>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#EC4899', padding: '2px 8px', border: '1px solid #EC4899', borderRadius: '4px' }}>DEMO</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981' }}>Live Feed</span>
          </div>
          <button onClick={() => { logout(); navigate('/'); }}
            style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94A3B8', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Protected Fleet', value: totalRiders.toLocaleString(), sub: 'Active riders', color: '#06B6D4', icon: '🛡️' },
            { label: 'At-Risk Right Now', value: totalAtRisk.toLocaleString(), sub: `${((totalAtRisk/totalRiders)*100).toFixed(1)}% exposure`, color: '#EF4444', icon: '⚠️' },
            { label: 'Payouts This Session', value: payouts.length > 0 ? `₹${payouts.reduce((s,p) => s + p.amount, 0).toLocaleString()}` : '₹0', sub: `${payouts.length} trigger events`, color: '#10B981', icon: '💸' },
            { label: 'Avg Fleet Rating', value: '4.1 ⭐', sub: 'Across all cities', color: '#F59E0B', icon: '🏆' },
          ].map(kpi => (
            <div key={kpi.label} style={{
              padding: '1.25rem', background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${kpi.color}20`, borderLeft: `3px solid ${kpi.color}`,
              borderRadius: '12px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{kpi.label}</span>
                <span style={{ fontSize: '18px' }}>{kpi.icon}</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: '11px', color: kpi.color, fontWeight: 600, marginTop: '4px' }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '2rem', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '0.75rem 1.25rem', background: 'none', border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #06B6D4' : '2px solid transparent',
              color: activeTab === tab.id ? '#06B6D4' : '#64748B',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Tab Content */}

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
            {/* Map */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', height: '500px' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '14px' }}>Live Fleet Distribution</span>
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>📡 Real-time</span>
              </div>
              <div style={{ height: 'calc(100% - 56px)' }}>
                <NationalRiskMap height="100%" showRider={true} />
              </div>
            </div>

            {/* Right Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Live Sensor */}
              <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Live Sensor — {activeCity}</div>
                {[
                  { label: 'AQI', value: sensorData.aqi, max: 500, color: sensorData.aqi > 300 ? '#F97316' : '#10B981', unit: '' },
                  { label: 'Rainfall', value: sensorData.rainfall.toFixed(1), max: 100, color: '#3B82F6', unit: 'mm' },
                  { label: 'Temperature', value: sensorData.temperature.toFixed(0), max: 50, color: sensorData.temperature > 42 ? '#EF4444' : '#94A3B8', unit: '°C' },
                ].map(s => (
                  <div key={s.label} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#94A3B8' }}>{s.label}</span>
                      <span style={{ color: s.color, fontWeight: 700 }}>{s.value}{s.unit}</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${Math.min((s.value/s.max)*100, 100)}%`, background: s.color, borderRadius: '2px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Alerts */}
              <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Recent Risk Alerts</div>
                {ALERTS.slice(0, 3).map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.color, marginTop: '4px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{a.type} — {a.city}</p>
                      <p style={{ fontSize: '11px', color: '#64748B' }}>{a.riders} riders affected • {a.time}</p>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: a.color, alignSelf: 'flex-start', padding: '2px 6px', border: `1px solid ${a.color}40`, borderRadius: '4px' }}>{a.severity}</span>
                  </div>
                ))}
              </div>

              {/* API Box */}
              <div style={{ padding: '1rem 1.25rem', background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#06B6D4', letterSpacing: '0.1em', marginBottom: '6px' }}>LOGISTICS API GATEWAY</div>
                <code style={{ fontSize: '10px', color: '#10B981', display: 'block' }}>GET /api/v3/fleet_resilience_grid</code>
                <code style={{ fontSize: '10px', color: '#10B981', display: 'block' }}>  ?city=ALL&live=true</code>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fleet' && (
          <div>
            <div style={{ marginBottom: '1rem', fontSize: '13px', color: '#64748B' }}>Fleet health breakdown by city — payouts, at-risk riders, and average ratings</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {['City', 'Total Riders', 'At Risk', 'Exposure %', 'Payouts (YTD)', 'Payout Cost', 'Avg Rating', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CITY_STATS.map((c, i) => {
                    const exposure = ((c.atRisk / c.riders) * 100).toFixed(1);
                    return (
                      <tr key={c.city} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'white' }}>{c.city}</td>
                        <td style={{ padding: '0.9rem 1rem', color: '#06B6D4', fontWeight: 700 }}>{c.riders.toLocaleString()}</td>
                        <td style={{ padding: '0.9rem 1rem', color: '#EF4444', fontWeight: 700 }}>{c.atRisk}</td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                              <div style={{ width: `${exposure}%`, height: '100%', background: parseFloat(exposure) > 15 ? '#EF4444' : '#F97316', borderRadius: '2px' }} />
                            </div>
                            <span style={{ color: '#94A3B8', fontSize: '12px' }}>{exposure}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', color: '#94A3B8' }}>{c.payouts}</td>
                        <td style={{ padding: '0.9rem 1rem', color: '#10B981', fontWeight: 700 }}>{c.cost}</td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          {Array.from({ length: Math.round(c.rating) }).map((_, i) => (
                            <span key={i} style={{ color: '#F59E0B', fontSize: '12px' }}>★</span>
                          ))}
                          <span style={{ color: '#64748B', fontSize: '11px', marginLeft: '4px' }}>{c.rating}</span>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>ACTIVE</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ratings' && (
          <div>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '1.5rem' }}>Star rating distribution of your delivery fleet — determines payout tier per trigger event</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '1.25rem', color: 'white' }}>Fleet Rating Breakdown</div>
                {STAR_DIST.map(tier => {
                  const total = STAR_DIST.reduce((s, t) => s + t.count, 0);
                  const pct = ((tier.count / total) * 100).toFixed(1);
                  return (
                    <div key={tier.stars} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div>
                            {Array.from({ length: tier.stars }).map((_, i) => <span key={i} style={{ color: tier.color, fontSize: '12px' }}>★</span>)}
                            {Array.from({ length: 5 - tier.stars }).map((_, i) => <span key={i} style={{ color: '#1E293B', fontSize: '12px' }}>★</span>)}
                          </div>
                          <span style={{ color: '#94A3B8' }}>{tier.label}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: 'white', fontWeight: 700 }}>{tier.count.toLocaleString()}</span>
                          <span style={{ color: '#64748B', marginLeft: '6px' }}>({pct}%)</span>
                        </div>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: tier.color, borderRadius: '3px', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '1.25rem', color: 'white' }}>Payout Cost by Rating Tier</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { tier: '5⭐ Platinum', riders: 2840, rate: 750, color: '#F59E0B' },
                    { tier: '4⭐ Gold', riders: 4920, rate: 625, color: '#FBBF24' },
                    { tier: '3⭐ Silver', riders: 4180, rate: 500, color: '#94A3B8' },
                    { tier: '2⭐ Bronze', riders: 1830, rate: 350, color: '#CD7C41' },
                    { tier: '1⭐ Probation', riders: 470, rate: 0, color: '#EF4444' },
                  ].map(t => (
                    <div key={t.tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: t.color, fontWeight: 700, fontSize: '12px' }}>{t.tier}</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: '13px' }}>₹{t.rate}</span>
                        <span style={{ color: '#64748B', fontSize: '10px', display: 'block' }}>per trigger</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#06B6D4', fontWeight: 700 }}>💡 Avg payout per trigger event:</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginTop: '4px' }}>₹540 <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 400 }}>weighted average</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '1.5rem' }}>Real-time weather and risk alerts affecting your fleet across India</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ALERTS.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: `rgba(255,255,255,0.02)`, border: `1px solid ${a.color}20`, borderLeft: `3px solid ${a.color}`, borderRadius: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {a.type.includes('Rain') ? '🌧️' : a.type.includes('AQI') ? '🌫️' : a.type.includes('Heat') ? '🔥' : '🚧'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>{a.type}</p>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 10px', border: `1px solid ${a.color}`, color: a.color, borderRadius: '4px' }}>{a.severity}</span>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>{a.city} • {a.riders} riders affected • {a.time}</p>
                    <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '4px' }}>
                      Estimated payout exposure: <strong style={{ color: 'white' }}>₹{(a.riders * 540).toLocaleString()}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '1.5rem' }}>
              {payouts.length === 0 ? 'No payouts triggered yet this session. Use "Simulate Storm" in the Worker dashboard to trigger one.' : `${payouts.length} auto-payouts triggered this session`}
            </p>
            {payouts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#334155' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                <p>Payouts will appear here in real-time as parametric events trigger</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {payouts.map((txn, i) => (
                  <div key={txn.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', items: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', letterSpacing: '0.05em' }}>{txn.id}</span>
                      <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '1rem' }}>{new Date(txn.timestamp).toLocaleTimeString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      {txn.starRating && (
                        <span style={{ fontSize: '11px', color: '#F59E0B' }}>{'★'.repeat(txn.starRating)} tier</span>
                      )}
                      <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'white' }}>₹{txn.amount}</span>
                      <span style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(16,185,129,0.15)', color: '#10B981', borderRadius: '4px', fontWeight: 700 }}>{txn.status}</span>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '1rem', background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ color: '#64748B', fontSize: '12px' }}>Total disbursed this session</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>₹{payouts.reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerDashboard;
