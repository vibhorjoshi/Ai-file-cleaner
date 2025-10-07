#!/bin/bash

# AI File Cleanup - Complete Setup Script
# Automates the entire development environment setup

set -e

echo "🚀 AI File Cleanup - Development Setup"
echo "====================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm $(pnpm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Setup environment files
echo ""
echo "⚙️  Setting up environment files..."

# Database package env
if [ ! -f "packages/db/.env" ]; then
    cp packages/db/.env.example packages/db/.env 2>/dev/null || {
        echo "DATABASE_URL=\"postgresql://user:password@localhost:5432/ai_cleanup_dev\"" > packages/db/.env
    }
    echo "✅ Created packages/db/.env"
fi

# API service env
if [ ! -f "services/api/.env" ]; then
    cp services/api/.env.example services/api/.env 2>/dev/null || {
        cat > services/api/.env << EOF
NODE_ENV=development
PORT=8000
DATABASE_URL="postgresql://user:password@localhost:5432/ai_cleanup_dev"
JWT_SECRET="dev-jwt-secret-change-in-production"
SESSION_SECRET="dev-session-secret-change-in-production"
CORS_ORIGIN="http://localhost:3000"
MODEL_WORKER_URL="http://localhost:8001"
EOF
    }
    echo "✅ Created services/api/.env"
fi

# Web app env
if [ ! -f "apps/web/.env.local" ]; then
    cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_URL="http://localhost:8000"
SIMILARITY_THRESHOLD="0.85"
MAX_FILE_SIZE="104857600"
EOF
    echo "✅ Created apps/web/.env.local"
fi

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
pnpm run db:generate

# Check database connection
echo ""
echo "🗄️  Database setup..."
echo "Please ensure PostgreSQL is running and update connection strings in .env files"
echo "Default connection: postgresql://user:password@localhost:5432/ai_cleanup_dev"

read -p "Do you want to run database migrations? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running database migrations..."
    pnpm run db:push || {
        echo "⚠️  Database migration failed. Please check your database connection."
        echo "   You can run 'pnpm run db:push' later when your database is ready."
    }
    
    read -p "Do you want to seed sample data? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Seeding sample data..."
        pnpm run seed || {
            echo "⚠️  Database seeding failed. You can run 'pnpm run seed' later."
        }
    fi
fi

# Build packages
echo ""
echo "🔨 Building packages..."
pnpm run build

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Update database connection strings in .env files if needed"
echo "   2. Start development servers:"
echo "      pnpm run dev              # All services"
echo "      pnpm run dev:api          # API only (port 8000)"
echo "      pnpm run dev:worker       # ML worker only (port 8001)"
echo "      pnpm run dev:web          # Web app only (port 3000)"
echo ""
echo "🌐 Development URLs:"
echo "   • Web App: http://localhost:3000"
echo "   • API Docs: http://localhost:8000/docs"
echo "   • ML Worker: http://localhost:8001/health"
echo ""
echo "🔑 Sample accounts (after seeding):"
echo "   • Admin: admin@ai-cleanup.com / admin123"
echo "   • Test:  test@ai-cleanup.com / test123"
echo ""
echo "Happy coding! 🚀"