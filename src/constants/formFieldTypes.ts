/**
 * Comprehensive Form Field Types
 * Similar to Qualtrics field types for advanced form building
 */

export interface FieldTypeOption {
  value: string;
  label: string;
  category: string;
  description?: string;
  icon?: string;
}

export const FIELD_TYPE_CATEGORIES = {
  TEXT_ENTRY: 'Text Entry',
  MULTIPLE_CHOICE: 'Multiple Choice',
  MATRIX: 'Matrix',
  SLIDER_SCALE: 'Slider & Scale',
  DATE_TIME: 'Date & Time',
  NUMERIC: 'Numeric',
  FILE_MEDIA: 'File & Media',
  LOCATION: 'Location',
  ADVANCED: 'Advanced',
  CONTACT_INFO: 'Contact Info',
  SPECIALIZED: 'Specialized'
};

export const FIELD_TYPES: FieldTypeOption[] = [
  // Text Entry
  { 
    value: 'text', 
    label: 'Single Line Text', 
    category: FIELD_TYPE_CATEGORIES.TEXT_ENTRY,
    description: 'Short text input for names, titles, etc.'
  },
  { 
    value: 'textarea', 
    label: 'Multi-line Text (Essay)', 
    category: FIELD_TYPE_CATEGORIES.TEXT_ENTRY,
    description: 'Long text input for comments, descriptions'
  },
  { 
    value: 'email', 
    label: 'Email Address', 
    category: FIELD_TYPE_CATEGORIES.TEXT_ENTRY,
    description: 'Email input with validation'
  },
  { 
    value: 'url', 
    label: 'Website URL', 
    category: FIELD_TYPE_CATEGORIES.TEXT_ENTRY,
    description: 'URL input with validation'
  },
  { 
    value: 'phone', 
    label: 'Phone Number', 
    category: FIELD_TYPE_CATEGORIES.TEXT_ENTRY,
    description: 'Phone number with formatting'
  },
  { 
    value: 'password', 
    label: 'Password', 
    category: FIELD_TYPE_CATEGORIES.TEXT_ENTRY,
    description: 'Masked password input'
  },
  
  // Multiple Choice
  { 
    value: 'radio', 
    label: 'Multiple Choice (Single Answer)', 
    category: FIELD_TYPE_CATEGORIES.MULTIPLE_CHOICE,
    description: 'Radio buttons for single selection'
  },
  { 
    value: 'checkbox', 
    label: 'Multiple Choice (Multiple Answers)', 
    category: FIELD_TYPE_CATEGORIES.MULTIPLE_CHOICE,
    description: 'Checkboxes for multiple selections'
  },
  { 
    value: 'select', 
    label: 'Dropdown List', 
    category: FIELD_TYPE_CATEGORIES.MULTIPLE_CHOICE,
    description: 'Dropdown menu for single selection'
  },
  { 
    value: 'image-choice', 
    label: 'Image Choice', 
    category: FIELD_TYPE_CATEGORIES.MULTIPLE_CHOICE,
    description: 'Select from image options'
  },
  { 
    value: 'button-choice', 
    label: 'Button Choice', 
    category: FIELD_TYPE_CATEGORIES.MULTIPLE_CHOICE,
    description: 'Button-style selection'
  },
  
  // Matrix/Grid
  { 
    value: 'matrix-single', 
    label: 'Matrix (Single Answer)', 
    category: FIELD_TYPE_CATEGORIES.MATRIX,
    description: 'Grid with single selection per row'
  },
  { 
    value: 'matrix-multiple', 
    label: 'Matrix (Multiple Answers)', 
    category: FIELD_TYPE_CATEGORIES.MATRIX,
    description: 'Grid with multiple selections per row'
  },
  { 
    value: 'matrix-dropdown', 
    label: 'Matrix (Dropdown)', 
    category: FIELD_TYPE_CATEGORIES.MATRIX,
    description: 'Grid with dropdown selections'
  },
  { 
    value: 'matrix-text', 
    label: 'Matrix (Text Entry)', 
    category: FIELD_TYPE_CATEGORIES.MATRIX,
    description: 'Grid with text input cells'
  },
  { 
    value: 'rank-order', 
    label: 'Rank Order', 
    category: FIELD_TYPE_CATEGORIES.MATRIX,
    description: 'Drag and drop ranking'
  },
  { 
    value: 'side-by-side', 
    label: 'Side by Side', 
    category: FIELD_TYPE_CATEGORIES.MATRIX,
    description: 'Multiple questions side by side'
  },
  
  // Slider & Scale
  { 
    value: 'slider', 
    label: 'Slider', 
    category: FIELD_TYPE_CATEGORIES.SLIDER_SCALE,
    description: 'Continuous slider for numeric input'
  },
  { 
    value: 'rating-scale', 
    label: 'Rating Scale', 
    category: FIELD_TYPE_CATEGORIES.SLIDER_SCALE,
    description: 'Numeric rating scale (1-5, 1-10, etc.)'
  },
  { 
    value: 'likert-scale', 
    label: 'Likert Scale', 
    category: FIELD_TYPE_CATEGORIES.SLIDER_SCALE,
    description: 'Agreement scale (Strongly Disagree to Strongly Agree)'
  },
  { 
    value: 'star-rating', 
    label: 'Star Rating', 
    category: FIELD_TYPE_CATEGORIES.SLIDER_SCALE,
    description: 'Star-based rating system'
  },
  { 
    value: 'nps', 
    label: 'Net Promoter Score (NPS)', 
    category: FIELD_TYPE_CATEGORIES.SLIDER_SCALE,
    description: '0-10 scale for NPS measurement'
  },
  
  // Date & Time
  { 
    value: 'date', 
    label: 'Date Picker', 
    category: FIELD_TYPE_CATEGORIES.DATE_TIME,
    description: 'Calendar date picker'
  },
  { 
    value: 'time', 
    label: 'Time Picker', 
    category: FIELD_TYPE_CATEGORIES.DATE_TIME,
    description: 'Time selection'
  },
  { 
    value: 'datetime', 
    label: 'Date & Time', 
    category: FIELD_TYPE_CATEGORIES.DATE_TIME,
    description: 'Combined date and time picker'
  },
  { 
    value: 'date-range', 
    label: 'Date Range', 
    category: FIELD_TYPE_CATEGORIES.DATE_TIME,
    description: 'Start and end date selection'
  },
  
  // Numeric
  { 
    value: 'number', 
    label: 'Number (Integer)', 
    category: FIELD_TYPE_CATEGORIES.NUMERIC,
    description: 'Whole number input'
  },
  { 
    value: 'decimal', 
    label: 'Number (Decimal)', 
    category: FIELD_TYPE_CATEGORIES.NUMERIC,
    description: 'Decimal number input'
  },
  { 
    value: 'currency', 
    label: 'Currency', 
    category: FIELD_TYPE_CATEGORIES.NUMERIC,
    description: 'Currency input with formatting'
  },
  { 
    value: 'percentage', 
    label: 'Percentage', 
    category: FIELD_TYPE_CATEGORIES.NUMERIC,
    description: 'Percentage input (0-100%)'
  },
  
  // File & Media
  { 
    value: 'file', 
    label: 'File Upload', 
    category: FIELD_TYPE_CATEGORIES.FILE_MEDIA,
    description: 'General file upload'
  },
  { 
    value: 'image-upload', 
    label: 'Image Upload', 
    category: FIELD_TYPE_CATEGORIES.FILE_MEDIA,
    description: 'Image file upload with preview'
  },
  { 
    value: 'video-upload', 
    label: 'Video Upload', 
    category: FIELD_TYPE_CATEGORIES.FILE_MEDIA,
    description: 'Video file upload'
  },
  { 
    value: 'audio-upload', 
    label: 'Audio Upload', 
    category: FIELD_TYPE_CATEGORIES.FILE_MEDIA,
    description: 'Audio file upload'
  },
  { 
    value: 'signature', 
    label: 'Signature Capture', 
    category: FIELD_TYPE_CATEGORIES.FILE_MEDIA,
    description: 'Digital signature pad'
  },
  { 
    value: 'drawing', 
    label: 'Drawing Canvas', 
    category: FIELD_TYPE_CATEGORIES.FILE_MEDIA,
    description: 'Freehand drawing canvas'
  },
  
  // Location
  { 
    value: 'address', 
    label: 'Address (Full)', 
    category: FIELD_TYPE_CATEGORIES.LOCATION,
    description: 'Complete address with street, city, state, zip'
  },
  { 
    value: 'location', 
    label: 'GPS Location', 
    category: FIELD_TYPE_CATEGORIES.LOCATION,
    description: 'GPS coordinates capture'
  },
  { 
    value: 'map-picker', 
    label: 'Map Location Picker', 
    category: FIELD_TYPE_CATEGORIES.LOCATION,
    description: 'Interactive map for location selection'
  },
  { 
    value: 'country', 
    label: 'Country Selector', 
    category: FIELD_TYPE_CATEGORIES.LOCATION,
    description: 'Country dropdown'
  },
  { 
    value: 'state', 
    label: 'State/Province Selector', 
    category: FIELD_TYPE_CATEGORIES.LOCATION,
    description: 'State or province dropdown'
  },
  { 
    value: 'city', 
    label: 'City Selector', 
    category: FIELD_TYPE_CATEGORIES.LOCATION,
    description: 'City dropdown'
  },
  { 
    value: 'zipcode', 
    label: 'ZIP/Postal Code', 
    category: FIELD_TYPE_CATEGORIES.LOCATION,
    description: 'ZIP or postal code input'
  },
  
  // Advanced
  { 
    value: 'captcha', 
    label: 'CAPTCHA Verification', 
    category: FIELD_TYPE_CATEGORIES.ADVANCED,
    description: 'Bot prevention verification'
  },
  { 
    value: 'consent', 
    label: 'Consent Checkbox', 
    category: FIELD_TYPE_CATEGORIES.ADVANCED,
    description: 'Required consent checkbox'
  },
  { 
    value: 'terms', 
    label: 'Terms & Conditions', 
    category: FIELD_TYPE_CATEGORIES.ADVANCED,
    description: 'Terms acceptance with scrollable text'
  },
  { 
    value: 'section-break', 
    label: 'Section Break', 
    category: FIELD_TYPE_CATEGORIES.ADVANCED,
    description: 'Visual section separator'
  },
  { 
    value: 'page-break', 
    label: 'Page Break', 
    category: FIELD_TYPE_CATEGORIES.ADVANCED,
    description: 'Multi-page form separator'
  },
  { 
    value: 'descriptive-text', 
    label: 'Descriptive Text/HTML', 
    category: FIELD_TYPE_CATEGORIES.ADVANCED,
    description: 'Rich text or HTML content'
  },
  { 
    value: 'divider', 
    label: 'Visual Divider', 
    category: FIELD_TYPE_CATEGORIES.ADVANCED,
    description: 'Horizontal line separator'
  },
  { 
    value: 'calculated', 
    label: 'Calculated Field', 
    category: FIELD_TYPE_CATEGORIES.ADVANCED,
    description: 'Auto-calculated based on other fields'
  },
  { 
    value: 'hidden', 
    label: 'Hidden Field', 
    category: FIELD_TYPE_CATEGORIES.ADVANCED,
    description: 'Hidden field for tracking data'
  },
  
  // Contact Information
  { 
    value: 'name-full', 
    label: 'Full Name (First, Last)', 
    category: FIELD_TYPE_CATEGORIES.CONTACT_INFO,
    description: 'First and last name fields'
  },
  { 
    value: 'name-parts', 
    label: 'Name (Prefix, First, Middle, Last, Suffix)', 
    category: FIELD_TYPE_CATEGORIES.CONTACT_INFO,
    description: 'Complete name with all parts'
  },
  { 
    value: 'contact-info', 
    label: 'Contact Information Block', 
    category: FIELD_TYPE_CATEGORIES.CONTACT_INFO,
    description: 'Name, email, phone in one block'
  },
  
  // Specialized
  { 
    value: 'color-picker', 
    label: 'Color Picker', 
    category: FIELD_TYPE_CATEGORIES.SPECIALIZED,
    description: 'Color selection tool'
  },
  { 
    value: 'barcode-scanner', 
    label: 'Barcode/QR Scanner', 
    category: FIELD_TYPE_CATEGORIES.SPECIALIZED,
    description: 'Camera-based barcode scanner'
  },
  { 
    value: 'lookup', 
    label: 'Lookup/Search Field', 
    category: FIELD_TYPE_CATEGORIES.SPECIALIZED,
    description: 'Search and select from database'
  },
  { 
    value: 'autocomplete', 
    label: 'Autocomplete', 
    category: FIELD_TYPE_CATEGORIES.SPECIALIZED,
    description: 'Auto-suggest as you type'
  },
  { 
    value: 'tags', 
    label: 'Tags/Chips Input', 
    category: FIELD_TYPE_CATEGORIES.SPECIALIZED,
    description: 'Multiple tag selection'
  },
  { 
    value: 'wysiwyg', 
    label: 'Rich Text Editor (WYSIWYG)', 
    category: FIELD_TYPE_CATEGORIES.SPECIALIZED,
    description: 'Rich text formatting editor'
  },
  { 
    value: 'code-editor', 
    label: 'Code Editor', 
    category: FIELD_TYPE_CATEGORIES.SPECIALIZED,
    description: 'Syntax-highlighted code input'
  },
  { 
    value: 'json-editor', 
    label: 'JSON Editor', 
    category: FIELD_TYPE_CATEGORIES.SPECIALIZED,
    description: 'JSON data editor with validation'
  }
];

// Helper function to get field types by category
export const getFieldTypesByCategory = (category: string): FieldTypeOption[] => {
  return FIELD_TYPES.filter(field => field.category === category);
};

// Helper function to get all categories
export const getAllCategories = (): string[] => {
  return Object.values(FIELD_TYPE_CATEGORIES);
};

// Helper function to get field type by value
export const getFieldTypeByValue = (value: string): FieldTypeOption | undefined => {
  return FIELD_TYPES.find(field => field.value === value);
};

// Export for backward compatibility
export const fieldTypeOptions = FIELD_TYPES;
