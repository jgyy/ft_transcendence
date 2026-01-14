'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface ActivityEvent {
  id: string;
  type: 'game' | 'achievement' | 'friend' | 'tournament';
  title: string;
  description: string;
  icon: string;
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  timestamp: string;
  link?: string;
}

interface ActivityFeedProps {
  events?: ActivityEvent[];
  isLoading?: boolean;
}

export function ActivityFeed({ events = [], isLoading = false }: ActivityFeedProps) {
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'game':
        return 'text-blue-400';
      case 'achievement':
        return 'text-yellow-400';
      case 'friend':
        return 'text-purple-400';
      case 'tournament':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Activity Feed</h2>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800/40 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="text-center py-8">
        <div className="text-4xl mb-2">🌟</div>
        <p className="text-gray-400">No activity yet. Start playing to populate your feed!</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-white mb-4">Activity Feed</h2>
      <div className="space-y-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={event.link || '#'}
            className={`block p-3 bg-gray-800/40 border border-gray-700/50 rounded-lg hover:bg-gray-800/60 transition-colors ${
              !event.link ? 'cursor-default' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar or Icon */}
              {event.user?.avatarUrl ? (
                <img
                  src={event.user.avatarUrl}
                  alt={event.user.username}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className={`text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center`}>
                  {event.icon}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm ${getTypeColor(event.type)}`}>
                  {event.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                  {event.description}
                </p>
              </div>

              {/* Time */}
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatTime(event.timestamp)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/activity"
        className="block text-center py-2 text-blue-400 hover:text-blue-300 text-sm font-semibold mt-4 hover:bg-blue-900/20 rounded transition-colors"
      >
        View All Activity →
      </Link>
    </Card>
  );
}
