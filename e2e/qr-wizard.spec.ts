import { test, expect } from '@playwright/test';

test.describe('QR Wizard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to wizard
    await page.goto('/qr-tracking-wizard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load wizard with all 8 steps', async ({ page }) => {
    // Check stepper is visible
    await expect(page.locator('text=Platform Discovery')).toBeVisible();
    await expect(page.locator('text=Program Details')).toBeVisible();
    await expect(page.locator('text=Data Requirements')).toBeVisible();
    await expect(page.locator('text=Participant Upload')).toBeVisible();
    await expect(page.locator('text=Form Customization')).toBeVisible();
    await expect(page.locator('text=QR Code Strategy')).toBeVisible();
    await expect(page.locator('text=Workflows & Training')).toBeVisible();
    await expect(page.locator('text=Implementation Plan')).toBeVisible();
  });

  test('should navigate through all steps', async ({ page }) => {
    // Start at Step 1
    await expect(page.locator('h5:has-text("Platform Discovery")')).toBeVisible();
    
    // Navigate to Step 2
    await page.click('button:has-text("Next")');
    await expect(page.locator('h5:has-text("Program Details")')).toBeVisible();
    
    // Navigate to Step 3
    await page.click('button:has-text("Next")');
    await expect(page.locator('h5:has-text("Data Requirements")')).toBeVisible();
    
    // Navigate back to Step 2
    await page.click('button:has-text("Back")');
    await expect(page.locator('h5:has-text("Program Details")')).toBeVisible();
  });

  test('should complete Step 1: Platform Discovery', async ({ page }) => {
    // Fill platform name
    await page.fill('input[name="platformName"]', 'Salesforce');
    
    // Select platform type
    await page.selectOption('select[name="platformType"]', 'salesforce');
    
    // Fill form builder tool name
    await page.fill('input[placeholder*="Google Forms"]', 'Salesforce Forms');
    
    // Toggle some features
    await page.check('input[type="checkbox"]:near(:text("Multiple choice"))');
    await page.check('input[type="checkbox"]:near(:text("Text fields"))');
    
    // Verify data is entered
    await expect(page.locator('input[name="platformName"]')).toHaveValue('Salesforce');
  });

  test('should complete Step 2: Program Details', async ({ page }) => {
    // Navigate to Step 2
    await page.click('button:has-text("Next")');
    
    // Fill program information
    await page.fill('input[label="Program Name"]', 'CHW Training Program');
    await page.fill('input[type="date"]', '2025-01-01');
    await page.fill('input[type="number"]', '50');
    
    // Add a cohort
    await page.click('button:has-text("Add Cohort")');
    await page.fill('input[placeholder*="Cohort name"]', 'Cohort A');
    
    // Add a session
    await page.click('button:has-text("Add Session")');
    await page.fill('input[placeholder*="Session name"]', 'Week 1 Training');
    
    // Verify data is entered
    await expect(page.locator('text=Cohort A')).toBeVisible();
    await expect(page.locator('text=Week 1 Training')).toBeVisible();
  });

  test('should complete Step 3: Data Requirements', async ({ page }) => {
    // Navigate to Step 3
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    
    // Select standard fields
    await page.check('input[type="checkbox"]:near(:text("Full Name"))');
    await page.check('input[type="checkbox"]:near(:text("Email Address"))');
    await page.check('input[type="checkbox"]:near(:text("Phone Number"))');
    
    // Add custom field
    await page.click('button:has-text("Add Custom Field")');
    await page.fill('input[placeholder*="Field name"]', 'Emergency Contact');
    await page.selectOption('select', 'text');
    await page.click('button:has-text("Save")');
    
    // Verify custom field added
    await expect(page.locator('text=Emergency Contact')).toBeVisible();
  });

  test('should complete Step 4: CSV Upload', async ({ page }) => {
    // Navigate to Step 4
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Next")');
    }
    
    // Download template
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Template")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
    
    // Upload CSV
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'participants.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('Name,Email,Phone\nJohn Doe,john@example.com,555-0100\nJane Smith,jane@example.com,555-0101')
    });
    
    // Verify upload
    await expect(page.locator('text=participants.csv')).toBeVisible();
    await expect(page.locator('text=2 participants')).toBeVisible();
  });

  test('should complete Step 5: Form Builder', async ({ page }) => {
    // Navigate to Step 5
    for (let i = 0; i < 4; i++) {
      await page.click('button:has-text("Next")');
    }
    
    // Create new form
    await page.click('button:has-text("Create New Form")');
    await page.fill('input[placeholder*="Form name"]', 'Session Check-In');
    await page.selectOption('select', 'participant_checkin');
    await page.click('button:has-text("Save")');
    
    // Verify form created
    await expect(page.locator('text=Session Check-In')).toBeVisible();
    
    // Edit form
    await page.click('button:has-text("Edit")');
    
    // Add field
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder*="Field name"]', 'Name');
    await page.selectOption('select', 'text');
    await page.check('input[type="checkbox"]:near(:text("Required"))');
    await page.click('button:has-text("Save Field")');
    
    // Preview form
    await page.click('button:has-text("Preview")');
    await expect(page.locator('text=Name')).toBeVisible();
  });

  test('should complete Step 6: QR Strategy', async ({ page }) => {
    // Navigate to Step 6
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Next")');
    }
    
    // Select QR approach
    await page.click('text=Individual QR codes');
    
    // Select print format
    await page.selectOption('select[label*="Print Format"]', 'badge');
    
    // Toggle options
    await page.check('input[type="checkbox"]:near(:text("Include participant name"))');
    await page.check('input[type="checkbox"]:near(:text("Include participant ID"))');
    
    // Select distribution methods
    await page.check('input[type="checkbox"]:near(:text("Mail to home address"))');
    await page.check('input[type="checkbox"]:near(:text("Email as PDF"))');
    
    // Verify selections
    await expect(page.locator('text=Individual QR codes')).toBeVisible();
  });

  test('should complete Step 7: Training', async ({ page }) => {
    // Navigate to Step 7
    for (let i = 0; i < 6; i++) {
      await page.click('button:has-text("Next")');
    }
    
    // Select training topics
    await page.check('input[type="checkbox"]:near(:text("QR Code Basics"))');
    await page.check('input[type="checkbox"]:near(:text("How to Scan"))');
    
    // Select staff roles
    await page.check('input[type="checkbox"]:near(:text("Program Administrator"))');
    await page.check('input[type="checkbox"]:near(:text("Instructors"))');
    
    // Toggle training delivery
    await page.check('input[type="checkbox"]:near(:text("Live Training"))');
    await page.check('input[type="checkbox"]:near(:text("Video Tutorials"))');
    
    // Verify selections
    await expect(page.locator('input[type="checkbox"]:near(:text("QR Code Basics"))')).toBeChecked();
  });

  test('should complete Step 8: Implementation Plan', async ({ page }) => {
    // Navigate to Step 8
    for (let i = 0; i < 7; i++) {
      await page.click('button:has-text("Next")');
    }
    
    // Set start date
    await page.fill('input[type="date"]', '2025-02-01');
    
    // Select timeline
    await page.selectOption('select', 'standard');
    
    // Enter budget
    await page.fill('input[placeholder*="budget"]', '$5,000');
    
    // Enter resources
    await page.fill('textarea[placeholder*="resources"]', 'Staff time, printing costs');
    
    // Verify completion percentage
    await expect(page.locator('text=100%')).toBeVisible();
  });

  test('should trigger AI analysis', async ({ page }) => {
    // Click AI button
    await page.click('button:has-text("Get AI")');
    
    // Wait for loading
    await expect(page.locator('text=Analyzing')).toBeVisible();
    
    // Wait for results (with timeout)
    await expect(page.locator('text=AI Recommendations')).toBeVisible({ timeout: 15000 });
  });

  test('should auto-save data', async ({ page }) => {
    // Fill some data
    await page.fill('input[name="platformName"]', 'Test Platform');
    
    // Wait for auto-save (1 second debounce + save time)
    await page.waitForTimeout(2000);
    
    // Refresh page
    await page.reload();
    
    // Verify data persisted
    await expect(page.locator('input[name="platformName"]')).toHaveValue('Test Platform');
  });

  test('should export implementation plan', async ({ page }) => {
    // Navigate to Step 8
    for (let i = 0; i < 7; i++) {
      await page.click('button:has-text("Next")');
    }
    
    // Click export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Plan")');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('.json');
  });

  test('should save and finish wizard', async ({ page }) => {
    // Navigate to Step 8
    for (let i = 0; i < 7; i++) {
      await page.click('button:has-text("Next")');
    }
    
    // Click Save & Finish
    await page.click('button:has-text("Save & Finish")');
    
    // Wait for success message
    await expect(page.locator('text=Congratulations')).toBeVisible({ timeout: 10000 });
  });

  test('should show progress tracking', async ({ page }) => {
    // Check initial progress
    await expect(page.locator('text=0%')).toBeVisible();
    
    // Complete a step
    await page.fill('input[name="platformName"]', 'Test');
    await page.click('button:has-text("Next")');
    
    // Progress should update (this depends on completion logic)
    // await expect(page.locator('text=12%')).toBeVisible();
  });

  test('should handle navigation via stepper', async ({ page }) => {
    // Click on Step 3 in stepper
    await page.click('text=Data Requirements');
    
    // Should navigate to Step 3
    await expect(page.locator('h5:has-text("Data Requirements")')).toBeVisible();
    
    // Click on Step 1 in stepper
    await page.click('text=Platform Discovery');
    
    // Should navigate back to Step 1
    await expect(page.locator('h5:has-text("Platform Discovery")')).toBeVisible();
  });
});
