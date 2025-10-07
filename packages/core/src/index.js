"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROCESSING_LIMITS = exports.CLUSTERING_CONFIG = exports.SIMILARITY_THRESHOLDS = void 0;
__exportStar(require("./types"), exports);
__exportStar(require("./similarity"), exports);
__exportStar(require("./utils"), exports);
// Default similarity thresholds
exports.SIMILARITY_THRESHOLDS = {
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
};
// Default clustering parameters
exports.CLUSTERING_CONFIG = {
    MAX_CLUSTERS: 50,
    MIN_CLUSTER_SIZE: 2,
    HIERARCHICAL_THRESHOLD: 0.8,
    DBSCAN_EPS: 0.3,
    DBSCAN_MIN_SAMPLES: 2
};
// File processing limits
exports.PROCESSING_LIMITS = {
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_TEXT_LENGTH: 1000000, // 1M characters
    MAX_BATCH_SIZE: 100,
    EMBEDDING_DIMENSIONS: {
        TEXT: 768,
        IMAGE: 512
    }
};
