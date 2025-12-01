# 🧪 Datasets Admin Platform - Local Testing Guide

**Date**: December 1, 2025  
**Status**: Ready to Test  
**Estimated Time**: 30-45 minutes

---

## 🚀 Quick Start

### Step 1: Verify Environment
```bash
# Run environment verification script
node scripts/verify-environment.js
```

**Expected Output**: All checks should pass ✅

### Step 2: Start Development Server
```bash
# Install dependencies (if not done)
npm install

# Start server
npm run dev
```

**Expected Output**: Server running on `http://localhost:3000`

### Step 3: Open Datasets Admin
```
http://localhost:3000/datasets
```

---

## ✅ Test Checklist

### Test 1: Dashboard Loads
**Time**: 2 minutes

- [ ] Navigate to `/datasets`
- [ ] Dashboard loads without errors
- [ ] Statistics cards display (4 cards)
- [ ] "Create Dataset" button visible
- [ ] Search bar functional
- [ ] Tabs visible (All, Active, Archived)

**Expected Result**: Dashboard displays with placeholder data

**Screenshot Location**: Take screenshot for documentation

---

### Test 2: Create Dataset Wizard
**Time**: 5 minutes

#### Step 1: Basic Information
- [ ] Click "Create Dataset" button
- [ ] Dialog opens
- [ ] Fill in dataset name: "Test Dataset 1"
- [ ] Fill in description: "Testing dataset creation"
- [ ] Select source: "Manual Entry"
- [ ] Select category: "Testing"
- [ ] Add tags: "test", "demo"
- [ ] Click "Next"

#### Step 2: Schema Definition
- [ ] Click "Add Field"
- [ ] Add field: name="first_name", type="String", required=true
- [ ] Add field: name="last_name", type="String", required=true
- [ ] Add field: name="email", type="Email", required=true
- [ ] Add field: name="phone", type="Phone", required=false
- [ ] Click "Next"

#### Step 3: Settings
- [ ] Toggle "Public Access" OFF
- [ ] Toggle "Strict Mode" ON
- [ ] Toggle "API Access" ON
- [ ] Click "Create Dataset"

**Expected Result**: 
- Success message appears
- Dataset created in Firestore
- Redirected to dataset detail view

**Test Data**:
```json
{
  "name": "Test Dataset 1",
  "description": "Testing dataset creation",
  "sourceApplication": "Manual Entry",
  "category": "Testing",
  "tags": ["test", "demo"]
}
```

---

### Test 3: Dataset Detail View
**Time**: 3 minutes

- [ ] Dataset detail page loads
- [ ] Header shows dataset name
- [ ] Action buttons visible (Import, Export, Edit, Delete)
- [ ] 6 tabs visible (Data, Schema, Analytics, Settings, Activity, API)
- [ ] Data tab selected by default

**Expected Result**: All UI elements render correctly

---

### Test 4: Data Tab - Add Records
**Time**: 5 minutes

#### Add First Record
- [ ] Click "Add Record" button
- [ ] Dialog opens with form fields
- [ ] Fill in:
  - first_name: "John"
  - last_name: "Doe"
  - email: "john@example.com"
  - phone: "555-0100"
- [ ] Click "Save"
- [ ] Record appears in table

#### Add Second Record
- [ ] Click "Add Record"
- [ ] Fill in:
  - first_name: "Jane"
  - last_name: "Smith"
  - email: "jane@example.com"
  - phone: "555-0200"
- [ ] Click "Save"

#### Add Third Record (Test Validation)
- [ ] Click "Add Record"
- [ ] Fill in only:
  - first_name: "Bob"
  - last_name: "Johnson"
  - email: "invalid-email" (invalid format)
- [ ] Click "Save"
- [ ] **Expected**: Validation error for email

**Expected Result**: 2 valid records created, 1 rejected

---

### Test 5: Data Tab - Edit Record
**Time**: 2 minutes

- [ ] Click edit icon on first record
- [ ] Dialog opens with existing data
- [ ] Change phone to "555-0101"
- [ ] Click "Save"
- [ ] Record updates in table

**Expected Result**: Record updated successfully

---

### Test 6: Data Tab - Delete Record
**Time**: 2 minutes

- [ ] Click delete icon on second record
- [ ] Confirmation dialog appears
- [ ] Click "Delete"
- [ ] Record removed from table

**Expected Result**: 1 record remaining

---

### Test 7: Data Tab - Search
**Time**: 2 minutes

- [ ] Add 2 more records (different names)
- [ ] Type "John" in search box
- [ ] Table filters to show only matching records
- [ ] Clear search
- [ ] All records visible again

**Expected Result**: Search filters correctly

---

### Test 8: Data Tab - Pagination
**Time**: 2 minutes

- [ ] Add 15+ records (use script or manually)
- [ ] Pagination controls appear
- [ ] Click "Next Page"
- [ ] Page 2 loads
- [ ] Click "Previous Page"
- [ ] Page 1 loads

**Expected Result**: Pagination works correctly

---

### Test 9: Schema Tab
**Time**: 3 minutes

- [ ] Click "Schema" tab
- [ ] All fields listed
- [ ] Click "Add Field"
- [ ] Add field: name="age", type="Number", required=false
- [ ] Click "Save"
- [ ] New field appears in list
- [ ] Click edit on "phone" field
- [ ] Change required to true
- [ ] Click "Save"

**Expected Result**: Schema updates successfully

---

### Test 10: Analytics Tab
**Time**: 2 minutes

- [ ] Click "Analytics" tab
- [ ] Overview section displays:
  - Total Records count
  - Total Fields count
  - Storage Size
  - Contributors count
- [ ] Schema Statistics section shows field breakdown
- [ ] Field Distribution chart displays

**Expected Result**: Analytics display correctly

---

### Test 11: Settings Tab
**Time**: 3 minutes

- [ ] Click "Settings" tab
- [ ] Toggle "Strict Mode" OFF
- [ ] Toggle "Allow Extra Fields" ON
- [ ] Toggle "Public Access" to "Read"
- [ ] Toggle "Email on Submit" ON
- [ ] Add email: "admin@example.com"
- [ ] Click "Save Settings"
- [ ] Success message appears

**Expected Result**: Settings saved successfully

---

### Test 12: Activity Tab
**Time**: 2 minutes

- [ ] Click "Activity" tab
- [ ] Activity log displays
- [ ] Shows dataset creation event
- [ ] Shows record creation events
- [ ] Shows update events
- [ ] Each event has timestamp and user

**Expected Result**: Complete audit trail visible

---

### Test 13: API Tab
**Time**: 3 minutes

- [ ] Click "API" tab
- [ ] Base endpoint displayed
- [ ] API documentation visible
- [ ] Code examples shown (cURL, JavaScript, Python)
- [ ] Click "Generate API Key"
- [ ] Key generated and displayed
- [ ] Click "Copy" to copy key
- [ ] Click "View" to toggle visibility

**Expected Result**: API documentation complete

---

### Test 14: API Endpoints (cURL)
**Time**: 5 minutes

#### Get All Datasets
```bash
curl http://localhost:3000/api/datasets
```
**Expected**: JSON array of datasets

#### Get Single Dataset
```bash
curl http://localhost:3000/api/datasets/DATASET_ID
```
**Expected**: JSON object with dataset details

#### Create Record
```bash
curl -X POST http://localhost:3000/api/datasets/DATASET_ID/records \
  -H "Content-Type: application/json" \
  -d '{"data":{"first_name":"API","last_name":"Test","email":"api@test.com"}}'
```
**Expected**: JSON object with created record

#### Get Records
```bash
curl http://localhost:3000/api/datasets/DATASET_ID/records?page=1&pageSize=10
```
**Expected**: JSON array of records with pagination

#### Get Analytics
```bash
curl http://localhost:3000/api/datasets/DATASET_ID/analytics
```
**Expected**: JSON object with statistics

---

### Test 15: Dataset List View
**Time**: 3 minutes

- [ ] Navigate back to `/datasets`
- [ ] Created dataset appears in list
- [ ] Click on dataset card
- [ ] Opens detail view
- [ ] Click "Back" or navigate to `/datasets`
- [ ] List view loads again

**Expected Result**: Navigation works correctly

---

### Test 16: Search & Filter
**Time**: 3 minutes

- [ ] Create 2-3 more datasets with different names
- [ ] Use search bar to filter by name
- [ ] Click "Active" tab
- [ ] Only active datasets shown
- [ ] Click "All" tab
- [ ] All datasets shown

**Expected Result**: Search and filters work

---

### Test 17: Export Dataset
**Time**: 2 minutes

- [ ] Open a dataset detail view
- [ ] Click "Export" button
- [ ] Export dialog appears
- [ ] Select format: CSV
- [ ] Click "Export"
- [ ] File downloads

**Expected Result**: CSV file downloads with data

---

### Test 18: Delete Dataset
**Time**: 2 minutes

- [ ] Open a test dataset
- [ ] Click "Delete" button
- [ ] Confirmation dialog appears
- [ ] Click "Delete"
- [ ] Dataset removed
- [ ] Redirected to list view

**Expected Result**: Dataset deleted successfully

---

## 🔧 Troubleshooting

### Issue: Dashboard doesn't load
**Solution**:
1. Check console for errors
2. Verify Firebase credentials in `.env.local`
3. Check network tab for failed requests

### Issue: "Permission denied" errors
**Solution**:
1. Deploy Firebase security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. Check user is authenticated

### Issue: Records not saving
**Solution**:
1. Check browser console for validation errors
2. Verify schema matches data
3. Check Firestore in Firebase Console

### Issue: API endpoints return 404
**Solution**:
1. Verify Next.js API routes exist in `src/app/api/datasets/`
2. Restart development server
3. Check route file naming

---

## 📊 Test Results Template

### Test Session: [Date/Time]
**Tester**: [Name]  
**Environment**: Local Development  
**Browser**: [Chrome/Firefox/Safari]

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Dashboard Loads | ⬜ | |
| 2 | Create Dataset | ⬜ | |
| 3 | Detail View | ⬜ | |
| 4 | Add Records | ⬜ | |
| 5 | Edit Record | ⬜ | |
| 6 | Delete Record | ⬜ | |
| 7 | Search | ⬜ | |
| 8 | Pagination | ⬜ | |
| 9 | Schema Tab | ⬜ | |
| 10 | Analytics Tab | ⬜ | |
| 11 | Settings Tab | ⬜ | |
| 12 | Activity Tab | ⬜ | |
| 13 | API Tab | ⬜ | |
| 14 | API Endpoints | ⬜ | |
| 15 | List View | ⬜ | |
| 16 | Search & Filter | ⬜ | |
| 17 | Export | ⬜ | |
| 18 | Delete Dataset | ⬜ | |

**Overall Result**: ⬜ Pass / ⬜ Fail  
**Issues Found**: [List any issues]  
**Next Steps**: [Actions needed]

---

## 🎯 Success Criteria

### Must Pass
- ✅ All UI components render
- ✅ Dataset creation works
- ✅ Record CRUD operations work
- ✅ All tabs functional
- ✅ API endpoints respond
- ✅ No console errors

### Should Pass
- ✅ Search and filtering work
- ✅ Pagination works
- ✅ Validation works
- ✅ Export works
- ✅ Settings save correctly

### Nice to Have
- ✅ Fast load times (< 2s)
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Good error messages

---

## 📝 Notes

### Test Data Cleanup
After testing, clean up test data:
1. Delete test datasets from UI
2. Or use Firebase Console to clear collections
3. Or run cleanup script (if created)

### Performance Monitoring
- Note any slow operations
- Check browser DevTools Performance tab
- Monitor Firestore usage in Firebase Console

### Bug Reporting
If you find bugs:
1. Note the exact steps to reproduce
2. Take screenshots
3. Check browser console for errors
4. Document in GitHub Issues

---

## ✅ Completion Checklist

- [ ] All 18 tests completed
- [ ] Test results documented
- [ ] Issues logged (if any)
- [ ] Screenshots taken
- [ ] Performance acceptable
- [ ] Ready for next phase

---

**Estimated Total Time**: 30-45 minutes  
**Next Step**: Deploy to production or continue with enhancements

*Last Updated: December 1, 2025*
