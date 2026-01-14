'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface DashboardData {
  user: {
    id: string;
    username: string;
    displayName?: string;
    level: number;
    experience: number;
    wins: number;
    losses: number;
    winStreak: number;
    ranking: number;
  };
  friends: any[];
  recentActivity: any[];
  recommendedPlayers: any[];
  openTournaments: any[];
}

export function useDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<Partial<DashboardData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user profile
        const userResponse = await fetch(`/api/users/${session.user.id}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userData = await userResponse.json();

        // Fetch friends
        const friendsResponse = await fetch('/api/users/friends');
        const friendsData = friendsResponse.ok ? await friendsResponse.json() : { data: { friends: [] } };

        // Fetch tournaments
        const tournamentsResponse = await fetch('/api/tournaments?status=REGISTRATION&limit=3');
        const tournamentsData = tournamentsResponse.ok
          ? await tournamentsResponse.json()
          : { data: [] };

        setData({
          user: userData.data.user,
          friends: friendsData.data.friends || [],
          recentActivity: [], // Activity feed - can be populated with game/achievement events
          recommendedPlayers: [], // Recommended players - can be populated with non-friends
          openTournaments: Array.isArray(tournamentsData.data)
            ? tournamentsData.data
            : tournamentsData.data?.tournaments || [],
        });
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [session?.user?.id]);

  return { data, isLoading, error };
}
