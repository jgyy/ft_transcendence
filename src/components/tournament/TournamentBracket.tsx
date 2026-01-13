'use client'

import React from 'react'
import Link from 'next/link'
import { TournamentBracket as TournamentBracketType } from '@/lib/tournament'

interface TournamentBracketProps {
  bracket: TournamentBracketType
}

export function TournamentBracket({ bracket }: TournamentBracketProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Tournament Bracket</h2>

      {/* Bracket Visualization */}
      <div className="flex gap-8 min-w-max">
        {bracket.rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="flex flex-col justify-center gap-8">
            <p className="text-sm font-semibold text-gray-400 text-center mb-4">
              {roundIndex === bracket.rounds.length - 1
                ? 'Finals'
                : roundIndex === bracket.rounds.length - 2
                  ? 'Semi-Finals'
                  : `Round ${roundIndex + 1}`}
            </p>

            {round.map((match) => (
              <div
                key={match.id}
                className="w-64 bg-gray-700 rounded-lg overflow-hidden border border-gray-600 hover:border-blue-500 transition"
              >
                {/* Match Header */}
                {match.status === 'COMPLETED' && match.winner && (
                  <div className="bg-green-600 bg-opacity-20 border-b border-green-600 px-4 py-2">
                    <p className="text-xs text-green-400 font-semibold">COMPLETED</p>
                  </div>
                )}
                {match.status === 'IN_PROGRESS' && (
                  <div className="bg-blue-600 bg-opacity-20 border-b border-blue-600 px-4 py-2">
                    <p className="text-xs text-blue-400 font-semibold">IN PROGRESS</p>
                  </div>
                )}
                {match.status === 'READY' && (
                  <div className="bg-yellow-600 bg-opacity-20 border-b border-yellow-600 px-4 py-2">
                    <p className="text-xs text-yellow-400 font-semibold">READY TO PLAY</p>
                  </div>
                )}
                {match.status === 'PENDING' && (
                  <div className="bg-gray-600 bg-opacity-20 border-b border-gray-600 px-4 py-2">
                    <p className="text-xs text-gray-400 font-semibold">PENDING</p>
                  </div>
                )}

                {/* Players */}
                <div className="p-4 space-y-3">
                  {/* Player 1 */}
                  <div
                    className={`flex items-center justify-between p-2 rounded ${
                      match.winner?.id === match.player1?.id
                        ? 'bg-green-600 bg-opacity-20'
                        : 'bg-gray-600 bg-opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {match.player1?.avatarUrl && (
                        <img
                          src={match.player1.avatarUrl}
                          alt={match.player1.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm font-semibold text-white truncate">
                        {match.player1?.username || 'TBD'}
                      </span>
                    </div>
                      <span className="text-lg font-bold text-yellow-400 ml-2">
                      </span>
                    )}
                  </div>

                  {/* VS */}
                  <div className="text-center text-xs text-gray-500 font-semibold">VS</div>

                  {/* Player 2 */}
                  <div
                    className={`flex items-center justify-between p-2 rounded ${
                      match.winner?.id === match.player2?.id
                        ? 'bg-green-600 bg-opacity-20'
                        : 'bg-gray-600 bg-opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {match.player2?.avatarUrl && (
                        <img
                          src={match.player2.avatarUrl}
                          alt={match.player2.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm font-semibold text-white truncate">
                        {match.player2?.username || 'TBD'}
                      </span>
                    </div>
                      <span className="text-lg font-bold text-yellow-400 ml-2">
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Footer */}
                {match.status === 'READY' && (
                  <div className="border-t border-gray-600 p-3">
                    <Link
                      href={`/games/${match.id}`}
                      className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded text-center transition"
                    >
                      Play Match
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Winner */}
      {bracket.winner && (
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm mb-2">Tournament Winner</p>
          <div className="inline-block">
            <div className="flex items-center gap-3 justify-center p-4 bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg">
              <span className="text-4xl">🏆</span>
              <div>
                <p className="text-lg font-bold text-yellow-400">
                  {bracket.winner.username}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
