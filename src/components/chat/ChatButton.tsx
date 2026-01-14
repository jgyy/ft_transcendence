'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { ChatModal } from './ChatModal';
import { Badge } from '@/components/ui/Badge';
import { useChat } from '@/hooks/useChat';

export function ChatButton() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useChat();

  if (!session) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-110"
        aria-label="Open chat"
        title="Open messages"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <Badge
            variant="danger"
            size="sm"
            className="absolute -top-2 -right-2 !p-1 !w-6 !h-6 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {/* Chat Modal */}
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
