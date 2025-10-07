import Fastify from 'fastify'
import cors from '@fastify/cors'
import { TextEmbeddingService } from './services/text-embedding'
import { ImageEmbeddingService } from './services/image-embedding'
import { FileProcessorService } from './services/file-processor'
import type { EmbeddingRequest, EmbeddingResponse } from '@ai-file-cleanup/types'

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
})

// Services
const textEmbedding = new TextEmbeddingService()
const imageEmbedding = new ImageEmbeddingService()
const fileProcessor = new FileProcessorService()

async function startServer() {
  // CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true
  })

  // Initialize models
  await textEmbedding.initialize()
  await imageEmbedding.initialize()

  // Routes
  fastify.post<{
  Body: EmbeddingRequest
}>('/embeddings/text', async (request, reply) => {
  try {
    const { texts } = request.body
    
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return reply.code(400).send({ error: 'texts array is required' })
    }
    


    const embeddings = await textEmbedding.generateEmbeddings(texts)
    
    return {
      embeddings,
      dimension: 768,
      model: 'distilbert-base-uncased'
    } as EmbeddingResponse
  } catch (error) {
    fastify.log.error(error)
    return reply.code(500).send({ error: 'Failed to generate text embeddings' })
  }
})

fastify.post<{
  Body: { images: Buffer[] }
}>('/embeddings/image', async (request, reply) => {
  try {
    const { images } = request.body
    
    if (!Array.isArray(images) || images.length === 0) {
      return reply.code(400).send({ error: 'images array is required' })
    }

    const embeddings = await imageEmbedding.generateEmbeddings(images)
    
    return {
      embeddings,
      dimension: 512,
      model: 'clip-vit-base-patch32'
    } as EmbeddingResponse
  } catch (error) {
    fastify.log.error(error)
    return reply.code(500).send({ error: 'Failed to generate image embeddings' })
  }
})

fastify.post<{
  Body: { filePath: string; fileBuffer: Buffer }
}>('/process/file', async (request, reply) => {
  try {
    const { filePath, fileBuffer } = request.body
    
    if (!filePath || !fileBuffer) {
      return reply.code(400).send({ error: 'filePath and fileBuffer are required' })
    }

    const result = await fileProcessor.processFile(filePath, fileBuffer)
    return result
  } catch (error) {
    fastify.log.error(error)
    return reply.code(500).send({ error: 'Failed to process file' })
  }
})

// Health check
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      textEmbedding: textEmbedding.isReady(),
      imageEmbedding: imageEmbedding.isReady()
    }
  }
  })

  // Start server - use system-assigned port if none specified
  const requestedPort = process.env.MODEL_WORKER_PORT || process.env.PORT
  const port = requestedPort ? parseInt(requestedPort) : 0 // Let system assign port if not specified
  const address = await fastify.listen({ port, host: '127.0.0.1' })
  fastify.log.info(`Model Worker server listening on ${address}`)
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})