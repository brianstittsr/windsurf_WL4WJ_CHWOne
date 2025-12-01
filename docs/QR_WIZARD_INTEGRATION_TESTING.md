# 🧪 QR Wizard + Datasets Admin Integration - Testing Guide

**Date**: December 1, 2025  
**Status**: Ready to Test  
**Estimated Time**: 15-20 minutes

---

## 🎯 What Was Integrated

The QR Wizard Step 4 (Participant Upload) now automatically creates datasets in the Datasets Admin Platform when you upload participant data via CSV.

### Features Added
- ✅ Automatic dataset creation from CSV upload
- ✅ Field mapping to dataset schema
- ✅ Batch participant record creation
- ✅ Success/error handling
- ✅ Direct links to view dataset
- ✅ Integration with existing QR Wizard workflow

---

## 🚀 Quick Test (5 minutes)

### Step 1: Start the Application
```bash
npm run dev
```

### Step 2: Navigate to QR Wizard
```
http://localhost:3000/qr-tracking
```

### Step 3: Complete Steps 1-3
- **Step 1**: Select platform capabilities
- **Step 2**: Enter program name (e.g., "Test Program")
- **Step 3**: Select data fields (e.g., first_name, last_name, email)

### Step 4: Upload CSV & Create Dataset
1. Click "Upload CSV File"
2. Upload a CSV with participant data
3. Map CSV columns to fields
4. Click "Create Dataset & Save Participants"
5. ✅ Success message appears with dataset link

### Step 5: View Dataset
1. Click "View Dataset" button
2. Opens Datasets Admin Platform
3. See your participants listed

---

## 📋 Complete Test Checklist

### Test 1: Basic Integration (5 min)
- [ ] QR Wizard loads without errors
- [ ] Navigate through Steps 1-3
- [ ] Step 4 loads with upload section
- [ ] CSV upload works
- [ ] Field mapping displays
- [ ] "Create Dataset" button appears
- [ ] Button is disabled until fields are mapped
- [ ] Map at least one field
- [ ] Button becomes enabled

**Expected**: All UI elements render correctly

---

### Test 2: Dataset Creation (5 min)
- [ ] Click "Create Dataset & Save Participants"
- [ ] Loading indicator appears
- [ ] Success message displays
- [ ] Dataset ID shown
- [ ] "View Dataset" button appears
- [ ] "Go to Datasets Dashboard" button appears

**Expected**: Dataset created successfully

---

### Test 3: View Dataset (3 min)
- [ ] Click "View Dataset" button
- [ ] Opens in new tab
- [ ] Dataset detail page loads
- [ ] Participant records visible in Data tab
- [ ] Record count matches CSV
- [ ] Field values correct

**Expected**: All participant data visible

---

### Test 4: Error Handling (3 min)
- [ ] Try creating dataset without Step 2 program name
- [ ] Error message appears
- [ ] Try creating dataset without CSV upload
- [ ] Error message appears
- [ ] Try creating dataset without field mapping
- [ ] Button disabled with warning

**Expected**: Appropriate error messages

---

### Test 5: Multiple Datasets (4 min)
- [ ] Create first dataset
- [ ] Clear data (delete icon)
- [ ] Upload different CSV
- [ ] Map fields
- [ ] Create second dataset
- [ ] Both datasets visible in Datasets Dashboard

**Expected**: Multiple datasets created independently

---

## 🧪 Test Scenarios

### Scenario 1: Small Dataset (10 participants)
```csv
first_name,last_name,email,phone
John,Doe,john@example.com,555-0100
Jane,Smith,jane@example.com,555-0101
...
```

**Steps**:
1. Upload CSV
2. Map all 4 fields
3. Create dataset
4. Verify 10 records created

**Expected**: All 10 participants saved

---

### Scenario 2: Large Dataset (100+ participants)
```csv
first_name,last_name,email,phone,address,city,state,zip
...100 rows...
```

**Steps**:
1. Upload large CSV
2. Map fields
3. Create dataset
4. Check loading indicator
5. Verify all records created

**Expected**: Batch creation handles large datasets

---

### Scenario 3: Custom Fields
**Step 3 Configuration**:
- Standard: first_name, last_name, email
- Custom: membership_level (text), join_date (date)

**CSV**:
```csv
first_name,last_name,email,membership_level,join_date
John,Doe,john@example.com,Gold,2024-01-15
```

**Steps**:
1. Configure custom fields in Step 3
2. Upload CSV with custom fields
3. Map both standard and custom fields
4. Create dataset
5. Verify custom fields in dataset schema

**Expected**: Custom fields included in dataset

---

### Scenario 4: Partial Field Mapping
**CSV**:
```csv
first_name,last_name,email,phone,notes
```

**Steps**:
1. Map only first_name, last_name, email
2. Skip phone and notes
3. Create dataset
4. Verify only mapped fields saved

**Expected**: Only mapped fields included

---

## 🐛 Troubleshooting

### Issue: "Program name is required" error
**Solution**: Complete Step 2 and enter a program name

### Issue: "Create Dataset" button disabled
**Solution**: Map at least one CSV column to a field

### Issue: Dataset not appearing
**Solution**: 
1. Check browser console for errors
2. Verify Firebase credentials
3. Check Firestore security rules deployed

### Issue: "Permission denied" error
**Solution**: Deploy Firebase security rules:
```bash
npm run deploy:firebase
```

### Issue: Records not saving
**Solution**:
1. Check field mapping is correct
2. Verify CSV data format
3. Check browser console for validation errors

---

## 📊 Test Results Template

### Test Session: [Date/Time]
**Tester**: [Name]  
**Environment**: Local Development  
**Browser**: [Chrome/Firefox/Safari]

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Basic Integration | ⬜ | |
| 2 | Dataset Creation | ⬜ | |
| 3 | View Dataset | ⬜ | |
| 4 | Error Handling | ⬜ | |
| 5 | Multiple Datasets | ⬜ | |

**Scenarios Tested**:
- [ ] Small Dataset (10 participants)
- [ ] Large Dataset (100+ participants)
- [ ] Custom Fields
- [ ] Partial Field Mapping

**Issues Found**: [List any issues]  
**Overall Result**: ⬜ Pass / ⬜ Fail

---

## ✅ Success Criteria

### Must Pass
- ✅ Dataset created from CSV upload
- ✅ All mapped fields saved correctly
- ✅ Record count matches CSV
- ✅ Links to dataset work
- ✅ No console errors

### Should Pass
- ✅ Large datasets (100+) work
- ✅ Custom fields supported
- ✅ Error messages clear
- ✅ Loading indicators shown

### Nice to Have
- ✅ Fast creation (< 5 seconds for 100 records)
- ✅ Smooth user experience
- ✅ Clear success feedback

---

## 🔗 Integration Flow

```
QR Wizard Step 4
    ↓
Upload CSV
    ↓
Parse & Display Data
    ↓
Map Fields to Schema
    ↓
Click "Create Dataset"
    ↓
useQRWizardDataset Hook
    ↓
QRWizardDatasetIntegration Service
    ↓
DatasetService
    ↓
Firebase Firestore
    ↓
Success Message + Links
    ↓
View in Datasets Admin
```

---

## 📝 Sample Test Data

### test-participants-small.csv
```csv
first_name,last_name,email,phone
John,Doe,john@example.com,555-0100
Jane,Smith,jane@example.com,555-0101
Bob,Johnson,bob@example.com,555-0102
Alice,Williams,alice@example.com,555-0103
Charlie,Brown,charlie@example.com,555-0104
```

### test-participants-custom.csv
```csv
first_name,last_name,email,membership_level,join_date,notes
John,Doe,john@example.com,Gold,2024-01-15,Active member
Jane,Smith,jane@example.com,Silver,2024-02-20,New member
Bob,Johnson,bob@example.com,Gold,2023-12-01,Renewing
```

---

## 🎯 What to Look For

### UI Elements
- ✅ Upload button visible
- ✅ Field mapping dropdowns
- ✅ "Create Dataset" button (highlighted section)
- ✅ Loading indicators
- ✅ Success alert with links
- ✅ Error messages (if applicable)

### Functionality
- ✅ CSV parsing works
- ✅ Field mapping saves
- ✅ Dataset creation succeeds
- ✅ Records saved to Firestore
- ✅ Links navigate correctly

### Performance
- ✅ Upload fast (< 2 seconds)
- ✅ Creation fast (< 5 seconds for 100 records)
- ✅ No lag in UI
- ✅ Smooth transitions

---

## 📞 Support

### Need Help?
1. Check browser console for errors
2. Verify Firebase connection
3. Check Firestore security rules
4. Review integration guide: `QR_WIZARD_DATASET_INTEGRATION.md`

### Common Issues
- **No button**: Check if CSV uploaded and fields mapped
- **Button disabled**: Map at least one field
- **Creation fails**: Check Firebase credentials
- **Records missing**: Verify field mapping

---

## 🎉 Completion

After testing:
- [ ] All tests passed
- [ ] Issues documented
- [ ] Screenshots taken
- [ ] Ready for production

**Next Steps**:
1. Fix any issues found
2. Test in production environment
3. Train users on workflow
4. Monitor usage

---

**Estimated Total Time**: 15-20 minutes  
**Status**: Ready to test!

*Last Updated: December 1, 2025*
