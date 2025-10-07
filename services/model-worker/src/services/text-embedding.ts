import { AutoTokenizer, AutoModel } from '@xenova/transformers'

export class TextEmbeddingService {
  private tokenizer: any = null
  private model: any = null
  private ready = false

  async initialize() {
    try {
      console.log('Loading text embedding model...')
      
      // Use a smaller, more reliable model for embeddings
      this.tokenizer = await AutoTokenizer.from_pretrained('Xenova/all-MiniLM-L6-v2')
      this.model = await AutoModel.from_pretrained('Xenova/all-MiniLM-L6-v2')
      
      this.ready = true
      console.log('Text embedding model loaded successfully')
    } catch (error) {
      console.error('Failed to load text embedding model:', error)
      // Don't throw error - allow service to start without embeddings
      this.ready = false
      console.log('Text embedding service will run in mock mode')
    }
  }

  isReady(): boolean {
    return this.ready
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.ready) {
      // Return mock embeddings when model is not ready
      console.log('Generating mock text embeddings (model not loaded)')
      return texts.map(() => this.generateMockEmbedding(384)) // all-MiniLM-L6-v2 dimension
    }

    const embeddings: number[][] = []

    for (const text of texts) {
      try {
        // Tokenize the input text
        const inputs = await this.tokenizer(text, {
          truncation: true,
          padding: true,
          max_length: 512,
          return_tensors: 'pt'
        })

        // Get the model output
        const outputs = await this.model(inputs)
        
        // Use pooled output for sentence embeddings
        const embedding = outputs.pooler_output?.data || outputs.last_hidden_state.data.slice(0, 384)
        
        // Normalize the embedding
        const norm = Math.sqrt(embedding.reduce((sum: number, val: number) => sum + val * val, 0))
        const normalizedEmbedding = embedding.map((val: number) => val / norm)
        
        embeddings.push(Array.from(normalizedEmbedding))
      } catch (error) {
        console.error('Error generating embedding for text:', text.substring(0, 50), error)
        embeddings.push(this.generateMockEmbedding(384))
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

  // Extract text content from different file types
  async extractText(filePath: string, buffer: Buffer): Promise<string> {
    const ext = filePath.toLowerCase().split('.').pop()

    switch (ext) {
      case 'txt':
      case 'md':
      case 'json':
      case 'js':
      case 'ts':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
      case 'h':
      case 'css':
      case 'html':
      case 'xml':
        return buffer.toString('utf-8')

      case 'pdf':
        try {
          const pdfParse = await import('pdf-parse')
          const data = await pdfParse.default(buffer)
          return data.text
        } catch (error) {
          console.error('PDF parsing error:', error)
          return ''
        }

      case 'docx':
        try {
          const mammoth = await import('mammoth')
          const result = await mammoth.extractRawText({ buffer })
          return result.value
        } catch (error) {
          console.error('DOCX parsing error:', error)
          return ''
        }

      default:
        return ''
    }
  }
}