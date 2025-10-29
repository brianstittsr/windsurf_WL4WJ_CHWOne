# Nonprofit Registration & Referral System Plan

## Overview

This document outlines the implementation plan for adding nonprofit organization registration to the CHWOne platform, along with a comprehensive referral system. The system will allow nonprofits to register, manage their profiles, post CHW job opportunities, advertise events, and participate in a robust referral network.

## Nonprofit Registration System

### User Stories

1. As a nonprofit organization, I want to register on the CHWOne platform so I can access its features and services.
2. As a nonprofit organization, I want to create and manage my profile so potential clients and partners can learn about our services.
3. As a nonprofit organization, I want to post job opportunities for CHWs so I can find qualified candidates.
4. As a nonprofit organization, I want to advertise upcoming events so I can increase community engagement.
5. As a nonprofit organization, I want to participate in a referral network so I can receive and send appropriate client referrals.

### Database Schema

#### `organizations` Collection

```typescript
interface Organization {
  id: string;                     // Firestore document ID
  name: string;                   // Organization name
  slug: string;                   // URL-friendly name
  description: string;            // Organization description
  mission: string;                // Mission statement
  logo: string;                   // Logo URL
  coverImage: string;             // Cover image URL
  website: string;                // Website URL
  email: string;                  // Primary contact email
  phone: string;                  // Primary contact phone
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    county: string;
    coordinates: {
      latitude: number;
      longitude: number;
    }
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  operatingHours: {
    monday: { open: string; close: string; closed: boolean; };
    tuesday: { open: string; close: string; closed: boolean; };
    wednesday: { open: string; close: string; closed: boolean; };
    thursday: { open: string; close: string; closed: boolean; };
    friday: { open: string; close: string; closed: boolean; };
    saturday: { open: string; close: string; closed: boolean; };
    sunday: { open: string; close: string; closed: boolean; };
  };
  serviceAreas: string[];         // Counties or regions served
  serviceCategories: string[];    // Categories of services provided
  eligibilityCriteria: string;    // Who is eligible for services
  applicationProcess: string;     // How to apply for services
  capacity: {
    currentCapacity: number;      // Current available slots
    maxCapacity: number;          // Maximum capacity
    waitlistLength?: number;      // Current waitlist length
    acceptingReferrals: boolean;  // Whether accepting new referrals
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDate?: Date;        // When verification was completed
  verifiedBy?: string;            // Admin user ID who verified
  taxId: string;                  // EIN/Tax ID (encrypted)
  legalStatus: 'nonprofit' | 'government' | 'forProfit' | 'other';
  foundingYear: number;           // Year founded
  size: 'small' | 'medium' | 'large'; // Organization size
  budget: 'under100k' | '100k-500k' | '500k-1m' | '1m-5m' | 'over5m';
  primaryLanguages: string[];     // Languages supported
  accessibilityOptions: string[]; // Accessibility features
  insuranceAccepted: string[];    // Insurance plans accepted
  paymentOptions: string[];       // Payment methods accepted
  tags: string[];                 // Searchable tags
  adminUsers: string[];           // User IDs with admin access
  staffUsers: string[];           // User IDs with staff access
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last update timestamp
  lastActivityAt: Date;           // Last activity timestamp
  isActive: boolean;              // Whether organization is active
}
```

#### `organizationServices` Collection

```typescript
interface OrganizationService {
  id: string;                     // Firestore document ID
  organizationId: string;         // Reference to organization
  name: string;                   // Service name
  description: string;            // Service description
  category: string;               // Service category
  subcategories: string[];        // Service subcategories
  eligibilityCriteria: string;    // Who is eligible
  applicationProcess: string;     // How to apply
  requiredDocuments: string[];    // Documents needed to apply
  cost: string;                   // Cost information
  fundingSources: string[];       // How the service is funded
  capacity: {
    currentCapacity: number;      // Current available slots
    maxCapacity: number;          // Maximum capacity
    waitlistLength?: number;      // Current waitlist length
    acceptingReferrals: boolean;  // Whether accepting new referrals
  };
  location: {
    onsite: boolean;              // Available at organization location
    remote: boolean;              // Available remotely
    mobile: boolean;              // Mobile service
    serviceAreas: string[];       // Areas where service is available
  };
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  operatingHours: {              // Can differ from organization hours
    monday: { open: string; close: string; closed: boolean; };
    tuesday: { open: string; close: string; closed: boolean; };
    wednesday: { open: string; close: string; closed: boolean; };
    thursday: { open: string; close: string; closed: boolean; };
    friday: { open: string; close: string; closed: boolean; };
    saturday: { open: string; close: string; closed: boolean; };
    sunday: { open: string; close: string; closed: boolean; };
  };
  isActive: boolean;             // Whether service is active
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

#### `organizationJobs` Collection

```typescript
interface OrganizationJob {
  id: string;                    // Firestore document ID
  organizationId: string;        // Reference to organization
  title: string;                 // Job title
  description: string;           // Job description
  responsibilities: string[];    // Key responsibilities
  qualifications: string[];      // Required qualifications
  preferredQualifications: string[]; // Preferred qualifications
  employmentType: 'fullTime' | 'partTime' | 'contract' | 'temporary' | 'volunteer';
  location: {
    remote: boolean;             // Remote work option
    onsite: boolean;             // Onsite work required
    address?: {                  // If onsite
      street: string;
      city: string;
      state: string;
      zipCode: string;
    }
  };
  salary: {
    range: {
      min: number;
      max: number;
    };
    isHourly: boolean;           // Hourly vs. annual
    benefits: string[];          // Benefits offered
  };
  applicationUrl?: string;       // External application URL
  applicationEmail?: string;     // Application email
  applicationPhone?: string;     // Application phone
  applicationDeadline: Date;     // Application deadline
  startDate?: Date;              // Expected start date
  department?: string;           // Department
  reportsTo?: string;            // Position reports to
  status: 'draft' | 'published' | 'filled' | 'closed';
  tags: string[];                // Searchable tags
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
  publishedAt?: Date;            // When job was published
  views: number;                 // View count
  applications: number;          // Application count
}
```

#### `organizationEvents` Collection

```typescript
interface OrganizationEvent {
  id: string;                    // Firestore document ID
  organizationId: string;        // Reference to organization
  title: string;                 // Event title
  description: string;           // Event description
  startDate: Date;               // Event start date and time
  endDate: Date;                 // Event end date and time
  timezone: string;              // Event timezone
  location: {
    virtual: boolean;            // Virtual event flag
    address?: {                  // If not virtual
      name?: string;             // Venue name
      street: string;
      city: string;
      state: string;
      zipCode: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      }
    };
    virtualLink?: string;        // Virtual event link
    virtualPlatform?: string;    // Virtual platform name
  };
  category: string;              // Event category
  tags: string[];                // Searchable tags
  featuredImage?: string;        // Featured image URL
  cost: number | 'free';         // Event cost
  registrationRequired: boolean; // Registration required flag
  registrationUrl?: string;      // Registration URL
  registrationDeadline?: Date;   // Registration deadline
  maxAttendees?: number;         // Maximum attendees
  currentRegistrations?: number; // Current registration count
  contactPerson: {
    name: string;
    email: string;
    phone?: string;
  };
  accessibility: string[];       // Accessibility features
  languageSupport: string[];     // Languages supported
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  isPublic: boolean;             // Public or private event
  isFeatured: boolean;           // Featured event flag
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
  publishedAt?: Date;            // When event was published
  views: number;                 // View count
}
```

#### `referrals` Collection

```typescript
interface Referral {
  id: string;                    // Firestore document ID
  clientId: string;              // Client being referred
  fromOrganizationId?: string;   // Referring organization (optional)
  fromUserId: string;            // Referring user
  toOrganizationId: string;      // Receiving organization
  toServiceId?: string;          // Specific service (optional)
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  referralDate: Date;            // When referral was made
  needByDate?: Date;             // When service is needed by
  appointmentDate?: Date;        // Scheduled appointment
  reason: string;                // Reason for referral
  notes: string;                 // Additional notes
  clientConsent: boolean;        // Client consent obtained
  consentDocumentUrl?: string;   // Consent document URL
  clientNeeds: string[];         // Client needs
  clientEligibilityNotes?: string; // Notes on eligibility
  attachments: {                 // Attached documents
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }[];
  feedback?: {                   // Feedback after completion
    fromOrganization?: {
      rating: number;            // 1-5 rating
      comments: string;          // Comments
      submittedAt: Date;         // When feedback was submitted
      submittedBy: string;       // User who submitted feedback
    };
    fromClient?: {
      rating: number;            // 1-5 rating
      comments: string;          // Comments
      submittedAt: Date;         // When feedback was submitted
    };
  };
  statusHistory: {               // History of status changes
    status: string;
    changedAt: Date;
    changedBy: string;
    notes?: string;
  }[];
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

### Page Designs

#### 1. Nonprofit Registration Page

**URL:** `/register/nonprofit`

**Components:**
- Multi-step registration form
- Organization information collection
- Service area selection
- Verification document upload
- Terms and conditions acceptance
- Admin user account creation

**Features:**
- Progress saving
- Validation of tax ID/EIN
- Address verification and geocoding
- Logo and image upload
- Email verification

#### 2. Nonprofit Dashboard

**URL:** `/dashboard/nonprofit`

**Components:**
- Overview statistics
- Quick action buttons
- Recent activity feed
- Upcoming events
- Active job postings
- Recent referrals
- Notifications center

**Features:**
- Customizable widgets
- Export functionality
- Notification management
- Quick access to all nonprofit features

#### 3. Nonprofit Profile Management

**URL:** `/dashboard/nonprofit/profile`

**Components:**
- Organization profile editor
- Service management
- Operating hours configuration
- Contact information management
- Document management
- User access management

**Features:**
- Real-time validation
- Preview functionality
- Version history
- Public profile preview

#### 4. Job Posting Management

**URL:** `/dashboard/nonprofit/jobs`

**Components:**
- Job listing table
- Job creation form
- Application tracking
- Job analytics
- Template library

**Features:**
- Draft saving
- Duplicate functionality
- Bulk actions
- Application management
- Automatic expiration

#### 5. Event Management

**URL:** `/dashboard/nonprofit/events`

**Components:**
- Event calendar
- Event creation form
- Attendee management
- Event analytics
- Promotion tools

**Features:**
- Recurring event creation
- Registration management
- Event reminders
- Calendar export (iCal, Google)
- Social sharing

#### 6. Referral Management

**URL:** `/dashboard/nonprofit/referrals`

**Components:**
- Referral inbox
- Referral creation form
- Client lookup
- Referral status tracking
- Communication tools

**Features:**
- Batch referral processing
- Eligibility checking
- Document sharing
- Secure messaging
- Outcome tracking

#### 7. Public Nonprofit Directory

**URL:** `/nonprofits`

**Components:**
- Search filters
- Map view
- List view
- Category filters
- Service area filters

**Features:**
- Advanced search
- Save favorites
- Share functionality
- Print directory
- Export to PDF

#### 8. Public Nonprofit Profile

**URL:** `/nonprofits/:slug`

**Components:**
- Organization overview
- Services offered
- Contact information
- Map location
- Operating hours
- Current jobs and events

**Features:**
- Direct contact options
- Service referral request
- Social sharing
- Add to favorites
- Directions

## Nonprofit Referral System Features

### Core Platform Components

#### User Profiles
- Client profiles with demographic data, needs assessment, and preferences
- Nonprofit organization profiles with services, capacity, and eligibility criteria
- Referrer/case manager profiles with permissions and organizational affiliations
- Admin dashboard for system management and analytics

#### Matching Algorithm
- Service categorization taxonomy (housing, food, healthcare, etc.)
- Geographic proximity calculation
- Eligibility pre-screening automation
- Urgency/priority scoring
- Availability-based matching (current capacity)
- Intelligent recommendations based on past successful referrals

### Communication Features

#### Notification System
- Email notifications with customizable templates
- SMS text alerts with opt-in/opt-out functionality
- In-app notifications and message center
- Automated reminders (24hr before appointment)
- Escalation alerts for urgent/unaddressed referrals
- Batch notification capabilities for service changes

#### Appointment Scheduling
- Calendar integration (Google, Outlook, iCal)
- Self-service booking portal for clients
- Availability management for nonprofits
- Rescheduling functionality with notification triggers
- Recurring appointment support
- Multi-party meeting coordination

### Feedback Mechanisms

#### Client Feedback
- Post-service satisfaction surveys
- Service quality ratings (1-5 stars)
- Open-ended feedback collection
- Follow-up assessment of needs met/unmet
- Suggestion system for service improvements
- Testimonial collection (with permission options)

#### Nonprofit Feedback
- Referral quality assessment
- Client attendance tracking
- Service delivery confirmation
- Capacity updates and waitlist management
- Service outcome documentation
- Resource needs identification

### Technical Infrastructure

#### Integration Capabilities
- API for connecting with existing CRM/case management systems
- HMIS (Homeless Management Information System) compatibility
- EHR (Electronic Health Record) integration options
- Single Sign-On (SSO) support
- Data export/import functionality
- Webhook support for custom workflows

#### Security & Compliance
- HIPAA compliance for healthcare referrals
- Role-based access controls
- Data encryption (at rest and in transit)
- Consent management system
- Audit logging for all activities
- Data retention policies

### User Experience Features

#### Accessibility
- Mobile-responsive design
- Screen reader compatibility
- Multiple language support
- Low-bandwidth options for limited connectivity
- Offline functionality with sync
- Voice-enabled interactions

#### Usability
- Guided referral wizards
- Progress tracking dashboards
- Status indicators for referrals
- Document upload/sharing
- Service history visualization
- Quick-action shortcuts

### Analytics & Reporting

#### Performance Metrics
- Referral completion rates
- Response time analytics
- Service delivery timeframes
- Client outcome tracking
- System usage statistics
- Geographic service gaps identification

#### Impact Measurement
- Social return on investment calculations
- Community needs assessment tools
- Trend analysis for service demands
- Success stories documentation
- Funding justification reports
- Collaborative impact visualization

### Advanced Features

#### Crisis Management
- Urgent referral flagging
- After-hours emergency protocols
- Backup referral options
- Crisis resource directory
- Warm handoff documentation
- Safety planning tools

#### Community Engagement
- Volunteer matching for nonprofits
- Resource donation coordination
- Community event calendar
- Peer support connections
- Success celebration sharing
- Community resource mapping

#### AI & Automation
- Chatbot for initial intake
- Predictive analytics for service needs
- Automated eligibility checking
- Natural language processing for feedback analysis
- Smart follow-up scheduling
- Pattern recognition for service gaps

### Implementation Considerations

#### Onboarding
- Training materials for all user types
- Guided setup wizards
- Template libraries for communications
- Knowledge base and FAQ section
- Video tutorials
- Live support options

#### Sustainability
- Usage analytics for funders
- Cost-sharing models
- Grant application support data
- Community impact reports
- System ROI calculator
- Partnership development tools

## Implementation Timeline

### Phase 1: Nonprofit Registration (Weeks 1-4)
- Database schema implementation
- Registration page and form
- Basic profile management
- Email verification
- Admin approval workflow

### Phase 2: Job & Event Management (Weeks 5-8)
- Job posting functionality
- Event management system
- Public directory and profiles
- Search and filtering

### Phase 3: Referral System Foundation (Weeks 9-16)
- Referral database schema
- Basic referral creation and management
- Service matching algorithm
- Notification system
- Status tracking

### Phase 4: Advanced Referral Features (Weeks 17-24)
- Appointment scheduling
- Feedback mechanisms
- Analytics and reporting
- Integration capabilities
- Mobile optimization

### Phase 5: AI & Community Features (Weeks 25-32)
- AI-powered matching
- Crisis management tools
- Community engagement features
- Advanced analytics
- System optimization

## Success Metrics

1. **Registration & Adoption**
   - Number of nonprofit organizations registered
   - Profile completion rate
   - Active monthly users

2. **Job & Event Engagement**
   - Number of job postings created
   - Job application rate
   - Event creation and attendance

3. **Referral System Performance**
   - Referral volume
   - Successful referral rate
   - Average response time
   - Client satisfaction scores

4. **System Efficiency**
   - Time saved per referral
   - Reduction in inappropriate referrals
   - Increase in service capacity utilization

5. **Community Impact**
   - Number of clients served
   - Service gaps identified and addressed
   - Improved client outcomes
