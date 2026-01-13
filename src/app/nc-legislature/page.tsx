'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NCRepresentative } from '@/types/ncleg/representative';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Users, 
  Building2, 
  MapPin, 
  X,
  ChevronRight,
  Menu,
  Home,
  Loader2,
  Info,
  Filter,
  Landmark
} from 'lucide-react';
import Link from 'next/link';

export default function NCLegislaturePage() {
  const [representatives, setRepresentatives] = useState<NCRepresentative[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [partyFilter, setPartyFilter] = useState<string>('all');
  const [countyFilter, setCountyFilter] = useState<string>('all');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading NC Representatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-10 w-10" />
            <h1 className="text-3xl font-bold">NC General Assembly</h1>
          </div>
          <p className="text-blue-100 text-lg">
            North Carolina House of Representatives • 2025-2026 Session
          </p>
          
          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{stats.total}</span>
              <span className="ml-2 text-blue-100">Total Members</span>
            </div>
            <div className="bg-red-500/20 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{stats.republicans}</span>
              <span className="ml-2 text-red-100">Republicans</span>
            </div>
            <div className="bg-blue-500/20 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{stats.democrats}</span>
              <span className="ml-2 text-blue-100">Democrats</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[250px]">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, county, or district..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-[150px]">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Party</label>
                <Select value={partyFilter} onValueChange={setPartyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Parties" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="all">All Parties</SelectItem>
                    <SelectItem value="R">Republican</SelectItem>
                    <SelectItem value="D">Democrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-[200px]">
                <label className="text-sm font-medium text-gray-700 mb-1 block">County</label>
                <Select value={countyFilter} onValueChange={setCountyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Counties" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="all">All Counties</SelectItem>
                    {counties.map(county => (
                      <SelectItem key={county} value={county}>{county}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(searchTerm || partyFilter !== 'all' || countyFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredReps.length} of {representatives.length} representatives
            </div>
          </CardContent>
        </Card>

        {/* Representatives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReps.map((rep) => (
            <Link 
              key={`${rep.chamber}-${rep.id}`} 
              href={`/nc-legislature/${rep.id}`}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <div className="flex gap-5">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                      {rep.photoBase64 ? (
                        <img
                          src={`data:${rep.photoMimeType || 'image/jpeg'};base64,${rep.photoBase64}`}
                          alt={rep.name}
                          className="w-56 h-72 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-56 h-72 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Users className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900">{rep.name}</h3>
                      <Badge 
                        variant={rep.party === 'R' ? 'destructive' : 'default'}
                        className={`mt-2 ${rep.party === 'R' ? 'bg-red-600' : 'bg-blue-600'}`}
                      >
                        {rep.party === 'R' ? 'Republican' : 'Democrat'}
                      </Badge>
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">District {rep.district}</span>
                        </div>
                        <div className="text-gray-600">
                          {rep.counties?.join(', ')}
                        </div>
                        {rep.biography?.occupation && (
                          <div className="text-sm text-gray-500 mt-2 pt-2 border-t">
                            {rep.biography.occupation}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredReps.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No representatives found matching your criteria.</p>
            <Button variant="link" onClick={clearFilters}>Clear filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}
