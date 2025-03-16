import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { elizaService } from './ElizaIntegrationService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.INTEGRATION_PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ElizaOS Runtime Management Endpoints

/**
 * Start the ElizaOS runtime
 */
app.post('/api/eliza/start', async (req, res) => {
  try {
    const result = await elizaService.startElizaRuntime();
    res.status(200).json({ success: result });
  } catch (error) {
    console.error('Failed to start ElizaOS:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Stop the ElizaOS runtime
 */
app.post('/api/eliza/stop', async (req, res) => {
  try {
    await elizaService.stopElizaRuntime();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to stop ElizaOS:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Check ElizaOS status
 */
app.get('/api/eliza/status', async (req, res) => {
  try {
    const isAvailable = await elizaService.checkApiAvailability();
    res.status(200).json({ running: isAvailable });
  } catch (error) {
    console.error('Failed to check ElizaOS status:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Agent Management Endpoints

/**
 * Create a new agent
 */
app.post('/api/agents', async (req, res) => {
  try {
    const { templateName, name, description, character } = req.body;
    
    // Add debug logging
    console.log('Creating agent with:');
    console.log('- templateName:', templateName);
    console.log('- name:', name);
    console.log('- description:', description);
    console.log('- character:', JSON.stringify(character, null, 2));
    
    if (!templateName) {
      return res.status(400).json({ error: 'Template name is required' });
    }
    
    // Pass the custom character configuration to the createAgent method if provided
    const agentId = await elizaService.createAgent(templateName, name, description, character);
    res.status(201).json({ agentId });
  } catch (error) {
    console.error('Failed to create agent:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * List all agents
 */
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await elizaService.listAgents();
    res.status(200).json({ agents });
  } catch (error) {
    console.error('Failed to list agents:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get a specific agent by ID
 */
app.get('/api/agents/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await elizaService.getAgent(agentId);
    
    // Just return the agent data directly without wrapping it
    res.status(200).json(agent);
  } catch (error) {
    console.error(`Failed to get agent ${req.params.agentId}:`, error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Delete an agent
 */
app.delete('/api/agents/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    await elizaService.deleteAgent(agentId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to delete agent:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Messaging Endpoints

/**
 * Send a message to an agent
 */
app.post('/api/agents/:agentId/messages', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await elizaService.sendMessage(agentId, message, userId);
    res.status(200).json({ response });
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Send a message to an agent (alternate endpoint for frontend)
 */
app.post('/api/agents/:agentId/message', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Using a fixed userId for simplicity in the web UI
    const userId = 'web-user';
    
    console.log(`Sending message to agent ${agentId}: ${message}`);
    
    try {
      const response = await elizaService.sendMessage(agentId, message, userId);
      res.status(200).json({ response });
    } catch (elizaError) {
      console.error('ElizaOS API error:', elizaError);
      
      // If ElizaOS API fails, provide a simulated response for development
      console.log('Providing simulated response for development');
      const simulatedResponse = `I'm agent ${agentId} responding to your message: "${message}". The ElizaOS messaging API is currently not available, so this is a simulated response. Please ensure ElizaOS is running properly.`;
      res.status(200).json({ response: simulatedResponse });
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get conversation history
 */
app.get('/api/agents/:agentId/messages', async (req, res) => {
  try {
    const { agentId } = req.params;
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const messages = await elizaService.getConversationHistory(agentId, userId);
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Failed to get conversation history:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Twitter Integration Endpoints

/**
 * Enable Twitter integration for an agent
 */
app.post('/api/agents/:agentId/twitter/enable', async (req, res) => {
  try {
    const { agentId } = req.params;
    await elizaService.enableTwitterClient(agentId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to enable Twitter integration:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Set model provider for an agent
 * This helps fix issues with model selection and slow response times
 */
app.post('/api/agents/:agentId/model-provider', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { provider = 'openrouter' } = req.body;
    
    console.log(`Setting model provider for agent ${agentId} to ${provider}`);
    
    await elizaService.setAgentModelProvider(agentId, provider);
    res.status(200).json({ 
      success: true, 
      message: `Agent ${agentId} now using ${provider} model provider` 
    });
  } catch (error) {
    console.error('Failed to set model provider:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Send a tweet via an agent
 */
app.post('/api/agents/:agentId/twitter/tweet', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Tweet content is required' });
    }
    
    const result = await elizaService.sendTweet(agentId, content);
    res.status(201).json(result);
  } catch (error) {
    console.error('Failed to send tweet:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`ElizaOS Integration API running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  elizaService.stopElizaRuntime().then(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  elizaService.stopElizaRuntime().then(() => {
    process.exit(0);
  });
});
