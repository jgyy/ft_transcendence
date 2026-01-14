'use client';

import React, { useEffect } from 'react';

interface AchievementUnlockToastProps {
  achievement: {
    name: string;
    description: string;
    icon: string;
    points: number;
  };
  onClose?: () => void;
  duration?: number;
}

export function AchievementUnlockToast({
  achievement,
  onClose,
  duration = 5000,
}: AchievementUnlockToastProps) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-24 right-4 max-w-sm animate-bounce">
      <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 border-2 border-yellow-600 rounded-lg p-4 shadow-2xl shadow-yellow-900/50">
        {/* Unlock Animation Background */}
        <div className="absolute inset-0 rounded-lg bg-yellow-500/10 animate-pulse" />

        {/* Content */}
        <div className="relative flex items-center gap-4">
          {/* Icon */}
          <div className="text-4xl animate-bounce">{achievement.icon}</div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">Achievement Unlocked!</h3>
            <p className="text-yellow-200 text-sm font-semibold">{achievement.name}</p>
            <p className="text-yellow-100/80 text-xs mt-1">{achievement.description}</p>
          </div>

          {/* Points Badge */}
          <div className="flex flex-col items-center gap-1 px-3 py-2 bg-yellow-900/40 rounded">
            <span className="text-lg">⭐</span>
            <span className="font-bold text-yellow-300 text-sm">+{achievement.points}</span>
          </div>
        </div>

        {/* Animated Border */}
        <div className="absolute inset-0 rounded-lg border-2 border-yellow-400/0 animate-[pulse_2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
