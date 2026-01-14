'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { Wrench, FileAudio, QrCode, Database, Bot, CheckCircle } from 'lucide-react';

const tools = [
  {
    category: 'Text Conversion Tools',
    icon: FileAudio,
    color: '#0071E3',
    items: [
      'MP3 Audio Files',
      'Audio extraction from Video files',
      'MP4 / MP4a Video Files',
      'Handwriting to text',
    ],
  },
  {
    category: 'QR Code Tools',
    icon: QrCode,
    color: '#34C759',
    items: ['QR Code links to forms'],
  },
  {
    category: 'Grant Data Tools',
    icon: Database,
    color: '#AF52DE',
    items: [
      'Grant Data Requirements Analysis',
      'Form Development',
      'Data Collection',
      'Automated, scheduled Reporting and report delivery',
    ],
  },
  {
    category: 'AI Tools',
    icon: Bot,
    color: '#FF9500',
    items: ['Project Management', 'Asset Tracking'],
  },
];

function CHWToolsContent() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Apple-style Page Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#64748B] rounded-2xl flex items-center justify-center">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Data Tools</h1>
            <p className="text-[#6E6E73]">Advanced data processing and automation capabilities</p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((toolCategory) => {
            const IconComponent = toolCategory.icon;
            return (
              <div 
                key={toolCategory.category} 
                className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden"
              >
                <div className="p-6 border-b border-[#D2D2D7]">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${toolCategory.color}20` }}
                    >
                      <IconComponent className="w-5 h-5" style={{ color: toolCategory.color }} />
                    </div>
                    <h2 className="text-lg font-semibold text-[#1D1D1F]">{toolCategory.category}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {toolCategory.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: toolCategory.color }} />
                        <span className="text-[#1D1D1F]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-[#F5F5F7] rounded-2xl p-6 text-center">
          <p className="text-[#6E6E73]">
            More tools coming soon. Contact support for custom data processing needs.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function CHWToolsPage() {
  return (
    <AuthProvider>
      <CHWToolsContent />
    </AuthProvider>
  );
}
