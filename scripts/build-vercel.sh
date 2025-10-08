#!/bin/bash
# Build script for Vercel deployment

echo "🚀 Starting AI File Cleaner build process..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build the web application
echo "🔨 Building web application..."
pnpm run build --filter=@ai-file-cleanup/web

# Check if build directory exists
if [ -d "apps/web/build" ]; then
  echo "✅ Build directory created successfully at apps/web/build"
  ls -la apps/web/build
else
  echo "❌ Build directory not found. Checking for alternative output directories..."
  ls -la apps/web/
fi

echo "🎉 Build process completed!"