'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, Users, Building2, Globe, Landmark } from 'lucide-react';
import AppleNav from '@/components/Layout/AppleNav';

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
  const [loginType, setLoginType] = useState<'chw' | 'nonprofit' | 'association' | 'state' | null>(null);

  const loginTypeConfig = {
    chw: {
      title: 'CHW',
      fullTitle: 'Community Health Worker',
      description: 'Access your CHW dashboard, resources, and referral tools',
      icon: Users,
      color: '#0071E3',
    },
    nonprofit: {
      title: 'Nonprofit',
      fullTitle: 'Nonprofit Organization',
      description: 'Manage services, receive referrals, and track impact',
      icon: Building2,
      color: '#34C759',
    },
    association: {
      title: 'Association',
      fullTitle: 'CHW Association',
      description: 'Coordinate statewide CHW activities and training',
      icon: Globe,
      color: '#AF52DE',
    },
    state: {
      title: 'State',
      fullTitle: 'State Agency',
      description: 'Access workforce data, grants, and policy tools',
      icon: Landmark,
      color: '#FF9500',
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
    <div className="min-h-screen bg-[#F5F5F7]">
      <AppleNav variant="light" />

      <div className="flex items-center justify-center min-h-[calc(100vh-44px)] py-12 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image 
                src="/images/CHWOneLogoDesign.png" 
                alt="CHWOne" 
                width={60} 
                height={60} 
                className="rounded-2xl"
              />
            </div>
            <h1 className="apple-headline text-[#1D1D1F] mb-2">
              Sign in to CHWOne
            </h1>
            <p className="text-[#6E6E73]">
              Select your account type and sign in
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Account Type Selector */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#1D1D1F] text-center mb-4">Select your account type:</p>
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
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'border-[#0071E3] bg-[#F5F5F7] scale-105 shadow-md'
                          : 'border-[#D2D2D7] bg-white hover:border-[#86868B] hover:bg-[#F5F5F7]'
                      }`}
                      style={isSelected ? { borderColor: config.color } : {}}
                    >
                      <IconComponent 
                        className="h-6 w-6 transition-all"
                        style={{ color: isSelected ? config.color : '#86868B' }}
                      />
                      <span 
                        className="text-xs font-medium transition-colors"
                        style={{ color: isSelected ? config.color : '#6E6E73' }}
                      >
                        {config.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Type Info */}
            {currentConfig ? (
              <div 
                className="p-4 rounded-xl mb-6 flex items-center gap-3"
                style={{ backgroundColor: `${currentConfig.color}10` }}
              >
                <currentConfig.icon className="h-8 w-8" style={{ color: currentConfig.color }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: currentConfig.color }}>
                    {currentConfig.fullTitle}
                  </p>
                  <p className="text-xs text-[#6E6E73]">{currentConfig.description}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl mb-6 bg-[#FFF3CD] text-center">
                <p className="text-sm text-[#856404] font-medium">Please select your account type above to continue</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className={`space-y-4 ${!loginType ? 'opacity-50 pointer-events-none' : ''}`}>
              {error && (
                <div className="p-4 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2]">
                  <p className="text-sm text-[#C62828]">{error}</p>
                </div>
              )}
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1D1D1F] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#86868B]" />
                  <input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
                    required
                    disabled={!loginType}
                  />
                </div>
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1D1D1F] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#86868B]" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
                    required
                    disabled={!loginType}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
                    disabled={!loginType}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#0071E3] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0071E3] text-white font-medium hover:bg-[#0077ED] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !loginType}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>
            
            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#D2D2D7]" />
              <span className="text-xs text-[#86868B]">or</span>
              <div className="flex-1 h-px bg-[#D2D2D7]" />
            </div>
            
            {/* Demo Account */}
            <div className="text-center">
              <p className="text-sm text-[#6E6E73] mb-2">Need quick access?</p>
              <button
                onClick={fillDemoCredentials}
                className="px-4 py-2 rounded-xl border border-[#D2D2D7] text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
              >
                Use Demo Account
              </button>
              <p className="text-xs text-[#86868B] mt-2">
                admin@example.com / admin123
              </p>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-[#6E6E73]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#0071E3] font-medium hover:underline">
                Register here
              </Link>
            </p>
          </div>

          {/* Network Status */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#34C759]' : 'bg-[#FF3B30]'}`} />
            <span className="text-xs text-[#86868B]">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
          <Loader2 className="h-8 w-8 animate-spin text-[#86868B]" />
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </AuthProvider>
  );
}
