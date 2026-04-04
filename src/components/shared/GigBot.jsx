import React, { useState, useEffect, useRef } from 'react';
import './GigBot.css';
import { useSimulation } from '../../context/SimulationContext';

const GigBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am GigBot 🤖. Need help with a parametric claim, active disruptions, or bank details?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const { currentEventState } = useSimulation();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentEventState) {
      setMessages(prev => [...prev, { sender: 'bot', text: `🚨 ALERT: A ${currentEventState} has been triggered in your zone. If you have an active policy, ₹500 is being verified for auto-payout to your bank account.` }]);
    }
  }, [currentEventState]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    
    const lowerInput = input.toLowerCase();
    
    setInput('');
    setTimeout(async () => {
      let botReply = "I am processing your query...";
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
        try {
           const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               contents: [{
                 role: 'user',
                 parts: [{ text: `You are EarnSureBot, an expert parametric insurance AI agent for the EarnSure platform. Be extremely concise. The user says: ${input}` }]
               }]
             })
           });
           const data = await response.json();
           if (data.candidates && data.candidates[0]) {
              botReply = data.candidates[0].content.parts[0].text;
           } else { throw new Error('Invalid format'); }
        } catch(e) {
           console.error("LLM Error:", e);
           botReply = "My LLM connection failed. Falling back to local inference grids...";
        }
      } else {
        // Advanced Agentic Heuristic Simulator Fallback
        const intents = {
           claim: ['claim', 'money', 'paid', 'payout', 'compensation', 'reimbursement', 'cash'],
           weather: ['rain', 'disruption', 'weather', 'flood', 'aqi', 'heat', 'hot', 'storm', 'cyclone', 'traffic', 'jam'],
           bank: ['bank', 'account', 'wallet', 'withdraw', 'transfer', 'balance', 'upi'],
           technical: ['how', 'why', 'what', 'system', 'contract', 'smart', 'blockchain', 'api', 'agent'],
           greeting: ['hello', 'hi', 'hey', 'yo', 'morning', 'evening', 'help']
        };

        const score = (category) => intents[category].filter(word => lowerInput.includes(word)).length;

        let topScore = 0;
        let topIntent = 'unknown';

        Object.keys(intents).forEach(category => {
           const currentScore = score(category);
           if (currentScore > topScore) { topScore = currentScore; topIntent = category; }
        });

        if (topScore === 0) {
          if (lowerInput.length < 5) botReply = "Please provide more details. I am listening.";
          else botReply = "As an autonomous agent, I am continually scanning the telemetry grid. While I don't perfectly understand that command, I guarantee if a weather anomaly triggers in your exact GPS zone, you get paid automatically.";
        } else {
          if (topIntent === 'claim') botReply = "EarnSure's parametric protocol removes the need for human claims. The moment a registered disruption occurs at your live GPS tag, 100% of the capital is instantly released via UPI.";
          else if (topIntent === 'weather') botReply = `My local sensor nodes near your position (${currentEventState?.city || 'your zone'}) are active. We look for AQI > 300, Rain > 50mm, or extreme temperature barriers to execute smart-contract payouts.`;
          else if (topIntent === 'bank') botReply = "I directly interface with your linked bank. Right now, your configured vector is STATE BANK OF INDIA (XXXX-1234). The current wallet balance is instantly withdrawable.";
          else if (topIntent === 'technical') botReply = "I operate as a high-frequency logic agent. I cross-reference weather API data against your real-time node position. If parameters match, I bypass human review completely.";
          else if (topIntent === 'greeting') botReply = "Hello! I am EarnSureBot, your autonomous logic engine. I continuously watch the Indian cloud/weather vectors to protect your earnings. What do you need?";
        }
      }
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 400);
  };

  return (
    <div className="gigbot-wrapper">
      {!isOpen && (
        <button className="gigbot-toggle wobble" onClick={() => setIsOpen(true)}>
          <span className="blob">🤖</span>
        </button>
      )}

      {isOpen && (
        <div className="gigbot-window glass-panel">
          <div className="gigbot-header">
            <div className="gigbot-title">
              <span className="gigbot-status-dot pulse"></span>
              <h4>EarnSureBot <span style={{fontSize:'10px', color:'var(--accent-orange)'}}>AI</span></h4>
            </div>
            <button className="gigbot-close" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="gigbot-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`gigmessage-row ${m.sender === 'user' ? 'user-row' : 'bot-row'}`}>
                {m.sender === 'bot' && <div className="bot-avatar">🤖</div>}
                <div className={`gigmessage ${m.sender === 'user' ? 'message-user' : 'message-bot'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="gigbot-input-area">
            <input 
              type="text" 
              placeholder="Ask about your coverage..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="btn-send" onClick={handleSend}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GigBot;
