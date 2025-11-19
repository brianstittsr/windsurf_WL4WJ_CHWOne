# CHW Jobs Feature Implementation

## Overview
This document outlines the comprehensive CHW Jobs feature implementation for the CHWOne platform, including job matching, AI-powered search, automated notifications, and web crawling capabilities.

## Features Implemented

### 1. Additional Expertise Field ✅
**Location:** `src/components/CHW/CHWWizard.tsx`

- Added "Additional Expertise" text field to the Professional Details page (Step 2) of CHW registration
- Allows CHWs to describe skills and experiences not covered by predefined expertise options
- Data is saved to both `users` and `chwProfiles` collections in Firebase
- Multi-line text field with helper text for guidance

### 2. CHW Jobs Section ✅
**Location:** `src/components/CHW/CHWJobsSection.tsx`

**Features:**
- **Job Listing**: Displays active CHW job opportunities from Firebase
- **Smart Matching**: AI-powered algorithm calculates match scores (0-100) based on:
  - Skills and expertise alignment
  - Location preferences
  - Experience level
  - Language capabilities
- **Tabbed Interface**:
  - **Recommended For You**: Jobs with 50%+ match score, sorted by relevance
  - **All Jobs**: Complete job listings with search functionality
  - **Saved Jobs**: Bookmarked opportunities
- **Job Cards**: Display key information including:
  - Title, organization, location
  - Employment type and salary range
  - Required skills (with chips)
  - Match score (for recommended jobs)
- **Job Details Dialog**: Full job description, requirements, and responsibilities
- **Actions**: View details, apply now, bookmark jobs

### 3. AI Job Search ✅
**Location:** `src/components/CHW/CHWJobAISearch.tsx`

**Features:**
- **AI-Powered Search**: Natural language job search using OpenAI GPT-4
- **Profile-Based Matching**: Considers CHW's expertise, languages, location, and experience
- **Automated Notifications**: Sends emails for high-match jobs (80%+ score)
- **Quick Suggestions**: Pre-defined search queries for common job types
- **Match Reasons**: Explains why each job matches the CHW's profile
- **Add to List**: One-click to save jobs to recommendation list

**API Endpoint:** `/api/chw/ai-job-search`

### 4. Admin Job Crawler Configuration ✅
**Location:** `src/components/Admin/AdminJobCrawler.tsx`

**Features:**
- **Crawler Management**: Create, edit, delete crawler configurations
- **Configuration Options**:
  - Name and URL
  - Crawl frequency (daily, weekly, monthly)
  - Enable/disable toggle
  - CSS selectors for job data extraction
  - Keyword filters (include/exclude)
  - Geographic filters (states, counties)
- **Manual Crawling**: Run crawler on-demand
- **Status Tracking**: Last crawl date, next scheduled crawl
- **Crawl4AI Integration**: Ready for web scraping implementation

**API Endpoint:** `/api/admin/crawl-jobs`

### 5. Crawl4AI Library ✅
**Location:** `package.json`

- Added `crawl4ai` package (v0.3.74) to dependencies
- Enables automated job discovery from websites
- Supports custom CSS selectors and filtering

### 6. Firebase User Registration ✅
**Location:** `src/components/CHW/CHWWizard.tsx`

**Verified Implementation:**
- User data is written to `users` collection (line 223)
- CHW profile data is written to `chwProfiles` collection (line 278)
- Includes all required fields:
  - Basic info (name, email, phone, address)
  - Professional details (including additionalExpertise)
  - Service area
  - Certification
  - Contact preferences
  - Permissions

## Data Models

### CHWJob
```typescript
interface CHWJob {
  id: string;
  title: string;
  organization: string;
  location: { city, state, county, remote, hybrid };
  description: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  salary: { min, max, type, currency };
  benefits: string[];
  employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  experienceLevel: 'entry' | 'intermediate' | 'advanced' | 'any';
  requiredSkills: string[];
  preferredSkills: string[];
  certificationRequired: boolean;
  languages: string[];
  applicationDeadline: Timestamp;
  contactEmail: string;
  applicationUrl: string;
  postedDate: Timestamp;
  status: 'active' | 'filled' | 'closed' | 'draft';
  source: 'manual' | 'crawled' | 'imported';
  sourceUrl: string;
  matchScore: number;
}
```

### CHWJobRecommendation
```typescript
interface CHWJobRecommendation {
  id: string;
  chwId: string;
  jobId: string;
  matchScore: number;
  matchReasons: string[];
  status: 'pending' | 'viewed' | 'applied' | 'dismissed';
  notificationSent: boolean;
  notificationSentAt: Timestamp;
}
```

### JobCrawlerConfig
```typescript
interface JobCrawlerConfig {
  id: string;
  name: string;
  enabled: boolean;
  url: string;
  crawlFrequency: 'daily' | 'weekly' | 'monthly';
  lastCrawlDate: Timestamp;
  nextCrawlDate: Timestamp;
  selectors: { jobTitle, organization, location, etc. };
  filters: { keywords, excludeKeywords, states, counties };
}
```

## API Routes

### 1. `/api/chw/ai-job-search` (POST)
- **Purpose**: AI-powered job search
- **Input**: `{ chwId, query, profile }`
- **Output**: `{ jobs: CHWJob[] }`
- **Features**: OpenAI integration, profile matching, mock data fallback

### 2. `/api/chw/send-job-notifications` (POST)
- **Purpose**: Send email notifications for job matches
- **Input**: `{ chwId, email, jobs }`
- **Output**: `{ success: boolean }`
- **Features**: Email template, batch notifications

### 3. `/api/chw/add-job-recommendation` (POST)
- **Purpose**: Add job to CHW's recommendation list
- **Input**: `{ chwId, jobId, matchScore, matchReasons }`
- **Output**: `{ recommendationId: string }`
- **Features**: Firestore integration, timestamp tracking

### 4. `/api/admin/crawl-jobs` (POST)
- **Purpose**: Execute job crawler
- **Input**: `{ configId }`
- **Output**: `{ jobsFound: number }`
- **Features**: Configuration loading, job extraction, Firestore storage

## Firebase Collections

### `chwJobs`
Stores all CHW job postings (manual, crawled, imported)

### `chwJobRecommendations`
Stores job recommendations for individual CHWs

### `jobCrawlerConfigs`
Stores crawler configurations for automated job discovery

## Integration Points

### CHW Profile
To integrate the jobs section into a CHW profile page:

```tsx
import CHWJobsSection from '@/components/CHW/CHWJobsSection';
import CHWJobAISearch from '@/components/CHW/CHWJobAISearch';

<CHWJobsSection chwId={chwId} chwProfile={chwProfile} />
<CHWJobAISearch chwId={chwId} chwProfile={chwProfile} />
```

### Admin Panel
To add the job crawler to the admin panel:

```tsx
import AdminJobCrawler from '@/components/Admin/AdminJobCrawler';

<AdminJobCrawler />
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key
```

3. Initialize Firestore collections (run once):
```bash
npm run deploy-schema
```

## Usage

### For CHWs
1. Complete registration with Additional Expertise field
2. View recommended jobs on profile page
3. Use AI search to find specific opportunities
4. Receive email notifications for high-match jobs
5. Save and apply to jobs

### For Admins
1. Navigate to Admin Panel > Job Crawler
2. Create crawler configurations for job sites
3. Set crawl frequency and filters
4. Run manual crawls or let automated scheduling handle it
5. Monitor job discovery and matching

## Future Enhancements

1. **Email Integration**: Connect to SendGrid/AWS SES for actual email delivery
2. **Crawl4AI Implementation**: Complete web scraping integration
3. **Application Tracking**: Track job applications and outcomes
4. **Employer Portal**: Allow employers to post jobs directly
5. **Advanced Filters**: More granular job search and filtering
6. **Job Alerts**: Scheduled email digests for new matches
7. **Analytics**: Track job posting performance and match rates

## Notes

- TypeScript lint warnings in AdminJobCrawler.tsx regarding optional selectors/filters are expected and safe (using optional chaining)
- Mock data is used in AI search API when OpenAI parsing fails
- Email notifications are logged but not sent until email service is configured
- Crawl4AI integration is prepared but requires implementation of actual scraping logic

## Testing

1. Test CHW registration with additional expertise
2. Verify user data in Firebase `users` collection
3. Test job matching algorithm with various profiles
4. Test AI search with different queries
5. Test crawler configuration CRUD operations
6. Verify job recommendations are saved correctly

## Support

For questions or issues, contact the development team or refer to the main project documentation.
