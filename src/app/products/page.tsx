'use client';

import React from 'react';
import { Package } from 'lucide-react';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';

function ProductsContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#86868B] text-sm">Loading Products...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#5856D6] rounded-2xl flex items-center justify-center">
            <Package className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Products</h1>
            <p className="text-[#6E6E73]">Manage products and services</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-12 text-center">
          <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[#86868B]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1D1D1F] mb-2">Coming Soon</h2>
          <p className="text-[#6E6E73]">Product management features are under development.</p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function ProductsPage() {
  return (
    <AuthProvider>
      <ProductsContent />
    </AuthProvider>
  );
}
