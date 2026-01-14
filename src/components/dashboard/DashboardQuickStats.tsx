'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface DashboardQuickStatsProps {
  level: number;
  experience: number;
  wins: number;
  losses: number;
  winStreak: number;
  ranking?: number;
}

export function DashboardQuickStats({
  level,
  experience,
  wins,
  losses,
  winStreak,
  ranking,
}: DashboardQuickStatsProps) {
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const nextLevelExp = (level + 1) * 100;
  const expPercentage = Math.min((experience / nextLevelExp) * 100, 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {/* Level */}
      <Card className="text-center bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-blue-800/50">
        <div className="text-3xl font-bold text-blue-400">Lv. {level}</div>
        <div className="text-xs text-gray-400 mt-1">Your Level</div>
      </Card>

      {/* Rank */}
      <Card className="text-center bg-gradient-to-br from-purple-900/30 to-purple-900/10 border-purple-800/50">
        <div className="text-3xl font-bold text-purple-400">#{ranking || '-'}</div>
        <div className="text-xs text-gray-400 mt-1">Ranking</div>
      </Card>

      {/* Wins */}
      <Card className="text-center bg-gradient-to-br from-green-900/30 to-green-900/10 border-green-800/50">
        <div className="text-3xl font-bold text-green-400">{wins}</div>
        <div className="text-xs text-gray-400 mt-1">Wins</div>
      </Card>

      {/* Win Rate */}
      <Card className="text-center bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 border-yellow-800/50">
        <div className="text-3xl font-bold text-yellow-400">{winRate}%</div>
        <div className="text-xs text-gray-400 mt-1">Win Rate</div>
      </Card>

      {/* Streak */}
      <Card className="text-center bg-gradient-to-br from-orange-900/30 to-orange-900/10 border-orange-800/50">
        <div className="text-3xl font-bold text-orange-400">🔥 {winStreak}</div>
        <div className="text-xs text-gray-400 mt-1">Streak</div>
      </Card>

      {/* XP Progress */}
      <Card className="md:col-span-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-300">Experience Progress</span>
            <span className="text-sm text-gray-400">
              {experience}/{nextLevelExp}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${expPercentage}%` }}
            />
          </div>
          <Link
            href={`/achievements`}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View achievements →
          </Link>
        </div>
      </Card>
    </div>
  );
}
