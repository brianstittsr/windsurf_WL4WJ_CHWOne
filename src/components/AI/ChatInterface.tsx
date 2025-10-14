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
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  ButtonGroup
} from '@mui/material';
import { 
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { aiAgentService, Message, Conversation, SuggestedAction } from '@/services/ai/AiAgentService';
import { useAuth } from '@/contexts/AuthContext';

interface ChatInterfaceProps {
  initialConversation?: Conversation;
}

export default function ChatInterface({ initialConversation }: ChatInterfaceProps) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(
    initialConversation || null
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load conversations on mount
  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);
  
  const loadConversations = async () => {
    if (!currentUser) return;
    
    try {
      const userConversations = await aiAgentService.getConversations(currentUser.uid);
      setConversations(userConversations);
      
      // If no active conversation and we have conversations, set the first one as active
      if (!activeConversation && userConversations.length > 0) {
        setActiveConversation(userConversations[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };
  
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;
    if (!currentUser) {
      setError('You must be logged in to use the AI assistant');
      return;
    }
    
    // Create a new user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    // Clear input and set loading state
    setInput('');
    setLoading(true);
    setError(null);
    setSuggestedActions([]);
    
    try {
      // If no active conversation, create a new one
      let conversation = activeConversation;
      if (!conversation) {
        conversation = await aiAgentService.createConversation(
          currentUser.uid,
          `Chat ${new Date().toLocaleDateString()}`
        );
        setActiveConversation(conversation);
        setConversations(prev => [conversation!, ...prev]);
      }
      
      // Add user message to conversation
      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, userMessage],
        updatedAt: new Date()
      };
      setActiveConversation(updatedConversation);
      
      // Send message to AI Agent
      const response = await aiAgentService.sendMessage(
        input,
        conversation.id,
        currentUser.uid
      );
      
      // Add AI response to conversation
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, response.message],
        updatedAt: new Date()
      };
      setActiveConversation(finalConversation);
      
      // Update conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === finalConversation.id ? finalConversation : conv
        )
      );
      
      // Set suggested actions if any
      if (response.suggestedActions) {
        setSuggestedActions(response.suggestedActions);
      }
    } catch (err) {
      setError(`Error sending message: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
  
  const handleNewConversation = async () => {
    if (!currentUser) return;
    
    try {
      const newConversation = await aiAgentService.createConversation(
        currentUser.uid,
        `Chat ${new Date().toLocaleDateString()}`
      );
      
      setActiveConversation(newConversation);
      setConversations(prev => [newConversation, ...prev]);
      setSuggestedActions([]);
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };
  
  const handleDeleteConversation = async () => {
    if (!activeConversation) return;
    
    try {
      await aiAgentService.deleteConversation(activeConversation.id);
      
      // Remove from conversations list
      setConversations(prev => prev.filter(conv => conv.id !== activeConversation.id));
      
      // Set a new active conversation or null
      if (conversations.length > 1) {
        const newActiveConversation = conversations.find(conv => conv.id !== activeConversation.id);
        setActiveConversation(newActiveConversation || null);
      } else {
        setActiveConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };
  
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setSuggestedActions([]);
  };
  
  const handleActionClick = (action: SuggestedAction) => {
    if (action.type === 'navigate' && action.target) {
      router.push(action.target);
    }
  };
  
  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Conversations Sidebar */}
      <Paper 
        sx={{ 
          width: 250, 
          borderRight: 1, 
          borderColor: 'divider',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewConversation}
          >
            New Chat
          </Button>
        </Box>
        
        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
          {conversations.map((conversation) => (
            <ListItem 
              key={conversation.id}
              button
              selected={activeConversation?.id === conversation.id}
              onClick={() => handleSelectConversation(conversation)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ChatIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={conversation.title} 
                secondary={new Date(conversation.updatedAt).toLocaleDateString()}
                primaryTypographyProps={{
                  noWrap: true,
                  sx: { fontWeight: activeConversation?.id === conversation.id ? 'bold' : 'normal' }
                }}
              />
            </ListItem>
          ))}
          
          {conversations.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No conversations yet
              </Typography>
            </Box>
          )}
        </List>
      </Paper>
      
      {/* Chat Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Chat Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
              <BotIcon />
            </Avatar>
            <Typography variant="h6">
              AI Assistant
            </Typography>
          </Box>
          
          <Box>
            <Tooltip title="New Conversation">
              <IconButton onClick={handleNewConversation}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            
            {activeConversation && (
              <Tooltip title="Delete Conversation">
                <IconButton onClick={handleDeleteConversation} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        
        {/* Messages Area */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: 'background.default' }}>
          {activeConversation?.messages.map((message) => (
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
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
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
          
          {suggestedActions.length > 0 && (
            <Box sx={{ ml: 5, mb: 2, mt: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Suggested Actions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestedActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    onClick={() => handleActionClick(action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
          
          {error && (
            <Box sx={{ ml: 5, mb: 2, mt: 1 }}>
              <Chip
                label={error}
                color="error"
                variant="outlined"
              />
            </Box>
          )}
          
          {!activeConversation && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mb: 2 }}>
                <BotIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                AI Assistant
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 400 }}>
                Ask me anything about the CHWOne platform, CiviCRM, or how to perform specific tasks.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewConversation}
              >
                Start New Conversation
              </Button>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Input Area */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || !currentUser}
              multiline
              maxRows={3}
              sx={{ mr: 1 }}
            />
            
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleSendMessage}
              disabled={!input.trim() || loading || !currentUser}
            >
              Send
            </Button>
          </Box>
          
          {!currentUser && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              You must be logged in to use the AI assistant
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
