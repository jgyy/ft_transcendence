'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';

interface Achievement {
  id: string;
  name: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string | null;
}

interface ProfileAchievementsProps {
  userId: string;
  limit?: number;
}

export function ProfileAchievements({ userId, limit = 6 }: ProfileAchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ unlocked: 0, total: 0 });

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const response = await fetch(`/api/achievements/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch achievements');

        const data = await response.json();
        // Get only unlocked achievements, sorted by most recent
        const unlocked = data.achievements
          .filter((a: Achievement) => a.isUnlocked)
          .sort((a: Achievement, b: Achievement) => {
            const dateA = new Date(a.unlockedAt || 0).getTime();
            const dateB = new Date(b.unlockedAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, limit);

        setAchievements(unlocked);
        setStats({ unlocked: data.stats.unlocked, total: data.stats.total });
      } catch (err) {
        console.error('Error loading achievements:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, [userId, limit]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-800 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Achievements</h2>
        <span className="text-sm text-gray-400">
          {stats.unlocked}/{stats.total}
        </span>
      </div>

      {achievements.length === 0 ? (
        <Card className="text-center py-8">
          <div className="text-4xl mb-2">🏅</div>
          <p className="text-gray-400">No achievements unlocked yet</p>
        </Card>
      ) : (
        <>
          {/* Grid of recent achievements */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                title={achievement.name}
                className="relative group"
              >
                <div className="aspect-square bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-600 rounded-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform cursor-pointer">
                  {achievement.icon}
                </div>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {achievement.name}
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <a
            href={`/achievements?userId=${userId}`}
            className="block text-center py-2 text-blue-400 hover:text-blue-300 font-semibold text-sm hover:bg-blue-900/20 rounded transition-colors"
          >
            View All Achievements →
          </a>
        </>
      )}
    </div>
  );
}
