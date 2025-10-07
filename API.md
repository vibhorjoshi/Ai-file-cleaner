# API Documentation

## Overview

AI File Cleanup provides a comprehensive RESTful API for programmatic access to file scanning, duplicate detection, and cleanup operations. The API is built with FastAPI and provides real-time capabilities through WebSocket connections.

## Base URL

```
http://localhost:3001/api/v1
```

## Authentication

Currently, the API operates without authentication for local development. In production deployments, consider implementing API key authentication or OAuth2.

## Endpoints

### Health Check

#### GET /health
Returns the health status of the API service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00Z",
  "version": "1.0.0"
}
```

### File Scanning

#### POST /scan/start
Initiates a new file scanning session.

**Request Body:**
```json
{
  "paths": ["/path/to/scan"],
  "filters": {
    "extensions": [".jpg", ".png", ".pdf", ".txt"],
    "minSize": 1024,
    "maxSize": 104857600,
    "excludePaths": ["/path/to/exclude"]
  },
  "options": {
    "recursive": true,
    "followSymlinks": false,
    "similarity_threshold": 0.8
  }
}
```

**Response:**
```json
{
  "session_id": "scan_123456789",
  "status": "started",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

#### GET /scan/{session_id}/status
Returns the current status of a scanning session.

**Response:**
```json
{
  "session_id": "scan_123456789",
  "status": "running",
  "progress": {
    "files_scanned": 1250,
    "total_files": 5000,
    "current_file": "/path/to/current/file.jpg",
    "percentage": 25.0
  },
  "start_time": "2024-01-20T10:30:00Z",
  "estimated_completion": "2024-01-20T10:45:00Z"
}
```

#### GET /scan/{session_id}/results
Returns the results of a completed scanning session.

**Response:**
```json
{
  "session_id": "scan_123456789",
  "status": "completed",
  "summary": {
    "total_files": 5000,
    "duplicate_groups": 150,
    "potential_savings": "2.5 GB",
    "scan_duration": "00:15:30"
  },
  "duplicate_groups": [
    {
      "id": "group_001",
      "similarity_score": 0.95,
      "files": [
        {
          "path": "/path/to/file1.jpg",
          "size": 2048576,
          "hash": "abc123...",
          "created": "2024-01-15T08:30:00Z",
          "modified": "2024-01-16T09:15:00Z"
        },
        {
          "path": "/path/to/file2.jpg", 
          "size": 2048576,
          "hash": "def456...",
          "created": "2024-01-17T10:20:00Z",
          "modified": "2024-01-17T10:20:00Z"
        }
      ]
    }
  ]
}
```

### Duplicate Management

#### GET /duplicates
Returns all detected duplicate groups with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `min_similarity`: Minimum similarity threshold (0.0-1.0)
- `file_type`: Filter by file type (image, document, video, audio)

**Response:**
```json
{
  "page": 1,
  "limit": 20,
  "total_groups": 150,
  "total_pages": 8,
  "groups": [
    {
      "id": "group_001",
      "similarity_score": 0.95,
      "file_count": 3,
      "total_size": 6144000,
      "file_type": "image",
      "files": ["..."]
    }
  ]
}
```

#### GET /duplicates/{group_id}
Returns detailed information about a specific duplicate group.

#### POST /duplicates/{group_id}/resolve
Resolves a duplicate group by keeping selected files and removing others.

**Request Body:**
```json
{
  "action": "keep_newest",
  "keep_files": ["/path/to/keep/file1.jpg"],
  "remove_files": ["/path/to/remove/file2.jpg", "/path/to/remove/file3.jpg"],
  "backup": true
}
```

**Response:**
```json
{
  "group_id": "group_001",
  "action": "completed",
  "files_kept": 1,
  "files_removed": 2,
  "space_saved": 4096000,
  "backup_location": "/backups/duplicates_20240120"
}
```

### File Operations

#### GET /files/{file_id}
Returns metadata for a specific file.

#### DELETE /files/{file_id}
Safely removes a file with optional backup.

**Query Parameters:**
- `backup`: Create backup before deletion (default: true)

#### POST /files/analyze
Analyzes files and generates embeddings for similarity comparison.

**Request Body:**
```json
{
  "file_paths": ["/path/to/file1.jpg", "/path/to/file2.pdf"],
  "analysis_type": "auto"
}
```

### Statistics

#### GET /stats/overview
Returns system-wide statistics.

**Response:**
```json
{
  "total_files_scanned": 25000,
  "total_duplicates_found": 3500,
  "total_space_saved": "15.2 GB",
  "scan_sessions": 45,
  "last_scan": "2024-01-20T10:30:00Z",
  "system_info": {
    "available_space": "500 GB",
    "scan_paths": ["/home/user", "/media/storage"],
    "active_filters": ["images", "documents"]
  }
}
```

#### GET /stats/performance
Returns performance metrics and system health.

**Response:**
```json
{
  "cpu_usage": 15.5,
  "memory_usage": 512000000,
  "disk_io": {
    "read_mb_per_sec": 45.2,
    "write_mb_per_sec": 12.8
  },
  "model_performance": {
    "avg_embedding_time": 150,
    "embeddings_per_second": 25.5
  }
}
```

## WebSocket API

### Connection

Connect to WebSocket endpoint for real-time updates:
```
ws://localhost:3001/api/v1/ws
```

### Message Format

All WebSocket messages use JSON format:

```json
{
  "type": "event_type",
  "data": { /* event-specific data */ },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### Event Types

#### Scan Progress
```json
{
  "type": "scan_progress",
  "data": {
    "session_id": "scan_123456789",
    "files_processed": 1500,
    "current_file": "/path/to/file.jpg",
    "percentage": 30.0
  }
}
```

#### Duplicate Found
```json
{
  "type": "duplicate_found",
  "data": {
    "group_id": "group_001",
    "similarity_score": 0.95,
    "files": ["/path/to/file1.jpg", "/path/to/file2.jpg"]
  }
}
```

#### Scan Complete
```json
{
  "type": "scan_complete",
  "data": {
    "session_id": "scan_123456789",
    "total_files": 5000,
    "duplicate_groups": 150,
    "duration": 930
  }
}
```

## Error Handling

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file path provided",
    "details": {
      "field": "paths",
      "reason": "Path does not exist or is not accessible"
    }
  },
  "timestamp": "2024-01-20T10:30:00Z",
  "request_id": "req_123456789"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Scan operations**: 5 requests per minute
- **File operations**: 100 requests per minute  
- **General endpoints**: 1000 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

## SDK and Client Libraries

### JavaScript/TypeScript
```bash
npm install @ai-file-cleanup/client
```

```typescript
import { AIFileCleanupClient } from '@ai-file-cleanup/client';

const client = new AIFileCleanupClient({
  baseURL: 'http://localhost:3001/api/v1'
});

// Start a scan
const session = await client.scan.start({
  paths: ['/home/user/Documents'],
  options: { similarity_threshold: 0.8 }
});

// Get results
const results = await client.scan.getResults(session.session_id);
```

### Python
```bash
pip install ai-file-cleanup-client
```

```python
from ai_file_cleanup import Client

client = Client(base_url='http://localhost:3001/api/v1')

# Start a scan
session = client.scan.start({
    'paths': ['/home/user/Documents'],
    'options': {'similarity_threshold': 0.8}
})

# Get results
results = client.scan.get_results(session['session_id'])
```

## Examples

### Complete Workflow Example

```bash
# 1. Start a scan
curl -X POST http://localhost:3001/api/v1/scan/start \
  -H "Content-Type: application/json" \
  -d '{
    "paths": ["/home/user/Documents"],
    "filters": {"extensions": [".pdf", ".docx"]},
    "options": {"similarity_threshold": 0.8}
  }'

# 2. Check status
curl http://localhost:3001/api/v1/scan/scan_123456789/status

# 3. Get results
curl http://localhost:3001/api/v1/scan/scan_123456789/results

# 4. Resolve duplicates
curl -X POST http://localhost:3001/api/v1/duplicates/group_001/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "action": "keep_newest",
    "backup": true
  }'
```

### Batch Processing Example

```javascript
// Process multiple directories
const directories = ['/home/user/Documents', '/home/user/Pictures'];
const results = [];

for (const dir of directories) {
  const session = await client.scan.start({
    paths: [dir],
    options: { similarity_threshold: 0.9 }
  });
  
  // Wait for completion
  let status;
  do {
    await new Promise(resolve => setTimeout(resolve, 5000));
    status = await client.scan.getStatus(session.session_id);
  } while (status.status === 'running');
  
  results.push(await client.scan.getResults(session.session_id));
}
```

## Security Considerations

1. **Input Validation**: All file paths are validated and sanitized
2. **Access Control**: API respects system file permissions
3. **Rate Limiting**: Prevents abuse and DoS attacks  
4. **Safe Operations**: Backup options for destructive operations
5. **Audit Logging**: All operations are logged for security review

## Performance Optimization

1. **Pagination**: Large result sets are paginated
2. **Caching**: Embeddings and metadata are cached
3. **Async Processing**: Long-running operations use async patterns
4. **Resource Limits**: Memory and CPU usage are monitored and limited
5. **Batch Operations**: Multiple files processed efficiently

For more detailed information and interactive API documentation, visit the automatically generated OpenAPI documentation at `/docs` when the service is running.