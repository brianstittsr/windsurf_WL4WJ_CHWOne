import { NextRequest, NextResponse } from 'next/server';
// import { grantReportGenerationService } from '@/services/grants/GrantReportGenerationService';
import { emailDeliveryService } from '@/services/grants/EmailDeliveryService';

export async function POST(request: NextRequest) {
  // Temporarily disabled - service needs type fixes
  return NextResponse.json({ error: 'Report generation temporarily unavailable' }, { status: 503 });
  /*
  try {
    const body = await request.json();
    const { template, grantData, metrics, sendEmail, additionalRecipients } = body;

    if (!template || !grantData) {
      return NextResponse.json(
        { error: 'Missing required fields: template and grantData' },
        { status: 400 }
      );
    }

    // Generate the report
    const reportData = {
      grantData,
      metrics: metrics || [],
      generatedDate: new Date()
    };

    const result = await grantReportGenerationService.generateReport(template, reportData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate report' },
        { status: 500 }
      );
    }

    // Send email if requested
    let emailResult: { success: boolean; messageId?: string; error?: string; sentTo?: string[] } | null = null;
    if (sendEmail && result.data) {
      emailResult = await emailDeliveryService.sendReportEmail(
        template,
        result.data,
        grantData.basicInfo?.grantName || 'Untitled Grant',
        additionalRecipients
      );
    }

    return NextResponse.json({
      success: true,
      reportId: result.reportId,
      format: result.format,
      downloadUrl: result.downloadUrl,
      emailSent: emailResult?.success || false,
      emailResult
    });
  } catch (error) {
    console.error('Error in generate-report API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
  */
}
