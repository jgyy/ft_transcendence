import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FRICTION,
  BOUNCE_DAMPING,
} from '@/lib/game-constants'
import { BallState, PaddleState, GameStateData } from './state'

export function updateBallPhysics(
  gameState: GameStateData,
  deltaTime: number
): void {
  const ball = gameState.ball

  ball.x += ball.velocityX * deltaTime
  ball.y += ball.velocityY * deltaTime

  ball.velocityX *= FRICTION
  ball.velocityY *= FRICTION
}

export function updatePaddlePhysics(
  paddle: PaddleState,
  deltaTime: number
): void {
  paddle.y += paddle.velocityY * deltaTime

  paddle.y = Math.max(0, Math.min(CANVAS_HEIGHT - paddle.height, paddle.y))
}

export function updateAllPaddles(gameState: GameStateData, deltaTime: number): void {
  gameState.players.forEach((player) => {
    updatePaddlePhysics(player.paddle, deltaTime)
  })
}

export function applyPaddleSpin(
  ball: BallState,
  paddle: PaddleState,
  paddleDeltaPosition: number
): void {
  const spinFactor = 0.5

  if (Math.abs(paddleDeltaPosition) > 0) {
    ball.velocityY += paddleDeltaPosition * spinFactor
  }
}

export function getBallSpeed(ball: BallState): number {
  return Math.sqrt(ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY)
}

export function capBallSpeed(ball: BallState, maxSpeed: number): void {
  const speed = getBallSpeed(ball)

  if (speed > maxSpeed) {
    const ratio = maxSpeed / speed
    ball.velocityX *= ratio
    ball.velocityY *= ratio
  }
}

export function normalizeBallSpeed(ball: BallState, targetSpeed: number): void {
  const speed = getBallSpeed(ball)

  if (speed === 0) {
    const angle = Math.random() * Math.PI * 2
    ball.velocityX = Math.cos(angle) * targetSpeed
    ball.velocityY = Math.sin(angle) * targetSpeed
    return
  }

  const ratio = targetSpeed / speed
  ball.velocityX *= ratio
  ball.velocityY *= ratio
}

export function getBallAngle(ball: BallState): number {
  return Math.atan2(ball.velocityY, ball.velocityX)
}

export function setBallVelocityFromAngle(
  ball: BallState,
  angle: number,
  speed: number
): void {
  ball.velocityX = Math.cos(angle) * speed
  ball.velocityY = Math.sin(angle) * speed
}

export function interpolateGameState(
  gameState: GameStateData,
  deltaTime: number,
  lerpFactor: number = 0.9
): GameStateData {
  const interpolated = { ...gameState }

  return interpolated
}

export function getBallIntersectionY(
  ball: BallState,
  targetX: number
): number | null {
  if ((targetX < ball.x && ball.velocityX >= 0) ||
    (targetX > ball.x && ball.velocityX <= 0)) {
    return null
  }

  const timeToReach = (targetX - ball.x) / ball.velocityX

  let predictedY = ball.y + ball.velocityY * timeToReach

  while (predictedY < 0 || predictedY > CANVAS_HEIGHT) {
    if (predictedY < 0) {
      predictedY = Math.abs(predictedY)
    } else if (predictedY > CANVAS_HEIGHT) {
      predictedY = CANVAS_HEIGHT - (predictedY - CANVAS_HEIGHT)
    }
  }

  return predictedY
}

export function applyDamping(ball: BallState): void {
  const speed = getBallSpeed(ball)

  if (speed < 1) {
    ball.velocityX = 0
    ball.velocityY = 0
  } else {
    ball.velocityX *= BOUNCE_DAMPING
    ball.velocityY *= BOUNCE_DAMPING
  }
}

export function resetBallToCenter(
  ball: BallState,
  initialSpeed: number
): void {
  ball.x = CANVAS_WIDTH / 2
  ball.y = CANVAS_HEIGHT / 2

  const angle = Math.random() * Math.PI * 2
  ball.velocityX = Math.cos(angle) * initialSpeed
  ball.velocityY = Math.sin(angle) * initialSpeed
  ball.speed = initialSpeed
}

export function getRelativeVelocity(
  ball: BallState,
  paddle: PaddleState
): number {
  return Math.abs(ball.velocityY - paddle.velocityY)
}

export function reflectVector(
  velocityX: number,
  velocityY: number,
  normalX: number,
  normalY: number
): { x: number; y: number } {
  const dotProduct = velocityX * normalX + velocityY * normalY

  return {
    x: velocityX - 2 * dotProduct * normalX,
    y: velocityY - 2 * dotProduct * normalY,
  }
}

export function isBallStalled(ball: BallState, threshold: number = 50): boolean {
  return getBallSpeed(ball) < threshold
}

export function accelerateBall(
  ball: BallState,
  factor: number = 1.05
): void {
  ball.velocityX *= factor
  ball.velocityY *= factor
  ball.speed *= factor
}

export function decelerateBall(
  ball: BallState,
  factor: number = 0.95
): void {
  ball.velocityX *= factor
  ball.velocityY *= factor
  ball.speed *= factor
}
