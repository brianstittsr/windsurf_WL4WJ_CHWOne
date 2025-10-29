/**
 * AI Agent Service
 * 
 * This service handles communication with the AI Agent API.
 * It provides methods for sending messages and receiving responses.
 */

import { v4 as uuidv4 } from 'uuid';
import { CHW_LEVELS, CERTIFICATION_REQUIREMENTS, CAREER_PATHWAYS, TRAINING_PROGRAMS } from '@/data/chwLevels';

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
    // Always use mock mode to prevent Failed to fetch errors
    this.isMockMode = true;
    
    console.warn('AI Agent API is running in mock mode. No actual API calls will be made.');
  }

  /**
   * Send a message to the AI Agent
   */
  async sendMessage(
    message: string, 
    conversationId?: string, 
    userId?: string
  ): Promise<AiAgentResponse> {
    // Always return mock response to prevent Failed to fetch errors
    return this.getMockResponse(message, conversationId);
  }

  /**
   * Get conversations for a user
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    // Always return mock conversations to prevent Failed to fetch errors
    return this.getMockConversations(userId);
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    // Always return mock conversation to prevent Failed to fetch errors
    return this.getMockConversation(conversationId);
  }

  /**
   * Create a new conversation
   */
  async createConversation(userId: string, title?: string): Promise<Conversation> {
    // Always return mock conversation to prevent Failed to fetch errors
    return this.getMockConversation(uuidv4(), title);
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    // Always return success to prevent Failed to fetch errors
    return true;
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
    
    // Check if the message is about CHW Levels
    if (this.isAboutCHWLevels(lowerMessage)) {
      return this.handleCHWLevelsQuery(lowerMessage);
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      responseContent = 'Hello! I\'m your CHWOne AI assistant. How can I help you today? You can ask me about CHW levels, certification requirements, or other platform features.';
    } else if (lowerMessage.includes('help')) {
      responseContent = 'I can help you with various tasks in the CHWOne platform. You can ask me about CHW levels, certification requirements, contacts, cases, events, or how to use specific features.';
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
      responseContent = 'I\'m not sure how to help with that specific request. Could you provide more details or ask about CHW levels, certification requirements, contacts, cases, events, reports, or datasets?';
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
  /**
   * Check if the message is about CHW Levels
   */
  private isAboutCHWLevels(message: string): boolean {
    const chwLevelKeywords = [
      'chw level', 'chw levels', 'certification level', 'certification levels',
      'entry level', 'intermediate level', 'advanced level',
      'chw certification', 'chw requirements', 'chw training',
      'wl4wj certification', 'wl4wj requirements', 'wl4wj training',
      'community health worker level', 'community health worker certification'
    ];
    
    return chwLevelKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  /**
   * Handle queries about CHW Levels
   */
  private async handleCHWLevelsQuery(message: string): Promise<AiAgentResponse> {
    let responseContent = '';
    let suggestedActions: SuggestedAction[] = [];
    
    // Check for specific level queries
    if (message.includes('entry level') || message.includes('entry-level')) {
      const level = CHW_LEVELS.entry;
      responseContent = `**Entry Level CHW Certification**\n\n${level.description}\n\n**Requirements:**\n- ${level.requirements.join('\n- ')}\n\n**Required Training Hours:** ${level.trainingHours}\n**Supervision Hours:** ${level.supervisionHours}\n**Recertification Period:** ${level.recertificationPeriod} year(s)`;
      
      suggestedActions = [
        { type: 'navigate', label: 'View CHW Profiles', target: '/chws/mock-profiles' },
        { type: 'navigate', label: 'Training Programs', target: '/training' }
      ];
    }
    else if (message.includes('intermediate level') || message.includes('intermediate-level')) {
      const level = CHW_LEVELS.intermediate;
      responseContent = `**Intermediate Level CHW Certification**\n\n${level.description}\n\n**Requirements:**\n- ${level.requirements.join('\n- ')}\n\n**Required Training Hours:** ${level.trainingHours}\n**Supervision Hours:** ${level.supervisionHours}\n**Recertification Period:** ${level.recertificationPeriod} year(s)`;
      
      suggestedActions = [
        { type: 'navigate', label: 'View CHW Profiles', target: '/chws/mock-profiles' },
        { type: 'navigate', label: 'Training Programs', target: '/training' }
      ];
    }
    else if (message.includes('advanced level') || message.includes('advanced-level')) {
      const level = CHW_LEVELS.advanced;
      responseContent = `**Advanced Level CHW Certification**\n\n${level.description}\n\n**Requirements:**\n- ${level.requirements.join('\n- ')}\n\n**Required Training Hours:** ${level.trainingHours}\n**Supervision Hours:** ${level.supervisionHours}\n**Recertification Period:** ${level.recertificationPeriod} year(s)`;
      
      suggestedActions = [
        { type: 'navigate', label: 'View CHW Profiles', target: '/chws/mock-profiles' },
        { type: 'navigate', label: 'Training Programs', target: '/training' }
      ];
    }
    // Check for certification requirements
    else if (message.includes('certification requirement') || message.includes('requirements')) {
      responseContent = `**WL4WJ CHW Certification Requirements**\n\n**Core Requirements:**\n- ${CERTIFICATION_REQUIREMENTS.core.join('\n- ')}\n\n**Recertification Requirements:**\n- ${CERTIFICATION_REQUIREMENTS.recertification.join('\n- ')}\n\n**Available Specializations:**\n- ${CERTIFICATION_REQUIREMENTS.specializations.join('\n- ')}`;
      
      suggestedActions = [
        { type: 'navigate', label: 'View CHW Profiles', target: '/chws/mock-profiles' },
        { type: 'navigate', label: 'Training Programs', target: '/training' }
      ];
    }
    // Check for career pathways
    else if (message.includes('career') || message.includes('job') || message.includes('advancement')) {
      responseContent = `**CHW Career Advancement Pathways**\n\n**Entry Level Positions:**\n- ${CAREER_PATHWAYS.entry.join('\n- ')}\n\n**Intermediate Level Positions:**\n- ${CAREER_PATHWAYS.intermediate.join('\n- ')}\n\n**Advanced Level Positions:**\n- ${CAREER_PATHWAYS.advanced.join('\n- ')}`;
      
      suggestedActions = [
        { type: 'navigate', label: 'View CHW Profiles', target: '/chws/mock-profiles' },
        { type: 'navigate', label: 'Training Programs', target: '/training' }
      ];
    }
    // Check for training programs
    else if (message.includes('training') || message.includes('program') || message.includes('course')) {
      const trainingInfo = TRAINING_PROGRAMS.map(program => 
        `**${program.name}**\nProvider: ${program.provider}\nHours: ${program.hours}\nFormat: ${program.format}\nLevels: ${program.levels.join(', ')}\n`
      ).join('\n');
      
      responseContent = `**WL4WJ CHW Training Programs**\n\n${trainingInfo}`;
      
      suggestedActions = [
        { type: 'navigate', label: 'View Training Calendar', target: '/training' },
        { type: 'navigate', label: 'Register for Training', target: '/training/register' }
      ];
    }
    // General overview of CHW levels
    else {
      responseContent = `**CHW Certification Levels (WL4WJ Standards)**\n\nThe WL4WJ CHW certification system has three levels:\n\n**1. Entry Level (${CHW_LEVELS.entry.trainingHours} training hours)**\n${CHW_LEVELS.entry.description}\n\n**2. Intermediate Level (${CHW_LEVELS.intermediate.trainingHours} training hours)**\n${CHW_LEVELS.intermediate.description}\n\n**3. Advanced Level (${CHW_LEVELS.advanced.trainingHours} training hours)**\n${CHW_LEVELS.advanced.description}\n\nYou can ask me for more details about any specific level, certification requirements, career pathways, or training programs.`;
      
      suggestedActions = [
        { type: 'navigate', label: 'View CHW Profiles', target: '/chws/mock-profiles' },
        { type: 'navigate', label: 'Certification Information', target: '/certification' }
      ];
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
