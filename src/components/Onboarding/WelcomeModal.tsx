'use client';

import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  BarChart3, 
  FolderKanban, 
  Send, 
  Bot,
  CheckCircle,
  Building2,
  Heart
} from 'lucide-react';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: FileText,
    title: 'Data Collection',
    description: 'Create custom forms and surveys to collect community health data efficiently'
  },
  {
    icon: BarChart3,
    title: 'Reporting & Analytics',
    description: 'Generate comprehensive reports and visualize your impact with powerful dashboards'
  },
  {
    icon: FolderKanban,
    title: 'Project Tracking',
    description: 'Manage grants, milestones, and deliverables all in one place'
  },
  {
    icon: Send,
    title: 'Referral Management',
    description: 'Streamline client referrals between CHWs and partner organizations'
  },
  {
    icon: Users,
    title: 'CHW Network',
    description: 'Connect with Community Health Workers across North Carolina'
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Get intelligent insights and automate routine tasks with AI-powered tools'
  }
];

export default function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/CHWOneLogoDesign.png"
              alt="CHWOne Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Welcome to CHWOne! 🎉
          </DialogTitle>
          <DialogDescription className="text-base text-slate-600 mt-2">
            The first AI-powered platform designed to support Community Health Workers and the organizations that work with them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* What is CHWOne */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <Heart className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">What is CHWOne?</h3>
                <p className="text-sm text-slate-600 mt-1">
                  CHWOne is a comprehensive platform that connects Community Health Workers (CHWs), 
                  nonprofit organizations, and CHW associations across North Carolina. We provide 
                  the tools you need to collect data, track projects, manage grants, and measure 
                  your community impact.
                </p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={feature.title}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-slate-900">{feature.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* For Nonprofits */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
            <div className="flex items-start gap-3">
              <Building2 className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  For Nonprofit Organizations
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Popular</Badge>
                </h3>
                <ul className="text-sm text-slate-600 mt-2 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                    Create custom data collection forms for your programs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                    Track grant deliverables and generate funder reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                    Manage referrals and collaborate with CHWs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                    Visualize your community impact with real-time dashboards
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="w-full sm:w-auto" size="lg">
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
