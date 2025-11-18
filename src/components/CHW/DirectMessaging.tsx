'use client';

import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Badge,
  Divider
} from '@mui/material';
import {
  Send,
  Close,
  Message as MessageIcon,
  Delete,
  Reply
} from '@mui/icons-material';
import { DirectMessage } from '@/types/chw-profile.types';

interface DirectMessagingProps {
  currentUserId: string;
  recipientId?: string;
  recipientName?: string;
  recipientAvatar?: string;
  open: boolean;
  onClose: () => void;
}

export default function DirectMessaging({
  currentUserId,
  recipientId,
  recipientName,
  recipientAvatar,
  open,
  onClose
}: DirectMessagingProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in both subject and message');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // In real implementation, send via API
      const newMessage: DirectMessage = {
        id: `msg-${Date.now()}`,
        fromUserId: currentUserId,
        toUserId: recipientId || '',
        subject,
        message,
        isRead: false,
        sentAt: new Date().toISOString()
      };

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
      setSubject('');
      setMessage('');

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MessageIcon color="primary" />
            <Box>
              <Typography variant="h6">Send Message</Typography>
              {recipientName && (
                <Typography variant="body2" color="text.secondary">
                  To: {recipientName}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Message sent successfully!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={sending}
          sx={{ mb: 2 }}
          required
        />

        <TextField
          fullWidth
          label="Message"
          multiline
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
          placeholder="Type your message here..."
          required
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Please be respectful and professional in your communications.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={sending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={handleSend}
          disabled={sending || !subject.trim() || !message.trim()}
        >
          {sending ? 'Sending...' : 'Send Message'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Inbox Component for viewing received messages
 */
interface MessageInboxProps {
  currentUserId: string;
}

export function MessageInbox({ currentUserId }: MessageInboxProps) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<DirectMessage | null>(null);

  // Mock messages - in real implementation, fetch from API
  React.useEffect(() => {
    const mockMessages: DirectMessage[] = [
      {
        id: '1',
        fromUserId: 'user2',
        toUserId: currentUserId,
        subject: 'Collaboration Opportunity',
        message: 'Hi! I saw your profile and would love to discuss a potential collaboration on a maternal health project.',
        isRead: false,
        sentAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        fromUserId: 'user3',
        toUserId: currentUserId,
        subject: 'Question about your work',
        message: 'I noticed you work in Cumberland County. I\'m new to the area and would appreciate any advice you could share.',
        isRead: true,
        sentAt: new Date(Date.now() - 86400000).toISOString(),
        readAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    setMessages(mockMessages);
  }, [currentUserId]);

  const unreadCount = messages.filter(m => !m.isRead).length;

  const markAsRead = (messageId: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId ? { ...m, isRead: true, readAt: new Date().toISOString() } : m
      )
    );
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          <Badge badgeContent={unreadCount} color="primary">
            <MessageIcon sx={{ mr: 1 }} />
          </Badge>
          Messages
        </Typography>
      </Box>

      {messages.length === 0 ? (
        <Alert severity="info">No messages yet</Alert>
      ) : (
        <List>
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              <ListItem
                button
                onClick={() => {
                  setSelectedMessage(msg);
                  if (!msg.isRead) markAsRead(msg.id);
                }}
                sx={{
                  bgcolor: msg.isRead ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    {msg.fromUserId[0].toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      fontWeight={msg.isRead ? 'normal' : 'bold'}
                    >
                      {msg.subject}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {msg.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(msg.sentAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMessage(msg.id);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Message Detail Dialog */}
      <Dialog
        open={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedMessage && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">{selectedMessage.subject}</Typography>
                <IconButton onClick={() => setSelectedMessage(null)}>
                  <Close />
                </IconButton>
              </Box>
              <Typography variant="caption" color="text.secondary">
                From: User {selectedMessage.fromUserId} • {new Date(selectedMessage.sentAt).toLocaleString()}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                startIcon={<Reply />}
                onClick={() => {
                  // Open reply dialog
                  setSelectedMessage(null);
                }}
              >
                Reply
              </Button>
              <Button
                startIcon={<Delete />}
                color="error"
                onClick={() => deleteMessage(selectedMessage.id)}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
