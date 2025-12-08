# QR Wizard Testing Guide

## 🧪 Comprehensive Testing Checklist

This guide provides step-by-step testing procedures for the complete QR Code Participant Tracking Wizard.

---

## Prerequisites

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] Firebase project configured
- [ ] OpenAI API key set in `.env.local`
- [ ] Development server running (`npm run dev`)

### Environment Variables
```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## Test Suite

### 🚀 Initial Setup

#### Access the Wizard
1. Navigate to `http://localhost:3000/qr-tracking-wizard`
2. Verify wizard loads without errors
3. Check that Step 1 is displayed
4. Verify progress bar shows 0%

**Expected Result**: Wizard loads with 8 steps visible in stepper

---

### 📱 Step 1: Platform Discovery

#### Test Platform Selection
1. [ ] Select "Salesforce" from platform dropdown
2. [ ] Verify form builder section appears
3. [ ] Toggle various form builder features
4. [ ] Enter "Salesforce Forms" as tool name

#### Test QR Code Generation
1. [ ] Toggle "Has built-in QR generator"
2. [ ] Enable "Can generate individual codes"
3. [ ] Check all format options

#### Test Dataset Features
1. [ ] Select "CRM" as storage type
2. [ ] Enable 5+ dataset capabilities
3. [ ] Toggle "Real-time updates"

#### Test AI Analysis
1. [ ] Click "Get AI Platform Recommendations"
2. [ ] Wait for analysis (should take 2-5 seconds)
3. [ ] Verify recommendations appear in alert box
4. [ ] Check for ✅ and 💡 emoji indicators

#### Test Auto-Save
1. [ ] Make a change to any field
2. [ ] Wait 2 seconds
3. [ ] Refresh the page
4. [ ] Verify data persists

**Expected Result**: All data saves automatically, AI provides platform-specific recommendations

---

### 📋 Step 2: Program Details

#### Test Basic Information
1. [ ] Enter program name: "CHW Training Program"
2. [ ] Select program type: "Training"
3. [ ] Set start date: Next month
4. [ ] Set end date: 6 months later
5. [ ] Enter expected participants: 50

#### Test Cohort Management
1. [ ] Click "Add Cohort"
2. [ ] Enter cohort name: "Cohort A"
3. [ ] Set dates and capacity
4. [ ] Add second cohort: "Cohort B"
5. [ ] Edit first cohort
6. [ ] Delete second cohort
7. [ ] Verify only one cohort remains

#### Test Session Schedule
1. [ ] Click "Add Session"
2. [ ] Enter session name: "Week 1 Training"
3. [ ] Select day: Monday
4. [ ] Set time: 9:00 AM
5. [ ] Set duration: 120 minutes
6. [ ] Add 3 more sessions
7. [ ] Verify all sessions display

#### Test Tracking Requirements
1. [ ] Toggle "Attendance tracking"
2. [ ] Toggle "Session feedback"
3. [ ] Enable at least 3 tracking options

#### Test AI Analysis
1. [ ] Click "Get AI Program Recommendations"
2. [ ] Verify suggestions appear
3. [ ] Check for program structure insights

**Expected Result**: Cohorts and sessions managed successfully, AI provides program recommendations

---

### 📊 Step 3: Data Requirements

#### Test Standard Fields
1. [ ] Select "Full Name"
2. [ ] Select "Email Address"
3. [ ] Select "Phone Number"
4. [ ] Select 5+ standard fields total
5. [ ] Verify selected count updates

#### Test Custom Fields
1. [ ] Click "Add Custom Field"
2. [ ] Enter name: "Emergency Contact"
3. [ ] Select type: "Text"
4. [ ] Mark as required
5. [ ] Add help text
6. [ ] Save custom field
7. [ ] Verify field appears in list
8. [ ] Edit the custom field
9. [ ] Delete a custom field

#### Test Demographic Data
1. [ ] Toggle "Collect demographic data"
2. [ ] Enable age, gender, ethnicity
3. [ ] Verify checkboxes work

#### Test Medical Data
1. [ ] Toggle "Collect medical/health data"
2. [ ] Verify HIPAA warning appears
3. [ ] Enable health conditions
4. [ ] Check warning persists

#### Test Consent & Privacy
1. [ ] Toggle "Require consent"
2. [ ] Enter consent text
3. [ ] Set data retention: 5 years
4. [ ] Enable data sharing options

#### Test AI Analysis
1. [ ] Click "Get AI Data Recommendations"
2. [ ] Verify data collection suggestions
3. [ ] Check for privacy considerations

**Expected Result**: Custom fields created, HIPAA warnings shown, AI provides data recommendations

---

### 📤 Step 4: Participant Upload

#### Test Template Download
1. [ ] Click "Download Template"
2. [ ] Verify CSV file downloads
3. [ ] Open file and check headers

#### Test CSV Upload
1. [ ] Create test CSV with 10 participants
2. [ ] Include: name, email, phone, cohort
3. [ ] Click "Upload CSV"
4. [ ] Select your test file
5. [ ] Verify file name appears
6. [ ] Check participant count

#### Test Field Mapping
1. [ ] Map "Name" column to "Full Name"
2. [ ] Map "Email" to "Email Address"
3. [ ] Map "Phone" to "Phone Number"
4. [ ] Map "Cohort" to "Cohort Assignment"
5. [ ] Verify all required fields mapped

#### Test Data Preview
1. [ ] Verify preview table shows first 10 rows
2. [ ] Check column headers match mappings
3. [ ] Verify data displays correctly
4. [ ] Scroll through preview

#### Test Validation
1. [ ] Check validation summary
2. [ ] Verify total participants count
3. [ ] Check for any warnings

#### Test AI Validation
1. [ ] Click "Get AI Data Validation"
2. [ ] Wait for analysis
3. [ ] Verify data quality suggestions
4. [ ] Check for duplicate warnings

**Expected Result**: CSV uploads successfully, fields map correctly, AI validates data quality

---

### 📝 Step 5: Form Customization

#### Test Form Creation
1. [ ] Click "Create New Form"
2. [ ] Enter name: "Session Check-In"
3. [ ] Select type: "Participant Check-In"
4. [ ] Enter description
5. [ ] Save form
6. [ ] Verify form card appears

#### Test Field Addition
1. [ ] Click "Edit" on form
2. [ ] Click "Add Field"
3. [ ] Create text field: "Name"
4. [ ] Mark as required
5. [ ] Add dropdown field: "Session"
6. [ ] Add options: Week 1, Week 2, Week 3
7. [ ] Add rating field: "How are you feeling?"
8. [ ] Set scale: 1-5
9. [ ] Add 5+ fields total

#### Test Field Management
1. [ ] Edit a field
2. [ ] Change field type
3. [ ] Update validation
4. [ ] Delete a field
5. [ ] Reorder fields (if supported)

#### Test Form Preview
1. [ ] Click "Preview Form"
2. [ ] Verify all fields display
3. [ ] Check field types render correctly
4. [ ] Test required field indicators
5. [ ] Close preview

#### Test QR Code Behavior
1. [ ] Select "Pre-fill participant data"
2. [ ] Toggle "Allow offline submission"
3. [ ] Set redirect: "Thank you page"

#### Test Form Settings
1. [ ] Enable "Mobile optimized"
2. [ ] Enable "Offline capable"
3. [ ] Add language: Spanish
4. [ ] Set submission limit

#### Test Multiple Forms
1. [ ] Create second form: "Session Feedback"
2. [ ] Create third form: "Exit Survey"
3. [ ] Verify all forms display
4. [ ] Edit different forms

#### Test AI Optimization
1. [ ] Click "Get AI Form Recommendations"
2. [ ] Verify form structure suggestions
3. [ ] Check for UX improvements
4. [ ] Review field recommendations

**Expected Result**: Multiple forms created with various field types, preview works, AI provides optimization tips

---

### 📱 Step 6: QR Code Strategy

#### Test QR Approach
1. [ ] Select "Individual QR codes"
2. [ ] Read pros/cons
3. [ ] Switch to "Single shared code"
4. [ ] Switch to "Hybrid approach"
5. [ ] Verify descriptions update

#### Test Print Format
1. [ ] Select "Name badge"
2. [ ] Switch to "Wallet card"
3. [ ] Try "Sticker label"
4. [ ] Test "Full sheet"

#### Test Print Options
1. [ ] Toggle "Include participant name"
2. [ ] Toggle "Include participant ID"
3. [ ] Toggle "Include photo"
4. [ ] Toggle "Include instructions"

#### Test QR Settings
1. [ ] Select size: "Medium (2x2 inches)"
2. [ ] Set error correction: "High"
3. [ ] Toggle "Display URL below QR"
4. [ ] Enter custom domain: "myprogram.org"

#### Test Distribution Methods
1. [ ] Check "Mail to home address"
2. [ ] Check "Email as PDF"
3. [ ] Check "Pickup at orientation"
4. [ ] Select 3+ methods

#### Test Backup Plan
1. [ ] Enter backup plan text
2. [ ] Describe contingency

#### Test Strategy Summary
1. [ ] Verify summary card displays
2. [ ] Check all selections shown
3. [ ] Verify counts are correct

#### Test AI Recommendations
1. [ ] Click "Get AI QR Strategy Recommendations"
2. [ ] Verify strategy analysis
3. [ ] Check for distribution suggestions
4. [ ] Review print format advice

**Expected Result**: QR strategy configured, summary displays correctly, AI provides strategy recommendations

---

### 👨‍🏫 Step 7: Workflows & Training

#### Test Training Topics
1. [ ] Select "QR Code Basics"
2. [ ] Select "How to Scan QR Codes"
3. [ ] Select "Completing Digital Forms"
4. [ ] Select 4+ topics total
5. [ ] Verify checkmarks appear

#### Test Staff Roles
1. [ ] Select "Program Administrator"
2. [ ] Select "Instructors/Facilitators"
3. [ ] Select 2+ roles
4. [ ] Verify selection highlights

#### Test Training Delivery
1. [ ] Toggle "Live Training Session"
2. [ ] Toggle "Video Tutorials"
3. [ ] Toggle "Written Documentation"
4. [ ] Select duration: "1-2 hours"

#### Test Workflow Documentation
1. [ ] Expand "Participant Registration Workflow"
2. [ ] Enter workflow description
3. [ ] Expand "Session Check-In Workflow"
4. [ ] Enter check-in process
5. [ ] Document all 4 workflows

#### Test Documentation Generation
1. [ ] Click "Generate Docs"
2. [ ] Wait for generation
3. [ ] Verify success message

#### Test AI Recommendations
1. [ ] Click "Get AI Training Recommendations"
2. [ ] Verify training plan analysis
3. [ ] Check for staff preparedness tips
4. [ ] Review documentation suggestions

**Expected Result**: Training plan configured, workflows documented, AI provides training recommendations

---

### 🚀 Step 8: Implementation Plan

#### Test Timeline Configuration
1. [ ] Set start date: 2 weeks from now
2. [ ] Select timeline: "Standard (4-6 weeks)"
3. [ ] Verify milestones display

#### Test Milestone Tracking
1. [ ] Review 6 milestones
2. [ ] Verify durations shown
3. [ ] Check stepper visualization

#### Test Success Metrics
1. [ ] Review 4 success metrics
2. [ ] Verify targets displayed
3. [ ] Check metric descriptions

#### Test Resources & Budget
1. [ ] Enter budget: "$5,000"
2. [ ] Enter resources needed
3. [ ] List staff time requirements

#### Test Risk Assessment
1. [ ] Enter potential risks
2. [ ] Document mitigation strategies
3. [ ] Add contingency plans

#### Test Implementation Notes
1. [ ] Add additional notes
2. [ ] Document special considerations

#### Test Summary Card
1. [ ] Verify completion percentage
2. [ ] Check platform name
3. [ ] Verify participant count
4. [ ] Check form count
5. [ ] Verify QR approach

#### Test AI Recommendations
1. [ ] Click "Get AI Implementation Recommendations"
2. [ ] Verify readiness assessment
3. [ ] Check timeline feasibility
4. [ ] Review risk mitigation tips

#### Test Export Functionality
1. [ ] Click "Export Plan"
2. [ ] Verify JSON file downloads
3. [ ] Open file and check structure
4. [ ] Verify all wizard data included

#### Test Save & Finish
1. [ ] Click "Save & Finish"
2. [ ] Verify success message
3. [ ] Check Firebase for saved data

**Expected Result**: Implementation plan complete, export works, wizard saves successfully

---

## 🔄 Cross-Step Testing

### Test Navigation
1. [ ] Navigate forward through all steps
2. [ ] Navigate backward through all steps
3. [ ] Jump to specific step via stepper
4. [ ] Verify data persists across navigation

### Test Progress Tracking
1. [ ] Complete Step 1
2. [ ] Verify progress bar updates
3. [ ] Check step completion indicator
4. [ ] Complete all 8 steps
5. [ ] Verify 100% completion

### Test Auto-Save Across Steps
1. [ ] Make changes in Step 2
2. [ ] Navigate to Step 5
3. [ ] Return to Step 2
4. [ ] Verify changes persisted

### Test Data Consistency
1. [ ] Enter program name in Step 2
2. [ ] Verify it appears in Step 8 summary
3. [ ] Upload participants in Step 4
4. [ ] Verify count in Step 8
5. [ ] Create forms in Step 5
6. [ ] Verify count in Step 8

---

## 🤖 AI Integration Testing

### Test All AI Endpoints
1. [ ] Test AI in Step 1 (Platform)
2. [ ] Test AI in Step 2 (Program)
3. [ ] Test AI in Step 3 (Data)
4. [ ] Test AI in Step 4 (Upload)
5. [ ] Test AI in Step 5 (Forms)
6. [ ] Test AI in Step 6 (QR Strategy)
7. [ ] Test AI in Step 7 (Training)
8. [ ] Test AI in Step 8 (Implementation)

### Test AI Response Quality
1. [ ] Verify recommendations are relevant
2. [ ] Check for emoji indicators (✅, 💡, etc.)
3. [ ] Verify formatting is consistent
4. [ ] Check response time (< 10 seconds)

### Test AI Error Handling
1. [ ] Disable internet connection
2. [ ] Click AI analysis button
3. [ ] Verify fallback message appears
4. [ ] Reconnect and retry
5. [ ] Verify success

---

## 🔒 Security & Privacy Testing

### Test Data Persistence
1. [ ] Enter sensitive data
2. [ ] Verify Firebase security rules
3. [ ] Check data encryption
4. [ ] Test user authentication

### Test HIPAA Warnings
1. [ ] Enable medical data collection
2. [ ] Verify warning appears
3. [ ] Check warning persistence
4. [ ] Test consent requirements

---

## 📱 Responsive Design Testing

### Desktop (1920x1080)
1. [ ] Test all steps at full width
2. [ ] Verify layout is comfortable
3. [ ] Check no horizontal scrolling

### Tablet (768x1024)
1. [ ] Test wizard on tablet size
2. [ ] Verify forms are usable
3. [ ] Check stepper responsiveness

### Mobile (375x667)
1. [ ] Test on mobile viewport
2. [ ] Verify touch interactions
3. [ ] Check form field sizes
4. [ ] Test navigation buttons

---

## 🐛 Error Handling Testing

### Test Invalid Data
1. [ ] Enter invalid email format
2. [ ] Upload malformed CSV
3. [ ] Enter negative numbers
4. [ ] Test required field validation

### Test Network Errors
1. [ ] Disable network mid-save
2. [ ] Verify error message
3. [ ] Test retry functionality
4. [ ] Verify data recovery

### Test Browser Compatibility
1. [ ] Test in Chrome
2. [ ] Test in Firefox
3. [ ] Test in Safari
4. [ ] Test in Edge

---

## ✅ Final Acceptance Criteria

### Functionality
- [ ] All 8 steps load without errors
- [ ] Auto-save works consistently
- [ ] AI recommendations work for all steps
- [ ] CSV upload and parsing works
- [ ] Form builder creates forms successfully
- [ ] Export generates valid JSON
- [ ] Save & Finish completes successfully

### User Experience
- [ ] Navigation is intuitive
- [ ] Progress tracking is clear
- [ ] Forms are easy to fill
- [ ] Error messages are helpful
- [ ] Loading states are visible

### Performance
- [ ] Page loads in < 3 seconds
- [ ] AI responses in < 10 seconds
- [ ] Auto-save doesn't lag
- [ ] No memory leaks
- [ ] Smooth animations

### Data Integrity
- [ ] All data persists correctly
- [ ] No data loss on navigation
- [ ] Export includes all data
- [ ] Firebase saves successfully

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: Dev / Staging / Production

Step 1: ✅ / ❌  Notes: ___________
Step 2: ✅ / ❌  Notes: ___________
Step 3: ✅ / ❌  Notes: ___________
Step 4: ✅ / ❌  Notes: ___________
Step 5: ✅ / ❌  Notes: ___________
Step 6: ✅ / ❌  Notes: ___________
Step 7: ✅ / ❌  Notes: ___________
Step 8: ✅ / ❌  Notes: ___________

AI Integration: ✅ / ❌
Auto-Save: ✅ / ❌
Export: ✅ / ❌
Overall: ✅ / ❌

Issues Found: ___________
```

---

## 🚀 Ready for Production?

### Pre-Deployment Checklist
- [ ] All tests pass
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Firebase rules configured
- [ ] OpenAI API key secured
- [ ] Environment variables set
- [ ] Error boundaries added
- [ ] Analytics configured
- [ ] Documentation complete

---

**Testing Complete! 🎉**

If all tests pass, the QR Wizard is ready for production deployment!
