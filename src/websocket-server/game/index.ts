// Game Engine Exports
export { PongGame, createGame, type GameMode, type GameInput, type GameEventHandler } from './engine'
export { type BallState, type PaddleState, type PlayerState, type GameStateData } from './state'
export { PongAI, createAI, AIStrategies, type AIDifficulty } from './ai'

// Physics exports
export {
  updateBallPhysics,
  updatePaddlePhysics,
  updateAllPaddles,
  applyPaddleSpin,
  getBallSpeed,
  capBallSpeed,
  normalizeBallSpeed,
  getBallAngle,
  setBallVelocityFromAngle,
  interpolateGameState,
  getBallIntersectionY,
  getRelativeVelocity,
  reflectVector,
  isBallStalled,
  accelerateBall,
  decelerateBall,
} from './physics'

// Collision detection exports
export {
  isBallOutOfBounds,
  getBallOutSide,
  checkAABBCollision,
  checkPaddleCollision,
  handlePaddleCollision,
  checkWallCollision,
  handleWallCollision,
  checkAllCollisions,
  handleAllCollisions,
  predictBallPosition,
  getDistanceToPaddle,
  isBallHeadingTowardPaddle,
  getTimeUntilPaddleX,
  type CollisionResult,
} from './collision'

// State management exports
export {
  initializeBall,
  initializePaddle,
  initializePlayer,
  initializeGameState,
  resetBall,
  serializeGameState,
  cloneGameState,
  getPlayerById,
  getOpponent,
  updatePaddlePosition,
  getPaddleCenter,
  isBallOnLeftSide,
  isBallOnRightSide,
  getGameWinner,
  getGameDuration,
} from './state'
