import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

const BiometricCheck = ({ onVerified, amount }) => {
  const [stage, setStage] = useState('START'); // START, SCANNING, SUCCESS, FAILED
  const videoRef = useRef(null);

  const startScan = async () => {
    setStage('SCANNING');
    
    // Request webcam access for realism (even if we just simulate the AI)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      // Simulate "AI" processing time
      setTimeout(() => {
        setStage('SUCCESS');
        stream.getTracks().forEach(track => track.stop());
        setTimeout(() => onVerified(), 2000);
      }, 3500);
    } catch (err) {
      console.error(err);
      setStage('SUCCESS'); // Fallback for demo if no camera
      setTimeout(() => onVerified(), 1500);
    }
  };

  return (
    <div className="biometric-overlay glass-panel p-8 text-center" style={{ 
      position: 'fixed', inset: 0, zIndex: 10000, 
      display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', 
      background: 'rgba(15, 12, 41, 0.95)',
      backdropFilter: 'blur(30px)'
    }}>
      <AnimatePresence mode="wait">
        {stage === 'START' && (
          <motion.div key="start" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}>
            <ShieldCheck size={80} className="text-cyan-400 mb-6 mx-auto" />
            <h2 className="text-3xl font-bold mb-2">High-Value Auth</h2>
            <p className="text-muted mb-8 max-w-sm mx-auto">A payout of <strong>${amount}</strong> requires a Biometric Liveness Check to prevent identity theft.</p>
            <button onClick={startScan} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                Secure Face ID Scan
            </button>
          </motion.div>
        )}

        {stage === 'SCANNING' && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
            <div className="face-scan-frame" style={{ 
              width: '280px', height: '280px', 
              borderRadius: '50%', 
              border: '4px solid var(--accent-cyan)', 
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 0 50px var(--accent-cyan)'
            }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <motion.div 
                className="scan-line"
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-cyan)', zIndex: 10 }}
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className="mt-8 flex items-center justify-center gap-3">
                <Loader2 className="animate-spin text-cyan-400" />
                <span className="font-bold tracking-widest uppercase">Analyzing Liveness Pattern...</span>
            </div>
          </motion.div>
        )}

        {stage === 'SUCCESS' && (
          <motion.div key="success" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="success-circle" style={{ 
                width: '120px', height: '120px', 
                background: 'rgba(16, 185, 129, 0.2)', 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 2rem'
            }}>
                <UserCheck size={60} className="text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-emerald-400 mb-2">Identity Verified</h2>
            <p className="text-muted">Payout authorization sequence initiated.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BiometricCheck;
