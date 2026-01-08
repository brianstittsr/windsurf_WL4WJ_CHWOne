'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  Sparkles,
  X,
  CheckCircle2,
  Mail,
  LogIn,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema/unified-schema';

interface CHWWizardProps {
  onComplete: (chwId: string) => void;
  onClose?: () => void;
}

const steps = [
  { id: 1, name: 'Basic Information' },
  { id: 2, name: 'Professional Details' },
  { id: 3, name: 'Certification & Training' },
  { id: 4, name: 'Service Area' },
  { id: 5, name: 'Contact Preferences' },
  { id: 6, name: 'Review & Submit' },
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

const EXPERTISE_OPTIONS = [
  'Chronic Disease Management', 'Diabetes Care', 'Maternal & Child Health',
  'Mental Health Support', 'Substance Abuse Prevention', 'Health Education',
  'Nutrition Counseling', 'Care Coordination', 'Community Outreach',
  'Cultural Competency', 'Home Visits', 'Case Management'
];

const LANGUAGES = ['English', 'Spanish', 'Chinese', 'Vietnamese', 'Arabic', 'French', 'Other'];

export function CHWWizardShadcn({ onComplete, onClose }: CHWWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [enhancingBio, setEnhancingBio] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<any>({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '',
    address: { street: '', city: '', state: 'NC', zipCode: '' },
    professional: {
      bio: '', headline: '', expertise: [], languages: ['English'],
      yearsOfExperience: 0, currentOrganization: '', currentPosition: '',
      availableForOpportunities: true
    },
    serviceArea: { region: '', primaryCounty: '', countiesWorkedIn: [] },
    certification: { certificationStatus: 'not_certified', certificationNumber: '', expirationDate: '' },
    contactPreferences: {
      allowPublicProfile: true, allowDirectMessages: true,
      showEmail: false, showPhone: false, preferredContactMethod: 'email'
    }
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setProfilePhoto(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setErrorMessage('Email and password are required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      let user;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        user = userCredential.user;
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          const signInCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
          user = signInCredential.user;
        } else throw authError;
      }

      const chwProfileData = {
        id: user.uid, userId: user.uid,
        firstName: formData.firstName, lastName: formData.lastName,
        email: formData.email, phone: formData.phone || '',
        profilePicture: profilePhoto || '',
        displayName: `${formData.firstName} ${formData.lastName}`,
        professional: formData.professional,
        serviceArea: formData.serviceArea,
        certification: formData.certification,
        contactPreferences: formData.contactPreferences,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, COLLECTIONS.CHW_PROFILES, user.uid), chwProfileData);
      setRegisteredEmail(formData.email);
      setShowSuccessModal(true);
      setTimeout(() => onComplete(user.uid), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Basic Information
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex justify-center mb-2">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-2">
                  {profilePhoto ? <AvatarImage src={profilePhoto} /> : <AvatarFallback className="text-2xl">📷</AvatarFallback>}
                </Avatar>
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    <Upload className="w-3 h-3 mr-1" /> Upload
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">First Name *</Label>
              <Input className="h-8 text-sm" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Last Name *</Label>
              <Input className="h-8 text-sm" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Email *</Label>
              <Input className="h-8 text-sm" type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input className="h-8 text-sm" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Password *</Label>
              <div className="relative">
                <Input className="h-8 text-sm pr-8" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => updateField('password', e.target.value)} />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs">Confirm Password *</Label>
              <div className="relative">
                <Input className="h-8 text-sm pr-8" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        );

      case 1: // Professional Details
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Professional Headline</Label>
              <Input className="h-8 text-sm" value={formData.professional?.headline} onChange={(e) => updateNestedField('professional', 'headline', e.target.value)} placeholder="e.g., Certified CHW specializing in Diabetes Care" />
            </div>
            <div>
              <Label className="text-xs">Organization</Label>
              <Input className="h-8 text-sm" value={formData.professional?.currentOrganization} onChange={(e) => updateNestedField('professional', 'currentOrganization', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Position</Label>
              <Input className="h-8 text-sm" value={formData.professional?.currentPosition} onChange={(e) => updateNestedField('professional', 'currentPosition', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Years of Experience</Label>
              <Input className="h-8 text-sm" type="number" value={formData.professional?.yearsOfExperience} onChange={(e) => updateNestedField('professional', 'yearsOfExperience', parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Switch checked={formData.professional?.availableForOpportunities} onCheckedChange={(checked) => updateNestedField('professional', 'availableForOpportunities', checked)} />
              <Label className="text-xs">Available for opportunities</Label>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Areas of Expertise</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {EXPERTISE_OPTIONS.slice(0, 8).map((opt) => (
                  <Badge key={opt} variant={formData.professional?.expertise?.includes(opt) ? 'default' : 'outline'} className="text-xs cursor-pointer"
                    onClick={() => {
                      const current = formData.professional?.expertise || [];
                      const updated = current.includes(opt) ? current.filter((e: string) => e !== opt) : [...current, opt];
                      updateNestedField('professional', 'expertise', updated);
                    }}>
                    {opt}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Certification
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Certification Status</Label>
              <Select value={formData.certification?.certificationStatus} onValueChange={(v) => updateNestedField('certification', 'certificationStatus', v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_certified">Not Certified</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="certified">Certified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Certification Number</Label>
              <Input className="h-8 text-sm" value={formData.certification?.certificationNumber} onChange={(e) => updateNestedField('certification', 'certificationNumber', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Expiration Date</Label>
              <Input className="h-8 text-sm" type="date" value={formData.certification?.expirationDate} onChange={(e) => updateNestedField('certification', 'expirationDate', e.target.value)} />
            </div>
          </div>
        );

      case 3: // Service Area
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Primary County</Label>
              <Select value={formData.serviceArea?.primaryCounty} onValueChange={(v) => updateNestedField('serviceArea', 'primaryCounty', v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select county" /></SelectTrigger>
                <SelectContent className="max-h-48">
                  {NC_COUNTIES.map((county) => (
                    <SelectItem key={county} value={county}>{county}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Counties Served (click to select)</Label>
              <div className="flex flex-wrap gap-1 mt-1 max-h-32 overflow-y-auto p-2 border rounded">
                {NC_COUNTIES.slice(0, 20).map((county) => (
                  <Badge key={county} variant={formData.serviceArea?.countiesWorkedIn?.includes(county) ? 'default' : 'outline'} className="text-xs cursor-pointer"
                    onClick={() => {
                      const current = formData.serviceArea?.countiesWorkedIn || [];
                      const updated = current.includes(county) ? current.filter((c: string) => c !== county) : [...current, county];
                      updateNestedField('serviceArea', 'countiesWorkedIn', updated);
                    }}>
                    {county}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 4: // Contact Preferences
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Allow public profile</Label>
              <Switch checked={formData.contactPreferences?.allowPublicProfile} onCheckedChange={(checked) => updateNestedField('contactPreferences', 'allowPublicProfile', checked)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Allow direct messages</Label>
              <Switch checked={formData.contactPreferences?.allowDirectMessages} onCheckedChange={(checked) => updateNestedField('contactPreferences', 'allowDirectMessages', checked)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show email publicly</Label>
              <Switch checked={formData.contactPreferences?.showEmail} onCheckedChange={(checked) => updateNestedField('contactPreferences', 'showEmail', checked)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show phone publicly</Label>
              <Switch checked={formData.contactPreferences?.showPhone} onCheckedChange={(checked) => updateNestedField('contactPreferences', 'showPhone', checked)} />
            </div>
            <div>
              <Label className="text-xs">Preferred Contact Method</Label>
              <Select value={formData.contactPreferences?.preferredContactMethod} onValueChange={(v) => updateNestedField('contactPreferences', 'preferredContactMethod', v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="message">In-App Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 5: // Review
        return (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Please review your information before submitting.</p>
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-2">
                <p className="text-xs font-semibold mb-1">Basic Info</p>
                <p className="text-xs"><span className="text-muted-foreground">Name:</span> {formData.firstName} {formData.lastName}</p>
                <p className="text-xs"><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                <p className="text-xs"><span className="text-muted-foreground">Phone:</span> {formData.phone || 'N/A'}</p>
              </Card>
              <Card className="p-2">
                <p className="text-xs font-semibold mb-1">Professional</p>
                <p className="text-xs"><span className="text-muted-foreground">Org:</span> {formData.professional?.currentOrganization || 'N/A'}</p>
                <p className="text-xs"><span className="text-muted-foreground">Exp:</span> {formData.professional?.yearsOfExperience} yrs</p>
                <p className="text-xs"><span className="text-muted-foreground">Skills:</span> {formData.professional?.expertise?.length || 0}</p>
              </Card>
              <Card className="p-2">
                <p className="text-xs font-semibold mb-1">Service Area</p>
                <p className="text-xs"><span className="text-muted-foreground">County:</span> {formData.serviceArea?.primaryCounty || 'N/A'}</p>
                <p className="text-xs"><span className="text-muted-foreground">Serving:</span> {formData.serviceArea?.countiesWorkedIn?.length || 0} counties</p>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showSuccessModal) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
        <CheckCircle2 className="w-16 h-16 text-white mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Registration Successful! 🎉</h2>
        <p className="text-white/90 mb-4">Thank you for joining our community!</p>
        <Card className="p-3 mb-2 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium">Welcome Email Sent</span>
          </div>
          <p className="text-xs text-muted-foreground">Sent to: <span className="text-indigo-500 font-medium">{registeredEmail}</span></p>
        </Card>
        <p className="text-xs text-white/70">Redirecting in a few seconds...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 flex-shrink-0">
        <h2 className="text-lg font-bold mb-3 text-center">Register As A Community Health Worker</h2>
        <div className="flex items-center justify-center gap-1 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors",
                index < activeStep ? "bg-white text-blue-600" :
                index === activeStep ? "bg-white/20 border-2 border-white" :
                "bg-white/10"
              )}>
                {index < activeStep ? <Check className="w-3 h-3" /> : step.id}
              </div>
              <span className={cn(
                "hidden sm:inline text-[10px] ml-1 whitespace-nowrap",
                index <= activeStep ? "text-white" : "text-white/60"
              )}>
                {step.name}
              </span>
              {index < steps.length - 1 && <div className="w-3 h-px bg-white/30 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mx-4 mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive flex items-center justify-between">
          {errorMessage}
          <button onClick={() => setErrorMessage('')}><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        {renderStepContent()}
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 px-4 py-3 flex justify-between flex-shrink-0">
        <Button variant="outline" size="sm" onClick={() => activeStep > 0 ? setActiveStep(activeStep - 1) : onClose?.()}>
          {activeStep === 0 ? 'Cancel' : <><ChevronLeft className="w-4 h-4 mr-1" /> Back</>}
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
            Submit
          </Button>
        ) : (
          <Button size="sm" onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default CHWWizardShadcn;
