#!/usr/bin/env node
/**
 * Paradyze Service Status Checker
 * 
 * This script quickly checks the status of all required services and ports
 * to help diagnose potential issues.
 */

const http = require('http');
const { exec } = require('child_process');
const os = require('os');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Configuration
const ROOT_DIR = __dirname;
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Service definition
const SERVICES = [
  {
    name: 'Frontend',
    port: parseInt(process.env.FRONTEND_PORT || 3000),
    url: `http://localhost:${process.env.FRONTEND_PORT || 3000}`,
    envPath: path.join(ROOT_DIR, '.env')
  },
  {
    name: 'Integration API',
    port: parseInt(process.env.INTEGRATION_PORT || 3001),
    url: `http://localhost:${process.env.INTEGRATION_PORT || 3001}`,
    envPath: path.join(ROOT_DIR, 'backend/eliza-integration/.env')
  },
  {
    name: 'API Server',
    port: parseInt(process.env.API_PORT || 3002),
    url: `http://localhost:${process.env.API_PORT || 3002}`,
    envPath: path.join(ROOT_DIR, 'api-server/.env')
  },
  {
    name: 'OpenRouter Proxy',
    port: parseInt(process.env.OPENROUTER_PORT || 3003),
    url: `http://localhost:${process.env.OPENROUTER_PORT || 3003}/api/ai-chat`,
    envPath: path.join(ROOT_DIR, '.env')
  },
  {
    name: 'Eliza Main',
    port: parseInt(process.env.ELIZA_PORT || 3005),
    url: `http://localhost:${process.env.ELIZA_PORT || 3005}`,
    envPath: path.join(ROOT_DIR, 'backend/eliza-main/.env')
  }
];

/**
 * Check if a port is in use
 */
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false);
      }
      server.close();
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is free
    });
    
    server.listen(port);
  });
}

/**
 * Test if a service is responding
 */
async function testService(url, timeout = 5000) {
  return new Promise((resolve) => {
    const request = http.get(url, { timeout }, (response) => {
      if (response.statusCode >= 200 && response.statusCode < 500) {
        resolve(true);
      } else {
        resolve(false);
      }
      
      response.resume(); // Consume the response data
    });
    
    request.on('error', () => {
      resolve(false);
    });
    
    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });
  });
}

/**
 * Get process using a port
 */
async function getProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    let command = '';
    
    if (process.platform === 'win32') {
      command = `netstat -ano | findstr :${port}`;
    } else if (process.platform === 'darwin') {
      command = `lsof -i :${port} -sTCP:LISTEN -n -P | grep LISTEN`;
    } else {
      command = `lsof -i :${port} -sTCP:LISTEN -n -P | grep LISTEN`;
    }
    
    exec(command, (error, stdout) => {
      if (error || !stdout) {
        resolve(null);
        return;
      }
      
      resolve(stdout.trim());
    });
  });
}

/**
 * Check environment files
 */
function checkEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { exists: false, error: 'File does not exist' };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for critical variables
    const hasOpenRouterKey = content.includes('OPENROUTER_API_KEY=');
    const hasPort = content.includes('PORT=') || 
                   content.includes('FRONTEND_PORT=') || 
                   content.includes('INTEGRATION_PORT=') || 
                   content.includes('API_PORT=') ||
                   content.includes('ELIZA_PORT=') ||
                   content.includes('ELIZAOS_PORT=') ||
                   content.includes('OPENROUTER_PORT=');
    
    let issues = [];
    
    if (!hasOpenRouterKey) {
      issues.push('Missing OPENROUTER_API_KEY');
    }
    
    if (!hasPort) {
      issues.push('Missing PORT configuration');
    }
    
    return { 
      exists: true, 
      issues: issues.length > 0 ? issues : null
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.bright}${colors.blue}Paradyze Service Status Check${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}=============================${colors.reset}\n`);
  
  const systemInfo = {
    platform: os.platform(),
    release: os.release(),
    hostname: os.hostname(),
    memory: `${Math.round(os.freemem() / 1024 / 1024)}/${Math.round(os.totalmem() / 1024 / 1024)} MB`,
    cpus: os.cpus().length
  };
  
  console.log(`${colors.bright}System Information:${colors.reset}`);
  console.log(`  Platform: ${systemInfo.platform} ${systemInfo.release}`);
  console.log(`  Hostname: ${systemInfo.hostname}`);
  console.log(`  Memory (free/total): ${systemInfo.memory}`);
  console.log(`  CPUs: ${systemInfo.cpus}\n`);
  
  console.log(`${colors.bright}Environment Files:${colors.reset}`);
  
  // Check root .env file
  const rootEnvStatus = checkEnvFile(path.join(ROOT_DIR, '.env'));
  console.log(`  Root .env: ${rootEnvStatus.exists ? 
    (rootEnvStatus.issues ? colors.yellow + '⚠️  Issues found' + colors.reset : colors.green + '✓ OK' + colors.reset) : 
    colors.red + '✗ Missing' + colors.reset}`);
    
  if (rootEnvStatus.issues) {
    rootEnvStatus.issues.forEach(issue => {
      console.log(`    - ${colors.yellow}${issue}${colors.reset}`);
    });
  }
  
  console.log('\n');
  
  console.log(`${colors.bright}Service Status:${colors.reset}`);
  
  for (const service of SERVICES) {
    const portInUse = await isPortInUse(service.port);
    const serviceResponding = await testService(service.url);
    const processInfo = await getProcessOnPort(service.port);
    const envStatus = checkEnvFile(service.envPath);
    
    const status = serviceResponding ? 
      `${colors.green}● RUNNING${colors.reset}` : 
      portInUse ? 
        `${colors.yellow}● PORT IN USE${colors.reset}` : 
        `${colors.red}● STOPPED${colors.reset}`;
    
    console.log(`  ${colors.bright}${service.name}${colors.reset} (Port ${service.port}): ${status}`);
    
    if (portInUse && !serviceResponding) {
      console.log(`    ${colors.yellow}Port is in use but service is not responding${colors.reset}`);
      
      if (processInfo) {
        console.log(`    ${colors.dim}Process: ${processInfo}${colors.reset}`);
      }
    }
    
    // Display env file status
    if (service.envPath !== path.join(ROOT_DIR, '.env')) {
      console.log(`    Env file: ${envStatus.exists ? 
        (envStatus.issues ? colors.yellow + '⚠️  Issues found' + colors.reset : colors.green + '✓ OK' + colors.reset) : 
        colors.red + '✗ Missing' + colors.reset}`);
        
      if (envStatus.issues) {
        envStatus.issues.forEach(issue => {
          console.log(`      - ${colors.yellow}${issue}${colors.reset}`);
        });
      }
    }
    
    console.log();
  }
  
  console.log(`${colors.bright}Recommendation:${colors.reset}`);
  console.log(`  To fix any issues with the environment setup, run:`);
  console.log(`  ${colors.cyan}node setup-environment.js${colors.reset}`);
  console.log();
  console.log(`  To manage all services, run:`);
  console.log(`  ${colors.cyan}npm run dev:manager${colors.reset}`);
  console.log();
}

main().catch(error => {
  console.error('Error running check:', error);
  process.exit(1);
});
