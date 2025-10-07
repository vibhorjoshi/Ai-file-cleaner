/**
 * Admin and testing routes
 * GET /healthz, GET /version
 */

import { FastifyPluginAsync } from 'fastify';
import { query } from '../db/connection';

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  
  // GET /healthz - Health check endpoint
  fastify.get('/healthz', async (request, reply) => {
    try {
      // Test database connection
      await query('SELECT NOW()');
      
      // Get database statistics
      const stats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as users_count,
          (SELECT COUNT(*) FROM license_keys) as licenses_count,
          (SELECT COUNT(*) FROM uploads) as uploads_count,
          (SELECT COUNT(*) FROM files) as files_count,
          (SELECT COUNT(*) FROM file_embeddings) as embeddings_count,
          (SELECT COUNT(*) FROM dedupe_groups) as groups_count
      `);
      
      return {
        status: 'healthy',
        service: 'ai-file-cleanup-api',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          stats: stats[0]
        },
        features: {
          file_upload: 'enabled',
          duplicate_detection: 'enabled',
          desktop_integration: 'enabled',
          vector_search: 'ready',
          ai_models: 'ready'
        }
      };
      
    } catch (error) {
      fastify.log.error('Health check failed:', error);
      return reply.code(503).send({
        status: 'unhealthy',
        service: 'ai-file-cleanup-api',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed'
      });
    }
  });
  
  // GET /version - Version and feature information
  fastify.get('/version', async (request, reply) => {
    return {
      name: 'AI File Management System API',
      version: '1.0.0',
      api_version: 'v1',
      build_date: '2025-10-07',
      architecture: {
        runtime: 'Node.js + Fastify',
        database: 'Postgres + pgvector',
        deployment: 'Render + Neon',
        frontend: 'Next.js + Vercel'
      },
      features: {
        authentication: {
          methods: ['session_cookie', 'jwt'],
          license_management: true
        },
        file_processing: {
          supported_formats: ['PDF', 'Images', 'Text', 'Documents'],
          max_file_size: '100MB',
          batch_processing: true
        },
        ai_capabilities: {
          text_embeddings: 'DistilBERT (768-dim)',
          image_embeddings: 'CLIP-ViT (512-dim)',
          similarity_search: 'pgvector cosine',
          duplicate_detection: ['hash', 'perceptual', 'semantic']
        },
        integrations: {
          web_interface: true,
          desktop_application: true,
          api_access: true
        }
      },
      endpoints: {
        auth: {
          login: 'POST /auth/login',
          logout: 'POST /auth/logout',
          me: 'GET /auth/me',
          generate_license: 'POST /license/generate'
        },
        files: {
          upload_dedupe: 'POST /dedupe/preview',
          download_zip: 'POST /dedupe/zip',
          get_upload: 'GET /dedupe/upload/:uploadId'
        },
        desktop: {
          validate_license: 'POST /desktop/validate-license',
          dedupe_preview: 'POST /desktop/dedupe/preview',
          execute_actions: 'POST /desktop/dedupe/execute'
        },
        admin: {
          health: 'GET /healthz',
          version: 'GET /version'
        }
      },
      deployment: {
        production_ready: true,
        scalable: true,
        monitoring: 'enabled',
        logging: 'structured'
      }
    };
  });
  
  // GET /docs - API documentation (simple version)
  fastify.get('/docs', async (request, reply) => {
    const htmlDocs = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>AI File Management API Documentation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 2rem; }
          .endpoint { background: #f5f5f5; padding: 1rem; margin: 1rem 0; border-radius: 4px; }
          .method { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 2px; color: white; font-weight: bold; }
          .post { background: #28a745; }
          .get { background: #007bff; }
          pre { background: #f8f9fa; padding: 1rem; border-radius: 4px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>AI File Management System API</h1>
        <p>Production-ready API with Postgres + pgvector for AI-powered file deduplication.</p>
        
        <h2>Authentication</h2>
        <div class="endpoint">
          <span class="method post">POST</span> <strong>/auth/login</strong>
          <p>Login with email/password, returns session cookie</p>
          <pre>{"email": "admin@aifilecleanup.com", "password": "admin123"}</pre>
        </div>
        
        <div class="endpoint">
          <span class="method post">POST</span> <strong>/license/generate</strong>
          <p>Generate desktop license key</p>
          <pre>{"userId": "uuid-string"}</pre>
        </div>
        
        <h2>File Processing</h2>
        <div class="endpoint">
          <span class="method post">POST</span> <strong>/dedupe/preview</strong>
          <p>Upload files for duplicate detection (multipart)</p>
          <pre>FormData with files[] field</pre>
        </div>
        
        <div class="endpoint">
          <span class="method post">POST</span> <strong>/dedupe/zip</strong>
          <p>Download ZIP of selected files</p>
          <pre>{"uploadId": "uuid", "selectedFileIds": ["uuid1", "uuid2"]}</pre>
        </div>
        
        <h2>Desktop Integration</h2>
        <div class="endpoint">
          <span class="method post">POST</span> <strong>/desktop/validate-license</strong>
          <p>Validate desktop application license</p>
          <pre>{"licenseKey": "uuid-string"}</pre>
        </div>
        
        <div class="endpoint">
          <span class="method post">POST</span> <strong>/desktop/dedupe/preview</strong>
          <p>Desktop duplicate detection with file metadata</p>
          <pre>{"licenseKey": "uuid", "files": [{"path": "/file.txt", "mime": "text/plain", "size": 1024, "sha256": "hash"}]}</pre>
        </div>
        
        <h2>Admin & Monitoring</h2>
        <div class="endpoint">
          <span class="method get">GET</span> <strong>/healthz</strong>
          <p>Health check with database statistics</p>
        </div>
        
        <div class="endpoint">
          <span class="method get">GET</span> <strong>/version</strong>
          <p>API version and feature information</p>
        </div>
        
        <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ddd;">
          <p>🚀 <strong>Production Architecture:</strong> Next.js (Web) → Fastify (API) → Neon Postgres + pgvector</p>
        </footer>
      </body>
    </html>`;
    
    reply.type('text/html').send(htmlDocs);
  });
  
};