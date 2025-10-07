#!/bin/bash

# AI File Management System - Fastify API Startup Script

echo "🚀 Starting AI File Management System - Fastify API"

# Set environment
export NODE_ENV=${NODE_ENV:-development}
export PORT=${PORT:-3001}

# Check if this is Render deployment
if [ "$RENDER" = "true" ]; then
    echo "📦 Render deployment detected"
    
    # Install dependencies and build
    npm ci
    npm run build
    
    # Run migrations
    echo "🗄️ Running database migrations..."
    npm run db:migrate
    
    # Start production server
    echo "🌐 Starting production server on port $PORT"
    npm start
    
else
    echo "💻 Local development environment"
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo "⚙️ Creating .env file from template..."
        cp .env.example .env
        echo "⚠️  Please configure .env file with your database settings"
    fi
    
    # Check if database is configured
    if ! grep -q "postgresql://" .env; then
        echo "⚠️  Database URL not configured. Using default local settings."
        echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_file_cleanup" >> .env
    fi
    
    # Build TypeScript
    echo "🔧 Building TypeScript..."
    npm run build
    
    # Run migrations
    echo "🗄️ Running database migrations..."
    npm run db:migrate || echo "⚠️ Migration failed - database may not be ready"
    
    # Start development server
    echo "🌐 Starting development server on port $PORT"
    npm run dev
fi