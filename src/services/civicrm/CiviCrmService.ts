/**
 * CiviCRM API Service
 * 
 * This service handles communication with the CiviCRM REST API.
 * It provides methods for CRUD operations on CiviCRM entities.
 */

import { v4 as uuidv4 } from 'uuid';

// CiviCRM API Response Types
export interface CiviCrmApiResponse<T> {
  is_error: number;
  version: string;
  count: number;
  values: T[];
  error_message?: string;
}

// CiviCRM Entity Types
export interface CiviContact {
  id?: string;
  contact_type: 'Individual' | 'Organization' | 'Household';
  contact_sub_type?: string;
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  household_name?: string;
  email?: string;
  phone?: string;
  street_address?: string;
  city?: string;
  state_province_id?: string;
  postal_code?: string;
  country_id?: string;
  created_date?: string;
  modified_date?: string;
  [key: string]: any;
}

export interface CiviEvent {
  id?: string;
  title: string;
  description?: string;
  event_type_id: string;
  start_date: string;
  end_date?: string;
  is_active?: boolean;
  is_public?: boolean;
  max_participants?: number;
  [key: string]: any;
}

export interface CiviCase {
  id?: string;
  case_type_id: string;
  subject: string;
  status_id: string;
  start_date: string;
  end_date?: string;
  contact_id: string;
  [key: string]: any;
}

export interface CiviActivity {
  id?: string;
  activity_type_id: string;
  subject: string;
  activity_date_time: string;
  status_id: string;
  source_contact_id: string;
  target_contact_id?: string[];
  [key: string]: any;
}

export interface CiviRelationship {
  id?: string;
  relationship_type_id: string;
  contact_id_a: string;
  contact_id_b: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  [key: string]: any;
}

// CiviCRM API Parameters
export interface CiviCrmApiParams {
  entity: string;
  action: string;
  [key: string]: any;
}

class CiviCrmService {
  private apiUrl: string;
  private apiKey: string;
  private siteKey: string;
  private isMockMode: boolean;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_CIVICRM_API_URL || '';
    this.apiKey = process.env.NEXT_PUBLIC_CIVICRM_API_KEY || '';
    this.siteKey = process.env.NEXT_PUBLIC_CIVICRM_SITE_KEY || '';
    this.isMockMode = !this.apiUrl || !this.apiKey || process.env.NODE_ENV === 'development';
    
    if (this.isMockMode) {
      console.warn('CiviCRM API is running in mock mode. No actual API calls will be made.');
    }
  }

  /**
   * Make a request to the CiviCRM API
   */
  private async makeRequest<T>(params: CiviCrmApiParams): Promise<CiviCrmApiResponse<T>> {
    // If in mock mode, return mock data
    if (this.isMockMode) {
      return this.getMockResponse<T>(params);
    }

    try {
      const url = new URL(this.apiUrl);
      url.searchParams.append('entity', params.entity);
      url.searchParams.append('action', params.action);
      url.searchParams.append('api_key', this.apiKey);
      url.searchParams.append('key', this.siteKey);
      url.searchParams.append('json', '1');

      // Add all other params
      Object.entries(params).forEach(([key, value]) => {
        if (key !== 'entity' && key !== 'action') {
          url.searchParams.append(key, String(value));
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`CiviCRM API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling CiviCRM API:', error);
      return {
        is_error: 1,
        version: '3',
        count: 0,
        values: [],
        error_message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get contacts from CiviCRM
   */
  async getContacts(params: { [key: string]: any } = {}): Promise<CiviCrmApiResponse<CiviContact>> {
    return this.makeRequest<CiviContact>({
      entity: 'Contact',
      action: 'get',
      ...params
    });
  }

  /**
   * Create a contact in CiviCRM
   */
  async createContact(contact: CiviContact): Promise<CiviCrmApiResponse<CiviContact>> {
    return this.makeRequest<CiviContact>({
      entity: 'Contact',
      action: 'create',
      ...contact
    });
  }

  /**
   * Update a contact in CiviCRM
   */
  async updateContact(id: string, contact: Partial<CiviContact>): Promise<CiviCrmApiResponse<CiviContact>> {
    return this.makeRequest<CiviContact>({
      entity: 'Contact',
      action: 'update',
      id,
      ...contact
    });
  }

  /**
   * Delete a contact in CiviCRM
   */
  async deleteContact(id: string): Promise<CiviCrmApiResponse<CiviContact>> {
    return this.makeRequest<CiviContact>({
      entity: 'Contact',
      action: 'delete',
      id
    });
  }

  /**
   * Get events from CiviCRM
   */
  async getEvents(params: { [key: string]: any } = {}): Promise<CiviCrmApiResponse<CiviEvent>> {
    return this.makeRequest<CiviEvent>({
      entity: 'Event',
      action: 'get',
      ...params
    });
  }

  /**
   * Create an event in CiviCRM
   */
  async createEvent(event: CiviEvent): Promise<CiviCrmApiResponse<CiviEvent>> {
    return this.makeRequest<CiviEvent>({
      entity: 'Event',
      action: 'create',
      ...event
    });
  }

  /**
   * Get cases from CiviCRM
   */
  async getCases(params: { [key: string]: any } = {}): Promise<CiviCrmApiResponse<CiviCase>> {
    return this.makeRequest<CiviCase>({
      entity: 'Case',
      action: 'get',
      ...params
    });
  }

  /**
   * Create a case in CiviCRM
   */
  async createCase(caseData: CiviCase): Promise<CiviCrmApiResponse<CiviCase>> {
    return this.makeRequest<CiviCase>({
      entity: 'Case',
      action: 'create',
      ...caseData
    });
  }

  /**
   * Get activities from CiviCRM
   */
  async getActivities(params: { [key: string]: any } = {}): Promise<CiviCrmApiResponse<CiviActivity>> {
    return this.makeRequest<CiviActivity>({
      entity: 'Activity',
      action: 'get',
      ...params
    });
  }

  /**
   * Create an activity in CiviCRM
   */
  async createActivity(activity: CiviActivity): Promise<CiviCrmApiResponse<CiviActivity>> {
    return this.makeRequest<CiviActivity>({
      entity: 'Activity',
      action: 'create',
      ...activity
    });
  }

  /**
   * Get relationships from CiviCRM
   */
  async getRelationships(params: { [key: string]: any } = {}): Promise<CiviCrmApiResponse<CiviRelationship>> {
    return this.makeRequest<CiviRelationship>({
      entity: 'Relationship',
      action: 'get',
      ...params
    });
  }

  /**
   * Create a relationship in CiviCRM
   */
  async createRelationship(relationship: CiviRelationship): Promise<CiviCrmApiResponse<CiviRelationship>> {
    return this.makeRequest<CiviRelationship>({
      entity: 'Relationship',
      action: 'create',
      ...relationship
    });
  }

  /**
   * Get mock response for development/testing
   */
  private getMockResponse<T>(params: CiviCrmApiParams): CiviCrmApiResponse<T> {
    const { entity, action } = params;
    
    // Generate mock data based on entity and action
    switch (entity) {
      case 'Contact':
        return this.getMockContactResponse(action, params) as CiviCrmApiResponse<T>;
      case 'Event':
        return this.getMockEventResponse(action, params) as CiviCrmApiResponse<T>;
      case 'Case':
        return this.getMockCaseResponse(action, params) as CiviCrmApiResponse<T>;
      case 'Activity':
        return this.getMockActivityResponse(action, params) as CiviCrmApiResponse<T>;
      case 'Relationship':
        return this.getMockRelationshipResponse(action, params) as CiviCrmApiResponse<T>;
      default:
        return {
          is_error: 1,
          version: '3',
          count: 0,
          values: [],
          error_message: `Unknown entity: ${entity}`
        };
    }
  }

  /**
   * Get mock contact response
   */
  private getMockContactResponse(action: string, params: CiviCrmApiParams): CiviCrmApiResponse<CiviContact> {
    const mockContacts: CiviContact[] = [
      {
        id: '1',
        contact_type: 'Individual',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        created_date: '2025-01-15',
        modified_date: '2025-01-15'
      },
      {
        id: '2',
        contact_type: 'Individual',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-987-6543',
        created_date: '2025-01-20',
        modified_date: '2025-01-20'
      },
      {
        id: '3',
        contact_type: 'Organization',
        organization_name: 'Community Health Partners',
        email: 'info@chp.org',
        phone: '555-555-5555',
        created_date: '2025-01-10',
        modified_date: '2025-01-10'
      }
    ];

    switch (action) {
      case 'get':
        return {
          is_error: 0,
          version: '3',
          count: mockContacts.length,
          values: mockContacts
        };
      case 'create':
        return {
          is_error: 0,
          version: '3',
          count: 1,
          values: [{
            id: uuidv4(),
            contact_type: params.contact_type || 'Individual', // Add default contact_type if not provided
            ...params,
            created_date: new Date().toISOString().split('T')[0],
            modified_date: new Date().toISOString().split('T')[0]
          }]
        };
      case 'update':
        return {
          is_error: 0,
          version: '3',
          count: 1,
          values: [{
            id: params.id,
            contact_type: params.contact_type || 'Individual', // Add default contact_type if not provided
            ...params,
            modified_date: new Date().toISOString().split('T')[0]
          }]
        };
      case 'delete':
        return {
          is_error: 0,
          version: '3',
          count: 1,
          values: [{ id: params.id, contact_type: 'Individual', deleted: true }]
        };
      default:
        return {
          is_error: 1,
          version: '3',
          count: 0,
          values: [],
          error_message: `Unknown action: ${action}`
        };
    }
  }

  /**
   * Get mock event response
   */
  private getMockEventResponse(action: string, params: CiviCrmApiParams): CiviCrmApiResponse<CiviEvent> {
    const mockEvents: CiviEvent[] = [
      {
        id: '1',
        title: 'Community Health Fair',
        description: 'Annual health fair with free screenings and resources',
        event_type_id: '1',
        start_date: '2025-06-15',
        end_date: '2025-06-15',
        is_active: true,
        is_public: true,
        max_participants: 500
      },
      {
        id: '2',
        title: 'CHW Training Workshop',
        description: 'Training workshop for new community health workers',
        event_type_id: '2',
        start_date: '2025-07-10',
        end_date: '2025-07-12',
        is_active: true,
        is_public: false,
        max_participants: 30
      }
    ];

    switch (action) {
      case 'get':
        return {
          is_error: 0,
          version: '3',
          count: mockEvents.length,
          values: mockEvents
        };
      case 'create':
        return {
          is_error: 0,
          version: '3',
          count: 1,
          values: [{
            id: uuidv4(),
            title: params.title || 'Untitled Event',
            event_type_id: params.event_type_id || '1',
            start_date: params.start_date || new Date().toISOString().split('T')[0],
            ...params,
            is_active: params.is_active !== undefined ? params.is_active : true
          }]
        };
      default:
        return {
          is_error: 1,
          version: '3',
          count: 0,
          values: [],
          error_message: `Unknown action: ${action}`
        };
    }
  }

  /**
   * Get mock case response
   */
  private getMockCaseResponse(action: string, params: CiviCrmApiParams): CiviCrmApiResponse<CiviCase> {
    const mockCases: CiviCase[] = [
      {
        id: '1',
        case_type_id: '1',
        subject: 'Housing Assistance',
        status_id: '1',
        start_date: '2025-02-10',
        contact_id: '1'
      },
      {
        id: '2',
        case_type_id: '2',
        subject: 'Healthcare Access',
        status_id: '2',
        start_date: '2025-03-05',
        contact_id: '2'
      }
    ];

    switch (action) {
      case 'get':
        return {
          is_error: 0,
          version: '3',
          count: mockCases.length,
          values: mockCases
        };
      case 'create':
        return {
          is_error: 0,
          version: '3',
          count: 1,
          values: [{
            id: uuidv4(),
            case_type_id: params.case_type_id || '1',
            subject: params.subject || 'New Case',
            status_id: params.status_id || '1',
            start_date: params.start_date || new Date().toISOString().split('T')[0],
            contact_id: params.contact_id || '1',
            ...params
          }]
        };
      default:
        return {
          is_error: 1,
          version: '3',
          count: 0,
          values: [],
          error_message: `Unknown action: ${action}`
        };
    }
  }

  /**
   * Get mock activity response
   */
  private getMockActivityResponse(action: string, params: CiviCrmApiParams): CiviCrmApiResponse<CiviActivity> {
    const mockActivities: CiviActivity[] = [
      {
        id: '1',
        activity_type_id: '1',
        subject: 'Initial Assessment',
        activity_date_time: '2025-02-15 10:00:00',
        status_id: '2',
        source_contact_id: '3',
        target_contact_id: ['1']
      },
      {
        id: '2',
        activity_type_id: '2',
        subject: 'Follow-up Visit',
        activity_date_time: '2025-03-10 14:30:00',
        status_id: '1',
        source_contact_id: '3',
        target_contact_id: ['2']
      }
    ];

    switch (action) {
      case 'get':
        return {
          is_error: 0,
          version: '3',
          count: mockActivities.length,
          values: mockActivities
        };
      case 'create':
        return {
          is_error: 0,
          version: '3',
          count: 1,
          values: [{
            id: uuidv4(),
            activity_type_id: params.activity_type_id || '1',
            subject: params.subject || 'New Activity',
            activity_date_time: params.activity_date_time || new Date().toISOString().replace('T', ' ').split('.')[0],
            status_id: params.status_id || '1',
            source_contact_id: params.source_contact_id || '1',
            ...params
          }]
        };
      default:
        return {
          is_error: 1,
          version: '3',
          count: 0,
          values: [],
          error_message: `Unknown action: ${action}`
        };
    }
  }

  /**
   * Get mock relationship response
   */
  private getMockRelationshipResponse(action: string, params: CiviCrmApiParams): CiviCrmApiResponse<CiviRelationship> {
    const mockRelationships: CiviRelationship[] = [
      {
        id: '1',
        relationship_type_id: '1',
        contact_id_a: '1',
        contact_id_b: '3',
        start_date: '2025-01-15',
        is_active: true
      },
      {
        id: '2',
        relationship_type_id: '2',
        contact_id_a: '2',
        contact_id_b: '3',
        start_date: '2025-02-01',
        is_active: true
      }
    ];

    switch (action) {
      case 'get':
        return {
          is_error: 0,
          version: '3',
          count: mockRelationships.length,
          values: mockRelationships
        };
      case 'create':
        return {
          is_error: 0,
          version: '3',
          count: 1,
          values: [{
            id: uuidv4(),
            relationship_type_id: params.relationship_type_id || '1',
            contact_id_a: params.contact_id_a || '1',
            contact_id_b: params.contact_id_b || '2',
            ...params,
            is_active: params.is_active !== undefined ? params.is_active : true
          }]
        };
      default:
        return {
          is_error: 1,
          version: '3',
          count: 0,
          values: [],
          error_message: `Unknown action: ${action}`
        };
    }
  }
}

export const civiCrmService = new CiviCrmService();
