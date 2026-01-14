'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface Friend {
  id: string;
  username: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: string;
  level: number;
}

interface RecentFriendsProps {
  friends?: Friend[];
  isLoading?: boolean;
}

export function RecentFriends({ friends = [], isLoading = false }: RecentFriendsProps) {
  const formatLastSeen = (dateString: string) => {
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

  if (isLoading) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Friends</h2>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800/40 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (friends.length === 0) {
    return (
      <Card className="text-center py-8">
        <div className="text-4xl mb-2">👥</div>
        <p className="text-gray-400 mb-4">No friends yet</p>
        <Link
          href="/players"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Find Friends
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Friends ({friends.length})</h2>
        <Link
          href="/friends"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {friends.slice(0, 4).map((friend) => (
          <Link
            key={friend.id}
            href={`/users/${friend.id}`}
            className="p-3 bg-gray-800/40 border border-gray-700/50 rounded-lg hover:bg-gray-800/60 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={friend.avatarUrl || '/images/default-avatar.png'}
                  alt={friend.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {friend.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm truncate">
                  {friend.username}
                </h3>
                <p className="text-xs text-gray-400">
                  {friend.isOnline ? (
                    <span className="text-green-400">Online</span>
                  ) : (
                    <span>{formatLastSeen(friend.lastSeen)}</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Lv. {friend.level}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
