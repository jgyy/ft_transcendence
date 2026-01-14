'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardQuickStats } from '@/components/dashboard/DashboardQuickStats';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { RecentFriends } from '@/components/dashboard/RecentFriends';
import { RecommendedPlayers } from '@/components/dashboard/RecommendedPlayers';
import { OpenTournaments } from '@/components/dashboard/OpenTournaments';
import { Card } from '@/components/ui/Card';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: dashboardData, isLoading, error } = useDashboard();

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 py-12 px-4 flex items-center justify-center">
        <Card className="text-center max-w-md">
          <div className="text-5xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  if (isLoading || !dashboardData.user) {
    return (
      <div className="min-h-screen bg-gray-950 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Skeleton: Header */}
          <div className="mb-8">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-800 rounded w-1/4 animate-pulse" />
          </div>

          {/* Skeleton: Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded animate-pulse" />
            ))}
          </div>

          {/* Skeleton: Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-800 rounded animate-pulse" />
            ))}
          </div>

          {/* Skeleton: Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
            <div className="space-y-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = dashboardData.user!;

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.displayName || user.username}! 👋
          </h1>
          <p className="text-gray-400">
            Here's your gaming dashboard. Let's improve your skills!
          </p>
        </div>

        {/* Quick Stats */}
        <DashboardQuickStats
          level={user.level}
          experience={user.experience}
          wins={user.wins}
          losses={user.losses}
          winStreak={user.winStreak}
          ranking={user.ranking}
        />

        {/* Quick Actions */}
        <DashboardQuickActions />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Activity & Tournaments */}
          <div className="lg:col-span-2 space-y-8">
            {/* Activity Feed */}
            <ActivityFeed
              events={dashboardData.recentActivity || []}
              isLoading={isLoading}
            />

            {/* Open Tournaments */}
            <OpenTournaments
              tournaments={dashboardData.openTournaments}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column - Friends & Recommended */}
          <div className="space-y-8">
            {/* Recent Friends */}
            <RecentFriends
              friends={dashboardData.friends}
              isLoading={isLoading}
            />

            {/* Recommended Players */}
            <RecommendedPlayers
              players={dashboardData.recommendedPlayers}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">
                {user.wins + user.losses}
              </div>
              <p className="text-sm text-gray-400">Total Games</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">
                {Math.round((user.wins / (user.wins + user.losses)) * 100) || 0}%
              </div>
              <p className="text-sm text-gray-400">Win Rate</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">
                Lv. {user.level}
              </div>
              <p className="text-sm text-gray-400">Current Level</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">
                #{user.ranking || '-'}
              </div>
              <p className="text-sm text-gray-400">Global Rank</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
