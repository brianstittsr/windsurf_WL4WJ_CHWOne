# CHWOne Platform - Technical Summary for AI Development

## Overview

**CHWOne** is a comprehensive HIPAA-compliant web application for managing Community Health Workers (CHWs), built for **Women Leading for Wellness and Justice (WL4WJ)**. It's a Next.js 14 application with Firebase backend, Material-UI components, and OpenAI integration.

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Styling**: SCSS Modules, Tailwind CSS
- **State Management**: React Context API
- **Charts**: Recharts
- **Drag & Drop**: React Beautiful DnD
- **Icons**: React Icons, Lucide

### Backend
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth (Email/Password)
- **Storage**: Firebase Storage
- **Server Functions**: Next.js API Routes (`/src/app/api/`)
- **AI**: OpenAI GPT-4o API

### External Integrations
- **Bill.com**: Invoice and payment processing
- **NC C.A.R.E. 360**: Statewide care coordination
- **Empower Project**: Survey data integration
- **n8n**: Workflow automation

---

## Project Structure

```
CHWOne/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes (server-side)
│   │   │   ├── ai/             # AI endpoints (analyze-grant, enhance-form)
│   │   │   ├── billcom/        # Bill.com integration (login, customers, vendors)
│   │   │   ├── chw/            # CHW-related APIs
│   │   │   ├── datasets/       # Dataset CRUD operations
│   │   │   ├── forms/          # Form management
│   │   │   ├── grants/         # Grant operations
│   │   │   └── ...
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── dashboard/          # User dashboards
│   │   ├── grants/             # Grant management pages
│   │   ├── forms/              # Form builder pages
│   │   ├── datasets/           # Dataset management
│   │   ├── collaborations/     # Project collaborations
│   │   ├── chws/               # CHW directory
│   │   └── ...
│   ├── components/             # React components
│   │   ├── Admin/              # Admin panel components
│   │   ├── CHW/                # CHW-related components
│   │   ├── Dashboard/          # Dashboard widgets
│   │   ├── Datasets/           # Dataset components
│   │   ├── Forms/              # Form builder components
│   │   ├── Grants/             # Grant wizard components
│   │   ├── Layout/             # Navigation, headers, sidebars
│   │   └── ...
│   ├── services/               # Business logic services
│   │   ├── BillComService.ts   # Bill.com API integration
│   │   ├── CollaborationService.ts
│   │   ├── DatasetService.ts
│   │   ├── UserManagementService.ts
│   │   ├── GrantService.ts
│   │   └── ...
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── GrantWizardContext.tsx
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   │   └── firebase.ts         # Firebase configuration
│   ├── types/                  # TypeScript type definitions
│   └── constants/              # App constants
├── docs/                       # Documentation
├── public/                     # Static assets
└── .env.local                  # Environment variables
```

---

## Core Features

### 1. User Management & Authentication
- **Multi-role system**: Users can have multiple roles (CHW, Nonprofit Staff, Admin, etc.)
- **Role switcher**: Switch between roles without re-login
- **Firebase Auth**: Email/password authentication
- **RBAC**: Role-based access control

**Key Files:**
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/services/UserManagementService.ts` - User CRUD operations
- `src/components/Admin/AdminUsers.tsx` - User management UI

### 2. Grant Management (AI-Powered)
- **Grant Analyzer Wizard**: 7-step wizard for grant setup
- **AI Document Analysis**: Upload PDF/Word docs, GPT-4o extracts data
- **Auto-form generation**: Creates data collection forms from requirements
- **Dashboard generation**: Auto-creates KPI dashboards

**Key Files:**
- `src/app/api/ai/analyze-grant/route.ts` - AI analysis endpoint
- `src/components/Grants/wizard/` - Wizard step components
- `src/contexts/GrantWizardContext.tsx` - Wizard state

### 3. Form Builder
- **75+ field types**: Qualtrics-style form builder
- **Drag-and-drop**: Reorder fields visually
- **Templates**: Pre-built form templates
- **Dataset auto-creation**: Forms automatically create datasets

**Key Files:**
- `src/components/Forms/FormBuilder/` - Form builder components
- `src/app/forms/builder/page.tsx` - Builder page
- `src/constants/formFieldTypes.ts` - Field type definitions

### 4. Dataset Management
- **CRUD operations**: Create, read, update, delete datasets
- **Record management**: Add/edit records within datasets
- **Data merging**: Combine multiple datasets
- **Analytics**: Basic data analysis

**Key Files:**
- `src/services/DatasetService.ts` - Dataset operations
- `src/components/Datasets/` - Dataset UI components
- `src/app/api/datasets/` - Dataset API routes

### 5. Bill.com Integration
- **Invoice sending**: Create and send invoices
- **Vendor payments**: Pay CHWs via Bill.com
- **Customer management**: Sync customers from Bill.com
- **Session management**: Cached API sessions

**Key Files:**
- `src/services/BillComService.ts` - Bill.com service
- `src/app/api/billcom/` - API routes (login, customers, vendors)
- `src/components/Admin/AdminBillComAPI.tsx` - Admin UI

### 6. CHW Management
- **Profile management**: CHW certifications, specializations
- **Job matching**: AI-powered job recommendations
- **Directory**: Searchable CHW directory
- **Training tracker**: Certification tracking

**Key Files:**
- `src/components/CHW/` - CHW components
- `src/app/chws/` - CHW pages
- `src/app/api/chw/` - CHW API routes

### 7. Collaboration/Project Management
- **Project tracking**: Manage community health projects
- **Entity collaboration**: Track partner organizations
- **Milestone tracking**: Project timeline management

**Key Files:**
- `src/services/CollaborationService.ts`
- `src/app/collaborations/` - Collaboration pages

---

## Firebase Collections

| Collection | Purpose |
|------------|---------|
| `users` | User accounts and profiles |
| `chwProfiles` | CHW professional profiles |
| `nonprofitProfiles` | Nonprofit organization profiles |
| `grants` | Grant information |
| `grantCollaborations` | Project collaborations |
| `forms` | Form definitions |
| `formSubmissions` | Form response data |
| `datasets` | Dataset metadata |
| `datasetRecords` | Dataset records |
| `chwJobs` | Job postings |
| `billcomCredentials` | Bill.com API credentials |
| `billcomTransactions` | Payment transactions |
| `states` | US state entities |
| `chwAssociations` | CHW associations |

---

## API Routes

### AI Endpoints
- `POST /api/ai/analyze-grant` - Analyze grant documents
- `POST /api/ai/enhance-form` - AI form suggestions
- `POST /api/ai/generate-proposal` - Generate proposals

### Bill.com Endpoints
- `POST /api/billcom/login` - Get session ID
- `POST /api/billcom/customers` - List customers
- `POST /api/billcom/vendors` - List vendors

### Dataset Endpoints
- `GET/POST /api/datasets` - List/create datasets
- `GET/PUT/DELETE /api/datasets/[id]` - Dataset operations
- `GET/POST /api/datasets/[id]/records` - Record operations

### CHW Endpoints
- `POST /api/chw/ai-job-search` - AI job search
- `POST /api/chw/send-job-notifications` - Email notifications

---

## Environment Variables

```env
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase (Server)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# OpenAI
OPENAI_API_KEY=

# Bill.com
BILLCOM_USERNAME=
BILLCOM_PASSWORD=
```

---

## Key Patterns

### Service Pattern
Services in `/src/services/` encapsulate Firestore operations:
```typescript
// Example: DatasetService.ts
export async function createDataset(data: CreateDataset): Promise<string> {
  const docRef = await addDoc(collection(db, 'datasets'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
```

### API Route Pattern
API routes in `/src/app/api/` handle server-side logic:
```typescript
// Example: /api/billcom/customers/route.ts
export async function POST(request: NextRequest) {
  const { sessionId, devKey } = await request.json();
  // Call Bill.com API
  return NextResponse.json({ success: true, customers });
}
```

### Component Pattern
Components use Material-UI with TypeScript:
```typescript
// Example component structure
interface Props {
  data: SomeType;
  onSave: (data: SomeType) => void;
}

export default function MyComponent({ data, onSave }: Props) {
  const [state, setState] = useState(data);
  return <Box>...</Box>;
}
```

---

## Current Development Focus

1. **Bill.com Integration**: Real API calls for customers/vendors
2. **Grant Wizard**: AI-powered grant document analysis
3. **Form Builder**: 75+ field types with dataset integration
4. **Dashboard**: Real-time metrics and visualizations

---

## Common Development Tasks

### Adding a New API Route
1. Create file in `/src/app/api/[route]/route.ts`
2. Export `GET`, `POST`, `PUT`, or `DELETE` functions
3. Use `NextRequest` and `NextResponse`

### Adding a New Service
1. Create file in `/src/services/[Name]Service.ts`
2. Import Firebase: `import { db } from '@/lib/firebase'`
3. Export async functions for CRUD operations

### Adding a New Page
1. Create file in `/src/app/[route]/page.tsx`
2. Export default React component
3. Use `'use client'` for client-side interactivity

### Adding a New Component
1. Create file in `/src/components/[Category]/[Name].tsx`
2. Use TypeScript interfaces for props
3. Import MUI components as needed

---

## Notes for AI Development

- **Always use TypeScript** with proper type definitions
- **Follow existing patterns** in the codebase
- **Use Material-UI** for UI components
- **Use Firebase Firestore** for data persistence
- **API routes** handle server-side operations
- **Services** encapsulate business logic
- **Contexts** manage global state
- **HIPAA compliance** is required for client data
