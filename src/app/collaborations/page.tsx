'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Handshake, Calendar, Users, Eye, Building2, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/Layout/AdminLayout';
import { Grant } from '@/lib/schema/unified-schema';

interface CollaborationCardData {
  id: string;
  grantTitle: string;
  grantDescription: string;
  startDate: Date;
  endDate: Date;
  status: string;
  organizations: {
    name: string;
    role: string;
    logoUrl?: string;
  }[];
  progress: number;
  fundingAmount: number;
}

function CollaborationsContent() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [collaborations, setCollaborations] = useState<CollaborationCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
      return;
    }

    if (currentUser) {
      fetchCollaborations();
    }
  }, [currentUser, authLoading, router]);

  const fetchCollaborations = async () => {
    try {
      // Fetch grants from Firebase
      const { getGrants } = await import('@/lib/schema/data-access');
      const result = await getGrants();

      if (result.success && result.grants) {
        // Transform grants into collaboration cards
        const collabData: CollaborationCardData[] = result.grants.map((grant: any) => {
          // Normalize grant data to handle both naming conventions
          const grantTitle = grant.title || grant.name || 'Untitled Grant';
          const grantDescription = grant.description || '';
          const fundingAmount = grant.amount || grant.totalBudget || 0;
          const fundingSource = grant.fundingSource || 'Unknown Funder';
          
          // Parse dates - handle both Timestamp and string formats
          const parseDate = (date: any): Date => {
            if (!date) return new Date();
            if (date.toDate && typeof date.toDate === 'function') {
              return date.toDate();
            }
            if (typeof date === 'string') {
              return new Date(date);
            }
            if (date instanceof Date) {
              return date;
            }
            return new Date();
          };
          
          const startDate = parseDate(grant.startDate);
          const endDate = parseDate(grant.endDate);
          
          // Extract collaborating entities from the grant
          const entities = grant.collaboratingEntities || [];
          const organizations = entities.length > 0 
            ? entities.map((entity: any) => ({
                name: entity.name || 'Unknown Organization',
                role: entity.role || 'partner',
                logoUrl: entity.logoUrl
              }))
            : [
                { name: fundingSource, role: 'lead' },
                { name: 'Partner Organization', role: 'partner' }
              ];

          // Calculate progress based on milestones or dates
          const milestones = grant.projectMilestones || [];
          const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;
          const progress = milestones.length > 0 
            ? Math.round((completedMilestones / milestones.length) * 100)
            : calculateDateProgress(startDate, endDate);

          return {
            id: grant.id,
            grantTitle,
            grantDescription,
            startDate,
            endDate,
            status: grant.status || 'draft',
            organizations,
            progress,
            fundingAmount
          };
        });

        setCollaborations(collabData);
      }
    } catch (error) {
      console.error('Error fetching collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDateProgress = (startDate?: Date, endDate?: Date): number => {
    if (!startDate || !endDate) return 0;
    const now = new Date();
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'lead': return '#1976d2';
      case 'partner': return '#2e7d32';
      case 'evaluator': return '#ed6c02';
      case 'stakeholder': return '#9c27b0';
      default: return '#757575';
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#86868B] text-sm">Loading Collaborations...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Apple-style Page Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#5856D6] rounded-2xl flex items-center justify-center">
            <Handshake className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Collaborations</h1>
            <p className="text-[#6E6E73]">View and manage grant collaborations between organizations</p>
          </div>
        </div>

        {/* Collaborations Grid */}
        {collaborations.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-[#0071E3]/10 border border-[#0071E3]/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-[#0071E3]" />
            <p className="text-sm font-medium text-[#0071E3]">
              No collaborations found. Create a grant using the Grant Analyzer to start a new collaboration.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {collaborations.map((collab) => (
              <div
                key={collab.id}
                className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="p-5">
                  {/* Status and Title */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-[#1D1D1F] flex-1 mr-2">
                      {collab.grantTitle}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      collab.status === 'active' ? 'bg-[#34C759]/10 text-[#34C759]' :
                      collab.status === 'pending' ? 'bg-[#FF9500]/10 text-[#FF9500]' :
                      collab.status === 'completed' ? 'bg-[#0071E3]/10 text-[#0071E3]' :
                      'bg-[#86868B]/10 text-[#86868B]'
                    }`}>
                      {collab.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#6E6E73] mb-4 line-clamp-2">
                    {collab.grantDescription || 'No description available. Upload a grant document to populate details.'}
                  </p>

                  {/* Collaborating Organizations */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-[#86868B]" />
                      <span className="text-sm font-medium text-[#1D1D1F]">Collaborating Organizations</span>
                    </div>
                    <div className="space-y-2">
                      {collab.organizations.slice(0, 3).map((org, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-[#F5F5F7] rounded-lg">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: getRoleColor(org.role) }}
                          >
                            {org.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#1D1D1F]">{org.name}</p>
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: getRoleColor(org.role) }}
                            >
                              {org.role}
                            </span>
                          </div>
                        </div>
                      ))}
                      {collab.organizations.length > 3 && (
                        <p className="text-xs text-[#86868B]">+{collab.organizations.length - 3} more organizations</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#D2D2D7] pt-4">
                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#86868B]" />
                        <div>
                          <p className="text-xs text-[#86868B]">Start Date</p>
                          <p className="text-sm font-medium text-[#1D1D1F]">{collab.startDate.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#86868B]" />
                        <div>
                          <p className="text-xs text-[#86868B]">End Date</p>
                          <p className="text-sm font-medium text-[#1D1D1F]">{collab.endDate.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-[#86868B]">Progress</span>
                        <span className="text-xs font-semibold text-[#1D1D1F]">{collab.progress}%</span>
                      </div>
                      <div className="h-2 bg-[#E5E5EA] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            collab.progress >= 75 ? 'bg-[#34C759]' :
                            collab.progress >= 50 ? 'bg-[#0071E3]' :
                            collab.progress >= 25 ? 'bg-[#FF9500]' : 'bg-[#FF3B30]'
                          }`}
                          style={{ width: `${collab.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Funding Amount */}
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#86868B]" />
                      <span className="text-sm text-[#1D1D1F]">
                        <strong>Funding:</strong> ${collab.fundingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-5 py-3 bg-[#F5F5F7] border-t border-[#D2D2D7]">
                  <button
                    onClick={() => router.push(`/collaborations/${collab.id}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0071E3] text-white rounded-xl font-medium text-sm hover:bg-[#0077ED] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Collaboration
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function CollaborationsPage() {
  return (
    <AuthProvider>
      <CollaborationsContent />
    </AuthProvider>
  );
}
