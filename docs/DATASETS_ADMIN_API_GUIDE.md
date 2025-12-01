# Datasets Admin Platform - API Guide

## 📡 REST API Documentation

**Base URL**: `https://your-domain.com/api`  
**Version**: 1.0  
**Authentication**: Bearer Token (coming soon)

---

## 🔐 Authentication

Currently using placeholder authentication. In production, add:
- Bearer token authentication
- API key validation
- Rate limiting
- CORS configuration

---

## 📋 Endpoints

### Datasets

#### List Datasets
```http
GET /api/datasets
```

**Query Parameters**:
- `organizationId` (optional) - Filter by organization
- `sourceApplication` (optional) - Filter by source app
- `status` (optional) - Filter by status (active/archived/deleted)
- `limit` (optional) - Limit number of results

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "dataset_123",
      "name": "Participant Survey",
      "description": "Survey responses from participants",
      "sourceApplication": "QR Wizard",
      "organizationId": "org_456",
      "schema": { ... },
      "metadata": { ... },
      "status": "active"
    }
  ],
  "count": 1
}
```

---

#### Create Dataset
```http
POST /api/datasets
```

**Request Body**:
```json
{
  "name": "My Dataset",
  "description": "Dataset description",
  "sourceApplication": "My App",
  "organizationId": "org_123",
  "schema": {
    "fields": [
      {
        "id": "field_1",
        "name": "email",
        "label": "Email Address",
        "type": "email",
        "required": true
      }
    ],
    "version": "1.0"
  },
  "permissions": {
    "owners": ["user_123"],
    "editors": [],
    "viewers": [],
    "publicAccess": "none",
    "apiAccess": true
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### Get Dataset
```http
GET /api/datasets/:id
```

**Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### Update Dataset
```http
PUT /api/datasets/:id
```

**Request Body**: Partial dataset object

**Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### Delete Dataset
```http
DELETE /api/datasets/:id
```

**Response**:
```json
{
  "success": true,
  "message": "Dataset deleted successfully"
}
```

---

### Records

#### List Records
```http
GET /api/datasets/:id/records
```

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `pageSize` (optional, default: 25) - Records per page
- `search` (optional) - Search query
- `sortBy` (optional) - Field to sort by
- `sortOrder` (optional) - asc or desc

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "record_123",
      "datasetId": "dataset_456",
      "data": {
        "email": "user@example.com",
        "name": "John Doe"
      },
      "createdAt": "2025-11-30T...",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "totalPages": 4
  }
}
```

---

#### Create Record
```http
POST /api/datasets/:id/records
```

**Request Body**:
```json
{
  "data": {
    "email": "user@example.com",
    "name": "John Doe",
    "age": 30
  },
  "source": {
    "application": "Web Form",
    "ipAddress": "192.168.1.1"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": { ... }
}
```

**Validation**:
- Required fields must be present
- Field types must match schema
- Strict mode enforces schema compliance

---

#### Get Record
```http
GET /api/datasets/:id/records/:recordId
```

**Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### Update Record
```http
PUT /api/datasets/:id/records/:recordId
```

**Request Body**:
```json
{
  "data": {
    "email": "newemail@example.com"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### Delete Record
```http
DELETE /api/datasets/:id/records/:recordId
```

**Response**:
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

---

#### Batch Create Records
```http
POST /api/datasets/:id/records/batch
```

**Request Body**:
```json
{
  "records": [
    {
      "data": { "email": "user1@example.com", "name": "User 1" }
    },
    {
      "data": { "email": "user2@example.com", "name": "User 2" }
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": [ ... ],
  "count": 2
}
```

**Validation**:
- All records must pass validation
- If any record fails, entire batch is rejected
- Returns detailed validation errors

---

### Analytics

#### Get Dataset Analytics
```http
GET /api/datasets/:id/analytics
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRecords": 1000,
      "totalFields": 10,
      "requiredFields": 5,
      "searchableFields": 7
    },
    "fieldStats": {
      "email": {
        "type": "email",
        "totalValues": 1000,
        "nullCount": 0,
        "uniqueCount": 950
      },
      "age": {
        "type": "number",
        "totalValues": 980,
        "nullCount": 20,
        "uniqueCount": 45,
        "min": 18,
        "max": 75,
        "avg": 42.5
      }
    },
    "activity": {
      "last24h": 50,
      "last7d": 300,
      "last30d": 1000
    },
    "storage": {
      "size": 1048576,
      "sizeFormatted": "1 MB"
    }
  }
}
```

---

## 🔧 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

**HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Code Examples

### JavaScript/TypeScript

```typescript
// Create a dataset
const response = await fetch('/api/datasets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    name: 'My Dataset',
    description: 'Description',
    sourceApplication: 'My App',
    organizationId: 'org_123',
    schema: {
      fields: [
        {
          id: 'field_1',
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true
        }
      ],
      version: '1.0'
    }
  })
});

const data = await response.json();
console.log(data);
```

```typescript
// Create a record
const response = await fetch('/api/datasets/dataset_123/records', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: {
      email: 'user@example.com',
      name: 'John Doe'
    }
  })
});

const data = await response.json();
```

---

### cURL

```bash
# List datasets
curl -X GET "https://your-domain.com/api/datasets?organizationId=org_123"

# Create dataset
curl -X POST "https://your-domain.com/api/datasets" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Dataset",
    "sourceApplication": "My App",
    "organizationId": "org_123"
  }'

# Create record
curl -X POST "https://your-domain.com/api/datasets/dataset_123/records" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "email": "user@example.com",
      "name": "John Doe"
    }
  }'

# Batch create records
curl -X POST "https://your-domain.com/api/datasets/dataset_123/records/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      { "data": { "email": "user1@example.com" } },
      { "data": { "email": "user2@example.com" } }
    ]
  }'
```

---

### Python

```python
import requests

# Create dataset
response = requests.post(
    'https://your-domain.com/api/datasets',
    json={
        'name': 'My Dataset',
        'sourceApplication': 'My App',
        'organizationId': 'org_123',
        'schema': {
            'fields': [
                {
                    'id': 'field_1',
                    'name': 'email',
                    'label': 'Email',
                    'type': 'email',
                    'required': True
                }
            ],
            'version': '1.0'
        }
    }
)

data = response.json()
print(data)

# Create record
response = requests.post(
    'https://your-domain.com/api/datasets/dataset_123/records',
    json={
        'data': {
            'email': 'user@example.com',
            'name': 'John Doe'
        }
    }
)

data = response.json()
print(data)
```

---

## 🚀 Rate Limiting

**Coming Soon**: Rate limiting will be implemented with the following limits:
- 100 requests per minute per API key
- 1000 requests per hour per API key
- Burst allowance: 20 requests

---

## 🔒 Security Best Practices

1. **Always use HTTPS** in production
2. **Validate input** on both client and server
3. **Use API keys** for external integrations
4. **Implement rate limiting** to prevent abuse
5. **Log all API access** for audit trails
6. **Sanitize data** before storage
7. **Use CORS** to restrict origins

---

## 📊 Webhook Support (Coming Soon)

Configure webhooks to receive real-time notifications:

**Events**:
- `record.created`
- `record.updated`
- `record.deleted`
- `schema.changed`

**Webhook Payload**:
```json
{
  "event": "record.created",
  "datasetId": "dataset_123",
  "recordId": "record_456",
  "timestamp": "2025-11-30T...",
  "data": { ... }
}
```

---

## 🧪 Testing the API

### Using the API Tab
1. Navigate to dataset detail view
2. Click "API" tab
3. Copy endpoint and API key
4. Use provided code examples

### Using Postman
1. Import the API collection (coming soon)
2. Set environment variables
3. Run requests

### Using cURL
See code examples above

---

## 📞 Support

For API support:
- Check this documentation
- Review code examples
- Test in API tab
- Contact support team

---

*Last Updated: November 30, 2025*  
*API Version: 1.0*
