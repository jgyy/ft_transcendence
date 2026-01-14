'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface ProfileStatsProps {
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  highestStreak: number;
  winRate: number;
  totalGames: number;
}

export function ProfileStats({
  wins,
  losses,
  draws,
  winStreak,
  highestStreak,
  winRate,
  totalGames,
}: ProfileStatsProps) {
  const getWinRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 50) return 'text-blue-400';
    if (rate >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {/* Games Played */}
      <Card className="text-center">
        <div className="text-3xl font-bold text-white mb-1">{totalGames}</div>
        <div className="text-xs text-gray-400">Games Played</div>
      </Card>

      {/* Win Rate */}
      <Card className="text-center">
        <div className={`text-3xl font-bold mb-1 ${getWinRateColor(winRate)}`}>
          {winRate}%
        </div>
        <div className="text-xs text-gray-400">Win Rate</div>
      </Card>

      {/* Current Streak */}
      <Card className="text-center">
        <div className="text-3xl font-bold text-orange-400 mb-1">{winStreak}</div>
        <div className="text-xs text-gray-400">Current Streak</div>
      </Card>

      {/* Wins */}
      <Card className="text-center bg-gradient-to-br from-green-900/20 to-green-900/10 border-green-800/50">
        <div className="text-3xl font-bold text-green-400 mb-1">{wins}</div>
        <div className="text-xs text-gray-400">Wins</div>
      </Card>

      {/* Losses */}
      <Card className="text-center bg-gradient-to-br from-red-900/20 to-red-900/10 border-red-800/50">
        <div className="text-3xl font-bold text-red-400 mb-1">{losses}</div>
        <div className="text-xs text-gray-400">Losses</div>
      </Card>

      {/* Draws */}
      <Card className="text-center bg-gradient-to-br from-gray-700/20 to-gray-700/10 border-gray-700/50">
        <div className="text-3xl font-bold text-gray-300 mb-1">{draws}</div>
        <div className="text-xs text-gray-400">Draws</div>
      </Card>

      {/* Highest Streak */}
      <Card className="text-center lg:col-span-3">
        <div className="text-3xl font-bold text-purple-400 mb-1">{highestStreak}</div>
        <div className="text-xs text-gray-400">Highest Winning Streak</div>
      </Card>
    </div>
  );
}
