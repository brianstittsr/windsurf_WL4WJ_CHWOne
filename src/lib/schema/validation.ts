/**
 * Schema Validation Utilities
 * 
 * This module provides validation functions for the unified schema.
 * It ensures that data conforms to the schema before being saved to the database.
 */

import { Timestamp } from 'firebase/firestore';
import * as schema from './unified-schema';

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Validation options
export interface ValidationOptions {
  partial?: boolean; // If true, only validate fields that are present
  strict?: boolean;  // If true, fail on any extra fields
}

/**
 * Validate a user object against the schema
 */
export function validateUser(user: Partial<schema.User>, options: ValidationOptions = {}): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!options.partial) {
    if (!user.uid) {
      errors.push({ field: 'uid', message: 'User ID is required', code: 'required' });
    }
    if (!user.email) {
      errors.push({ field: 'email', message: 'Email is required', code: 'required' });
    }
    if (!user.role) {
      errors.push({ field: 'role', message: 'Role is required', code: 'required' });
    }
    if (!user.organizationId) {
      errors.push({ field: 'organizationId', message: 'Organization ID is required', code: 'required' });
    }
  }
  
  // Field validations
  if (user.email && !isValidEmail(user.email)) {
    errors.push({ field: 'email', message: 'Invalid email format', code: 'format' });
  }
  
  if (user.role && !Object.values(schema.UserRole).includes(user.role)) {
    errors.push({ field: 'role', message: `Invalid role: ${user.role}`, code: 'enum' });
  }
  
  // Return validation result
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate a CHW profile against the schema
 */
export function validateCHWProfile(profile: Partial<schema.CHWProfile>, options: ValidationOptions = {}): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!options.partial) {
    if (!profile.uid) {
      errors.push({ field: 'uid', message: 'User ID is required', code: 'required' });
    }
    if (!profile.firstName) {
      errors.push({ field: 'firstName', message: 'First name is required', code: 'required' });
    }
    if (!profile.lastName) {
      errors.push({ field: 'lastName', message: 'Last name is required', code: 'required' });
    }
    if (!profile.certificationNumber) {
      errors.push({ field: 'certificationNumber', message: 'Certification number is required', code: 'required' });
    }
    if (!profile.certificationDate) {
      errors.push({ field: 'certificationDate', message: 'Certification date is required', code: 'required' });
    }
    if (!profile.expirationDate) {
      errors.push({ field: 'expirationDate', message: 'Expiration date is required', code: 'required' });
    }
    if (!profile.primaryPhone) {
      errors.push({ field: 'primaryPhone', message: 'Primary phone is required', code: 'required' });
    }
  }
  
  // Field validations
  if (profile.certificationLevel && 
      !['entry', 'intermediate', 'advanced', 'lead'].includes(profile.certificationLevel)) {
    errors.push({ field: 'certificationLevel', message: `Invalid certification level: ${profile.certificationLevel}`, code: 'enum' });
  }
  
  if (profile.primaryPhone && !isValidPhone(profile.primaryPhone)) {
    errors.push({ field: 'primaryPhone', message: 'Invalid phone number format', code: 'format' });
  }
  
  if (profile.secondaryPhone && !isValidPhone(profile.secondaryPhone)) {
    errors.push({ field: 'secondaryPhone', message: 'Invalid phone number format', code: 'format' });
  }
  
  // Return validation result
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate a grant against the schema
 */
export function validateGrant(grant: Partial<schema.Grant>, options: ValidationOptions = {}): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!options.partial) {
    if (!grant.title) {
      errors.push({ field: 'title', message: 'Title is required', code: 'required' });
    }
    if (!grant.description) {
      errors.push({ field: 'description', message: 'Description is required', code: 'required' });
    }
    if (!grant.fundingSource) {
      errors.push({ field: 'fundingSource', message: 'Funding source is required', code: 'required' });
    }
    if (!grant.amount) {
      errors.push({ field: 'amount', message: 'Amount is required', code: 'required' });
    }
    if (!grant.startDate) {
      errors.push({ field: 'startDate', message: 'Start date is required', code: 'required' });
    }
    if (!grant.endDate) {
      errors.push({ field: 'endDate', message: 'End date is required', code: 'required' });
    }
    if (!grant.status) {
      errors.push({ field: 'status', message: 'Status is required', code: 'required' });
    }
    if (!grant.organizationId) {
      errors.push({ field: 'organizationId', message: 'Organization ID is required', code: 'required' });
    }
  }
  
  // Field validations
  if (grant.amount !== undefined && (typeof grant.amount !== 'number' || grant.amount < 0)) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number', code: 'format' });
  }
  
  if (grant.status && !['active', 'pending', 'completed', 'cancelled'].includes(grant.status)) {
    errors.push({ field: 'status', message: `Invalid status: ${grant.status}`, code: 'enum' });
  }
  
  // Date validations
  if (grant.startDate && grant.endDate) {
    const startDate = grant.startDate instanceof Timestamp ? grant.startDate.toDate() : new Date(grant.startDate);
    const endDate = grant.endDate instanceof Timestamp ? grant.endDate.toDate() : new Date(grant.endDate);
    
    if (startDate > endDate) {
      errors.push({ field: 'endDate', message: 'End date must be after start date', code: 'date_range' });
    }
  }
  
  // Return validation result
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate a form against the schema
 */
export function validateForm(form: Partial<schema.Form>, options: ValidationOptions = {}): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!options.partial) {
    if (!form.title) {
      errors.push({ field: 'title', message: 'Title is required', code: 'required' });
    }
    if (!form.description) {
      errors.push({ field: 'description', message: 'Description is required', code: 'required' });
    }
    if (!form.category) {
      errors.push({ field: 'category', message: 'Category is required', code: 'required' });
    }
    if (!form.fields || !Array.isArray(form.fields) || form.fields.length === 0) {
      errors.push({ field: 'fields', message: 'At least one field is required', code: 'required' });
    }
    if (!form.organizationId) {
      errors.push({ field: 'organizationId', message: 'Organization ID is required', code: 'required' });
    }
  }
  
  // Field validations
  if (form.fields && Array.isArray(form.fields)) {
    form.fields.forEach((field, index) => {
      if (!field.id) {
        errors.push({ field: `fields[${index}].id`, message: 'Field ID is required', code: 'required' });
      }
      if (!field.name) {
        errors.push({ field: `fields[${index}].name`, message: 'Field name is required', code: 'required' });
      }
      if (!field.label) {
        errors.push({ field: `fields[${index}].label`, message: 'Field label is required', code: 'required' });
      }
      if (!field.type) {
        errors.push({ field: `fields[${index}].type`, message: 'Field type is required', code: 'required' });
      }
    });
  }
  
  // Return validation result
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate any object against the schema based on its type
 */
export function validate(data: any, type: string, options: ValidationOptions = {}): ValidationResult {
  switch (type) {
    case 'user':
      return validateUser(data, options);
    case 'chwProfile':
      return validateCHWProfile(data, options);
    case 'grant':
      return validateGrant(data, options);
    case 'form':
      return validateForm(data, options);
    // Add more validation functions as needed
    default:
      return { valid: false, errors: [{ field: '', message: `Unknown type: ${type}`, code: 'unknown_type' }] };
  }
}

// Helper functions

/**
 * Check if a string is a valid email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid phone number
 */
function isValidPhone(phone: string): boolean {
  // Basic phone validation - customize as needed
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

/**
 * Check if a value is a valid date
 */
function isValidDate(date: any): boolean {
  if (date instanceof Date) return !isNaN(date.getTime());
  if (date instanceof Timestamp) return true;
  
  try {
    const d = new Date(date);
    return !isNaN(d.getTime());
  } catch (e) {
    return false;
  }
}
