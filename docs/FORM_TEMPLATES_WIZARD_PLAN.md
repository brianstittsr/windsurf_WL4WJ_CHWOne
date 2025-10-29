# Form Templates and AI Wizard Plan

## Overview
This document outlines the plan to enhance the Forms section of the CHWOne platform with default templates for Attendance Sheets and Onboarding forms, along with a BMAD AI Analyst agent wizard for custom form generation.

## Features

### 1. Default Form Templates

#### Attendance Sheet Templates
- **Basic Attendance Sheet**
  - Date, time, location fields
  - Participant name, organization, contact information
  - Sign-in/sign-out times
  - Signature field (digital or print)
  
- **Training Attendance Sheet**
  - Standard attendance fields
  - Training topic and instructor
  - CEU/training hours tracking
  - Pre/post assessment completion checkboxes
  
- **Event Attendance Sheet**
  - Event details (name, date, venue)
  - Participant demographics (optional)
  - Feedback/evaluation option
  - Follow-up interest indicator

#### Onboarding Templates
- **CHW Onboarding Checklist**
  - Personal information
  - Required documentation collection
  - Training schedule
  - Equipment/resource assignment
  - Supervisor assignment
  
- **Client Onboarding Form**
  - Demographic information
  - Needs assessment
  - Service eligibility verification
  - Consent forms
  - HIPAA acknowledgment
  
- **Organization Onboarding**
  - Organization details
  - Primary contacts
  - Service areas
  - Partnership agreements
  - Resource sharing options

### 2. BMAD AI Analyst Form Wizard

#### Wizard Interface
- Conversational UI with step-by-step guidance
- Progress indicator showing completion status
- Option to save and resume wizard sessions
- Preview capability at each step

#### Wizard Flow
1. **Form Purpose Selection**
   - Select form category (attendance, onboarding, assessment, etc.)
   - Define specific use case
   - Identify target audience
   
2. **Content Requirements**
   - Essential information to collect
   - Optional fields
   - Conditional logic requirements
   - Data validation needs
   
3. **Format and Structure**
   - Form layout preferences
   - Section organization
   - Mobile vs. desktop optimization
   - Accessibility requirements
   
4. **Branding and Design**
   - Organization logo inclusion
   - Color scheme preferences
   - Header/footer customization
   - Typography choices
   
5. **Distribution and Collection**
   - Delivery method (email, QR code, embedded)
   - Response collection preferences
   - Notification settings
   - Submission deadline options

#### AI Analysis and Generation
- BMAD AI Analyst processes wizard inputs
- Recommends optimal form structure based on requirements
- Suggests field types and validation rules
- Generates form preview for review
- Allows iterative refinement before final generation

### 3. Form Management Enhancements

#### Template Library
- Categorized browsing of all templates
- Preview functionality
- Usage statistics
- Rating and feedback system

#### Form Customization
- Template-based starting point
- Drag-and-drop field editor
- Field property customization
- Conditional logic builder

#### Form Deployment
- Multiple distribution channels
- Access control settings
- Expiration date configuration
- Response monitoring dashboard

## Technical Implementation

### Components
1. **Template System**
   - JSON schema for template definition
   - Rendering engine for template display
   - Template metadata management
   
2. **BMAD AI Analyst Integration**
   - API connection to BMAD AI service
   - Form requirement analysis module
   - Template recommendation engine
   - Custom form generation service
   
3. **Form Wizard UI**
   - React-based wizard component
   - State management for wizard progress
   - Form preview renderer
   - Validation and error handling

### Data Models

#### Form Template
```typescript
interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: 'attendance' | 'onboarding' | 'assessment' | 'other';
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
  schema: FormSchema;
  metadata: {
    tags: string[];
    usageCount: number;
    rating: number;
    reviewCount: number;
    thumbnailUrl?: string;
  };
}
```

#### Form Schema
```typescript
interface FormSchema {
  title: string;
  description?: string;
  sections: FormSection[];
  settings: {
    submitButtonText: string;
    showProgressBar: boolean;
    allowSave: boolean;
    requireAuthentication: boolean;
    notifyOnSubmission: boolean;
    confirmationMessage: string;
  };
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  conditional?: {
    dependsOn: string; // Field ID
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  };
}

interface FormField {
  id: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'time' | 'checkbox' | 'radio' | 'signature' | 'file';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[]; // For select, multiselect, radio
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    customMessage?: string;
  };
}
```

#### Wizard Session
```typescript
interface WizardSession {
  id: string;
  userId: string;
  startedAt: Date;
  lastUpdatedAt: Date;
  completedAt?: Date;
  currentStep: number;
  totalSteps: number;
  responses: Record<string, any>; // Answers to wizard questions
  generatedFormId?: string; // ID of the form generated from this session
}
```

### API Endpoints
- `GET /api/forms/templates` - List all available templates
- `GET /api/forms/templates/:id` - Get specific template
- `POST /api/forms/wizard/start` - Start a new wizard session
- `PUT /api/forms/wizard/:id` - Update wizard session with responses
- `POST /api/forms/wizard/:id/generate` - Generate form from wizard responses
- `GET /api/forms/wizard/:id/preview` - Get preview of form based on current responses

## User Flow Examples

### Example 1: Using an Attendance Sheet Template
1. User navigates to Forms section
2. User selects "Templates" tab
3. User filters for "Attendance" category
4. User previews "Training Attendance Sheet" template
5. User clicks "Use Template" button
6. User customizes template with specific training details
7. User saves and publishes the form
8. User distributes the form via QR code or link

### Example 2: Creating a Custom Form with the AI Wizard
1. User navigates to Forms section
2. User clicks "Create with AI Wizard" button
3. AI Wizard asks about form purpose
   ```
   "What type of form would you like to create?"
   [Attendance] [Onboarding] [Assessment] [Survey] [Other]
   ```
4. User selects "Onboarding"
5. AI Wizard asks about specific use case
   ```
   "What specific onboarding process is this form for?"
   [New CHW] [Client] [Partner Organization] [Volunteer] [Other]
   ```
6. User selects "New CHW"
7. AI Wizard continues with detailed questions about required fields, organization, etc.
8. AI generates form preview based on responses
9. User reviews and requests modifications
10. AI refines the form based on feedback
11. User approves the final form
12. System generates and saves the custom form

## Implementation Timeline
1. **Phase 1 (Weeks 1-2)**: Default Templates Implementation
   - Create JSON schemas for attendance and onboarding templates
   - Implement template rendering engine
   - Add template browsing and selection UI

2. **Phase 2 (Weeks 3-4)**: BMAD AI Analyst Integration
   - Set up API connection to BMAD AI service
   - Implement form requirement analysis module
   - Create template recommendation engine

3. **Phase 3 (Weeks 5-6)**: Form Wizard UI
   - Develop wizard interface components
   - Implement wizard state management
   - Create form preview functionality

4. **Phase 4 (Week 7)**: Testing and Refinement
   - Conduct user testing with CHWs
   - Refine wizard questions based on feedback
   - Optimize AI form generation

5. **Phase 5 (Week 8)**: Deployment and Documentation
   - Deploy to production
   - Create user documentation
   - Train CHWs on using the wizard

## Success Metrics
- Number of forms created using default templates
- Number of forms created using the AI wizard
- Time saved compared to manual form creation
- User satisfaction with generated forms
- Form completion rates for generated forms

## Future Enhancements
- AI-powered form analytics and insights
- Template sharing across organizations
- Advanced conditional logic in form generation
- Integration with external form systems
- Mobile app for offline form collection
