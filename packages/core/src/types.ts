export interface FileMetadata {
  id?: number
  originalName: string
  filePath: string
  size: number
  sha256Hash: string
  mimeType: string
  createdAt?: Date
  lastModified?: Date
}

export interface FileEmbedding {
  id?: number
  fileId: number
  embeddingType: 'text' | 'image'
  embedding: number[]
  model: string
  dimension: number
  createdAt?: Date
}

export interface DuplicateGroup {
  id?: number
  groupType: 'exact' | 'text_similar' | 'image_similar'
  similarity: number
  files: FileMetadata[]
  createdAt?: Date
}

export interface ScanSession {
  id?: number
  directoryPath: string
  status: 'running' | 'completed' | 'failed'
  totalFiles: number
  processedFiles: number
  duplicateGroups: number
  startedAt: Date
  completedAt?: Date
}

export interface User {
  id?: number
  email: string
  passwordHash: string
  isActive: boolean
  licenseKey?: string
  createdAt?: Date
  lastLogin?: Date
}

export interface LicenseKey {
  id?: number
  key: string
  userId?: number
  isActive: boolean
  expiresAt?: Date
  createdAt?: Date
}

// API Request/Response Types
export interface EmbeddingRequest {
  texts?: string[]
  images?: Buffer[]
}

export interface EmbeddingResponse {
  embeddings: number[][]
  dimension: number
  model: string
}

export interface ScanRequest {
  directoryPath: string
  includeSubdirs: boolean
  fileTypes?: string[]
  maxFileSize?: number
}

export interface ScanProgress {
  sessionId: number
  status: 'running' | 'completed' | 'failed'
  totalFiles: number
  processedFiles: number
  currentFile?: string
  duplicateGroups: number
  elapsedTime: number
}

export interface CleanupRequest {
  groupIds: number[]
  strategy: 'keep_first' | 'keep_largest' | 'keep_newest' | 'manual'
  keepFiles?: number[]
}

export interface CleanupResult {
  deletedFiles: number
  freedSpace: number
  errors: string[]
}