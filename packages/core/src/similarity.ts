/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}

/**
 * Calculate Euclidean distance between two vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i]
    sum += diff * diff
  }

  return Math.sqrt(sum)
}

/**
 * Normalize a vector to unit length
 */
export function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  if (norm === 0) return vector
  return vector.map(val => val / norm)
}

/**
 * Group similar embeddings using threshold-based clustering
 */
export function clusterEmbeddings(
  embeddings: Array<{ id: number; embedding: number[] }>,
  threshold: number = 0.9,
  metric: 'cosine' | 'euclidean' = 'cosine'
): Array<{ clusterId: number; members: number[] }> {
  const clusters: Array<{ clusterId: number; members: number[] }> = []
  const assigned = new Set<number>()
  let clusterId = 0

  for (let i = 0; i < embeddings.length; i++) {
    if (assigned.has(embeddings[i].id)) continue

    const cluster = { clusterId: clusterId++, members: [embeddings[i].id] }
    assigned.add(embeddings[i].id)

    for (let j = i + 1; j < embeddings.length; j++) {
      if (assigned.has(embeddings[j].id)) continue

      const similarity = metric === 'cosine' 
        ? cosineSimilarity(embeddings[i].embedding, embeddings[j].embedding)
        : 1 - euclideanDistance(embeddings[i].embedding, embeddings[j].embedding) / Math.sqrt(embeddings[i].embedding.length)

      if (similarity >= threshold) {
        cluster.members.push(embeddings[j].id)
        assigned.add(embeddings[j].id)
      }
    }

    if (cluster.members.length > 1) {
      clusters.push(cluster)
    }
  }

  return clusters
}

/**
 * Advanced hierarchical clustering using average linkage
 */
export function hierarchicalClustering(
  embeddings: Array<{ id: number; embedding: number[] }>,
  maxClusters: number = 10,
  minSimilarity: number = 0.8
): Array<{ clusterId: number; members: number[]; avgSimilarity: number }> {
  // Create distance matrix
  const n = embeddings.length
  const distances: number[][] = Array(n).fill(0).map(() => Array(n).fill(0))
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const similarity = cosineSimilarity(embeddings[i].embedding, embeddings[j].embedding)
      distances[i][j] = distances[j][i] = 1 - similarity
    }
  }

  // Initialize clusters - each point is its own cluster
  let clusters = embeddings.map((item, index) => ({
    clusterId: index,
    members: [item.id],
    indices: [index]
  }))

  // Merge clusters until we reach maxClusters or minimum similarity
  while (clusters.length > maxClusters) {
    let minDistance = Infinity
    let mergeI = -1
    let mergeJ = -1

    // Find closest clusters
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const distance = averageClusterDistance(clusters[i].indices, clusters[j].indices, distances)
        if (distance < minDistance) {
          minDistance = distance
          mergeI = i
          mergeJ = j
        }
      }
    }

    // Check if minimum similarity threshold is met
    if (1 - minDistance < minSimilarity) {
      break
    }

    // Merge clusters
    const newCluster = {
      clusterId: Math.max(...clusters.map(c => c.clusterId)) + 1,
      members: [...clusters[mergeI].members, ...clusters[mergeJ].members],
      indices: [...clusters[mergeI].indices, ...clusters[mergeJ].indices]
    }

    clusters = clusters.filter((_, idx) => idx !== mergeI && idx !== mergeJ)
    clusters.push(newCluster)
  }

  // Calculate average similarity for each cluster
  return clusters
    .filter(cluster => cluster.members.length > 1)
    .map(cluster => ({
      clusterId: cluster.clusterId,
      members: cluster.members,
      avgSimilarity: calculateClusterAvgSimilarity(cluster.indices, distances)
    }))
}

function averageClusterDistance(cluster1: number[], cluster2: number[], distances: number[][]): number {
  let sum = 0
  let count = 0

  for (const i of cluster1) {
    for (const j of cluster2) {
      sum += distances[i][j]
      count++
    }
  }

  return count > 0 ? sum / count : Infinity
}

function calculateClusterAvgSimilarity(indices: number[], distances: number[][]): number {
  if (indices.length <= 1) return 1

  let sum = 0
  let count = 0

  for (let i = 0; i < indices.length; i++) {
    for (let j = i + 1; j < indices.length; j++) {
      sum += 1 - distances[indices[i]][indices[j]]
      count++
    }
  }

  return count > 0 ? sum / count : 0
}