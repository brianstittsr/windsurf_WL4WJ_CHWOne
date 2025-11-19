# Leadership Connections Platform Recreation Prompt

## Overview
Create a comprehensive Leadership Connections networking platform for past leadership members and program graduates. This platform facilitates professional networking, mentorship, and community engagement among North Carolina's leadership alumni. This is a Next.js 14+ application using TypeScript, Material-UI, and Firebase (Firestore) for data persistence.

**Platform Purpose:**
- Connect past leadership program members and graduates
- Enable professional networking and mentorship opportunities
- Maintain alumni directory with searchable profiles
- Facilitate knowledge sharing and collaboration
- Track leadership program participation and achievements
- Support ongoing community engagement

---

## 1. Member Profile Form

### Requirements
Create a comprehensive profile management system for Leadership Connections members (past participants and graduates) to facilitate networking and professional connections.

**Profile Fields:**

- **Personal Information:**
  - First Name, Middle Name, Last Name
  - Preferred Name
  - Profile Photo (upload)
  - Email Address (validated, primary contact)
  - Phone Number (optional, with privacy settings)
  - LinkedIn Profile URL
  - Personal Website/Portfolio URL
  - City, State, ZIP Code
  - Bio/About Me (rich text, 500 char max)

- **Leadership Program Information:**
  - Program(s) Attended (multi-select):
    - Leadership North Carolina
    - Leadership Asheville
    - Leadership Greensboro
    - Leadership Charlotte
    - Other NC Leadership Programs
  - Graduation Year(s) (array for multiple programs)
  - Class/Cohort Number
  - Program Location/Chapter
  - Current Membership Status (Active, Alumni, Lifetime)
  - Participation Type (Graduate, Participant, Mentor, Faculty)

- **Professional Information:**
  - Current Job Title
  - Current Organization/Company
  - Industry/Sector (dropdown):
    - Healthcare
    - Education
    - Government/Public Service
    - Nonprofit
    - Business/Corporate
    - Technology
    - Finance
    - Legal
    - Other
  - Years of Experience
  - Previous Organizations (array)
  - Professional Certifications
  - Board Memberships (current and past)
  - Awards and Recognition

- **Networking & Expertise:**
  - Areas of Expertise (tags/chips):
    - Leadership Development
    - Community Engagement
    - Strategic Planning
    - Fundraising
    - Marketing/Communications
    - Human Resources
    - Finance/Accounting
    - Technology/Innovation
    - Diversity & Inclusion
    - Nonprofit Management
    - Public Policy
    - Education
    - Healthcare
    - Economic Development
  - Skills (multi-select tags)
  - Languages Spoken
  - Willing to Mentor (Yes/No)
  - Seeking Mentorship (Yes/No)
  - Open to Networking (Yes/No)
  - Available for Speaking Engagements (Yes/No)
  - Volunteer Interests

- **Community Engagement:**
  - Current Community Involvement
  - Volunteer Activities
  - Causes Passionate About (tags)
  - Geographic Areas of Interest (NC regions)
  - Preferred Connection Methods (Email, Phone, LinkedIn, In-Person)

- **Privacy Settings:**
  - Profile Visibility (Public, Members Only, Private)
  - Show Email (Yes/No)
  - Show Phone (Yes/No)
  - Show Current Employer (Yes/No)
  - Allow Direct Messages (Yes/No)
  - Include in Directory Search (Yes/No)

**Features:**
- Editable mode toggle (view/edit)
- Real-time validation
- Auto-save functionality (draft mode)
- Profile photo upload with cropping
- Privacy controls for each field
- Public profile preview
- Profile completeness indicator (progress bar)
- Social media integration (LinkedIn import)
- Export profile as PDF/vCard
- Profile sharing via unique URL
- Role-based field visibility
- Firestore integration for data persistence
- Loading states and error handling
- Success/error notifications
- Profile verification badge (for confirmed alumni)

**Technical Stack:**
- Next.js App Router (`/profile`, `/members/[id]`)
- Material-UI components (TextField, Select, Autocomplete, etc.)
- Firebase Firestore for data storage
- Firebase Storage for profile photos
- TypeScript interfaces for type safety
- Form validation with error messages
- Rich text editor for bio (TipTap or Quill)
- Image cropping library (react-easy-crop)
- Responsive design (mobile-first)
- SEO optimization for public profiles

---

## 2. Forms Management

### Requirements
Create a comprehensive form builder and management system for member engagement, event registration, surveys, and data collection.

**Use Cases:**
- Event registration (networking events, conferences, workshops)
- Member surveys (satisfaction, needs assessment, feedback)
- Mentorship program applications
- Volunteer opportunity sign-ups
- Board nomination forms
- Program evaluation forms
- Alumni updates and check-ins

**Core Features:**

**Form List View:**
- Table view with columns:
  - Title
  - Description
  - Category (Event Registration, Survey, Application, Update, Other)
  - Tags (chips)
  - Program/Chapter (Leadership NC, Asheville, Charlotte, Greensboro, Statewide)
  - QR Code (enabled/disabled badge)
  - Status (Draft, Published, Archived)
  - Created Date
  - Response Count
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
- "Create an event registration form for our annual Leadership Summit with attendee name, organization, dietary restrictions, and session preferences"
- "Build a mentorship program application with mentor/mentee info, areas of expertise, goals, and availability"
- "Generate a member satisfaction survey with program feedback, networking opportunities, and suggestions for improvement"
- "Create a board nomination form with nominee information, qualifications, leadership experience, and references"
- "Build a volunteer opportunity sign-up with event details, time slots, skills needed, and contact preferences"

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

## 4. Member Directory & Networking

### Requirements
Create a searchable member directory for alumni to find and connect with fellow leadership program graduates.

**Directory Features:**

**Search & Filter:**
- Text search (name, organization, expertise)
- Advanced filters:
  - Program attended (Leadership NC, Asheville, etc.)
  - Graduation year range
  - Industry/sector
  - Geographic location (NC regions)
  - Areas of expertise
  - Willing to mentor
  - Available for speaking
  - Open to networking
- Save search criteria
- Recent searches

**Member Cards/List View:**
- Profile photo
- Name and preferred name
- Current title and organization
- Program(s) and graduation year(s)
- Location (city, state)
- Top 3 areas of expertise
- Badges (Mentor, Speaker, Board Member)
- Verification badge (confirmed alumni)
- Connect button
- View profile button

**Member Profile View (`/members/[id]`):**
- Full profile information (respecting privacy settings)
- Professional background
- Leadership programs attended
- Areas of expertise and skills
- Board memberships and awards
- Community involvement
- Contact information (if allowed)
- Connect/Message buttons
- Similar members suggestions
- Mutual connections display

**Networking Features:**

**Connection Requests:**
- Send connection request with optional message
- Accept/decline requests
- View pending requests
- My connections list
- Connection suggestions based on:
  - Same program/cohort
  - Similar expertise
  - Same industry
  - Geographic proximity
  - Mutual connections

**Messaging System:**
- Direct messages between connected members
- Message threads
- Unread message notifications
- Message search
- Attachment support
- Privacy controls

**Mentorship Matching:**
- Browse available mentors
- Filter by expertise area
- Request mentorship
- Mentor dashboard (for mentors)
- Mentee dashboard (for mentees)
- Track mentorship relationships
- Feedback and ratings

**Technical Implementation:**
- Firestore collections: `memberProfiles`, `connections`, `messages`, `mentorships`
- Real-time updates for messages
- Algolia or Firestore for search
- Privacy-aware queries
- Profile view tracking (analytics)
- Connection recommendation algorithm
- Notification system

---

## 5. Datasets

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

## 6. Form Templates

### Requirements
Create a template library with pre-built forms for common Leadership Connections activities that users can copy and customize.

**Template Categories:**
- Event Registration (Networking Events, Conferences, Workshops)
- Surveys (Member Satisfaction, Program Evaluation, Needs Assessment)
- Applications (Mentorship, Board Nominations, Volunteer Opportunities)
- Member Updates (Alumni Check-ins, Profile Updates, Contact Information)
- Program Forms (Leadership Program Applications, Graduation Information)
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

1. **Leadership Summit Registration**
   - Attendee Name, Organization, Title
   - Program/Cohort, Graduation Year
   - Dietary Restrictions, Accessibility Needs
   - Session Preferences, Networking Interests
   - Emergency Contact

2. **Member Satisfaction Survey**
   - Program Attended, Graduation Year
   - Satisfaction Ratings (networking, events, resources)
   - Most Valuable Benefits
   - Suggestions for Improvement
   - Interest in Future Programs

3. **Mentorship Program Application**
   - Mentor/Mentee Selection
   - Professional Background
   - Areas of Expertise/Interest
   - Goals and Expectations
   - Time Commitment, Availability
   - Preferred Communication Methods

4. **Board Nomination Form**
   - Nominee Information
   - Current Position and Organization
   - Leadership Experience
   - Board Experience
   - Areas of Expertise
   - References
   - Statement of Interest

5. **Alumni Update Form**
   - Contact Information Updates
   - Current Employment
   - Recent Achievements/Awards
   - Community Involvement
   - Networking Interests
   - Willingness to Mentor/Speak

6. **Volunteer Opportunity Sign-Up**
   - Event/Opportunity Details
   - Time Slots Selection
   - Skills/Expertise to Contribute
   - Availability
   - Contact Preferences

7. **Networking Event RSVP**
   - Attendee Information
   - Plus-One Guest
   - Dietary Restrictions
   - Topics of Interest
   - Who You'd Like to Meet

**Technical Implementation:**
- Templates stored as JSON files in `/src/data/formTemplates/`
- Template copying logic
- Schema flattening algorithm
- Dataset auto-creation
- Form-dataset linking

---

## 7. Reports & Analytics

### Requirements
Create a reporting and analytics dashboard for member engagement, event participation, and platform usage.

**Report Types:**

**1. Member Engagement Reports:**
- Total active members
- New member registrations over time
- Profile completion rates
- Member demographics (program, graduation year, industry)
- Geographic distribution (NC regions)
- Engagement metrics (logins, profile views, connections made)

**2. Event & Form Submission Reports:**
- Total submissions by form
- Event registration trends
- RSVP vs. actual attendance
- Submissions by program/chapter
- Response rate tracking
- Completion time analytics
- Popular events and programs

**3. Networking & Mentorship Analytics:**
- Mentorship program participation
- Mentor/mentee matches
- Connection requests and acceptances
- Profile views and interactions
- Speaking engagement requests
- Volunteer sign-ups

**4. Program Alumni Analytics:**
- Alumni by program and year
- Industry distribution
- Career progression tracking
- Board membership participation
- Community involvement metrics
- Geographic reach

**5. Platform Usage Reports:**
- Active users (daily, weekly, monthly)
- Most viewed profiles
- Search queries and trends
- Feature usage (directory, messaging, events)
- Mobile vs. desktop usage

**Dashboard Components:**

**Summary Cards:**
- Total Members
- Active Members (last 30 days)
- Upcoming Events
- Total Connections Made
- Mentorship Matches
- Profile Completion Rate

**Charts:**
- Member growth over time (line/area chart)
- Members by program (pie/donut chart)
- Members by industry (bar chart)
- Geographic distribution (NC map with heat zones)
- Event attendance trends (line chart)
- Engagement metrics (multi-line chart)
- Profile completeness distribution (histogram)

**Data Tables:**
- Most active members
- Recent member registrations
- Upcoming events with RSVP counts
- Popular networking connections
- Top mentors (by mentee count)
- Most viewed profiles
- Recent form submissions

**Filters:**
- Date range picker
- Program/Chapter filter (Leadership NC, Asheville, etc.)
- Graduation year filter
- Industry filter
- Geographic region filter
- Membership status filter
- Engagement level filter (Active, Inactive, New)

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
│   ├── member-profile.types.ts
│   └── networking.types.ts
├── data/
│   └── formTemplates/
│       ├── eventRegistration.json
│       ├── memberSurvey.json
│       ├── mentorshipApplication.json
│       ├── boardNomination.json
│       └── ...
└── constants/
    ├── formFieldTypes.ts
    ├── programs.ts
    └── industries.ts
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
  category: 'event' | 'survey' | 'application' | 'update' | 'other';
  tags: string[];
  program: 'leadership-nc' | 'asheville' | 'charlotte' | 'greensboro' | 'statewide' | 'all';
  qrCodeEnabled: boolean;
  publicUrl: string;
  datasetId?: string;
  userId: string;
  eventDate?: Timestamp; // For event registration forms
  registrationDeadline?: Timestamp;
  maxResponses?: number;
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

**memberProfiles:**
```typescript
{
  id: string;
  userId: string;
  
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phone?: string;
  city: string;
  state: string;
  zipCode: string;
  bio?: string;
  profilePhotoUrl?: string;
  linkedInUrl?: string;
  websiteUrl?: string;
  
  // Leadership Program Information
  programs: Array<{
    name: string; // 'Leadership NC', 'Leadership Asheville', etc.
    graduationYear: number;
    cohort?: string;
    location?: string;
  }>;
  membershipStatus: 'active' | 'alumni' | 'lifetime';
  participationType: 'graduate' | 'participant' | 'mentor' | 'faculty';
  
  // Professional Information
  currentTitle?: string;
  currentOrganization?: string;
  industry?: string;
  yearsExperience?: number;
  previousOrganizations?: string[];
  certifications?: string[];
  boardMemberships?: Array<{
    organization: string;
    role: string;
    current: boolean;
    startYear: number;
    endYear?: number;
  }>;
  awards?: string[];
  
  // Networking & Expertise
  expertise: string[]; // Leadership Development, Strategic Planning, etc.
  skills: string[];
  languages: string[];
  willingToMentor: boolean;
  seekingMentorship: boolean;
  openToNetworking: boolean;
  availableForSpeaking: boolean;
  volunteerInterests: string[];
  
  // Community Engagement
  communityInvolvement?: string;
  volunteerActivities?: string[];
  causes: string[];
  geographicInterests: string[]; // NC regions
  preferredContactMethods: string[];
  
  // Privacy Settings
  profileVisibility: 'public' | 'members-only' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showEmployer: boolean;
  allowDirectMessages: boolean;
  includeInDirectory: boolean;
  
  // Metadata
  profileCompleteness: number; // 0-100
  verified: boolean;
  lastActive: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**connections:** (for networking)
```typescript
{
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: Timestamp;
  respondedAt?: Timestamp;
}
```

**mentorships:**
```typescript
{
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'active' | 'completed' | 'inactive';
  startDate: Timestamp;
  endDate?: Timestamp;
  focusAreas: string[];
  goals?: string;
  meetingFrequency?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Key Features Across All Modules:

1. **Authentication & Authorization:**
   - Firebase Auth integration
   - Role-based access control (Admin, Member, Program Coordinator, Guest)
   - User context provider
   - Protected routes
   - Email verification for new members
   - Alumni verification process

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

1. **Phase 1:** Authentication + Member Profile Form
   - Firebase Auth setup
   - Member profile creation and editing
   - Profile photo upload
   - Privacy settings

2. **Phase 2:** Member Directory & Search
   - Searchable directory
   - Member profile views
   - Basic filtering
   - Profile privacy controls

3. **Phase 3:** Networking Features
   - Connection requests
   - My connections list
   - Connection suggestions
   - Basic messaging

4. **Phase 4:** Forms Management
   - Form builder (CRUD operations)
   - Form templates
   - Template copying
   - Public form URLs

5. **Phase 5:** Event Registration & Surveys
   - Event registration forms
   - RSVP tracking
   - Survey creation
   - Response collection

6. **Phase 6:** Mentorship Program
   - Mentor/mentee matching
   - Mentorship applications
   - Relationship tracking
   - Feedback system

7. **Phase 7:** Datasets & Analytics
   - Dataset management
   - Form response viewing
   - Export capabilities
   - Basic analytics

8. **Phase 8:** Advanced Features
   - AI Form Builder
   - Advanced reporting
   - Automated notifications
   - Email campaigns

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
