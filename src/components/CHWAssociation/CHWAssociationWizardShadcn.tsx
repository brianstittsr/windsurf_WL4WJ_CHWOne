'use client';

import React, { useState } from 'react';
import { Check, Building, User, MapPin, Briefcase, Users, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface CHWAssociationWizardProps {
  onComplete: (associationId: string) => void;
  onClose?: () => void;
}

const STEPS = [
  { id: 0, title: 'Association', icon: Building },
  { id: 1, title: 'Leadership', icon: User },
  { id: 2, title: 'Coverage', icon: MapPin },
  { id: 3, title: 'Programs', icon: Briefcase },
  { id: 4, title: 'Membership', icon: Users },
  { id: 5, title: 'Review', icon: FileCheck },
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const PROGRAM_TYPES = [
  'CHW Training & Certification', 'Continuing Education', 'Professional Development',
  'Networking Events', 'Advocacy & Policy', 'Research & Data Collection',
  'Resource Coordination', 'Quality Assurance', 'Mentorship Programs',
  'Community Outreach', 'Grant Writing Support', 'Technical Assistance'
];

const MEMBERSHIP_TIERS = [
  'Individual CHW Members', 'Organizational Members', 'Student Members',
  'Associate Members', 'Honorary Members'
];

export function CHWAssociationWizardShadcn({ onComplete, onClose }: CHWAssociationWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    associationName: '',
    acronym: '',
    state: 'North Carolina',
    yearFounded: '',
    ein: '',
    mission: '',
    vision: '',
    website: '',
    executiveDirectorName: '',
    executiveDirectorEmail: '',
    executiveDirectorPhone: '',
    boardChairName: '',
    boardChairEmail: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    street: '',
    city: '',
    mailingState: 'North Carolina',
    zipCode: '',
    statewideCoverage: true,
    programsOffered: [] as string[],
    certificationProgram: false,
    trainingProgram: false,
    advocacyActivities: '',
    membershipTiers: [] as string[],
    currentMemberCount: '',
    chwMemberCount: '',
    annualMembershipFee: '',
    termsAccepted: false,
    dataSharing: false,
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'programsOffered' | 'membershipTiers', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const timestamp = Date.now();
      const associationId = `association-${timestamp}`;
      
      const associationData = {
        id: associationId,
        associationName: formData.associationName,
        acronym: formData.acronym,
        state: formData.state,
        yearFounded: parseInt(formData.yearFounded) || new Date().getFullYear(),
        ein: formData.ein,
        mission: formData.mission,
        vision: formData.vision,
        website: formData.website,
        leadership: {
          executiveDirector: {
            name: formData.executiveDirectorName,
            email: formData.executiveDirectorEmail,
            phone: formData.executiveDirectorPhone
          },
          boardChair: {
            name: formData.boardChairName,
            email: formData.boardChairEmail
          },
          primaryContact: {
            name: formData.primaryContactName,
            email: formData.primaryContactEmail,
            phone: formData.primaryContactPhone
          }
        },
        mailingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.mailingState,
          zipCode: formData.zipCode
        },
        coverage: {
          statewideCoverage: formData.statewideCoverage
        },
        programs: {
          offered: formData.programsOffered,
          certificationProgram: formData.certificationProgram,
          trainingProgram: formData.trainingProgram,
          advocacyActivities: formData.advocacyActivities
        },
        membership: {
          tiers: formData.membershipTiers,
          currentCount: parseInt(formData.currentMemberCount) || 0,
          chwCount: parseInt(formData.chwMemberCount) || 0,
          annualFee: formData.annualMembershipFee
        },
        verification: {
          termsAccepted: formData.termsAccepted,
          dataSharing: formData.dataSharing
        },
        status: 'pending',
        approvalStatus: 'pending',
        isActive: false,
        isApproved: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        metadata: {
          registrationSource: 'home_page_wizard_shadcn',
          needsReview: true
        }
      };
      
      const associationRef = doc(db, 'chwAssociations', associationId);
      await setDoc(associationRef, associationData);
      onComplete(associationId);
    } catch (error) {
      console.error('Error registering association:', error);
      alert('Failed to register association. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: return formData.associationName && formData.state;
      case 1: return formData.primaryContactName && formData.primaryContactEmail;
      case 2: return true;
      case 3: return formData.programsOffered.length > 0;
      case 4: return formData.termsAccepted;
      default: return true;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden">
      {/* Header with Steps */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 flex-shrink-0">
        <h2 className="text-lg font-bold mb-3 text-center">Register CHW Association</h2>
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                activeStep > index ? 'bg-white text-indigo-600' :
                activeStep === index ? 'bg-white/20 border-2 border-white' : 'bg-white/10'
              )}>
                {activeStep > index ? <Check className="h-3 w-3" /> : <step.icon className="h-3 w-3" />}
              </div>
              <span className="text-[10px] mt-1 hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {/* Step 0: Association Information */}
        {activeStep === 0 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div>
              <Label htmlFor="assocName">Association Name *</Label>
              <Input
                id="assocName"
                value={formData.associationName}
                onChange={(e) => updateField('associationName', e.target.value)}
                placeholder="e.g., North Carolina CHW Association"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="acronym">Acronym</Label>
                <Input
                  id="acronym"
                  value={formData.acronym}
                  onChange={(e) => updateField('acronym', e.target.value)}
                  placeholder="e.g., NCCHWA"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(v) => updateField('state', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearFounded">Year Founded</Label>
                <Input
                  id="yearFounded"
                  type="number"
                  value={formData.yearFounded}
                  onChange={(e) => updateField('yearFounded', e.target.value)}
                  placeholder="YYYY"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ein">EIN (Tax ID)</Label>
                <Input
                  id="ein"
                  value={formData.ein}
                  onChange={(e) => updateField('ein', e.target.value)}
                  placeholder="XX-XXXXXXX"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="mission">Mission Statement</Label>
              <Textarea
                id="mission"
                value={formData.mission}
                onChange={(e) => updateField('mission', e.target.value)}
                placeholder="Describe your association's mission..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>
        )}

        {/* Step 1: Leadership */}
        {activeStep === 1 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Executive Director</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="edName">Name</Label>
                  <Input
                    id="edName"
                    value={formData.executiveDirectorName}
                    onChange={(e) => updateField('executiveDirectorName', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edEmail">Email</Label>
                    <Input
                      id="edEmail"
                      type="email"
                      value={formData.executiveDirectorEmail}
                      onChange={(e) => updateField('executiveDirectorEmail', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edPhone">Phone</Label>
                    <Input
                      id="edPhone"
                      value={formData.executiveDirectorPhone}
                      onChange={(e) => updateField('executiveDirectorPhone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Primary Contact *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="pcName">Name *</Label>
                  <Input
                    id="pcName"
                    value={formData.primaryContactName}
                    onChange={(e) => updateField('primaryContactName', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="pcEmail">Email *</Label>
                    <Input
                      id="pcEmail"
                      type="email"
                      value={formData.primaryContactEmail}
                      onChange={(e) => updateField('primaryContactEmail', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pcPhone">Phone</Label>
                    <Input
                      id="pcPhone"
                      value={formData.primaryContactPhone}
                      onChange={(e) => updateField('primaryContactPhone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Mailing Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => updateField('street', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mailingState">State</Label>
                    <Select value={formData.mailingState} onValueChange={(v) => updateField('mailingState', v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP</Label>
                    <Input
                      id="zip"
                      value={formData.zipCode}
                      onChange={(e) => updateField('zipCode', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Coverage */}
        {activeStep === 2 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="statewide"
                    checked={formData.statewideCoverage}
                    onCheckedChange={(checked) => updateField('statewideCoverage', checked)}
                  />
                  <Label htmlFor="statewide">We provide statewide coverage for {formData.state}</Label>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  As a state CHW association, you will coordinate CHW activities, training, and advocacy across your entire state.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Programs */}
        {activeStep === 3 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div>
              <Label>Programs & Services Offered * (Select all that apply)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PROGRAM_TYPES.map(prog => (
                  <Badge
                    key={prog}
                    variant={formData.programsOffered.includes(prog) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('programsOffered', prog)}
                  >
                    {prog}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cert"
                  checked={formData.certificationProgram}
                  onCheckedChange={(checked) => updateField('certificationProgram', checked)}
                />
                <Label htmlFor="cert">Certification Program</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="training"
                  checked={formData.trainingProgram}
                  onCheckedChange={(checked) => updateField('trainingProgram', checked)}
                />
                <Label htmlFor="training">Training Program</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="advocacy">Advocacy Activities</Label>
              <Textarea
                id="advocacy"
                value={formData.advocacyActivities}
                onChange={(e) => updateField('advocacyActivities', e.target.value)}
                placeholder="Describe your advocacy and policy work..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 4: Membership */}
        {activeStep === 4 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div>
              <Label>Membership Tiers</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MEMBERSHIP_TIERS.map(tier => (
                  <Badge
                    key={tier}
                    variant={formData.membershipTiers.includes(tier) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('membershipTiers', tier)}
                  >
                    {tier}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="memberCount">Current Member Count</Label>
                <Input
                  id="memberCount"
                  type="number"
                  value={formData.currentMemberCount}
                  onChange={(e) => updateField('currentMemberCount', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="chwCount">CHW Members</Label>
                <Input
                  id="chwCount"
                  type="number"
                  value={formData.chwMemberCount}
                  onChange={(e) => updateField('chwMemberCount', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <Card className="mt-6">
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => updateField('termsAccepted', checked)}
                  />
                  <div>
                    <Label htmlFor="terms" className="font-medium">Terms of Service *</Label>
                    <p className="text-sm text-gray-500">
                      I accept the CHWOne Platform Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="dataSharing"
                    checked={formData.dataSharing}
                    onCheckedChange={(checked) => updateField('dataSharing', checked)}
                  />
                  <div>
                    <Label htmlFor="dataSharing" className="font-medium">Data Sharing</Label>
                    <p className="text-sm text-gray-500">
                      I agree to share association information with CHWs and organizations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Review */}
        {activeStep === 5 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Association</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><strong>Name:</strong> {formData.associationName} {formData.acronym && `(${formData.acronym})`}</p>
                <p><strong>State:</strong> {formData.state}</p>
                {formData.mission && <p><strong>Mission:</strong> {formData.mission}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Contact</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><strong>Primary Contact:</strong> {formData.primaryContactName}</p>
                <p><strong>Email:</strong> {formData.primaryContactEmail}</p>
                {formData.city && <p><strong>Location:</strong> {formData.city}, {formData.mailingState}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {formData.programsOffered.map(prog => (
                    <Badge key={prog} variant="secondary" className="text-xs">{prog}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Membership</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{formData.membershipTiers.length} membership tiers</p>
                {formData.currentMemberCount && <p>{formData.currentMemberCount} current members</p>}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 px-4 py-3 flex justify-between flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => activeStep > 0 ? setActiveStep(activeStep - 1) : onClose?.()}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        
        {activeStep < STEPS.length - 1 ? (
          <Button size="sm" onClick={() => setActiveStep(activeStep + 1)} disabled={!canProceed()}>
            Next
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
        )}
      </div>
    </div>
  );
}
