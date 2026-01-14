'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface ProfileHeaderProps {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  level: number;
  experience: number;
  isOnline: boolean;
  lastSeen: string;
  ranking: number;
}

export function ProfileHeader({
  username,
  displayName,
  avatarUrl = '/images/default-avatar.png',
  bio,
  level,
  experience,
  isOnline,
  lastSeen,
  ranking,
}: ProfileHeaderProps) {
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

  const nextLevelExp = (level + 1) * 100;
  const expPercentage = Math.min((experience / nextLevelExp) * 100, 100);

  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar and Basic Info */}
        <div className="flex gap-4 items-start flex-1">
          {/* Avatar */}
          <div className="relative">
            <img
              src={avatarUrl}
              alt={username}
              className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover"
            />
            {/* Online Status Indicator */}
            <div
              className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-gray-950 ${
                isOnline ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />
          </div>

          {/* Username and Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{displayName || username}</h1>
            <p className="text-gray-400 mb-2">@{username}</p>

            {/* Online Status Text */}
            <p className="text-sm mb-3">
              {isOnline ? (
                <span className="text-green-400 font-semibold">🟢 Online</span>
              ) : (
                <span className="text-gray-400">{formatLastSeen(lastSeen)}</span>
              )}
            </p>

            {/* Bio */}
            {bio && <p className="text-gray-300 max-w-md">{bio}</p>}
          </div>
        </div>

        {/* Stats on the Right */}
        <div className="flex gap-4 md:flex-col w-full md:w-auto">
          {/* Level Badge */}
          <div className="flex-1 md:flex-none text-center">
            <div className="text-3xl font-bold text-blue-400">Level {level}</div>
            <p className="text-xs text-gray-400">Rank #{ranking || '-'}</p>
          </div>

          {/* XP Progress */}
          <div className="hidden md:block w-32">
            <div className="text-xs text-gray-400 mb-1">Experience</div>
            <div className="w-full bg-gray-800 rounded-full h-2 mb-1">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${expPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-400">
              {experience}/{nextLevelExp}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile XP Progress */}
      <div className="md:hidden mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Experience</div>
        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${expPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-400">
          {experience}/{nextLevelExp}
        </div>
      </div>
    </Card>
  );
}
