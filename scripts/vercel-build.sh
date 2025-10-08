#!/bin/bash
# Vercel build script for monorepo

echo "🚀 Starting AI File Cleaner build..."

# Install root dependencies without frozen lockfile
echo "📦 Installing root dependencies..."
pnpm install --no-frozen-lockfile --ignore-scripts

# Navigate to web app and install its dependencies
echo "📦 Installing web app dependencies..."
cd apps/web
pnpm install --no-frozen-lockfile

# Build the web application
echo "🔨 Building web application..."
pnpm run build

echo "✅ Build completed successfully!"

# Check if out directory was created
if [ -d "out" ]; then
  echo "✅ Output directory 'out' created successfully"
  ls -la out/
else
  echo "❌ Output directory 'out' not found"
  ls -la .
fi