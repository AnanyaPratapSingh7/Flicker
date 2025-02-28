// Inspect SQLite database structure
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function inspectDatabase() {
  try {
    console.log('Inspecting SQLite database structure...');
    
    // Extract database path from DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || 'sqlite:./data/paradyze.db';
    const dbPath = dbUrl.replace('sqlite:', '');
    const absoluteDbPath = path.resolve(process.cwd(), dbPath);
    
    console.log(`Database path: ${absoluteDbPath}`);
    
    // Open SQLite database
    const db = await open({
      filename: absoluteDbPath,
      driver: sqlite3.Database
    });
    
    console.log('SQLite database connection successful!');
    
    // Get list of tables
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
    
    console.log('\nDatabase Tables:');
    console.table(tables);
    
    // For each table, get its structure
    for (const table of tables) {
      const tableName = table.name;
      if (tableName === 'sqlite_sequence') continue; // Skip internal SQLite table
      
      console.log(`\nStructure of table '${tableName}':`);
      const tableInfo = await db.all(`PRAGMA table_info(${tableName});`);
      console.table(tableInfo);
      
      // Get row count
      const countResult = await db.get(`SELECT COUNT(*) as count FROM ${tableName};`);
      console.log(`Row count: ${countResult.count}`);
      
      // If table has data, show a sample
      if (countResult.count > 0) {
        const sampleRows = await db.all(`SELECT * FROM ${tableName} LIMIT 3;`);
        console.log(`Sample data from '${tableName}':`);
        console.table(sampleRows);
      }
    }
    
    // Get list of indexes
    const indexes = await db.all("SELECT name, tbl_name FROM sqlite_master WHERE type='index' ORDER BY tbl_name, name;");
    
    console.log('\nDatabase Indexes:');
    console.table(indexes);
    
    // Close the database connection
    await db.close();
    
    console.log('\nSQLite database inspection completed successfully!');
  } catch (error) {
    console.error('SQLite database inspection failed:', error);
  }
}

inspectDatabase(); 