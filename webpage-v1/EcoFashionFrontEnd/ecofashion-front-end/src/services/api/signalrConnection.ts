import * as signalR from '@microsoft/signalr';
import { AuthService } from './authService';
import type { ChatMessageDto } from '../../types/chat.types';

// Re-export ChatMessageDto as ChatMessage for backward compatibility
export type ChatMessage = ChatMessageDto;

// SignalR connection class
class SignalRConnectionService {
  private connection: signalR.HubConnection | null = null;
  private hubUrl: string;

  constructor() {
    // Use Vite proxy in development (empty string = same origin)
    // In production, use VITE_API_BASE_URL without /api suffix
    if (import.meta.env.DEV) {
      // Development: use Vite proxy at /chathub
      this.hubUrl = '/chathub';
    } else {
      // Production: use full backend URL
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5148';
      const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, '');
      this.hubUrl = `${cleanBaseUrl}/chathub`;
    }

    console.log('🔌 SignalR Hub URL:', this.hubUrl);
  }

  /**
   * Build and return the SignalR connection
   * Claims JWT token from localStorage and passes it to the hub
   */
  public getConnection(): signalR.HubConnection {
    if (this.connection) {
      return this.connection;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => {
          // Get token from localStorage (AuthService stores it there)
          const token = AuthService.getToken();
          if (!token) {
            console.warn('⚠️ No auth token found for SignalR connection');
            return '';
          }
          return token;
        },
        // Skip negotiation and use WebSocket directly (faster)
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        // Custom retry delays: 0s, 2s, 5s, 10s, then 10s intervals
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.elapsedMilliseconds < 60000) {
            // First minute: quick retries
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 10000);
          } else {
            // After 1 minute: retry every 10 seconds
            return 10000;
          }
        },
      })
      .configureLogging(
        import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning
      )
      .build();

    // Setup connection event handlers
    this.setupConnectionHandlers();

    return this.connection;
  }

  /**
   * Setup connection lifecycle event handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    this.connection.onclose((error) => {
      console.log('❌ SignalR connection closed', error);
    });

    this.connection.onreconnecting((error) => {
      console.log('🔄 SignalR reconnecting...', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('✅ SignalR reconnected. Connection ID:', connectionId);
    });
  }

  /**
   * Start the SignalR connection
   */
  public async start(): Promise<void> {
    const connection = this.getConnection();

    if (connection.state === signalR.HubConnectionState.Connected) {
      console.log('✅ SignalR already connected');
      return;
    }

    if (connection.state === signalR.HubConnectionState.Connecting) {
      console.log('⏳ SignalR connection already in progress');
      return;
    }

    try {
      await connection.start();
      console.log('✅ SignalR Connected successfully!');
      console.log('Connection ID:', connection.connectionId);
    } catch (error) {
      console.error('❌ SignalR Connection Error:', error);
      throw error;
    }
  }

  /**
   * Stop the SignalR connection
   */
  public async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('✅ SignalR connection stopped');
      } catch (error) {
        console.error('❌ Error stopping SignalR connection:', error);
      } finally {
        this.connection = null;
      }
    }
  }

  /**
   * Register event handler for receiving messages
   */
  public onReceiveMessage(callback: (message: ChatMessage) => void): void {
    const connection = this.getConnection();
    connection.on('ReceiveMessage', callback);
  }

  /**
   * Remove event handler for receiving messages
   */
  public offReceiveMessage(callback: (message: ChatMessage) => void): void {
    const connection = this.getConnection();
    connection.off('ReceiveMessage', callback);
  }

  /**
   * Send message (for regular users - sends to their session)
   */
  public async sendMessage(text: string): Promise<void> {
    const connection = this.getConnection();

    if (connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }

    try {
      await connection.invoke('SendMessage', text);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send message to a specific session (for admins)
   */
  public async sendMessageToSession(sessionId: number, text: string): Promise<void> {
    const connection = this.getConnection();

    if (connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }

    try {
      await connection.invoke('SendMessageToSession', sessionId, text);
    } catch (error) {
      console.error('❌ Error sending message to session:', error);
      throw error;
    }
  }

  /**
   * Join a session (for admins)
   */
  public async joinSession(sessionId: number): Promise<void> {
    const connection = this.getConnection();

    if (connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }

    try {
      await connection.invoke('JoinSession', sessionId);
    } catch (error) {
      console.error('❌ Error joining session:', error);
      throw error;
    }
  }

  /**
   * Leave a session (for admins)
   */
  public async leaveSession(sessionId: number): Promise<void> {
    const connection = this.getConnection();

    if (connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }

    try {
      await connection.invoke('LeaveSession', sessionId);
    } catch (error) {
      console.error('❌ Error leaving session:', error);
      throw error;
    }
  }

  /**
   * Send typing indicator
   */
  public async sendTyping(sessionId?: number): Promise<void> {
    const connection = this.getConnection();

    if (connection.state !== signalR.HubConnectionState.Connected) {
      return; // Typing indicators are not critical
    }

    try {
      await connection.invoke('Typing', sessionId);
    } catch (error) {
      console.error('❌ Error sending typing indicator:', error);
      // Don't throw - typing indicators are not critical
    }
  }

  /**
   * Register handler for typing indicator
   */
  public onUserTyping(callback: (data: { sessionId: number; userId: string; isAdmin: boolean }) => void): void {
    const connection = this.getConnection();
    connection.on('UserTyping', callback);
  }

  /**
   * Remove handler for typing indicator
   */
  public offUserTyping(callback: (data: { sessionId: number; userId: string; isAdmin: boolean }) => void): void {
    const connection = this.getConnection();
    connection.off('UserTyping', callback);
  }

  /**
   * Register handler for new session notifications (admins only)
   */
  public onNewSession(callback: (data: { sessionId: number; userId: string; createdAt: string }) => void): void {
    const connection = this.getConnection();
    connection.on('NewSession', callback);
  }

  /**
   * Remove handler for new session notifications
   */
  public offNewSession(callback: (data: { sessionId: number; userId: string; createdAt: string }) => void): void {
    const connection = this.getConnection();
    connection.off('NewSession', callback);
  }

  /**
   * Register handler for new message notifications (admins only)
   */
  public onNewMessageNotification(callback: (data: { sessionId: number; userId: string; messagePreview: string }) => void): void {
    const connection = this.getConnection();
    connection.on('NewMessageNotification', callback);
  }

  /**
   * Remove handler for new message notifications
   */
  public offNewMessageNotification(callback: (data: { sessionId: number; userId: string; messagePreview: string }) => void): void {
    const connection = this.getConnection();
    connection.off('NewMessageNotification', callback);
  }

  /**
   * Register handler for errors
   */
  public onError(callback: (error: { message: string; details?: string }) => void): void {
    const connection = this.getConnection();
    connection.on('Error', callback);
  }

  /**
   * Remove handler for errors
   */
  public offError(callback: (error: { message: string; details?: string }) => void): void {
    const connection = this.getConnection();
    connection.off('Error', callback);
  }

  /**
   * Get current connection state
   */
  public getState(): signalR.HubConnectionState {
    return this.connection?.state || signalR.HubConnectionState.Disconnected;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
const signalRService = new SignalRConnectionService();

// Export the service and class
export { signalRService };
export default SignalRConnectionService;
