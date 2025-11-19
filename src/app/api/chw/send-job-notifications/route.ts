import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chwId, email, jobs } = await request.json();

    if (!email || !jobs || jobs.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // For now, log the notification
    console.log(`Sending job notifications to ${email}:`, jobs);

    // Simulate email sending
    const emailContent = `
      <h2>New Job Opportunities Match Your Profile!</h2>
      <p>We found ${jobs.length} jobs that match your skills and experience:</p>
      <ul>
        ${jobs.map((job: any) => `
          <li>
            <strong>${job.title}</strong> at ${job.organization}
            <br/>Match Score: ${job.matchScore}%
          </li>
        `).join('')}
      </ul>
      <p>Log in to your CHWOne account to view details and apply.</p>
    `;

    // In production, send actual email here
    // await sendEmail({ to: email, subject: 'New CHW Job Matches', html: emailContent });

    return NextResponse.json(
      { success: true, message: 'Notifications sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Send notifications error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
