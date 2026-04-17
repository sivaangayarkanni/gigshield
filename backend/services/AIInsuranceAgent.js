const axios = require('axios');

/**
 * AIInsuranceAgent - Advanced AI chatbot specialized for EarnSure
 * Features:
 * - Live weather and location awareness
 * - Insurance policy expertise
 * - Parametric trigger analysis
 * - Personalized recommendations
 * - Multi-language support
 */
class AIInsuranceAgent {
  constructor(weatherService, trafficService) {
    this.weatherService = weatherService;
    this.trafficService = trafficService;
    this.conversationHistory = new Map();
    this.userContext = new Map();
  }

  /**
   * Process user message with full context awareness
   */
  async processMessage(userId, message, context = {}) {
    try {
      // Get or create conversation history
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, []);
      }
      const history = this.conversationHistory.get(userId);

      // Get user context (location, weather, policies)
      const userCtx = await this.getUserContext(userId, context);

      // Build enhanced prompt with live data
      const enhancedPrompt = await this.buildEnhancedPrompt(message, userCtx, history);

      // Get AI response (using Gemini API)
      const aiResponse = await this.getAIResponse(enhancedPrompt, context.geminiApiKey);

      // Store in history
      history.push({ role: 'user', content: message, timestamp: new Date() });
      history.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });

      // Keep only last 20 messages
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      return {
        response: aiResponse,
        context: userCtx,
        suggestions: this.generateSuggestions(message, userCtx)
      };
    } catch (error) {
      console.error('[AIAgent] Error:', error.message);
      return {
        response: this.getFallbackResponse(message, context),
        context: {},
        suggestions: []
      };
    }
  }

  /**
   * Get comprehensive user context
   */
  async getUserContext(userId, context) {
    const userCtx = {
      userId,
      timestamp: new Date().toISOString(),
      location: null,
      weather: null,
      aqi: null,
      traffic: null,
      policies: context.policies || [],
      claims: context.claims || [],
      starRating: context.starRating || 3,
      walletBalance: context.walletBalance || 0,
      isOnline: context.isOnline || false
    };

    // Get live location data
    if (context.lat && context.lon) {
      userCtx.location = {
        lat: context.lat,
        lon: context.lon
      };

      // Fetch live weather
      try {
        const weather = await this.weatherService.getWeatherData(context.lat, context.lon);
        const aqi = await this.weatherService.getAQIData(context.lat, context.lon);
        const geocode = await this.weatherService.reverseGeocode(context.lat, context.lon);

        userCtx.weather = weather;
        userCtx.aqi = aqi;
        userCtx.location.city = geocode?.city || 'Unknown';
        userCtx.location.state = geocode?.state || 'Unknown';
      } catch (error) {
        console.error('[AIAgent] Weather fetch error:', error.message);
      }

      // Fetch live traffic
      try {
        const traffic = await this.trafficService.monitorZoneTraffic(context.lat, context.lon);
        userCtx.traffic = traffic;
      } catch (error) {
        console.error('[AIAgent] Traffic fetch error:', error.message);
      }
    }

    return userCtx;
  }

  /**
   * Build enhanced prompt with live context
   */
  async buildEnhancedPrompt(message, userCtx, history) {
    const systemPrompt = `You are EarnSureBot, an advanced AI insurance agent for EarnSure - India's first parametric insurance platform for gig workers.

**Your Expertise:**
- Parametric insurance mechanics and instant payouts
- Weather-based risk assessment and triggers
- Traffic and AQI monitoring
- SRAP (Smart Rating Adjustment Protocol)
- Fraud detection and claim verification
- Financial literacy for gig workers

**Your Personality:**
- Professional yet friendly and empathetic
- Proactive in identifying risks
- Data-driven and precise
- Supportive of gig workers' financial wellbeing
- Use emojis sparingly but effectively
- ALWAYS provide specific location details when asked
- Show exact coordinates when relevant

**Current User Context:**
${this.formatUserContext(userCtx)}

**Conversation Guidelines:**
1. Always acknowledge live conditions when relevant
2. Provide specific, actionable advice
3. Explain parametric triggers in simple terms
4. Alert users to potential payout opportunities
5. Be concise but comprehensive (2-4 sentences max)
6. Use Indian context and terminology
7. Mention specific numbers (₹ amounts, thresholds, ratings)
8. When asked about location, provide city name AND coordinates
9. Include weather/AQI data with location responses

**Key Information:**
- AQI Trigger: ≥300 (Critical air quality)
- Rain Trigger: ≥50mm (Heavy rainfall)
- Heat Trigger: ≥42°C (Extreme heat)
- Traffic Trigger: ≥3.0x normal (Severe congestion)

**SRAP Payout Tiers:**
- 5⭐ Platinum: ₹750/event
- 4⭐ Gold: ₹625/event
- 3⭐ Silver: ₹500/event
- 2⭐ Bronze: ₹350/event
- 1⭐ Probation: ₹0 (suspended)

User Message: "${message}"

Respond naturally and helpfully based on the context above.`;

    return systemPrompt;
  }

  /**
   * Format user context for AI prompt
   */
  formatUserContext(ctx) {
    let contextStr = '';

    if (ctx.location) {
      if (ctx.location.city) {
        contextStr += `📍 Location: ${ctx.location.city}, ${ctx.location.state || 'India'}\n`;
      }
      if (ctx.location.lat && ctx.location.lon) {
        contextStr += `📍 Coordinates: ${ctx.location.lat.toFixed(4)}°N, ${ctx.location.lon.toFixed(4)}°E\n`;
      }
    }

    if (ctx.weather) {
      contextStr += `🌡️ Temperature: ${ctx.weather.temperature}°C\n`;
      contextStr += `🌧️ Rainfall: ${ctx.weather.precipitation}mm\n`;
      contextStr += `💨 Wind: ${ctx.weather.windSpeed} km/h\n`;
      contextStr += `💧 Humidity: ${ctx.weather.humidity}%\n`;
    }

    if (ctx.aqi) {
      const aqiStatus = ctx.aqi.aqi >= 300 ? '🔴 CRITICAL' : ctx.aqi.aqi >= 200 ? '🟠 UNHEALTHY' : '🟢 MODERATE';
      contextStr += `🏭 AQI: ${ctx.aqi.aqi} ${aqiStatus}\n`;
    }

    if (ctx.traffic) {
      const trafficStatus = ctx.traffic.avgLatency >= 3.0 ? '🔴 SEVERE' : ctx.traffic.avgLatency >= 2.0 ? '🟠 HIGH' : '🟢 NORMAL';
      contextStr += `🚦 Traffic: ${ctx.traffic.avgLatency}x ${trafficStatus}\n`;
    }

    contextStr += `⭐ Rating: ${ctx.starRating}/5 stars\n`;
    contextStr += `💰 Wallet: ₹${ctx.walletBalance}\n`;
    contextStr += `📱 Status: ${ctx.isOnline ? 'Online' : 'Offline'}\n`;

    if (ctx.policies && ctx.policies.length > 0) {
      contextStr += `🛡️ Active Policies: ${ctx.policies.length}\n`;
    }

    if (ctx.claims && ctx.claims.length > 0) {
      contextStr += `📋 Recent Claims: ${ctx.claims.length}\n`;
    }

    return contextStr;
  }

  /**
   * Get AI response from Gemini API
   */
  async getAIResponse(prompt, apiKey) {
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      throw new Error('Gemini API key not configured');
    }

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500
          }
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data.candidates && response.data.candidates[0]) {
        return response.data.candidates[0].content.parts[0].text;
      }

      throw new Error('Invalid API response format');
    } catch (error) {
      console.error('[AIAgent] Gemini API error:', error.message);
      throw error;
    }
  }

  /**
   * Generate contextual suggestions
   */
  generateSuggestions(message, context) {
    const suggestions = [];

    // Weather-based suggestions
    if (context.weather) {
      if (context.weather.precipitation >= 30) {
        suggestions.push('Check rain trigger status');
      }
      if (context.weather.temperature >= 38) {
        suggestions.push('View heat protection coverage');
      }
    }

    // AQI-based suggestions
    if (context.aqi && context.aqi.aqi >= 250) {
      suggestions.push('AQI alert - Check eligibility');
    }

    // Traffic-based suggestions
    if (context.traffic && context.traffic.avgLatency >= 2.5) {
      suggestions.push('Traffic surge detected');
    }

    // Rating-based suggestions
    if (context.starRating < 3) {
      suggestions.push('Improve rating for higher payouts');
    }

    // Generic helpful suggestions
    if (suggestions.length === 0) {
      suggestions.push('View my policies', 'Check wallet balance', 'Recent claims');
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Fallback response when AI is unavailable
   */
  getFallbackResponse(message, context) {
    const lowerMsg = message.toLowerCase();

    // Location queries
    if (lowerMsg.includes('location') || lowerMsg.includes('where am i') || lowerMsg.includes('my location') || lowerMsg.includes('current location')) {
      if (context.location && context.location.city) {
        return `📍 Your current location:\n\n**City:** ${context.location.city}, ${context.location.state || ''}\n**Coordinates:** ${context.lat?.toFixed(4)}°N, ${context.lon?.toFixed(4)}°E\n\n${context.weather ? `Current conditions:\n🌡️ ${context.weather.temperature}°C\n🌧️ ${context.weather.precipitation}mm rainfall\n🏭 AQI: ${context.aqi?.aqi || 'N/A'}` : 'Fetching weather data...'}`;
      }
      return 'I can see your location once you enable GPS permissions. Please allow location access in your browser settings.';
    }

    // Intent detection
    if (lowerMsg.includes('weather') || lowerMsg.includes('rain') || lowerMsg.includes('temperature')) {
      if (context.weather) {
        return `Current conditions in ${context.location?.city || 'your area'}:\n\n🌡️ Temperature: ${context.weather.temperature}°C\n🌧️ Rainfall: ${context.weather.precipitation}mm\n💨 Wind: ${context.weather.windSpeed} km/h\n💧 Humidity: ${context.weather.humidity}%\n\n${context.weather.precipitation >= 50 ? '🚨 Heavy rain trigger threshold met! You may be eligible for instant payout.' : 'Weather is within normal parameters.'}`;
      }
      return 'I can provide live weather updates. Please ensure location access is enabled.';
    }

    if (lowerMsg.includes('aqi') || lowerMsg.includes('air quality') || lowerMsg.includes('pollution')) {
      if (context.aqi) {
        return `Current AQI: ${context.aqi.aqi}. ${context.aqi.aqi >= 300 ? '🚨 Critical AQI! Parametric trigger activated. Payout processing...' : context.aqi.aqi >= 200 ? '⚠️ Unhealthy air quality. Monitor for trigger threshold (300+).' : 'Air quality is acceptable.'}`;
      }
      return 'I can check real-time AQI levels. Please enable location access.';
    }

    if (lowerMsg.includes('traffic') || lowerMsg.includes('congestion') || lowerMsg.includes('jam')) {
      if (context.traffic) {
        return `Traffic latency: ${context.traffic.avgLatency}x normal. ${context.traffic.avgLatency >= 3.0 ? '🚨 Severe congestion! Traffic trigger activated.' : 'Traffic conditions are manageable.'}`;
      }
      return 'I can monitor live traffic conditions in your area.';
    }

    if (lowerMsg.includes('claim') || lowerMsg.includes('payout') || lowerMsg.includes('money')) {
      return `Your current tier (${context.starRating}⭐) qualifies for ₹${this.getPayoutAmount(context.starRating)} per parametric event. Payouts are instant when triggers are met: AQI≥300, Rain≥50mm, Heat≥42°C, or Traffic≥3.0x.`;
    }

    if (lowerMsg.includes('rating') || lowerMsg.includes('star') || lowerMsg.includes('tier')) {
      return `You're at ${context.starRating}⭐ (${this.getTierName(context.starRating)}). Higher ratings unlock better payouts: 5⭐=₹750, 4⭐=₹625, 3⭐=₹500, 2⭐=₹350. Keep delivering excellent service!`;
    }

    if (lowerMsg.includes('wallet') || lowerMsg.includes('balance') || lowerMsg.includes('withdraw')) {
      return `Your wallet balance: ₹${context.walletBalance}. You can withdraw anytime with zero fees via UPI. Payouts are credited instantly when parametric triggers activate.`;
    }

    if (lowerMsg.includes('policy') || lowerMsg.includes('coverage') || lowerMsg.includes('protection')) {
      return `EarnSure provides parametric protection against weather disruptions, air quality hazards, extreme heat, and traffic congestion. No paperwork needed - payouts are automatic when conditions meet trigger thresholds.`;
    }

    if (lowerMsg.includes('how') || lowerMsg.includes('work') || lowerMsg.includes('what')) {
      return `EarnSure uses real-time data from weather APIs and GPS to detect when you're affected by severe conditions. When triggers activate (AQI≥300, Rain≥50mm, etc.), instant payouts are released to your wallet automatically. No claims, no waiting!`;
    }

    // Default response
    return `I'm EarnSureBot, your AI insurance assistant. I can help with:\n• Live weather & AQI monitoring\n• Parametric trigger status\n• Payout eligibility\n• Policy information\n• Rating & tier benefits\n\nWhat would you like to know?`;
  }

  /**
   * Get payout amount by star rating
   */
  getPayoutAmount(rating) {
    const payouts = { 5: 750, 4: 625, 3: 500, 2: 350, 1: 0 };
    return payouts[rating] || 500;
  }

  /**
   * Get tier name by star rating
   */
  getTierName(rating) {
    const tiers = { 5: 'Platinum', 4: 'Gold', 3: 'Silver', 2: 'Bronze', 1: 'Probation' };
    return tiers[rating] || 'Silver';
  }

  /**
   * Clear conversation history
   */
  clearHistory(userId) {
    this.conversationHistory.delete(userId);
  }

  /**
   * Get conversation history
   */
  getHistory(userId) {
    return this.conversationHistory.get(userId) || [];
  }
}

module.exports = AIInsuranceAgent;
