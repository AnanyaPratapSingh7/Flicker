// Initialize PostgreSQL database with ElizaOS schema
require('dotenv').config();
const { Client } = require('pg');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Initializing PostgreSQL database for ElizaOS...');
    
    // Get database connection string from environment
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl || !dbUrl.startsWith('postgresql://')) {
      console.error('Error: DATABASE_URL must be a valid PostgreSQL connection string');
      console.error('Example: postgresql://postgres:password@localhost:5432/paradyze');
      process.exit(1);
    }
    
    console.log(`Connecting to PostgreSQL database: ${dbUrl}`);
    
    // Create a new PostgreSQL client
    const client = new Client({
      connectionString: dbUrl,
    });
    
    // Connect to the database
    await client.connect();
    console.log('PostgreSQL database connection successful!');
    
    // Check if pgvector extension is installed
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('pgvector extension enabled successfully');
    } catch (error) {
      console.error('Failed to enable pgvector extension:', error.message);
      console.error('Please install the pgvector extension for PostgreSQL to enable vector search capabilities.');
      console.error('See: https://github.com/pgvector/pgvector for installation instructions.');
    }
    
    // Create agents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        system_prompt TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      );
    `);
    console.log('Created agents table');
    
    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB,
        FOREIGN KEY (agent_id) REFERENCES agents (id)
      );
    `);
    console.log('Created messages table');
    
    // Create memory table with vector support
    await client.query(`
      CREATE TABLE IF NOT EXISTS memory (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        embedding vector(1536),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents (id)
      );
    `);
    console.log('Created memory table with vector embedding support');
    
    // Create embedding_cache table for caching embeddings
    await client.query(`
      CREATE TABLE IF NOT EXISTS embedding_cache (
        id TEXT PRIMARY KEY,
        input TEXT NOT NULL,
        embedding vector(1536),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(input)
      );
    `);
    console.log('Created embedding_cache table');
    
    // Create plugins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS plugins (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        config JSONB
      );
    `);
    console.log('Created plugins table');
    
    // Create agent_plugins table (for many-to-many relationship)
    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_plugins (
        agent_id TEXT NOT NULL,
        plugin_id TEXT NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (agent_id, plugin_id),
        FOREIGN KEY (agent_id) REFERENCES agents (id),
        FOREIGN KEY (plugin_id) REFERENCES plugins (id)
      );
    `);
    console.log('Created agent_plugins table');
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages (agent_id);
      CREATE INDEX IF NOT EXISTS idx_memory_agent_id ON memory (agent_id);
      CREATE INDEX IF NOT EXISTS idx_memory_key ON memory (key);
    `);
    console.log('Created standard indexes');
    
    // Create vector indexes for similarity search
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_memory_embedding ON memory USING ivfflat (embedding vector_cosine_ops);
        CREATE INDEX IF NOT EXISTS idx_embedding_cache ON embedding_cache USING ivfflat (embedding vector_cosine_ops);
      `);
      console.log('Created vector indexes for similarity search');
    } catch (error) {
      console.error('Failed to create vector indexes:', error.message);
      console.error('Vector similarity search will be slower without these indexes.');
    }
    
    // Close the database connection
    await client.end();
    
    console.log('PostgreSQL database initialization completed successfully!');
  } catch (error) {
    console.error('PostgreSQL database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase(); 