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

export const BALL_SPEED_MULTIPLIERS: Record<number, number> = {
  1: 0.6,
  2: 0.8,
  3: 1.0,
  4: 1.2,
  5: 1.4,
} as const

export const BALL_SIZE_MULTIPLIERS: Record<number, number> = {
  1: 0.8,
  2: 0.9,
  3: 1.0,
  4: 1.1,
  5: 1.2,
} as const

export const PADDLE_SPEED_MULTIPLIERS: Record<number, number> = {
  1: 0.7,
  2: 0.85,
  3: 1.0,
  4: 1.15,
  5: 1.3,
} as const

export const PADDLE_SIZE_MULTIPLIERS: Record<number, number> = {
  1: 0.6,
  2: 0.8,
  3: 1.0,
  4: 1.2,
  5: 1.4,
} as const

export const POWER_UP_EFFECTS = {
  SPEED_BOOST: {
    duration: 5000,
    ballSpeedMultiplier: 1.5,
    description: 'Increases ball speed by 50%'
  },
  PADDLE_EXTEND: {
    duration: 7000,
    paddleSizeMultiplier: 1.5,
    description: 'Increases paddle size by 50%'
  },
  SLOW_BALL: {
    duration: 5000,
    ballSpeedMultiplier: 0.6,
    description: 'Decreases ball speed by 40%'
  },
  MULTI_BALL: {
    duration: 8000,
    ballCount: 2,
    description: 'Creates an additional ball'
  },
  FREEZE: {
    duration: 3000,
    freezeOpponent: true,
    description: 'Freezes opponent paddle for 3 seconds'
  }
} as const

export const THEME_COLORS = {
  classic: {
    background: '#1a1a1a',
    foreground: '#ffffff',
    paddle: '#00ff00',
    ball: '#ffff00',
    ui: '#00ff00'
  },
  neon: {
    background: '#0a0e27',
    foreground: '#ff006e',
    paddle: '#00f5ff',
    ball: '#ff006e',
    ui: '#00f5ff'
  },
  retro: {
    background: '#2c3e50',
    foreground: '#ecf0f1',
    paddle: '#3498db',
    ball: '#e74c3c',
    ui: '#2ecc71'
  },
  space: {
    background: '#0b1929',
    foreground: '#7dd3fc',
    paddle: '#06b6d4',
    ball: '#fbbf24',
    ui: '#06b6d4'
  }
} as const

export const COLLISION_PADDING = 2

export const FRICTION = 0.99
export const BOUNCE_DAMPING = 0.99

export const STATE_UPDATE_FREQUENCY = 60
export const POSITION_SYNC_THRESHOLD = 5
export const MAX_CLIENT_PREDICTION_TIME = 100 
