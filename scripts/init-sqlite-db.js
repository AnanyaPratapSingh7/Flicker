// Initialize SQLite database with ElizaOS schema
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function initializeDatabase() {
  try {
    console.log('Initializing SQLite database for ElizaOS...');
    
    // Extract database path from DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || 'sqlite:./data/paradyze.db';
    const dbPath = dbUrl.replace('sqlite:', '');
    const absoluteDbPath = path.resolve(process.cwd(), dbPath);
    
    console.log(`Database path: ${absoluteDbPath}`);
    
    // Create the database directory if it doesn't exist
    const dbDir = path.dirname(absoluteDbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Created directory: ${dbDir}`);
    }
    
    // Open SQLite database
    const db = await open({
      filename: absoluteDbPath,
      driver: sqlite3.Database
    });
    
    console.log('SQLite database connection successful!');
    
    // Create agents table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        system_prompt TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
      );
    `);
    console.log('Created agents table');
    
    // Create messages table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (agent_id) REFERENCES agents (id)
      );
    `);
    console.log('Created messages table');
    
    // Create memory table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS memory (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents (id)
      );
    `);
    console.log('Created memory table');
    
    // Create plugins table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS plugins (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        config TEXT
      );
    `);
    console.log('Created plugins table');
    
    // Create agent_plugins table (for many-to-many relationship)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS agent_plugins (
        agent_id TEXT NOT NULL,
        plugin_id TEXT NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        config TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (agent_id, plugin_id),
        FOREIGN KEY (agent_id) REFERENCES agents (id),
        FOREIGN KEY (plugin_id) REFERENCES plugins (id)
      );
    `);
    console.log('Created agent_plugins table');
    
    // Create indexes for better performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages (agent_id);
      CREATE INDEX IF NOT EXISTS idx_memory_agent_id ON memory (agent_id);
      CREATE INDEX IF NOT EXISTS idx_memory_key ON memory (key);
    `);
    console.log('Created indexes');
    
    // Close the database connection
    await db.close();
    
    console.log('SQLite database initialization completed successfully!');
  } catch (error) {
    console.error('SQLite database initialization failed:', error);
  }
}

initializeDatabase(); 