# Digital Literacy Program - User Journeys & Implementation Plan

## Overview

This document outlines the complete user journeys for the Digital Literacy Program, including forms, workflows, and links for both **Instructors** and **Participants (Students)**.

---

## Quick Links - Forms & Tools

| Form/Tool | Purpose | URL | Status |
|-----------|---------|-----|--------|
| Student Registration (Bilingual) | Register new participants | `/forms/digital-literacy` | ✅ Ready |
| QR Code Attendance Check-in | Students scan to record attendance | `/checkin/[classId]?location=[locationId]` | ✅ Ready |
| QR Code Generator (Instructor) | Generate QR codes for each class | Component: `ClassQRCodeGenerator` | ✅ Ready |
| Instructor Attendance Modal | Bulk add attendance records | Component: `InstructorAttendanceModal` | ✅ Ready |
| Participant Progress Tracking | Students mark completed sections | `/progress/[studentId]` | ✅ Ready |
| Drop/Withdrawal Form | Record when students leave program | `/forms/withdrawal` | ✅ Ready |
| Computer Asset Tracking | Track device distribution | `/forms/asset-tracking` | ✅ Ready |
| Participant Feedback Form | Collect student feedback | `/forms/feedback` | ✅ Ready |
| Train the Trainer Completion | Track instructor certifications | `/forms/trainer-completion` | 🔲 TODO |

---

## TODO Checklist

### Phase 1: Core Registration & Attendance (Priority: HIGH)

- [ ] **1.1 Update Student Registration Form**
  - [ ] Ensure bilingual toggle (English/Spanish) works correctly
  - [ ] Limit county dropdown to Moore and Montgomery only
  - [ ] Fields: Name, Email, Phone, County
  - [ ] Add validation for all required fields
  - [ ] Store in Firestore `digitalLiteracyStudents` collection
  - **Link:** `/forms/digital-literacy`

- [ ] **1.2 Enhance QR Code Attendance System**
  - [ ] Update check-in page to show dropdown of registered students
  - [ ] Auto-populate date and class based on QR code
  - [ ] Add location field (prepopulated from QR)
  - [ ] Confirm attendance with success message
  - **Link:** `/checkin/[classId]?location=[locationId]`

- [ ] **1.3 Create Instructor Attendance Modal**
  - [ ] Modal form for bulk attendance entry
  - [ ] Support 108+ participants
  - [ ] Fields: Instructor Name, Date, Location, Topic, Units Completed
  - [ ] Batch save to Firestore
  - **Link:** `/forms/instructor-attendance`

### Phase 2: Progress & Tracking (Priority: HIGH)

- [ ] **2.1 Create Participant Progress Tracking Page**
  - [ ] Web page for students to mark completed sections
  - [ ] Checklist of all 10 units
  - [ ] Visual progress indicator
  - [ ] Bilingual support
  - **Link:** `/progress/[studentId]`

- [ ] **2.2 Create Drop/Withdrawal Tracking**
  - [ ] Form for instructor or student to record withdrawal
  - [ ] Fields: Student Name, Date, Reason for Dropping
  - [ ] Update student status in database
  - [ ] Generate report of dropouts
  - **Link:** `/forms/withdrawal`

### Phase 3: Asset & Feedback (Priority: MEDIUM)

- [ ] **3.1 Create Computer Asset Tracking**
  - [ ] Track device distribution to students
  - [ ] Fields: Student Name, Device Type, Serial Number, Date Given
  - [ ] Asset inventory management
  - [ ] Return/recovery tracking
  - **Link:** `/forms/asset-tracking`

- [ ] **3.2 Create Participant Feedback Form**
  - [ ] Post-program feedback collection
  - [ ] Rating scales and open-ended questions
  - [ ] Bilingual support
  - [ ] Anonymous option
  - **Link:** `/forms/feedback`

### Phase 4: Instructor Management (Priority: MEDIUM)

- [ ] **4.1 Create Train the Trainer Completion Tracking**
  - [ ] Track instructor certification status
  - [ ] Fields: Instructor Name, Training Date, Certification Status
  - [ ] Certificate generation
  - **Link:** `/forms/trainer-completion`

---

## User Journey: INSTRUCTOR

### Setup Phase
```
1. Login to CHWOne Platform
   └── Navigate to: /dashboard

2. Access Digital Literacy Program
   └── Navigate to: /collaborations/[grantId] → Programs Tab

3. Register Students
   └── Share registration link: /forms/digital-literacy
   └── Or manually add via Instructor Attendance Modal

4. Generate QR Codes for Classes
   └── Use ClassQRCodeGenerator component
   └── Print QR codes for each class session
   └── Each QR encodes: /checkin/class1, /checkin/class2, etc.
```

### Daily Class Flow
```
1. Before Class
   └── Print/display QR code for today's class
   └── Prepare attendance sheet as backup

2. During Class
   └── Students scan QR code on arrival
   └── Students select their name from dropdown
   └── System records: Student, Date, Time, Class, Location

3. After Class
   └── Review attendance in Instructor Dashboard
   └── Use Instructor Attendance Modal for manual entries
   └── Mark units completed for each student
```

### Progress Tracking
```
1. Weekly Progress Review
   └── Navigate to: /collaborations/[grantId] → Datasets Tab
   └── View student progress across all units
   └── Identify students falling behind

2. Handle Withdrawals
   └── Navigate to: /forms/withdrawal
   └── Record reason for dropping
   └── Update student status
```

### Program Completion
```
1. Final Assessment
   └── Mark all units complete for graduating students
   └── Record device distribution via Asset Tracking

2. Collect Feedback
   └── Share feedback form: /forms/feedback
   └── Review responses for program improvement

3. Generate Reports
   └── Export attendance data
   └── Export completion rates
   └── Export feedback summary
```

---

## User Journey: STUDENT (PARTICIPANT)

### Registration
```
1. Receive Registration Link
   └── From instructor or program coordinator
   └── Link: /forms/digital-literacy

2. Complete Registration Form
   └── Toggle language: English ↔ Español
   └── Enter: Name, Email, Phone, County
   └── Select preferred class time
   └── Submit registration

3. Receive Confirmation
   └── Email confirmation with class details
   └── Instructions for first day
```

### Daily Attendance
```
1. Arrive at Class
   └── Locate QR code displayed by instructor

2. Scan QR Code
   └── Use smartphone camera
   └── Opens: /checkin/[classId]

3. Record Attendance
   └── Select your name from dropdown
   └── Confirm check-in
   └── See success message with class info
```

### Progress Tracking
```
1. Access Progress Page
   └── Link: /progress/[studentId]
   └── Or scan personal progress QR code

2. Mark Completed Sections
   └── Check off units as completed
   └── View overall progress percentage
   └── See remaining units
```

### Program Completion
```
1. Complete All Units
   └── Attend all 6 class sessions
   └── Complete all 10 units

2. Receive Computer (if applicable)
   └── Sign asset receipt form
   └── Receive device and accessories

3. Provide Feedback
   └── Complete feedback form: /forms/feedback
   └── Rate program and instructor
   └── Suggest improvements

4. Receive Certificate
   └── Download/print completion certificate
```

---

## Best Practices & Recommendations

### Accessibility
- [ ] Ensure all forms are mobile-responsive
- [ ] Support screen readers
- [ ] High contrast mode for visibility
- [ ] Large touch targets for QR scanning

### Data Integrity
- [ ] Validate all form inputs
- [ ] Prevent duplicate registrations (check email)
- [ ] Backup attendance data daily
- [ ] Audit trail for all changes

### User Experience
- [ ] Auto-save form progress
- [ ] Offline support for check-in (sync when online)
- [ ] SMS notifications for class reminders
- [ ] Email confirmations for all submissions

### Reporting
- [ ] Real-time attendance dashboard
- [ ] Weekly progress reports
- [ ] Dropout analysis
- [ ] Completion rate tracking
- [ ] Feedback aggregation

### Security
- [ ] Secure student data (PII protection)
- [ ] Role-based access control
- [ ] Audit logging for sensitive operations
- [ ] GDPR/privacy compliance

---

## Database Schema

### Collections

```typescript
// digitalLiteracyStudents
{
  id: string;
  name: string;
  email: string;
  phone: string;
  county: 'moore' | 'montgomery';
  classTime: string;
  registrationDate: Timestamp;
  status: 'active' | 'completed' | 'dropped';
  dropReason?: string;
  dropDate?: Timestamp;
  completedUnits: string[];
  computerAsset?: {
    deviceType: string;
    serialNumber: string;
    dateGiven: Timestamp;
    returned?: boolean;
    returnDate?: Timestamp;
  };
}

// digitalLiteracyAttendance
{
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: Timestamp;
  checkInTime: Timestamp;
  location: string;
  instructorId?: string;
  unitsCompleted: string[];
  method: 'qr_scan' | 'manual_entry';
}

// digitalLiteracyInstructors
{
  id: string;
  name: string;
  email: string;
  trainTheTrainerDate?: Timestamp;
  certificationStatus: 'pending' | 'certified' | 'expired';
  classesAssigned: string[];
}

// digitalLiteracyFeedback
{
  id: string;
  studentId?: string; // optional for anonymous
  date: Timestamp;
  overallRating: number;
  instructorRating: number;
  contentRating: number;
  comments: string;
  suggestions: string;
  wouldRecommend: boolean;
}
```

---

## Implementation Priority

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 🔴 HIGH | Update QR Check-in with student dropdown | 2 days | High |
| 🔴 HIGH | Instructor Attendance Modal | 2 days | High |
| 🔴 HIGH | Participant Progress Tracking | 2 days | High |
| 🟡 MEDIUM | Drop/Withdrawal Form | 1 day | Medium |
| 🟡 MEDIUM | Computer Asset Tracking | 1 day | Medium |
| 🟡 MEDIUM | Participant Feedback Form | 1 day | Medium |
| 🟢 LOW | Train the Trainer Tracking | 1 day | Low |
| 🟢 LOW | SMS Notifications | 2 days | Medium |
| 🟢 LOW | Offline Support | 3 days | Medium |

---

## Next Steps

1. **Review this document** with stakeholders
2. **Prioritize features** based on program launch date
3. **Begin Phase 1** implementation
4. **Test with pilot group** before full rollout
5. **Gather feedback** and iterate

---

*Last Updated: January 9, 2026*
*Document Version: 1.0*
