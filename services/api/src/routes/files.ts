/**
 * File processing routes
 * POST /dedupe/preview (multipart): files[] (img/pdf/txt)
 * POST /dedupe/zip (JSON): { uploadId, selectedFileIds[] } → streams ZIP
 */

import { FastifyPluginAsync } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import sharp from 'sharp';
import pdfParse from 'pdf-parse';
import archiver from 'archiver';
import { query, transaction } from '../db/connection';
import { z } from 'zod';

// Request schemas
const DedupeZipSchema = z.object({
  uploadId: z.string().uuid(),
  selectedFileIds: z.array(z.string().uuid())
});

interface FileData {
  id: string;
  upload_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  phash?: string;
  text_excerpt?: string;
}

interface DuplicateGroup {
  id: string;
  files: FileData[];
  similarity: number;
  method: string;
  kept_file_id: string;
}

export const fileRoutes: FastifyPluginAsync = async (fastify) => {
  
  // POST /dedupe/preview - Process uploaded files for duplicate detection
  fastify.post('/preview', async (request, reply) => {
    try {
      const files = await request.saveRequestFiles();
      
      if (!files || files.length === 0) {
        return reply.code(400).send({ 
          success: false, 
          message: 'No files uploaded' 
        });
      }
      
      // Create upload session
      const uploadId = uuidv4();
      const userId = null; // TODO: Extract from session
      
      await query(
        'INSERT INTO uploads (id, user_id, total_files) VALUES ($1, $2, $3)',
        [uploadId, userId, files.length]
      );
      
      const processedFiles: FileData[] = [];
      const hashGroups: { [key: string]: FileData[] } = {};
      
      // Process each file
      for (const file of files) {
        const buffer = await file.file.buffer();
        
        // Calculate SHA-256 hash
        const sha256 = createHash('sha256').update(buffer).digest('hex');
        
        // Extract content based on MIME type
        let textExcerpt: string | undefined;
        let phash: string | undefined;
        
        if (file.mimetype.startsWith('image/')) {
          // Process image with Sharp
          try {
            const metadata = await sharp(buffer).metadata();
            // Generate simple perceptual hash (simplified for MVP)
            phash = createHash('md5').update(`${metadata.width}x${metadata.height}`).digest('hex').substring(0, 16);
          } catch (error) {
            fastify.log.warn('Image processing failed:', error);
          }
        } else if (file.mimetype === 'application/pdf') {
          // Extract text from PDF
          try {
            const pdfData = await pdfParse(buffer);
            textExcerpt = pdfData.text.substring(0, 1000); // First 1000 chars
          } catch (error) {
            fastify.log.warn('PDF processing failed:', error);
          }
        } else if (file.mimetype.startsWith('text/')) {
          // Handle text files
          try {
            textExcerpt = buffer.toString('utf-8').substring(0, 1000);
          } catch (error) {
            fastify.log.warn('Text processing failed:', error);
          }
        }
        
        // Store file metadata
        const fileId = uuidv4();
        const fileData: FileData = {
          id: fileId,
          upload_id: uploadId,
          file_name: file.filename,
          mime_type: file.mimetype,
          size_bytes: buffer.length,
          sha256,
          phash,
          text_excerpt: textExcerpt
        };
        
        await query(
          `INSERT INTO files (id, upload_id, file_name, mime_type, size_bytes, sha256, phash, text_excerpt)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [fileId, uploadId, file.filename, file.mimetype, buffer.length, sha256, phash, textExcerpt]
        );
        
        processedFiles.push(fileData);
        
        // Group by hash for exact duplicates
        if (!hashGroups[sha256]) {
          hashGroups[sha256] = [];
        }
        hashGroups[sha256].push(fileData);
      }
      
      // Create duplicate groups
      const duplicateGroups: DuplicateGroup[] = [];
      let groupIndex = 0;
      
      for (const [hash, duplicateFiles] of Object.entries(hashGroups)) {
        if (duplicateFiles.length > 1) {
          // Sort by size (keep largest)
          duplicateFiles.sort((a, b) => b.size_bytes - a.size_bytes);
          
          const groupId = uuidv4();
          const keptFile = duplicateFiles[0];
          
          await query(
            'INSERT INTO dedupe_groups (id, upload_id, group_index, kept_file_id) VALUES ($1, $2, $3, $4)',
            [groupId, uploadId, groupIndex, keptFile.id]
          );
          
          duplicateGroups.push({
            id: groupId,
            files: duplicateFiles,
            similarity: 1.0,
            method: 'hash',
            kept_file_id: keptFile.id
          });
          
          groupIndex++;
        }
      }
      
      // TODO: Add embedding-based similarity detection here
      // This would involve calling the Model Worker for embeddings
      // and computing cosine similarity with pgvector
      
      return {
        success: true,
        upload_id: uploadId,
        total_files: processedFiles.length,
        duplicate_groups: duplicateGroups.length,
        groups: duplicateGroups.map(group => ({
          id: group.id,
          method: group.method,
          similarity: group.similarity,
          kept_file: group.files.find(f => f.id === group.kept_file_id),
          duplicates: group.files.filter(f => f.id !== group.kept_file_id),
          total_size_saved: group.files
            .filter(f => f.id !== group.kept_file_id)
            .reduce((sum, f) => sum + f.size_bytes, 0)
        }))
      };
      
    } catch (error) {
      fastify.log.error('File processing error:', error);
      return reply.code(500).send({ 
        success: false, 
        message: 'File processing failed' 
      });
    }
  });
  
  // POST /dedupe/zip - Stream ZIP of selected files
  fastify.post('/zip', async (request, reply) => {
    try {
      const body = DedupeZipSchema.parse(request.body);
      
      // Get selected files
      const files = await query(
        `SELECT f.* FROM files f 
         WHERE f.upload_id = $1 AND f.id = ANY($2)`,
        [body.uploadId, body.selectedFileIds]
      ) as FileData[];
      
      if (files.length === 0) {
        return reply.code(404).send({ 
          success: false, 
          message: 'No files found' 
        });
      }
      
      // Set response headers for ZIP download
      reply.header('Content-Type', 'application/zip');
      reply.header('Content-Disposition', 'attachment; filename="selected-files.zip"');
      
      // Create ZIP archive
      const archive = archiver('zip', {
        zlib: { level: 9 } // Compression level
      });
      
      // Handle archive errors
      archive.on('error', (err) => {
        fastify.log.error('Archive error:', err);
        throw err;
      });
      
      // Pipe archive to response
      reply.send(archive);
      
      // Add files to archive (placeholder content for MVP)
      for (const file of files) {
        const content = `File: ${file.file_name}\nSize: ${file.size_bytes} bytes\nSHA256: ${file.sha256}\nMIME: ${file.mime_type}`;
        archive.append(content, { name: file.file_name });
      }
      
      // Finalize the archive
      archive.finalize();
      
    } catch (error) {
      fastify.log.error('ZIP creation error:', error);
      return reply.code(500).send({ 
        success: false, 
        message: 'ZIP creation failed' 
      });
    }
  });
  
  // GET /dedupe/upload/:uploadId - Get upload details
  fastify.get('/upload/:uploadId', async (request, reply) => {
    try {
      const params = request.params as { uploadId: string };
      
      // Get upload details
      const uploads = await query(
        'SELECT * FROM uploads WHERE id = $1',
        [params.uploadId]
      );
      
      if (uploads.length === 0) {
        return reply.code(404).send({ 
          success: false, 
          message: 'Upload not found' 
        });
      }
      
      // Get files for this upload
      const files = await query(
        'SELECT * FROM files WHERE upload_id = $1',
        [params.uploadId]
      ) as FileData[];
      
      // Get duplicate groups
      const groups = await query(
        'SELECT * FROM dedupe_groups WHERE upload_id = $1',
        [params.uploadId]
      );
      
      return {
        success: true,
        upload: uploads[0],
        files,
        duplicate_groups: groups
      };
      
    } catch (error) {
      fastify.log.error('Upload details error:', error);
      return reply.code(500).send({ 
        success: false, 
        message: 'Failed to get upload details' 
      });
    }
  });
  
};