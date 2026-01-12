'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NCRepresentative } from '@/types/ncleg/representative';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Users, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Vote, 
  Users2,
  ExternalLink,
  Filter,
  X
} from 'lucide-react';

export default function NCLegislaturePage() {
  const [representatives, setRepresentatives] = useState<NCRepresentative[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [partyFilter, setPartyFilter] = useState<string>('all');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [selectedRep, setSelectedRep] = useState<NCRepresentative | null>(null);
  const [detailTab, setDetailTab] = useState('bio');

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
            <Card 
              key={`${rep.chamber}-${rep.id}`} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRep(rep)}
            >
              <CardContent className="p-6">
                <div className="flex gap-5">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    {rep.photoBase64 ? (
                      <img
                        src={`data:${rep.photoMimeType || 'image/jpeg'};base64,${rep.photoBase64}`}
                        alt={rep.name}
                        className="w-28 h-36 object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-28 h-36 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Users className="h-10 w-10 text-gray-400" />
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
                  </div>
                </div>
              </CardContent>
            </Card>
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedRep} onOpenChange={() => setSelectedRep(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] z-[200]">
          {selectedRep && (
            <>
              <DialogHeader>
                <div className="flex gap-4">
                  {selectedRep.photoBase64 ? (
                    <img
                      src={`data:${selectedRep.photoMimeType || 'image/jpeg'};base64,${selectedRep.photoBase64}`}
                      alt={selectedRep.name}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <DialogTitle className="text-2xl">{selectedRep.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant={selectedRep.party === 'R' ? 'destructive' : 'default'}
                        className={selectedRep.party === 'R' ? 'bg-red-600' : 'bg-blue-600'}
                      >
                        {selectedRep.party === 'R' ? 'Republican' : 'Democrat'}
                      </Badge>
                      <span className="text-gray-600">District {selectedRep.district}</span>
                    </div>
                    <p className="text-gray-500 mt-1">{selectedRep.counties?.join(', ')}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedRep.termsInHouse} terms in House
                      {selectedRep.termsInSenate > 0 && `, ${selectedRep.termsInSenate} in Senate`}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="bio" className="gap-1">
                    <Users className="h-4 w-4" />
                    Bio
                  </TabsTrigger>
                  <TabsTrigger value="bills" className="gap-1">
                    <FileText className="h-4 w-4" />
                    Bills ({selectedRep.introducedBills?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="committees" className="gap-1">
                    <Users2 className="h-4 w-4" />
                    Committees
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="gap-1">
                    <Phone className="h-4 w-4" />
                    Contact
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[400px] mt-4">
                  <TabsContent value="bio" className="mt-0">
                    <div className="space-y-4">
                      {selectedRep.biography?.occupation && (
                        <div>
                          <h4 className="font-semibold text-gray-700">Occupation</h4>
                          <p className="text-gray-600">{selectedRep.biography.occupation}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-700">Status</h4>
                        <p className="text-gray-600 capitalize">
                          {selectedRep.status}
                          {selectedRep.statusDate && ` (${selectedRep.statusDate})`}
                        </p>
                      </div>
                      <div>
                        <a 
                          href={`https://www.ncleg.gov/Members/Biography/H/${selectedRep.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View on NC Legislature Website
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="bills" className="mt-0">
                    <div className="space-y-2">
                      {selectedRep.introducedBills?.length > 0 ? (
                        selectedRep.introducedBills.map((bill, idx) => (
                          <a
                            key={idx}
                            href={bill.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-semibold text-blue-600">{bill.billId}</span>
                                <p className="text-sm text-gray-600 mt-1">{bill.introducedDate}</p>
                              </div>
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </div>
                          </a>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No bills found</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="committees" className="mt-0">
                    <div className="space-y-2">
                      {selectedRep.committees?.length > 0 ? (
                        selectedRep.committees.map((committee, idx) => (
                          <a
                            key={idx}
                            href={committee.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-semibold text-gray-900">
                                  {committee.committeeName.split('\n')[0]}
                                </span>
                                <p className="text-sm text-gray-500 mt-1">
                                  {committee.role} • {committee.chamber === 'Joint' ? 'Joint' : 'House'}
                                </p>
                              </div>
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </div>
                          </a>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No committees found</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="mt-0">
                    <div className="space-y-4">
                      {selectedRep.contact?.legislativeOffice && (
                        <div>
                          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Legislative Office
                          </h4>
                          <p className="text-gray-600 mt-1">
                            {selectedRep.contact.legislativeOffice.address}
                          </p>
                          <p className="text-gray-600">
                            {selectedRep.contact.legislativeOffice.city}, {selectedRep.contact.legislativeOffice.state}
                          </p>
                        </div>
                      )}
                      
                      {selectedRep.contact?.mainPhone && (
                        <div>
                          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Phone
                          </h4>
                          <a 
                            href={`tel:${selectedRep.contact.mainPhone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {selectedRep.contact.mainPhone}
                          </a>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </h4>
                        <a 
                          href={`https://www.ncleg.gov/Members/ContactMember/H/${selectedRep.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Contact via NC Legislature
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
