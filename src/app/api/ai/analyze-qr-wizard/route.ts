import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step, data } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    let prompt = '';
    
    if (step === 1) {
      // Platform Discovery Analysis
      prompt = `Analyze this platform configuration for a QR code participant tracking system:

Platform: ${data.platformName}
Type: ${data.platformType}
Form Builder: ${data.formBuilder.toolName}
Has QR Generator: ${data.qrCodeGeneration.hasBuiltInGenerator}
Storage Type: ${data.datasetFeatures.storageType}

Provide a brief analysis (3-4 bullet points) covering:
1. Suitability for QR tracking
2. Key strengths
3. Potential challenges
4. Specific recommendations

Format as plain text with ✅ for strengths, ⚠️ for challenges, and 💡 for recommendations.`;
    } else if (step === 2) {
      // Program Details Analysis
      prompt = `Analyze this program structure for participant tracking:

Program: ${data.basicInfo.programName}
Type: ${data.basicInfo.programType}
Has Cohorts: ${data.cohortStructure.hasCohorts}
Number of Cohorts: ${data.cohortStructure.cohorts.length}
Has Regular Sessions: ${data.sessionSchedule.hasRegularSessions}
Session Frequency: ${data.sessionSchedule.frequency}
Number of Sessions: ${data.sessionSchedule.sessions.length}

Tracking Requirements:
- Attendance: ${data.trackingRequirements.trackAttendance}
- Progress: ${data.trackingRequirements.trackProgress}
- Outcomes: ${data.trackingRequirements.trackOutcomes}

Provide recommendations (3-4 bullet points) covering:
1. Program structure assessment
2. Tracking strategy suggestions
3. QR code implementation approach
4. Data collection best practices

Format as plain text with ✅ for good practices, 💡 for recommendations, and 📊 for data insights.`;
    } else if (step === 3) {
      // Data Requirements Analysis
      prompt = `Analyze this data collection configuration for participant tracking:

Program: ${data.programInfo?.programName || 'Not specified'}
Standard Fields: ${data.standardFields.length} selected
Custom Fields: ${data.customFields.length} defined

Demographic Data Collection:
- Age: ${data.demographicData.collectAge}
- Gender: ${data.demographicData.collectGender}
- Race/Ethnicity: ${data.demographicData.collectRace || data.demographicData.collectEthnicity}
- Language: ${data.demographicData.collectLanguage}

Medical Data Collection:
- Health Conditions: ${data.medicalData.collectHealthConditions}
- Medications: ${data.medicalData.collectMedications}
- Insurance: ${data.medicalData.collectInsurance}

Privacy Settings:
- Consent Required: ${data.consentTracking.requireConsent}
- Data Retention: ${data.privacySettings.dataRetentionPeriod} days
- Anonymize Reports: ${data.privacySettings.anonymizeReports}

Provide recommendations (3-4 bullet points) covering:
1. Data collection completeness
2. Privacy and compliance considerations
3. Suggested additional fields
4. Data quality best practices

Format as plain text with ✅ for good practices, ⚠️ for compliance warnings, 💡 for recommendations, and 📊 for data insights.`;
    } else if (step === 4) {
      // Participant Upload Analysis
      prompt = `Analyze this participant data upload for quality and completeness:

Participant Count: ${data.participantCount}
Columns Detected: ${data.headers.join(', ')}

Sample Data (first 3 rows):
${JSON.stringify(data.sampleData, null, 2)}

Expected Fields:
Standard: ${data.standardFields.join(', ')}
Custom: ${data.customFields.join(', ')}

Provide recommendations (3-4 bullet points) covering:
1. Data quality assessment
2. Missing or incomplete fields
3. Suggested field mappings
4. Data cleaning recommendations

Format as plain text with ✅ for good data, ⚠️ for issues, 💡 for recommendations, and 📊 for insights.`;
    } else if (step === 5) {
      // Form Customization Analysis
      prompt = `Analyze this form configuration for a participant tracking system:

Program: ${data.programInfo?.programName || 'Not specified'}
Number of Forms: ${data.formCount}

Forms Created:
${data.forms.map((f: any) => `- ${f.name} (${f.type}): ${f.fieldCount} fields`).join('\n')}

Provide recommendations (3-4 bullet points) covering:
1. Form completeness and coverage
2. User experience considerations
3. Missing form types
4. Field optimization suggestions

Format as plain text with ✅ for good practices, 💡 for recommendations, and 📝 for form insights.`;
    } else if (step === 6) {
      // QR Code Strategy Analysis
      prompt = `Analyze this QR code strategy for a participant tracking system:

Program: ${data.programInfo?.programName || 'Not specified'}
Participant Count: ${data.participantCount}
Approach: ${data.approach}
Print Format: ${data.printFormat}
Distribution Methods: ${data.distributionMethod.join(', ')}

Provide recommendations (3-4 bullet points) covering:
1. Strategy suitability for participant count
2. Distribution method effectiveness
3. Print format optimization
4. Backup and contingency planning

Format as plain text with ✅ for good choices, 💡 for recommendations, and 🎯 for strategy insights.`;
    } else if (step === 7) {
      // Workflows & Training Analysis
      prompt = `Analyze this training plan for a QR tracking system:

Program: ${data.programInfo?.programName || 'Not specified'}
Participant Count: ${data.participantCount}
Training Topics: ${data.trainingTopics.join(', ')}
Staff Roles: ${data.staffRoles.join(', ')}
Training Format: ${data.trainingFormat}

Provide recommendations (3-4 bullet points) covering:
1. Training comprehensiveness
2. Staff preparedness
3. Documentation needs
4. Best practices for rollout

Format as plain text with ✅ for good planning, 💡 for recommendations, and 📚 for training insights.`;
    } else if (step === 8) {
      // Implementation Plan Analysis
      prompt = `Analyze this implementation plan for a QR tracking system:

Program: ${data.programInfo?.programName || 'Not specified'}
Participant Count: ${data.participantCount}
Forms Created: ${data.formCount}
Timeline: ${data.timeline}
Milestones: ${data.milestones.length}

Provide final recommendations (3-4 bullet points) covering:
1. Implementation readiness
2. Timeline feasibility
3. Risk mitigation
4. Success factors

Format as plain text with ✅ for readiness, ⚠️ for risks, 💡 for recommendations, and 🚀 for launch insights.`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in participant tracking systems, QR code implementation, and program management. Provide concise, actionable recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const analysis = completion.choices[0]?.message?.content || 'Unable to generate analysis';

    return NextResponse.json({
      analysis,
      success: true
    });

  } catch (error: any) {
    console.error('Error analyzing with AI:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to analyze',
        success: false
      },
      { status: 500 }
    );
  }
}
