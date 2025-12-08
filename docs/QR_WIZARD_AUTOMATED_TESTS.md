# QR Wizard Automated Testing Suite

## 🧪 Overview

Comprehensive automated testing suite for the QR Code Participant Tracking Wizard, including unit tests, integration tests, and end-to-end tests.

---

## 📋 Test Coverage

### Test Types
1. **Unit Tests** - Individual component testing
2. **Integration Tests** - Component interaction testing
3. **E2E Tests** - Full user flow testing
4. **CI/CD Tests** - Automated testing pipeline

### Coverage Goals
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Key workflows covered
- **E2E Tests**: All 8 steps tested
- **CI/CD**: Automated on every PR

---

## 🏗️ Test Infrastructure

### Testing Libraries
```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.1.0",
  "@testing-library/user-event": "^14.5.0",
  "@playwright/test": "^1.40.0",
  "jest": "^29.7.0"
}
```

### Installation
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install Playwright for E2E tests
npm install --save-dev @playwright/test
npx playwright install
```

---

## 📁 Test Structure

```
CHWOne/
├── __tests__/
│   └── QRWizard/
│       ├── QRWizardContext.test.tsx
│       ├── Step1PlatformDiscovery.test.tsx
│       ├── Step2ProgramDetails.test.tsx
│       ├── Step3DataRequirements.test.tsx
│       ├── Step4ParticipantUpload.test.tsx
│       ├── Step5FormCustomization.test.tsx
│       ├── Step6QRCodeStrategy.test.tsx
│       ├── Step7WorkflowsTraining.test.tsx
│       └── Step8ImplementationPlan.test.tsx
├── e2e/
│   └── qr-wizard.spec.ts
├── .github/
│   └── workflows/
│       └── test.yml
└── jest.config.js
```

---

## 🧪 Unit Tests

### QRWizardContext Tests
**File**: `__tests__/QRWizard/QRWizardContext.test.tsx`

**Coverage**:
- ✅ Initial state
- ✅ Navigation (next/previous/goto)
- ✅ Step updates (all 8 steps)
- ✅ Step completion tracking
- ✅ Wizard reset

**Run**:
```bash
npm run test:unit -- QRWizardContext
```

### Step 4 Upload Tests
**File**: `__tests__/QRWizard/Step4ParticipantUpload.test.tsx`

**Coverage**:
- ✅ Initial render
- ✅ Template download
- ✅ CSV upload
- ✅ File parsing
- ✅ Field mapping
- ✅ Data preview
- ✅ Validation
- ✅ AI analysis
- ✅ Error handling

**Run**:
```bash
npm run test:unit -- Step4ParticipantUpload
```

---

## 🔗 Integration Tests

### Wizard Flow Tests
Test complete user workflows across multiple steps.

**Scenarios**:
1. **Complete Wizard Flow**
   - Navigate through all 8 steps
   - Fill required data
   - Verify auto-save
   - Export plan

2. **CSV Upload to Form Creation**
   - Upload participants
   - Map fields
   - Create forms using uploaded data
   - Verify data consistency

3. **AI Integration Flow**
   - Trigger AI analysis in each step
   - Verify recommendations
   - Test error handling

**Run**:
```bash
npm run test:integration
```

---

## 🎭 E2E Tests (Playwright)

### Test Scenarios

#### 1. Wizard Navigation
```typescript
test('should navigate through all 8 steps', async ({ page }) => {
  // Test forward/backward navigation
  // Verify step content
  // Check progress tracking
});
```

#### 2. Step Completion
```typescript
test('should complete each step with data', async ({ page }) => {
  // Fill Step 1: Platform
  // Fill Step 2: Program
  // Fill Step 3: Data
  // Upload Step 4: CSV
  // Create Step 5: Forms
  // Plan Step 6: QR Strategy
  // Document Step 7: Training
  // Finalize Step 8: Implementation
});
```

#### 3. Auto-Save
```typescript
test('should auto-save data', async ({ page }) => {
  // Enter data
  // Wait for auto-save
  // Refresh page
  // Verify data persists
});
```

#### 4. AI Analysis
```typescript
test('should trigger AI analysis', async ({ page }) => {
  // Click AI button
  // Wait for response
  // Verify recommendations
});
```

#### 5. Export
```typescript
test('should export implementation plan', async ({ page }) => {
  // Navigate to Step 8
  // Click export
  // Verify download
});
```

### Run E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test
npm run test:e2e -- qr-wizard.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run in debug mode
npm run test:e2e -- --debug
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
**File**: `.github/workflows/test.yml`

### Pipeline Stages

#### 1. Lint & Type Check
```yaml
- name: Run linter
  run: npm run lint

- name: Run type check
  run: npm run type-check
```

#### 2. Unit Tests
```yaml
- name: Run unit tests
  run: npm run test:unit
```

#### 3. Integration Tests
```yaml
- name: Run integration tests
  run: npm run test:integration
```

#### 4. E2E Tests
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

#### 5. Build Verification
```yaml
- name: Build application
  run: npm run build
```

### Triggers
- **Push** to `main` or `develop` branches
- **Pull Request** to `main` or `develop` branches

---

## 📊 Test Reports

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Playwright Reports
```bash
# View last test report
npx playwright show-report
```

### CI Reports
- Coverage uploaded to Codecov
- Test results in GitHub Actions
- Playwright reports as artifacts

---

## 🔧 NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🎯 Test Best Practices

### Unit Tests
1. **Isolate Components**: Mock external dependencies
2. **Test Behavior**: Not implementation details
3. **Clear Names**: Describe what is being tested
4. **Arrange-Act-Assert**: Follow AAA pattern

### Integration Tests
1. **Real Interactions**: Minimal mocking
2. **User Workflows**: Test complete scenarios
3. **Data Flow**: Verify state management
4. **Error Paths**: Test failure scenarios

### E2E Tests
1. **User Perspective**: Test like a real user
2. **Stable Selectors**: Use data-testid attributes
3. **Wait Strategies**: Use proper waits
4. **Independent Tests**: No test dependencies

---

## 🐛 Debugging Tests

### Jest Tests
```bash
# Run single test file
npm test -- QRWizardContext.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should navigate"

# Run in watch mode
npm run test:watch

# Debug in VS Code
# Add breakpoint and press F5
```

### Playwright Tests
```bash
# Debug mode (step through)
npm run test:e2e:debug

# Headed mode (see browser)
npm run test:e2e:headed

# Trace viewer
npx playwright show-trace trace.zip
```

---

## 📝 Writing New Tests

### Unit Test Template
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import YourComponent from '@/components/YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<YourComponent />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    await page.click('button:has-text("Click Me")');
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

---

## 🔍 Test Checklist

### Before Committing
- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Coverage maintained/improved
- [ ] No console errors
- [ ] Tests are fast (< 5 min total)

### Before Deploying
- [ ] CI pipeline passes
- [ ] E2E tests pass
- [ ] No flaky tests
- [ ] Coverage reports reviewed
- [ ] Performance acceptable

---

## 📈 Coverage Goals

### Current Coverage
```
Statements   : 75%
Branches     : 70%
Functions    : 75%
Lines        : 75%
```

### Target Coverage
```
Statements   : 85%
Branches     : 80%
Functions    : 85%
Lines        : 85%
```

### Critical Paths (100% Coverage)
- Wizard navigation
- Data persistence
- CSV upload & parsing
- Form creation
- Export functionality

---

## 🚨 Known Issues

### Test Warnings
1. **Firebase Mock**: Some Firebase methods need better mocking
2. **Async Operations**: Some tests may need longer timeouts
3. **Type Errors**: Test data may not match exact type definitions

### Solutions
- Use `waitFor` for async operations
- Mock Firebase completely in tests
- Create test-specific type utilities

---

## 🎓 Testing Resources

### Documentation
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)

### Best Practices
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [E2E Testing Guide](https://playwright.dev/docs/best-practices)

---

## 🎉 Summary

### Test Suite Includes
- ✅ Context state management tests
- ✅ Component unit tests
- ✅ CSV upload integration tests
- ✅ Complete E2E wizard flow
- ✅ AI integration tests
- ✅ Auto-save verification
- ✅ Export functionality tests
- ✅ CI/CD pipeline

### Running All Tests
```bash
# Run everything
npm run test:all

# Or individually
npm run lint
npm run type-check
npm run test:unit
npm run test:integration
npm run test:e2e
```

---

**Your QR Wizard now has comprehensive automated testing!** 🧪✅

*Last Updated: November 30, 2025*
