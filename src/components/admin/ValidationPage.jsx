import React from 'react';
import { useSimulation } from '../../context/SimulationContext';

const ValidationPage = () => {
  const { sensorData, currentEventState } = useSimulation();

  return (
    <div className="validation-root fade-in">
      <header className="module-header flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20 px-2">
         <div className="max-w-3xl">
            <span className="text-[12px] font-black text-orange-500 uppercase tracking-[0.3em] mb-4 block">Causality Engine v2.1</span>
            <h1 className="module-title mb-4">Smart Validation</h1>
            <p className="module-subtitle text-lg">
               AI-driven causality analysis for external disruptions. 
               Cross-referencing hyper-local sensor telemetry with worker activity payloads.
            </p>
         </div>
         <div className="flex gap-4">
            <span className="badge info py-3 px-8 text-[11px] shadow-[0_0_20px_rgba(56,189,248,0.2)]">● ENGINE: ACTIVE</span>
         </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
         {/* 📊 Engine Status Card */}
         <div className="glass-panel p-12 bg-slate-900/60 border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32"></div>
            <h3 className="text-2xl font-black text-white mb-8">System Analytics</h3>
            <div className="flex flex-col gap-10">
               <div>
                  <div className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Confidence Threshold</div>
                  <div className="text-5xl font-black text-white tracking-tighter">82%</div>
                  <div className="h-2 bg-slate-800 mt-6 rounded-full overflow-hidden">
                     <div className="h-full bg-orange-500 shadow-[0_0_15px_rgba(251,146,60,0.5)]" style={{ width: '82%' }}></div>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5">
                     <div className="text-[9px] font-black text-slate-500 mb-2 uppercase tracking-widest">False Positives</div>
                     <div className="text-2xl font-black text-emerald-400">0.02%</div>
                  </div>
                  <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5">
                     <div className="text-[9px] font-black text-slate-500 mb-2 uppercase tracking-widest">Processing Time</div>
                     <div className="text-2xl font-black text-white">42ms</div>
                  </div>
               </div>
            </div>
         </div>

         {/* 📡 Sensor Feed Utilization */}
         <div className="glass-panel p-12 bg-slate-900/40 border-white/5 shadow-2xl flex flex-col group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-2xl font-black text-white mb-8">Telemetry Streams</h3>
            <div className="flex flex-col gap-6">
               <div className="p-8 bg-slate-950/80 rounded-3xl border border-white/5 flex justify-between items-center hover:scale-[1.02] transition-all">
                  <div>
                     <div className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Atmospheric PM2.5</div>
                     <div className="text-xl font-black text-white">{sensorData.aqi} AQI</div>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${sensorData.aqi > 200 ? 'bg-orange-500 pulse-glow' : 'bg-emerald-500'}`}></span>
               </div>
               <div className="p-8 bg-slate-950/80 rounded-3xl border border-white/5 flex justify-between items-center hover:scale-[1.02] transition-all">
                  <div>
                     <div className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Precipitation Node</div>
                     <div className="text-xl font-black text-white">{sensorData.rainfall.toFixed(2)}mm/h</div>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
               </div>
               <div className="p-8 bg-slate-950/80 rounded-3xl border border-white/5 flex justify-between items-center hover:scale-[1.02] transition-all opacity-50">
                  <div>
                     <div className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Traffic Congestion Index</div>
                     <div className="text-xl font-black text-white">LOW (1.2x)</div>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-slate-700"></span>
               </div>
            </div>
         </div>

         {/* 🛡️ Secure Verification Log */}
         <div className="glass-panel p-12 bg-slate-950/80 border-white/5 shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-8">
               <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <span className="text-2xl">🛡️</span>
               </div>
            </div>
            <h3 className="text-2xl font-black text-white mb-8">Identity Vault</h3>
            <div className="mt-4 space-y-6">
               <div className="p-6 bg-slate-900 rounded-2xl border-l-4 border-orange-500/50">
                  <div className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Audit Ref: #VLT-9284</div>
                  <p className="text-xs text-white leading-relaxed font-bold">
                     All worker telemetry is hashed with **SHA-256** and anchored to the local verification block. 
                     GDPR & DPDP Act 2023 Compliant.
                  </p>
               </div>
               <div className="flex-1 border-t border-white/5 pt-8 mt-4">
                   <div className="text-[10px] font-black text-slate-500 mb-6 uppercase tracking-widest">Live Activity Log</div>
                   <div className="space-y-4">
                      {currentEventState ? (
                         <div className="text-[11px] font-mono text-orange-500 animate-pulse">
                            &gt; TRIGGER DETECTED: {currentEventState.type}... <br/>
                            &gt; ANALYZING CAUSALITY NODES... <br/>
                            &gt; AWAITING WORKER PAYLOADS...
                         </div>
                      ) : (
                         <div className="text-[11px] font-mono text-emerald-500/50 italic">
                            &gt; IDLE: LISTENING FOR PARAMETRIC SIGNALS...
                         </div>
                      )}
                   </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ValidationPage;
