# CHWOne - Community Health Worker Management Platform

A comprehensive HIPAA-compliant platform for managing Community Health Workers, built for **Women Leading for Wellness and Justice**. This NextJS application integrates with Firebase for secure data management and provides tools for managing CHWs, grants, projects, referrals, and survey data.

## 🏥 Platform Overview

CHWOne is designed specifically for community health organizations to:
- Manage Community Health Worker certifications and assignments
- Track grants and project funding
- Coordinate client referrals to resources
- Integrate with NC C.A.R.E. 360 for statewide coordination
- Store and analyze Empower Project survey results
- Provide HIPAA-compliant data access and audit logging

## ✨ Key Features

### 🤖 AI-Powered Grant Management

#### **Grant Analyzer Wizard** 🎯
The comprehensive AI-powered grant management system that streamlines the entire grant lifecycle:

**1. Document Analysis & Auto-Population**
- **AI Document Processing**: Upload grant documents (PDF, Word, Excel) and let GPT-4o extract all relevant information
- **Smart Field Detection**: Automatically identifies and populates:
  - Grant title, description, and purpose
  - Funding source and budget information
  - Start and end dates from anywhere in the document
  - Lead and partner organizations with roles
  - Contact information from signature blocks
  - Data collection requirements
  - Project milestones and deliverables
- **Intelligent Inference**: Uses context clues to determine organizational roles and responsibilities
- **Real-time Processing**: Visual progress indicators during analysis

**2. Entity Collaboration Management** 👥
- **Multi-Entity Support**: Manage unlimited collaborating organizations
- **Role Assignment**: Automatically identifies and assigns roles:
  - Lead Organization (grantee/recipient)
  - Partner Organizations (collaborators)
  - Funders (money providers)
  - Evaluators (assessment teams)
- **Contact Tracking**: Store and manage contact information for each entity
- **Responsibility Matrix**: Define and track what each organization will do
- **Visual Differentiation**: Color-coded cards and badges for easy identification

**3. Data Collection Planning** 📊
- **Method Management**: Define multiple data collection approaches
- **Frequency Settings**: Daily, weekly, monthly, quarterly, or annually
- **Data Point Tracking**: Specify exactly what metrics to collect
- **Tool Assignment**: Document which tools/software will be used
- **Entity Responsibility**: Assign data collection tasks to specific organizations
- **Integration Ready**: Links directly to form generation

**4. Project Planning & Milestones** 📅
- **Interactive Timeline**: Visual milestone management
- **Dependency Tracking**: Define which milestones depend on others
- **Due Date Management**: Set and track milestone deadlines
- **Responsible Party Assignment**: Assign milestones to specific entities
- **Progress Monitoring**: Track completion status
- **Critical Path Analysis**: Identify key dependencies

**5. Auto-Generated Form Builder** 📝
- **Intelligent Form Creation**: Automatically generates data collection forms from requirements
- **Smart Field Types**: AI infers appropriate field types:
  - Text fields for names and descriptions
  - Number fields for counts and amounts
  - Date fields for temporal data
  - Dropdowns for categories
  - Checkboxes for agreements
  - File uploads for documents
- **Drag-and-Drop Editor**: Reorder fields with visual interface
- **Section Management**: Organize forms into logical sections
- **Field Validation**: Set required fields, min/max values, date ranges
- **Live Preview**: See exactly how forms will appear to users
- **Export Options**: Download as JSON or PDF

**6. Automatic Dataset Creation** 🗄️
- **One Dataset Per Form**: Automatically creates structured datasets
- **Analysis-Ready Structure**: Fields properly typed for data analysis
- **Metadata Tracking**: Records creation date, status, record count
- **Entity Linking**: Connects datasets to responsible organizations
- **Tag System**: Auto-tags with purpose, frequency, and entity
- **Export Ready**: Structured for Excel, CSV, or database import

**7. AI Dashboard & Insights** 📈
- **Real-Time Metrics**: Track project progress with live data
- **AI-Generated Insights**: Automated analysis of trends, risks, and opportunities
- **Confidence Scoring**: AI provides confidence levels for each insight
- **Report Scheduler**: Automate report generation and delivery
- **Multiple Formats**: PDF, Dashboard, Excel, Presentation
- **Chart Visualizations**: Line, bar, pie, and area charts
- **Entity Contribution Analysis**: Track which organizations are meeting deliverables

### 🤖 Additional AI Features
- **BMAD Chat Agent**: Home page chat widget connected to Archon Knowledge Base for NC CHW Association content
- **CHWOne Assistant**: Agentic AI assistant for CHWs to search resources and automate tasks via n8n
- **Data Collection Assistant**: AI-powered survey and form creation with QR code generation
- **NCCHWA Training Tracker**: System for tracking CHW certification, training, and recertification requirements

### 🔐 Security & Compliance
- **HIPAA Compliant**: All client data encrypted and audit logged
- **Firebase Authentication**: Secure user management with role-based access
- **Audit Logging**: Complete activity tracking for compliance
- **Data Encryption**: Client information protected at rest and in transit

### 👥 User Management
- **Role-Based Access**: Admin, CHW Coordinator, CHW, Nonprofit Staff, Client roles
- **User Registration**: Self-service account creation with HIPAA acknowledgment
- **Profile Management**: Organization and contact information tracking

### 🏥 Core Modules
- **CHW Management**: Certification tracking, case load management, specializations
- **Grant Management**: Funding tracking, reporting schedules, compliance monitoring
- **Project Management**: Outcome tracking, budget management, CHW assignments
- **Referral System**: Resource coordination with status tracking
- **Region 5 Directory**: NC CHW Association certified resource database
- **Survey Integration**: Empower Project data collection and analysis

### 🔗 Integrations
- **NC C.A.R.E. 360**: Statewide coordinated care network integration
- **Empower Project**: Survey data synchronization from empowerproject.us
- **API Access**: Programmatic data export and integration capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/once-ui-system/magic-portfolio.git CHWOne
   cd CHWOne
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase configuration

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Firebase Admin (for server-side operations)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   
   # OpenAI API (for Grant Analyzer AI features)
   # Get your API key from: https://platform.openai.com/api-keys
   OPENAI_API_KEY=sk-your_openai_api_key_here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 User Roles & Permissions

### Admin
- Full platform access
- User management
- System configuration
- All data access and export

### CHW Coordinator
- Manage CHW certifications and assignments
- Project and grant oversight
- Referral coordination
- Data analysis and reporting

### Community Health Worker (CHW)
- Client referral management
- Resource directory access
- Case load tracking
- Survey data entry

### Nonprofit Staff
- Project management
- Grant tracking and reporting
- Resource coordination
- Survey analysis

### Client
- Limited access to own referral status
- Resource directory viewing
- Survey participation

## 🏗️ Platform Architecture

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Material-UI (MUI)**: Comprehensive React component library
- **Once UI**: Modern design system with Magic template
- **React Beautiful DnD**: Drag-and-drop functionality for form builder
- **Recharts**: Data visualization and charting
- **React Icons**: Comprehensive icon library

### Backend
- **Firebase Firestore**: NoSQL database for scalable data storage
- **Firebase Authentication**: Secure user management
- **Firebase Storage**: File and document storage
- **Firebase Admin SDK**: Server-side operations
- **OpenAI GPT-4o**: AI-powered document analysis and insights

### AI Integration
- **Document Processing**: PDF and Word document text extraction
- **GPT-4o API**: Advanced language model for:
  - Grant document analysis
  - Entity role identification
  - Data extraction and structuring
  - Insight generation
  - Recommendation systems
- **Temperature Control**: Low temperature (0.1) for accurate extraction
- **JSON Mode**: Structured output for reliable data parsing

### Security
- **HIPAA Compliance**: Encrypted data storage and transmission
- **Audit Logging**: Complete activity tracking
- **Role-Based Access Control**: Granular permissions
- **API Key Management**: Secure programmatic access
- **Environment Variable Protection**: Sensitive data never exposed to client

## 📊 Data Models

### Core Entities
- **Users**: Authentication and profile information
- **Community Health Workers**: Certifications, specializations, case loads
- **Clients**: HIPAA-protected client information
- **Projects**: Community health initiatives and outcomes
- **Grants**: Funding sources and compliance tracking
- **Referrals**: Client-resource connections with status tracking
- **Resources**: Region 5 certified service providers
- **Survey Results**: Empower Project data integration

### Grant Management Entities
- **Grants**: Complete grant information including:
  - Basic details (title, description, dates, budget)
  - Funding source and grant number
  - Status tracking and compliance monitoring
- **Collaborating Entities**: Organizations involved in grants:
  - Lead organizations (grantees)
  - Partner organizations (collaborators)
  - Funders (money providers)
  - Evaluators (assessment teams)
  - Contact information and responsibilities
- **Data Collection Methods**: Structured data collection plans:
  - Method name and description
  - Frequency (daily, weekly, monthly, etc.)
  - Data points to collect
  - Tools and instruments
  - Responsible entities
- **Project Milestones**: Timeline and deliverables:
  - Milestone name and description
  - Due dates
  - Responsible parties
  - Dependencies
  - Completion status
- **Form Templates**: Auto-generated data collection forms:
  - Form sections and fields
  - Field types and validation rules
  - Purpose and frequency
  - Linked datasets
- **Datasets**: Analysis-ready data structures:
  - Field definitions
  - Metadata and status
  - Record count tracking
  - Entity responsibility
  - Analysis readiness flag
- **Report Templates**: Automated reporting:
  - Report format (PDF, Excel, Dashboard)
  - Delivery schedule
  - Recipients
  - Data sources and visualizations

### Relationships
- CHWs assigned to projects and clients
- Projects linked to grants for funding tracking
- Grants connected to collaborating entities
- Data collection methods generate form templates
- Form templates create datasets automatically
- Datasets linked to responsible entities
- Milestones assigned to entities
- Referrals connect clients to resources through CHWs
- Survey results associated with specific projects

## 🔌 API Integration

### NC C.A.R.E. 360 Integration
```javascript
// Resource synchronization
const syncWithNCCare360 = async (resourceId) => {
  // Sync resource data with statewide network
};
```

### Empower Project Integration
```javascript
// Survey data import
const syncEmpowerSurveys = async (projectId) => {
  // Import survey results from Empower API
};
```

### API Endpoints

#### Grant Management
- `POST /api/ai/analyze-grant` - AI-powered grant document analysis
  - Accepts: PDF, Word, Excel documents
  - Returns: Structured grant data (JSON)
  - Features: GPT-4o powered extraction

#### Core Platform
- `GET /api/chws` - Retrieve CHW directory
- `GET /api/projects` - Project information
- `GET /api/referrals` - Referral data
- `GET /api/resources` - Region 5 resource directory
- `GET /api/surveys/empower` - Survey results export
- `POST /api/referrals` - Create new referral

### Grant Analyzer API Example

```typescript
// Upload and analyze a grant document
const analyzeGrantDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/ai/analyze-grant', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Access extracted data
    const {
      grantTitle,
      fundingSource,
      startDate,
      endDate,
      entities,
      dataCollectionMethods,
      milestones
    } = result.analyzedData;
    
    // Data is ready to populate forms
    console.log('Grant analyzed:', grantTitle);
    console.log('Entities:', entities.length);
    console.log('Data collection methods:', dataCollectionMethods.length);
  }
};
```

## 🛡️ HIPAA Compliance

### Data Protection
- All client data encrypted at rest and in transit
- Access controls based on minimum necessary standard
- Audit logging for all data access and modifications
- Secure user authentication and session management

### Audit Requirements
- User login/logout tracking
- Data access logging
- Modification history
- Export activity monitoring
- API access logging

### Privacy Controls
- Client data anonymization options
- Consent management
- Data retention policies
- Secure data disposal

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Monitoring & Analytics

### Performance Monitoring
- Firebase Performance Monitoring
- Real User Monitoring (RUM)
- Core Web Vitals tracking

### Usage Analytics
- User engagement metrics
- Feature adoption tracking
- Audit log analysis
- System performance metrics

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Component-based architecture
- HIPAA compliance considerations

## 📞 Support

### Documentation
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Once UI Documentation](https://once-ui.com/docs)

### Community
- GitHub Issues for bug reports
- Feature requests via GitHub Discussions
- Security issues: security@chwone.org

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Women Leading for Wellness and Justice** - Platform sponsor and primary user
- **NC Community Health Worker Association** - Region 5 resource directory
- **Empower Project** - Survey data integration partner
- **NC C.A.R.E. 360** - Statewide coordination network

---

**Ready to deploy?** Follow the setup instructions above and customize the platform for your community health organization's needs.