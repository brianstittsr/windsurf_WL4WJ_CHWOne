import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ProPublicaOrg {
  ein: string;
  name: string;
  city: string;
  state: string;
  ntee_code: string;
  subsection_code: number;
  classification_codes: string;
  ruling_date: string;
  deductibility_code: number;
  foundation_code: number;
  activity_codes: string;
  organization_code: number;
  exempt_status_code: number;
  tax_period: number;
  asset_amount: number;
  income_amount: number;
  revenue_amount: number;
  score: number;
}

interface ProPublicaSearchResponse {
  total_results: number;
  num_pages: number;
  cur_page: number;
  per_page: number;
  page_offset: number;
  search_query: string;
  selected_state: string | null;
  selected_ntee: number | null;
  selected_code: string | null;
  data_source: string;
  api_version: number;
  organizations: ProPublicaOrg[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const state = searchParams.get('state') || 'NC';
    const page = searchParams.get('page') || '0';

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // ProPublica Nonprofit Explorer API
    // Documentation: https://projects.propublica.org/nonprofits/api
    const apiUrl = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(query)}&state%5Bid%5D=${state}&page=${page}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('ProPublica API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to search nonprofits' },
        { status: response.status }
      );
    }

    const data: ProPublicaSearchResponse = await response.json();

    // Transform the data to our format
    const nonprofits = data.organizations.map((org) => ({
      ein: org.ein,
      name: org.name,
      city: org.city,
      state: org.state,
      nteeCode: org.ntee_code,
      subsectionCode: org.subsection_code,
      classificationCodes: org.classification_codes,
      rulingDate: org.ruling_date,
      deductibilityCode: org.deductibility_code,
      foundationCode: org.foundation_code,
      activityCodes: org.activity_codes,
      organizationCode: org.organization_code,
      exemptStatusCode: org.exempt_status_code,
      taxPeriod: org.tax_period,
      assetAmount: org.asset_amount,
      incomeAmount: org.income_amount,
      revenueAmount: org.revenue_amount,
      score: org.score,
    }));

    return NextResponse.json({
      totalResults: data.total_results,
      numPages: data.num_pages,
      currentPage: data.cur_page,
      perPage: data.per_page,
      nonprofits,
    });
  } catch (error) {
    console.error('Error searching nonprofits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
