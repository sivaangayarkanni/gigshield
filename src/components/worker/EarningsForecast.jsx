import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, ShieldCheck, AlertTriangle, CloudRain, Sun } from 'lucide-react';

const EarningsForecast = () => {
  const [forecast, setForecast] = useState({
    predictedLoss: 45,
    insuranceCoverage: 40,
    netRisk: 5,
    riskLevel: 'MODERATE',
    recommendation: "Moderate rain predicted. Your Surge Gap protection is active."
  });

  // Mock data simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setForecast({
        predictedLoss: 120,
        insuranceCoverage: 110,
        netRisk: 10,
        riskLevel: 'SEVERE',
        recommendation: "Severe Storm Warning! Automated payouts are enabled for all active deliveries."
      });
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="forecast-card glass-panel scale-in">
      <div className="flex justify-between items-start mb-6" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingDown className="text-rose-500" style={{ color: 'var(--accent-rose)' }} />
            Earnings-at-Risk Forecast
          </h3>
          <p className="text-sm text-muted" style={{ color: 'var(--text-muted)' }}>Next 24 Hours Analysis</p>
        </div>
        <div className={`badge ${forecast.riskLevel === 'SEVERE' ? 'danger' : 'warning'}`}>
          {forecast.riskLevel} RISK
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="stat-group">
          <label style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase' }}>Predicted Loss</label>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-rose)' }}>₹{forecast.predictedLoss}</div>
        </div>
        <div className="stat-group">
          <label style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase' }}>GigShield Coverage</label>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>+₹{forecast.insuranceCoverage}</div>
        </div>
        <div className="stat-group">
          <label style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase' }}>Your Net Risk</label>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{forecast.netRisk}</div>
        </div>
      </div>

      <div className="risk-meter">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: forecast.riskLevel === 'SEVERE' ? '90%' : '50%' }}
          className={forecast.riskLevel === 'SEVERE' ? 'risk-level-severe' : 'risk-level-moderate'}
          transition={{ duration: 1 }}
        />
      </div>

      <div className="recommendation-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {forecast.riskLevel === 'SEVERE' ? <AlertTriangle style={{ color: 'var(--accent-gold)' }} /> : <ShieldCheck style={{ color: 'var(--accent-cyan)' }} />}
        <p style={{ fontSize: '0.85rem' }}>{forecast.recommendation}</p>
      </div>
    </div>
  );
};

export default EarningsForecast;
