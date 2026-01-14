'use client';

import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { useNotification } from '@/hooks/useNotification';
import { NotificationList } from './NotificationList';
import { Badge } from '@/components/ui/Badge';

export function NotificationBell() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotification();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  if (!session) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <Badge
            variant="danger"
            size="sm"
            className="absolute -top-1 -right-1 w-5 h-5 !p-0 flex items-center justify-center !rounded-full"
          >
            <span className="text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </Badge>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50">
          <NotificationList
            notifications={notifications}
            unreadCount={unreadCount}
            isLoading={isLoading}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            onMarkAllAsRead={markAllAsRead}
          />
        </div>
      )}
    </div>
  );
}
