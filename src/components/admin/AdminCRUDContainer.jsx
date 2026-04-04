import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { UserPlus, ShieldPlus, Search, Edit3, Trash2, X, CheckCircle, IndianRupee, Zap } from 'lucide-react';

const DEMO_WORKERS = [
  { _id: '1', firstName: 'Rahul', lastName: 'Sharma', phone: '9876543210', email: 'rahul@zomato.in', city: 'Mumbai', platform: 'Zomato', walletBalance: 2450, starRating: 5, status: 'ACTIVE' },
  { _id: '2', firstName: 'Priya', lastName: 'Mehta', phone: '9123456789', email: 'priya@swiggy.in', city: 'Bangalore', platform: 'Swiggy', walletBalance: 1900, starRating: 4, status: 'ACTIVE' },
  { _id: '3', firstName: 'Suresh', lastName: 'Kumar', phone: '9988776655', email: 'suresh@blinkit.in', city: 'Delhi NCR', platform: 'Blinkit', walletBalance: 3100, starRating: 3, status: 'ACTIVE' },
  { _id: '4', firstName: 'Anita', lastName: 'Rao', phone: '9871234560', email: 'anita@zepto.in', city: 'Chennai', platform: 'Zepto', walletBalance: 780, starRating: 2, status: 'INACTIVE' },
  { _id: '5', firstName: 'Vikram', lastName: 'Singh', phone: '9001234567', email: 'vikram@dunzo.in', city: 'Hyderabad', platform: 'Dunzo', walletBalance: 4200, starRating: 5, status: 'ACTIVE' },
];

const DEMO_POLICIES = [
  { _id: '1', type: 'HEAVY_RAIN', premium: 35, coverage: 500, trigger: 'Rain > 50mm', city: 'All Cities', status: 'ACTIVE' },
  { _id: '2', type: 'AQI_CRITICAL', premium: 30, coverage: 500, trigger: 'AQI > 300', city: 'Delhi NCR', status: 'ACTIVE' },
  { _id: '3', type: 'EXTREME_HEAT', premium: 25, coverage: 500, trigger: 'Temp > 42°C', city: 'Chennai', status: 'ACTIVE' },
  { _id: '4', type: 'TRAFFIC_SURGE', premium: 20, coverage: 500, trigger: 'Traffic 3x+', city: 'Mumbai', status: 'ACTIVE' },
  { _id: '5', type: 'CYCLONE_ALERT', premium: 50, coverage: 500, trigger: 'Wind > 80 km/h', city: 'Kolkata', status: 'INACTIVE' },
];

const AdminCRUDContainer = () => {
  const { transactions, fireTrigger, currentEventState, activeCity } = useSimulation();
  const [activeTab, setActiveTab] = useState('WORKERS');
  const [workers, setWorkers] = useState(DEMO_WORKERS);
  const [policies, setPolicies] = useState(DEMO_POLICIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState(null); // { type: 'CREATE'|'EDIT'|'DELETE', item: {} }
  const [formData, setFormData] = useState({});

  const payouts = transactions.filter(t => t.type?.includes('PAYOUT'));

  const filtered = (list) => list.filter(item =>
    Object.values(item).some(v =>
      String(v).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const openCreate = () => {
    setFormData(activeTab === 'WORKERS'
      ? { firstName: '', lastName: '', phone: '', city: 'Mumbai', platform: 'Zomato', walletBalance: 0, starRating: 3, status: 'ACTIVE' }
      : { type: '', premium: 35, coverage: 500, trigger: '', city: 'All Cities', status: 'ACTIVE' }
    );
    setModal({ type: 'CREATE' });
  };

  const openEdit = (item) => {
    setFormData({ ...item });
    setModal({ type: 'EDIT', item });
  };

  const handleSave = () => {
    const newItem = { ...formData, _id: modal.item?._id || Date.now().toString() };
    if (activeTab === 'WORKERS') {
      setWorkers(prev =>
        modal.type === 'CREATE' ? [newItem, ...prev] : prev.map(w => w._id === newItem._id ? newItem : w)
      );
    } else {
      setPolicies(prev =>
        modal.type === 'CREATE' ? [newItem, ...prev] : prev.map(p => p._id === newItem._id ? newItem : p)
      );
    }
    setModal(null);
  };

  const handleDelete = (item) => setModal({ type: 'DELETE', item });

  const confirmDelete = () => {
    if (activeTab === 'WORKERS') setWorkers(prev => prev.filter(w => w._id !== modal.item._id));
    else setPolicies(prev => prev.filter(p => p._id !== modal.item._id));
    setModal(null);
  };

  const tabStyle = (tab) => ({
    paddingBottom: '0.75rem',
    fontWeight: 700,
    fontSize: '13px',
    color: activeTab === tab ? 'var(--accent-cyan)' : 'var(--text-muted)',
    borderBottom: activeTab === tab ? '2px solid var(--accent-cyan)' : '2px solid transparent',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid var(--accent-cyan)' : '2px solid transparent',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    transition: 'all 0.2s',
    padding: '0.5rem 0 0.75rem 0',
  });

  return (
    <div className="crud-container glass-panel slide-up" style={{ padding: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Admin Management</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginTop: '4px' }}>Data Control Panel</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', letterSpacing: '0.1em' }}>DEMO LIVE</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
        {['WORKERS', 'POLICIES', 'PAYOUTS'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(tab)}>
            {tab === 'WORKERS' ? '👤 Workers' : tab === 'POLICIES' ? '🛡️ Policies' : '⚡ Live Payouts'}
          </button>
        ))}
      </div>

      {/* PAYOUTS TAB */}
      {activeTab === 'PAYOUTS' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              {payouts.length === 0 ? 'No payouts triggered yet — use Simulate Storm in Worker dashboard' : `${payouts.length} parametric payouts recorded this session`}
            </span>
            <button
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => fireTrigger('HEAVY_RAIN', 'Admin Override: Rain: 85mm')}
              disabled={!!currentEventState}
            >
              <Zap size={14} /> Force Payout to {activeCity}
            </button>
          </div>

          {payouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <p>Payouts will appear here when weather triggers fire automatically.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {payouts.map((txn, i) => (
                <div key={txn.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px', animation: 'slideUp 0.3s ease forwards' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💸</div>
                    <div>
                      <span style={{ display: 'block', fontWeight: 800, fontSize: '12px', color: 'var(--accent-emerald)', letterSpacing: '0.1em' }}>{txn.id}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(txn.timestamp).toLocaleTimeString('en-IN')}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{txn.type?.replace('_', ' ')}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontWeight: 900, fontSize: '1.2rem', color: 'white' }}>₹{txn.amount}</span>
                    <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.2)', color: 'var(--accent-emerald)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>{txn.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WORKERS / POLICIES TAB */}
      {activeTab !== 'PAYOUTS' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
            <div style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: '8px', flex: 1 }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }} onClick={openCreate}>
              <UserPlus size={14} /> Add {activeTab === 'WORKERS' ? 'Worker' : 'Policy'}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {activeTab === 'WORKERS'
                    ? ['Name', 'Phone', 'City', 'Platform', 'Stars', 'Payout Rate', 'Wallet', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '0.75rem 1rem' }}>{h}</th>)
                    : ['Type', 'Premium', 'Coverage', 'Trigger', 'City', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '0.75rem 1rem' }}>{h}</th>)
                  }
                </tr>
              </thead>
              <tbody>
                {filtered(activeTab === 'WORKERS' ? workers : policies).map(item => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    {activeTab === 'WORKERS' ? <>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'white' }}>{item.firstName} {item.lastName}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{item.phone}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{item.city}</td>
                      <td style={{ padding: '0.9rem 1rem' }}><span style={{ padding: '3px 8px', background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{item.platform}</span></td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {Array.from({ length: item.starRating || 3 }).map((_, i) => (
                            <span key={i} style={{ color: (item.starRating||3) >= 4 ? '#F59E0B' : '#94A3B8', fontSize: '13px' }}>&#9733;</span>
                          ))}
                          {Array.from({ length: 5 - (item.starRating || 3) }).map((_, i) => (
                            <span key={i} style={{ color: '#1E293B', fontSize: '13px' }}>&#9733;</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--accent-orange)', fontWeight: 800 }}>&#8377;{[0, 0, 350, 500, 625, 750][item.starRating || 3]}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--accent-emerald)', fontWeight: 800 }}>&#8377;{item.walletBalance?.toLocaleString()}</td>
                    </> : <>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>{item.type}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--accent-orange)', fontWeight: 800 }}>₹{item.premium}/wk</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--accent-emerald)', fontWeight: 800 }}>₹{item.coverage}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '12px' }}>{item.trigger}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{item.city}</td>
                    </>}
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ padding: '3px 9px', background: item.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(100,100,100,0.1)', color: item.status === 'ACTIVE' ? '#10B981' : '#888', borderRadius: '4px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em' }}>{item.status}</span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Edit3 size={15} style={{ color: 'var(--accent-cyan)', cursor: 'pointer' }} onClick={() => openEdit(item)} />
                        <Trash2 size={15} style={{ color: 'var(--accent-rose)', cursor: 'pointer' }} onClick={() => handleDelete(item)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODAL */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2rem', borderRadius: '16px', position: 'relative', border: '1px solid var(--border-accent)' }}>
            <button onClick={() => setModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>

            {modal.type === 'DELETE' ? (
              <>
                <h3 style={{ color: 'var(--accent-rose)', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 900 }}>⚠️ Confirm Delete</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Are you sure you want to remove <strong style={{ color: 'white' }}>
                    {modal.item.firstName ? `${modal.item.firstName} ${modal.item.lastName}` : modal.item.type}
                  </strong>? This action is permanent.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
                  <button className="btn" style={{ flex: 1, background: 'var(--accent-rose)', color: 'white' }} onClick={confirmDelete}>Delete</button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 900 }}>
                  {modal.type === 'CREATE' ? '➕ Create' : '✏️ Edit'} {activeTab === 'WORKERS' ? 'Worker' : 'Policy'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeTab === 'WORKERS' ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {[['firstName', 'First Name'], ['lastName', 'Last Name']].map(([key, label]) => (
                          <div key={key}>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                            <input type="text" value={formData[key] || ''} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                              style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</label>
                        <input type="text" value={formData.phone || ''} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                          style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>City</label>
                          <select value={formData.city || 'Mumbai'} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}>
                            {['Mumbai', 'Delhi NCR', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</label>
                          <select value={formData.platform || 'Zomato'} onChange={e => setFormData(p => ({ ...p, platform: e.target.value }))}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}>
                            {['Zomato', 'Swiggy', 'Blinkit', 'Zepto', 'Dunzo', 'Porter', 'BigBasket'].map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallet (₹)</label>
                          <input type="number" value={formData.walletBalance || 0} onChange={e => setFormData(p => ({ ...p, walletBalance: Number(e.target.value) }))}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Star Rating</label>
                          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                            {[1,2,3,4,5].map(s => (
                              <button key={s} type="button" onClick={() => setFormData(p => ({ ...p, starRating: s }))}
                                style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', color: s <= (formData.starRating || 3) ? '#F59E0B' : '#1E293B', padding: '0', lineHeight: 1 }}>★</button>
                            ))}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--accent-orange)', fontWeight: 700, marginTop: '2px' }}>
                            Payout: ₹{[0,0,350,500,625,750][formData.starRating || 3]}
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                          <select value={formData.status || 'ACTIVE'} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
                          <input type="text" value={formData.type || ''} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trigger Condition</label>
                          <input type="text" value={formData.trigger || ''} onChange={e => setFormData(p => ({ ...p, trigger: e.target.value }))}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        {[['premium', 'Weekly Premium (₹)'], ['coverage', 'Coverage (₹)']].map(([key, label]) => (
                          <div key={key}>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                            <input type="number" value={formData[key] || 0} onChange={e => setFormData(p => ({ ...p, [key]: Number(e.target.value) }))}
                              style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                        ))}
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                          <select value={formData.status || 'ACTIVE'} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={handleSave}>
                    <CheckCircle size={14} /> Save Record
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCRUDContainer;
