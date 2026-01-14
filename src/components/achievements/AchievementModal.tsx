'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    points: number;
    condition?: any;
  } | null;
  isUnlocked: boolean;
  unlockedAt?: string | null;
}

export function AchievementModal({
  isOpen,
  onClose,
  achievement,
  isUnlocked,
  unlockedAt,
}: AchievementModalProps) {
  if (!achievement) return null;

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center">
        {/* Icon */}
        <div className={`text-7xl mb-4 ${!isUnlocked ? 'opacity-40 grayscale' : ''}`}>
          {achievement.icon}
        </div>

        {/* Name */}
        <h2 className="text-2xl font-bold text-white mb-2">{achievement.name}</h2>

        {/* Category */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-900/60 text-blue-200">
            {achievement.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-6">{achievement.description}</p>

        {/* Points */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-3xl">⭐</span>
          <span className="text-2xl font-bold text-yellow-400">{achievement.points} points</span>
        </div>

        {/* Status */}
        <div className="border-t border-gray-700 pt-6">
          {isUnlocked ? (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
              <div className="text-green-400 font-semibold mb-1">✓ Unlocked</div>
              <div className="text-sm text-gray-300">
                {formatDate(unlockedAt)}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 font-semibold mb-1">🔒 Locked</div>
              <div className="text-sm text-gray-400">
                Complete the challenge to unlock this achievement
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        {!isUnlocked && achievement.condition && (
          <div className="mt-6 text-left bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-2">💡 Tips</h3>
            <p className="text-sm text-gray-400">
              Challenge yourself to unlock this achievement. Keep playing and improving
              your skills!
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
