/**
 * Desktop application routes
 * POST /desktop/validate-license (body: license key)
 * POST /desktop/dedupe/preview (JSON): metadata list
 */

import { FastifyPluginAsync } from 'fastify';
import { query } from '../db/connection';
import { z } from 'zod';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Request schemas
const ValidateLicenseSchema = z.object({
  licenseKey: z.string().uuid()
});

const DesktopFileSchema = z.object({
  path: z.string(),
  mime: z.string(),
  size: z.number(),
  sha256: z.string(),
  phash: z.string().optional()
});

const DesktopDedupeSchema = z.object({
  licenseKey: z.string().uuid(),
  files: z.array(DesktopFileSchema),
  samples: z.any().optional() // For future embedding computation
});

export const desktopRoutes: FastifyPluginAsync = async (fastify) => {
  
  // POST /desktop/validate-license - Validate desktop license key
  fastify.post('/validate-license', async (request, reply) => {
    try {
      const body = ValidateLicenseSchema.parse(request.body);
      
      // Check license key in database
      const licenses = await query(
        `SELECT lk.*, u.email, u.id as user_id
         FROM license_keys lk
         JOIN users u ON lk.user_id = u.id
         WHERE lk.key = $1 AND lk.revoked = false`,
        [body.licenseKey]
      );
      
      if (licenses.length === 0) {
        return {
          valid: false,
          message: 'Invalid or revoked license key'
        };
      }
      
      const license = licenses[0];
      
      return {
        valid: true,
        user: {
          id: license.user_id,
          email: license.email
        },
        license: {
          key: license.key,
          created_at: license.created_at
        },
        message: 'License key is valid'
      };
      
    } catch (error) {
      fastify.log.error('License validation error:', error);
      return reply.code(500).send({
        valid: false,
        message: 'License validation failed'
      });
    }
  });
  
  // POST /desktop/dedupe/preview - Desktop duplicate detection
  fastify.post('/dedupe/preview', async (request, reply) => {
    try {
      const body = DesktopDedupeSchema.parse(request.body);
      
      // First validate the license
      const licenseValidation = await query(
        `SELECT lk.*, u.id as user_id
         FROM license_keys lk
         JOIN users u ON lk.user_id = u.id
         WHERE lk.key = $1 AND lk.revoked = false`,
        [body.licenseKey]
      );
      
      if (licenseValidation.length === 0) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid license key'
        });
      }
      
      const userId = licenseValidation[0].user_id;
      
      // Create upload session for tracking
      const uploadId = uuidv4();
      await query(
        'INSERT INTO uploads (id, user_id, total_files) VALUES ($1, $2, $3)',
        [uploadId, userId, body.files.length]
      );
      
      // Process files for duplicate detection
      const hashGroups: { [key: string]: typeof body.files } = {};
      const processedFiles = [];
      
      for (const file of body.files) {
        // Store file metadata (desktop doesn't upload actual files)
        const fileId = uuidv4();
        
        await query(
          `INSERT INTO files (id, upload_id, file_name, mime_type, size_bytes, sha256, phash)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [fileId, uploadId, file.path.split('/').pop() || 'unknown', file.mime, file.size, file.sha256, file.phash]
        );
        
        const fileData = {
          id: fileId,
          ...file
        };
        processedFiles.push(fileData);
        
        // Group by SHA-256 hash for exact duplicates
        if (!hashGroups[file.sha256]) {
          hashGroups[file.sha256] = [];
        }
        hashGroups[file.sha256].push(fileData);
      }
      
      // Create duplicate groups
      const duplicateGroups = [];
      let groupIndex = 0;
      
      for (const [hash, duplicateFiles] of Object.entries(hashGroups)) {
        if (duplicateFiles.length > 1) {
          // Sort by size (keep largest)
          duplicateFiles.sort((a, b) => b.size - a.size);
          
          const groupId = uuidv4();
          const keptFile = duplicateFiles[0];
          
          await query(
            'INSERT INTO dedupe_groups (id, upload_id, group_index, kept_file_id) VALUES ($1, $2, $3, $4)',
            [groupId, uploadId, groupIndex, keptFile.id]
          );
          
          duplicateGroups.push({
            id: groupId,
            method: 'hash',
            similarity: 1.0,
            kept_file: keptFile,
            duplicates: duplicateFiles.slice(1),
            total_size_saved: duplicateFiles.slice(1).reduce((sum, f) => sum + f.size, 0),
            actions: duplicateFiles.slice(1).map(f => ({
              file_id: f.id,
              file_path: f.path,
              action: 'move_to_recycle_bin',
              size_saved: f.size
            }))
          });
          
          groupIndex++;
        }
      }
      
      // Future: Add embedding-based similarity detection
      // This would involve either:
      // Option A: Desktop sends file samples for server-side embedding
      // Option B: Desktop computes embeddings locally and sends vectors
      
      return {
        success: true,
        upload_id: uploadId,
        total_files: body.files.length,
        duplicate_groups: duplicateGroups.length,
        groups: duplicateGroups,
        summary: {
          exact_duplicates: duplicateGroups.length,
          total_size_saved: duplicateGroups.reduce((sum, g) => sum + g.total_size_saved, 0),
          files_to_remove: duplicateGroups.reduce((sum, g) => sum + g.duplicates.length, 0)
        }
      };
      
    } catch (error) {
      fastify.log.error('Desktop dedupe error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Desktop duplicate detection failed'
      });
    }
  });
  
  // POST /desktop/dedupe/execute - Execute removal actions
  fastify.post('/dedupe/execute', async (request, reply) => {
    try {
      const body = z.object({
        licenseKey: z.string().uuid(),
        uploadId: z.string().uuid(),
        actions: z.array(z.object({
          file_id: z.string().uuid(),
          action: z.enum(['move_to_recycle_bin', 'delete_permanent', 'skip'])
        }))
      }).parse(request.body);
      
      // Validate license
      const licenseValidation = await query(
        'SELECT * FROM license_keys WHERE key = $1 AND revoked = false',
        [body.licenseKey]
      );
      
      if (licenseValidation.length === 0) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid license key'
        });
      }
      
      // Get file details for actions
      const fileIds = body.actions.map(a => a.file_id);
      const files = await query(
        'SELECT * FROM files WHERE id = ANY($1) AND upload_id = $2',
        [fileIds, body.uploadId]
      );
      
      const results = [];
      
      for (const action of body.actions) {
        const file = files.find((f: any) => f.id === action.file_id);
        
        if (!file) {
          results.push({
            file_id: action.file_id,
            success: false,
            message: 'File not found'
          });
          continue;
        }
        
        // Note: Actual file system operations would be handled by the desktop app
        // The API just tracks the intended actions
        results.push({
          file_id: action.file_id,
          file_path: file.file_name, // Would be full path in real implementation
          action: action.action,
          success: true,
          message: `Action ${action.action} recorded for execution`
        });
      }
      
      return {
        success: true,
        executed_actions: results.length,
        results
      };
      
    } catch (error) {
      fastify.log.error('Desktop execute error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to execute actions'
      });
    }
  });
  
};