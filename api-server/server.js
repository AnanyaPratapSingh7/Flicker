/**
 * Main API Server for Paradyze V2
 * Integrates the OpenRouter AI chat proxy
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');  // Use axios instead of node-fetch

// Load environment variables
dotenv.config();

// Get API key from environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

// Create a router instead of importing the module that can't be found
const aiProxyRouter = express.Router();

// Add basic chat endpoint with streaming support
aiProxyRouter.post('/ai-chat', async (req, res) => {
  const { messages, model, stream, max_tokens, temperature } = req.body;
  
  console.log('Chat request received at API server:', { 
    messageCount: messages?.length,
    model: model || DEFAULT_MODEL,
    stream: !!stream
  });
  
  // Validate API key
  if (!OPENROUTER_API_KEY) {
    console.error('ERROR: OpenRouter API key is not set in environment variables');
    return res.status(500).json({
      error: 'OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in env file.'
    });
  }
  
  try {
    // Prepare the OpenRouter request payload
    const payload = {
      messages: messages || [],
      model: model || DEFAULT_MODEL,
      stream: !!stream,
      max_tokens: max_tokens || 800,
      temperature: temperature || 0.7
    };
    
    // Make the request to OpenRouter
    console.log(`Sending request to OpenRouter API using model: ${payload.model}`);
    
    if (stream) {
      // Handle streaming with axios
      console.log('Processing streaming request from OpenRouter');
      
      // Set up headers for a streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx proxies
      // Ensure no timeout
      res.socket.setTimeout(0);
      
      // Set up axios request
      const response = await axios({
        method: 'post',
        url: OPENROUTER_API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Paradyze Trading Agent'
        },
        data: payload,
        responseType: 'stream'
      });
      
      // Keep track of sent chunks for debugging
      let chunkCount = 0;
      let streamActive = true;
      let buffer = '';
      
      // Handle stream data
      response.data.on('data', (chunk) => {
        if (!streamActive) return;
        
        try {
          // Convert buffer to string and add to existing buffer
          const text = chunk.toString('utf8');
          buffer += text;
          
          // Process complete events from the buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the incomplete line in the buffer
          
          for (const line of lines) {
            if (!line.trim()) continue;
            
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              
              if (data === '[DONE]') {
                console.log('Received [DONE] marker from OpenRouter');
                
                // Forward the DONE marker
                if (!res.writableEnded && streamActive) {
                  res.write('data: [DONE]\n\n');
                }
                
                streamActive = false;
                break;
              }
              
              try {
                // Forward the chunk to the client
                if (!res.writableEnded && streamActive) {
                  res.write(`data: ${data}\n\n`);
                  chunkCount++;
                  console.log(`Forwarded chunk #${chunkCount} from OpenRouter`);
                }
              } catch (e) {
                console.error('Error sending chunk:', e);
                streamActive = false;
              }
            }
          }
        } catch (err) {
          console.error('Error processing chunk:', err);
          streamActive = false;
        }
      });
      
      // Handle end of stream
      response.data.on('end', () => {
        console.log('OpenRouter stream complete');
        if (!res.writableEnded) {
          res.end();
          console.log(`Stream completed, forwarded ${chunkCount} chunks from OpenRouter`);
        }
      });
      
      // Handle errors in the stream
      response.data.on('error', (err) => {
        console.error('Stream error from OpenRouter:', err);
        if (!res.writableEnded) {
          res.write('data: {"error": "Stream processing error"}\n\n');
          res.write('data: [DONE]\n\n');
          res.end();
        }
        streamActive = false;
      });
      
      // Handle client disconnect
      req.on('close', () => {
        console.log('Client disconnected, cleaning up stream');
        streamActive = false;
        if (!res.writableEnded) {
          res.end();
          console.log('Response ended due to client disconnect');
        }
      });
      
      // Handle response errors
      res.on('error', (err) => {
        console.error('Stream error:', err);
        streamActive = false;
        if (!res.writableEnded) {
          res.end();
          console.log('Response ended due to error');
        }
      });
    } else {
      // Handle regular (non-streaming) response with axios
      console.log('Processing regular (non-streaming) request from OpenRouter');
      
      const response = await axios({
        method: 'post',
        url: OPENROUTER_API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Paradyze Trading Agent'
        },
        data: payload
      });
      
      // Pass through the OpenRouter response directly
      res.status(200).json(response.data);
      console.log('Regular response forwarded from OpenRouter');
    }
  } catch (error) {
    console.error('Error processing request to OpenRouter:', error);
    
    // Fallback to mock response in case of error
    if (!res.headersSent) {
      res.status(500).json({
        error: `Failed to communicate with OpenRouter: ${error.message}`,
        fallback: true
      });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
});

// Add ping endpoint for the chat proxy
aiProxyRouter.get('/ai-chat/ping', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'API Chat Proxy',
    timestamp: new Date().toISOString()
  });
  console.log('/api/proxy/ai-chat/ping endpoint handled');
});

// Also handle ping with any suffix like ping:1
aiProxyRouter.get('/ai-chat/ping:*', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'API Chat Proxy',
    timestamp: new Date().toISOString()
  });
  console.log(`Handled ping with suffix: ${req.path}`);
});

// Add health check endpoint for the chat proxy
aiProxyRouter.get('/ai-chat/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'API Chat Proxy',
    timestamp: new Date().toISOString()
  });
  console.log('Health check request handled');
});

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://frontend:3000', '*'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Mount the AI proxy router
app.use('/api/proxy', aiProxyRouter);

// Add direct handlers for the same endpoints without the /proxy prefix for direct connections
app.post('/api/ai-chat', (req, res) => {
  console.log('Direct AI chat request received, forwarding to proxy handler');
  // Forward to the proxy handler
  req.url = '/api/proxy/ai-chat';
  aiProxyRouter.handle(req, res);
});

app.post('/api/chat/ai-chat', (req, res) => {
  console.log('Direct frontend chat request received, forwarding to proxy handler');
  // Forward to the proxy handler 
  req.url = '/ai-chat';
  aiProxyRouter.handle(req, res);
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'Paradyze API Server',
    timestamp: new Date().toISOString()
  });
  console.log('Main health check handled');
});

// Add fallback ping endpoints for direct frontend requests
app.get('/api/ai-chat/ping', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'API Server (Fallback)',
    timestamp: new Date().toISOString()
  });
  console.log('Fallback ping endpoint handled: /api/ai-chat/ping');
});

app.get('/api/chat/ai-chat/ping', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'API Server (Fallback)',
    timestamp: new Date().toISOString()
  });
  console.log('Fallback ping endpoint handled: /api/chat/ai-chat/ping');
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`OpenRouter AI proxy available at http://localhost:${PORT}/api/proxy/ai-chat`);
});
