import { z } from 'zod';

// Authentication Types
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user_id: z.string().uuid().optional(),
  session_id: z.string().optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// License Types
export const LicenseKeySchema = z.object({
  id: z.string().uuid(),
  key: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime().optional(),
  revoked: z.boolean().default(false),
});

export const ValidateLicenseRequestSchema = z.object({
  license_key: z.string().uuid(),
});

export const ValidateLicenseResponseSchema = z.object({
  valid: z.boolean(),
  user_id: z.string().uuid().optional(),
  expires_at: z.string().datetime().optional(),
  features: z.array(z.string()).optional(),
  message: z.string(),
});

export type LicenseKey = z.infer<typeof LicenseKeySchema>;
export type ValidateLicenseRequest = z.infer<typeof ValidateLicenseRequestSchema>;
export type ValidateLicenseResponse = z.infer<typeof ValidateLicenseResponseSchema>;

// File Types
export const FileMetadataSchema = z.object({
  path: z.string(),
  mime: z.string(),
  size: z.number().int().positive(),
  sha256: z.string().length(64),
  phash: z.string().optional(),
});

export const DuplicateFileSchema = z.object({
  file_id: z.string().uuid(),
  path: z.string(),
  mime: z.string(),
  size: z.number().int().positive(),
  similarity_score: z.number().min(0).max(1),
  detection_method: z.enum(['sha256', 'phash', 'embedding', 'hybrid']),
  is_keep_candidate: z.boolean(),
  explanation: z.string(),
});

export const DuplicateGroupSchema = z.object({
  group_id: z.string().uuid(),
  files: z.array(DuplicateFileSchema),
  keep_candidate: DuplicateFileSchema,
  total_size: z.number().int().positive(),
  potential_savings: z.number().int().min(0),
  similarity_threshold: z.number().min(0).max(1),
});

export const DedupePreviewRequestSchema = z.object({
  files: z.array(FileMetadataSchema),
  samples: z.array(z.string().url()).optional(), // presigned URLs
});

export const DedupePreviewResponseSchema = z.object({
  upload_id: z.string().uuid(),
  groups: z.array(DuplicateGroupSchema),
  total_files: z.number().int().min(0),
  total_groups: z.number().int().min(0),
  potential_space_saved: z.number().int().min(0),
  processing_time_ms: z.number().int().positive(),
});

export type FileMetadata = z.infer<typeof FileMetadataSchema>;
export type DuplicateFile = z.infer<typeof DuplicateFileSchema>;
export type DuplicateGroup = z.infer<typeof DuplicateGroupSchema>;
export type DedupePreviewRequest = z.infer<typeof DedupePreviewRequestSchema>;
export type DedupePreviewResponse = z.infer<typeof DedupePreviewResponseSchema>;

// System Types
export const HealthResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  version: z.string(),
  uptime: z.string(),
  services: z.record(z.string(), z.string()),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Thresholds and Configuration
export const DedupeConfigSchema = z.object({
  similarity_threshold: z.number().min(0).max(1).default(0.85),
  embedding_model: z.enum(['distilbert', 'sentence-transformers']).default('distilbert'),
  image_model: z.enum(['clip', 'resnet']).default('clip'),
  batch_size: z.number().int().positive().default(32),
  max_file_size: z.number().int().positive().default(100 * 1024 * 1024), // 100MB
});

export type DedupeConfig = z.infer<typeof DedupeConfigSchema>;

// Error Types
export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.any()).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Embedding Types for Model Worker
export const EmbeddingRequestSchema = z.object({
  texts: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(), // base64 encoded or file paths
  model: z.enum(['text', 'image']),
});

export const EmbeddingResponseSchema = z.object({
  embeddings: z.array(z.array(z.number())),
  model_used: z.string(),
  processing_time: z.number(),
});

export type EmbeddingRequest = z.infer<typeof EmbeddingRequestSchema>;
export type EmbeddingResponse = z.infer<typeof EmbeddingResponseSchema>;