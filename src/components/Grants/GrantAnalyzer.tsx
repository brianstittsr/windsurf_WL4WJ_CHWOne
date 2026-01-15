'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BarChart3, TrendingUp, FileText, AlertCircle } from 'lucide-react';

type Grant = any;

export default function GrantAnalyzer() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0071E3]" />
          <p className="text-[#6E6E73] text-sm font-medium">Analyzing grant data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">
          Grant Analyzer
        </h1>
        <p className="mt-2 text-[#6E6E73] text-lg">
          AI-powered insights for your grant portfolio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#0071E3]" />
            </div>
            <span className="text-sm font-medium text-[#6E6E73]">Total Grants</span>
          </div>
          <p className="text-3xl font-semibold text-[#1D1D1F]">{grants.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#34C759]/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#34C759]" />
            </div>
            <span className="text-sm font-medium text-[#6E6E73]">Active</span>
          </div>
          <p className="text-3xl font-semibold text-[#1D1D1F]">0</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#5856D6]/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-[#5856D6]" />
            </div>
            <span className="text-sm font-medium text-[#6E6E73]">Analyzed</span>
          </div>
          <p className="text-3xl font-semibold text-[#1D1D1F]">0</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#D2D2D7] bg-[#F5F5F7]">
          <h2 className="text-lg font-semibold text-[#1D1D1F]">Analysis Results</h2>
        </div>
        <div className="p-6">
          {grants.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-[#6E6E73]" />
              </div>
              <h3 className="text-lg font-medium text-[#1D1D1F] mb-2">No Grant Data Available</h3>
              <p className="text-[#6E6E73] max-w-md mx-auto">
                Upload grant documents or create new grants to see AI-powered analysis and insights.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[#1D1D1F]">
                Displaying analysis for <span className="font-semibold">{grants.length}</span> grants.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
