@echo off
REM Build script for Vercel deployment (Windows)

echo 🚀 Starting AI File Cleaner build process...

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install --frozen-lockfile

REM Build the web application
echo 🔨 Building web application...
pnpm run build --filter=@ai-file-cleanup/web

REM Check if build directory exists
if exist "apps\web\build" (
  echo ✅ Build directory created successfully at apps\web\build
  dir apps\web\build
) else (
  echo ❌ Build directory not found. Checking for alternative output directories...
  dir apps\web\
)

echo 🎉 Build process completed!