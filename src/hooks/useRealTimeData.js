import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

const API_BASE = 'http://localhost:5000/api/realtime';

/**
 * Custom hook for real-time weather, traffic, and trigger data
 */
export const useRealTimeData = (workerId, lat, lon, enabled = true) => {
  const socket = useSocket();
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState(null);
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Fetch initial weather data
  const fetchWeather = useCallback(async () => {
    if (!lat || !lon) return;
    
    try {
      const response = await axios.get(`${API_BASE}/weather`, {
        params: { lat, lon }
      });
      
      if (response.data.success) {
        setWeather(response.data.weather);
        setAqi(response.data.aqi);
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.message);
    }
  }, [lat, lon]);

  // Fetch traffic data
  const fetchTraffic = useCallback(async () => {
    if (!lat || !lon) return;
    
    try {
      const response = await axios.get(`${API_BASE}/traffic`, {
        params: { lat, lon }
      });
      
      if (response.data.success) {
        setTraffic(response.data.traffic);
      }
    } catch (err) {
      console.error('Traffic fetch error:', err);
    }
  }, [lat, lon]);

  // Fetch forecast
  const fetchForecast = useCallback(async () => {
    if (!lat || !lon) return;
    
    try {
      const response = await axios.get(`${API_BASE}/forecast`, {
        params: { lat, lon }
      });
      
      if (response.data.success) {
        setForecast(response.data.forecast);
      }
    } catch (err) {
      console.error('Forecast fetch error:', err);
    }
  }, [lat, lon]);

  // Reverse geocode location
  const fetchLocation = useCallback(async () => {
    if (!lat || !lon) return;
    
    try {
      const response = await axios.get(`${API_BASE}/geocode`, {
        params: { lat, lon }
      });
      
      if (response.data.success) {
        setLocation(response.data.location);
      }
    } catch (err) {
      console.error('Geocode error:', err);
    }
  }, [lat, lon]);

  // Start real-time monitoring
  const startMonitoring = useCallback(async () => {
    if (!workerId || !lat || !lon || !socket) return;
    
    try {
      await axios.post(`${API_BASE}/monitor/start`, {
        workerId,
        lat,
        lon
      });
      
      setIsMonitoring(true);
      console.log('Real-time monitoring started');
    } catch (err) {
      console.error('Failed to start monitoring:', err);
      setError(err.message);
    }
  }, [workerId, lat, lon, socket]);

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    if (!workerId) return;
    
    try {
      await axios.post(`${API_BASE}/monitor/stop`, {
        workerId
      });
      
      setIsMonitoring(false);
      console.log('Monitoring stopped');
    } catch (err) {
      console.error('Failed to stop monitoring:', err);
    }
  }, [workerId]);

  // Initial data fetch
  useEffect(() => {
    if (!enabled || !lat || !lon) return;

    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchWeather(),
        fetchTraffic(),
        fetchForecast(),
        fetchLocation()
      ]);
      setLoading(false);
    };

    loadInitialData();
  }, [enabled, lat, lon, fetchWeather, fetchTraffic, fetchForecast, fetchLocation]);

  // Start monitoring when enabled
  useEffect(() => {
    if (enabled && workerId && lat && lon && socket && !isMonitoring) {
      startMonitoring();
    }

    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [enabled, workerId, lat, lon, socket]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Weather updates
    socket.on('weather_update', (data) => {
      setWeather(data);
      if (data.aqi) {
        setAqi({ aqi: data.aqi, ...data.aqiDetails });
      }
    });

    // Traffic updates
    socket.on('traffic_update', (data) => {
      setTraffic(data);
    });

    // Trigger alerts
    socket.on('trigger_alert', (data) => {
      setTriggers(prev => [...data, ...prev].slice(0, 10));
    });

    // Instant payout notifications
    socket.on('instant_payout', (data) => {
      console.log('Instant payout received:', data);
    });

    // Payout rejected
    socket.on('payout_rejected', (data) => {
      console.log('Payout rejected:', data);
    });

    // Claim review
    socket.on('claim_review', (data) => {
      console.log('Claim flagged for review:', data);
    });

    return () => {
      socket.off('weather_update');
      socket.off('traffic_update');
      socket.off('trigger_alert');
      socket.off('instant_payout');
      socket.off('payout_rejected');
      socket.off('claim_review');
    };
  }, [socket]);

  // Periodic refresh (every 30 seconds)
  useEffect(() => {
    if (!enabled || !lat || !lon) return;

    const interval = setInterval(() => {
      fetchWeather();
      fetchTraffic();
    }, 30000);

    return () => clearInterval(interval);
  }, [enabled, lat, lon, fetchWeather, fetchTraffic]);

  return {
    weather,
    aqi,
    traffic,
    forecast,
    location,
    triggers,
    loading,
    error,
    isMonitoring,
    refresh: () => {
      fetchWeather();
      fetchTraffic();
      fetchForecast();
    },
    startMonitoring,
    stopMonitoring
  };
};

export default useRealTimeData;
