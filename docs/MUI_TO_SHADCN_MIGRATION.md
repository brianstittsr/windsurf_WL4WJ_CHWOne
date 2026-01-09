# MUI to ShadCN/UI Migration Plan

## Overview

This document outlines the strategy for migrating from Material-UI (MUI) to ShadCN/UI + Tailwind CSS.

## Current State

- **MUI Usage**: 222+ files importing `@mui/material`
- **MUI Icons**: ~150+ files importing `@mui/icons-material`
- **ShadCN Components Available**: 26 components in `src/components/ui/`
- **Tailwind CSS**: Already configured

## Migration Strategy

### Phase 1: Foundation (Completed)
- [x] Remove OnceUI mock file and references
- [x] Update tsconfig.json to remove OnceUI path alias
- [x] Clean up OnceUI references in content files

### Phase 2: Component Mapping

| MUI Component | ShadCN/UI Equivalent | Notes |
|---------------|---------------------|-------|
| `Button` | `Button` | ✅ Available |
| `Card`, `CardContent` | `Card`, `CardContent`, `CardHeader` | ✅ Available |
| `Dialog` | `Dialog` | ✅ Available |
| `TextField` | `Input` | ✅ Available |
| `Select` | `Select` | ✅ Available |
| `Checkbox` | `Checkbox` | ✅ Available |
| `Switch` | `Switch` | ✅ Available |
| `Tabs`, `Tab` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | ✅ Available |
| `Alert` | `Alert` | ✅ Available |
| `Avatar` | `Avatar` | ✅ Available |
| `Badge` | `Badge` | ✅ Available |
| `Table` | `Table` | ✅ Available |
| `Progress` | `Progress` | ✅ Available |
| `Tooltip` | Need to add | Use Radix Tooltip |
| `Snackbar` | `Toast` | ✅ Available |
| `Accordion` | Need to add | Use Radix Accordion |
| `Menu`, `MenuItem` | `DropdownMenu` | ✅ Available |
| `Drawer` | `Sheet` | ✅ Available |
| `CircularProgress` | Custom spinner | Use Tailwind animate-spin |
| `LinearProgress` | `Progress` | ✅ Available |
| `Box` | `div` with Tailwind | Use className |
| `Container` | `div` with max-w-* | Use Tailwind |
| `Grid` | `div` with grid classes | Use Tailwind grid |
| `Stack` | `div` with flex classes | Use Tailwind flex |
| `Typography` | Native HTML + Tailwind | h1-h6, p with classes |
| `Paper` | `Card` or div with shadow | Use Tailwind |
| `Divider` | `Separator` | ✅ Available |
| `IconButton` | `Button` variant="ghost" size="icon" | ✅ Available |
| `FormControl`, `InputLabel` | Native label + Input | Use Tailwind |
| `Rating` | Custom component | Need to create |
| `Autocomplete` | Custom or use cmdk | Need to add |
| `Stepper` | Custom component | Need to create |
| `Pagination` | Custom component | Need to create |

### Phase 3: Icons Migration

Replace `@mui/icons-material` with Lucide React icons:

```tsx
// Before (MUI)
import { Home, Settings, User } from '@mui/icons-material';

// After (Lucide)
import { Home, Settings, User } from 'lucide-react';
```

Most icon names are similar or identical.

### Phase 4: Migration Order (Recommended)

1. **Low-risk pages first**:
   - Static pages (about, features, etc.)
   - Simple forms
   
2. **Medium complexity**:
   - Dashboard pages
   - List/table views
   
3. **High complexity (last)**:
   - Complex forms with validation
   - Admin panels
   - Wizards/multi-step forms

### Phase 5: File-by-File Migration

For each file:

1. Replace MUI imports with ShadCN/Tailwind equivalents
2. Update component usage and props
3. Replace `sx` prop with Tailwind classes
4. Replace MUI icons with Lucide icons
5. Test the component

### Common Patterns

#### Box to div
```tsx
// Before
<Box sx={{ display: 'flex', gap: 2, p: 3 }}>

// After
<div className="flex gap-4 p-6">
```

#### Typography to HTML
```tsx
// Before
<Typography variant="h4" gutterBottom>Title</Typography>
<Typography variant="body1">Content</Typography>

// After
<h4 className="text-2xl font-semibold mb-4">Title</h4>
<p className="text-base">Content</p>
```

#### Button
```tsx
// Before
<Button variant="contained" color="primary" startIcon={<SaveIcon />}>
  Save
</Button>

// After
<Button className="gap-2">
  <Save className="h-4 w-4" />
  Save
</Button>
```

#### Card
```tsx
// Before
<Card sx={{ p: 2 }}>
  <CardContent>
    <Typography variant="h6">Title</Typography>
  </CardContent>
</Card>

// After
<Card className="p-4">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    ...
  </CardContent>
</Card>
```

## Missing ShadCN Components to Add

Run these commands to add missing components:

```bash
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add command  # For autocomplete
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add hover-card
```

## Cleanup After Migration

1. Remove MUI dependencies from package.json:
   - `@mui/material`
   - `@mui/icons-material`
   - `@emotion/react`
   - `@emotion/styled`

2. Remove MUI theme files:
   - `src/components/ThemeProvider.tsx`
   - `src/components/ThemeRegistry.tsx`

3. Update global styles if needed

## Estimated Effort

| Section | Files | Estimated Time |
|---------|-------|----------------|
| Home page | 1 | 1-2 hours |
| Auth pages | 3-4 | 2-3 hours |
| Dashboard | 5-10 | 4-6 hours |
| Forms | 15-20 | 8-12 hours |
| Admin | 20-30 | 10-15 hours |
| Components | 50+ | 15-20 hours |
| **Total** | **222+** | **40-60 hours** |

## Notes

- Keep MUI installed during migration to avoid breaking the app
- Migrate incrementally, testing after each file
- Some complex components may need custom implementations
- Consider creating wrapper components for common patterns
