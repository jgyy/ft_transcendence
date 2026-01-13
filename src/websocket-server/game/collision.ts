import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLLISION_PADDING,
  MAX_BALL_ANGLE,
} from '@/lib/game-constants'
import { BallState, PaddleState, GameStateData, getPaddleCenter } from './state'

export interface CollisionResult {
  hasCollision: boolean
  type: 'paddle' | 'wall' | 'none'
  paddleIndex?: number
}

export function isBallOutOfBounds(ball: BallState): boolean {
  return ball.x - ball.radius < 0 || ball.x + ball.radius > CANVAS_WIDTH
}

export function getBallOutSide(ball: BallState): 0 | 1 {
  return ball.x - ball.radius < 0 ? 0 : 1
}

export function checkAABBCollision(
  ballX: number,
  ballY: number,
  ballRadius: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number
): boolean {
  const closestX = Math.max(rectX, Math.min(ballX, rectX + rectWidth))
  const closestY = Math.max(rectY, Math.min(ballY, rectY + rectHeight))

  const distanceX = ballX - closestX
  const distanceY = ballY - closestY

  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

  return distance < ballRadius + COLLISION_PADDING
}

export function checkPaddleCollision(
  gameState: GameStateData
): CollisionResult {
  const ball = gameState.ball
  const { players } = gameState

  for (let i = 0; i < 2; i++) {
    const paddle = players[i].paddle

    if (
      checkAABBCollision(
        ball.x,
        ball.y,
        ball.radius,
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height
      )
    ) {
      return {
        hasCollision: true,
        type: 'paddle',
        paddleIndex: i,
      }
    }
  }

  return { hasCollision: false, type: 'none' }
}

export function handlePaddleCollision(
  gameState: GameStateData,
  paddleIndex: number
): void {
  const ball = gameState.ball
  const paddle = gameState.players[paddleIndex].paddle

  ball.velocityX = Math.abs(ball.velocityX) * (paddleIndex === 0 ? 1 : -1)

  const paddleCenter = getPaddleCenter(paddle)
  const hitPosition = (ball.y - paddle.y) / paddle.height

  const clampedHit = Math.max(0, Math.min(1, hitPosition))

  const hitOffset = (clampedHit - 0.5) * 2
  const angleRadians = hitOffset * MAX_BALL_ANGLE

  const currentSpeed = Math.sqrt(
    ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY
  )

  ball.velocityY = Math.sin(angleRadians) * currentSpeed

  ball.velocityX = Math.cos(angleRadians) * currentSpeed * (paddleIndex === 0 ? 1 : -1)

  const newSpeed = Math.min(ball.speed * 1.05, ball.speed * 2)
  const speedRatio = newSpeed / currentSpeed

  ball.velocityX *= speedRatio
  ball.velocityY *= speedRatio
  ball.speed = newSpeed

  if (paddleIndex === 0) {
    ball.x = Math.max(ball.x, paddle.x + paddle.width + ball.radius)
  } else {
    ball.x = Math.min(ball.x, paddle.x - ball.radius)
  }
}

export function checkWallCollision(ball: BallState): boolean {
  return (
    ball.y - ball.radius <= 0 ||
    ball.y + ball.radius >= CANVAS_HEIGHT
  )
}

export function handleWallCollision(ball: BallState): void {
  ball.velocityY *= -1

  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius
  } else if (ball.y + ball.radius > CANVAS_HEIGHT) {
    ball.y = CANVAS_HEIGHT - ball.radius
  }
}

/**
 * Check all collisions and return results
 */
export function checkAllCollisions(
  gameState: GameStateData
): {
  paddle: CollisionResult
  wall: boolean
} {
  return {
    paddle: checkPaddleCollision(gameState),
    wall: checkWallCollision(gameState.ball),
  }
}

/**
 * Handle all collisions
 */
export function handleAllCollisions(gameState: GameStateData): void {
  const collisions = checkAllCollisions(gameState)

  if (collisions.paddle.hasCollision && collisions.paddle.paddleIndex !== undefined) {
    handlePaddleCollision(gameState, collisions.paddle.paddleIndex)
  }

  if (collisions.wall) {
    handleWallCollision(gameState.ball)
  }
}

/**
 * Predict ball position at given time in future
 */
export function predictBallPosition(
  ball: BallState,
  deltaTime: number
): { x: number; y: number } {
  return {
    x: ball.x + ball.velocityX * deltaTime,
    y: ball.y + ball.velocityY * deltaTime,
  }
}

/**
 * Calculate distance from ball to paddle
 */
export function getDistanceToPaddle(
  ball: BallState,
  paddle: PaddleState
): number {
  const closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width))
  const closestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height))

  const distanceX = ball.x - closestX
  const distanceY = ball.y - closestY

  return Math.sqrt(distanceX * distanceX + distanceY * distanceY)
}

export function isBallHeadingTowardPaddle(
  gameState: GameStateData,
  paddleIndex: number
): boolean {
  const ball = gameState.ball

  if (paddleIndex === 0) {
    return ball.velocityX < 0
  } else {
    return ball.velocityX > 0
  }
}

export function getTimeUntilPaddleX(
  gameState: GameStateData,
  paddleIndex: number
): number {
  const ball = gameState.ball
  const paddle = gameState.players[paddleIndex].paddle

  if (paddleIndex === 0) {
    if (ball.velocityX >= 0) return Infinity
    return (paddle.x + paddle.width - ball.x) / Math.abs(ball.velocityX)
  } else {
    if (ball.velocityX <= 0) return Infinity
    return (paddle.x - ball.x) / ball.velocityX
  }
}
