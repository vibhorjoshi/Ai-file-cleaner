import { CLIPVisionModelWithProjection, AutoProcessor as CLIPProcessor, RawImage } from '@xenova/transformers'
import sharp from 'sharp'

export class ImageEmbeddingService {
  private processor: any = null
  private model: any = null
  private ready = false

  async initialize() {
    try {
      console.log('Loading image embedding model...')
      
      // Use Xenova models which are more reliable for transformers.js
      this.processor = await CLIPProcessor.from_pretrained('Xenova/clip-vit-base-patch32')
      this.model = await CLIPVisionModelWithProjection.from_pretrained('Xenova/clip-vit-base-patch32')
      
      this.ready = true
      console.log('Image embedding model loaded successfully')
    } catch (error) {
      console.error('Failed to load image embedding model:', error)
      // Don't throw error - allow service to start without embeddings
      this.ready = false
      console.log('Image embedding service will run in mock mode')
    }
  }

  isReady(): boolean {
    return this.ready
  }

  async generateEmbeddings(imageBuffers: Buffer[]): Promise<number[][]> {
    if (!this.ready) {
      // Return mock embeddings when model is not ready
      console.log('Generating mock image embeddings (model not loaded)')
      return imageBuffers.map(() => this.generateMockEmbedding(512)) // CLIP dimension
    }

    const embeddings: number[][] = []

    for (const buffer of imageBuffers) {
      try {
        // Process image with sharp to ensure consistent format
        const processedBuffer = await sharp(buffer)
          .resize(224, 224, { fit: 'cover' })
          .jpeg({ quality: 95 })
          .toBuffer()

        // Create RawImage from processed buffer
        const dataUrl = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`
        const image = await RawImage.read(dataUrl)
        
        // Process image through CLIP processor
        const inputs = await this.processor(image)
        
        // Generate embedding
        const outputs = await this.model(inputs)
        const embedding = outputs.image_embeds?.data || outputs.pooler_output?.data
        
        if (!embedding) {
          console.warn('No embedding data found, using mock')
          embeddings.push(this.generateMockEmbedding(512))
          continue
        }

        // Normalize the embedding
        const norm = Math.sqrt(embedding.reduce((sum: number, val: number) => sum + val * val, 0))
        const normalizedEmbedding = embedding.map((val: number) => val / norm)
        
        embeddings.push(Array.from(normalizedEmbedding))
      } catch (error) {
        console.error('Error processing image:', error)
        // Push mock embedding for failed images
        embeddings.push(this.generateMockEmbedding(512))
      }
    }

    return embeddings
  }

  private generateMockEmbedding(dimension: number): number[] {
    // Generate a normalized random vector as mock embedding
    const embedding = Array.from({ length: dimension }, () => (Math.random() - 0.5) * 2)
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / norm)
  }

  // Check if file is a supported image format
  isImageFile(filePath: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif']
    const ext = filePath.toLowerCase().split('.').pop()
    return ext ? imageExtensions.includes(`.${ext}`) : false
  }

  // Get image metadata
  async getImageMetadata(buffer: Buffer) {
    try {
      const metadata = await sharp(buffer).metadata()
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        channels: metadata.channels,
        space: metadata.space,
        hasAlpha: metadata.hasAlpha,
        size: buffer.length
      }
    } catch (error) {
      console.error('Error getting image metadata:', error)
      return null
    }
  }
}