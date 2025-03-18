#!/usr/bin/env node
/**
 * Paradyze Development Environment Setup
 * 
 * This script creates essential environment files with correct port 
 * configurations to prevent port conflicts between services.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('\x1b[36m%s\x1b[0m', 'Setting up Paradyze development environment...');

// Base environment configuration
const rootEnv = `# Paradyze V2 Environment Configuration

# OpenRouter Configuration
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=openai/gpt-4o-mini
DEFAULT_MODEL_PROVIDER=openrouter

# Port Configuration (CRITICAL: Do not change these without updating dependencies)
FRONTEND_PORT=3000
INTEGRATION_PORT=3001
API_PORT=3002
OPENROUTER_PORT=3003
ELIZA_PORT=3005

# API Configuration
OPENROUTER_SERVER_URL=http://localhost:3003
API_ENDPOINT=/api/proxy/ai-chat

# App URLs
APP_URL=http://localhost:3000
PUBLIC_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=sqlite:./data/paradyze.db

# Application Settings
NODE_ENV=development

# PWA Settings
SW_DEV=true
`;

// Integration service specific configuration
const integrationEnv = `# Eliza Integration Environment

# OpenRouter Configuration (inherited from root)
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=openai/gpt-4o-mini

# Service Configuration
INTEGRATION_PORT=3001
APP_URL=http://localhost:3000

# Eliza Configuration
ELIZAOS_INTEGRATION_MODE=direct
ELIZA_API_URL=http://localhost:3005
`;

// API server specific configuration
const apiServerEnv = `# API Server Environment

# OpenRouter Configuration
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=openai/gpt-4o-mini

# Service Configuration
API_PORT=3002
APP_URL=http://localhost:3000
`;

// Eliza main specific configuration
const elizaMainEnv = `# Eliza Main Environment

# Service Configuration
ELIZAOS_PORT=3005
ELIZAOS_MODE=development
`;

// Paths
const ROOT_DIR = path.resolve(__dirname);
const INTEGRATION_DIR = path.join(ROOT_DIR, 'backend/eliza-integration');
const API_SERVER_DIR = path.join(ROOT_DIR, 'api-server');
const ELIZA_MAIN_DIR = path.join(ROOT_DIR, 'backend/eliza-main');

// Ensure directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(INTEGRATION_DIR);
ensureDir(API_SERVER_DIR);
ensureDir(ELIZA_MAIN_DIR);

// Write environment files
const writeEnvFile = (filePath, content) => {
  fs.writeFileSync(filePath, content);
  console.log(`Created/updated environment file: ${filePath}`);
};

writeEnvFile(path.join(ROOT_DIR, '.env'), rootEnv);
writeEnvFile(path.join(INTEGRATION_DIR, '.env'), integrationEnv);
writeEnvFile(path.join(API_SERVER_DIR, '.env'), apiServerEnv);
writeEnvFile(path.join(ELIZA_MAIN_DIR, '.env'), elizaMainEnv);

// Make paradyze-dev.js executable
const makeExecutable = () => {
  const devScriptPath = path.join(ROOT_DIR, 'paradyze-dev.js');
  
  if (process.platform !== 'win32') {
    try {
      fs.chmodSync(devScriptPath, '755');
      console.log('Made paradyze-dev.js executable.');
    } catch (err) {
      console.error('Error making paradyze-dev.js executable:', err.message);
    }
  }
};

makeExecutable();

// Install dependencies if needed
const installDeps = () => {
  console.log('\nChecking for missing dependencies...');
  
  // Check if dotenv is installed
  try {
    require('dotenv');
    console.log('✓ dotenv is installed');
  } catch (e) {
    console.log('Installing required dependencies...');
    
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const installProcess = spawn(npmCmd, ['install', '--save', 'dotenv', 'cors', 'express', 'express-rate-limit'], {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Dependencies installed successfully.');
      } else {
        console.error(`Error installing dependencies. Exit code: ${code}`);
      }
    });
  }
};

installDeps();

console.log('\x1b[32m%s\x1b[0m', `
Environment setup complete! 🚀

To start the Paradyze development environment, run:
  npm run dev:manager

Or directly run any service:
  npm run dev:all        # Start all services
  npm run dev:frontend   # Start just the frontend
  npm run dev:openrouter # Start just the OpenRouter proxy
`);
