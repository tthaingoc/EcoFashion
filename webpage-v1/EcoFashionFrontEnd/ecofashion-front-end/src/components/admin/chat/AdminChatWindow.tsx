import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Stack,
  Divider,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import ChatService from '../../../services/api/chatService';
import { signalRService } from '../../../services/api/signalrConnection';
import type { ChatMessageDto, ChatSessionDto } from '../../../types/chat.types';

interface AdminChatWindowProps {
  sessionId: number;
  onClose: () => void;
  onCloseSession: () => void;
}

/**
 * AdminChatWindow Component
 * Detail chat window for a specific session
 * Allows admin to view history and send messages
 */
const AdminChatWindow = ({ sessionId, onClose, onCloseSession }: AdminChatWindowProps) => {
  const [session, setSession] = useState<ChatSessionDto | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // Auto scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load session messages and join SignalR group
  useEffect(() => {
    if (!sessionId) return;

    const loadAndJoinSession = async () => {
      if (hasLoadedRef.current) return;

      try {
        setIsLoading(true);

        // 1. Load session messages from API
        console.log('📥 Loading session:', sessionId);
        const sessionData = await ChatService.getSessionMessages(sessionId);
        setSession(sessionData);
        setMessages(sessionData.messages);
        hasLoadedRef.current = true;

        console.log('✅ Loaded session with', sessionData.messages.length, 'messages');

        // 2. Join SignalR group for this session
        if (signalRService.isConnected()) {
          await signalRService.joinSession(sessionId);
          console.log('🔌 Joined SignalR group for session:', sessionId);
        }

        // 3. Mark messages as read
        await ChatService.markAsRead(sessionId);
      } catch (error) {
        console.error('❌ Failed to load session:', error);
        toast.error('Failed to load chat session', {
          position: 'top-right',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAndJoinSession();

    // Cleanup: Leave SignalR group when component unmounts or sessionId changes
    return () => {
      if (sessionId && signalRService.isConnected()) {
        signalRService.leaveSession(sessionId).catch(console.error);
        console.log('👋 Left SignalR group for session:', sessionId);
      }
      hasLoadedRef.current = false;
    };
  }, [sessionId]);

  // Listen for new messages via SignalR
  useEffect(() => {
    const handleReceiveMessage = (message: ChatMessageDto) => {
      // Only add if it belongs to this session
      if (message.chatSessionId === sessionId) {
        setMessages((prev) => {
          // Check for duplicates
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;

          console.log('💬 New message received:', message);
          return [...prev, message];
        });

        // Mark as read
        ChatService.markAsRead(sessionId).catch(console.error);
      }
    };

    signalRService.onReceiveMessage(handleReceiveMessage);

    return () => {
      signalRService.offReceiveMessage(handleReceiveMessage);
    };
  }, [sessionId]);

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      await signalRService.sendMessageToSession(sessionId, inputMessage);
      setInputMessage('');
      console.log('✅ Message sent to session:', sessionId);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message', {
        position: 'top-right',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle close session
  const handleCloseSession = async () => {
    if (window.confirm('Are you sure you want to close this chat session?')) {
      onCloseSession();
    }
  };

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.default',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">User #{session?.userId}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`Session #${sessionId}`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                label={session?.isActive ? 'Active' : 'Closed'}
                size="small"
                color={session?.isActive ? 'success' : 'default'}
              />
              <Typography variant="caption" color="text.secondary">
                {messages.length} messages
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Close session">
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleCloseSession}
              disabled={!session?.isActive}
            >
              Close Session
            </Button>
          </Tooltip>
          <Tooltip title="Close window">
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: 'grey.50',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          },
        }}
      >
        {messages.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            sx={{ color: 'text.secondary' }}
          >
            <Typography variant="body2">No messages yet</Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const isFromAdmin = msg.fromAdmin;
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: isFromAdmin ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    gap: 1,
                    flexDirection: isFromAdmin ? 'row-reverse' : 'row',
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      bgcolor: isFromAdmin ? 'success.main' : 'primary.main',
                      width: 32,
                      height: 32,
                    }}
                  >
                    {isFromAdmin ? <AdminIcon sx={{ fontSize: 18 }} /> : <PersonIcon sx={{ fontSize: 18 }} />}
                  </Avatar>

                  {/* Message Bubble */}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      bgcolor: isFromAdmin ? 'success.light' : 'white',
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 0.5 }}
                    >
                      {isFromAdmin ? 'Admin' : `User #${msg.fromUserId}`}
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {msg.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.5, textAlign: 'right' }}
                    >
                      {formatTime(msg.sentAt)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box display="flex" gap={1} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!session?.isActive || isSending}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !session?.isActive || isSending}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'grey.300',
              },
            }}
          >
            {isSending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
        {!session?.isActive && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            This session is closed. You cannot send messages.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AdminChatWindow;
