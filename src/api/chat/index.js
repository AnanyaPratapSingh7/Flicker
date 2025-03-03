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

// Ping endpoint for service discovery
router.get('/ai-chat/ping', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'OpenRouter Proxy', timestamp: new Date().toISOString() });
});

// AI Chat proxy endpoint
router.post('/ai-chat', aiChatLimiter, validateAIChatRequest, async (req, res) => {
  try {
    const { 
      messages, 
      temperature = 0.7, 
      max_tokens = 800, 
      stream = false,
      model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
    } = req.body;
    
    console.log(`Processing OpenRouter API request for model: ${model}`);
    console.log(`Stream mode: ${stream ? 'enabled' : 'disabled'}`);
    
    // Get API key from environment variables
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key is not configured' });
    }
    
    // Prepare the request to OpenRouter
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
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

    // Handle streaming response
    if (stream) {
      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Make the request to OpenRouter
      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', requestOptions);
      
      if (!openRouterResponse.ok) {
        const errorText = await openRouterResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        console.error('OpenRouter API error:', errorData);
        res.write(`data: ${JSON.stringify({ error: 'AI service error', details: errorData })}\n\n`);
        return res.end();
      }
      
      // Buffer to store any incomplete SSE data
      let buffer = '';
      
      // Process chunks from OpenRouter
      openRouterResponse.body.on('data', (chunk) => {
        // Convert chunk to string and add to buffer
        const chunkText = chunk.toString('utf-8');
        buffer += chunkText;
        
        // Process complete lines (SSE format)
        const lines = buffer.split('\n');
        // Keep the last line in the buffer if it's incomplete
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          // Process each SSE line
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            // Handle end of stream marker
            if (data === '[DONE]') {
              res.write(`data: [DONE]\n\n`);
              continue;
            }
            
            try {
              // Parse the original OpenRouter data
              const parsed = JSON.parse(data);
              
              // Format it to match what the frontend expects
              // The frontend expects: {"choices":[{"delta":{"content":"..."}}]}
              if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                // Already in the expected format, pass through
                res.write(`data: ${data}\n\n`);
              } else if (parsed.choices && parsed.choices[0] && parsed.choices[0].content) {
                // Reformat to match expected delta format
                const reformatted = {
                  choices: [
                    {
                      delta: {
                        content: parsed.choices[0].content
                      }
                    }
                  ]
                };
                res.write(`data: ${JSON.stringify(reformatted)}\n\n`);
              } else if (parsed.content || parsed.text) {
                // Handle simpler format with just content
                const content = parsed.content || parsed.text;
                const reformatted = {
                  choices: [
                    {
                      delta: {
                        content: content
                      }
                    }
                  ]
                };
                res.write(`data: ${JSON.stringify(reformatted)}\n\n`);
              } else {
                // Pass through as-is if we can't reformat it
                res.write(`data: ${data}\n\n`);
              }
              
              // Flush to ensure immediate delivery
              if (res.flush) {
                res.flush();
              }
            } catch (e) {
              console.warn('Error parsing streaming data:', e, 'Data:', data);
              // Send the line as-is
              res.write(`data: ${data}\n\n`);
            }
          }
        }
      });
      
      openRouterResponse.body.on('end', () => {
        // If there's anything left in the buffer, process it
        if (buffer.length > 0 && buffer.startsWith('data: ')) {
          const data = buffer.slice(6).trim();
          if (data && data !== '[DONE]') {
            res.write(`data: ${data}\n\n`);
          }
        }
        // Send final [DONE] marker
        res.write(`data: [DONE]\n\n`);
        console.log('Forwarded streaming response to client');
        res.end();
      });
      
      openRouterResponse.body.on('error', (err) => {
        console.error('Stream error:', err);
        res.write(`data: ${JSON.stringify({ error: 'Stream error', message: err.message })}\n\n`);
        res.end();
      });
      
      // Return early to avoid the final res.end() call below
      return;
    } 
    // Handle non-streaming response
    else {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
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
      res.write(`data: ${JSON.stringify({ error: 'Proxy error', message: error.message })}\n\n`);
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
