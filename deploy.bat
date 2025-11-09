@echo off
REM Deployment Script for Hostinger (Windows)
REM This script helps prepare your application for deployment

echo 🚀 Preparing Truco Admin Panel for Hostinger Deployment...
echo.

REM Step 1: Build Frontend
echo Step 1: Building Frontend...
cd frontend
call npm run build:prod
if %errorlevel% neq 0 (
    echo ✗ Frontend build failed!
    exit /b 1
)
cd ..
echo ✓ Frontend built successfully!
echo.

REM Step 2: Check environment files
echo Step 2: Checking environment files...
if not exist "backend\.env" (
    echo ✗ backend\.env file not found!
    echo Please create backend\.env file with your production configuration.
    exit /b 1
) else (
    echo ✓ backend\.env file exists
)

if not exist "frontend\.env.production" (
    echo ⚠ frontend\.env.production file not found
    echo Creating .env.production from template...
    copy frontend\env.production.example frontend\.env.production
    echo Please update frontend\.env.production with your API URL
)
echo.

REM Step 3: Check Node.js version
echo Step 3: Checking Node.js version...
for /f "tokens=*" %%i in ('node -v') do set node_version=%%i
echo ✓ Node.js version: %node_version%
echo.

REM Step 4: Create deployment package info
echo Step 4: Deployment package ready!
echo.
echo Files ready for deployment:
echo   - frontend\dist\ folder (frontend)
echo   - backend\ folder (backend)
echo.
echo Next steps:
echo 1. Upload frontend\dist\ folder contents to public_html\
echo 2. Upload backend\ folder to your server
echo 3. Install backend dependencies: cd backend ^&^& npm install --production
echo 4. Setup Node.js app in Hostinger hPanel
echo 5. Configure environment variables
echo 6. Start the backend server
echo.

pause

