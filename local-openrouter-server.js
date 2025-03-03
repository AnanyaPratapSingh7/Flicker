const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Use our server-side routes
const aiProxyRoutes = require('./src/api/chat/server');

// Load environment variables from .env file
dotenv.config();

// Helper function to get environment variables (same as in server.js)
const getEnv = (name, defaultValue = undefined) => {
  // Try Vite format first, then regular format
  return process.env[`VITE_${name}`] || process.env[name] || defaultValue;
};

console.log('Starting OpenRouter proxy server with env vars:');
console.log(`OPENROUTER_API_KEY exists: ${!!getEnv('OPENROUTER_API_KEY')}`);
console.log(`OPENROUTER_MODEL: ${getEnv('OPENROUTER_MODEL', 'openai/gpt-4o-mini')}`);

const app = express();
const PORT = 3005;

// Add CORS debugging middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    url: req.url,
    method: req.method,
    origin: req.headers.origin,
    referer: req.headers.referer
  });
  next();
});

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:3003', 'http://127.0.0.1:3003'], // Allow the frontend origin explicitly
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add CORS preflight options handler
app.options('*', cors({
  origin: ['http://localhost:3003', 'http://127.0.0.1:3003'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Basic health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('OpenRouter Proxy is running');
});

// Ping endpoint for service discovery
app.get('/api/ai-chat/ping', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'OpenRouter Proxy', timestamp: new Date().toISOString() });
});

// Direct proxy ping endpoint
app.get('/api/proxy/ai-chat/ping', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'OpenRouter Proxy (Legacy Path)', timestamp: new Date().toISOString() });
});

// Test endpoint that always responds
app.post('/api/test', (req, res) => {
  console.log('Test endpoint called with body:', req.body);
  res.status(200).json({ message: 'Test endpoint working' });
});

// Mount the OpenRouter proxy routes
app.use('/api', aiProxyRoutes);

// Legacy compatibility route for old frontend code
app.use('/api/proxy/ai-chat', (req, res) => {
  console.log('Legacy endpoint called, forwarding to new endpoint');
  // Forward the request to the new endpoint
  const url = `http://localhost:${PORT}/api/ai-chat`;
  
  if (req.method === 'POST') {
    // Forward POST request
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    })
    .then(response => {
      // Copy status and headers
      res.status(response.status);
      
      // Check if this is a streaming response
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('text/event-stream')) {
        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        // Stream the response
        response.body.pipe(res);
      } else {
        // Regular JSON response
        return response.json();
      }
    })
    .then(data => {
      if (data) res.json(data);
    })
    .catch(err => {
      console.error('Legacy forwarding error:', err);
      res.status(500).json({ error: 'Proxy forwarding error', message: err.message });
    });
  } else {
    // For other methods (GET, etc.)
    res.status(405).json({ error: 'Method not allowed on legacy endpoint' });
  }
});

// Catch-all for 404 errors
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`OpenRouter proxy server running at http://localhost:${PORT}`);
  console.log(`Test the API with: http://localhost:${PORT}/api/ai-chat`);
});
