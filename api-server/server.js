/**
 * Main API Server for Paradyze V2
 * Integrates the OpenRouter AI chat proxy
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import the OpenRouter proxy router
const aiProxyRouter = require('../src/api/chat');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Mount the AI proxy router
app.use('/api/proxy', aiProxyRouter);

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'Paradyze API Server',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`OpenRouter AI proxy available at http://localhost:${PORT}/api/proxy/ai-chat`);
});
