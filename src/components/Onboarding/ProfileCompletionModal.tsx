'use client';

import React, { useState } from 'react';
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
  Loader2
} from 'lucide-react';

interface ProfileCompletionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProfileFormData) => Promise<void>;
  initialData?: Partial<ProfileFormData>;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  organization: string;
  title: string;
  region: string;
  bio: string;
}

const NC_REGIONS = [
  { value: 'Region 1', label: 'Region 1 - Western' },
  { value: 'Region 2', label: 'Region 2 - Northwest' },
  { value: 'Region 3', label: 'Region 3 - Southwest' },
  { value: 'Region 4', label: 'Region 4 - Piedmont Triad' },
  { value: 'Region 5', label: 'Region 5 - Triangle' },
  { value: 'Region 6', label: 'Region 6 - Eastern' },
];

export default function ProfileCompletionModal({ 
  open, 
  onClose, 
  onSave,
  initialData 
}: ProfileCompletionModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phone: initialData?.phone || '',
    organization: initialData?.organization || '',
    title: initialData?.title || '',
    region: initialData?.region || '',
    bio: initialData?.bio || '',
  });

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Help us personalize your experience by providing some basic information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Basic Information Section */}
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
          </div>

          {/* Professional Information Section */}
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
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => handleChange('organization', e.target.value)}
                placeholder="Your organization name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Job Title / Role</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Community Health Worker, Program Manager"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                NC Region
              </Label>
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
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us a bit about yourself and your work in community health..."
                rows={3}
              />
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
