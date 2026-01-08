'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Menu,
  X,
  Settings,
  LogOut,
  User,
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Shield,
  MapPin,
  Heart,
  Search,
  Building,
} from 'lucide-react';

interface ShadcnLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const menuItems = [
  { href: '/rbac-test', icon: Shield, label: 'RBAC Test', roles: [UserRole.ADMIN] },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Main Dashboard', roles: [UserRole.ADMIN] },
  { href: '/dashboard/regions', icon: MapPin, label: 'Regions', roles: [UserRole.ADMIN, UserRole.CHW] },
  { href: '/dashboard/wl4wj', icon: Heart, label: 'WL4WJ', roles: [UserRole.ADMIN] },
  { href: '/admin', icon: Settings, label: 'Admin Panel', roles: [UserRole.ADMIN] },
  { href: '/chws', icon: Users, label: 'CHWs', roles: [UserRole.ADMIN] },
  { href: '/chws/mock-profiles', icon: User, label: 'CHW Profiles', roles: [UserRole.ADMIN] },
  { href: '/resources', icon: Search, label: 'Resources', roles: [UserRole.ADMIN] },
  { href: '/reports', icon: BarChart3, label: 'Reports', roles: [UserRole.ADMIN] },
  { href: '/civicrm', icon: Building, label: 'CiviCRM', roles: [UserRole.ADMIN] },
  { href: '/profile', icon: User, label: 'My Profile', roles: [UserRole.ADMIN] },
];

function ShadcnLayoutContent({ children, fullWidth = false }: ShadcnLayoutProps) {
  const { currentUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const filteredMenuItems = menuItems;

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        isHomePage
          ? 'bg-white'
          : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200'
      )}
    >
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Logo */}
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
              <span className="text-[10px] text-slate-500 italic leading-none">
                A Women Leading for Wellness and Justice product
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1 ml-8">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
                    isActive
                      ? 'text-primary bg-primary/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-80px)] mt-4">
                  <nav className="flex flex-col gap-1">
                    {filteredMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                            isActive
                              ? 'text-primary bg-primary/10'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(currentUser?.displayName || currentUser?.email || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {currentUser?.displayName && (
                      <p className="font-medium">{currentUser.displayName}</p>
                    )}
                    {currentUser?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {currentUser.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 pt-16',
          !fullWidth && !isHomePage && 'px-4 md:px-6 py-6'
        )}
      >
        {fullWidth || isHomePage ? (
          children
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/95 backdrop-blur-xl rounded-lg shadow-sm border border-slate-100 p-6 md:p-8">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ShadcnLayout(props: ShadcnLayoutProps) {
  return (
    <AuthProvider>
      <ShadcnLayoutContent {...props} />
    </AuthProvider>
  );
}
