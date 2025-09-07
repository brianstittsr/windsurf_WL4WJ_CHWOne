import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';
import { AuditLog } from '@/types/platform.types';

export class AuditLogger {
  static async log(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    changes?: Record<string, any>,
    request?: Request
  ): Promise<void> {
    try {
      const auditLog: Omit<AuditLog, 'id'> = {
        userId,
        action,
        resourceType,
        resourceId,
        changes,
        ipAddress: this.getClientIP(request),
        userAgent: this.getUserAgent(request),
        timestamp: new Date()
      };

      await addDoc(collection(db, 'auditLogs'), auditLog);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  private static getClientIP(request?: Request): string {
    if (!request) return 'unknown';
    
    // Check various headers for client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = request.headers.get('x-client-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    return realIP || clientIP || 'unknown';
  }

  private static getUserAgent(request?: Request): string {
    if (!request) return 'unknown';
    return request.headers.get('user-agent') || 'unknown';
  }

  // Specific audit methods for common operations
  static async logLogin(userId: string, request?: Request): Promise<void> {
    await this.log(userId, 'LOGIN', 'user', userId, undefined, request);
  }

  static async logLogout(userId: string, request?: Request): Promise<void> {
    await this.log(userId, 'LOGOUT', 'user', userId, undefined, request);
  }

  static async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    request?: Request
  ): Promise<void> {
    await this.log(userId, 'DATA_ACCESS', resourceType, resourceId, undefined, request);
  }

  static async logDataModification(
    userId: string,
    resourceType: string,
    resourceId: string,
    changes: Record<string, any>,
    request?: Request
  ): Promise<void> {
    await this.log(userId, 'DATA_MODIFY', resourceType, resourceId, changes, request);
  }

  static async logDataExport(
    userId: string,
    resourceType: string,
    resourceId: string,
    exportFormat: string,
    request?: Request
  ): Promise<void> {
    await this.log(
      userId,
      'DATA_EXPORT',
      resourceType,
      resourceId,
      { exportFormat },
      request
    );
  }

  static async logHIPAAAccess(
    userId: string,
    clientId: string,
    accessReason: string,
    request?: Request
  ): Promise<void> {
    await this.log(
      userId,
      'HIPAA_ACCESS',
      'client',
      clientId,
      { accessReason, hipaaProtected: true },
      request
    );
  }

  static async logAPIAccess(
    userId: string,
    endpoint: string,
    method: string,
    apiKeyId: string,
    request?: Request
  ): Promise<void> {
    await this.log(
      userId,
      'API_ACCESS',
      'api',
      endpoint,
      { method, apiKeyId },
      request
    );
  }
}

// Middleware function for Next.js API routes
export function withAuditLogging(
  handler: (req: Request, context: any) => Promise<Response>
) {
  return async (req: Request, context: any): Promise<Response> => {
    const startTime = Date.now();
    
    try {
      const response = await handler(req, context);
      
      // Log successful API access
      const userId = req.headers.get('x-user-id') || 'anonymous';
      const endpoint = new URL(req.url).pathname;
      
      await AuditLogger.logAPIAccess(
        userId,
        endpoint,
        req.method,
        req.headers.get('x-api-key-id') || 'unknown',
        req
      );
      
      return response;
    } catch (error) {
      // Log failed API access
      const userId = req.headers.get('x-user-id') || 'anonymous';
      const endpoint = new URL(req.url).pathname;
      
      await AuditLogger.log(
        userId,
        'API_ERROR',
        'api',
        endpoint,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req
      );
      
      throw error;
    }
  };
}

// React hook for client-side audit logging
export function useAuditLogger() {
  const logAction = async (
    action: string,
    resourceType: string,
    resourceId: string,
    changes?: Record<string, any>
  ) => {
    try {
      // Get current user from auth context
      const userId = 'current-user-id'; // This should come from auth context
      
      await AuditLogger.log(userId, action, resourceType, resourceId, changes);
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  };

  return { logAction };
}
