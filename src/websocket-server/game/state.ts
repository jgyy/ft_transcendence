import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_RADIUS,
  BALL_INITIAL_SPEED,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_OFFSET,
  PADDLE_SPEED,
  DEFAULT_GAME_SETTINGS,
  GAME_STATUS,
} from '@/lib/game-constants'

// Game state interfaces
export interface BallState {
  x: number
  y: number
  velocityX: number
  velocityY: number
  radius: number
  speed: number
}

export interface PaddleState {
  x: number
  y: number
  width: number
  height: number
  velocityY: number
  speed: number
}

export interface PlayerState {
  id: string
  username: string
  paddle: PaddleState
  score: number
  isReady: boolean
  isAI?: boolean
  lastInputTime?: number
}

export interface GameStateData {
  gameId: string
  status: string
  timestamp: number
  ball: BallState
  players: [PlayerState, PlayerState]
  score: [number, number]
  isPaused: boolean
  pausedBy?: string
  settings: typeof DEFAULT_GAME_SETTINGS
}

/**
 * Initialize ball state at center of canvas
 */
export function initializeBall(speedMultiplier: number = 1): BallState {
  const speed = BALL_INITIAL_SPEED * speedMultiplier

  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    velocityX: speed * (Math.random() > 0.5 ? 1 : -1),
    velocityY: 0,
    radius: BALL_RADIUS,
    speed: speed,
  }
}

/**
 * Initialize paddle at starting position
 */
export function initializePaddle(
  isPlayer2: boolean,
  speedMultiplier: number = 1
): PaddleState {
  return {
    x: isPlayer2 ? CANVAS_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH : PADDLE_OFFSET,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    velocityY: 0,
    speed: PADDLE_SPEED * speedMultiplier,
  }
}

/**
 * Initialize player state
 */
export function initializePlayer(
  id: string,
  username: string,
  isPlayer2: boolean,
  isAI: boolean = false,
  speedMultiplier: number = 1
): PlayerState {
  return {
    id,
    username,
    paddle: initializePaddle(isPlayer2, speedMultiplier),
    score: 0,
    isReady: false,
    isAI,
    lastInputTime: 0,
  }
}

/**
 * Initialize complete game state
 */
export function initializeGameState(
  gameId: string,
  player1Id: string,
  player1Name: string,
  player2Id: string,
  player2Name: string,
  settings: typeof DEFAULT_GAME_SETTINGS = DEFAULT_GAME_SETTINGS,
  isAIGame: boolean = false
): GameStateData {
  // Apply settings multipliers
  const ballSpeedMultiplier = 0.6 + (settings.ballSpeed * 0.1)
  const paddleSpeedMultiplier = 0.6 + (settings.paddleSpeed * 0.1)

  return {
    gameId,
    status: GAME_STATUS.WAITING,
    timestamp: Date.now(),
    ball: initializeBall(ballSpeedMultiplier),
    players: [
      initializePlayer(player1Id, player1Name, false, false, paddleSpeedMultiplier),
      initializePlayer(player2Id, player2Name, true, isAIGame, paddleSpeedMultiplier),
    ],
    score: [0, 0],
    isPaused: false,
    settings,
  }
}

/**
 * Reset ball position after scoring
 */
export function resetBall(
  gameState: GameStateData,
  scoringTeam: number // 0 or 1
): BallState {
  const speedMultiplier = gameState.settings.ballSpeed ?
    0.6 + (gameState.settings.ballSpeed * 0.1) : 1

  const ball = initializeBall(speedMultiplier)

  // Ball moves toward player who scored
  ball.velocityX = BALL_INITIAL_SPEED * speedMultiplier * (scoringTeam === 0 ? -1 : 1)

  return ball
}

/**
 * Serialize game state for transmission
 */
export function serializeGameState(gameState: GameStateData): string {
  return JSON.stringify({
    gameId: gameState.gameId,
    status: gameState.status,
    timestamp: gameState.timestamp,
    ball: gameState.ball,
    players: gameState.players.map((p) => ({
      id: p.id,
      username: p.username,
      paddle: p.paddle,
      score: p.score,
      isReady: p.isReady,
    })),
    score: gameState.score,
    isPaused: gameState.isPaused,
  })
}

/**
 * Clone game state for modification
 */
export function cloneGameState(gameState: GameStateData): GameStateData {
  return {
    gameId: gameState.gameId,
    status: gameState.status,
    timestamp: Date.now(),
    ball: {
      ...gameState.ball,
    },
    players: gameState.players.map((p) => ({
      ...p,
      paddle: { ...p.paddle },
    })) as [PlayerState, PlayerState],
    score: [...gameState.score] as [number, number],
    isPaused: gameState.isPaused,
    pausedBy: gameState.pausedBy,
    settings: { ...gameState.settings },
  }
}

/**
 * Get player by ID
 */
export function getPlayerById(
  gameState: GameStateData,
  playerId: string
): PlayerState | null {
  return gameState.players.find((p) => p.id === playerId) || null
}

/**
 * Get opponent player
 */
export function getOpponent(
  gameState: GameStateData,
  playerId: string
): PlayerState | null {
  const player = getPlayerById(gameState, playerId)
  if (!player) return null

  const playerIndex = gameState.players.indexOf(player)
  return gameState.players[playerIndex === 0 ? 1 : 0] || null
}

/**
 * Update paddle position within bounds
 */
export function updatePaddlePosition(
  paddle: PaddleState,
  deltaTime: number
): PaddleState {
  const newY = paddle.y + paddle.velocityY * deltaTime

  return {
    ...paddle,
    y: Math.max(0, Math.min(CANVAS_HEIGHT - paddle.height, newY)),
  }
}

/**
 * Get paddle center Y for collision calculations
 */
export function getPaddleCenter(paddle: PaddleState): number {
  return paddle.y + paddle.height / 2
}

/**
 * Check if ball is on left side
 */
export function isBallOnLeftSide(gameState: GameStateData): boolean {
  return gameState.ball.x < CANVAS_WIDTH / 2
}

/**
 * Check if ball is on right side
 */
export function isBallOnRightSide(gameState: GameStateData): boolean {
  return gameState.ball.x >= CANVAS_WIDTH / 2
}

/**
 * Get game winner if applicable
 */
export function getGameWinner(gameState: GameStateData, maxScore: number): number | null {
  if (gameState.score[0] >= maxScore) return 0
  if (gameState.score[1] >= maxScore) return 1
  return null
}

/**
 * Calculate game duration in seconds
 */
export function getGameDuration(startTime: number): number {
  return Math.floor((Date.now() - startTime) / 1000)
}
