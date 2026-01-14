'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Building2, 
  Link2, 
  Unlink, 
  Loader2, 
  CheckCircle,
  DollarSign,
  MapPin,
  FileText,
  ExternalLink,
  Plus,
  X
} from 'lucide-react';
import NonprofitSearchService, { NonprofitSearchResult, NonprofitDetails } from '@/services/NonprofitSearchService';
import { NonprofitOrganization, MedicaidRegion } from '@/types/nonprofit.types';
import { doc, updateDoc, getDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrganizationTag } from '@/types/chw-profile.types';

interface NonprofitLinkerProps {
  currentNonprofitId?: string;
  onNonprofitLinked?: (nonprofitId: string) => void;
  onNonprofitUnlinked?: () => void;
}

const formatCurrency = (amount: number): string => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function NonprofitLinker({
  currentNonprofitId,
  onNonprofitLinked,
  onNonprofitUnlinked,
}: NonprofitLinkerProps) {
  const { currentUser, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NonprofitSearchResult[]>([]);
  const [existingNonprofits, setExistingNonprofits] = useState<NonprofitOrganization[]>([]);
  const [selectedNonprofit, setSelectedNonprofit] = useState<NonprofitDetails | null>(null);
  const [linkedNonprofit, setLinkedNonprofit] = useState<NonprofitOrganization | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addFormData, setAddFormData] = useState({
    medicaidRegion: MedicaidRegion.REGION_5,
    primaryContact: '',
    contactEmail: '',
    contactPhone: '',
  });

  // Load existing nonprofits and current linked nonprofit
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const nonprofits = await NonprofitSearchService.getAllNonprofits();
        setExistingNonprofits(nonprofits);

        if (currentNonprofitId) {
          const linked = nonprofits.find(np => np.id === currentNonprofitId);
          if (linked) {
            setLinkedNonprofit(linked);
          }
        }
      } catch (err) {
        console.error('Error loading nonprofits:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentNonprofitId]);

  // Debounced search
  const handleSearch = useCallback(async () => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const { nonprofits } = await NonprofitSearchService.searchNonprofits(searchQuery);
      setSearchResults(nonprofits);
    } catch (err) {
      setError('Failed to search nonprofits. Please try again.');
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  // Search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Select a nonprofit from search results
  const handleSelectNonprofit = async (result: NonprofitSearchResult) => {
    setLoading(true);
    setError(null);

    try {
      // Check if already in our system
      const existing = await NonprofitSearchService.findNonprofitByEin(result.ein);
      
      if (existing) {
        // Already exists, link directly
        await linkToNonprofit(existing.id!);
      } else {
        // Need to fetch details and add to system
        const details = await NonprofitSearchService.getNonprofitDetails(result.ein);
        setSelectedNonprofit(details);
        setShowAddDialog(true);
      }
    } catch (err) {
      setError('Failed to get nonprofit details. Please try again.');
      console.error('Error selecting nonprofit:', err);
    } finally {
      setLoading(false);
    }
  };

  // Link to an existing nonprofit in our system
  const handleSelectExisting = async (nonprofit: NonprofitOrganization) => {
    await linkToNonprofit(nonprofit.id!);
  };

  // Save new nonprofit and link
  const handleSaveAndLink = async () => {
    if (!selectedNonprofit || !currentUser?.uid) return;

    setSaving(true);
    setError(null);

    try {
      const savedNonprofit = await NonprofitSearchService.saveNonprofitFromSearch(
        selectedNonprofit,
        currentUser.uid,
        {
          medicaidRegion: addFormData.medicaidRegion,
          primaryContact: addFormData.primaryContact,
          contactEmail: addFormData.contactEmail,
          contactPhone: addFormData.contactPhone,
        }
      );

      await linkToNonprofit(savedNonprofit.id!);
      setShowAddDialog(false);
      setSelectedNonprofit(null);
      setSearchResults([]);
      setSearchQuery('');
    } catch (err) {
      setError('Failed to save nonprofit. Please try again.');
      console.error('Error saving nonprofit:', err);
    } finally {
      setSaving(false);
    }
  };

  // Link CHW to nonprofit
  const linkToNonprofit = async (nonprofitId: string, nonprofitData?: NonprofitOrganization) => {
    if (!currentUser?.uid) return;

    try {
      // Link CHW to nonprofit
      await NonprofitSearchService.linkCHWToNonprofit(currentUser.uid, nonprofitId);

      // Get the nonprofit data if not provided
      let nonprofit = nonprofitData || existingNonprofits.find(np => np.id === nonprofitId);
      
      if (!nonprofit) {
        // Try to fetch from Firebase
        const nonprofitRef = doc(db, 'nonprofit_organizations', nonprofitId);
        const nonprofitSnap = await getDoc(nonprofitRef);
        if (nonprofitSnap.exists()) {
          nonprofit = { id: nonprofitSnap.id, ...nonprofitSnap.data() } as NonprofitOrganization;
        }
      }

      // Create organization tag
      const organizationTag: OrganizationTag = {
        id: nonprofitId,
        name: nonprofit?.name || 'Unknown Organization',
        ein: nonprofit?.ein,
        claimedAt: new Date().toISOString(),
      };

      // Update user profile with nonprofit ID and add organization tag
      await updateDoc(doc(db, 'users', currentUser.uid), {
        linkedNonprofitId: nonprofitId,
        organizationTags: arrayUnion(organizationTag),
        updatedAt: serverTimestamp(),
      });

      // Also update CHW profile if it exists
      try {
        const chwProfileRef = doc(db, 'chwProfiles', currentUser.uid);
        const chwProfileSnap = await getDoc(chwProfileRef);
        if (chwProfileSnap.exists()) {
          await updateDoc(chwProfileRef, {
            organizationTags: arrayUnion(organizationTag),
            'serviceArea.nonprofitOrganizationId': nonprofitId,
            'serviceArea.nonprofitOrganizationName': nonprofit?.name || 'Unknown Organization',
            updatedAt: serverTimestamp(),
          });
        }
      } catch (chwErr) {
        console.log('CHW profile update skipped (may not exist):', chwErr);
      }

      // Update local state
      if (nonprofit) {
        setLinkedNonprofit(nonprofit);
      }

      console.log('Successfully linked to nonprofit and added organization tag:', organizationTag);
      onNonprofitLinked?.(nonprofitId);
    } catch (err) {
      setError('Failed to link to nonprofit. Please try again.');
      console.error('Error linking to nonprofit:', err);
    }
  };

  // Unlink from nonprofit
  const handleUnlink = async () => {
    if (!currentUser?.uid || !linkedNonprofit?.id) return;

    setLoading(true);
    setError(null);

    try {
      await NonprofitSearchService.unlinkCHWFromNonprofit(currentUser.uid, linkedNonprofit.id);

      // Update user profile
      await updateDoc(doc(db, 'users', currentUser.uid), {
        linkedNonprofitId: null,
        updatedAt: serverTimestamp(),
      });

      setLinkedNonprofit(null);
      onNonprofitUnlinked?.();
    } catch (err) {
      setError('Failed to unlink from nonprofit. Please try again.');
      console.error('Error unlinking:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !linkedNonprofit && existingNonprofits.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Currently Linked Nonprofit */}
      {linkedNonprofit && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg text-green-800">Linked Organization</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlink}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Unlink className="h-4 w-4 mr-1" />
                Unlink
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900">{linkedNonprofit.name}</h3>
              {linkedNonprofit.ein && (
                <p className="text-sm text-slate-600">EIN: {linkedNonprofit.ein}</p>
              )}
              {linkedNonprofit.address && (
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {linkedNonprofit.address.city}, {linkedNonprofit.address.state}
                </p>
              )}
              {linkedNonprofit.irsData?.revenueAmount && (
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Annual Revenue: {formatCurrency(linkedNonprofit.irsData.revenueAmount)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Section */}
      {!linkedNonprofit && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Link to a Nonprofit Organization
              </CardTitle>
              <CardDescription>
                Search for your organization or select from existing nonprofits in the system.
                If not found, we&apos;ll search the IRS database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Search Input */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by organization name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching || searchQuery.length < 2}>
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>

              {/* Existing Nonprofits */}
              {existingNonprofits.length > 0 && searchResults.length === 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Organizations in System</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {existingNonprofits.slice(0, 5).map((np) => (
                      <div
                        key={np.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                        onClick={() => handleSelectExisting(np)}
                      >
                        <div>
                          <p className="font-medium text-sm">{np.name}</p>
                          <p className="text-xs text-slate-500">
                            {np.address?.city}, {np.address?.state}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Search Results (IRS Database)</Label>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.ein}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                        onClick={() => handleSelectNonprofit(result)}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{result.name}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {result.city}, {result.state}
                            </span>
                            {result.revenueAmount > 0 && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(result.revenueAmount)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          EIN: {result.ein}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No results found. Try a different search term.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Nonprofit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Organization to System
            </DialogTitle>
            <DialogDescription>
              This organization will be added to CHWOne with IRS financial data.
            </DialogDescription>
          </DialogHeader>

          {selectedNonprofit && (
            <div className="space-y-4">
              {/* Nonprofit Info */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">{selectedNonprofit.name}</h3>
                <p className="text-sm text-slate-600">EIN: {selectedNonprofit.ein}</p>
                {selectedNonprofit.address && (
                  <p className="text-sm text-slate-600">
                    {selectedNonprofit.address.street}, {selectedNonprofit.address.city}, {selectedNonprofit.address.state} {selectedNonprofit.address.zipCode}
                  </p>
                )}
                <div className="flex gap-4 pt-2">
                  <div>
                    <p className="text-xs text-slate-500">Annual Revenue</p>
                    <p className="font-medium">{formatCurrency(selectedNonprofit.revenueAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Assets</p>
                    <p className="font-medium">{formatCurrency(selectedNonprofit.assetAmount)}</p>
                  </div>
                </div>
                {selectedNonprofit.filings?.length > 0 && (
                  <div className="pt-2">
                    <a
                      href={selectedNonprofit.filings[0].pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      View Latest 990 Filing
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Additional Info Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Medicaid Region</Label>
                  <Select
                    value={addFormData.medicaidRegion}
                    onValueChange={(value) => setAddFormData(prev => ({ ...prev, medicaidRegion: value as MedicaidRegion }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(MedicaidRegion).map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Primary Contact Name</Label>
                  <Input
                    value={addFormData.primaryContact}
                    onChange={(e) => setAddFormData(prev => ({ ...prev, primaryContact: e.target.value }))}
                    placeholder="Contact person name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input
                      type="email"
                      value={addFormData.contactEmail}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="email@org.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input
                      type="tel"
                      value={addFormData.contactPhone}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAndLink} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Add & Link
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
