/**
 * Chat DTOs matching backend structure
 */

/**
 * Chat message DTO
 */
export interface ChatMessageDto {
  id: number;
  chatSessionId: number;
  fromUserId: string;
  text: string;
  sentAt: string; // DateTimeOffset from backend as ISO string
  fromAdmin: boolean;
  isRead: boolean;
}

/**
 * Chat session DTO with full message history
 */
export interface ChatSessionDto {
  sessionId: number;
  userId: string;
  adminId?: string;
  isActive: boolean;
  createdAt: string; // DateTimeOffset from backend as ISO string
  lastMessageAt: string; // DateTimeOffset from backend as ISO string
  messages: ChatMessageDto[];
}

/**
 * Chat session summary DTO (for admin list view)
 */
export interface ChatSessionSummaryDto {
  sessionId: number;
  userId: string;
  adminId?: string;
  isActive: boolean;
  createdAt: string; // DateTimeOffset from backend as ISO string
  lastMessageAt: string; // DateTimeOffset from backend as ISO string
  unreadCount: number;
  lastMessage?: ChatMessageDto;
}

/**
 * Create message request
 */
export interface CreateMessageRequest {
  text: string;
}
