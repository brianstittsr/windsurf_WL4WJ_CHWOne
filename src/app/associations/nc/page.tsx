'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Award, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function NCAssociationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-700">
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
                <h1 className="text-2xl font-bold text-white">NC CHW Association</h1>
                <p className="text-sm text-white/70">North Carolina Community Health Worker Association</p>
              </div>
            </div>
            <Button className="bg-white text-purple-800 hover:bg-white/90" asChild>
              <Link href="/register">
                Join the Association
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-12">
          <Badge className="bg-purple-400/20 text-purple-200 mb-4">Established 2018</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Uniting CHWs Across North Carolina
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            The NC CHW Association advocates for the CHW profession, provides training and certification support, 
            and connects Community Health Workers with resources and opportunities statewide.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { value: '500+', label: 'Active Members' },
            { value: '100', label: 'Counties Reached' },
            { value: '25+', label: 'Training Programs' },
            { value: '8', label: 'Regional Chapters' },
          ].map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <Users className="h-10 w-10 text-purple-300 mb-2" />
              <CardTitle className="text-white">Member Network</CardTitle>
              <CardDescription className="text-white/70">
                Connect with CHWs across all 100 NC counties. Share resources, find mentors, and build your professional network.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <Award className="h-10 w-10 text-purple-300 mb-2" />
              <CardTitle className="text-white">Certification Support</CardTitle>
              <CardDescription className="text-white/70">
                Access training programs, study materials, and certification exam preparation resources.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <MapPin className="h-10 w-10 text-purple-300 mb-2" />
              <CardTitle className="text-white">Regional Chapters</CardTitle>
              <CardDescription className="text-white/70">
                Join your local chapter for in-person events, training sessions, and community building.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-white max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to Join?</CardTitle>
              <CardDescription>
                Become a member of the NC CHW Association and help strengthen the CHW profession in North Carolina.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Register Now
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
