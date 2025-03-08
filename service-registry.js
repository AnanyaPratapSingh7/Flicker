#!/usr/bin/env node
/**
 * Simple Service Registry for Paradyze v2
 * 
 * This script creates a central registry where all services can register themselves
 * and be discovered by other services.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Helper function to get environment variables
const getEnv = (name, defaultValue = undefined) => {
  // Try Vite format first, then regular format
  return process.env[`VITE_${name}`] || process.env[name] || defaultValue;
};

// Configuration
const PORT = parseInt(getEnv('SERVICE_REGISTRY_PORT', '3999'));
const REGISTRY_FILE = path.join(__dirname, 'data', 'service-registry.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize registry from file or create new one
let serviceRegistry = {};
try {
  if (fs.existsSync(REGISTRY_FILE)) {
    const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
    serviceRegistry = JSON.parse(data);
    console.log('Loaded service registry from file');
  }
} catch (error) {
  console.error('Failed to load registry file:', error);
  // Continue with empty registry
}

// Save registry to file periodically
const saveRegistry = () => {
  try {
    const data = JSON.stringify(serviceRegistry, null, 2);
    fs.writeFileSync(REGISTRY_FILE, data);
  } catch (error) {
    console.error('Failed to save registry file:', error);
  }
};

// Auto-save registry every minute
setInterval(saveRegistry, 60000);

// Register a service
app.post('/register', (req, res) => {
  const { serviceName, url, health, metadata } = req.body;
  
  if (!serviceName || !url) {
    return res.status(400).json({ error: 'Service name and URL are required' });
  }
  
  serviceRegistry[serviceName] = { 
    url, 
    health: health || `${url}/health`,
    metadata: metadata || {},
    lastRegistered: new Date().toISOString()
  };
  
  console.log(`Service registered: ${serviceName} at ${url}`);
  saveRegistry(); // Save immediately on registration
  
  res.json({ 
    success: true, 
    message: `Service '${serviceName}' registered successfully` 
  });
});

// Unregister a service
app.post('/unregister', (req, res) => {
  const { serviceName } = req.body;
  
  if (!serviceName) {
    return res.status(400).json({ error: 'Service name is required' });
  }
  
  if (serviceRegistry[serviceName]) {
    const url = serviceRegistry[serviceName].url;
    delete serviceRegistry[serviceName];
    console.log(`Service unregistered: ${serviceName} at ${url}`);
    saveRegistry(); // Save immediately on unregistration
    
    return res.json({ 
      success: true, 
      message: `Service '${serviceName}' unregistered successfully` 
    });
  }
  
  res.status(404).json({ error: `Service '${serviceName}' not found` });
});

// Get service information
app.get('/service/:name', (req, res) => {
  const service = serviceRegistry[req.params.name];
  
  if (!service) {
    return res.status(404).json({ error: `Service '${req.params.name}' not found` });
  }
  
  res.json(service);
});

// List all services
app.get('/services', (req, res) => {
  res.json(serviceRegistry);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    serviceCount: Object.keys(serviceRegistry).length,
    uptime: process.uptime()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Service registry running at http://localhost:${PORT}`);
  console.log(`Registry will be stored at ${REGISTRY_FILE}`);
});
