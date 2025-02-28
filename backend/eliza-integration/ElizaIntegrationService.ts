import axios from 'axios';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import { EventEmitter } from 'events';
import { initializeDatabaseAdapter } from './database';

/**
 * ElizaOS Integration Service
 * 
 * This service manages the interaction between Paradyze V2 and ElizaOS.
 * It handles:
 * - Starting and stopping the ElizaOS runtime
 * - Creating and managing ElizaOS agents
 * - Sending messages to agents and receiving responses
 * - Twitter integration for posting content
 */
export class ElizaIntegrationService extends EventEmitter {
  private elizaProcess: ChildProcess | null = null;
  private elizaApiBaseUrl: string;
  private elizaRuntimePath: string;
  private isRunning: boolean = false;
  private characterPath: string;
  private messageCache: Map<string, {timestamp: number, response: string}> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
  private databaseAdapter: any; // Database adapter instance
  
  constructor(options: {
    elizaRuntimePath?: string;
    elizaApiBaseUrl?: string;
    characterPath?: string;
  } = {}) {
    super();
    
    this.elizaRuntimePath = options.elizaRuntimePath || 
      path.resolve(process.cwd(), '../eliza-main');
      
    this.elizaApiBaseUrl = options.elizaApiBaseUrl || 
      'http://localhost:3000';
      
    this.characterPath = options.characterPath || 
      path.resolve(this.elizaRuntimePath, 'characters');
    
    // Initialize the database adapter asynchronously
    this.initDatabase();
    
    console.log('ElizaIntegrationService initialized with:');
    console.log('- elizaRuntimePath:', this.elizaRuntimePath);
    console.log('- elizaApiBaseUrl:', this.elizaApiBaseUrl);
    console.log('- characterPath:', this.characterPath);
  }
  
  /**
   * Initialize the database adapter
   */
  private async initDatabase() {
    try {
      this.databaseAdapter = await initializeDatabaseAdapter();
      console.log('Database adapter initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database adapter:', error);
    }
  }
  
  /**
   * Configure ElizaOS to use SQLite
   */
  async configureSqliteDatabase(): Promise<void> {
    try {
      // Check if .env file exists in ElizaOS runtime directory
      const envFilePath = path.join(this.elizaRuntimePath, '.env');
      if (!fs.existsSync(envFilePath)) {
        console.error('ElizaOS .env file not found');
        return;
      }
      
      // Read the current .env file
      let envContent = fs.readFileSync(envFilePath, 'utf8');
      
      // Update the DATABASE_URL to use SQLite
      const dbUrl = process.env.DATABASE_URL || 'sqlite:./data/paradyze.db';
      
      // Replace or add the DATABASE_URL
      if (envContent.includes('DATABASE_URL=')) {
        envContent = envContent.replace(/DATABASE_URL=.*$/m, `DATABASE_URL=${dbUrl}`);
      } else {
        envContent += `\nDATABASE_URL=${dbUrl}\n`;
      }
      
      // Write the updated .env file
      fs.writeFileSync(envFilePath, envContent);
      
      console.log('ElizaOS configured to use SQLite database');
    } catch (error) {
      console.error('Failed to configure SQLite database:', error);
    }
  }
  
  /**
   * Start the ElizaOS runtime
   */
  async startElizaRuntime(): Promise<boolean> {
    if (this.isRunning) {
      console.log('ElizaOS is already running');
      return true;
    }
    
    // Ensure database adapter is initialized
    if (!this.databaseAdapter) {
      try {
        console.log('Initializing database adapter before starting ElizaOS runtime');
        this.databaseAdapter = await initializeDatabaseAdapter();
        console.log('Database adapter initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database adapter:', error);
        // Continue even if database initialization fails
      }
    }
    
    // Configure SQLite database before starting
    await this.configureSqliteDatabase();
    
    // Check if .env file exists
    const envFilePath = path.join(this.elizaRuntimePath, '.env');
    if (!fs.existsSync(envFilePath)) {
      throw new Error('ElizaOS .env file not found. Please create one from .env.example');
    }
    
    return new Promise((resolve, reject) => {
      try {
        console.log('Starting ElizaOS runtime...');
        
        // Execute the start.sh script
        this.elizaProcess = spawn(
          'bash', 
          ['scripts/start.sh'], 
          { 
            cwd: this.elizaRuntimePath,
            env: { ...process.env },
            stdio: ['inherit', 'pipe', 'pipe']
          }
        );
        
        // Handle process output
        if (this.elizaProcess.stdout) {
          this.elizaProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`ElizaOS: ${output}`);
            
            // Check for success indicators in the output
            if (output.includes('Agent runtime started') || 
                output.includes('Eliza is running')) {
              this.isRunning = true;
              resolve(true);
            }
          });
        }
        
        // Handle error output
        if (this.elizaProcess.stderr) {
          this.elizaProcess.stderr.on('data', (data) => {
            console.error(`ElizaOS Error: ${data.toString()}`);
          });
        }
        
        // Handle process exit
        this.elizaProcess.on('close', (code) => {
          this.isRunning = false;
          if (code !== 0) {
            console.error(`ElizaOS process exited with code ${code}`);
            reject(new Error(`ElizaOS process exited with code ${code}`));
          } else {
            console.log('ElizaOS process exited successfully');
            resolve(false);
          }
        });
        
        // Set a timeout for startup
        setTimeout(() => {
          if (!this.isRunning) {
            reject(new Error('ElizaOS startup timed out after 60 seconds'));
          }
        }, 60000);
        
      } catch (error) {
        console.error('Failed to start ElizaOS runtime:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Stop the ElizaOS runtime
   */
  async stopElizaRuntime(): Promise<void> {
    if (!this.elizaProcess) {
      console.log('ElizaOS is not running');
      return;
    }
    
    return new Promise((resolve, reject) => {
      try {
        console.log('Stopping ElizaOS runtime...');
        
        // Set up process exit handler
        this.elizaProcess?.on('exit', () => {
          this.isRunning = false;
          this.elizaProcess = null;
          console.log('ElizaOS process stopped');
          resolve();
        });
        
        // Kill the process
        this.elizaProcess?.kill('SIGTERM');
        
        // Set a timeout for shutdown
        setTimeout(() => {
          if (this.elizaProcess) {
            this.elizaProcess.kill('SIGKILL');
            this.isRunning = false;
            this.elizaProcess = null;
            console.log('ElizaOS process force-killed');
            resolve();
          }
        }, 10000);
        
      } catch (error) {
        console.error('Failed to stop ElizaOS runtime:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Check if ElizaOS API is available
   */
  async checkApiAvailability(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.elizaApiBaseUrl}/agents`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Create an agent using a character template
   */
  async createAgent(templateName: string, name?: string, description?: string, customCharacter?: any): Promise<string> {
    try {
      console.log('createAgent called with:');
      console.log('- templateName:', templateName);
      console.log('- name:', name);
      console.log('- description:', description);
      console.log('- customCharacter:', JSON.stringify(customCharacter, null, 2));
      
      let character;
      
      // If a custom character configuration is provided, use it as the base
      if (customCharacter) {
        console.log('Using provided custom character configuration');
        character = {
          // Set required defaults
          modelProvider: customCharacter.modelProvider || 'openrouter',
          settings: {
            model: customCharacter.settings?.model || 'openai/gpt-4',
            ...customCharacter.settings
          },
          // Use the custom character configuration
          ...customCharacter,
          // Ensure name and description are set
          name: name || customCharacter.name,
          description: description || customCharacter.description
        };
        
        // Ensure required arrays exist
        character.clients = character.clients || ['direct'];
        character.plugins = character.plugins || [];
        character.style = character.style || {
          all: [],
          chat: [],
          post: []
        };
        
        console.log('Final custom character configuration:', JSON.stringify(character, null, 2));
      } else {
        // Only load template if no custom character is provided
        const templatePath = path.join(this.characterPath, `${templateName}.character.json`);
        console.log(`Looking for character template at: ${templatePath}`);
        
        if (!fs.existsSync(templatePath)) {
          console.log(`Available files in ${this.characterPath}:`, fs.readdirSync(this.characterPath));
          throw new Error(`Character template not found: ${templateName}`);
        }
        
        character = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
        console.log(`Loaded character template: ${templateName}`);
        
        // Override name and description if provided
        if (name) character.name = name;
        if (description) character.description = description;
      }
      
      console.log(`Sending request to ElizaOS API at: ${this.elizaApiBaseUrl}/agent/start`);
      console.log('Request payload:', JSON.stringify({ characterJson: character }, null, 2));
      
      // Create the agent via API
      const response = await axios.post(`${this.elizaApiBaseUrl}/agent/start`, {
        characterJson: character
      });
      
      console.log('ElizaOS API response:', JSON.stringify(response.data, null, 2));
      
      const agentId = response.data.id;
      
      // Save the agent to our SQL database
      if (this.databaseAdapter) {
        try {
          console.log(`Saving agent ${agentId} to database`);
          
          // Check if the agent already exists in the database
          const existingAgent = await this.databaseAdapter.db.prepare(
            'SELECT id FROM agents WHERE id = ?'
          ).get(agentId);
          
          if (!existingAgent) {
            // Insert the agent into the database
            await this.databaseAdapter.db.prepare(
              'INSERT INTO agents (id, name, description, system_prompt, metadata) VALUES (?, ?, ?, ?, ?)'
            ).run(
              agentId,
              character.name,
              description || character.description || '',
              character.systemPrompt || '',
              JSON.stringify(character)
            );
            console.log(`Agent ${agentId} saved to database successfully`);
          } else {
            console.log(`Agent ${agentId} already exists in database, updating...`);
            // Update the existing agent
            await this.databaseAdapter.db.prepare(
              'UPDATE agents SET name = ?, description = ?, system_prompt = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
            ).run(
              character.name,
              description || character.description || '',
              character.systemPrompt || '',
              JSON.stringify(character),
              agentId
            );
            console.log(`Agent ${agentId} updated in database successfully`);
          }
        } catch (dbError) {
          console.error('Failed to save agent to database:', dbError);
          // Continue even if database save fails - at least the agent was created in ElizaOS
        }
      } else {
        console.warn('Database adapter not initialized, agent not saved to database');
      }
      
      return agentId;
    } catch (error) {
      console.error('Failed to create agent:', error);
      throw error;
    }
  }
  
  /**
   * Get a list of active agents
   */
  async listAgents(): Promise<any[]> {
    try {
      // First try to get agents from our database
      if (this.databaseAdapter) {
        try {
          console.log('Retrieving agents from database');
          const dbAgents = await this.databaseAdapter.db.prepare(
            'SELECT id, name, description, system_prompt, metadata, created_at, updated_at FROM agents'
          ).all();
          
          if (dbAgents && dbAgents.length > 0) {
            console.log(`Found ${dbAgents.length} agents in database`);
            // Parse metadata JSON for each agent
            return dbAgents.map((agent: any) => ({
              ...agent,
              metadata: agent.metadata ? JSON.parse(agent.metadata) : {}
            }));
          }
        } catch (dbError) {
          console.error('Failed to retrieve agents from database:', dbError);
          // Continue to try the API if database retrieval fails
        }
      }
      
      // Fallback to ElizaOS API if database is empty or not available
      console.log('Retrieving agents from ElizaOS API');
      const response = await axios.get(`${this.elizaApiBaseUrl}/agents`);
      const apiAgents = response.data.agents || [];
      
      // If we got agents from the API but not from the database, save them to the database
      if (apiAgents.length > 0 && this.databaseAdapter) {
        console.log(`Saving ${apiAgents.length} agents from API to database`);
        for (const agent of apiAgents) {
          try {
            // Check if agent exists in database
            const existingAgent = await this.databaseAdapter.db.prepare(
              'SELECT id FROM agents WHERE id = ?'
            ).get(agent.id);
            
            if (!existingAgent) {
              // Insert the agent into the database
              await this.databaseAdapter.db.prepare(
                'INSERT INTO agents (id, name, description, system_prompt, metadata) VALUES (?, ?, ?, ?, ?)'
              ).run(
                agent.id,
                agent.name,
                agent.description || '',
                agent.systemPrompt || '',
                JSON.stringify(agent)
              );
            }
          } catch (saveError) {
            console.error(`Failed to save agent ${agent.id} to database:`, saveError);
          }
        }
      }
      
      return apiAgents;
    } catch (error) {
      console.error('Failed to list agents:', error);
      
      // If API call fails but we have a database, try to return agents from database only
      if (this.databaseAdapter) {
        try {
          console.log('API failed, retrieving agents from database only');
          const dbAgents = await this.databaseAdapter.db.prepare(
            'SELECT id, name, description, system_prompt, metadata, created_at, updated_at FROM agents'
          ).all();
          
          if (dbAgents && dbAgents.length > 0) {
            console.log(`Found ${dbAgents.length} agents in database`);
            // Parse metadata JSON for each agent
            return dbAgents.map((agent: any) => ({
              ...agent,
              metadata: agent.metadata ? JSON.parse(agent.metadata) : {}
            }));
          }
        } catch (dbError) {
          console.error('Failed to retrieve agents from database as fallback:', dbError);
        }
      }
      
      // If all else fails, return an empty array
      return [];
    }
  }
  
  /**
   * Get a specific agent by ID
   */
  async getAgent(agentId: string): Promise<any> {
    try {
      // First try to get the agent from our database
      if (this.databaseAdapter) {
        try {
          console.log(`Retrieving agent ${agentId} from database`);
          const dbAgent = await this.databaseAdapter.db.prepare(
            'SELECT id, name, description, system_prompt, metadata, created_at, updated_at FROM agents WHERE id = ?'
          ).get(agentId);
          
          if (dbAgent) {
            console.log(`Found agent ${agentId} in database`);
            // Parse metadata JSON
            return {
              ...dbAgent,
              metadata: dbAgent.metadata ? JSON.parse(dbAgent.metadata) : {}
            };
          }
        } catch (dbError) {
          console.error(`Failed to retrieve agent ${agentId} from database:`, dbError);
          // Continue to try the API if database retrieval fails
        }
      }
      
      // Fallback to ElizaOS API if not found in database or database not available
      console.log(`Retrieving agent ${agentId} from ElizaOS API`);
      const response = await axios.get(`${this.elizaApiBaseUrl}/agents/${agentId}`);
      const apiAgent = response.data;
      
      // If we got the agent from the API but not from the database, save it to the database
      if (apiAgent && this.databaseAdapter) {
        try {
          console.log(`Saving agent ${agentId} from API to database`);
          // Check if agent exists in database
          const existingAgent = await this.databaseAdapter.db.prepare(
            'SELECT id FROM agents WHERE id = ?'
          ).get(agentId);
          
          if (!existingAgent) {
            // Insert the agent into the database
            await this.databaseAdapter.db.prepare(
              'INSERT INTO agents (id, name, description, system_prompt, metadata) VALUES (?, ?, ?, ?, ?)'
            ).run(
              agentId,
              apiAgent.name,
              apiAgent.description || '',
              apiAgent.systemPrompt || '',
              JSON.stringify(apiAgent)
            );
          } else {
            // Update the existing agent
            await this.databaseAdapter.db.prepare(
              'UPDATE agents SET name = ?, description = ?, system_prompt = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
            ).run(
              apiAgent.name,
              apiAgent.description || '',
              apiAgent.systemPrompt || '',
              JSON.stringify(apiAgent),
              agentId
            );
          }
        } catch (saveError) {
          console.error(`Failed to save agent ${agentId} to database:`, saveError);
        }
      }
      
      return apiAgent;
    } catch (error) {
      console.error(`Failed to get agent ${agentId}:`, error);
      
      // If API call fails but we have a database, try to return agent from database only
      if (this.databaseAdapter) {
        try {
          console.log(`API failed, retrieving agent ${agentId} from database only`);
          const dbAgent = await this.databaseAdapter.db.prepare(
            'SELECT id, name, description, system_prompt, metadata, created_at, updated_at FROM agents WHERE id = ?'
          ).get(agentId);
          
          if (dbAgent) {
            console.log(`Found agent ${agentId} in database as fallback`);
            // Parse metadata JSON
            return {
              ...dbAgent,
              metadata: dbAgent.metadata ? JSON.parse(dbAgent.metadata) : {}
            };
          }
        } catch (dbError) {
          console.error(`Failed to retrieve agent ${agentId} from database as fallback:`, dbError);
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Delete an agent by ID
   */
  async deleteAgent(agentId: string): Promise<void> {
    try {
      // First try to delete from ElizaOS API
      try {
        await axios.delete(`${this.elizaApiBaseUrl}/agents/${agentId}`);
        console.log(`Agent ${agentId} deleted from ElizaOS API`);
      } catch (apiError) {
        console.error(`Failed to delete agent ${agentId} from ElizaOS API:`, apiError);
        // Continue to delete from database even if API deletion fails
      }
      
      // Then delete from our database
      if (this.databaseAdapter) {
        try {
          console.log(`Deleting agent ${agentId} from database`);
          await this.databaseAdapter.db.prepare(
            'DELETE FROM agents WHERE id = ?'
          ).run(agentId);
          console.log(`Agent ${agentId} deleted from database`);
        } catch (dbError) {
          console.error(`Failed to delete agent ${agentId} from database:`, dbError);
          throw dbError;
        }
      } else {
        console.warn('Database adapter not initialized, agent not deleted from database');
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
      throw error;
    }
  }
  
  /**
   * Send a message to an agent and get the response
   */
  async sendMessage(agentId: string, message: string, userId?: string): Promise<string> {
    try {
      const overallStartTime = Date.now();
      console.log(`Sending message to agent ${agentId}`);
      
      // Check cache for this agent+message combination
      const cacheKey = `${agentId}:${message}`;
      const cachedResponse = this.messageCache.get(cacheKey);
      if (cachedResponse && (Date.now() - cachedResponse.timestamp) < this.CACHE_TTL) {
        console.log('[PERF] Returning cached response');
        return cachedResponse.response;
      }
      
      // Create FormData just like the web client does
      const formData = new FormData();
      formData.append('text', message);
      formData.append('user', 'user');
      
      // Log the request details
      console.log('Sending message with FormData to:', `${this.elizaApiBaseUrl}/${agentId}/message`);
      
      // Start performance timer
      const startTime = Date.now();
      console.log(`[PERF] Request preparation took ${startTime - overallStartTime}ms`);
      
      // Send the message exactly like the ElizaOS web client does
      const response = await axios.post(
        `${this.elizaApiBaseUrl}/${agentId}/message`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // Add timeout to prevent excessive waiting
          timeout: 30000, // 30 second timeout
        }
      );
      
      // Log performance metrics
      const endTime = Date.now();
      console.log(`[PERF] Network request took ${endTime - startTime}ms`);
      
      console.log('Message sent successfully');
      
      // Process the response
      const processingStartTime = Date.now();
      let result: string;
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Web client response format returns an array of messages
        const agentResponse = response.data[0];
        result = this.extractResponseText(agentResponse);
      } else {
        result = this.extractResponseText(response.data);
      }
      
      // Cache the result
      this.messageCache.set(cacheKey, {
        timestamp: Date.now(),
        response: result
      });
      
      const processingEndTime = Date.now();
      console.log(`[PERF] Response processing took ${processingEndTime - processingStartTime}ms`);
      console.log(`[PERF] Total sendMessage execution time: ${processingEndTime - overallStartTime}ms`);
      
      return result;
    } catch (error) {
      console.error('Failed to send message:', error instanceof Error ? error.message : 'Unknown error', 
                    error instanceof Error && 'response' in error ? error.response : '');
      return `[Simulated] I'm sorry, I couldn't process your message due to an API error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
  
  /**
   * Helper method to extract text from various response formats
   */
  private extractResponseText(data: any): string {
    if (!data) return 'No response received';
    
    if (typeof data === 'string') return data;
    
    if (data.response) return data.response;
    if (data.text) return data.text;
    if (data.message) return data.message;
    if (data.content) return data.content;
    
    return JSON.stringify(data);
  }
  
  /**
   * Get conversation history for an agent and user
   */
  async getConversationHistory(agentId: string, userId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.elizaApiBaseUrl}/agents/${agentId}/messages?userId=${userId}`
      );
      
      return response.data.messages || [];
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      throw error;
    }
  }
  
  /**
   * Send a tweet via an ElizaOS Twitter client
   * Note: The agent must have Twitter client enabled in its character definition
   */
  async sendTweet(agentId: string, content: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.elizaApiBaseUrl}/agents/${agentId}/actions/tweet`, 
        { content }
      );
      
      return response.data;
    } catch (error) {
      console.error('Failed to send tweet:', error);
      throw error;
    }
  }
  
  /**
   * Update an agent's character configuration
   */
  async updateAgentCharacter(agentId: string, characterUpdates: any): Promise<void> {
    try {
      await axios.patch(
        `${this.elizaApiBaseUrl}/agents/${agentId}`, 
        { character: characterUpdates }
      );
    } catch (error) {
      console.error('Failed to update agent character:', error);
      throw error;
    }
  }
  
  /**
   * Set the agent's model provider to ensure consistent model usage
   * This helps avoid issues with unavailable model providers
   */
  async setAgentModelProvider(agentId: string, modelProvider: string = 'openrouter'): Promise<void> {
    try {
      console.log(`Setting agent ${agentId} to use model provider: ${modelProvider}`);
      
      // Get the current agent configuration
      const agent = await this.getAgent(agentId);
      
      // Update the character settings to use the specified model provider
      const characterUpdates = {
        settings: {
          ...(agent.character?.settings || {}),
          modelProvider: modelProvider
        }
      };
      
      // Apply the updates
      await this.updateAgentCharacter(agentId, characterUpdates);
      console.log(`Successfully set agent model provider to ${modelProvider}`);
    } catch (error) {
      console.error(`Failed to set agent model provider:`, error);
      throw error;
    }
  }
  
  /**
   * Add Twitter client to an agent
   */
  async enableTwitterClient(agentId: string): Promise<void> {
    try {
      // Get current character
      const agentResponse = await axios.get(`${this.elizaApiBaseUrl}/agents/${agentId}`);
      const character = agentResponse.data.character;
      
      // Add Twitter client if not already present
      if (!character.clients.includes('twitter')) {
        character.clients.push('twitter');
        
        // Update the character
        await this.updateAgentCharacter(agentId, {
          clients: character.clients
        });
      }
    } catch (error) {
      console.error('Failed to enable Twitter client:', error);
      throw error;
    }
  }
}

// Create and export the ElizaIntegrationService instance
export const elizaService = new ElizaIntegrationService();
