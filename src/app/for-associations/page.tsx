'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, Users, GraduationCap, Megaphone, Building,
  UserCheck, Database, Bell, Shield, FileText, Network,
  Award, TrendingUp, Calendar, Map, BarChart3
} from 'lucide-react';
import AppleNav from '@/components/Layout/AppleNav';

export default function ForAssociationsPage() {
  const [activeTab, setActiveTab] = useState('members');

  const sections = {
    members: {
      title: 'Member Management',
      subtitle: 'Move beyond spreadsheets to a dynamic system.',
      color: '#AF52DE',
      icon: Users,
      features: [
        { icon: UserCheck, title: 'Automated Workflows', desc: 'From application through renewal' },
        { icon: Database, title: 'Tiered Membership', desc: 'Individual, Organizational, Student, Lifetime' },
        { icon: Bell, title: 'Payment Processing', desc: 'Integrated dues, training, and events' },
        { icon: Award, title: 'Certification Tracking', desc: 'Monitor expiration dates and CE credits' },
      ]
    },
    training: {
      title: 'Training Delivery',
      subtitle: 'Become the premier training destination.',
      color: '#0071E3',
      icon: GraduationCap,
      features: [
        { icon: Database, title: 'Learning Management', desc: 'Synchronous and asynchronous training' },
        { icon: Award, title: 'CEU Tracking', desc: 'Integrated with state requirements' },
        { icon: Network, title: 'Multi-Modal Delivery', desc: 'In-person, virtual, and hybrid' },
        { icon: FileText, title: 'Competency Assessments', desc: 'Aligned with C3 Project standards' },
      ]
    },
    advocacy: {
      title: 'Data-Driven Advocacy',
      subtitle: 'Transform anecdotes into evidence.',
      color: '#34C759',
      icon: Megaphone,
      features: [
        { icon: BarChart3, title: 'Workforce Analytics', desc: 'CHW distribution, demographics, impact' },
        { icon: FileText, title: 'Auto Reports', desc: 'For legislators and funders' },
        { icon: TrendingUp, title: 'ROI Calculators', desc: 'Show $2.47-$15 return per dollar' },
        { icon: Map, title: 'Policy Tracking', desc: 'Monitor CHW legislation' },
      ]
    },
    revenue: {
      title: 'Revenue Management',
      subtitle: 'Build financial sustainability.',
      color: '#FF9500',
      icon: Building,
      features: [
        { icon: Database, title: 'Grant Management', desc: 'Track multiple funders and requirements' },
        { icon: Calendar, title: 'Event Registration', desc: 'Conferences, trainings, networking' },
        { icon: Network, title: 'Sponsorship Tracking', desc: 'Corporate and foundation partnerships' },
        { icon: BarChart3, title: 'Financial Dashboards', desc: 'Revenue trends and cash flow' },
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
            For Associations
          </h1>
          <p className="apple-subhead max-w-[680px] mx-auto mb-8">
            Empower your workforce. Amplify your advocacy. Accelerate your impact.
            Enterprise-level capabilities with grassroots values.
          </p>
          <Link href="/register" className="apple-btn bg-[#1D1D1F] text-white hover:bg-[#333]">
            Register Association <ArrowRight className="ml-2 h-4 w-4 inline" />
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
                  <span className="hidden sm:inline">{key === 'members' ? 'Members' : key === 'training' ? 'Training' : key === 'advocacy' ? 'Advocacy' : 'Revenue'}</span>
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
            ROI for your association.
          </h2>
          <p className="apple-subhead max-w-[600px] mx-auto mb-16">
            Associations using CHWOne see measurable improvements across the board.
          </p>
          
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { value: '60%', label: 'Less admin time' },
              { value: '35%', label: 'Better retention' },
              { value: '40%', label: 'Lower training costs' },
              { value: '2.3x', label: 'Higher grant success' },
              { value: '2.5x', label: 'Higher certification rates' },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold text-[#AF52DE] mb-2">{stat.value}</p>
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
                "We've increased membership 40%, reduced admin time by 60%, and secured Medicaid reimbursement using platform data."
              </p>
              <p className="text-[#6E6E73] text-sm font-medium">Massachusetts Association of CHWs</p>
            </div>
            <div className="bg-[#F5F5F7] rounded-2xl p-8 text-left">
              <p className="text-[#1D1D1F] mb-6">
                "CHWOne enabled us to coordinate training across 12 colleges and secure $2.5 million in state funding."
              </p>
              <p className="text-[#6E6E73] text-sm font-medium">NC Community Health Workers Association</p>
            </div>
            <div className="bg-[#F5F5F7] rounded-2xl p-8 text-left">
              <p className="text-[#1D1D1F] mb-6">
                "The bilingual platform helps us serve 3,500 members statewide and deliver 50,000 CEU hours."
              </p>
              <p className="text-[#6E6E73] text-sm font-medium">Texas Association of Promotores</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Apple Style */}
      <section className="apple-section bg-[#1D1D1F]">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-white mb-6">
            Join 50+ associations using CHWOne.
          </h2>
          <p className="text-xl text-[#86868B] max-w-[600px] mx-auto mb-10">
            Schedule a personalized demo. Nonprofit pricing available.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="apple-btn apple-btn-primary">
              Schedule Demo
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
