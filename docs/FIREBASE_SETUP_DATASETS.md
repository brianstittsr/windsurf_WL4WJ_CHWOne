# Firebase Setup for Datasets Admin Platform

## 🔥 Firebase Configuration Guide

**Date**: November 30, 2025  
**Status**: Ready to Deploy

---

## ✅ Task 1.1: Create Firestore Collections

### Required Collections

The following collections will be created automatically when you first use the platform, but you can pre-create them:

1. **`datasets`** - Main dataset definitions
2. **`datasetRecords`** - All records across datasets
3. **`datasetApiKeys`** - API keys for external access
4. **`datasetAuditLogs`** - Audit trail for compliance
5. **`datasetExports`** - Export job tracking
6. **`datasetImports`** - Import job tracking

### How to Create Collections

#### Option 1: Automatic (Recommended)
Collections will be created automatically when you:
- Create your first dataset
- Add your first record
- Generate your first API key

#### Option 2: Manual (Firebase Console)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Click **Start collection**
5. Create each collection with a dummy document
6. Delete the dummy document after creation

---

## ✅ Task 1.2: Deploy Security Rules

### Security Rules Status
✅ **COMPLETED** - Rules added to `firestore.rules`

### What Was Added
- Dataset permissions (owners, editors, viewers)
- Record access control
- API key management rules
- Audit log protection (immutable)
- Organization-based access
- Public access support

### Deploy Rules

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy security rules
firebase deploy --only firestore:rules

# Verify deployment
firebase firestore:rules:list
```

### Test Security Rules

```bash
# Test rules locally
firebase emulators:start --only firestore

# Run security rules tests
npm run test:firestore
```

---

## ✅ Task 1.3: Deploy Firestore Indexes

### Indexes Status
✅ **COMPLETED** - Indexes added to `firestore.indexes.json`

### What Was Added
- Dataset queries (by org, status, date)
- Record queries (by dataset, status, date)
- Audit log queries (by dataset, action, timestamp)
- Source application queries

### Deploy Indexes

```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Check index status
firebase firestore:indexes

# Monitor index building
# (Go to Firebase Console > Firestore > Indexes)
```

### Index Build Time
- Small datasets: 1-2 minutes
- Medium datasets: 5-10 minutes
- Large datasets: 30+ minutes

---

## ✅ Task 1.4: Verify Firebase Connection

### Check Environment Variables

Ensure `.env.local` has:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Test Connection

```bash
# Run development server
npm run dev

# Open browser
http://localhost:3000

# Check browser console for Firebase connection
# Should see: "Firebase initialized successfully"
```

---

## 📊 Firebase Console Checklist

### Before Deployment
- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Authentication enabled
- [ ] Security rules reviewed
- [ ] Indexes configured
- [ ] Billing enabled (if needed)

### After Deployment
- [ ] Security rules deployed
- [ ] Indexes deployed and built
- [ ] Test dataset created
- [ ] Test records added
- [ ] Permissions tested
- [ ] API access tested

---

## 🔒 Security Rules Summary

### Datasets Collection
- **Read**: Owners, editors, viewers, public (if enabled), org members
- **Create**: Authenticated users with org access
- **Update**: Owners, editors, org members
- **Delete**: Owners, admins

### Records Collection
- **Read**: Based on dataset permissions
- **Create**: Based on dataset permissions + API access
- **Update**: Owners, editors
- **Delete**: Owners, editors, admins

### API Keys Collection
- **Read**: Owners, admins
- **Create**: Owners, admins
- **Update/Delete**: Owners, admins

### Audit Logs Collection
- **Read**: Owners, editors, admins
- **Create**: Any authenticated user
- **Update/Delete**: BLOCKED (immutable)

---

## 🚀 Quick Deploy Commands

### Deploy Everything
```bash
# Deploy all Firebase resources
firebase deploy

# Or deploy specific resources
firebase deploy --only firestore:rules,firestore:indexes
```

### Deploy with Hosting
```bash
# Deploy app + Firebase config
firebase deploy --only hosting,firestore
```

---

## 🧪 Testing Firebase Setup

### Test 1: Create Dataset
```typescript
// In browser console or test file
const dataset = await fetch('/api/datasets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Dataset',
    sourceApplication: 'Test',
    organizationId: 'test_org_123'
  })
});
console.log(await dataset.json());
```

### Test 2: Create Record
```typescript
const record = await fetch('/api/datasets/DATASET_ID/records', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: { field1: 'value1', field2: 'value2' }
  })
});
console.log(await record.json());
```

### Test 3: Query Records
```typescript
const records = await fetch('/api/datasets/DATASET_ID/records?page=1&pageSize=10');
console.log(await records.json());
```

---

## 📈 Monitoring

### Firebase Console Monitoring
1. **Firestore Usage**
   - Go to Firestore > Usage
   - Monitor reads/writes
   - Check storage size

2. **Security Rules**
   - Go to Firestore > Rules
   - View rule evaluations
   - Check denied requests

3. **Indexes**
   - Go to Firestore > Indexes
   - Monitor index status
   - Check query performance

---

## 🔧 Troubleshooting

### Issue: "Missing or insufficient permissions"
**Solution**: Deploy security rules
```bash
firebase deploy --only firestore:rules
```

### Issue: "The query requires an index"
**Solution**: Deploy indexes
```bash
firebase deploy --only firestore:indexes
```

### Issue: "Firebase not initialized"
**Solution**: Check environment variables
```bash
# Verify .env.local exists and has all variables
cat .env.local
```

### Issue: "Collection not found"
**Solution**: Create first document
- Use the UI to create a dataset
- Or use the API to create a record

---

## ✅ Completion Checklist

### Firebase Setup
- [x] Security rules added to `firestore.rules`
- [x] Indexes added to `firestore.indexes.json`
- [ ] Rules deployed to Firebase
- [ ] Indexes deployed to Firebase
- [ ] Environment variables configured
- [ ] Firebase connection tested

### Next Steps
1. Deploy security rules: `firebase deploy --only firestore:rules`
2. Deploy indexes: `firebase deploy --only firestore:indexes`
3. Test connection locally
4. Create test dataset
5. Verify everything works

---

## 📞 Support

### Firebase Documentation
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### Datasets Admin Documentation
- See `DATASETS_ADMIN_DEPLOYMENT.md`
- See `DATASETS_ADMIN_API_GUIDE.md`
- See `DATASETS_ADMIN_TODO.md`

---

**Status**: Firebase configuration files ready ✅  
**Next**: Deploy rules and indexes to Firebase  
**Time**: 10-15 minutes

*Last Updated: November 30, 2025*
