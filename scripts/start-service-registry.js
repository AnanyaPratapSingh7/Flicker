#!/usr/bin/env node
/**
 * Service Registry Starter
 * 
 * Simple script to start the service registry in the background.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '=== Starting Service Registry ===');

// Start the service registry
const serviceRegistryPath = path.join(__dirname, 'service-registry.js');
const child = spawn('node', [serviceRegistryPath], {
  stdio: 'pipe',
  detached: true,
});

// Forward output to console with colorization
child.stdout.on('data', (data) => {
  console.log('\x1b[36m[ServiceRegistry]\x1b[0m', data.toString().trim());
});

child.stderr.on('data', (data) => {
  console.error('\x1b[31m[ServiceRegistry Error]\x1b[0m', data.toString().trim());
});

// Check if the server started successfully
let started = false;
let timeout = setTimeout(() => {
  if (!started) {
    console.error('\x1b[31m[ERROR]\x1b[0m Service registry failed to start within 5 seconds');
    process.exit(1);
  }
}, 5000);

child.stdout.on('data', (data) => {
  if (data.toString().includes('Service registry running at')) {
    started = true;
    clearTimeout(timeout);
    console.log('\x1b[32m%s\x1b[0m', 'Service registry started successfully!');
    
    // Detach the child process
    child.unref();
    
    // Exit this script
    process.exit(0);
  }
});

// Handle errors
child.on('error', (error) => {
  console.error('\x1b[31m[ERROR]\x1b[0m Failed to start service registry:', error.message);
  process.exit(1);
});

// Parent script is exiting, make sure registry keeps running
process.on('exit', () => {
  if (started) {
    console.log('\x1b[36m%s\x1b[0m', 'Service registry is running in the background');
  }
});
