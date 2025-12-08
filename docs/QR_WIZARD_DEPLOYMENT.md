# QR Wizard Deployment Guide

## 🚀 Production Deployment Checklist

This guide covers deploying the QR Code Participant Tracking Wizard to production.

---

## Pre-Deployment Requirements

### ✅ Code Quality
- [x] All 8 steps implemented
- [x] TypeScript types aligned
- [x] Auto-save functionality working
- [x] AI integration complete
- [ ] All tests passing
- [ ] No console errors
- [ ] Code reviewed

### ✅ Environment Setup
- [ ] Production Firebase project created
- [ ] OpenAI API key obtained
- [ ] Environment variables configured
- [ ] Domain configured (if applicable)
- [ ] SSL certificate installed

### ✅ Security
- [ ] Firebase security rules configured
- [ ] API keys secured (not in client code)
- [ ] CORS policies set
- [ ] Rate limiting configured
- [ ] User authentication enabled

---

## Environment Variables

### Required Variables

Create `.env.production` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Security Notes
- ⚠️ Never commit `.env.production` to git
- ⚠️ Use environment variable management (Vercel, AWS Secrets Manager, etc.)
- ⚠️ Rotate API keys regularly
- ⚠️ Use different Firebase projects for dev/staging/prod

---

## Firebase Configuration

### 1. Create Production Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init
```

### 2. Configure Firestore Security Rules

Create `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // QR Tracking Wizards
    match /qrTrackingWizards/{wizardId} {
      // Users can only read/write their own wizards
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.createdBy;
      
      // Allow creation if authenticated
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.createdBy;
    }
    
    // Participants
    match /qrParticipants/{participantId} {
      allow read, write: if request.auth != null;
    }
    
    // Sessions
    match /qrSessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
    
    // Attendance
    match /qrAttendance/{attendanceId} {
      allow read, write: if request.auth != null;
    }
    
    // Feedback
    match /qrFeedback/{feedbackId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### 3. Configure Firestore Indexes

Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "qrTrackingWizards",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "qrParticipants",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "wizardId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Step 3: Configure Environment Variables
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from `.env.production`
5. Redeploy

#### Step 4: Configure Domain
1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records
4. Wait for SSL certificate

### Option 2: AWS Amplify

#### Step 1: Install Amplify CLI
```bash
npm install -g @aws-amplify/cli
amplify configure
```

#### Step 2: Initialize Amplify
```bash
amplify init
amplify add hosting
```

#### Step 3: Deploy
```bash
amplify publish
```

### Option 3: Netlify

#### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Deploy
```bash
# Build the project
npm run build

# Deploy
netlify deploy --prod
```

### Option 4: Docker + Self-Hosted

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Build and Run
```bash
# Build image
docker build -t qr-wizard .

# Run container
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY \
  qr-wizard
```

---

## Post-Deployment Configuration

### 1. Configure OpenAI Rate Limits

Set up rate limiting in your API route:

```typescript
// src/app/api/ai/analyze-qr-wizard/route.ts

// Add rate limiting
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};
```

### 2. Set Up Monitoring

#### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
```

Configure `sentry.config.js`:
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 3. Configure Backup Strategy

#### Firestore Backups
```bash
# Schedule daily backups
gcloud firestore export gs://your-backup-bucket
```

#### Automated Backups Script
```javascript
// scripts/backup-firestore.js
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

async function backupFirestore() {
  const bucket = 'your-backup-bucket';
  const timestamp = new Date().toISOString();
  
  await admin.firestore().export({
    outputUriPrefix: `gs://${bucket}/backups/${timestamp}`,
    collectionIds: [
      'qrTrackingWizards',
      'qrParticipants',
      'qrSessions'
    ]
  });
}

backupFirestore();
```

---

## Performance Optimization

### 1. Enable Caching

Add to `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/qr-tracking-wizard',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};
```

### 2. Optimize Bundle Size

```bash
# Analyze bundle
npm run build
npm run analyze

# Check for large dependencies
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

### 3. Enable Compression

Vercel/Netlify handle this automatically. For self-hosted:

```javascript
// server.js
const compression = require('compression');
app.use(compression());
```

---

## Security Hardening

### 1. Content Security Policy

Add to `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://firestore.googleapis.com https://api.openai.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 2. API Route Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('auth-token');
  
  if (!token && request.nextUrl.pathname.startsWith('/qr-tracking-wizard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

### 3. Rate Limiting

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

const rateLimit = new LRUCache({
  max: 500,
  ttl: 60000, // 1 minute
});

export function checkRateLimit(ip: string): boolean {
  const tokenCount = (rateLimit.get(ip) as number) || 0;
  
  if (tokenCount > 100) {
    return false;
  }
  
  rateLimit.set(ip, tokenCount + 1);
  return true;
}
```

---

## Monitoring & Alerts

### 1. Set Up Health Checks

Create `/api/health/route.ts`:
```typescript
export async function GET() {
  // Check Firebase connection
  // Check OpenAI API
  // Check critical services
  
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      firebase: 'up',
      openai: 'up'
    }
  });
}
```

### 2. Configure Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

Monitor:
- `/api/health`
- `/qr-tracking-wizard`
- Response times
- Error rates

### 3. Set Up Alerts

Configure alerts for:
- API errors > 5% in 5 minutes
- Response time > 3 seconds
- OpenAI API failures
- Firebase connection issues
- High memory usage

---

## Rollback Plan

### Quick Rollback (Vercel)
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Database Rollback
```bash
# Restore from backup
gcloud firestore import gs://your-backup-bucket/backups/[timestamp]
```

---

## Launch Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Performance optimized
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Documentation complete
- [ ] Team trained

### Launch Day
- [ ] Deploy to production
- [ ] Verify all features work
- [ ] Test AI integration
- [ ] Check analytics
- [ ] Monitor error rates
- [ ] Verify backups running

### Post-Launch (Week 1)
- [ ] Monitor daily active users
- [ ] Check error logs
- [ ] Review performance metrics
- [ ] Gather user feedback
- [ ] Address critical issues
- [ ] Plan improvements

---

## Maintenance Schedule

### Daily
- Check error logs
- Monitor uptime
- Review user feedback

### Weekly
- Review analytics
- Check performance metrics
- Update dependencies
- Test backups

### Monthly
- Security audit
- Performance optimization
- Feature updates
- User training

---

## Support & Troubleshooting

### Common Issues

#### Issue: AI Requests Failing
**Solution**: Check OpenAI API key and rate limits

#### Issue: Firebase Connection Errors
**Solution**: Verify security rules and network connectivity

#### Issue: Slow Performance
**Solution**: Check bundle size and enable caching

#### Issue: Data Not Saving
**Solution**: Verify Firebase permissions and auto-save functionality

---

## Success Metrics

Track these KPIs:
- **User Adoption**: Number of wizards created
- **Completion Rate**: % of wizards completed
- **AI Usage**: AI recommendation requests
- **Performance**: Average page load time
- **Errors**: Error rate < 1%
- **Uptime**: Target 99.9%

---

## 🎉 Deployment Complete!

Your QR Code Participant Tracking Wizard is now live in production!

### Next Steps
1. Monitor initial usage
2. Gather user feedback
3. Plan feature enhancements
4. Scale as needed

---

**Questions or Issues?**
- Check logs in your deployment platform
- Review Firebase console
- Monitor OpenAI usage
- Contact support team

---

*Last Updated: November 30, 2025*
