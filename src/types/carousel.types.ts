import { Timestamp } from 'firebase/firestore';

export type CTAAction = 
  | 'register_chw' 
  | 'register_nonprofit' 
  | 'register_association' 
  | 'login' 
  | 'learn_more'
  | 'custom_link';

export type TargetAudience = 'chw' | 'nonprofit' | 'association' | 'general';

export type ImagePosition = 'left' | 'right' | 'background' | 'none';

export interface CarouselTestimonial {
  quote: string;
  author: string;
  role: string;
  avatarUrl?: string;
}

export interface CarouselStat {
  value: string;
  label: string;
}

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaAction: CTAAction;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundGradient: string;
  accentColor: string;
  imageUrl?: string;
  imagePosition: ImagePosition;
  testimonial?: CarouselTestimonial;
  stats?: CarouselStat[];
  targetAudience: TargetAudience;
  isActive: boolean;
  order: number;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

export interface CarouselSlideFormData extends Omit<CarouselSlide, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> {}

// Default slides for when no slides are configured in the database
export const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'default-chw',
    title: 'Elevate Your CHW Career',
    subtitle: 'Join 500+ Community Health Workers Transforming Lives in North Carolina',
    description: 'Create your professional profile, connect with opportunities, and access the tools you need to make a bigger impact in your community. Free to join.',
    ctaText: 'Register as a CHW',
    ctaAction: 'register_chw',
    secondaryCtaText: 'View CHW Directory',
    secondaryCtaLink: '/chws/mock-profiles',
    backgroundGradient: 'bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700',
    accentColor: 'cyan-400',
    imageUrl: '/images/hero/chw1.jpg',
    imagePosition: 'right',
    targetAudience: 'chw',
    isActive: true,
    order: 0,
    stats: [
      { value: '500+', label: 'Active CHWs' },
      { value: '150+', label: 'Partner Organizations' },
      { value: '10K+', label: 'Clients Served' },
    ],
    testimonial: {
      quote: 'CHWOne helped me find my current position and connect with resources I never knew existed.',
      author: 'Maria Santos',
      role: 'Certified CHW, Durham County',
    },
  },
  {
    id: 'default-nonprofit',
    title: 'Expand Your Community Reach',
    subtitle: 'Connect with Qualified CHWs to Amplify Your Mission',
    description: 'List your services, receive client referrals, and partner with trained Community Health Workers who understand your community\'s needs. Track your impact with powerful analytics.',
    ctaText: 'Register Your Organization',
    ctaAction: 'register_nonprofit',
    secondaryCtaText: 'Learn How It Works',
    secondaryCtaLink: '/about',
    backgroundGradient: 'bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600',
    accentColor: 'emerald-400',
    imageUrl: '/images/hero/nonprofit.jpg',
    imagePosition: 'right',
    targetAudience: 'nonprofit',
    isActive: true,
    order: 1,
    stats: [
      { value: '85%', label: 'Referral Success Rate' },
      { value: '3x', label: 'Community Reach' },
      { value: '24hr', label: 'Average Response Time' },
    ],
    testimonial: {
      quote: 'We\'ve doubled our client referrals since joining CHWOne. The platform makes collaboration seamless.',
      author: 'Dr. James Wilson',
      role: 'Executive Director, Community Health Alliance',
    },
  },
  {
    id: 'default-association',
    title: 'Build Your State\'s CHW Workforce',
    subtitle: 'The Platform for Statewide CHW Coordination and Advocacy',
    description: 'Organize training programs, manage certifications, and unite CHWs and organizations across your state. Get the data and tools you need to advocate for the CHW profession.',
    ctaText: 'Start Your Association',
    ctaAction: 'register_association',
    secondaryCtaText: 'See NC Association Example',
    secondaryCtaLink: '/associations/nc',
    backgroundGradient: 'bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-700',
    accentColor: 'purple-400',
    imageUrl: '/images/hero/ncstatelegistature2.jpg',
    imagePosition: 'right',
    targetAudience: 'association',
    isActive: true,
    order: 2,
    stats: [
      { value: '8', label: 'State Associations' },
      { value: '2,000+', label: 'CHWs Organized' },
      { value: '50+', label: 'Training Programs' },
    ],
    testimonial: {
      quote: 'CHWOne gave us the infrastructure to finally unite CHWs across our entire state.',
      author: 'Patricia Johnson',
      role: 'President, NC CHW Association',
    },
  },
  {
    id: 'default-general',
    title: 'The First AI-Powered CHW Platform',
    subtitle: 'Designed to Drive Change and Support Community Health Workers',
    description: 'CHWOne leverages artificial intelligence to reduce burnout, ease stress, and combat mental fatigue among Community Health Workers. Join the movement transforming how CHWs work and thrive.',
    ctaText: 'Get Started Free',
    ctaAction: 'login',
    secondaryCtaText: 'Watch Demo',
    secondaryCtaLink: '/demo',
    backgroundGradient: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800',
    accentColor: 'white',
    imageUrl: '/images/hero/CHW4AI2.webp',
    imagePosition: 'right',
    targetAudience: 'general',
    isActive: true,
    order: 3,
    stats: [
      { value: '50+', label: 'Counties Served' },
      { value: '1M+', label: 'Community Members Reached' },
      { value: '100%', label: 'Free for CHWs' },
    ],
  },
];

// Gradient presets for the admin editor
export const GRADIENT_PRESETS = [
  { name: 'Blue Ocean', value: 'bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700' },
  { name: 'Teal Forest', value: 'bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600' },
  { name: 'Purple Night', value: 'bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-700' },
  { name: 'Dark Slate', value: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800' },
  { name: 'Sunset', value: 'bg-gradient-to-br from-orange-600 via-red-600 to-pink-700' },
  { name: 'Forest', value: 'bg-gradient-to-br from-green-800 via-emerald-700 to-teal-600' },
  { name: 'Royal', value: 'bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-700' },
  { name: 'Midnight', value: 'bg-gradient-to-br from-gray-900 via-slate-800 to-zinc-700' },
];

// Accent color presets
export const ACCENT_COLOR_PRESETS = [
  { name: 'Cyan', value: 'cyan-400' },
  { name: 'Emerald', value: 'emerald-400' },
  { name: 'Purple', value: 'purple-400' },
  { name: 'White', value: 'white' },
  { name: 'Yellow', value: 'yellow-400' },
  { name: 'Pink', value: 'pink-400' },
  { name: 'Orange', value: 'orange-400' },
  { name: 'Blue', value: 'blue-400' },
];
