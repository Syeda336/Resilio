@echo off
setlocal enabledelayedexpansion

REM Resilio - APP_URL Setup Script for Windows
REM This script helps you set the APP_URL environment variable

echo ======================================
echo    Resilio - APP_URL Setup Script    
echo ======================================
echo.

REM Check if we're in a project directory
if not exist "package.json" (
    echo [WARNING] package.json not found
    echo This doesn't look like a project directory
    echo.
)

echo Please select your environment:
echo   1. Local Development (http://localhost:5173)
echo   2. Local Development (http://localhost:3000)
echo   3. Custom URL
echo.

set /p choice="Enter choice [1-3]: "

if "%choice%"=="1" (
    set APP_URL=http://localhost:5173
) else if "%choice%"=="2" (
    set APP_URL=http://localhost:3000
) else if "%choice%"=="3" (
    set /p APP_URL="Enter your app URL (e.g., https://myapp.vercel.app): "
) else (
    echo [ERROR] Invalid choice
    pause
    exit /b 1
)

REM Validate URL format
echo !APP_URL! | findstr /R "^https\?://" >nul
if errorlevel 1 (
    echo [ERROR] URL must start with http:// or https://
    pause
    exit /b 1
)

REM Remove trailing slash if present
if "!APP_URL:~-1!"=="/" (
    set APP_URL=!APP_URL:~0,-1!
)

echo.
echo [SUCCESS] APP_URL set to: !APP_URL!
echo.

REM Ask to add to .env file
set /p add_env="Add to .env file? [y/N]: "

if /i "%add_env%"=="y" (
    REM Check if .env exists
    if exist ".env" (
        REM Check if APP_URL already exists in .env
        findstr /B "APP_URL=" .env >nul
        if errorlevel 1 (
            REM Add new entry
            echo APP_URL=!APP_URL!>> .env
            echo [SUCCESS] Added APP_URL to .env file
        ) else (
            REM Update existing entry (manual step required)
            echo [INFO] APP_URL already exists in .env
            echo Please update it manually to: APP_URL=!APP_URL!
        )
    ) else (
        REM Create new .env file
        echo APP_URL=!APP_URL!> .env
        echo [SUCCESS] Created .env file with APP_URL
    )
    
    REM Add .env to .gitignore if not already there
    if exist ".gitignore" (
        findstr /B ".env" .gitignore >nul
        if errorlevel 1 (
            echo .env>> .gitignore
            echo [SUCCESS] Added .env to .gitignore
        )
    ) else (
        echo .env> .gitignore
        echo [SUCCESS] Created .gitignore with .env
    )
)

echo.
echo ======================================
echo [INFO] Next steps for LOCAL DEVELOPMENT:
echo ======================================
echo.
echo 1. Set environment variable for current session:
echo    set APP_URL=!APP_URL!
echo.
echo 2. Or restart your terminal to load .env file
echo.

echo ======================================
echo [INFO] For PRODUCTION deployment:
echo ======================================
echo.
echo Set APP_URL in Supabase Dashboard:
echo.
echo 1. Open Supabase Dashboard
echo 2. Go to: Project Settings -^> Edge Functions
echo 3. Scroll to: Environment Variables
echo 4. Click: Add New Variable
echo 5. Enter:
echo    Name:  APP_URL
echo    Value: https://your-deployed-app.com
echo 6. Click: Save
echo 7. Redeploy Edge Function:
echo    supabase functions deploy make-server-40d4d8fd
echo.

echo ======================================
echo [INFO] Testing:
echo ======================================
echo.
echo 1. Open the test page:
echo    start test-password-reset.html
echo.
echo 2. Or use browser to open your app:
echo    start !APP_URL!
echo.

echo ======================================
echo [SUCCESS] Setup Complete!
echo ======================================
echo.
echo Documentation:
echo    - Setup Guide:        PASSWORD_RESET_SETUP.md
echo    - Quick Fix:          PASSWORD_RESET_QUICK_FIX.md
echo    - Summary:            PASSWORD_RESET_COMPLETE.md
echo.
echo Testing:
echo    - Test Page:          test-password-reset.html
echo.
echo [SUCCESS] Password reset feature is ready to use!
echo.

pause
