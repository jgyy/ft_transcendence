'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  THEME_COLORS,
  GAME_THEMES
} from '@/lib/game-constants'
import type { GameStateData } from '@/websocket-server/game'

interface GameCanvasProps {
  gameState: GameStateData | null
  theme?: keyof typeof GAME_THEMES
  isPlaying?: boolean
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
}

export function GameCanvas({
  gameState,
  theme = 'CLASSIC',
  isPlaying = true,
  onCanvasReady
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setContext(ctx)
    onCanvasReady?.(canvas)
  }, [onCanvasReady])

  useEffect(() => {
    if (!context || !gameState) return

    const themeLowercase = GAME_THEMES[theme] as keyof typeof THEME_COLORS
    const colors = THEME_COLORS[themeLowercase]

    context.fillStyle = colors.background
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    context.strokeStyle = colors.ui
    context.setLineDash([5, 5])
    context.beginPath()
    context.moveTo(CANVAS_WIDTH / 2, 0)
    context.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
    context.stroke()
    context.setLineDash([])

    context.fillStyle = colors.ball
    context.beginPath()
    context.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2)
    context.fill()

    context.fillStyle = colors.paddle
    context.fillRect(
      gameState.players[0].paddle.x,
      gameState.players[0].paddle.y,
      gameState.players[0].paddle.width,
      gameState.players[0].paddle.height
    )

    context.fillRect(
      gameState.players[1].paddle.x,
      gameState.players[1].paddle.y,
      gameState.players[1].paddle.width,
      gameState.players[1].paddle.height
    )

    context.strokeStyle = colors.ui
    context.lineWidth = 2
    context.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }, [context, gameState, theme])

  return (
    <div className="flex justify-center items-center bg-gray-900 rounded-lg overflow-hidden shadow-lg">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-gray-700 block"
        style={{
          maxWidth: '100%',
          height: 'auto',
          aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`
        }}
      />
    </div>
  )
}
