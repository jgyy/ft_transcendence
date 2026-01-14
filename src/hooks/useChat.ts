'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  createdAt: string;
  read: boolean;
}

interface Conversation {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastMessageContent?: string;
  lastMessageDate?: string;
  unreadCount: number;
}

interface ChatUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: string;
}

export function useChat() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!session?.user?.email) return;

    const initSocket = async () => {
      try {
        // Get JWT token from session
        const response = await fetch('/api/auth/session');
        const sessionData = await response.json();

        if (!socketRef.current) {
          socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
            auth: {
              token: sessionData.user?.id || session.user.email,
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
          });

          // Listen for chat events
          socketRef.current.on('chat:message', handleIncomingMessage);
          socketRef.current.on('chat:typing', handleTypingIndicator);
          socketRef.current.on('chat:typing-stop', handleTypingStop);
          socketRef.current.on('chat:read', handleReadReceipt);
          socketRef.current.on('error', (error) => {
            console.error('[Chat] Socket error:', error);
          });
        }
      } catch (error) {
        console.error('[Chat] Failed to initialize socket:', error);
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [session]);

  // Load conversations on mount
  useEffect(() => {
    if (!session?.user?.email) return;
    loadConversations();
  }, [session]);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat?limit=50');
      const data = await response.json();

      if (data.success) {
        setConversations(data.data);
        // Calculate total unread
        const total = data.data.reduce(
          (sum: number, conv: Conversation) => sum + conv.unreadCount,
          0
        );
        setUnreadCount(total);
      }
    } catch (error) {
      console.error('[Chat] Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setMessages([]);

      const response = await fetch(`/api/chat/${userId}?limit=50`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages);
        setCurrentConversation(data.data.user);

        // Update conversation in list (mark as read)
        setConversations((prev) =>
          prev.map((conv) =>
            conv.userId === userId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    } catch (error) {
      console.error('[Chat] Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentConversation || !content.trim()) return;

      try {
        // Optimistically add message to UI
        const optimisticMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          content: content.trim(),
          sender: {
            id: session?.user?.id || '',
            username: session?.user?.name || 'You',
            displayName: session?.user?.name,
            avatarUrl: session?.user?.image,
          },
          createdAt: new Date().toISOString(),
          read: false,
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        // Send via API
        const response = await fetch(
          `/api/chat/${currentConversation.id}/send`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content.trim() }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          // Remove optimistic message on error
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== optimisticMessage.id)
          );
          throw new Error(data.error || 'Failed to send message');
        }

        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? data.data : msg
          )
        );

        // Emit via WebSocket for real-time delivery
        if (socketRef.current) {
          socketRef.current.emit('chat:send', {
            recipientId: currentConversation.id,
            content: content.trim(),
          });
        }
      } catch (error) {
        console.error('[Chat] Error sending message:', error);
      }
    },
    [currentConversation, session]
  );

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await fetch(`/api/chat/messages/${messageId}/read`, {
        method: 'PUT',
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );

      if (socketRef.current && currentConversation) {
        socketRef.current.emit('chat:read', { messageId });
      }
    } catch (error) {
      console.error('[Chat] Error marking message as read:', error);
    }
  }, [currentConversation]);

  const handleIncomingMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
    loadConversations();
  };

  const handleTypingIndicator = (data: { userId: string; username: string }) => {
    setTypingUsers((prev) => new Set(prev).add(data.userId));
  };

  const handleTypingStop = (data: { userId: string }) => {
    setTypingUsers((prev) => {
      const updated = new Set(prev);
      updated.delete(data.userId);
      return updated;
    });
  };

  const handleReadReceipt = (data: { messageId: string }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === data.messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const sendTyping = useCallback(() => {
    if (!currentConversation || !socketRef.current) return;
    socketRef.current.emit('chat:typing', {
      recipientId: currentConversation.id,
    });
  }, [currentConversation]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    unreadCount,
    typingUsers,
    loadConversations,
    loadMessages,
    sendMessage,
    markAsRead,
    sendTyping,
    setCurrentConversation,
  };
}
