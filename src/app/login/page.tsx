'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle, Users, Building2, Globe, Landmark } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function LoginFormContent() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
    };
    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginType, setLoginType] = useState<'chw' | 'nonprofit' | 'association' | 'state' | null>(null);

  const loginTypeConfig = {
    chw: {
      title: 'Community Health Worker',
      description: 'Access your CHW dashboard, resources, and referral tools',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    nonprofit: {
      title: 'Nonprofit Organization',
      description: 'Manage services, receive referrals, and track impact',
      icon: Building2,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
    },
    association: {
      title: 'CHW Association',
      description: 'Coordinate statewide CHW activities and training',
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    state: {
      title: 'State Agency',
      description: 'Access workforce data, grants, and policy tools',
      icon: Landmark,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
  };

  const currentConfig = loginType ? loginTypeConfig[loginType] : null;

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      sessionStorage.setItem('redirectAfterLogin', redirect);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await signIn(email, password);
      // Redirect to profile page after login
      const redirectUrl = searchParams?.get('redirect') || '/profile';
      console.log('[LOGIN] Redirecting to profile page:', redirectUrl);
      router.push(redirectUrl);
    } catch (error) {
      let errorMessage = 'Failed to sign in';
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Please enter a valid email address';
        } else if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found') {
          errorMessage = 'Invalid email or password';
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (firebaseError.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your connection.';
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-white/95 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-3xl font-bold text-slate-800">
            CHWOne Platform
          </CardTitle>
          <CardDescription className="text-slate-500">
            Select your account type and sign in
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Login Type Selector */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700 text-center">Select your account type:</p>
            <div className="grid grid-cols-4 gap-2">
              {(['chw', 'nonprofit', 'association', 'state'] as const).map((type) => {
                const config = loginTypeConfig[type];
                const isSelected = loginType === type;
                const IconComponent = config.icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLoginType(type)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-300',
                      'hover:scale-105 hover:shadow-md',
                      isSelected 
                        ? cn(config.bgColor, config.borderColor, 'shadow-md scale-105')
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <IconComponent 
                      className={cn(
                        'h-6 w-6 transition-all duration-300',
                        isSelected ? cn(config.color, 'scale-110') : 'text-slate-400'
                      )} 
                    />
                    <span className={cn(
                      'text-xs font-medium transition-colors duration-300',
                      isSelected ? config.color : 'text-slate-500'
                    )}>
                      {type === 'chw' ? 'CHW' : 
                       type === 'nonprofit' ? 'Nonprofit' : 
                       type === 'association' ? 'Association' : 'State'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Login Type Info */}
          {currentConfig ? (
            <div className={cn(
              'p-3 rounded-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300',
              currentConfig.bgColor,
              currentConfig.borderColor
            )}>
              <currentConfig.icon className={cn('h-8 w-8 transition-all duration-300', currentConfig.color)} />
              <div>
                <p className={cn('font-semibold text-sm', currentConfig.color)}>{currentConfig.title}</p>
                <p className="text-xs text-slate-500">{currentConfig.description}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-center">
              <p className="text-sm text-amber-700 font-medium">Please select your account type above to continue</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={cn(
            'space-y-4 transition-all duration-300',
            !loginType && 'opacity-50 pointer-events-none'
          )}>
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                  disabled={!loginType}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                  disabled={!loginType}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                  disabled={!loginType}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={!loginType}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900"
              disabled={loading || !loginType}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          
          <div className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Register here
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span className={cn(
              "w-2 h-2 rounded-full",
              isOnline ? "bg-green-500" : "bg-red-500"
            )} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
          
          <Separator />
          
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-500">Need quick access?</p>
            <Button variant="outline" size="sm" onClick={fillDemoCredentials}>
              Use Demo Account
            </Button>
            <p className="text-xs text-slate-400">
              Email: admin@example.com | Password: admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </AuthProvider>
  );
}
