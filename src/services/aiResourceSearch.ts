/**
 * AI-Powered Resource Search Service
 * 
 * This service uses OpenAI to search the CHWOne Resources database
 * and return relevant resources based on natural language queries.
 * Used by WhatsApp integration and other AI features.
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import OpenAI from 'openai';

// Resource interface matching the CHWOne schema
interface Resource {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    county?: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  services?: string[];
  eligibility?: string;
  hours?: string;
  languages?: string[];
  isActive?: boolean;
}

// Initialize OpenAI client
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}

// Result type for resource search
export interface ResourceSearchResult {
  response: string;
  resourcesFound: number;
  searchParams?: {
    category?: string;
    county?: string;
    city?: string;
    keywords?: string[];
  };
}

/**
 * Search resources using AI to understand the query and find relevant matches
 */
export async function searchResourcesWithAI(userQuery: string): Promise<ResourceSearchResult> {
  console.log(`[AI_SEARCH] Processing query: "${userQuery}"`);
  
  try {
    // Step 1: Use AI to extract search parameters from the query
    const searchParams = await extractSearchParameters(userQuery);
    console.log('[AI_SEARCH] Extracted parameters:', searchParams);
    
    // Step 2: Search the resources database
    const resources = await searchResourcesDatabase(searchParams);
    console.log(`[AI_SEARCH] Found ${resources.length} resources`);
    
    // Step 3: Use AI to generate a helpful response
    const response = await generateAIResponse(userQuery, resources);
    
    return {
      response,
      resourcesFound: resources.length,
      searchParams,
    };
    
  } catch (error: any) {
    console.error('[AI_SEARCH] Error:', error);
    return {
      response: `I'm sorry, I encountered an error while searching for resources. Please try again later or contact support. Error: ${error.message}`,
      resourcesFound: 0,
    };
  }
}

/**
 * Extract search parameters from natural language query using AI
 */
async function extractSearchParameters(query: string): Promise<{
  category?: string;
  county?: string;
  city?: string;
  keywords: string[];
}> {
  const openai = getOpenAIClient();
  
  const systemPrompt = `You are a helpful assistant that extracts search parameters from user queries about community resources in North Carolina.

Extract the following information from the user's query:
- category: The type of resource (e.g., "housing", "food", "healthcare", "transportation", "employment", "childcare", "utilities", "legal", "mental health", "substance abuse", "education")
- county: The county name if mentioned (e.g., "Wake", "Durham", "Mecklenburg")
- city: The city name if mentioned (e.g., "Raleigh", "Durham", "Charlotte")
- keywords: Important keywords from the query

Respond ONLY with a valid JSON object. Example:
{"category": "housing", "county": "Wake", "city": null, "keywords": ["rent", "assistance"]}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ],
    temperature: 0.1,
    max_tokens: 200,
    response_format: { type: 'json_object' }
  });
  
  const content = response.choices[0]?.message?.content || '{}';
  
  try {
    const parsed = JSON.parse(content);
    return {
      category: parsed.category || undefined,
      county: parsed.county || undefined,
      city: parsed.city || undefined,
      keywords: parsed.keywords || []
    };
  } catch {
    return { keywords: query.split(' ').filter(w => w.length > 3) };
  }
}

/**
 * Search the Firestore resources database
 */
async function searchResourcesDatabase(params: {
  category?: string;
  county?: string;
  city?: string;
  keywords: string[];
}): Promise<Resource[]> {
  try {
    // Try to get resources from Firestore
    const resourcesRef = collection(db, 'resources');
    let resourceQuery = query(resourcesRef, where('isActive', '!=', false), limit(50));
    
    const snapshot = await getDocs(resourceQuery);
    let resources: Resource[] = [];
    
    snapshot.forEach(doc => {
      resources.push({ id: doc.id, ...doc.data() } as Resource);
    });
    
    // Filter by category if specified
    if (params.category) {
      const categoryLower = params.category.toLowerCase();
      resources = resources.filter(r => 
        r.category?.toLowerCase().includes(categoryLower) ||
        r.subcategory?.toLowerCase().includes(categoryLower) ||
        r.services?.some(s => s.toLowerCase().includes(categoryLower))
      );
    }
    
    // Filter by county if specified
    if (params.county) {
      const countyLower = params.county.toLowerCase();
      resources = resources.filter(r => 
        r.address?.county?.toLowerCase().includes(countyLower)
      );
    }
    
    // Filter by city if specified
    if (params.city) {
      const cityLower = params.city.toLowerCase();
      resources = resources.filter(r => 
        r.address?.city?.toLowerCase().includes(cityLower)
      );
    }
    
    // If no resources found, return mock data for demo
    if (resources.length === 0) {
      resources = getMockResources(params);
    }
    
    return resources.slice(0, 10); // Return top 10
    
  } catch (error) {
    console.error('[AI_SEARCH] Database error:', error);
    // Return mock data if database fails
    return getMockResources(params);
  }
}

/**
 * Generate a helpful AI response based on the resources found
 */
async function generateAIResponse(userQuery: string, resources: Resource[]): Promise<string> {
  const openai = getOpenAIClient();
  
  if (resources.length === 0) {
    return `I couldn't find any resources matching your query: "${userQuery}". 

Please try:
• Being more specific about the type of help you need
• Including a county or city name
• Using different keywords

You can also visit the CHWOne platform at https://chwone.com to browse all available resources.`;
  }
  
  // Format resources for the AI
  const resourceList = resources.map((r, i) => {
    let info = `${i + 1}. **${r.name}**`;
    if (r.category) info += `\n   Category: ${r.category}`;
    if (r.address?.city) info += `\n   Location: ${r.address.city}, ${r.address.state || 'NC'}`;
    if (r.phone) info += `\n   Phone: ${r.phone}`;
    if (r.website) info += `\n   Website: ${r.website}`;
    if (r.description) info += `\n   ${r.description.substring(0, 150)}...`;
    return info;
  }).join('\n\n');
  
  const systemPrompt = `You are a helpful Community Health Worker assistant for CHWOne. 
Your job is to help people find community resources in North Carolina.
Be warm, helpful, and concise. Format your response for WhatsApp (use simple formatting, keep it under 1000 characters).
Always encourage them to call the resource directly for the most up-to-date information.`;

  const userPrompt = `The user asked: "${userQuery}"

Here are the matching resources I found:

${resourceList}

Please provide a helpful, friendly response that summarizes these resources and how they can help. Keep it concise for WhatsApp.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 500
  });
  
  return response.choices[0]?.message?.content || 'I found some resources but had trouble formatting the response. Please try again.';
}

/**
 * Mock resources for demo/testing when database is empty
 */
function getMockResources(params: {
  category?: string;
  county?: string;
  city?: string;
  keywords: string[];
}): Resource[] {
  const county = params.county || 'Wake';
  const category = params.category || 'assistance';
  
  // Return relevant mock resources based on category
  const mockResources: Resource[] = [
    {
      id: 'mock-1',
      name: 'Wake County Housing Authority',
      description: 'Provides rental assistance, public housing, and Section 8 vouchers for low-income families in Wake County.',
      category: 'Housing',
      address: { city: 'Raleigh', state: 'NC', county: 'Wake' },
      phone: '(919) 831-8300',
      website: 'https://www.rhaonline.com',
      services: ['Rental Assistance', 'Public Housing', 'Section 8']
    },
    {
      id: 'mock-2',
      name: 'Food Bank of Central & Eastern NC',
      description: 'Distributes food to partner agencies and provides emergency food assistance to families in need.',
      category: 'Food',
      address: { city: 'Raleigh', state: 'NC', county: 'Wake' },
      phone: '(919) 875-0707',
      website: 'https://foodbankcenc.org',
      services: ['Food Pantry', 'Emergency Food', 'SNAP Assistance']
    },
    {
      id: 'mock-3',
      name: 'Alliance Health',
      description: 'Provides mental health, substance abuse, and intellectual/developmental disability services.',
      category: 'Mental Health',
      address: { city: 'Morrisville', state: 'NC', county: 'Wake' },
      phone: '(800) 510-9132',
      website: 'https://www.alliancehealthplan.org',
      services: ['Mental Health', 'Crisis Services', 'Substance Abuse Treatment']
    },
    {
      id: 'mock-4',
      name: 'Urban Ministries of Wake County',
      description: 'Provides emergency assistance including rent, utilities, food, and clothing to families in crisis.',
      category: 'Emergency Assistance',
      address: { city: 'Raleigh', state: 'NC', county: 'Wake' },
      phone: '(919) 836-2707',
      website: 'https://www.urbanmin.org',
      services: ['Rent Assistance', 'Utility Assistance', 'Food Pantry', 'Clothing']
    },
    {
      id: 'mock-5',
      name: 'NC DHHS - Division of Social Services',
      description: 'State agency providing Medicaid, Food and Nutrition Services, Work First, and other public assistance programs.',
      category: 'Government Services',
      address: { city: 'Raleigh', state: 'NC', county: 'Wake' },
      phone: '(919) 855-4800',
      website: 'https://www.ncdhhs.gov/dss',
      services: ['Medicaid', 'SNAP', 'TANF', 'Child Care Subsidy']
    }
  ];
  
  // Filter based on category if specified
  if (params.category) {
    const catLower = params.category.toLowerCase();
    return mockResources.filter(r => 
      r.category?.toLowerCase().includes(catLower) ||
      r.services?.some(s => s.toLowerCase().includes(catLower)) ||
      r.description?.toLowerCase().includes(catLower)
    ).slice(0, 5);
  }
  
  // Filter by keywords
  if (params.keywords.length > 0) {
    return mockResources.filter(r => {
      const text = `${r.name} ${r.description} ${r.services?.join(' ')}`.toLowerCase();
      return params.keywords.some(k => text.includes(k.toLowerCase()));
    }).slice(0, 5);
  }
  
  return mockResources.slice(0, 3);
}

/**
 * Direct search endpoint for testing (can be called from API route)
 */
export async function testResourceSearch(query: string): Promise<{
  query: string;
  response: string;
  resourcesFound: number;
  searchParams?: {
    category?: string;
    county?: string;
    city?: string;
    keywords?: string[];
  };
  timestamp: string;
}> {
  const result = await searchResourcesWithAI(query);
  return {
    query,
    response: result.response,
    resourcesFound: result.resourcesFound,
    searchParams: result.searchParams,
    timestamp: new Date().toISOString()
  };
}
