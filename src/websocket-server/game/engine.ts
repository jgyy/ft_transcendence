import {
  TICK_INTERVAL,
  TICK_RATE,
  GAME_STATUS,
  BALL_INITIAL_SPEED,
  DEFAULT_GAME_SETTINGS,
} from '@/lib/game-constants'
import {
  GameStateData,
  initializeGameState,
  resetBall,
  cloneGameState,
  getGameWinner,
  getGameDuration,
  serializeGameState,
} from './state'
import {
  updateBallPhysics,
  updateAllPaddles,
  capBallSpeed,
  getBallSpeed,
} from './physics'
import {
  isBallOutOfBounds,
  getBallOutSide,
  handleAllCollisions,
  checkPaddleCollision,
} from './collision'

export type GameMode = 'SINGLE_PLAYER' | 'MULTIPLAYER' | 'TOURNAMENT'

export interface GameInput {
  playerId: string
  direction: 'up' | 'down' | 'stay'
  timestamp: number
}

export interface GameEventHandler {
  onStateUpdate?: (gameState: GameStateData) => void
  onScore?: (playerIndex: number, newScore: number) => void
  onGameEnd?: (winnerId: string, stats: any) => void
  onError?: (error: string) => void
}

/**
 * Core Pong Game Engine
 * Handles all game logic, physics, and state management
 */
export class PongGame {
  private gameId: string
  private gameState: GameStateData
  private gameMode: GameMode
  private gameLoop: NodeJS.Timeout | null = null
  private isRunning: boolean = false
  private startTime: number = 0
  private lastUpdateTime: number = 0
  private handlers: GameEventHandler = {}

  // Input handling
  private inputBuffer: Map<string, GameInput> = new Map()
  private lastInputTimestamp: number = 0

  // Performance tracking
  private frameCount: number = 0
  private lastFrameTime: number = 0

  constructor(
    gameId: string,
    player1Id: string,
    player1Name: string,
    player2Id: string,
    player2Name: string,
    gameMode: GameMode = 'MULTIPLAYER',
    settings: typeof DEFAULT_GAME_SETTINGS = DEFAULT_GAME_SETTINGS,
    isAIGame: boolean = false
  ) {
    this.gameId = gameId
    this.gameMode = gameMode
    this.gameState = initializeGameState(
      gameId,
      player1Id,
      player1Name,
      player2Id,
      player2Name,
      settings,
      isAIGame
    )
    this.lastUpdateTime = Date.now()
    this.lastFrameTime = Date.now()
  }

  /**
   * Start the game
   */
  public start(): void {
    if (this.isRunning) return

    this.gameState.status = GAME_STATUS.IN_PROGRESS
    this.startTime = Date.now()
    this.lastUpdateTime = this.startTime
    this.isRunning = true

    // Start game loop
    this.gameLoop = setInterval(() => {
      this.update()
    }, TICK_INTERVAL)
  }

  /**
   * Stop the game
   */
  public stop(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop)
      this.gameLoop = null
    }
    this.isRunning = false
  }

  /**
   * Main game update loop (called ~60 times per second)
   */
  private update(): void {
    if (!this.isRunning) return

    const now = Date.now()
    const deltaTime = (now - this.lastUpdateTime) / 1000 // Convert to seconds

    // Skip if delta is too large (tab sleeping, etc)
    if (deltaTime > 0.1) {
      this.lastUpdateTime = now
      return
    }

    // Process player inputs
    this.processInputs()

    // Update physics
    updateBallPhysics(this.gameState, deltaTime)
    updateAllPaddles(this.gameState, deltaTime)

    // Check collisions
    handleAllCollisions(this.gameState)

    // Cap ball speed
    capBallSpeed(this.gameState.ball, this.gameState.ball.speed * 2)

    // Check scoring
    this.checkScoring()

    // Check win condition
    this.checkWinCondition()

    // Update timestamp
    this.gameState.timestamp = now
    this.lastUpdateTime = now
    this.frameCount++

    // Emit state update
    this.emitStateUpdate()
  }

  /**
   * Process buffered player inputs
   */
  private processInputs(): void {
    this.inputBuffer.forEach((input, playerId) => {
      const player = this.gameState.players.find((p) => p.id === playerId)
      if (!player) return

      const paddle = player.paddle

      // Handle movement input
      switch (input.direction) {
        case 'up':
          paddle.velocityY = -paddle.speed
          break
        case 'down':
          paddle.velocityY = paddle.speed
          break
        case 'stay':
          paddle.velocityY = 0
          break
      }

      player.lastInputTime = input.timestamp
    })

    // Clear old inputs (keep for one frame)
    this.inputBuffer.clear()
  }

  /**
   * Handle player input
   */
  public handleInput(input: GameInput): void {
    if (!this.isRunning) return

    // Validate player exists
    if (!this.gameState.players.find((p) => p.id === input.playerId)) {
      return
    }

    // Buffer input for next frame
    this.inputBuffer.set(input.playerId, input)
  }

  /**
   * Check if ball has scored
   */
  private checkScoring(): void {
    const ball = this.gameState.ball

    if (isBallOutOfBounds(ball)) {
      const scoringSide = getBallOutSide(ball)

      // Award point to opposite player
      this.gameState.score[1 - scoringSide]++

      // Emit score event
      this.handlers.onScore?.(1 - scoringSide, this.gameState.score[1 - scoringSide])

      // Reset ball
      this.gameState.ball = resetBall(this.gameState, scoringSide)
    }
  }

  /**
   * Check if game is won
   */
  private checkWinCondition(): void {
    const maxScore = this.gameState.settings.maxScore
    const winner = getGameWinner(this.gameState, maxScore)

    if (winner !== null) {
      this.endGame(winner)
    }
  }

  /**
   * End the game
   */
  private endGame(winnerId: 0 | 1): void {
    this.stop()

    const winnerPlayer = this.gameState.players[winnerId]
    const duration = getGameDuration(this.startTime)

    this.gameState.status = GAME_STATUS.COMPLETED

    // Emit end event
    this.handlers.onGameEnd?.(winnerPlayer.id, {
      winnerId: winnerPlayer.id,
      score: this.gameState.score,
      duration,
      startTime: this.startTime,
      endTime: Date.now(),
    })
  }

  /**
   * Emit state update to handlers
   */
  private emitStateUpdate(): void {
    if (this.frameCount % Math.ceil(TICK_RATE / 60) === 0) {
      // Emit update 60 times per second
      this.handlers.onStateUpdate?.(cloneGameState(this.gameState))
    }
  }

  /**
   * Set event handlers
   */
  public setHandlers(handlers: GameEventHandler): void {
    this.handlers = handlers
  }

  /**
   * Get current game state
   */
  public getState(): GameStateData {
    return cloneGameState(this.gameState)
  }

  /**
   * Get serialized game state (for transmission)
   */
  public getSerializedState(): string {
    return serializeGameState(this.gameState)
  }

  /**
   * Get game info
   */
  public getGameInfo() {
    return {
      gameId: this.gameId,
      gameMode: this.gameMode,
      status: this.gameState.status,
      isRunning: this.isRunning,
      duration: getGameDuration(this.startTime),
      score: this.gameState.score,
      players: this.gameState.players.map((p) => ({
        id: p.id,
        username: p.username,
        score: p.score,
      })),
    }
  }

  /**
   * Pause game
   */
  public pause(pausedBy?: string): void {
    if (!this.isRunning) return
    this.gameState.isPaused = true
    this.gameState.pausedBy = pausedBy
    this.stop()
  }

  /**
   * Resume game
   */
  public resume(): void {
    if (this.isRunning) return
    this.gameState.isPaused = false
    this.gameState.pausedBy = undefined
    this.lastUpdateTime = Date.now()
    this.start()
  }

  /**
   * Reset game
   */
  public reset(): void {
    this.stop()
    this.gameState.score = [0, 0]
    this.gameState.ball = resetBall(this.gameState, 0)
    this.gameState.status = GAME_STATUS.WAITING
    this.inputBuffer.clear()
    this.frameCount = 0
  }

  /**
   * Forfeit game by player
   */
  public forfeit(playerId: string): void {
    const playerIndex = this.gameState.players.findIndex((p) => p.id === playerId)
    if (playerIndex === -1) return

    // Opponent wins
    const winnerId = playerIndex === 0 ? 1 : 0
    this.endGame(winnerId as 0 | 1)
  }

  /**
   * Check if game is finished
   */
  public isGameFinished(): boolean {
    return this.gameState.status === GAME_STATUS.COMPLETED ||
           this.gameState.status === GAME_STATUS.ABANDONED
  }

  /**
   * Get performance stats
   */
  public getPerformanceStats() {
    const now = Date.now()
    const elapsed = now - this.lastFrameTime
    const fps = elapsed > 0 ? 1000 / elapsed : 0

    return {
      frameCount: this.frameCount,
      fps: Math.round(fps),
      averageDelta: elapsed / Math.max(1, this.frameCount),
    }
  }
}

/**
 * Create a new game instance
 */
export function createGame(
  gameId: string,
  player1Id: string,
  player1Name: string,
  player2Id: string,
  player2Name: string,
  gameMode: GameMode = 'MULTIPLAYER',
  settings?: typeof DEFAULT_GAME_SETTINGS,
  isAIGame: boolean = false
): PongGame {
  return new PongGame(
    gameId,
    player1Id,
    player1Name,
    player2Id,
    player2Name,
    gameMode,
    settings,
    isAIGame
  )
}
