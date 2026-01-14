'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { Button } from '@/components/ui/Button';

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

interface ChatUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: string;
}

interface ChatWindowProps {
  user: ChatUser | null;
  messages: ChatMessage[];
  typingUsers: Set<string>;
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onTyping: () => void;
  onClose?: () => void;
}

export function ChatWindow({
  user,
  messages,
  typingUsers,
  isLoading,
  onSendMessage,
  onMarkAsRead,
  onTyping,
  onClose,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <p className="text-lg">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  const formatLastSeen = (date: string) => {
    const lastSeenDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - lastSeenDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return lastSeenDate.toLocaleDateString();
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={user.avatarUrl || '/images/default-avatar.png'}
            alt={user.username}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-white">
              {user.displayName || user.username}
            </h3>
            <p className="text-xs text-gray-400">
              {user.isOnline ? (
                <span className="text-green-400">Online</span>
              ) : (
                <>Last seen {formatLastSeen(user.lastSeen)}</>
              )}
            </p>
          </div>
        </div>

        {/* Close Button (mobile) */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="md:hidden"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                id={message.id}
                content={message.content}
                sender={message.sender}
                createdAt={message.createdAt}
                read={message.read}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
            {typingUsers.size > 0 && (
              <TypingIndicator users={Array.from(typingUsers)} />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSend={onSendMessage}
        onTyping={onTyping}
        disabled={isLoading}
        placeholder={`Message ${user.displayName || user.username}...`}
      />
    </div>
  );
}
