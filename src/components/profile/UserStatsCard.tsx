import React from 'react'

interface UserStatsCardProps {
  username: string
  avatar?: string
  wins: number
  losses: number
  ranking: number
  level: number
  bio?: string
}

export function UserStatsCard({
  username,
  avatar,
  wins,
  losses,
  ranking,
  level,
  bio
}: UserStatsCardProps) {
  const totalGames = wins + losses
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center gap-4 mb-6">
        {avatar && (
          <img
            src={avatar}
            alt={username}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold">{username}</h2>
          {bio && <p className="text-sm text-gray-400">{bio}</p>}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Ranking</p>
          <p className="text-2xl font-bold text-yellow-400">#{ranking}</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Level</p>
          <p className="text-2xl font-bold text-purple-400">{level}</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Win Rate</p>
          <p className="text-2xl font-bold text-green-400">{winRate}%</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Games</p>
          <p className="text-2xl font-bold text-blue-400">{totalGames}</p>
        </div>
      </div>

      {/* Wins/Losses */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Wins</span>
          <span className="text-lg font-bold text-green-400">{wins}</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${totalGames > 0 ? (wins / totalGames) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Losses</span>
          <span className="text-lg font-bold text-red-400">{losses}</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all"
            style={{ width: `${totalGames > 0 ? (losses / totalGames) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  )
}
