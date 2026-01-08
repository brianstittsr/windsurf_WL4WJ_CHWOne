'use client';

import React, { useState } from 'react';
import { Check, Building2, User, Briefcase, MapPin, Shield, FileCheck, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { NonprofitSearchClaim } from './NonprofitSearchClaim';

interface NonprofitWizardProps {
  onComplete: (nonprofitId: string) => void;
  onClose?: () => void;
}

const STEPS = [
  { id: 0, title: 'Find Org', icon: Search },
  { id: 1, title: 'Organization', icon: Building2 },
  { id: 2, title: 'Contact', icon: User },
  { id: 3, title: 'Services', icon: Briefcase },
  { id: 4, title: 'Service Area', icon: MapPin },
  { id: 5, title: 'Verification', icon: Shield },
  { id: 6, title: 'Review', icon: FileCheck },
];

const NC_COUNTIES = [
  'Alamance', 'Alexander', 'Alleghany', 'Anson', 'Ashe', 'Avery', 'Beaufort', 'Bertie',
  'Bladen', 'Brunswick', 'Buncombe', 'Burke', 'Cabarrus', 'Caldwell', 'Camden', 'Carteret',
  'Caswell', 'Catawba', 'Chatham', 'Cherokee', 'Chowan', 'Clay', 'Cleveland', 'Columbus',
  'Craven', 'Cumberland', 'Currituck', 'Dare', 'Davidson', 'Davie', 'Duplin', 'Durham',
  'Edgecombe', 'Forsyth', 'Franklin', 'Gaston', 'Gates', 'Graham', 'Granville', 'Greene',
  'Guilford', 'Halifax', 'Harnett', 'Haywood', 'Henderson', 'Hertford', 'Hoke', 'Hyde',
  'Iredell', 'Jackson', 'Johnston', 'Jones', 'Lee', 'Lenoir', 'Lincoln', 'Macon', 'Madison',
  'Martin', 'McDowell', 'Mecklenburg', 'Mitchell', 'Montgomery', 'Moore', 'Nash', 'New Hanover',
  'Northampton', 'Onslow', 'Orange', 'Pamlico', 'Pasquotank', 'Pender', 'Perquimans', 'Person',
  'Pitt', 'Polk', 'Randolph', 'Richmond', 'Robeson', 'Rockingham', 'Rowan', 'Rutherford',
  'Sampson', 'Scotland', 'Stanly', 'Stokes', 'Surry', 'Swain', 'Transylvania', 'Tyrrell',
  'Union', 'Vance', 'Wake', 'Warren', 'Washington', 'Watauga', 'Wayne', 'Wilkes', 'Wilson',
  'Yadkin', 'Yancey'
];

const SERVICE_CATEGORIES = [
  'Healthcare Services', 'Mental Health Services', 'Substance Abuse Treatment',
  'Housing Assistance', 'Food Security', 'Transportation', 'Employment Services',
  'Education & Training', 'Legal Services', 'Financial Assistance', 'Childcare Services',
  'Senior Services', 'Disability Services', 'Crisis Intervention', 'Community Health Programs'
];

const ORGANIZATION_TYPES = [
  '501(c)(3) Nonprofit', 'Faith-Based Organization', 'Community Health Center',
  'Hospital/Health System', 'Government Agency', 'Community-Based Organization', 'Foundation', 'Other'
];

// IRS Data interface for claimed organizations
interface ClaimedIRSData {
  ein: string;
  organizationName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  nteeCode?: string;
  subsectionCode?: number;
  rulingDate?: string;
  assetAmount?: number;
  incomeAmount?: number;
  revenueAmount?: number;
  latestFiling?: {
    taxYear: number;
    pdfUrl: string;
    totalRevenue: number;
    totalExpenses: number;
    totalAssets?: number;
    totalLiabilities?: number;
  };
  filingHistory?: Array<{
    taxYear: number;
    pdfUrl: string;
    totalRevenue: number;
    totalExpenses: number;
    totalAssets: number;
  }>;
}

export function NonprofitWizardShadcn({ onComplete, onClose }: NonprofitWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimedIRSData, setClaimedIRSData] = useState<ClaimedIRSData | null>(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    ein: '',
    yearEstablished: '',
    mission: '',
    website: '',
    primaryContactName: '',
    primaryContactTitle: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    organizationPhone: '',
    organizationEmail: '',
    street: '',
    city: '',
    state: 'NC',
    zipCode: '',
    serviceCategories: [] as string[],
    servicesDescription: '',
    eligibilityCriteria: '',
    operatingHours: '',
    acceptsReferrals: true,
    referralProcess: '',
    serviceCounties: [] as string[],
    statewideCoverage: false,
    nonprofitStatus: false,
    dataSharing: false,
    termsAccepted: false,
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'serviceCategories' | 'serviceCounties', item: string) => {
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
      const nonprofitId = `nonprofit-${timestamp}`;
      
      // Build IRS data object if organization was claimed from IRS search
      const irsData = claimedIRSData ? {
        ein: claimedIRSData.ein,
        organizationName: claimedIRSData.organizationName,
        irsAddress: claimedIRSData.address ? {
          street: claimedIRSData.address,
          city: claimedIRSData.city || '',
          state: claimedIRSData.state || '',
          zipCode: claimedIRSData.zipCode || '',
        } : undefined,
        nteeCode: claimedIRSData.nteeCode,
        subsectionCode: claimedIRSData.subsectionCode,
        rulingDate: claimedIRSData.rulingDate,
        assetAmount: claimedIRSData.assetAmount,
        incomeAmount: claimedIRSData.incomeAmount,
        revenueAmount: claimedIRSData.revenueAmount,
        latestFiling: claimedIRSData.latestFiling ? {
          taxPeriod: 0,
          taxYear: claimedIRSData.latestFiling.taxYear,
          formType: 990,
          pdfUrl: claimedIRSData.latestFiling.pdfUrl,
          totalRevenue: claimedIRSData.latestFiling.totalRevenue,
          totalExpenses: claimedIRSData.latestFiling.totalExpenses,
          totalAssets: claimedIRSData.latestFiling.totalAssets || 0,
          totalLiabilities: claimedIRSData.latestFiling.totalLiabilities,
        } : undefined,
        filingHistory: claimedIRSData.filingHistory?.map(f => ({
          taxPeriod: 0,
          taxYear: f.taxYear,
          formType: 990,
          pdfUrl: f.pdfUrl,
          totalRevenue: f.totalRevenue,
          totalExpenses: f.totalExpenses,
          totalAssets: f.totalAssets,
        })),
        dataSource: 'propublica' as const,
        lastUpdated: serverTimestamp(),
      } : undefined;
      
      const nonprofitData = {
        id: nonprofitId,
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        ein: formData.ein,
        yearEstablished: parseInt(formData.yearEstablished) || new Date().getFullYear(),
        mission: formData.mission,
        website: formData.website,
        primaryContact: {
          name: formData.primaryContactName,
          title: formData.primaryContactTitle,
          email: formData.primaryContactEmail,
          phone: formData.primaryContactPhone
        },
        organizationContact: {
          phone: formData.organizationPhone,
          email: formData.organizationEmail
        },
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        services: {
          categories: formData.serviceCategories,
          description: formData.servicesDescription,
          eligibilityCriteria: formData.eligibilityCriteria,
          operatingHours: formData.operatingHours,
          acceptsReferrals: formData.acceptsReferrals,
          referralProcess: formData.referralProcess
        },
        serviceArea: {
          statewideCoverage: formData.statewideCoverage,
          countiesServed: formData.serviceCounties
        },
        verification: {
          nonprofitStatus: formData.nonprofitStatus,
          dataSharing: formData.dataSharing,
          termsAccepted: formData.termsAccepted
        },
        // IRS Data (enriched from ProPublica)
        irsData: irsData,
        irsVerified: !!claimedIRSData,
        irsClaimedAt: claimedIRSData ? serverTimestamp() : null,
        status: 'pending',
        approvalStatus: 'pending',
        isActive: false,
        isApproved: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        metadata: {
          registrationSource: 'home_page_wizard_shadcn',
          needsReview: true,
          claimedFromIRS: !!claimedIRSData,
        }
      };
      
      const nonprofitRef = doc(db, 'nonprofits', nonprofitId);
      await setDoc(nonprofitRef, nonprofitData);
      onComplete(nonprofitId);
    } catch (error) {
      console.error('Error registering nonprofit:', error);
      alert('Failed to register nonprofit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: return true; // Search step - always can proceed (skip or claim)
      case 1: return formData.organizationName && formData.organizationType;
      case 2: return formData.primaryContactName && formData.primaryContactEmail;
      case 3: return formData.serviceCategories.length > 0;
      case 4: return formData.statewideCoverage || formData.serviceCounties.length > 0;
      case 5: return formData.nonprofitStatus && formData.termsAccepted;
      default: return true;
    }
  };

  // Handle claiming an organization from IRS search
  const handleClaimOrganization = (org: any) => {
    // Store full IRS data for later submission
    setClaimedIRSData({
      ein: org.ein || '',
      organizationName: org.organizationName || '',
      address: org.address || '',
      city: org.city || '',
      state: org.state || '',
      zipCode: org.zipCode || '',
      nteeCode: org.nteeCode || '',
      subsectionCode: org.subsectionCode,
      rulingDate: org.rulingDate || '',
      assetAmount: org.assetAmount,
      incomeAmount: org.incomeAmount,
      revenueAmount: org.revenueAmount,
      latestFiling: org.latestFiling ? {
        taxYear: org.latestFiling.taxYear,
        pdfUrl: org.latestFiling.pdfUrl || '',
        totalRevenue: org.latestFiling.totalRevenue || 0,
        totalExpenses: org.latestFiling.totalExpenses || 0,
        totalAssets: org.latestFiling.totalAssets,
        totalLiabilities: org.latestFiling.totalLiabilities,
      } : undefined,
      filingHistory: org.filingHistory || [],
    });

    // Determine organization type from subsection code
    let orgType = '501(c)(3) Nonprofit';
    if (org.subsectionCode === 4) orgType = '501(c)(4) Social Welfare';
    else if (org.subsectionCode === 6) orgType = '501(c)(6) Business League';
    else if (org.subsectionCode) orgType = `501(c)(${org.subsectionCode}) Nonprofit`;

    // Pre-fill form data from claimed organization
    setFormData(prev => ({
      ...prev,
      organizationName: org.organizationName || '',
      ein: org.ein || '',
      organizationType: orgType,
      street: org.address || '',
      city: org.city || '',
      state: org.state || 'NC',
      zipCode: org.zipCode || '',
      website: '',
      mission: '',
      // Pre-check nonprofit status since it's verified from IRS
      nonprofitStatus: true,
    }));
    // Move to next step (Organization details)
    setActiveStep(1);
  };

  // Handle skipping the search step
  const handleSkipSearch = () => {
    setActiveStep(1);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden">
      {/* Header with Steps */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-3 flex-shrink-0">
        <h2 className="text-lg font-bold mb-3 text-center">Register Your Organization</h2>
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                activeStep > index ? 'bg-white text-teal-600' :
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
        {/* Step 0: Search and Claim */}
        {activeStep === 0 && (
          <NonprofitSearchClaim 
            onClaim={handleClaimOrganization}
            onSkip={handleSkipSearch}
          />
        )}

        {/* Step 1: Organization Information */}
        {activeStep === 1 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div>
              <Label htmlFor="orgName">Organization Name *</Label>
              <Input
                id="orgName"
                value={formData.organizationName}
                onChange={(e) => updateField('organizationName', e.target.value)}
                placeholder="Enter organization name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="orgType">Organization Type *</Label>
              <Select value={formData.organizationType} onValueChange={(v) => updateField('organizationType', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZATION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="year">Year Established</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.yearEstablished}
                  onChange={(e) => updateField('yearEstablished', e.target.value)}
                  placeholder="YYYY"
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
                placeholder="Describe your organization's mission..."
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

        {/* Step 2: Contact Details */}
        {activeStep === 2 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Primary Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="contactName">Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.primaryContactName}
                      onChange={(e) => updateField('primaryContactName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactTitle">Title</Label>
                    <Input
                      id="contactTitle"
                      value={formData.primaryContactTitle}
                      onChange={(e) => updateField('primaryContactTitle', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.primaryContactEmail}
                      onChange={(e) => updateField('primaryContactEmail', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                      id="contactPhone"
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
                <CardTitle className="text-base">Organization Address</CardTitle>
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
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value="NC" disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
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

        {/* Step 3: Services */}
        {activeStep === 3 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div>
              <Label>Service Categories * (Select all that apply)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SERVICE_CATEGORIES.map(cat => (
                  <Badge
                    key={cat}
                    variant={formData.serviceCategories.includes(cat) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('serviceCategories', cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="servicesDesc">Services Description</Label>
              <Textarea
                id="servicesDesc"
                value={formData.servicesDescription}
                onChange={(e) => updateField('servicesDescription', e.target.value)}
                placeholder="Describe the services your organization provides..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="eligibility">Eligibility Criteria</Label>
              <Textarea
                id="eligibility"
                value={formData.eligibilityCriteria}
                onChange={(e) => updateField('eligibilityCriteria', e.target.value)}
                placeholder="Who is eligible for your services?"
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="hours">Operating Hours</Label>
              <Input
                id="hours"
                value={formData.operatingHours}
                onChange={(e) => updateField('operatingHours', e.target.value)}
                placeholder="e.g., Mon-Fri 9am-5pm"
                className="mt-1"
              />
            </div>
          </div>
        )}

        {/* Step 4: Service Area */}
        {activeStep === 4 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="statewide"
                checked={formData.statewideCoverage}
                onCheckedChange={(checked) => updateField('statewideCoverage', checked)}
              />
              <Label htmlFor="statewide">We provide statewide coverage</Label>
            </div>
            
            {!formData.statewideCoverage && (
              <div>
                <Label>Select Counties Served *</Label>
                <div className="max-h-48 overflow-auto border rounded-md p-2 mt-2">
                  <div className="grid grid-cols-3 gap-1">
                    {NC_COUNTIES.map(county => (
                      <div key={county} className="flex items-center space-x-2">
                        <Checkbox
                          id={county}
                          checked={formData.serviceCounties.includes(county)}
                          onCheckedChange={() => toggleArrayItem('serviceCounties', county)}
                        />
                        <Label htmlFor={county} className="text-sm">{county}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.serviceCounties.length} counties selected
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Verification */}
        {activeStep === 5 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="nonprofit"
                    checked={formData.nonprofitStatus}
                    onCheckedChange={(checked) => updateField('nonprofitStatus', checked)}
                  />
                  <div>
                    <Label htmlFor="nonprofit" className="font-medium">Nonprofit Status Verification *</Label>
                    <p className="text-sm text-gray-500">
                      I certify that this organization is a registered nonprofit or government agency.
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
                    <Label htmlFor="dataSharing" className="font-medium">Data Sharing Agreement</Label>
                    <p className="text-sm text-gray-500">
                      I agree to share organization information with CHWs for referral purposes.
                    </p>
                  </div>
                </div>

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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 6: Review */}
        {activeStep === 6 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Organization</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><strong>Name:</strong> {formData.organizationName}</p>
                <p><strong>Type:</strong> {formData.organizationType}</p>
                {formData.ein && <p><strong>EIN:</strong> {formData.ein}</p>}
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
                {formData.city && <p><strong>Location:</strong> {formData.city}, NC {formData.zipCode}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {formData.serviceCategories.map(cat => (
                    <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Service Area</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {formData.statewideCoverage ? (
                  <p>Statewide coverage</p>
                ) : (
                  <p>{formData.serviceCounties.length} counties selected</p>
                )}
              </CardContent>
            </Card>

            {/* IRS Data Summary (if claimed from IRS) */}
            {claimedIRSData && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge className="bg-green-600">IRS Verified</Badge>
                    IRS Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>EIN:</strong> {claimedIRSData.ein}</p>
                  {claimedIRSData.nteeCode && <p><strong>NTEE Code:</strong> {claimedIRSData.nteeCode}</p>}
                  {claimedIRSData.subsectionCode && <p><strong>Tax Status:</strong> 501(c)({claimedIRSData.subsectionCode})</p>}
                  {claimedIRSData.rulingDate && <p><strong>IRS Ruling Date:</strong> {claimedIRSData.rulingDate}</p>}
                  {claimedIRSData.assetAmount && (
                    <p><strong>Total Assets:</strong> ${claimedIRSData.assetAmount.toLocaleString()}</p>
                  )}
                  {claimedIRSData.revenueAmount && (
                    <p><strong>Annual Revenue:</strong> ${claimedIRSData.revenueAmount.toLocaleString()}</p>
                  )}
                  {claimedIRSData.latestFiling && (
                    <p><strong>Latest Filing:</strong> {claimedIRSData.latestFiling.taxYear}</p>
                  )}
                </CardContent>
              </Card>
            )}
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
