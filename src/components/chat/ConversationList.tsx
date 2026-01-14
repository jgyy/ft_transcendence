'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

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

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId: string | null;
  isLoading: boolean;
  onSelectConversation: (userId: string) => void;
  onRefresh?: () => void;
}

export function ConversationList({
  conversations,
  selectedUserId,
  isLoading,
  onSelectConversation,
  onRefresh,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const formatLastMessage = (message?: string, date?: string) => {
    if (!message) return 'No messages yet';
    if (message.length > 40) return `${message.substring(0, 40)}...`;
    return message;
  };

  const formatDate = (date?: string) => {
    if (!date) return '';
    const msgDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - msgDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full md:w-80 flex flex-col bg-gray-900 border-r border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white mb-4">Messages</h2>

        {/* Search */}
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.userId}
                onClick={() => onSelectConversation(conversation.userId)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedUserId === conversation.userId
                    ? 'bg-gray-800'
                    : 'hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        conversation.avatarUrl || '/images/default-avatar.png'
                      }
                      alt={conversation.username}
                      className="w-10 h-10 rounded-full"
                    />
                    {conversation.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-gray-900" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-white truncate">
                        {conversation.displayName || conversation.username}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(conversation.lastMessageDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {formatLastMessage(
                        conversation.lastMessageContent,
                        conversation.lastMessageDate
                      )}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {conversation.unreadCount > 0 && (
                    <Badge
                      variant="primary"
                      size="sm"
                      className="flex-shrink-0"
                    >
                      {conversation.unreadCount > 99
                        ? '99+'
                        : conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isLoading && conversations.length > 0 && (
        <div className="border-t border-gray-800 p-4">
          <button
            onClick={onRefresh}
            className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
