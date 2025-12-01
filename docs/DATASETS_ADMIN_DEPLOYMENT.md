# Datasets Admin Platform - Deployment & Testing Guide

## 🚀 Deployment Guide

### Prerequisites

- Node.js 18+ installed
- Firebase project configured
- Environment variables set
- Git repository

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

Create `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: OpenAI (for future AI features)
OPENAI_API_KEY=sk-...

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-...
```

### 2. Firebase Setup

#### Firestore Collections

Create these collections in Firebase:
- `datasets`
- `datasetRecords`
- `datasetApiKeys`
- `datasetAuditLogs`
- `datasetExports`
- `datasetImports`

#### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Datasets
    match /datasets/{datasetId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid in resource.data.permissions.owners ||
         request.auth.uid in resource.data.permissions.editors);
      allow delete: if request.auth != null && 
        request.auth.uid in resource.data.permissions.owners;
    }
    
    // Dataset Records
    match /datasetRecords/{recordId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Audit Logs (read-only)
    match /datasetAuditLogs/{logId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can write
    }
  }
}
```

### 3. Build & Test Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test the application
# Navigate to http://localhost:3000/datasets

# Build for production
npm run build

# Test production build
npm start
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Steps**:
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase_api_key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@firebase_auth_domain",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "@firebase_project_id"
  }
}
```

---

### Option 2: AWS Amplify

**Steps**:
1. Connect GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

**Build Settings**:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

### Option 3: Netlify

**Steps**:
1. Connect repository
2. Configure build command
3. Set environment variables
4. Deploy

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

### Option 4: Docker

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Build & Run**:
```bash
# Build image
docker build -t datasets-admin .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=your_key \
  datasets-admin
```

---

## 🧪 Testing Guide

### Manual Testing

#### 1. Dashboard Testing
- [ ] View statistics cards
- [ ] See top datasets
- [ ] Search datasets
- [ ] Navigate tabs
- [ ] Click refresh button

#### 2. Dataset List Testing
- [ ] View all datasets in grid
- [ ] Click dataset card
- [ ] Use context menu
- [ ] Search datasets
- [ ] Filter by status

#### 3. Create Dataset Testing
- [ ] Open create dialog
- [ ] Fill basic info (Step 1)
- [ ] Add tags
- [ ] Build schema (Step 2)
- [ ] Add multiple fields
- [ ] Configure settings (Step 3)
- [ ] Save dataset
- [ ] Verify in list

#### 4. Dataset Detail Testing
- [ ] View dataset header
- [ ] Check breadcrumbs
- [ ] Test all 6 tabs
- [ ] Use action buttons

#### 5. Data Tab Testing
- [ ] View records table
- [ ] Add new record
- [ ] Edit existing record
- [ ] Delete record
- [ ] Bulk select & delete
- [ ] Search records
- [ ] Test pagination

#### 6. Schema Tab Testing
- [ ] View field list
- [ ] Add new field
- [ ] Edit field properties
- [ ] Delete field
- [ ] Verify validation

#### 7. Analytics Tab Testing
- [ ] View overview cards
- [ ] Check dataset info
- [ ] See schema stats
- [ ] View field distribution

#### 8. Settings Tab Testing
- [ ] Toggle validation settings
- [ ] Change access control
- [ ] Configure notifications
- [ ] Set data retention
- [ ] Save changes

#### 9. Activity Tab Testing
- [ ] View activity list
- [ ] Check timestamps
- [ ] Verify action types

#### 10. API Tab Testing
- [ ] Copy endpoint
- [ ] View API keys
- [ ] Read documentation
- [ ] Copy code examples

---

### API Testing

#### Using cURL

```bash
# Test list datasets
curl http://localhost:3000/api/datasets

# Test create dataset
curl -X POST http://localhost:3000/api/datasets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Dataset",
    "sourceApplication": "Test",
    "organizationId": "test_org"
  }'

# Test create record
curl -X POST http://localhost:3000/api/datasets/DATASET_ID/records \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "field1": "value1"
    }
  }'
```

#### Using Postman

1. Import collection (create one)
2. Set base URL: `http://localhost:3000/api`
3. Test all endpoints
4. Verify responses

---

### Automated Testing (Future)

#### Unit Tests

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

**Example Test** (`__tests__/DatasetService.test.ts`):
```typescript
import { datasetService } from '@/services/DatasetService';

describe('DatasetService', () => {
  it('should create a dataset', async () => {
    const dataset = await datasetService.createDataset({
      name: 'Test',
      sourceApplication: 'Test',
      organizationId: 'test'
    }, 'user_123');
    
    expect(dataset.id).toBeDefined();
    expect(dataset.name).toBe('Test');
  });
});
```

#### E2E Tests

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Run E2E tests
npx playwright test
```

**Example Test** (`e2e/datasets.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test('create dataset flow', async ({ page }) => {
  await page.goto('/datasets');
  await page.click('text=New Dataset');
  await page.fill('[name="name"]', 'Test Dataset');
  await page.click('text=Next');
  // ... continue flow
  await page.click('text=Create Dataset');
  await expect(page.locator('text=Test Dataset')).toBeVisible();
});
```

---

## 📊 Performance Optimization

### 1. Database Indexes

Create indexes in Firestore:
- `datasets`: `organizationId`, `status`, `createdAt`
- `datasetRecords`: `datasetId`, `status`, `createdAt`

### 2. Caching

Implement caching for:
- Dataset list
- Statistics
- Analytics data

### 3. Pagination

- Use cursor-based pagination for large datasets
- Limit page sizes (25-100 records)
- Implement virtual scrolling for tables

### 4. Code Splitting

```typescript
// Lazy load components
const DataTab = dynamic(() => import('./tabs/DataTab'));
const SchemaTab = dynamic(() => import('./tabs/SchemaTab'));
```

---

## 🔒 Security Hardening

### 1. Authentication

```typescript
// Add to API routes
import { getAuth } from 'firebase-admin/auth';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    // ... continue
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

### 2. Rate Limiting

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const max = 100; // 100 requests per minute
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  
  const requests = rateLimit.get(ip).filter((time: number) => now - time < windowMs);
  
  if (requests.length >= max) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  requests.push(now);
  rateLimit.set(ip, requests);
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
```

### 3. Input Validation

```typescript
import { z } from 'zod';

const createDatasetSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  sourceApplication: z.string().min(1),
  organizationId: z.string().min(1)
});

// In API route
const validation = createDatasetSchema.safeParse(body);
if (!validation.success) {
  return NextResponse.json(
    { error: 'Validation failed', details: validation.error },
    { status: 400 }
  );
}
```

---

## 📈 Monitoring & Logging

### 1. Error Tracking

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize in next.config.js
```

### 2. Analytics

```typescript
// Track events
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

logEvent(analytics, 'dataset_created', {
  datasetId: dataset.id,
  source: dataset.sourceApplication
});
```

### 3. Logging

```typescript
// Structured logging
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  message: 'Dataset created',
  datasetId: dataset.id,
  userId: userId
}));
```

---

## 🔄 Backup & Recovery

### 1. Firestore Backups

```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/backups/$(date +%Y%m%d)

# Import Firestore data
gcloud firestore import gs://your-bucket/backups/20251130
```

### 2. Automated Backups

Set up Cloud Scheduler to run daily backups

### 3. Recovery Plan

1. Identify issue
2. Stop writes
3. Restore from backup
4. Verify data integrity
5. Resume operations

---

## ✅ Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Firebase security rules deployed
- [ ] SSL certificate configured
- [ ] Domain configured
- [ ] Authentication working
- [ ] API endpoints responding
- [ ] Database accessible
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Error tracking active
- [ ] Performance acceptable
- [ ] Security audit passed

---

## 📞 Support & Maintenance

### Regular Maintenance

**Weekly**:
- Check error logs
- Review performance metrics
- Monitor storage usage

**Monthly**:
- Update dependencies
- Review security
- Optimize queries
- Clean old data

**Quarterly**:
- Security audit
- Performance review
- Feature planning
- User feedback

---

## 🎉 You're Ready!

Your Datasets Admin Platform is ready for deployment!

**Next Steps**:
1. Complete pre-deployment checklist
2. Choose deployment platform
3. Configure environment
4. Deploy application
5. Run tests
6. Monitor performance
7. Gather feedback

---

*Last Updated: November 30, 2025*  
*Version: 1.0*
