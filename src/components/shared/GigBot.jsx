import React, { useState, useEffect, useRef } from 'react';
import './GigBot.css';
import { useSimulation } from '../../context/SimulationContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { MapPin, Cloud, Wind, Activity, Zap, TrendingUp, Shield, AlertCircle } from 'lucide-react';

const GigBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: '👋 Hi! I\'m EarnSureBot, your AI insurance assistant. I have access to live weather, AQI, and traffic data for your location. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [liveContext, setLiveContext] = useState(null);
  const chatEndRef = useRef(null);
  const socket = useSocket();
  
  const { 
    currentEventState, 
    workerState, 
    sensorData, 
    riderCoords, 
    isOnline,
    walletBalance,
    activeCity
  } = useSimulation();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update live context when data changes
  useEffect(() => {
    setLiveContext({
      lat: riderCoords[0],
      lon: riderCoords[1],
      weather: {
        temperature: sensorData.temperature,
        precipitation: sensorData.rainfall,
        windSpeed: sensorData.windSpeed,
        humidity: sensorData.humidity
      },
      aqi: {
        aqi: sensorData.aqi
      },
      traffic: {
        avgLatency: sensorData.trafficLatency
      },
      starRating: workerState?.starRating || 3,
      walletBalance: walletBalance,
      isOnline: isOnline,
      city: activeCity,
      policies: workerState?.policyActive ? [{ type: 'PARAMETRIC', status: 'ACTIVE' }] : [],
      claims: []
    });
  }, [riderCoords, sensorData, workerState, walletBalance, isOnline, activeCity]);

  // Listen for real-time events
  useEffect(() => {
    if (!socket) return;

    socket.on('instant_payout', (data) => {
      const msg = {
        sender: 'bot',
        text: `🎉 Instant Payout Alert!\n\n₹${data.amount} has been credited to your wallet!\n\nTrigger: ${data.trigger}\nRating: ${data.starRating}⭐ ${data.starLabel}\n\nYour new balance: ₹${walletBalance + data.amount}`,
        timestamp: new Date(),
        type: 'payout'
      };
      setMessages(prev => [...prev, msg]);
    });

    socket.on('trigger_alert', (triggers) => {
      triggers.forEach(trigger => {
        const msg = {
          sender: 'bot',
          text: `⚠️ Parametric Trigger Detected!\n\n${trigger.message}\n\nSeverity: ${trigger.severity}\n\nI'm monitoring this situation. If conditions persist, you may be eligible for an instant payout.`,
          timestamp: new Date(),
          type: 'alert'
        };
        setMessages(prev => [...prev, msg]);
      });
    });

    socket.on('payout_rejected', (data) => {
      const msg = {
        sender: 'bot',
        text: `❌ Payout Status Update\n\n${data.reason}\n\nNeed help improving your rating? I can provide tips!`,
        timestamp: new Date(),
        type: 'warning'
      };
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('instant_payout');
      socket.off('trigger_alert');
      socket.off('payout_rejected');
    };
  }, [socket, walletBalance]);

  // Auto-alert on severe conditions
  useEffect(() => {
    if (!liveContext) return;

    const alerts = [];
    
    if (liveContext.aqi.aqi >= 300) {
      alerts.push('🚨 Critical AQI detected! You may be eligible for instant payout.');
    }
    if (liveContext.weather.precipitation >= 50) {
      alerts.push('🌧️ Heavy rainfall alert! Parametric trigger threshold met.');
    }
    if (liveContext.weather.temperature >= 42) {
      alerts.push('🔥 Extreme heat warning! Heat protection coverage active.');
    }
    if (liveContext.traffic.avgLatency >= 3.0) {
      alerts.push('🚦 Severe traffic congestion! Traffic trigger activated.');
    }

    if (alerts.length > 0 && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const timeSinceLastMsg = Date.now() - new Date(lastMsg.timestamp).getTime();
      
      // Only send alert if last message was more than 30 seconds ago
      if (timeSinceLastMsg > 30000) {
        alerts.forEach(alert => {
          setMessages(prev => [...prev, {
            sender: 'bot',
            text: alert,
            timestamp: new Date(),
            type: 'alert'
          }]);
        });
      }
    }
  }, [liveContext?.aqi?.aqi, liveContext?.weather?.precipitation, liveContext?.weather?.temperature, liveContext?.traffic?.avgLatency]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      sender: 'user', 
      text: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Call AI chatbot API
      const response = await axios.post('http://localhost:5000/api/chatbot/message', {
        userId: workerState?.id || 'guest',
        message: input,
        context: {
          ...liveContext,
          geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY
        }
      });

      setIsTyping(false);

      if (response.data.success) {
        const botMessage = {
          sender: 'bot',
          text: response.data.response,
          timestamp: new Date(),
          context: response.data.context
        };
        setMessages(prev => [...prev, botMessage]);
        
        if (response.data.suggestions) {
          setSuggestions(response.data.suggestions);
        }
      } else {
        throw new Error('API response unsuccessful');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setIsTyping(false);
      
      // Fallback response
      const fallbackMsg = {
        sender: 'bot',
        text: getFallbackResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    }
  };

  const getFallbackResponse = (msg) => {
    const lowerMsg = msg.toLowerCase();

    if (lowerMsg.includes('weather') || lowerMsg.includes('rain')) {
      return `Current weather in ${activeCity}:\n🌡️ ${sensorData.temperature}°C\n🌧️ ${sensorData.rainfall}mm rainfall\n💨 ${sensorData.windSpeed} km/h wind\n\n${sensorData.rainfall >= 50 ? '⚠️ Heavy rain trigger threshold met!' : 'Weather conditions are normal.'}`;
    }

    if (lowerMsg.includes('aqi') || lowerMsg.includes('air') || lowerMsg.includes('pollution')) {
      return `Current AQI: ${sensorData.aqi}\n\n${sensorData.aqi >= 300 ? '🚨 CRITICAL! Parametric trigger activated.' : sensorData.aqi >= 200 ? '⚠️ Unhealthy air quality.' : '✅ Air quality is acceptable.'}`;
    }

    if (lowerMsg.includes('traffic')) {
      return `Traffic latency: ${sensorData.trafficLatency}x normal\n\n${sensorData.trafficLatency >= 3.0 ? '🚨 Severe congestion! Trigger activated.' : 'Traffic is manageable.'}`;
    }

    if (lowerMsg.includes('payout') || lowerMsg.includes('money') || lowerMsg.includes('claim')) {
      const rating = workerState?.starRating || 3;
      const payouts = { 5: 750, 4: 625, 3: 500, 2: 350, 1: 0 };
      return `Your ${rating}⭐ rating qualifies for ₹${payouts[rating]} per parametric event.\n\nTriggers:\n• AQI ≥ 300\n• Rain ≥ 50mm\n• Heat ≥ 42°C\n• Traffic ≥ 3.0x\n\nPayouts are instant and automatic!`;
    }

    return `I'm your AI insurance assistant with access to:\n\n📍 Live location tracking\n🌤️ Real-time weather data\n🏭 AQI monitoring\n🚦 Traffic analysis\n💰 Payout calculations\n\nWhat would you like to know?`;
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const LiveDataPanel = () => {
    if (!liveContext) return null;

    return (
      <div className="live-data-panel">
        <div className="live-data-header">
          <Activity size={14} className="pulse-icon" />
          <span>Live Data</span>
        </div>
        <div className="live-data-grid">
          <div className="data-item">
            <MapPin size={12} />
            <span>{liveContext.city}</span>
          </div>
          <div className="data-item">
            <Cloud size={12} />
            <span>{liveContext.weather.temperature}°C</span>
          </div>
          <div className="data-item">
            <Wind size={12} />
            <span>{liveContext.weather.precipitation}mm</span>
          </div>
          <div className={`data-item ${liveContext.aqi.aqi >= 300 ? 'critical' : ''}`}>
            <AlertCircle size={12} />
            <span>AQI {liveContext.aqi.aqi}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="gigbot-wrapper">
      {!isOpen && (
        <button className="gigbot-toggle wobble" onClick={() => setIsOpen(true)}>
          <span className="blob">🤖</span>
          {liveContext && (liveContext.aqi.aqi >= 300 || liveContext.weather.precipitation >= 50) && (
            <span className="alert-badge pulse">!</span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="gigbot-window glass-panel">
          <div className="gigbot-header">
            <div className="gigbot-title">
              <span className="gigbot-status-dot pulse"></span>
              <div>
                <h4>EarnSureBot <span className="ai-badge">AI</span></h4>
                <span className="subtitle">Powered by Gemini 2.0</span>
              </div>
            </div>
            <button className="gigbot-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <LiveDataPanel />

          <div className="gigbot-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`gigmessage-row ${m.sender === 'user' ? 'user-row' : 'bot-row'}`}>
                {m.sender === 'bot' && <div className="bot-avatar">🤖</div>}
                <div className={`gigmessage ${m.sender === 'user' ? 'message-user' : 'message-bot'} ${m.type || ''}`}>
                  {m.text}
                  {m.timestamp && (
                    <span className="message-time">
                      {new Date(m.timestamp).toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="gigmessage-row bot-row">
                <div className="bot-avatar">🤖</div>
                <div className="gigmessage message-bot typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {suggestions.length > 0 && (
            <div className="suggestions-bar">
              {suggestions.map((sug, idx) => (
                <button 
                  key={idx} 
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(sug)}
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          <div className="gigbot-input-area">
            <input
              type="text"
              placeholder="Ask about weather, claims, coverage..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isTyping}
            />
            <button className="btn-send" onClick={handleSend} disabled={isTyping}>
              {isTyping ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GigBot;
