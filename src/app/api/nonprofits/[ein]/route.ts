import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ProPublicaOrgDetail {
  organization: {
    id: number;
    ein: string;
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
    exempt_status_code: number;
    tax_period: number;
    asset_code: number;
    income_code: number;
    filing_requirement_code: number;
    pf_filing_requirement_code: number;
    accounting_period: number;
    asset_amount: number;
    income_amount: number;
    revenue_amount: number;
    ntee_code: string;
    sort_name: string | null;
    created_at: string;
    updated_at: string;
    data_source: string;
    have_filings: boolean;
    have_extracts: boolean;
    have_pdfs: boolean;
  };
  filings_with_data: Array<{
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
  }>;
  filings_without_data: Array<{
    tax_prd: number;
    formtype: number;
    pdf_url: string;
  }>;
  data_source: string;
  api_version: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { ein: string } }
) {
  try {
    const ein = params.ein;

    if (!ein || ein.length < 9) {
      return NextResponse.json(
        { error: 'Invalid EIN format' },
        { status: 400 }
      );
    }

    // Clean EIN (remove dashes)
    const cleanEin = ein.replace(/\D/g, '');

    // ProPublica Nonprofit Explorer API - Get organization details
    const apiUrl = `https://projects.propublica.org/nonprofits/api/v2/organizations/${cleanEin}.json`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Nonprofit not found' },
          { status: 404 }
        );
      }
      console.error('ProPublica API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch nonprofit details' },
        { status: response.status }
      );
    }

    const data: ProPublicaOrgDetail = await response.json();
    const org = data.organization;

    // Transform to our format
    const nonprofit = {
      ein: org.ein,
      name: org.name,
      careOfName: org.careofname,
      address: {
        street: org.address,
        city: org.city,
        state: org.state,
        zipCode: org.zipcode,
      },
      nteeCode: org.ntee_code,
      subsectionCode: org.subsection_code,
      affiliationCode: org.affiliation_code,
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
      haveFilings: org.have_filings,
      havePdfs: org.have_pdfs,
      filings: data.filings_with_data.map((filing) => ({
        taxPeriod: filing.tax_prd,
        taxYear: filing.tax_prd_yr,
        formType: filing.formtype,
        pdfUrl: filing.pdf_url,
        totalRevenue: filing.totrevenue,
        totalExpenses: filing.totfuncexpns,
        totalAssets: filing.totassetsend,
        totalLiabilities: filing.totliabend,
        compensationPercent: filing.pct_compnsatncurrofcr,
      })),
    };

    return NextResponse.json(nonprofit);
  } catch (error) {
    console.error('Error fetching nonprofit details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
