'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, CheckCircle, Users, FileText, BarChart3, MessageSquare, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DemoPage() {
  const [activeFeature, setActiveFeature] = useState('overview');

  const features = [
    {
      id: 'overview',
      title: 'Platform Overview',
      icon: Zap,
      description: 'See how CHWOne connects Community Health Workers, nonprofits, and associations.',
      benefits: [
        'Unified platform for all CHW stakeholders',
        'AI-powered tools to reduce administrative burden',
        'Real-time collaboration and communication',
        'Comprehensive data and analytics',
      ],
    },
    {
      id: 'chw-tools',
      title: 'CHW Tools',
      icon: Users,
      description: 'Explore the tools designed specifically for Community Health Workers.',
      benefits: [
        'Professional profile and portfolio',
        'Job board and opportunity matching',
        'Client referral management',
        'Certification tracking and renewal reminders',
      ],
    },
    {
      id: 'forms',
      title: 'Smart Forms',
      icon: FileText,
      description: 'Create and manage data collection forms with AI assistance.',
      benefits: [
        'Drag-and-drop form builder',
        'AI-powered form suggestions',
        '75+ field types available',
        'Automatic data validation',
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      icon: BarChart3,
      description: 'Track impact and generate reports for funders and stakeholders.',
      benefits: [
        'Real-time dashboards',
        'Customizable reports',
        'Grant compliance tracking',
        'Outcome measurement tools',
      ],
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      icon: MessageSquare,
      description: 'Get help with documentation, client notes, and more.',
      benefits: [
        'Natural language processing',
        'Document summarization',
        'Client note assistance',
        'Resource recommendations',
      ],
    },
  ];

  const activeFeatureData = features.find(f => f.id === activeFeature) || features[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" asChild>
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Platform Demo</h1>
                <p className="text-sm text-white/70">Explore CHWOne features and capabilities</p>
              </div>
            </div>
            <Button className="bg-white text-blue-800 hover:bg-white/90" asChild>
              <Link href="/register">
                Get Started Free
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center text-white mb-12">
          <Badge className="bg-blue-400/20 text-blue-200 mb-4">Interactive Demo</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            See CHWOne in Action
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Explore the features that make CHWOne the first AI-powered platform designed specifically 
            for Community Health Workers and the organizations that support them.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Feature List */}
          <div className="space-y-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.id}
                  className={`cursor-pointer transition-all ${
                    activeFeature === feature.id 
                      ? 'bg-white border-blue-400' 
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }`}
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <Icon className={`h-8 w-8 ${activeFeature === feature.id ? 'text-blue-600' : 'text-white'}`} />
                    <div>
                      <h3 className={`font-semibold ${activeFeature === feature.id ? 'text-gray-900' : 'text-white'}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm ${activeFeature === feature.id ? 'text-gray-500' : 'text-white/70'}`}>
                        Click to explore
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feature Detail */}
          <div className="lg:col-span-2">
            <Card className="bg-white h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <activeFeatureData.icon className="h-10 w-10 text-blue-600" />
                  <div>
                    <CardTitle className="text-2xl">{activeFeatureData.title}</CardTitle>
                    <CardDescription>{activeFeatureData.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Demo Preview Area */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 mb-6 min-h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Interactive Demo Coming Soon</h3>
                    <p className="text-gray-600 mb-4">
                      We&apos;re building an interactive walkthrough of this feature.
                    </p>
                    <Button asChild>
                      <Link href="/register">Try the Real Platform</Link>
                    </Button>
                  </div>
                </div>

                {/* Benefits */}
                <h4 className="font-semibold text-gray-900 mb-3">Key Benefits</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {activeFeatureData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Card className="bg-white max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to Get Started?</CardTitle>
              <CardDescription>
                Join thousands of CHWs and organizations already using CHWOne to transform community health.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Create Free Account
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
