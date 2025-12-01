# Deploy Firebase Configuration for Datasets Admin Platform
# PowerShell script for Windows

Write-Host "🔥 Deploying Firebase Configuration for Datasets Admin Platform" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# Check if Firebase CLI is installed
$firebaseCmd = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseCmd) {
    Write-Host "❌ Firebase CLI not found!" -ForegroundColor Red
    Write-Host "   Install with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Firebase CLI found" -ForegroundColor Green

# Check if logged in
Write-Host ""
Write-Host "📋 Checking Firebase authentication..." -ForegroundColor Cyan
firebase login:list

# Deploy security rules
Write-Host ""
Write-Host "🔒 Deploying Firestore security rules..." -ForegroundColor Cyan
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Security rules deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy security rules" -ForegroundColor Red
    exit 1
}

# Deploy indexes
Write-Host ""
Write-Host "📊 Deploying Firestore indexes..." -ForegroundColor Cyan
firebase deploy --only firestore:indexes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Indexes deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy indexes" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🎉 Firebase deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check Firebase Console for index build status"
Write-Host "2. Test the application locally"
Write-Host "3. Deploy to production (Vercel/AWS/Netlify)"
Write-Host ""
Write-Host "Firestore Console: https://console.firebase.google.com/project/_/firestore" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
