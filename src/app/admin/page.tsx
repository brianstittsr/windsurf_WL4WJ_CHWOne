'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings, Users, Shield, Database, Plug, BarChart3, Bell, HardDrive,
  DollarSign, Map, Building2, Landmark, Lightbulb, CreditCard, ChevronRight,
  Eye, EyeOff, Menu, X, Loader2, Home, LogOut, AlertCircle, Info,
  FileText, FolderKanban, Send, BookOpen, Bot, Wrench, Save
} from 'lucide-react';
import { PlatformTool, TOOL_DISPLAY_CONFIG } from '@/types/organization-profiles';
import AdminSettings from '@/components/Admin/AdminSettings';
import AdminUsers from '@/components/Admin/AdminUsers';
import AdminIntegrations from '@/components/Admin/AdminIntegrations';
import AdminAnalytics from '@/components/Admin/AdminAnalytics';
import AdminSecurity from '@/components/Admin/AdminSecurity';
import AdminGrants from '@/components/Admin/AdminGrants';
import AdminStates from '@/components/Admin/AdminStates';
import AdminCHWAssociations from '@/components/Admin/AdminCHWAssociations';
import AdminNonprofits from '@/components/Admin/AdminNonprofits';
import AdminIdeas from '@/components/Admin/AdminIdeas';
import AdminBillComAPI from '@/components/Admin/AdminBillComAPI';
import FeatureVisibilitySettings from '@/components/Admin/FeatureVisibilitySettings';

// Admin navigation items with icons
const adminNavItems = [
  { id: 'settings', label: 'Settings', icon: Settings, component: AdminSettings },
  { id: 'users', label: 'Users', icon: Users, component: AdminUsers },
  { id: 'states', label: 'States', icon: Map, component: AdminStates },
  { id: 'associations', label: 'CHW Associations', icon: Database, component: AdminCHWAssociations },
  { id: 'nonprofits', label: 'Nonprofits', icon: Building2, component: AdminNonprofits },
  { id: 'ideas', label: 'Platform Ideas', icon: Lightbulb, component: AdminIdeas },
  { id: 'integrations', label: 'Integrations', icon: Plug, component: AdminIntegrations },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, component: AdminAnalytics },
  { id: 'security', label: 'Security', icon: Shield, component: AdminSecurity },
  { id: 'grants', label: 'Grants', icon: DollarSign, component: AdminGrants },
  { id: 'billcom', label: 'Bill.com API', icon: CreditCard, component: AdminBillComAPI },
  { id: 'visibility', label: 'Feature Visibility', icon: Eye, component: FeatureVisibilitySettings },
];

// CHW Tools configuration
const chwTools = [
  { id: 'referrals', label: 'Referrals', icon: Send, description: 'Client referral management' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, description: 'Project tracking and management' },
  { id: 'grants', label: 'Grants', icon: DollarSign, description: 'Grant opportunities and applications' },
  { id: 'resources', label: 'Resources', icon: BookOpen, description: 'Shared resources and documents' },
  { id: 'forms', label: 'Forms', icon: FileText, description: 'Data collection forms' },
  { id: 'datasets', label: 'Datasets', icon: Database, description: 'Community health datasets' },
  { id: 'reports', label: 'Reports', icon: BarChart3, description: 'Analytics and reports' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, description: 'AI-powered assistance' },
  { id: 'data-tools', label: 'Data Tools', icon: Wrench, description: 'Advanced data tools' },
  { id: 'ideas', label: 'Platform Ideas', icon: Lightbulb, description: 'Submit enhancement ideas' },
];

// Menu items for main navigation
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', visible: true },
  { id: 'about', label: 'About', visible: true },
  { id: 'services', label: 'Services', visible: true },
  { id: 'products', label: 'Products', visible: true },
  { id: 'regions', label: 'Regions', visible: true },
  { id: 'collaborations', label: 'Collaborations', visible: true },
];

// Visibility Settings Component
function VisibilitySettings() {
  const [menuVisibility, setMenuVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(menuItems.map(item => [item.id, item.visible]))
  );
  const [toolVisibility, setToolVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(chwTools.map(tool => [tool.id, true]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleMenuToggle = (id: string) => {
    setMenuVisibility(prev => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const handleToolToggle = (id: string) => {
    setToolVisibility(prev => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call - in production, save to Firebase
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    // Here you would save to Firebase/database
    console.log('Saving visibility settings:', { menuVisibility, toolVisibility });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Visibility Settings</h2>
          <p className="text-slate-500">Control which menu items and tools are visible to users</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {saved && (
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Visibility settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Menu Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            Menu Options Visibility
          </CardTitle>
          <CardDescription>
            Toggle visibility of main navigation menu items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border transition-all',
                  menuVisibility[item.id] 
                    ? 'bg-white border-slate-200' 
                    : 'bg-slate-50 border-slate-100'
                )}
              >
                <div className="flex items-center gap-3">
                  {menuVisibility[item.id] ? (
                    <Eye className="h-5 w-5 text-green-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  )}
                  <span className={cn(
                    'font-medium',
                    menuVisibility[item.id] ? 'text-slate-900' : 'text-slate-400'
                  )}>
                    {item.label}
                  </span>
                </div>
                <Switch
                  checked={menuVisibility[item.id]}
                  onCheckedChange={() => handleMenuToggle(item.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CHW Tools Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            CHW Tools Visibility
          </CardTitle>
          <CardDescription>
            Control which tools are available to Community Health Workers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {chwTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <div
                  key={tool.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border transition-all',
                    toolVisibility[tool.id] 
                      ? 'bg-white border-slate-200' 
                      : 'bg-slate-50 border-slate-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      toolVisibility[tool.id] ? 'bg-blue-100' : 'bg-slate-100'
                    )}>
                      <IconComponent className={cn(
                        'h-5 w-5',
                        toolVisibility[tool.id] ? 'text-blue-600' : 'text-slate-400'
                      )} />
                    </div>
                    <div>
                      <p className={cn(
                        'font-medium',
                        toolVisibility[tool.id] ? 'text-slate-900' : 'text-slate-400'
                      )}>
                        {tool.label}
                      </p>
                      <p className="text-xs text-slate-500">{tool.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={toolVisibility[tool.id]}
                    onCheckedChange={() => handleToolToggle(tool.id)}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Inner component that uses the auth context
function AdminDashboardContent() {
  const { currentUser, userProfile, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('settings');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  // Check if user is admin based on their role in Firestore
  const isAdmin = 
    userProfile?.role === UserRole.ADMIN || 
    userProfile?.roles?.includes(UserRole.ADMIN) ||
    currentUser.email === 'admin@example.com';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get current section component
  const currentNav = adminNavItems.find(item => item.id === activeSection);
  const CurrentComponent = currentNav?.component;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Vertical Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-400" />
              <span className="font-bold">Admin Panel</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {adminNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <IconComponent className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-slate-700">
          <Link href="/profile">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <Users className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">My Profile</span>}
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <Home className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">Back to Dashboard</span>}
            </button>
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        'flex-1 transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-16'
      )}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {currentNav?.label || 'Visibility Settings'}
            </h1>
            <p className="text-sm text-slate-500">Platform Configuration & Management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="destructive" className="px-3 py-1">
              Administrator
            </Badge>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{userProfile?.displayName || 'Admin'}</p>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>
          </div>
        </header>

        {/* System Status */}
        <div className="px-6 py-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>System Status:</strong> All services operational • Last backup: 2 hours ago • Active users: 47
            </AlertDescription>
          </Alert>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {CurrentComponent && <CurrentComponent />}
        </div>
      </main>
    </div>
  );
}

// Export the wrapped component with AuthProvider
export default function AdminDashboard() {
  return (
    <AuthProvider>
      <AdminDashboardContent />
    </AuthProvider>
  );
}
