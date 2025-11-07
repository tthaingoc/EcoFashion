import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Stack,
  Badge,
  Fade,
  Avatar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import MinimizeIcon from '@mui/icons-material/Minimize';
import { signalRService, ChatMessage } from '../../services/api/signalrConnection';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import { ChatService } from '../../services/api/chatService';

export default function ChatBox() {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedHistory = useRef(false);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history - get or create session
  const loadChatHistory = async () => {
    if (hasLoadedHistory.current) return;

    try {
      setIsLoadingHistory(true);
      const session = await ChatService.getOrCreateSession();
      setSessionId(session.sessionId);
      setMessages(session.messages);
      hasLoadedHistory.current = true;
      console.log('📜 Loaded chat session:', session.sessionId, 'with', session.messages.length, 'messages');
    } catch (error) {
      console.error('Failed to load chat session:', error);
      toast.error('Failed to load chat session', {
        position: 'bottom-left',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Initialize SignalR connection when user is authenticated
  useEffect(() => {
    // Don't initialize for admins or unauthenticated users
    if (!isAuthenticated || !user || user.role === 'admin') {
      return;
    }

    const initializeConnection = async () => {
      try {
        setIsConnecting(true);

        // Load chat history first
        await loadChatHistory();

        // Check if already connected to avoid state error
        if (signalRService.isConnected()) {
          console.log('✅ SignalR already connected');
          setIsConnected(true);
          setIsConnecting(false);
          return;
        }

        // Get connection and start it
        await signalRService.start();
        setIsConnected(true);

        // Setup message handler
        const handleMessage = (message: ChatMessage) => {
          console.log('📩 New message received:', message);
          setMessages((prev) => {
            // Avoid duplicates
            const exists = prev.some(m => m.id === message.id);
            if (exists) return prev;
            return [...prev, message];
          });

          // Increment unread count if chat is minimized or closed
          if (!isOpen || isMinimized) {
            setUnreadCount((prev) => prev + 1);
          }

          // Show toast notification if chat is closed
          if (!isOpen) {
            toast.info('New message received!', {
              position: 'bottom-left',
              autoClose: 3000,
            });
          }
        };

        signalRService.onReceiveMessage(handleMessage);

        // Cleanup on unmount
        return () => {
          signalRService.offReceiveMessage(handleMessage);
        };
      } catch (error) {
        console.error('Failed to connect to chat:', error);
        toast.error('Failed to connect to chat service', {
          position: 'bottom-left',
        });
        setIsConnected(false);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeConnection();

    // Cleanup: stop connection when component unmounts
    return () => {
      signalRService.stop();
    };
  }, [isAuthenticated, user]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!isConnected) {
      toast.error('Chat is not connected. Please try again.', {
        position: 'bottom-left',
      });
      return;
    }

    if (!sessionId) {
      toast.error('No active chat session', {
        position: 'bottom-left',
      });
      return;
    }

    try {
      // Send message - regular users use SendMessage, admins would use SendMessageToSession
      if (user?.role === 'admin' && sessionId) {
        await signalRService.sendMessageToSession(sessionId, inputMessage);
      } else {
        await signalRService.sendMessage(inputMessage);
      }

      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message', {
        position: 'bottom-left',
      });
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle chat open/close
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      setUnreadCount(0);
    }
  };

  // Toggle minimize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setUnreadCount(0);
    }
  };

  // Don't render if user is not authenticated or is admin
  // Admins should use the dedicated chat dashboard instead
  if (!isAuthenticated || !user || user.role === 'admin') {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1300,
      }}
    >
      {/* Chat Window */}
      <Fade in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            width: 350,
            height: isMinimized ? 60 : 500,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2,
            mb: 1,
            transition: 'height 0.3s ease',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.dark',
                }}
              >
                <ChatIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle1" fontWeight="bold">
                Support Chat
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5}>
              <Tooltip title={isMinimized ? 'Expand' : 'Minimize'}>
                <IconButton
                  size="small"
                  onClick={toggleMinimize}
                  sx={{ color: 'white' }}
                >
                  <MinimizeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton
                  size="small"
                  onClick={toggleChat}
                  sx={{ color: 'white' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {(isConnecting || isLoadingHistory) && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={30} />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {isLoadingHistory ? 'Loading chat history...' : 'Connecting to chat...'}
                    </Typography>
                  </Box>
                )}

                {!isConnecting && !isLoadingHistory && !isConnected && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="error">
                      Failed to connect to chat service
                    </Typography>
                  </Box>
                )}

                {!isLoadingHistory && isConnected && messages.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      No messages yet. Start a conversation!
                    </Typography>
                  </Box>
                )}

                {messages.map((msg) => {
                  const isCurrentUser = msg.fromUserId === user.userId.toString();

                  // Get sender info
                  const senderEmail = isCurrentUser ? user.email : 'Admin Support';
                  const senderAvatar = isCurrentUser
                    ? (user.avatarUrl || user.email?.charAt(0).toUpperCase())
                    : 'A';

                  return (
                    <Box
                      key={msg.id}
                      sx={{
                        display: 'flex',
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                        mb: 2,
                        gap: 1,
                        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                      }}
                    >
                      {/* Avatar */}
                      <Avatar
                        src={isCurrentUser ? user.avatarUrl : undefined}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: isCurrentUser ? 'primary.main' : 'success.main',
                          fontSize: '0.875rem',
                        }}
                      >
                        {senderAvatar}
                      </Avatar>

                      {/* Message Bubble */}
                      <Box sx={{ maxWidth: '70%' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mb: 0.5,
                            px: 0.5,
                            color: 'text.secondary',
                            fontSize: '0.7rem',
                          }}
                        >
                          {senderEmail}
                        </Typography>
                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: isCurrentUser ? 'primary.main' : 'white',
                            color: isCurrentUser ? 'white' : 'text.primary',
                            borderRadius: 2,
                            boxShadow: 1,
                          }}
                        >
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {msg.text}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.7,
                              fontSize: '0.65rem',
                            }}
                          >
                            {new Date(msg.sentAt).toLocaleTimeString()}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box
                sx={{
                  p: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!isConnected}
                    multiline
                    maxRows={3}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || !isConnected}
                  >
                    <SendIcon />
                  </IconButton>
                </Stack>
              </Box>
            </>
          )}
        </Paper>
      </Fade>

      {/* Floating Chat Button */}
      {!isOpen && (
        <Tooltip title="Chat with support">
          <IconButton
            onClick={toggleChat}
            sx={{
              width: 60,
              height: 60,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              boxShadow: 4,
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <ChatIcon fontSize="large" />
            </Badge>
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
