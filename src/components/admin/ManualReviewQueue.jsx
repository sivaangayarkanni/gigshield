import React from 'react';
import { useSimulation } from '../../context/SimulationContext';

const ManualReviewQueue = () => {
  const { manualReviewQueue, handleManualReview, pastClaims } = useSimulation();

  return (
    <div className="manual-review-root fade-in">
      <header className="module-header flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20 px-2">
         <div className="max-w-3xl">
            <span className="text-[12px] font-black text-orange-500 uppercase tracking-[0.3em] mb-4 block">Hybrid Adjudication v1.4</span>
            <h1 className="module-title mb-4">Review Queue</h1>
            <p className="module-subtitle text-lg">
               AI-assisted manual verification for complex disruption payloads. 
               Cross-referencing evidence metadata with national risk telemetry.
            </p>
         </div>
         <div className="flex gap-4">
            <span className="badge warning py-3 px-8 text-[11px] shadow-[0_0_20px_rgba(251,191,36,0.1)]">
               {manualReviewQueue.length} TASKS PENDING
            </span>
         </div>
      </header>

      <div className="glass-panel p-0 bg-slate-900/40 border-white/5 shadow-2xl relative overflow-hidden">
         <div className="px-10 py-10 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Ingestion Pipeline</h3>
            <div className="flex items-center gap-4 text-xs font-black text-slate-500 uppercase tracking-widest">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Queue Stream
            </div>
         </div>
         
         <div className="overflow-x-auto">
            {manualReviewQueue.length === 0 ? (
               <div className="py-40 text-center text-slate-600">
                  <div className="text-8xl mb-8 opacity-20 group-hover:scale-110 transition-transform">🕒</div>
                  <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Queue Status: Null Set.</p>
                  <p className="text-[11px] mt-4 font-bold text-slate-500">No telemetry signals require manual adjudication.</p>
               </div>
            ) : (
               <table className="review-table w-full border-collapse">
                  <thead>
                     <tr className="border-b border-white/5 bg-slate-950/40">
                        <th className="text-left py-10 px-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Rider Entity</th>
                        <th className="text-left py-10 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Evidence Metadata</th>
                        <th className="text-left py-10 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Geospatial Signal</th>
                        <th className="text-left py-10 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">AI Confidence</th>
                        <th className="text-right py-10 px-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {manualReviewQueue.map(claim => (
                        <tr key={claim.id} className="hover:bg-slate-800/20 transition-all group">
                           <td className="py-12 px-10">
                              <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 bg-slate-800 rounded-3xl flex items-center justify-center font-black text-orange-500 border border-white/10 group-hover:border-orange-500/30 transition-all shadow-xl">
                                    {claim.riderName.charAt(0)}
                                 </div>
                                 <div>
                                    <div className="font-black text-white text-lg tracking-tight">{claim.riderName}</div>
                                    <div className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-widest leading-none">{claim.platform} PARTNER</div>
                                 </div>
                              </div>
                           </td>
                           <td className="py-12 px-8">
                              <div className="flex flex-col gap-2">
                                 <span className="badge info text-[9px] px-3 w-fit leading-none shadow-[0_0_15px_rgba(56,189,248,0.1)]">📸 {claim.type} CAPTURE</span>
                                 <div className="text-[11px] font-bold text-slate-400 mt-1 italic opacity-70">encrypted_vault_id: {claim.id.slice(0,8)}...</div>
                              </div>
                           </td>
                           <td className="py-12 px-8">
                              <div className="text-[12px] font-black text-white tracking-widest">
                                 {claim.lat.toFixed(5)}, {claim.lon.toFixed(5)}
                              </div>
                              <div className={`text-[10px] font-bold mt-2 uppercase tracking-tighter flex items-center gap-2 ${claim.distance > 5 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                                 <span className="w-1.5 h-1.5 rounded-full bg-current"></span> {claim.distance > 5 ? `SEC_ALERT: ${claim.distance.toFixed(1)}KM OUT` : `Proximity Verified: ${claim.distance.toFixed(1)}km`}
                              </div>
                           </td>
                           <td className="py-12 px-8">
                              <div className="flex flex-col gap-3">
                                 <div className="text-xl font-black text-white tracking-tighter">82.4%</div>
                                 <div className="h-1.5 w-32 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-orange-500 shadow-[0_0_15px_rgba(251,146,60,0.4)]" style={{ width: '82%' }}></div>
                                 </div>
                              </div>
                           </td>
                           <td className="py-12 px-10">
                              <div className="flex justify-end gap-3">
                                 <button 
                                   className="btn btn-primary text-[11px] px-6 py-4 font-black shadow-[0_10px_20px_rgba(251,146,60,0.1)] hover:shadow-orange-500/20" 
                                   onClick={() => handleManualReview(claim.id, true)}
                                 >
                                    Approve
                                 </button>
                                 <button 
                                   className="btn btn-outline text-[11px] px-6 py-4 border-red-500/20 text-red-500 hover:bg-red-500/10 font-black" 
                                   onClick={() => handleManualReview(claim.id, false)}
                                 >
                                    Reject
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}
         </div>
      </div>

      {pastClaims.length > 0 && (
         <div className="mt-32">
            <div className="flex justify-between items-end mb-12 px-2">
               <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 block">Persistence Hub</span>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">Recent Adjudications</h2>
               </div>
               <div className="h-px bg-white/5 flex-1 mx-12 hidden lg:block"></div>
               <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{pastClaims.length} Decision Logs</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-10">
               {pastClaims.map(claim => (
                  <div key={claim.id} className="glass-panel p-8 bg-slate-900/40 border-white/5 shadow-xl flex flex-col gap-8 transition-all hover:scale-[1.02]">
                     <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center font-black text-slate-500 border border-white/5">
                           {claim.riderName.charAt(0)}
                        </div>
                        <span className={`badge ${claim.status === 'PAID' ? 'success' : 'danger'} text-[9px] shadow-[0_10px_20px_rgba(0,0,0,0.3)]`}>
                           {claim.status === 'PAID' ? 'SETTLED' : 'DENIED'}
                        </span>
                     </div>
                     <div>
                        <div className="text-base font-black text-white mb-2">{claim.riderName}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                           {claim.platform} <span className="opacity-30">•</span> {claim.timestamp}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
};

export default ManualReviewQueue;
