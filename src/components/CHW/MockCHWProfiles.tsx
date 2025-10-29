'use client';

import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  Button,
  Avatar,
  CardActions
} from '@mui/material';
import { LocationOn, School, Language, Work } from '@mui/icons-material';
import Link from 'next/link';

// Define the CHW Profile type
export interface MockCHWProfile {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  city: string;
  state: string;
  county: string;
  specializations: string[];
  languages: string[];
  certificationLevel: 'entry' | 'intermediate' | 'advanced';
  bio: string;
}

// Mock data for 20 CHWs in North Carolina
export const mockCHWs: MockCHWProfile[] = [
  {
    id: 'chw-001',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    imageUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    city: 'Charlotte',
    state: 'NC',
    county: 'Mecklenburg',
    specializations: ['Diabetes Management', 'Maternal Health'],
    languages: ['English', 'Spanish'],
    certificationLevel: 'advanced',
    bio: 'Dedicated CHW with extensive experience in diabetes management and maternal health.'
  },
  {
    id: 'chw-002',
    firstName: 'James',
    lastName: 'Wilson',
    imageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    city: 'Raleigh',
    state: 'NC',
    county: 'Wake',
    specializations: ['Mental Health First Aid', 'Chronic Disease Management'],
    languages: ['English'],
    certificationLevel: 'intermediate',
    bio: 'Mental health advocate with focus on chronic disease management and community outreach.'
  },
  {
    id: 'chw-003',
    firstName: 'Sara',
    lastName: 'Chen',
    imageUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    city: 'Durham',
    state: 'NC',
    county: 'Durham',
    specializations: ['Health Education', 'Cultural Competency'],
    languages: ['English', 'Chinese', 'Spanish'],
    certificationLevel: 'entry',
    bio: 'Bilingual CHW specializing in health education and cultural competency training.'
  },
  {
    id: 'chw-004',
    firstName: 'Robert',
    lastName: 'Johnson',
    imageUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    city: 'Greensboro',
    state: 'NC',
    county: 'Guilford',
    specializations: ['Substance Abuse Prevention', 'Youth Outreach'],
    languages: ['English'],
    certificationLevel: 'advanced',
    bio: 'Experienced in substance abuse prevention and youth outreach programs.'
  },
  {
    id: 'chw-005',
    firstName: 'Amina',
    lastName: 'Patel',
    imageUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    city: 'Winston-Salem',
    state: 'NC',
    county: 'Forsyth',
    specializations: ['Cardiovascular Health', 'Nutrition Education'],
    languages: ['English', 'Hindi', 'Gujarati'],
    certificationLevel: 'intermediate',
    bio: 'Specializes in cardiovascular health and nutrition education for diverse communities.'
  },
  {
    id: 'chw-006',
    firstName: 'David',
    lastName: 'Martinez',
    imageUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    city: 'Asheville',
    state: 'NC',
    county: 'Buncombe',
    specializations: ['Rural Health Access', 'Elderly Care'],
    languages: ['English', 'Spanish'],
    certificationLevel: 'advanced',
    bio: 'Focused on improving healthcare access in rural communities and elderly care.'
  },
  {
    id: 'chw-007',
    firstName: 'Tasha',
    lastName: 'Williams',
    imageUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    city: 'Wilmington',
    state: 'NC',
    county: 'New Hanover',
    specializations: ['Maternal and Child Health', 'Breastfeeding Support'],
    languages: ['English'],
    certificationLevel: 'intermediate',
    bio: 'Passionate about supporting new mothers and improving maternal and child health outcomes.'
  },
  {
    id: 'chw-008',
    firstName: 'Michael',
    lastName: 'Kim',
    imageUrl: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg',
    city: 'Cary',
    state: 'NC',
    county: 'Wake',
    specializations: ['Chronic Disease Management', 'Health Technology'],
    languages: ['English', 'Korean'],
    certificationLevel: 'advanced',
    bio: 'Integrates health technology solutions into chronic disease management programs.'
  },
  {
    id: 'chw-009',
    firstName: 'Jasmine',
    lastName: 'Thompson',
    imageUrl: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
    city: 'Fayetteville',
    state: 'NC',
    county: 'Cumberland',
    specializations: ['Military Family Support', 'Mental Health'],
    languages: ['English'],
    certificationLevel: 'intermediate',
    bio: 'Specializes in supporting military families and addressing mental health needs.'
  },
  {
    id: 'chw-010',
    firstName: 'Carlos',
    lastName: 'Gomez',
    imageUrl: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg',
    city: 'Concord',
    state: 'NC',
    county: 'Cabarrus',
    specializations: ['Diabetes Prevention', 'Community Outreach'],
    languages: ['English', 'Spanish'],
    certificationLevel: 'entry',
    bio: 'Dedicated to diabetes prevention through community outreach and education.'
  },
  {
    id: 'chw-011',
    firstName: 'Aisha',
    lastName: 'Jackson',
    imageUrl: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg',
    city: 'Greenville',
    state: 'NC',
    county: 'Pitt',
    specializations: ['Maternal Health', 'Childhood Development'],
    languages: ['English'],
    certificationLevel: 'advanced',
    bio: 'Focuses on maternal health and early childhood development in underserved communities.'
  },
  {
    id: 'chw-012',
    firstName: 'Thomas',
    lastName: 'Nguyen',
    imageUrl: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg',
    city: 'High Point',
    state: 'NC',
    county: 'Guilford',
    specializations: ['Refugee Health Services', 'Cultural Integration'],
    languages: ['English', 'Vietnamese'],
    certificationLevel: 'intermediate',
    bio: 'Specializes in refugee health services and cultural integration programs.'
  },
  {
    id: 'chw-013',
    firstName: 'Sophia',
    lastName: 'Garcia',
    imageUrl: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg',
    city: 'Chapel Hill',
    state: 'NC',
    county: 'Orange',
    specializations: ['Health Education', 'Research Participation'],
    languages: ['English', 'Spanish'],
    certificationLevel: 'advanced',
    bio: 'Bridges the gap between academic research and community health education.'
  },
  {
    id: 'chw-014',
    firstName: 'Marcus',
    lastName: 'Brown',
    imageUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    city: 'Gastonia',
    state: 'NC',
    county: 'Gaston',
    specializations: ['Men\'s Health', 'Chronic Disease Management'],
    languages: ['English'],
    certificationLevel: 'entry',
    bio: 'Advocates for men\'s health awareness and chronic disease management.'
  },
  {
    id: 'chw-015',
    firstName: 'Leila',
    lastName: 'Ahmed',
    imageUrl: 'https://images.pexels.com/photos/1820919/pexels-photo-1820919.jpeg',
    city: 'Huntersville',
    state: 'NC',
    county: 'Mecklenburg',
    specializations: ['Women\'s Health', 'Cultural Competency'],
    languages: ['English', 'Arabic'],
    certificationLevel: 'intermediate',
    bio: 'Focuses on women\'s health issues with cultural sensitivity and competency.'
  },
  {
    id: 'chw-016',
    firstName: 'Daniel',
    lastName: 'Washington',
    imageUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    city: 'Rocky Mount',
    state: 'NC',
    county: 'Nash',
    specializations: ['Rural Health Access', 'Transportation Solutions'],
    languages: ['English'],
    certificationLevel: 'advanced',
    bio: 'Works on improving healthcare access in rural areas through innovative transportation solutions.'
  },
  {
    id: 'chw-017',
    firstName: 'Elena',
    lastName: 'Vasquez',
    imageUrl: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
    city: 'Hickory',
    state: 'NC',
    county: 'Catawba',
    specializations: ['Elderly Care', 'Home Health'],
    languages: ['English', 'Spanish'],
    certificationLevel: 'intermediate',
    bio: 'Specializes in elderly care and home health services for aging populations.'
  },
  {
    id: 'chw-018',
    firstName: 'Jamal',
    lastName: 'Harris',
    imageUrl: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
    city: 'Jacksonville',
    state: 'NC',
    county: 'Onslow',
    specializations: ['Military Health', 'PTSD Support'],
    languages: ['English'],
    certificationLevel: 'advanced',
    bio: 'Former military medic providing specialized support for veterans and PTSD awareness.'
  },
  {
    id: 'chw-019',
    firstName: 'Grace',
    lastName: 'Lee',
    imageUrl: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
    city: 'Apex',
    state: 'NC',
    county: 'Wake',
    specializations: ['Youth Mental Health', 'School Programs'],
    languages: ['English', 'Korean'],
    certificationLevel: 'intermediate',
    bio: 'Develops and implements mental health programs in school settings for youth.'
  },
  {
    id: 'chw-020',
    firstName: 'Andre',
    lastName: 'Robinson',
    imageUrl: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
    city: 'Goldsboro',
    state: 'NC',
    county: 'Wayne',
    specializations: ['Community Nutrition', 'Urban Gardening'],
    languages: ['English'],
    certificationLevel: 'entry',
    bio: 'Combines community nutrition education with urban gardening initiatives.'
  }
];

// Component to display certification level badge
const CertificationBadge = ({ level }: { level: string }) => {
  const getColor = () => {
    switch (level) {
      case 'entry': return '#4caf50';
      case 'intermediate': return '#2196f3';
      case 'advanced': return '#9c27b0';
      default: return '#757575';
    }
  };

  return (
    <Chip 
      label={level.charAt(0).toUpperCase() + level.slice(1)} 
      size="small" 
      sx={{ 
        backgroundColor: getColor(), 
        color: 'white',
        fontWeight: 'bold',
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1
      }} 
    />
  );
};

// CHW Card Component
const CHWCard = ({ chw }: { chw: MockCHWProfile }) => {
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
      }
    }}>
      <CertificationBadge level={chw.certificationLevel} />
      <CardMedia
        component="img"
        height="200"
        image={chw.imageUrl}
        alt={`${chw.firstName} ${chw.lastName}`}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {chw.firstName} {chw.lastName}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn fontSize="small" color="primary" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {chw.city}, {chw.state} ({chw.county} County)
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <Work fontSize="small" sx={{ mr: 0.5 }} /> Specializations:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {chw.specializations.map((spec, index) => (
              <Chip key={index} label={spec} size="small" variant="outlined" color="primary" />
            ))}
          </Box>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <Language fontSize="small" sx={{ mr: 0.5 }} /> Languages:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {chw.languages.map((lang, index) => (
              <Chip key={index} label={lang} size="small" />
            ))}
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {chw.bio}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          color="primary" 
          variant="contained" 
          fullWidth
          component={Link}
          href={`/chw-profile/${chw.id}`}
        >
          View Profile
        </Button>
      </CardActions>
    </Card>
  );
};

// Main component to display the grid of CHW cards
export default function MockCHWProfiles() {
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Community Health Workers
      </Typography>
      <Grid container spacing={3}>
        {mockCHWs.map((chw) => (
          <Grid item key={chw.id} xs={12} sm={6} md={4} lg={3}>
            <CHWCard chw={chw} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
