'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileActions } from '@/components/profile/ProfileActions';
import { MatchHistory } from '@/components/profile/MatchHistory';
import { ProfileAchievements } from '@/components/profile/ProfileAchievements';
import { Card } from '@/components/ui/Card';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const { user, isLoading, error } = useProfile(userId);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 py-12 px-4 flex items-center justify-center">
        <Card className="text-center max-w-md">
          <div className="text-5xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header Skeleton */}
          <div className="bg-gray-800/40 rounded-lg h-48 animate-pulse mb-8" />

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800/40 rounded-lg h-24 animate-pulse" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gray-800/40 rounded-lg h-64 animate-pulse" />
            </div>
            <div className="bg-gray-800/40 rounded-lg h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 py-12 px-4 flex items-center justify-center">
        <Card className="text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">User Not Found</h1>
          <p className="text-gray-400 mb-6">We couldn't find this user's profile</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <ProfileHeader
            username={user.username}
            displayName={user.displayName}
            avatarUrl={user.avatarUrl}
            bio={user.bio}
            level={user.level}
            experience={user.experience}
            isOnline={user.isOnline}
            lastSeen={user.lastSeen}
            ranking={user.ranking}
          />

          {/* Action Buttons */}
          <div className="mb-6">
            <ProfileActions userId={user.id} username={user.username} />
          </div>
        </div>

        {/* Stats */}
        <ProfileStats
          wins={user.wins}
          losses={user.losses}
          draws={user.draws}
          winStreak={user.winStreak}
          highestStreak={user.highestStreak}
          winRate={user.winRate}
          totalGames={user.totalGames}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Match History */}
          <div className="lg:col-span-2">
            <MatchHistory recentGames={user.recentGames} currentUserId={user.id} />
          </div>

          {/* Right Column - Achievements */}
          <div>
            <Card className="h-full">
              <ProfileAchievements userId={user.id} limit={6} />
            </Card>
          </div>
        </div>

        {/* Member Since */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>
            Member since{' '}
            {new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
