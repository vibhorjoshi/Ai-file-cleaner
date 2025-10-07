/**
 * AI File Management System - Fastify Server
 * Production-ready API with Postgres + pgvector
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import cookie from '@fastify/cookie';
import session from '@fastify/session';
import dotenv from 'dotenv';
import { initDatabase, closeDatabase } from './db/connection';
import { authRoutes } from './routes/auth';
import { fileRoutes } from './routes/files';
import { desktopRoutes } from './routes/desktop';
import { adminRoutes } from './routes/admin';

// Load environment variables
dotenv.config();

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      }
    } : undefined
  }
});

// Register plugins
async function registerPlugins() {
  // CORS configuration
  await fastify.register(cors, {
    origin: [
      'http://localhost:3000',  // Next.js dev
      'https://vercel.app',     // Vercel deployment
      'https://*.vercel.app',   // Vercel preview
    ],
    credentials: true,
  });

  // File upload support
  await fastify.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    }
  });

  // Cookie and session support
  await fastify.register(cookie);
  await fastify.register(session, {
    secret: process.env.SESSION_SECRET || 'default-session-secret-change-me',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    }
  });
}

// Register routes
async function registerRoutes() {
  // API routes
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(fileRoutes, { prefix: '/dedupe' });
  await fastify.register(desktopRoutes, { prefix: '/desktop' });
  await fastify.register(adminRoutes, { prefix: '/' });
}

// Root endpoint
fastify.get('/', async (request, reply) => {
  return {
    message: 'AI File Management System API',
    version: '1.0.0',
    status: 'running',
    architecture: {
      frontend: 'Next.js + Vercel',
      api: 'Fastify + Render',
      database: 'Neon Postgres + pgvector',
      ai_models: 'DistilBERT + CLIP'
    },
    endpoints: {
      docs: '/docs',
      health: '/healthz',
      auth: '/auth/login',
      upload: '/dedupe/preview',
      desktop: '/desktop/validate-license'
    }
  };
});

// Startup function
async function start() {
  try {
    console.log('🚀 Starting AI File Management API...');
    
    // Initialize database
    await initDatabase();
    
    // Register plugins and routes
    await registerPlugins();
    await registerRoutes();
    
    // Start server
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    
    await fastify.listen({ port, host });
    
    console.log(`✅ Server running on http://${host}:${port}`);
    console.log(`📚 API Documentation: http://${host}:${port}/docs`);
    console.log(`🔍 Health Check: http://${host}:${port}/healthz`);
    
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await fastify.close();
    await closeDatabase();
    console.log('✅ Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
start();