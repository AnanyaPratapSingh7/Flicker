#!/usr/bin/env node
/**
 * Paradyze Development Environment Manager
 * 
 * This script manages the startup and shutdown of all Paradyze development services
 * in the correct order and with proper port configuration.
 */

const { spawn, exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');

// Load environment variables
dotenv.config();

// Configuration
const ROOT_DIR = __dirname;
const PORTS = {
  registry: parseInt(process.env.SERVICE_REGISTRY_PORT || 3999),
  frontend: parseInt(process.env.FRONTEND_PORT || 3000),
  integration: parseInt(process.env.INTEGRATION_PORT || 3001),
  api: parseInt(process.env.API_PORT || 3002),
  openRouter: parseInt(process.env.OPENROUTER_PORT || 3003), 
  eliza: parseInt(process.env.ELIZA_PORT || 3005)
};

// Service configurations
const SERVICES = {
  registry: {
    name: 'Service Registry',
    dir: ROOT_DIR,
    command: 'node',
    args: ['service-registry.js'],
    env: { PORT: PORTS.registry },
    port: PORTS.registry,
    startupCheck: checkPortOccupied,
    dependencies: [],
    color: '\x1b[36m', // Cyan
    description: 'Service discovery and registry for microservices'
  },
  // ElizaOS Runtime is managed manually
  // See docs/development-guide.md for instructions
  integration: {
    name: 'Eliza Integration API',
    dir: path.join(ROOT_DIR, 'backend/eliza-integration'),
    command: 'npm',
    args: ['run', 'dev'],
    env: { INTEGRATION_PORT: PORTS.integration, ELIZA_API_URL: `http://localhost:${PORTS.eliza}` },
    port: PORTS.integration,
    startupCheck: checkPortOccupied,
    dependencies: [], // ElizaOS is started manually
    color: '\x1b[35m', // Magenta
    description: 'Integration layer between frontend and ElizaOS'
  },
  openRouter: {
    name: 'OpenRouter Proxy',
    dir: ROOT_DIR,
    command: 'node',
    args: ['local-openrouter-server.js'],
    env: { PORT: PORTS.openRouter, SERVICE_REGISTRY_PORT: PORTS.registry },
    port: PORTS.openRouter,
    startupCheck: checkPortOccupied,
    dependencies: ['registry'],
    color: '\x1b[33m', // Yellow
    description: 'Proxy for OpenRouter AI API'
  },
  frontend: {
    name: 'Frontend App',
    dir: ROOT_DIR,
    command: 'npm',
    args: ['run', 'dev'],
    env: { PORT: PORTS.frontend },
    port: PORTS.frontend,
    startupCheck: checkPortOccupied, 
    dependencies: ['openRouter'], // ElizaOS and Integration are started separately
    color: '\x1b[32m', // Green
    description: 'React frontend application'
  }
};

// Terminal colors
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  white: '\x1b[37m'
};

// Active processes
const processes = {};

/**
 * Check if a port is already in use
 */
function checkPortOccupied(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is free
    });
    
    server.listen(port);
  });
}

/**
 * Kill any process running on a specific port
 */
async function killProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    // Different commands for different OS
    let command = process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port} -t`;
    
    exec(command, (error, stdout, stderr) => {
      if (error || stderr || !stdout) {
        // No process found on this port
        resolve(false);
        return;
      }
      
      const pids = stdout.toString().trim().split('\n');
      
      if (process.platform === 'win32') {
        // Extract PID from netstat output
        const extractedPids = pids
          .map(line => {
            const match = line.match(/(\d+)$/);
            return match ? match[1] : null;
          })
          .filter(Boolean);
        
        if (extractedPids.length) {
          // Kill with taskkill
          exec(`taskkill /F /PID ${extractedPids[0]}`, () => {
            resolve(true);
          });
        } else {
          resolve(false);
        }
      } else {
        // Unix systems - pids are directly returned by lsof
        if (pids.length) {
          exec(`kill -9 ${pids[0]}`, () => {
            resolve(true);
          });
        } else {
          resolve(false);
        }
      }
    });
  });
}

/**
 * Start a service
 */
async function startService(serviceKey) {
  const service = SERVICES[serviceKey];
  
  if (processes[serviceKey]) {
    console.log(`${service.color}[${service.name}]${COLORS.reset} ${COLORS.yellow}Service already running${COLORS.reset}`);
    return true;
  }
  
  console.log(`${service.color}[${service.name}]${COLORS.reset} Starting service...`);
  
  // Check if dependencies are running
  for (const depKey of service.dependencies) {
    if (!processes[depKey] || processes[depKey].killed) {
      console.log(`${service.color}[${service.name}]${COLORS.reset} ${COLORS.red}Dependency ${SERVICES[depKey].name} not running${COLORS.reset}`);
      return false;
    }
  }
  
  // Check if port is in use
  const isPortInUse = await service.startupCheck(service.port);
  if (isPortInUse) {
    console.log(`${service.color}[${service.name}]${COLORS.reset} ${COLORS.yellow}Port ${service.port} already in use. Attempting to free...${COLORS.reset}`);
    const killed = await killProcessOnPort(service.port);
    if (killed) {
      console.log(`${service.color}[${service.name}]${COLORS.reset} ${COLORS.green}Freed port ${service.port}${COLORS.reset}`);
      // Wait a moment for the port to be fully released
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`${service.color}[${service.name}]${COLORS.reset} ${COLORS.red}Failed to free port ${service.port}${COLORS.reset}`);
      return false;
    }
  }
  
  // Start the service
  const env = { ...process.env, ...service.env };
  const proc = spawn(service.command, service.args, { 
    cwd: service.dir,
    env,
    shell: true,
    stdio: 'pipe'
  });
  
  processes[serviceKey] = proc;
  
  // Log output with color coding
  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${service.color}[${service.name}]${COLORS.reset} ${line}`);
      }
    });
  });
  
  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${service.color}[${service.name}]${COLORS.reset} ${COLORS.red}${line}${COLORS.reset}`);
      }
    });
  });
  
  proc.on('close', (code) => {
    if (code !== 0 && !proc.killed) {
      console.log(`${service.color}[${service.name}]${COLORS.reset} ${COLORS.red}Process exited with code ${code}${COLORS.reset}`);
    } else if (proc.killed) {
      console.log(`${service.color}[${service.name}]${COLORS.reset} ${COLORS.yellow}Process was stopped${COLORS.reset}`);
    } else {
      console.log(`${service.color}[${service.name}]${COLORS.reset} ${COLORS.green}Process exited successfully${COLORS.reset}`);
    }
    
    delete processes[serviceKey];
  });
  
  return true;
}

/**
 * Stop a service
 */
function stopService(serviceKey) {
  const service = SERVICES[serviceKey];
  const proc = processes[serviceKey];
  
  if (!proc) {
    console.log(`${service.color}[${service.name}]${COLORS.reset} ${COLORS.yellow}Service not running${COLORS.reset}`);
    return;
  }
  
  console.log(`${service.color}[${service.name}]${COLORS.reset} ${COLORS.yellow}Stopping service...${COLORS.reset}`);
  
  // Find services dependent on this one
  const dependents = Object.keys(SERVICES).filter(key => 
    SERVICES[key].dependencies.includes(serviceKey) && processes[key]
  );
  
  // Stop dependent services first
  dependents.forEach(depKey => {
    stopService(depKey);
  });
  
  // Kill the process
  proc.killed = true;
  
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', proc.pid, '/f', '/t']);
  } else {
    proc.kill('SIGTERM');
    // After a timeout, force kill if it hasn't exited
    setTimeout(() => {
      try {
        proc.kill('SIGKILL');
      } catch (e) {
        // Process already exited
      }
    }, 5000);
  }
}

/**
 * Start all services in dependency order
 */
async function startAllServices() {
  console.log(`${COLORS.bright}${COLORS.blue}Starting all Paradyze services...${COLORS.reset}`);
  
  // Get services without dependencies first
  const sorted = [];
  const visited = new Set();
  
  async function visit(key) {
    if (visited.has(key)) return;
    visited.add(key);
    
    for (const dep of SERVICES[key].dependencies) {
      await visit(dep);
    }
    
    sorted.push(key);
  }
  
  // Create dependency-sorted list
  for (const key of Object.keys(SERVICES)) {
    await visit(key);
  }
  
  // Start in order
  for (const key of sorted) {
    await startService(key);
    // Allow a slight delay between service starts to reduce resource contention
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log(`${COLORS.bright}${COLORS.green}All services started!${COLORS.reset}`);
  showStatus();
}

/**
 * Stop all services in reverse dependency order
 */
function stopAllServices() {
  console.log(`${COLORS.bright}${COLORS.yellow}Stopping all Paradyze services...${COLORS.reset}`);
  
  // Get services with dependencies first
  const sorted = [];
  const visited = new Set();
  
  function visit(key) {
    if (visited.has(key)) return;
    visited.add(key);
    
    for (const key2 of Object.keys(SERVICES)) {
      if (SERVICES[key2].dependencies.includes(key)) {
        visit(key2);
      }
    }
    
    sorted.push(key);
  }
  
  // Create reverse dependency-sorted list
  for (const key of Object.keys(SERVICES)) {
    visit(key);
  }
  
  // Stop in order
  for (const key of sorted) {
    stopService(key);
  }
  
  console.log(`${COLORS.bright}${COLORS.yellow}All services stopped!${COLORS.reset}`);
}

/**
 * Show current status of all services
 */
function showStatus() {
  console.log(`\n${COLORS.bright}${COLORS.blue}Paradyze Service Status:${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.blue}=======================${COLORS.reset}\n`);
  
  Object.keys(SERVICES).forEach(key => {
    const service = SERVICES[key];
    const isRunning = !!processes[key] && !processes[key].killed;
    const status = isRunning 
      ? `${COLORS.green}RUNNING${COLORS.reset}`
      : `${COLORS.red}STOPPED${COLORS.reset}`;
    
    console.log(`${service.color}${service.name}${COLORS.reset} (Port ${service.port}): ${status}`);
    console.log(`  ${COLORS.dim}${service.description}${COLORS.reset}`);
    
    // Show dependencies
    if (service.dependencies.length > 0) {
      const deps = service.dependencies.map(d => SERVICES[d].name).join(', ');
      console.log(`  ${COLORS.dim}Depends on: ${deps}${COLORS.reset}`);
    }
    
    console.log();
  });
}

/**
 * Check health of services
 */
function checkHealth() {
  console.log(`\n${COLORS.bright}${COLORS.blue}Checking Health...${COLORS.reset}\n`);
  
  Object.keys(processes).forEach(key => {
    const service = SERVICES[key];
    const proc = processes[key];
    
    if (proc && !proc.killed) {
      console.log(`${service.color}${service.name}${COLORS.reset}: ${COLORS.green}Healthy${COLORS.reset}`);
    } else {
      console.log(`${service.color}${service.name}${COLORS.reset}: ${COLORS.red}Not running${COLORS.reset}`);
    }
  });
}

/**
 * Interactive CLI
 */
function startCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'paradyze> '
  });
  
  console.log(`${COLORS.bright}${COLORS.blue}Paradyze Development Environment${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.blue}================================${COLORS.reset}\n`);
  console.log(`Type ${COLORS.bright}help${COLORS.reset} for available commands\n`);
  
  rl.prompt();
  
  rl.on('line', async (line) => {
    const command = line.trim().toLowerCase();
    
    if (command === 'start' || command === 'start all') {
      await startAllServices();
    } else if (command.startsWith('start ')) {
      const serviceKey = command.substring(6);
      if (SERVICES[serviceKey]) {
        await startService(serviceKey);
      } else {
        console.log(`${COLORS.red}Unknown service: ${serviceKey}${COLORS.reset}`);
      }
    } else if (command === 'stop' || command === 'stop all') {
      stopAllServices();
    } else if (command.startsWith('stop ')) {
      const serviceKey = command.substring(5);
      if (SERVICES[serviceKey]) {
        stopService(serviceKey);
      } else {
        console.log(`${COLORS.red}Unknown service: ${serviceKey}${COLORS.reset}`);
      }
    } else if (command === 'restart' || command === 'restart all') {
      stopAllServices();
      // Wait a bit for processes to fully stop
      setTimeout(async () => {
        await startAllServices();
      }, 5000);
    } else if (command.startsWith('restart ')) {
      const serviceKey = command.substring(8);
      if (SERVICES[serviceKey]) {
        stopService(serviceKey);
        // Wait a bit for the process to fully stop
        setTimeout(async () => {
          await startService(serviceKey);
        }, 2000);
      } else {
        console.log(`${COLORS.red}Unknown service: ${serviceKey}${COLORS.reset}`);
      }
    } else if (command === 'status') {
      showStatus();
    } else if (command === 'health') {
      checkHealth();
    } else if (command === 'help') {
      console.log(`
${COLORS.bright}Available commands:${COLORS.reset}
  ${COLORS.bright}start all${COLORS.reset}        Start all services
  ${COLORS.bright}start <service>${COLORS.reset}  Start a specific service
  ${COLORS.bright}stop all${COLORS.reset}         Stop all services
  ${COLORS.bright}stop <service>${COLORS.reset}   Stop a specific service
  ${COLORS.bright}restart all${COLORS.reset}      Restart all services
  ${COLORS.bright}restart <service>${COLORS.reset} Restart a specific service
  ${COLORS.bright}status${COLORS.reset}           Show status of all services
  ${COLORS.bright}health${COLORS.reset}           Check health of running services
  ${COLORS.bright}exit${COLORS.reset}             Exit the CLI (stops all services)
  ${COLORS.bright}help${COLORS.reset}             Show this help message

${COLORS.bright}Available services:${COLORS.reset}
${Object.keys(SERVICES).map(key => `  ${COLORS.bright}${key}${COLORS.reset} - ${SERVICES[key].name} (port ${SERVICES[key].port})`).join('\n')}
`);
    } else if (command === 'exit' || command === 'quit') {
      stopAllServices();
      setTimeout(() => process.exit(0), 2000);
      return;
    } else {
      console.log(`${COLORS.red}Unknown command: ${command}${COLORS.reset}`);
      console.log(`Type ${COLORS.bright}help${COLORS.reset} for available commands`);
    }
    
    rl.prompt();
  }).on('close', () => {
    stopAllServices();
    setTimeout(() => process.exit(0), 2000);
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log(`\n${COLORS.yellow}Received SIGINT. Shutting down...${COLORS.reset}`);
    stopAllServices();
    setTimeout(() => process.exit(0), 2000);
  });
}

// Start the CLI
startCLI();
