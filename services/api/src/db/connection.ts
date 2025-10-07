/**
 * Database connection and query utilities
 * Postgres + pgvector integration
 */

import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Helper function to execute queries
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Helper function for transactions
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Database initialization
export async function initDatabase(): Promise<void> {
  try {
    // Test connection
    await query('SELECT NOW()');
    console.log('✅ Database connection established');

    // Check if pgvector extension exists
    const extensions = await query(
      "SELECT * FROM pg_extension WHERE extname = 'vector'"
    );
    
    if (extensions.length === 0) {
      console.log('⚠️  pgvector extension not found. Install with: CREATE EXTENSION vector;');
    } else {
      console.log('✅ pgvector extension is available');
    }

    // Verify table structure
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'license_keys', 'uploads', 'files', 'file_embeddings', 'dedupe_groups')
    `);
    
    console.log(`✅ Found ${tables.length}/6 required tables`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  await pool.end();
  console.log('📪 Database connection pool closed');
}