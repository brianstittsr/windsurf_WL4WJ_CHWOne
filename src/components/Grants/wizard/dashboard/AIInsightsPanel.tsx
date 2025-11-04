'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  IconButton
} from '@mui/material';
import { 
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  Star as StarIcon,
  AssistantTwoTone as AIIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Define insight type
export interface Insight {
  id: string;
  type: 'trend' | 'risk' | 'opportunity' | 'recommendation';
  title: string;
  description: string;
  source: string;
  confidence: number; // 0-100%
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  relatedMetrics?: string[];
  suggestedActions?: string[];
}

interface AIInsightsPanelProps {
  insights: Insight[];
  onRefresh?: () => void;
}

export function AIInsightsPanel({ insights, onRefresh }: AIInsightsPanelProps) {
  // Group insights by type
  const trendInsights = insights.filter(insight => insight.type === 'trend');
  const riskInsights = insights.filter(insight => insight.type === 'risk');
  const opportunityInsights = insights.filter(insight => insight.type === 'opportunity');
  const recommendationInsights = insights.filter(insight => insight.type === 'recommendation');

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AIIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">AI-Generated Insights</Typography>
        </Box>
        <Box>
          <IconButton size="small" sx={{ mr: 1 }}>
            <FilterIcon />
          </IconButton>
          <IconButton size="small" sx={{ mr: 1 }}>
            <ShareIcon />
          </IconButton>
          <IconButton size="small" onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          mb: 3, 
          bgcolor: 'primary.dark',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          width: '120px', 
          height: '120px',
          opacity: 0.1, 
          transform: 'translate(20%, -20%)'
        }}>
          <InsightsIcon sx={{ width: '100%', height: '100%' }} />
        </Box>
        
        <Typography variant="h6" gutterBottom>Executive Summary</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Based on the analysis of your grant project data, the AI has identified {insights.length} key insights 
          that require your attention. Below is a summary of the most important findings.
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h4">{trendInsights.length}</Typography>
              <Typography variant="body2">Trends</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h4">{riskInsights.length}</Typography>
              <Typography variant="body2">Risks</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h4">{opportunityInsights.length}</Typography>
              <Typography variant="body2">Opportunities</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h4">{recommendationInsights.length}</Typography>
              <Typography variant="body2">Recommendations</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Trends */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader 
              title="Trends" 
              titleTypographyProps={{ variant: 'subtitle1' }}
              avatar={<TrendingUpIcon color="primary" />}
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List dense>
                {trendInsights.map((insight) => (
                  <ListItem 
                    key={insight.id}
                    secondaryAction={
                      <Chip 
                        size="small" 
                        label={`${insight.confidence}%`}
                        color={insight.confidence > 80 ? 'success' : insight.confidence > 60 ? 'primary' : 'default'}
                      />
                    }
                  >
                    <ListItemIcon>
                      {insight.impact === 'high' ? 
                        <TrendingUpIcon color="success" /> : 
                        insight.impact === 'low' ? 
                        <TrendingDownIcon color="error" /> : 
                        <TrendingUpIcon color="primary" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={insight.title}
                      secondary={insight.description}
                    />
                  </ListItem>
                ))}
                {trendInsights.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No trends detected" secondary="Check back later for trend insights" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Risks */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader 
              title="Risks" 
              titleTypographyProps={{ variant: 'subtitle1' }}
              avatar={<WarningIcon color="error" />}
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List dense>
                {riskInsights.map((insight) => (
                  <ListItem 
                    key={insight.id}
                    secondaryAction={
                      <Chip 
                        size="small" 
                        label={insight.impact}
                        color={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'default'}
                      />
                    }
                  >
                    <ListItemIcon>
                      <WarningIcon color={insight.impact === 'high' ? 'error' : 'warning'} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={insight.title}
                      secondary={insight.description}
                    />
                  </ListItem>
                ))}
                {riskInsights.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No risks detected" secondary="The project appears to be on track" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Opportunities */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader 
              title="Opportunities" 
              titleTypographyProps={{ variant: 'subtitle1' }}
              avatar={<LightbulbIcon sx={{ color: 'orange' }} />}
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List dense>
                {opportunityInsights.map((insight) => (
                  <ListItem 
                    key={insight.id}
                    secondaryAction={
                      <Chip 
                        size="small" 
                        label={insight.impact}
                        color={insight.impact === 'high' ? 'success' : 'primary'}
                      />
                    }
                  >
                    <ListItemIcon>
                      <LightbulbIcon sx={{ color: 'orange' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={insight.title}
                      secondary={insight.description}
                    />
                  </ListItem>
                ))}
                {opportunityInsights.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No opportunities detected" secondary="Additional data needed to identify opportunities" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader 
              title="Recommendations" 
              titleTypographyProps={{ variant: 'subtitle1' }}
              avatar={<StarIcon color="secondary" />}
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List dense>
                {recommendationInsights.map((insight) => (
                  <ListItem 
                    key={insight.id}
                    secondaryAction={
                      <Button size="small" variant="outlined">Apply</Button>
                    }
                  >
                    <ListItemIcon>
                      <StarIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={insight.title}
                      secondary={insight.description}
                    />
                  </ListItem>
                ))}
                {recommendationInsights.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No recommendations yet" secondary="Recommendations will appear as more data is collected" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
