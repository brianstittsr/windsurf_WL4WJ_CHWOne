# CHWOne Platform Recreation Prompt

## Overview
Create a comprehensive Community Health Worker (CHW) management platform with the following core modules. This is a Next.js 14+ application using TypeScript, Material-UI, and Firebase (Firestore) for data persistence.

---

## 1. My Profile Form

### Requirements
Create a user profile management system for Community Health Workers with the following features:

**Profile Fields:**
- Personal Information:
  - First Name, Middle Name, Last Name
  - Preferred Name
  - Date of Birth
  - Email Address (validated)
  - Phone Number
  - Mailing Address (textarea)
  - Emergency Contact Name
  - Emergency Contact Phone

- Employment Information:
  - Hire Date
  - Position/Title
  - Department
  - Supervisor Name
  - Employment Status (Full-time, Part-time, Contract)

- Professional Information:
  - Certifications (array of certification objects)
  - Languages Spoken (multi-select)
  - Areas of Expertise (tags/chips)
  - Service Areas (geographic regions)

**Features:**
- Editable mode toggle
- Real-time validation
- Auto-save functionality
- Profile photo upload
- Role-based field visibility
- Firestore integration for data persistence
- Loading states and error handling
- Success/error notifications

**Technical Stack:**
- Next.js App Router (`/profile`)
- Material-UI components (TextField, Select, DatePicker, etc.)
- Firebase Firestore for data storage
- TypeScript interfaces for type safety
- Form validation with error messages
- Responsive design (mobile-first)

---

## 2. Forms Management

### Requirements
Create a comprehensive form builder and management system with CRUD operations.

**Core Features:**

**Form List View:**
- Table view with columns:
  - Title
  - Description
  - Category (Attendance, Onboarding, Assessment, Survey, Other)
  - Tags (chips)
  - Organization (Region5, WL4WJ, General)
  - QR Code (enabled/disabled badge)
  - Status (Draft, Published, Archived)
  - Created Date
  - Actions (View, Edit, Data, Delete)

- Card/Grid view option
- Grouping by: Category, Organization, Status, or None
- Search and filter functionality
- Statistics cards (Filtered Forms, Published Forms, Total Fields)

**Form Actions:**
- **View:** Read-only modal showing form details
- **Edit:** Edit form title, description, fields, settings
- **Data:** Navigate to linked dataset to view responses
- **Delete:** Confirmation modal with option to delete linked dataset

**Form Builder:**
- Add/remove fields dynamically
- Field types supported:
  - Text, Email, Number, Phone
  - Textarea, Date, Time, DateTime
  - Select (dropdown), Radio, Checkbox
  - File Upload
  - Rating Scale, Slider
  - Currency, Percentage
  - Signature, Location

- Field properties:
  - Label, Placeholder, Help Text
  - Required toggle
  - Validation rules
  - Min/Max values (for numbers)
  - Options (for select/radio/checkbox)

**Form Settings:**
- QR Code generation for public access
- Public URL for anonymous submissions
- Confirmation message customization
- Allow anonymous submissions toggle
- Link to dataset for response storage

**Technical Implementation:**
- Firestore collections: `forms`, `datasets`
- Real-time updates with Firestore listeners
- Form schema validation
- Public form rendering at `/forms/public/[formId]`
- QR code generation library
- Export forms as JSON

---

## 3. AI Form Builder

### Requirements
Create an AI-powered form generation wizard using natural language prompts.

**Features:**

**Wizard Interface:**
- Step 1: Describe the form purpose (textarea)
- Step 2: AI generates suggested fields
- Step 3: Review and customize fields
- Step 4: Configure form settings
- Step 5: Save and publish

**AI Integration:**
- Use OpenAI API or similar for form generation
- Parse natural language to extract:
  - Form title and description
  - Required fields and types
  - Validation rules
  - Field options (for select/radio)

**Example Prompts:**
- "Create a patient intake form with name, date of birth, contact info, medical history, and current medications"
- "Build a training attendance sheet with participant name, date, session title, and signature"
- "Generate a community health assessment with demographics, health concerns, and service needs"

**Generated Output:**
- Form schema with all fields
- Appropriate field types
- Validation rules
- Default values
- Help text for complex fields

**Customization:**
- Edit AI-generated fields
- Add/remove fields
- Reorder fields (drag and drop)
- Adjust field properties
- Preview form before saving

**Technical Stack:**
- Multi-step wizard component
- OpenAI API integration
- JSON schema generation
- Form preview component
- Save to Firestore as draft
- Option to use as template

---

## 4. Datasets

### Requirements
Create a dataset management system for viewing and analyzing form responses.

**Dataset List View:**
- Table showing all datasets:
  - Name
  - Description
  - Format (JSON, CSV)
  - Size (bytes)
  - Record Count
  - Created Date
  - Updated Date
  - Status (Active, Archived)
  - Actions (View, Export, Delete)

- Filter by:
  - User's datasets
  - System datasets (from forms)
  - Date range
  - Status

**Dataset Detail View (`/datasets/[id]`):**

**View Modes:**
- **Table View:**
  - Paginated table of records
  - Sortable columns
  - Search/filter records
  - Row click to view details
  - Bulk selection for export

- **JSON View:**
  - Syntax-highlighted JSON
  - Collapsible tree structure
  - Copy to clipboard
  - Download as JSON file

**Record Detail Modal:**
- Show individual record in formatted view
- All fields with labels
- Metadata (submission ID, timestamp, user)
- Copy record as JSON
- Navigate between records

**Export Options:**
- Download as CSV
- Download as JSON
- Export selected records
- Export all records
- Custom field selection

**Dataset Properties:**
- Linked to source form (formId)
- Auto-created on first form submission
- Fields schema from form
- Records array with submissions
- Metadata tracking

**Technical Implementation:**
- Firestore collection: `datasets`
- Real-time record updates
- CSV generation from JSON
- JSON syntax highlighting
- Pagination for large datasets
- Search and filter logic

---

## 5. Form Templates

### Requirements
Create a template library with pre-built forms that users can copy and customize.

**Template Categories:**
- Attendance (Basic Attendance, Training Attendance)
- Onboarding (CHW Onboarding, Client Onboarding)
- Assessment (Community Health Assessment)
- Survey (Satisfaction Survey, Needs Assessment)
- Other (Custom templates)

**Template Structure:**
```json
{
  "id": "template-id",
  "name": "Template Name",
  "description": "Template description",
  "category": "attendance",
  "isDefault": true,
  "schema": {
    "title": "Form Title",
    "description": "Form description",
    "sections": [
      {
        "id": "section-id",
        "title": "Section Title",
        "fields": [
          {
            "id": "field-id",
            "type": "text",
            "label": "Field Label",
            "placeholder": "Placeholder text",
            "required": true,
            "validation": {}
          }
        ]
      }
    ]
  },
  "metadata": {
    "tags": ["tag1", "tag2"],
    "author": "System",
    "version": "1.0"
  }
}
```

**Template Features:**

**Browse Templates:**
- Grid/card view of templates
- Category tabs
- Search functionality
- Template preview
- Use template button

**Template Preview:**
- Modal showing template details
- List of all fields
- Sections and organization
- Estimated completion time
- Use template or close

**Copy Template:**
- Creates new form from template
- Flattens nested schema into fields array
- Sets user as owner
- Creates linked dataset
- Status set to draft
- Redirects to forms management

**Template Flattening:**
- Extract fields from all sections
- Convert to flat array structure
- Map field properties correctly
- Handle options for select/radio/checkbox
- Preserve validation rules

**Built-in Templates:**
1. **Basic Attendance Form**
   - Name, Date, Time In, Time Out, Signature

2. **Training Attendance Sheet**
   - Participant Name, Organization, Session Title, Date, Signature, CEU Tracking

3. **CHW Onboarding Checklist**
   - Personal Info, Employment Info, Certifications, Background Check, Training Completion

4. **Client Onboarding**
   - Client Demographics, Contact Info, Service Needs, Consent Forms

5. **Community Health Assessment**
   - Demographics, Health Status, Service Needs, Barriers to Care

**Technical Implementation:**
- Templates stored as JSON files in `/src/data/formTemplates/`
- Template copying logic
- Schema flattening algorithm
- Dataset auto-creation
- Form-dataset linking

---

## 6. Reports

### Requirements
Create a reporting and analytics dashboard for form submissions and CHW activities.

**Report Types:**

**1. Form Submission Reports:**
- Total submissions by form
- Submissions over time (line chart)
- Submissions by organization
- Response rate tracking
- Completion time analytics

**2. CHW Activity Reports:**
- Active CHWs count
- Forms created per CHW
- Submissions collected per CHW
- Geographic coverage
- Service delivery metrics

**3. Dataset Analytics:**
- Record count trends
- Data quality metrics
- Missing field analysis
- Response distribution
- Field value frequency

**Dashboard Components:**

**Summary Cards:**
- Total Forms
- Total Submissions
- Active CHWs
- Datasets Created

**Charts:**
- Submissions over time (line/area chart)
- Forms by category (pie/donut chart)
- Submissions by organization (bar chart)
- Response rate by form (horizontal bar)
- Geographic distribution (map or bar chart)

**Data Tables:**
- Top performing forms
- Recent submissions
- CHW leaderboard
- Forms needing attention (low response rate)

**Filters:**
- Date range picker
- Organization filter
- Form category filter
- CHW filter
- Status filter

**Export Options:**
- Export report as PDF
- Export data as CSV
- Export charts as images
- Schedule automated reports
- Email report delivery

**Technical Implementation:**
- Chart library (Recharts or Chart.js)
- Firestore aggregation queries
- Date range filtering
- Real-time data updates
- PDF generation library
- CSV export functionality

---

## Global Technical Requirements

### Tech Stack:
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI Library:** Material-UI (MUI) v5+
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Styling:** Material-UI sx prop, CSS modules
- **State Management:** React hooks (useState, useEffect, useContext)
- **Form Handling:** Controlled components
- **Validation:** Custom validation functions
- **Icons:** Material-UI Icons (@mui/icons-material)

### Project Structure:
```
src/
├── app/
│   ├── profile/
│   ├── forms/
│   │   ├── page.tsx (Forms Management)
│   │   ├── templates/
│   │   └── public/[formId]/
│   ├── datasets/
│   │   ├── page.tsx (Dataset List)
│   │   └── [id]/page.tsx (Dataset Detail)
│   ├── reports/
│   └── api/
├── components/
│   ├── Forms/
│   │   ├── FormsManagement.tsx
│   │   ├── BmadFormWizard.tsx (AI Builder)
│   │   └── FormRenderer.tsx
│   ├── CHW/
│   │   └── EnhancedProfileComponent.tsx
│   ├── Layout/
│   │   ├── UnifiedLayout.tsx
│   │   └── RoleSwitcher.tsx
│   └── Reports/
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── firebase.ts
├── types/
│   ├── form.types.ts
│   ├── dataset.types.ts
│   └── chw-profile.types.ts
├── data/
│   └── formTemplates/
│       ├── attendanceSheet.json
│       ├── chwOnboarding.json
│       └── ...
└── constants/
    └── formFieldTypes.ts
```

### Firebase Collections:

**forms:**
```typescript
{
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  organization: 'region5' | 'wl4wj' | 'general';
  qrCodeEnabled: boolean;
  publicUrl: string;
  datasetId?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**datasets:**
```typescript
{
  id: string;
  name: string;
  description: string;
  formId: string;
  userId: string;
  format: 'json' | 'csv';
  size: number;
  recordCount: number;
  rowCount: number;
  fields: DatasetField[];
  records: Record<string, any>[];
  metadata: {
    sourceForm: string;
    sourceFormId: string;
    autoGenerated: boolean;
  };
  status: 'active' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**chwProfiles:**
```typescript
{
  id: string;
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: Timestamp;
  email: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  employment: {
    hireDate: Timestamp;
    position: string;
    department: string;
    supervisor: string;
    status: string;
  };
  certifications: Certification[];
  languages: string[];
  expertise: string[];
  serviceAreas: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Key Features Across All Modules:

1. **Authentication & Authorization:**
   - Firebase Auth integration
   - Role-based access control (Admin, CHW, Supervisor)
   - User context provider
   - Protected routes

2. **Responsive Design:**
   - Mobile-first approach
   - Breakpoints: xs, sm, md, lg, xl
   - Touch-friendly UI elements
   - Adaptive layouts

3. **Error Handling:**
   - Try-catch blocks for async operations
   - User-friendly error messages
   - Console logging for debugging
   - Fallback UI for errors

4. **Loading States:**
   - Skeleton loaders
   - Progress indicators
   - Disabled states during operations
   - Loading spinners

5. **Data Validation:**
   - Client-side validation
   - Required field checking
   - Format validation (email, phone, date)
   - Custom validation rules

6. **User Feedback:**
   - Success notifications (Snackbar/Alert)
   - Error alerts
   - Confirmation dialogs
   - Progress indicators

7. **Performance:**
   - Lazy loading
   - Pagination for large datasets
   - Debounced search
   - Optimized Firestore queries

8. **Accessibility:**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Color contrast compliance

---

## Implementation Priority:

1. **Phase 1:** My Profile Form + Authentication
2. **Phase 2:** Forms Management (CRUD operations)
3. **Phase 3:** Form Templates + Template Copying
4. **Phase 4:** Datasets (List and Detail views)
5. **Phase 5:** Public Form Submission
6. **Phase 6:** AI Form Builder
7. **Phase 7:** Reports and Analytics

---

## Testing Requirements:

- Unit tests for utility functions
- Integration tests for Firestore operations
- E2E tests for critical user flows
- Form validation testing
- Responsive design testing
- Cross-browser compatibility

---

## Deployment:

- Vercel or Firebase Hosting
- Environment variables for Firebase config
- Production and staging environments
- CI/CD pipeline
- Error monitoring (Sentry)

---

## Additional Notes:

- Use TypeScript strict mode
- Follow Next.js best practices
- Implement proper SEO (metadata)
- Add loading.tsx and error.tsx files
- Use Server Components where appropriate
- Implement proper caching strategies
- Add analytics tracking
- Implement data export features
- Add bulk operations support
- Include data backup/restore functionality
