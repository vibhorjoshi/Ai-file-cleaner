# 🤖 AI File Cleanup - Intelligent Duplicate Detection System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/vibhorjoshi/ai-file-cleaner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

> **Advanced AI-powered file deduplication system using machine learning embeddings for intelligent similarity detection across text, images, and binary files.**

## 🌟 Features

### 🤖 **AI-Powered Detection**
- **Text Similarity** - Uses Xenova/all-MiniLM-L6-v2 for semantic text analysis
- **Image Similarity** - Leverages Xenova/CLIP for visual content matching  
- **Exact Matching** - SHA256 hash-based duplicate detection
- **Real-time Processing** - Live embedding generation and similarity scoring

### 🎨 **Professional Interface**
- **Modern Web App** - Beautiful gradient design with glass-morphism effects
- **Desktop Application** - Cross-platform Electron app with native file access
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Statistics** - Live progress tracking and AI model status

### ⚡ **Performance & Architecture**
- **Monorepo Structure** - Organized with pnpm + TurboRepo for efficient development
- **Microservices Design** - Separate AI worker, API service, and frontend applications  
- **TypeScript** - Full type safety across all packages
- **Modern Stack** - Next.js, Fastify, Prisma, and transformers.js

### Screen recording


https://github.com/user-attachments/assets/f1baa4fc-bf53-473f-ab39-410430c76770



## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/vibhorjoshi/ai-file-cleaner.git
cd ai-file-cleaner

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start development servers
pnpm run dev
```

### 🌐 Access the Application

- **Web Interface**: http://localhost:3001
- **Professional HTML Version**: http://localhost:3001/index.html
- **AI Model Worker**: http://127.0.0.1:58748
- **Desktop App**: Run `pnpm run dev --filter=@ai-file-cleanup/desktop`

## 📁 Project Structure

```
ai-file-cleanup/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── src/
│   │   └── public/            # HTML/CSS/JS version
│   └── desktop/               # Electron desktop app
├── services/
│   ├── api/                   # Fastify API service
│   └── model-worker/          # AI inference service
├── packages/
│   ├── ui/                    # Shared React components
│   ├── core/                  # Shared TypeScript types
│   ├── db/                    # Prisma database schema
│   └── types/                 # Type definitions
└── infra/
    └── docker/                # Docker configurations
```

## 🔧 Development

### Build System
```bash
# Build all packages
pnpm run build

# Build specific package
pnpm run build --filter=@ai-file-cleanup/web

# Development mode (all services)
pnpm run dev

# Development mode (specific service)
pnpm run dev --filter=@ai-file-cleanup/model-worker
```

### Testing
```bash
# Run all tests
pnpm test

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

## 🤖 AI Models

### Text Embeddings
- **Model**: `Xenova/all-MiniLM-L6-v2`
- **Dimensions**: 384
- **Use Case**: Document similarity, text deduplication

### Image Embeddings  
- **Model**: `Xenova/clip-vit-base-patch32`
- **Dimensions**: 512
- **Use Case**: Visual similarity, image deduplication

### API Endpoints
```javascript
// Text similarity
POST /embeddings/text
Content-Type: application/json
{
  "texts": ["document content 1", "document content 2"]
}

// Image similarity  
POST /embeddings/images
Content-Type: multipart/form-data
```

## 📊 Performance

### Benchmarks
- **Text Processing**: ~100ms per document
- **Image Processing**: ~200ms per image  
- **Similarity Calculation**: <10ms for 1000 embeddings
- **Memory Usage**: ~2GB with both models loaded

### Supported File Types
- **Text**: `.txt`, `.md`, `.doc`, `.docx`, `.pdf`
- **Images**: `.jpg`, `.png`, `.bmp`, `.gif`, `.webp`
- **Archives**: `.zip`, `.rar`, `.7z`
- **All Files**: SHA256 hash-based exact matching

## 🎯 Usage Examples

### Web Interface
1. Open http://localhost:3001/index.html
2. Select folder to scan
3. Choose detection options (AI text, AI image, exact match)
4. Click "Start Scan"
5. Review duplicate groups with similarity scores
6. Delete or export results

### API Usage
```javascript
// Check AI service health
const health = await fetch('http://127.0.0.1:58748/health');

// Generate text embeddings
const response = await fetch('http://127.0.0.1:58748/embeddings/text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ texts: ['sample text'] })
});
const { embeddings } = await response.json();
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with app router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Electron** - Cross-platform desktop app

### Backend
- **Fastify** - High-performance Node.js framework
- **transformers.js** - AI/ML inference in JavaScript
- **Prisma** - Type-safe database ORM
- **Zod** - Runtime type validation

### DevOps
- **TurboRepo** - Monorepo build system
- **pnpm** - Fast, efficient package manager
- **Docker** - Containerization support
- **GitHub Actions** - CI/CD pipeline

## 📋 Roadmap

### v1.1 - Enhanced AI
- [ ] Video similarity detection
- [ ] Audio fingerprinting
- [ ] Custom model training
- [ ] Batch processing optimization

### v1.2 - Enterprise Features  
- [ ] Cloud storage integration
- [ ] Multi-user support
- [ ] API rate limiting
- [ ] Advanced reporting

### v1.3 - Performance
- [ ] GPU acceleration
- [ ] Distributed processing
- [ ] Caching improvements
- [ ] Real-time file monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)  
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Ensure all packages build successfully

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Xenova** - For excellent JavaScript ML model implementations
- **Hugging Face** - For pre-trained transformer models
- **Vercel** - For Next.js and development tools
- **Electron** - For cross-platform desktop capabilities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-file-cleanup/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-file-cleanup/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/ai-file-cleanup/wiki)

---

**Made with ❤️ and 🤖 AI**
