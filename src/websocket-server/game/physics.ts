import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FRICTION,
  BOUNCE_DAMPING,
} from '@/lib/game-constants'
import { BallState, PaddleState, GameStateData } from './state'

/**
 * Update ball physics (position and velocity)
 */
export function updateBallPhysics(
  gameState: GameStateData,
  deltaTime: number
): void {
  const ball = gameState.ball

  // Update ball position
  ball.x += ball.velocityX * deltaTime
  ball.y += ball.velocityY * deltaTime

  // Apply friction (very slight)
  ball.velocityX *= FRICTION
  ball.velocityY *= FRICTION

  // Clamp to canvas boundaries (soft boundaries, will bounce at collision)
  // Ball can go slightly out of bounds, collision detection will handle it
}

/**
 * Update paddle physics (position and velocity)
 */
export function updatePaddlePhysics(
  paddle: PaddleState,
  deltaTime: number
): void {
  // Update paddle position based on velocity
  paddle.y += paddle.velocityY * deltaTime

  // Clamp paddle within vertical bounds
  paddle.y = Math.max(0, Math.min(CANVAS_HEIGHT - paddle.height, paddle.y))

  // Paddle doesn't move horizontally, so velocityX is always 0
}

/**
 * Update all paddles in game state
 */
export function updateAllPaddles(gameState: GameStateData, deltaTime: number): void {
  gameState.players.forEach((player) => {
    updatePaddlePhysics(player.paddle, deltaTime)
  })
}

/**
 * Update ball angular velocity based on paddle contact
 * This creates the spin effect
 */
export function applyPaddleSpin(
  ball: BallState,
  paddle: PaddleState,
  paddleDeltaPosition: number // How much paddle moved since last frame
): void {
  // If paddle is moving, add some spin to the ball
  // Moving paddle up adds upward spin to ball
  const spinFactor = 0.5

  if (Math.abs(paddleDeltaPosition) > 0) {
    // Add vertical velocity based on paddle movement
    ball.velocityY += paddleDeltaPosition * spinFactor
  }
}

/**
 * Get ball velocity magnitude
 */
export function getBallSpeed(ball: BallState): number {
  return Math.sqrt(ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY)
}

/**
 * Cap ball speed to maximum
 */
export function capBallSpeed(ball: BallState, maxSpeed: number): void {
  const speed = getBallSpeed(ball)

  if (speed > maxSpeed) {
    const ratio = maxSpeed / speed
    ball.velocityX *= ratio
    ball.velocityY *= ratio
  }
}

/**
 * Normalize ball velocity to target speed
 */
export function normalizeBallSpeed(ball: BallState, targetSpeed: number): void {
  const speed = getBallSpeed(ball)

  if (speed === 0) {
    // Ball not moving, give it random direction
    const angle = Math.random() * Math.PI * 2
    ball.velocityX = Math.cos(angle) * targetSpeed
    ball.velocityY = Math.sin(angle) * targetSpeed
    return
  }

  const ratio = targetSpeed / speed
  ball.velocityX *= ratio
  ball.velocityY *= ratio
}

/**
 * Get ball direction angle in radians
 */
export function getBallAngle(ball: BallState): number {
  return Math.atan2(ball.velocityY, ball.velocityX)
}

/**
 * Set ball velocity from angle and speed
 */
export function setBallVelocityFromAngle(
  ball: BallState,
  angle: number,
  speed: number
): void {
  ball.velocityX = Math.cos(angle) * speed
  ball.velocityY = Math.sin(angle) * speed
}

/**
 * Interpolate game state for smooth rendering
 * Used for client-side prediction
 */
export function interpolateGameState(
  gameState: GameStateData,
  deltaTime: number,
  lerpFactor: number = 0.9 // 0-1, higher = smoother but more latent
): GameStateData {
  const interpolated = { ...gameState }

  // Only interpolate ball position (smooth movement)
  // Don't interpolate paddle positions (they follow input immediately)
  // This is a simple approach; more sophisticated would use motion vectors

  return interpolated
}

/**
 * Calculate where ball will intersect with vertical line (for AI prediction)
 */
export function getBallIntersectionY(
  ball: BallState,
  targetX: number
): number | null {
  // If ball is not moving in the direction of target, return null
  if ((targetX < ball.x && ball.velocityX >= 0) ||
      (targetX > ball.x && ball.velocityX <= 0)) {
    return null
  }

  // Calculate time to reach target X
  const timeToReach = (targetX - ball.x) / ball.velocityX

  // Calculate Y position at that time
  let predictedY = ball.y + ball.velocityY * timeToReach

  // Account for wall bounces (very simplified)
  // In a real scenario, we'd trace the path accounting for all bounces
  while (predictedY < 0 || predictedY > CANVAS_HEIGHT) {
    if (predictedY < 0) {
      predictedY = Math.abs(predictedY)
    } else if (predictedY > CANVAS_HEIGHT) {
      predictedY = CANVAS_HEIGHT - (predictedY - CANVAS_HEIGHT)
    }
  }

  return predictedY
}

/**
 * Apply damping to ball when it's stationary
 */
export function applyDamping(ball: BallState): void {
  const speed = getBallSpeed(ball)

  if (speed < 1) {
    // Ball is very slow, stop it
    ball.velocityX = 0
    ball.velocityY = 0
  } else {
    ball.velocityX *= BOUNCE_DAMPING
    ball.velocityY *= BOUNCE_DAMPING
  }
}

/**
 * Reset ball to center with initial velocity
 */
export function resetBallToCenter(
  ball: BallState,
  initialSpeed: number
): void {
  ball.x = CANVAS_WIDTH / 2
  ball.y = CANVAS_HEIGHT / 2

  // Random direction
  const angle = Math.random() * Math.PI * 2
  ball.velocityX = Math.cos(angle) * initialSpeed
  ball.velocityY = Math.sin(angle) * initialSpeed
  ball.speed = initialSpeed
}

/**
 * Get relative velocity between ball and paddle
 * Used for calculating impact force
 */
export function getRelativeVelocity(
  ball: BallState,
  paddle: PaddleState
): number {
  // Only consider the Y component since paddle only moves vertically
  return Math.abs(ball.velocityY - paddle.velocityY)
}

/**
 * Reflect ball vector across normal
 * Used for more realistic ball physics
 */
export function reflectVector(
  velocityX: number,
  velocityY: number,
  normalX: number,
  normalY: number
): { x: number; y: number } {
  // Dot product
  const dotProduct = velocityX * normalX + velocityY * normalY

  // Reflect formula: v' = v - 2(v·n)n
  return {
    x: velocityX - 2 * dotProduct * normalX,
    y: velocityY - 2 * dotProduct * normalY,
  }
}

/**
 * Check if ball is moving too slowly
 */
export function isBallStalled(ball: BallState, threshold: number = 50): boolean {
  return getBallSpeed(ball) < threshold
}

/**
 * Accelerate ball (increase speed)
 */
export function accelerateBall(
  ball: BallState,
  factor: number = 1.05
): void {
  ball.velocityX *= factor
  ball.velocityY *= factor
  ball.speed *= factor
}

/**
 * Decelerate ball (decrease speed)
 */
export function decelerateBall(
  ball: BallState,
  factor: number = 0.95
): void {
  ball.velocityX *= factor
  ball.velocityY *= factor
  ball.speed *= factor
}
