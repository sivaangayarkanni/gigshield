import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import './NotificationSystem.css';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="notification-container">
        {notifications.map(n => (
          <div key={n.id} className={`notification-toast ${n.type} slide-in-bottom`}>
            <div className="notification-icon">
              {n.type === 'success' && '✅'}
              {n.type === 'error' && '🚫'}
              {n.type === 'warning' && '⚠️'}
              {n.type === 'info' && '💎'}
            </div>
            <div className="notification-content">
              <div className="notification-message">{n.message}</div>
            </div>
            <button className="notification-close" onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}>
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
