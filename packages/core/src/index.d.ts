export * from './types';
export * from './similarity';
export * from './utils';
export declare const SIMILARITY_THRESHOLDS: {
    readonly TEXT: {
        readonly HIGH: 0.95;
        readonly MEDIUM: 0.85;
        readonly LOW: 0.7;
    };
    readonly IMAGE: {
        readonly HIGH: 0.9;
        readonly MEDIUM: 0.8;
        readonly LOW: 0.65;
    };
    readonly EXACT: 1;
};
export declare const CLUSTERING_CONFIG: {
    readonly MAX_CLUSTERS: 50;
    readonly MIN_CLUSTER_SIZE: 2;
    readonly HIERARCHICAL_THRESHOLD: 0.8;
    readonly DBSCAN_EPS: 0.3;
    readonly DBSCAN_MIN_SAMPLES: 2;
};
export declare const PROCESSING_LIMITS: {
    readonly MAX_FILE_SIZE: number;
    readonly MAX_TEXT_LENGTH: 1000000;
    readonly MAX_BATCH_SIZE: 100;
    readonly EMBEDDING_DIMENSIONS: {
        readonly TEXT: 768;
        readonly IMAGE: 512;
    };
};
