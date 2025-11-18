# CHWOne Platform Scripts

This directory contains utility scripts for initializing and managing the CHWOne platform.

## State Initialization

### Initialize All 50 US States

This script creates records for all 50 US states in Firestore.

**Usage:**
```bash
npm run init-states
```

**What it does:**
- Creates a `states` collection in Firestore
- Adds all 50 US states with the following data:
  - State name and abbreviation
  - Geographic region (Northeast, South, Midwest, West)
  - Population data
  - Status (active by default)
  - Metadata for tracking CHWs and nonprofits
- Skips states that already exist (safe to run multiple times)

**State Data Structure:**
```typescript
{
  id: "state-nc",
  name: "North Carolina",
  abbreviation: "NC",
  region: "South",
  population: 10439388,
  status: "active",
  hasAssociation: false,
  associationId: null,
  contactEmail: "",
  contactPhone: "",
  website: "",
  description: "State of North Carolina",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  metadata: {
    chwCount: 0,
    nonprofitCount: 0,
    certifiedCHWCount: 0
  }
}
```

**Requirements:**
- Firebase Admin SDK credentials configured in `.env.local`:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`

**Output:**
- Shows progress for each state
- Displays summary of added/skipped states
- Safe to run multiple times (won't duplicate existing states)

## Other Scripts

### Firebase Initialization
```bash
npm run initialize-firebase
```
Sets up initial Firebase collections and schema.

### Deploy Schema
```bash
npm run deploy-schema
```
Deploys Firestore schema and security rules.

### Create Admin User
```bash
npm run create-admin-user
```
Creates an admin user for platform management.

## Environment Variables

Make sure your `.env.local` file contains:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

## Troubleshooting

### "Cannot find module 'firebase-admin'"
Run: `npm install firebase-admin`

### "Permission denied"
Ensure your Firebase service account has Firestore write permissions.

### "Invalid credentials"
Check that your `.env.local` file has the correct Firebase Admin SDK credentials.
