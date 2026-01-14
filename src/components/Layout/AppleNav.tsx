'use client';

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthContext } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';

interface AppleNavProps {
  variant?: 'light' | 'dark' | 'transparent';
}

export default function AppleNav({ variant = 'light' }: AppleNavProps) {
  // Use context directly to avoid throwing error when outside AuthProvider
  const authContext = useContext(AuthContext);
  const currentUser = authContext ? authContext.currentUser : null;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/products', label: 'Products' },
  ];

  const bgClass = variant === 'dark' 
    ? 'bg-[rgba(29,29,31,0.8)]' 
    : variant === 'transparent'
    ? isScrolled ? 'bg-[rgba(255,255,255,0.8)]' : 'bg-transparent'
    : 'bg-[rgba(255,255,255,0.8)]';

  const textClass = variant === 'dark' 
    ? 'text-[#F5F5F7]' 
    : 'text-[#1D1D1F]';

  const linkHoverClass = variant === 'dark'
    ? 'hover:text-white'
    : 'hover:text-[#000]';

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 apple-nav ${bgClass} transition-all duration-300 ${isScrolled ? 'shadow-sm' : ''}`}
      >
        <div className="max-w-[980px] mx-auto px-[22px] h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/images/CHWOneLogoDesign.png" 
              alt="CHWOne" 
              width={28} 
              height={28} 
              className="rounded-full"
            />
            <span className={`font-semibold text-sm ${textClass}`}>CHWOne</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs ${textClass} ${linkHoverClass} transition-colors duration-200`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Links */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <Link
                href="/dashboard"
                className={`text-xs ${textClass} ${linkHoverClass} transition-colors duration-200`}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-xs ${textClass} ${linkHoverClass} transition-colors duration-200`}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-xs bg-[#0071E3] text-white px-4 py-1.5 rounded-full hover:bg-[#0077ED] transition-colors duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 ${textClass}`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-[44px] md:hidden">
          <div className="p-6 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-2xl font-semibold text-[#1D1D1F] hover:text-[#0071E3] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 border-t border-[#D2D2D7] space-y-4">
              {currentUser ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-lg text-[#0071E3]"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-lg text-[#1D1D1F]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center bg-[#0071E3] text-white py-3 rounded-xl text-lg font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed nav */}
      <div className="h-[44px]" />
    </>
  );
}
