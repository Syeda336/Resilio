#!/bin/bash

# 🚀 Resilio Edge Function Deployment Script
# This script deploys the make-server-40d4d8fd edge function to Supabase

echo "🚀 Starting Resilio Edge Function Deployment..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Please install it first:"
    echo "  Mac/Linux: brew install supabase/tap/supabase"
    echo "  Windows: scoop install supabase"
    echo ""
    echo "Or follow this guide: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
echo "Checking Supabase login status..."
if ! supabase projects list &> /dev/null
then
    echo "❌ Not logged in to Supabase"
    echo ""
    echo "Logging you in..."
    supabase login
    
    if [ $? -ne 0 ]; then
        echo "❌ Login failed"
        exit 1
    fi
fi

echo "✅ Logged in to Supabase"
echo ""

# Check if project is linked
echo "Checking project link..."
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Project not linked yet"
    echo "Linking to project: wuzbuxeqqubolujjtizc"
    supabase link --project-ref wuzbuxeqqubolujjtizc
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to link project"
        exit 1
    fi
fi

echo "✅ Project linked"
echo ""

# Deploy the function
echo "📦 Deploying make-server-40d4d8fd edge function..."
echo ""
supabase functions deploy make-server-40d4d8fd

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ====================================="
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "🎉 ====================================="
    echo ""
    echo "✅ Edge function deployed: make-server-40d4d8fd"
    echo ""
    echo "🧪 Test it with:"
    echo "   curl https://wuzbuxeqqubolujjtizc.supabase.co/functions/v1/make-server-40d4d8fd/health"
    echo ""
    echo "📊 View logs:"
    echo "   https://supabase.com/dashboard/project/wuzbuxeqqubolujjtizc/functions"
    echo ""
    echo "📧 Don't forget to:"
    echo "   1. Set up Gmail App Password (see GMAIL_APP_PASSWORD_GUIDE.md)"
    echo "   2. Configure SMTP secrets in Supabase Dashboard"
    echo "   3. Test email functionality in your app"
    echo ""
else
    echo ""
    echo "❌ ====================================="
    echo "❌ DEPLOYMENT FAILED!"
    echo "❌ ====================================="
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if files exist: ls -la supabase/functions/make-server-40d4d8fd/"
    echo "  2. Check if server files exist: ls -la supabase/functions/server/"
    echo "  3. Re-login: supabase logout && supabase login"
    echo "  4. Re-link: supabase link --project-ref wuzbuxeqqubolujjtizc"
    echo "  5. Try manual deploy via Supabase Dashboard"
    echo ""
    echo "See EASY_DEPLOY_GUIDE.md for more help"
    echo ""
    exit 1
fi
