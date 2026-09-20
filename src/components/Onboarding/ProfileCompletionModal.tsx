'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Briefcase,
  MapPin,
  Phone,
  Building2,
  Loader2,
  Search,
  CheckCircle,
  X,
  Upload,
  Home,
  Award,
  Globe,
} from 'lucide-react';
import NonprofitSearchService from '@/services/NonprofitSearchService';
import { NonprofitOrganization } from '@/types/nonprofit.types';
import {
  EXPERTISE_OPTIONS,
  LANGUAGE_OPTIONS,
  NC_COUNTIES,
} from '@/types/chw-profile.types';

interface ProfileCompletionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProfileFormData) => Promise<void>;
  initialData?: Partial<ProfileFormData>;
  linkedOrganization?: { id: string; name: string } | null;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  photoURL?: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  bio: string;
  organization: string;
  organizationId?: string;
  title: string;
  yearsOfExperience: number;
  expertise: string[];
  languages: string[];
  region: string;
  primaryCounty: string;
  countiesServed: string[];
  certificationStatus: string;
  certificationNumber: string;
  certificationExpiration: string;
}

const NC_REGIONS = [
  { value: 'Region 1', label: 'Region 1 - Western' },
  { value: 'Region 2', label: 'Region 2 - Northwest' },
  { value: 'Region 3', label: 'Region 3 - Southwest' },
  { value: 'Region 4', label: 'Region 4 - Piedmont Triad' },
  { value: 'Region 5', label: 'Region 5 - Triangle' },
  { value: 'Region 6', label: 'Region 6 - Eastern' },
];

const CERTIFICATION_STATUSES = [
  { value: 'not_certified', label: 'Not Certified' },
  { value: 'certified', label: 'Certified' },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' },
];

export default function ProfileCompletionModal({
  open,
  onClose,
  onSave,
  initialData,
  linkedOrganization,
}: ProfileCompletionModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phone: initialData?.phone || '',
    photoURL: initialData?.photoURL || '',
    addressStreet: initialData?.addressStreet || '',
    addressCity: initialData?.addressCity || '',
    addressState: initialData?.addressState || 'NC',
    addressZipCode: initialData?.addressZipCode || '',
    bio: initialData?.bio || '',
    organization: initialData?.organization || '',
    organizationId: initialData?.organizationId || '',
    title: initialData?.title || '',
    yearsOfExperience: initialData?.yearsOfExperience || 0,
    expertise: initialData?.expertise || [],
    languages: initialData?.languages || ['English'],
    region: initialData?.region || '',
    primaryCounty: initialData?.primaryCounty || '',
    countiesServed: initialData?.countiesServed || [],
    certificationStatus: initialData?.certificationStatus || 'not_certified',
    certificationNumber: initialData?.certificationNumber || '',
    certificationExpiration: initialData?.certificationExpiration || '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoURL || null);

  // Organization search state
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [orgSearchResults, setOrgSearchResults] = useState<NonprofitOrganization[]>([]);
  const [existingOrgs, setExistingOrgs] = useState<NonprofitOrganization[]>([]);
  const [searchingOrgs, setSearchingOrgs] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<{ id: string; name: string } | null>(
    linkedOrganization || null
  );
  const [showOrgSearch, setShowOrgSearch] = useState(false);

  // Load existing nonprofits on mount
  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const orgs = await NonprofitSearchService.getAllNonprofits();
        setExistingOrgs(orgs);
      } catch (err) {
        console.error('Error loading organizations:', err);
      }
    };
    if (open) {
      loadOrgs();
    }
  }, [open]);

  // Update form data when initialData changes (e.g., when userProfile loads)
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        phone: initialData.phone || '',
        photoURL: initialData.photoURL || '',
        addressStreet: initialData.addressStreet || '',
        addressCity: initialData.addressCity || '',
        addressState: initialData.addressState || 'NC',
        addressZipCode: initialData.addressZipCode || '',
        bio: initialData.bio || '',
        organization: initialData.organization || '',
        organizationId: initialData.organizationId || '',
        title: initialData.title || '',
        yearsOfExperience: initialData.yearsOfExperience || 0,
        expertise: initialData.expertise || [],
        languages: initialData.languages || ['English'],
        region: initialData.region || '',
        primaryCounty: initialData.primaryCounty || '',
        countiesServed: initialData.countiesServed || [],
        certificationStatus: initialData.certificationStatus || 'not_certified',
        certificationNumber: initialData.certificationNumber || '',
        certificationExpiration: initialData.certificationExpiration || '',
      });
      setPhotoPreview(initialData.photoURL || null);
    }
  }, [initialData]);

  // Update selected org when linkedOrganization changes
  useEffect(() => {
    if (linkedOrganization) {
      setSelectedOrg(linkedOrganization);
      setFormData(prev => ({
        ...prev,
        organization: linkedOrganization.name,
        organizationId: linkedOrganization.id,
      }));
    }
  }, [linkedOrganization]);

  const handleChange = (field: keyof ProfileFormData, value: ProfileFormData[keyof ProfileFormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArraySelect = (field: 'expertise' | 'languages' | 'countiesServed', e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions).map(o => o.value);
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const max = 256;
        let { width, height } = img;
        if (width > height) {
          if (width > max) { height = Math.round(height * max / width); width = max; }
        } else if (height > max) {
          width = Math.round(width * max / height); height = max;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        handleChange('photoURL', dataUrl);
        setPhotoPreview(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Search organizations
  const handleOrgSearch = useCallback(async () => {
    if (orgSearchQuery.length < 2) {
      setOrgSearchResults([]);
      return;
    }
    setSearchingOrgs(true);
    try {
      const filtered = existingOrgs.filter(org =>
        org.name.toLowerCase().includes(orgSearchQuery.toLowerCase())
      );
      setOrgSearchResults(filtered);
    } catch (err) {
      console.error('Error searching organizations:', err);
    } finally {
      setSearchingOrgs(false);
    }
  }, [orgSearchQuery, existingOrgs]);

  // Search on query change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (orgSearchQuery.length >= 2) {
        handleOrgSearch();
      } else {
        setOrgSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [orgSearchQuery, handleOrgSearch]);

  // Select an organization
  const handleSelectOrg = (org: NonprofitOrganization) => {
    setSelectedOrg({ id: org.id!, name: org.name });
    setFormData(prev => ({
      ...prev,
      organization: org.name,
      organizationId: org.id,
    }));
    setShowOrgSearch(false);
    setOrgSearchQuery('');
    setOrgSearchResults([]);
  };

  // Clear selected organization
  const handleClearOrg = () => {
    setSelectedOrg(null);
    setFormData(prev => ({
      ...prev,
      organization: '',
      organizationId: '',
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = formData.firstName && formData.lastName;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Complete Your CHW Profile
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Please answer each section so we can build your full profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
              <User className="h-4 w-4" />
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo" className="flex items-center gap-2">
                <Upload className="h-3 w-3" />
                Profile Photo
              </Label>
              <div className="flex items-center gap-4">
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="h-16 w-16 rounded-full object-cover border border-slate-200"
                  />
                )}
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
              <Home className="h-4 w-4" />
              Address
            </h3>

            <div className="space-y-2">
              <Label htmlFor="addressStreet">Street</Label>
              <Input
                id="addressStreet"
                value={formData.addressStreet}
                onChange={(e) => handleChange('addressStreet', e.target.value)}
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressCity">City</Label>
                <Input
                  id="addressCity"
                  value={formData.addressCity}
                  onChange={(e) => handleChange('addressCity', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressState">State</Label>
                <Input
                  id="addressState"
                  value={formData.addressState}
                  onChange={(e) => handleChange('addressState', e.target.value)}
                  placeholder="NC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressZipCode">ZIP</Label>
                <Input
                  id="addressZipCode"
                  value={formData.addressZipCode}
                  onChange={(e) => handleChange('addressZipCode', e.target.value)}
                  placeholder="27514"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
              <Briefcase className="h-4 w-4" />
              Professional Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="organization" className="flex items-center gap-2">
                <Building2 className="h-3 w-3" />
                Organization
              </Label>

              {selectedOrg ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">{selectedOrg.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearOrg}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : showOrgSearch ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search organizations..."
                      value={orgSearchQuery}
                      onChange={(e) => setOrgSearchQuery(e.target.value)}
                      className="pl-10"
                      autoFocus
                    />
                    {searchingOrgs && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                    )}
                  </div>

                  {orgSearchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                      {orgSearchResults.map((org) => (
                        <div
                          key={org.id}
                          className="p-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                          onClick={() => handleSelectOrg(org)}
                        >
                          <div>
                            <p className="font-medium text-sm">{org.name}</p>
                            {org.address?.city && (
                              <p className="text-xs text-slate-500">
                                {org.address.city}, {org.address.state}
                              </p>
                            )}
                          </div>
                          <Building2 className="h-4 w-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}

                  {orgSearchQuery.length >= 2 && orgSearchResults.length === 0 && !searchingOrgs && (
                    <p className="text-sm text-slate-500 text-center py-2">No organizations found</p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowOrgSearch(false);
                        setOrgSearchQuery('');
                        setOrgSearchResults([]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (orgSearchQuery) {
                          handleChange('organization', orgSearchQuery);
                        }
                        setShowOrgSearch(false);
                        setOrgSearchQuery('');
                        setOrgSearchResults([]);
                      }}
                    >
                      Enter Manually
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => handleChange('organization', e.target.value)}
                    placeholder="Your organization name"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOrgSearch(true)}
                    className="shrink-0"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title / Role</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Community Health Worker"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min={0}
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us about your work in community health..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise" className="flex items-center gap-2">
                <Briefcase className="h-3 w-3" />
                Areas of Expertise (Ctrl/Cmd + click to select multiple)
              </Label>
              <select
                id="expertise"
                multiple
                value={formData.expertise}
                onChange={(e) => handleArraySelect('expertise', e)}
                className="w-full h-32 rounded-md border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EXPERTISE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages" className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                Languages (Ctrl/Cmd + click to select multiple)
              </Label>
              <select
                id="languages"
                multiple
                value={formData.languages}
                onChange={(e) => handleArraySelect('languages', e)}
                className="w-full h-32 rounded-md border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Area */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
              <MapPin className="h-4 w-4" />
              Service Area
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">NC Region</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => handleChange('region', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent>
                    {NC_REGIONS.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryCounty">Primary County</Label>
                <Select
                  value={formData.primaryCounty}
                  onValueChange={(value) => handleChange('primaryCounty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {NC_COUNTIES.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countiesServed">
                Counties Served (Ctrl/Cmd + click to select multiple)
              </Label>
              <select
                id="countiesServed"
                multiple
                value={formData.countiesServed}
                onChange={(e) => handleArraySelect('countiesServed', e)}
                className="w-full h-40 rounded-md border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {NC_COUNTIES.map((county) => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Certification */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
              <Award className="h-4 w-4" />
              Certification
            </h3>

            <div className="space-y-2">
              <Label htmlFor="certificationStatus">Certification Status</Label>
              <Select
                value={formData.certificationStatus}
                onValueChange={(value) => handleChange('certificationStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFICATION_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certificationNumber">Certification Number</Label>
                <Input
                  id="certificationNumber"
                  value={formData.certificationNumber}
                  onChange={(e) => handleChange('certificationNumber', e.target.value)}
                  placeholder="CHW-12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificationExpiration">Expiration Date</Label>
                <Input
                  id="certificationExpiration"
                  type="date"
                  value={formData.certificationExpiration}
                  onChange={(e) => handleChange('certificationExpiration', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
