'use client'

import React, { useState, useEffect } from 'react'
import { VALID_MAX_SCORES, GAME_THEMES } from '@/lib/game-constants'

interface GameControlsProps {
  score1: number
  score2: number
  maxScore: number
  player1Name: string
  player2Name: string
  isPaused: boolean
  isGameRunning: boolean
  onPause?: () => void
  onResume?: () => void
  onQuit?: () => void
  onSettingsOpen?: () => void
  timeElapsed?: number
  theme?: keyof typeof GAME_THEMES
}

export function GameControls({
  score1,
  score2,
  maxScore,
  player1Name,
  player2Name,
  isPaused,
  isGameRunning,
  onPause,
  onResume,
  onQuit,
  onSettingsOpen,
  timeElapsed = 0,
  theme = 'CLASSIC'
}: GameControlsProps) {
  const [displayTime, setDisplayTime] = useState(formatTime(timeElapsed))

  useEffect(() => {
    setDisplayTime(formatTime(timeElapsed))
  }, [timeElapsed])

  const winner =
    score1 >= maxScore ? player1Name : score2 >= maxScore ? player2Name : null

  return (
    <div className="w-full bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      {/* Scores and Players */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Player 1 */}
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">Player 1</p>
          <p className="text-lg font-semibold">{player1Name}</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{score1}</p>
        </div>

        {/* Center - Game Info */}
        <div className="text-center flex flex-col justify-center">
          <p className="text-sm text-gray-400">Time</p>
          <p className="text-2xl font-mono font-bold">{displayTime}</p>
          <p className="text-xs text-gray-500 mt-1">To {maxScore}</p>
        </div>

        {/* Player 2 */}
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">Player 2</p>
          <p className="text-lg font-semibold">{player2Name}</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{score2}</p>
        </div>
      </div>

      {/* Game Status */}
      {winner && (
        <div className="mb-6 p-4 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg text-center">
          <p className="text-lg font-bold text-yellow-400">
            🎉 {winner} wins!
          </p>
        </div>
      )}

      {isPaused && !winner && (
        <div className="mb-6 p-4 bg-orange-500 bg-opacity-20 border border-orange-500 rounded-lg text-center">
          <p className="text-lg font-bold text-orange-400">⏸ Game Paused</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 flex-wrap justify-center">
        {!winner && (
          <>
            {!isPaused && isGameRunning && (
              <button
                onClick={onPause}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition"
              >
                ⏸ Pause
              </button>
            )}

            {isPaused && isGameRunning && (
              <button
                onClick={onResume}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
              >
                ▶ Resume
              </button>
            )}
          </>
        )}

        <button
          onClick={onSettingsOpen}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
        >
          ⚙ Settings
        </button>

        <button
          onClick={onQuit}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
        >
          ✕ Quit
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 space-y-2">
        <p className="text-xs text-gray-400">Match Progress</p>
        <div className="flex gap-2">
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min((score1 / maxScore) * 100, 100)}%` }}
            />
          </div>
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${Math.min((score2 / maxScore) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
