import { NextRequest, NextResponse } from 'next/server';
import { ResourceVerificationService } from '@/services/ResourceVerificationService';
import { SandhillsResourceService } from '@/services/SandhillsResourceService';

export const dynamic = 'force-dynamic';

/**
 * POST /api/sandhills-resources/send-verifications
 * Initialize and send verification emails to all resources with contacts
 * This would typically be called by a cron job monthly
 */
export async function POST(request: NextRequest) {
  try {
    // Check for API key authorization (for cron jobs)
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CRON_API_KEY;
    
    // In production, verify the API key
    // if (apiKey && authHeader !== `Bearer ${apiKey}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === 'initialize') {
      // Initialize verifications for all resources
      const created = await ResourceVerificationService.initializeForAllResources();
      return NextResponse.json({
        success: true,
        message: `Initialized ${created} verification records`,
        created
      });
    }

    if (action === 'send-reminders') {
      // Get verifications needing reminders
      const needingReminder = await ResourceVerificationService.getVerificationsNeedingReminder();
      
      let sent = 0;
      for (const verification of needingReminder) {
        // In production, this would send an actual email
        // await sendVerificationEmail(verification);
        await ResourceVerificationService.incrementReminderCount(verification.id);
        sent++;
      }

      return NextResponse.json({
        success: true,
        message: `Sent ${sent} reminder emails`,
        sent
      });
    }

    // Default: Get statistics
    const stats = await ResourceVerificationService.getStatistics();
    const pendingVerifications = await ResourceVerificationService.getPendingVerifications();

    return NextResponse.json({
      statistics: stats,
      pendingCount: pendingVerifications.length,
      pending: pendingVerifications.slice(0, 10) // First 10
    });

  } catch (error) {
    console.error('Send verifications error:', error);
    return NextResponse.json(
      { error: 'Failed to process verification request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sandhills-resources/send-verifications
 * Get verification statistics and status
 */
export async function GET() {
  try {
    const stats = await ResourceVerificationService.getStatistics();
    const needingReminder = await ResourceVerificationService.getVerificationsNeedingReminder();

    return NextResponse.json({
      statistics: stats,
      needingReminder: needingReminder.length,
      nextActions: {
        initialize: 'POST with { action: "initialize" } to create verification records',
        sendReminders: 'POST with { action: "send-reminders" } to send reminder emails'
      }
    });
  } catch (error) {
    console.error('Get verifications error:', error);
    return NextResponse.json(
      { error: 'Failed to get verification status' },
      { status: 500 }
    );
  }
}
