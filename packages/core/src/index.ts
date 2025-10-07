export * from './types'
export * from './similarity'
export * from './utils'

// Default similarity thresholds
export const SIMILARITY_THRESHOLDS = {
  TEXT: {
    HIGH: 0.95,
    MEDIUM: 0.85,
    LOW: 0.70
  },
  IMAGE: {
    HIGH: 0.90,
    MEDIUM: 0.80,
    LOW: 0.65
  },
  EXACT: 1.0
} as const

// Default clustering parameters
export const CLUSTERING_CONFIG = {
  MAX_CLUSTERS: 50,
  MIN_CLUSTER_SIZE: 2,
  HIERARCHICAL_THRESHOLD: 0.8,
  DBSCAN_EPS: 0.3,
  DBSCAN_MIN_SAMPLES: 2
} as const

// File processing limits
export const PROCESSING_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_TEXT_LENGTH: 1000000, // 1M characters
  MAX_BATCH_SIZE: 100,
  EMBEDDING_DIMENSIONS: {
    TEXT: 768,
    IMAGE: 512
  }
} as const