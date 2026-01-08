'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Users, Target, Lightbulb, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/CHWOneLogoDesign.png" alt="CHWOne" width={40} height={40} className="rounded-full" />
            <span className="font-bold text-lg">CHWOne Platform</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/about" className="hover:text-blue-200 font-medium">About</Link>
            <Link href="/services" className="hover:text-blue-200">Services</Link>
            <Link href="/products" className="hover:text-blue-200">Products</Link>
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Empowering Community Health Workers to Transform Lives
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              CHWOne was born from a simple yet powerful vision: to give Community Health Workers 
              the tools they need to connect communities with the resources that change lives.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 relative">
                <div className="absolute -top-4 -left-4 bg-purple-600 text-white p-3 rounded-full">
                  <Heart className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Our Founder's Story
                </h2>
                <h3 className="text-xl font-semibold text-purple-700 mb-4">
                  Ana Blackburn & Women for Wellness and Justice
                </h3>
                <div className="space-y-4 text-slate-700">
                  <p>
                    Ana Blackburn knows firsthand the challenges Community Health Workers face every day. 
                    As the founder of <strong>Women for Wellness and Justice</strong>, she spent years 
                    working directly with CHWs across North Carolina, witnessing their dedication to 
                    serving underserved communities.
                  </p>
                  <p>
                    But she also saw the frustration. CHWs were spending countless hours searching for 
                    resources, making phone calls to verify services, and maintaining outdated spreadsheets 
                    of community organizations. The information they needed to help their clients was 
                    scattered, inconsistent, and often out of date.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-purple-400 mb-4" />
                  <p className="text-lg italic text-slate-700 mb-4">
                    "I watched incredible CHWs struggle not because they lacked skill or compassion, 
                    but because they lacked access to reliable, organized information. A mother 
                    shouldn't have to wait three days for a CHW to find her a food pantry. 
                    A family shouldn't fall through the cracks because the resource list was outdated."
                  </p>
                  <p className="font-semibold text-slate-900">— Ana Blackburn, Founder</p>
                </CardContent>
              </Card>
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="font-semibold text-slate-900 mb-3">The Breaking Point</h4>
                <p className="text-slate-600">
                  The final straw came when Ana's team lost track of a critical referral because 
                  three different organizations had conflicting information about a shelter's 
                  availability. That night, she began sketching what would become CHWOne—a 
                  platform where CHWs, nonprofits, and community organizations could finally 
                  work from the same page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="bg-slate-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">The Problem We Solve</h2>
            <p className="text-xl text-slate-300">
              Community Health Workers are the backbone of public health, yet they've been 
              underserved by technology. We're changing that.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="bg-red-500/20 text-red-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fragmented Information</h3>
              <p className="text-slate-400">
                Resource information scattered across spreadsheets, websites, and paper files—
                often outdated before it's even used.
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="bg-yellow-500/20 text-yellow-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Disconnected Networks</h3>
              <p className="text-slate-400">
                CHWs, nonprofits, and healthcare systems working in silos, missing opportunities 
                to collaborate and share resources.
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="bg-blue-500/20 text-blue-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Invisible Impact</h3>
              <p className="text-slate-400">
                No way to measure and demonstrate the incredible work CHWs do every day, 
                making it harder to secure funding and recognition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Our Solution</h2>
            <p className="text-xl text-slate-600">
              CHWOne is the first platform designed specifically for the community health ecosystem—
              connecting CHWs, nonprofits, associations, and state agencies on a single, unified platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">For CHWs</h3>
              <p className="text-sm text-slate-600">
                Professional profiles, resource directories, referral tools, and career opportunities.
              </p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-teal-100 text-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">For Nonprofits</h3>
              <p className="text-sm text-slate-600">
                Service listings, referral management, CHW partnerships, and impact tracking.
              </p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">For Associations</h3>
              <p className="text-sm text-slate-600">
                Statewide coordination, training management, certification tracking, and advocacy tools.
              </p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">For States</h3>
              <p className="text-sm text-slate-600">
                Workforce data, program oversight, grant management, and policy insights.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-blue-100">
                To empower Community Health Workers with the technology, connections, and resources 
                they need to bridge the gap between underserved communities and the services that 
                transform lives.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-lg text-blue-100">
                A world where every community has access to trained, supported, and connected 
                Community Health Workers who can navigate the complex landscape of social services 
                with confidence and efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Join the Movement</h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Whether you're a CHW, nonprofit, association, or state agency, CHWOne is here to 
            help you make a bigger impact in your community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/services">Learn About Our Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/images/CHWOneLogoDesign.png" alt="CHWOne" width={32} height={32} className="rounded-full" />
                <span className="font-bold">CHWOne</span>
              </div>
              <p className="text-sm text-slate-400">
                Empowering Community Health Workers to transform lives.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/services" className="hover:text-white">Services</Link></li>
                <li><Link href="/products" className="hover:text-white">Products</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Stakeholders</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/chws/mock-profiles" className="hover:text-white">CHW Directory</Link></li>
                <li><Link href="/" className="hover:text-white">Register</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-slate-400">
                Women for Wellness and Justice<br />
                North Carolina
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} CHWOne Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
