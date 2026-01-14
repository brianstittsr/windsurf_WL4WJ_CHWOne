'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, Map, Settings, Users, FolderKanban, 
  DollarSign, Handshake, FileText, Database, BarChart3, User,
  Menu, X, LogOut, ChevronRight, Home, Bell, Shield,
  Briefcase, UserCog, Send, Bot, Wrench,
  ClipboardList, Building2, ChevronDown, PanelLeftClose, PanelLeft
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles?: UserRole[];
}

interface NavSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  roles?: UserRole[];
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { currentUser, userProfile, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Profile': true,
    'Work': true,
    'Collaborations': true,
    'Admin': true,
  });
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  // Normalize role to uppercase for comparison
  const userRole = userProfile?.role?.toUpperCase() as UserRole | undefined;

  // Define navigation sections (same as UnifiedLayout)
  const navSections: NavSection[] = [
    {
      title: 'Profile',
      icon: User,
      items: [
        { href: '/profile', icon: User, label: 'My Profile' },
        { href: '/settings', icon: Settings, label: 'Settings' },
        { href: '/profile-management', icon: UserCog, label: 'Manage Profiles', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF, UserRole.CHW] },
      ],
    },
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
    {
      title: 'Collaborations',
      icon: Handshake,
      items: [
        { href: '/collaborations', icon: Handshake, label: 'My Collaborations', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF, UserRole.CHW] },
        { href: '/dashboard/regions', icon: Map, label: 'Regional Pages', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] },
        { href: '/chws/mock-profiles', icon: Users, label: 'CHW Directory', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF] },
        { href: '/nc-legislature', icon: Building2, label: 'NC Legislature', roles: [UserRole.ADMIN, UserRole.NONPROFIT_STAFF, UserRole.CHW] },
      ],
    },
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

  // Get current page title
  const currentPageTitle = filteredSections
    .flatMap(s => s.items)
    .find(item => pathname === item.href || pathname?.startsWith(item.href.split('?')[0] + '/'))?.label || 'Dashboard';

  // For non-logged in users, show simple layout
  if (!currentUser) {
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
              <Button variant="ghost" asChild>
                <Link href="/nc-legislature" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  NC Legislature
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">Register</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl p-6 shadow-lg">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#F5F5F7] flex">
        {/* Desktop Sidebar */}
        <aside 
          className={cn(
            'fixed inset-y-0 left-0 z-50 bg-[#1D1D1F] text-white transition-all duration-300 hidden md:flex md:flex-col',
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#3D3D3F] shrink-0">
            {!sidebarCollapsed && (
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
            {sidebarCollapsed && (
              <Link href="/" className="mx-auto">
                <Image 
                  src="/images/CHWOneLogoDesign.png" 
                  width={32}
                  height={32}
                  alt="CHWOne Logo"
                  className="rounded-full"
                />
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredSections.map((section) => {
              const SectionIcon = section.icon;
              const isExpanded = expandedSections[section.title];
              
              return (
                <div key={section.title} className="mb-2">
                  {/* Section Header */}
                  {sidebarCollapsed ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div className="flex justify-center py-2">
                          <SectionIcon className="h-4 w-4 text-slate-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-[#1D1D1F] text-white border-[#3D3D3F]">
                        {section.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#86868B] hover:text-white hover:bg-[#2D2D2F] transition-all"
                    >
                      <SectionIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider">
                        {section.title}
                      </span>
                      <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                    </button>
                  )}
                  
                  {/* Section Items */}
                  {(isExpanded || sidebarCollapsed) && (
                    <div className={cn('space-y-0.5', !sidebarCollapsed && 'ml-2 mt-1')}>
                      {section.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = pathname === item.href || 
                          (item.href !== '/' && pathname?.startsWith(item.href.split('?')[0]));
                        
                        if (sidebarCollapsed) {
                          return (
                            <Tooltip key={item.href} delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Link
                                  href={item.href}
                                  className={cn(
                                    'flex items-center justify-center p-2 rounded-lg transition-all',
                                    isActive 
                                      ? 'bg-[#0071E3] text-white' 
                                      : 'text-[#A1A1A6] hover:bg-[#2D2D2F] hover:text-white'
                                  )}
                                >
                                  <ItemIcon className="h-5 w-5" />
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-[#1D1D1F] text-white border-[#3D3D3F]">
                                {item.label}
                              </TooltipContent>
                            </Tooltip>
                          );
                        }
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                              isActive 
                                ? 'bg-[#0071E3] text-white' 
                                : 'text-[#A1A1A6] hover:bg-[#2D2D2F] hover:text-white'
                            )}
                          >
                            <ItemIcon className="h-5 w-5 flex-shrink-0" />
                            <span className="flex-1 text-sm">{item.label}</span>
                            {isActive && <ChevronRight className="h-4 w-4" />}
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
          <div className="p-3 border-t border-[#3D3D3F] shrink-0 space-y-1">
            {sidebarCollapsed ? (
              <>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link href="/" className="flex items-center justify-center p-2 rounded-xl text-[#A1A1A6] hover:bg-[#2D2D2F] hover:text-white transition-all">
                      <Home className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#1D1D1F] text-white border-[#3D3D3F]">Home</TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center p-2 rounded-xl text-[#A1A1A6] hover:bg-[#FF3B30] hover:text-white transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#1D1D1F] text-white border-[#3D3D3F]">Sign Out</TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSidebarCollapsed(false)}
                      className="w-full flex items-center justify-center p-2 rounded-xl text-[#A1A1A6] hover:bg-[#2D2D2F] hover:text-white transition-all"
                    >
                      <PanelLeft className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#1D1D1F] text-white border-[#3D3D3F]">Expand Sidebar</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#A1A1A6] hover:bg-[#2D2D2F] hover:text-white transition-all">
                  <Home className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">Home</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#A1A1A6] hover:bg-[#FF3B30] hover:text-white transition-all"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">Sign Out</span>
                </button>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#A1A1A6] hover:bg-[#2D2D2F] hover:text-white transition-all"
                >
                  <PanelLeftClose className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">Collapse Sidebar</span>
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#1D1D1F] text-white h-16 flex items-center justify-between px-4">
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
            className="p-2 rounded-xl hover:bg-[#2D2D2F] transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-[#1D1D1F]/98 backdrop-blur-xl pt-16 overflow-y-auto">
            <nav className="p-4 space-y-4">
              {filteredSections.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <div key={section.title}>
                    <div className="flex items-center gap-2 px-4 py-2 text-[#86868B]">
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
                              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                              isActive 
                                ? 'bg-[#0071E3] text-white' 
                                : 'text-[#A1A1A6] hover:bg-[#2D2D2F] hover:text-white'
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
              <div className="border-t border-[#3D3D3F] pt-4 mt-4">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#A1A1A6] hover:bg-[#2D2D2F] hover:text-white transition-all">
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#A1A1A6] hover:bg-[#FF3B30] hover:text-white transition-all"
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
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64',
          'pt-16 md:pt-0'
        )}>
          {/* Top Header Bar - Apple Style */}
          <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7] flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
                {currentPageTitle}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl hover:bg-[#F5F5F7] text-[#6E6E73] transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:bg-[#F5F5F7] rounded-xl p-2 transition-colors">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-[#1D1D1F]">{userProfile?.displayName || 'User'}</p>
                      <p className="text-xs text-[#86868B]">{currentUser.email}</p>
                    </div>
                    {(userProfile as any)?.profilePicture ? (
                      <img 
                        src={(userProfile as any).profilePicture} 
                        alt={userProfile?.displayName || 'Profile'} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071E3] to-[#5856D6] flex items-center justify-center text-white font-semibold">
                        {(userProfile?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content - Wide Container */}
          <div className="p-6 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
