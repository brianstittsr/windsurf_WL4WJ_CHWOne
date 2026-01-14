'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Users, Target, Lightbulb, Quote } from 'lucide-react';
import AppleNav from '@/components/Layout/AppleNav';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <AppleNav variant="light" />

      {/* Hero Section - Apple Style */}
      <section className="apple-section bg-[#F5F5F7]">
        <div className="apple-container text-center">
          <h1 className="apple-headline-large text-[#1D1D1F] mb-6">
            Our Story
          </h1>
          <p className="apple-subhead max-w-[680px] mx-auto">
            CHWOne was born from a simple yet powerful vision: to give Community Health Workers 
            the tools they need to connect communities with the resources that change lives.
          </p>
        </div>
      </section>

      {/* Founder Story - Apple Style */}
      <section className="apple-section bg-white">
        <div className="apple-container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#0071E3] text-sm font-medium mb-4">THE FOUNDER</p>
              <h2 className="apple-headline-small text-[#1D1D1F] mb-6">
                Ana Blackburn & Women for Wellness and Justice
              </h2>
              <div className="space-y-6 text-[#1D1D1F] text-lg leading-relaxed">
                <p>
                  Ana Blackburn knows firsthand the challenges Community Health Workers face every day. 
                  As the founder of <strong>Women for Wellness and Justice</strong>, she spent years 
                  working directly with CHWs across North Carolina.
                </p>
                <p className="text-[#6E6E73]">
                  She witnessed their dedication—and their frustration. CHWs were spending countless hours 
                  searching for resources, making phone calls, and maintaining outdated spreadsheets. 
                  The information they needed was scattered, inconsistent, and often out of date.
                </p>
              </div>
            </div>
            <div className="bg-[#F5F5F7] rounded-3xl p-10">
              <Quote className="h-10 w-10 text-[#0071E3] mb-6" />
              <p className="text-xl text-[#1D1D1F] leading-relaxed mb-6">
                "I watched incredible CHWs struggle not because they lacked skill or compassion, 
                but because they lacked access to reliable, organized information."
              </p>
              <p className="text-[#6E6E73]">— Ana Blackburn, Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem - Apple Style Dark Section */}
      <section className="apple-section bg-[#1D1D1F]">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-white mb-6">
            The problem we solve.
          </h2>
          <p className="apple-subhead text-[#86868B] max-w-[600px] mx-auto mb-16">
            Community Health Workers are the backbone of public health, yet they've been 
            underserved by technology.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-left">
              <div className="w-12 h-12 bg-[#FF3B30]/20 rounded-2xl flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-[#FF3B30]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Fragmented Information</h3>
              <p className="text-[#86868B] leading-relaxed">
                Resource information scattered across spreadsheets, websites, and paper files—
                often outdated before it's even used.
              </p>
            </div>
            <div className="text-left">
              <div className="w-12 h-12 bg-[#FF9500]/20 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-[#FF9500]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Disconnected Networks</h3>
              <p className="text-[#86868B] leading-relaxed">
                CHWs, nonprofits, and healthcare systems working in silos, missing opportunities 
                to collaborate and share resources.
              </p>
            </div>
            <div className="text-left">
              <div className="w-12 h-12 bg-[#0071E3]/20 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="h-6 w-6 text-[#0071E3]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Invisible Impact</h3>
              <p className="text-[#86868B] leading-relaxed">
                No way to measure and demonstrate the incredible work CHWs do every day, 
                making it harder to secure funding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution - Apple Style */}
      <section className="apple-section bg-white">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-[#1D1D1F] mb-6">
            One platform for everyone.
          </h2>
          <p className="apple-subhead max-w-[600px] mx-auto mb-16">
            CHWOne connects CHWs, nonprofits, associations, and state agencies on a single, unified platform.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="apple-card p-8 text-left">
              <div className="w-14 h-14 bg-[#0071E3] rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">For CHWs</h3>
              <p className="text-[#6E6E73]">
                Professional profiles, resource directories, referral tools, and career opportunities.
              </p>
            </div>
            <div className="apple-card p-8 text-left">
              <div className="w-14 h-14 bg-[#34C759] rounded-2xl flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">For Nonprofits</h3>
              <p className="text-[#6E6E73]">
                Service listings, referral management, CHW partnerships, and impact tracking.
              </p>
            </div>
            <div className="apple-card p-8 text-left">
              <div className="w-14 h-14 bg-[#AF52DE] rounded-2xl flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">For Associations</h3>
              <p className="text-[#6E6E73]">
                Statewide coordination, training management, and certification tracking.
              </p>
            </div>
            <div className="apple-card p-8 text-left">
              <div className="w-14 h-14 bg-[#FF9500] rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">For States</h3>
              <p className="text-[#6E6E73]">
                Workforce data, program oversight, grant management, and policy insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision - Apple Style */}
      <section className="apple-section apple-bg-gray">
        <div className="apple-container">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <p className="text-[#0071E3] text-sm font-medium mb-4">OUR MISSION</p>
              <h3 className="apple-headline-small text-[#1D1D1F] mb-6">
                Empowering those who serve.
              </h3>
              <p className="text-lg text-[#6E6E73] leading-relaxed">
                To empower Community Health Workers with the technology, connections, and resources 
                they need to bridge the gap between underserved communities and the services that 
                transform lives.
              </p>
            </div>
            <div>
              <p className="text-[#0071E3] text-sm font-medium mb-4">OUR VISION</p>
              <h3 className="apple-headline-small text-[#1D1D1F] mb-6">
                Connected communities everywhere.
              </h3>
              <p className="text-lg text-[#6E6E73] leading-relaxed">
                A world where every community has access to trained, supported, and connected 
                Community Health Workers who can navigate the complex landscape of social services 
                with confidence and efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Apple Style */}
      <section className="apple-section bg-white">
        <div className="apple-container text-center">
          <h2 className="apple-headline text-[#1D1D1F] mb-6">
            Join the movement.
          </h2>
          <p className="apple-subhead max-w-[600px] mx-auto mb-10">
            Whether you're a CHW, nonprofit, association, or state agency, CHWOne is here to 
            help you make a bigger impact.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="apple-btn apple-btn-primary">
              Get Started
            </Link>
            <Link href="/services" className="apple-btn apple-btn-secondary flex items-center gap-2">
              Learn more <ArrowRight className="h-4 w-4" />
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
