# CHWOne Platform Bootstrap Migration Documentation

## Migration Status

The CHWOne platform has been migrated from Once UI to Bootstrap. This document outlines the migration process, components that have been converted, and remaining work.

### Completed Components

The following components have been successfully migrated from Once UI to Bootstrap:

1. **Layout Components**
   - MainLayout
   - MagicPageTemplate
   - PageContainer
   - Header
   - PageFooter
   - Sidebar
   - PageTemplate
   - Footer

2. **Page Components**
   - CHWs pages
   - Surveys pages
   - Login page
   - Register page
   - Gallery pages
   - Blog pages
   - Work pages
   - About pages
   - API Access page
   - Forms pages

3. **Functional Components**
   - CHWManagement
   - FormsManagement
   - FormBuilder
   - GrantManagement
   - PlatformLanding
   - Region5Directory
   - Mailchimp
   - MDX
   - TableOfContents
   - ProjectCard
   - Projects
   - ThemeToggle

### Remaining Components

The following components still need to be migrated from Once UI to Bootstrap:

1. ProjectManagement
2. ReferralManagement
3. RouteGuard
4. SettingsManagement
5. EmpowerSurveyManagement
6. WorkforceDevelopment

## Migration Process

The migration process involved the following steps:

1. Creating Bootstrap versions of components with `.fix` extension
2. Replacing Once UI imports with React-Bootstrap imports
3. Converting Once UI components to their Bootstrap equivalents
4. Maintaining the same functionality and layout
5. Applying the fixed files to replace the original components

## Component Mapping

| Once UI Component | Bootstrap Equivalent |
|------------------|----------------------|
| Flex             | div with d-flex classes |
| Row              | Row from react-bootstrap |
| Column           | Col from react-bootstrap |
| Card             | Card from react-bootstrap |
| Button           | Button from react-bootstrap |
| Text             | Native HTML elements with Bootstrap classes |
| Input            | Form.Control from react-bootstrap |
| Textarea         | Form.Control as="textarea" from react-bootstrap |

## Styling Changes

- Replaced Once UI design tokens (var(--brand), var(--neutral-medium), etc.) with Bootstrap color classes
- Used Bootstrap utility classes for spacing, alignment, and typography
- Maintained responsive design using Bootstrap's grid system
- Used React Icons for iconography instead of Once UI icons

## Dependencies

The following dependencies were removed from package.json:
- @once-ui-system/core

The following dependencies are required:
- react-bootstrap
- bootstrap
- react-icons

## Testing

After completing the migration of all components, the application should be tested to ensure:
1. All pages render correctly
2. Functionality is preserved
3. Responsive design works as expected
4. No Once UI dependencies remain

## Future Improvements

1. Refine Bootstrap styling to match the original design more closely
2. Optimize CSS by removing unused Bootstrap components
3. Implement custom theme to maintain brand consistency
4. Add additional accessibility improvements
