import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Container,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { toast } from "react-toastify";
import ChatService from "../../../services/api/chatService";
import { signalRService } from "../../../services/api/signalrConnection";
import type { ChatSessionSummaryDto } from "../../../types/chat.types";
import SessionList from "./SessionList";
import AdminChatWindow from "./AdminChatWindow";

/**
 * Admin Chat Dashboard Component
 * Shows list of active chat sessions and allows admin to open/manage them
 */
const AdminChatDashboard = () => {
  const [sessions, setSessions] = useState<ChatSessionSummaryDto[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all active sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Setup SignalR connection and listeners
  useEffect(() => {
    const setupSignalR = async () => {
      try {
        setIsConnecting(true);

        // Connect to SignalR if not already connected
        if (!signalRService.isConnected()) {
          await signalRService.start();
          console.log("✅ Admin connected to SignalR");
        }

        // Listen for new sessions
        const handleNewSession = (data: {
          sessionId: number;
          userId: string;
          createdAt: string;
        }) => {
          console.log("🆕 New session created:", data);
          toast.info(`New chat from user ${data.userId}`, {
            position: "top-right",
          });
          // Reload sessions to show the new one
          loadSessions();
        };

        // Listen for new message notifications
        const handleNewMessage = (data: {
          sessionId: number;
          userId: string;
          messagePreview: string;
        }) => {
          console.log("💬 New message in session:", data);
          toast.info(
            `New message from user ${data.userId}: ${data.messagePreview}`,
            {
              position: "top-right",
            }
          );
          // Reload sessions to update last message
          loadSessions();
        };

        // Register event handlers
        signalRService.onNewSession(handleNewSession);
        signalRService.onNewMessageNotification(handleNewMessage);

        setIsConnecting(false);

        // Cleanup on unmount
        return () => {
          signalRService.offNewSession(handleNewSession);
          signalRService.offNewMessageNotification(handleNewMessage);
        };
      } catch (error) {
        console.error("❌ Failed to setup SignalR:", error);
        setIsConnecting(false);
        toast.error("Failed to connect to chat server", {
          position: "top-right",
        });
      }
    };

    setupSignalR();
  }, []);

  // Load sessions from API
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ChatService.getAllSessions(false); // Only active sessions
      setSessions(data);
      console.log("📋 Loaded", data.length, "active sessions");
    } catch (err) {
      const errorMessage = "Failed to load chat sessions";
      console.error("❌", errorMessage, err);
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle session selection
  const handleSelectSession = (sessionId: number) => {
    setActiveSessionId(sessionId);
  };

  // Handle closing a session
  const handleCloseSession = async (sessionId: number) => {
    try {
      await ChatService.closeSession(sessionId);
      toast.success("Session closed successfully", {
        position: "top-right",
      });
      // If this was the active session, clear it
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
      // Reload sessions
      loadSessions();
    } catch (error) {
      console.error("❌ Failed to close session:", error);
      toast.error("Failed to close session", {
        position: "top-right",
      });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chat Management Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage customer support conversations
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      )}

      {/* Connecting State */}
      {isConnecting && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Connecting to chat server...
        </Alert>
      )}

      {/* Main Content */}
      {!isLoading && (
        <Grid container spacing={2} sx={{ height: "calc(100vh - 200px)" }}>
          {/* Left Panel - Session List */}
          <Grid>
            <Paper
              elevation={3}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Typography variant="h6">
                  Active Chats ({sessions.length})
                </Typography>
              </Box>
              <SessionList
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onRefresh={loadSessions}
              />
            </Paper>
          </Grid>

          {/* Right Panel - Chat Window */}
          <Grid>
            <Paper
              elevation={3}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {activeSessionId ? (
                <AdminChatWindow
                  sessionId={activeSessionId}
                  onClose={() => setActiveSessionId(null)}
                  onCloseSession={() => handleCloseSession(activeSessionId)}
                />
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                  sx={{ color: "text.secondary" }}
                >
                  <Box textAlign="center">
                    <Typography variant="h6" gutterBottom>
                      No chat selected
                    </Typography>
                    <Typography variant="body2">
                      Select a chat from the list to start conversation
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AdminChatDashboard;
