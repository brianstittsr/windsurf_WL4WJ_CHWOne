import { NextRequest, NextResponse } from 'next/server';

// ProPublica Nonprofit Explorer API
// Documentation: https://projects.propublica.org/nonprofits/api

interface ProPublicaOrg {
  ein: number;
  name: string;
  city: string;
  state: string;
  ntee_code: string;
  raw_ntee_code: string;
  subsection_code: number;
  classification_codes: string;
  ruling_date: string;
  deductibility_code: number;
  foundation_code: number;
  activity_codes: string;
  organization_code: number;
  exempt_organization_status_code: number;
  tax_period: string;
  asset_code: number;
  income_code: number;
  filing_requirement_code: number;
  pf_filing_requirement_code: number;
  accounting_period: number;
  asset_amount: number;
  income_amount: number;
  revenue_amount: number;
  score: number;
}

interface ProPublicaSearchResponse {
  total_results: number;
  num_pages: number;
  cur_page: number;
  page_offset: number;
  per_page: number;
  search_query: string;
  selected_state: string;
  selected_ntee: number;
  selected_code: string | null;
  data_source: string;
  api_version: number;
  organizations: ProPublicaOrg[];
}

interface ProPublicaOrgDetail {
  organization: {
    id: number;
    ein: number;
    name: string;
    careofname: string | null;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    exemption_number: number;
    subsection_code: number;
    affiliation_code: number;
    classification_codes: string;
    ruling_date: string;
    deductibility_code: number;
    foundation_code: number;
    activity_codes: string;
    organization_code: number;
    exempt_organization_status_code: number;
    tax_period: number;
    asset_code: number;
    income_code: number;
    filing_requirement_code: number;
    pf_filing_requirement_code: number;
    accounting_period: number;
    asset_amount: number;
    income_amount: number;
    form_990_revenue_amount: number;
    ntee_code: string;
    sort_name: string | null;
    created_at: string;
    updated_at: string;
    data_source: string;
    have_extracts: boolean | null;
    have_pdfs: boolean | null;
    latest_object_id: string;
  };
  filings_with_data: {
    tax_prd: number;
    tax_prd_yr: number;
    formtype: number;
    pdf_url: string;
    updated: string;
    totrevenue: number;
    totfuncexpns: number;
    totassetsend: number;
    totliabend: number;
    pct_compnsatncurrofcr: number;
  }[];
  filings_without_data: {
    tax_prd: number;
    formtype: number;
    pdf_url: string;
  }[];
  data_source: string;
  api_version: number;
}

// Search for nonprofits
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchTerm, state, page = 0, nteeCode } = body;

    // Build ProPublica API URL
    let apiUrl = 'https://projects.propublica.org/nonprofits/api/v2/search.json?';
    
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.append('q', searchTerm);
    }
    
    if (state) {
      params.append('state[id]', state);
    }
    
    if (nteeCode) {
      params.append('ntee[id]', nteeCode.toString());
    }
    
    params.append('page', page.toString());
    
    apiUrl += params.toString();

    console.log('Fetching from ProPublica:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CHWOne Platform (nonprofit research)'
      }
    });

    if (!response.ok) {
      throw new Error(`ProPublica API error: ${response.status}`);
    }

    const data: ProPublicaSearchResponse = await response.json();

    // Transform to our format
    const organizations = data.organizations.map(org => ({
      ein: formatEIN(org.ein),
      organizationName: org.name,
      city: org.city,
      state: org.state,
      nteeCode: org.ntee_code,
      subsectionCode: org.subsection_code,
      rulingDate: org.ruling_date,
      deductibilityCode: org.deductibility_code,
      foundationCode: org.foundation_code,
      assetAmount: org.asset_amount,
      incomeAmount: org.income_amount,
      revenueAmount: org.revenue_amount,
      taxPeriod: org.tax_period,
      classificationCodes: org.classification_codes,
      activityCodes: org.activity_codes
    }));

    return NextResponse.json({
      success: true,
      organizations,
      totalResults: data.total_results,
      currentPage: data.cur_page,
      totalPages: data.num_pages,
      perPage: data.per_page,
      hasMore: data.cur_page < data.num_pages - 1,
      dataSource: 'ProPublica Nonprofit Explorer'
    });

  } catch (error) {
    console.error('Nonprofit search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search nonprofits',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get organization details by EIN
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ein = searchParams.get('ein');

    if (!ein) {
      return NextResponse.json(
        { error: 'EIN is required' },
        { status: 400 }
      );
    }

    // Clean EIN (remove dashes)
    const cleanEIN = ein.replace(/-/g, '');

    const apiUrl = `https://projects.propublica.org/nonprofits/api/v2/organizations/${cleanEIN}.json`;

    console.log('Fetching org details from ProPublica:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CHWOne Platform (nonprofit research)'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
      throw new Error(`ProPublica API error: ${response.status}`);
    }

    const data: ProPublicaOrgDetail = await response.json();
    const org = data.organization;

    // Get the most recent filing with data
    const latestFiling = data.filings_with_data?.[0];

    return NextResponse.json({
      success: true,
      organization: {
        ein: formatEIN(org.ein),
        organizationName: org.name,
        careOfName: org.careofname,
        address: org.address,
        city: org.city,
        state: org.state,
        zipCode: org.zipcode,
        nteeCode: org.ntee_code,
        subsectionCode: org.subsection_code,
        affiliationCode: org.affiliation_code,
        classificationCodes: org.classification_codes,
        rulingDate: org.ruling_date,
        deductibilityCode: org.deductibility_code,
        foundationCode: org.foundation_code,
        activityCodes: org.activity_codes,
        organizationCode: org.organization_code,
        exemptStatusCode: org.exempt_organization_status_code,
        taxPeriod: org.tax_period,
        assetAmount: org.asset_amount,
        incomeAmount: org.income_amount,
        revenueAmount: org.form_990_revenue_amount,
        accountingPeriod: org.accounting_period,
        sortName: org.sort_name,
        // Latest filing data
        latestFiling: latestFiling ? {
          taxPeriod: latestFiling.tax_prd,
          taxYear: latestFiling.tax_prd_yr,
          formType: latestFiling.formtype,
          pdfUrl: latestFiling.pdf_url,
          totalRevenue: latestFiling.totrevenue,
          totalExpenses: latestFiling.totfuncexpns,
          totalAssets: latestFiling.totassetsend,
          totalLiabilities: latestFiling.totliabend,
          compensationPercent: latestFiling.pct_compnsatncurrofcr
        } : null,
        filingHistory: data.filings_with_data?.map(f => ({
          taxPeriod: f.tax_prd,
          taxYear: f.tax_prd_yr,
          formType: f.formtype,
          pdfUrl: f.pdf_url,
          totalRevenue: f.totrevenue,
          totalExpenses: f.totfuncexpns,
          totalAssets: f.totassetsend
        })) || []
      },
      dataSource: 'ProPublica Nonprofit Explorer'
    });

  } catch (error) {
    console.error('Organization detail error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch organization details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to format EIN with dash
function formatEIN(ein: number | string): string {
  const einStr = ein.toString().padStart(9, '0');
  return `${einStr.slice(0, 2)}-${einStr.slice(2)}`;
}
