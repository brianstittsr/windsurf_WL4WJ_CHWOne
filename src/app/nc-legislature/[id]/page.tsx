'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NCRepresentative } from '@/types/ncleg/representative';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Users, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Users2,
  ExternalLink,
  Briefcase,
  Calendar,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function RepresentativeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [representative, setRepresentative] = useState<NCRepresentative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepresentative() {
      if (!id) return;
      
      try {
        // The ID format is "H-{memberId}" in Firebase
        const docRef = doc(db, 'nc_representatives', `H-${id}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setRepresentative(docSnap.data() as NCRepresentative);
        } else {
          setError('Representative not found');
        }
      } catch (err) {
        console.error('Error fetching representative:', err);
        setError('Failed to load representative data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRepresentative();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading representative...</p>
        </div>
      </div>
    );
  }

  if (error || !representative) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Representative Not Found</h2>
          <p className="text-gray-500 mb-4">{error || 'The requested representative could not be found.'}</p>
          <Link href="/nc-legislature">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const rep = representative;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/nc-legislature" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="flex-shrink-0">
              {rep.photoBase64 ? (
                <img
                  src={`data:${rep.photoMimeType || 'image/jpeg'};base64,${rep.photoBase64}`}
                  alt={rep.name}
                  className="w-48 h-64 object-cover rounded-xl shadow-2xl border-4 border-white/20"
                />
              ) : (
                <div className="w-48 h-64 bg-blue-800 rounded-xl flex items-center justify-center border-4 border-white/20">
                  <Users className="h-20 w-20 text-blue-300" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{rep.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge 
                  className={`text-lg px-4 py-1 ${rep.party === 'R' ? 'bg-red-600' : 'bg-blue-500'}`}
                >
                  {rep.party === 'R' ? 'Republican' : 'Democrat'}
                </Badge>
                <span className="text-xl text-blue-100">District {rep.district}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{rep.counties?.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{rep.termsInHouse} terms in House{rep.termsInSenate > 0 && `, ${rep.termsInSenate} in Senate`}</span>
                </div>
                {rep.biography?.occupation && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    <span>{rep.biography.occupation}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="capitalize">{rep.status}{rep.statusDate && ` (${rep.statusDate})`}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <a 
                  href={`https://www.ncleg.gov/Members/Biography/H/${rep.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                >
                  View on NC Legislature Website
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="contact" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="contact" className="gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="bills" className="gap-2">
              <FileText className="h-4 w-4" />
              Bills ({rep.introducedBills?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="committees" className="gap-2">
              <Users2 className="h-4 w-4" />
              Committees ({rep.committees?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="votes" className="gap-2">
              <Award className="h-4 w-4" />
              Votes
            </TabsTrigger>
          </TabsList>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Legislative Office
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-700">{rep.contact?.legislativeOffice?.address || '16 West Jones Street'}</p>
                  <p className="text-gray-700">{rep.contact?.legislativeOffice?.city || 'Raleigh'}, {rep.contact?.legislativeOffice?.state || 'NC'}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Phone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rep.contact?.mainPhone ? (
                    <a 
                      href={`tel:${rep.contact.mainPhone}`}
                      className="text-blue-600 hover:underline text-lg"
                    >
                      {rep.contact.mainPhone}
                    </a>
                  ) : (
                    <p className="text-gray-500">No phone number available</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Representative
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={`https://www.ncleg.gov/Members/ContactMember/H/${rep.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    Send a message via NC Legislature website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bills Tab */}
          <TabsContent value="bills">
            <Card>
              <CardHeader>
                <CardTitle>Introduced Bills</CardTitle>
              </CardHeader>
              <CardContent>
                {rep.introducedBills?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rep.introducedBills.map((bill, idx) => (
                      <a
                        key={idx}
                        href={bill.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-blue-600 text-lg">{bill.billId}</span>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{bill.introducedDate}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No bills found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Committees Tab */}
          <TabsContent value="committees">
            <Card>
              <CardHeader>
                <CardTitle>Committee Memberships</CardTitle>
              </CardHeader>
              <CardContent>
                {rep.committees?.length > 0 ? (
                  <div className="space-y-3">
                    {rep.committees.map((committee, idx) => (
                      <a
                        key={idx}
                        href={committee.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-gray-900">
                              {committee.committeeName.split('\n')[0]}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {committee.role}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {committee.chamber === 'Joint' ? 'Joint Committee' : 'House Committee'}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No committee memberships found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Votes Tab */}
          <TabsContent value="votes">
            <Card>
              <CardHeader>
                <CardTitle>Voting Record</CardTitle>
              </CardHeader>
              <CardContent>
                {rep.votes?.length > 0 ? (
                  <div className="space-y-2">
                    {rep.votes.map((vote, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border"
                      >
                        <div>
                          <span className="font-semibold text-blue-600">{vote.billId}</span>
                          <span className="text-gray-500 ml-2">{vote.voteDate}</span>
                        </div>
                        <Badge 
                          variant={vote.vote === 'Aye' ? 'default' : vote.vote === 'No' ? 'destructive' : 'secondary'}
                          className={vote.vote === 'Aye' ? 'bg-green-600' : ''}
                        >
                          {vote.vote}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No voting records available in our database.</p>
                    <a 
                      href={`https://www.ncleg.gov/Members/Votes/H/${rep.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      View voting record on NC Legislature website
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
