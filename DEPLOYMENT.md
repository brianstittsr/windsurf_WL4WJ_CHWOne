# CHWOne Platform Deployment Guide

## Prerequisites

### System Requirements
- Node.js 18+ and npm
- Git
- Firebase CLI (optional, for Firebase hosting)
- Modern web browser

### Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Firestore Database** (in production mode)
   - **Storage** (for file uploads)
   - **Hosting** (optional, for Firebase deployment)

### Environment Configuration
1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration values
3. Add any additional API keys for integrations

## Installation Steps

### 1. Clone and Install Dependencies
```bash
git clone <repository-url> CHWOne
cd CHWOne
npm install
```

### 2. Configure Environment Variables
Edit `.env.local` with your Firebase project details:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server-side operations)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# HIPAA Compliance
HIPAA_ENCRYPTION_KEY=your_32_character_encryption_key_here
HIPAA_AUDIT_RETENTION_DAYS=2555  # 7 years as required by HIPAA

# NC C.A.R.E. 360 Integration
NC_CARE_360_API_KEY=your_nc_care_360_api_key
NC_CARE_360_BASE_URL=https://api.nccare360.org/v1

# Empower Project Integration
EMPOWER_PROJECT_API_KEY=your_empower_project_api_key
EMPOWER_PROJECT_BASE_URL=https://api.empowerproject.us/v1

# Platform Features
NEXT_PUBLIC_ENABLE_API_ACCESS=true
NEXT_PUBLIC_ENABLE_EMPOWER_INTEGRATION=true
NEXT_PUBLIC_ENABLE_NC_CARE_360=true
```

### 3. Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // CHWs - role-based access
    match /chws/{chwId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'chw_coordinator']);
    }
    
    // Projects - role-based access
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'chw_coordinator', 'nonprofit_staff']);
    }
    
    // Grants - admin and coordinators only
    match /grants/{grantId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'chw_coordinator']);
    }
    
    // Referrals - HIPAA protected
    match /referrals/{referralId} {
      allow read, write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'chw_coordinator', 'chw'] ||
         resource.data.clientId == request.auth.uid);
    }
    
    // Resources - public read, admin write
    match /resources/{resourceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'chw_coordinator']);
    }
    
    // Survey Results - project-based access
    match /surveyResults/{surveyId} {
      allow read, write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'chw_coordinator', 'nonprofit_staff']);
    }
    
    // Audit Logs - admin only
    match /auditLogs/{logId} {
      allow read: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null; // System can write audit logs
    }
    
    // API Keys - admin only
    match /apiKeys/{keyId} {
      allow read, write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /users/{userId}/profile/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Project documents - role-based access
    match /projects/{projectId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'chw_coordinator', 'nonprofit_staff']);
    }
    
    // Grant documents - admin and coordinators
    match /grants/{grantId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'chw_coordinator']);
    }
    
    // HIPAA protected client documents
    match /clients/{clientId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'chw_coordinator', 'chw']);
    }
  }
}
```

### 4. Initial Data Setup

Create initial collections in Firestore:

#### Users Collection Structure
```json
{
  "users": {
    "user_id": {
      "email": "admin@example.org",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "organization": "Women Leading for Wellness and Justice",
      "phone": "+1234567890",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "isActive": true
    }
  }
}
```

## Development

### Local Development
```bash
npm run dev
```
Access the application at [http://localhost:3000](http://localhost:3000)

### Building for Production
```bash
npm run build
npm start
```

## Deployment Options

### 1. Vercel (Recommended)

#### Automatic Deployment
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

#### Manual Deployment
```bash
npm install -g vercel
vercel --prod
```

### 2. Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### 3. Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  chwone:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.local
    restart: unless-stopped
```

### 4. Traditional Hosting

For shared hosting or VPS:
```bash
npm run build
npm run export  # If using static export
```

Upload the `out` directory to your web server.

## Security Considerations

### HIPAA Compliance Checklist
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure proper Firebase security rules
- [ ] Set up audit logging for all data access
- [ ] Implement data encryption for sensitive fields
- [ ] Configure proper backup and retention policies
- [ ] Set up monitoring and alerting
- [ ] Conduct security assessment
- [ ] Train staff on HIPAA requirements

### Production Security
- [ ] Change all default passwords and keys
- [ ] Enable Firebase App Check
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Set up monitoring and logging
- [ ] Regular security updates

## Monitoring and Maintenance

### Firebase Monitoring
- Enable Firebase Performance Monitoring
- Set up Firebase Crashlytics
- Configure Firebase Analytics (if needed)

### Health Checks
- Monitor application uptime
- Check database connection
- Verify API integrations
- Monitor storage usage

### Backup Strategy
- Firestore automatic backups
- Export audit logs regularly
- Backup environment configuration
- Document recovery procedures

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Firebase Connection Issues
- Verify environment variables
- Check Firebase project settings
- Ensure proper IAM permissions

#### Authentication Problems
- Verify Firebase Auth configuration
- Check security rules
- Ensure proper redirect URLs

#### Performance Issues
- Enable Next.js caching
- Optimize Firestore queries
- Use Firebase CDN for static assets

### Support Contacts
- Technical Issues: [GitHub Issues](repository-url/issues)
- Security Concerns: security@chwone.org
- HIPAA Compliance: compliance@chwone.org

## Compliance Documentation

### Required Documentation
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] HIPAA Business Associate Agreement
- [ ] Data Processing Agreement
- [ ] Incident Response Plan
- [ ] User Training Materials

### Audit Requirements
- Maintain audit logs for 7 years minimum
- Regular compliance assessments
- Staff training documentation
- Access control reviews
- Data breach response procedures

---

For additional support or questions, please refer to the main README.md or contact the development team.
