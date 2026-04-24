@echo off
REM 🚀 Resilio Edge Function Deployment Script (Windows)
REM This script deploys the make-server-40d4d8fd edge function to Supabase

echo 🚀 Starting Resilio Edge Function Deployment...
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Supabase CLI not found!
    echo.
    echo Please install it first:
    echo   Windows: scoop install supabase
    echo   Or download from: https://supabase.com/docs/guides/cli
    echo.
    pause
    exit /b 1
)

echo ✅ Supabase CLI found
echo.

REM Check if logged in
echo Checking Supabase login status...
supabase projects list >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Not logged in to Supabase
    echo.
    echo Logging you in...
    supabase login
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Login failed
        pause
        exit /b 1
    )
)

echo ✅ Logged in to Supabase
echo.

REM Check if project is linked
echo Checking project link...
if not exist ".supabase\config.toml" (
    echo ⚠️  Project not linked yet
    echo Linking to project: wuzbuxeqqubolujjtizc
    supabase link --project-ref wuzbuxeqqubolujjtizc
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to link project
        pause
        exit /b 1
    )
)

echo ✅ Project linked
echo.

REM Deploy the function
echo 📦 Deploying make-server-40d4d8fd edge function...
echo.
supabase functions deploy make-server-40d4d8fd

if %ERRORLEVEL% EQU 0 (
    echo.
    echo 🎉 =====================================
    echo 🎉 DEPLOYMENT SUCCESSFUL!
    echo 🎉 =====================================
    echo.
    echo ✅ Edge function deployed: make-server-40d4d8fd
    echo.
    echo 🧪 Test it with:
    echo    curl https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/health
    echo.
    echo 📊 View logs:
    echo    https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/functions
    echo.
    echo 📧 Don't forget to:
    echo    1. Set up Gmail App Password (see GMAIL_APP_PASSWORD_GUIDE.md)
    echo    2. Configure SMTP secrets in Supabase Dashboard
    echo    3. Test email functionality in your app
    echo.
) else (
    echo.
    echo ❌ =====================================
    echo ❌ DEPLOYMENT FAILED!
    echo ❌ =====================================
    echo.
    echo Troubleshooting:
    echo   1. Check if files exist: dir supabase\functions\make-server-40d4d8fd\
    echo   2. Check if server files exist: dir supabase\functions\server\
    echo   3. Re-login: supabase logout && supabase login
    echo   4. Re-link: supabase link --project-ref wuzbuxeqqubolujjtizc
    echo   5. Try manual deploy via Supabase Dashboard
    echo.
    echo See EASY_DEPLOY_GUIDE.md for more help
    echo.
    pause
    exit /b 1
)

pause
