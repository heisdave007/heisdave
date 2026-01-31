@echo off
REM Vercel Deployment Quick Start Script
REM This script helps you prepare and deploy to Vercel

echo.
echo ========================================
echo   Vercel Deployment Quick Start
echo ========================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Checking prerequisites...
echo ✓ Git: %git_version%
echo ✓ Node.js: %node_version%
echo ✓ npm: %npm_version%
echo.

REM Check current directory
if not exist "vercel.json" (
    echo Error: vercel.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo Current directory: %cd%
echo ✓ Project files verified
echo.

REM Display menu
:menu
echo ========================================
echo   Choose deployment method:
echo ========================================
echo 1. Deploy with Vercel CLI
echo 2. Prepare for GitHub deployment
echo 3. View deployment guide
echo 4. Check configuration
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto vercel_cli
if "%choice%"=="2" goto github_prep
if "%choice%"=="3" goto view_guide
if "%choice%"=="4" goto check_config
if "%choice%"=="5" goto end
echo Invalid choice
goto menu

:vercel_cli
echo.
echo ========================================
echo   Installing Vercel CLI...
echo ========================================
npm install -g vercel
if %errorlevel% neq 0 (
    echo Error: Failed to install Vercel CLI
    pause
    goto menu
)

echo.
echo ✓ Vercel CLI installed successfully
echo.
echo Next steps:
echo 1. Login to Vercel: vercel login
echo 2. Deploy: vercel --prod
echo.
pause
goto menu

:github_prep
echo.
echo ========================================
echo   Preparing for GitHub deployment...
echo ========================================
echo.
echo Checking Git status...
git status

echo.
echo Git configuration check:
git config user.name
git config user.email

echo.
echo Next steps:
echo 1. Run: git add .
echo 2. Run: git commit -m "Configure for Vercel deployment"
echo 3. Run: git push origin main
echo 4. Go to https://vercel.com/new and select your GitHub repo
echo 5. Add environment variables in Vercel dashboard
echo 6. Deploy!
echo.
pause
goto menu

:view_guide
echo.
echo ========================================
echo   Deployment Guides Available:
echo ========================================
echo.
echo 1. VERCEL_DEPLOYMENT_GUIDE.md
echo 2. VERCEL_READY_CHECKLIST.md
echo 3. ENV_VARIABLES_TEMPLATE.md
echo.
set /p guide="Enter guide number (1-3): "

if "%guide%"=="1" start notepad "VERCEL_DEPLOYMENT_GUIDE.md"
if "%guide%"=="2" start notepad "VERCEL_READY_CHECKLIST.md"
if "%guide%"=="3" start notepad "ENV_VARIABLES_TEMPLATE.md"

goto menu

:check_config
echo.
echo ========================================
echo   Configuration Check
echo ========================================
echo.

echo Checking Node version:
node --version

echo Checking npm version:
npm --version

echo.
echo Checking dependencies...
npm list --depth=0

echo.
echo Checking configuration files:
if exist "vercel.json" (
    echo ✓ vercel.json exists
) else (
    echo ✗ vercel.json missing
)

if exist ".vercelignore" (
    echo ✓ .vercelignore exists
) else (
    echo ✗ .vercelignore missing
)

if exist "package.json" (
    echo ✓ package.json exists
) else (
    echo ✗ package.json missing
)

if exist "index.js" (
    echo ✓ index.js exists
) else (
    echo ✗ index.js missing
)

echo.
echo Validating vercel.json...
node -e "try { require('./vercel.json'); console.log('✓ vercel.json is valid JSON'); } catch(e) { console.log('✗ vercel.json has errors:', e.message); }"

echo.
pause
goto menu

:end
echo.
echo ========================================
echo   Goodbye!
echo ========================================
echo.
echo Remember:
echo 1. Set environment variables in Vercel dashboard
echo 2. Whitelist MongoDB IP in Atlas (0.0.0.0/0)
echo 3. Configure Stripe webhooks
echo 4. Test deployment before going live
echo.
exit /b 0
