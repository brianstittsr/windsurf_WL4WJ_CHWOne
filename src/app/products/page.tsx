'use client';

import React from 'react';
import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center text-[#5856D6] hover:text-[#4B49B8] mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-[#5856D6]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-[#5856D6]" />
          </div>
          <h1 className="text-3xl font-semibold text-[#1D1D1F] mb-4">
            Products
          </h1>
          <p className="text-[#6E6E73] mb-6">
            Our products and services page is coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
