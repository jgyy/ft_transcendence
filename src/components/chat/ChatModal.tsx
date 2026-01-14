'use client';

import { useSession } from 'next-auth/react';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { useChat } from '@/hooks/useChat';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { data: session } = useSession();
  const {
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
  } = useChat();

  if (!session) {
    return null;
  }

  const handleSelectConversation = (userId: string) => {
    loadMessages(userId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeButton={true}>
      <div className="w-screen max-w-4xl h-[70vh] md:h-[80vh] flex overflow-hidden">
        {/* Desktop: Two-column layout */}
        <div className="hidden md:flex w-full">
          <ConversationList
            conversations={conversations}
            selectedUserId={currentConversation?.id || null}
            isLoading={isLoading}
            onSelectConversation={handleSelectConversation}
            onRefresh={loadConversations}
          />
          <ChatWindow
            user={currentConversation}
            messages={messages}
            typingUsers={typingUsers}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            onMarkAsRead={markAsRead}
            onTyping={sendTyping}
          />
        </div>

        {/* Mobile: Single column with back button */}
        <div className="flex md:hidden w-full">
          {currentConversation ? (
            <ChatWindow
              user={currentConversation}
              messages={messages}
              typingUsers={typingUsers}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              onMarkAsRead={markAsRead}
              onTyping={sendTyping}
              onClose={() => setCurrentConversation(null)}
            />
          ) : (
            <ConversationList
              conversations={conversations}
              selectedUserId={currentConversation?.id || null}
              isLoading={isLoading}
              onSelectConversation={handleSelectConversation}
              onRefresh={loadConversations}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
