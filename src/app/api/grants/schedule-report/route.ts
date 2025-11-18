import { NextRequest, NextResponse } from 'next/server';
import { emailDeliveryService } from '@/services/grants/EmailDeliveryService';

/**
 * Schedule a report for automatic generation and delivery
 * In production, this would integrate with a job scheduler like:
 * - Vercel Cron Jobs
 * - AWS EventBridge
 * - Node-cron
 * - Bull Queue
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, grantData, action } = body;

    if (!template || !grantData) {
      return NextResponse.json(
        { error: 'Missing required fields: template and grantData' },
        { status: 400 }
      );
    }

    // Calculate next scheduled date based on frequency
    const nextScheduledDate = calculateNextScheduledDate(template.deliverySchedule.frequency);

    if (action === 'schedule') {
      // Send confirmation notification
      const emailResult = await emailDeliveryService.sendScheduledReportNotification(
        template,
        grantData.basicInfo?.grantName || 'Untitled Grant',
        nextScheduledDate
      );

      // In production, you would:
      // 1. Store the schedule in database
      // 2. Set up a cron job or scheduled task
      // 3. Configure the job to call the generate-report API at the scheduled time

      // Example with Vercel Cron (vercel.json):
      /*
      {
        "crons": [{
          "path": "/api/grants/execute-scheduled-reports",
          "schedule": "0 0 * * *"  // Daily at midnight
        }]
      }
      */

      // Example with node-cron:
      /*
      const cron = require('node-cron');
      const scheduleExpression = getScheduleExpression(template.deliverySchedule.frequency);
      
      cron.schedule(scheduleExpression, async () => {
        await fetch('/api/grants/generate-report', {
          method: 'POST',
          body: JSON.stringify({ template, grantData, sendEmail: true })
        });
      });
      */

      return NextResponse.json({
        success: true,
        message: 'Report scheduled successfully',
        nextScheduledDate: nextScheduledDate.toISOString(),
        notificationSent: emailResult.success,
        scheduleId: `schedule-${Date.now()}`
      });
    } else if (action === 'unschedule') {
      // In production, remove the scheduled job
      return NextResponse.json({
        success: true,
        message: 'Report schedule removed'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "schedule" or "unschedule"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error scheduling report:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate the next scheduled date based on frequency
 */
function calculateNextScheduledDate(frequency: string): Date {
  const now = new Date();
  const next = new Date(now);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'annually':
      next.setFullYear(next.getFullYear() + 1);
      break;
    case 'once':
    default:
      // For one-time reports, schedule for tomorrow
      next.setDate(next.getDate() + 1);
  }

  // Set to 9 AM
  next.setHours(9, 0, 0, 0);

  return next;
}

/**
 * Get cron expression for frequency
 */
function getScheduleExpression(frequency: string): string {
  switch (frequency) {
    case 'daily':
      return '0 9 * * *'; // 9 AM daily
    case 'weekly':
      return '0 9 * * 1'; // 9 AM every Monday
    case 'monthly':
      return '0 9 1 * *'; // 9 AM on 1st of month
    case 'quarterly':
      return '0 9 1 */3 *'; // 9 AM on 1st of every 3rd month
    case 'annually':
      return '0 9 1 1 *'; // 9 AM on January 1st
    default:
      return '0 9 * * *'; // Default to daily
  }
}
