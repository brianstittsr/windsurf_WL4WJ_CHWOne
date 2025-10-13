# CHWOne Unified Schema Implementation

This document describes the implementation of the unified schema for the CHWOne platform.

## Overview

The unified schema provides a consistent data model across the entire application, ensuring type safety, data integrity, and improved maintainability.

## Schema Structure

The schema is organized into the following components:

- **User Management**: Users, CHW Profiles, Organizations
- **Content Management**: Forms, Form Submissions, Resources, Files
- **Program Management**: Projects, Grants, Clients, Referrals
- **Analytics & Reporting**: Dashboard Metrics, Datasets, Activity Logs, Notifications

## Collections

| Collection | Description | Key Fields |
|------------|-------------|------------|
| `users` | User accounts | uid, email, role, organizationId |
| `chwProfiles` | CHW-specific profile data | uid, firstName, lastName, certificationNumber |
| `organizations` | Organizations (Region 5, WL4WJ, etc.) | id, name, shortName, type |
| `forms` | Form templates | id, title, fields, organizationId |
| `formSubmissions` | Submitted form data | id, formId, submittedBy, responses |
| `resources` | Shared resources and materials | id, name, category, organizationId |
| `files` | Uploaded documents and media | id, name, url, organizationId |
| `projects` | Projects and initiatives | id, name, status, organizationId |
| `grants` | Funding and grants | id, title, amount, organizationId |
| `clients` | Client information | id, firstName, lastName, assignedCHWId |
| `referrals` | Service referrals | id, clientId, resourceId, chwId |
| `dashboardMetrics` | Aggregated metrics | id, organizationId, date, metrics |
| `datasets` | Research and survey datasets | id, name, type, organizationId |
| `activityLogs` | User activity tracking | id, userId, action, resourceType |
| `notifications` | System notifications | id, userId, type, message |
| `system` | System configuration | schema_version, settings |

## Implementation Details

### 1. Schema Files

The schema is defined in the following files:

- `src/lib/schema/unified-schema.ts`: TypeScript interfaces and types
- `src/lib/schema/data-access.ts`: Data access functions
- `src/lib/schema/initialize-schema.ts`: Schema initialization and migration
- `src/lib/schema/validation.ts`: Data validation functions
- `src/lib/schema/migration-tool.ts`: Data migration tools
- `src/lib/schema/index.ts`: Export all schema components

### 2. Security Rules

The Firestore security rules are defined in `firestore.rules` and implement:

- Role-based access control
- Organization-based access control
- Data validation
- Field-level security

### 3. Indexes

The Firestore indexes are defined in `firestore.indexes.json` and support:

- Filtering by organization
- Sorting by creation date
- Filtering by status
- User-specific queries

### 4. Migration

The schema migration process:

1. Creates new collections if they don't exist
2. Migrates CHW data from users to chwProfiles
3. Updates organization references to use organizationId consistently
4. Adds timestamps to all documents
5. Normalizes enum values

## Usage

### Deploying the Schema

```bash
# Deploy Firestore security rules
npm run firebase:deploy:rules

# Deploy Firestore indexes
npm run firebase:deploy:indexes

# Run schema migration
npm run migrate-schema
```

### Using the Schema in Components

```typescript
import { User, CHWProfile, COLLECTIONS } from '@/lib/schema';
import { getUserById, getCHWs, createCHWProfile } from '@/lib/schema/data-access';

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

## Best Practices

1. **Always use the data access layer**: Don't directly access Firestore collections
2. **Use TypeScript interfaces**: Ensure type safety by using the provided interfaces
3. **Handle errors**: All data access functions return a result object with success/error fields
4. **Check schema version**: Verify the schema version before performing operations
5. **Use constants**: Use the COLLECTIONS constant for collection names

## Troubleshooting

### Common Issues

1. **Missing Fields**: If you encounter "field does not exist" errors, check that your data matches the schema
2. **Permission Denied**: Verify that your security rules allow the operation
3. **Index Missing**: If you see "requires an index" errors, add the missing index to firestore.indexes.json

### Debugging

1. Use the Firebase Console to inspect your data
2. Check the Firebase Authentication state
3. Review the security rules in the Firebase Console
4. Use the Firebase Emulator for local testing

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
