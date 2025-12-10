import { UserRole, OrganizationType, UserProfile } from '@/types/firebase/schema';

/**
 * Maps a user role to the most appropriate organization type
 * @param role User role from UserRole enum
 * @returns Corresponding OrganizationType
 */
export function mapRoleToOrganizationType(role: UserRole): OrganizationType {
  switch(role) {
    case UserRole.ADMIN:
      return OrganizationType.ADMIN;
    case UserRole.CHW:
      return OrganizationType.CHW;
    case UserRole.CHW_ASSOCIATION:
      return OrganizationType.CHW_ASSOCIATION;
    case UserRole.NONPROFIT_STAFF:
      return OrganizationType.NONPROFIT;
    default:
      return OrganizationType.CHW; // Default to CHW if unknown
  }
}

/**
 * Determines the organization type based on user profile
 * Uses the explicit organizationType if available, otherwise infers from role
 * @param userProfile User profile
 * @returns The organization type
 */
export function determineOrganizationType(userProfile: UserProfile | null): OrganizationType | undefined {
  if (!userProfile) return undefined;
  
  // If organizationType is explicitly set, use that
  if (userProfile.organizationType) {
    return userProfile.organizationType;
  }
  
  // Otherwise infer from role
  return mapRoleToOrganizationType(userProfile.role);
}

/**
 * Updates a user profile with the appropriate organization type if not set
 * This is useful for migrating existing users
 * @param profile User profile to update
 * @returns Updated user profile with organizationType
 */
export function ensureOrganizationType(profile: UserProfile): UserProfile {
  if (!profile.organizationType) {
    return {
      ...profile,
      organizationType: mapRoleToOrganizationType(profile.role)
    };
  }
  return profile;
}

/**
 * Returns a user-friendly display name for the organization type
 * @param orgType Organization type
 * @returns User-friendly display name
 */
export function getOrganizationTypeDisplayName(orgType?: OrganizationType): string {
  switch(orgType) {
    case OrganizationType.CHW:
      return 'Community Health Worker';
    case OrganizationType.NONPROFIT:
      return 'Nonprofit Organization';
    case OrganizationType.CHW_ASSOCIATION:
      return 'CHW Association';
    case OrganizationType.STATE:
      return 'State Agency';
    case OrganizationType.ADMIN:
      return 'Platform Administrator';
    default:
      return 'User';
  }
}
