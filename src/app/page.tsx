'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CHWWizardShadcn } from '@/components/CHW/CHWWizardShadcn';
import { NonprofitWizardShadcn } from '@/components/Nonprofit/NonprofitWizardShadcn';
import { CHWAssociationWizardShadcn } from '@/components/CHWAssociation/CHWAssociationWizardShadcn';
import AppleNav from '@/components/Layout/AppleNav';
import { ArrowRight, Users, Building2, Globe, Shield, BarChart3, Heart } from 'lucide-react';

function HomeContentInner() {
  const { currentUser } = useAuth();
  const [showCHWWizard, setShowCHWWizard] = useState(false);
  const [showNonprofitWizard, setShowNonprofitWizard] = useState(false);
  const [showAssociationWizard, setShowAssociationWizard] = useState(false);

  const handleCHWWizardComplete = (chwId: string) => {
    console.log('New CHW registered:', chwId);
    setShowCHWWizard(false);
  };

  const handleNonprofitWizardComplete = (nonprofitId: string) => {
    console.log('New nonprofit registered:', nonprofitId);
    setShowNonprofitWizard(false);
  };

  const handleAssociationWizardComplete = (associationId: string) => {
    console.log('New CHW Association registered:', associationId);
    setShowAssociationWizard(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <AppleNav variant="light" />

      {/* Hero Section - Apple Style */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-[#F5F5F7] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent" />
        <div className="relative z-10 text-center px-6 max-w-[980px] mx-auto">
          <h1 className="apple-headline-large text-[#1D1D1F] mb-6">
            Empowering Community Health
          </h1>
          <p className="apple-subhead max-w-[680px] mx-auto mb-10">
            One platform connecting Community Health Workers, nonprofits, and associations 
            to transform healthcare access across communities.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="apple-btn apple-btn-primary"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="apple-btn apple-btn-secondary flex items-center gap-2"
            >
              Learn more <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        
        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px]" />
      </section>

      {/* Features Section */}
      <section className="apple-section bg-white">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-[#1D1D1F] mb-4">
            Built for everyone in<br />community health.
          </h2>
          <p className="apple-subhead max-w-[600px] mx-auto mb-16">
            Whether you're a CHW, nonprofit, or association, CHWOne provides the tools you need.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* CHW Card */}
            <div 
              className="apple-card p-8 text-left cursor-pointer group"
              onClick={() => setShowCHWWizard(true)}
            >
              <div className="w-14 h-14 bg-[#0071E3] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-3">
                For CHWs
              </h3>
              <p className="text-[#6E6E73] mb-4 leading-relaxed">
                Access resources, track certifications, connect with opportunities, and grow your career.
              </p>
              <span className="apple-link flex items-center gap-1 text-sm">
                Register as CHW <ArrowRight className="h-4 w-4" />
              </span>
            </div>

            {/* Nonprofit Card */}
            <div 
              className="apple-card p-8 text-left cursor-pointer group"
              onClick={() => setShowNonprofitWizard(true)}
            >
              <div className="w-14 h-14 bg-[#34C759] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-3">
                For Nonprofits
              </h3>
              <p className="text-[#6E6E73] mb-4 leading-relaxed">
                Manage your CHW workforce, track outcomes, and demonstrate impact to funders.
              </p>
              <span className="apple-link flex items-center gap-1 text-sm">
                Register Organization <ArrowRight className="h-4 w-4" />
              </span>
            </div>

            {/* Association Card */}
            <div 
              className="apple-card p-8 text-left cursor-pointer group"
              onClick={() => setShowAssociationWizard(true)}
            >
              <div className="w-14 h-14 bg-[#AF52DE] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-3">
                For Associations
              </h3>
              <p className="text-[#6E6E73] mb-4 leading-relaxed">
                Coordinate statewide initiatives, manage certifications, and support your members.
              </p>
              <span className="apple-link flex items-center gap-1 text-sm">
                Register Association <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="apple-section apple-bg-gray">
        <div className="apple-container">
          <div className="text-center mb-16">
            <h2 className="apple-headline text-[#1D1D1F] mb-4">
              Everything you need.<br />All in one place.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8">
              <Shield className="h-10 w-10 text-[#0071E3] mb-4" />
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-2">Certification Tracking</h3>
              <p className="text-[#6E6E73]">Never miss a renewal. Automated reminders keep your credentials current.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8">
              <BarChart3 className="h-10 w-10 text-[#34C759] mb-4" />
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-2">Impact Analytics</h3>
              <p className="text-[#6E6E73]">Measure outcomes and demonstrate the value of community health work.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8">
              <Heart className="h-10 w-10 text-[#FF3B30] mb-4" />
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-2">Resource Directory</h3>
              <p className="text-[#6E6E73]">Connect clients with verified community resources instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="apple-section bg-[#1D1D1F] text-white">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-[#86868B] max-w-[600px] mx-auto mb-10">
            Join thousands of community health workers and organizations already using CHWOne.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="apple-btn apple-btn-primary"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="apple-btn text-white hover:text-[#0071E3] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F5F5F7] py-12">
        <div className="apple-container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-xs font-semibold text-[#1D1D1F] mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]">About</Link></li>
                <li><Link href="/services" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]">Services</Link></li>
                <li><Link href="/products" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]">Products</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#1D1D1F] mb-4">For You</h4>
              <ul className="space-y-2">
                <li><Link href="/for-chws" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]">For CHWs</Link></li>
                <li><Link href="/for-associations" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]">For Associations</Link></li>
                <li><Link href="/training" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]">Training</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#1D1D1F] mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/sandhills-resources" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]">Resource Directory</Link></li>
                <li><Link href="/nc-legislature" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]">NC Legislature</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#1D1D1F] mb-4">Account</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]">Sign In</Link></li>
                <li><Link href="/register" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]">Create Account</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#D2D2D7] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image src="/images/CHWOneLogoDesign.png" alt="CHWOne" width={20} height={20} className="rounded-full" />
              <span className="text-xs text-[#6E6E73]">© 2025 CHWOne Platform. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-[#6E6E73] hover:text-[#1D1D1F]">Terms of Use</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Registration Dialogs */}
      <Dialog open={showCHWWizard} onOpenChange={setShowCHWWizard}>
        <DialogContent className="max-w-2xl w-[95vw] h-[85vh] max-h-[700px] p-0 overflow-hidden flex flex-col gap-0 [&>button]:hidden">
          <CHWWizardShadcn 
            onComplete={handleCHWWizardComplete} 
            onClose={() => setShowCHWWizard(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showNonprofitWizard} onOpenChange={setShowNonprofitWizard}>
        <DialogContent className="max-w-2xl w-[95vw] h-[85vh] max-h-[700px] p-0 overflow-hidden flex flex-col gap-0 [&>button]:hidden">
          <NonprofitWizardShadcn 
            onComplete={handleNonprofitWizardComplete} 
            onClose={() => setShowNonprofitWizard(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAssociationWizard} onOpenChange={setShowAssociationWizard}>
        <DialogContent className="max-w-2xl w-[95vw] h-[85vh] max-h-[700px] p-0 overflow-hidden flex flex-col gap-0 [&>button]:hidden">
          <CHWAssociationWizardShadcn 
            onComplete={handleAssociationWizardComplete} 
            onClose={() => setShowAssociationWizard(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <HomeContentInner />
    </AuthProvider>
  );
}
