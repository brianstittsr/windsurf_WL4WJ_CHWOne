# Forms Management

Create, manage, and analyze health assessment forms for data collection.

## Overview

The Forms tool allows you to:
- Create custom health assessment forms
- Use AI to generate forms automatically
- Manage form templates
- Collect and track submissions
- Export form data

## Accessing Forms

Navigate to **Work > Forms** in the sidebar.

## Creating Forms

### Method 1: AI Wizard (Recommended)

The AI Wizard creates forms based on your description:

1. Click **Create with AI Wizard**
2. Describe the form you need:
   ```
   Example: "I need a diabetes screening form that collects 
   patient demographics, blood sugar levels, medication history, 
   and lifestyle factors"
   ```
3. Review the generated form structure
4. Customize fields as needed
5. Click **Generate Form**

### Method 2: Manual Creation

Build forms field by field:

1. Click **Create Form Manually**
2. Enter form details:
   - Form name
   - Description
   - Category
3. Add fields using the field builder
4. Configure field properties
5. Save the form

### Method 3: Templates

Start from pre-built templates:

1. Click **Form Templates**
2. Browse available templates:
   - Health Assessments
   - Client Intake
   - Follow-up Surveys
   - Program Evaluations
3. Select a template
4. Customize as needed
5. Save as new form

## Field Types

| Type | Use Case |
|------|----------|
| **Text** | Short answers, names |
| **Text Area** | Long responses, notes |
| **Number** | Numeric values, measurements |
| **Date** | Dates, appointments |
| **Select** | Single choice from options |
| **Multi-Select** | Multiple choices |
| **Checkbox** | Yes/No questions |
| **Radio** | Single selection groups |
| **Scale** | Rating scales (1-5, 1-10) |
| **File Upload** | Documents, images |

## Field Properties

Each field can be configured with:

| Property | Description |
|----------|-------------|
| **Label** | Field name shown to user |
| **Required** | Must be filled to submit |
| **Placeholder** | Example text in empty field |
| **Help Text** | Instructions for the field |
| **Validation** | Rules for valid input |
| **Conditional** | Show/hide based on other answers |

## Managing Forms

### Form List View

The main Forms page shows:
- All your forms
- Form status (Draft, Published, Archived)
- Submission count
- Last modified date

### Form Actions

| Action | Description |
|--------|-------------|
| **Edit** | Modify form structure |
| **Preview** | Test the form |
| **Publish** | Make form available |
| **Share** | Get shareable link |
| **Duplicate** | Copy form |
| **Archive** | Hide from active list |
| **Delete** | Permanently remove |

## Publishing Forms

To make a form available for submissions:

1. Open the form
2. Click **Publish**
3. Choose visibility:
   - **Public** - Anyone with link
   - **Organization** - Your org members
   - **Private** - Specific users only
4. Set availability dates (optional)
5. Confirm publication

## Collecting Responses

### Sharing Forms

Get a link to share:
1. Click **Share** on a published form
2. Copy the form URL
3. Share via email, message, or embed

### Viewing Submissions

1. Click on a form
2. Select **Submissions** tab
3. View individual responses
4. Export data as needed

## Form Analytics

Track form performance:

| Metric | Description |
|--------|-------------|
| **Views** | Times form was opened |
| **Starts** | Submissions begun |
| **Completions** | Fully submitted |
| **Completion Rate** | % who finished |
| **Avg. Time** | Time to complete |

## Exporting Data

Export form submissions:

1. Open form submissions
2. Click **Export**
3. Choose format:
   - CSV (spreadsheet)
   - JSON (data)
   - PDF (report)
4. Select date range
5. Download file

## Digital Literacy Program

Special forms for digital literacy assessment:

1. Click **Digital Literacy Program**
2. Access specialized forms for:
   - Digital skills assessment
   - Technology access survey
   - Training needs evaluation

## Best Practices

1. **Keep forms focused** - One topic per form
2. **Use clear labels** - Avoid jargon
3. **Make required fields minimal** - Only truly necessary
4. **Add help text** - Guide users
5. **Test before publishing** - Preview thoroughly
6. **Use conditional logic** - Show relevant questions only

## Troubleshooting

### Form won't save?
- Check all required fields are filled
- Ensure form name is unique
- Try refreshing the page

### Submissions not appearing?
- Verify form is published
- Check date availability settings
- Confirm user has access

### Export failing?
- Try smaller date range
- Check browser popup blocker
- Use different export format

---

## Related Guides

- [Datasets](./datasets.md)
- [Reports](./reports.md)
