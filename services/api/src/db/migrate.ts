/**
 * Database migration script
 * Run with: node dist/db/migrate.js
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { query, initDatabase, closeDatabase } from './connection';

async function migrate() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Initialize database connection
    await initDatabase();
    
    // Read schema file
    const schemaPath = join(__dirname, '../../database/schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');
    
    // Split into individual statements
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.startsWith('--') || statement.length < 5) {
        continue; // Skip comments and empty lines
      }
      
      try {
        await query(statement);
        console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Statement ${i + 1} - Resource already exists, skipping`);
        } else {
          console.error(`❌ Statement ${i + 1} failed:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('✅ Database migration completed successfully');
    
    // Verify migration
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📊 Database tables:');
    tables.forEach((table: any) => {
      console.log(`  • ${table.table_name}`);
    });
    
    // Check for pgvector extension
    const extensions = await query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname = 'vector'
    `);
    
    if (extensions.length > 0) {
      console.log(`✅ pgvector extension v${extensions[0].extversion} is installed`);
    } else {
      console.log('⚠️  pgvector extension not found. Install with: CREATE EXTENSION vector;');
    }
    
    // Show seed data
    const users = await query('SELECT email, created_at FROM users');
    console.log(`👥 Seed users: ${users.length} accounts created`);
    users.forEach((user: any) => {
      console.log(`  • ${user.email}`);
    });
    
    console.log('\n🎉 Migration completed! API is ready to use.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
}

export { migrate };