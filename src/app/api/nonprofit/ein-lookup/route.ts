import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/nonprofit/ein-lookup?ein=123456789
 * Lookup nonprofit information by EIN
 * Uses ProPublica Nonprofit Explorer API (free, no key required)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ein = searchParams.get('ein');

    if (!ein) {
      return NextResponse.json(
        { error: 'EIN parameter is required' },
        { status: 400 }
      );
    }

    // Clean the EIN (remove any non-digits)
    const cleanEIN = ein.replace(/\D/g, '');

    if (cleanEIN.length !== 9) {
      return NextResponse.json(
        { error: 'EIN must be 9 digits' },
        { status: 400 }
      );
    }

    // Use ProPublica Nonprofit Explorer API
    const response = await fetch(
      `https://projects.propublica.org/nonprofits/api/v2/organizations/${cleanEIN}.json`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            found: false, 
            message: 'No nonprofit found with this EIN',
            ein: cleanEIN 
          },
          { status: 404 }
        );
      }
      throw new Error(`ProPublica API error: ${response.status}`);
    }

    const data = await response.json();
    const org = data.organization;

    if (!org) {
      return NextResponse.json(
        { found: false, message: 'No organization data returned' },
        { status: 404 }
      );
    }

    // Format the response
    const organization = {
      ein: cleanEIN,
      name: org.name,
      city: org.city,
      state: org.state,
      nteeCode: org.ntee_code,
      classification: org.subsection_code,
      ruling: org.ruling_date,
      deductibility: org.deductibility_code,
      foundation: org.foundation_code,
      organization: org.organization_code,
      exemptStatus: org.exempt_status_code,
      taxPeriod: org.tax_period,
      assetAmount: org.asset_amount,
      incomeAmount: org.income_amount,
      filingRequirement: org.filing_requirement_code,
      formType: org.form_type
    };

    return NextResponse.json({
      found: true,
      organization,
      filings: data.filings_with_data?.slice(0, 5) || [] // Last 5 filings
    });

  } catch (error) {
    console.error('EIN lookup error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to lookup EIN',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
