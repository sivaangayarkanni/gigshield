import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { Bell, ShieldCheck, DollarSign, Smartphone } from 'lucide-react';

const MobileToast = () => {
  const socket = useSocket();
  const [activeNotification, setActiveNotification] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handlePayout = (data) => {
      showNotification({
        title: '💵 Payout Received!',
        body: `Instant transfer: $${data.amount} for ${data.reason}`,
        type: 'PAYOUT'
      });
    };

    const handleOTP = (data) => {
      showNotification({
        title: '🔐 SecurPass OTP',
        body: `Your EarnSure Code: ${data.otp}`,
        type: 'OTP'
      });
    };

    const handleApproved = (data) => {
      showNotification({
        title: '✅ Claim Approved',
        body: `Parametric payout of $${data.amount} authorized.`,
        type: 'SUCCESS'
      });
    };

    socket.on('payout_received', handlePayout);
    socket.on('otp_received', handleOTP);
    socket.on('claim_approved', handleApproved);

    return () => {
      socket.off('payout_received', handlePayout);
      socket.off('otp_received', handleOTP);
      socket.off('claim_approved', handleApproved);
    };
  }, [socket]);

  const showNotification = (notif) => {
    setActiveNotification(notif);
    setTimeout(() => setActiveNotification(null), 8000); // 8 second display
  };

  return (
    <AnimatePresence>
      {activeNotification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 20, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="mobile-toast-container"
        >
          <div className="mobile-toast-wrapper glass-panel">
            <div className="toast-icon-box">
              {activeNotification.type === 'OTP' && <ShieldCheck className="icon-gold" />}
              {activeNotification.type === 'PAYOUT' && <DollarSign className="icon-emerald" />}
              {activeNotification.type === 'SUCCESS' && <Bell className="icon-cyan" />}
            </div>
            <div className="toast-content">
              <h4>{activeNotification.title}</h4>
              <p>{activeNotification.body}</p>
            </div>
            <div className="toast-dismiss">
                <Smartphone size={16} />
                <span>Now</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileToast;
