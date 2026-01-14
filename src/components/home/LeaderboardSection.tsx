'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Loading';

interface LeaderboardEntry {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  wins: number;
  losses: number;
  ranking: number;
  level: number;
}

export function LeaderboardSection() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/statistics/leaderboard?limit=10');
        const data = await response.json();
        if (data.success) {
          setLeaderboard(data.data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-500';
  };

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <section className="py-20 px-4 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Top Players
          </h2>
          <p className="text-lg text-gray-400">
            See who's dominating the leaderboard
          </p>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold text-sm">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold text-sm">
                    Player
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold text-sm">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold text-sm">
                    W-L
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold text-sm">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="px-4 py-3">
                        <Skeleton height="h-4" width="w-12" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton height="h-4" width="w-32" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton height="h-4" width="w-8" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton height="h-4" width="w-16" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton height="h-4" width="w-12" />
                      </td>
                    </tr>
                  ))
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No leaderboard data available yet
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry, index) => {
                    const total = entry.wins + entry.losses;
                    const winRate = total > 0 ? ((entry.wins / total) * 100).toFixed(1) : '0';

                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                      >
                        <td className={`px-4 py-4 font-bold text-lg ${getMedalColor(index + 1)}`}>
                          {getMedal(index + 1)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={entry.avatarUrl || '/images/default-avatar.png'}
                              alt={entry.username}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-semibold text-white">
                                {entry.displayName || entry.username}
                              </p>
                              <p className="text-xs text-gray-400">@{entry.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="primary" size="sm">
                            Level {entry.level}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-white font-semibold">
                            {entry.wins}-{entry.losses}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-green-400 font-semibold">{winRate}%</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* View Full Leaderboard Button */}
        <div className="text-center mt-8">
          <Link href="/leaderboard">
            <Button variant="secondary">View Full Leaderboard</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
