import { NextRequest, NextResponse } from 'next/server';
import { getRecentLogs, getUnreviewedLogs, getLogAnalytics } from '@/services/whatsappLogger';

/**
 * API endpoint to retrieve WhatsApp interaction logs for review
 * 
 * GET /api/whatsapp/logs - Get recent logs
 * GET /api/whatsapp/logs?unreviewed=true - Get only unreviewed logs
 * GET /api/whatsapp/logs?analytics=true - Get analytics summary
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const unreviewed = searchParams.get('unreviewed') === 'true';
    const analytics = searchParams.get('analytics') === 'true';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    
    // Return analytics summary
    if (analytics) {
      const analyticsData = await getLogAnalytics();
      return NextResponse.json({
        success: true,
        analytics: analyticsData
      });
    }
    
    // Return unreviewed logs only
    if (unreviewed) {
      const logs = await getUnreviewedLogs();
      return NextResponse.json({
        success: true,
        count: logs.length,
        logs
      });
    }
    
    // Return recent logs
    const logs = await getRecentLogs(limit);
    return NextResponse.json({
      success: true,
      count: logs.length,
      logs
    });
    
  } catch (error: any) {
    console.error('[WHATSAPP_LOGS] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
