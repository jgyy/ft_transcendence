'use client';

import React from 'react';

interface AchievementProgressProps {
  current: number;
  target: number;
  label?: string;
  showPercentage?: boolean;
}

export function AchievementProgress({
  current,
  target,
  label,
  showPercentage = true,
}: AchievementProgressProps) {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  const isComplete = current >= target;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          {showPercentage && (
            <span className={`text-sm font-semibold ${isComplete ? 'text-green-400' : 'text-gray-400'}`}>
              {percentage}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative w-full bg-gray-800 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-blue-500 to-purple-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {current}/{target}
        </span>
        {isComplete && <span className="text-green-400 font-semibold">✓ Complete</span>}
      </div>
    </div>
  );
}
