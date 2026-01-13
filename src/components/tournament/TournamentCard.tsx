import React from 'react'
import Link from 'next/link'

interface TournamentCardProps {
  id: string
  name: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  maxParticipants: number
  currentParticipants: number
  organizer: {
    username: string
    avatarUrl?: string
  }
  winner?: {
    username: string
  }
  createdAt: Date
  startedAt?: Date
}

export function TournamentCard({
  id,
  name,
  status,
  maxParticipants,
  currentParticipants,
  organizer,
  winner,
  createdAt,
  startedAt
}: TournamentCardProps) {
  const isFull = currentParticipants >= maxParticipants
  const progress = (currentParticipants / maxParticipants) * 100

  const statusColor = {
    PENDING: 'bg-yellow-600 text-yellow-100',
    IN_PROGRESS: 'bg-blue-600 text-blue-100',
    COMPLETED: 'bg-green-600 text-green-100'
  }

  const statusLabel = {
    PENDING: 'Accepting Signups',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed'
  }

  return (
    <Link href={`/tournaments/${id}`}>
      <div className="bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer hover:border-blue-500 border border-gray-700">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <p className="text-sm text-gray-400 mt-1">
              Created by {organizer.username}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusColor[status]
            }`}
          >
            {statusLabel[status]}
          </span>
        </div>

        {/* Participants */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Participants</span>
            <span className="text-sm font-semibold text-white">
              {currentParticipants}/{maxParticipants}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isFull ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Winner (if completed) */}
        {status === 'COMPLETED' && winner && (
          <div className="mb-4 p-3 bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded">
            <p className="text-xs text-yellow-400 font-semibold mb-1">Tournament Winner</p>
            <p className="text-sm font-bold text-yellow-300">🏆 {winner.username}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <span className="text-xs text-gray-500">
            {new Date(createdAt).toLocaleDateString()}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
            {maxParticipants} Players
          </span>
        </div>
      </div>
    </Link>
  )
}
