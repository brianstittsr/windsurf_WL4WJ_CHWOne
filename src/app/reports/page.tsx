'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, FileText, Eye, Trash2, Pencil, Share2, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import ConversationInterface from '@/components/Reports/ConversationInterface';
import ReportPreview from '@/components/Reports/ReportPreview';
import { Report, ReportConfig } from '@/types/bmad.types';
import { reportGenerationService } from '@/services/bmad/ReportGenerationService';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';

// Mock reports for development (kept for reference)
const mockReports_UNUSED: Report[] = [
  {
    id: 'report-1',
    config: {
      id: 'config-1',
      title: 'CHW Performance Analysis',
      description: 'Analysis of community health worker performance metrics',
      datasets: ['dataset-1'],
      sections: [
        {
          id: 'section-1',
          title: 'Executive Summary',
          content: 'This report analyzes the performance of community health workers based on key metrics including clients served, hours worked, and client satisfaction scores.',
          type: 'text',
          order: 0
        },
        {
          id: 'section-2',
          title: 'Performance Metrics',
          type: 'visualization',
          order: 1,
          visualizationId: 'viz-1'
        },
        {
          id: 'section-3',
          title: 'Key Findings',
          content: 'Based on the analysis, we found that CHWs who spent more time with fewer clients had higher satisfaction scores overall. The average satisfaction score was 4.2 out of 5.',
          type: 'summary',
          order: 2
        }
      ],
      visualizations: [
        {
          id: 'viz-1',
          type: 'bar',
          title: 'Average Clients Served per Month',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [
              {
                label: 'Clients Served',
                data: [42, 45, 48, 46, 52]
              }
            ]
          },
          datasetId: 'dataset-1',
          dimensions: ['month'],
          measures: ['clients_served']
        }
      ],
      status: 'complete',
      createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
      updatedAt: new Date(Date.now() - 86400000 * 5)
    },
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 5),
    userId: 'user-1',
    status: 'complete',
    pdfUrl: 'https://example.com/reports/report-1.pdf'
  },
  {
    id: 'report-2',
    config: {
      id: 'config-2',
      title: 'Community Health Needs Assessment',
      description: 'Analysis of community survey results and health outcomes',
      datasets: ['dataset-2', 'dataset-3'],
      sections: [
        {
          id: 'section-1',
          title: 'Introduction',
          content: 'This report presents the findings from our community health needs assessment survey combined with client health outcome data.',
          type: 'text',
          order: 0
        },
        {
          id: 'section-2',
          title: 'Survey Results',
          type: 'visualization',
          order: 1,
          visualizationId: 'viz-1'
        },
        {
          id: 'section-3',
          title: 'Health Outcomes by Region',
          type: 'visualization',
          order: 2,
          visualizationId: 'viz-2'
        }
      ],
      visualizations: [
        {
          id: 'viz-1',
          type: 'pie',
          title: 'Healthcare Access Scores',
          data: {
            labels: ['Low (1-3)', 'Medium (4-7)', 'High (8-10)'],
            datasets: [
              {
                data: [25, 45, 30]
              }
            ]
          },
          datasetId: 'dataset-3',
          dimensions: ['healthcare_access_score'],
          measures: ['count']
        },
        {
          id: 'viz-2',
          type: 'bar',
          title: 'Blood Pressure by Zip Code',
          data: {
            labels: ['28202', '28205', '28208', '28210'],
            datasets: [
              {
                label: 'Systolic',
                data: [125, 128, 132, 124]
              },
              {
                label: 'Diastolic',
                data: [82, 84, 86, 80]
              }
            ]
          },
          datasetId: 'dataset-2',
          dimensions: ['zip_code'],
          measures: ['blood_pressure_systolic', 'blood_pressure_diastolic']
        }
      ],
      status: 'complete',
      createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
      updatedAt: new Date(Date.now() - 86400000 * 8) // 8 days ago
    },
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 8),
    userId: 'user-1',
    status: 'complete',
    pdfUrl: 'https://example.com/reports/report-2.pdf'
  }
];

// Mock dataset IDs for development
const mockDatasetIds = ['dataset-1', 'dataset-2', 'dataset-3'];

// Inner component that uses the auth context
function ReportsContent() {
  const { currentUser, loading: authLoading } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);
  
  // Load reports
  useEffect(() => {
    const loadReports = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const reportsRef = collection(db, 'reports');
        const q = query(reportsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const fetchedReports: Report[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedReports.push({
            id: docSnap.id,
            config: data.config || {
              id: docSnap.id,
              title: data.title || 'Untitled Report',
              description: data.description || '',
              datasets: data.datasets || [],
              sections: data.sections || [],
              visualizations: data.visualizations || [],
              status: data.status || 'draft',
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            },
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            userId: data.userId || currentUser.uid,
            status: data.status || 'draft',
            pdfUrl: data.pdfUrl
          } as Report);
        });
        
        setReports(fetchedReports);
        console.log('Fetched reports:', fetchedReports.length);
      } catch (err) {
        console.error('Error loading reports:', err);
        setError(`Failed to load reports: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadReports();
  }, [currentUser]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleConfigUpdate = (config: ReportConfig) => {
    setReportConfig(config);
  };
  
  const handleGenerateReport = async (config: ReportConfig) => {
    if (!currentUser) {
      setNotification({
        message: 'Please sign in to generate reports',
        severity: 'error'
      });
      return;
    }

    try {
      // Create report data for Firestore
      const reportData = {
        config: {
          ...config,
          status: 'generating',
          updatedAt: serverTimestamp()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: currentUser.uid,
        status: 'generating'
      };
      
      // Save to Firestore
      const reportsRef = collection(db, 'reports');
      const docRef = await addDoc(reportsRef, reportData);
      
      // Create local report object
      const newReport: Report = {
        id: docRef.id,
        config: {
          ...config,
          status: 'generating',
          updatedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: currentUser.uid,
        status: 'generating'
      };
      
      // Add to reports list
      setReports(prev => [newReport, ...prev]);
      
      // Close create dialog
      setShowCreateDialog(false);
      
      // Show notification
      setNotification({
        message: 'Report generation started',
        severity: 'info'
      });
      
      // In a real implementation, we would call the report generation service
      // For now, we'll simulate a delay and then update the report status
      setTimeout(async () => {
        try {
          const reportRef = doc(db, 'reports', docRef.id);
          await addDoc(collection(reportRef, 'updates'), {
            status: 'complete',
            pdfUrl: `https://example.com/reports/${docRef.id}.pdf`,
            updatedAt: serverTimestamp()
          });

          setReports(prev => prev.map(r => 
            r.id === docRef.id 
              ? {
                  ...r,
                  status: 'complete',
                  config: {
                    ...r.config,
                    status: 'complete',
                    updatedAt: new Date()
                  },
                  updatedAt: new Date(),
                  pdfUrl: `https://example.com/reports/${r.id}.pdf`
                }
              : r
          ));
          
          setNotification({
            message: 'Report generated successfully',
            severity: 'success'
          });
        } catch (updateErr) {
          console.error('Error updating report status:', updateErr);
        }
      }, 3000);
    } catch (err) {
      console.error('Error generating report:', err);
      setNotification({
        message: `Failed to generate report: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };
  
  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
  };
  
  const handleDeleteReport = async (report: Report) => {
    if (!confirm(`Are you sure you want to delete report "${report.config.title}"?`)) {
      return;
    }

    try {
      const reportRef = doc(db, 'reports', report.id);
      await deleteDoc(reportRef);
      
      setReports(prev => prev.filter(r => r.id !== report.id));
      setNotification({
        message: `Report "${report.config.title}" deleted successfully`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting report:', err);
      setNotification({
        message: `Failed to delete report: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };
  
  const handleEditReport = (report: Report) => {
    // In a real implementation, we would show an edit dialog
    setNotification({
      message: `Report editing not implemented yet`,
      severity: 'info'
    });
  };
  
  const handleShareReport = (report: Report) => {
    // In a real implementation, we would show a share dialog
    setNotification({
      message: `Report sharing not implemented yet`,
      severity: 'info'
    });
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#86868B] text-sm">Loading Reports...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  if (!currentUser) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-[#FF9500]" />
            <p className="text-sm font-medium text-[#FF9500]">Please log in to access reports</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const tabs = ['All Reports', 'My Reports', 'Shared with Me'];
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Apple-style Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#FF2D55] rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Reports</h1>
              <p className="text-[#6E6E73]">Generate and manage data reports</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#0071E3] text-white rounded-xl font-medium text-sm hover:bg-[#0077ED] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Report
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center justify-between p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#FF3B30]" />
              <p className="text-sm font-medium text-[#FF3B30]">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-[#FF3B30] hover:text-[#FF3B30]/70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Apple-style Tabs */}
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-2">
          <div className="flex gap-1">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setTabValue(index)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tabValue === index
                    ? 'bg-[#0071E3] text-white'
                    : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.length > 0 ? (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-semibold text-[#1D1D1F] truncate flex-1 mr-2">
                        {report.config.title || 'Untitled Report'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'complete' ? 'bg-[#34C759]/10 text-[#34C759]' :
                        report.status === 'generating' ? 'bg-[#0071E3]/10 text-[#0071E3]' :
                        report.status === 'error' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' :
                        'bg-[#86868B]/10 text-[#86868B]'
                      }`}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                    
                    {report.config.description && (
                      <p className="text-sm text-[#6E6E73] mb-3 line-clamp-2">
                        {report.config.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {report.config.datasets?.map((datasetId, index) => (
                        <span key={index} className="px-2 py-0.5 bg-[#F5F5F7] text-[#6E6E73] text-xs rounded-full">
                          Dataset {index + 1}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between text-xs text-[#86868B]">
                      <span>Created: {formatDate(report.createdAt)}</span>
                      <span>Updated: {formatDate(report.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="px-5 py-3 bg-[#F5F5F7] border-t border-[#D2D2D7] flex items-center gap-2">
                    <button
                      onClick={() => handleViewReport(report)}
                      disabled={report.status === 'generating'}
                      className="p-2 rounded-lg hover:bg-white text-[#6E6E73] hover:text-[#0071E3] transition-colors disabled:opacity-50"
                      title="View Report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditReport(report)}
                      disabled={report.status === 'generating'}
                      className="p-2 rounded-lg hover:bg-white text-[#6E6E73] hover:text-[#0071E3] transition-colors disabled:opacity-50"
                      title="Edit Report"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShareReport(report)}
                      disabled={report.status === 'generating'}
                      className="p-2 rounded-lg hover:bg-white text-[#6E6E73] hover:text-[#0071E3] transition-colors disabled:opacity-50"
                      title="Share Report"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1" />
                    {report.pdfUrl && (
                      <a
                        href={report.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-white text-[#6E6E73] hover:text-[#0071E3] transition-colors"
                        title="Download PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteReport(report)}
                      className="p-2 rounded-lg hover:bg-white text-[#6E6E73] hover:text-[#FF3B30] transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-[#86868B]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-1">No reports available</h3>
                <p className="text-sm text-[#6E6E73]">Create a report to get started</p>
              </div>
            )}
          </div>
        )}

        {/* Create Report Dialog - Apple Style */}
        {showCreateDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateDialog(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[600px] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D2D2D7]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF2D55] rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1D1D1F]">Create Report</h2>
                    <p className="text-sm text-[#6E6E73]">Generate a new data report</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="p-2 rounded-xl hover:bg-[#F5F5F7] text-[#6E6E73] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-[calc(100%-80px)] overflow-hidden">
                <ConversationInterface
                  onConfigUpdate={handleConfigUpdate}
                  onGenerateReport={handleGenerateReport}
                  availableDatasetIds={mockDatasetIds}
                />
              </div>
            </div>
          </div>
        )}

        {/* Report Preview Dialog - Apple Style */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedReport(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
              <ReportPreview
                report={selectedReport}
                onEdit={() => {
                  setSelectedReport(null);
                  setReportConfig(selectedReport.config);
                  setShowCreateDialog(true);
                }}
                onClose={() => setSelectedReport(null)}
              />
            </div>
          </div>
        )}

        {/* Notification Toast - Apple Style */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
              notification.severity === 'success' ? 'bg-[#34C759] text-white' :
              notification.severity === 'error' ? 'bg-[#FF3B30] text-white' :
              'bg-[#0071E3] text-white'
            }`}>
              {notification.severity === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.severity === 'error' && <AlertCircle className="w-5 h-5" />}
              {notification.severity === 'info' && <Info className="w-5 h-5" />}
              <p className="text-sm font-medium">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function ReportsPage() {
  return (
    <AuthProvider>
      <ReportsContent />
    </AuthProvider>
  );
}
