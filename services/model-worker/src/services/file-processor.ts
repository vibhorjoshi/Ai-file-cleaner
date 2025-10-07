import crypto from 'crypto'
import { TextEmbeddingService } from './text-embedding'
import { ImageEmbeddingService } from './image-embedding'

export class FileProcessorService {
  private textService: TextEmbeddingService
  private imageService: ImageEmbeddingService

  constructor() {
    this.textService = new TextEmbeddingService()
    this.imageService = new ImageEmbeddingService()
  }

  async processFile(filePath: string, buffer: Buffer) {
    const result = {
      filePath,
      size: buffer.length,
      sha256Hash: this.generateSHA256(buffer),
      mimeType: this.getMimeType(filePath),
      textEmbedding: null as number[] | null,
      imageEmbedding: null as number[] | null,
      metadata: {} as any
    }

    try {
      // Generate text embedding if applicable
      if (this.isTextFile(filePath)) {
        const textContent = await this.textService.extractText(filePath, buffer)
        if (textContent.trim()) {
          const embeddings = await this.textService.generateEmbeddings([textContent])
          result.textEmbedding = embeddings[0] || null
          result.metadata.textLength = textContent.length
          result.metadata.wordCount = textContent.split(/\s+/).length
        }
      }

      // Generate image embedding if applicable
      if (this.imageService.isImageFile(filePath)) {
        const embeddings = await this.imageService.generateEmbeddings([buffer])
        result.imageEmbedding = embeddings[0] || null
        
        const imageMetadata = await this.imageService.getImageMetadata(buffer)
        if (imageMetadata) {
          result.metadata = { ...result.metadata, ...imageMetadata }
        }
      }

      return result
    } catch (error) {
      console.error('Error processing file:', filePath, error)
      return result
    }
  }

  private generateSHA256(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex')
  }

  private getMimeType(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop()
    const mimeTypes: Record<string, string> = {
      // Text files
      'txt': 'text/plain',
      'md': 'text/markdown',
      'json': 'application/json',
      'js': 'application/javascript',
      'ts': 'application/typescript',
      'html': 'text/html',
      'css': 'text/css',
      'xml': 'application/xml',
      
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'tiff': 'image/tiff',
      'tif': 'image/tiff',
      
      // Documents
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'doc': 'application/msword',
      
      // Archives
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      
      // Audio/Video
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime'
    }

    return ext ? mimeTypes[ext] || 'application/octet-stream' : 'application/octet-stream'
  }

  private isTextFile(filePath: string): boolean {
    const textExtensions = [
      '.txt', '.md', '.json', '.js', '.ts', '.py', '.java', '.cpp', '.c', '.h',
      '.css', '.html', '.xml', '.yml', '.yaml', '.sql', '.sh', '.bat', '.ps1',
      '.pdf', '.docx', '.doc'
    ]
    const ext = filePath.toLowerCase().split('.').pop()
    return ext ? textExtensions.includes(`.${ext}`) : false
  }
}