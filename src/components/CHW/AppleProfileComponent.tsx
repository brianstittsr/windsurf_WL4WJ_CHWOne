'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema/unified-schema';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Pencil,
  Save,
  X,
  Briefcase,
  GraduationCap,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Link as LinkIcon,
  Shield,
  Award,
  Plus,
  Trash2,
  Wrench,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Database,
  BarChart3,
  Bot,
  DollarSign,
  Send,
  FolderKanban,
  BookOpen,
  Users,
  Building2,
  Clock,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import {
  CHWProfile,
  DEFAULT_CHW_PROFILE,
  EXPERTISE_OPTIONS,
  LANGUAGE_OPTIONS,
  NC_COUNTIES
} from '@/types/chw-profile.types';
import NonprofitLinker from './NonprofitLinker';

interface AppleProfileComponentProps {
  editable?: boolean;
  onSave?: (profile: CHWProfile) => void;
}

const calculateDaysUntilExpiration = (expirationDate: string | undefined): number | null => {
  if (!expirationDate) return null;
  const expDate = new Date(expirationDate);
  const today = new Date();
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Apple-style Tab Button
const TabButton = ({ 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ElementType; 
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
      ${active 
        ? 'bg-[#0071E3] text-white shadow-sm' 
        : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
      }
    `}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// Apple-style Input Field
const AppleInput = ({
  label,
  value,
  onChange,
  disabled,
  type = 'text',
  placeholder,
  required,
  icon: Icon
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ElementType;
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-[#1D1D1F]">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 rounded-xl border border-[#D2D2D7] bg-white
          text-[#1D1D1F] text-sm placeholder:text-[#86868B]
          focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent
          disabled:bg-[#F5F5F7] disabled:text-[#86868B] disabled:cursor-not-allowed
          transition-all duration-200
          ${Icon ? 'pl-10' : ''}
        `}
      />
    </div>
  </div>
);

// Apple-style Select
const AppleSelect = ({
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  placeholder?: string;
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-[#1D1D1F]">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-xl border border-[#D2D2D7] bg-white
          text-[#1D1D1F] text-sm appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent
          disabled:bg-[#F5F5F7] disabled:text-[#86868B] disabled:cursor-not-allowed
          transition-all duration-200
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] pointer-events-none" />
    </div>
  </div>
);

// Apple-style Toggle
const AppleToggle = ({
  label,
  description,
  checked,
  onChange,
  disabled
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-[#1D1D1F]">{label}</p>
      {description && (
        <p className="text-xs text-[#86868B] mt-0.5">{description}</p>
      )}
    </div>
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative w-12 h-7 rounded-full transition-colors duration-200
        ${checked ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm
          transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  </div>
);

// Apple-style Card Section
const CardSection = ({
  title,
  children,
  className = ''
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-[#D2D2D7]">
        <h3 className="text-base font-semibold text-[#1D1D1F]">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export default function AppleProfileComponent({
  editable = true,
  onSave
}: AppleProfileComponentProps) {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [profile, setProfile] = useState<CHWProfile>({
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    professional: {
      ...DEFAULT_CHW_PROFILE.professional!,
      headline: '',
      bio: ''
    },
    serviceArea: {
      ...DEFAULT_CHW_PROFILE.serviceArea!
    },
    membership: {
      ...DEFAULT_CHW_PROFILE.membership!
    },
    contactPreferences: {
      ...DEFAULT_CHW_PROFILE.contactPreferences!
    },
    toolAccess: {
      ...DEFAULT_CHW_PROFILE.toolAccess!
    },
    socialLinks: {}
  });

  // Extracted loadProfile function so it can be called after linking
  const loadProfile = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profileRef = doc(db, COLLECTIONS.CHW_PROFILES, currentUser.uid);
      const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setProfile({
            id: profileSnap.id,
            userId: data.userId || currentUser.uid,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || currentUser.email || '',
            phone: data.phone || '',
            address: data.address || {},
            profilePicture: data.profilePicture || currentUser.photoURL || undefined,
            displayName: data.displayName || `${data.firstName} ${data.lastName}`,
            professional: {
              headline: data.professional?.headline || '',
              bio: data.professional?.bio || '',
              expertise: data.professional?.expertise || [],
              additionalExpertise: data.professional?.additionalExpertise || '',
              languages: data.professional?.languages || ['English'],
              availableForOpportunities: data.professional?.availableForOpportunities ?? true,
              yearsOfExperience: data.professional?.yearsOfExperience || 0,
              specializations: data.professional?.specializations || data.professional?.expertise || [],
              currentOrganization: data.professional?.currentOrganization || '',
              currentPosition: data.professional?.currentPosition || ''
            },
            serviceArea: {
              region: data.serviceArea?.region || '',
              countiesWorkedIn: data.serviceArea?.countiesWorkedIn || [],
              countyResideIn: data.serviceArea?.countyResideIn || '',
              currentOrganization: data.serviceArea?.currentOrganization || data.professional?.currentOrganization,
              role: data.serviceArea?.role || data.professional?.currentPosition
            },
            certification: data.certification || {
              certificationNumber: '',
              certificationStatus: 'not_certified',
              certificationExpiration: undefined,
              expirationDate: undefined
            },
            contactPreferences: {
              allowDirectMessages: data.contactPreferences?.allowDirectMessages ?? true,
              showEmail: data.contactPreferences?.showEmail ?? false,
              showPhone: data.contactPreferences?.showPhone ?? false,
              showAddress: data.contactPreferences?.showAddress ?? false
            },
            membership: {
              dateRegistered: data.membership?.dateRegistered || data.createdAt,
              includeInDirectory: data.membership?.includeInDirectory ?? true,
              renewalDate: data.membership?.renewalDate
            },
            toolAccess: data.toolAccess || DEFAULT_CHW_PROFILE.toolAccess,
            socialLinks: data.socialLinks || {},
            organizationTags: data.organizationTags || [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        } else {
          setProfile(prev => ({
            ...prev,
            userId: currentUser.uid,
            firstName: currentUser.displayName?.split(' ')[0] || '',
            lastName: currentUser.displayName?.split(' ')[1] || '',
            email: currentUser.email || '',
            profilePicture: currentUser.photoURL || undefined
          }));
        }
      } catch (err) {
        console.error('Error loading CHW profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
  }, [currentUser]);

  // Load profile on mount and when currentUser changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (field: string, value: any, section?: keyof CHWProfile) => {
    if (section) {
      setProfile(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      setError('You must be logged in to save your profile');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (!profile.firstName || !profile.lastName || !profile.email) {
        throw new Error('Please fill in all required fields');
      }

      const removeUndefined = (obj: any): any => {
        if (obj === null || obj === undefined) return null;
        if (Array.isArray(obj)) {
          return obj.map(removeUndefined).filter(item => item !== null && item !== undefined);
        }
        if (typeof obj === 'object') {
          const cleaned: any = {};
          Object.keys(obj).forEach(key => {
            const value = removeUndefined(obj[key]);
            if (value !== undefined && value !== null) {
              cleaned[key] = value;
            }
          });
          return cleaned;
        }
        return obj;
      };

      const profileData = removeUndefined({
        ...profile,
        userId: currentUser.uid,
        displayName: `${profile.firstName} ${profile.lastName}`,
        updatedAt: serverTimestamp()
      });

      const profileRef = doc(db, COLLECTIONS.CHW_PROFILES, currentUser.uid);
      await setDoc(profileRef, profileData, { merge: true });

      setSuccess(true);
      setIsEditing(false);
      onSave?.(profile);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let width = img.width;
          let height = img.height;
          const maxSize = 400;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      const compressedImage = await compressImage(file);
      setProfile(prev => ({ ...prev, profilePicture: compressedImage }));
      setPhotoFile(file);
    } catch (error) {
      setError('Failed to process image');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const tabs = [
    { icon: User, label: 'Basic Info' },
    { icon: Briefcase, label: 'Professional' },
    { icon: Award, label: 'Certification' },
    { icon: MapPin, label: 'Service Area' },
    { icon: Building2, label: 'Organization' },
    { icon: Wrench, label: 'CHW Tools' },
    { icon: Shield, label: 'Privacy' },
    { icon: Globe, label: 'Social' }
  ];

  const daysUntilExpiration = calculateDaysUntilExpiration(profile.certification?.certificationExpiration);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#86868B] text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div 
                className={`w-28 h-28 rounded-full bg-gradient-to-br from-[#0071E3] to-[#5856D6] flex items-center justify-center text-white text-3xl font-semibold overflow-hidden ${isEditing ? 'cursor-pointer ring-4 ring-[#0071E3]/20' : ''}`}
                onClick={() => isEditing && document.getElementById('photo-upload')?.click()}
              >
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile.firstName?.[0]}{profile.lastName?.[0]}</span>
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#0071E3] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#0077ED] transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">
                {profile.firstName} {profile.lastName}
              </h2>
              {profile.professional?.headline && (
                <p className="text-[#6E6E73] mt-1">{profile.professional.headline}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-sm font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#0071E3]" />
                  {profile.serviceArea?.region || 'Region'} CHW
                </span>
              </div>
              
              {/* Organization Tags */}
              {profile.organizationTags && profile.organizationTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.organizationTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#E3F2FD] text-[#1565C0] text-sm font-medium"
                    >
                      <Building2 className="w-3.5 h-3.5 mr-1.5" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions & Certification Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Certification Badge */}
              {(() => {
                const days = daysUntilExpiration;
                const hasExpiration = profile.certification?.certificationExpiration;
                
                let bgColor = 'bg-[#34C759]';
                let textColor = 'text-white';
                let StatusIcon = CheckCircle;
                let statusText = 'Active';
                let subText = days !== null ? `${days} days remaining` : '';
                
                if (!hasExpiration) {
                  bgColor = 'bg-[#5856D6]';
                  statusText = 'Set Expiration';
                  subText = 'Click to configure';
                } else if (days !== null && days < 0) {
                  bgColor = 'bg-[#FF3B30]';
                  StatusIcon = XCircle;
                  statusText = 'Expired';
                  subText = `${Math.abs(days)} days ago`;
                } else if (days !== null && days <= 30) {
                  bgColor = 'bg-[#FF3B30]';
                  StatusIcon = AlertTriangle;
                  statusText = 'Urgent';
                  subText = `${days} days left`;
                } else if (days !== null && days <= 90) {
                  bgColor = 'bg-[#FF9500]';
                  StatusIcon = AlertTriangle;
                  statusText = 'Renew Soon';
                  subText = `${days} days left`;
                }

                return (
                  <a
                    href="https://www.ncchwa.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${bgColor} ${textColor} px-4 py-3 rounded-xl flex items-center gap-3 hover:opacity-90 transition-opacity min-w-[160px]`}
                  >
                    <StatusIcon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Certification</p>
                      <p className="text-sm font-semibold">{statusText}</p>
                      {subText && <p className="text-xs opacity-80">{subText}</p>}
                    </div>
                  </a>
                );
              })()}

              {/* Edit Button */}
              {editable && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#0071E3] text-white rounded-xl font-medium text-sm hover:bg-[#0077ED] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-[#34C759]/10 border border-[#34C759]/20 rounded-xl">
          <CheckCircle className="w-5 h-5 text-[#34C759]" />
          <p className="text-sm font-medium text-[#34C759]">Profile updated successfully!</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl">
          <XCircle className="w-5 h-5 text-[#FF3B30]" />
          <p className="text-sm font-medium text-[#FF3B30]">{error}</p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-[#D2D2D7] p-2">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {tabs.map((tab, index) => (
            <TabButton
              key={tab.label}
              active={activeTab === index}
              onClick={() => setActiveTab(index)}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Tab 0: Basic Info */}
        {activeTab === 0 && (
          <CardSection title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppleInput
                label="First Name"
                value={profile.firstName}
                onChange={(v) => handleInputChange('firstName', v)}
                disabled={!isEditing}
                required
                icon={User}
              />
              <AppleInput
                label="Last Name"
                value={profile.lastName}
                onChange={(v) => handleInputChange('lastName', v)}
                disabled={!isEditing}
                required
                icon={User}
              />
              <AppleInput
                label="Email"
                value={profile.email}
                onChange={(v) => handleInputChange('email', v)}
                disabled={!isEditing}
                type="email"
                required
                icon={Mail}
              />
              <AppleInput
                label="Phone Number"
                value={profile.phone || ''}
                onChange={(v) => handleInputChange('phone', v)}
                disabled={!isEditing}
                icon={Phone}
              />
              <AppleInput
                label="Date Registered"
                value={profile.membership?.dateRegistered || ''}
                onChange={(v) => handleInputChange('dateRegistered', v, 'membership')}
                disabled={!isEditing}
                type="date"
                icon={Calendar}
              />
              <AppleInput
                label="Renewal Date"
                value={profile.membership?.renewalDate || ''}
                onChange={(v) => handleInputChange('renewalDate', v, 'membership')}
                disabled={!isEditing}
                type="date"
                icon={Calendar}
              />
              <AppleInput
                label="Member Number"
                value={profile.membership?.memberNumber || ''}
                onChange={(v) => handleInputChange('memberNumber', v, 'membership')}
                disabled={!isEditing}
              />
              <AppleInput
                label="Member Type"
                value={profile.membership?.memberType || ''}
                onChange={(v) => handleInputChange('memberType', v, 'membership')}
                disabled={!isEditing}
              />
            </div>
          </CardSection>
        )}

        {/* Tab 1: Professional */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <CardSection title="Professional Profile">
              <div className="space-y-6">
                <AppleInput
                  label="Professional Headline"
                  value={profile.professional?.headline || ''}
                  onChange={(v) => handleInputChange('headline', v, 'professional')}
                  disabled={!isEditing}
                  placeholder="e.g., Certified CHW specializing in Maternal Health"
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#1D1D1F]">Bio</label>
                  <textarea
                    value={profile.professional?.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value, 'professional')}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell others about your background and experience..."
                    className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] bg-white text-[#1D1D1F] text-sm placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent disabled:bg-[#F5F5F7] disabled:text-[#86868B] disabled:cursor-not-allowed transition-all duration-200 resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AppleInput
                    label="Current Organization"
                    value={profile.professional?.currentOrganization || ''}
                    onChange={(v) => handleInputChange('currentOrganization', v, 'professional')}
                    disabled={!isEditing}
                    icon={Building2}
                  />
                  <AppleInput
                    label="Current Position"
                    value={profile.professional?.currentPosition || ''}
                    onChange={(v) => handleInputChange('currentPosition', v, 'professional')}
                    disabled={!isEditing}
                    icon={Briefcase}
                  />
                  <AppleSelect
                    label="Years of Experience"
                    value={String(profile.professional?.yearsOfExperience || 0)}
                    onChange={(v) => handleInputChange('yearsOfExperience', parseInt(v), 'professional')}
                    disabled={!isEditing}
                    options={[
                      { value: '0', label: 'Less than 1 year' },
                      { value: '1', label: '1-2 years' },
                      { value: '3', label: '3-5 years' },
                      { value: '6', label: '6-10 years' },
                      { value: '11', label: '10+ years' }
                    ]}
                  />
                </div>
              </div>
            </CardSection>

            <CardSection title="Expertise & Languages">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#1D1D1F]">Areas of Expertise</label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERTISE_OPTIONS.map((expertise) => {
                      const isSelected = profile.professional?.expertise?.includes(expertise);
                      return (
                        <button
                          key={expertise}
                          type="button"
                          onClick={() => {
                            if (!isEditing) return;
                            const current = profile.professional?.expertise || [];
                            const updated = isSelected
                              ? current.filter(e => e !== expertise)
                              : [...current, expertise];
                            handleInputChange('expertise', updated, 'professional');
                          }}
                          disabled={!isEditing}
                          className={`
                            px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                            ${isSelected
                              ? 'bg-[#0071E3] text-white'
                              : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                            }
                            ${!isEditing ? 'cursor-default' : 'cursor-pointer'}
                          `}
                        >
                          {expertise}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#1D1D1F]">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((language) => {
                      const isSelected = profile.professional?.languages?.includes(language);
                      return (
                        <button
                          key={language}
                          type="button"
                          onClick={() => {
                            if (!isEditing) return;
                            const current = profile.professional?.languages || [];
                            const updated = isSelected
                              ? current.filter(l => l !== language)
                              : [...current, language];
                            handleInputChange('languages', updated, 'professional');
                          }}
                          disabled={!isEditing}
                          className={`
                            px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                            ${isSelected
                              ? 'bg-[#34C759] text-white'
                              : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                            }
                            ${!isEditing ? 'cursor-default' : 'cursor-pointer'}
                          `}
                        >
                          {language}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardSection>
          </div>
        )}

        {/* Tab 2: Certification */}
        {activeTab === 2 && (
          <CardSection title="Certification Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppleInput
                label="Certification Number"
                value={profile.certification?.certificationNumber || ''}
                onChange={(v) => handleInputChange('certificationNumber', v, 'certification')}
                disabled={!isEditing}
                icon={Award}
              />
              <AppleSelect
                label="Certification Status"
                value={profile.certification?.certificationStatus || 'not_certified'}
                onChange={(v) => handleInputChange('certificationStatus', v, 'certification')}
                disabled={!isEditing}
                options={[
                  { value: 'not_certified', label: 'Not Certified' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'active', label: 'Active' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'suspended', label: 'Suspended' }
                ]}
              />
              <AppleInput
                label="Certification Expiration"
                value={profile.certification?.certificationExpiration || ''}
                onChange={(v) => handleInputChange('certificationExpiration', v, 'certification')}
                disabled={!isEditing}
                type="date"
                icon={Calendar}
              />
            </div>

            {/* Certification Status Card */}
            <div className="mt-6 p-6 bg-[#F5F5F7] rounded-xl">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  daysUntilExpiration === null ? 'bg-[#5856D6]' :
                  daysUntilExpiration < 0 ? 'bg-[#FF3B30]' :
                  daysUntilExpiration <= 30 ? 'bg-[#FF3B30]' :
                  daysUntilExpiration <= 90 ? 'bg-[#FF9500]' : 'bg-[#34C759]'
                }`}>
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-[#1D1D1F]">
                    {daysUntilExpiration === null ? 'No Expiration Set' :
                     daysUntilExpiration < 0 ? 'Certification Expired' :
                     daysUntilExpiration <= 30 ? 'Urgent: Renewal Required' :
                     daysUntilExpiration <= 90 ? 'Renewal Coming Soon' : 'Certification Active'}
                  </h4>
                  <p className="text-sm text-[#6E6E73] mt-1">
                    {daysUntilExpiration === null ? 'Set your certification expiration date to track renewal.' :
                     daysUntilExpiration < 0 ? `Your certification expired ${Math.abs(daysUntilExpiration)} days ago.` :
                     `${daysUntilExpiration} days until your certification expires.`}
                  </p>
                  <a
                    href="https://www.ncchwa.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[#0071E3] hover:underline"
                  >
                    Visit NCCHWA for renewal
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </CardSection>
        )}

        {/* Tab 3: Service Area */}
        {activeTab === 3 && (
          <CardSection title="Service Area">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AppleSelect
                  label="Region"
                  value={profile.serviceArea?.region || ''}
                  onChange={(v) => handleInputChange('region', v, 'serviceArea')}
                  disabled={!isEditing}
                  placeholder="Select your region"
                  options={[
                    { value: 'Region 1', label: 'Region 1' },
                    { value: 'Region 2', label: 'Region 2' },
                    { value: 'Region 3', label: 'Region 3' },
                    { value: 'Region 4', label: 'Region 4' },
                    { value: 'Region 5', label: 'Region 5' },
                    { value: 'Region 6', label: 'Region 6' }
                  ]}
                />
                <AppleSelect
                  label="County of Residence"
                  value={profile.serviceArea?.countyResideIn || ''}
                  onChange={(v) => handleInputChange('countyResideIn', v, 'serviceArea')}
                  disabled={!isEditing}
                  placeholder="Select county"
                  options={NC_COUNTIES.map(c => ({ value: c, label: `${c} County` }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#1D1D1F]">Counties Worked In</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-[#F5F5F7] rounded-xl">
                  {NC_COUNTIES.map((county) => {
                    const isSelected = profile.serviceArea?.countiesWorkedIn?.includes(county);
                    return (
                      <button
                        key={county}
                        type="button"
                        onClick={() => {
                          if (!isEditing) return;
                          const current = profile.serviceArea?.countiesWorkedIn || [];
                          const updated = isSelected
                            ? current.filter(c => c !== county)
                            : [...current, county];
                          handleInputChange('countiesWorkedIn', updated, 'serviceArea');
                        }}
                        disabled={!isEditing}
                        className={`
                          px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                          ${isSelected
                            ? 'bg-[#0071E3] text-white'
                            : 'bg-white text-[#1D1D1F] border border-[#D2D2D7] hover:border-[#0071E3]'
                          }
                          ${!isEditing ? 'cursor-default' : 'cursor-pointer'}
                        `}
                      >
                        {county}
                      </button>
                    );
                  })}
                </div>
                {profile.serviceArea?.countiesWorkedIn && profile.serviceArea.countiesWorkedIn.length > 0 && (
                  <p className="text-xs text-[#86868B] mt-2">
                    {profile.serviceArea.countiesWorkedIn.length} counties selected
                  </p>
                )}
              </div>
            </div>
          </CardSection>
        )}

        {/* Tab 4: Organization */}
        {activeTab === 4 && (
          <CardSection title="Linked Organization">
            <div className="space-y-4">
              <p className="text-sm text-[#6E6E73]">
                Link your CHW profile to the nonprofit organization you work with. This enables collaboration, referral tracking, and access to organizational resources.
              </p>
              <NonprofitLinker
                currentNonprofitId={userProfile?.linkedNonprofitId}
                onNonprofitLinked={(id) => {
                  console.log('Linked to nonprofit:', id);
                  loadProfile(); // Refresh profile to show organization lozenge
                }}
                onNonprofitUnlinked={() => {
                  console.log('Unlinked from nonprofit');
                  loadProfile(); // Refresh profile to remove organization lozenge
                }}
              />
            </div>
          </CardSection>
        )}

        {/* Tab 5: CHW Tools */}
        {activeTab === 5 && (
          <div className="bg-[#F5F5F7] rounded-2xl p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Your Tools</h3>
              <p className="text-[#6E6E73] mt-1">Everything you need for community health work</p>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/referrals" className="flex items-center gap-3 p-4 bg-[#0071E3] text-white rounded-xl hover:bg-[#0077ED] transition-colors">
                  <Send className="w-6 h-6" />
                  <div className="flex-1">
                    <p className="font-semibold">New Referral</p>
                    <p className="text-sm opacity-80">Connect clients to services</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/forms" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#D2D2D7] hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-[#5856D6] rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1D1D1F]">Create Form</p>
                    <p className="text-sm text-[#6E6E73]">Collect data</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#86868B]" />
                </Link>
                <Link href="/ai-assistant" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#D2D2D7] hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-[#32ADE6] rounded-xl flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1D1D1F]">Ask AI</p>
                    <p className="text-sm text-[#6E6E73]">Get assistance</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#86868B]" />
                </Link>
              </div>
            </div>

            {/* All Tools Grid */}
            <div>
              <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-3">All Tools</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { icon: FileText, label: 'Forms', href: '/forms', color: '#5856D6' },
                  { icon: Database, label: 'Datasets', href: '/datasets', color: '#34C759' },
                  { icon: BarChart3, label: 'Reports', href: '/reports', color: '#FF2D55' },
                  { icon: Bot, label: 'AI Assistant', href: '/ai-assistant', color: '#32ADE6' },
                  { icon: DollarSign, label: 'Grants', href: '/grants', color: '#FF9500' },
                  { icon: Send, label: 'Referrals', href: '/referrals', color: '#0071E3' },
                  { icon: FolderKanban, label: 'Projects', href: '/projects', color: '#AF52DE' },
                  { icon: BookOpen, label: 'Resources', href: '/resources', color: '#FF6B6B' },
                  { icon: Users, label: 'Collaborations', href: '/collaborations', color: '#5AC8FA' },
                  { icon: Wrench, label: 'Data Tools', href: '/data-tools', color: '#8E8E93' },
                ].map((tool) => (
                  <Link key={tool.label} href={tool.href} className="flex flex-col items-center p-4 bg-white rounded-xl border border-[#D2D2D7] hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: tool.color }}>
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[#1D1D1F]">{tool.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 p-4 bg-white rounded-xl border border-[#D2D2D7] flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-[#1D1D1F]">Need help getting started?</p>
                <p className="text-sm text-[#6E6E73]">Our AI assistant can guide you through any tool</p>
              </div>
              <Link href="/ai-assistant" className="px-4 py-2 bg-[#F5F5F7] text-[#0071E3] rounded-full font-medium text-sm hover:bg-[#E8E8ED] transition-colors">
                Get Help →
              </Link>
            </div>
          </div>
        )}

        {/* Tab 6: Privacy */}
        {activeTab === 6 && (
          <div className="space-y-6">
            <CardSection title="Directory Settings">
              <AppleToggle
                label="Include my profile in the CHW Directory"
                description="When enabled, other CHWs can find and connect with you through the directory"
                checked={profile.membership?.includeInDirectory ?? true}
                onChange={(v) => handleInputChange('includeInDirectory', v, 'membership')}
                disabled={!isEditing}
              />
            </CardSection>

            <CardSection title="Contact Preferences">
              <div className="divide-y divide-[#D2D2D7]">
                <AppleToggle
                  label="Allow direct messages from other CHWs"
                  checked={profile.contactPreferences?.allowDirectMessages ?? true}
                  onChange={(v) => handleInputChange('allowDirectMessages', v, 'contactPreferences')}
                  disabled={!isEditing}
                />
                <AppleToggle
                  label="Show my email address in directory"
                  checked={profile.contactPreferences?.showEmail ?? false}
                  onChange={(v) => handleInputChange('showEmail', v, 'contactPreferences')}
                  disabled={!isEditing}
                />
                <AppleToggle
                  label="Show my phone number in directory"
                  checked={profile.contactPreferences?.showPhone ?? false}
                  onChange={(v) => handleInputChange('showPhone', v, 'contactPreferences')}
                  disabled={!isEditing}
                />
              </div>
            </CardSection>

            <CardSection title="Preferred Contact Method">
              <AppleSelect
                label="How would you prefer to be contacted?"
                value={profile.contactMethodPreference || 'email'}
                onChange={(v) => handleInputChange('contactMethodPreference', v)}
                disabled={!isEditing}
                options={[
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Phone' },
                  { value: 'text', label: 'Text Message' },
                  { value: 'any', label: 'Any Method' }
                ]}
              />
            </CardSection>
          </div>
        )}

        {/* Tab 7: Social */}
        {activeTab === 7 && (
          <CardSection title="Social Links">
            <p className="text-sm text-[#6E6E73] mb-6">
              Connect your social media profiles to help other CHWs learn more about your work
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#1D1D1F]">LinkedIn Profile</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0077B5]">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={profile.socialLinks?.linkedin || ''}
                    onChange={(e) => {
                      const newLinks = { ...profile.socialLinks, linkedin: e.target.value };
                      handleInputChange('socialLinks', newLinks);
                    }}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D2D2D7] bg-white text-[#1D1D1F] text-sm placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent disabled:bg-[#F5F5F7] disabled:text-[#86868B] disabled:cursor-not-allowed transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#1D1D1F]">Twitter/X Profile</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1DA1F2]">
                    <Twitter className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={profile.socialLinks?.twitter || ''}
                    onChange={(e) => {
                      const newLinks = { ...profile.socialLinks, twitter: e.target.value };
                      handleInputChange('socialLinks', newLinks);
                    }}
                    disabled={!isEditing}
                    placeholder="https://twitter.com/yourhandle"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D2D2D7] bg-white text-[#1D1D1F] text-sm placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent disabled:bg-[#F5F5F7] disabled:text-[#86868B] disabled:cursor-not-allowed transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#1D1D1F]">Facebook Profile</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1877F2]">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={profile.socialLinks?.facebook || ''}
                    onChange={(e) => {
                      const newLinks = { ...profile.socialLinks, facebook: e.target.value };
                      handleInputChange('socialLinks', newLinks);
                    }}
                    disabled={!isEditing}
                    placeholder="https://facebook.com/yourprofile"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D2D2D7] bg-white text-[#1D1D1F] text-sm placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent disabled:bg-[#F5F5F7] disabled:text-[#86868B] disabled:cursor-not-allowed transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#1D1D1F]">Personal Website</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={profile.socialLinks?.website || ''}
                    onChange={(e) => {
                      const newLinks = { ...profile.socialLinks, website: e.target.value };
                      handleInputChange('socialLinks', newLinks);
                    }}
                    disabled={!isEditing}
                    placeholder="https://yourwebsite.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D2D2D7] bg-white text-[#1D1D1F] text-sm placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent disabled:bg-[#F5F5F7] disabled:text-[#86868B] disabled:cursor-not-allowed transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </CardSection>
        )}
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex items-center justify-end gap-3 p-4 bg-white rounded-2xl border border-[#D2D2D7]">
          <button
            onClick={() => {
              setIsEditing(false);
              setError(null);
            }}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-[#1D1D1F] bg-[#F5F5F7] rounded-xl font-medium text-sm hover:bg-[#E8E8ED] transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0071E3] text-white rounded-xl font-medium text-sm hover:bg-[#0077ED] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
