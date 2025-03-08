// Test script for ElizaIntegrationService
import { ElizaIntegrationService } from './ElizaIntegrationService.js';

async function testElizaIntegration() {
  console.log('Testing ElizaIntegrationService...');
  
  // Test both integration modes
  await testApiMode();
  await testDirectMode();
  
  console.log('All tests completed!');
}

async function testApiMode() {
  console.log('\n=== Testing API Integration Mode ===');
  
  // Set environment variable for API mode
  process.env.ELIZAOS_INTEGRATION_MODE = 'api';
  
  // Create a new instance of ElizaIntegrationService
  const elizaService = new ElizaIntegrationService();
  
  try {
    // Test starting the ElizaOS runtime
    console.log('Starting ElizaOS runtime...');
    const isStarted = await elizaService.startElizaRuntime();
    console.log(`ElizaOS runtime started: ${isStarted}`);
    
    // Test API availability
    console.log('Checking API availability...');
    const isAvailable = await elizaService.checkApiAvailability();
    console.log(`API available: ${isAvailable}`);
    
    if (isAvailable) {
      // Test creating an agent
      console.log('Creating agent...');
      const agentId = await elizaService.createAgent('default', 'Test Agent', 'A test agent');
      console.log(`Agent created with ID: ${agentId}`);
      
      // Test listing agents
      console.log('Listing agents...');
      const agents = await elizaService.listAgents();
      console.log(`Found ${agents.length} agents`);
      
      // Test sending a message
      console.log('Sending message...');
      const response = await elizaService.sendMessage(agentId, 'Hello, agent!');
      console.log(`Response: ${response}`);
      
      // Test deleting the agent
      console.log('Deleting agent...');
      await elizaService.deleteAgent(agentId);
      console.log('Agent deleted');
    }
    
    // Test stopping the ElizaOS runtime
    console.log('Stopping ElizaOS runtime...');
    await elizaService.stopElizaRuntime();
    console.log('ElizaOS runtime stopped');
  } catch (error) {
    console.error('Error in API mode test:', error);
  }
}

async function testDirectMode() {
  console.log('\n=== Testing Direct Integration Mode ===');
  
  // Set environment variable for direct mode
  process.env.ELIZAOS_INTEGRATION_MODE = 'direct';
  
  // Create a new instance of ElizaIntegrationService
  const elizaService = new ElizaIntegrationService();
  
  try {
    // Test starting the ElizaOS runtime
    console.log('Starting ElizaOS runtime...');
    const isStarted = await elizaService.startElizaRuntime();
    console.log(`ElizaOS runtime started: ${isStarted}`);
    
    // Test API availability
    console.log('Checking API availability...');
    const isAvailable = await elizaService.checkApiAvailability();
    console.log(`API available: ${isAvailable}`);
    
    if (isAvailable) {
      // Test creating an agent
      console.log('Creating agent...');
      const agentId = await elizaService.createAgent('default', 'Test Agent', 'A test agent');
      console.log(`Agent created with ID: ${agentId}`);
      
      // Test listing agents
      console.log('Listing agents...');
      const agents = await elizaService.listAgents();
      console.log(`Found ${agents.length} agents`);
      
      // Test sending a message
      console.log('Sending message...');
      const response = await elizaService.sendMessage(agentId, 'Hello, agent!');
      console.log(`Response: ${response}`);
      
      // Test agent status
      console.log('Checking agent status...');
      const status = await elizaService.getAgentStatus(agentId);
      console.log(`Agent status: ${JSON.stringify(status)}`);
      
      // Test restarting agent
      console.log('Restarting agent...');
      await elizaService.restartAgent(agentId);
      console.log('Agent restarted');
      
      // Test deleting the agent
      console.log('Deleting agent...');
      await elizaService.deleteAgent(agentId);
      console.log('Agent deleted');
    }
    
    // Test stopping the ElizaOS runtime
    console.log('Stopping ElizaOS runtime...');
    await elizaService.stopElizaRuntime();
    console.log('ElizaOS runtime stopped');
  } catch (error) {
    console.error('Error in direct mode test:', error);
  }
}

// Run the tests
testElizaIntegration().catch(console.error);
