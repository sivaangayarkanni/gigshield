import React from 'react';

const PolicyTab = () => {

  const exclusions = [
    { title: 'Traffic Accidents', desc: 'Accidental vehicle damage or personal injury (Non-Parametric).' },
    { title: 'Mechanical Failure', desc: 'Vehicle-specific maintenance issues unrelated to external climate.' },
    { title: 'War & Terrorism', desc: 'Global geopolitical disruption beyond parametric local range.' },
    { title: 'Fraudulent Payload', desc: 'Spoofed telemetry or deliberate hazard proximity falsification.' },
  ];

  return (
    <div className="policy-tab-root fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
         {/* 📜 Digital Shield Certificate (Professional Site Grade) */}
         <div className="glass-panel p-16 bg-slate-900 border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10">
               <div className="w-40 h-40 border-[10px] border-white rounded-full"></div>
            </div>
            
            <header className="mb-16">
               <div className="flex justify-between items-start mb-10">
                  <h2 className="logo-text text-5xl font-black tracking-tighter">EarnSure v4.0</h2>
                  <span className="badge success py-3 px-8 text-[11px] shadow-[0_10px_30px_rgba(52,211,153,0.2)]">VERIFIED_ACTIVE</span>
               </div>
               <p className="text-slate-500 font-bold text-sm tracking-widest uppercase leading-loose">
                  Digital Parametric Resilience Certificate <br/>
                  <span className="text-white opacity-40 italic">#CERT-PRM-29402-2B</span>
               </p>
            </header>

            <div className="space-y-12">
               <div className="flex justify-between items-end border-b border-white/5 pb-10">
                  <div>
                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Coverage Limit (Per Event)</div>
                     <div className="text-4xl font-black text-white tracking-tighter">₹500.00</div>
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Trigger Accuracy</div>
                     <div className="text-2xl font-black text-emerald-500 tracking-tighter">99.8% Precision</div>
                  </div>
               </div>

               <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Parametric Conditions</div>
                  <ul className="space-y-5">
                     <li className="flex items-center gap-4 text-sm font-bold text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> 🌨️ Rainfall Intensity &gt; 12mm/hour
                     </li>
                     <li className="flex items-center gap-4 text-sm font-bold text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> 🌫️ AQI Index (PM2.5) &gt; 350 (Severe)
                     </li>
                     <li className="flex items-center gap-4 text-sm font-bold text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> 🚦 Traffic Gridlock Delay &gt; 45 mins
                     </li>
                  </ul>
               </div>

               <div className="pt-10 flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
                  <span>Underwritten by Oracle Core</span>
                  <span>Valid through 2026</span>
               </div>
            </div>
         </div>

         {/* ⚖️ Compliance & Exclusions (Page Utilization) */}
         <div className="flex flex-col gap-10">
            <section className="glass-panel p-12 bg-slate-900/40 border-white/5 shadow-2xl flex-1 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[120px] -mr-32 -mt-32"></div>
               <h3 className="text-2xl font-black text-white mb-4">Mandatory Exclusions</h3>
               <p className="text-sm text-slate-500 mb-12 font-bold leading-relaxed">
                  Refined parameters based on **IRDAI Industry Standards** and the **DPDP Act 2023**.
               </p>

               <div className="grid grid-cols-1 gap-8">
                  {exclusions.map(ex => (
                     <div key={ex.title} className="p-8 bg-slate-950/80 rounded-3xl border border-white/5 hover:border-white/10 transition-all group-hover:scale-[1.01]">
                        <div className="text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                           <span className="text-red-500 opacity-50">•</span> {ex.title}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-bold italic">{ex.desc}</p>
                     </div>
                  ))}
               </div>
            </section>

            <div className="glass-panel p-12 bg-slate-950/90 border-white/5 shadow-2xl text-center relative group overflow-hidden">
               <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <h4 className="text-xs font-black mb-6 uppercase tracking-[0.3em] text-blue-400">Sustainability Disclosure</h4>
               <p className="text-[11px] text-slate-500 leading-relaxed font-bold mb-8 italic px-4">
                  EarnSure maintains a **1:1.5 Solvency Margin**. Every payout is backstopped by global reinsurance liquidity pools.
               </p>
               <button className="btn btn-outline w-full py-4 text-[10px] font-black uppercase tracking-widest shadow-xl">Full T&C Document (PDF)</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PolicyTab;
