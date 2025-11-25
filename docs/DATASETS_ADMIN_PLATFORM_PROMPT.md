# Datasets Admin Platform - Implementation Prompt

## Overview
Create a standalone, unbranded admin platform for managing datasets that serves as the centralized data storage location for all form submissions from external applications. This platform should be completely independent and reusable across multiple applications, integrating seamlessly with your existing website infrastructure.

## Core Requirements

### 1. Platform Identity
- **Name**: DataHub Admin (or configurable brand name)
- **Purpose**: Universal dataset management and analytics platform
- **Branding**: Neutral, professional design that matches your existing site aesthetic
- **Multi-tenant**: Support multiple organizations/applications using the same platform
- **Integration**: Built as an extension to your existing website using the same technology stack

### 2. Dataset Management

#### Dataset Structure
Each dataset should include:
```typescript
interface Dataset {
  id: string;
  name: string;
  description: string;
  sourceApplication: string; // e.g., "FormApp", "SurveyTool", "DataCollector", etc.
  organizationId: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Schema Definition
  schema: {
    fields: DatasetField[];
    version: string;
    primaryKey?: string;
  };
  
  // Metadata
  metadata: {
    recordCount: number;
    lastRecordAt?: Timestamp;
    tags: string[];
    category: string;
    isPublic: boolean;
  };
  
  // Access Control
  permissions: {
    owners: string[];
    editors: string[];
    viewers: string[];
    publicRead: boolean;
  };
  
  // Integration
  integration: {
    sourceFormId?: string; // If linked to a form
    apiKey?: string; // For external access
    webhookUrl?: string; // For real-time updates
  };
}

interface DatasetField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'phone' | 'url' | 'json' | 'array';
  required: boolean;
  unique?: boolean;
  indexed?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
  metadata?: {
    description?: string;
    unit?: string;
    format?: string;
  };
}
```

#### Dataset Records
```typescript
interface DatasetRecord {
  id: string;
  datasetId: string;
  data: Record<string, any>; // Flexible key-value pairs matching schema
  metadata: {
    submittedAt: Timestamp;
    submittedBy?: string;
    sourceFormSubmissionId?: string;
    sourceApplication: string;
    ipAddress?: string;
    userAgent?: string;
  };
  status: 'active' | 'archived' | 'deleted';
  version: number;
  history?: DatasetRecordVersion[];
}

interface DatasetRecordVersion {
  version: number;
  data: Record<string, any>;
  updatedAt: Timestamp;
  updatedBy: string;
  changeNote?: string;
}
```

### 3. Core Features

#### A. Dataset Creation & Management
- **Create Dataset**: Define schema, fields, validation rules
- **Edit Dataset**: Modify schema (with versioning and migration support)
- **Delete Dataset**: Soft delete with archive option
- **Clone Dataset**: Duplicate structure for new use cases
- **Import Schema**: Import from JSON, CSV headers, or existing forms
- **Export Schema**: Export as JSON, SQL DDL, or documentation

#### B. Data Ingestion
- **API Endpoint**: RESTful API for form submissions
  ```
  POST /api/datasets/{datasetId}/records
  Authorization: Bearer {apiKey}
  Content-Type: application/json
  
  {
    "data": {
      "field1": "value1",
      "field2": "value2"
    },
    "metadata": {
      "sourceFormSubmissionId": "form_123",
      "submittedBy": "user_456"
    }
  }
  ```

- **Webhook Support**: Real-time data push from external sources
- **Batch Import**: CSV, Excel, JSON bulk uploads
- **Validation**: Automatic validation against schema before storage
- **Deduplication**: Optional duplicate detection based on unique fields

#### C. Data Viewing & Exploration
- **Table View**: Spreadsheet-like interface with sorting, filtering, pagination
- **Card View**: Visual cards for each record
- **Detail View**: Full record view with all fields and metadata
- **Search**: Full-text search across all fields
- **Filters**: Dynamic filters based on field types
  - Text: contains, equals, starts with, ends with
  - Number: equals, greater than, less than, between
  - Date: before, after, between, relative (last 7 days, etc.)
  - Boolean: true/false
  - Multi-select: in, not in

#### D. Data Export
- **CSV Export**: Download filtered data as CSV
- **Excel Export**: Multi-sheet workbooks with formatting
- **JSON Export**: Structured JSON for API consumption
- **PDF Reports**: Formatted reports with charts
- **Scheduled Exports**: Automatic exports on schedule (daily, weekly, monthly)
- **API Access**: RESTful API for programmatic access

#### E. Analytics & Visualization
- **Summary Statistics**: Count, sum, average, min, max for numeric fields
- **Charts**: 
  - Line charts for trends over time
  - Bar charts for comparisons
  - Pie charts for distributions
  - Scatter plots for correlations
- **Pivot Tables**: Dynamic cross-tabulation
- **Custom Dashboards**: Drag-and-drop dashboard builder
- **Real-time Updates**: Live data refresh for active datasets

#### F. Data Quality & Validation
- **Validation Rules**: Define custom validation logic
- **Data Cleaning**: Bulk find-and-replace, trim, format
- **Duplicate Detection**: Identify and merge duplicates
- **Missing Data Analysis**: Identify incomplete records
- **Data Quality Score**: Overall health metric for each dataset

#### G. Access Control & Security
- **Role-Based Access**: Owner, Editor, Viewer roles
- **Field-Level Permissions**: Hide sensitive fields from certain users
- **API Keys**: Generate and manage API keys for external access
- **Audit Logs**: Track all data access and modifications
- **Data Encryption**: Encrypt sensitive fields at rest
- **HIPAA Compliance**: Optional HIPAA-compliant mode for healthcare data

#### H. Integration & Automation
- **Webhooks**: Trigger external actions on data events (new record, update, delete)
- **Zapier Integration**: Connect to 5000+ apps
- **API Documentation**: Auto-generated API docs (Swagger/OpenAPI)
- **SDKs**: JavaScript, Python, PHP client libraries
- **Embed Widgets**: Embeddable charts and tables for external sites

### 4. Technical Architecture

**IMPORTANT**: This platform should be built using your existing website's technology stack and infrastructure. Adapt the following requirements to match your current setup.

#### Frontend
- **Framework**: Use your existing frontend framework (React, Vue, Angular, etc.)
- **UI Library**: Use your existing component library or design system
- **State Management**: Use your existing state management solution
- **Charts**: Integrate a charting library compatible with your stack (Chart.js, D3.js, Recharts, etc.)
- **Tables**: Use a data table library compatible with your framework (AG Grid, TanStack Table, etc.)
- **Forms**: Use your existing form handling solution

#### Backend
- **Database**: Use your existing database system (PostgreSQL, MySQL, MongoDB, Firebase, etc.)
- **Authentication**: Integrate with your existing authentication system
- **API**: Use your existing API framework (REST, GraphQL, etc.)
- **File Storage**: Use your existing file storage solution (S3, Azure Blob, local storage, etc.)
- **Search**: Optional - integrate with your existing search solution if available

#### Database Schema Considerations
Regardless of your database choice, you'll need to store:
- **Datasets table**: Dataset definitions, schemas, metadata
- **Records table**: Actual data records with flexible schema support
- **API Keys table**: For external integrations
- **Audit Logs table**: Track all data access and modifications
- **Permissions table**: User and role-based access control

#### API Design
```
Base URL: https://datahub-admin.com/api/v1

Authentication:
- Bearer token (from your existing auth system)
- API Key (for external integrations)

Endpoints:
GET    /datasets                    # List all datasets
POST   /datasets                    # Create dataset
GET    /datasets/{id}               # Get dataset details
PUT    /datasets/{id}               # Update dataset
DELETE /datasets/{id}               # Delete dataset

GET    /datasets/{id}/records       # List records (with pagination, filters)
POST   /datasets/{id}/records       # Create record
GET    /datasets/{id}/records/{recordId}  # Get record
PUT    /datasets/{id}/records/{recordId}  # Update record
DELETE /datasets/{id}/records/{recordId}  # Delete record

POST   /datasets/{id}/records/batch # Batch create records
POST   /datasets/{id}/export        # Export data
POST   /datasets/{id}/import        # Import data

GET    /datasets/{id}/analytics     # Get analytics
GET    /datasets/{id}/schema        # Get schema
PUT    /datasets/{id}/schema        # Update schema

POST   /api-keys                    # Generate API key
GET    /api-keys                    # List API keys
DELETE /api-keys/{id}               # Revoke API key
```

### 5. User Interface Design

#### Dashboard
- **Overview Cards**: Total datasets, total records, recent activity
- **Recent Datasets**: Quick access to frequently used datasets
- **Activity Feed**: Recent data submissions, exports, schema changes
- **Quick Actions**: Create dataset, import data, generate report

#### Dataset List View
- **Grid/List Toggle**: Switch between card and table view
- **Search Bar**: Search datasets by name, description, tags
- **Filters**: Filter by source application, organization, category, date
- **Sort Options**: Name, date created, record count, last activity
- **Bulk Actions**: Delete, archive, export multiple datasets

#### Dataset Detail View
- **Tabs**:
  1. **Data**: Table view of all records
  2. **Schema**: Field definitions and validation rules
  3. **Analytics**: Charts and statistics
  4. **Settings**: Permissions, integrations, webhooks
  5. **Activity**: Audit log of changes
  6. **API**: API documentation and keys

#### Data Table Features
- **Column Management**: Show/hide columns, reorder, resize
- **Inline Editing**: Click to edit cells (with validation)
- **Bulk Selection**: Select multiple records for bulk actions
- **Quick Filters**: Click column headers for quick filters
- **Export Button**: Export visible data or all data
- **Add Record**: Inline form or modal for adding records

### 6. Integration with External Applications

#### Form Submission Flow
```
1. User submits form in external application
2. Application validates form data
3. Application sends data to DataHub Admin API:
   POST /api/v1/datasets/{datasetId}/records
   {
     "data": { /* form field values */ },
     "metadata": {
       "sourceFormSubmissionId": "form_submission_123",
       "sourceApplication": "YourApp",
       "submittedBy": "user_456",
       "organizationId": "org_789"
     }
   }
4. DataHub validates against dataset schema
5. DataHub stores record in database
6. DataHub returns record ID to application
7. Application stores record ID reference in form submission
```

#### Dataset Creation from External Forms
When a form is created in an external application with dataset enabled:
```
1. Application calls DataHub API to create dataset:
   POST /api/v1/datasets
   {
     "name": "Contact Form Dataset",
     "description": "Data from Contact Form",
     "sourceApplication": "YourApp",
     "organizationId": "org_789",
     "schema": {
       "fields": [
         { "name": "full_name", "type": "text", "required": true },
         { "name": "email", "type": "email", "required": true },
         { "name": "phone", "type": "phone", "required": false }
       ]
     },
     "integration": {
       "sourceFormId": "form_123"
     }
   }
2. DataHub creates dataset and returns dataset ID
3. Application stores dataset ID in form configuration
4. All future form submissions automatically send data to this dataset
```

### 7. Security Considerations

#### Authentication
- Use your existing authentication system for user login
- API keys for external integrations
- JWT tokens or session-based auth for API access
- Session management with automatic timeout

#### Authorization
- Row-level security based on organizationId
- Field-level permissions for sensitive data
- API key scoping (limit to specific datasets)
- Rate limiting on API endpoints

#### Data Protection
- Encryption at rest (use your database's encryption features)
- Encryption in transit (HTTPS/TLS)
- Optional field-level encryption for PII
- Automatic PII detection and masking
- GDPR compliance features (data export, deletion, right to be forgotten)

#### Audit Trail
- Log all data access (read, write, delete)
- Log all schema changes
- Log all permission changes
- Log all API key usage
- Retention policy for audit logs

### 8. Deployment

#### Infrastructure
Deploy using your existing infrastructure:
- **Hosting**: Use your current hosting provider (AWS, Azure, GCP, Heroku, VPS, etc.)
- **Database**: Use your existing database server
- **CDN**: Use your existing CDN if applicable
- **Monitoring**: Integrate with your existing monitoring and analytics tools

#### Environment Variables
Configure these based on your existing setup:
```
# Application Settings
APP_NAME="DataHub Admin"
APP_URL=https://your-domain.com/datasets
APP_ENV=production

# Database Configuration
DATABASE_URL=your_database_connection_string
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=

# Authentication
AUTH_SECRET=your_secret_key
JWT_SECRET=your_jwt_secret
SESSION_TIMEOUT=3600

# API Configuration
API_BASE_URL=/api/v1
API_RATE_LIMIT=100
API_KEY_SALT=your_api_key_salt

# File Storage
STORAGE_TYPE=local|s3|azure|gcs
STORAGE_PATH=/uploads
# If using cloud storage:
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

# Optional: Search Integration
SEARCH_ENABLED=false
SEARCH_PROVIDER=algolia|elasticsearch|typesense
SEARCH_API_KEY=
SEARCH_APP_ID=

# Optional: Email Notifications
EMAIL_ENABLED=false
EMAIL_FROM=noreply@your-domain.com
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

### 9. Implementation Phases

#### Phase 1: Core Dataset Management (Week 1-2)
- [ ] Setup project structure within your existing codebase
- [ ] Integrate with your existing authentication system
- [ ] Create dataset CRUD operations (Create, Read, Update, Delete)
- [ ] Build dataset schema editor interface
- [ ] Implement basic data table view with your chosen table library

#### Phase 2: Data Ingestion & API (Week 3)
- [ ] Build RESTful API endpoints
- [ ] Implement API key management
- [ ] Add data validation engine
- [ ] Create batch import functionality
- [ ] Add webhook support

#### Phase 3: Data Viewing & Export (Week 4)
- [ ] Advanced table features (sort, filter, search)
- [ ] Export functionality (CSV, Excel, JSON)
- [ ] Detail view for individual records
- [ ] Inline editing capabilities

#### Phase 4: Analytics & Visualization (Week 5)
- [ ] Summary statistics
- [ ] Chart components (line, bar, pie)
- [ ] Dashboard builder
- [ ] Custom report generator

#### Phase 5: Integration & Polish (Week 6)
- [ ] External application integration testing
- [ ] API documentation generation (Swagger/OpenAPI)
- [ ] Security hardening and penetration testing
- [ ] Performance optimization and load testing
- [ ] User documentation and training materials

### 10. Success Metrics

#### Technical Metrics
- API response time < 200ms (p95)
- Data ingestion rate > 1000 records/second
- 99.9% uptime
- Zero data loss
- Support for 100+ concurrent users

#### User Metrics
- Time to create dataset < 2 minutes
- Time to find specific record < 10 seconds
- Export generation < 30 seconds for 10k records
- User satisfaction score > 4.5/5
- API integration time < 1 hour for developers

## Implementation Notes

### Key Design Principles
1. **Separation of Concerns**: Keep dataset management completely independent from source applications
2. **API-First**: Design robust API that any application can use
3. **Scalability**: Support millions of records per dataset
4. **Flexibility**: Support any data schema without code changes
5. **Security**: Treat all data as sensitive by default
6. **Performance**: Optimize for fast reads and writes
7. **Usability**: Make complex data management simple and intuitive
8. **Integration**: Seamless integration with your existing infrastructure

### Technology Adaptation Guidelines
Since this will be built on your existing infrastructure:
- **Use your existing framework**: Adapt all UI components to your current framework
- **Use your existing database**: Adapt data models to your database schema conventions
- **Use your existing auth**: Integrate with your current authentication/authorization system
- **Use your existing styling**: Match your site's design system and branding
- **Use your existing deployment**: Deploy using your current CI/CD pipeline

### Future Enhancements
- AI-powered data insights and anomaly detection
- Natural language querying (ask questions about your data)
- Automated data quality monitoring
- Machine learning model training on datasets
- Collaborative features (comments, annotations)
- Version control for data (git-like branching)
- Data lineage tracking
- Real-time collaboration (multiple users editing simultaneously)

## Getting Started

To implement this platform within your existing infrastructure:

1. **Plan integration** - Determine where datasets feature fits in your existing site structure
2. **Setup database** - Create necessary tables/collections in your existing database
3. **Implement authentication** - Integrate with your existing auth system
4. **Build dataset schema** editor - Create UI for defining dataset structures
5. **Create API endpoints** - Build RESTful API for data ingestion and retrieval
6. **Build data table** view - Implement data viewing with filtering/sorting/search
7. **Add export** functionality - Enable CSV, Excel, JSON exports
8. **Add analytics** - Implement charts and visualizations
9. **Integrate with external apps** - Test API with your form applications
10. **Deploy and monitor** - Deploy using your existing pipeline and monitor usage

## Questions to Consider

1. Should datasets support relationships (foreign keys)?
2. Do we need real-time collaboration features?
3. Should we support SQL-like queries?
4. Do we need data versioning/time-travel?
5. Should we support computed fields?
6. Do we need a visual query builder?
7. Should we support data transformations/ETL?
8. Do we need scheduled data processing jobs?

## Conclusion

This platform will serve as a universal data storage and management solution that external applications can use to store form submissions and other structured data. By building it as an integrated but modular component of your existing infrastructure, it becomes a powerful asset that can serve multiple applications and use cases while maintaining consistency with your current technology stack and design patterns.

The key to success is adapting these requirements to your specific environment rather than forcing a particular technology stack. Focus on the core functionality - flexible dataset management, robust API, powerful data viewing and export capabilities - and implement them using the tools and frameworks you already know and trust.
