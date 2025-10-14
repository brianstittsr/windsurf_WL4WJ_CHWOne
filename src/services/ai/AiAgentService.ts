/**
 * AI Agent Service
 * 
 * This service handles communication with the AI Agent API.
 * It provides methods for sending messages and receiving responses.
 */

import { v4 as uuidv4 } from 'uuid';

// AI Agent Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface AiAgentResponse {
  message: Message;
  suggestedActions?: SuggestedAction[];
  error?: string;
}

export interface SuggestedAction {
  type: 'navigate' | 'search' | 'create' | 'view' | 'edit' | 'delete';
  label: string;
  target?: string;
  params?: Record<string, any>;
}

class AiAgentService {
  private apiUrl: string;
  private apiKey: string;
  private isMockMode: boolean;
  private mockDelay: number = 1000; // Delay for mock responses in ms

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_AI_AGENT_API_URL || '';
    this.apiKey = process.env.NEXT_PUBLIC_AI_AGENT_API_KEY || '';
    this.isMockMode = !this.apiUrl || !this.apiKey || process.env.NODE_ENV === 'development';
    
    if (this.isMockMode) {
      console.warn('AI Agent API is running in mock mode. No actual API calls will be made.');
    }
  }

  /**
   * Send a message to the AI Agent
   */
  async sendMessage(
    message: string, 
    conversationId?: string, 
    userId?: string
  ): Promise<AiAgentResponse> {
    // If in mock mode, return mock response
    if (this.isMockMode) {
      return this.getMockResponse(message, conversationId);
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          message,
          conversationId,
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`AI Agent API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling AI Agent API:', error);
      return {
        message: {
          id: uuidv4(),
          role: 'assistant',
          content: 'I apologize, but I encountered an error while processing your request. Please try again later.',
          timestamp: new Date()
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get conversations for a user
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    // If in mock mode, return mock conversations
    if (this.isMockMode) {
      return this.getMockConversations(userId);
    }

    try {
      const response = await fetch(`${this.apiUrl}/conversations?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`AI Agent API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    // If in mock mode, return mock conversation
    if (this.isMockMode) {
      return this.getMockConversation(conversationId);
    }

    try {
      const response = await fetch(`${this.apiUrl}/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`AI Agent API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(userId: string, title?: string): Promise<Conversation> {
    // If in mock mode, return mock conversation
    if (this.isMockMode) {
      return this.getMockConversation(uuidv4(), title);
    }

    try {
      const response = await fetch(`${this.apiUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          userId,
          title: title || 'New Conversation'
        })
      });

      if (!response.ok) {
        throw new Error(`AI Agent API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      return {
        id: uuidv4(),
        title: title || 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId
      };
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    // If in mock mode, return success
    if (this.isMockMode) {
      return true;
    }

    try {
      const response = await fetch(`${this.apiUrl}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  /**
   * Get mock response for development/testing
   */
  private async getMockResponse(message: string, conversationId?: string): Promise<AiAgentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.mockDelay));

    // Generate response based on message content
    let responseContent = '';
    let suggestedActions: SuggestedAction[] = [];

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      responseContent = 'Hello! I\'m your CHWOne AI assistant. How can I help you today?';
    } else if (lowerMessage.includes('help')) {
      responseContent = 'I can help you with various tasks in the CHWOne platform. You can ask me about contacts, cases, events, or how to use specific features.';
    } else if (lowerMessage.includes('contact')) {
      responseContent = 'I can help you manage contacts in CiviCRM. Would you like to search for contacts, create a new contact, or view contact details?';
      suggestedActions = [
        { type: 'navigate', label: 'View Contacts', target: '/civicrm/contacts' },
        { type: 'create', label: 'Create Contact', target: '/civicrm/contacts/new' }
      ];
    } else if (lowerMessage.includes('case')) {
      responseContent = 'I can help you manage cases in CiviCRM. Would you like to view active cases, create a new case, or search for specific cases?';
      suggestedActions = [
        { type: 'navigate', label: 'View Cases', target: '/civicrm/cases' },
        { type: 'create', label: 'Create Case', target: '/civicrm/cases/new' }
      ];
    } else if (lowerMessage.includes('event')) {
      responseContent = 'I can help you manage events in CiviCRM. Would you like to view upcoming events, create a new event, or search for specific events?';
      suggestedActions = [
        { type: 'navigate', label: 'View Events', target: '/civicrm/events' },
        { type: 'create', label: 'Create Event', target: '/civicrm/events/new' }
      ];
    } else if (lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
      responseContent = 'I can help you with reports and analytics. Would you like to view existing reports or create a new report?';
      suggestedActions = [
        { type: 'navigate', label: 'View Reports', target: '/reports' },
        { type: 'create', label: 'Create Report', target: '/reports/new' }
      ];
    } else if (lowerMessage.includes('dataset') || lowerMessage.includes('data')) {
      responseContent = 'I can help you manage datasets. Would you like to view existing datasets or upload a new dataset?';
      suggestedActions = [
        { type: 'navigate', label: 'View Datasets', target: '/datasets' },
        { type: 'navigate', label: 'Upload Dataset', target: '/datasets?upload=true' }
      ];
    } else {
      responseContent = 'I\'m not sure how to help with that specific request. Could you provide more details or ask about contacts, cases, events, reports, or datasets?';
    }

    return {
      message: {
        id: uuidv4(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      },
      suggestedActions
    };
  }

  /**
   * Get mock conversations for development/testing
   */
  private getMockConversations(userId: string): Conversation[] {
    return [
      {
        id: 'conv-1',
        title: 'Help with contacts',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'How do I add a new contact?',
            timestamp: new Date(Date.now() - 86400000) // 1 day ago
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: 'To add a new contact, navigate to the CiviCRM tab and click on "Contacts" in the sidebar. Then click the "Add Contact" button in the top right corner.',
            timestamp: new Date(Date.now() - 86400000 + 30000) // 1 day ago + 30 seconds
          }
        ],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000 + 30000),
        userId
      },
      {
        id: 'conv-2',
        title: 'Event management',
        messages: [
          {
            id: 'msg-3',
            role: 'user',
            content: 'How do I create a new event?',
            timestamp: new Date(Date.now() - 43200000) // 12 hours ago
          },
          {
            id: 'msg-4',
            role: 'assistant',
            content: 'To create a new event, go to the CiviCRM tab and select "Events" from the sidebar. Then click the "Create Event" button.',
            timestamp: new Date(Date.now() - 43200000 + 45000) // 12 hours ago + 45 seconds
          }
        ],
        createdAt: new Date(Date.now() - 43200000),
        updatedAt: new Date(Date.now() - 43200000 + 45000),
        userId
      }
    ];
  }

  /**
   * Get mock conversation for development/testing
   */
  private getMockConversation(conversationId: string, title?: string): Conversation {
    return {
      id: conversationId,
      title: title || 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-1'
    };
  }
}

export const aiAgentService = new AiAgentService();
