'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Forum as ForumIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { Region5Logo } from '@/components/Logos';
import AnimatedLoading from '@/components/Common/AnimatedLoading';

// Mock data for discussions
const mockDiscussions = [
  {
    id: '1',
    title: 'New diabetes prevention program starting in Cumberland County',
    author: 'Maria Rodriguez',
    authorAvatar: '/images/avatars/avatar1.jpg',
    date: '2 hours ago',
    content: 'Our organization is launching a new diabetes prevention program next month. We\'re looking for CHWs who have experience with diabetes education to join our team. If you\'re interested or know someone who might be, please reach out!',
    category: 'Opportunities',
    tags: ['Diabetes', 'Cumberland', 'Jobs'],
    likes: 12,
    comments: 5
  },
  {
    id: '2',
    title: 'Free training on motivational interviewing techniques',
    author: 'James Wilson',
    authorAvatar: '/images/avatars/avatar2.jpg',
    date: '1 day ago',
    content: 'I wanted to share that there\'s a free online training on motivational interviewing techniques specifically for CHWs next Tuesday at 2pm. It offers 2 CEU credits and registration is open until Monday. Here\'s the link to register...',
    category: 'Training',
    tags: ['CEU', 'Motivational Interviewing', 'Free'],
    likes: 24,
    comments: 8
  },
  {
    id: '3',
    title: 'Looking for advice on working with refugee populations',
    author: 'Aisha Johnson',
    authorAvatar: '/images/avatars/avatar3.jpg',
    date: '3 days ago',
    content: 'I\'m starting to work with refugee families in Robeson County and would appreciate any advice or resources from CHWs who have experience in this area. Particularly interested in translation services and culturally appropriate health education materials.',
    category: 'Discussion',
    tags: ['Refugees', 'Robeson', 'Resources'],
    likes: 7,
    comments: 15
  }
];

// Mock data for job opportunities
const mockJobs = [
  {
    id: '1',
    title: 'Community Health Worker - Maternal Health Focus',
    organization: 'Healthy Mothers Initiative',
    location: 'Fayetteville, NC',
    type: 'Full-time',
    salary: '$38,000 - $45,000',
    posted: '2 days ago',
    deadline: 'October 30, 2025',
    description: 'Seeking experienced CHW to join our maternal health program serving expectant mothers in Cumberland County...'
  },
  {
    id: '2',
    title: 'COVID-19 Outreach Specialist',
    organization: 'Brunswick Health Department',
    location: 'Bolivia, NC (Hybrid)',
    type: 'Contract (6 months)',
    salary: '$22/hour',
    posted: '1 week ago',
    deadline: 'October 25, 2025',
    description: 'Join our COVID-19 response team to provide education and vaccination outreach to underserved communities...'
  },
  {
    id: '3',
    title: 'Bilingual CHW - Diabetes Prevention',
    organization: 'Community Care Clinic',
    location: 'Lumberton, NC',
    type: 'Part-time',
    salary: '$18-20/hour',
    posted: '3 days ago',
    deadline: 'November 5, 2025',
    description: 'Seeking Spanish-speaking CHW to assist with our diabetes prevention program serving Hispanic/Latino communities...'
  }
];

// Mock data for events
const mockEvents = [
  {
    id: '1',
    title: 'Region 5 CHW Quarterly Meetup',
    date: 'November 12, 2025',
    time: '10:00 AM - 2:00 PM',
    location: 'Fayetteville Technical Community College',
    organizer: 'Region 5 CHW Association',
    description: 'Join us for our quarterly in-person meetup with lunch provided. We\'ll be discussing upcoming initiatives and sharing best practices.'
  },
  {
    id: '2',
    title: 'Mental Health First Aid Certification',
    date: 'October 28-29, 2025',
    time: '9:00 AM - 4:00 PM',
    location: 'Virtual (Zoom)',
    organizer: 'Mental Health Association of NC',
    description: 'Two-day certification course in Mental Health First Aid. 8 CEU credits available upon completion.'
  },
  {
    id: '3',
    title: 'Community Resource Fair',
    date: 'November 5, 2025',
    time: '3:00 PM - 7:00 PM',
    location: 'Smith Recreation Center, Fayetteville',
    organizer: 'Cumberland County Health Department',
    description: 'Annual resource fair connecting community members with health and social services. CHWs needed to volunteer at information booths.'
  }
];

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`networking-tabpanel-${index}`}
      aria-labelledby={`networking-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `networking-tab-${index}`,
    'aria-controls': `networking-tabpanel-${index}`,
  };
}

// Discussion card component
function DiscussionCard({ discussion }: { discussion: any }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={discussion.authorAvatar} alt={discussion.author} />
          <Box sx={{ ml: 1 }}>
            <Typography variant="subtitle1">{discussion.author}</Typography>
            <Typography variant="caption" color="text.secondary">{discussion.date}</Typography>
          </Box>
          <Chip 
            label={discussion.category} 
            size="small" 
            sx={{ ml: 'auto' }} 
            color={
              discussion.category === 'Opportunities' ? 'primary' :
              discussion.category === 'Training' ? 'secondary' : 'default'
            }
          />
        </Box>
        
        <Typography variant="h6" gutterBottom>{discussion.title}</Typography>
        <Typography variant="body2" paragraph>{discussion.content}</Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {discussion.tags.map((tag: string) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions>
        <Button 
          size="small" 
          startIcon={<ThumbUpIcon />}
        >
          {discussion.likes}
        </Button>
        <Button 
          size="small" 
          startIcon={<CommentIcon />}
        >
          {discussion.comments}
        </Button>
        <Button 
          size="small" 
          startIcon={<BookmarkIcon />}
        >
          Save
        </Button>
        <Button 
          size="small" 
          startIcon={<ShareIcon />}
        >
          Share
        </Button>
        <IconButton size="small" sx={{ ml: 'auto' }}>
          <MoreVertIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

// Job card component
function JobCard({ job }: { job: any }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WorkIcon color="primary" sx={{ fontSize: 32 }} />
          <Box sx={{ ml: 1 }}>
            <Typography variant="h6">{job.title}</Typography>
            <Typography variant="subtitle2">{job.organization}</Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Location:</strong> {job.location}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Type:</strong> {job.type}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Salary:</strong> {job.salary}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Deadline:</strong> {job.deadline}
            </Typography>
          </Grid>
        </Grid>
        
        <Typography variant="body2" paragraph>{job.description}</Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">Posted {job.posted}</Typography>
          <Button variant="contained" size="small">View Details</Button>
        </Box>
      </CardContent>
    </Card>
  );
}

// Event card component
function EventCard({ event }: { event: any }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EventIcon color="secondary" sx={{ fontSize: 32 }} />
          <Box sx={{ ml: 1 }}>
            <Typography variant="h6">{event.title}</Typography>
            <Typography variant="subtitle2">{event.organizer}</Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Date:</strong> {event.date}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Time:</strong> {event.time}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2">
              <strong>Location:</strong> {event.location}
            </Typography>
          </Grid>
        </Grid>
        
        <Typography variant="body2" paragraph>{event.description}</Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" size="small">Add to Calendar</Button>
          <Button variant="contained" size="small">Register</Button>
        </Box>
      </CardContent>
    </Card>
  );
}

// Inner component that uses the auth context
function NetworkingContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return <AnimatedLoading message="Loading Networking Hub..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <UnifiedLayout>
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
            <Region5Logo size="medium" />
            <Typography variant="h4" sx={{ ml: 2, fontWeight: 'bold' }}>
              Networking Hub
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search..."
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 250 } }}
            />
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
            >
              Create Post
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="networking tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<ForumIcon />} 
              label="Discussions" 
              {...a11yProps(0)} 
              iconPosition="start"
            />
            <Tab 
              icon={<WorkIcon />} 
              label="Jobs" 
              {...a11yProps(1)} 
              iconPosition="start"
            />
            <Tab 
              icon={<EventIcon />} 
              label="Events" 
              {...a11yProps(2)} 
              iconPosition="start"
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="Directory" 
              {...a11yProps(3)} 
              iconPosition="start"
            />
            <Tab 
              icon={<DescriptionIcon />} 
              label="Resources" 
              {...a11yProps(4)} 
              iconPosition="start"
            />
          </Tabs>

          {/* Discussions Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Recent Discussions
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Connect with other CHWs, share experiences, and discuss topics relevant to your work.
              </Typography>
              
              {mockDiscussions.map(discussion => (
                <DiscussionCard key={discussion.id} discussion={discussion} />
              ))}
              
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="outlined">Load More</Button>
              </Box>
            </Box>
          </TabPanel>

          {/* Jobs Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Job Opportunities
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Browse and share job opportunities for Community Health Workers in Region 5.
              </Typography>
              
              {mockJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
              
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="outlined">View All Jobs</Button>
              </Box>
            </Box>
          </TabPanel>

          {/* Events Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Upcoming Events
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Discover training opportunities, meetups, and other events for CHWs in Region 5.
              </Typography>
              
              {mockEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
              
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="outlined">View Calendar</Button>
              </Box>
            </Box>
          </TabPanel>

          {/* Directory Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                CHW Directory
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Connect with other Community Health Workers in Region 5.
              </Typography>
              
              <Box sx={{ 
                p: 4, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                bgcolor: theme.palette.background.default,
                borderRadius: 2
              }}>
                <PeopleIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Directory Coming Soon
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  We're building a comprehensive directory of CHWs in Region 5. Check back soon!
                </Typography>
                <Button variant="contained">Join Directory</Button>
              </Box>
            </Box>
          </TabPanel>

          {/* Resources Tab */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Resource Library
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Share and access useful resources for Community Health Workers.
              </Typography>
              
              <Box sx={{ 
                p: 4, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                bgcolor: theme.palette.background.default,
                borderRadius: 2
              }}>
                <DescriptionIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Resource Library Coming Soon
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  We're building a comprehensive resource library for CHWs in Region 5. Check back soon!
                </Typography>
                <Button variant="contained">Contribute Resources</Button>
              </Box>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function NetworkingPage() {
  return (
    <AuthProvider>
      <NetworkingContent />
    </AuthProvider>
  );
}
