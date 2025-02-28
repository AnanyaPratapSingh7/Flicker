// Test SQLite database connection
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function testSqliteConnection() {
  try {
    console.log('Testing SQLite database connection...');
    
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
    
    // Create a test table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Created test_table');
    
    // Insert a test record
    const result = await db.run(
      'INSERT INTO test_table (name) VALUES (?)',
      [`Test record ${Date.now()}`]
    );
    
    console.log(`Inserted test record with ID: ${result.lastID}`);
    
    // Query the test records
    const records = await db.all('SELECT * FROM test_table');
    
    console.log('Test records:');
    console.table(records);
    
    // Close the database connection
    await db.close();
    
    console.log('SQLite database test completed successfully!');
  } catch (error) {
    console.error('SQLite database test failed:', error);
  }
}

testSqliteConnection(); 