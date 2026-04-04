import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { logout, currentEventState, transactions } = useSimulation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN'));
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('en-IN')), 1000);
    return () => clearInterval(t);
  }, []);

  const payouts = transactions.filter(t => t.type?.includes('PAYOUT'));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-root fade-in min-h-screen bg-slate-950 text-white flex overflow-hidden">
      {/* 🌑 Premium Command Sidebar */}
      <aside className="admin-sidebar shadow-2xl">
         <div className="sidebar-header p-12 px-10">
            <h1 className="logo-text text-4xl font-black tracking-tighter">EarnSure</h1>
            <div className="text-[10px] font-black text-slate-500 tracking-[0.3em] mt-3 uppercase opacity-50">Logistics Intelligence v4.2</div>
         </div>

         <nav className="admin-nav flex-1 px-6 space-y-2">
            <div className="nav-group mb-12">
               <h4 className="px-6 text-[10px] font-black text-slate-600 mb-6 uppercase tracking-[0.2em]">Core Logistics</h4>
               <NavLink to="/admin/intelligence" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                  <span className="icon">🌍</span> <span>Intelligence</span>
               </NavLink>
               <NavLink to="/admin/validation" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                  <span className="icon">🧠</span> <span>Validation</span>
               </NavLink>
            </div>

            <div className="nav-group mb-12">
               <h4 className="px-6 text-[10px] font-black text-slate-600 mb-6 uppercase tracking-[0.2em]">Financial Core</h4>
               <NavLink to="/admin/actuarial" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                  <span className="icon">📊</span> <span>Actuarial</span>
               </NavLink>
               <NavLink to="/admin/management" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                  <span className="icon">⚙️</span> <span>Management</span>
               </NavLink>
               <NavLink to="/admin/manual-review" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                  <span className="icon">📋</span> <span>Review Queue</span>
               </NavLink>
            </div>

            <div className="nav-group">
               <h4 className="px-6 text-[10px] font-black text-slate-600 mb-6 uppercase tracking-[0.2em]">System Telemetry</h4>
               <NavLink to="/admin/audit" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                  <span className="icon">📟</span> <span>Kafka Logs</span>
               </NavLink>
            </div>
         </nav>

         <div className="sidebar-footer p-10 bg-slate-900/30 border-t border-white/5 space-y-6">
            {currentEventState && (
               <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl text-orange-500 text-[10px] font-black animate-pulse flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(251,146,60,0.5)]"></span>
                  EVENT: {currentEventState.type}
               </div>
            )}
            <button className="btn btn-outline w-full py-4 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-white/5 transition-all" onClick={handleLogout}>Terminate Session</button>
         </div>
      </aside>

      {/* 🏢 Main Command Canvas (Full-Page Utilization) */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.03)_0%,transparent_50%)] pointer-events-none"></div>
        
        {/* 🛠️ Top Utility Bar (Professional Grade Enhancement) */}
         <header className="admin-top-bar h-24 border-b border-white/5 flex items-center justify-between px-16 bg-slate-900/40 backdrop-blur-xl z-40">
           <div className="flex items-center gap-10">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Connectivity</div>
              <div className="flex items-center gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                 <span className="text-[11px] font-bold text-slate-300">PARAMETRIC_ORACLE_01 [UP]</span>
              </div>
           </div>

           {/* Live Payout Ticker */}
           {payouts.length > 0 && (
             <div style={{ flex: 1, overflow: 'hidden', margin: '0 2rem', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '4px 12px', background: 'rgba(16,185,129,0.05)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#10B981', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                 <span style={{ color: '#F97316', marginRight: '4px' }}>⚡ LIVE</span>
                 {payouts.slice(-5).map((p, i) => (
                   <span key={p.id} style={{ marginRight: '24px' }}>TXN-{p.id?.slice(-4)} • ₹{p.amount} • {p.type?.replace(/_/g, ' ')} | </span>
                 ))}
               </div>
             </div>
           )}

           <div className="flex items-center gap-10">
              <div className="text-right">
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IST Time</div>
                 <div className="text-xs font-bold text-white tracking-widest">{time}</div>
              </div>
           </div>
        </header>

        <main className="admin-main flex-1 overflow-y-auto w-full relative z-10">
           <div className="container-premium py-20">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
