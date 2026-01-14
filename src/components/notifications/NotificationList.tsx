'use client';

import { useState } from 'react';
import { NotificationItem } from './NotificationItem';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

interface NotificationListProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationList({
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
}: NotificationListProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="w-96 max-h-96 bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <p className="text-sm">Loading...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <p className="text-sm">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                id={notification.id}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                read={notification.read}
                createdAt={notification.createdAt}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-800 bg-gray-800/50 flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex-1 px-3 py-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Mark all as read
            </button>
          )}
          <button
            disabled={true}
            className="flex-1 px-3 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            View all
          </button>
        </div>
      )}
    </div>
  );
}
