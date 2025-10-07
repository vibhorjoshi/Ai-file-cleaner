/**
 * Calculate cosine similarity between two vectors
 */
export declare function cosineSimilarity(a: number[], b: number[]): number;
/**
 * Calculate Euclidean distance between two vectors
 */
export declare function euclideanDistance(a: number[], b: number[]): number;
/**
 * Normalize a vector to unit length
 */
export declare function normalizeVector(vector: number[]): number[];
/**
 * Group similar embeddings using threshold-based clustering
 */
export declare function clusterEmbeddings(embeddings: Array<{
    id: number;
    embedding: number[];
}>, threshold?: number, metric?: 'cosine' | 'euclidean'): Array<{
    clusterId: number;
    members: number[];
}>;
/**
 * Advanced hierarchical clustering using average linkage
 */
export declare function hierarchicalClustering(embeddings: Array<{
    id: number;
    embedding: number[];
}>, maxClusters?: number, minSimilarity?: number): Array<{
    clusterId: number;
    members: number[];
    avgSimilarity: number;
}>;
