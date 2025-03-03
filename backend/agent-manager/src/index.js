require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'agent-manager.log' })
  ]
});

// Initialize SQLite database
let db;
(async () => {
  try {
    // Ensure data directory exists
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Extract database path from DATABASE_URL
    const dbPath = process.env.DATABASE_URL.replace('sqlite:', '');
    
    // Open SQLite database
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error);
  }
})();

// Initialize Docker client
const docker = new Docker();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// ElizaOS Integration Service URL
const INTEGRATION_URL = process.env.INTEGRATION_URL || 'http://localhost:3001';

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Get all agents
app.get('/agents', async (req, res) => {
  try {
    const response = await axios.get(`${INTEGRATION_URL}/api/agents`);
    res.json(response.data);
  } catch (error) {
    logger.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get agent by ID
app.get('/agents/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const response = await axios.get(`${INTEGRATION_URL}/api/agents/${id}`);
    res.json(response.data);
  } catch (error) {
    logger.error(`Error fetching agent ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Create a new agent
app.post('/agents', async (req, res) => {
  const { characterId, name } = req.body;
  
  if (!characterId || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const response = await axios.post(`${INTEGRATION_URL}/api/agents`, {
      characterId,
      name
    });
    
    res.status(201).json(response.data);
  } catch (error) {
    logger.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Start an agent
app.post('/agents/:id/start', async (req, res) => {
  const { id } = req.params;
  
  try {
    const response = await axios.post(`${INTEGRATION_URL}/api/agents/${id}/start`);
    res.json(response.data);
  } catch (error) {
    logger.error(`Error starting agent ${id}:`, error);
    res.status(500).json({ error: 'Failed to start agent' });
  }
});

// Stop an agent
app.post('/agents/:id/stop', async (req, res) => {
  const { id } = req.params;
  
  try {
    const response = await axios.post(`${INTEGRATION_URL}/api/agents/${id}/stop`);
    res.json(response.data);
  } catch (error) {
    logger.error(`Error stopping agent ${id}:`, error);
    res.status(500).json({ error: 'Failed to stop agent' });
  }
});

// Delete an agent
app.delete('/agents/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const response = await axios.delete(`${INTEGRATION_URL}/api/agents/${id}`);
    res.json(response.data);
  } catch (error) {
    logger.error(`Error deleting agent ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// Start server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  logger.info(`Agent Manager running on port ${PORT}`);
});
