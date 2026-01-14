'use client';

import React from 'react';

interface AchievementCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string | null;
  onClick?: () => void;
}

export function AchievementCard({
  id,
  name,
  description,
  icon,
  category,
  points,
  isUnlocked,
  unlockedAt,
  onClick,
}: AchievementCardProps) {
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg border-2 p-4 transition-all duration-300 cursor-pointer
        ${
          isUnlocked
            ? 'border-blue-600 bg-gradient-to-br from-blue-900/30 to-blue-900/10 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/25'
            : 'border-gray-700 bg-gray-800/40 hover:border-gray-600 hover:bg-gray-800/60 opacity-75'
        }
      `}
    >
      {/* Icon */}
      <div className="mb-3 text-4xl">{icon}</div>

      {/* Name and Points */}
      <h3 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-gray-300'}`}>
        {name}
      </h3>

      {/* Category Badge */}
      <div className="mb-2 inline-block">
        <span
          className={`text-xs px-2 py-1 rounded font-medium ${
            isUnlocked
              ? 'bg-blue-900/60 text-blue-200'
              : 'bg-gray-700/60 text-gray-300'
          }`}
        >
          {category}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{description}</p>

      {/* Points and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-lg">⭐</span>
          <span className={`text-sm font-semibold ${isUnlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
            {points}
          </span>
        </div>

        {isUnlocked && (
          <div className="text-right">
            <div className="text-xs text-gray-400">{formatDate(unlockedAt)}</div>
            <div className="flex items-center gap-1 text-xs text-green-400 font-semibold">
              <span>✓</span>
              Unlocked
            </div>
          </div>
        )}
      </div>

      {/* Locked Indicator */}
      {!isUnlocked && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-500 text-center">🔒 Locked</div>
        </div>
      )}
    </div>
  );
}
