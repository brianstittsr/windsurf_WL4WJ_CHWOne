'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NCRepresentative } from '@/types/ncleg/representative';
import { 
  Search, 
  Users, 
  Building2, 
  MapPin, 
  X,
  ChevronRight,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NCLegislaturePage() {
  const [representatives, setRepresentatives] = useState<NCRepresentative[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [partyFilter, setPartyFilter] = useState<string>('all');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchRepresentatives() {
      try {
        const q = query(collection(db, 'nc_representatives'), orderBy('lastName'));
        const snapshot = await getDocs(q);
        const reps = snapshot.docs.map(doc => doc.data() as NCRepresentative);
        setRepresentatives(reps);
      } catch (error) {
        console.error('Error fetching representatives:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRepresentatives();
  }, []);

  // Get unique counties for filter
  const counties = useMemo(() => {
    const allCounties = new Set<string>();
    representatives.forEach(rep => {
      rep.counties?.forEach(county => allCounties.add(county));
    });
    return Array.from(allCounties).sort();
  }, [representatives]);

  // Filter representatives
  const filteredReps = useMemo(() => {
    return representatives.filter(rep => {
      const matchesSearch = searchTerm === '' || 
        rep.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.counties?.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rep.district?.toString().includes(searchTerm);
      
      const matchesParty = partyFilter === 'all' || rep.party === partyFilter;
      const matchesCounty = countyFilter === 'all' || rep.counties?.includes(countyFilter);
      
      return matchesSearch && matchesParty && matchesCounty;
    });
  }, [representatives, searchTerm, partyFilter, countyFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: representatives.length,
    republicans: representatives.filter(r => r.party === 'R').length,
    democrats: representatives.filter(r => r.party === 'D').length,
  }), [representatives]);

  const clearFilters = () => {
    setSearchTerm('');
    setPartyFilter('all');
    setCountyFilter('all');
  };

  const hasActiveFilters = searchTerm || partyFilter !== 'all' || countyFilter !== 'all';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-[#86868B]">Loading NC Representatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Apple Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#0071E3] rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="text-[#6E6E73] text-sm font-medium">Total Members</p>
          </div>
          <p className="text-3xl font-semibold text-[#1D1D1F]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FF3B30] rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="text-[#6E6E73] text-sm font-medium">Republicans</p>
          </div>
          <p className="text-3xl font-semibold text-[#1D1D1F]">{stats.republicans}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#0071E3] rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="text-[#6E6E73] text-sm font-medium">Democrats</p>
          </div>
          <p className="text-3xl font-semibold text-[#1D1D1F]">{stats.democrats}</p>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#86868B]" />
                <input
                  type="text"
                  placeholder="Search by name, county, or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#F5F5F7] border-0 rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-[#F5F5F7] rounded-xl text-[#1D1D1F] font-medium"
            >
              <Filter className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-[#0071E3] rounded-full" />
              )}
            </button>

            {/* Desktop Filters */}
            <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-col sm:flex-row gap-4`}>
              {/* Party Filter */}
              <select
                value={partyFilter}
                onChange={(e) => setPartyFilter(e.target.value)}
                className="px-4 py-3 bg-[#F5F5F7] border-0 rounded-xl text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3] min-w-[150px]"
              >
                <option value="all">All Parties</option>
                <option value="R">Republican</option>
                <option value="D">Democrat</option>
              </select>

              {/* County Filter */}
              <select
                value={countyFilter}
                onChange={(e) => setCountyFilter(e.target.value)}
                className="px-4 py-3 bg-[#F5F5F7] border-0 rounded-xl text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3] min-w-[180px]"
              >
                <option value="all">All Counties</option>
                {counties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-xl transition-colors font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-[#D2D2D7]">
            <p className="text-sm text-[#86868B]">
              Showing <span className="font-semibold text-[#1D1D1F]">{filteredReps.length}</span> of {representatives.length} representatives
            </p>
          </div>
        </div>

        {/* Representatives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredReps.map((rep) => (
            <Link 
              key={`${rep.chamber}-${rep.id}`} 
              href={`/nc-legislature/${rep.id}`}
              className="group"
            >
              <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="p-5">
                  <div className="flex gap-4">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                      {rep.photoBase64 ? (
                        <img
                          src={`data:${rep.photoMimeType || 'image/jpeg'};base64,${rep.photoBase64}`}
                          alt={rep.name}
                          className="w-24 h-32 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-24 h-32 bg-[#F5F5F7] rounded-xl flex items-center justify-center">
                          <Users className="w-10 h-10 text-[#86868B]" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-[#1D1D1F] truncate">{rep.name}</h3>
                      
                      {/* Party Badge */}
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        rep.party === 'R' 
                          ? 'bg-[#FF3B30]/10 text-[#FF3B30]' 
                          : 'bg-[#0071E3]/10 text-[#0071E3]'
                      }`}>
                        {rep.party === 'R' ? 'Republican' : 'Democrat'}
                      </span>
                      
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-[#1D1D1F]">
                          <MapPin className="w-4 h-4 text-[#86868B]" />
                          <span className="font-medium text-sm">District {rep.district}</span>
                        </div>
                        <p className="text-sm text-[#6E6E73] line-clamp-1">
                          {rep.counties?.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Occupation */}
                  {rep.biography?.occupation && (
                    <div className="mt-4 pt-4 border-t border-[#D2D2D7]">
                      <p className="text-sm text-[#86868B] line-clamp-1">{rep.biography.occupation}</p>
                    </div>
                  )}
                </div>

                {/* View Details Footer */}
                <div className="px-5 py-3 bg-[#F5F5F7] border-t border-[#D2D2D7] flex items-center justify-between">
                  <span className="text-sm font-medium text-[#0071E3]">View Details</span>
                  <ChevronRight className="w-4 h-4 text-[#0071E3] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredReps.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#D2D2D7] p-12 text-center">
            <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#86868B]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">No representatives found</h3>
            <p className="text-[#6E6E73] mb-4">Try adjusting your search or filter criteria.</p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-[#0071E3] text-white rounded-xl font-medium text-sm hover:bg-[#0077ED] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
