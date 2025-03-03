/**
 * OpenRouter AI Chat Proxy Endpoint
 * 
 * This file contains a secure implementation of a proxy endpoint for the OpenRouter API.
 * It keeps the API key secure on the server side and provides proper rate limiting and validation.
 */

import express from 'express';
import axios from 'axios';
import { rateLimit } from 'express-rate-limit';

// Create router
const router = express.Router();

// Apply rate limiting to prevent abuse
const aiChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to validate the request format
function validateAIChatRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid request format. Messages array is required.' });
  }
  
  // Validate message format
  const validMessages = messages.every((msg: any) => 
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

/**
 * AI Chat proxy endpoint
 * This endpoint securely proxies requests to the OpenRouter API without exposing the API key to the client
 */
router.post('/ai-chat', aiChatLimiter, validateAIChatRequest, async (req, res) => {
  try {
    const { messages, temperature = 0.7, max_tokens = 800, stream = false } = req.body;
    
    // Get API key from environment variable (ElizaOS integration already uses this)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'API configuration error' });
    }
    
    // Set common request configuration
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000', // Required by OpenRouter
      'X-Title': 'Paradyze Agent Creator'
    };
    
    // Handle streaming response
    if (stream) {
      // Set headers for streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Make streaming request to OpenRouter
      const openRouterResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model,
        messages,
        temperature,
        max_tokens,
        top_p: 1,
        stream: true
      }, {
        headers,
        responseType: 'stream'
      });
      
      // Pipe the response stream directly to our response
      openRouterResponse.data.pipe(res);
      
      // Handle errors
      openRouterResponse.data.on('error', (error: any) => {
        console.error('Stream error:', error);
        res.write('data: [ERROR] Stream error\n\n');
        res.end();
      });
      
      return;
    }
    
    // Non-streaming response (original behavior)
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model,
      messages,
      temperature,
      max_tokens,
      top_p: 1,
      stream: false
    }, {
      headers
    });
    
    // Log usage (optional)
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Chat API usage:', {
        model: response.data.model,
        usage: response.data.usage,
        timestamp: new Date().toISOString()
      });
    }
    
    // Return the OpenRouter response
    res.json(response.data);
  } catch (error) {
    console.error('AI proxy error:', error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error) && error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      console.error('OpenRouter API error:', errorData);
      return res.status(statusCode).json({ 
        error: 'AI service error', 
        details: errorData
      });
    }
    
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

export default router; 