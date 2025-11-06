import { useAuth } from '@/contexts/AuthContext';
import { 
  PlatformTool, 
  OrganizationType, 
  AccessLevel,
  hasToolAccess,
  getAvailableToolsForOrgType,
  TOOL_DISPLAY_CONFIG
} from '@/types/organization-profiles';

/**
 * Custom hook for checking tool permissions based on the current user's organization type
 */
export function useToolPermissions() {
  const { userProfile } = useAuth();
  
  // Default to CHW if no organization type is specified
  const orgType = userProfile?.organizationType || OrganizationType.CHW;
  
  /**
   * Check if the user can access a specific tool
   * @param tool The tool to check access for
   * @param requiredLevel The minimum access level required
   * @returns Whether the user has the required access level
   */
  const canAccessTool = (
    tool: PlatformTool, 
    requiredLevel: AccessLevel = AccessLevel.VIEW
  ): boolean => {
    return hasToolAccess(orgType, tool, requiredLevel);
  };
  
  /**
   * Get all tools the user has access to
   * @returns Array of tools the user can access
   */
  const availableTools = (): PlatformTool[] => {
    return getAvailableToolsForOrgType(orgType);
  };
  
  /**
   * Get tools grouped by category
   * @returns Object with tools grouped by category
   */
  const toolsByCategory = (): Record<string, PlatformTool[]> => {
    const tools = availableTools();
    const categorized: Record<string, PlatformTool[]> = {};
    
    tools.forEach(tool => {
      const category = TOOL_DISPLAY_CONFIG[tool].category;
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(tool);
    });
    
    return categorized;
  };
  
  return {
    canAccessTool,
    availableTools,
    toolsByCategory,
    organizationType: orgType
  };
}

export default useToolPermissions;
