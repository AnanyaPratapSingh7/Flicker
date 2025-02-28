import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * Initialize the SQLite database adapter for ElizaOS
 */
export async function initializeDatabaseAdapter() {
  try {
    // Ensure data directory exists
    const dataDir = path.resolve(process.cwd(), '../..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Extract database path from DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || 'sqlite:./data/paradyze.db';
    const dbPath = dbUrl.replace('sqlite:', '');
    const absoluteDbPath = path.resolve(process.cwd(), '../..', dbPath);
    
    console.log(`Initializing SQLite database at: ${absoluteDbPath}`);
    
    // Create the database directory if it doesn't exist
    const dbDir = path.dirname(absoluteDbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Initialize the SQLite database
    const db = new Database(absoluteDbPath);
    
    // Create the agents table if it doesn't exist
    db.exec(`
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
    
    // Create the messages table if it doesn't exist
    db.exec(`
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
    
    // Create indexes for better performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages (agent_id);
    `);
    
    console.log('SQLite database tables initialized successfully');
    
    // Create a simple adapter object that provides the necessary methods
    // This avoids the need to import the @elizaos/adapter-sqlite package
    const sqliteAdapter = {
      db,
      async init() {
        // Already initialized
        return;
      },
      async close() {
        db.close();
      }
    };
    
    console.log('SQLite database adapter initialized successfully');
    
    return sqliteAdapter;
  } catch (error) {
    console.error('Failed to initialize SQLite database adapter:', error);
    throw error;
  }
} 