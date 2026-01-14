'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, Users, ClipboardList, BarChart3, DollarSign,
  UserCheck, Database, Bell, Shield, FileText, Network,
  Award, TrendingUp, Calendar
} from 'lucide-react';
import AppleNav from '@/components/Layout/AppleNav';

export default function ForNonprofitsPage() {
  const [activeTab, setActiveTab] = useState('workforce');

  const sections = {
    workforce: {
      title: 'Workforce Management',
      subtitle: 'Manage your entire CHW team from one platform.',
      color: '#34C759',
      icon: Users,
      features: [
        { icon: UserCheck, title: 'Staff Profiles', desc: 'Centralized credentials, certifications, and training records' },
        { icon: Bell, title: 'Renewal Reminders', desc: 'Automated certification expiration alerts' },
        { icon: BarChart3, title: 'Workload Balance', desc: 'Distribute caseloads across your team' },
        { icon: TrendingUp, title: 'Performance Dashboards', desc: 'Track individual and team productivity' },
      ]
    },
    clients: {
      title: 'Client & Referral Tracking',
      subtitle: 'Never lose track of a client again.',
      color: '#0071E3',
      icon: ClipboardList,
      features: [
        { icon: Shield, title: 'HIPAA Compliant', desc: 'Secure client records accessible anywhere' },
        { icon: Network, title: 'Real-Time Tracking', desc: 'Follow referrals from start to completion' },
        { icon: Bell, title: 'Auto Follow-Ups', desc: 'Reminders ensure no one falls through cracks' },
        { icon: Database, title: 'Resource Directory', desc: 'Instant service matching for clients' },
      ]
    },
    outcomes: {
      title: 'Outcome Measurement',
      subtitle: 'Prove your impact with data funders trust.',
      color: '#AF52DE',
      icon: BarChart3,
      features: [
        { icon: FileText, title: 'Custom Tracking', desc: 'Align with your grant requirements' },
        { icon: BarChart3, title: 'Pre-Built Metrics', desc: 'Diabetes, maternal health, and more' },
        { icon: Database, title: 'Auto Collection', desc: 'Mobile-friendly forms gather data' },
        { icon: TrendingUp, title: 'ROI Calculators', desc: 'Show cost savings from prevented ER visits' },
      ]
    },
    grants: {
      title: 'Grant Management',
      subtitle: 'Less paperwork, more mission.',
      color: '#FF9500',
      icon: DollarSign,
      features: [
        { icon: Database, title: 'Multi-Grant Tracking', desc: 'Separate requirements per funder' },
        { icon: FileText, title: 'Auto Reports', desc: 'Pull data directly from activities' },
        { icon: Calendar, title: 'Deadline Reminders', desc: 'Never miss a reporting period' },
        { icon: DollarSign, title: 'Budget Tracking', desc: 'Real-time spend vs. allocation' },
      ]
    }
  };

  const currentSection = sections[activeTab as keyof typeof sections];
  const IconComponent = currentSection.icon;

  return (
    <div className="min-h-screen bg-white">
      <AppleNav variant="light" />

      {/* Hero - Apple Style */}
      <section className="apple-section bg-[#F5F5F7]">
        <div className="apple-container text-center">
          <h1 className="apple-headline-large text-[#1D1D1F] mb-6">
            For Nonprofits
          </h1>
          <p className="apple-subhead max-w-[680px] mx-auto mb-8">
            Maximize impact. Demonstrate outcomes. Secure funding.
            Enterprise-level capabilities at nonprofit-friendly pricing.
          </p>
          <Link href="/register" className="apple-btn bg-[#1D1D1F] text-white hover:bg-[#333]">
            Register Organization <ArrowRight className="ml-2 h-4 w-4 inline" />
          </Link>
        </div>
      </section>

      {/* Tab Navigation - Apple Style */}
      <section className="sticky top-[44px] z-40 bg-white border-b border-[#D2D2D7]">
        <div className="apple-container">
          <div className="flex justify-center gap-2 py-4">
            {Object.entries(sections).map(([key, section]) => {
              const TabIcon = section.icon;
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
                  <span className="hidden sm:inline">{key === 'workforce' ? 'Workforce' : key === 'clients' ? 'Clients' : key === 'outcomes' ? 'Outcomes' : 'Grants'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Content - Apple Style */}
      <section className="apple-section bg-white">
        <div className="apple-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Info */}
            <div>
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8"
                style={{ backgroundColor: `${currentSection.color}20` }}
              >
                <IconComponent className="h-10 w-10" style={{ color: currentSection.color }} />
              </div>
              <h2 className="apple-headline text-[#1D1D1F] mb-4">
                {currentSection.title}
              </h2>
              <p className="apple-subhead mb-8">
                {currentSection.subtitle}
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
              {currentSection.features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={index} className="bg-[#F5F5F7] rounded-2xl p-6">
                    <FeatureIcon className="h-8 w-8 mb-4" style={{ color: currentSection.color }} />
                    <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">{feature.title}</h3>
                    <p className="text-[#6E6E73] text-sm">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ROI Section - Apple Style */}
      <section className="apple-section apple-bg-gray">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-[#1D1D1F] mb-6">
            ROI for your organization.
          </h2>
          <p className="apple-subhead max-w-[600px] mx-auto mb-16">
            Organizations using CHWOne see measurable improvements across the board.
          </p>
          
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { value: '70%', label: 'Less paperwork time' },
              { value: '40%', label: 'Better referral completion' },
              { value: '85%', label: 'Faster report generation' },
              { value: '25%', label: 'Better staff retention' },
              { value: '2.3x', label: 'Higher grant success' },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold text-[#34C759] mb-2">{stat.value}</p>
                <p className="text-[#6E6E73] text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Apple Style */}
      <section className="apple-section bg-white">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-[#1D1D1F] mb-12">
            Success stories.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#F5F5F7] rounded-2xl p-8 text-left">
              <p className="text-[#1D1D1F] mb-6">
                "CHWOne helped us scale from 8 to 35 CHWs while maintaining quality. We documented $1.2 million in prevented hospitalizations."
              </p>
              <p className="text-[#6E6E73] text-sm font-medium">Federally Qualified Health Center</p>
            </div>
            <div className="bg-[#F5F5F7] rounded-2xl p-8 text-left">
              <p className="text-[#1D1D1F] mb-6">
                "The multilingual forms help us deliver culturally appropriate care while meeting funder requirements."
              </p>
              <p className="text-[#6E6E73] text-sm font-medium">Community-Based Organization</p>
            </div>
            <div className="bg-[#F5F5F7] rounded-2xl p-8 text-left">
              <p className="text-[#1D1D1F] mb-6">
                "Coordinating CHWs across 12 agencies was impossible until CHWOne. Now we have real-time visibility."
              </p>
              <p className="text-[#6E6E73] text-sm font-medium">Public Health Department</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Apple Style */}
      <section className="apple-section bg-[#1D1D1F]">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-white mb-6">
            Join 500+ nonprofits using CHWOne.
          </h2>
          <p className="text-xl text-[#86868B] max-w-[600px] mx-auto mb-10">
            Start free today. No credit card required. Nonprofit pricing available.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="apple-btn apple-btn-primary">
              Start Free Trial
            </Link>
            <Link href="/services" className="apple-btn text-white hover:text-[#0071E3] transition-colors">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Apple Style */}
      <footer className="bg-[#F5F5F7] py-12">
        <div className="apple-container">
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
