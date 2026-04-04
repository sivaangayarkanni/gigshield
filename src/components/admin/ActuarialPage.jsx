import React from 'react';

const ActuarialPage = () => {

  const sustainabilityStats = [
    { label: 'Loss Ratio (YTD)', value: '64.2%', trend: '-2.1%', status: 'optimal' },
    { label: 'Burn Rate (Global)', value: '₹1.2M', trend: 'Nominal', status: 'optimal' },
    { label: 'Risk Exposure Cap', value: '84%', trend: '+4%', status: 'warning' },
    { label: 'Sustainability Index', value: '0.92', trend: '+0.05', status: 'optimal' },
  ];

  return (
    <div className="actuarial-root fade-in">
      <header className="module-header flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20 px-2">
         <div className="max-w-3xl">
            <span className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 block">Actuarial Analytics v4.2</span>
            <h1 className="module-title mb-4">Financial Core</h1>
            <p className="module-subtitle text-lg">
               Real-time solvency monitoring and risk sustainability modeling. 
               Cross-referencing parametric payout velocity with reserve health.
            </p>
         </div>
         <div className="flex gap-4">
            <div className="glass-panel py-4 px-10 flex items-center gap-6 bg-slate-900 border-white/5 shadow-2xl">
               <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Reserves Status</span>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                  <span className="text-white font-black text-sm tracking-tight font-mono">STABLE_EQUILIBRIUM</span>
               </div>
            </div>
         </div>
      </header>

      {/* 📈 Sustainability Grid (Full Utilization) */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-10 mb-20">
         {sustainabilityStats.map(stat => (
            <div key={stat.label} className="glass-panel p-10 bg-slate-900/40 border-white/5 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all">
               <div className={`absolute top-0 right-0 w-32 h-32 ${stat.status === 'optimal' ? 'bg-emerald-500/5' : 'bg-orange-500/5'} blur-3xl -mr-16 -mt-16`}></div>
               <span className="text-[10px] font-black text-slate-500 mb-6 block uppercase tracking-[0.2em]">{stat.label}</span>
               <div className="flex items-baseline gap-4 mb-4">
                  <div className="text-5xl font-black text-white tracking-tighter">{stat.value}</div>
                  <div className={`text-xs font-black px-2 py-1 rounded-lg ${stat.trend.includes('-') || stat.trend === 'Nominal' || stat.status === 'optimal' ? 'text-emerald-500 bg-emerald-500/10' : 'text-orange-500 bg-orange-500/10'}`}>
                     {stat.trend}
                  </div>
               </div>
               <div className="h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.status === 'optimal' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-orange-500 shadow-[0_0_15px_rgba(251,146,60,0.5)]'}`} style={{ width: stat.value.includes('%') ? stat.value : '90%' }}></div>
               </div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 mt-10">
         {/* 📊 Payout Velocity (Analytics Canvas) */}
         <div className="xl:col-span-2 glass-panel p-12 bg-slate-900/60 border-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.6)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12">
               <div className="flex gap-4">
                  <span className="badge info border-none">WEEKLY VIEW</span>
                  <span className="badge info bg-transparent border border-white/10 opacity-30">MONTHLY</span>
               </div>
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Payout Velocity Index</h3>
            <p className="text-sm text-slate-500 mb-16 font-bold leading-relaxed">Real-time parametric settlement throughput across all verified disruption nodes.</p>
            
            {/* Mock Chart Area (High Fidelity) */}
            <div className="relative h-[400px] flex items-end gap-3 px-2">
               {[40, 55, 30, 45, 70, 50, 65, 40, 80, 55, 45, 60].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group/bar">
                     <div 
                       className="w-full bg-slate-800 rounded-2xl group-hover/bar:bg-orange-500 transition-all cursor-crosshair relative shadow-inner" 
                       style={{ height: `${h}%` }}
                     >
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 px-3 py-1 rounded-lg text-[10px] font-black text-white opacity-0 group-hover/bar:opacity-100 transition-all border border-white/10 shadow-2xl">
                           ₹{(h * 10).toFixed(0)}K
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-orange-500/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                     </div>
                     <span className="text-[10px] font-black text-slate-600 mt-6 uppercase tracking-widest transform -rotate-45 lg:rotate-0">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'][i]}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* ⚖️ Solvency Parameters */}
         <div className="flex flex-col gap-10">
            <section className="glass-panel p-12 bg-slate-950/80 border-white/5 shadow-2xl flex-1 flex flex-col relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32"></div>
               <h3 className="text-2xl font-black text-white mb-8">Solvency Guard</h3>
               
               <div className="space-y-10">
                  <div className="p-8 bg-slate-900 rounded-3xl border border-white/5 relative group/item hover:border-emerald-500/30 transition-all">
                     <div className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Global Payout Cap (24h)</div>
                     <div className="text-3xl font-black text-white tracking-tighter">₹4,25,000</div>
                     <p className="text-[10px] text-slate-600 mt-3 font-bold italic line-clamp-2">Systemic throttle engaged if intra-day volatility exceeds 12%.</p>
                     <div className="absolute top-8 right-8 text-emerald-500/20 text-4xl font-black group-hover/item:text-emerald-500 transition-all">⚖️</div>
                  </div>
                  
                  <div className="p-8 bg-slate-900 rounded-3xl border border-white/5 relative group/item hover:border-blue-500/30 transition-all">
                     <div className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Reinsurance Activation</div>
                     <div className="text-3xl font-black text-white tracking-tighter">LEVEL_01</div>
                     <p className="text-[10px] text-slate-600 mt-3 font-bold italic line-clamp-2">Autonomous backstopping via global partner pool (AXA/Munich Re Mocks).</p>
                     <div className="absolute top-8 right-8 text-blue-500/20 text-4xl font-black group-hover/item:text-blue-500 transition-all">🌐</div>
                  </div>
               </div>

               <div className="mt-auto bg-slate-900/40 p-8 rounded-3xl border border-white/5 shadow-inner">
                  <div className="flex justify-between items-center mb-6">
                     <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Actuarial Sync</span>
                     <span className="badge info text-[10px] py-1 shadow-[0_0_10px_rgba(56,189,248,0.2)]">● SYNCED</span>
                  </div>
                  <p className="text-[12px] text-slate-400 leading-relaxed font-bold">
                     Reserve calculations verified by **Real-Time Actuarial Oracle**. 
                     Next re-balance in **4h 12m**.
                  </p>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};

export default ActuarialPage;
