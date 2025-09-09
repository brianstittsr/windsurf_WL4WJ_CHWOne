# CHWOne Platform Setup Guide

This guide will help you set up the CHWOne (Community Health Worker Management Platform) for development and deployment.

## Prerequisites

- Node.js 18+ and npm
- Firebase CLI
- Git

## Environment Setup Issues

**IMPORTANT**: If you encounter "Exit code could not be determined" or Node.js commands not working:

1. **Verify Node.js Installation**
   ```bash
   node --version
   npm --version
   ```

2. **Check PATH Environment Variable**
   - Ensure Node.js is in your system PATH
   - Common locations: `C:\Program Files\nodejs\` or `%LOCALAPPDATA%\Programs\nodejs\`

3. **Restart Terminal/IDE**
   - Close and reopen your terminal/IDE after Node.js installation
   - This ensures PATH changes take effect

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

If you encounter issues, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Environment Setup
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
```

### 3. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Copy configuration to `.env.local`

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Dependencies Status

The following packages are configured in `package.json`:

### Core Dependencies
- `next`: 15.0.3 (React framework)
- `react`: 18.3.1 (UI library)
- `react-dom`: 18.3.1 (React DOM renderer)
- `typescript`: 5.6.3 (Type safety)

### Firebase
- `firebase`: 10.14.1 (Firebase SDK)
- `react-firebase-hooks`: 5.1.1 (Firebase React hooks)

### UI Components
- `@once-ui-system/core`: 1.4.0 (Modern design system)
- `react-icons`: 5.3.0 (Icon library)

### Utilities
- `uuid`: 10.0.0 (Unique ID generation)
- `@tanstack/react-query`: 5.59.16 (Data fetching)

### Development
- `@types/react`: 18.3.12
- `@types/react-dom`: 18.3.1
- `@types/uuid`: 10.0.0
- `eslint`: 8.57.1
- `eslint-config-next`: 15.0.3

## TypeScript Configuration

The project uses TypeScript with strict mode enabled. Key configuration:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Project Structure

```
CHWOne/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api-access/      # API management page
│   │   ├── chws/           # CHW management page
│   │   ├── dashboard/      # Main dashboard
│   │   ├── grants/         # Grant management page
│   │   ├── login/          # Authentication pages
│   │   ├── projects/       # Project management page
│   │   ├── referrals/      # Referral management page
│   │   ├── register/       # User registration
│   │   ├── resources/      # Resource directory page
│   │   └── surveys/        # Survey management page
│   ├── components/         # React components
│   │   ├── API/           # API access components
│   │   ├── CHW/           # CHW management components
│   │   ├── Dashboard/     # Dashboard components
│   │   ├── Grants/        # Grant management components
│   │   ├── Layout/        # Layout components
│   │   ├── Projects/      # Project management components
│   │   ├── Referrals/     # Referral components
│   │   ├── Resources/     # Resource directory components
│   │   └── Surveys/       # Survey components
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── lib/               # Utility libraries
│   │   ├── firebase.ts    # Firebase client config
│   │   ├── firebase-admin.ts # Firebase admin config
│   │   └── auditLogger.ts # HIPAA audit logging
│   └── types/             # TypeScript type definitions
│       └── platform.types.ts # Platform data models
├── public/                # Static assets
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── next.config.mjs       # Next.js configuration
├── README.md             # Platform documentation
├── DEPLOYMENT.md         # Deployment guide
└── SETUP.md              # This setup guide
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Type checking
npm run type-check   # Check TypeScript types
```

## Common Issues and Solutions

### TypeScript Errors
If you see "Cannot find module" errors:
1. Ensure all dependencies are installed: `npm install`
2. Restart your IDE/editor
3. Clear Next.js cache: `rm -rf .next`

### Firebase Connection Issues
1. Verify `.env.local` has correct Firebase config
2. Check Firebase project settings
3. Ensure Firestore and Auth are enabled

### Build Errors
1. Clear cache: `rm -rf .next node_modules package-lock.json`
2. Reinstall: `npm install`
3. Rebuild: `npm run build`

### Authentication Issues
1. Verify Firebase Auth is enabled
2. Check authorized domains in Firebase console
3. Ensure proper redirect URLs are configured

## Next Steps

1. **Install Dependencies**: Run `npm install`
2. **Configure Firebase**: Set up Firebase project and update `.env.local`
3. **Run Development**: Start with `npm run dev`
4. **Create Admin User**: Register first user and set role to 'admin' in Firestore
5. **Configure Security Rules**: Apply Firestore security rules from DEPLOYMENT.md
6. **Test Features**: Verify all components work correctly

## Support

- **Documentation**: See README.md for full platform documentation
- **Deployment**: See DEPLOYMENT.md for production deployment
- **Issues**: Report bugs via GitHub issues
- **Security**: Contact security@chwone.org for security concerns
