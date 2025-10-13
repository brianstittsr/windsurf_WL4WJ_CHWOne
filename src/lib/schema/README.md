# CHWOne Unified Schema

This directory contains the unified schema for the CHWOne platform. The schema is designed to provide a consistent data model across the entire application.

## Structure

- `unified-schema.ts`: Contains all the TypeScript interfaces and types for the schema
- `data-access.ts`: Provides functions for accessing and manipulating data in Firebase
- `initialize-schema.ts`: Handles schema initialization and migration
- `index.ts`: Exports all schema components for easy importing

## Core Collections

```typescript
export const COLLECTIONS = {
  // User Management
  USERS: 'users',                       // All user accounts
  CHW_PROFILES: 'chwProfiles',          // CHW-specific profile data
  ORGANIZATIONS: 'organizations',        // Organizations (Region 5, WL4WJ, etc.)
  
  // Content Management
  FORMS: 'forms',                       // Form templates
  FORM_SUBMISSIONS: 'formSubmissions',   // Submitted form data
  RESOURCES: 'resources',               // Shared resources and materials
  FILES: 'files',                       // Uploaded documents and media
  
  // Program Management
  PROJECTS: 'projects',                 // Projects and initiatives
  GRANTS: 'grants',                     // Funding and grants
  CLIENTS: 'clients',                   // Client information
  REFERRALS: 'referrals',               // Service referrals
  
  // Analytics & Reporting
  DASHBOARD_METRICS: 'dashboardMetrics', // Aggregated metrics
  DATASETS: 'datasets',                 // Research and survey datasets
  ACTIVITY_LOGS: 'activityLogs',        // User activity tracking
  NOTIFICATIONS: 'notifications'        // System notifications
}
```

## Key Features

1. **Type Safety**: All schema types are fully typed with TypeScript interfaces
2. **Consistency**: The schema provides a single source of truth for data structures
3. **Versioning**: Schema includes version tracking for future migrations
4. **Data Access Layer**: Provides a clean API for accessing and manipulating data
5. **Error Handling**: Comprehensive error handling and reporting

## Usage

### Importing Schema Types

```typescript
import { User, CHWProfile, COLLECTIONS } from '@/lib/schema';
```

### Using Data Access Functions

```typescript
import { getUserById, getCHWs, createCHWProfile } from '@/lib/schema';

// Get a user by ID
const result = await getUserById('user-123');
if (result.success) {
  const user = result.user;
  // Use the user data
}

// Get all CHWs
const chwsResult = await getCHWs();
if (chwsResult.success) {
  const chws = chwsResult.chws;
  // Use the CHWs data
}

// Create a CHW profile
const newProfile = {
  uid: 'user-123',
  firstName: 'John',
  lastName: 'Doe',
  // ... other fields
};
const createResult = await createCHWProfile(newProfile);
```

### Schema Initialization

The schema is automatically initialized when the application starts. You can also manually initialize it:

```typescript
import { initializeFirebaseSchema } from '@/lib/schema';

// Initialize the schema
await initializeFirebaseSchema();
```

## Schema Versioning

The schema includes version tracking to handle future migrations. The current schema version is stored in the `system/schema_version` document in Firestore.

## Best Practices

1. **Always use the data access layer**: Don't directly access Firestore collections
2. **Use TypeScript interfaces**: Ensure type safety by using the provided interfaces
3. **Handle errors**: All data access functions return a result object with success/error fields
4. **Check schema version**: Verify the schema version before performing operations
5. **Use constants**: Use the COLLECTIONS constant for collection names
