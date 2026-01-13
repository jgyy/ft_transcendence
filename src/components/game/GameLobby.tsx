'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export type GameMode = 'SINGLE_PLAYER' | 'MULTIPLAYER' | 'TOURNAMENT'
export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

interface GameLobbyProps {
  onStartGame: (mode: GameMode, difficulty?: AIDifficulty) => void
  isLoading?: boolean
}

export function GameLobby({ onStartGame, isLoading = false }: GameLobbyProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('MEDIUM')

  const handleStartSinglePlayer = () => {
    onStartGame('SINGLE_PLAYER', selectedDifficulty)
  }

  const handleStartMultiplayer = () => {
    onStartGame('MULTIPLAYER')
  }

  const handleStartTournament = () => {
    onStartGame('TOURNAMENT')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">FT_TRANSCENDENCE</h1>
          <p className="text-lg text-gray-400">Multiplayer Pong Game</p>
        </div>

        {/* Game Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Single Player */}
          <div
            onClick={() => setSelectedMode('SINGLE_PLAYER')}
            className={`p-6 rounded-lg cursor-pointer transition border-2 ${
              selectedMode === 'SINGLE_PLAYER'
                ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                : 'border-gray-700 hover:border-gray-600 bg-gray-800'
            }`}
          >
            <h3 className="text-2xl font-bold text-white mb-3">🤖 Single Player</h3>
            <p className="text-gray-400 text-sm mb-4">
              Play against AI opponents with adjustable difficulty levels
            </p>

            {selectedMode === 'SINGLE_PLAYER' && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-gray-300">Select Difficulty:</p>
                <div className="space-y-2">
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map((difficulty) => (
                    <label key={difficulty} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        value={difficulty}
                        checked={selectedDifficulty === difficulty}
                        onChange={(e) =>
                          setSelectedDifficulty(e.target.value as AIDifficulty)
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-300 capitalize">{difficulty}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleStartSinglePlayer}
                  disabled={isLoading}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
                >
                  {isLoading ? 'Starting...' : 'Start Game'}
                </button>
              </div>
            )}
          </div>

          {/* Multiplayer */}
          <div
            onClick={() => setSelectedMode('MULTIPLAYER')}
            className={`p-6 rounded-lg cursor-pointer transition border-2 ${
              selectedMode === 'MULTIPLAYER'
                ? 'border-green-500 bg-green-500 bg-opacity-10'
                : 'border-gray-700 hover:border-gray-600 bg-gray-800'
            }`}
          >
            <h3 className="text-2xl font-bold text-white mb-3">👥 Multiplayer</h3>
            <p className="text-gray-400 text-sm mb-4">
              Challenge other players in real-time matches
            </p>

            {selectedMode === 'MULTIPLAYER' && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-4">
                  Join the matchmaking queue and find an opponent
                </p>
                <button
                  onClick={handleStartMultiplayer}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
                >
                  {isLoading ? 'Searching...' : 'Find Opponent'}
                </button>
              </div>
            )}
          </div>

          {/* Tournament */}
          <div
            onClick={() => setSelectedMode('TOURNAMENT')}
            className={`p-6 rounded-lg cursor-pointer transition border-2 ${
              selectedMode === 'TOURNAMENT'
                ? 'border-purple-500 bg-purple-500 bg-opacity-10'
                : 'border-gray-700 hover:border-gray-600 bg-gray-800'
            }`}
          >
            <h3 className="text-2xl font-bold text-white mb-3">🏆 Tournament</h3>
            <p className="text-gray-400 text-sm mb-4">
              Compete in single-elimination brackets with up to 32 players
            </p>

            {selectedMode === 'TOURNAMENT' && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-4">Browse and join tournaments</p>
                <Link
                  href="/tournaments"
                  className="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition text-center"
                >
                  View Tournaments
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Link
            href="/profile"
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            <p className="text-gray-400 text-sm">👤</p>
            <p className="text-white font-semibold">Profile</p>
          </Link>

          <Link
            href="/leaderboard"
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            <p className="text-gray-400 text-sm">📊</p>
            <p className="text-white font-semibold">Leaderboard</p>
          </Link>

          <Link
            href="/friends"
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            <p className="text-gray-400 text-sm">👥</p>
            <p className="text-white font-semibold">Friends</p>
          </Link>

          <Link
            href="/settings"
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            <p className="text-gray-400 text-sm">⚙</p>
            <p className="text-white font-semibold">Settings</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
