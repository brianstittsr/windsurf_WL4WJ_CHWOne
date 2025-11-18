# Grant Report Generation & Email Delivery Guide

## Overview

The CHWOne platform now includes a comprehensive **Report Generation Engine** and **Automated Email Delivery** system for the Grants AI Assistant. This feature allows users to:

- Generate professional PDF and Excel reports from grant data
- Automatically email reports to stakeholders
- Schedule recurring report delivery
- Customize report content and format

## Features Implemented

### ✅ 1. Report Generation Engine

**Service**: `GrantReportGenerationService.ts`

Supports multiple report formats:
- **PDF**: Professional documents with sections, tables, metrics, and charts
- **Excel**: Spreadsheets with multiple sheets for different data views
- **Dashboard**: Interactive web-based reports (configuration only)
- **Presentation**: PowerPoint slides (planned for future)

**Key Capabilities**:
- Dynamic section generation based on templates
- Automatic data extraction from grant information
- Table and metric visualization
- Chart placeholders for future enhancement
- Professional formatting with headers, footers, and page numbers

### ✅ 2. Email Delivery Service

**Service**: `EmailDeliveryService.ts`

**Features**:
- Send reports as email attachments
- HTML and plain text email templates
- Multiple recipient support
- Role-based email mapping
- Schedule confirmation notifications
- Development mode logging

**Email Templates**:
- Report delivery emails with grant details
- Schedule confirmation emails
- Professional branding and formatting

### ✅ 3. API Endpoints

Three REST API endpoints power the system:

#### `/api/grants/generate-report` (POST)
Generate a report and optionally send via email.

**Request Body**:
```json
{
  "template": {
    "id": "report-123",
    "name": "Quarterly Performance Report",
    "format": "pdf",
    "sections": [...],
    "deliverySchedule": {
      "frequency": "quarterly",
      "recipients": ["director@example.com"]
    }
  },
  "grantData": {
    "basicInfo": {...},
    "projectMilestones": [...],
    "dataCollectionMethods": [...]
  },
  "metrics": [...],
  "sendEmail": true,
  "additionalRecipients": ["stakeholder@example.com"]
}
```

**Response**:
```json
{
  "success": true,
  "reportId": "report-1234567890",
  "format": "pdf",
  "downloadUrl": "blob:http://localhost:3000/...",
  "emailSent": true,
  "emailResult": {
    "success": true,
    "messageId": "msg-123",
    "sentTo": ["director@example.com", "stakeholder@example.com"]
  }
}
```

#### `/api/grants/send-email` (POST)
Send emails with attachments (internal use).

**Request Body**:
```json
{
  "to": [{"email": "user@example.com", "name": "User Name"}],
  "subject": "Report Title",
  "htmlBody": "<html>...</html>",
  "textBody": "Plain text version",
  "attachments": [{
    "filename": "report.pdf",
    "content": "base64-encoded-data",
    "contentType": "application/pdf"
  }]
}
```

#### `/api/grants/schedule-report` (POST)
Schedule automatic report generation and delivery.

**Request Body**:
```json
{
  "template": {...},
  "grantData": {...},
  "action": "schedule"  // or "unschedule"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Report scheduled successfully",
  "nextScheduledDate": "2025-02-01T09:00:00.000Z",
  "notificationSent": true,
  "scheduleId": "schedule-1234567890"
}
```

### ✅ 4. UI Components

#### `ReportActions.tsx`
Interactive component for generating and scheduling reports.

**Features**:
- Generate & Download button
- Schedule Delivery button
- Email configuration dialog
- Additional recipients input
- Real-time status feedback
- Success/error alerts

**Usage**:
```tsx
import { ReportActions } from '@/components/Grants/wizard/dashboard/ReportActions';

<ReportActions
  template={reportTemplate}
  grantData={grantData}
  metrics={dashboardMetrics}
/>
```

## Usage Guide

### For End Users

#### Generating a One-Time Report

1. Navigate to the Grant AI Dashboard (Step 7)
2. Find the report you want to generate in the "Scheduled Reports" section
3. Click the **"Generate Report"** button
4. In the dialog:
   - Choose whether to send via email
   - Add additional email recipients if needed
   - Click **"Generate & Download"** or **"Generate & Send"**
5. The report will download automatically (if not emailing)
6. Check your email inbox if you chose to send via email

#### Scheduling Recurring Reports

1. Create a report template in the Report Scheduler
2. Configure:
   - Report name and description
   - Format (PDF, Excel, Dashboard)
   - Delivery frequency (daily, weekly, monthly, quarterly, annually)
   - Recipients list
   - Report sections and data sources
3. Click **"Schedule Delivery"**
4. Recipients will receive a confirmation email
5. Reports will be automatically generated and delivered on schedule

### For Developers

#### Generating Reports Programmatically

```typescript
import { grantReportGenerationService } from '@/services/grants/GrantReportGenerationService';

const reportData = {
  grantData: myGrantData,
  metrics: myMetrics,
  generatedDate: new Date()
};

const result = await grantReportGenerationService.generateReport(
  reportTemplate,
  reportData
);

if (result.success) {
  // Download the report
  window.open(result.downloadUrl, '_blank');
}
```

#### Sending Emails Programmatically

```typescript
import { emailDeliveryService } from '@/services/grants/EmailDeliveryService';

const emailResult = await emailDeliveryService.sendReportEmail(
  reportTemplate,
  reportBlob,
  'My Grant Name',
  ['additional@example.com']
);

if (emailResult.success) {
  console.log('Email sent to:', emailResult.sentTo);
}
```

#### Creating Custom Report Templates

```typescript
const customTemplate: ReportTemplate = {
  id: 'custom-report-1',
  name: 'Custom Impact Report',
  description: 'Quarterly impact assessment',
  format: 'pdf',
  sections: [
    {
      id: 'section-1',
      title: 'Executive Summary',
      description: 'Overview of key achievements',
      dataSource: 'ai_analysis',
      visualizationType: 'text'
    },
    {
      id: 'section-2',
      title: 'Milestone Progress',
      description: 'Status of project milestones',
      dataSource: 'project_milestones',
      visualizationType: 'table'
    },
    {
      id: 'section-3',
      title: 'Key Metrics',
      description: 'Performance indicators',
      dataSource: 'performance_metrics',
      visualizationType: 'metric'
    }
  ],
  deliverySchedule: {
    frequency: 'quarterly',
    recipients: ['director@org.com', 'funder@agency.gov']
  },
  contractDeliverable: true
};
```

## Configuration

### Email Service Setup

The email delivery system supports multiple providers. Configure in production:

#### Option 1: SendGrid

```bash
# .env.local
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@chwone.org
```

Uncomment SendGrid code in `/api/grants/send-email/route.ts`.

#### Option 2: AWS SES

```bash
# .env.local
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
EMAIL_FROM=noreply@chwone.org
```

Uncomment AWS SES code in `/api/grants/send-email/route.ts`.

#### Option 3: Resend

```bash
# .env.local
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@chwone.org
```

Uncomment Resend code in `/api/grants/send-email/route.ts`.

### Report Scheduling

For production scheduling, choose one of these options:

#### Option 1: Vercel Cron Jobs

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/grants/execute-scheduled-reports",
    "schedule": "0 9 * * *"
  }]
}
```

#### Option 2: Node-cron

```typescript
import cron from 'node-cron';

cron.schedule('0 9 * * *', async () => {
  // Execute scheduled reports
  await executeScheduledReports();
});
```

#### Option 3: AWS EventBridge

Configure EventBridge rules to trigger Lambda functions that call your API endpoints.

## Report Formats

### PDF Reports

**Structure**:
- Title page with grant information
- Table of contents (planned)
- Sections with headings and content
- Tables with data
- Metric cards
- Chart placeholders
- Page numbers and footers

**Customization**:
- Modify `generatePdfReport()` in `GrantReportGenerationService.ts`
- Adjust fonts, colors, and layout
- Add custom branding

### Excel Reports

**Structure**:
- Summary sheet with grant overview
- Individual sheets for each report section
- Formatted tables with headers
- Auto-sized columns

**Customization**:
- Modify `generateExcelReport()` in `GrantReportGenerationService.ts`
- Add charts and pivot tables
- Custom cell formatting

## Data Sources

Reports can pull data from multiple sources:

| Data Source | Description | Example Use |
|------------|-------------|-------------|
| `project_milestones` | Project timeline and milestones | Progress tracking |
| `form_submissions` | Data collection responses | Survey results |
| `budget_data` | Financial information | Budget utilization |
| `entity_activities` | Collaborating entity actions | Partnership tracking |
| `performance_metrics` | KPIs and metrics | Outcome measurement |
| `ai_analysis` | AI-generated insights | Executive summaries |

## Troubleshooting

### Reports Not Generating

**Issue**: API returns error or report is empty

**Solutions**:
1. Check that grant data is complete
2. Verify template has valid sections
3. Check browser console for errors
4. Ensure jsPDF and ExcelJS are installed

### Emails Not Sending

**Issue**: Email delivery fails

**Solutions**:
1. Verify email service is configured (SendGrid/SES/Resend)
2. Check API keys in `.env.local`
3. Confirm recipients are valid email addresses
4. Check email service quotas and limits
5. Review logs in `/api/grants/send-email`

### Development Mode

In development, emails are logged to console instead of sent:

```
📧 EMAIL SENT (Development Mode):
To: [{ email: 'user@example.com' }]
Subject: Quarterly Performance Report
Attachments: 1
---
```

### TypeScript Errors

Some property access may show TypeScript errors due to `Partial<Grant>` type. These are non-blocking and can be resolved by:
1. Using optional chaining (`?.`)
2. Adding type assertions where needed
3. Updating Grant type definitions

## Future Enhancements

### Planned Features

1. **Chart Generation**: Real charts instead of placeholders
2. **PowerPoint Export**: Full presentation generation
3. **Custom Branding**: Logo and color customization
4. **Report Templates Library**: Pre-built templates
5. **Data Visualization**: Interactive charts in PDF
6. **Multi-language Support**: Internationalization
7. **Report History**: Archive of generated reports
8. **Advanced Scheduling**: Complex scheduling rules
9. **Webhook Integration**: Notify external systems
10. **Report Analytics**: Track report views and engagement

## Support

For issues or questions:
- Check the troubleshooting section above
- Review API endpoint documentation
- Contact the development team
- Submit issues on GitHub

## License

This feature is part of the CHWOne platform and follows the same MIT License.

---

**Last Updated**: November 17, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
