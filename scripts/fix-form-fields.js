#!/usr/bin/env node

/**
 * Script to fix forms that have no fields
 * This will check a form and add fields from its template if available
 * 
 * Usage: node scripts/fix-form-fields.js <formId>
 * Example: node scripts/fix-form-fields.js KKstVqlhJbS1mhMcnpI8
 */

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    let credential;
    
    // Try environment variable first
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } 
    // Try service account file
    else {
      try {
        const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
        const serviceAccount = require(serviceAccountPath);
        credential = admin.credential.cert(serviceAccount);
      } catch (fileError) {
        console.error('Error: Could not find serviceAccountKey.json');
        console.error('Please either:');
        console.error('1. Add serviceAccountKey.json to the project root, OR');
        console.error('2. Set FIREBASE_SERVICE_ACCOUNT environment variable');
        process.exit(1);
      }
    }
    
    admin.initializeApp({
      credential: credential
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

async function fixFormFields(formId) {
  try {
    console.log(`\nChecking form: ${formId}`);
    
    // Get the form
    const formRef = db.collection('forms').doc(formId);
    const formDoc = await formRef.get();
    
    if (!formDoc.exists) {
      console.error('Form not found!');
      return;
    }
    
    const formData = formDoc.data();
    console.log('Form title:', formData.title);
    console.log('Current fields count:', formData.fields?.length || 0);
    
    // If form has fields, no need to fix
    if (formData.fields && formData.fields.length > 0) {
      console.log('✅ Form already has fields. No fix needed.');
      return;
    }
    
    console.log('⚠️  Form has no fields!');
    
    // Check if form has a templateId
    if (!formData.templateId) {
      console.log('❌ Form has no templateId. Cannot auto-fix.');
      console.log('   You need to manually add fields or recreate from template.');
      return;
    }
    
    console.log('Template ID:', formData.templateId);
    
    // Get the template
    const templateRef = db.collection('formTemplates').doc(formData.templateId);
    const templateDoc = await templateRef.get();
    
    if (!templateDoc.exists) {
      console.log('❌ Template not found. Cannot auto-fix.');
      return;
    }
    
    const template = templateDoc.data();
    console.log('Template name:', template.name);
    
    // Flatten the template fields
    const flattenedFields = [];
    if (template.schema?.sections) {
      template.schema.sections.forEach((section) => {
        section.fields.forEach((field) => {
          flattenedFields.push({
            id: field.id,
            name: field.id,
            label: field.label,
            type: field.type,
            required: field.required || false,
            placeholder: field.placeholder,
            options: field.options?.map((opt) => ({
              value: typeof opt === 'string' ? opt : opt.value,
              label: typeof opt === 'string' ? opt : opt.label
            })),
            validation: field.validation
          });
        });
      });
    }
    
    console.log('Flattened fields count:', flattenedFields.length);
    
    if (flattenedFields.length === 0) {
      console.log('❌ Template has no fields. Cannot fix.');
      return;
    }
    
    // Update the form with fields
    await formRef.update({
      fields: flattenedFields,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Form fixed successfully!');
    console.log('   Added', flattenedFields.length, 'fields to the form.');
    
  } catch (error) {
    console.error('Error fixing form:', error);
  }
}

// Get form ID from command line argument
const formId = process.argv[2];

if (!formId) {
  console.log('Usage: node fix-form-fields.js <formId>');
  console.log('Example: node fix-form-fields.js KKstVqlhJbS1mhMcnpI8');
  process.exit(1);
}

fixFormFields(formId).then(() => {
  console.log('\nDone!');
  process.exit(0);
});
