import { NextRequest, NextResponse } from 'next/server';
import { ResourceVerificationService } from '@/services/ResourceVerificationService';
import { SandhillsResourceService } from '@/services/SandhillsResourceService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sandhills-resources/verify/[token]
 * Get resource details for verification portal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Get verification by token
    const verification = await ResourceVerificationService.getByToken(token);

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (new Date() > verification.tokenExpiry) {
      return NextResponse.json(
        { error: 'This verification link has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Get the resource details
    const resource = await SandhillsResourceService.getById(verification.resourceId);

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verification: {
        id: verification.id,
        organizationName: verification.organizationName,
        contactEmail: verification.contactEmail,
        contactName: verification.contactName,
        status: verification.status,
        tokenExpiry: verification.tokenExpiry
      },
      resource: {
        id: resource.id,
        organization: resource.organization,
        address: resource.address,
        city: resource.city,
        state: resource.state,
        zip: resource.zip,
        counties: resource.counties,
        resourceType: resource.resourceType,
        contactPerson: resource.contactPerson,
        contactPersonPhone: resource.contactPersonPhone,
        contactPersonEmail: resource.contactPersonEmail,
        generalContactName: resource.generalContactName,
        generalContactPhone: resource.generalContactPhone,
        website: resource.website,
        currentStatus: resource.currentStatus,
        resourceDescription: resource.resourceDescription,
        eligibility: resource.eligibility,
        howToApply: resource.howToApply,
        notes: resource.notes
      }
    });

  } catch (error) {
    console.error('Verification GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load verification' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sandhills-resources/verify/[token]
 * Submit verification response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Get verification by token
    const verification = await ResourceVerificationService.getByToken(token);

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid verification link' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (new Date() > verification.tokenExpiry) {
      return NextResponse.json(
        { error: 'This verification link has expired' },
        { status: 410 }
      );
    }

    const {
      isStillAvailable,
      updatedFields,
      newContactEmail,
      newContactName,
      newContactPhone,
      additionalNotes,
      respondentEmail
    } = body;

    // Save the response
    await ResourceVerificationService.saveResponse({
      verificationId: verification.id,
      resourceId: verification.resourceId,
      responseDate: new Date(),
      isStillAvailable,
      updatedFields,
      newContactEmail,
      newContactName,
      newContactPhone,
      additionalNotes,
      respondentEmail: respondentEmail || verification.contactEmail
    });

    // Update the resource if fields were changed
    if (updatedFields && Object.keys(updatedFields).length > 0) {
      await SandhillsResourceService.update(
        verification.resourceId,
        updatedFields,
        'verification-portal'
      );
    }

    // Update contact info on verification if changed
    if (newContactEmail || newContactName) {
      // This would update the verification record for future emails
    }

    // Mark verification status
    if (isStillAvailable) {
      await ResourceVerificationService.markVerified(
        verification.id,
        respondentEmail || verification.contactEmail,
        additionalNotes
      );
    } else {
      await ResourceVerificationService.markNeedsUpdate(
        verification.id,
        additionalNotes || 'Resource marked as no longer available'
      );

      // Optionally mark resource as inactive
      await SandhillsResourceService.update(
        verification.resourceId,
        { currentStatus: 'Inactive' },
        'verification-portal'
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for verifying your resource information!'
    });

  } catch (error) {
    console.error('Verification POST error:', error);
    return NextResponse.json(
      { error: 'Failed to submit verification' },
      { status: 500 }
    );
  }
}
