'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, Target, BookOpen, Users, Award,
  FileText, Network, GraduationCap, UserCheck,
  Smartphone, Wifi, Globe, Mic, Calendar, Search, MessageSquare
} from 'lucide-react';
import AppleNav from '@/components/Layout/AppleNav';

export default function ForCHWsPage() {
  const [activeTab, setActiveTab] = useState('workflow');

  const sections = {
    workflow: {
      title: 'Streamline Your Workflow',
      subtitle: 'One platform for everything you do.',
      color: '#0071E3',
      icon: Target,
      features: [
        { icon: FileText, title: 'Digital Records', desc: 'HIPAA-compliant client records accessible from any device' },
        { icon: Network, title: 'Referral Tracking', desc: 'Real-time tracking from initiation to completion' },
        { icon: Smartphone, title: 'Mobile Forms', desc: 'Offline-capable forms that sync when connected' },
        { icon: Search, title: 'Resource Library', desc: 'Instant access to health education materials' },
      ]
    },
    development: {
      title: 'Professional Development',
      subtitle: 'Grow your career and credentials.',
      color: '#34C759',
      icon: BookOpen,
      features: [
        { icon: GraduationCap, title: 'Training Modules', desc: 'Free courses aligned with C3 Project competencies' },
        { icon: Award, title: 'Certificate Tracking', desc: 'Automated continuing education management' },
        { icon: FileText, title: 'Certification Prep', desc: 'Study guides for all 23 state programs' },
        { icon: UserCheck, title: 'Portfolio Builder', desc: 'Document your skills and achievements' },
      ]
    },
    community: {
      title: 'Connect & Collaborate',
      subtitle: 'Join thousands of CHWs nationwide.',
      color: '#AF52DE',
      icon: Users,
      features: [
        { icon: MessageSquare, title: 'Peer Forums', desc: 'Anonymous advice on challenging cases' },
        { icon: Globe, title: 'Regional Networks', desc: 'Connect with CHWs in your area' },
        { icon: Users, title: 'Mentorship', desc: 'Pair with experienced CHWs' },
        { icon: Award, title: 'Success Stories', desc: 'Celebrate wins and learn from others' },
      ]
    },
    impact: {
      title: 'Demonstrate Your Value',
      subtitle: 'Prove your $2.47-$15 ROI.',
      color: '#FF9500',
      icon: Award,
      features: [
        { icon: FileText, title: 'Impact Reports', desc: 'Automated reports showing your contributions' },
        { icon: Target, title: 'Outcome Tracking', desc: 'Document diabetes control, prevented hospitalizations' },
        { icon: UserCheck, title: 'Dashboards', desc: 'Share progress with supervisors' },
        { icon: Award, title: 'Advocacy Tools', desc: 'Data to support fair compensation' },
      ]
    }
  };

  const currentSection = sections[activeTab as keyof typeof sections];
  const IconComponent = currentSection.icon;

  return (
    <div className="min-h-screen bg-white">
      <AppleNav variant="light" />

      {/* Hero - Apple Style */}
      <section className="apple-section bg-[#0071E3]">
        <div className="apple-container text-center">
          <h1 className="apple-headline-large text-white mb-6">
            For CHWs
          </h1>
          <p className="apple-subhead text-white/80 max-w-[680px] mx-auto mb-8">
            Tools and resources designed specifically for Community Health Workers. 
            Spend less time on paperwork, more time with families.
          </p>
          <Link href="/register" className="apple-btn bg-white text-[#0071E3] hover:bg-gray-100">
            Register as CHW <ArrowRight className="ml-2 h-4 w-4 inline" />
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
                  <span className="hidden sm:inline">{key === 'workflow' ? 'Workflow' : key === 'development' ? 'Development' : key === 'community' ? 'Community' : 'Impact'}</span>
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

      {/* Testimonials - Apple Style */}
      <section className="apple-section apple-bg-gray">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-[#1D1D1F] mb-6">
            Real CHWs. Real results.
          </h2>
          <p className="apple-subhead max-w-[600px] mx-auto mb-16">
            Join thousands of CHWs who are transforming their work with CHWOne.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-left">
              <p className="text-[#1D1D1F] mb-6">
                "Before CHWOne, I spent 3 hours a day on paperwork. Now it's 30 minutes, giving me 2.5 more hours with families."
              </p>
              <p className="text-[#6E6E73] text-sm font-medium">Maria S., CHW in Texas</p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-left">
              <p className="text-[#1D1D1F] mb-6">
                "CHWOne's smart reminders ensure no one falls through the cracks. I just got promoted to Lead CHW."
              </p>
              <p className="text-[#6E6E73] text-sm font-medium">Marcus T., Urban Mental Health CHW</p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-left">
              <p className="text-[#1D1D1F] mb-6">
                "The bilingual interface helps me serve Spanish-speaking families better. We prevented 30 hospitalizations last year."
              </p>
              <p className="text-[#6E6E73] text-sm font-medium">Rosa M., Promotora de Salud</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Apple Style */}
      <section className="apple-section bg-white">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-[#1D1D1F] mb-12">
            Features for your reality.
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { icon: Smartphone, label: 'Any Device' },
              { icon: Wifi, label: 'Works Offline' },
              { icon: Globe, label: 'Multi-Language' },
              { icon: Mic, label: 'Voice-to-Text' },
              { icon: Calendar, label: 'Smart Scheduling' },
              { icon: Search, label: 'Resource Matching' },
              { icon: MessageSquare, label: 'Secure Messaging' },
              { icon: Award, label: 'Certification Tracking' },
            ].map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <div key={index} className="bg-[#F5F5F7] rounded-2xl p-6 text-center">
                  <ItemIcon className="h-8 w-8 mx-auto mb-3 text-[#0071E3]" />
                  <p className="text-[#1D1D1F] font-medium">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA - Apple Style */}
      <section className="apple-section bg-[#1D1D1F]">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-white mb-6">
            Join 10,000+ CHWs using CHWOne.
          </h2>
          <p className="text-xl text-[#86868B] max-w-[600px] mx-auto mb-10">
            Start free today. No credit card required. Full access for 30 days.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="apple-btn apple-btn-primary">
              Start Your Free Trial
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
