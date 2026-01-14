'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface RecentGame {
  id: string;
  playerOneId: string;
  playerTwoId?: string;
  playerOneScore: number;
  playerTwoScore: number;
  winnerId?: string;
  gameMode: string;
  createdAt: string;
  playerOne: {
    username: string;
    avatarUrl?: string;
  };
  playerTwo?: {
    username: string;
    avatarUrl?: string;
  };
}

interface MatchHistoryProps {
  recentGames: RecentGame[];
  currentUserId: string;
}

export function MatchHistory({ recentGames, currentUserId }: MatchHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGameResult = (game: RecentGame) => {
    if (game.winnerId === currentUserId) {
      return { result: 'WIN', color: 'text-green-400', bg: 'bg-green-900/20' };
    }
    if (game.winnerId && game.winnerId !== currentUserId) {
      return { result: 'LOSS', color: 'text-red-400', bg: 'bg-red-900/20' };
    }
    return { result: 'DRAW', color: 'text-gray-400', bg: 'bg-gray-800/20' };
  };

  const getOpponent = (game: RecentGame) => {
    if (game.playerOneId === currentUserId) {
      return game.playerTwo ? game.playerTwo.username : 'AI Opponent';
    }
    return game.playerOne.username;
  };

  const getOpponentAvatar = (game: RecentGame) => {
    if (game.playerOneId === currentUserId) {
      return game.playerTwo?.avatarUrl || '/images/default-avatar.png';
    }
    return game.playerOne.avatarUrl || '/images/default-avatar.png';
  };

  const getScore = (game: RecentGame) => {
    if (game.playerOneId === currentUserId) {
      return { player: game.playerOneScore, opponent: game.playerTwoScore };
    }
    return { player: game.playerTwoScore, opponent: game.playerOneScore };
  };

  if (recentGames.length === 0) {
    return (
      <Card className="text-center py-8">
        <div className="text-4xl mb-2">🎮</div>
        <p className="text-gray-400">No games played yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-white mb-4">Recent Matches</h2>
      {recentGames.map((game) => {
        const { result, color, bg } = getGameResult(game);
        const opponent = getOpponent(game);
        const opponentAvatar = getOpponentAvatar(game);
        const score = getScore(game);
        const isSinglePlayer = !game.playerTwoId;

        return (
          <Card
            key={game.id}
            className={`flex items-center justify-between ${bg} border-gray-700/50`}
          >
            {/* Left Section - Opponent */}
            <div className="flex items-center gap-3 flex-1">
              <img
                src={opponentAvatar}
                alt={opponent}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-white">{opponent}</p>
                <p className="text-xs text-gray-400">
                  {isSinglePlayer ? 'AI Opponent' : 'Player vs Player'} • {formatDate(game.createdAt)}
                </p>
              </div>
            </div>

            {/* Middle Section - Score */}
            <div className="flex items-center gap-4 mx-4">
              <div className="text-right">
                <p className="text-xl font-bold text-white">{score.player}</p>
                <p className="text-xs text-gray-400">You</p>
              </div>
              <div className="text-gray-500 font-bold">-</div>
              <div className="text-left">
                <p className="text-xl font-bold text-gray-300">{score.opponent}</p>
                <p className="text-xs text-gray-400">Opponent</p>
              </div>
            </div>

            {/* Right Section - Result Badge */}
            <div className={`text-right`}>
              <p className={`text-sm font-bold ${color}`}>{result}</p>
              {game.gameMode && (
                <p className="text-xs text-gray-400">
                  {game.gameMode === 'SINGLE_PLAYER' && 'Solo'}
                  {game.gameMode === 'MULTIPLAYER' && 'Multi'}
                  {game.gameMode === 'TOURNAMENT' && 'Tournament'}
                </p>
              )}
            </div>
          </Card>
        );
      })}

      {/* View All Button */}
      <Link
        href={`/users/${currentUserId}/matches`}
        className="block text-center py-3 text-blue-400 hover:text-blue-300 font-semibold text-sm mt-4 hover:bg-blue-900/20 rounded transition-colors"
      >
        View All Matches →
      </Link>
    </div>
  );
}
