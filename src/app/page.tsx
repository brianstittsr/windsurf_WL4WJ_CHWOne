'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { HeroCarousel } from '@/components/Home';
import { useCarouselSlides } from '@/hooks/useCarouselSlides';
import { CTAAction } from '@/types/carousel.types';
import { CHWWizardShadcn } from '@/components/CHW/CHWWizardShadcn';
import { NonprofitWizardShadcn } from '@/components/Nonprofit/NonprofitWizardShadcn';
import { CHWAssociationWizardShadcn } from '@/components/CHWAssociation/CHWAssociationWizardShadcn';
import styles from '@/styles/LogoGlow.module.css';

function HomeContentInner() {
  const { currentUser } = useAuth();
  const { slides } = useCarouselSlides();
  const [showCHWWizard, setShowCHWWizard] = useState(false);
  const [showNonprofitWizard, setShowNonprofitWizard] = useState(false);
  const [showAssociationWizard, setShowAssociationWizard] = useState(false);

  const handleCTAClick = (action: CTAAction) => {
    switch (action) {
      case 'register_chw':
        setShowCHWWizard(true);
        break;
      case 'register_nonprofit':
        setShowNonprofitWizard(true);
        break;
      case 'register_association':
        setShowAssociationWizard(true);
        break;
      case 'login':
        window.location.href = currentUser ? '/dashboard' : '/login';
        break;
      case 'learn_more':
        window.location.href = '/about';
        break;
      default:
        break;
    }
  };

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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 py-3 px-4 flex-shrink-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={styles.logoContainer} style={{ transform: 'scale(0.45)' }}>
              <div className={styles.glowEffect} style={{ opacity: 0.5 }}></div>
              <div className={styles.glowRing} style={{ opacity: 0.7 }}></div>
              <Image 
                src="/images/CHWOneLogoDesign.png" 
                alt="CHWOne Logo" 
                width={55} 
                height={55} 
                className={styles.logoImage}
                style={{ borderRadius: '50%' }}
              />
            </div>
            <span className="text-lg font-bold text-slate-800">CHWOne Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">About</Link>
              <Link href="/services" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Services</Link>
              <Link href="/products" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Products</Link>
            </nav>
            {currentUser ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/register">Register</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <HeroCarousel 
        slides={slides} 
        onCTAClick={handleCTAClick}
        autoAdvanceInterval={8000}
      />

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm py-2 text-center text-white/70 text-xs flex-shrink-0">
        © {new Date().getFullYear()} CHWOne Platform. All rights reserved.
      </footer>

      {/* CHW Registration Dialog */}
      <Dialog open={showCHWWizard} onOpenChange={setShowCHWWizard}>
        <DialogContent className="max-w-2xl w-[95vw] h-[85vh] max-h-[700px] p-0 overflow-hidden flex flex-col gap-0 [&>button]:hidden">
          <CHWWizardShadcn 
            onComplete={handleCHWWizardComplete} 
            onClose={() => setShowCHWWizard(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Nonprofit Registration Dialog */}
      <Dialog open={showNonprofitWizard} onOpenChange={setShowNonprofitWizard}>
        <DialogContent className="max-w-2xl w-[95vw] h-[85vh] max-h-[700px] p-0 overflow-hidden flex flex-col gap-0 [&>button]:hidden">
          <NonprofitWizardShadcn 
            onComplete={handleNonprofitWizardComplete} 
            onClose={() => setShowNonprofitWizard(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* CHW Association Registration Dialog */}
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
