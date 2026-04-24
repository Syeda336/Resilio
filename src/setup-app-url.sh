#!/bin/bash

# Resilio - APP_URL Setup Script
# This script helps you set the APP_URL environment variable for password reset functionality

echo "======================================"
echo "   Resilio - APP_URL Setup Script    "
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Detect current environment
echo ""
print_info "Detecting environment..."
echo ""

# Check if we're in local development
if [ -f "package.json" ]; then
    print_success "Found package.json - Local development environment"
    
    # Ask user for app URL
    echo ""
    echo "Please select your environment:"
    echo "  1) Local Development (http://localhost:5173)"
    echo "  2) Local Development (http://localhost:3000)"
    echo "  3) Custom URL"
    echo ""
    read -p "Enter choice [1-3]: " choice
    
    case $choice in
        1)
            APP_URL="http://localhost:5173"
            ;;
        2)
            APP_URL="http://localhost:3000"
            ;;
        3)
            read -p "Enter your app URL (e.g., https://myapp.vercel.app): " APP_URL
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    # Validate URL format
    if [[ ! $APP_URL =~ ^https?:// ]]; then
        print_error "URL must start with http:// or https://"
        exit 1
    fi
    
    # Remove trailing slash if present
    APP_URL="${APP_URL%/}"
    
    print_success "APP_URL set to: $APP_URL"
    
    # Export to current shell
    export APP_URL="$APP_URL"
    print_success "Exported to current shell session"
    
    # Offer to add to .env file
    echo ""
    read -p "Add to .env file? [y/N]: " add_to_env
    
    if [[ $add_to_env =~ ^[Yy]$ ]]; then
        # Create or update .env file
        if [ -f ".env" ]; then
            # Check if APP_URL already exists
            if grep -q "^APP_URL=" .env; then
                # Update existing
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    # macOS
                    sed -i '' "s|^APP_URL=.*|APP_URL=$APP_URL|" .env
                else
                    # Linux
                    sed -i "s|^APP_URL=.*|APP_URL=$APP_URL|" .env
                fi
                print_success "Updated APP_URL in .env file"
            else
                # Add new
                echo "APP_URL=$APP_URL" >> .env
                print_success "Added APP_URL to .env file"
            fi
        else
            # Create new .env file
            echo "APP_URL=$APP_URL" > .env
            print_success "Created .env file with APP_URL"
        fi
        
        # Add .env to .gitignore if not already there
        if [ -f ".gitignore" ]; then
            if ! grep -q "^\.env$" .gitignore; then
                echo ".env" >> .gitignore
                print_success "Added .env to .gitignore"
            fi
        else
            echo ".env" > .gitignore
            print_success "Created .gitignore with .env"
        fi
    fi
    
    echo ""
    print_info "Next steps for LOCAL DEVELOPMENT:"
    echo ""
    echo "1. Make sure to run this in your current terminal:"
    echo "   ${GREEN}export APP_URL=\"$APP_URL\"${NC}"
    echo ""
    echo "2. Or reload your .env file:"
    echo "   ${GREEN}source .env${NC}"
    echo ""
    
else
    print_warning "Not in a local development environment"
fi

# Production setup instructions
echo ""
echo "======================================"
print_info "For PRODUCTION deployment:"
echo "======================================"
echo ""
echo "Set APP_URL in Supabase Dashboard:"
echo ""
echo "1. Open Supabase Dashboard"
echo "2. Go to: Project Settings → Edge Functions"
echo "3. Scroll to: Environment Variables"
echo "4. Click: Add New Variable"
echo "5. Enter:"
echo "   Name:  ${GREEN}APP_URL${NC}"
echo "   Value: ${GREEN}https://your-deployed-app.com${NC}"
echo "6. Click: Save"
echo "7. Redeploy Edge Function:"
echo "   ${GREEN}supabase functions deploy make-server-40d4d8fd${NC}"
echo ""

# Test instructions
echo "======================================"
print_info "Testing:"
echo "======================================"
echo ""
echo "1. Open the test page:"
echo "   ${GREEN}open test-password-reset.html${NC}"
echo ""
echo "2. Or test from terminal:"
echo "   ${GREEN}curl -X POST \\${NC}"
echo "   ${GREEN}  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/auth/reset-password \\${NC}"
echo "   ${GREEN}  -H \"Content-Type: application/json\" \\${NC}"
echo "   ${GREEN}  -H \"Authorization: Bearer YOUR_ANON_KEY\" \\${NC}"
echo "   ${GREEN}  -d '{\"email\":\"test@example.com\"}'${NC}"
echo ""

# Final summary
echo "======================================"
print_success "Setup Complete!"
echo "======================================"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide:        PASSWORD_RESET_SETUP.md"
echo "   - Quick Fix:          PASSWORD_RESET_QUICK_FIX.md"
echo "   - Summary:            PASSWORD_RESET_COMPLETE.md"
echo ""
echo "🧪 Testing:"
echo "   - Test Page:          test-password-reset.html"
echo ""
print_success "Password reset feature is ready to use!"
echo ""
