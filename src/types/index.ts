// User types
export interface User {
  id: string
  email: string
  username: string
  displayName?: string | null
  avatarUrl?: string | null
  bio?: string | null
  isOnline: boolean
  lastSeen: Date
  level: number
  experience: number
  wins: number
  losses: number
  draws: number
  winStreak: number
  ranking: number
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends User {
  gamesCount: number
  winRate: number
  totalGames: number
}

// Game types
export type GameMode = 'SINGLE_PLAYER' | 'MULTIPLAYER' | 'TOURNAMENT'
export type GameStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'

export interface GameSettings {
  ballSpeed: number // 1-5
  ballSize: number // 1-3
  paddleSpeed: number // 1-5
  paddleSize: number // 1-3
  maxScore: number // 5, 7, 11, 15, 21
  powerUpsEnabled: boolean
  theme: 'classic' | 'neon' | 'retro' | 'space'
  soundEnabled: boolean
}

export interface Game {
  id: string
  playerOneId: string
  playerTwoId?: string | null
  playerOneScore: number
  playerTwoScore: number
  winnerId?: string | null
  gameMode: GameMode
  status: GameStatus
  settings: GameSettings
  isAIGame: boolean
  aiDifficulty?: string | null
  startedAt?: Date | null
  endedAt?: Date | null
  durationSeconds?: number | null
  tournamentId?: string | null
  matchId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface GameState {
  gameId: string
  ball: BallState
  players: [PlayerGameState, PlayerGameState]
  score: [number, number]
  status: GameStatus
  timestamp: number
}

export interface BallState {
  x: number
  y: number
  velocityX: number
  velocityY: number
  radius: number
}

export interface PlayerGameState {
  id: string
  username: string
  paddle: PaddleState
  isReady: boolean
}

export interface PaddleState {
  x: number
  y: number
  width: number
  height: number
  velocityY: number
}

// Tournament types
export type TournamentStatus = 'REGISTRATION' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type BracketType = 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION'
export type MatchStatus = 'PENDING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED'

export interface Tournament {
  id: string
  name: string
  description?: string | null
  creatorId: string
  maxPlayers: number
  status: TournamentStatus
  bracketType: BracketType
  startDate?: Date | null
  endDate?: Date | null
  createdAt: Date
  updatedAt: Date
  participantCount: number
}

export interface TournamentBracket {
  [round: number]: Match[]
}

export interface Match {
  id: string
  tournamentId: string
  round: number
  matchNumber: number
  status: MatchStatus
  winnerId?: string | null
  participants: MatchParticipant[]
  game?: Game | null
  createdAt: Date
  updatedAt: Date
}

export interface MatchParticipant {
  id: string
  matchId: string
  userId: string
  isWinner: boolean
  user?: User
}

// Friendship types
export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED'

export interface Friendship {
  id: string
  requesterId: string
  addresseeId: string
  status: FriendshipStatus
  createdAt: Date
  updatedAt: Date
  requester?: User
  addressee?: User
}

// Notification types
export interface Notification {
  id: string
  userId: string
  type: string // 'friend_request', 'game_result', 'tournament_invite', etc.
  title: string
  message: string
  data?: Record<string, any> | null
  read: boolean
  createdAt: Date
}

// WebSocket event types
export interface WebSocketMessage {
  type: string
  data: unknown
  timestamp: number
}

export interface GameMoveInput {
  direction: 'up' | 'down' | 'stay'
  timestamp: number
}

export interface PlayerInput {
  userId: string
  input: GameMoveInput
}

// Statistics types
export interface UserStatistics {
  totalGames: number
  wins: number
  losses: number
  draws: number
  winRate: number
  winStreak: number
  highestStreak: number
  averageGameDuration: number
  ranking: number
  recentGames: Game[]
}

export interface LeaderboardEntry {
  rank: number
  user: User
  wins: number
  losses: number
  winRate: number
  ranking: number
  lastGameDate: Date
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Session types (for NextAuth)
export interface Session {
  user: {
    id: string
    email: string
    username: string
    image?: string | null
    name?: string | null
  }
  expires: string
}
