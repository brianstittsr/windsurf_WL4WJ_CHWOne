# 🚀 Datasets Admin Platform - Quick Start Guide

**Get up and running in 10 minutes!**

---

## ⚡ Quick Start (10 minutes)

### Step 1: Verify Environment (2 min)
```bash
npm run verify-env
```

✅ All checks should pass

### Step 2: Deploy Firebase (3 min)
```bash
npm run deploy:firebase
```

Or manually:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Step 3: Start Development Server (1 min)
```bash
npm run dev
```

### Step 4: Open Datasets Admin (1 min)
```
http://localhost:3000/datasets
```

### Step 5: Create Your First Dataset (3 min)
1. Click "Create Dataset"
2. Fill in basic info
3. Add fields to schema
4. Configure settings
5. Click "Create"

🎉 **Done!** You now have a working dataset platform!

---

## 📋 Complete Workflow

### 1. Environment Setup
```bash
# Verify everything is configured
npm run verify-env

# Expected output:
# ✅ Environment Variables
# ✅ Firebase Configuration
# ✅ Required Files
# ✅ Dependencies
```

### 2. Firebase Deployment
```bash
# Deploy security rules and indexes
npm run deploy:firebase

# Wait for indexes to build (check Firebase Console)
```

### 3. Local Testing
```bash
# Start dev server
npm run dev

# In another terminal, run tests
npm run test:local
```

### 4. Create Test Data
```bash
# Navigate to http://localhost:3000/datasets

# Create a dataset:
Name: "Test Participants"
Description: "Testing the platform"
Source: "Manual Entry"

# Add fields:
- first_name (String, required)
- last_name (String, required)
- email (Email, required)
- phone (Phone, optional)

# Add records:
- John Doe, john@example.com, 555-0100
- Jane Smith, jane@example.com, 555-0200
```

### 5. Test API
```bash
# Get all datasets
curl http://localhost:3000/api/datasets

# Get records
curl http://localhost:3000/api/datasets/DATASET_ID/records

# Create record
curl -X POST http://localhost:3000/api/datasets/DATASET_ID/records \
  -H "Content-Type: application/json" \
  -d '{"data":{"first_name":"API","last_name":"Test","email":"api@test.com"}}'
```

### 6. Deploy to Production
```bash
# Option 1: Vercel (Recommended)
vercel --prod

# Option 2: AWS Amplify
# Follow: docs/DATASETS_ADMIN_DEPLOYMENT.md

# Option 3: Netlify
netlify deploy --prod
```

---

## 🎯 Quick Reference

### Key URLs
- **Dashboard**: `/datasets`
- **Create Dataset**: `/datasets` → Click "Create Dataset"
- **Dataset Detail**: `/datasets/[id]`
- **API Docs**: See dataset detail → API tab

### Key Commands
```bash
# Verify environment
npm run verify-env

# Deploy Firebase
npm run deploy:firebase

# Start dev server
npm run dev

# Run tests
npm run test:local

# Deploy to Vercel
vercel --prod
```

### Key Files
- **Types**: `src/types/dataset.types.ts`
- **Service**: `src/services/DatasetService.ts`
- **Dashboard**: `src/components/Datasets/DatasetsDashboard.tsx`
- **API Routes**: `src/app/api/datasets/`

---

## 🔗 QR Wizard Integration

### Quick Integration
```typescript
// In your component
import { useQRWizardDataset } from '@/hooks/useQRWizardDataset';

const { createDataset, loading, error } = useQRWizardDataset();

// Create dataset from CSV upload
const result = await createDataset(
  'Program Name',
  participantData,
  standardFields,
  customFields
);

// Dataset created! ID: result.datasetId
```

### Full Integration Guide
See: `docs/QR_WIZARD_DATASET_INTEGRATION.md`

---

## 📊 Test Checklist

Quick test to verify everything works:

- [ ] Dashboard loads
- [ ] Create dataset works
- [ ] Add record works
- [ ] Edit record works
- [ ] Delete record works
- [ ] Search works
- [ ] API endpoints respond
- [ ] Export works

**Time**: 5-10 minutes

Full testing guide: `docs/LOCAL_TESTING_GUIDE.md`

---

## 🐛 Troubleshooting

### Dashboard won't load
```bash
# Check environment
npm run verify-env

# Check console for errors
# Open browser DevTools → Console
```

### Permission denied errors
```bash
# Deploy Firebase rules
npm run deploy:firebase

# Or manually
firebase deploy --only firestore:rules
```

### API endpoints return 404
```bash
# Restart dev server
# Ctrl+C, then:
npm run dev
```

### Build errors
```bash
# Clean and rebuild
npm run clean
npm run build
```

---

## 📚 Documentation

### Essential Docs
1. **LOCAL_TESTING_GUIDE.md** - Complete testing guide
2. **FIREBASE_SETUP_DATASETS.md** - Firebase configuration
3. **QR_WIZARD_DATASET_INTEGRATION.md** - Integration guide
4. **DATASETS_ADMIN_DEPLOYMENT.md** - Production deployment
5. **DATASETS_ADMIN_API_GUIDE.md** - API documentation

### Quick Links
- [TODO List](./DATASETS_ADMIN_TODO.md)
- [Progress Report](./DATASETS_ADMIN_PROGRESS_REPORT.md)
- [Complete Summary](./DATASETS_ADMIN_COMPLETE_SUMMARY.md)

---

## 🎉 Next Steps

After quick start:

1. **Test Thoroughly**
   - Follow `LOCAL_TESTING_GUIDE.md`
   - Test all features
   - Document any issues

2. **Integrate with QR Wizard**
   - Follow `QR_WIZARD_DATASET_INTEGRATION.md`
   - Add UI to Step 4
   - Test workflow

3. **Deploy to Production**
   - Follow `DATASETS_ADMIN_DEPLOYMENT.md`
   - Configure environment variables
   - Test in production

4. **Add Enhancements**
   - Import/Export features
   - Advanced analytics
   - Webhooks
   - Email notifications

---

## 💡 Pro Tips

### Development
- Use `npm run verify-env` before starting work
- Keep Firebase Console open for debugging
- Use browser DevTools Network tab to debug API calls

### Testing
- Create test datasets with "TEST" prefix
- Use fake data generators for bulk testing
- Clean up test data regularly

### Deployment
- Always test locally first
- Deploy Firebase rules before app deployment
- Monitor Firebase usage in console

---

## 📞 Support

### Need Help?
1. Check documentation in `docs/` folder
2. Review error messages in browser console
3. Check Firebase Console for database issues
4. Review GitHub Issues

### Common Resources
- Firebase Console: https://console.firebase.google.com
- Vercel Dashboard: https://vercel.com/dashboard
- Next.js Docs: https://nextjs.org/docs

---

**Ready to go!** 🚀

Start with: `npm run verify-env`

*Last Updated: December 1, 2025*
