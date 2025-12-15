# Grant Management System - AI Deployment Prompt

## Purpose
This prompt enables an AI assistant to deploy a **Grant Analyzer and Grant Creator system** into a new web application. The AI will first analyze the target system's existing architecture, then integrate the grant management components in a way that leverages existing dropdowns, data models, and UI patterns.

The system also generates **professional grant submission documents** in both Markdown and branded PDF formats based on grant deliverables.

---

## SYSTEM OVERVIEW

You are deploying a comprehensive **Grant Management System** with two core modules:

### 1. Grant Analyzer (AI-Powered Document Analysis)
- Uploads grant documents (PDF, Word, text)
- Uses OpenAI GPT-4o to extract and structure grant information
- Auto-populates wizard steps with extracted data
- Generates forms, dashboards, and project plans

### 2. Grant Creator Wizard (7-Step Process)
- Step 1: Basic Info & Document Upload
- Step 2: Entity Details (Collaborating Organizations)
- Step 3: Data Collection Methods
- Step 4: Project Milestones & Timeline
- Step 5: Review & Analysis
- Step 6: Form Generator
- Step 7: AI Dashboard Configuration

---

## PRE-DEPLOYMENT ANALYSIS

**CRITICAL: Before implementing, you MUST analyze the target system to understand:**

### 1. Existing Data Models
Ask the user or analyze the codebase for:
- User/Organization models (to link grants)
- Existing form/survey systems (to integrate or replace)
- Dashboard/reporting infrastructure
- File storage configuration

### 2. Existing Dropdown Lists
Identify and catalog existing lists that should be reused:
```
- Organization types (nonprofit, government, foundation, etc.)
- User roles (admin, staff, viewer, etc.)
- Status values (draft, active, completed, etc.)
- Frequency options (daily, weekly, monthly, quarterly, annually)
- Geographic regions (states, counties, service areas)
- Service categories (health, education, housing, etc.)
- Funding sources (federal, state, foundation, corporate)
```

### 3. UI Component Library
Identify the target system's:
- UI framework (Material-UI, Chakra, Tailwind, Bootstrap, etc.)
- Form components (text fields, selects, date pickers)
- Table/data grid components
- Chart library (Recharts, Chart.js, D3, etc.)
- Modal/dialog patterns

### 4. Backend Architecture
Understand:
- Database type (Firebase, PostgreSQL, MongoDB, etc.)
- API pattern (REST, GraphQL, tRPC)
- Authentication system
- File upload handling

---

## DATA MODELS TO IMPLEMENT

### Grant (Core Entity)
```typescript
interface Grant {
  id: string;
  name: string;
  description: string;
  startDate: string;           // YYYY-MM-DD
  endDate: string;             // YYYY-MM-DD
  fundingSource: string;       // Use existing funding source dropdown if available
  grantNumber: string;
  totalBudget: number;
  status: 'draft' | 'active' | 'inactive' | 'completed';
  organizationId: string;      // Link to existing organization model
  
  // Nested data
  collaboratingEntities: CollaboratingEntity[];
  dataCollectionMethods: DataCollectionMethod[];
  projectMilestones: ProjectMilestone[];
  analysisRecommendations: AnalysisRecommendation[];
  formTemplates: FormTemplate[];
  datasets: Dataset[];
  dashboardMetrics: DashboardMetric[];
  
  // Metadata
  documents: GrantDocument[];
  entityRelationshipNotes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### CollaboratingEntity
```typescript
interface CollaboratingEntity {
  id: string;
  name: string;
  role: 'lead' | 'partner' | 'evaluator' | 'stakeholder' | 'funder' | 'other';
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  responsibilities: string[];
}
```

### DataCollectionMethod
```typescript
interface DataCollectionMethod {
  id: string;
  name: string;
  description: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  responsibleEntity: string;   // Reference to CollaboratingEntity.name
  dataPoints: string[];        // What data to collect
  tools: string[];             // Platform tools to use
}
```

### ProjectMilestone
```typescript
interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;             // YYYY-MM-DD
  status: 'not_started' | 'in_progress' | 'delayed' | 'completed';
  responsibleParties: string[]; // Entity names
  dependencies: string[];       // Other milestone names
}
```

### FormTemplate
```typescript
interface FormTemplate {
  id: string;
  name: string;
  description: string;
  purpose: 'intake' | 'progress' | 'assessment' | 'feedback' | 'reporting' | 'data';
  sections: FormSection[];
  entityResponsible: string;
  frequency?: string;
  datasetId?: string;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;  // 75+ field types supported
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: FieldValidation;
}
```

### DashboardMetric
```typescript
interface DashboardMetric {
  id: string;
  name: string;
  description?: string;
  value: number | string;
  target?: number | string;
  unit?: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
  trend?: 'up' | 'down' | 'flat';
  linkedForm: string;          // Form that provides data
  datasetField: string;        // Field to visualize
  visualization: 'number' | 'percentage' | 'currency' | 'ratio';
}
```

---

## INTEGRATION POINTS

### 1. Dropdown Integration
When implementing, map these fields to existing system dropdowns:

| Grant Field | Look For Existing List |
|-------------|----------------------|
| `fundingSource` | Funding sources, sponsor types |
| `status` | Project/grant statuses |
| `entity.role` | Organization roles, partner types |
| `frequency` | Reporting frequencies, schedule types |
| `milestone.status` | Task/project statuses |
| `form.purpose` | Form categories, document types |

**Implementation Pattern:**
```typescript
// Check if target system has existing constants
import { EXISTING_FUNDING_SOURCES } from '@/constants/organization';
import { EXISTING_STATUS_OPTIONS } from '@/constants/status';

// Use existing if available, otherwise use defaults
const FUNDING_SOURCES = EXISTING_FUNDING_SOURCES || [
  'Federal Government',
  'State Government', 
  'Private Foundation',
  'Corporate Sponsor',
  'Other'
];
```

### 2. Form Builder Integration
If target system has existing form builder:
- Extend it with grant-specific field types
- Add dataset auto-generation capability
- Link forms to data collection methods

If no form builder exists:
- Implement full FormBuilder component
- Include 75+ field types (see FIELD_TYPES constant)
- Add drag-and-drop reordering

### 3. Dashboard Integration
If target system has dashboard infrastructure:
- Add grant-specific widgets
- Integrate with existing chart library
- Use existing data refresh patterns

If no dashboard exists:
- Implement dashboard framework with Recharts
- Add KPI cards, charts, and data tables
- Include real-time refresh capability

---

## AI ANALYSIS API

### Endpoint: `/api/ai/analyze-grant`

**Request:**
```typescript
POST /api/ai/analyze-grant
Content-Type: multipart/form-data

{
  file: File  // PDF, DOCX, or TXT
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    grantTitle: string;
    description: string;
    fundingSource: string;
    grantNumber: string;
    startDate: string;
    endDate: string;
    totalBudget: number;
    entities: Array<{
      name: string;
      role: string;
      responsibilities: string;
      contactInfo: string;
    }>;
    dataCollectionMethods: Array<{
      name: string;
      description: string;
      frequency: string;
      responsibleEntity: string;
      dataPoints: string[];
      tools: string;
    }>;
    milestones: Array<{
      name: string;
      description: string;
      dueDate: string;
      responsibleParties: string[];
      dependencies: string[];
    }>;
    forms: Array<{
      name: string;
      description: string;
      category: string;
      linkedDataCollectionMethod: string;
      fields: FormField[];
      datasetFields: string[];
    }>;
    dashboard: {
      title: string;
      description: string;
      metrics: DashboardMetric[];
      charts: ChartConfig[];
      kpis: KPIConfig[];
      tables: TableConfig[];
    };
    specialRequirements: string;
  };
  extractedText?: string;
  extractedTextLength?: number;
}
```

### OpenAI Prompt Structure
The AI analysis uses a comprehensive prompt that:
1. Extracts exact information from documents
2. Intelligently infers missing data
3. Maps requirements to platform capabilities
4. Generates forms with appropriate field types
5. Creates dashboard configurations linked to forms

**Key AI Instructions:**
- Extract ONLY from document text (no fabrication)
- Use exact organization names as written
- Convert dates to YYYY-MM-DD format
- Convert budgets to numbers (remove $ and commas)
- Create 4-6 milestones spanning grant period
- Generate 2-3 forms per grant
- Link all dashboard elements to form datasets

---

## WIZARD COMPONENTS

### Step 1: Basic Info & Document Upload
```typescript
// Features:
// - File upload (PDF, DOCX, TXT)
// - Text paste option
// - AI analysis trigger
// - Basic grant fields (name, description, dates, budget)
// - Progress indicator during analysis
```

### Step 2: Entity Details
```typescript
// Features:
// - Add/edit/remove collaborating entities
// - Role selection (lead, partner, evaluator, stakeholder, funder)
// - Contact information
// - Responsibilities list
// - Entity relationship visualization
```

### Step 3: Data Collection Methods
```typescript
// Features:
// - Define data collection methods
// - Set frequency (daily, weekly, monthly, quarterly, annually)
// - Assign responsible entity (from Step 2)
// - List data points to collect
// - Map to platform tools
```

### Step 4: Project Milestones
```typescript
// Features:
// - Timeline visualization
// - Add/edit milestones
// - Set due dates
// - Assign responsible parties
// - Define dependencies
// - Status tracking (not_started, in_progress, delayed, completed)
```

### Step 5: Review & Analysis
```typescript
// Features:
// - Summary of all entered data
// - AI-generated recommendations
// - Risk assessment
// - Entity relationship notes
// - Validation checks
```

### Step 6: Form Generator
```typescript
// Features:
// - Auto-generated forms from data collection methods
// - 75+ field types
// - Drag-and-drop field ordering
// - Validation configuration
// - Dataset structure preview
```

### Step 7: AI Dashboard
```typescript
// Features:
// - KPI cards with targets and trends
// - Charts (line, bar, pie, area, gauge)
// - Data tables with sorting/filtering
// - Real-time refresh configuration
// - All elements linked to form datasets
```

---

## FIELD TYPES (75+ Types)

### Text Entry
- `text` - Single line text
- `textarea` - Multi-line text
- `email` - Email with validation
- `phone` - Phone number
- `url` - Website URL
- `password` - Masked input

### Multiple Choice
- `radio` - Single selection
- `checkbox` - Multiple selection
- `select` - Dropdown
- `image-choice` - Image options
- `button-choice` - Button selection

### Matrix/Grid
- `matrix` - Grid questions
- `ranking` - Rank items
- `side-by-side` - Comparison

### Slider & Scale
- `likert` - Agreement scale
- `rating` - Star rating
- `nps` - Net Promoter Score
- `slider` - Numeric slider
- `visual-analog` - Visual scale

### Date & Time
- `date` - Date picker
- `time` - Time picker
- `datetime` - Date and time
- `date-range` - Date range

### Numeric
- `number` - Number input
- `currency` - Money input
- `percentage` - Percentage
- `calculation` - Calculated field

### File & Media
- `file` - File upload
- `image` - Image upload
- `signature` - Signature capture

### Location
- `address` - Full address
- `city-state` - City and state
- `zipcode` - ZIP code
- `coordinates` - GPS coordinates

### Contact Info
- `full-name` - Name fields
- `contact-email` - Contact email
- `contact-phone` - Contact phone

### Specialized
- `consent` - Consent checkbox
- `demographics` - Demographic questions
- `health-assessment` - Health questions

---

## DEPLOYMENT CHECKLIST

### Phase 1: Analysis
- [ ] Analyze target system's tech stack
- [ ] Identify existing dropdown lists
- [ ] Map UI component library
- [ ] Understand database schema
- [ ] Review authentication system

### Phase 2: Data Layer
- [ ] Create Grant data model
- [ ] Create supporting models (Entity, Milestone, etc.)
- [ ] Set up database collections/tables
- [ ] Implement CRUD services

### Phase 3: API Layer
- [ ] Implement `/api/ai/analyze-grant` endpoint
- [ ] Set up OpenAI integration
- [ ] Implement PDF text extraction
- [ ] Create grant CRUD endpoints

### Phase 4: UI Components
- [ ] Create GrantWizard container
- [ ] Implement all 7 wizard steps
- [ ] Build FormBuilder component
- [ ] Create Dashboard components
- [ ] Integrate with existing UI library

### Phase 5: Integration
- [ ] Connect to existing auth system
- [ ] Link to organization model
- [ ] Integrate existing dropdowns
- [ ] Add navigation routes
- [ ] Implement permissions

### Phase 6: Testing
- [ ] Test document upload/analysis
- [ ] Verify form generation
- [ ] Test dashboard rendering
- [ ] Validate data persistence
- [ ] Check dropdown integration

---

## ENVIRONMENT VARIABLES

```env
# Required for AI Analysis
OPENAI_API_KEY=sk-...

# Database (example for Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
```

---

## SAMPLE INTEGRATION CODE

### Context Provider
```typescript
// GrantWizardContext.tsx
import { createContext, useContext, useState } from 'react';

interface GrantWizardContextType {
  currentStep: number;
  grantData: Partial<Grant>;
  updateGrantData: (data: Partial<Grant>) => void;
  analyzeDocument: (file: File) => Promise<AnalysisResult>;
  submitGrant: () => Promise<string>;
  // ... additional methods
}

export const GrantWizardProvider = ({ children }) => {
  const [grantData, setGrantData] = useState<Partial<Grant>>({});
  
  const analyzeDocument = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/ai/analyze-grant', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    if (result.success) {
      // Map AI response to grant data structure
      setGrantData(prev => ({
        ...prev,
        name: result.data.grantTitle,
        description: result.data.description,
        // ... map all fields
      }));
    }
    return result;
  };
  
  // ... rest of implementation
};
```

### Dropdown Integration Example
```typescript
// Use existing system dropdowns where available
import { useSystemConfig } from '@/hooks/useSystemConfig';

function EntityRoleSelect({ value, onChange }) {
  const { organizationRoles } = useSystemConfig();
  
  // Map system roles to grant entity roles
  const roleOptions = organizationRoles?.length > 0
    ? organizationRoles.map(r => ({ value: r.id, label: r.name }))
    : [
        { value: 'lead', label: 'Lead Organization' },
        { value: 'partner', label: 'Partner' },
        { value: 'evaluator', label: 'Evaluator' },
        { value: 'stakeholder', label: 'Stakeholder' },
        { value: 'funder', label: 'Funder' },
      ];
  
  return (
    <Select value={value} onChange={onChange} options={roleOptions} />
  );
}
```

---

## QUESTIONS TO ASK BEFORE DEPLOYMENT

1. **What is your tech stack?** (Framework, UI library, database)
2. **Do you have existing organization/user models?**
3. **Do you have existing form builder functionality?**
4. **Do you have existing dashboard/reporting infrastructure?**
5. **What dropdown lists already exist in your system?**
6. **How do you handle file uploads?**
7. **What authentication system do you use?**
8. **Do you have an OpenAI API key configured?**
9. **What chart library do you prefer?**
10. **Are there any specific compliance requirements?**

---

## SUCCESS CRITERIA

The deployment is successful when:
1. ✅ Users can upload grant documents and get AI analysis
2. ✅ All 7 wizard steps function correctly
3. ✅ Forms are generated with appropriate field types
4. ✅ Dashboard displays metrics linked to form data
5. ✅ Existing system dropdowns are integrated
6. ✅ Grants are saved to the database
7. ✅ Navigation and permissions work correctly
8. ✅ UI matches the target system's design patterns
9. ✅ Markdown export generates complete grant documentation
10. ✅ Branded PDF submission documents are professionally formatted

---

## GRANT DOCUMENT GENERATION

### Overview
The system generates two types of exportable grant documents:
1. **Markdown File** - Portable, version-controllable documentation
2. **Branded Professional PDF** - Funder-ready submission document

### Document Generation API

#### Endpoint: `/api/grants/export`

**Request:**
```typescript
POST /api/grants/export
Content-Type: application/json

{
  grantId: string;
  format: 'markdown' | 'pdf' | 'both';
  branding?: {
    organizationName: string;
    logoUrl?: string;
    primaryColor?: string;      // Hex color for headers
    secondaryColor?: string;    // Hex color for accents
    contactInfo?: {
      address: string;
      phone: string;
      email: string;
      website: string;
    };
  };
  includeAppendices?: boolean;
  includeBudgetDetails?: boolean;
}
```

**Response:**
```typescript
{
  success: boolean;
  markdown?: string;           // Raw markdown content
  markdownUrl?: string;        // Download URL for .md file
  pdfUrl?: string;             // Download URL for branded PDF
  generatedAt: string;
}
```

---

### Markdown Export Structure

The generated Markdown file follows this structure:

```markdown
# [Grant Title]

## Executive Summary
[AI-generated summary of grant purpose, goals, and expected outcomes]

## Grant Information
| Field | Value |
|-------|-------|
| Grant Number | [grantNumber] |
| Funding Source | [fundingSource] |
| Total Budget | $[totalBudget] |
| Project Period | [startDate] to [endDate] |
| Status | [status] |

## Project Description
[Full grant description]

## Collaborating Organizations

### Lead Organization
- **Name:** [entity.name]
- **Contact:** [entity.contactName] ([entity.contactEmail])
- **Responsibilities:** [entity.responsibilities]

### Partner Organizations
[Repeat for each partner]

## Project Timeline & Milestones

| Milestone | Due Date | Status | Responsible Parties |
|-----------|----------|--------|--------------------|
| [name] | [dueDate] | [status] | [responsibleParties] |

### Milestone Details
#### [Milestone 1 Name]
- **Description:** [description]
- **Dependencies:** [dependencies]
- **Deliverables:** [extracted deliverables]

## Data Collection Plan

### [Method 1 Name]
- **Description:** [description]
- **Frequency:** [frequency]
- **Responsible Entity:** [responsibleEntity]
- **Data Points:** [dataPoints]
- **Tools/Methods:** [tools]

## Reporting Requirements

| Report Type | Frequency | Due Date | Description |
|-------------|-----------|----------|-------------|
| [type] | [frequency] | [dueDate] | [description] |

## Budget Summary

| Category | Amount | Percentage |
|----------|--------|------------|
| Personnel | $X | X% |
| Equipment | $X | X% |
| Supplies | $X | X% |
| Travel | $X | X% |
| Other | $X | X% |
| **Total** | **$[totalBudget]** | **100%** |

## Performance Metrics & KPIs

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| [name] | [target] | [value] | [status] |

## Risk Assessment
[AI-generated risk analysis based on grant data]

## Appendices
- Appendix A: Detailed Budget Breakdown
- Appendix B: Staff Qualifications
- Appendix C: Letters of Support
- Appendix D: Data Collection Forms

---
*Generated on [date] | Grant Management System*
```

---

### Branded Professional PDF Format

The PDF export creates a funder-ready submission document with:

#### Cover Page
```
┌─────────────────────────────────────────────┐
│                                             │
│              [ORGANIZATION LOGO]            │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│            [GRANT TITLE]                    │
│                                             │
│     A Proposal Submitted to:                │
│        [FUNDING SOURCE]                     │
│                                             │
│     Grant Number: [GRANT NUMBER]            │
│                                             │
│     Project Period:                         │
│     [START DATE] - [END DATE]               │
│                                             │
│     Total Budget Request: $[BUDGET]         │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│     Submitted by:                           │
│     [LEAD ORGANIZATION NAME]                │
│     [ADDRESS]                               │
│     [PHONE] | [EMAIL]                       │
│     [WEBSITE]                               │
│                                             │
│     Submission Date: [DATE]                 │
│                                             │
└─────────────────────────────────────────────┘
```

#### Document Sections

1. **Table of Contents** (auto-generated with page numbers)

2. **Executive Summary** (1 page)
   - Project overview
   - Key objectives
   - Expected outcomes
   - Budget summary

3. **Organizational Capacity** (1-2 pages)
   - Lead organization background
   - Partner organizations
   - Relevant experience
   - Staff qualifications

4. **Statement of Need** (1-2 pages)
   - Problem description
   - Target population
   - Geographic scope
   - Supporting data

5. **Project Description** (3-5 pages)
   - Goals and objectives
   - Activities and methods
   - Timeline with milestones
   - Deliverables matrix

6. **Evaluation Plan** (1-2 pages)
   - Data collection methods
   - Performance metrics
   - Reporting schedule
   - Quality assurance

7. **Budget Narrative** (2-3 pages)
   - Line item justification
   - Cost allocation
   - In-kind contributions
   - Sustainability plan

8. **Appendices**
   - Detailed budget tables
   - Organizational chart
   - Letters of commitment
   - Resumes/CVs
   - Data collection instruments

#### PDF Styling Options

```typescript
interface PDFBrandingConfig {
  // Header/Footer
  headerLogo: string;           // URL to logo image
  headerHeight: number;         // pixels
  footerText: string;           // e.g., "Confidential - [Org Name]"
  pageNumbers: boolean;
  
  // Colors
  primaryColor: string;         // Section headers
  secondaryColor: string;       // Subheaders, accents
  accentColor: string;          // Highlights, callouts
  
  // Typography
  headingFont: string;          // e.g., "Georgia", "Arial"
  bodyFont: string;             // e.g., "Times New Roman", "Calibri"
  fontSize: number;             // Base font size (pt)
  
  // Layout
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
  // Sections to include
  includeCoverPage: boolean;
  includeTableOfContents: boolean;
  includeAppendices: boolean;
}
```

---

### Deliverables Matrix Generation

The system auto-generates a deliverables matrix from milestones:

```typescript
interface Deliverable {
  id: string;
  name: string;
  description: string;
  milestone: string;            // Linked milestone
  dueDate: string;
  responsibleParty: string;
  verificationMethod: string;   // How completion is verified
  status: 'pending' | 'in_progress' | 'submitted' | 'approved';
  submissionDate?: string;
  approvalDate?: string;
  notes?: string;
}

// Auto-generated from milestones
function generateDeliverablesMatrix(grant: Grant): Deliverable[] {
  return grant.projectMilestones.map(milestone => ({
    id: generateId(),
    name: milestone.name,
    description: milestone.description,
    milestone: milestone.name,
    dueDate: milestone.dueDate,
    responsibleParty: milestone.responsibleParties.join(', '),
    verificationMethod: inferVerificationMethod(milestone),
    status: mapMilestoneStatus(milestone.status),
  }));
}
```

#### Deliverables Table in Export

| # | Deliverable | Description | Due Date | Responsible | Verification | Status |
|---|-------------|-------------|----------|-------------|--------------|--------|
| 1 | Program Launch | Complete setup and begin services | 2024-03-31 | Lead Org | Launch report | Pending |
| 2 | Q1 Report | First quarterly progress report | 2024-04-15 | Lead Org | Submitted report | Pending |
| 3 | Mid-Year Evaluation | Program assessment at 6 months | 2024-07-31 | Evaluator | Evaluation report | Pending |

---

### Export UI Component

```typescript
// GrantExportDialog.tsx
interface GrantExportDialogProps {
  grant: Grant;
  onExport: (options: ExportOptions) => Promise<void>;
}

function GrantExportDialog({ grant, onExport }: GrantExportDialogProps) {
  const [format, setFormat] = useState<'markdown' | 'pdf' | 'both'>('both');
  const [includeBranding, setIncludeBranding] = useState(true);
  const [includeAppendices, setIncludeAppendices] = useState(true);
  
  return (
    <Dialog>
      <DialogTitle>Export Grant Document</DialogTitle>
      <DialogContent>
        {/* Format Selection */}
        <FormControl>
          <FormLabel>Export Format</FormLabel>
          <RadioGroup value={format} onChange={setFormat}>
            <Radio value="markdown" label="Markdown (.md)" />
            <Radio value="pdf" label="Branded PDF" />
            <Radio value="both" label="Both Formats" />
          </RadioGroup>
        </FormControl>
        
        {/* Branding Options (for PDF) */}
        {format !== 'markdown' && (
          <BrandingOptions
            enabled={includeBranding}
            onToggle={setIncludeBranding}
          />
        )}
        
        {/* Content Options */}
        <FormControlLabel
          control={<Checkbox checked={includeAppendices} />}
          label="Include Appendices"
        />
        
        {/* Preview */}
        <DocumentPreview grant={grant} format={format} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onExport({ format, includeBranding, includeAppendices })}>
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

### PDF Generation Libraries

Recommended libraries for PDF generation:

| Library | Use Case | Notes |
|---------|----------|-------|
| **@react-pdf/renderer** | React-based PDF generation | Best for complex layouts |
| **pdfmake** | Declarative PDF creation | Good for tables and forms |
| **puppeteer** | HTML to PDF conversion | Best for exact styling |
| **jsPDF** | Client-side generation | Lightweight, basic features |

**Recommended Approach:**
```typescript
// Server-side PDF generation with Puppeteer
import puppeteer from 'puppeteer';

async function generateBrandedPDF(grant: Grant, branding: BrandingConfig): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Generate HTML from grant data
  const html = renderGrantToHTML(grant, branding);
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdf = await page.pdf({
    format: 'Letter',
    margin: branding.margins,
    displayHeaderFooter: true,
    headerTemplate: generateHeader(branding),
    footerTemplate: generateFooter(branding),
  });
  
  await browser.close();
  return pdf;
}
```

---

### Wizard Step 8: Export & Submission (NEW)

Add a new wizard step for document generation:

```typescript
// Step 8: Export & Submission
// Features:
// - Preview generated documents
// - Configure branding options
// - Select export format (Markdown, PDF, both)
// - Download generated files
// - Email submission option
// - Track submission history
```

**Step 8 UI:**
- Document preview panel
- Branding configuration (logo, colors, fonts)
- Export format selection
- Deliverables checklist
- Download buttons
- Submission tracking
