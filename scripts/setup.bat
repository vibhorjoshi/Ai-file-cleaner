@echo off
REM AI File Cleanup - Windows Setup Script

echo 🚀 AI File Cleanup - Development Setup
echo =====================================

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js detected

REM Check pnpm
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing pnpm...
    npm install -g pnpm
)

echo ✅ pnpm detected

REM Install dependencies
echo.
echo 📦 Installing dependencies...
pnpm install

REM Setup environment files
echo.
echo ⚙️  Setting up environment files...

if not exist "packages\db\.env" (
    echo DATABASE_URL="postgresql://user:password@localhost:5432/ai_cleanup_dev" > packages\db\.env
    echo ✅ Created packages/db/.env
)

if not exist "services\api\.env" (
    (
        echo NODE_ENV=development
        echo PORT=8000
        echo DATABASE_URL="postgresql://user:password@localhost:5432/ai_cleanup_dev"
        echo JWT_SECRET="dev-jwt-secret-change-in-production"
        echo SESSION_SECRET="dev-session-secret-change-in-production"
        echo CORS_ORIGIN="http://localhost:3000"
        echo MODEL_WORKER_URL="http://localhost:8001"
    ) > services\api\.env
    echo ✅ Created services/api/.env
)

if not exist "apps\web\.env.local" (
    (
        echo NEXT_PUBLIC_API_URL="http://localhost:8000"
        echo SIMILARITY_THRESHOLD="0.85"
        echo MAX_FILE_SIZE="104857600"
    ) > apps\web\.env.local
    echo ✅ Created apps/web/.env.local
)

REM Generate Prisma client
echo.
echo 🔧 Generating Prisma client...
pnpm run db:generate

REM Database setup
echo.
echo 🗄️  Database setup...
echo Please ensure PostgreSQL is running and update connection strings in .env files
echo Default connection: postgresql://user:password@localhost:5432/ai_cleanup_dev
echo.
set /p migrate="Do you want to run database migrations? (y/n): "
if /i "%migrate%"=="y" (
    echo Running database migrations...
    pnpm run db:push
    if %ERRORLEVEL% NEQ 0 (
        echo ⚠️  Database migration failed. Please check your database connection.
        echo    You can run 'pnpm run db:push' later when your database is ready.
    ) else (
        set /p seed="Do you want to seed sample data? (y/n): "
        if /i "!seed!"=="y" (
            echo Seeding sample data...
            pnpm run seed
            if %ERRORLEVEL% NEQ 0 (
                echo ⚠️  Database seeding failed. You can run 'pnpm run seed' later.
            )
        )
    )
)

REM Build packages
echo.
echo 🔨 Building packages...
pnpm run build

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo    1. Update database connection strings in .env files if needed
echo    2. Start development servers:
echo       pnpm run dev              # All services
echo       pnpm run dev:api          # API only (port 8000)
echo       pnpm run dev:worker       # ML worker only (port 8001)
echo       pnpm run dev:web          # Web app only (port 3000)
echo.
echo 🌐 Development URLs:
echo    • Web App: http://localhost:3000
echo    • API Docs: http://localhost:8000/docs
echo    • ML Worker: http://localhost:8001/health
echo.
echo 🔑 Sample accounts (after seeding):
echo    • Admin: admin@ai-cleanup.com / admin123
echo    • Test:  test@ai-cleanup.com / test123
echo.
echo Happy coding! 🚀

pause