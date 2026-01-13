'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface LeaderboardEntry {
  id: string
  username: string
  avatarUrl?: string
  ranking: number
  wins: number
  losses: number
  winRate: number
  level: number
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  isLoading?: boolean
  sortBy?: 'ranking' | 'wins' | 'winRate'
}

export function LeaderboardTable({
  entries,
  isLoading = false,
  sortBy = 'ranking'
}: LeaderboardTableProps) {
  const [sortedEntries, setSortedEntries] = useState<LeaderboardEntry[]>(entries)
  const [currentSort, setCurrentSort] = useState(sortBy)

  useEffect(() => {
    const sorted = [...entries].sort((a, b) => {
      switch (currentSort) {
        case 'wins':
          return b.wins - a.wins
        case 'winRate':
          return b.winRate - a.winRate
        case 'ranking':
        default:
          return a.ranking - b.ranking
      }
    })
    setSortedEntries(sorted)
  }, [entries, currentSort])

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center text-gray-400">
        Loading leaderboard...
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center text-gray-400">
        No players found
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header with Sort Options */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Global Leaderboard</h2>
        <div className="flex gap-2">
          {(['ranking', 'wins', 'winRate'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setCurrentSort(sort)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                currentSort === sort
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {sort === 'ranking' && 'Rank'}
              {sort === 'wins' && 'Wins'}
              {sort === 'winRate' && 'Win Rate'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="bg-gray-900 sticky top-0">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                Player
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">
                Level
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">
                Wins
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">
                Losses
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">
                Win Rate
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedEntries.map((entry, index) => (
              <tr
                key={entry.id}
                className={`${
                  index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'
                } hover:bg-gray-700 transition`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">
                      {entry.ranking === 1 && '🥇'}
                      {entry.ranking === 2 && '🥈'}
                      {entry.ranking === 3 && '🥉'}
                      {entry.ranking > 3 && `#${entry.ranking}`}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <Link href={`/users/${entry.id}`}>
                    <div className="flex items-center gap-3 hover:opacity-80 transition">
                      {entry.avatarUrl && (
                        <img
                          src={entry.avatarUrl}
                          alt={entry.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <span className="font-semibold">{entry.username}</span>
                    </div>
                  </Link>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="inline-block px-3 py-1 bg-purple-600 rounded-full text-sm font-semibold">
                    {entry.level}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-green-400">{entry.wins}</span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-red-400">{entry.losses}</span>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${entry.winRate}%` }}
                      />
                    </div>
                    <span className="font-semibold text-blue-400 w-10">
                      {entry.winRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-900 text-sm text-gray-400 border-t border-gray-700">
        Showing {sortedEntries.length} players
      </div>
    </div>
  )
}
