'use client';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Fab,
  Tabs,
  Tab,
  Link,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { Referral, ReferralResource, Client, ReferralStatus, ReferralUrgency, ResourceCategory } from '@/types/platform.types';

// Organization interface for the Organizations tab
interface Organization {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  category: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  lastUpdated?: string;
  description: string;
}

// Organizations data
const organizationsData: Organization[] = [
  {
    id: '1',
    name: 'Sandhills Children Center, Inc.',
    address: '1280 Central Drive',
    city: 'Southern Pines',
    state: 'North Carolina',
    zipCode: '28387',
    county: 'Moore',
    category: 'Children\'s Services',
    contactName: 'Erin Newcome',
    email: 'enewcomb@sandhillschildrenscenter.org',
    website: 'https://www.sandhillschildrenscenter.org/',
    lastUpdated: '10-15-25',
    description: 'Non-profit day school for children ages 0-5 with or without special development needs. Provides: educational, health care, therapeutic services, physical disabilities and more/transportation is provided for all children with disabilities'
  },
  {
    id: '2',
    name: 'Project Linus',
    address: 'Southern Pines NC 28387',
    city: 'Southern Pines',
    state: 'North Carolina',
    zipCode: '28387',
    county: 'Moore',
    category: 'Children\'s Services',
    contactName: 'Pat Weber',
    website: 'https://www.southernpines.net/',
    lastUpdated: '10-15-25',
    description: 'Contact the Moore County Salvation Army. Donates hand-made blankets and quilts to children who are seriously ill, traumatized or have special needs/Salvation Army is the contact point'
  },
  {
    id: '3',
    name: 'Odum Home',
    address: '676 Hight Road',
    city: 'Aberdeen',
    state: 'North Carolina',
    zipCode: '28315',
    county: 'Robeson',
    category: 'Children\'s Services',
    contactName: 'Kathy Locklear',
    website: 'www.odumhome.org',
    description: 'School age children are given the opportunity to overcome personal & family problems while the staff works to preserve or reunite families'
  },
  {
    id: '4',
    name: 'Care Coordination for Children (CC4C) Moore Co Health Dept',
    address: '705 Pinehurst Ave.',
    city: 'Carthage',
    state: 'North Carolina',
    zipCode: '28327',
    county: 'Moore',
    category: 'Children\'s Services',
    description: 'Free service: Birth-5 years old to ensure children are raised in a healthy/safe environment/can help find medical care/transportation/childcare and or financial aide'
  },
  {
    id: '5',
    name: 'Partnership for Children',
    address: '351 Wagoner Drive',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28303',
    county: 'Cumberland',
    category: 'Children\'s Services',
    contactName: 'Receptionist',
    phone: '(910) 867-9700',
    website: 'ccpfc.org',
    description: 'Provide resources, support and Program that improve families'
  },
  {
    id: '6',
    name: 'The Baby Store - MUST BE A WIC RECIPIENT TO ATTEND THE BABY STORE',
    address: '1235 Ramsey St.',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28301',
    county: 'Cumberland',
    category: 'Children\'s Services',
    contactName: 'Receptionist',
    phone: '910-433-3600',
    description: 'Provide baby clothing, Public Health Department 2nd Floor Ramsey Street'
  },
  {
    id: '7',
    name: 'Foster Parent Mentor Program',
    address: '530 Carthage Street Sanford NC 27330',
    city: 'Sanford',
    state: 'North Carolina',
    zipCode: '27330',
    county: 'Lee',
    category: 'Children\'s Services',
    contactName: 'Amber Chakeris',
    description: 'June 21, 7-7:45 pm Zoom RSVP for Zoom Login. Learn to be Mentor for Foster Children/If you can not open your home to be a Foster Parent you can become a Mentor up to age 21'
  },
  {
    id: '8',
    name: 'Headstart (Action Pathways) 2130 extension',
    address: '5135 Morganton Rd. Fayetteville NC 28314',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28314',
    county: 'Cumberland/Sampson',
    category: 'Children\'s Services',
    contactName: 'Robin Harris',
    phone: 'Cumberland:(910) 223-0116 Aspire:(910) 249-4805',
    email: 'robin.harris@actionpathways.ngo',
    website: 'https://actionpathways.ngo/',
    description: 'Action Pathways has 4 programs. Prepare children with essential skills needed to enter public school/free to eligible participants'
  },
  {
    id: '9',
    name: 'The Arc of Moore County',
    address: '673 S. Bennett St. Southern Pines NC 28388',
    city: 'Southern Pines',
    state: 'North Carolina',
    zipCode: '28388',
    county: 'Moore',
    category: 'Disability Programs',
    contactName: 'Intake Specialist',
    description: 'Provides respite care and quality care for the individual with a disability while giving family members short-term relief, they also will come to a home on an hourly basis are as needed to provide care in the home. NC 211 is an informative and referral service provided by United Way of NC'
  },
  {
    id: '10',
    name: 'Monarch Creative Arts & Community Center',
    address: '1662 Richards Street, Southern Pines 28387',
    city: 'Southern Pines',
    state: 'North Carolina',
    zipCode: '28387',
    county: 'Moore',
    category: 'Disability Programs',
    contactName: 'Intake Specialist',
    email: 'referral@monarchnc.org',
    website: 'havenlee.org',
    description: 'A day program in Southern Pines supporting adults with intellectual & developmental disabilities in the Sandhills Region of NC'
  },
  {
    id: '11',
    name: 'Property Tax Relief for Homeowners/DRNC',
    address: '3724 National Dr. Raleigh NC 27612',
    city: 'Raleigh',
    state: 'North Carolina',
    zipCode: '27612',
    county: 'Wake',
    category: 'Disability Programs',
    contactName: 'Anyone who answers the phone',
    email: 'curtis.hill@disabilityrightsnc.org',
    description: 'All services must be by appointments only. Called no answer 2-21-23. Provide tax relief for homeowners under the Homestead Property Tax Exemption Must be 65 years or older/contact your local tax department'
  },
  {
    id: '12',
    name: 'SAFE of Harnett County',
    address: 'Downtown',
    city: 'Lillington',
    state: 'North Carolina',
    zipCode: '28311',
    county: 'Harnett',
    category: 'Domestic Violence Advocacy',
    contactName: 'Call Taker',
    website: 'https://www.safeofhc.org/',
    lastUpdated: '10-21-24',
    description: 'Provides safety and advocacy for victims of domestic violence and sexual assault'
  },
  {
    id: '13',
    name: 'Manna Dream Center',
    address: '511 Cliffdale Ave.',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28304',
    county: 'Cumberland',
    category: 'Domestic Violence Advocacy',
    contactName: 'Anyone who answers the phone',
    phone: '910-568-3897',
    website: 'https://mannadreamcenter.org/',
    lastUpdated: '10-25-24',
    description: 'All services must be by appointments only. Provide: Showers-T&Thu 10-5 Wade Ave/Washer &Dryers M-Th 10-5 Ray Ave/Food Pantry-M-F once a month/Serve Food M-F 12-1 @ 913 Person St/Kings closet 12-1 T-Th/AA on Ray Ave T& Thur @ 7pm. They serve the homeless, hunger, addictions and the lack of education. Must call to make an appointment to receive any of the above services.'
  },
  {
    id: '14',
    name: 'Floyd L. Knight School - The Children\'s Center/Lee Co. School System',
    address: '607 McIntosh Street',
    city: 'Sanford',
    state: 'North Carolina',
    zipCode: '27330',
    county: 'Lee',
    category: 'Education',
    email: 'kdiesfeld.flk@lee.k12.nc.us',
    lastUpdated: '3-21-25',
    description: 'Only service Lee Co. resident/Referrals from doctors/parents. Separate Day school free for children with special needs. Mon-Fri 7:30am-5:30pm'
  },
  {
    id: '15',
    name: '*Moore Building Futures (NC Works Career Center)',
    address: '245 Shepard Trail',
    city: 'Aberdeen',
    state: 'North Carolina',
    zipCode: '28315',
    county: 'Moore',
    category: 'Education',
    contactName: 'Career Advisor',
    phone: '(910) 944-7697',
    website: 'https://members.moorecountychamber.com/list/member/moore-county-ncworks-career-center-aberdeen-13570',
    lastUpdated: '10-25-24',
    description: 'Provide free education to at risk youth ages (16-24) and employment services/help with job interviews, how to do a resume/and they also have programs for people over 50'
  },
  {
    id: '16',
    name: 'CCSCEP Workforce Development Center',
    address: '410 Ray Avenue',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28301',
    county: 'Cumberland',
    category: 'Education',
    contactName: 'Ann Johnson',
    email: 'annjohnson@cumberland.nc.us',
    lastUpdated: '10-25-24',
    description: 'Provide employment training for workers 55 and over'
  },
  {
    id: '17',
    name: 'FNS E&T Food & Nutrition Services Employment & Training',
    address: 'Moore County Social Services and NC Works',
    city: '',
    state: 'North Carolina',
    zipCode: '',
    county: 'Moore',
    category: 'Education',
    contactName: 'Maria Campbell-Director',
    email: 'campbellm@sandhills.edu',
    lastUpdated: '10-25-24',
    description: 'Must be a Moore County resident currently receiving food service assistance and ready to start or restart your career'
  },
  {
    id: '18',
    name: 'Nurturing Career Growth Center',
    address: '103 Blue Hall Sandhills Community College',
    city: '',
    state: 'North Carolina',
    zipCode: '',
    county: 'Moore',
    category: 'Education',
    contactName: 'Gwendolyn Fant Russell',
    email: 'russellg@sandhills.edu',
    description: 'Help with: Career Assessments, Letter Writing, Mock Interviews, Resume Writing, Career Fairs, Employer Meet-Ups and they help you to discover where you want your education to take you'
  },
  {
    id: '19',
    name: '* Pre-ETS/Pre-Employment Transition Services',
    address: '245 Shepard Trail',
    city: 'Aberdeen',
    state: 'North Carolina',
    zipCode: '28315',
    county: 'Moore',
    category: 'Education',
    contactName: 'Jerry McQueen/Director',
    email: 'jerrymcqueen@rccsc393.0rg',
    description: 'Provide services for students with disabilities age 14-21 information about employment or training after high school who may or may not be eligible for traditional VR services'
  },
  {
    id: '20',
    name: '* Workforce Innovation & Opportunity Act (WIOA)',
    address: '245 Shepard Trail',
    city: 'Aberdeen',
    state: 'North Carolina',
    zipCode: '28315',
    county: 'Moore',
    category: 'Education',
    contactName: 'Jerry McQueen/Director',
    email: 'jerrymcqueen@rccsc393.0rg',
    description: 'This programs covers all ages: Adults-unemployed and upgrade their current skills/Dislocated Worker assist to receive unemployment/Youth provides funds to deliver a array of youth development services and a lot more'
  },
  {
    id: '21',
    name: 'Aspire (Action Pathways)',
    address: '5135 Morganton Rd.',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28314',
    county: 'Cumberland/Sampson',
    category: 'Education',
    contactName: 'Wendy Bethea',
    phone: '(910) 485-6131',
    website: 'https://actionpathways.ngo/our-programs/aspire/',
    description: 'Assist low wealth or under resourced individuals in obtaining skills/knowledge to become self-sufficient, they offer financial budgeting, employment training, transportation & nutrition assistance, affordable housing and more'
  },
  {
    id: '22',
    name: 'Operation Hope',
    address: '4841 Ramsey St., Fayetteville NC inside First Horizon',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28311',
    county: 'Cumberland',
    category: 'Financial Services',
    contactName: 'Tabathia Dorsey',
    email: 'tabathiadorsey@operationhope.org',
    phone: '9197764359',
    description: 'Credit and money management, homeownership, small business development, financial disaster recovery employee financial wellness and more.'
  },
  {
    id: '23',
    name: 'Prancing Horse, Inc.',
    address: 'PO Box 327',
    city: 'Southern Pines',
    state: 'North Carolina',
    zipCode: '28388',
    county: 'Moore',
    category: 'Health Programs',
    contactName: 'Claire Sullivan',
    email: 'programs@prancing-horse.org',
    phone: '910-281-3223',
    description: 'Provide help for people with special needs improve speech, balance, muscle tone, motor skills & self esteem/individual lesson plan developed to meet the students need'
  },
  {
    id: '24',
    name: 'Life Care Pregnancy Center',
    address: '400 Saunders St.',
    city: 'Carthage',
    state: 'North Carolina',
    zipCode: '28327',
    county: 'Moore',
    category: 'Health Programs',
    contactName: 'Jessica Stevens',
    phone: '910-812-4798',
    email: 'clientservices@lifecarepregnancy.com',
    description: 'Provide pregnancy tests, options counseling, Teens as Parents Support, material assistance ie.(diapers, clothing, etc), and they offer the Bright Course Education'
  },
  {
    id: '25',
    name: 'Alliance Health',
    address: '711 Executive Place',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28305',
    county: 'Cumberland',
    category: 'Health Programs',
    contactName: 'Call Center',
    website: 'alliancehealthplan.org',
    description: 'Provides treatment & support for mental health illness, substance use disorders and intellectual/development disabilities/have adult programs, programs for men, programs for women and young adult programs.'
  },
  {
    id: '26',
    name: 'Anderson Creek Dental Clinic',
    address: '',
    city: '',
    state: 'North Carolina',
    zipCode: '',
    county: '',
    category: 'Health Programs',
    contactName: 'Office',
    phone: '910 436-3194',
    website: 'https://www.freeclinics.com/det/nc_Anderson_Creek_Dental',
    lastUpdated: '11-8-24',
    description: 'See First Choice Community Health Ctr. Dental services with fees based on household size and income'
  },
  {
    id: '27',
    name: 'Carolina Outreach',
    address: '324 Person St.',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28301',
    county: 'Cumberland',
    category: 'Health Programs',
    contactName: 'Tanisha James',
    phone: '910-438-0939',
    website: 'carolinaoutreach.com',
    description: 'Provide mental health services for: children & adolescent, adult services, substance use services, behavioral health urgent care and much more'
  },
  {
    id: '28',
    name: 'Sandhill Manor Apts.',
    address: '801 Harkey Rd, Sanford, NC',
    city: 'Sanford',
    state: 'North Carolina',
    zipCode: '27330',
    county: 'Lee',
    category: 'Housing & Housing Repairs',
    contactName: 'Office hours: Tues/Thurs 8:30am-5:30pm',
    description: 'Affordable apt. community for those age 55 and over/Office hours are Tuesday/Thursday'
  },
  {
    id: '29',
    name: 'Manna Dream Center for Men (Shelter for Men)',
    address: '913 Person St. Fayetteville NC 28314',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28314',
    county: 'Cumberland',
    category: 'Housing & Housing Repairs',
    contactName: 'Ed Robillard/Director',
    lastUpdated: '3-20-25',
    description: 'Mens shelter: they provide food M-F/showers & laundry/mental health resources and more. Intake time for shelter is 6-7:30 pm nightly'
  },
  {
    id: '30',
    name: 'Exodus Realty/Health & (Life Insurance/Alton Vann)',
    address: '115 Hillcrest Drive, NC 27330',
    city: 'Sanford',
    state: 'North Carolina',
    zipCode: '27330',
    county: 'Lee',
    category: 'Housing & Housing Repairs',
    contactName: 'Gary/Management',
    description: 'Reference/Criminal Background ck, job for 1 year'
  },
  {
    id: '31',
    name: 'Dunn Housing Authority',
    address: '817 Stewart St. Dunn, NC 28334',
    city: 'Dunn',
    state: 'North Carolina',
    zipCode: '28334',
    county: 'Harnett',
    category: 'Housing & Housing Repairs',
    contactName: 'Felicia Lisa Chester',
    phone: '(910) 892-5076',
    lastUpdated: '3-21-25',
    description: 'Provide decent, safe and affordable housing for seniors/disabled and families (8-5 Monday - Thursday Friday 8-1)'
  },
  {
    id: '32',
    name: 'Harnett County Housing Authority',
    address: '103 E. Ivey St. Lillington, NC 27546',
    city: 'Lillington',
    state: 'North Carolina',
    zipCode: '27546',
    county: 'Harnett',
    category: 'Housing & Housing Repairs',
    contactName: 'J. Hairr',
    lastUpdated: '3-21-25',
    description: 'Provides affordable housing to seniors/disabled and families'
  },
  {
    id: '33',
    name: 'Family Promise of Lee County',
    address: '2302 Woodland Ave. Sanford, NC 27330',
    city: '',
    state: 'North Carolina',
    zipCode: '27330',
    county: 'Lee',
    category: 'Housing & Housing Repairs',
    contactName: 'Sybil Smith/Case Manager',
    phone: '(919) 718-1540',
    lastUpdated: '11-22-24',
    description: 'Provide assistance to homeless families in Lee County/help with Employment/Life Skills/Budgeting/School Transportation/ and Welcome Home Furnishings'
  },
  {
    id: '34',
    name: 'Coalition for Human Care',
    address: '1500 W. Indiana Ave. Southern Pines NC 28337',
    city: 'Southern Pines',
    state: 'North Carolina',
    zipCode: '28337',
    county: 'Moore',
    category: 'Housing & Housing Repairs',
    contactName: 'Steve Phillips/Director',
    phone: '(910) 693-1600',
    website: 'https://sandhillscoalition.org/',
    description: 'Provide rental assistance, financial assistance twice a year, dental, eyeglasses, food, clothing, senior boxes and fresh produce/must be Moore Co. resident'
  },
  {
    id: '35',
    name: 'Sandhills Community Action-Section 8 Rental Assistance',
    address: '340 Commerce Ave. Southern Pines NC 28337',
    city: 'Southern Pines',
    state: 'North Carolina',
    zipCode: '28337',
    county: 'Moore',
    category: 'Housing & Housing Repairs',
    contactName: 'Etta Townsend',
    description: 'Provided rental assistance for Moore County Residents'
  },
  {
    id: '36',
    name: 'Monarch - Connecticut Avenue Home',
    address: '355 W. Connecticut Ave. Southern Pines NC 28387',
    city: 'Southern Pines',
    state: 'North Carolina',
    zipCode: '28387',
    county: 'Moore',
    category: 'Housing & Housing Repairs',
    phone: '910-692-2104',
    lastUpdated: '11-27-24',
    description: 'Supervised home for adults with intellectual & developmental disabilities'
  },
  {
    id: '37',
    name: 'Monarch - Harnett County Behavioral Health Services',
    address: '89 N Willow St. Angier, NC 27501',
    city: 'Angier',
    state: 'North Carolina',
    zipCode: '27501',
    county: 'Harnett',
    category: 'Housing & Housing Repairs',
    lastUpdated: '3-25-25',
    description: 'Supervised living for people with mental illness'
  },
  {
    id: '38',
    name: 'Monarch - Oak Drive Home',
    address: '185 Oak Drive, Southern Pines, NC 28387',
    city: 'Southern Pines',
    state: 'North Carolina',
    zipCode: '28387',
    county: 'Moore',
    category: 'Housing & Housing Repairs',
    lastUpdated: '11-27-24',
    description: 'Supervised homes for adults with intellectual & developmental disabilities'
  },
  {
    id: '39',
    name: 'Monarch - Pennsylvania Avenue Home',
    address: '340 E. Pennsylvania Ave., Southern Pines 28387',
    city: 'Southern Pines',
    state: 'North Carolina',
    zipCode: '28387',
    county: 'Moore',
    category: 'Housing & Housing Repairs',
    lastUpdated: '11-27-24',
    description: 'Supervised home for adults with intellectual & developmental disabilities'
  },
  {
    id: '40',
    name: 'Monarch - Seawell Street Home',
    address: '108 E.Seawell St., Sanford, NC 27332',
    city: 'Sanford',
    state: 'North Carolina',
    zipCode: '27332',
    county: 'Lee',
    category: 'Housing & Housing Repairs',
    phone: '(919) 718-0269',
    website: 'https://monarchnc.org/service-locations/lee/',
    lastUpdated: '11-27-24',
    description: 'Supervised home for adults with mental illness'
  },
  {
    id: '41',
    name: 'HUD/FHA',
    address: 'Federal Program',
    city: '',
    state: 'North Carolina',
    zipCode: '',
    county: 'All Counties',
    category: 'Housing & Housing Repairs',
    contactName: 'Larry/or Representative',
    description: 'Provide housing repairs and assistance/Several other programs-FHA 203(h)/FHA 203(k)/FHA Title 1 Property Improvement Loan'
  },
  {
    id: '42',
    name: 'USDA/Greensboro HUD',
    address: 'Greensboro NC 27214',
    city: 'Greensboro',
    state: 'North Carolina',
    zipCode: '27214',
    county: 'All Counties',
    category: 'Housing & Housing Repairs',
    contactName: 'Matthew King',
    description: 'Provides information on housing loans, repairs and others thru HUD/FHA/Note: due to covid must leave voice message'
  },
  {
    id: '43',
    name: 'Kingdom Community Development Corporation',
    address: '308 Green Street, Suite 202 Fayetteville NC28301',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28301',
    county: 'Cumberland',
    category: 'Housing & Housing Repairs',
    description: 'Builds affordable housing for low to mid-income families. Provided credit counseling.'
  },
  {
    id: '44',
    name: 'LawHelpNC.org',
    address: 'PO Box 21508 Winston Salem NC 27120',
    city: 'Winston Salem',
    state: 'North Carolina',
    zipCode: '27120',
    county: 'All NC Counties',
    category: 'Legal Aid',
    contactName: 'Kim Bark Mullikin',
    phone: '919-657-1559',
    website: 'www.lawhelpnc.org',
    lastUpdated: '11-27-24',
    description: 'Provide services for: Family&Juvenile, Housing, Veterans&Military, Health Disability, Immigration, Farm Workers and so much more'
  },
  {
    id: '45',
    name: 'Legal Aid/Disability Attorney',
    address: 'PO Box 21508 Winston Salem NC 27120',
    city: 'Winston Salem',
    state: 'North Carolina',
    zipCode: '27120',
    county: 'All NC Counties',
    category: 'Legal Aid',
    contactName: 'Michael Shay',
    email: 'mshaylaw@outlook.com',
    phone: '(866) 219-5262',
    description: 'Provides legal aide for Disability, SSI Benefits, Workers Comp., and many more, initial consultation is free of charge.'
  },
  {
    id: '46',
    name: 'Dunn Medical Services',
    address: '803 Tilghman Dr Dunn, NC 28334',
    city: 'Dunn',
    state: 'North Carolina',
    zipCode: '28334',
    county: 'Harnett',
    category: 'Medical & Dental',
    contactName: 'Receptionist',
    email: 'contactus@harnetthealth.org',
    description: 'Provide quality care through all stages of life'
  },
  {
    id: '47',
    name: 'Lillington Rehabilitation',
    address: '55 Bain St #10 Lillington, NC 27546',
    city: 'Lillington',
    state: 'North Carolina',
    zipCode: '27546',
    county: 'Harnett',
    category: 'Medical & Dental',
    contactName: 'Receptionist',
    email: 'contactus@harnetthealth.org',
    description: 'Provide quality physical therapy and health rehabilitation'
  },
  {
    id: '48',
    name: 'Better Health of Cumberland County',
    address: '1422 Bragg Blvd. Fayetteville, NC 28301',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28301',
    county: 'Cumberland',
    category: 'Medical & Dental',
    contactName: 'Vicky Diaz',
    phone: '(910) 483-7534',
    website: 'www.betterhealthcc.org',
    description: 'Provide emergency Medical assistance as long as the client does not have insurance or: dental, vision, diabetic management, prescription drugs and gas money for out of town medical appts.'
  },
  {
    id: '49',
    name: 'Vision Resource Center (VRC)',
    address: '2736 Cedar Creek Rd. Fayetteville NC 28312',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28312',
    county: 'Cumberland',
    category: 'Medical & Dental',
    contactName: 'Patty Nusbaum',
    email: 'pattynusbaum@yahoo.com',
    phone: '(910) 483-2719',
    website: 'www.visionresourcentercc.org',
    description: 'Provide education & social programs for blind & visually blind adults & children/M-Thur 8-5/also help with living skills/health & wellness/exercise and they are advocates for the blind'
  },
  {
    id: '50',
    name: 'El Futuro Mental Health Clinic',
    address: '2020 Chapel Hill Rd Suite 23 Durham NC 27707',
    city: 'Durham',
    state: 'North Carolina',
    zipCode: '27707',
    county: 'Durham',
    category: 'Medical & Dental',
    contactName: 'Receptionist',
    phone: '(919) 688-7101',
    website: 'https://elfuturo-nc.org',
    description: 'Must call no walk ins. Comprehensive mental health/bilingual in Spanish & English/DWI assessment treatment/substance abuse evaluation/therapy for individual/group and family. Mon-Thur 9 am- 12 pm'
  },
  {
    id: '51',
    name: 'Steadman Family Dental/Wake Family Medical Center',
    address: '6540 Clinton Rd. Stedman NC 28391',
    city: 'Stedman',
    state: 'North Carolina',
    zipCode: '28391',
    county: 'Cumb/surr. counties',
    category: 'Medical & Dental',
    contactName: 'Receptionist',
    email: 'info@swhs-nc.org',
    phone: '(910) 483-3150',
    description: 'Have several dental clinics call for hours of operation. Not-for-profit community health center serving Cumberland and surrounding counties/sliding fees available/promotes voters registration for all patients with online registration/call for hours of operation'
  },
  {
    id: '52',
    name: 'Wade Family Clinic',
    address: '7118 Main St. Wade, NC 28395',
    city: 'Wade',
    state: 'North Carolina',
    zipCode: '28395',
    county: 'Cumb/surr. counties',
    category: 'Medical & Dental',
    contactName: 'Michelle Patten',
    email: 'info@swhs-nc.org',
    phone: '(910) 483-6694 ext. 7030',
    description: 'They also have a office in the Wade Health Dept. Provide medical services for insured and uninsured/sliding scale fees/can be referred to another agency if needed'
  },
  {
    id: '53',
    name: 'Cumberland Health Net',
    address: '225 Green St. Fay, NC 28301',
    city: 'Fayetteville',
    state: 'North Carolina',
    zipCode: '28301',
    county: 'Cum/Har/Moore',
    category: 'Medical & Dental',
    contactName: 'Tameko Clark',
    phone: '(910) 483-6869',
    website: 'https://chnnc.org/',
    description: 'For uninsured clients, they provide Health & Wellness Info/Self-care/Housing & Homeless/Medical Care Assistance. They serve Cumberland and surrounding counties and ACT Enrollment.'
  },
  {
    id: '54',
    name: 'USDA Rural Development',
    address: '',
    city: '',
    state: 'North Carolina',
    zipCode: '',
    county: 'Harn/Lee/Johnston',
    category: 'Multiple Services',
    contactName: 'Martha Williams',
    email: 'Martha.Williams@usda.gov',
    description: 'Provides a small housing loan to repair: roofing, windows, doors, floor repairs and more. This process takes 6 to 9 months.'
  },
  {
    id: '55',
    name: 'United Way of Lee County',
    address: '507 N Steele St. Sanford, NC 27330',
    city: 'Sanford',
    state: 'North Carolina',
    zipCode: '27330',
    county: 'Lee',
    category: 'Multiple Services',
    contactName: 'Kendra Martin',
    phone: '(919) 776-5823',
    website: 'https://www.leecountyunitedway.org/',
    description: 'They partnership with all agencies in the community with a focus on education, income and health issues including the 211 referral program'
  },
  {
    id: '56',
    name: 'Harnett County Department of Aging',
    address: '',
    city: '',
    state: 'North Carolina',
    zipCode: '',
    county: 'Harnett',
    category: 'Senior Services',
    contactName: 'LeeAnn Blackmon Marcy Wood Director Mary Jane Saws',
    email: 'lblackmon@harnett.org; mwood@harnett.org',
    description: 'Offers support for grandparents raising grandchildren/great grandchildren. Eligibility requires you to be 55 or older raising grandchildren/great grandchildren from birth to 18 years old'
  },
  {
    id: '57',
    name: 'North American Senior Benefits',
    address: 'Will come to you',
    city: '',
    state: 'North Carolina',
    zipCode: '',
    county: 'Harnett/Lee',
    category: 'Senior Services',
    contactName: 'Andrew Robinson',
    email: 'arnclife@gmail.com',
    description: 'Provides Insurance benefits for Seniors/will look over your current policy to ensure it is the right fit/can offer other policies if needed'
  },
  {
    id: '58',
    name: 'Harnett Area Rural Transit System (HARTS)',
    address: '250 Alexander Drive, Lillington NC 27546',
    city: 'Lillington',
    state: 'North Carolina',
    zipCode: '27546',
    county: 'Harnett',
    category: 'Transportation',
    contactName: 'Larry Smith',
    email: 'lsmith@harnett.org',
    description: 'Provides transport to various destinations. Service is provided curb-to-curb. Services provided are medical, personal, human service, employment and education. Pay as you go service. Available to all Harnett County residents. For using Medicaid call Department of Social Service for scheduling. Operating hours: M-F 4am - 6pm and scheduling hours: 8am-3pm M-F.'
  },
  {
    id: '59',
    name: 'Moore County Transportation',
    address: '1048 Carriage Oaks Dr. Carthage NC 28387',
    city: 'Carthage',
    state: 'North Carolina',
    zipCode: '28387',
    county: 'Moore',
    category: 'Transportation',
    contactName: 'Debra Ensminger',
    email: 'densminger@moorecounty.nc.gov',
    description: 'Provides transportation/Token Program-$4 each way/A Pines Line-fixed route for Southern Pines/Aberdeen $2, they also provide out of county transportation go to website to see schedule'
  },
  {
    id: '60',
    name: 'M&M Consulting Services, Inc.',
    address: '',
    city: '',
    state: 'North Carolina',
    zipCode: '',
    county: 'Harnett/Lee/Moore & Cumberland',
    category: 'Transportation',
    contactName: 'Markita McCrimmon',
    email: 'mmconsulting65@gmail.com',
    description: 'Contact by phone or email. Provides rides to Primary Care Appointments, Physical Therapy, Lab Centers, Pharmacies and more.'
  },
  {
    id: '61',
    name: 'Salvation Army-Smithfield',
    address: '',
    city: '',
    state: 'North Carolina',
    zipCode: '',
    county: 'Harnett',
    category: 'Utilities',
    description: 'Contact local Salvation Army for utility assistance'
  },
  {
    id: '62',
    name: 'Salvation Army',
    address: '',
    city: '',
    state: 'North Carolina',
    zipCode: '',
    county: 'Moore',
    category: 'Utilities',
    description: 'Contact local Salvation Army for utility assistance'
  }
];

export default function ReferralManagement() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [resources, setResources] = useState<ReferralResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [orgCategoryFilter, setOrgCategoryFilter] = useState('All');
  const [formData, setFormData] = useState({
    clientId: '',
    resourceId: '',
    urgency: ReferralUrgency.MEDIUM,
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock data for demonstration
      setReferrals([
        {
          id: '1',
          clientId: 'client-1',
          resourceId: 'resource-1',
          chwId: 'chw-1',
          status: ReferralStatus.PENDING,
          urgency: ReferralUrgency.HIGH,
          reason: 'Medical consultation needed',
          notes: 'Client requires urgent cardiology consultation',
          followUpDate: new Date('2024-02-15'),
          outcomeNotes: '',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          completedAt: undefined
        },
        {
          id: '2',
          clientId: 'client-2',
          resourceId: 'resource-2',
          chwId: 'chw-2',
          status: ReferralStatus.COMPLETED,
          urgency: ReferralUrgency.MEDIUM,
          reason: 'Food assistance',
          notes: 'Family of 4 needs emergency food support',
          followUpDate: new Date('2024-02-10'),
          outcomeNotes: 'Successfully connected with local food bank',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-05'),
          completedAt: new Date('2024-02-05')
        }
      ]);

      setClients([
        {
          id: 'client-1',
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: new Date('1980-01-01'),
          assignedCHW: 'chw-1',
          consentGiven: true,
          consentDate: new Date('2024-01-01'),
          isActive: true,
          address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'NC',
            zipCode: '12345',
            county: 'AnyCounty'
          },
          demographics: {
            gender: 'Male',
            preferredLanguage: 'English',
            householdSize: 2,
            insuranceStatus: 'Insured'
          },
          healthConditions: ['Hypertension'],
          socialDeterminants: {
            housingStatus: 'Stable',
            employmentStatus: 'Unemployed',
            transportationAccess: true,
            foodSecurity: 'Insecure',
            socialSupport: 'Limited',
            educationLevel: 'High School'
          },
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15')
        }
      ]);

      setResources([
        {
          id: 'resource-1',
          name: 'Cardiology Clinic',
          organization: 'Regional Medical Center',
          category: ResourceCategory.HEALTHCARE,
          description: 'Specialized cardiac care services',
          contactInfo: {
            phone: '(555) 123-4567',
            email: 'cardiology@regionalmed.com'
          },
          address: {
            street: '456 Health Ave',
            city: 'Anytown',
            state: 'NC',
            zipCode: '12345',
            county: 'AnyCounty'
          },
          serviceHours: {
            monday: '8:00 AM - 5:00 PM',
            tuesday: '8:00 AM - 5:00 PM',
            wednesday: '8:00 AM - 5:00 PM',
            thursday: '8:00 AM - 5:00 PM',
            friday: '8:00 AM - 5:00 PM'
          },
          eligibilityCriteria: ['Medical referral required'],
          servicesOffered: ['Consultations', 'Diagnostic tests', 'Treatment'],
          isActive: true,
          region5Certified: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const referralData = {
        clientId: formData.clientId,
        resourceId: formData.resourceId,
        chwId: 'current-user', // Would get from auth context
        status: ReferralStatus.PENDING,
        urgency: formData.urgency,
        reason: formData.reason,
        notes: formData.notes,
        followUpDate: undefined,
        outcomeNotes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: undefined
      };

      if (selectedReferral) {
        // Update existing referral
        console.log('Updating referral:', selectedReferral.id, referralData);
      } else {
        // Create new referral
        console.log('Creating new referral:', referralData);
      }

      setShowModal(false);
      setSelectedReferral(null);
      resetForm();
    } catch (error) {
      console.error('Error saving referral:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      resourceId: '',
      urgency: ReferralUrgency.MEDIUM,
      reason: '',
      notes: ''
    });
  };

  const editReferral = (referral: Referral) => {
    setSelectedReferral(referral);
    setFormData({
      clientId: referral.clientId,
      resourceId: referral.resourceId,
      urgency: referral.urgency,
      reason: referral.reason,
      notes: referral.notes || ''
    });
    setShowModal(true);
  };

  const getStatusColor = (status: ReferralStatus) => {
    switch (status) {
      case ReferralStatus.PENDING: return 'warning';
      case ReferralStatus.CONTACTED: return 'info';
      case ReferralStatus.SCHEDULED: return 'primary';
      case ReferralStatus.COMPLETED: return 'success';
      case ReferralStatus.CANCELLED: return 'error';
      case ReferralStatus.NO_SHOW: return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: ReferralStatus) => {
    switch (status) {
      case ReferralStatus.PENDING: return <PendingIcon />;
      case ReferralStatus.CONTACTED: return <PhoneIcon />;
      case ReferralStatus.SCHEDULED: return <CheckCircleIcon />;
      case ReferralStatus.COMPLETED: return <CheckCircleIcon />;
      case ReferralStatus.CANCELLED: return <CancelIcon />;
      case ReferralStatus.NO_SHOW: return <WarningIcon />;
      default: return <PendingIcon />;
    }
  };

  const getUrgencyColor = (urgency: ReferralUrgency) => {
    switch (urgency) {
      case ReferralUrgency.LOW: return 'success';
      case ReferralUrgency.MEDIUM: return 'warning';
      case ReferralUrgency.HIGH: return 'error';
      case ReferralUrgency.URGENT: return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Get unique categories for filter
  const orgCategories = ['All', ...Array.from(new Set(organizationsData.map(org => org.category)))].sort();

  // Filter organizations based on search and category
  const filteredOrganizations = organizationsData.filter(org => {
    const matchesSearch = orgSearchTerm === '' || 
      org.name.toLowerCase().includes(orgSearchTerm.toLowerCase()) ||
      org.description.toLowerCase().includes(orgSearchTerm.toLowerCase()) ||
      org.county.toLowerCase().includes(orgSearchTerm.toLowerCase()) ||
      org.city.toLowerCase().includes(orgSearchTerm.toLowerCase());
    const matchesCategory = orgCategoryFilter === 'All' || org.category === orgCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ width: '100%', py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Referral Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage client referrals to community resources
          </Typography>
        </Box>
        {activeTab === 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowModal(true)}
            size="large"
          >
            New Referral
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Referrals" icon={<VisibilityIcon />} iconPosition="start" />
          <Tab label="Organizations" icon={<BusinessIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Referrals Tab */}
      {activeTab === 0 && (
        <>
          {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {referrals.filter(r => r.status === ReferralStatus.PENDING).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Referrals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {referrals.filter(r => r.status === ReferralStatus.COMPLETED).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {referrals.filter(r => r.urgency === ReferralUrgency.HIGH || r.urgency === ReferralUrgency.URGENT).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High Priority
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {resources.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Resources
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Referrals Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Active Referrals
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Urgency</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {referrals.map((referral) => {
                  const client = clients.find(c => c.id === referral.clientId);
                  const resource = resources.find(r => r.id === referral.resourceId);

                  return (
                    <TableRow key={referral.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {referral.clientId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {resource?.name || 'Unknown Resource'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {resource?.organization}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(referral.status)}
                          <Chip
                            label={referral.status.replace(/_/g, ' ')}
                            color={getStatusColor(referral.status)}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={referral.urgency}
                          color={getUrgencyColor(referral.urgency)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {referral.reason}
                        </Typography>
                        {referral.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            {referral.notes.substring(0, 50)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {referral.createdAt.toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => editReferral(referral)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                          >
                            View
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        </Card>

        {/* Add/Edit Referral Modal */}
        <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedReferral ? 'Edit Referral' : 'New Referral'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Client"
                    value={formData.clientId}
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                    required
                  >
                    {clients.map(client => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Resource"
                    value={formData.resourceId}
                    onChange={(e) => setFormData({...formData, resourceId: e.target.value})}
                    required
                  >
                    {resources.map(resource => (
                      <MenuItem key={resource.id} value={resource.id}>
                        {resource.name} - {resource.organization}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Urgency"
                    value={formData.urgency}
                    onChange={(e) => setFormData({...formData, urgency: e.target.value as ReferralUrgency})}
                  >
                    {Object.values(ReferralUrgency).map(urgency => (
                      <MenuItem key={urgency} value={urgency}>
                        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Reason for Referral"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any additional information about this referral..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                {selectedReferral ? 'Update Referral' : 'Create Referral'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setShowModal(true)}
        >
          <AddIcon />
        </Fab>
        </>
      )}

      {/* Organizations Tab */}
      {activeTab === 1 && (
        <>
          {/* Search and Filter */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search organizations..."
              value={orgSearchTerm}
              onChange={(e) => setOrgSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Category"
              value={orgCategoryFilter}
              onChange={(e) => setOrgCategoryFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {orgCategories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Stats */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredOrganizations.length} of {organizationsData.length} organizations
            </Typography>
          </Box>

          {/* Organizations List */}
          <Grid container spacing={2}>
            {filteredOrganizations.map((org) => (
              <Grid item xs={12} md={6} lg={4} key={org.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Box sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        p: 1, 
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BusinessIcon />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                          {org.name}
                        </Typography>
                        <Chip 
                          label={org.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                      {org.description.length > 150 ? `${org.description.substring(0, 150)}...` : org.description}
                    </Typography>

                    {/* Location */}
                    {(org.address || org.city) && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {[org.address, org.city, org.state, org.zipCode].filter(Boolean).join(', ')}
                        </Typography>
                      </Box>
                    )}

                    {/* County */}
                    {org.county && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>County:</strong> {org.county}
                        </Typography>
                      </Box>
                    )}

                    {/* Contact */}
                    {org.contactName && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {org.contactName}
                        </Typography>
                      </Box>
                    )}

                    {/* Phone */}
                    {org.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {org.phone}
                        </Typography>
                      </Box>
                    )}

                    {/* Email */}
                    {org.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Link href={`mailto:${org.email}`} underline="hover" sx={{ fontSize: '0.875rem' }}>
                          {org.email}
                        </Link>
                      </Box>
                    )}

                    {/* Website */}
                    {org.website && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LanguageIcon fontSize="small" color="action" />
                        <Link 
                          href={org.website.startsWith('http') ? org.website : `https://${org.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{ fontSize: '0.875rem' }}
                        >
                          {org.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </Link>
                      </Box>
                    )}

                    {/* Last Updated */}
                    {org.lastUpdated && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Last updated: {org.lastUpdated}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredOrganizations.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BusinessIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No organizations found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
