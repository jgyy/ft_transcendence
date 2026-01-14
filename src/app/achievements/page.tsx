'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementList } from '@/components/achievements/AchievementList';
import { Card } from '@/components/ui/Card';

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { achievements, stats, isLoading } = useAchievements();

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Achievements</h1>
          <p className="text-gray-400">
            Unlock achievements by completing challenges and improving your skills
          </p>
        </div>

        {!isLoading && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Achievements</div>
                  <div className="text-2xl font-bold text-white">
                    {stats.unlocked}/{stats.total}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Completion</div>
                  <div className="text-2xl font-bold text-blue-400">{stats.percentage}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Points</div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.totalPoints}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Remaining</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.max(0, stats.total - stats.unlocked)}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-300">Progress</span>
                  <span className="text-xs text-gray-400">
                    {stats.unlocked} of {stats.total}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        <AchievementList achievements={achievements} isLoading={isLoading} />
      </div>
    </div>
  );
}
