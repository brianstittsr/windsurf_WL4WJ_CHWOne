'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Avatar, 
  CircularProgress,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Message, ReportConfig } from '@/types/bmad.types';
import { bmadAgentService } from '@/services/bmad/BmadAgentService';
import { v4 as uuidv4 } from 'uuid';

interface ConversationInterfaceProps {
  onConfigUpdate: (config: ReportConfig) => void;
  onGenerateReport: (config: ReportConfig) => void;
  initialConfig?: ReportConfig;
  availableDatasetIds?: string[];
}

export default function ConversationInterface({
  onConfigUpdate,
  onGenerateReport,
  initialConfig,
  availableDatasetIds
}: ConversationInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig>(initialConfig || {});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize conversation with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: availableDatasetIds && availableDatasetIds.length > 0
          ? `Hello! I'm your BMAD Orchestrator agent. I can help you generate reports from your data. You have ${availableDatasetIds.length} dataset(s) available. What kind of report would you like to create?`
          : `Hello! I'm your BMAD Orchestrator agent. I can help you generate reports from your data. Please upload some datasets first before we can create a report.`,
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
    }
  }, [messages.length, availableDatasetIds]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await bmadAgentService.processInput({
        message: input,
        currentConfig: reportConfig,
        availableDatasets: availableDatasetIds?.map(id => ({ id })) as any
      });
      
      if (response.error) {
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `I'm sorry, but I encountered an error: ${response.error}`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: response.message || 'I processed your request, but I don\'t have a specific response.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (response.updatedConfig) {
          setReportConfig(response.updatedConfig);
          onConfigUpdate(response.updatedConfig);
          
          if (response.readyToGenerate) {
            const readyMessage: Message = {
              id: uuidv4(),
              role: 'assistant',
              content: 'I have all the information I need. Would you like me to generate the report now?',
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, readyMessage]);
          }
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `I'm sorry, but something went wrong. Please try again later.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleGenerateReport = () => {
    const generatingMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: 'Generating your report. This may take a moment...',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, generatingMessage]);
    onGenerateReport(reportConfig);
  };
  
  const handleClearConversation = () => {
    setMessages([]);
    setReportConfig(initialConfig || {});
  };
  
  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Report Generator
        </Typography>
        
        <Box>
          <Tooltip title="Clear conversation">
            <IconButton onClick={handleClearConversation} size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Start new conversation">
            <IconButton onClick={() => setMessages([])} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              mb: 2,
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <Avatar
              sx={{
                bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                width: 32,
                height: 32,
                mr: message.role === 'user' ? 0 : 1,
                ml: message.role === 'user' ? 1 : 0
              }}
            >
              {message.role === 'user' ? <PersonIcon /> : <BotIcon />}
            </Avatar>
            
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                borderRadius: 2
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
              <Typography variant="caption" color={message.role === 'user' ? 'primary.contrastText' : 'text.secondary'} sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                {formatTimestamp(message.timestamp)}
              </Typography>
            </Paper>
          </Box>
        ))}
        
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 5, mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'secondary.main',
                width: 32,
                height: 32,
                mr: 1
              }}
            >
              <BotIcon />
            </Avatar>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Thinking...
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading || !availableDatasetIds || availableDatasetIds.length === 0}
          multiline
          maxRows={3}
          sx={{ mr: 1 }}
        />
        
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
          disabled={!input.trim() || loading || !availableDatasetIds || availableDatasetIds.length === 0}
        >
          Send
        </Button>
      </Box>
      
      {reportConfig.status === 'draft' && reportConfig.sections && reportConfig.sections.length > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleGenerateReport}
          >
            Generate Report
          </Button>
        </Box>
      )}
    </Paper>
  );
}
