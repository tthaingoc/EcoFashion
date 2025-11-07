import { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Badge,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import type { ChatSessionSummaryDto } from '../../../types/chat.types';

interface SessionListProps {
  sessions: ChatSessionSummaryDto[];
  activeSessionId: number | null;
  onSelectSession: (sessionId: number) => void;
  onRefresh: () => void;
}

/**
 * SessionList Component
 * Displays a list of chat sessions (like an inbox)
 */
const SessionList = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onRefresh,
}: SessionListProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Refresh Button */}
      <Box sx={{ p: 1, textAlign: 'right', borderBottom: 1, borderColor: 'divider' }}>
        <Tooltip title="Refresh sessions">
          <IconButton
            size="small"
            onClick={handleRefresh}
            disabled={isRefreshing}
            sx={{
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Session List */}
      <List
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 0,
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
        {sessions.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="200px"
            sx={{ color: 'text.secondary' }}
          >
            <Typography variant="body2">No active chats</Typography>
          </Box>
        ) : (
          sessions.map((session, index) => (
            <Box key={session.sessionId}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeSessionId === session.sessionId}
                  onClick={() => onSelectSession(session.sessionId)}
                  sx={{
                    py: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                  }}
                >
                  {/* Avatar with Unread Badge */}
                  <ListItemAvatar>
                    <Badge
                      badgeContent={session.unreadCount}
                      color="error"
                      overlap="circular"
                    >
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>

                  {/* Session Info */}
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          variant="subtitle2"
                          component="span"
                          sx={{
                            fontWeight: session.unreadCount > 0 ? 700 : 400,
                            flexGrow: 1,
                          }}
                        >
                          User #{session.userId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(session.lastMessageAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: session.unreadCount > 0 ? 600 : 400,
                          }}
                        >
                          {session.lastMessagePreview || 'No messages yet'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                          {/* Session Status */}
                          <Chip
                            icon={<CircleIcon sx={{ fontSize: 10 }} />}
                            label={session.isActive ? 'Active' : 'Closed'}
                            size="small"
                            color={session.isActive ? 'success' : 'default'}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                          {/* Message Count */}
                          <Chip
                            label={`${session.messageCount} msgs`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                          {/* Admin Assigned */}
                          {session.adminId && (
                            <Chip
                              label={`Admin #${session.adminId}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < sessions.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </List>
    </Box>
  );
};

export default SessionList;
