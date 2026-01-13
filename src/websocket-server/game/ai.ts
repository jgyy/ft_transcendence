import {
  AI_DIFFICULTY,
  CANVAS_HEIGHT,
  PADDLE_HEIGHT,
} from '@/lib/game-constants'
import { GameStateData } from './state'
import {
  getBallIntersectionY,
  getTimeUntilPaddleX,
  isBallHeadingTowardPaddle,
} from './physics'

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

export class PongAI {
  private difficulty: AIDifficulty
  private reactionTime: number
  private accuracy: number
  private predictionError: number
  private lastMoveTime: number = 0
  private pendingMove: 'up' | 'down' | 'stay' = 'stay'
  private moveScheduled: boolean = false

  constructor(difficulty: AIDifficulty = 'MEDIUM') {
    this.difficulty = difficulty
    const difficultySettings = AI_DIFFICULTY[difficulty]
    this.reactionTime = difficultySettings.reactionTime
    this.accuracy = difficultySettings.accuracy
    this.predictionError = difficultySettings.predictionError
  }

  public calculateMove(gameState: GameStateData): 'up' | 'down' | 'stay' {
    const aiPlayerIndex = 1

    if (!isBallHeadingTowardPaddle(gameState, aiPlayerIndex)) {
      return this.moveTowardCenter(gameState)
    }

    const predictedY = this.predictBallPosition(gameState)

    if (predictedY === null) {
      return 'stay'
    }

    const aiPaddle = gameState.players[aiPlayerIndex].paddle
    const paddleCenter = aiPaddle.y + aiPaddle.height / 2

    const targetY = this.addHumanError(predictedY)

    return this.determineMoveDirection(paddleCenter, targetY)
  }

  public getNextInput(gameState: GameStateData): {
    direction: 'up' | 'down' | 'stay'
    delayed?: boolean
  } {
    const now = Date.now()

    if (this.moveScheduled && now - this.lastMoveTime >= this.reactionTime) {
      this.moveScheduled = false
      const move = this.pendingMove
      this.pendingMove = 'stay'
      return { direction: move, delayed: true }
    }

    if (!this.moveScheduled) {
      const newMove = this.calculateMove(gameState)
      this.pendingMove = newMove
      this.lastMoveTime = now
      this.moveScheduled = true

      if (this.difficulty === 'HARD') {
        return { direction: 'stay', delayed: false }
      }
    }

    return { direction: 'stay', delayed: false }
  }

  private predictBallPosition(gameState: GameStateData): number | null {
    const ball = gameState.ball
    const aiPaddle = gameState.players[1].paddle

    const timeToReach = getTimeUntilPaddleX(gameState, 1)

    if (timeToReach === Infinity || timeToReach < 0) {
      return null
    }

    const intersectionY = getBallIntersectionY(gameState, aiPaddle.x)

    return intersectionY
  }

  private addHumanError(predictedY: number): number {
    const errorAmount = this.predictionError

    const error = (Math.random() - 0.5) * 2 * errorAmount

    if (Math.random() > this.accuracy) {
      return predictedY + (Math.random() - 0.5) * CANVAS_HEIGHT * 0.3
    }

    return predictedY + error
  }

  private determineMoveDirection(
    currentY: number,
    targetY: number
  ): 'up' | 'down' | 'stay' {
    const threshold = PADDLE_HEIGHT / 4

    const difference = targetY - currentY

    if (difference < -threshold) {
      return 'up'
    } else if (difference > threshold) {
      return 'down'
    }

    return 'stay'
  }

  private moveTowardCenter(gameState: GameStateData): 'up' | 'down' | 'stay' {
    const aiPaddle = gameState.players[1].paddle
    const paddleCenter = aiPaddle.y + aiPaddle.height / 2
    const canvasCenter = CANVAS_HEIGHT / 2

    const threshold = PADDLE_HEIGHT / 2

    if (paddleCenter < canvasCenter - threshold) {
      return 'down'
    } else if (paddleCenter > canvasCenter + threshold) {
      return 'up'
    }

    return 'stay'
  }

  public setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty
    const settings = AI_DIFFICULTY[difficulty]
    this.reactionTime = settings.reactionTime
    this.accuracy = settings.accuracy
    this.predictionError = settings.predictionError
  }

  public getDifficulty(): AIDifficulty {
    return this.difficulty
  }

  public reset(): void {
    this.lastMoveTime = 0
    this.pendingMove = 'stay'
    this.moveScheduled = false
  }
}

export function createAI(difficulty: AIDifficulty = 'MEDIUM'): PongAI {
  return new PongAI(difficulty)
}

export const AIStrategies = {
  conservative: (predictedY: number): number => {
    const padding = PADDLE_HEIGHT
    return Math.max(padding, Math.min(CANVAS_HEIGHT - padding, predictedY))
  },

  aggressive: (predictedY: number): number => {
    const center = CANVAS_HEIGHT / 2
    const offset = (predictedY - center) * 1.2
    return center + offset
  },

  unpredictable: (predictedY: number): number => {
    const randomAdjust = (Math.random() - 0.5) * CANVAS_HEIGHT * 0.2
    return predictedY + randomAdjust
  },
}
