import { useState, useCallback, useEffect, useRef } from 'react'
import type { GameStateData } from '@/websocket-server/game'
import { initializeGameState } from '@/websocket-server/game/state'

interface GameInput {
  direction: 'UP' | 'DOWN' | 'STAY'
}

interface UseGameStateProps {
  gameId?: string
  onGameEnd?: (winnerId: string, score1: number, score2: number) => void
}

export function useGameState({
  gameId,
  onGameEnd
}: UseGameStateProps = {}) {
  const [gameState, setGameState] = useState<GameStateData | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  const initializeGame = useCallback((settings?: any) => {
    const newState = initializeGameState(
      'game-' + Date.now(),
      'player1',
      'Player 1',
      'player2',
      'Player 2',
      settings
    )
    setGameState(newState)
    setIsRunning(false)
    setIsPaused(false)
    setStartTime(0)
    setElapsedTime(0)
  }, [])

  const startGame = useCallback(() => {
    if (!gameState) {
      initializeGame()
    }
    setIsRunning(true)
    setIsPaused(false)
    setStartTime(Date.now() - elapsedTime * 1000)
  }, [gameState, initializeGame, elapsedTime])

  const pauseGame = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resumeGame = useCallback(() => {
    setIsPaused(false)
    setStartTime(Date.now() - elapsedTime * 1000)
  }, [elapsedTime])

  const resetGame = useCallback(() => {
    initializeGame()
  }, [initializeGame])

  const sendInput = useCallback((input: GameInput) => {
    setGameState((prev) => {
      if (!prev) return prev

      const newState = { ...prev }

      // TODO: Implement paddle input handling based on game state structure
      if (input.direction === 'UP') {
        // Update player 1 paddle velocity
        if (newState.players[0].paddle) {
          newState.players[0].paddle.velocityY = -300
        }
      } else if (input.direction === 'DOWN') {
        // Update player 1 paddle velocity
        if (newState.players[0].paddle) {
          newState.players[0].paddle.velocityY = 300
        }
      } else {
        // Stop paddle movement
        if (newState.players[0].paddle) {
          newState.players[0].paddle.velocityY = 0
        }
      }

      return newState
    })
  }, [])

  useEffect(() => {
    if (!isRunning || isPaused) return

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, isPaused, startTime])

  useEffect(() => {
    if (!gameState) return

    // Check if either player has reached the max score
    const maxScore = gameState.settings.maxScore || 11
    const winner =
      gameState.score[0] >= maxScore
        ? gameState.players[0].id
        : gameState.score[1] >= maxScore
          ? gameState.players[1].id
          : null

    if (winner && isRunning) {
      setIsRunning(false)
      onGameEnd?.(
        winner,
        gameState.score[0],
        gameState.score[1]
      )
    }
  }, [gameState, isRunning, onGameEnd])

  return {
    gameState,
    isRunning,
    isPaused,
    elapsedTime,
    initializeGame,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    sendInput,
    setGameState
  }
}
