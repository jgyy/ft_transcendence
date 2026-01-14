'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

interface RecommendedPlayer {
  id: string;
  username: string;
  avatarUrl?: string;
  level: number;
  winRate: number;
  isOnline: boolean;
}

interface RecommendedPlayersProps {
  players?: RecommendedPlayer[];
  isLoading?: boolean;
}

export function RecommendedPlayers({ players = [], isLoading = false }: RecommendedPlayersProps) {
  const { showToast } = useToast();
  const [addingFriend, setAddingFriend] = useState<string | null>(null);

  const handleAddFriend = async (playerId: string) => {
    try {
      setAddingFriend(playerId);
      const response = await fetch('/api/users/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: playerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        showToast({
          type: 'error',
          message: data.error || 'Failed to add friend',
        });
        return;
      }

      showToast({
        type: 'success',
        message: 'Friend request sent!',
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Failed to add friend',
      });
    } finally {
      setAddingFriend(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Recommended Players</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800/40 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (players.length === 0) {
    return (
      <Card className="text-center py-8">
        <div className="text-4xl mb-2">🎮</div>
        <p className="text-gray-400">No recommendations available</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-white mb-4">Recommended Players</h2>
      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-3 p-3 bg-gray-800/40 border border-gray-700/50 rounded-lg hover:bg-gray-800/60 transition-colors"
          >
            {/* Avatar */}
            <Link href={`/users/${player.id}`} className="flex-shrink-0">
              <img
                src={player.avatarUrl || '/images/default-avatar.png'}
                alt={player.username}
                className="w-10 h-10 rounded-full object-cover hover:ring-2 ring-blue-500"
              />
            </Link>

            {/* Info */}
            <Link href={`/users/${player.id}`} className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm hover:text-blue-400 transition-colors">
                {player.username}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Lv. {player.level}</span>
                <span>•</span>
                <span className="text-yellow-400">{player.winRate}%</span>
                {player.isOnline && (
                  <>
                    <span>•</span>
                    <span className="text-green-400">Online</span>
                  </>
                )}
              </div>
            </Link>

            {/* Add Friend Button */}
            <Button
              onClick={() => handleAddFriend(player.id)}
              variant="secondary"
              size="sm"
              loading={addingFriend === player.id}
              className="flex-shrink-0"
            >
              Add
            </Button>
          </div>
        ))}
      </div>

      <Link
        href="/players"
        className="block text-center py-2 text-blue-400 hover:text-blue-300 text-sm font-semibold mt-4 hover:bg-blue-900/20 rounded transition-colors"
      >
        Browse All Players →
      </Link>
    </Card>
  );
}
