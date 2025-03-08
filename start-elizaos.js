#!/usr/bin/env node

/**
 * Manual starter script for ElizaOS Runtime
 * This script ensures ElizaOS starts on the correct port (3005)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

// Constants
const ELIZA_PORT = 3005;
const ELIZA_DIR = path.join(__dirname, 'backend/eliza-main');
const ENV_FILE = path.join(ELIZA_DIR, '.env');

console.log('\x1b[36m%s\x1b[0m', '=== ElizaOS Runtime Manual Starter ===');

// Check if environment file exists, if not create it
if (!fs.existsSync(ENV_FILE)) {
  console.log('Creating .env file for ElizaOS Runtime...');
  fs.writeFileSync(ENV_FILE, `ELIZAOS_PORT=${ELIZA_PORT}\n`);
} else {
  // Check if ELIZAOS_PORT is set in .env
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  if (!envContent.includes('ELIZAOS_PORT=')) {
    console.log('Adding ELIZAOS_PORT to .env file...');
    fs.appendFileSync(ENV_FILE, `\nELIZAOS_PORT=${ELIZA_PORT}\n`);
  }
}

console.log(`Starting ElizaOS Runtime on port ${ELIZA_PORT}...`);

// Start ElizaOS Runtime with appropriate environment
const child = spawn('pnpm', ['start'], {
  cwd: ELIZA_DIR,
  env: {
    ...process.env,
    ELIZAOS_PORT: ELIZA_PORT,
    NODE_ENV: 'development'
  },
  stdio: 'pipe'
});

// Forward output to console with colorization
child.stdout.on('data', (data) => {
  console.log('\x1b[36m[ElizaOS]\x1b[0m', data.toString().trim());
});

child.stderr.on('data', (data) => {
  console.error('\x1b[31m[ElizaOS Error]\x1b[0m', data.toString().trim());
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\x1b[36m%s\x1b[0m', 'Shutting down ElizaOS Runtime...');
  child.kill('SIGTERM');
  process.exit(0);
});

child.on('close', (code) => {
  console.log(`\x1b[36m[ElizaOS]\x1b[0m Process exited with code ${code}`);
  process.exit(code);
});

console.log('\x1b[32m%s\x1b[0m', 'ElizaOS Runtime should be starting. Press Ctrl+C to stop.');
