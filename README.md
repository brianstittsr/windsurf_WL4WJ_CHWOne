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
   
   Edit `.env.local` with your Firebase configuration:
   ```env
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
- **Bootstrap 5**: Responsive UI components
- **React Bootstrap**: Bootstrap components for React

### Backend
- **Firebase Firestore**: NoSQL database for scalable data storage
- **Firebase Authentication**: Secure user management
- **Firebase Storage**: File and document storage
- **Firebase Admin SDK**: Server-side operations

### Security
- **HIPAA Compliance**: Encrypted data storage and transmission
- **Audit Logging**: Complete activity tracking
- **Role-Based Access Control**: Granular permissions
- **API Key Management**: Secure programmatic access

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

### Relationships
- CHWs assigned to projects and clients
- Projects linked to grants for funding tracking
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
- `GET /api/chws` - Retrieve CHW directory
- `GET /api/projects` - Project information
- `GET /api/referrals` - Referral data
- `GET /api/resources` - Region 5 resource directory
- `GET /api/surveys/empower` - Survey results export
- `POST /api/referrals` - Create new referral

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
- [Bootstrap Documentation](https://getbootstrap.com/docs)

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