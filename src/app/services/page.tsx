'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, Users, Building2, Globe, Landmark,
  UserCheck, FileText, BarChart3, Network, BookOpen,
  ClipboardList, Bell, Shield, Database, Handshake,
  GraduationCap, Award, TrendingUp, Map
} from 'lucide-react';
import AppleNav from '@/components/Layout/AppleNav';

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState('chw');

  const services = {
    chw: {
      title: 'For Community Health Workers',
      subtitle: 'Everything you need to serve your community.',
      color: '#0071E3',
      icon: Users,
      features: [
        { icon: UserCheck, title: 'Professional Profile', desc: 'Showcase your certifications, experience, and expertise' },
        { icon: FileText, title: 'Resource Directory', desc: 'Access verified community resources instantly' },
        { icon: Network, title: 'Referral Tools', desc: 'Connect clients with services seamlessly' },
        { icon: GraduationCap, title: 'Training & Certification', desc: 'Track your professional development' },
      ]
    },
    nonprofit: {
      title: 'For Nonprofits',
      subtitle: 'Manage your CHW workforce effectively.',
      color: '#34C759',
      icon: Building2,
      features: [
        { icon: Database, title: 'Service Listings', desc: 'Publish and manage your organization\'s services' },
        { icon: Handshake, title: 'CHW Partnerships', desc: 'Connect with qualified community health workers' },
        { icon: BarChart3, title: 'Impact Tracking', desc: 'Measure and report on program outcomes' },
        { icon: Bell, title: 'Referral Management', desc: 'Receive and track client referrals' },
      ]
    },
    association: {
      title: 'For CHW Associations',
      subtitle: 'Coordinate statewide initiatives.',
      color: '#AF52DE',
      icon: Globe,
      features: [
        { icon: Map, title: 'Regional Coordination', desc: 'Manage CHW networks across your state' },
        { icon: Award, title: 'Certification Management', desc: 'Track and verify CHW credentials' },
        { icon: BookOpen, title: 'Training Programs', desc: 'Deliver and track professional development' },
        { icon: TrendingUp, title: 'Advocacy Tools', desc: 'Data-driven insights for policy advocacy' },
      ]
    },
    state: {
      title: 'For State Agencies',
      subtitle: 'Workforce data and program oversight.',
      color: '#FF9500',
      icon: Landmark,
      features: [
        { icon: Database, title: 'Workforce Analytics', desc: 'Comprehensive CHW workforce data' },
        { icon: Shield, title: 'Program Oversight', desc: 'Monitor CHW programs statewide' },
        { icon: ClipboardList, title: 'Grant Management', desc: 'Track funding and program outcomes' },
        { icon: BarChart3, title: 'Policy Insights', desc: 'Data-driven policy recommendations' },
      ]
    }
  };

  const currentService = services[activeTab as keyof typeof services];
  const IconComponent = currentService.icon;

  return (
    <div className="min-h-screen bg-white">
      <AppleNav variant="light" />

      {/* Hero - Apple Style */}
      <section className="apple-section bg-[#F5F5F7]">
        <div className="apple-container text-center">
          <h1 className="apple-headline-large text-[#1D1D1F] mb-6">
            Services
          </h1>
          <p className="apple-subhead max-w-[680px] mx-auto">
            Tailored solutions for Community Health Workers, Nonprofits, 
            Associations, and State Agencies—all on one unified platform.
          </p>
        </div>
      </section>

      {/* Tab Navigation - Apple Style */}
      <section className="sticky top-[44px] z-40 bg-white border-b border-[#D2D2D7]">
        <div className="apple-container">
          <div className="flex justify-center gap-2 py-4">
            {Object.entries(services).map(([key, service]) => {
              const TabIcon = service.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    activeTab === key
                      ? 'bg-[#1D1D1F] text-white'
                      : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{key === 'chw' ? 'CHWs' : key === 'nonprofit' ? 'Nonprofits' : key === 'association' ? 'Associations' : 'States'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Content - Apple Style */}
      <section className="apple-section bg-white">
        <div className="apple-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Info */}
            <div>
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8"
                style={{ backgroundColor: `${currentService.color}20` }}
              >
                <IconComponent className="h-10 w-10" style={{ color: currentService.color }} />
              </div>
              <h2 className="apple-headline text-[#1D1D1F] mb-4">
                {currentService.title}
              </h2>
              <p className="apple-subhead mb-8">
                {currentService.subtitle}
              </p>
              <Link
                href="/register"
                className="apple-btn apple-btn-primary inline-flex"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Right - Features */}
            <div className="grid sm:grid-cols-2 gap-6">
              {currentService.features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={index} className="bg-[#F5F5F7] rounded-2xl p-6">
                    <FeatureIcon className="h-8 w-8 mb-4" style={{ color: currentService.color }} />
                    <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">{feature.title}</h3>
                    <p className="text-[#6E6E73] text-sm">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Apple Style */}
      <section className="apple-section apple-bg-gray">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-[#1D1D1F] mb-6">
            How it all works together.
          </h2>
          <p className="apple-subhead max-w-[600px] mx-auto mb-16">
            CHWOne creates a connected ecosystem where every stakeholder benefits from collaboration.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-[#0071E3]">1</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">Connect</h3>
              <p className="text-[#6E6E73]">
                CHWs, nonprofits, and organizations join the platform and create their profiles.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-[#34C759]">2</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">Collaborate</h3>
              <p className="text-[#6E6E73]">
                Share resources, make referrals, and work together to serve communities.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-[#AF52DE]">3</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">Impact</h3>
              <p className="text-[#6E6E73]">
                Track outcomes, demonstrate value, and continuously improve services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Apple Style */}
      <section className="apple-section bg-[#1D1D1F]">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-[#86868B] max-w-[600px] mx-auto mb-10">
            Join the growing network of CHWs, nonprofits, and organizations transforming 
            community health.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="apple-btn apple-btn-primary">
              Create Free Account
            </Link>
            <Link href="/about" className="apple-btn text-white hover:text-[#0071E3] transition-colors">
              Learn more about us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Apple Style */}
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
    </div>
  );
}
