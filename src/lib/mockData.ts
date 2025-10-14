// Mock data for fallback when Firebase is unavailable
const mockData: Record<string, any> = {
  users: [
    {
      id: 'user1',
      email: 'admin@example.com',
      displayName: 'Admin User',
      role: 'admin',
      organization: 'Region 5',
      approved: true
    },
    {
      id: 'user2',
      email: 'chw@example.com',
      displayName: 'CHW User',
      role: 'chw',
      organization: 'Region 5',
      approved: true
    }
  ],
  chws: [
    {
      id: 'chw1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      organization: 'Region 5',
      status: 'active',
      certifications: ['CPR', 'First Aid'],
      location: 'Chicago, IL'
    },
    {
      id: 'chw2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '555-987-6543',
      organization: 'WL4WJ',
      status: 'active',
      certifications: ['Mental Health First Aid'],
      location: 'Detroit, MI'
    }
  ],
  resources: [
    {
      id: 'resource1',
      title: 'Community Health Worker Training Guide',
      description: 'Comprehensive training materials for CHWs',
      url: 'https://example.com/chw-training',
      category: 'Training',
      organization: 'Region 5'
    },
    {
      id: 'resource2',
      title: 'Mental Health Resources Directory',
      description: 'Directory of mental health services and resources',
      url: 'https://example.com/mental-health',
      category: 'Directory',
      organization: 'WL4WJ'
    }
  ],
  forms: [
    {
      id: 'form1',
      title: 'Client Intake Form',
      description: 'Initial assessment form for new clients',
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', required: true },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'address', label: 'Address', type: 'textarea', required: false }
      ],
      organization: 'Region 5',
      createdBy: 'user1',
      createdAt: '2025-01-15T12:00:00Z'
    }
  ],
  projects: [
    {
      id: 'project1',
      title: 'Community Health Fair',
      description: 'Annual health fair providing free screenings and resources',
      status: 'active',
      startDate: '2025-06-01T00:00:00Z',
      endDate: '2025-06-02T00:00:00Z',
      organization: 'Region 5',
      budget: 5000,
      manager: 'user1'
    }
  ]
};

/**
 * Get mock data for a specific collection and optional document ID
 */
export function getMockData(collectionName: string, docId?: string) {
  // If collection doesn't exist in mock data
  if (!mockData[collectionName]) {
    return null;
  }
  
  // If docId is provided, find the specific document
  if (docId) {
    const collection = mockData[collectionName];
    if (Array.isArray(collection)) {
      return collection.find(item => item.id === docId) || null;
    }
    return null;
  }
  
  // Otherwise return the whole collection
  return mockData[collectionName];
}
