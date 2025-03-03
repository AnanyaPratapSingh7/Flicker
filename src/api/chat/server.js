/**
 * OpenRouter AI Chat Proxy Endpoint
 * 
 * This is an implementation of a proxy endpoint for the OpenRouter API.
 * It processes chat requests and forwards them to OpenRouter while keeping API keys secure.
 */
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Helper function to get environment variables that works with both Vite and Node.js formats
const getEnv = (name, defaultValue = undefined) => {
  // Try Vite format first, then regular format
  return process.env[`VITE_${name}`] || process.env[name] || defaultValue;
};

// Apply rate limiting to prevent abuse
const aiChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to validate the request format
function validateAIChatRequest(req, res, next) {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid request format. Messages array is required.' });
  }
  
  for (const message of messages) {
    if (!message.role || !message.content) {
      return res.status(400).json({ 
        error: 'Invalid message format. Each message must have a role and content.'
      });
    }
    
    if (!['system', 'user', 'assistant'].includes(message.role)) {
      return res.status(400).json({ 
        error: 'Invalid message role. Role must be one of: system, user, assistant.'
      });
    }
  }
  
  next();
}

// Ping endpoint for service discovery
router.get('/ai-chat/ping', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'OpenRouter Proxy', timestamp: new Date().toISOString() });
});

// AI chat endpoint that forwards requests to OpenRouter
router.post('/ai-chat', aiChatLimiter, validateAIChatRequest, async (req, res) => {
  try {
    const { 
      messages, 
      temperature = 0.7, 
      max_tokens = 800, 
      stream = false,
      model = getEnv('OPENROUTER_MODEL', 'openai/gpt-4o-mini')
    } = req.body;
    
    console.log(`Processing OpenRouter API request for model: ${model}`);
    console.log(`Stream mode: ${stream ? 'enabled' : 'disabled'}`);
    
    // Get API key from environment variables
    const apiKey = getEnv('OPENROUTER_API_KEY');
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key is not configured' });
    }
    
    // Prepare the request to OpenRouter
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': getEnv('APP_URL', 'http://localhost:3000'),
        'X-Title': 'Paradyze Agent Creator'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        top_p: 1,
        stream
      })
    };
    
    if (stream) {
      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', requestOptions);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenRouter API error:', errorText);
          
          // Send error as SSE event
          res.write(`data: ${JSON.stringify({ error: `OpenRouter API error: ${response.status}` })}\n\n`);
          res.end();
          return;
        }
        
        // Forward the stream from OpenRouter to the client
        const reader = response.body.getReader();
        
        async function processStream() {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                // End the SSE stream
                res.write('data: [DONE]\n\n');
                res.end();
                break;
              }
              
              // Convert the chunk to string and forward it
              const chunk = new TextDecoder().decode(value);
              res.write(`data: ${chunk}\n\n`);
            }
          } catch (error) {
            console.error('Error processing stream:', error);
            res.write(`data: ${JSON.stringify({ error: 'Stream processing error' })}\n\n`);
            res.end();
          }
        }
        
        processStream();
      } catch (error) {
        console.error('Streaming error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Failed to connect to OpenRouter API' })}\n\n`);
        res.end();
      }
    } 
    else {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', errorText);
        return res.status(response.status).json({ 
          error: `OpenRouter API error: ${response.status}`,
          details: errorText
        });
      }
      
      const data = await response.json();
      
      // Return the AI response to the client
      res.json(data);
    }
  } catch (error) {
    console.error('AI proxy error:', error);
    
    // Check if this is a streaming request
    if (req.body.stream) {
      res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message,
        stack: getEnv('NODE_ENV', 'development') === 'development' ? error.stack : undefined
      });
    }
  }
});

module.exports = router;
