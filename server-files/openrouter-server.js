const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3003;

// Add CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Add detailed error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('OpenRouter Proxy is running');
});

// Ping endpoint for health checks
app.get('/api/ai-chat/ping', (req, res) => {
  res.json({ status: 'ok', service: 'OpenRouter Proxy', timestamp: new Date().toISOString() });
});

// Frontend ping endpoint
app.get('/api/chat/ai-chat/ping', (req, res) => {
  res.json({ status: 'ok', service: 'OpenRouter Proxy', timestamp: new Date().toISOString() });
});

// Frontend chat endpoint - /api/chat/ai-chat
app.post('/api/chat/ai-chat', async (req, res) => {
  console.log('Frontend chat request received');
  try {
    // Forward the request to our API server
    const apiServerUrl = 'http://api-server:3002/api/proxy/ai-chat';
    const { stream } = req.body;

    console.log(`Forwarding to API server: ${apiServerUrl} (stream=${!!stream})`);

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json'
      },
      // Don't set the timeout here as it could cause early termination
      body: JSON.stringify(req.body)
    };

    // Log the request body for debugging
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const fetchResponse = await fetch(apiServerUrl, fetchOptions);

    if (!fetchResponse.ok) {
      console.error(`API server error: ${fetchResponse.status} ${fetchResponse.statusText}`);
      const errorText = await fetchResponse.text();
      console.error('Error response body:', errorText);
      throw new Error(`API server error: ${fetchResponse.status} - ${errorText || fetchResponse.statusText}`);
    }

    // Handle streaming responses
    if (stream) {
      console.log('Setting up streaming response');
      
      // Set appropriate headers for streaming
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // Disable nginx buffering
      });
      
      // Directly pipe the response to the client
      console.log('Streaming response started - directly piping');
      
      // Create manual piping with error handling
      fetchResponse.body.on('data', chunk => {
        console.log(`Forwarding chunk of ${chunk.length} bytes`);
        if (!res.writableEnded) {
          res.write(chunk);
        }
      });
      
      fetchResponse.body.on('end', () => {
        console.log('API server stream ended');
        if (!res.writableEnded) {
          res.end();
        }
      });
      
      fetchResponse.body.on('error', err => {
        console.error('Error in API server stream:', err);
        if (!res.writableEnded) {
          res.end();
        }
      });
      
      // Handle client disconnection
      req.on('close', () => {
        console.log('Client disconnected, handling cleanup');
        // The response will be automatically ended when the pipe is closed
      });
      
      return; // Return early as we're handling the response manually
    } else {
      // Handle regular responses
      const data = await fetchResponse.json();
      res.json(data);
      console.log('Regular response sent');
    }
  } catch (error) {
    console.error('Error processing chat request:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Unknown error' });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
});

// Legacy endpoint - /api/ai-chat
app.post('/api/ai-chat', async (req, res) => {
  console.log('Legacy chat request received');
  try {
    // Forward the request to our API server
    const apiServerUrl = 'http://api-server:3002/api/proxy/ai-chat';
    const { stream } = req.body;

    const fetchResponse = await fetch(apiServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    if (!fetchResponse.ok) {
      throw new Error(`API server error: ${fetchResponse.status}`);
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      fetchResponse.body.pipe(res);
    } else {
      const data = await fetchResponse.json();
      res.json(data);
    }
  } catch (error) {
    console.error('Error processing legacy chat request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for API server - self responds without forwarding
app.post('/api/proxy/ai-chat', (req, res) => {
  console.log('Test endpoint called');
  
  // Return a fixed response for testing
  res.json({
    id: 'test-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'test-model',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: 'This is a test response from the OpenRouter proxy.'
      },
      finish_reason: 'stop'
    }]
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`OpenRouter proxy server running on port ${PORT}`);
  console.log(`API endpoints: /api/chat/ai-chat and /api/ai-chat`);
}); 