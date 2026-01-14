'use client';

import { useEffect, useRef } from 'react';

interface NotificationItemProps {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationItem({
  id,
  type,
  title,
  message,
  read,
  createdAt,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!read && onMarkAsRead && itemRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onMarkAsRead(id);
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(itemRef.current);
      return () => observer.disconnect();
    }
  }, [id, read, onMarkAsRead]);

  const getIcon = () => {
    switch (type) {
      case 'friend_request':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3a6 6 0 016-6h6a6 6 0 016 6v0H9m0 0v-2a4 4 0 018 0v2"
            />
          </svg>
        );
      case 'game_invite':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'achievement':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case 'tournament':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'game_result':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        );
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'friend_request':
        return 'border-blue-800 bg-blue-900/20';
      case 'achievement':
        return 'border-yellow-800 bg-yellow-900/20';
      case 'tournament':
        return 'border-purple-800 bg-purple-900/20';
      case 'game_result':
        return 'border-green-800 bg-green-900/20';
      default:
        return 'border-gray-800 bg-gray-800/20';
    }
  };

  const getIconColorClass = () => {
    switch (type) {
      case 'friend_request':
        return 'text-blue-400';
      case 'achievement':
        return 'text-yellow-400';
      case 'tournament':
        return 'text-purple-400';
      case 'game_result':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      ref={itemRef}
      className={`px-4 py-3 border-l-4 transition-colors hover:bg-gray-700/50 ${getColorClass()} ${!read ? 'border-opacity-100' : 'border-opacity-50 opacity-75'
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={getIconColorClass()}>{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Time */}
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-semibold ${!read ? 'text-white' : 'text-gray-300'}`}>
              {title}
            </h4>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatTime(createdAt)}
            </span>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{message}</p>

          {/* Unread Indicator */}
          {!read && (
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-xs text-blue-400">New</span>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete?.(id)}
          className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0 p-1"
          aria-label="Delete notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
