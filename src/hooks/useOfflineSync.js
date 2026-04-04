import { useEffect, useState } from 'react';

/**
 * useOfflineSync Hook
 * Manages local caching of presence data and automatic syncing when online.
 */
export const useOfflineSync = (userId) => {
  const [syncStatus, setSyncStatus] = useState('SYNCED');

  useEffect(() => {
    const handleSync = async () => {
      const cachedLogs = JSON.parse(localStorage.getItem(`offline_logs_${userId}`) || '[]');
      if (cachedLogs.length === 0) return;

      setSyncStatus('SYNCING');
      console.log(`[OfflineSync] Syncing ${cachedLogs.length} logs for user ${userId}...`);

      try {
        // Mock API call to sync logs
        await new Promise(resolve => setTimeout(resolve, 2000));
        localStorage.removeItem(`offline_logs_${userId}`);
        setSyncStatus('SYNCED');
        console.log(`[OfflineSync] Successfully synced.`);
      } catch (err) {
        setSyncStatus('FAILED');
      }
    };

    window.addEventListener('online', handleSync);
    return () => window.removeEventListener('online', handleSync);
  }, [userId]);

  const recordPresence = (location) => {
    if (!navigator.onLine) {
      const log = { timestamp: new Date().toISOString(), location };
      const currentLogs = JSON.parse(localStorage.getItem(`offline_logs_${userId}`) || '[]');
      localStorage.setItem(`offline_logs_${userId}`, JSON.stringify([...currentLogs, log]));
      setSyncStatus('PENDING_SYNC');
      console.log(`[OfflineSync] Recorded presence offline:`, log);
    }
  };

  return { syncStatus, recordPresence };
};
