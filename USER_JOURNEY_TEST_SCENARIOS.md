# CHWOne Platform - User Journey Test Scenarios

**Test Plan Version:** 1.0  
**Date:** December 26, 2024  
**Platform:** CHWOne Community Health Worker Management Platform

---

## Test Environment Setup

### Prerequisites:
- Firebase project configured
- Test database with sample data
- Test user accounts for each role
- OpenAI API key (for AI features)
- Email service configured (for notifications)

### Test Accounts:

```javascript
const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@test.chwone.org',
    password: 'TestAdmin123!',
    role: 'ADMIN',
    organizationType: 'Admin'
  },
  chw: {
    email: 'chw@test.chwone.org',
    password: 'TestCHW123!',
    role: 'CHW',
    organizationType: 'CHW'
  },
  nonprofit: {
    email: 'nonprofit@test.chwone.org',
    password: 'TestNonprofit123!',
    role: 'NONPROFIT_STAFF',
    organizationType: 'Nonprofit'
  },
  association: {
    email: 'association@test.chwone.org',
    password: 'TestAssoc123!',
    role: 'CHW_ASSOCIATION',
    organizationType: 'CHWAssociation'
  },
  multiRole: {
    email: 'multi@test.chwone.org',
    password: 'TestMulti123!',
    roles: ['CHW', 'NONPROFIT_STAFF'],
    primaryRole: 'CHW',
    organizationType: 'CHW'
  }
};
```

---

## Test Scenario 1: New CHW Registration

### Objective:
Verify complete CHW registration workflow from account creation to first login.

### Test Steps:

#### 1.1 Navigate to Registration Page
```
✓ Open browser to https://chwone.org
✓ Click "Register" button in header
✓ Verify registration page loads
✓ Verify stepper shows 3 steps
```

**Expected Result:**
- Registration page displays with Material-UI stepper
- Step 1 "Account Information" is active
- Form fields are empty and ready for input

**Pass/Fail:** ___________

---

#### 1.2 Complete Account Information (Step 1)
```
✓ Enter first name: "Test"
✓ Enter last name: "CHW"
✓ Enter email: "newchw@test.com"
✓ Enter password: "SecurePass123!"
✓ Enter confirm password: "SecurePass123!"
✓ Click "Next" button
```

**Expected Result:**
- All fields accept input
- Password visibility toggle works
- Passwords match validation passes
- Advances to Step 2

**Pass/Fail:** ___________

**Known Issues:**
- [ ] Password strength indicator missing
- [ ] Email validation happens on submit, not on blur

---

#### 1.3 Complete Professional Details (Step 2)
```
✓ Select role: "Community Health Worker"
✓ Enter organization: "Test Health Center"
✓ Enter job title: "Community Health Worker"
✓ Enter reason: "To help my community"
✓ Click "Next" button
```

**Expected Result:**
- Radio buttons work correctly
- Text fields accept input
- Advances to Step 3

**Pass/Fail:** ___________

---

#### 1.4 Review and Submit (Step 3)
```
✓ Verify all entered information displays correctly
✓ Read approval notice
✓ Click "Submit Registration" button
✓ Wait for processing
```

**Expected Result:**
- Review page shows all entered data
- Alert shows "pending approval" message
- Submit button shows loading state
- Success modal appears after submission

**Pass/Fail:** ___________

**Known Issues:**
- [ ] No admin notification email sent
- [ ] User has no way to check approval status

---

#### 1.5 Verify Account Creation
```
✓ Check Firebase Authentication console
✓ Check Firestore users collection
✓ Verify user document exists
✓ Verify isActive = false
✓ Verify pendingApproval = true
```

**Expected Result:**
- User exists in Firebase Auth
- User document in Firestore with correct data
- Account marked as pending approval

**Pass/Fail:** ___________

---

#### 1.6 Admin Approval Process
```
✓ Login as admin
✓ Navigate to Admin → Users tab
✓ Click "Pending Approvals" filter
✓ Find new user
✓ Click "Approve" button
✓ Verify user status changes
```

**Expected Result:**
- New user appears in pending list
- Approve button works
- User status changes to active
- Email sent to user (if configured)

**Pass/Fail:** ___________

**Known Issues:**
- [ ] No email notification to user
- [ ] No approval reason/notes field

---

#### 1.7 First Login
```
✓ Navigate to login page
✓ Enter email: "newchw@test.com"
✓ Enter password: "SecurePass123!"
✓ Click "Sign In"
✓ Wait for redirect
```

**Expected Result:**
- Login succeeds
- Redirects to appropriate page
- User sees their profile or dashboard

**Pass/Fail:** ___________

**Known Issues:**
- [x] CRITICAL: Redirects to /dashboard/regions (404)
- [ ] No welcome message or onboarding

---

### Test Scenario 1 Summary:
- **Total Steps:** 7
- **Passed:** ___________
- **Failed:** ___________
- **Critical Issues:** ___________
- **Overall Status:** ___________

---

## Test Scenario 2: CHW Profile Management

### Objective:
Verify CHW can view and edit their profile information.

### Test Steps:

#### 2.1 Navigate to Profile
```
✓ Login as CHW user
✓ Click "My Profile" in navigation
✓ Verify profile page loads
```

**Expected Result:**
- Profile page displays
- All tabs visible (Basic Info, Professional, Certification, etc.)
- Data loads from Firestore

**Pass/Fail:** ___________

---

#### 2.2 View Profile Information
```
✓ Verify Basic Info tab shows correct data
✓ Click Professional tab
✓ Verify professional details
✓ Click Certification tab
✓ Verify certification info
✓ Click Service Area tab
✓ Verify service area data
```

**Expected Result:**
- All tabs load correctly
- Data matches registration information
- No errors in console

**Pass/Fail:** ___________

---

#### 2.3 Edit Profile
```
✓ Click "Edit Profile" button
✓ Verify form becomes editable
✓ Change bio text
✓ Add new expertise area
✓ Update phone number
✓ Click "Save Changes"
```

**Expected Result:**
- Edit button changes to "Save" and "Cancel"
- Fields become editable
- Changes save to Firestore
- Success message appears

**Pass/Fail:** ___________

**Known Issues:**
- [ ] Edit button hard to find (should be more prominent)
- [ ] No unsaved changes warning

---

#### 2.4 Upload Profile Photo
```
✓ Click on avatar/photo area
✓ Select image file (< 5MB)
✓ Wait for compression
✓ Verify preview shows
✓ Click "Save Changes"
```

**Expected Result:**
- File picker opens
- Image compresses to 400x400
- Preview shows immediately
- Photo saves to Firebase Storage
- URL stored in Firestore

**Pass/Fail:** ___________

**Known Issues:**
- [ ] Large images (>10MB) may fail
- [ ] No progress indicator during upload

---

### Test Scenario 2 Summary:
- **Total Steps:** 4
- **Passed:** ___________
- **Failed:** ___________
- **Critical Issues:** ___________
- **Overall Status:** ___________

---

## Test Scenario 3: Admin User Management

### Objective:
Verify admin can manage users, approve registrations, and assign roles.

### Test Steps:

#### 3.1 Access Admin Panel
```
✓ Login as admin user
✓ Click "Admin" in navigation
✓ Verify admin panel loads
✓ Verify all tabs visible
```

**Expected Result:**
- Admin panel displays
- 11 tabs visible (Settings, Users, States, etc.)
- Access granted without errors

**Pass/Fail:** ___________

---

#### 3.2 View All Users
```
✓ Click "Users" tab
✓ Verify user list loads
✓ Check pagination controls
✓ Test search functionality
✓ Test role filter
```

**Expected Result:**
- User table displays all users
- Pagination works (25 per page)
- Search filters users
- Role filter works

**Pass/Fail:** ___________

**Known Issues:**
- [ ] Table not responsive on mobile
- [ ] No export to CSV option

---

#### 3.3 Approve Pending User
```
✓ Click "Pending Approvals" filter
✓ Select pending user
✓ Click "Approve" button
✓ Verify confirmation dialog
✓ Confirm approval
```

**Expected Result:**
- Pending users display
- Approve button works
- Confirmation dialog appears
- User status updates to active

**Pass/Fail:** ___________

---

#### 3.4 Create New User
```
✓ Click "Create User" button
✓ Fill in user details
✓ Select role
✓ Set permissions
✓ Click "Create"
```

**Expected Result:**
- Create user dialog opens
- Form validation works
- User created in Firebase
- User appears in list

**Pass/Fail:** ___________

---

#### 3.5 Edit User Permissions
```
✓ Select existing user
✓ Click "Edit" button
✓ Change role
✓ Update permissions
✓ Save changes
```

**Expected Result:**
- Edit dialog opens
- Changes save correctly
- User permissions update
- Navigation updates for user

**Pass/Fail:** ___________

---

### Test Scenario 3 Summary:
- **Total Steps:** 5
- **Passed:** ___________
- **Failed:** ___________
- **Critical Issues:** ___________
- **Overall Status:** ___________

---

## Test Scenario 4: Grant Analyzer Workflow

### Objective:
Verify complete grant analysis workflow from document upload to form generation.

### Test Steps:

#### 4.1 Access Grant Analyzer
```
✓ Login as nonprofit staff
✓ Navigate to Grants page
✓ Click "Grant Analyzer Wizard"
✓ Verify wizard opens
```

**Expected Result:**
- Grants page loads
- Wizard button visible
- Wizard opens with 7 steps

**Pass/Fail:** ___________

---

#### 4.2 Upload Grant Document
```
✓ Click "Upload Document" or drag file
✓ Select PDF grant document
✓ Wait for upload
✓ Verify file name displays
```

**Expected Result:**
- File picker opens
- PDF uploads successfully
- File name shows in UI
- File size validated

**Pass/Fail:** ___________

**Known Issues:**
- [ ] No file type validation
- [ ] Large files (>10MB) may timeout

---

#### 4.3 AI Document Analysis
```
✓ Click "Analyze Document"
✓ Wait for AI processing
✓ Verify progress indicator
✓ Check extracted data
```

**Expected Result:**
- Analysis starts
- Progress bar shows activity
- GPT-4o extracts grant data
- Fields auto-populate

**Pass/Fail:** ___________

**Known Issues:**
- [x] CRITICAL: No fallback if AI fails
- [ ] No confidence scores shown
- [ ] Cannot manually correct errors

---

#### 4.4 Review Entity Details
```
✓ Navigate to Entity Details step
✓ Verify collaborating entities listed
✓ Check roles assigned correctly
✓ Add new entity if needed
```

**Expected Result:**
- Entities extracted from document
- Roles assigned (Lead, Partner, Funder)
- Can add/edit/remove entities
- Contact info populated

**Pass/Fail:** ___________

---

#### 4.5 Define Data Collection Methods
```
✓ Navigate to Data Collection step
✓ Review extracted methods
✓ Add new method
✓ Set frequency
✓ Assign responsible entity
```

**Expected Result:**
- Methods extracted from grant
- Can add custom methods
- Frequency dropdown works
- Entity assignment works

**Pass/Fail:** ___________

---

#### 4.6 Set Project Milestones
```
✓ Navigate to Project Planning step
✓ Review auto-generated milestones
✓ Edit milestone dates
✓ Set dependencies
✓ Assign responsibilities
```

**Expected Result:**
- 4-6 milestones generated
- Timeline visualization shows
- Can edit all fields
- Dependencies validated

**Pass/Fail:** ___________

---

#### 4.7 Generate Forms
```
✓ Navigate to Form Generator step
✓ Review auto-generated forms
✓ Preview form
✓ Edit form fields
✓ Save forms
```

**Expected Result:**
- 2-3 forms generated
- Forms match data collection methods
- Preview works
- Can edit field types

**Pass/Fail:** ___________

**Known Issues:**
- [x] CRITICAL: 75+ field types overwhelming
- [ ] No search in field type dropdown
- [ ] Cannot reorder fields easily

---

#### 4.8 View AI Dashboard
```
✓ Navigate to AI Dashboard step
✓ Verify metrics display
✓ Check chart visualizations
✓ Review AI insights
```

**Expected Result:**
- Dashboard loads
- KPI cards show data
- Charts render correctly
- AI insights generated

**Pass/Fail:** ___________

---

#### 4.9 Save Grant
```
✓ Navigate to Review step
✓ Verify all data correct
✓ Click "Save Grant"
✓ Verify success message
```

**Expected Result:**
- Review shows all data
- Save button works
- Grant saved to Firestore
- Redirects to grant list

**Pass/Fail:** ___________

---

### Test Scenario 4 Summary:
- **Total Steps:** 9
- **Passed:** ___________
- **Failed:** ___________
- **Critical Issues:** ___________
- **Overall Status:** ___________

---

## Test Scenario 5: Multi-Role User Switching

### Objective:
Verify users with multiple roles can switch between them seamlessly.

### Test Steps:

#### 5.1 Register as CHW
```
✓ Complete CHW registration
✓ Get admin approval
✓ Login as CHW
✓ Verify CHW navigation
```

**Expected Result:**
- CHW account created
- Only "My Profile" visible in nav
- CHW organization type set

**Pass/Fail:** ___________

---

#### 5.2 Register as Nonprofit (Same Email)
```
✓ Logout
✓ Go to registration
✓ Use same email address
✓ Select "Nonprofit Staff" role
✓ Enter password (same as before)
✓ Complete registration
```

**Expected Result:**
- System detects existing account
- Prompts for password
- Adds NONPROFIT_STAFF to roles array
- Links nonprofit profile

**Pass/Fail:** ___________

**Known Issues:**
- [ ] Error message unclear if wrong password
- [ ] No indication of existing account until submit

---

#### 5.3 View Role Switcher
```
✓ Login with email
✓ Look for role switcher in header
✓ Verify both roles listed
✓ Check current role indicator
```

**Expected Result:**
- Role switcher visible in header
- Shows both CHW and Nonprofit Staff
- Current role highlighted
- Badge shows role count

**Pass/Fail:** ___________

**Known Issues:**
- [x] CRITICAL: Role switcher only visible to admins
- [ ] No role switcher for regular multi-role users

---

#### 5.4 Switch to Nonprofit Role
```
✓ Click role switcher dropdown
✓ Select "Nonprofit Staff"
✓ Wait for page reload
✓ Verify navigation updates
```

**Expected Result:**
- Dropdown shows both roles
- Click switches role
- Page reloads
- Navigation shows all nonprofit tools

**Pass/Fail:** ___________

---

#### 5.5 Verify Role Persistence
```
✓ Logout
✓ Login again
✓ Verify last used role is active
✓ Check primaryRole in Firestore
```

**Expected Result:**
- Last used role remembered
- primaryRole field updated
- Navigation matches role

**Pass/Fail:** ___________

---

### Test Scenario 5 Summary:
- **Total Steps:** 5
- **Passed:** ___________
- **Failed:** ___________
- **Critical Issues:** ___________
- **Overall Status:** ___________

---

## Test Scenario 6: Form Creation and Submission

### Objective:
Verify complete form lifecycle from creation to data collection.

### Test Steps:

#### 6.1 Access Form Builder
```
✓ Login as nonprofit staff or admin
✓ Navigate to Forms page
✓ Click "New Form Wizard"
✓ Verify builder loads
```

**Expected Result:**
- Forms page displays
- New form button visible
- Builder interface loads

**Pass/Fail:** ___________

---

#### 6.2 Create Form with AI
```
✓ Click "AI Form Builder"
✓ Enter form description
✓ Click "Generate Form"
✓ Wait for AI processing
```

**Expected Result:**
- AI builder dialog opens
- Description field accepts input
- GPT-4o generates form structure
- Form fields populate

**Pass/Fail:** ___________

---

#### 6.3 Add Form Fields
```
✓ Click "Add Field"
✓ Select field type from dropdown
✓ Configure field properties
✓ Set validation rules
✓ Add field to form
```

**Expected Result:**
- Field type dropdown opens
- All 75+ types available
- Properties panel shows
- Field added to form

**Pass/Fail:** ___________

**Known Issues:**
- [x] CRITICAL: Dropdown overwhelming (75+ types)
- [ ] No search functionality
- [ ] No favorites or recent types

---

#### 6.4 Preview Form
```
✓ Click "Preview" button
✓ Verify form displays correctly
✓ Test field interactions
✓ Check validation
```

**Expected Result:**
- Preview modal opens
- Form renders as users will see it
- All fields functional
- Validation works

**Pass/Fail:** ___________

---

#### 6.5 Publish Form
```
✓ Click "Publish" button
✓ Set form status to "Published"
✓ Generate shareable link
✓ Create QR code
```

**Expected Result:**
- Publish button works
- Status changes to published
- Shareable link generated
- QR code created

**Pass/Fail:** ___________

---

#### 6.6 Submit Form Response
```
✓ Open shareable link
✓ Fill out form
✓ Submit response
✓ Verify submission saved
```

**Expected Result:**
- Form loads from link
- All fields work
- Submission saves to Firestore
- Confirmation message shows

**Pass/Fail:** ___________

---

#### 6.7 View Submissions
```
✓ Go back to Forms page
✓ Click on form
✓ View submissions tab
✓ Check data collected
```

**Expected Result:**
- Submissions tab shows
- All responses listed
- Data displays correctly
- Can export to CSV

**Pass/Fail:** ___________

---

### Test Scenario 6 Summary:
- **Total Steps:** 7
- **Passed:** ___________
- **Failed:** ___________
- **Critical Issues:** ___________
- **Overall Status:** ___________

---

## Test Scenario 7: CHW Job Search

### Objective:
Verify CHW can search for jobs and receive AI-powered recommendations.

### Test Steps:

#### 7.1 Access Jobs Feature
```
✓ Login as CHW user
✓ Navigate to /chw-tools (manual URL)
✓ Verify jobs section loads
```

**Expected Result:**
- Jobs page displays
- Job listings visible
- AI search available

**Pass/Fail:** ___________

**Known Issues:**
- [x] CRITICAL: No "Jobs" link in CHW navigation
- [ ] Must know URL to access
- [ ] Feature hidden from CHWs who need it

---

#### 7.2 View Recommended Jobs
```
✓ Check "Recommended Jobs" tab
✓ Verify match scores shown
✓ Review match reasons
✓ Check job details
```

**Expected Result:**
- Jobs with 50%+ match displayed
- Match percentage shown
- Reasons listed (skills, location, etc.)
- Full job details available

**Pass/Fail:** ___________

---

#### 7.3 Use AI Job Search
```
✓ Click "AI Search" button
✓ Enter natural language query
✓ Example: "remote diabetes care positions"
✓ Wait for AI processing
```

**Expected Result:**
- AI search dialog opens
- Query field accepts input
- GPT-4o processes request
- Relevant jobs returned

**Pass/Fail:** ___________

---

#### 7.4 Save Job
```
✓ Click "Save Job" on listing
✓ Verify job added to saved list
✓ Navigate to "Saved Jobs" tab
✓ Verify job appears
```

**Expected Result:**
- Save button works
- Job saved to Firestore
- Saved jobs tab shows job
- Can remove from saved

**Pass/Fail:** ___________

---

#### 7.5 Apply to Job
```
✓ Click "Apply Now" button
✓ Verify redirect to employer site
✓ Check application tracking
```

**Expected Result:**
- Apply button works
- Opens employer application page
- Application tracked (if implemented)

**Pass/Fail:** ___________

**Known Issues:**
- [ ] No application tracking
- [ ] No notification when applied
- [ ] Cannot track application status

---

### Test Scenario 7 Summary:
- **Total Steps:** 5
- **Passed:** ___________
- **Failed:** ___________
- **Critical Issues:** ___________
- **Overall Status:** ___________

---

## Test Scenario 8: Mobile Responsiveness

### Objective:
Verify platform works correctly on mobile devices.

### Test Steps:

#### 8.1 Mobile Login
```
Device: iPhone 13 (390x844)
✓ Navigate to login page
✓ Verify layout responsive
✓ Enter credentials
✓ Submit form
```

**Expected Result:**
- Login form fits screen
- Fields are tappable
- Keyboard doesn't obscure fields
- Login succeeds

**Pass/Fail:** ___________

---

#### 8.2 Mobile Navigation
```
✓ Open mobile menu
✓ Verify all menu items visible
✓ Test navigation links
✓ Check user menu
```

**Expected Result:**
- Hamburger menu works
- Drawer opens smoothly
- All links accessible
- User info displayed

**Pass/Fail:** ___________

**Known Issues:**
- [ ] Drawer doesn't show user name
- [ ] No role indicator in mobile menu

---

#### 8.3 Mobile Profile Editing
```
✓ Navigate to profile
✓ Click edit button
✓ Modify fields
✓ Save changes
```

**Expected Result:**
- Profile loads correctly
- Edit button visible and tappable
- Fields editable on mobile
- Save works

**Pass/Fail:** ___________

---

#### 8.4 Mobile Form Filling
```
✓ Open form link on mobile
✓ Fill out all fields
✓ Submit form
✓ Verify submission
```

**Expected Result:**
- Form renders correctly
- All field types work on mobile
- Submission succeeds
- Confirmation shows

**Pass/Fail:** ___________

---

#### 8.5 Mobile Admin Panel
```
Device: iPad Pro (1024x1366)
✓ Login as admin
✓ Navigate to admin panel
✓ Test tabs
✓ View user table
```

**Expected Result:**
- Admin panel loads
- Tabs scrollable
- Tables responsive
- All functions work

**Pass/Fail:** ___________

**Known Issues:**
- [x] CRITICAL: Tables overflow on mobile
- [ ] Tabs not scrollable on small screens
- [ ] No mobile-optimized admin view

---

### Test Scenario 8 Summary:
- **Total Steps:** 5
- **Passed:** ___________
- **Failed:** ___________
- **Critical Issues:** ___________
- **Overall Status:** ___________

---

## Validation Checklist

### Authentication & Authorization

- [ ] Users can register successfully
- [ ] Email validation works correctly
- [ ] Password strength requirements enforced
- [ ] Admin approval workflow functions
- [ ] Login redirects to correct page
- [ ] Logout clears session properly
- [ ] Session timeout works (if implemented)
- [ ] Password reset flow works (if implemented)
- [ ] Multi-role users can switch roles
- [ ] Role-based navigation displays correctly
- [ ] Unauthorized access blocked

### Navigation & UX

- [ ] All navigation links work
- [ ] Breadcrumbs show current location
- [ ] Back button works correctly
- [ ] Mobile menu functions properly
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Pagination works
- [ ] Loading states display
- [ ] Error messages are clear
- [ ] Success messages appear

### Data Management

- [ ] Forms save correctly to Firestore
- [ ] Data loads from Firestore
- [ ] Real-time updates work
- [ ] File uploads succeed
- [ ] Image compression works
- [ ] Data validation prevents invalid entries
- [ ] Required fields enforced
- [ ] Data exports work (CSV, PDF)

### AI Features

- [ ] Grant document analysis works
- [ ] AI form generation succeeds
- [ ] Job matching algorithm accurate
- [ ] AI search returns relevant results
- [ ] AI insights generated correctly
- [ ] Confidence scores displayed
- [ ] Fallback when AI fails

### Performance

- [ ] Pages load in < 3 seconds
- [ ] No console errors
- [ ] Images optimized
- [ ] Lazy loading works
- [ ] Caching implemented
- [ ] Database queries optimized
- [ ] No memory leaks

### Security

- [ ] API keys not exposed
- [ ] CORS configured correctly
- [ ] CSRF protection enabled
- [ ] Input sanitization works
- [ ] SQL injection prevented
- [ ] XSS attacks blocked
- [ ] Rate limiting active
- [ ] Firestore rules enforced

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Alt text on images
- [ ] Form labels associated
- [ ] Error announcements work

### Mobile Responsiveness

- [ ] Works on iPhone (390px)
- [ ] Works on Android (360px)
- [ ] Works on iPad (768px)
- [ ] Works on iPad Pro (1024px)
- [ ] Touch targets adequate (44px)
- [ ] Text readable without zoom
- [ ] No horizontal scrolling
- [ ] Gestures work correctly

---

## Bug Report Template

### Bug ID: ___________
**Title:** ___________________________________________

**Severity:** 
- [ ] Critical (Blocks core functionality)
- [ ] High (Major feature broken)
- [ ] Medium (Feature partially works)
- [ ] Low (Minor issue)

**Priority:**
- [ ] P0 (Fix immediately)
- [ ] P1 (Fix this week)
- [ ] P2 (Fix this month)
- [ ] P3 (Fix when possible)

**Affected User Types:**
- [ ] All Users
- [ ] Admin
- [ ] CHW
- [ ] Nonprofit Staff
- [ ] CHW Association
- [ ] Multi-Role Users

**Steps to Reproduce:**
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

**Expected Result:**
___________________________________________

**Actual Result:**
___________________________________________

**Screenshots/Videos:**
___________________________________________

**Environment:**
- Browser: ___________
- OS: ___________
- Screen Size: ___________
- Account Type: ___________

**Console Errors:**
```
___________________________________________
```

**Firestore Data:**
```json
___________________________________________
```

**Suggested Fix:**
___________________________________________

**Assigned To:** ___________
**Status:** [ ] Open [ ] In Progress [ ] Fixed [ ] Verified

---

## Test Execution Summary

### Overall Statistics:
- **Total Test Scenarios:** 8
- **Total Test Steps:** 52
- **Passed:** ___________
- **Failed:** ___________
- **Blocked:** ___________
- **Not Tested:** ___________

### Critical Issues Found:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### High Priority Issues Found:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### Recommendations:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### Next Steps:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

---

**Test Executed By:** ___________  
**Date:** ___________  
**Sign-off:** ___________
