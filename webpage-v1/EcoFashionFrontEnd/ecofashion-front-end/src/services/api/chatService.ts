import { apiClient, handleApiResponse, handleApiError } from './baseApi';
import type { BaseApiResponse } from './baseApi';
import type {
  ChatSessionDto,
  ChatSessionSummaryDto,
} from '../../types/chat.types';

/**
 * Chat Service for session and message management
 * Matches the backend ChatController API
 */
export class ChatService {
  /**
   * Get or create a chat session for the current user
   * Customer endpoint - returns user's active session with messages
   */
  static async getOrCreateSession(): Promise<ChatSessionDto> {
    try {
      const response = await apiClient.get<BaseApiResponse<ChatSessionDto>>(
        '/Chat/session'
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get all chat sessions (admin only)
   * Returns list of sessions with summary info
   */
  static async getAllSessions(includeInactive: boolean = false): Promise<ChatSessionSummaryDto[]> {
    try {
      const response = await apiClient.get<BaseApiResponse<ChatSessionSummaryDto[]>>(
        '/Chat/sessions',
        { params: { includeInactive } }
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Get messages for a specific session
   * Returns full session with all messages
   */
  static async getSessionMessages(sessionId: number): Promise<ChatSessionDto> {
    try {
      const response = await apiClient.get<BaseApiResponse<ChatSessionDto>>(
        `/Chat/session/${sessionId}/messages`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Mark messages as read for a session
   * Marks unread messages from the other party as read
   */
  static async markAsRead(sessionId: number): Promise<void> {
    try {
      const response = await apiClient.post<BaseApiResponse<void>>(
        `/Chat/session/${sessionId}/mark-read`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Assign admin to a session (admin only)
   * Claims a session for the current admin user
   */
  static async assignAdminToSession(sessionId: number): Promise<void> {
    try {
      const response = await apiClient.post<BaseApiResponse<void>>(
        `/Chat/session/${sessionId}/assign`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Close a chat session (admin only)
   * Marks the session as inactive
   */
  static async closeSession(sessionId: number): Promise<void> {
    try {
      const response = await apiClient.post<BaseApiResponse<void>>(
        `/Chat/session/${sessionId}/close`
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export default ChatService;
