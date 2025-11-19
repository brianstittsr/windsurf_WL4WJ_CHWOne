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

## 🎉 Latest Features (November 2025)

### 🔄 Multi-Role User System (NEW!)

#### **Role Switcher & Profile Management** 🎭
Users can now have multiple roles with a single email address:

**Multi-Role Support:**
- 👥 **Multiple Roles**: One email can be CHW + Nonprofit Staff + Association Member
- 🔄 **Role Switcher**: Dropdown UI to switch between roles instantly
- ⭐ **Primary Role**: Set your default/active role
- 🎯 **Context-Aware Navigation**: Navigation updates based on active role
- 📊 **Profile Management Page**: View and manage all roles in one place

**Role Switcher Features:**
- 🎨 **Visual Icons**: Each role has a unique icon (Person, Business, Groups, Admin)
- ✅ **Active Indicator**: Checkmark and badge show current role
- 🔁 **One-Click Switch**: Change roles and reload automatically
- 📱 **Compact Mode**: Mobile-friendly dropdown
- 🎭 **Role Count**: Shows how many roles you have

**Profile Management:**
- 📋 **View All Roles**: See all assigned roles in one list
- ⭐ **Set Primary**: Click to make any role your default
- 👁️ **View Profiles**: Quick links to each role's full profile
- 📊 **Profile Summaries**: CHW and Nonprofit profile cards
- 💼 **Role Descriptions**: Clear explanation of each role's capabilities

**Registration Updates:**
- 🔐 **Smart Registration**: Detects existing accounts
- ➕ **Add Role**: Sign in and add new role to existing account
- 🚫 **Duplicate Prevention**: Won't create duplicate profiles
- 🔑 **Password Verification**: Must use correct password for existing accounts
- 📝 **Clear Messaging**: Helpful error messages guide users

**Technical Implementation:**
- ✅ **Schema Updates**: `roles[]`, `primaryRole`, `organizationIds[]`
- ✅ **Profile References**: `chwProfileId`, `nonprofitProfileId`, `associationProfileId`
- ✅ **AuthContext**: `switchRole()` method for role switching
- ✅ **Backward Compatible**: Existing single-role users work seamlessly
- ✅ **Firestore Integration**: Updates persist across sessions

**User Experience:**
1. Register as CHW with email@example.com
2. Later register nonprofit with same email
3. System detects existing account
4. Adds NONPROFIT_STAFF to roles array
5. Role switcher appears in header
6. Click to switch between CHW and Nonprofit views
7. Navigation and permissions update automatically

**Routes:**
- `/profile` - User profile with role switcher
- `/profile-management` - Manage all roles and profiles

### 🎨 UI/UX Improvements

#### **Region Dropdown** 🗺️
- 📍 **Standardized Regions**: Dropdown with Region 1-6 options
- ✅ **Data Consistency**: No more free-text variations
- � **Better Reporting**: Consistent values for analytics
- 📝 **Registration & Profile**: Updated in both forms

#### **Profile Photo Editing** 📸
- 🖼️ **Click to Upload**: Click avatar or edit icon to change photo
- 🔄 **Auto-Compression**: Resizes to 400x400, JPEG 70% quality
- ⚡ **Instant Preview**: See new photo immediately
- 💾 **Save with Profile**: Photo persists to Firestore
- 🎨 **Edit Mode**: Edit icon appears when editing profile

#### **Edit Button Visibility** ✏️
- 📍 **Upper Left Corner**: Prominent "Edit Profile" button
- 🎨 **Contained Style**: Filled button for better visibility
- 📏 **Large Size**: Easy to find and click
- ✅ **Always Visible**: Shows immediately on profile page

#### **CHW Profile Cards** 🎴
- 🧹 **Cleaner Design**: Removed bio text from cards
- 📊 **Key Info Only**: Photo, name, location, specializations, languages
- 📏 **Consistent Heights**: Cards align better in grid
- 👁️ **Better Scanning**: Easier to browse directory
- 📖 **Full Bio**: Still available on detailed profile page

### �🆕 CHW Registration Form Enhancements

#### **Enhanced User Experience** ✨
The CHW registration form has been completely redesigned with modern UX best practices:

**Password Management:**
- 👁️ **Password Visibility Toggle**: Click the eye icon to show/hide password characters while typing
- 🔄 **Dual Visibility Controls**: Independent toggles for password and confirmation fields
- 🔒 **Browser Password Manager Integration**: Full support for saving and auto-filling passwords
- ✅ **Real-time Password Verification**: Instant feedback when passwords don't match
- 🎨 **Visual Error States**: Clear red borders and helpful error messages

**Additional Expertise Field:**
- 📝 **Free-form Text Area**: Describe skills and experiences beyond predefined options
- 💡 **Smart Placeholder Text**: Helpful guidance on what to include
- 🎯 **Flexible Input**: Capture unique qualifications, certifications, and experiences
- 📊 **Saved to Firebase**: Automatically stored in both `users` and `chwProfiles` collections

**Beautiful Success Modal:**
- 🎊 **Animated Confirmation**: Gradient background with pulsing checkmark animation
- 📧 **Email Confirmation Display**: Shows registered email address
- 🔐 **Login Instructions**: Clear next steps for accessing the platform
- ⏱️ **Auto-Close**: Automatically dismisses after 3 seconds
- 🎬 **Staggered Animations**: Smooth fade-in effects for professional feel
- 🎨 **Modern Design**: Purple gradient theme with glassmorphism effects

**Technical Improvements:**
- ✅ **Schema Consistency**: Uses `COLLECTIONS` constants for Firestore
- ✅ **Dual Storage**: Saves to both `users` and `chwProfiles` collections
- ✅ **Type Safety**: Full TypeScript support with proper interfaces
- ✅ **Autocomplete Support**: HTML5 attributes for better browser integration

### 💼 CHW Jobs & Career Management System

#### **AI-Powered Job Matching** 🤖
Complete job discovery and matching system for Community Health Workers:

**Smart Job Matching:**
- 🎯 **Intelligent Algorithm**: Calculates match scores (0-100%) based on:
  - Skills and expertise alignment
  - Geographic location preferences
  - Years of experience
  - Language capabilities
  - Additional expertise and qualifications
- 📊 **Match Reasons**: Explains why each job fits the CHW's profile
- 🏆 **Recommended Jobs**: Automatically surfaces jobs with 50%+ match score
- 🔍 **Search Functionality**: Find specific opportunities with keyword search

**AI Job Search:**
- 💬 **Natural Language Queries**: "Find remote diabetes care positions"
- 🤖 **OpenAI GPT-4 Integration**: Understands context and intent
- 📧 **Automated Notifications**: Emails sent for high-match jobs (80%+ score)
- 💾 **Save to List**: One-click to add jobs to recommendation list
- 🎯 **Quick Suggestions**: Pre-defined searches for common job types

**Job Features:**
- 📋 **Detailed Job Cards**: Title, organization, location, salary, skills
- 👁️ **Full Job Details**: Requirements, responsibilities, qualifications
- 🔖 **Bookmark Jobs**: Save opportunities for later review
- 📱 **Apply Now**: Direct application links
- 📊 **Tabbed Interface**: Recommended / All Jobs / Saved Jobs

#### **Admin Job Crawler** 🕷️
Automated job discovery system for administrators:

**Web Scraping Configuration:**
- 🌐 **Custom Crawlers**: Configure multiple job sources
- 🎯 **CSS Selectors**: Extract job data using custom selectors
- ⏰ **Scheduled Crawling**: Daily, weekly, or monthly automation
- 🔧 **Manual Triggers**: Run crawlers on-demand
- 📍 **Geographic Filters**: Target specific states and counties
- 🔤 **Keyword Filters**: Include/exclude specific terms
- 📊 **Status Tracking**: Monitor last crawl date and next scheduled run

**Technology Stack:**
- 🛠️ **Cheerio**: Fast HTML parsing with jQuery-like syntax
- 🌐 **Axios**: Reliable HTTP requests with timeout handling
- 🔥 **Firebase Integration**: Jobs saved directly to Firestore
- 📈 **Performance**: Efficient crawling with error handling

**API Endpoints:**
- `/api/chw/ai-job-search` - AI-powered job search
- `/api/chw/send-job-notifications` - Email notifications
- `/api/chw/add-job-recommendation` - Save job recommendations
- `/api/admin/crawl-jobs` - Execute job crawler

### 📊 Data Architecture

**New Firestore Collections:**
- `chwJobs` - All CHW job postings (manual, crawled, imported)
- `chwJobRecommendations` - Job recommendations for individual CHWs
- `jobCrawlerConfigs` - Crawler configurations for automated discovery

**Enhanced Collections:**
- `users` - Now includes all registration data with proper schema
- `chwProfiles` - Complete CHW professional profiles with additional expertise

## ✨ Core Features

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
- **75+ Qualtrics-Style Field Types**: Professional-grade form building with comprehensive field options:
  - **Text Entry**: Single line, multi-line, email, URL, phone, password
  - **Multiple Choice**: Radio, checkbox, dropdown, image choice, button choice
  - **Matrix/Grid**: Single/multiple answer, dropdown, text entry, rank order, side-by-side
  - **Slider & Scale**: Slider, rating scale, Likert scale, star rating, NPS
  - **Date & Time**: Date picker, time picker, datetime, date range
  - **Numeric**: Integer, decimal, currency, percentage
  - **File & Media**: File upload, image/video/audio upload, signature, drawing canvas
  - **Location**: Full address, GPS, map picker, country/state/city selectors, ZIP code
  - **Advanced**: CAPTCHA, consent, terms, section/page breaks, calculated fields, hidden fields
  - **Contact Info**: Full name, name parts, contact information blocks
  - **Specialized**: Color picker, barcode scanner, lookup, autocomplete, tags, WYSIWYG, code/JSON editors
- **Drag-and-Drop Editor**: Reorder fields with visual interface
- **Section Management**: Organize forms into logical sections
- **Field Validation**: Set required fields, min/max values, date ranges, patterns
- **Live Preview**: See exactly how forms will appear to users
- **Export Options**: Download as JSON or PDF
- **Template System**: Pre-built templates for common forms (attendance, onboarding, assessments)

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

### 📝 Form Management System
- **Form Templates**: Pre-built templates for common use cases (attendance, onboarding, assessments, surveys)
- **Template Copying**: One-click template duplication with automatic dataset creation
- **Form Builder**: Manual form creation with 75+ Qualtrics-style field types
- **AI Form Builder**: AI-powered wizard for intelligent form generation
- **Form Sharing**: Public URLs, embeddable iframes, QR codes, email distribution
- **Form Analytics**: Track submissions, completion rates, and response data
- **Real-time Updates**: Forms sync automatically with Firestore
- **Export Options**: JSON, PDF export for forms and responses

### 🤖 Additional AI Features
- **BMAD Chat Agent**: Home page chat widget connected to Archon Knowledge Base for NC CHW Association content
- **CHWOne Assistant**: Agentic AI assistant for CHWs to search resources and automate tasks via n8n
- **Data Collection Assistant**: AI-powered survey and form creation with QR code generation
- **NCCHWA Training Tracker**: System for tracking CHW certification, training, and recertification requirements
- **AI Form Enhancement**: Get AI recommendations for improving form structure and questions

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

## � Documentation

### Feature Documentation
Comprehensive guides for all major features:

- **[CHW Jobs Feature Implementation](docs/CHW_JOBS_FEATURE_IMPLEMENTATION.md)** - Complete guide to the jobs system
  - Job matching algorithm details
  - AI search implementation
  - Admin crawler configuration
  - API endpoint documentation
  - Firebase collection schemas

- **[Password Field Enhancements](docs/PASSWORD_FIELD_ENHANCEMENTS.md)** - Password UX improvements
  - Visibility toggle implementation
  - Browser password manager integration
  - Accessibility features
  - Security best practices

- **[Success Modal Enhancement](docs/SUCCESS_MODAL_ENHANCEMENT.md)** - Registration success modal
  - Animation specifications
  - Design system details
  - User experience flow
  - Technical implementation

- **[CHW Registration Firestore Fix](docs/CHW_REGISTRATION_FIRESTORE_FIX.md)** - Database architecture
  - Collection naming conventions
  - Data flow documentation
  - Schema constants usage
  - Migration guide

### Component Documentation
- **CHWWizard** - Multi-step registration form with validation
- **CHWJobsSection** - Job listing and matching interface
- **CHWJobAISearch** - AI-powered job search component
- **AdminJobCrawler** - Web scraping configuration panel

### API Documentation
- **POST** `/api/chw/ai-job-search` - Natural language job search
- **POST** `/api/chw/send-job-notifications` - Email notifications
- **POST** `/api/chw/add-job-recommendation` - Save job recommendations
- **POST** `/api/admin/crawl-jobs` - Execute job crawler

## �� Support

### Documentation
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Once UI Documentation](https://once-ui.com/docs)
- [Project Documentation](docs/) - Feature-specific guides

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