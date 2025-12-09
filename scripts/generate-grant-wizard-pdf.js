/**
 * Generate PDF Report for Grant Wizard & Collaborations Guide
 * 
 * This script generates a comprehensive PDF documentation with
 * visual representations of the Grant Wizard workflow.
 * 
 * Usage: node scripts/generate-grant-wizard-pdf.js
 */

const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

// Create PDF document
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 20;
const contentWidth = pageWidth - (margin * 2);
let yPos = margin;

// Helper functions
const addPage = () => {
  doc.addPage();
  yPos = margin;
};

const checkPageBreak = (neededSpace) => {
  if (yPos + neededSpace > pageHeight - margin) {
    addPage();
    return true;
  }
  return false;
};

const addTitle = (text, size = 24) => {
  checkPageBreak(20);
  doc.setFontSize(size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text(text, pageWidth / 2, yPos, { align: 'center' });
  yPos += size * 0.5;
};

const addSubtitle = (text, size = 16) => {
  checkPageBreak(15);
  doc.setFontSize(size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 58, 64);
  doc.text(text, margin, yPos);
  yPos += size * 0.5;
};

const addParagraph = (text, size = 11) => {
  doc.setFontSize(size);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(73, 80, 87);
  const lines = doc.splitTextToSize(text, contentWidth);
  checkPageBreak(lines.length * 5 + 5);
  doc.text(lines, margin, yPos);
  yPos += lines.length * 5 + 3;
};

const addBullet = (text, indent = 0) => {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(73, 80, 87);
  const bulletX = margin + indent;
  const textX = bulletX + 5;
  const lines = doc.splitTextToSize(text, contentWidth - indent - 5);
  checkPageBreak(lines.length * 4 + 2);
  doc.text('•', bulletX, yPos);
  doc.text(lines, textX, yPos);
  yPos += lines.length * 4 + 2;
};

const addBox = (title, content, color = [240, 249, 255]) => {
  const boxHeight = 30 + (content.length * 5);
  checkPageBreak(boxHeight + 10);
  
  // Draw box background
  doc.setFillColor(...color);
  doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'F');
  
  // Draw border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'S');
  
  yPos += 8;
  
  // Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text(title, margin + 5, yPos);
  yPos += 7;
  
  // Content
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(73, 80, 87);
  content.forEach(line => {
    doc.text(line, margin + 5, yPos);
    yPos += 5;
  });
  
  yPos += 8;
};

const drawFlowDiagram = () => {
  checkPageBreak(80);
  
  const boxWidth = 30;
  const boxHeight = 15;
  const startX = margin + 10;
  const startY = yPos + 5;
  
  // Draw step boxes
  const steps = [
    { label: 'Step 1', desc: 'Upload & Info' },
    { label: 'Step 2', desc: 'Entity Details' },
    { label: 'Step 3', desc: 'Data Collection' },
    { label: 'Step 4', desc: 'Project Planning' },
    { label: 'Step 5', desc: 'Review & Submit' }
  ];
  
  steps.forEach((step, index) => {
    const x = startX + (index * (boxWidth + 8));
    
    // Box
    doc.setFillColor(79, 70, 229); // Primary color
    doc.roundedRect(x, startY, boxWidth, boxHeight, 2, 2, 'F');
    
    // Text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(step.label, x + boxWidth/2, startY + 6, { align: 'center' });
    
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(step.desc, boxWidth - 4);
    doc.text(descLines, x + boxWidth/2, startY + 10, { align: 'center' });
    
    // Arrow
    if (index < steps.length - 1) {
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.line(x + boxWidth + 1, startY + boxHeight/2, x + boxWidth + 6, startY + boxHeight/2);
      // Arrow head
      doc.line(x + boxWidth + 4, startY + boxHeight/2 - 2, x + boxWidth + 6, startY + boxHeight/2);
      doc.line(x + boxWidth + 4, startY + boxHeight/2 + 2, x + boxWidth + 6, startY + boxHeight/2);
    }
  });
  
  // Arrow to Collaborations
  const lastX = startX + ((steps.length - 1) * (boxWidth + 8)) + boxWidth/2;
  doc.setDrawColor(150, 150, 150);
  doc.line(lastX, startY + boxHeight + 2, lastX, startY + boxHeight + 10);
  doc.line(lastX - 2, startY + boxHeight + 8, lastX, startY + boxHeight + 10);
  doc.line(lastX + 2, startY + boxHeight + 8, lastX, startY + boxHeight + 10);
  
  // Collaborations box
  doc.setFillColor(16, 185, 129); // Success color
  doc.roundedRect(lastX - 25, startY + boxHeight + 12, 50, 12, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('COLLABORATIONS', lastX, startY + boxHeight + 20, { align: 'center' });
  
  yPos = startY + boxHeight + 35;
};

const drawScreenshot = (title, elements) => {
  checkPageBreak(60);
  
  const boxHeight = 50;
  
  // Screenshot frame
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'S');
  
  // Title bar
  doc.setFillColor(233, 236, 239);
  doc.rect(margin, yPos, contentWidth, 8, 'F');
  
  // Window controls (circles)
  doc.setFillColor(255, 95, 86);
  doc.circle(margin + 6, yPos + 4, 1.5, 'F');
  doc.setFillColor(255, 189, 46);
  doc.circle(margin + 11, yPos + 4, 1.5, 'F');
  doc.setFillColor(39, 201, 63);
  doc.circle(margin + 16, yPos + 4, 1.5, 'F');
  
  // Title
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(73, 80, 87);
  doc.text(title, margin + 25, yPos + 5);
  
  // Content
  let contentY = yPos + 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  elements.forEach(el => {
    doc.text(el, margin + 10, contentY);
    contentY += 6;
  });
  
  yPos += boxHeight + 10;
};

// ============================================
// GENERATE PDF CONTENT
// ============================================

// Cover Page
doc.setFillColor(79, 70, 229);
doc.rect(0, 0, pageWidth, pageHeight, 'F');

doc.setFontSize(36);
doc.setFont('helvetica', 'bold');
doc.setTextColor(255, 255, 255);
doc.text('Grant Wizard &', pageWidth / 2, 80, { align: 'center' });
doc.text('Collaborations Guide', pageWidth / 2, 95, { align: 'center' });

doc.setFontSize(18);
doc.setFont('helvetica', 'normal');
doc.text('CHWOne Platform Documentation', pageWidth / 2, 120, { align: 'center' });

doc.setFontSize(12);
doc.text('Version 1.0', pageWidth / 2, 140, { align: 'center' });
doc.text('December 2025', pageWidth / 2, 150, { align: 'center' });

// Logo placeholder
doc.setFillColor(255, 255, 255);
doc.roundedRect(pageWidth/2 - 30, 170, 60, 30, 5, 5, 'F');
doc.setFontSize(16);
doc.setFont('helvetica', 'bold');
doc.setTextColor(79, 70, 229);
doc.text('CHWOne', pageWidth / 2, 190, { align: 'center' });

// Page 2 - Table of Contents
addPage();
addTitle('Table of Contents');
yPos += 10;

const tocItems = [
  '1. Overview .................................................... 3',
  '2. Grant Wizard Workflow ...................................... 4',
  '3. Step-by-Step Guide ......................................... 5',
  '   3.1 Step 1: Upload & Basic Information ..................... 5',
  '   3.2 Step 2: Entity Details ................................. 6',
  '   3.3 Step 3: Data Collection ................................ 7',
  '   3.4 Step 4: Project Planning ............................... 8',
  '   3.5 Step 5: Review & Submit ................................ 9',
  '4. Collaborations Integration ................................. 10',
  '5. Form & Dashboard Generation ................................ 11',
  '6. Data Flow Architecture ..................................... 12'
];

doc.setFontSize(11);
doc.setFont('helvetica', 'normal');
doc.setTextColor(73, 80, 87);
tocItems.forEach(item => {
  doc.text(item, margin, yPos);
  yPos += 8;
});

// Page 3 - Overview
addPage();
addTitle('1. Overview', 20);
yPos += 10;

addParagraph('The CHWOne Grant Wizard is an AI-powered tool that streamlines the process of setting up grant collaboration projects. It automatically extracts information from grant documents, identifies collaborating entities, defines data collection requirements, and creates project milestones.');

yPos += 5;
addSubtitle('Key Features', 14);
yPos += 3;

const features = [
  'AI-Powered Document Analysis: Upload a PDF grant document and let AI extract all relevant information',
  'Entity Management: Track all collaborating organizations and their roles',
  'Data Collection Planning: Define methods, frequencies, and responsible parties',
  'Milestone Tracking: Create project timelines with dependencies',
  'Form Generation: Automatically create data collection forms',
  'Dashboard Generation: Build real-time reporting dashboards',
  'Collaboration View: Unified view of all grant partnerships'
];

features.forEach(feature => addBullet(feature));

// Page 4 - Workflow
addPage();
addTitle('2. Grant Wizard Workflow', 20);
yPos += 10;

addParagraph('The Grant Wizard follows a 5-step process to set up grant collaboration projects:');
yPos += 5;

drawFlowDiagram();

yPos += 5;
addBox('Workflow Summary', [
  '1. Upload grant document or enter information manually',
  '2. Define collaborating entities and their roles',
  '3. Set up data collection methods and frequencies',
  '4. Create project milestones and timeline',
  '5. Review and submit to create the collaboration'
]);

// Page 5 - Step 1
addPage();
addTitle('3. Step-by-Step Guide', 20);
yPos += 5;
addSubtitle('3.1 Step 1: Upload & Basic Information', 14);
yPos += 5;

addParagraph('Purpose: Upload grant documents and enter basic grant information.');
yPos += 3;

addSubtitle('Actions:', 12);
addBullet('Navigate to /grants page');
addBullet('Click "Launch Grant Analyzer" button');
addBullet('Upload a PDF grant document OR click "Prepopulate Form with Sample Data"');
addBullet('AI automatically extracts: Grant title, Description, Funding source, Budget, Dates');

yPos += 5;
drawScreenshot('Step 1: Upload & Info', [
  '📄 Drop PDF here or click to upload',
  'Grant Title: [Memorandum of Understanding (MOU)]',
  'Description: [Collaborative agreement between...]',
  'Funding Source: [State Health Department]',
  'Total Budget: [$6,210]'
]);

// Page 6 - Step 2
addPage();
addSubtitle('3.2 Step 2: Entity Details', 14);
yPos += 5;

addParagraph('Purpose: Identify and manage collaborating organizations.');
yPos += 3;

addSubtitle('Entity Roles:', 12);
addBullet('Lead: Primary organization responsible for grant management');
addBullet('Partner: Organizations actively participating in project delivery');
addBullet('Evaluator: Organizations responsible for assessment and evaluation');
addBullet('Stakeholder: Organizations with interest but limited active participation');

yPos += 5;
drawScreenshot('Step 2: Entity Details', [
  'Collaborating Entities (3)',
  '┌─ Fiesta Family Services, Inc. [LEAD]',
  '│  Contact: Maria Rodriguez',
  '└─ Responsibilities: Grant admin, Fiscal management',
  '┌─ Women Leading [PARTNER]',
  '└─ Responsibilities: Training delivery'
]);

// Page 7 - Step 3
addPage();
addSubtitle('3.3 Step 3: Data Collection', 14);
yPos += 5;

addParagraph('Purpose: Define data collection methods and requirements.');
yPos += 3;

addSubtitle('Configuration Options:', 12);
addBullet('Collection frequency: Daily, Weekly, Monthly, Quarterly, Annually');
addBullet('Responsible entity assignment');
addBullet('Data points to collect');
addBullet('Collection tools and instruments');

yPos += 5;
drawScreenshot('Step 3: Data Collection', [
  'Data Collection Methods (4)',
  '┌─ Participant Intake Tracking [Monthly]',
  '│  Responsible: Fiesta Family Services',
  '│  Data Points: Demographics, Contact Info, Consent',
  '└─ Tools: Custom Forms, Client Management System',
  '┌─ Training Session Attendance [Weekly]',
  '└─ Responsible: Women Leading'
]);

// Page 8 - Step 4
addPage();
addSubtitle('3.4 Step 4: Project Planning', 14);
yPos += 5;

addParagraph('Purpose: Create project milestones and timeline.');
yPos += 3;

addSubtitle('Milestone Configuration:', 12);
addBullet('Set milestone name and description');
addBullet('Assign due dates');
addBullet('Assign responsible parties');
addBullet('Define dependencies between milestones');

yPos += 5;
drawScreenshot('Step 4: Project Planning', [
  'Project Milestones (6)',
  'Timeline: Jan 2025 ──────────────────── Dec 2026',
  '● Project Kickoff          Due: Jan 15, 2025',
  '● Staff Training Complete  Due: Feb 28, 2025',
  '● Program Launch           Due: Mar 15, 2025',
  '● Q2 Progress Report       Due: Jun 30, 2025',
  '● Mid-Year Review          Due: Jul 31, 2025',
  '● Final Report             Due: Dec 15, 2026'
]);

// Page 9 - Step 5
addPage();
addSubtitle('3.5 Step 5: Review & Submit', 14);
yPos += 5;

addParagraph('Purpose: Review all information and submit the grant.');
yPos += 3;

addSubtitle('Review Sections:', 12);
addBullet('Collaboration Model: Summary of all entities and their roles');
addBullet('Data Collection Summary: Overview of collection methods');
addBullet('Project Timeline: Visual milestone overview');
addBullet('AI Recommendations: Suggested improvements');

yPos += 5;
addBox('AI Recommendations Example', [
  '⚠ HIGH: Establish joint steering committee with all partners',
  '○ MEDIUM: Implement centralized data repository',
  '○ MEDIUM: Schedule monthly progress reviews with stakeholders'
], [255, 251, 235]);

yPos += 5;
addParagraph('Click "Complete & Process" to save the grant and create the collaboration.');

// Page 10 - Collaborations
addPage();
addTitle('4. Collaborations Integration', 20);
yPos += 10;

addParagraph('After completing the Grant Wizard, the grant appears on the Collaborations page (/collaborations). This provides a unified view of all grant partnerships.');

yPos += 5;
addSubtitle('Collaborations List View', 14);
yPos += 3;

drawScreenshot('Collaborations Page', [
  'Memorandum of Understanding (MOU) [draft]',
  'The purpose of this MOU is to establish a collaborative...',
  '',
  '👥 Collaborating Organizations:',
  '   🏢 Fiesta Family Services [LEAD]',
  '   🏢 Women Leading [PARTNER]',
  '',
  '📅 Jan 2025 - Dec 2026    Progress: ████░░░░ 25%',
  '💰 $6,210 Funding'
]);

yPos += 5;
addSubtitle('Collaboration Detail Tabs', 14);
yPos += 3;

addBullet('Documents: Download original grant and AI analysis report');
addBullet('Forms & Data: Access generated data collection forms');
addBullet('Datasets: View linked datasets for the collaboration');
addBullet('AI Reports: Generate progress and funder reports');
addBullet('Partners: View all collaborating organizations with contacts');

// Page 11 - Form & Dashboard Generation
addPage();
addTitle('5. Form & Dashboard Generation', 20);
yPos += 10;

addSubtitle('Generate Forms', 14);
yPos += 3;

addParagraph('From the Grant Management page, click "Generate Forms" to automatically create data collection forms based on grant requirements.');

addBullet('Participant Intake Form: Collect participant demographics and consent');
addBullet('Service Tracking Forms: Track activities per data collection method');
addBullet('Progress Report Form: Monthly/quarterly reporting');

yPos += 5;
addSubtitle('Generate AI Dashboard', 14);
yPos += 3;

addParagraph('Click "Generate Dashboard" to create a real-time tracking dashboard with:');

addBullet('KPI Metrics: Total Participants, Budget Utilization, Milestone Progress, Reports Submitted');
addBullet('Charts: Line chart for enrollment, Pie chart for services, Bar chart for activities');
addBullet('Data Tables: Recent activities with filtering and sorting');

yPos += 5;
addBox('Dashboard KPIs Preview', [
  '┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐',
  '│    0    │  │    0%   │  │   0/6   │  │   0/4   │',
  '│Particip.│  │ Budget  │  │Milestone│  │ Reports │',
  '│Target:  │  │Utilized │  │Progress │  │Submitted│',
  '│  100    │  │ $6,210  │  │         │  │         │',
  '└─────────┘  └─────────┘  └─────────┘  └─────────┘'
], [240, 253, 244]);

// Page 12 - Data Flow
addPage();
addTitle('6. Data Flow Architecture', 20);
yPos += 10;

addParagraph('The following diagram shows how data flows through the Grant Wizard system:');

yPos += 10;
addBox('Data Flow', [
  'PDF/DOC Upload → Docling Extraction → OpenAI GPT-4o Analysis',
  '                                            ↓',
  '              ┌─────────────────────────────┼─────────────────────────────┐',
  '              ↓                             ↓                             ↓',
  '        Entities                    Data Collection                 Milestones',
  '        Extracted                      Methods                       Created',
  '              └─────────────────────────────┼─────────────────────────────┘',
  '                                            ↓',
  '                                    Firebase Firestore',
  '                                            ↓',
  '              ┌─────────────────────────────┼─────────────────────────────┐',
  '              ↓                             ↓                             ↓',
  '      Grant Management            Collaborations Page           Forms & Dashboard'
], [248, 250, 252]);

yPos += 10;
addSubtitle('Key Technologies', 14);
yPos += 3;

addBullet('Docling: IBM\'s document understanding library for PDF text extraction');
addBullet('OpenAI GPT-4o: AI model for intelligent data extraction and analysis');
addBullet('Firebase Firestore: NoSQL database for storing grant and collaboration data');
addBullet('Next.js: React framework for the web application');
addBullet('Material-UI: Component library for consistent UI design');

// Final page - Summary
addPage();
addTitle('Summary', 20);
yPos += 10;

addParagraph('The Grant Wizard and Collaborations integration provides a complete workflow for managing grant collaboration projects:');

yPos += 5;
const summaryItems = [
  '1. Document Upload & AI Analysis - Extract grant information automatically',
  '2. Entity Management - Track all collaborating organizations',
  '3. Data Collection Planning - Define what data to collect and how',
  '4. Project Planning - Create milestones and timelines',
  '5. Form Generation - Create data collection forms automatically',
  '6. Dashboard Generation - Build real-time reporting dashboards',
  '7. Collaboration Tracking - Monitor progress across all partners'
];

summaryItems.forEach(item => addBullet(item));

yPos += 10;
addBox('Benefits', [
  '✓ Reduces grant setup time from hours to minutes',
  '✓ Ensures no critical information is missed',
  '✓ Creates actionable project plans automatically',
  '✓ Generates data collection tools immediately',
  '✓ Provides real-time performance tracking',
  '✓ All components are interconnected and validated'
], [240, 253, 244]);

yPos += 10;
doc.setFontSize(10);
doc.setFont('helvetica', 'italic');
doc.setTextColor(128, 128, 128);
doc.text('Document generated by CHWOne Platform', pageWidth / 2, pageHeight - 20, { align: 'center' });
doc.text('December 2025', pageWidth / 2, pageHeight - 15, { align: 'center' });

// Save the PDF
const outputPath = path.join(__dirname, '..', 'docs', 'Grant_Wizard_Collaborations_Guide.pdf');
const pdfBuffer = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBuffer));

console.log(`PDF generated successfully: ${outputPath}`);
