'use client';

import React, { useState, useEffect } from 'react';
import { Users, FolderKanban, DollarSign, Send, RefreshCw, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}

function StatCard({ title, value, icon, color, borderColor }: StatCardProps) {
  return (
    <Card className={cn('hover:shadow-lg transition-all hover:-translate-y-1', borderColor)}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-full', color)}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DatabaseStatusCard() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkStatus = async () => {
    setStatus('checking');
    const start = Date.now();
    
    // Simulate database check
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setResponseTime(Date.now() - start);
    setStatus('connected');
    setLastChecked(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={checkStatus}>
            <RefreshCw className={cn('h-4 w-4', status === 'checking' && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-4">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mb-3',
            status === 'connected' ? 'bg-green-100' : status === 'checking' ? 'bg-blue-100' : 'bg-red-100'
          )}>
            <CheckCircle className={cn(
              'h-8 w-8',
              status === 'connected' ? 'text-green-600' : status === 'checking' ? 'text-blue-600' : 'text-red-600'
            )} />
          </div>
          <p className="font-semibold text-slate-900">
            {status === 'connected' ? 'Connected' : status === 'checking' ? 'Checking...' : 'Disconnected'}
          </p>
          {responseTime && (
            <>
              <p className="text-sm text-slate-500 mt-1">Response Time</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {responseTime}ms
              </span>
            </>
          )}
          {lastChecked && (
            <p className="text-xs text-slate-400 mt-3">Last checked: {lastChecked}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardContent() {
  const [error, setError] = useState<string | null>(null);
  const stats = {
    activeChws: 24,
    activeProjects: 12,
    activeGrants: 8,
    pendingReferrals: 15
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CHW Platform Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Overview of platform metrics, active projects, and key performance indicators
        </p>
      </div>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active CHWs"
          value={stats.activeChws}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100"
          borderColor="border-t-4 border-t-blue-600"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={<FolderKanban className="h-6 w-6 text-indigo-600" />}
          color="bg-indigo-100"
          borderColor="border-t-4 border-t-indigo-600"
        />
        <StatCard
          title="Active Grants"
          value={stats.activeGrants}
          icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
          color="bg-emerald-100"
          borderColor="border-t-4 border-t-emerald-600"
        />
        <StatCard
          title="Pending Referrals"
          value={stats.pendingReferrals}
          icon={<Send className="h-6 w-6 text-amber-600" />}
          color="bg-amber-100"
          borderColor="border-t-4 border-t-amber-600"
        />
      </div>
      
      {/* Divider */}
      <div className="border-t border-slate-200" />
      
      {/* System Status Section */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DatabaseStatusCard />
        </div>
      </div>
    </div>
  );
}
