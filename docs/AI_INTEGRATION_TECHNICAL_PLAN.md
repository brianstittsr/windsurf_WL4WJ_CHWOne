# AI Integration Technical Implementation Plan

## Overview
This document outlines the technical approach for implementing the three AI components in the CHWOne platform:
1. BMAD Chat Agent on the home page
2. CHWOne Assistant in the CHW Profile Tools tab
3. Data Collection Assistant in the CHW Profile Tools tab

## Architecture

### High-Level Architecture
```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│   CHWOne Frontend │     │   CHWOne Backend  │     │  External Services │
│                   │     │                   │     │                   │
│  ┌─────────────┐  │     │  ┌─────────────┐  │     │  ┌─────────────┐  │
│  │ React UI    │  │     │  │ Next.js API │  │     │  │ Archon KB   │  │
│  │ Components  │◄─┼─────┼──┤ Endpoints   │◄─┼─────┼──┤ Service     │  │
│  └─────────────┘  │     │  └─────────────┘  │     │  └─────────────┘  │
│                   │     │                   │     │                   │
│  ┌─────────────┐  │     │  ┌─────────────┐  │     │  ┌─────────────┐  │
│  │ State       │  │     │  │ AI Service  │◄─┼─────┼──┤ n8n         │  │
│  │ Management  │  │     │  │ Layer       │  │     │  │ Workflows   │  │
│  └─────────────┘  │     │  └─────────────┘  │     │  └─────────────┘  │
│                   │     │                   │     │                   │
│  ┌─────────────┐  │     │  ┌─────────────┐  │     │  ┌─────────────┐  │
│  │ Form        │  │     │  │ Form        │  │     │  │ QR Code     │  │
│  │ Builder UI  │◄─┼─────┼──┤ Builder API │  │     │  │ Service     │  │
│  └─────────────┘  │     │  └─────────────┘  │     │  └─────────────┘  │
└───────────────────┘     └───────────────────┘     └───────────────────┘
```

## Component Details

### 1. BMAD Chat Agent

#### Frontend Components
- `BMadChatWidget.tsx` - Main chat widget component
- `ChatMessage.tsx` - Individual message component
- `ChatInput.tsx` - User input component

#### Backend Components
- `bmad-chat.ts` - API route handler for chat interactions
- `archon-service.ts` - Service for communicating with Archon KB
- `chat-history.ts` - Service for managing chat history

#### Data Models
```typescript
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    sources?: string[];
    confidence?: number;
  };
}

interface ChatSession {
  id: string;
  userId?: string; // Optional for anonymous users
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. CHWOne Assistant

#### Frontend Components
- `ToolsTab.tsx` - Container for tools in CHW profile
- `ChwAssistant.tsx` - Main assistant component
- `ResourceViewer.tsx` - Component for displaying found resources
- `TaskRunner.tsx` - Component for running n8n tasks

#### Backend Components
- `chw-assistant.ts` - API route handler for assistant interactions
- `n8n-service.ts` - Service for communicating with n8n
- `resource-search.ts` - Service for searching resources

#### Data Models
```typescript
interface AssistantTask {
  id: string;
  type: 'resource_search' | 'form_creation' | 'scheduling' | 'documentation';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  parameters: Record<string, any>;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface SavedResource {
  id: string;
  userId: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  createdAt: Date;
}
```

### 3. Data Collection Assistant

#### Frontend Components
- `DataCollectionAssistant.tsx` - Main data collection component
- `FormPreview.tsx` - Preview of generated form
- `QrCodeGenerator.tsx` - QR code display component

#### Backend Components
- `data-collection.ts` - API route handler for data collection assistant
- `form-generator.ts` - Service for generating forms
- `qr-code-service.ts` - Service for generating QR codes

#### Data Models
```typescript
interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'time' | 'checkbox';
  required: boolean;
  options?: string[]; // For select/multiselect
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

interface GeneratedForm {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdBy: string;
  publicLink?: string;
  qrCodeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Integration Points

### 1. Archon Knowledge Base Integration
- **Authentication**: JWT-based authentication
- **API Endpoints**:
  - `GET /api/archon/search` - Search the knowledge base
  - `POST /api/archon/feedback` - Submit feedback on responses

### 2. n8n Integration
- **Authentication**: API key authentication
- **Workflow Triggers**:
  - HTTP Webhook triggers for each task type
  - Authentication middleware for security

### 3. Form Builder Integration
- **Internal API**: Direct integration with the platform's form builder
- **Form Templates**: Pre-defined templates for common survey types
- **Form Publishing**: API for publishing forms and generating public links

## Security Considerations

### Authentication and Authorization
- All AI tools require authenticated users
- Role-based access control:
  - BMAD Chat: Available to all authenticated users
  - CHWOne Assistant: Available to users with CHW role
  - Data Collection: Available to users with CHW role and form creation permissions

### Data Privacy
- No PII stored in chat histories unless explicitly required
- Form data encrypted at rest
- Compliance with HIPAA for health-related data collection
- Clear privacy notices for end-users of generated forms

### API Security
- Rate limiting on all AI endpoints
- Input validation and sanitization
- Monitoring for unusual usage patterns

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Set up AI service layer architecture
- Implement basic chat UI components
- Create API routes for each assistant

### Phase 2: Core Functionality (Weeks 3-4)
- Integrate with Archon Knowledge Base
- Implement n8n workflow connections
- Develop form preview generator

### Phase 3: Enhanced Features (Weeks 5-6)
- Implement QR code generation
- Add resource management features
- Develop form builder integration

### Phase 4: Testing and Refinement (Weeks 7-8)
- User acceptance testing
- Performance optimization
- Security review

### Phase 5: Deployment and Training (Weeks 9-10)
- Production deployment
- CHW training materials
- Monitoring and feedback collection

## Dependencies
- Archon Knowledge Base API access
- n8n server setup and configuration
- QR code generation service
- Form builder API access

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Archon KB unavailability | High | Low | Implement fallback responses and caching |
| n8n performance issues | Medium | Medium | Implement task queuing and async processing |
| Form builder API changes | High | Low | Create abstraction layer for form builder integration |
| User adoption challenges | Medium | Medium | Provide training and gather early feedback |

## Success Criteria
- All three AI components deployed and functional
- >90% uptime for all AI services
- <2 second response time for chat interactions
- >80% user satisfaction rating
- >50% adoption rate among CHWs
