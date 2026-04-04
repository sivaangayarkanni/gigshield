import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudLightning, Map as MapIcon, Navigation, Wind } from 'lucide-react';

const WeatherRadar = () => {
    const [scanPulse, setScanPulse] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setScanPulse(prev => (prev + 1) % 100);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="weather-radar-container glass-panel slide-in-left p-6">
            <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <MapIcon className="text-cyan-400" style={{ color: 'var(--accent-cyan)' }} />
                    Live Weather Radar
                </h3>
                <div className="flex items-center gap-2 text-xs" style={{ display: 'flex', gap: '0.5rem', opacity: 0.7 }}>
                    <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)' }}></div>
                    <span>LIVE: DELHI NCR ZONE</span>
                </div>
            </div>

            <div className="radar-map-wrapper" style={{ 
                position: 'relative', 
                height: '300px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '16px', 
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)'
            }}>
                {/* Simulated Radar Sweep */}
                <motion.div 
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '400px',
                        height: '400px',
                        background: 'conic-gradient(from 0deg, rgba(147, 129, 255, 0.4) 0deg, transparent 90deg)',
                        transformOrigin: 'top left',
                        borderRadius: '50%',
                        zIndex: 2
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* Grid Lines */}
                <div style={{ 
                    position: 'absolute', inset: 0, 
                    backgroundImage: 'radial-gradient(circle, rgba(147, 129, 255, 0.1) 1px, transparent 1px)', 
                    backgroundSize: '40px 40px',
                    opacity: 0.5
                }}></div>

                {/* Active Storm Zones */}
                <div style={{ 
                    position: 'absolute', top: '30%', left: '40%', 
                    width: '60px', height: '60px', 
                    background: 'rgba(244, 63, 94, 0.2)', 
                    borderRadius: '50%',
                    filter: 'blur(10px)',
                    zIndex: 1,
                    animation: 'pulse 2s infinite'
                }}></div>
                <CloudLightning className="text-rose-500" style={{ position: 'absolute', top: '33%', left: '43%', zIndex: 3, color: 'var(--accent-rose)' }} size={24} />

                {/* Worker Position */}
                <div style={{ 
                    position: 'absolute', top: '60%', left: '50%', 
                    zIndex: 5
                }}>
                    <Navigation size={20} className="text-emerald-400" style={{ transform: 'rotate(45deg)', filter: 'drop-shadow(0 0 10px var(--accent-emerald))', color: 'var(--accent-emerald)' }} />
                    <span style={{ fontSize: '0.6rem', position: 'absolute', top: '20px', whiteSpace: 'nowrap' }}>YOU (PROTECTED)</span>
                </div>
            </div>

            <div className="radar-stats grid grid-cols-2 gap-4 mt-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
                <div className="radar-stat flex items-center gap-3 p-3 glass-panel" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px' }}>
                    <Wind size={18} className="text-violet-400" />
                    <div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>WIND SPEED</div>
                        <div style={{ fontWeight: 700 }}>24 KM/H</div>
                    </div>
                </div>
                <div className="radar-stat flex items-center gap-3 p-3 glass-panel" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px' }}>
                    <CloudLightning size={18} className="text-rose-400" />
                    <div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>STORM CHANCE</div>
                        <div style={{ fontWeight: 700 }}>82% (SEVERE)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherRadar;
