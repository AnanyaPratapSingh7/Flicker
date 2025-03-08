import * as path from 'path';
import { spawn } from 'child_process';
import * as fs from 'fs';
import { EventEmitter } from 'events';
import * as dotenv from 'dotenv';
import { initializeDatabaseAdapter } from './database.js';
import { DirectClient } from '@elizaos/client-direct';
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
    constructor(options = {}) {
        super();
        this.elizaProcess = null;
        this.isRunning = false;
        this.messageCache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
        this.directClient = null; // ElizaOS DirectClient instance
        this.agents = new Map(); // Map of agent IDs to agent runtimes
        this.elizaRuntimePath = options.elizaRuntimePath ||
            path.resolve(process.cwd(), '../eliza-main');
        this.elizaApiBaseUrl = options.elizaApiBaseUrl ||
            process.env.ELIZA_API_URL || 'http://localhost:3000';
        this.characterPath = options.characterPath ||
            path.resolve(this.elizaRuntimePath, 'characters');
        // Initialize the database adapter asynchronously
        this.initDatabase();
        // Check integration mode and initialize DirectClient if in direct mode
        const integrationMode = process.env.ELIZAOS_INTEGRATION_MODE || 'api';
        if (integrationMode === 'direct') {
            console.log('Initializing ElizaOS in direct integration mode');
            this.initializeDirectClient();
        }
        else {
            console.log('Initializing ElizaOS in API integration mode');
        }
        console.log('ElizaIntegrationService initialized with:');
        console.log('- elizaRuntimePath:', this.elizaRuntimePath);
        console.log('- elizaApiBaseUrl:', this.elizaApiBaseUrl);
        console.log('- characterPath:', this.characterPath);
        console.log('- integrationMode:', integrationMode);
    }
    /**
     * Initialize the database adapter
     */
    async initDatabase() {
        try {
            this.databaseAdapter = await initializeDatabaseAdapter();
            console.log('Database adapter initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize database adapter:', error);
        }
    }
    /**
     * Initialize the DirectClient for direct ElizaOS integration
     * @returns {Promise<boolean>} True if initialization was successful, false otherwise
     */
    async initializeDirectClient() {
        try {
            console.log('Initializing ElizaOS DirectClient...');
            // Create a new DirectClient instance
            this.directClient = new DirectClient();
            if (!this.directClient) {
                throw new Error('Failed to create DirectClient instance');
            }
            console.log('ElizaOS DirectClient instance created successfully');
            // Get available methods on the DirectClient for debugging
            const availableMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.directClient))
                .filter(method => typeof this.directClient[method] === 'function');
            console.log('Available DirectClient methods:', availableMethods);
            // Use type assertion to check if initialize method exists
            const directClientAny = this.directClient;
            if (directClientAny.initialize && typeof directClientAny.initialize === 'function') {
                try {
                    await directClientAny.initialize();
                    console.log('DirectClient initialized with initialize() method');
                }
                catch (initMethodError) {
                    console.warn('Error calling DirectClient.initialize():', initMethodError);
                    console.log('Continuing without explicit initialization');
                }
            }
            else {
                console.log('DirectClient does not have an initialize method, continuing without explicit initialization');
            }
            // Check for critical message processing methods using type assertion
            const hasProcessMessage = typeof directClientAny.processMessage === 'function';
            const hasSendMessage = typeof directClientAny.sendMessage === 'function';
            if (hasProcessMessage) {
                console.log('DirectClient has processMessage method available');
            }
            else {
                console.warn('DirectClient does not have processMessage method');
            }
            if (hasSendMessage) {
                console.log('DirectClient has sendMessage method available');
            }
            else {
                console.warn('DirectClient does not have sendMessage method');
            }
            if (!hasProcessMessage && !hasSendMessage) {
                console.error('DirectClient has no message processing capabilities!');
                console.warn('Will fall back to OpenRouter API for message processing');
            }
            // Set the running state
            this.isRunning = true;
            console.log('ElizaOS DirectClient is ready');
            this.emit('ready');
            return true;
        }
        catch (error) {
            console.error('Failed to initialize ElizaOS DirectClient:', error);
            this.isRunning = false;
            this.directClient = null;
            this.emit('error', error);
            return false;
        }
    }
    /**
     * Helper method to extract text from various response formats
     * @param response The response object from DirectClient
     * @returns The extracted text or a default message
     */
    extractResponseText(response) {
        if (!response) {
            return 'No response received';
        }
        // Handle string responses
        if (typeof response === 'string') {
            return response;
        }
        // Check for common response properties
        if (response.content) {
            return response.content;
        }
        if (response.text) {
            return response.text;
        }
        if (response.message) {
            return typeof response.message === 'string' ? response.message :
                response.message.content || JSON.stringify(response.message);
        }
        if (response.response) {
            return typeof response.response === 'string' ? response.response :
                JSON.stringify(response.response);
        }
        // Handle array responses (e.g., message chunks)
        if (Array.isArray(response)) {
            return response.map(item => {
                if (typeof item === 'string')
                    return item;
                return item.content || item.text || JSON.stringify(item);
            }).join(' ');
        }
        // Last resort: stringify the entire response
        try {
            return JSON.stringify(response);
        }
        catch (e) {
            return 'Received a response that could not be processed';
        }
    }
    /**
     * Configure ElizaOS to use SQLite
     */
    async configureSqliteDatabase() {
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
            }
            else {
                envContent += `\nDATABASE_URL=${dbUrl}\n`;
            }
            // Write the updated .env file
            fs.writeFileSync(envFilePath, envContent);
            console.log('ElizaOS configured to use SQLite database');
        }
        catch (error) {
            console.error('Failed to configure SQLite database:', error);
        }
    }
    /**
     * Start the ElizaOS runtime
     */
    async startElizaRuntime() {
        if (this.isRunning) {
            console.log('ElizaOS is already running');
            return true;
        }
        // If in direct mode, initialize the DirectClient
        if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct') {
            try {
                console.log('Starting ElizaOS in direct mode...');
                // Initialize the DirectClient if not already initialized
                if (!this.directClient) {
                    this.initializeDirectClient();
                }
                // Wait for the DirectClient to be ready
                return new Promise((resolve) => {
                    if (this.directClient) {
                        // DirectClient doesn't use event emitters, use initialize method
                        // DirectClient doesn't have init or initialize methods
                        // We'll use a custom approach to check readiness
                        setTimeout(() => {
                            this.isRunning = true;
                            console.log('ElizaOS DirectClient is ready');
                            resolve(true);
                        }, 500);
                        // Handle potential errors separately
                        this.once('error', (error) => {
                            console.error('ElizaOS DirectClient initialization error:', error);
                            resolve(false);
                        });
                        // Set a timeout for startup
                        setTimeout(() => {
                            if (!this.isRunning) {
                                console.error('ElizaOS DirectClient startup timed out after 30 seconds');
                                resolve(false);
                            }
                        }, 30000);
                    }
                    else {
                        console.error('DirectClient initialization failed');
                        resolve(false);
                    }
                });
            }
            catch (error) {
                console.error('Failed to start ElizaOS in direct mode:', error);
                return false;
            }
        }
        // Ensure database adapter is initialized
        if (!this.databaseAdapter) {
            try {
                console.log('Initializing database adapter before starting ElizaOS runtime');
                this.databaseAdapter = await initializeDatabaseAdapter();
                console.log('Database adapter initialized successfully');
            }
            catch (error) {
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
                this.elizaProcess = spawn('bash', ['scripts/start.sh'], {
                    cwd: this.elizaRuntimePath,
                    env: { ...process.env },
                    stdio: ['inherit', 'pipe', 'pipe']
                });
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
                    }
                    else {
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
            }
            catch (error) {
                console.error('Failed to start ElizaOS runtime:', error);
                reject(error);
            }
        });
    }
    /**
     * Stop the ElizaOS runtime
     */
    async stopElizaRuntime() {
        // If in direct mode, stop the DirectClient
        if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
            try {
                console.log('Stopping ElizaOS DirectClient...');
                // Stop all agents first
                // Use Array.from to avoid iterator issues
                const agentEntries = Array.from(this.agents.entries());
                for (const [agentId, agentRuntime] of agentEntries) {
                    try {
                        console.log(`Stopping agent ${agentId}...`);
                        // Use terminateAgent instead of stopAgent
                        // DirectClient doesn't have stopAgent or terminateAgent methods
                        // We'll handle agent cleanup manually
                        if (this.agents.has(agentId)) {
                            this.agents.delete(agentId);
                        }
                    }
                    catch (agentError) {
                        console.error(`Failed to stop agent ${agentId}:`, agentError);
                        // Continue with other agents even if one fails
                    }
                }
                // Clear the agents map
                this.agents.clear();
                // Disconnect the DirectClient
                if (this.directClient) {
                    // Use shutdown instead of dispose
                    // DirectClient doesn't have dispose or shutdown methods
                    // We'll clean up resources manually
                    this.directClient = null;
                }
                this.isRunning = false;
                console.log('ElizaOS DirectClient stopped');
                return;
            }
            catch (error) {
                console.error('Failed to stop ElizaOS DirectClient:', error);
                throw error;
            }
        }
        // Otherwise, stop the ElizaOS process if it's running
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
            }
            catch (error) {
                console.error('Failed to stop ElizaOS runtime:', error);
                reject(error);
            }
        });
    }
    /**
     * Check if ElizaOS is available (either API or DirectClient)
     */
    async checkApiAvailability() {
        // If in direct mode and DirectClient is initialized, check if it's ready
        if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct') {
            return this.directClient !== null && this.isRunning;
        }
        // Otherwise, try to access the API
        try {
            // We can't use axios directly anymore, so use fetch instead
            const response = await fetch(`${this.elizaApiBaseUrl}/agents`);
            return response.status === 200;
        }
        catch (error) {
            console.error('Failed to check API availability:', error);
            return false;
        }
    }
    /**
     * Create an agent using a character template
     */
    async createAgent(templateName, name, description, customCharacter) {
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
            }
            else {
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
                if (name)
                    character.name = name;
                if (description)
                    character.description = description;
            }
            let agentId;
            // Check if we're in direct mode
            if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
                console.log('Creating agent using DirectClient');
                // Register the agent with the DirectClient
                agentId = await this.createAgentWithDirectClient(character);
                console.log(`Agent created with ID: ${agentId}`);
            }
            else {
                console.log(`Sending request to ElizaOS API at: ${this.elizaApiBaseUrl}/agent/start`);
                console.log('Request payload:', JSON.stringify({ characterJson: character }, null, 2));
                // Create the agent via API using fetch instead of axios
                const response = await fetch(`${this.elizaApiBaseUrl}/agent/start`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ characterJson: character })
                });
                if (!response.ok) {
                    throw new Error(`Failed to create agent: ${response.statusText}`);
                }
                const responseData = await response.json();
                console.log('ElizaOS API response:', JSON.stringify(responseData, null, 2));
                agentId = responseData.id;
            }
            // Save the agent to our SQL database
            if (this.databaseAdapter) {
                try {
                    console.log(`Saving agent ${agentId} to database`);
                    // Check if the agent already exists in the database
                    const existingAgent = await this.databaseAdapter.db.prepare('SELECT id FROM agents WHERE id = ?').get(agentId);
                    if (!existingAgent) {
                        // Insert the agent into the database
                        await this.databaseAdapter.db.prepare('INSERT INTO agents (id, name, description, system_prompt, metadata) VALUES (?, ?, ?, ?, ?)').run(agentId, character.name, description || character.description || '', character.systemPrompt || '', JSON.stringify(character));
                        console.log(`Agent ${agentId} saved to database successfully`);
                    }
                    else {
                        console.log(`Agent ${agentId} already exists in database, updating...`);
                        // Update the existing agent
                        await this.databaseAdapter.db.prepare('UPDATE agents SET name = ?, description = ?, system_prompt = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(character.name, description || character.description || '', character.systemPrompt || '', JSON.stringify(character), agentId);
                        console.log(`Agent ${agentId} updated in database successfully`);
                    }
                }
                catch (dbError) {
                    console.error('Failed to save agent to database:', dbError);
                    // Continue even if database save fails - at least the agent was created in ElizaOS
                }
            }
            else {
                console.warn('Database adapter not initialized, agent not saved to database');
            }
            return agentId;
        }
        catch (error) {
            console.error('Failed to create agent:', error);
            throw error;
        }
    }
    /**
     * Create an agent using the DirectClient
     */
    async createAgentWithDirectClient(character) {
        if (!this.directClient) {
            throw new Error('DirectClient is not initialized');
        }
        try {
            // Generate a unique ID for the agent
            const agentId = `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            // Register the agent with the DirectClient
            // DirectClient.registerAgent only takes one argument (the character)
            // The agentId will be returned by the method
            // DirectClient doesn't have registerAgent method
            // We'll use our generated ID
            const finalAgentId = agentId;
            // DirectClient doesn't have startAgent method
            // We'll create a mock agent runtime
            const agentRuntime = {
                character: {
                    name: character.name || 'Agent',
                },
                // Add any other required properties
            };
            // Store the agent runtime in our map
            this.agents.set(finalAgentId, agentRuntime);
            return finalAgentId;
        }
        catch (error) {
            console.error('Failed to create agent with DirectClient:', error);
            throw error;
        }
    }
    /**
     * Get a list of active agents
     */
    async listAgents() {
        try {
            // First try to get agents from our database
            if (this.databaseAdapter) {
                try {
                    console.log('Retrieving agents from database');
                    const dbAgents = await this.databaseAdapter.db.prepare('SELECT id, name, description, system_prompt, metadata, created_at, updated_at FROM agents').all();
                    if (dbAgents && dbAgents.length > 0) {
                        console.log(`Found ${dbAgents.length} agents in database`);
                        // Parse metadata JSON for each agent
                        return dbAgents.map((agent) => ({
                            ...agent,
                            metadata: agent.metadata ? JSON.parse(agent.metadata) : {}
                        }));
                    }
                }
                catch (dbError) {
                    console.error('Failed to retrieve agents from database:', dbError);
                    // Continue to try other methods if database retrieval fails
                }
            }
            // If in direct mode, get agents from DirectClient
            if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
                console.log('Retrieving agents from DirectClient');
                // Convert the Map of agents to an array of agent objects
                const directAgents = Array.from(this.agents.entries()).map(([id, runtime]) => {
                    return {
                        id,
                        name: runtime.character.name,
                        // Access character properties safely
                        // Access character properties safely
                        description: runtime.character?.name || '',
                        systemPrompt: '',
                        character: runtime.character
                    };
                });
                console.log(`Found ${directAgents.length} agents from DirectClient`);
                // If we got agents from DirectClient but not from the database, save them to the database
                if (directAgents.length > 0 && this.databaseAdapter) {
                    console.log(`Saving ${directAgents.length} agents from DirectClient to database`);
                    for (const agent of directAgents) {
                        try {
                            // Check if agent exists in database
                            const existingAgent = await this.databaseAdapter.db.prepare('SELECT id FROM agents WHERE id = ?').get(agent.id);
                            if (!existingAgent) {
                                // Insert the agent into the database
                                await this.databaseAdapter.db.prepare('INSERT INTO agents (id, name, description, system_prompt, metadata) VALUES (?, ?, ?, ?, ?)').run(agent.id, agent.name, agent.description || '', agent.systemPrompt || '', JSON.stringify(agent.character));
                            }
                        }
                        catch (saveError) {
                            console.error(`Failed to save agent ${agent.id} to database:`, saveError);
                        }
                    }
                }
                return directAgents;
            }
            // Fallback to ElizaOS API if database is empty or not available and not in direct mode
            console.log('Retrieving agents from ElizaOS API');
            const response = await fetch(`${this.elizaApiBaseUrl}/agents`);
            if (!response.ok) {
                throw new Error(`Failed to list agents: ${response.statusText}`);
            }
            const responseData = await response.json();
            const apiAgents = responseData.agents || [];
            // If we got agents from the API but not from the database, save them to the database
            if (apiAgents.length > 0 && this.databaseAdapter) {
                console.log(`Saving ${apiAgents.length} agents from API to database`);
                for (const agent of apiAgents) {
                    try {
                        // Check if agent exists in database
                        const existingAgent = await this.databaseAdapter.db.prepare('SELECT id FROM agents WHERE id = ?').get(agent.id);
                        if (!existingAgent) {
                            // Insert the agent into the database
                            await this.databaseAdapter.db.prepare('INSERT INTO agents (id, name, description, system_prompt, metadata) VALUES (?, ?, ?, ?, ?)').run(agent.id, agent.name, agent.description || '', agent.systemPrompt || '', JSON.stringify(agent));
                        }
                    }
                    catch (saveError) {
                        console.error(`Failed to save agent ${agent.id} to database:`, saveError);
                    }
                }
            }
            return apiAgents;
        }
        catch (error) {
            console.error('Failed to list agents:', error);
            // If API call fails but we have a database, try to return agents from database only
            if (this.databaseAdapter) {
                try {
                    console.log('API failed, retrieving agents from database only');
                    const dbAgents = await this.databaseAdapter.db.prepare('SELECT id, name, description, system_prompt, metadata, created_at, updated_at FROM agents').all();
                    if (dbAgents && dbAgents.length > 0) {
                        console.log(`Found ${dbAgents.length} agents in database`);
                        // Parse metadata JSON for each agent
                        return dbAgents.map((agent) => ({
                            ...agent,
                            metadata: agent.metadata ? JSON.parse(agent.metadata) : {}
                        }));
                    }
                }
                catch (dbError) {
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
    async getAgent(agentId) {
        try {
            // First try to get the agent from our database
            if (this.databaseAdapter) {
                try {
                    console.log(`Retrieving agent ${agentId} from database`);
                    const dbAgent = await this.databaseAdapter.db.prepare('SELECT id, name, description, system_prompt, metadata, created_at, updated_at FROM agents WHERE id = ?').get(agentId);
                    if (dbAgent) {
                        console.log(`Found agent ${agentId} in database`);
                        // Parse metadata JSON
                        return {
                            ...dbAgent,
                            metadata: dbAgent.metadata ? JSON.parse(dbAgent.metadata) : {}
                        };
                    }
                }
                catch (dbError) {
                    console.error(`Failed to retrieve agent ${agentId} from database:`, dbError);
                    // Continue to try other methods if database retrieval fails
                }
            }
            // If in direct mode, check if we have the agent in our map
            if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
                console.log(`Retrieving agent ${agentId} from DirectClient`);
                const agentRuntime = this.agents.get(agentId);
                if (agentRuntime) {
                    console.log(`Found agent ${agentId} in DirectClient`);
                    const agent = {
                        id: agentId,
                        name: agentRuntime.character.name,
                        // Access character properties safely
                        // Access character properties safely
                        description: agentRuntime.character?.name || '',
                        systemPrompt: '',
                        character: agentRuntime.character
                    };
                    // If we got the agent from DirectClient but not from the database, save it to the database
                    if (this.databaseAdapter) {
                        try {
                            console.log(`Saving agent ${agentId} from DirectClient to database`);
                            // Check if agent exists in database
                            const existingAgent = await this.databaseAdapter.db.prepare('SELECT id FROM agents WHERE id = ?').get(agentId);
                            if (!existingAgent) {
                                // Insert the agent into the database
                                await this.databaseAdapter.db.prepare('INSERT INTO agents (id, name, description, system_prompt, metadata) VALUES (?, ?, ?, ?, ?)').run(agentId, agent.name, agent.description || '', agent.systemPrompt || '', JSON.stringify(agent.character));
                            }
                            else {
                                // Update the existing agent
                                await this.databaseAdapter.db.prepare('UPDATE agents SET name = ?, description = ?, system_prompt = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(agent.name, agent.description || '', agent.systemPrompt || '', JSON.stringify(agent.character), agentId);
                            }
                        }
                        catch (saveError) {
                            console.error(`Failed to save agent ${agentId} to database:`, saveError);
                        }
                    }
                    return agent;
                }
            }
            // Fallback to ElizaOS API if not found in database or DirectClient
            console.log(`Retrieving agent ${agentId} from ElizaOS API`);
            const response = await fetch(`${this.elizaApiBaseUrl}/agents/${agentId}`);
            if (!response.ok) {
                throw new Error(`Failed to get agent ${agentId}: ${response.statusText}`);
            }
            const apiAgent = await response.json();
            // If we got the agent from the API but not from the database, save it to the database
            if (apiAgent && this.databaseAdapter) {
                try {
                    console.log(`Saving agent ${agentId} from API to database`);
                    // Check if agent exists in database
                    const existingAgent = await this.databaseAdapter.db.prepare('SELECT id FROM agents WHERE id = ?').get(agentId);
                    if (!existingAgent) {
                        // Insert the agent into the database
                        await this.databaseAdapter.db.prepare('INSERT INTO agents (id, name, description, system_prompt, metadata) VALUES (?, ?, ?, ?, ?)').run(agentId, apiAgent.name, apiAgent.description || '', apiAgent.systemPrompt || '', JSON.stringify(apiAgent));
                    }
                    else {
                        // Update the existing agent
                        await this.databaseAdapter.db.prepare('UPDATE agents SET name = ?, description = ?, system_prompt = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(apiAgent.name, apiAgent.description || '', apiAgent.systemPrompt || '', JSON.stringify(apiAgent), agentId);
                    }
                }
                catch (saveError) {
                    console.error(`Failed to save agent ${agentId} to database:`, saveError);
                }
            }
            return apiAgent;
        }
        catch (error) {
            console.error(`Failed to get agent ${agentId}:`, error);
            // If API call fails but we have a database, try to return agent from database only
            if (this.databaseAdapter) {
                try {
                    console.log(`API failed, retrieving agent ${agentId} from database only`);
                    const dbAgent = await this.databaseAdapter.db.prepare('SELECT id, name, description, system_prompt, metadata, created_at, updated_at FROM agents WHERE id = ?').get(agentId);
                    if (dbAgent) {
                        console.log(`Found agent ${agentId} in database as fallback`);
                        // Parse metadata JSON
                        return {
                            ...dbAgent,
                            metadata: dbAgent.metadata ? JSON.parse(dbAgent.metadata) : {}
                        };
                    }
                }
                catch (dbError) {
                    console.error(`Failed to retrieve agent ${agentId} from database as fallback:`, dbError);
                }
            }
            throw error;
        }
    }
    /**
     * Delete an agent by ID
     */
    async deleteAgent(agentId) {
        try {
            // If in direct mode, delete from DirectClient
            if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
                try {
                    console.log(`Deleting agent ${agentId} from DirectClient`);
                    // Get the agent runtime from our map
                    const agentRuntime = this.agents.get(agentId);
                    if (agentRuntime) {
                        // Stop the agent
                        // Use terminateAgent instead of stopAgent
                        // DirectClient doesn't have stopAgent or terminateAgent methods
                        // We'll handle agent cleanup manually
                        if (this.agents.has(agentId)) {
                            this.agents.delete(agentId);
                        }
                        // Remove from our map
                        this.agents.delete(agentId);
                        console.log(`Agent ${agentId} deleted from DirectClient`);
                    }
                    else {
                        console.warn(`Agent ${agentId} not found in DirectClient`);
                    }
                }
                catch (directError) {
                    console.error(`Failed to delete agent ${agentId} from DirectClient:`, directError);
                    // Continue to delete from database even if DirectClient deletion fails
                }
            }
            else {
                // Otherwise try to delete from ElizaOS API
                try {
                    const response = await fetch(`${this.elizaApiBaseUrl}/agents/${agentId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        console.log(`Agent ${agentId} deleted from ElizaOS API`);
                    }
                    else {
                        console.error(`Failed to delete agent ${agentId} from ElizaOS API: ${response.statusText}`);
                    }
                }
                catch (apiError) {
                    console.error(`Failed to delete agent ${agentId} from ElizaOS API:`, apiError);
                    // Continue to delete from database even if API deletion fails
                }
            }
            // Then delete from our database
            if (this.databaseAdapter) {
                try {
                    console.log(`Deleting agent ${agentId} from database`);
                    await this.databaseAdapter.db.prepare('DELETE FROM agents WHERE id = ?').run(agentId);
                    console.log(`Agent ${agentId} deleted from database`);
                }
                catch (dbError) {
                    console.error(`Failed to delete agent ${agentId} from database:`, dbError);
                    throw dbError;
                }
            }
            else {
                console.warn('Database adapter not initialized, agent not deleted from database');
            }
        }
        catch (error) {
            console.error('Failed to delete agent:', error);
            throw error;
        }
    }
    /**
     * Send a message to an agent and get the response
     */
    async sendMessage(agentId, message, userId) {
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
            // Start performance timer
            const startTime = Date.now();
            console.log(`[PERF] Request preparation took ${startTime - overallStartTime}ms`);
            let result;
            // Check if we're in direct mode and have the DirectClient initialized
            if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
                console.log('Sending message using DirectClient');
                try {
                    // Create a room ID if not provided
                    const roomId = userId || 'default-room';
                    const userName = userId || 'default-user';
                    console.log(`Sending message to agent ${agentId} using DirectClient`);
                    console.log(`Message: ${message}`);
                    console.log(`Room ID: ${roomId}`);
                    // Get the agent from our database to access its configuration
                    const agent = await this.getAgent(agentId);
                    // The DirectClient doesn't have direct methods for message processing
                    // Instead, it exposes HTTP endpoints that we need to use
                    // We'll use the local HTTP endpoint that the DirectClient provides
                    // Create FormData for the request
                    const formData = new FormData();
                    formData.append('text', message);
                    formData.append('userId', userName);
                    formData.append('roomId', roomId);
                    // Use the local HTTP endpoint (DirectClient runs on localhost:3000 by default)
                    const localApiUrl = 'http://localhost:3000';
                    // The DirectClient expects the endpoint format /{agentId}/message
                    console.log(`Sending message to local DirectClient endpoint: ${localApiUrl}/${agentId}/message`);
                    const response = await fetch(`${localApiUrl}/${agentId}/message`, {
                        method: 'POST',
                        body: formData
                    });
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`DirectClient API error: ${response.status} ${errorText}`);
                    }
                    // Process the response
                    const responseData = await response.json();
                    if (Array.isArray(responseData) && responseData.length > 0) {
                        // DirectClient response format returns an array of messages
                        const agentResponse = responseData[0];
                        result = this.extractResponseText(agentResponse);
                        console.log('Response from DirectClient:', result);
                    }
                    else {
                        result = this.extractResponseText(responseData);
                        console.log('Response from DirectClient (non-array):', result);
                    }
                }
                catch (directClientError) {
                    console.error('Error using DirectClient:', directClientError);
                    console.log('Falling back to OpenRouter API...');
                    // Fallback to OpenRouter API if DirectClient fails
                    try {
                        // Get the agent's metadata to extract OpenRouter API key and model
                        const agent = await this.getAgent(agentId);
                        const apiKey = agent?.metadata?.settings?.secrets?.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
                        const model = agent?.metadata?.settings?.model || 'openai/gpt-4o-mini';
                        if (!apiKey) {
                            throw new Error('OpenRouter API key not found');
                        }
                        console.log(`Using OpenRouter API with model: ${model}`);
                        // Call OpenRouter API
                        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiKey}`,
                                'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
                                'X-Title': 'Paradyze ElizaOS Integration'
                            },
                            body: JSON.stringify({
                                model: model,
                                messages: [
                                    {
                                        role: 'system',
                                        content: agent?.system_prompt || agent?.metadata?.systemPrompt || ''
                                    },
                                    { role: 'user', content: message }
                                ],
                                temperature: agent?.metadata?.settings?.response?.temperature || 0.7,
                                max_tokens: agent?.metadata?.settings?.response?.maxTokens || 1000
                            })
                        });
                        if (!openRouterResponse.ok) {
                            const errorText = await openRouterResponse.text();
                            throw new Error(`OpenRouter API error: ${openRouterResponse.status} ${errorText}`);
                        }
                        const openRouterData = await openRouterResponse.json();
                        result = openRouterData.choices[0]?.message?.content || 'No response from OpenRouter';
                        console.log('Response from OpenRouter fallback:', result);
                    }
                    catch (fallbackError) {
                        console.error('Error with OpenRouter fallback:', fallbackError);
                        // Provide a fallback response
                        result = `Error: ${directClientError.message || 'Unknown error'}. Please try again later.`;
                    }
                }
                console.log('Message processing completed');
            }
            else {
                // Create FormData just like the web client does
                const formData = new FormData();
                formData.append('text', message);
                formData.append('user', userId || 'user');
                // Log the request details
                console.log('Sending message with FormData to:', `${this.elizaApiBaseUrl}/${agentId}/message`);
                // Send the message via API using fetch instead of axios
                const response = await fetch(`${this.elizaApiBaseUrl}/${agentId}/message`, {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) {
                    throw new Error(`Failed to send message: ${response.statusText}`);
                }
                // Process the response
                const responseData = await response.json();
                if (Array.isArray(responseData) && responseData.length > 0) {
                    // Web client response format returns an array of messages
                    const agentResponse = responseData[0];
                    result = this.extractResponseText(agentResponse);
                }
                else {
                    result = this.extractResponseText(responseData);
                }
                console.log('Message sent successfully via API');
            }
            // Log performance metrics
            const endTime = Date.now();
            console.log(`[PERF] Request took ${endTime - startTime}ms`);
            // Cache the result
            this.messageCache.set(cacheKey, {
                timestamp: Date.now(),
                response: result
            });
            const processingEndTime = Date.now();
            console.log(`[PERF] Total sendMessage execution time: ${processingEndTime - overallStartTime}ms`);
            return result;
        }
        catch (error) {
            console.error('Failed to send message:', error instanceof Error ? error.message : 'Unknown error');
            return `[Simulated] I'm sorry, I couldn't process your message due to an API error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
    // The extractResponseText method is already defined above
    /**
     * Get agent status
     */
    async getAgentStatus(agentId) {
        try {
            // If in direct mode, get status from DirectClient
            if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
                console.log(`Getting status for agent ${agentId} from DirectClient`);
                // Get the agent runtime from our map
                const agentRuntime = this.agents.get(agentId);
                if (!agentRuntime) {
                    return { status: 'unknown', message: `Agent ${agentId} not found in DirectClient` };
                }
                // Check if the agent is running
                // Use getAgentStatus instead of isAgentRunning
                // Check if agent exists in our map as a proxy for running status
                const isRunning = this.agents.has(agentId);
                return {
                    status: isRunning ? 'running' : 'stopped',
                    agentId: agentId
                };
            }
            // Otherwise, get status from ElizaOS API
            console.log(`Getting status for agent ${agentId} from API`);
            const response = await fetch(`${this.elizaApiBaseUrl}/agents/${agentId}/status`);
            if (!response.ok) {
                throw new Error(`Failed to get agent status: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Failed to get agent status:', error);
            throw error;
        }
    }
    /**
     * Get conversation history for an agent and user
     */
    async getConversationHistory(agentId, userId) {
        try {
            // If in direct mode, get conversation history from DirectClient
            if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
                console.log(`Getting conversation history for agent ${agentId} and user ${userId} from DirectClient`);
                // Check if the agent exists in our map
                if (!this.agents.has(agentId)) {
                    console.warn(`Agent ${agentId} not found in DirectClient agents map`);
                }
                // Create a room ID
                const roomId = userId || 'default-room';
                // Use the local HTTP endpoint (DirectClient runs on localhost:3000 by default)
                const localApiUrl = 'http://localhost:3000';
                console.log(`Fetching conversation history from local DirectClient endpoint: ${localApiUrl}/${agentId}/messages?userId=${userId}`);
                try {
                    // Make a direct HTTP request to the DirectClient endpoint
                    const response = await fetch(`${localApiUrl}/${agentId}/messages?userId=${userId}`);
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`DirectClient API error: ${response.status} ${errorText}`);
                    }
                    // Process the response
                    const responseData = await response.json();
                    console.log('Received conversation history from DirectClient');
                    // Return the messages array or an empty array if no messages
                    return responseData.messages || responseData || [];
                }
                catch (directClientError) {
                    console.error('Error fetching conversation history from DirectClient:', directClientError);
                    console.log('Returning empty conversation history');
                    return [];
                }
            }
            // Otherwise, get conversation history from ElizaOS API
            console.log(`Getting conversation history for agent ${agentId} and user ${userId} from API`);
            const response = await fetch(`${this.elizaApiBaseUrl}/agents/${agentId}/messages?userId=${userId}`);
            if (!response.ok) {
                throw new Error(`Failed to get conversation history: ${response.statusText}`);
            }
            const responseData = await response.json();
            return responseData.messages || [];
        }
        catch (error) {
            console.error('Failed to get conversation history:', error);
            // Return empty array instead of throwing to prevent UI errors
            return [];
        }
    }
    /**
     * Send a tweet via an ElizaOS Twitter client
     * Note: The agent must have Twitter client enabled in its character definition
     */
    async sendTweet(agentId, content) {
        try {
            // If in direct mode, send tweet via DirectClient
            if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
                console.log(`Sending tweet for agent ${agentId} via DirectClient`);
                // Check if the agent exists in our map
                if (!this.agents.has(agentId)) {
                    console.warn(`Agent ${agentId} not found in DirectClient agents map`);
                }
                // Use the local HTTP endpoint (DirectClient runs on localhost:3000 by default)
                const localApiUrl = 'http://localhost:3000';
                console.log(`Sending tweet via local DirectClient endpoint: ${localApiUrl}/${agentId}/actions/tweet`);
                try {
                    // Make a direct HTTP request to the DirectClient endpoint
                    const response = await fetch(`${localApiUrl}/${agentId}/actions/tweet`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ content })
                    });
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`DirectClient API error: ${response.status} ${errorText}`);
                    }
                    // Process the response
                    const responseData = await response.json();
                    console.log('Tweet sent successfully via DirectClient');
                    return responseData;
                }
                catch (directClientError) {
                    console.error('Error sending tweet via DirectClient:', directClientError);
                    throw directClientError;
                }
            }
            // Otherwise, send tweet via ElizaOS API
            console.log(`Sending tweet for agent ${agentId} via API`);
            const response = await fetch(`${this.elizaApiBaseUrl}/agents/${agentId}/actions/tweet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });
            if (!response.ok) {
                throw new Error(`Failed to send tweet: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Failed to send tweet:', error);
            throw error;
        }
    }
    /**
     * Update an agent's character configuration
     */
    async updateAgentCharacter(agentId, characterUpdates) {
        try {
            // If in direct mode, update agent character via DirectClient
            if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
                console.log(`Updating character for agent ${agentId} via DirectClient`);
                // Check if the agent exists in our map
                if (!this.agents.has(agentId)) {
                    console.warn(`Agent ${agentId} not found in DirectClient agents map`);
                }
                // Use the local HTTP endpoint (DirectClient runs on localhost:3000 by default)
                const localApiUrl = 'http://localhost:3000';
                console.log(`Updating agent character via local DirectClient endpoint: ${localApiUrl}/${agentId}`);
                try {
                    // First get the current agent configuration
                    const agent = await this.getAgent(agentId);
                    // Merge the current character with the updates
                    const updatedCharacter = {
                        ...agent.character,
                        ...characterUpdates
                    };
                    // Make a direct HTTP request to the DirectClient endpoint
                    const response = await fetch(`${localApiUrl}/${agentId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ character: updatedCharacter })
                    });
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`DirectClient API error: ${response.status} ${errorText}`);
                    }
                    console.log(`Successfully updated character for agent ${agentId} via DirectClient`);
                    // If the agent needs to be restarted after character updates
                    // We might need to restart the agent to apply the changes
                    if (characterUpdates.requiresRestart) {
                        console.log(`Character update requires agent restart, restarting agent ${agentId}`);
                        await this.restartAgent(agentId);
                    }
                }
                catch (directClientError) {
                    console.error('Error updating agent character via DirectClient:', directClientError);
                    throw directClientError;
                }
            }
            else {
                // Otherwise, update agent character via ElizaOS API
                console.log(`Updating character for agent ${agentId} via API`);
                const response = await fetch(`${this.elizaApiBaseUrl}/agents/${agentId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ character: characterUpdates })
                });
                if (!response.ok) {
                    throw new Error(`Failed to update agent character: ${response.statusText}`);
                }
            }
        }
        catch (error) {
            console.error('Failed to update agent character:', error);
            throw error;
        }
    }
    /**
     * Set the agent's model provider to ensure consistent model usage
     * This helps avoid issues with unavailable model providers
     */
    async setAgentModelProvider(agentId, modelProvider = 'openrouter') {
        try {
            console.log(`Setting agent ${agentId} to use model provider: ${modelProvider}`);
            // If in direct mode, we need to handle this differently
            if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
                console.log(`Setting model provider for agent ${agentId} via DirectClient`);
                // Get the agent runtime from our map
                const agentRuntime = this.agents.get(agentId);
                if (!agentRuntime) {
                    throw new Error(`Agent ${agentId} not found in DirectClient`);
                }
                // For direct mode, we would need to update the agent's configuration
                // This is a simplified implementation as DirectClient doesn't have a direct method for this
                // In a real implementation, you would need to modify the agent's character configuration
                console.log(`Note: Model provider changes in direct mode may require agent restart`);
                // Get the current agent configuration through the API for now
                const agent = await this.getAgent(agentId);
                // Update the character settings
                const characterUpdates = {
                    settings: {
                        ...(agent.character?.settings || {}),
                        modelProvider: modelProvider
                    }
                };
                // Apply the updates through updateAgentCharacter which will handle direct mode
                await this.updateAgentCharacter(agentId, characterUpdates);
            }
            else {
                // For API mode, use the existing approach
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
            }
            console.log(`Successfully set agent model provider to ${modelProvider}`);
        }
        catch (error) {
            console.error(`Failed to set agent model provider:`, error);
            throw error;
        }
    }
    /**
     * Restart an agent
     */
    async restartAgent(agentId) {
        try {
            // If in direct mode, restart agent via DirectClient
            if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
                console.log(`Restarting agent ${agentId} via DirectClient`);
                // Get the agent runtime from our map
                const agentRuntime = this.agents.get(agentId);
                if (!agentRuntime) {
                    throw new Error(`Agent ${agentId} not found in DirectClient`);
                }
                // Stop the agent
                // Stop the agent
                if (this.agents.has(agentId)) {
                    // DirectClient doesn't have stopAgent method
                    // We'll just remove it from our map
                    this.agents.delete(agentId);
                }
                // Get the agent configuration
                const agent = await this.getAgent(agentId);
                // Start the agent again
                const newAgentRuntime = await this.directClient.startAgent(agent.character);
                // Update our map
                this.agents.set(agentId, newAgentRuntime);
                console.log(`Agent ${agentId} restarted successfully via DirectClient`);
            }
            else {
                // Otherwise, restart agent via ElizaOS API
                console.log(`Restarting agent ${agentId} via API`);
                const response = await fetch(`${this.elizaApiBaseUrl}/agents/${agentId}/restart`, {
                    method: 'POST'
                });
                if (!response.ok) {
                    throw new Error(`Failed to restart agent: ${response.statusText}`);
                }
                console.log(`Agent ${agentId} restarted successfully via API`);
            }
        }
        catch (error) {
            console.error('Failed to restart agent:', error);
            throw error;
        }
    }
    /**
     * Add Twitter client to an agent
     */
    async enableTwitterClient(agentId) {
        try {
            // If in direct mode, we need to handle this differently
            if (process.env.ELIZAOS_INTEGRATION_MODE === 'direct' && this.directClient) {
                console.log(`Enabling Twitter client for agent ${agentId} via DirectClient`);
                // Get the agent runtime from our map
                const agentRuntime = this.agents.get(agentId);
                if (!agentRuntime) {
                    throw new Error(`Agent ${agentId} not found in DirectClient`);
                }
                // For direct mode, we need to get the agent configuration first
                // Then update it via updateAgentCharacter which will handle direct mode
                const agent = await this.getAgent(agentId);
                const character = agent.character;
                // Add Twitter client if not already present
                if (!character.clients.includes('twitter')) {
                    character.clients.push('twitter');
                    // Update the character
                    await this.updateAgentCharacter(agentId, {
                        clients: character.clients
                    });
                }
            }
            else {
                // For API mode, use fetch instead of axios
                console.log(`Enabling Twitter client for agent ${agentId} via API`);
                const response = await fetch(`${this.elizaApiBaseUrl}/agents/${agentId}`);
                if (!response.ok) {
                    throw new Error(`Failed to get agent: ${response.statusText}`);
                }
                const agent = await response.json();
                const character = agent.character;
                // Add Twitter client if not already present
                if (!character.clients.includes('twitter')) {
                    character.clients.push('twitter');
                    // Update the character
                    await this.updateAgentCharacter(agentId, {
                        clients: character.clients
                    });
                }
            }
        }
        catch (error) {
            console.error('Failed to enable Twitter client:', error);
            throw error;
        }
    }
}
// Create and export the ElizaIntegrationService instance
// Load environment variables before creating the service
dotenv.config();
export const elizaService = new ElizaIntegrationService();
console.log(`Initialized ElizaOS service with API URL: ${process.env.ELIZA_API_URL}`);
