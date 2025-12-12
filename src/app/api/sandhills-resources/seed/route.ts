import { NextResponse } from 'next/server';
import { SandhillsResourceService } from '@/services/SandhillsResourceService';
import { sandhillsResourcesSeedData } from '@/data/sandhills-resources-seed';

export const dynamic = 'force-dynamic';

/**
 * POST /api/sandhills-resources/seed
 * Seeds the database with initial Sandhills Resources data
 * Only works if the collection is empty
 */
export async function POST() {
  try {
    // Check if data already exists
    const existingResources = await SandhillsResourceService.getAll();
    
    if (existingResources.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Database already contains ${existingResources.length} resources. Skipping seed.`,
        count: existingResources.length
      }, { status: 400 });
    }
    
    // Seed the data
    const createdCount = await SandhillsResourceService.bulkCreate(
      sandhillsResourcesSeedData,
      'system-seed'
    );
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdCount} resources`,
      count: createdCount
    });
  } catch (error) {
    console.error('Error seeding resources:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to seed resources',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/sandhills-resources/seed
 * Returns the count of resources that would be seeded
 */
export async function GET() {
  try {
    const existingResources = await SandhillsResourceService.getAll();
    
    return NextResponse.json({
      existingCount: existingResources.length,
      seedDataCount: sandhillsResourcesSeedData.length,
      canSeed: existingResources.length === 0
    });
  } catch (error) {
    console.error('Error checking seed status:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check seed status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
