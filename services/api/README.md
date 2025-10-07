# AI File Management System - Fastify API

Production-ready Node.js API with Postgres + pgvector for AI-powered file deduplication.

## 🏗️ Architecture

```
[Next.js Web UI] ──► [Fastify API] ──► [Neon Postgres + pgvector]
       ▲                   │                   ▲
       │                   │                   │
       │                   ├──► [Model Worker (Future)]
       │                   │
[Electron Desktop] ─────────┘
```

## 📋 Quick Start

### Development
```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Set up database (see database/schema.sql)

# Start development server
npm run dev
```

### Production (Render + Neon)
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout and clear session  
- `GET /auth/me` - Get current user
- `POST /license/generate` - Generate desktop license

### File Processing
- `POST /dedupe/preview` - Upload files for duplicate detection
- `POST /dedupe/zip` - Download ZIP of selected files
- `GET /dedupe/upload/:id` - Get upload details

### Desktop Integration  
- `POST /desktop/validate-license` - Validate license key
- `POST /desktop/dedupe/preview` - Desktop duplicate detection
- `POST /desktop/dedupe/execute` - Execute removal actions

### Admin & Monitoring
- `GET /healthz` - Health check with database stats
- `GET /version` - API version and features
- `GET /docs` - API documentation

## 🗄️ Database Schema

**Tables with pgvector support:**
- `users` - User accounts
- `license_keys` - Desktop licenses  
- `uploads` - File processing sessions
- `files` - File metadata and hashes
- `file_embeddings` - AI embeddings (768-dim text, 512-dim image)
- `dedupe_groups` - Duplicate detection results

## 🤖 AI Features

**Current Implementation:**
- SHA-256 hash-based exact duplicate detection
- Perceptual hashing for images
- Text extraction from PDFs
- Metadata-based grouping

**Planned (Model Worker):**
- DistilBERT text embeddings (768-dim)
- CLIP image embeddings (512-dim)  
- Cosine similarity search with pgvector
- Semantic duplicate detection

## 🚀 Deployment

### Render.com (API)
1. Connect GitHub repository
2. Use `render.yaml` configuration
3. Set environment variables:
   - `DATABASE_URL` (from Neon)
   - `JWT_SECRET` (auto-generated)
   - `SESSION_SECRET` (auto-generated)

### Neon (Database)
1. Create project at neon.tech
2. Enable pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run schema from `database/schema.sql`
4. Copy connection string to Render

### Vercel (Frontend Integration)
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-api.render.com/:path*"
    }
  ]
}
```

## 📊 Features

✅ **Authentication** - Session cookies + JWT tokens  
✅ **File Upload** - Multipart with 100MB limit  
✅ **Duplicate Detection** - Hash-based + metadata  
✅ **Desktop Integration** - License validation + metadata processing  
✅ **ZIP Streaming** - Selected file download  
✅ **Health Monitoring** - Database stats + uptime  
✅ **API Documentation** - Built-in docs at `/docs`  
🔄 **AI Embeddings** - Ready for Model Worker integration  
🔄 **Vector Search** - pgvector infrastructure ready  

## 🔧 Configuration

**Environment Variables:**
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
MAX_FILE_SIZE=100MB
```

**Database Connection:**
- Development: Local Postgres or Docker
- Production: Neon managed Postgres with pgvector
- Connection pooling with 20 max connections
- SSL required in production

## 🧪 Testing

```bash
# Health check
curl http://localhost:3001/healthz

# Login test
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@aifilecleanup.com", "password": "admin123"}'

# File upload test (multipart)
curl -X POST http://localhost:3001/dedupe/preview \
  -F "files=@test1.txt" \
  -F "files=@test2.jpg"
```

## 🔮 Future Enhancements

**Model Worker Integration:**
- Separate Node.js service for AI model inference
- ONNX Runtime for DistilBERT and CLIP models
- Batch processing for embeddings
- Real-time similarity computation

**Performance Optimizations:**
- Redis caching for frequent queries
- Background job processing
- File streaming optimization
- Database query optimization

**Advanced Features:**
- Fuzzy filename matching
- Content-based image analysis  
- Document structure comparison
- Machine learning-based classification