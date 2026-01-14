'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

interface Tournament {
  id: string;
  name: string;
  description?: string;
  maxParticipants: number;
  currentParticipants?: number;
  status: 'REGISTRATION' | 'IN_PROGRESS' | 'COMPLETED';
  organizer: {
    id: string;
    username: string;
  };
  createdAt: string;
}

interface OpenTournamentsProps {
  tournaments?: Tournament[];
  isLoading?: boolean;
}

export function OpenTournaments({ tournaments = [], isLoading = false }: OpenTournamentsProps) {
  const { showToast } = useToast();
  const [joiningTournament, setJoiningTournament] = useState<string | null>(null);

  const handleJoinTournament = async (tournamentId: string) => {
    try {
      setJoiningTournament(tournamentId);
      const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        showToast({
          type: 'error',
          message: data.error || 'Failed to join tournament',
        });
        return;
      }

      showToast({
        type: 'success',
        message: 'Joined tournament successfully!',
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Failed to join tournament',
      });
    } finally {
      setJoiningTournament(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Open Tournaments</h2>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800/40 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (tournaments.length === 0) {
    return (
      <Card className="text-center py-8">
        <div className="text-4xl mb-2">🏆</div>
        <p className="text-gray-400 mb-4">No tournaments available</p>
        <Link
          href="/tournaments/create"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Create Tournament
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Open Tournaments</h2>
        <Link
          href="/tournaments"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {tournaments.slice(0, 3).map((tournament) => {
          const isFull = tournament.currentParticipants === tournament.maxParticipants;
          const filledPercentage = tournament.currentParticipants
            ? Math.round((tournament.currentParticipants / tournament.maxParticipants) * 100)
            : 0;

          return (
            <div
              key={tournament.id}
              className="p-4 bg-gradient-to-br from-orange-900/20 to-orange-900/10 border border-orange-800/50 rounded-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <Link href={`/tournaments/${tournament.id}`} className="flex-1 min-w-0">
                  <h3 className="font-bold text-white hover:text-blue-400 transition-colors truncate">
                    {tournament.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    by {tournament.organizer.username}
                  </p>
                </Link>
                <div className="flex-shrink-0 px-2 py-1 bg-orange-900/40 rounded text-xs font-semibold text-orange-300">
                  {tournament.status === 'REGISTRATION' && '📝 Registration'}
                  {tournament.status === 'IN_PROGRESS' && '🎮 Live'}
                  {tournament.status === 'COMPLETED' && '✓ Done'}
                </div>
              </div>

              {/* Description */}
              {tournament.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {tournament.description}
                </p>
              )}

              {/* Participants */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">
                    Participants: {tournament.currentParticipants || 0}/{tournament.maxParticipants}
                  </span>
                  <span className="text-xs font-semibold text-orange-400">{filledPercentage}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${filledPercentage}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              {tournament.status === 'REGISTRATION' && (
                <Button
                  onClick={() => handleJoinTournament(tournament.id)}
                  disabled={isFull}
                  loading={joiningTournament === tournament.id}
                  size="sm"
                  className="w-full"
                >
                  {isFull ? '🚫 Tournament Full' : '🎯 Join Tournament'}
                </Button>
              )}
              {tournament.status === 'IN_PROGRESS' && (
                <Link href={`/tournaments/${tournament.id}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    👀 Watch
                  </Button>
                </Link>
              )}
              {tournament.status === 'COMPLETED' && (
                <Link href={`/tournaments/${tournament.id}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    📊 View Results
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
