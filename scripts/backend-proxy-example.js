/**
 * OpenRouter AI Chat Proxy Endpoint
 * 
 * This file contains a secure implementation of a proxy endpoint for the OpenRouter API.
 * Add this to your Express/Node.js backend to keep your API key secure.
 */

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');

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
  
  // Validate message format
  const validMessages = messages.every(msg => 
    msg && 
    typeof msg === 'object' && 
    ['user', 'assistant', 'system'].includes(msg.role) &&
    typeof msg.content === 'string'
  );
  
  if (!validMessages) {
    return res.status(400).json({ error: 'Invalid message format. Each message must have a valid role and content.' });
  }
  
  next();
}

// AI Chat proxy endpoint
router.post('/ai-chat', aiChatLimiter, validateAIChatRequest, async (req, res) => {
  try {
    const { messages, temperature = 0.7, max_tokens = 800, stream = false } = req.body;
    
    // Prepare the request to OpenRouter
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.APP_URL || 'https://your-app-domain.com', // Required by OpenRouter
        'X-Title': 'Paradyze Agent Creator'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages,
        temperature,
        max_tokens,
        top_p: 1,
        stream
      })
    };

    // Handle streaming response
    if (stream) {
      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Make the request to OpenRouter
      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', requestOptions);
      
      if (!openRouterResponse.ok) {
        const errorData = await openRouterResponse.json();
        console.error('OpenRouter API error:', errorData);
        res.write(`data: ${JSON.stringify({ error: 'AI service error', details: errorData })}\n\n`);
        return res.end();
      }
      
      // Forward the stream from OpenRouter to our client
      // The OpenRouter API response is already in SSE format
      // We need to manually pipe it through
      
      // Get the complete text response and send it to client
      const responseText = await openRouterResponse.text();
      res.write(responseText);
      console.log('Forwarded streaming response to client');
      
      // End the response
      return res.end();
    } 
    // Handle non-streaming response
    else {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenRouter API error:', errorData);
        return res.status(response.status).json({ 
          error: 'AI service error', 
          details: errorData
        });
      }
      
      const data = await response.json();
      
      // Log usage (optional)
      if (process.env.NODE_ENV === 'development') {
        console.log('AI Chat API usage:', {
          model: data.model,
          usage: data.usage,
          timestamp: new Date().toISOString()
        });
      }
      
      // Return the OpenRouter response
      return res.json(data);
    }
  } catch (error) {
    console.error('AI proxy error:', error);
    
    // Check if this is a streaming request
    if (req.body.stream) {
      // Send error in SSE format
      res.write(`data: ${JSON.stringify({ error: 'Proxy error', message: error.message })}

`);
      return res.end();
    } else {
      // Regular JSON error response
      return res.status(500).json({ 
        error: 'Failed to process AI request', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

module.exports = router;

// Example of how to use this in your main Express app:
/*
const express = require('express');
const app = express();
const aiProxyRoutes = require('./path-to-this-file');

app.use(express.json());
app.use('/api/proxy', aiProxyRoutes);

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
*/ 