import React from 'react';
import { useSimulation } from '../../context/SimulationContext';

const AuditLogsPage = () => {
  const { logs } = useSimulation();

  return (
    <div className="audit-logs-root fade-in">
      <header className="module-header flex justify-between items-center mb-12">
         <div>
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2 block">Immutable Kafka Telemetry</span>
            <h1 className="module-title mb-1">Event Streams</h1>
            <p className="module-subtitle">Real-time System-wide Audit Trail and Broker Broker Diagnostics.</p>
         </div>
         <div className="flex gap-4">
            <div className="badge success pulse shadow-[0_0_10px_rgba(52,211,153,0.3)]">● CLUSTER PROXIMITY ON</div>
         </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 mt-10">
         
         {/* 📟 KAFKA TERMINAL (Main Feed) */}
         <div className="xl:col-span-2 glass-panel p-0 bg-slate-900 border-none shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
            <div className="p-5 bg-slate-950/80 border-b border-white/5 flex justify-between items-center z-10">
               <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
               </div>
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] italic">ear-prod-cluster-01 // Kafka v3.4</span>
            </div>
            
            <div className="kafka-logs overflow-y-auto flex-1 p-10 font-mono scrollbar-hide bg-slate-950/20">
               {logs.map(log => (
                  <div key={log.id} className={`log-entry ${log.type} mb-4 flex gap-8 items-start opacity-0 animate-in fade-in slide-in-from-left duration-500`}>
                     <span className="text-[10px] font-black text-slate-600 w-24 shrink-0 tracking-tighter">{log.timestamp}</span>
                     <span className="text-[11px] font-bold leading-relaxed">{log.message}</span>
                  </div>
               ))}
               {logs.length === 0 && (
                  <div className="p-32 text-center text-slate-800 italic text-xs font-black uppercase tracking-[0.3em]">
                     Listening for Event Packets...
                  </div>
               )}
            </div>
         </div>

         {/* ⚙️ COMPLIANCE & SECURITY (Sidebar) */}
         <div className="flex flex-col gap-10">
            
            <section className="glass-panel p-10 bg-slate-900/40 border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all"></div>
               <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                  <span className="text-blue-400">🔒</span> Compliance Node
               </h3>
               <div className="flex flex-col gap-8">
                  <div className="flex items-start gap-5">
                     <span className="text-2xl">⚖️</span>
                     <div>
                        <div className="text-xs font-black text-white uppercase tracking-widest">DPDP Act 2023</div>
                        <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Global PII Masking: 100%</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-5">
                     <span className="text-2xl">🛰️</span>
                     <div>
                        <div className="text-xs font-black text-white uppercase tracking-widest">GIS Integrity</div>
                        <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">AES-256 Geo Encryption</p>
                     </div>
                  </div>
               </div>
            </section>

            <section className="glass-panel p-10 bg-slate-950/50 border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl -ml-16 -mb-16"></div>
               <h3 className="text-lg font-black text-white mb-4">API Webhooks</h3>
               <p className="text-[10px] leading-relaxed text-slate-500 font-bold mb-8 uppercase tracking-widest">
                  Active Consumed Endpoints
               </p>
               <div className="p-6 bg-slate-900 rounded-2xl text-[10px] font-black border border-white/5 text-emerald-400/80 shadow-inner">
                  POST /webhooks/payout_settlements <br/>
                  GET /api/v2/national_risk_grid
               </div>
            </section>

         </div>

      </div>
    </div>
  );
};

export default AuditLogsPage;
