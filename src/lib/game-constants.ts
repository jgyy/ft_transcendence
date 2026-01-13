export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600

export const BALL_RADIUS = 8
export const BALL_INITIAL_SPEED = 300
export const BALL_MAX_SPEED = 600
export const BALL_ACCELERATION = 1.02

export const PADDLE_WIDTH = 10
export const PADDLE_HEIGHT = 80
export const PADDLE_SPEED = 400
export const PADDLE_OFFSET = 20

export const TICK_RATE = 60
export const TICK_INTERVAL = 1000 / TICK_RATE
export const MAX_BALL_ANGLE = Math.PI / 4

export const DEFAULT_MAX_SCORE = 11
export const MIN_MAX_SCORE = 5
export const MAX_MAX_SCORE = 21
export const VALID_MAX_SCORES = [5, 7, 11, 15, 21]

export const GAME_MODES = {
  SINGLE_PLAYER: 'SINGLE_PLAYER',
  MULTIPLAYER: 'MULTIPLAYER',
  TOURNAMENT: 'TOURNAMENT',
} as const

export const AI_DIFFICULTY = {
  EASY: {
    reactionTime: 200,
    accuracy: 0.6,
    predictionError: 50,
  },
  MEDIUM: {
    reactionTime: 100,
    accuracy: 0.8,
    predictionError: 20,
  },
  HARD: {
    reactionTime: 50,
    accuracy: 0.95,
    predictionError: 5,
  },
} as const

export const GAME_STATUS = {
  WAITING: 'WAITING',
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED',
} as const

export const POWER_UP_TYPES = {
  SPEED_BOOST: 'SPEED_BOOST',
  PADDLE_EXTEND: 'PADDLE_EXTEND',
  SLOW_BALL: 'SLOW_BALL',
  MULTI_BALL: 'MULTI_BALL',
  FREEZE: 'FREEZE',
} as const

export const GAME_THEMES = {
  CLASSIC: 'classic',
  NEON: 'neon',
  RETRO: 'retro',
  SPACE: 'space',
} as const

export const DEFAULT_GAME_SETTINGS = {
  ballSpeed: 3,
  ballSize: 1,
  paddleSpeed: 3,
  paddleSize: 1,
  maxScore: 11,
  powerUpsEnabled: false,
  theme: 'classic',
  soundEnabled: true,
} as const

export const COLLISION_PADDING = 2

export const FRICTION = 0.99
export const BOUNCE_DAMPING = 0.99

export const STATE_UPDATE_FREQUENCY = 60
export const POSITION_SYNC_THRESHOLD = 5
export const MAX_CLIENT_PREDICTION_TIME = 100 
