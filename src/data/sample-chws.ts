/**
 * Sample CHW Profiles
 * Realistic sample data for Community Health Worker profiles
 */

import { CHWProfile } from '@/types/chw-profile.types';

export const SAMPLE_CHWS: CHWProfile[] = [
  {
    id: 'chw-001',
    userId: 'user-001',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    email: 'maria.rodriguez@chwone.org',
    phone: '(910) 555-0101',
    profilePicture: 'https://i.pravatar.cc/150?img=1',
    displayName: 'Maria Rodriguez, CHW',
    professional: {
      headline: 'Bilingual CHW specializing in Maternal & Child Health',
      bio: 'Passionate community health worker with over 8 years of experience serving Latino families in Cumberland County.',
      expertise: ['Maternal & Child Health', 'Health Education', 'Cultural Mediation', 'Home Visits'],
      languages: ['English', 'Spanish'],
      availableForOpportunities: true,
      yearsOfExperience: 8,
      specializations: ['Maternal Health', 'Prenatal Care', 'Postpartum Support']
    },
    serviceArea: {
      countiesWorkedIn: ['Cumberland', 'Hoke', 'Robeson'],
      countyResideIn: 'Cumberland',
      region: 'Region 5',
      currentOrganization: 'Cumberland County Health Department',
      role: 'Senior Community Health Worker'
    },
    certification: {
      certificationNumber: 'NC-CHW-2019-1234',
      certificationStatus: 'certified',
      certificationExpiration: '2026-06-30',
      scctCompletion: true,
      scctCompletionDate: '2019-05-15'
    },
    membership: {
      memberNumber: 'CHWANC-001234',
      dateRegistered: '2019-01-15',
      includeInDirectory: true
    },
    contactPreferences: {
      allowDirectMessages: true,
      showEmail: true,
      showPhone: true,
      showAddress: false
    },
    toolAccess: {
      forms: true,
      datasets: true,
      reports: true,
      aiAssistant: true,
      grants: true,
      referrals: true,
      projects: true
    }
  },
  {
    id: 'chw-002',
    userId: 'user-002',
    firstName: 'James',
    lastName: 'Washington',
    email: 'james.washington@chwone.org',
    phone: '(910) 555-0102',
    profilePicture: 'https://i.pravatar.cc/150?img=12',
    displayName: 'James Washington, CHW',
    professional: {
      headline: 'Chronic Disease Management Specialist',
      bio: 'Experienced CHW focused on diabetes and hypertension management in underserved communities.',
      expertise: ['Chronic Disease Management', 'Health Navigation', 'Patient Advocacy', 'Health Screening'],
      languages: ['English'],
      availableForOpportunities: true,
      yearsOfExperience: 6,
      specializations: ['Diabetes Management', 'Hypertension', 'Cardiovascular Health']
    },
    serviceArea: {
      countiesWorkedIn: ['Robeson', 'Scotland', 'Bladen'],
      countyResideIn: 'Robeson',
      region: 'Region 5',
      currentOrganization: 'Robeson Health Care Corporation',
      role: 'Community Health Worker'
    },
    certification: {
      certificationNumber: 'NC-CHW-2020-5678',
      certificationStatus: 'certified',
      certificationExpiration: '2027-03-31',
      scctCompletion: true,
      scctCompletionDate: '2020-02-20'
    },
    membership: {
      memberNumber: 'CHWANC-002345',
      dateRegistered: '2020-02-01',
      includeInDirectory: true
    },
    contactPreferences: {
      allowDirectMessages: true,
      showEmail: true,
      showPhone: false,
      showAddress: false
    },
    toolAccess: {
      forms: true,
      datasets: true,
      reports: true,
      aiAssistant: true,
      grants: false,
      referrals: true,
      projects: true
    }
  },
  {
    id: 'chw-003',
    userId: 'user-003',
    firstName: 'Anh',
    lastName: 'Nguyen',
    email: 'anh.nguyen@chwone.org',
    phone: '(910) 555-0103',
    profilePicture: 'https://i.pravatar.cc/150?img=5',
    displayName: 'Anh Nguyen, CHW',
    professional: {
      headline: 'Multilingual Health Navigator & Mental Health Advocate',
      bio: 'Dedicated to serving Asian American and immigrant communities with culturally sensitive health navigation.',
      expertise: ['Mental Health', 'Health Navigation', 'Cultural Mediation', 'Community Outreach'],
      languages: ['English', 'Vietnamese'],
      availableForOpportunities: false,
      yearsOfExperience: 4,
      specializations: ['Mental Health Support', 'Immigrant Health', 'Cultural Competency']
    },
    serviceArea: {
      countiesWorkedIn: ['New Hanover', 'Pender', 'Brunswick'],
      countyResideIn: 'New Hanover',
      region: 'Region 5',
      currentOrganization: 'Coastal Horizons Center',
      role: 'Behavioral Health CHW'
    },
    certification: {
      certificationNumber: 'NC-CHW-2021-9012',
      certificationStatus: 'certified',
      certificationExpiration: '2028-01-31',
      scctCompletion: true,
      scctCompletionDate: '2021-01-10'
    },
    membership: {
      memberNumber: 'CHWANC-003456',
      dateRegistered: '2021-01-01',
      includeInDirectory: true
    },
    contactPreferences: {
      allowDirectMessages: true,
      showEmail: true,
      showPhone: true,
      showAddress: false
    },
    toolAccess: {
      forms: true,
      datasets: true,
      reports: true,
      aiAssistant: true,
      grants: true,
      referrals: true,
      projects: true
    }
  }
];

export function getCHWById(id: string): CHWProfile | undefined {
  return SAMPLE_CHWS.find(chw => chw.id === id);
}
