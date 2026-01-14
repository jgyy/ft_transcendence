'use client';

import { useNotification } from '@/hooks/useNotification';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NotificationItem } from '@/components/notifications/NotificationItem';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotification();

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-gray-400">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter and Actions */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Read
            </button>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <Card>
            <div className="py-12 text-center text-gray-400">
              <p>Loading notifications...</p>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <div className="py-12 text-center text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="text-lg">
                {filter === 'unread'
                  ? 'All caught up!'
                  : filter === 'read'
                    ? 'No read notifications'
                    : 'No notifications yet'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <Card key={notification.id} className="p-0">
                <NotificationItem
                  id={notification.id}
                  type={notification.type}
                  title={notification.title}
                  message={notification.message}
                  read={notification.read}
                  createdAt={notification.createdAt}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
