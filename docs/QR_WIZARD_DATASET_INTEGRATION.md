# QR Wizard <-> Datasets Admin Integration Guide

## 🔗 Complete Integration Documentation

**Date**: November 30, 2025  
**Status**: Ready to Integrate

---

## ✅ What Was Created

### 1. Integration Service (`QRWizardDatasetIntegration.ts`)
**Location**: `src/services/QRWizardDatasetIntegration.ts`

**Functions**:
- `createDatasetFromQRWizard()` - Auto-create dataset from participant upload
- `addParticipantRecord()` - Add single participant
- `updateParticipantRecord()` - Update participant data
- `getParticipants()` - Fetch all participants
- `searchParticipants()` - Search participants
- `recordQRScan()` - Log QR code scans
- `getDatasetStats()` - Get statistics
- `exportParticipantsToCSV()` - Export to CSV

### 2. React Hook (`useQRWizardDataset.ts`)
**Location**: `src/hooks/useQRWizardDataset.ts`

**Hook API**:
```typescript
const {
  loading,
  error,
  datasetId,
  createDataset,
  addParticipant,
  updateParticipant,
  fetchParticipants,
  searchForParticipants,
  recordScan,
  fetchStats,
  exportToCSV,
  clearError,
  setDatasetId
} = useQRWizardDataset();
```

---

## 🚀 How to Integrate

### Step 1: Update QR Wizard Context

Add dataset ID to wizard state:

```typescript
// In src/contexts/QRWizardContext.tsx
export interface QRTrackingWizardState {
  // ... existing fields
  datasetId?: string; // Add this
}
```

### Step 2: Integrate in Step 4 (Participant Upload)

```typescript
// In src/components/QRTracking/steps/Step4ParticipantUpload.tsx

import { useQRWizardDataset } from '@/hooks/useQRWizardDataset';

export default function Step4ParticipantUpload() {
  const { wizardState, updateStep4 } = useQRWizard();
  const {
    loading: datasetLoading,
    error: datasetError,
    datasetId,
    createDataset
  } = useQRWizardDataset();
  
  // After CSV is parsed and validated
  const handleCreateDataset = async () => {
    const programName = wizardState.step2_program?.programName || 'Unnamed Program';
    const standardFields = wizardState.step3_data?.standardFields || [];
    const customFields = wizardState.step3_data?.customFields || [];
    
    const result = await createDataset(
      programName,
      uploadData,
      standardFields,
      customFields
    );
    
    if (result) {
      // Save dataset ID to wizard state
      updateStep4({
        ...uploadData,
        datasetId: result.datasetId
      });
      
      // Show success message
      alert(`Dataset created! ${result.recordCount} participants stored.`);
    }
  };
  
  return (
    // ... existing UI
    <Button
      variant="contained"
      onClick={handleCreateDataset}
      disabled={datasetLoading || parsedData.length === 0}
    >
      {datasetLoading ? 'Creating Dataset...' : 'Store Participants'}
    </Button>
  );
}
```

### Step 3: Add UI Components

Add these to Step 4:

```typescript
// Success Alert
{datasetId && (
  <Alert severity="success" sx={{ mb: 2 }}>
    ✅ Dataset created! {uploadData.participants?.length} participants stored.
    <Button
      size="small"
      onClick={() => window.open(`/datasets/${datasetId}`, '_blank')}
      sx={{ ml: 2 }}
    >
      View Dataset
    </Button>
  </Alert>
)}

// Error Alert
{datasetError && (
  <Alert severity="error" onClose={clearError}>
    {datasetError}
  </Alert>
)}

// Loading Indicator
{datasetLoading && (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <CircularProgress size={20} />
    <Typography>Creating dataset and storing participants...</Typography>
  </Box>
)}
```

---

## 📊 Integration Flow

### Complete Workflow

```
QR Wizard Step 4: Upload CSV
         ↓
Parse & Validate Data
         ↓
Map Fields to Schema
         ↓
Click "Store Participants"
         ↓
useQRWizardDataset.createDataset()
         ↓
QRWizardDatasetIntegration.createDatasetFromQRWizard()
         ↓
1. Create Dataset with Schema
2. Batch Create Records
3. Return Dataset ID
         ↓
Save Dataset ID to Wizard State
         ↓
Show Success + Link to Dataset
         ↓
Continue to Step 5 (Forms)
```

---

## 🎯 Usage Examples

### Example 1: Create Dataset from Upload

```typescript
const { createDataset } = useQRWizardDataset();

const result = await createDataset(
  'Summer Health Program',
  {
    uploadMethod: 'file',
    participants: [
      { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
    ],
    fieldMapping: {
      'First Name': 'first_name',
      'Last Name': 'last_name',
      'Email': 'email'
    },
    validationResults: { /* ... */ }
  },
  ['firstName', 'lastName', 'email'],
  [{ fieldName: 'phoneNumber', fieldType: 'phone', required: false }]
);

console.log(`Dataset ID: ${result.datasetId}`);
console.log(`Records created: ${result.recordCount}`);
```

### Example 2: Add Single Participant

```typescript
const { addParticipant } = useQRWizardDataset();

const recordId = await addParticipant(
  'dataset_123',
  {
    first_name: 'Bob',
    last_name: 'Johnson',
    email: 'bob@example.com',
    phone_number: '555-0100'
  }
);
```

### Example 3: Record QR Scan

```typescript
const { recordScan } = useQRWizardDataset();

await recordScan(
  'dataset_123',
  'record_456',
  {
    location: 'Health Fair - Booth 3',
    timestamp: new Date(),
    scannedBy: 'Staff Member',
    notes: 'Received health screening'
  }
);
```

### Example 4: Search Participants

```typescript
const { searchForParticipants } = useQRWizardDataset();

const results = await searchForParticipants(
  'dataset_123',
  'john@example.com'
);

console.log(`Found ${results.total} participants`);
```

### Example 5: Export to CSV

```typescript
const { exportToCSV } = useQRWizardDataset();

await exportToCSV('dataset_123');
// Downloads: participants_dataset_123_2025-11-30.csv
```

---

## 🔄 Data Flow

### From QR Wizard to Datasets Admin

```typescript
// QR Wizard Step 4 Data
{
  uploadMethod: 'file',
  participants: [
    { 'First Name': 'John', 'Last Name': 'Doe', 'Email': 'john@example.com' }
  ],
  fieldMapping: {
    'First Name': 'first_name',
    'Last Name': 'last_name',
    'Email': 'email'
  }
}

// ↓ Transforms to ↓

// Dataset Schema
{
  fields: [
    { id: 'field_first_name', name: 'first_name', label: 'First Name', type: 'string' },
    { id: 'field_last_name', name: 'last_name', label: 'Last Name', type: 'string' },
    { id: 'field_email', name: 'email', label: 'Email', type: 'email' }
  ]
}

// Dataset Records
[
  {
    datasetId: 'dataset_123',
    data: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com'
    },
    source: { application: 'QR Wizard', step: 'Step 4 - Participant Upload' }
  }
]
```

---

## 🎨 UI Integration

### Add to Step 4 UI

```typescript
<Paper sx={{ p: 3, mb: 3 }}>
  <Typography variant="h6" gutterBottom>
    Store Participant Data
  </Typography>
  
  {!datasetId ? (
    <>
      <Typography variant="body2" color="text.secondary" paragraph>
        Create a dataset to store your participant information securely.
        This enables tracking, reporting, and QR code scanning.
      </Typography>
      
      <Button
        variant="contained"
        onClick={handleCreateDataset}
        disabled={datasetLoading || parsedData.length === 0}
        startIcon={datasetLoading ? <CircularProgress size={20} /> : <StorageIcon />}
      >
        {datasetLoading ? 'Creating Dataset...' : 'Store Participants'}
      </Button>
    </>
  ) : (
    <Alert severity="success">
      <AlertTitle>Dataset Created Successfully!</AlertTitle>
      {uploadData.participants?.length} participants stored in dataset.
      <Box sx={{ mt: 2 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => window.open(`/datasets/${datasetId}`, '_blank')}
        >
          View Dataset
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => exportToCSV(datasetId)}
          sx={{ ml: 1 }}
        >
          Export CSV
        </Button>
      </Box>
    </Alert>
  )}
  
  {datasetError && (
    <Alert severity="error" onClose={clearError} sx={{ mt: 2 }}>
      {datasetError}
    </Alert>
  )}
</Paper>
```

---

## 🔗 API Integration

### Form Submission to Dataset

```typescript
// When a form is submitted via QR code
async function handleFormSubmission(formData: any, datasetId: string) {
  const response = await fetch(`/api/datasets/${datasetId}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: formData,
      source: {
        application: 'QR Wizard',
        step: 'Form Submission'
      }
    })
  });
  
  const result = await response.json();
  return result.data.id; // Record ID
}
```

---

## ✅ Testing Checklist

### Integration Tests

- [ ] Upload CSV in Step 4
- [ ] Create dataset automatically
- [ ] Verify all participants stored
- [ ] Check field mapping works
- [ ] View dataset in admin
- [ ] Add new participant
- [ ] Update participant data
- [ ] Search participants
- [ ] Record QR scan
- [ ] Export to CSV
- [ ] Check audit logs

---

## 📊 Benefits

### For Users
- ✅ Automatic data storage
- ✅ No manual dataset creation
- ✅ Seamless workflow
- ✅ Instant access to data
- ✅ Easy export/import

### For Developers
- ✅ Clean integration
- ✅ Type-safe API
- ✅ Error handling
- ✅ Loading states
- ✅ Reusable hooks

---

## 🚀 Next Steps

1. **Add to Step 4** - Integrate dataset creation
2. **Test Flow** - Upload CSV → Create dataset → View data
3. **Add to Step 5** - Link forms to dataset
4. **Add Scanning** - Record QR scans to dataset
5. **Add Analytics** - Show participant stats

---

## 📝 Notes

### organizationId Issue
The `User` type doesn't have `organizationId`. Options:
1. Use `currentUser.uid` as fallback
2. Add `organizationId` to User type
3. Get from user profile document

**Current Implementation**: Uses `currentUser.organizationId || currentUser.uid`

### Field Type Mapping
Automatically maps field names to appropriate types:
- Email fields → `email` type
- Phone fields → `phone` type
- URL fields → `url` type
- Date fields → `date` type
- Number fields → `number` type
- Text/Notes → `text` type
- Everything else → `string` type

---

**Status**: Integration code complete ✅  
**Next**: Add to QR Wizard UI  
**Time**: 30-60 minutes

*Last Updated: November 30, 2025*
