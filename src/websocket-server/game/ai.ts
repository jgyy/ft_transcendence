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

  /**
   * Calculate the next move for the AI
   */
  public calculateMove(gameState: GameStateData): 'up' | 'down' | 'stay' {
    // AI is player 2 (right side)
    const aiPlayerIndex = 1

    // Check if ball is heading toward AI
    if (!isBallHeadingTowardPaddle(gameState, aiPlayerIndex)) {
      // Ball moving away, return to center
      return this.moveTowardCenter(gameState)
    }

    // Predict where ball will be when it reaches paddle X
    const predictedY = this.predictBallPosition(gameState)

    if (predictedY === null) {
      return 'stay'
    }

    // Get AI paddle
    const aiPaddle = gameState.players[aiPlayerIndex].paddle
    const paddleCenter = aiPaddle.y + aiPaddle.height / 2

    // Add human-like error based on accuracy
    const targetY = this.addHumanError(predictedY)

    // Determine movement based on target vs current position
    return this.determineMoveDirection(paddleCenter, targetY)
  }

  /**
   * Get immediate next input for the AI
   * This accounts for reaction time
   */
  public getNextInput(gameState: GameStateData): {
    direction: 'up' | 'down' | 'stay'
    delayed?: boolean
  } {
    const now = Date.now()

    // If we have a scheduled move and reaction time has passed, execute it
    if (this.moveScheduled && now - this.lastMoveTime >= this.reactionTime) {
      this.moveScheduled = false
      const move = this.pendingMove
      this.pendingMove = 'stay'
      return { direction: move, delayed: true }
    }

    // If no move scheduled, calculate new one
    if (!this.moveScheduled) {
      const newMove = this.calculateMove(gameState)
      this.pendingMove = newMove
      this.lastMoveTime = now
      this.moveScheduled = true

      // Return immediately for "easy" reaction, or with delay
      if (this.difficulty === 'HARD') {
        return { direction: 'stay', delayed: false }
      }
    }

    return { direction: 'stay', delayed: false }
  }

  /**
   * Predict ball Y position when it reaches AI paddle X
   */
  private predictBallPosition(gameState: GameStateData): number | null {
    const ball = gameState.ball
    const aiPaddle = gameState.players[1].paddle

    // Get time until ball reaches paddle X
    const timeToReach = getTimeUntilPaddleX(gameState, 1)

    if (timeToReach === Infinity || timeToReach < 0) {
      return null
    }

    // Get intersection point (with wall bounces considered)
    const intersectionY = getBallIntersectionY(gameState, aiPaddle.x)

    return intersectionY
  }

  /**
   * Add human-like error to prediction
   */
  private addHumanError(predictedY: number): number {
    // Error decreases with difficulty
    const errorAmount = this.predictionError

    // Random error within range
    const error = (Math.random() - 0.5) * 2 * errorAmount

    // Sometimes make bigger mistakes based on accuracy
    if (Math.random() > this.accuracy) {
      // Make a bigger mistake
      return predictedY + (Math.random() - 0.5) * CANVAS_HEIGHT * 0.3
    }

    return predictedY + error
  }

  /**
   * Determine move direction
   */
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

  /**
   * Move paddle toward center when ball is away
   */
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

  /**
   * Set difficulty
   */
  public setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty
    const settings = AI_DIFFICULTY[difficulty]
    this.reactionTime = settings.reactionTime
    this.accuracy = settings.accuracy
    this.predictionError = settings.predictionError
  }

  /**
   * Get current difficulty
   */
  public getDifficulty(): AIDifficulty {
    return this.difficulty
  }

  /**
   * Reset AI state
   */
  public reset(): void {
    this.lastMoveTime = 0
    this.pendingMove = 'stay'
    this.moveScheduled = false
  }
}

/**
 * Create AI opponent with given difficulty
 */
export function createAI(difficulty: AIDifficulty = 'MEDIUM'): PongAI {
  return new PongAI(difficulty)
}

/**
 * AI behavior strategies (for future enhancement)
 */
export const AIStrategies = {
  /**
   * Conservative strategy - avoid edges
   */
  conservative: (predictedY: number): number => {
    const padding = PADDLE_HEIGHT
    // Clamp predicted position away from edges
    return Math.max(padding, Math.min(CANVAS_HEIGHT - padding, predictedY))
  },

  /**
   * Aggressive strategy - aim for upper/lower areas to force player into corners
   */
  aggressive: (predictedY: number): number => {
    // Add some aggression by biasing toward edges
    const center = CANVAS_HEIGHT / 2
    const offset = (predictedY - center) * 1.2
    return center + offset
  },

  /**
   * Unpredictable strategy - random adjustments
   */
  unpredictable: (predictedY: number): number => {
    const randomAdjust = (Math.random() - 0.5) * CANVAS_HEIGHT * 0.2
    return predictedY + randomAdjust
  },
}
