/**
 * Organization Profile Types and Permissions Schema
 * 
 * This file defines the organization types and their associated tool permissions
 * for the role-based navigation and dashboard system.
 */

/**
 * Available tools in the system
 */
export enum PlatformTool {
  REFERRALS = 'referrals',
  PROJECTS = 'projects',
  GRANTS = 'grants',
  RESOURCES = 'resources',
  FORMS = 'forms',
  DATASETS = 'datasets',
  REPORTS = 'reports',
  AI_ASSISTANT = 'ai-assistant',
  DATA_TOOLS = 'data-tools',
  IDEAS = 'ideas'
}

/**
 * Organization types supported in the system
 */
export enum OrganizationType {
  CHW = 'CHW',
  NONPROFIT = 'Nonprofit',
  CHW_ASSOCIATION = 'CHWAssociation',
  STATE = 'State',
  ADMIN = 'Admin' // Special type for platform administrators
}

/**
 * Access levels for tools
 */
export enum AccessLevel {
  NONE = 'none',
  VIEW = 'view',
  EDIT = 'edit',
  ADMIN = 'admin'
}

/**
 * Interface for tool permission
 */
export interface ToolPermission {
  access: boolean;
  level: AccessLevel;
}

/**
 * Permission set for an organization type
 */
export interface OrganizationPermissionSet {
  [key: string]: ToolPermission;
}

/**
 * Default permissions by organization type
 */
export const DEFAULT_PERMISSIONS: Record<OrganizationType, OrganizationPermissionSet> = {
  [OrganizationType.CHW]: {
    [PlatformTool.REFERRALS]: { access: true, level: AccessLevel.EDIT },
    [PlatformTool.PROJECTS]: { access: true, level: AccessLevel.VIEW },
    [PlatformTool.GRANTS]: { access: true, level: AccessLevel.VIEW },
    [PlatformTool.RESOURCES]: { access: true, level: AccessLevel.VIEW },
    [PlatformTool.FORMS]: { access: true, level: AccessLevel.EDIT },
    [PlatformTool.DATASETS]: { access: true, level: AccessLevel.VIEW },
    [PlatformTool.REPORTS]: { access: true, level: AccessLevel.VIEW },
    [PlatformTool.AI_ASSISTANT]: { access: true, level: AccessLevel.EDIT },
    [PlatformTool.DATA_TOOLS]: { access: true, level: AccessLevel.VIEW },
    [PlatformTool.IDEAS]: { access: true, level: AccessLevel.EDIT }
  },
  [OrganizationType.NONPROFIT]: {
    [PlatformTool.REFERRALS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.PROJECTS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.GRANTS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.RESOURCES]: { access: true, level: AccessLevel.EDIT },
    [PlatformTool.FORMS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.DATASETS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.REPORTS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.AI_ASSISTANT]: { access: true, level: AccessLevel.EDIT },
    [PlatformTool.DATA_TOOLS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.IDEAS]: { access: true, level: AccessLevel.EDIT }
  },
  [OrganizationType.CHW_ASSOCIATION]: {
    [PlatformTool.REFERRALS]: { access: false, level: AccessLevel.NONE },
    [PlatformTool.PROJECTS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.GRANTS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.RESOURCES]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.FORMS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.DATASETS]: { access: false, level: AccessLevel.NONE },
    [PlatformTool.REPORTS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.AI_ASSISTANT]: { access: true, level: AccessLevel.EDIT },
    [PlatformTool.DATA_TOOLS]: { access: false, level: AccessLevel.NONE },
    [PlatformTool.IDEAS]: { access: true, level: AccessLevel.EDIT }
  },
  [OrganizationType.STATE]: {
    [PlatformTool.REFERRALS]: { access: false, level: AccessLevel.NONE },
    [PlatformTool.PROJECTS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.GRANTS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.RESOURCES]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.FORMS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.DATASETS]: { access: false, level: AccessLevel.NONE },
    [PlatformTool.REPORTS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.AI_ASSISTANT]: { access: true, level: AccessLevel.EDIT },
    [PlatformTool.DATA_TOOLS]: { access: false, level: AccessLevel.NONE },
    [PlatformTool.IDEAS]: { access: true, level: AccessLevel.ADMIN }
  },
  [OrganizationType.ADMIN]: {
    [PlatformTool.REFERRALS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.PROJECTS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.GRANTS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.RESOURCES]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.FORMS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.DATASETS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.REPORTS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.AI_ASSISTANT]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.DATA_TOOLS]: { access: true, level: AccessLevel.ADMIN },
    [PlatformTool.IDEAS]: { access: true, level: AccessLevel.ADMIN }
  }
};

/**
 * Tool display configuration by organization type
 */
export interface ToolDisplayConfig {
  label: string;
  icon: string;
  description: string;
  category: 'core' | 'data' | 'communication' | 'admin';
  priority: number; // Higher number = higher priority in display order
}

/**
 * Configuration for how tools are displayed in the UI
 */
export const TOOL_DISPLAY_CONFIG: Record<PlatformTool, ToolDisplayConfig> = {
  [PlatformTool.REFERRALS]: {
    label: 'Referrals',
    icon: 'openLink',
    description: 'Manage client referrals to services and programs',
    category: 'core',
    priority: 100
  },
  [PlatformTool.PROJECTS]: {
    label: 'Projects',
    icon: 'sparkle',
    description: 'View and manage community health projects',
    category: 'core',
    priority: 90
  },
  [PlatformTool.GRANTS]: {
    label: 'Grants',
    icon: 'security',
    description: 'Access grant opportunities and applications',
    category: 'core',
    priority: 80
  },
  [PlatformTool.RESOURCES]: {
    label: 'Resources',
    icon: 'search',
    description: 'Access shared resources and documents',
    category: 'core',
    priority: 70
  },
  [PlatformTool.FORMS]: {
    label: 'Forms',
    icon: 'clipboard',
    description: 'Create and manage data collection forms',
    category: 'data',
    priority: 60
  },
  [PlatformTool.DATASETS]: {
    label: 'Datasets',
    icon: 'database',
    description: 'Access and manage community health datasets',
    category: 'data',
    priority: 50
  },
  [PlatformTool.REPORTS]: {
    label: 'Reports',
    icon: 'analytics',
    description: 'Generate and view reports on community health',
    category: 'data',
    priority: 40
  },
  [PlatformTool.AI_ASSISTANT]: {
    label: 'AI Assistant',
    icon: 'chat',
    description: 'Get AI-powered assistance for your work',
    category: 'communication',
    priority: 30
  },
  [PlatformTool.DATA_TOOLS]: {
    label: 'Data Tools',
    icon: 'build',
    description: 'Advanced data analysis and visualization tools',
    category: 'data',
    priority: 20
  },
  [PlatformTool.IDEAS]: {
    label: 'Platform Ideas',
    icon: 'lightbulb',
    description: 'Submit and vote on platform enhancement ideas',
    category: 'communication',
    priority: 10
  }
};

/**
 * Get available tools for a specific organization type
 */
export function getAvailableToolsForOrgType(orgType: OrganizationType): PlatformTool[] {
  const permissions = DEFAULT_PERMISSIONS[orgType];
  
  if (!permissions) return [];
  
  return Object.keys(permissions)
    .filter(tool => permissions[tool].access)
    .map(tool => tool as PlatformTool)
    .sort((a, b) => {
      return TOOL_DISPLAY_CONFIG[b].priority - TOOL_DISPLAY_CONFIG[a].priority;
    });
}

/**
 * Check if a user has access to a specific tool
 */
export function hasToolAccess(
  orgType: OrganizationType,
  tool: PlatformTool,
  requiredLevel: AccessLevel = AccessLevel.VIEW
): boolean {
  const permissions = DEFAULT_PERMISSIONS[orgType];
  
  if (!permissions || !permissions[tool]) {
    return false;
  }
  
  if (!permissions[tool].access) {
    return false;
  }
  
  const levelHierarchy = {
    [AccessLevel.NONE]: 0,
    [AccessLevel.VIEW]: 1,
    [AccessLevel.EDIT]: 2,
    [AccessLevel.ADMIN]: 3
  };
  
  return levelHierarchy[permissions[tool].level] >= levelHierarchy[requiredLevel];
}
