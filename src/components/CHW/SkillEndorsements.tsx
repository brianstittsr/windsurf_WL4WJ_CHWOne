'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tooltip,
  Stack,
  Paper
} from '@mui/material';
import {
  ThumbUp,
  Add,
  Close,
  CheckCircle
} from '@mui/icons-material';
import { SkillEndorsement, EXPERTISE_OPTIONS } from '@/types/chw-profile.types';

interface SkillEndorsementsProps {
  profileId: string;
  profileName: string;
  skills: string[];
  currentUserId: string;
  currentUserName: string;
  editable?: boolean;
}

export default function SkillEndorsements({
  profileId,
  profileName,
  skills,
  currentUserId,
  currentUserName,
  editable = false
}: SkillEndorsementsProps) {
  const [endorsements, setEndorsements] = useState<SkillEndorsement[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [customSkill, setCustomSkill] = useState('');

  // Mock endorsements - in real implementation, fetch from API
  React.useEffect(() => {
    const mockEndorsements: SkillEndorsement[] = [
      {
        id: '1',
        profileId,
        skill: 'Maternal & Child Health',
        endorsedBy: 'user2',
        endorsedByName: 'John Smith',
        endorsedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '2',
        profileId,
        skill: 'Maternal & Child Health',
        endorsedBy: 'user3',
        endorsedByName: 'Aisha Johnson',
        endorsedAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: '3',
        profileId,
        skill: 'Health Education',
        endorsedBy: 'user4',
        endorsedByName: 'Maria Rodriguez',
        endorsedAt: new Date(Date.now() - 259200000).toISOString()
      }
    ];
    setEndorsements(mockEndorsements);
  }, [profileId]);

  const getEndorsementCount = (skill: string) => {
    return endorsements.filter(e => e.skill === skill).length;
  };

  const hasEndorsed = (skill: string) => {
    return endorsements.some(e => e.skill === skill && e.endorsedBy === currentUserId);
  };

  const getEndorsers = (skill: string) => {
    return endorsements.filter(e => e.skill === skill);
  };

  const handleEndorse = async (skill: string) => {
    if (hasEndorsed(skill)) {
      // Remove endorsement
      setEndorsements(prev =>
        prev.filter(e => !(e.skill === skill && e.endorsedBy === currentUserId))
      );
    } else {
      // Add endorsement
      const newEndorsement: SkillEndorsement = {
        id: `endorsement-${Date.now()}`,
        profileId,
        skill,
        endorsedBy: currentUserId,
        endorsedByName: currentUserName,
        endorsedAt: new Date().toISOString()
      };

      // In real implementation, save via API
      await new Promise(resolve => setTimeout(resolve, 500));

      setEndorsements(prev => [...prev, newEndorsement]);
    }
  };

  const handleAddSkill = async () => {
    const skillToAdd = selectedSkill || customSkill;
    if (!skillToAdd.trim()) return;

    // In real implementation, add skill to profile via API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Automatically endorse the new skill
    await handleEndorse(skillToAdd);

    setDialogOpen(false);
    setSelectedSkill(null);
    setCustomSkill('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Skills & Endorsements</Typography>
        {editable && (
          <Button
            size="small"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Add Skill
          </Button>
        )}
      </Box>

      {skills.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No skills listed yet
        </Typography>
      ) : (
        <Stack spacing={2}>
          {skills.map((skill) => {
            const count = getEndorsementCount(skill);
            const endorsed = hasEndorsed(skill);
            const endorsers = getEndorsers(skill);

            return (
              <Paper key={skill} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {skill}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label={`${count} ${count === 1 ? 'endorsement' : 'endorsements'}`}
                      color={count > 0 ? 'primary' : 'default'}
                      variant="outlined"
                    />
                    {profileId !== currentUserId && (
                      <Tooltip title={endorsed ? 'Remove endorsement' : 'Endorse this skill'}>
                        <IconButton
                          size="small"
                          color={endorsed ? 'primary' : 'default'}
                          onClick={() => handleEndorse(skill)}
                        >
                          {endorsed ? <CheckCircle /> : <ThumbUp />}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                {endorsers.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">
                      Endorsed by:
                    </Typography>
                    {endorsers.slice(0, 3).map((endorser) => (
                      <Tooltip key={endorser.id} title={endorser.endorsedByName}>
                        <Avatar
                          sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                        >
                          {endorser.endorsedByName[0]}
                        </Avatar>
                      </Tooltip>
                    ))}
                    {endorsers.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{endorsers.length - 3} more
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Add Skill Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Add Skill</Typography>
            <IconButton onClick={() => setDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add a skill to {profileName}'s profile and endorse it
          </Typography>

          <Autocomplete
            options={EXPERTISE_OPTIONS}
            value={selectedSkill}
            onChange={(_, newValue) => {
              setSelectedSkill(newValue);
              setCustomSkill('');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select from common skills"
                placeholder="Choose a skill"
              />
            )}
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Or enter a custom skill:
          </Typography>

          <TextField
            fullWidth
            label="Custom Skill"
            value={customSkill}
            onChange={(e) => {
              setCustomSkill(e.target.value);
              setSelectedSkill(null);
            }}
            placeholder="e.g., Telehealth Coordination"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddSkill}
            disabled={!selectedSkill && !customSkill.trim()}
          >
            Add & Endorse
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Endorsement List Component - Shows who has endorsed a profile
 */
interface EndorsementListProps {
  profileId: string;
  profileName: string;
}

export function EndorsementList({ profileId, profileName }: EndorsementListProps) {
  const [endorsements, setEndorsements] = useState<SkillEndorsement[]>([]);

  React.useEffect(() => {
    // Mock data - in real implementation, fetch from API
    const mockEndorsements: SkillEndorsement[] = [
      {
        id: '1',
        profileId,
        skill: 'Maternal & Child Health',
        endorsedBy: 'user2',
        endorsedByName: 'John Smith',
        endorsedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '2',
        profileId,
        skill: 'Health Education',
        endorsedBy: 'user3',
        endorsedByName: 'Aisha Johnson',
        endorsedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    setEndorsements(mockEndorsements);
  }, [profileId]);

  if (endorsements.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recent Endorsements
      </Typography>
      <List>
        {endorsements.map((endorsement) => (
          <ListItem key={endorsement.id}>
            <ListItemAvatar>
              <Avatar>
                {endorsement.endorsedByName[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body2">
                  <strong>{endorsement.endorsedByName}</strong> endorsed{' '}
                  <strong>{profileName}</strong> for <strong>{endorsement.skill}</strong>
                </Typography>
              }
              secondary={new Date(endorsement.endorsedAt).toLocaleDateString()}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
