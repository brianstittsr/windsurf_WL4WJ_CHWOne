'use server';

import { NextRequest, NextResponse } from 'next/server';

// IRS EOS Search Parameters
interface IRSSearchParams {
  database: string; // 'all', 'pub78', 'bmf', 'revocation', 'determination'
  searchBy: string; // 'ein', 'name'
  searchTerm: string;
  city: string;
  state: string;
  country: string;
  page: number;
}

// IRS Organization Result
interface IRSOrganization {
  ein: string;
  organizationName: string;
  city: string;
  state: string;
  country: string;
  deductibilityCode?: string;
  deductibilityStatus?: string;
  exemptStatus?: string;
  subsectionCode?: string;
  foundationCode?: string;
  filingRequirement?: string;
  pfFilingRequirement?: string;
  accountingPeriod?: string;
  assetAmount?: number;
  incomeAmount?: number;
  form990Required?: boolean;
  nteeCode?: string;
  sortName?: string;
  rulingDate?: string;
  databases: string[];
  // Detail page fields
  address?: string;
  zipCode?: string;
  exemptionType?: string;
  classification?: string;
  affiliation?: string;
  groupExemption?: string;
  organizationType?: string;
  taxPeriod?: string;
  assetAmountEOY?: number;
  incomeAmountEOY?: number;
  revenueAmount?: number;
  form990Series?: string;
}

interface IRSSearchResponse {
  organizations: IRSOrganization[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

// Note: The IRS EOS website blocks automated scraping.
// This API provides a structured way to handle the data if accessed through
// an approved method (manual entry, official IRS API, or bulk data downloads).
// 
// For production use, consider:
// 1. IRS Exempt Organizations Business Master File (BMF) - Available for download
// 2. IRS Form 990 data from AWS Open Data Registry
// 3. ProPublica Nonprofit Explorer API
// 4. GuideStar/Candid API

export async function POST(request: NextRequest) {
  try {
    const params: IRSSearchParams = await request.json();
    
    // Validate required parameters
    if (!params.state) {
      return NextResponse.json(
        { error: 'State is required for search' },
        { status: 400 }
      );
    }

    // For now, return a message about the IRS website limitations
    // and provide alternative data sources
    return NextResponse.json({
      message: 'IRS EOS Direct Scraping Not Available',
      reason: 'The IRS EOS website (apps.irs.gov/app/eos) blocks automated scraping requests.',
      alternatives: [
        {
          name: 'IRS BMF Extract',
          description: 'Download the IRS Exempt Organizations Business Master File',
          url: 'https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf'
        },
        {
          name: 'ProPublica Nonprofit Explorer',
          description: 'Free API for nonprofit data including Form 990s',
          url: 'https://projects.propublica.org/nonprofits/api'
        },
        {
          name: 'IRS Form 990 on AWS',
          description: 'Machine-readable Form 990 data on AWS Open Data',
          url: 'https://registry.opendata.aws/irs990/'
        }
      ],
      searchParams: params,
      organizations: [],
      totalResults: 0,
      currentPage: params.page || 1,
      totalPages: 0,
      hasMore: false
    });

  } catch (error) {
    console.error('IRS EOS API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process IRS search request' },
      { status: 500 }
    );
  }
}

// GET endpoint to check API status
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'IRS EOS Search API',
    note: 'Direct IRS scraping is not available. Use alternative data sources.',
    alternatives: [
      'IRS BMF Extract',
      'ProPublica Nonprofit Explorer API',
      'IRS Form 990 AWS Open Data'
    ]
  });
}
