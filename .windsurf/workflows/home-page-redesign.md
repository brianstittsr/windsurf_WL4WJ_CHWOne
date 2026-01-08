---
description: Restyle home page with hero carousel, persuasion marketing, and admin-managed content
---

# Home Page Redesign: Hero Carousel with Admin Management

## Overview
Redesign the CHWOne home page to feature a dynamic hero carousel with stakeholder-specific persuasion marketing content. Include an admin backend wizard for managing carousel slides. All components must use **Tailwind CSS** and **shadcn/ui** for consistency.

---

## 1. Hero Carousel Component

### Requirements
Create a full-width hero carousel at `src/components/Home/HeroCarousel.tsx` with:

#### Visual Design
- **Full viewport height** hero section with smooth slide transitions
- **Auto-advance** every 8 seconds with pause on hover
- **Navigation dots** and **arrow controls** using shadcn/ui Button components
- **Progress bar** showing time until next slide
- **Responsive design**: Stack content vertically on mobile

#### Slide Structure (per slide)
```tsx
interface CarouselSlide {
  id: string;
  title: string;                    // Main headline (persuasive)
  subtitle: string;                 // Supporting value proposition
  description: string;              // 2-3 sentence benefit statement
  ctaText: string;                  // Call-to-action button text
  ctaAction: 'register_chw' | 'register_nonprofit' | 'register_association' | 'login' | 'learn_more';
  secondaryCtaText?: string;        // Optional secondary CTA
  secondaryCtaLink?: string;
  backgroundGradient: string;       // Tailwind gradient classes
  accentColor: string;              // For buttons/highlights
  imageUrl?: string;                // Optional background/side image
  testimonial?: {                   // Optional social proof
    quote: string;
    author: string;
    role: string;
    avatarUrl?: string;
  };
  stats?: Array<{                   // Optional impact stats
    value: string;
    label: string;
  }>;
  isActive: boolean;
  order: number;
}
```

---

## 2. Stakeholder-Specific Slides (Default Content)

### Slide 1: Community Health Workers
**Target Audience**: Individual CHWs looking to grow their career

```
Title: "Elevate Your CHW Career"
Subtitle: "Join 500+ Community Health Workers Transforming Lives in North Carolina"
Description: "Create your professional profile, connect with opportunities, and access the tools you need to make a bigger impact in your community. Free to join."

CTA: "Register as a CHW" → Opens CHW Registration Wizard
Secondary CTA: "View CHW Directory" → /chws/mock-profiles

Background: gradient-to-br from-blue-900 via-blue-800 to-cyan-700
Accent: cyan-400

Stats:
- "500+" / "Active CHWs"
- "150+" / "Partner Organizations"
- "10K+" / "Clients Served"

Testimonial:
- "CHWOne helped me find my current position and connect with resources I never knew existed."
- Maria Santos, Certified CHW, Durham County
```

### Slide 2: Nonprofit Organizations
**Target Audience**: Nonprofit leaders seeking CHW partnerships

```
Title: "Expand Your Community Reach"
Subtitle: "Connect with Qualified CHWs to Amplify Your Mission"
Description: "List your services, receive client referrals, and partner with trained Community Health Workers who understand your community's needs. Track your impact with powerful analytics."

CTA: "Register Your Organization" → Opens Nonprofit Registration Wizard
Secondary CTA: "Learn How It Works" → /about

Background: gradient-to-br from-teal-800 via-teal-700 to-emerald-600
Accent: emerald-400

Stats:
- "85%" / "Referral Success Rate"
- "3x" / "Community Reach"
- "24hr" / "Average Response Time"

Testimonial:
- "We've doubled our client referrals since joining CHWOne. The platform makes collaboration seamless."
- Dr. James Wilson, Executive Director, Community Health Alliance
```

### Slide 3: CHW Associations
**Target Audience**: State/regional leaders building CHW infrastructure

```
Title: "Build Your State's CHW Workforce"
Subtitle: "The Platform for Statewide CHW Coordination and Advocacy"
Description: "Organize training programs, manage certifications, and unite CHWs and organizations across your state. Get the data and tools you need to advocate for the CHW profession."

CTA: "Start Your Association" → Opens Association Registration Wizard
Secondary CTA: "See NC Association Example" → /associations/nc

Background: gradient-to-br from-indigo-900 via-purple-800 to-blue-700
Accent: purple-400

Stats:
- "8" / "State Associations"
- "2,000+" / "CHWs Organized"
- "50+" / "Training Programs"

Testimonial:
- "CHWOne gave us the infrastructure to finally unite CHWs across our entire state."
- Patricia Johnson, President, NC CHW Association
```

### Slide 4: General/Welcome
**Target Audience**: First-time visitors exploring the platform

```
Title: "One Platform. Infinite Impact."
Subtitle: "Where Community Health Workers, Nonprofits, and Associations Connect"
Description: "CHWOne is the comprehensive platform for managing, connecting, and empowering the community health workforce. Join the movement transforming healthcare access."

CTA: "Get Started Free" → /register
Secondary CTA: "Watch Demo" → Opens video modal

Background: gradient-to-br from-slate-900 via-blue-900 to-indigo-800
Accent: white

Stats:
- "50+" / "Counties Served"
- "1M+" / "Community Members Reached"
- "100%" / "Free for CHWs"
```

---

## 3. Admin Carousel Management Backend

### Location
Create admin pages at:
- `src/app/admin/carousel/page.tsx` - Carousel slide list/management
- `src/app/admin/carousel/[id]/page.tsx` - Edit individual slide
- `src/components/Admin/CarouselSlideEditor.tsx` - Slide editor form

### Admin Features

#### Slide List View
- Drag-and-drop reordering using `@dnd-kit/core`
- Toggle slide active/inactive status
- Preview thumbnail for each slide
- Quick actions: Edit, Duplicate, Delete, Preview

#### Slide Editor Wizard (shadcn/ui components)
```
Step 1: Content
- Title (Input)
- Subtitle (Input)
- Description (Textarea)
- Target Audience (Select: CHW, Nonprofit, Association, General)

Step 2: Call-to-Action
- Primary CTA Text (Input)
- Primary CTA Action (Select: register_chw, register_nonprofit, register_association, login, learn_more, custom_link)
- Custom Link URL (Input, conditional)
- Secondary CTA Text (Input, optional)
- Secondary CTA Link (Input, optional)

Step 3: Visual Design
- Background Gradient (Gradient Picker or preset Select)
- Accent Color (Color Picker)
- Background Image Upload (optional)
- Image Position (Select: left, right, background, none)

Step 4: Social Proof (optional)
- Enable Testimonial (Switch)
- Quote (Textarea)
- Author Name (Input)
- Author Role (Input)
- Author Avatar Upload

Step 5: Statistics (optional)
- Enable Stats (Switch)
- Stat 1-4: Value + Label pairs

Step 6: Preview & Publish
- Live preview of slide
- Active/Inactive toggle
- Save as Draft / Publish buttons
```

### Data Storage
Store carousel slides in Firebase Firestore:
```
Collection: carouselSlides
Document: {
  id: string,
  ...CarouselSlide fields,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: string (userId),
  updatedBy: string (userId)
}
```

---

## 4. Component Architecture

### New Components to Create

```
src/components/Home/
├── HeroCarousel.tsx           # Main carousel component
├── CarouselSlide.tsx          # Individual slide renderer
├── CarouselControls.tsx       # Dots, arrows, progress bar
├── CarouselStats.tsx          # Stats display component
├── CarouselTestimonial.tsx    # Testimonial card component
└── index.ts                   # Exports

src/components/Admin/
├── CarouselSlideEditor.tsx    # Multi-step slide editor
├── CarouselSlideList.tsx      # Sortable slide list
├── CarouselSlidePreview.tsx   # Live preview component
├── GradientPicker.tsx         # Gradient selection UI
└── index.ts                   # Exports

src/hooks/
├── useCarouselSlides.ts       # Fetch/manage carousel data
└── useCarouselAdmin.ts        # Admin CRUD operations

src/lib/
└── carousel-service.ts        # Firebase operations for carousel
```

---

## 5. Styling Requirements

### All Components Must Use:
- **Tailwind CSS** for all styling (no inline MUI sx props)
- **shadcn/ui** components:
  - `Button` for all buttons
  - `Card` for content containers
  - `Input`, `Textarea`, `Select` for forms
  - `Switch` for toggles
  - `Tabs` for wizard steps
  - `Dialog` for modals
  - `Avatar` for testimonial avatars
  - `Badge` for status indicators
  - `Progress` for carousel timer

### Animation Classes
Add to `tailwind.config.ts`:
```ts
keyframes: {
  'slide-in-right': {
    '0%': { transform: 'translateX(100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  'slide-out-left': {
    '0%': { transform: 'translateX(0)', opacity: '1' },
    '100%': { transform: 'translateX(-100%)', opacity: '0' },
  },
  'fade-in': {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  'progress-bar': {
    '0%': { width: '0%' },
    '100%': { width: '100%' },
  },
},
animation: {
  'slide-in-right': 'slide-in-right 0.5s ease-out',
  'slide-out-left': 'slide-out-left 0.5s ease-out',
  'fade-in': 'fade-in 0.3s ease-out',
  'progress-bar': 'progress-bar 8s linear',
},
```

---

## 6. Page Structure

### New Home Page Layout (`src/app/page.tsx`)

```tsx
<div className="min-h-screen flex flex-col">
  {/* Compact Header */}
  <Header />
  
  {/* Hero Carousel - Full viewport minus header */}
  <HeroCarousel slides={slides} />
  
  {/* Optional: Quick Features Bar */}
  <FeaturesBar />
  
  {/* Compact Footer */}
  <Footer />
</div>
```

### Key Behaviors
1. Carousel fills remaining viewport height after header
2. No page scrolling required to see main content
3. Registration wizards open in Dialog modals (already implemented)
4. All forms inside wizards use shadcn/ui components

---

## 7. Migration Checklist

### Forms to Migrate to shadcn/ui + Tailwind:
- [x] CHWWizardShadcn.tsx (already done)
- [ ] NonprofitWizard.tsx → NonprofitWizardShadcn.tsx
- [ ] CHWAssociationWizard.tsx → CHWAssociationWizardShadcn.tsx
- [ ] CarouselSlideEditor.tsx (new, use shadcn from start)

### Components to Create:
- [ ] HeroCarousel.tsx
- [ ] CarouselSlide.tsx
- [ ] CarouselControls.tsx
- [ ] CarouselSlideEditor.tsx
- [ ] CarouselSlideList.tsx
- [ ] useCarouselSlides.ts hook
- [ ] carousel-service.ts

### Admin Pages to Create:
- [ ] /admin/carousel - Slide management
- [ ] /admin/carousel/new - Create slide
- [ ] /admin/carousel/[id] - Edit slide

---

## 8. Implementation Order

1. **Create carousel data types** (`src/types/carousel.types.ts`)
2. **Create Firebase service** (`src/lib/carousel-service.ts`)
3. **Create useCarouselSlides hook** with default slides fallback
4. **Build HeroCarousel component** with Tailwind/shadcn
5. **Update home page** to use new carousel
6. **Create admin carousel list page**
7. **Create CarouselSlideEditor** wizard component
8. **Migrate NonprofitWizard** to shadcn/ui
9. **Migrate CHWAssociationWizard** to shadcn/ui
10. **Test all registration flows**

---

## 9. Persuasion Marketing Principles Applied

Each slide follows proven conversion principles:

1. **Social Proof**: Testimonials and stats build trust
2. **Specificity**: Concrete numbers ("500+ CHWs") over vague claims
3. **Benefit-Focused**: Headlines emphasize outcomes, not features
4. **Urgency/FOMO**: "Join 500+ CHWs" implies others are already benefiting
5. **Clear CTA**: Single primary action per slide
6. **Audience Segmentation**: Each slide speaks directly to one persona
7. **Visual Hierarchy**: Title → Subtitle → Description → CTA flow
8. **Reduced Friction**: "Free to join" removes cost objection

---

## 10. Success Metrics

Track these events in analytics:
- Carousel slide views (which slides get most attention)
- CTA click-through rates per slide
- Registration wizard opens by source slide
- Registration completion rates
- Time spent on each slide

---

## Usage

To implement this redesign, run:
```
Cascade, please implement the home page redesign following the /home-page-redesign workflow.
```

Or implement step by step:
```
Cascade, create the HeroCarousel component following the /home-page-redesign workflow, step 4.
```
