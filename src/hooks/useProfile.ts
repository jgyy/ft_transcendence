'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
  level: number;
  experience: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  highestStreak: number;
  ranking: number;
  createdAt: string;
  updatedAt: string;
  totalGames: number;
  winRate: number;
  recentGames: any[];
}

export function useProfile(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        setUser(data.data.user);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  return { user, isLoading, error };
}
