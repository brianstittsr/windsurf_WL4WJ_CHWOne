'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, Check, Users, Building2, Globe, Landmark,
  UserCircle, FolderSearch, Send, MessageSquare, BarChart2,
  FileSpreadsheet, Calendar, Bell, Award, BookOpen,
  Map, Database, Shield, Settings, Zap, Clock,
  Smartphone, Cloud, Lock, Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CHW_FEATURES = [
  { icon: UserCircle, title: 'Professional Profile', desc: 'Showcase certifications, languages, and specializations' },
  { icon: FolderSearch, title: 'Resource Directory', desc: 'Search verified community resources by category and location' },
  { icon: Send, title: 'Referral System', desc: 'Send and track referrals to partner organizations' },
  { icon: MessageSquare, title: 'CHW Network', desc: 'Connect with peers, mentors, and job opportunities' },
  { icon: BarChart2, title: 'Activity Tracking', desc: 'Log activities and generate impact reports' },
  { icon: BookOpen, title: 'Training Access', desc: 'Find continuing education and certification programs' },
];

const NONPROFIT_FEATURES = [
  { icon: FileSpreadsheet, title: 'Service Listings', desc: 'Publish services with eligibility, hours, and contact info' },
  { icon: Send, title: 'Referral Inbox', desc: 'Receive and manage referrals from CHWs' },
  { icon: Users, title: 'CHW Finder', desc: 'Discover and partner with qualified CHWs' },
  { icon: BarChart2, title: 'Impact Dashboard', desc: 'Track referral outcomes and community impact' },
  { icon: Bell, title: 'Grant Alerts', desc: 'Get notified of relevant funding opportunities' },
  { icon: MessageSquare, title: 'Collaboration Hub', desc: 'Connect with other organizations on initiatives' },
];

const ASSOCIATION_FEATURES = [
  { icon: Map, title: 'Statewide Dashboard', desc: 'View CHW distribution and activity across regions' },
  { icon: Calendar, title: 'Training Management', desc: 'Create, schedule, and track training programs' },
  { icon: Award, title: 'Certification Registry', desc: 'Manage CHW certifications and renewals' },
  { icon: Bell, title: 'Member Communications', desc: 'Send targeted announcements and updates' },
  { icon: Database, title: 'Workforce Analytics', desc: 'Access comprehensive workforce data and trends' },
  { icon: Settings, title: 'Policy Tools', desc: 'Generate reports for advocacy and policy work' },
];

const STATE_FEATURES = [
  { icon: Database, title: 'Workforce Registry', desc: 'Complete registry of CHWs, credentials, and employers' },
  { icon: Shield, title: 'Program Oversight', desc: 'Monitor training providers and certification bodies' },
  { icon: FileSpreadsheet, title: 'Grant Management', desc: 'Track funding distribution and grantee performance' },
  { icon: BarChart2, title: 'Policy Analytics', desc: 'Data-driven insights for workforce planning' },
  { icon: Map, title: 'Geographic Mapping', desc: 'Visualize CHW coverage and service gaps' },
  { icon: BookOpen, title: 'Compliance Reporting', desc: 'Generate federal and legislative reports' },
];

export default function ProductsPage() {
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
            <Link href="/about" className="hover:text-blue-200">About</Link>
            <Link href="/services" className="hover:text-blue-200">Services</Link>
            <Link href="/products" className="hover:text-blue-200 font-medium">Products</Link>
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <Badge className="bg-white/20 text-white mb-4">Platform Features</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            One Platform, Four Powerful Products
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
            CHWOne provides specialized tools for each stakeholder in the community health ecosystem, 
            all working together seamlessly on a single integrated platform.
          </p>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">The CHWOne Ecosystem</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Each product is designed for a specific stakeholder, but all share data and 
              functionality to create a connected community health network.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>CHW Portal</CardTitle>
                <CardDescription>For Community Health Workers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  Professional tools for CHWs to manage their careers, access resources, 
                  and track their community impact.
                </p>
                <Badge variant="outline" className="text-blue-600 border-blue-200">Free for CHWs</Badge>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-teal-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-teal-100 text-teal-600 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <Building2 className="h-6 w-6" />
                </div>
                <CardTitle>Nonprofit Hub</CardTitle>
                <CardDescription>For Organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  Service listing, referral management, and CHW partnership tools 
                  for community organizations.
                </p>
                <Badge variant="outline" className="text-teal-600 border-teal-200">Free Tier Available</Badge>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <Globe className="h-6 w-6" />
                </div>
                <CardTitle>Association Suite</CardTitle>
                <CardDescription>For CHW Associations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  Statewide coordination, training management, and workforce 
                  analytics for CHW associations.
                </p>
                <Badge variant="outline" className="text-purple-600 border-purple-200">Enterprise</Badge>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-indigo-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <Landmark className="h-6 w-6" />
                </div>
                <CardTitle>State Dashboard</CardTitle>
                <CardDescription>For Government Agencies</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  Workforce registry, program oversight, and policy analytics 
                  for state health departments.
                </p>
                <Badge variant="outline" className="text-indigo-600 border-indigo-200">Government</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CHW Portal */}
      <section className="py-16 md:py-24" id="chw">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">CHW Portal</h2>
                <p className="text-slate-600">Everything CHWs need to serve their communities</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CHW_FEATURES.map((feature, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <feature.icon className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 p-6 bg-blue-50 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-900">Ready to join?</h3>
                <p className="text-slate-600">The CHW Portal is completely free for Community Health Workers.</p>
              </div>
              <Button asChild>
                <Link href="/">Register as a CHW <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Nonprofit Hub */}
      <section className="py-16 md:py-24 bg-slate-50" id="nonprofit">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-teal-600 text-white w-14 h-14 rounded-xl flex items-center justify-center">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Nonprofit Hub</h2>
                <p className="text-slate-600">Connect with CHWs and expand your community reach</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {NONPROFIT_FEATURES.map((feature, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <feature.icon className="h-8 w-8 text-teal-600 mb-3" />
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 p-6 bg-teal-50 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-900">List your organization</h3>
                <p className="text-slate-600">Get discovered by CHWs and receive client referrals.</p>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700" asChild>
                <Link href="/">Register Your Nonprofit <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Association Suite */}
      <section className="py-16 md:py-24" id="association">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-purple-600 text-white w-14 h-14 rounded-xl flex items-center justify-center">
                <Globe className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Association Suite</h2>
                <p className="text-slate-600">Coordinate and empower your state's CHW workforce</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ASSOCIATION_FEATURES.map((feature, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <feature.icon className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 p-6 bg-purple-50 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-900">Build your association</h3>
                <p className="text-slate-600">Get the tools to organize CHWs across your entire state.</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/">Start Your Association <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* State Dashboard */}
      <section className="py-16 md:py-24 bg-slate-50" id="state">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-indigo-600 text-white w-14 h-14 rounded-xl flex items-center justify-center">
                <Landmark className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">State Dashboard</h2>
                <p className="text-slate-600">Visibility and oversight for state health agencies</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STATE_FEATURES.map((feature, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <feature.icon className="h-8 w-8 text-indigo-600 mb-3" />
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 p-6 bg-indigo-50 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-900">For state agencies</h3>
                <p className="text-slate-600">Contact us to learn about state-level implementation.</p>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
                <Link href="/contact">Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose CHWOne?</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Built specifically for the community health ecosystem with features that matter.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cloud className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Cloud-Based</h3>
              <p className="text-sm text-slate-400">Access from anywhere, on any device. No software to install.</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-slate-400">HIPAA-compliant security with role-based access controls.</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Real-Time Data</h3>
              <p className="text-sm text-slate-400">Live updates across all stakeholders. No more outdated info.</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Dedicated Support</h3>
              <p className="text-sm text-slate-400">Training, onboarding, and ongoing support for all users.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Start Using CHWOne Today</h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Join the growing network of CHWs, nonprofits, and organizations transforming 
            community health across North Carolina.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">Learn Our Story</Link>
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
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#chw" className="hover:text-white">CHW Portal</a></li>
                <li><a href="#nonprofit" className="hover:text-white">Nonprofit Hub</a></li>
                <li><a href="#association" className="hover:text-white">Association Suite</a></li>
                <li><a href="#state" className="hover:text-white">State Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/services" className="hover:text-white">Services</Link></li>
                <li><Link href="/" className="hover:text-white">Register</Link></li>
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
