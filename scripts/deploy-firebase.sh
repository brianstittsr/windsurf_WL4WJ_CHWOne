#!/bin/bash

# Deploy Firebase Configuration for Datasets Admin Platform
# This script deploys Firestore security rules and indexes

echo "🔥 Deploying Firebase Configuration for Datasets Admin Platform"
echo "================================================================"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "   Install with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"

# Check if logged in
echo ""
echo "📋 Checking Firebase authentication..."
firebase login:list

# Deploy security rules
echo ""
echo "🔒 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Security rules deployed successfully"
else
    echo "❌ Failed to deploy security rules"
    exit 1
fi

# Deploy indexes
echo ""
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Indexes deployed successfully"
else
    echo "❌ Failed to deploy indexes"
    exit 1
fi

# Summary
echo ""
echo "================================================================"
echo "🎉 Firebase deployment complete!"
echo ""
echo "Next steps:"
echo "1. Check Firebase Console for index build status"
echo "2. Test the application locally"
echo "3. Deploy to production (Vercel/AWS/Netlify)"
echo ""
echo "Firestore Console: https://console.firebase.google.com/project/_/firestore"
echo "================================================================"
