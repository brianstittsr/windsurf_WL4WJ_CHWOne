# AI Integration UI/UX Design Specifications

## Overview
This document outlines the UI/UX design specifications for the three AI components in the CHWOne platform:
1. BMAD Chat Agent on the home page
2. CHWOne Assistant in the CHW Profile Tools tab
3. Data Collection Assistant in the CHW Profile Tools tab

## 1. BMAD Chat Agent

### Placement and Visibility
- Located in the bottom-right corner of the home page
- Initially displayed as a chat bubble with the BMAD logo
- Expands to a chat panel when clicked

### Visual Design
- **Chat Bubble**:
  - Size: 60px × 60px
  - Background: Primary brand color (#1a365d)
  - Icon: White chat icon or BMAD logo
  - Drop shadow: 0px 4px 8px rgba(0, 0, 0, 0.2)
  - Hover effect: Slight scale increase (1.05x)

- **Chat Panel**:
  - Size: 350px width, 500px height
  - Background: White (#ffffff)
  - Border radius: 12px
  - Header: Brand color with title "BMAD Chat Assistant"
  - Close/minimize button in header

### Interaction Design
- **Initial State**: Chat bubble with subtle pulse animation
- **Expanded State**: Full chat panel with message history
- **Welcome Message**: "Hello! I'm your BMAD Chat Assistant. I can help you find information about the North Carolina Community Health Worker Association. What would you like to know?"
- **User Input**: Text field at bottom with send button
- **Typing Indicator**: Animated dots when assistant is "thinking"
- **Message Style**:
  - User messages: Right-aligned, brand secondary color background
  - Assistant messages: Left-aligned, light gray background
  - Support for markdown formatting in assistant responses
  - Timestamps below messages

### Responsive Behavior
- **Mobile**: Full-screen overlay when expanded
- **Tablet**: 80% width panel when expanded
- **Desktop**: Fixed width panel when expanded

### Accessibility Considerations
- High contrast between text and background
- Screen reader compatibility
- Keyboard navigation support
- Focus indicators for interactive elements

## 2. CHWOne Assistant

### Placement and Navigation
- Located in a new "Tools" tab in the CHW Profile section
- Tab navigation with "CHWOne Assistant" as the first sub-tab

### Visual Design
- **Tab Design**:
  - Standard tab styling consistent with the platform
  - Icon: Assistant/robot icon
  - Active indicator: Underline in brand color

- **Assistant Interface**:
  - Split layout: 60% chat area, 40% resource/results area
  - Background: Light neutral color (#f8f9fa)
  - Chat area: Similar to BMAD chat but with more features
  - Resource area: Card-based layout for displaying results

### Interaction Design
- **Initial State**: Welcome message explaining capabilities
- **Chat Interface**: Similar to BMAD chat but with:
  - Rich message formatting
  - Support for displaying resource cards inline
  - Action buttons within messages
  - File upload capability
- **Resource Display**:
  - Card layout with title, description, tags
  - Action buttons: Save, Share, Open
  - Filtering options by category, date, etc.
  - Sort options: Relevance, date, popularity

### Task Flows
- **Resource Search Flow**:
  1. User asks for resources on a topic
  2. Assistant confirms search parameters
  3. Results appear in resource panel
  4. User can refine search or interact with results

- **Task Automation Flow**:
  1. User requests a specific task
  2. Assistant asks for required information
  3. Assistant shows task progress indicator
  4. Results displayed with action options

### Responsive Behavior
- **Mobile**: Tabbed layout with chat and resources in separate tabs
- **Tablet**: Collapsible resource panel
- **Desktop**: Side-by-side layout

## 3. Data Collection Assistant

### Placement and Navigation
- Located in the "Tools" tab as the second sub-tab "Data Collection"
- Clear tab navigation between tools

### Visual Design
- **Tab Design**:
  - Standard tab styling consistent with the platform
  - Icon: Form/survey icon
  - Active indicator: Underline in brand color

- **Assistant Interface**:
  - Three-panel layout:
    1. Chat panel (40%)
    2. Form preview panel (60%)
    3. Action panel (bottom)
  - Background: Light neutral color (#f8f9fa)
  - Form preview: Clean, card-based question display

### Interaction Design
- **Conversation Flow**:
  - Guided conversation with clear progression
  - Progress indicator showing conversation stages
  - Ability to go back and modify previous answers

- **Form Preview**:
  - Real-time updates as conversation progresses
  - Interactive elements to test form functionality
  - Visual indicators for question types and validation

- **Action Panel**:
  - Primary button: "Generate Form" (initially disabled)
  - Secondary button: "Start Over"
  - Tertiary button: "Save Draft"

### Form Generation Process
1. **Initial Questions**:
   - Purpose selection UI: Cards with common survey types
   - Target audience: Multiple choice with text input
   - Timeline: Date picker or duration selector

2. **Question Definition**:
   - Question bank suggestions based on purpose
   - Drag-and-drop question reordering
   - Question type selection with visual examples

3. **Form Preview**:
   - Complete form preview with all questions
   - Test mode to try filling out the form
   - Visual validation feedback

4. **Production Form**:
   - Form metadata input: Title, description, privacy notice
   - Distribution options: Link, QR code, embed
   - Success screen with next steps

### QR Code Generation
- **QR Code Display**:
  - Clean, high-contrast QR code
  - Form title displayed above
  - Download button for PNG/SVG formats
  - Copy link button
  - Share options (email, messaging)

### Responsive Behavior
- **Mobile**: Sequential panels with navigation between them
- **Tablet**: Two-panel layout with collapsible sections
- **Desktop**: Three-panel layout

## Color Palette

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary Brand | Deep Blue | #1a365d |
| Secondary Brand | Medium Blue | #2a4365 |
| Accent | Teal | #319795 |
| Success | Green | #38a169 |
| Warning | Amber | #d69e2e |
| Error | Red | #e53e3e |
| Background | Light Gray | #f8f9fa |
| Text Primary | Dark Gray | #2d3748 |
| Text Secondary | Medium Gray | #718096 |

## Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headers | Inter | 600 | 20-24px |
| Body Text | Inter | 400 | 16px |
| Button Text | Inter | 500 | 16px |
| Chat Messages | Inter | 400 | 16px |
| Input Fields | Inter | 400 | 16px |
| Labels | Inter | 500 | 14px |

## Iconography
- Use consistent icon set throughout (recommended: Lucide icons)
- Icon size: 20-24px for navigation, 16-18px for inline
- Icon color: Match text color or use brand colors for emphasis

## Accessibility Guidelines
- Maintain WCAG 2.1 AA compliance
- Provide alt text for all images and icons
- Ensure keyboard navigability
- Support screen readers with ARIA labels
- Maintain 4.5:1 contrast ratio for text
- Support zoom up to 200% without breaking layout

## Prototypes
- High-fidelity prototypes to be created in Figma
- Interactive prototypes for user testing
- Component library to be developed for consistent implementation
