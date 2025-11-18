import { ReportTemplate } from '@/types/grant.types';

interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailAttachment {
  filename: string;
  content: Blob;
  contentType: string;
}

interface EmailOptions {
  to: EmailRecipient[];
  subject: string;
  htmlBody: string;
  textBody?: string;
  attachments?: EmailAttachment[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  sentTo?: string[];
}

class EmailDeliveryService {
  private apiEndpoint = '/api/grants/send-email';

  /**
   * Send report email to recipients
   */
  async sendReportEmail(
    template: ReportTemplate,
    reportBlob: Blob,
    grantName: string,
    additionalRecipients?: string[]
  ): Promise<EmailResult> {
    try {
      // Combine template recipients with additional recipients
      const allRecipients = [
        ...(template.deliverySchedule.recipients || []),
        ...(additionalRecipients || [])
      ];

      if (allRecipients.length === 0) {
        return {
          success: false,
          error: 'No recipients specified'
        };
      }

      // Parse recipients
      const recipients: EmailRecipient[] = allRecipients.map(r => {
        // Check if it's an email address
        if (r.includes('@')) {
          return { email: r };
        }
        // Otherwise, it's a role name - we'll need to map it
        return { email: this.mapRoleToEmail(r), name: r };
      });

      // Create email subject
      const subject = `${template.name} - ${grantName}`;

      // Create email body
      const htmlBody = this.createReportEmailHtml(template, grantName);
      const textBody = this.createReportEmailText(template, grantName);

      // Create attachment
      const attachments: EmailAttachment[] = [{
        filename: `${template.name.replace(/[^a-z0-9]/gi, '_')}.${template.format === 'excel' ? 'xlsx' : 'pdf'}`,
        content: reportBlob,
        contentType: template.format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf'
      }];

      // Send email
      const emailOptions: EmailOptions = {
        to: recipients,
        subject,
        htmlBody,
        textBody,
        attachments
      };

      return await this.sendEmail(emailOptions);
    } catch (error) {
      console.error('Error sending report email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send scheduled report notification
   */
  async sendScheduledReportNotification(
    template: ReportTemplate,
    grantName: string,
    nextScheduledDate: Date
  ): Promise<EmailResult> {
    try {
      const recipients = template.deliverySchedule.recipients || [];
      
      if (recipients.length === 0) {
        return {
          success: false,
          error: 'No recipients specified'
        };
      }

      const recipientEmails: EmailRecipient[] = recipients.map(r => ({
        email: r.includes('@') ? r : this.mapRoleToEmail(r),
        name: r.includes('@') ? undefined : r
      }));

      const subject = `Scheduled Report: ${template.name} - ${grantName}`;
      const htmlBody = this.createScheduleNotificationHtml(template, grantName, nextScheduledDate);
      const textBody = this.createScheduleNotificationText(template, grantName, nextScheduledDate);

      return await this.sendEmail({
        to: recipientEmails,
        subject,
        htmlBody,
        textBody
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send email via API
   */
  private async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // Convert blob attachments to base64 for API transmission
      const attachmentsData = await Promise.all(
        (options.attachments || []).map(async (att) => ({
          filename: att.filename,
          content: await this.blobToBase64(att.content),
          contentType: att.contentType
        }))
      );

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: options.to,
          subject: options.subject,
          htmlBody: options.htmlBody,
          textBody: options.textBody,
          attachments: attachmentsData,
          cc: options.cc,
          bcc: options.bcc
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        messageId: result.messageId,
        sentTo: options.to.map(r => r.email)
      };
    } catch (error) {
      console.error('Error in sendEmail:', error);
      
      // Fallback: Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 EMAIL (Development Mode):', {
          to: options.to,
          subject: options.subject,
          attachments: options.attachments?.length || 0
        });
        
        return {
          success: true,
          messageId: `dev-${Date.now()}`,
          sentTo: options.to.map(r => r.email)
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create HTML email body for report
   */
  private createReportEmailHtml(template: ReportTemplate, grantName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4472C4; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4472C4; color: white; text-decoration: none; border-radius: 5px; }
          .info-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #4472C4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Grant Report Delivery</h1>
          </div>
          <div class="content">
            <h2>${template.name}</h2>
            <div class="info-box">
              <p><strong>Grant:</strong> ${grantName}</p>
              <p><strong>Report Type:</strong> ${template.format.toUpperCase()}</p>
              <p><strong>Frequency:</strong> ${template.deliverySchedule.frequency}</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>${template.description || 'This report contains the latest data and insights for your grant project.'}</p>
            <p>The report is attached to this email. Please review the contents and contact us if you have any questions.</p>
            ${template.contractDeliverable ? '<p><strong>⚠️ This is a required contract deliverable.</strong></p>' : ''}
          </div>
          <div class="footer">
            <p>Generated by CHWOne Platform | Grant Management System</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Create plain text email body for report
   */
  private createReportEmailText(template: ReportTemplate, grantName: string): string {
    return `
GRANT REPORT DELIVERY

${template.name}

Grant: ${grantName}
Report Type: ${template.format.toUpperCase()}
Frequency: ${template.deliverySchedule.frequency}
Generated: ${new Date().toLocaleDateString()}

${template.description || 'This report contains the latest data and insights for your grant project.'}

The report is attached to this email. Please review the contents and contact us if you have any questions.

${template.contractDeliverable ? '⚠️ This is a required contract deliverable.' : ''}

---
Generated by CHWOne Platform | Grant Management System
This is an automated message. Please do not reply to this email.
    `.trim();
  }

  /**
   * Create HTML for schedule notification
   */
  private createScheduleNotificationHtml(
    template: ReportTemplate,
    grantName: string,
    nextDate: Date
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .info-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Report Scheduled Successfully</h1>
          </div>
          <div class="content">
            <h2>${template.name}</h2>
            <div class="info-box">
              <p><strong>Grant:</strong> ${grantName}</p>
              <p><strong>Frequency:</strong> ${template.deliverySchedule.frequency}</p>
              <p><strong>Next Delivery:</strong> ${nextDate.toLocaleDateString()}</p>
            </div>
            <p>Your report has been scheduled for automatic generation and delivery.</p>
            <p>You will receive the report via email on the scheduled date.</p>
          </div>
          <div class="footer">
            <p>CHWOne Platform | Grant Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Create plain text for schedule notification
   */
  private createScheduleNotificationText(
    template: ReportTemplate,
    grantName: string,
    nextDate: Date
  ): string {
    return `
REPORT SCHEDULED SUCCESSFULLY

${template.name}

Grant: ${grantName}
Frequency: ${template.deliverySchedule.frequency}
Next Delivery: ${nextDate.toLocaleDateString()}

Your report has been scheduled for automatic generation and delivery.
You will receive the report via email on the scheduled date.

---
CHWOne Platform | Grant Management System
    `.trim();
  }

  /**
   * Map role names to email addresses
   * In production, this would query a database
   */
  private mapRoleToEmail(role: string): string {
    // This is a placeholder - in production, you would:
    // 1. Query the user database for users with this role
    // 2. Get their email addresses
    // 3. Return the appropriate email
    
    const roleMap: { [key: string]: string } = {
      'Project Manager': 'project.manager@example.com',
      'Grant Administrator': 'grant.admin@example.com',
      'Evaluator': 'evaluator@example.com',
      'Stakeholder': 'stakeholder@example.com',
      'Partner Organization': 'partner@example.com',
      'Program Director': 'director@example.com',
      'Funding Agency Representative': 'funding.rep@example.com'
    };

    return roleMap[role] || `${role.toLowerCase().replace(/\s+/g, '.')}@example.com`;
  }

  /**
   * Convert Blob to Base64 string
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<EmailResult> {
    return await this.sendEmail({
      to: [{ email: 'test@example.com', name: 'Test User' }],
      subject: 'CHWOne Email Configuration Test',
      htmlBody: '<p>This is a test email from CHWOne Platform.</p>',
      textBody: 'This is a test email from CHWOne Platform.'
    });
  }
}

export const emailDeliveryService = new EmailDeliveryService();
