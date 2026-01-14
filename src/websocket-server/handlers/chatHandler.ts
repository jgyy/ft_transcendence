import { Server, Socket } from 'socket.io';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface AuthSocket extends Socket {
  userId?: string;
  username?: string;
  isAuthenticated?: boolean;
}

const messageSchema = z.object({
  recipientId: z.string(),
  content: z.string().min(1).max(1000),
});

const typingSchema = z.object({
  recipientId: z.string(),
});

export class ChatHandler {
  private io: Server;
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Handle sending a chat message
   */
  async handleSendMessage(
    socket: AuthSocket,
    data: unknown
  ): Promise<void> {
    try {
      if (!socket.userId) return;

      const validation = messageSchema.safeParse(data);
      if (!validation.success) {
        socket.emit('chat:error', {
          error: validation.error.issues[0].message,
        });
        return;
      }

      const { recipientId, content } = validation.data;

      // Validate content
      if (!content.trim()) {
        socket.emit('chat:error', { error: 'Message cannot be empty' });
        return;
      }

      // Check if recipient exists
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        select: { id: true, username: true },
      });

      if (!recipient) {
        socket.emit('chat:error', { error: 'Recipient not found' });
        return;
      }

      // Create message in database
      const message = await prisma.message.create({
        data: {
          content: content.trim(),
          senderId: socket.userId,
          recipientId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Emit to recipient if online
      this.io.to(recipientId).emit('chat:message', {
        id: message.id,
        content: message.content,
        sender: message.sender,
        createdAt: message.createdAt,
        read: false,
      });

      // Confirm to sender
      socket.emit('chat:message-sent', {
        id: message.id,
        content: message.content,
        recipientId,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      socket.emit('chat:error', { error: 'Failed to send message' });
    }
  }

  /**
   * Handle typing indicator
   */
  async handleTyping(socket: AuthSocket, data: unknown): Promise<void> {
    try {
      if (!socket.userId) return;

      const validation = typingSchema.safeParse(data);
      if (!validation.success) return;

      const { recipientId } = validation.data;

      // Clear existing timeout for this user
      const timeoutKey = `${socket.userId}-${recipientId}`;
      const existingTimeout = this.typingTimeouts.get(timeoutKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Notify recipient
      this.io.to(recipientId).emit('chat:typing', {
        userId: socket.userId,
        username: socket.username,
      });

      // Auto-clear typing indicator after 3 seconds
      const timeout = setTimeout(() => {
        this.io.to(recipientId).emit('chat:typing-stop', {
          userId: socket.userId,
        });
        this.typingTimeouts.delete(timeoutKey);
      }, 3000);

      this.typingTimeouts.set(timeoutKey, timeout);
    } catch (error) {
      console.error('[Chat] Error handling typing:', error);
    }
  }

  /**
   * Handle marking message as read
   */
  async handleMarkAsRead(
    socket: AuthSocket,
    data: unknown
  ): Promise<void> {
    try {
      if (!socket.userId) return;

      const validation = z
        .object({
          messageId: z.string(),
        })
        .safeParse(data);

      if (!validation.success) return;

      const { messageId } = validation.data;

      // Update message in database
      const message = await prisma.message.update({
        where: { id: messageId },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      // Notify sender that message was read
      this.io.to(message.senderId).emit('chat:read', {
        messageId,
        readBy: socket.userId,
        readAt: message.readAt,
      });
    } catch (error) {
      console.error('[Chat] Error marking message as read:', error);
    }
  }

  /**
   * Handle user coming online
   */
  async handleOnline(socket: AuthSocket): Promise<void> {
    try {
      if (!socket.userId) return;

      // Broadcast to all users that this user is online
      this.io.emit('chat:user-online', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('[Chat] Error handling online:', error);
    }
  }

  /**
   * Handle user going offline
   */
  async handleOffline(socket: AuthSocket): Promise<void> {
    try {
      if (!socket.userId) return;

      // Broadcast to all users that this user is offline
      this.io.emit('chat:user-offline', {
        userId: socket.userId,
        timestamp: new Date(),
      });

      // Clear any typing timeouts for this user
      const timeoutKeys = Array.from(this.typingTimeouts.keys()).filter((key) =>
        key.startsWith(socket.userId!)
      );
      for (const key of timeoutKeys) {
        const timeout = this.typingTimeouts.get(key);
        if (timeout) {
          clearTimeout(timeout);
          this.typingTimeouts.delete(key);
        }
      }
    } catch (error) {
      console.error('[Chat] Error handling offline:', error);
    }
  }

  /**
   * Setup chat event listeners for a socket
   */
  setupChatListeners(socket: AuthSocket): void {
    // If authenticated, join a user-specific room
    if (socket.userId) {
      socket.join(socket.userId);
    }

    socket.on('chat:send', (data) => this.handleSendMessage(socket, data));
    socket.on('chat:typing', (data) => this.handleTyping(socket, data));
    socket.on('chat:read', (data) => this.handleMarkAsRead(socket, data));
  }
}
