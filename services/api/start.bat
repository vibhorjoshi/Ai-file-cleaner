@echo off
REM AI File Management System - Fastify API Startup Script for Windows

echo 🚀 Starting AI File Management System - Fastify API

REM Set default environment variables
if not defined NODE_ENV set NODE_ENV=development
if not defined PORT set PORT=3001

REM Check if this is Render deployment
if defined RENDER (
    echo 📦 Render deployment detected
    
    REM Install dependencies and build
    npm ci
    npm run build
    
    REM Run migrations
    echo 🗄️ Running database migrations...
    npm run db:migrate
    
    REM Start production server
    echo 🌐 Starting production server on port %PORT%
    npm start
    
) else (
    echo 💻 Local development environment
    
    REM Check if dependencies are installed
    if not exist node_modules (
        echo 📦 Installing dependencies...
        npm install
    )
    
    REM Check if .env file exists
    if not exist .env (
        echo ⚙️ Creating .env file from template...
        copy .env.example .env
        echo ⚠️  Please configure .env file with your database settings
    )
    
    REM Build TypeScript
    echo 🔧 Building TypeScript...
    npm run build
    
    REM Run migrations
    echo 🗄️ Running database migrations...
    npm run db:migrate
    
    REM Start development server
    echo 🌐 Starting development server on port %PORT%
    npm run dev
)

pause