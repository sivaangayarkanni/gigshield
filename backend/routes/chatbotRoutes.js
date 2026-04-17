const express = require('express');
const router = express.Router();

/**
 * AI Chatbot API endpoints
 */

// Process chat message
router.post('/message', async (req, res) => {
  try {
    const { userId, message, context } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'User ID and message required' });
    }

    const aiAgent = req.app.get('aiAgent');
    const geminiApiKey = process.env.GEMINI_API_KEY || context?.geminiApiKey;

    const result = await aiAgent.processMessage(userId, message, {
      ...context,
      geminiApiKey
    });

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Chatbot] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      response: 'I apologize, but I encountered an error. Please try again.'
    });
  }
});

// Get conversation history
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const aiAgent = req.app.get('aiAgent');
    const history = aiAgent.getHistory(userId);

    res.json({
      success: true,
      history,
      count: history.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear conversation history
router.delete('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const aiAgent = req.app.get('aiAgent');
    aiAgent.clearHistory(userId);

    res.json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chatbot status and capabilities
router.get('/status', (req, res) => {
  try {
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    
    res.json({
      success: true,
      status: 'online',
      capabilities: {
        liveWeather: true,
        liveAQI: true,
        liveTraffic: true,
        geocoding: true,
        aiPowered: hasGeminiKey,
        contextAware: true,
        multiLanguage: false // Can be enabled
      },
      model: hasGeminiKey ? 'Gemini 2.0 Flash' : 'Rule-based fallback',
      features: [
        'Real-time weather monitoring',
        'AQI and pollution tracking',
        'Traffic congestion analysis',
        'Parametric trigger detection',
        'Personalized recommendations',
        'Insurance policy guidance',
        'Claim status tracking',
        'SRAP tier information'
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
