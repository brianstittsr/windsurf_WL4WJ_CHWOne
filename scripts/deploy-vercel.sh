#!/bin/bash

# Deploy to Vercel
# This script deploys the Datasets Admin Platform to Vercel

echo "🚀 Deploying Datasets Admin Platform to Vercel"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "   Install with: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"

# Check if logged in
echo ""
echo "📋 Checking Vercel authentication..."
vercel whoami

if [ $? -ne 0 ]; then
    echo "⚠️  Not logged in. Logging in..."
    vercel login
fi

# Build check
echo ""
echo "🔨 Running build check..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

echo "✅ Build successful"

# Deploy
echo ""
echo "🚀 Deploying to Vercel..."
echo ""
read -p "Deploy to production? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
else
    echo "Deploying to preview..."
    vercel
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "=============================================="
    echo "🎉 Deployment successful!"
    echo ""
    echo "Next steps:"
    echo "1. Test the deployed application"
    echo "2. Check Vercel dashboard for deployment details"
    echo "3. Configure custom domain (if needed)"
    echo ""
    echo "Vercel Dashboard: https://vercel.com/dashboard"
    echo "=============================================="
else
    echo "❌ Deployment failed"
    exit 1
fi
