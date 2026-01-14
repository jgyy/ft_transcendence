'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

interface MessageBubbleProps {
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
  onMarkAsRead?: (messageId: string) => void;
}

export function MessageBubble({
  id,
  content,
  sender,
  createdAt,
  read,
  onMarkAsRead,
}: MessageBubbleProps) {
  const { data: session } = useSession();
  const messageRef = useRef<HTMLDivElement>(null);
  const isOwn = sender.id === session?.user?.id;

  // Mark as read when visible
  useEffect(() => {
    if (!isOwn && !read && onMarkAsRead && messageRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onMarkAsRead(id);
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(messageRef.current);
      return () => observer.disconnect();
    }
  }, [id, isOwn, read, onMarkAsRead]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div ref={messageRef} className={`flex gap-3 mb-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isOwn && (
        <img
          src={sender.avatarUrl || '/images/default-avatar.png'}
          alt={sender.username}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-1`}>
        <div
          className={`max-w-xs px-4 py-2 rounded-lg break-words ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-800 text-gray-100 rounded-bl-none'
          }`}
        >
          {!isOwn && (
            <p className="text-xs font-semibold text-gray-300 mb-1">
              {sender.displayName || sender.username}
            </p>
          )}
          <p className="text-sm">{content}</p>
        </div>

        {/* Timestamp and Read Status */}
        <div className={`flex items-center gap-1 text-xs text-gray-400 ${isOwn ? 'flex-row-reverse gap-1' : ''}`}>
          <span>{formatTime(createdAt)}</span>
          {isOwn && (
            read ? (
              <span title="Read">✓✓</span>
            ) : (
              <span title="Sent">✓</span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
