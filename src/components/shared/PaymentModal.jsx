import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ShieldCheck, Lock, Loader2, CheckCircle } from 'lucide-react';

const PaymentModal = ({ plan, onComplete, onCancel }) => {
  const [stage, setStage] = useState('PAY'); // PAY, PROCESSING, COMPLETE
  const [cardData, setCardData] = useState({ number: '**** **** **** 4242', expiry: '12/28', cvc: '***' });

  const handlePay = () => {
    setStage('PROCESSING');
    setTimeout(() => {
      setStage('COMPLETE');
      setTimeout(() => onComplete(), 2000);
    }, 3000);
  };

  return (
    <div className="payment-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="payment-card glass-panel w-full max-w-md p-8 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {stage === 'PAY' && (
            <motion.div key="pay" exit={{ x: -100, opacity: 0 }}>
              <div className="flex justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold">Quantum Pay</h3>
                  <p className="text-xs text-muted">Securing your coverage...</p>
                </div>
                <Lock className="text-emerald-500" />
              </div>

              <div className="plan-summary mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex justify-between text-sm mb-1">
                  <span>Selected Plan:</span>
                  <span className="font-bold">{plan.name}</span>
                </div>
                <div className="flex justify-between text-xl font-black">
                  <span>Total Due:</span>
                  <span className="text-cyan-400">${plan.price}/mo</span>
                </div>
              </div>

              <div className="form-group mb-6">
                <label className="text-xs uppercase tracking-widest opacity-60 mb-2 block">Card Details</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={cardData.number} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pt-6 font-mono text-lg"
                    readOnly
                  />
                  <CreditCard className="absolute top-1/2 -translate-y-1/2 right-4 opacity-40" />
                </div>
              </div>

              <div className="flex gap-4 mb-10">
                <div className="w-1/2">
                   <input type="text" value={cardData.expiry} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-center" readOnly />
                </div>
                <div className="w-1/2">
                   <input type="text" value={cardData.cvc} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-center" readOnly />
                </div>
              </div>

              <button 
                onClick={handlePay}
                className="w-full btn btn-primary py-4 font-black tracking-widest text-lg"
              >
                AUTHORIZE & SECURE
              </button>
              <button 
                onClick={onCancel}
                className="w-full mt-4 text-xs opacity-50 hover:opacity-100 transition-all font-bold"
              >
                CANCEL SECURE SESSION
              </button>
            </motion.div>
          )}

          {stage === 'PROCESSING' && (
            <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <Loader2 className="animate-spin text-cyan-400 mx-auto mb-6" size={60} />
              <h4 className="text-xl font-bold tracking-widest">ENCRYPTING TRANSACTION</h4>
              <p className="text-xs opacity-50 mt-2">Routing through Quantum-Secure gateway...</p>
            </motion.div>
          )}

          {stage === 'COMPLETE' && (
            <motion.div key="done" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-16 text-center">
              <CheckCircle size={80} className="text-emerald-400 mx-auto mb-6" />
              <h4 className="text-2xl font-black">PAYMENT SUCCESS</h4>
              <p className="text-muted">Protection Shield Active.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
    </div>
  );
};

export default PaymentModal;
