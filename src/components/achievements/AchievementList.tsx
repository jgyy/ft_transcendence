'use client';

import React, { useState, useMemo } from 'react';
import { AchievementCard } from './AchievementCard';
import { AchievementModal } from './AchievementModal';
import { Input } from '@/components/ui/Input';

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

interface AchievementListProps {
  achievements: Achievement[];
  isLoading?: boolean;
}

const CATEGORIES = ['All', 'Beginner', 'Winning', 'Competitive', 'Social', 'Master', 'Special'];

export function AchievementList({ achievements, isLoading }: AchievementListProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [filterUnlocked, setFilterUnlocked] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = useMemo(() => {
    return achievements.filter((achievement) => {
      const matchesCategory = selectedCategory === 'All' || achievement.category === selectedCategory;
      const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterUnlocked === 'all' ||
        (filterUnlocked === 'unlocked' && achievement.isUnlocked) ||
        (filterUnlocked === 'locked' && !achievement.isUnlocked);

      return matchesCategory && matchesSearch && matchesFilter;
    });
  }, [achievements, selectedCategory, searchQuery, filterUnlocked]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalPoints = achievements.reduce(
    (sum, a) => sum + (a.isUnlocked ? a.points : 0),
    0
  );
  const maxPoints = achievements.reduce((sum, a) => sum + a.points, 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800/40 rounded-lg h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-800 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Achievements Unlocked</div>
          <div className="text-3xl font-bold text-white">
            {unlockedCount}/{achievements.length}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {Math.round((unlockedCount / achievements.length) * 100)}% complete
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 border border-yellow-800 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Total Points</div>
          <div className="text-3xl font-bold text-yellow-400">
            {totalPoints}/{maxPoints}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0}% of max
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-800 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Next Goal</div>
          <div className="text-3xl font-bold text-purple-400">
            {unlockedCount < achievements.length ? achievements.length - unlockedCount : 0}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {unlockedCount < achievements.length
              ? `${achievements.length - unlockedCount} remaining`
              : 'All unlocked!'}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search achievements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Category</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Status</h3>
          <div className="flex gap-2">
            {(['all', 'unlocked', 'locked'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterUnlocked(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterUnlocked === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {status === 'all' && 'All'}
                {status === 'unlocked' && `Unlocked (${unlockedCount})`}
                {status === 'locked' && `Locked (${achievements.length - unlockedCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-400">No achievements found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              {...achievement}
              onClick={() => setSelectedAchievement(achievement)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AchievementModal
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
        achievement={selectedAchievement}
        isUnlocked={selectedAchievement?.isUnlocked || false}
        unlockedAt={selectedAchievement?.unlockedAt}
      />
    </>
  );
}
