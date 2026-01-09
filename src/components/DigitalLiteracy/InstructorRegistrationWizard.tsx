'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Briefcase, 
  Calendar, 
  FileText, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { Language, t, TRANSLATIONS } from '@/lib/translations/digitalLiteracy';
import LanguageToggle from './LanguageToggle';

interface InstructorFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Professional Info
  certifications: string[];
  yearsExperience: string;
  languages: string[];
  specializations: string;
  
  // Availability
  availableDays: string[];
  preferredTimes: string[];
  
  // Background
  teachingExperience: string;
  whyInterested: string;
}

const CERTIFICATION_OPTIONS = [
  { id: 'chw', key: 'certCHW' },
  { id: 'digital_literacy', key: 'certDigitalLiteracy' },
  { id: 'adult_education', key: 'certAdultEducation' },
  { id: 'esl', key: 'certESL' },
  { id: 'tech_trainer', key: 'certTechTrainer' },
  { id: 'health_educator', key: 'certHealthEducator' },
  { id: 'other', key: 'certOther' },
];

const DAYS_OF_WEEK = [
  { id: 'monday', en: 'Monday', es: 'Lunes' },
  { id: 'tuesday', en: 'Tuesday', es: 'Martes' },
  { id: 'wednesday', en: 'Wednesday', es: 'Miércoles' },
  { id: 'thursday', en: 'Thursday', es: 'Jueves' },
  { id: 'friday', en: 'Friday', es: 'Viernes' },
  { id: 'saturday', en: 'Saturday', es: 'Sábado' },
];

const LANGUAGE_OPTIONS = [
  { id: 'english', en: 'English', es: 'Inglés' },
  { id: 'spanish', en: 'Spanish', es: 'Español' },
  { id: 'french', en: 'French', es: 'Francés' },
  { id: 'portuguese', en: 'Portuguese', es: 'Portugués' },
  { id: 'other', en: 'Other', es: 'Otro' },
];

interface InstructorRegistrationWizardProps {
  onComplete?: (data: InstructorFormData) => void;
  onClose?: () => void;
}

export default function InstructorRegistrationWizard({
  onComplete,
  onClose,
}: InstructorRegistrationWizardProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<InstructorFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'NC',
    zipCode: '',
    certifications: [],
    yearsExperience: '',
    languages: ['english'],
    specializations: '',
    availableDays: [],
    preferredTimes: [],
    teachingExperience: '',
    whyInterested: '',
  });

  useEffect(() => {
    const savedLang = localStorage.getItem('digitalLiteracyLanguage');
    if (savedLang === 'en' || savedLang === 'es') {
      setLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('digitalLiteracyLanguage', lang);
  };

  const getText = (key: string) => t(key, language, TRANSLATIONS);

  const steps = [
    { 
      id: 'personal', 
      icon: User, 
      title: getText('instructorRegistration.personalInfo'),
    },
    { 
      id: 'professional', 
      icon: Briefcase, 
      title: getText('instructorRegistration.professionalInfo'),
    },
    { 
      id: 'availability', 
      icon: Calendar, 
      title: getText('instructorRegistration.availability'),
    },
    { 
      id: 'background', 
      icon: FileText, 
      title: getText('instructorRegistration.background'),
    },
    { 
      id: 'review', 
      icon: CheckCircle, 
      title: getText('instructorRegistration.review'),
    },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 0: // Personal Info
        if (!formData.firstName.trim()) newErrors.firstName = getText('messages.requiredField');
        if (!formData.lastName.trim()) newErrors.lastName = getText('messages.requiredField');
        if (!formData.email.trim()) {
          newErrors.email = getText('messages.requiredField');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = getText('messages.invalidEmail');
        }
        if (!formData.phone.trim()) newErrors.phone = getText('messages.requiredField');
        break;
      case 1: // Professional Info
        if (formData.certifications.length === 0) {
          newErrors.certifications = getText('messages.requiredField');
        }
        if (!formData.yearsExperience) newErrors.yearsExperience = getText('messages.requiredField');
        break;
      case 2: // Availability
        if (formData.availableDays.length === 0) {
          newErrors.availableDays = getText('messages.requiredField');
        }
        if (formData.preferredTimes.length === 0) {
          newErrors.preferredTimes = getText('messages.requiredField');
        }
        break;
      case 3: // Background
        if (!formData.teachingExperience.trim()) {
          newErrors.teachingExperience = getText('messages.requiredField');
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      onComplete?.(formData);
    } catch (error) {
      console.error('Error submitting instructor registration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (field: 'certifications' | 'availableDays' | 'preferredTimes' | 'languages', value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (isSuccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            {getText('instructorRegistration.applicationSubmitted')}
          </h2>
          <p className="text-slate-600 mb-6">
            {getText('instructorRegistration.thankYouApplying')}
          </p>
          <Button onClick={onClose}>
            {getText('actions.close')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8" />
            <div>
              <CardTitle className="text-xl">
                {getText('instructorRegistration.title')}
              </CardTitle>
              <p className="text-blue-100 text-sm">
                {getText('instructorRegistration.subtitle')}
              </p>
            </div>
          </div>
          <LanguageToggle currentLanguage={language} onLanguageChange={handleLanguageChange} />
        </div>
        
        {/* Progress */}
        <div className="mt-4">
          <Progress value={progress} className="h-2 bg-blue-400" />
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div 
                  key={step.id}
                  className={`flex flex-col items-center ${
                    index <= currentStep ? 'text-white' : 'text-blue-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < currentStep ? 'bg-green-500' :
                    index === currentStep ? 'bg-white text-blue-600' : 'bg-blue-400'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Step 0: Personal Information */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {getText('instructorRegistration.personalInfo')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{getText('instructorRegistration.firstName')} *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <Label htmlFor="lastName">{getText('instructorRegistration.lastName')} *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">{getText('instructorRegistration.email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <Label htmlFor="phone">{getText('instructorRegistration.phone')} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="XXX-XXX-XXXX"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="address">{getText('instructorRegistration.address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <Label htmlFor="city">{getText('instructorRegistration.city')}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="state">{getText('instructorRegistration.state')}</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">{getText('instructorRegistration.zipCode')}</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Professional Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {getText('instructorRegistration.professionalInfo')}
            </h3>
            
            <div>
              <Label className="text-base font-medium">
                {getText('instructorRegistration.certifications')} *
              </Label>
              <p className="text-sm text-slate-500 mb-3">
                {getText('instructorRegistration.selectCertifications')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CERTIFICATION_OPTIONS.map(cert => (
                  <div key={cert.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={cert.id}
                      checked={formData.certifications.includes(cert.id)}
                      onCheckedChange={() => handleCheckboxChange('certifications', cert.id)}
                    />
                    <Label htmlFor={cert.id} className="font-normal cursor-pointer">
                      {getText(`instructorRegistration.${cert.key}`)}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.certifications && (
                <p className="text-red-500 text-sm mt-2">{errors.certifications}</p>
              )}
            </div>

            <div>
              <Label htmlFor="yearsExperience">
                {getText('instructorRegistration.yearsExperience')} *
              </Label>
              <select
                id="yearsExperience"
                value={formData.yearsExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                className={`w-full mt-1 p-2 border rounded-md ${errors.yearsExperience ? 'border-red-500' : 'border-slate-300'}`}
              >
                <option value="">-- {language === 'en' ? 'Select' : 'Seleccionar'} --</option>
                <option value="0-1">{language === 'en' ? '0-1 years' : '0-1 años'}</option>
                <option value="2-5">{language === 'en' ? '2-5 years' : '2-5 años'}</option>
                <option value="6-10">{language === 'en' ? '6-10 years' : '6-10 años'}</option>
                <option value="10+">{language === 'en' ? '10+ years' : '10+ años'}</option>
              </select>
              {errors.yearsExperience && (
                <p className="text-red-500 text-sm mt-1">{errors.yearsExperience}</p>
              )}
            </div>

            <div>
              <Label className="text-base font-medium">
                {getText('instructorRegistration.languages')}
              </Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {LANGUAGE_OPTIONS.map(lang => (
                  <div key={lang.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${lang.id}`}
                      checked={formData.languages.includes(lang.id)}
                      onCheckedChange={() => handleCheckboxChange('languages', lang.id)}
                    />
                    <Label htmlFor={`lang-${lang.id}`} className="font-normal cursor-pointer">
                      {lang[language]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="specializations">
                {getText('instructorRegistration.specializations')}
              </Label>
              <Textarea
                id="specializations"
                value={formData.specializations}
                onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))}
                placeholder={language === 'en' ? 'e.g., Senior technology, Mobile devices, Social media...' : 'ej., Tecnología para adultos mayores, Dispositivos móviles, Redes sociales...'}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Availability */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {getText('instructorRegistration.availability')}
            </h3>
            
            <div>
              <Label className="text-base font-medium">
                {getText('instructorRegistration.availableDays')} *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.id}`}
                      checked={formData.availableDays.includes(day.id)}
                      onCheckedChange={() => handleCheckboxChange('availableDays', day.id)}
                    />
                    <Label htmlFor={`day-${day.id}`} className="font-normal cursor-pointer">
                      {day[language]}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.availableDays && (
                <p className="text-red-500 text-sm mt-2">{errors.availableDays}</p>
              )}
            </div>

            <div>
              <Label className="text-base font-medium">
                {getText('instructorRegistration.preferredTimes')} *
              </Label>
              <div className="space-y-2 mt-2">
                {['morning', 'afternoon', 'evening'].map(time => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={`time-${time}`}
                      checked={formData.preferredTimes.includes(time)}
                      onCheckedChange={() => handleCheckboxChange('preferredTimes', time)}
                    />
                    <Label htmlFor={`time-${time}`} className="font-normal cursor-pointer">
                      {getText(`instructorRegistration.${time}`)}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.preferredTimes && (
                <p className="text-red-500 text-sm mt-2">{errors.preferredTimes}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Background */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {getText('instructorRegistration.background')}
            </h3>
            
            <div>
              <Label htmlFor="teachingExperience">
                {getText('instructorRegistration.teachingExperience')} *
              </Label>
              <Textarea
                id="teachingExperience"
                value={formData.teachingExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, teachingExperience: e.target.value }))}
                rows={4}
                className={errors.teachingExperience ? 'border-red-500' : ''}
              />
              {errors.teachingExperience && (
                <p className="text-red-500 text-sm mt-1">{errors.teachingExperience}</p>
              )}
            </div>

            <div>
              <Label htmlFor="whyInterested">
                {getText('instructorRegistration.whyInterested')}
              </Label>
              <Textarea
                id="whyInterested"
                value={formData.whyInterested}
                onChange={(e) => setFormData(prev => ({ ...prev, whyInterested: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {getText('instructorRegistration.review')}
            </h3>
            <p className="text-slate-600 mb-4">
              {getText('instructorRegistration.reviewInstructions')}
            </p>
            
            <div className="space-y-4">
              {/* Personal Info Summary */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">
                  {getText('instructorRegistration.personalInfo')}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">{getText('instructorRegistration.firstName')}:</span> {formData.firstName}</div>
                  <div><span className="text-slate-500">{getText('instructorRegistration.lastName')}:</span> {formData.lastName}</div>
                  <div><span className="text-slate-500">{getText('instructorRegistration.email')}:</span> {formData.email}</div>
                  <div><span className="text-slate-500">{getText('instructorRegistration.phone')}:</span> {formData.phone}</div>
                </div>
              </div>

              {/* Professional Info Summary */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">
                  {getText('instructorRegistration.professionalInfo')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">{getText('instructorRegistration.certifications')}:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.certifications.map(cert => {
                        const certOption = CERTIFICATION_OPTIONS.find(c => c.id === cert);
                        return (
                          <Badge key={cert} variant="secondary">
                            {certOption ? getText(`instructorRegistration.${certOption.key}`) : cert}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">{getText('instructorRegistration.yearsExperience')}:</span> {formData.yearsExperience} {language === 'en' ? 'years' : 'años'}
                  </div>
                </div>
              </div>

              {/* Availability Summary */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">
                  {getText('instructorRegistration.availability')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">{getText('instructorRegistration.availableDays')}:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.availableDays.map(day => {
                        const dayOption = DAYS_OF_WEEK.find(d => d.id === day);
                        return (
                          <Badge key={day} variant="outline">
                            {dayOption ? dayOption[language] : day}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onClose : handleBack}
            disabled={isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentStep === 0 ? getText('actions.cancel') : getText('actions.back')}
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              {getText('actions.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {getText('instructorRegistration.submitting')}
                </>
              ) : (
                getText('instructorRegistration.submit')
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
