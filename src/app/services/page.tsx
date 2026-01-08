'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, Users, Building2, Globe, Landmark,
  UserCheck, FileText, BarChart3, Network, BookOpen,
  ClipboardList, Bell, Shield, Database, Handshake,
  GraduationCap, Award, TrendingUp, Map, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function ServicesPage() {
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
            <Link href="/services" className="hover:text-blue-200 font-medium">Services</Link>
            <Link href="/products" className="hover:text-blue-200">Products</Link>
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Services for Every Stakeholder
          </h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-8">
            CHWOne provides tailored services for Community Health Workers, Nonprofits, 
            CHW Associations, and State Agencies—all working together on one unified platform.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="text-sm py-1 px-3">CHWs</Badge>
            <Badge variant="secondary" className="text-sm py-1 px-3">Nonprofits</Badge>
            <Badge variant="secondary" className="text-sm py-1 px-3">Associations</Badge>
            <Badge variant="secondary" className="text-sm py-1 px-3">States</Badge>
          </div>
        </div>
      </section>

      {/* Services by Stakeholder */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="chw" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="chw" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">CHWs</span>
              </TabsTrigger>
              <TabsTrigger value="nonprofit" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Nonprofits</span>
              </TabsTrigger>
              <TabsTrigger value="association" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Associations</span>
              </TabsTrigger>
              <TabsTrigger value="state" className="flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                <span className="hidden sm:inline">States</span>
              </TabsTrigger>
            </TabsList>

            {/* CHW Services */}
            <TabsContent value="chw">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <div className="bg-blue-50 rounded-2xl p-8">
                    <div className="bg-blue-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                      <Users className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                      For Community Health Workers
                    </h2>
                    <p className="text-lg text-slate-600 mb-6">
                      Everything you need to serve your community effectively, grow your career, 
                      and connect with the resources that make a difference.
                    </p>
                    <Button asChild>
                      <Link href="/">
                        Register as a CHW <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Professional Profile</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Create a comprehensive profile showcasing your certifications, specializations, 
                        languages, and service areas. Get discovered by organizations looking for CHWs.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Resource Directory</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Access a verified, up-to-date directory of community resources—food pantries, 
                        shelters, healthcare services, and more—all in one searchable database.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Handshake className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Referral Management</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Send and track referrals to partner organizations. Know when your clients 
                        receive services and follow up on outcomes.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Network className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">CHW Network</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Connect with other CHWs, share best practices, find mentors, and discover 
                        job opportunities across North Carolina.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Impact Tracking</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Document your activities, track client outcomes, and generate reports that 
                        demonstrate your impact to employers and funders.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Nonprofit Services */}
            <TabsContent value="nonprofit">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <div className="bg-teal-50 rounded-2xl p-8">
                    <div className="bg-teal-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                      For Nonprofit Organizations
                    </h2>
                    <p className="text-lg text-slate-600 mb-6">
                      Expand your reach, receive qualified referrals, and partner with CHWs 
                      who understand your community's needs.
                    </p>
                    <Button className="bg-teal-600 hover:bg-teal-700" asChild>
                      <Link href="/">
                        Register Your Organization <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-teal-600" />
                        <CardTitle className="text-lg">Service Listings</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        List your services, eligibility criteria, hours, and contact information 
                        in our searchable directory. CHWs can find and refer clients to you instantly.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <ClipboardList className="h-5 w-5 text-teal-600" />
                        <CardTitle className="text-lg">Referral Intake</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Receive structured referrals from CHWs with all the information you need. 
                        Manage your referral pipeline and communicate status updates.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-teal-600" />
                        <CardTitle className="text-lg">CHW Partnerships</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Find and connect with qualified CHWs in your service area. Post job 
                        opportunities and build your community health workforce.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-teal-600" />
                        <CardTitle className="text-lg">Impact Analytics</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Track referral outcomes, measure your community impact, and generate 
                        reports for funders and stakeholders.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-teal-600" />
                        <CardTitle className="text-lg">Grant Opportunities</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Discover grant opportunities, collaborate with other organizations, 
                        and access funding resources for community health programs.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Association Services */}
            <TabsContent value="association">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <div className="bg-purple-50 rounded-2xl p-8">
                    <div className="bg-purple-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                      <Globe className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                      For CHW Associations
                    </h2>
                    <p className="text-lg text-slate-600 mb-6">
                      Coordinate statewide CHW activities, manage training programs, 
                      and advocate for the profession with data-driven insights.
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                      <Link href="/">
                        Start Your Association <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Map className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-lg">Statewide Coordination</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Organize CHW activities across your entire state. Manage regional chapters, 
                        coordinate events, and unify your CHW workforce.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-lg">Training Management</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Create and manage CHW training programs. Track enrollments, completions, 
                        and continuing education requirements for all members.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-lg">Certification Tracking</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Manage CHW certifications, renewals, and credential verification. 
                        Maintain a registry of certified CHWs in your state.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-lg">Member Communications</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Send announcements, policy updates, and opportunities to all CHWs 
                        and organizations in your network with targeted messaging.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-lg">Workforce Analytics</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Access comprehensive data on your CHW workforce—demographics, 
                        distribution, specializations—to inform policy and advocacy.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* State Services */}
            <TabsContent value="state">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <div className="bg-indigo-50 rounded-2xl p-8">
                    <div className="bg-indigo-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                      <Landmark className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                      For State Agencies
                    </h2>
                    <p className="text-lg text-slate-600 mb-6">
                      Gain visibility into your state's CHW workforce, manage grant programs, 
                      and make data-driven policy decisions.
                    </p>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
                      <Link href="/contact">
                        Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg">Workforce Registry</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Access a comprehensive registry of CHWs, their certifications, 
                        employers, and service areas across your state.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg">Program Oversight</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Monitor CHW programs, training providers, and certification bodies. 
                        Ensure quality and compliance across the state.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg">Grant Management</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Manage CHW-related grants, track funding distribution, and monitor 
                        grantee performance with built-in reporting tools.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg">Policy Insights</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Access aggregated data and analytics to inform CHW policy decisions, 
                        workforce planning, and resource allocation.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg">Reporting & Compliance</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">
                        Generate reports for federal requirements, legislative inquiries, 
                        and stakeholder communications with real-time data.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It All Works Together</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              CHWOne creates a connected ecosystem where every stakeholder benefits from collaboration.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">CHWs Register</h3>
                <p className="text-slate-600 text-sm">
                  CHWs create profiles, access resources, and connect with opportunities.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-teal-600">2</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Organizations Connect</h3>
                <p className="text-slate-600 text-sm">
                  Nonprofits list services, receive referrals, and partner with CHWs.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Impact Multiplies</h3>
                <p className="text-slate-600 text-sm">
                  Associations and states gain visibility, enabling better support and policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Join the growing network of CHWs, nonprofits, and organizations transforming 
            community health across North Carolina.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/">
                Register Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">View Our Products</Link>
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
