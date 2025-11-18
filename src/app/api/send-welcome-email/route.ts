import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, just log the email (in production, integrate with email service like SendGrid, AWS SES, etc.)
    console.log('=== WELCOME EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Welcome to CHWOne Platform, ${firstName}!`);
    console.log(`
Dear ${firstName} ${lastName},

Thank you for registering as a Community Health Worker on the CHWOne Platform!

We're excited to have you join our growing network of dedicated CHWs across North Carolina. Your profile has been successfully created, and you can now:

✅ Access powerful data collection and analytics tools
✅ Connect with other CHWs in your region
✅ Track your certifications and professional development
✅ Discover new opportunities and collaborations
✅ Share resources and best practices

Next Steps:
1. Complete your profile with additional details
2. Explore the CHW directory and connect with peers
3. Check out available training and resources
4. Start using our data collection tools

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Welcome aboard!

The CHWOne Team
    `);
    console.log('=== END EMAIL ===');

    // TODO: In production, integrate with actual email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: email,
    //   from: 'noreply@chwone.org',
    //   subject: `Welcome to CHWOne Platform, ${firstName}!`,
    //   text: emailBody,
    //   html: emailBodyHtml
    // });

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully'
    });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      },
      { status: 500 }
    );
  }
}
