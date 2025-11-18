'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  Chip
} from '@mui/material';
import {
  Download as DownloadIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { ReportTemplate, DashboardMetric, Grant } from '@/types/grant.types';

interface ReportActionsProps {
  template: ReportTemplate;
  grantData: Partial<Grant>;
  metrics: DashboardMetric[];
}

export function ReportActions({ template, grantData, metrics }: ReportActionsProps) {
  const [generating, setGenerating] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [additionalEmails, setAdditionalEmails] = useState('');
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    downloadUrl?: string;
  } | null>(null);

  /**
   * Generate and download report
   */
  const handleGenerateReport = async () => {
    setGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/grants/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          grantData,
          metrics,
          sendEmail,
          additionalRecipients: additionalEmails
            .split(',')
            .map(e => e.trim())
            .filter(e => e.length > 0)
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setResult({
        success: true,
        message: sendEmail
          ? `Report generated and sent to ${template.deliverySchedule.recipients.length} recipient(s)`
          : 'Report generated successfully',
        downloadUrl: data.downloadUrl
      });

      // Auto-download if not sending email
      if (!sendEmail && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Schedule report for automatic delivery
   */
  const handleScheduleReport = async () => {
    setScheduling(true);
    setResult(null);

    try {
      const response = await fetch('/api/grants/schedule-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          grantData,
          action: 'schedule'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to schedule report');
      }

      setResult({
        success: true,
        message: `Report scheduled for ${template.deliverySchedule.frequency} delivery. Next delivery: ${new Date(data.nextScheduledDate).toLocaleDateString()}`
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setScheduling(false);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={generating}
        >
          Generate Report
        </Button>

        <Button
          variant="outlined"
          startIcon={<ScheduleIcon />}
          onClick={handleScheduleReport}
          disabled={scheduling}
        >
          {scheduling ? 'Scheduling...' : 'Schedule Delivery'}
        </Button>
      </Box>

      {/* Generate Report Dialog */}
      <Dialog open={dialogOpen} onClose={() => !generating && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Report: <strong>{template.name}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Format: <Chip label={template.format.toUpperCase()} size="small" />
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sections: {template.sections?.length || 0}
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                disabled={generating}
              />
            }
            label="Send via email to recipients"
          />

          {sendEmail && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Configured Recipients ({template.deliverySchedule.recipients.length}):
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {template.deliverySchedule.recipients.map((recipient, index) => (
                  <Chip key={index} label={recipient} size="small" />
                ))}
              </Box>

              <TextField
                fullWidth
                label="Additional Email Addresses (comma-separated)"
                placeholder="email1@example.com, email2@example.com"
                value={additionalEmails}
                onChange={(e) => setAdditionalEmails(e.target.value)}
                disabled={generating}
                size="small"
              />
            </Box>
          )}

          {result && (
            <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
              {result.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={generating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={16} /> : sendEmail ? <EmailIcon /> : <DownloadIcon />}
          >
            {generating ? 'Generating...' : sendEmail ? 'Generate & Send' : 'Generate & Download'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Result Snackbar */}
      {result && !dialogOpen && (
        <Alert
          severity={result.success ? 'success' : 'error'}
          onClose={() => setResult(null)}
          sx={{ mt: 2 }}
          icon={result.success ? <SuccessIcon /> : undefined}
        >
          {result.message}
        </Alert>
      )}
    </>
  );
}
