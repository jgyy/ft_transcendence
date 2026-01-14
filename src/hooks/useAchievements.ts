'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string | null;
}

interface AchievementStats {
  total: number;
  unlocked: number;
  totalPoints: number;
  percentage: number;
}

export function useAchievements(userId?: string) {
  const { data: session } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    total: 0,
    unlocked: 0,
    totalPoints: 0,
    percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const id = userId || session?.user?.id;
        if (!id) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/achievements/user/${id}`);
        if (!response.ok) throw new Error('Failed to fetch achievements');

        const data = await response.json();
        setAchievements(data.achievements);
        setStats(data.stats);
      } catch (err) {
        console.error('Error loading achievements:', err);
        setError(err instanceof Error ? err.message : 'Failed to load achievements');
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, [userId, session?.user?.id]);

  const unlockAchievement = async (achievementId: string) => {
    try {
      const response = await fetch(
        `/api/achievements/${achievementId}/unlock`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unlock achievement');
      }

      // Refresh achievements
      const id = userId || session?.user?.id;
      if (id) {
        const achievementsResponse = await fetch(`/api/achievements/user/${id}`);
        if (achievementsResponse.ok) {
          const data = await achievementsResponse.json();
          setAchievements(data.achievements);
          setStats(data.stats);
        }
      }

      return true;
    } catch (err) {
      console.error('Error unlocking achievement:', err);
      return false;
    }
  };

  return {
    achievements,
    stats,
    isLoading,
    error,
    unlockAchievement,
  };
}
