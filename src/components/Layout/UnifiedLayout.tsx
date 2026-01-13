'use client';

import React, { useState } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { UserRole, OrganizationType } from '@/types/firebase/schema';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Map, Heart, Settings, Users, FolderKanban, 
  DollarSign, Handshake, FileText, Database, BarChart3, User,
  Menu, X, LogOut, ChevronRight, Home, Bell, Shield, Search,
  Briefcase, UserCog, Send, Bot, Wrench, Lightbulb, MapPin,
  ClipboardList, Building2, ChevronDown, ChevronUp
} from 'lucide-react';
import AdminRoleSwitcher from '@/components/Admin/AdminRoleSwitcher';

interface UnifiedLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

// Navigation section type
interface NavSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  roles?: UserRole[];
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles?: UserRole[];
}

// Inner component that uses the auth context
function UnifiedLayoutContent({ children, fullWidth = false }: UnifiedLayoutProps) {
  const { currentUser, userProfile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  
  const isHomePage = pathname === '/';

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  // Normalize role to uppercase for comparison
  const userRole = userProfile?.role?.toUpperCase() as UserRole | undefined;

  // Define navigation sections
  const navSections: NavSection[] = [
    // Profile Section - Available to all logged in users
    {
      title: 'Profile',
      icon: User,
      items: [
        { href: '/profile', icon: User, label: 'My Profile' },
        { href: '/settings', icon: Settings, label: 'Settings' },
        { href: '/profile-management', icon: UserCog, label: 'Manage Profiles', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF, UserRole.CHW] },
      ],
    },
    // Work Section - CHW Tools based on user type
    {
      title: 'Work',
      icon: Briefcase,
      items: [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] },
        { href: '/referrals', icon: Send, label: 'Referrals', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF, UserRole.CHW] },
        { href: '/projects', icon: FolderKanban, label: 'Projects', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] },
        { href: '/grants', icon: DollarSign, label: 'Grants', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] },
        { href: '/forms', icon: FileText, label: 'Forms', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF, UserRole.CHW] },
        { href: '/datasets', icon: Database, label: 'Datasets', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] },
        { href: '/reports', icon: BarChart3, label: 'Reports', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] },
        { href: '/resources', icon: ClipboardList, label: 'Resources', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF, UserRole.CHW] },
        { href: '/ai-assistant', icon: Bot, label: 'AI Assistant', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] },
        { href: '/data-tools', icon: Wrench, label: 'Data Tools', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] },
      ],
    },
    // Collaborations Section
    {
      title: 'Collaborations',
      icon: Handshake,
      items: [
        { href: '/collaborations', icon: Handshake, label: 'My Collaborations', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF, UserRole.CHW] },
        { href: '/dashboard/regions', icon: MapPin, label: 'Regional Pages', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] },
        { href: '/chws/mock-profiles', icon: Users, label: 'CHW Directory', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] },
        { href: '/nc-legislature', icon: Building2, label: 'NC Legislature', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF, UserRole.CHW] },
      ],
    },
    // Admin Section - Only for admins
    {
      title: 'Admin',
      icon: Settings,
      roles: [UserRole.ADMIN],
      items: [
        { href: '/admin', icon: Settings, label: 'Platform Settings', roles: [UserRole.ADMIN] },
        { href: '/admin?section=users', icon: Users, label: 'Users', roles: [UserRole.ADMIN] },
        { href: '/admin?section=states', icon: Map, label: 'States', roles: [UserRole.ADMIN] },
        { href: '/admin?section=associations', icon: Building2, label: 'CHW Associations', roles: [UserRole.ADMIN] },
        { href: '/admin?section=nonprofits', icon: Building2, label: 'Nonprofits', roles: [UserRole.ADMIN] },
        { href: '/admin?section=analytics', icon: BarChart3, label: 'Analytics', roles: [UserRole.ADMIN] },
        { href: '/admin?section=security', icon: Shield, label: 'Security', roles: [UserRole.ADMIN] },
      ],
    },
  ];

  // Filter sections and items based on user role
  const filteredSections = navSections
    .filter(section => {
      if (!section.roles || section.roles.length === 0) return true;
      return userRole && section.roles.includes(userRole);
    })
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (!item.roles || item.roles.length === 0) return true;
        return userRole && item.roles.includes(userRole);
      })
    }))
    .filter(section => section.items.length > 0);

  // For homepage or non-logged in users, show simple layout
  if (isHomePage || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/images/CHWOneLogoDesign.png" 
                width={40}
                height={40}
                alt="CHWOne Logo"
                className="rounded-full"
              />
              <div className="flex flex-col">
                <span className="font-bold text-xl text-slate-800">CHWOne</span>
                <span className="text-[10px] text-slate-500 italic">A Women Leading for Wellness and Justice product</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {/* Public navigation links - visible to all users */}
              <Button variant="ghost" asChild>
                <Link href="/nc-legislature" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  NC Legislature
                </Link>
              </Button>
              {currentUser ? (
                <Button asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
        <main className={fullWidth ? '' : 'container mx-auto px-4 py-8'}>
          {fullWidth ? children : (
            <div className="bg-white/95 backdrop-blur-lg rounded-xl p-6 shadow-lg">
              {children}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Vertical Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16',
        'hidden md:block'
      )}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {sidebarOpen && (
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/images/CHWOneLogoDesign.png" 
                width={32}
                height={32}
                alt="CHWOne Logo"
                className="rounded-full"
              />
              <span className="font-bold text-lg">CHWOne</span>
            </Link>
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
          {filteredSections.map((section) => {
            const SectionIcon = section.icon;
            const isCollapsed = collapsedSections[section.title];
            
            return (
              <div key={section.title} className="mb-2">
                {/* Section Header */}
                <button
                  onClick={() => sidebarOpen && toggleSection(section.title)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                    'text-slate-400 hover:text-white hover:bg-slate-800',
                    !sidebarOpen && 'justify-center'
                  )}
                >
                  <SectionIcon className="h-4 w-4 flex-shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider">
                        {section.title}
                      </span>
                      {isCollapsed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </>
                  )}
                </button>
                
                {/* Section Items */}
                {(!isCollapsed || !sidebarOpen) && (
                  <div className={cn('space-y-0.5', sidebarOpen && 'ml-2 mt-1')}>
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = pathname === item.href || 
                        (item.href !== '/' && pathname?.startsWith(item.href.split('?')[0]));
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                            isActive 
                              ? 'bg-blue-600 text-white' 
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          )}
                        >
                          <ItemIcon className="h-5 w-5 flex-shrink-0" />
                          {sidebarOpen && (
                            <>
                              <span className="flex-1 text-sm">{item.label}</span>
                              {isActive && <ChevronRight className="h-4 w-4" />}
                            </>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-slate-700">
          <Link href="/">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <Home className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">Home</span>}
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white h-16 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/images/CHWOneLogoDesign.png" 
            width={32}
            height={32}
            alt="CHWOne Logo"
            className="rounded-full"
          />
          <span className="font-bold">CHWOne</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/95 pt-16 overflow-y-auto">
          <nav className="p-4 space-y-4">
            {filteredSections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <div key={section.title}>
                  <div className="flex items-center gap-2 px-4 py-2 text-slate-400">
                    <SectionIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{section.title}</span>
                  </div>
                  <div className="space-y-1 ml-2">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = pathname === item.href || 
                        (item.href !== '/' && pathname?.startsWith(item.href.split('?')[0]));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                            isActive 
                              ? 'bg-blue-600 text-white' 
                              : 'text-slate-300 hover:bg-slate-800'
                          )}
                        >
                          <ItemIcon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="border-t border-slate-700 pt-4 mt-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        'flex-1 transition-[margin] duration-300',
        sidebarOpen ? 'md:ml-64' : 'md:ml-16',
        'pt-16 md:pt-0'
      )}>
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-800">
              {filteredSections.flatMap(s => s.items).find(item => pathname === item.href || pathname?.startsWith(item.href.split('?')[0] + '/'))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{userProfile?.displayName || 'User'}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>
              {(userProfile as any)?.profilePicture ? (
                <img 
                  src={(userProfile as any).profilePicture} 
                  alt={userProfile?.displayName || 'Profile'} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {(userProfile?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {children}
          </div>
        </div>
      </main>

      {/* Admin Role Switcher */}
      <AdminRoleSwitcher />
    </div>
  );
}

export default function UnifiedLayout(props: UnifiedLayoutProps) {
  return (
    <AuthProvider>
      <UnifiedLayoutContent {...props} />
    </AuthProvider>
  );
}
