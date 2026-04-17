import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import NationalRiskMap from '../shared/NationalRiskMap';

const IntelligencePage = () => {
  const { fireTrigger, currentEventState, activeCity, setActiveCity, sensorData, realWeatherMode } = useSimulation();
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { from: 'bot', text: 'Risk Analyst online. Ask me: "Should we trigger for Mumbai?", "What is the AQI risk level?", or "Analyze current conditions."' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiQuery = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages(prev => [...prev, { from: 'user', text: userMsg }]);
    setAiInput('');
    setAiLoading(true);

    const context = `Current sensor data: AQI=${sensorData.aqi}, Rain=${sensorData.rainfall}mm, Temp=${sensorData.temperature}°C, Traffic=${sensorData.trafficLatency}x, City=${activeCity}, RealWeather=${realWeatherMode}`;
    const prompt = `You are a parametric insurance risk analyst for EarnSure India. ${context}. Admin asks: ${userMsg}. Give a direct, concise risk recommendation in 2-3 sentences. Use ₹ for currency. Focus on whether payout should be triggered.`;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis incomplete.';
        setAiMessages(prev => [...prev, { from: 'bot', text: reply }]);
      } catch(e) { 
        console.error("Intelligence Portal Connectivity Issue:", e);
        // -- PREMIUM LOCALIZED RISK PROCESSOR FALLBACK --
        let localReply = `⚠️ [LOCAL RISK PROCESSOR ACTIVE]: Gemini API unavailable. Falling back to edge actuarial logic. \n\nAnalysis for ${activeCity}: Telemetry indicates `;
        if (sensorData.aqi > 300) localReply += `SEVERE hazard depth (AQI ${sensorData.aqi}). Recommendation: TRIGGER_PAYOUT_AQI.`;
        else if (sensorData.rainfall > 40) localReply += `CRITICAL precipitation intensity (${sensorData.rainfall}mm). Recommendation: TRIGGER_PAYOUT_PRECIP.`;
        else localReply += `STABLE environment. Current metadata does not meet parametric trigger thresholds. Recommendation: MAINTAIN_MONITORING.`;
        
        setAiMessages(prev => [...prev, { from: 'bot', text: localReply }]); 
      }
    } else {
      // -- PURE HEURISTIC MODE --
      let reply = `[EDGE NODE]: Based on live telemetry in ${activeCity}, `;
      const lower = userMsg.toLowerCase();
      if (lower.includes('trigger') || lower.includes('payout') || lower.includes('advice') || lower.includes('risk')) {
        if (sensorData.aqi > 300) reply += `✅ RECOMMENDED ACTION: AQI at ${sensorData.aqi} is hazardous. Initiate automated payout protocol. Total exposure: High.`;
        else if (sensorData.rainfall > 50) reply += `✅ RECOMMENDED ACTION: Rainfall at ${sensorData.rainfall}mm exceeds safety barrier. Execute parametric release.`;
        else reply += `⚖️ NO ACTION REQUIRED: Environmental parameters are within the 1:1.5 solvency safety margin.`;
      } else {
        reply = `I am analyzing the telemetry grid for ${activeCity}. Ask me about specific triggers, AQI conditions, rainfall risk, or overall risk status.`;
      }
      setTimeout(() => { setAiMessages(prev => [...prev, { from: 'bot', text: reply }]); setAiLoading(false); }, 800);
      return;
    }
    setAiLoading(false);
  };

  const cityList = [
    'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
    'Ahmedabad', 'Pune', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
    'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam'
  ];

  const triggers = [
     { type: 'SEVERE AQI (PM2.5)', label: '🌫️ AQI ALERT', color: '#FBBF24', desc: 'Broadcast to respiratory safety zones.' },
     { type: 'HEAVY RAIN / FLOOD', label: '⛈️ FLOOD RISK', color: '#60A5FA', desc: 'Roads unsafe for two-wheelers.' },
     { type: 'GRIDLOCK', label: '🚦 GRIDLOCK', color: '#F87171', desc: 'Latency affecting logistics income.' },
  ];

  return (
    <div className="intelligence-root fade-in">
      <header className="module-header flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20 px-2">
         <div className="max-w-3xl">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span className="text-[12px] font-black text-orange-500 uppercase tracking-[0.3em]">National Telemetry Nodes v4.0</span>
              {realWeatherMode && (
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#10B981', padding: '2px 8px', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '4px', letterSpacing: '0.05em' }}>📡 LIVE OPEN-METEO DATA</span>
              )}
            </div>
            <h1 className="module-title mb-4">Operational Intelligence</h1>
            <p className="module-subtitle text-lg">
               State-of-the-art GIS Monitoring and Parametric Trigger Broadcaster. 
               Manage national-scale risk events with sub-second propagation.
            </p>
         </div>
         <div className="flex gap-6 w-full lg:w-auto justify-end">
            <div className="glass-panel w-auto inline-flex p-4 px-10 items-center justify-between gap-10 bg-slate-900/80 border-white/5 shadow-2xl">
               <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Active Cluster</span>
               <select 
                 className="bg-transparent font-black text-base text-white outline-none border-none cursor-pointer appearance-none"
                 value={activeCity}
                 onChange={(e) => setActiveCity(e.target.value)}
               >
                  {cityList.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
               </select>
               <span className="text-orange-500 text-xs">▼</span>
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 2xl:grid-cols-4 gap-12 mt-10" style={{ minHeight: '700px' }}>
         {/* 🌍 GIS MAP (Main Command Canvas - Expanded) */}
         <div className="2xl:col-span-3 glass-panel overflow-hidden relative border-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
            <NationalRiskMap height="100%" showRider={true} />
            
            {/* Professional Telemetry Overlay */}
            <div className="absolute top-10 left-10 z-[1000] flex flex-col gap-6">
               <div className="glass-panel p-8 bg-slate-950/90 overlay-blur border-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-l-4 border-orange-500/50">
                  <div className="text-[11px] font-black text-slate-500 mb-6 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> SYSTEM HEALTH: NOMINAL
                  </div>
                  <div className="flex gap-16">
                     <div className="text-left">
                        <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">LOCAL AQI SCALE</div>
                        <div className={`text-4xl font-black ${sensorData.aqi > 250 ? 'text-orange-500' : 'text-white'} tracking-tighter`}>{sensorData.aqi}</div>
                        <div className="text-[9px] font-black text-emerald-500/50 mt-1 uppercase tracking-widest">Calibrated</div>
                     </div>
                     <div className="text-left">
                        <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">PRECIPITATION</div>
                        <div className="text-4xl font-black text-white tracking-tighter">{sensorData.rainfall.toFixed(2)}<span className="text-lg opacity-30">mm</span></div>
                        <div className="text-[9px] font-black text-emerald-500/50 mt-1 uppercase tracking-widest">Real-time</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* ⚡ TRIGGER CORE (Sized for Full Utilization) */}
         <div className="flex flex-col gap-10">
            <section className="glass-panel p-12 bg-slate-900/60 border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex-1 flex flex-col relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] -mr-32 -mt-32"></div>
               <h3 className="text-2xl font-black text-white mb-3">Trigger Engine</h3>
               <p className="text-sm text-slate-500 mb-12 font-bold leading-relaxed">
                  Initiate parametric events for the **{activeCity}** grid nodes.
               </p>
               
               <div className="flex flex-col gap-8">
                  {triggers.map(t => (
                    <button 
                      key={t.type} 
                      className="trigger-action-btn glass-panel p-6 flex flex-col items-start gap-2 h-auto w-full transition-all hover:border-orange-500/50 hover:bg-orange-500/10 disabled:opacity-30 group/btn border-white/5 text-left relative overflow-hidden"
                      onClick={() => fireTrigger(t.type, 'THRESHOLD_EXCEEDED')}
                      disabled={!!currentEventState}
                    >
                       <div className="flex justify-between w-full items-center relative z-10 mb-2">
                          <span className="text-[11px] font-black tracking-widest" style={{ color: t.color }}>{t.label}</span>
                          <span className="text-white/20 group-hover/btn:text-orange-500 transition-colors">↗</span>
                       </div>
                       <div className="relative z-10 w-full text-left flex flex-col">
                          <span className="text-base font-black text-white mb-1 uppercase tracking-tight group-hover/btn:text-white transition-colors">{t.type}</span>
                          <span className="text-[11px] text-slate-500 font-bold leading-relaxed">{t.desc}</span>
                       </div>
                    </button>
                  ))}
               </div>

               <div className="mt-auto bg-slate-950/80 p-8 rounded-3xl border border-white/5 shadow-inner">
                  <div className="flex justify-between items-center mb-6">
                     <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Network Propagation</span>
                     <span className="badge success shadow-[0_0_15px_rgba(52,211,153,0.3)]">● SECURE</span>
                  </div>
                  <p className="text-[12px] text-slate-400 leading-relaxed font-bold">
                     Broadcasting over **Encrypted 256-bit UDP Tunnel** to 14,240 edge nodes. 
                     Expected latency: **&lt;14ms**.
                  </p>
               </div>
            </section>
          </div>
       </div>

       {/* 🤖 AI Risk Analyst Panel */}
       <div className="mt-20">
          <div className="flex items-center gap-6 mb-12">
             <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-500 font-bold">03</div>
             <h2 className="text-3xl font-black tracking-tight">AI Risk Analyst</h2>
             <div className="h-px flex-1 bg-white/5"></div>
             <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700, padding: '4px 10px', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '6px' }}>🤖 Powered by GigBot Intelligence</span>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(6,182,212,0.03)', border: '1px solid rgba(6,182,212,0.1)' }}>
            <div style={{ height: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem' }}>
              {aiMessages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.from === 'user' ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${msg.from === 'user' ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: msg.from === 'user' ? '#F97316' : 'var(--text-primary)',
                }}>
                  {msg.text}
                </div>
              ))}
              {aiLoading && (
                <div style={{ alignSelf: 'flex-start', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '16px 16px 16px 4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Analyzing telemetry grid...
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiQuery()}
                placeholder={`Analyze ${activeCity} conditions... or ask about triggers`}
                style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none' }}
              />
              <button
                onClick={handleAiQuery}
                disabled={!aiInput.trim() || aiLoading}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', minWidth: '100px' }}
              >
                Analyze
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {['Should we trigger for ' + activeCity + '?', 'Analyze current conditions', 'What is the AQI risk?', 'Rainfall status?'].map(q => (
                <button key={q} onClick={() => { setAiInput(q); }} style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
       </div>
    </div>
  );
};


export default IntelligencePage;
