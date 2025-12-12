# RFI/RFP Analyzer Wizard - Development Prompt

## Overview

Create an AI-powered RFI/RFP (Request for Information / Request for Proposal) Analyzer Wizard that helps organizations effectively respond to government solicitation proposals. This wizard will analyze uploaded solicitation documents, extract key requirements, and guide users through creating a comprehensive, compliant response.

## Purpose

Government RFIs and RFPs are complex documents with strict requirements, evaluation criteria, and compliance mandates. This wizard will:

1. **Parse and analyze** uploaded RFI/RFP documents (PDF, Word, or pasted text)
2. **Extract key information** including deadlines, requirements, evaluation criteria, and compliance items
3. **Generate structured response outlines** aligned with solicitation requirements
4. **Track compliance** with all mandatory requirements
5. **Facilitate collaboration** among team members working on the response
6. **Manage timelines** with milestone tracking and deadline alerts

---

## Wizard Steps

### Step 1: Document Upload & Basic Information

**Purpose:** Upload the RFI/RFP document and capture basic solicitation information.

**AI Analysis Extracts:**
- Solicitation number/ID
- Issuing agency/organization
- Title of the solicitation
- Type (RFI, RFP, RFQ, IFB, BAA, SBIR, STTR, etc.)
- NAICS code(s)
- Set-aside status (Small Business, 8(a), HUBZone, WOSB, SDVOSB, etc.)
- Contract type (FFP, T&M, Cost-Plus, IDIQ, BPA, etc.)
- Period of performance
- Place of performance
- Estimated contract value
- Primary point of contact
- Questions deadline
- Proposal due date/time
- Pre-proposal conference details (if any)

**User Input Fields:**
- Upload document (PDF, DOCX, or paste text)
- Internal project name
- Bid/No-Bid decision status
- Assigned proposal manager
- Internal deadline (before official deadline)

**UI Components:**
- File upload dropzone with drag-and-drop
- Document preview panel
- AI extraction progress indicator
- Editable fields for extracted data
- Solicitation type selector
- Timeline visualization showing key dates

---

### Step 2: Requirements Analysis

**Purpose:** Identify and categorize all requirements from the solicitation.

**AI Analysis Extracts:**

**Mandatory Requirements (Must Have):**
- Technical requirements
- Functional requirements
- Performance standards
- Security requirements (FISMA, FedRAMP, CMMC, etc.)
- Certifications required
- Past performance requirements
- Key personnel requirements
- Facility requirements
- Insurance requirements

**Evaluation Criteria:**
- Technical approach (weight/points)
- Management approach (weight/points)
- Past performance (weight/points)
- Price/cost (weight/points)
- Small business participation (weight/points)
- Other factors

**Compliance Items:**
- FAR/DFAR clauses
- Agency-specific clauses
- Representations and certifications
- Required forms (SF-33, SF-1449, etc.)
- Required attachments

**Data Structure:**
```typescript
interface Requirement {
  id: string;
  category: 'technical' | 'management' | 'past_performance' | 'pricing' | 'compliance' | 'administrative';
  type: 'mandatory' | 'desirable' | 'optional';
  description: string;
  source: string; // Section reference in RFP
  pageNumber: number;
  complianceStatus: 'compliant' | 'partial' | 'non_compliant' | 'pending';
  responseStrategy: string;
  assignedTo: string;
  notes: string;
}

interface EvaluationCriterion {
  id: string;
  factor: string;
  weight: number; // percentage or points
  description: string;
  subfactors: {
    name: string;
    weight: number;
    description: string;
  }[];
}
```

**UI Components:**
- Requirements matrix with filtering
- Compliance checklist with status indicators
- Evaluation criteria breakdown chart
- Requirement-to-response mapping tool
- Risk assessment for each requirement

---

### Step 3: Scope of Work (SOW) / Statement of Work Analysis

**Purpose:** Break down the work requirements and deliverables.

**AI Analysis Extracts:**

**Work Breakdown Structure:**
- Tasks and subtasks
- Deliverables with due dates
- Milestones
- Acceptance criteria
- Quality standards
- Reporting requirements

**Performance Metrics:**
- Service Level Agreements (SLAs)
- Key Performance Indicators (KPIs)
- Quality metrics
- Response time requirements
- Availability requirements

**Data Structure:**
```typescript
interface Task {
  id: string;
  taskNumber: string; // e.g., "3.1.2"
  title: string;
  description: string;
  deliverables: Deliverable[];
  milestones: Milestone[];
  estimatedEffort: number; // hours
  skillsRequired: string[];
  dependencies: string[]; // task IDs
}

interface Deliverable {
  id: string;
  name: string;
  description: string;
  format: string;
  dueDate: string;
  acceptanceCriteria: string[];
  reviewPeriod: number; // days
}

interface PerformanceMetric {
  id: string;
  name: string;
  target: string;
  measurementMethod: string;
  reportingFrequency: string;
  penalty: string; // if applicable
}
```

**UI Components:**
- Work breakdown structure tree view
- Deliverables timeline (Gantt-style)
- SLA/KPI dashboard mockup
- Effort estimation calculator
- Resource allocation planner

---

### Step 4: Team & Capabilities Assessment

**Purpose:** Map organizational capabilities to requirements and identify gaps.

**AI Recommendations:**
- Suggested team structure based on requirements
- Key personnel roles needed
- Skills gap analysis
- Teaming partner recommendations
- Subcontractor needs

**User Input:**
- Available key personnel with resumes
- Organizational capabilities
- Past performance examples
- Certifications held
- Facility clearances
- Existing contracts/vehicles

**Data Structure:**
```typescript
interface KeyPersonnel {
  id: string;
  name: string;
  proposedRole: string;
  currentTitle: string;
  yearsExperience: number;
  relevantExperience: string[];
  certifications: string[];
  clearanceLevel: string;
  availability: 'full_time' | 'part_time' | 'as_needed';
  resumeUrl: string;
}

interface PastPerformance {
  id: string;
  contractNumber: string;
  contractTitle: string;
  client: string;
  clientPOC: {
    name: string;
    phone: string;
    email: string;
  };
  contractValue: number;
  periodOfPerformance: string;
  relevance: string;
  description: string;
  outcomes: string[];
  cparsRating: string;
}

interface CapabilityGap {
  requirement: string;
  currentCapability: string;
  gap: string;
  mitigationStrategy: 'hire' | 'train' | 'partner' | 'subcontract';
  estimatedCost: number;
  timeToClose: number; // days
}
```

**UI Components:**
- Team organization chart builder
- Skills matrix (requirements vs. capabilities)
- Past performance relevance scorer
- Gap analysis dashboard
- Teaming partner search integration

---

### Step 5: Technical Approach Development

**Purpose:** Develop the technical solution and approach narrative.

**AI Assistance:**
- Generate technical approach outline based on requirements
- Suggest solution architectures
- Recommend methodologies (Agile, Waterfall, DevSecOps, etc.)
- Identify discriminators and win themes
- Draft section content with compliance mapping

**Sections to Generate:**
1. **Understanding of the Problem**
   - Restate requirements in own words
   - Demonstrate understanding of agency mission
   - Identify challenges and risks

2. **Technical Solution**
   - Proposed approach
   - Tools and technologies
   - Innovation and value-adds
   - Security approach
   - Quality assurance approach

3. **Methodology**
   - Development/delivery methodology
   - Project management approach
   - Communication plan
   - Risk management approach
   - Change management approach

**Data Structure:**
```typescript
interface TechnicalApproach {
  id: string;
  section: string;
  requirement_refs: string[]; // Links to requirements
  content: string;
  discriminators: string[];
  graphics: Graphic[];
  complianceMatrix: ComplianceItem[];
}

interface WinTheme {
  id: string;
  theme: string;
  description: string;
  evidence: string[];
  sections_applied: string[];
}

interface Graphic {
  id: string;
  title: string;
  type: 'diagram' | 'chart' | 'table' | 'timeline' | 'org_chart';
  description: string;
  placement: string; // section reference
}
```

**UI Components:**
- Outline builder with drag-and-drop sections
- AI content generator for each section
- Win theme tracker
- Compliance matrix auto-generator
- Graphics placeholder manager
- Word/page count tracker

---

### Step 6: Management Approach Development

**Purpose:** Develop the management and staffing approach.

**AI Assistance:**
- Generate management approach based on contract type
- Suggest organizational structure
- Draft staffing plan
- Create transition plan outline
- Develop risk register

**Sections to Generate:**
1. **Program Management**
   - Management philosophy
   - Organizational structure
   - Roles and responsibilities
   - Decision-making authority
   - Escalation procedures

2. **Staffing Plan**
   - Staffing matrix
   - Recruitment approach
   - Retention strategies
   - Training and development
   - Succession planning

3. **Transition Plan**
   - Phase-in approach
   - Knowledge transfer
   - Incumbent personnel
   - Continuity of operations

4. **Risk Management**
   - Risk identification
   - Risk assessment
   - Mitigation strategies
   - Contingency plans

**Data Structure:**
```typescript
interface ManagementApproach {
  organizationalStructure: OrgStructure;
  staffingPlan: StaffingPlan;
  transitionPlan: TransitionPlan;
  riskRegister: Risk[];
  qualityPlan: QualityPlan;
  communicationPlan: CommunicationPlan;
}

interface StaffingPlan {
  totalFTE: number;
  laborCategories: LaborCategory[];
  staffingTimeline: StaffingPhase[];
  recruitmentStrategy: string;
  retentionStrategy: string;
}

interface Risk {
  id: string;
  category: 'technical' | 'schedule' | 'cost' | 'programmatic' | 'external';
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  contingency: string;
  owner: string;
  status: 'open' | 'mitigated' | 'closed';
}
```

**UI Components:**
- Org chart builder
- Staffing matrix editor
- Risk register with heat map
- Transition timeline builder
- RACI matrix generator

---

### Step 7: Pricing & Cost Volume

**Purpose:** Develop compliant pricing and cost estimates.

**AI Assistance:**
- Parse pricing instructions from RFP
- Suggest pricing structure based on contract type
- Calculate labor rates with escalation
- Identify cost drivers
- Generate cost narrative outline

**Pricing Components:**
1. **Direct Labor**
   - Labor categories
   - Hourly rates
   - Hours by task/year
   - Escalation factors

2. **Other Direct Costs (ODCs)**
   - Travel
   - Materials
   - Equipment
   - Subcontracts
   - Other

3. **Indirect Costs**
   - Fringe benefits
   - Overhead
   - G&A
   - Fee/profit

**Data Structure:**
```typescript
interface PricingVolume {
  pricingStructure: 'ffp' | 'tm' | 'cost_plus' | 'hybrid';
  laborRates: LaborRate[];
  directCosts: DirectCost[];
  indirectRates: IndirectRate[];
  totalPrice: number;
  priceByYear: YearlyPrice[];
  priceByTask: TaskPrice[];
}

interface LaborRate {
  category: string;
  baseRate: number;
  fringeRate: number;
  overheadRate: number;
  gaRate: number;
  fee: number;
  fullyBurdenedRate: number;
  escalation: number; // annual percentage
}

interface CostNarrative {
  basisOfEstimate: string;
  assumptions: string[];
  exclusions: string[];
  rateJustification: string;
  costRealism: string;
}
```

**UI Components:**
- Labor rate calculator
- Cost buildup spreadsheet
- Price summary dashboard
- Cost narrative generator
- What-if scenario analyzer
- Competitive price analysis tool

---

### Step 8: Compliance Matrix & Checklist

**Purpose:** Ensure 100% compliance with all RFP requirements.

**AI Analysis:**
- Auto-generate compliance matrix from requirements
- Map response sections to requirements
- Identify gaps in compliance
- Validate page limits and formatting
- Check for missing elements

**Compliance Tracking:**
```typescript
interface ComplianceMatrix {
  items: ComplianceItem[];
  overallScore: number; // percentage
  criticalGaps: ComplianceItem[];
  warnings: string[];
}

interface ComplianceItem {
  id: string;
  requirement: string;
  rfpReference: string; // Section/page
  responseReference: string; // Proposal section/page
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
  notes: string;
  verifiedBy: string;
  verifiedDate: string;
}

interface FormatCompliance {
  pageLimit: { required: number; actual: number; compliant: boolean };
  fontRequirements: { required: string; actual: string; compliant: boolean };
  marginRequirements: { required: string; actual: string; compliant: boolean };
  fileFormat: { required: string; actual: string; compliant: boolean };
  namingConvention: { required: string; actual: string; compliant: boolean };
}
```

**UI Components:**
- Interactive compliance matrix
- Requirement traceability matrix
- Gap analysis report
- Format compliance checker
- Submission checklist
- Red team review tracker

---

### Step 9: Review & Response Generation

**Purpose:** Final review, quality check, and document generation.

**Features:**
1. **Executive Summary Generator**
   - AI-generated executive summary
   - Win theme integration
   - Key discriminators highlight

2. **Document Assembly**
   - Combine all volumes
   - Apply formatting templates
   - Generate table of contents
   - Insert graphics and tables
   - Create cross-references

3. **Quality Checks**
   - Spelling and grammar
   - Consistency check
   - Compliance verification
   - Page count validation
   - File size check

4. **Export Options**
   - PDF generation
   - Word document
   - Compliance matrix (Excel)
   - Executive briefing (PowerPoint)

**Data Structure:**
```typescript
interface ProposalPackage {
  id: string;
  solicitationId: string;
  status: 'draft' | 'review' | 'final' | 'submitted';
  volumes: Volume[];
  attachments: Attachment[];
  submissionDetails: SubmissionDetails;
  reviewHistory: Review[];
}

interface Volume {
  id: string;
  name: string; // e.g., "Volume I - Technical"
  sections: Section[];
  pageCount: number;
  wordCount: number;
  lastModified: string;
  status: 'draft' | 'review' | 'approved';
}

interface SubmissionDetails {
  method: 'email' | 'portal' | 'physical' | 'sam_gov';
  portalUrl: string;
  submissionEmail: string;
  physicalAddress: string;
  copies: { original: number; copies: number; electronic: number };
  submittedDate: string;
  confirmationNumber: string;
}
```

**UI Components:**
- Document preview with all volumes
- Quality score dashboard
- Review workflow manager
- Export format selector
- Submission tracker
- Post-submission archive

---

## Technical Implementation

### API Endpoints

```typescript
// Document Analysis
POST /api/rfp/analyze
  - Upload and analyze RFP document
  - Returns extracted data structure

POST /api/rfp/extract-requirements
  - Extract all requirements from document
  - Returns categorized requirements list

// Response Generation
POST /api/rfp/generate-section
  - Generate content for specific section
  - Input: section type, requirements, context
  - Returns: AI-generated content

POST /api/rfp/generate-compliance-matrix
  - Auto-generate compliance matrix
  - Input: requirements, response sections
  - Returns: compliance matrix with mappings

// Pricing
POST /api/rfp/calculate-pricing
  - Calculate fully-burdened rates
  - Input: labor categories, indirect rates
  - Returns: pricing breakdown

// Export
POST /api/rfp/export
  - Generate final documents
  - Input: format, volumes to include
  - Returns: downloadable files
```

### AI Prompts

**Document Analysis Prompt:**
```
Analyze this government RFI/RFP document and extract:

1. BASIC INFORMATION:
   - Solicitation number and title
   - Issuing agency
   - Type (RFI/RFP/RFQ/etc.)
   - NAICS code(s)
   - Set-aside status
   - Contract type
   - Period of performance
   - Key dates (questions due, proposal due)
   - Point of contact

2. REQUIREMENTS:
   - All mandatory requirements (SHALL statements)
   - Desirable requirements (SHOULD statements)
   - Technical requirements
   - Security requirements
   - Personnel requirements
   - Past performance requirements

3. EVALUATION CRITERIA:
   - All evaluation factors with weights
   - Subfactors
   - Evaluation methodology (LPTA, best value, etc.)

4. COMPLIANCE ITEMS:
   - Required forms
   - Required certifications
   - FAR/DFAR clauses
   - Format requirements (page limits, fonts, etc.)

5. SCOPE OF WORK:
   - Tasks and deliverables
   - Performance metrics/SLAs
   - Reporting requirements

Return as structured JSON with confidence scores for each extraction.
```

**Technical Approach Generation Prompt:**
```
Generate a technical approach section for this government proposal:

SOLICITATION: {solicitation_title}
REQUIREMENT: {requirement_description}
EVALUATION CRITERIA: {criteria}
OUR CAPABILITIES: {capabilities}
WIN THEMES: {win_themes}

Create content that:
1. Demonstrates clear understanding of the requirement
2. Presents a compliant solution
3. Highlights our discriminators
4. Uses active voice and action verbs
5. Includes specific, measurable outcomes
6. References relevant past performance
7. Addresses evaluation criteria directly

Format with:
- Clear topic sentences
- Bullet points for key features
- Callout boxes for discriminators
- Cross-references to other sections
- Compliance matrix references

Target length: {word_count} words
```

### Database Schema

```typescript
// Firestore Collections

// rfp_analyses
interface RFPAnalysis {
  id: string;
  organizationId: string;
  solicitationNumber: string;
  title: string;
  status: 'analyzing' | 'active' | 'submitted' | 'won' | 'lost' | 'no_bid';
  basicInfo: BasicInfo;
  requirements: Requirement[];
  evaluationCriteria: EvaluationCriterion[];
  complianceItems: ComplianceItem[];
  scopeOfWork: ScopeOfWork;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  team: string[];
}

// rfp_responses
interface RFPResponse {
  id: string;
  analysisId: string;
  volumes: Volume[];
  teamAssignments: TeamAssignment[];
  pricingData: PricingVolume;
  complianceMatrix: ComplianceMatrix;
  reviewStatus: ReviewStatus;
  submissionDetails: SubmissionDetails;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// rfp_templates
interface RFPTemplate {
  id: string;
  organizationId: string;
  name: string;
  type: 'technical' | 'management' | 'past_performance' | 'pricing';
  content: string;
  variables: string[];
  createdAt: Timestamp;
}
```

---

## UI/UX Guidelines

### Design Principles
1. **Progressive Disclosure** - Show complexity gradually
2. **Contextual Help** - Tooltips explaining government terminology
3. **Visual Progress** - Clear indication of completion status
4. **Collaboration Ready** - Real-time updates, comments, assignments
5. **Compliance First** - Always visible compliance status

### Color Coding
- 🟢 Green: Compliant / Complete
- 🟡 Yellow: Partial / In Progress
- 🔴 Red: Non-compliant / Missing
- 🔵 Blue: AI-generated / Suggested

### Key UI Components
1. **Deadline Countdown** - Prominent display of time remaining
2. **Compliance Score** - Overall percentage with drill-down
3. **Team Dashboard** - Who's working on what
4. **Document Navigator** - Easy navigation between sections
5. **AI Assistant Panel** - Always-available AI help

---

## Integration Points

### External Systems
1. **SAM.gov** - Pull solicitation data automatically
2. **GovWin/Deltek** - Opportunity intelligence
3. **LinkedIn** - Key personnel verification
4. **FPDS** - Past contract data
5. **USASpending** - Competitive intelligence

### Internal Systems
1. **Document Management** - Store all versions
2. **CRM** - Track opportunity pipeline
3. **HR System** - Pull employee data for staffing
4. **Finance System** - Pull rate data for pricing
5. **Project Management** - Track response timeline

---

## Success Metrics

### Efficiency Metrics
- Time to complete analysis: < 2 hours (vs. 8+ hours manual)
- Time to first draft: < 1 day per volume
- Compliance check time: < 30 minutes

### Quality Metrics
- Compliance score: > 95% on first review
- Win rate improvement: Track before/after
- Rework reduction: < 10% content changes after review

### User Adoption
- Active users per month
- Proposals completed through wizard
- AI suggestions accepted rate

---

## Implementation Phases

### Phase 1: Core Analysis (MVP)
- Document upload and parsing
- Basic information extraction
- Requirements extraction
- Simple compliance checklist

### Phase 2: Response Generation
- Technical approach generator
- Management approach generator
- Compliance matrix auto-generation
- Document export

### Phase 3: Advanced Features
- Pricing calculator
- Team collaboration
- Template library
- SAM.gov integration

### Phase 4: Intelligence
- Win/loss analysis
- Competitive intelligence
- Pricing benchmarks
- Success pattern recognition

---

## Security Considerations

1. **Data Classification** - Handle CUI/FOUO appropriately
2. **Access Control** - Role-based permissions
3. **Audit Trail** - Track all changes
4. **Encryption** - At rest and in transit
5. **Data Retention** - Comply with FAR requirements

---

## Glossary

| Term | Definition |
|------|------------|
| RFI | Request for Information - Market research, no contract award |
| RFP | Request for Proposal - Formal solicitation for proposals |
| RFQ | Request for Quote - Request for pricing |
| IFB | Invitation for Bid - Sealed bidding |
| BAA | Broad Agency Announcement - R&D solicitation |
| SBIR | Small Business Innovation Research |
| STTR | Small Business Technology Transfer |
| FFP | Firm Fixed Price |
| T&M | Time and Materials |
| IDIQ | Indefinite Delivery/Indefinite Quantity |
| BPA | Blanket Purchase Agreement |
| NAICS | North American Industry Classification System |
| FAR | Federal Acquisition Regulation |
| DFAR | Defense Federal Acquisition Regulation |
| LPTA | Lowest Price Technically Acceptable |
| CPARS | Contractor Performance Assessment Reporting System |

---

## File Structure

```
src/
├── app/
│   ├── rfp-analyzer/
│   │   ├── page.tsx                 # Main wizard page
│   │   ├── [id]/
│   │   │   └── page.tsx             # Individual RFP analysis
│   │   └── layout.tsx
│   └── api/
│       └── rfp/
│           ├── analyze/route.ts
│           ├── extract-requirements/route.ts
│           ├── generate-section/route.ts
│           ├── generate-compliance-matrix/route.ts
│           ├── calculate-pricing/route.ts
│           └── export/route.ts
├── components/
│   └── RFPAnalyzer/
│       ├── wizard/
│       │   ├── RFPAnalyzerWizard.tsx
│       │   └── steps/
│       │       ├── Step1DocumentUpload.tsx
│       │       ├── Step2RequirementsAnalysis.tsx
│       │       ├── Step3ScopeOfWork.tsx
│       │       ├── Step4TeamCapabilities.tsx
│       │       ├── Step5TechnicalApproach.tsx
│       │       ├── Step6ManagementApproach.tsx
│       │       ├── Step7Pricing.tsx
│       │       ├── Step8ComplianceMatrix.tsx
│       │       └── Step9ReviewGenerate.tsx
│       ├── common/
│       │   ├── ComplianceIndicator.tsx
│       │   ├── DeadlineCountdown.tsx
│       │   ├── RequirementCard.tsx
│       │   └── AIAssistantPanel.tsx
│       └── export/
│           ├── PDFGenerator.tsx
│           ├── WordGenerator.tsx
│           └── ExcelGenerator.tsx
├── contexts/
│   └── RFPAnalyzerContext.tsx
├── services/
│   └── rfpAnalyzerService.ts
├── types/
│   └── rfp.types.ts
└── hooks/
    └── useRFPAnalyzer.ts
```

---

## References

- [FAR (Federal Acquisition Regulation)](https://www.acquisition.gov/far/)
- [SAM.gov](https://sam.gov/)
- [GSA Schedules](https://www.gsa.gov/buying-selling/purchasing-programs/gsa-schedules)
- [SBIR/STTR](https://www.sbir.gov/)
- [Shipley Proposal Guide](https://www.shipleywins.com/)

---

*This prompt document serves as the comprehensive specification for building the RFI/RFP Analyzer Wizard. It should be used in conjunction with the existing Grant Analyzer Wizard codebase as a reference implementation.*
