import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { PongGame, PongAI, GameInput, GameMode } from './game'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { DEFAULT_GAME_SETTINGS } from '@/lib/game-constants'

interface AuthSocket extends Socket {
  userId?: string
  username?: string
  isAuthenticated?: boolean
}

interface GameRoom {
  gameId: string
  game: PongGame
  player1Id: string
  player2Id?: string
  isAIGame: boolean
  ai?: PongAI
  spectators: Set<string>
  status: 'waiting' | 'ready' | 'playing' | 'finished'
}

interface QueueEntry {
  userId: string
  username: string
  mode: GameMode
  settings: typeof DEFAULT_GAME_SETTINGS
  timestamp: number
}

export class PongWebSocketServer {
  private io: Server
  private games: Map<string, GameRoom> = new Map()
  private userSockets: Map<string, AuthSocket> = new Map()
  private gameQueue: Map<string, QueueEntry> = new Map()
  private onlinePlayers: Set<string> = new Set()
  private updateInterval: NodeJS.Timeout | null = null

  constructor(port: number = 3001) {
    const httpServer = createServer()

    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    })

    this.setupMiddleware()
    this.setupEventHandlers()
    this.setupUpdateInterval()

    httpServer.listen(port, () => {
      console.log(`[WebSocket] Server listening on port ${port}`)
    })
  }

  private setupMiddleware(): void {
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token

        if (!token) {
          return next(new Error('Authentication required'))
        }

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret'
        ) as any

        socket.userId = decoded.userId || decoded.id
        socket.username = decoded.username

        const user = await prisma.user.findUnique({
          where: { id: socket.userId },
          select: { id: true, username: true, email: true },
        })

        if (!user) {
          return next(new Error('User not found'))
        }

        socket.isAuthenticated = true
        next()
      } catch (error) {
        console.error('[WebSocket] Authentication error:', error)
        next(new Error('Authentication failed'))
      }
    })
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthSocket) => {
      console.log(
        `[WebSocket] User connected: ${socket.username} (${socket.userId})`
      )

      this.userSockets.set(socket.userId!, socket)
      this.onlinePlayers.add(socket.userId!)

      this.io.emit('player:online', {
        userId: socket.userId,
        username: socket.username,
      })

      socket.on('game:move', (data: GameInput) => {
        this.handleGameMove(socket, data)
      })

      socket.on('queue:join', (data) => {
        this.handleQueueJoin(socket, data)
      })

      socket.on('queue:leave', () => {
        this.handleQueueLeave(socket)
      })

      socket.on('game:join', (data) => {
        this.handleGameJoin(socket, data)
      })

      socket.on('game:ready', (data) => {
        this.handleGameReady(socket, data)
      })

      socket.on('game:leave', (data) => {
        this.handleGameLeave(socket, data)
      })

      socket.on('game:pause', (data) => {
        this.handleGamePause(socket, data)
      })

      socket.on('game:resume', (data) => {
        this.handleGameResume(socket, data)
      })

      socket.on('tournament:join', (data) => {
        this.handleTournamentJoin(socket, data)
      })

      socket.on('tournament:leave', (data) => {
        this.handleTournamentLeave(socket, data)
      })

      socket.on('disconnect', () => {
        this.handleDisconnect(socket)
      })

      socket.on('error', (error) => {
        console.error(`[WebSocket] Socket error for ${socket.username}:`, error)
      })
    })
  }

  private handleGameMove(socket: AuthSocket, data: GameInput): void {
    for (const [gameId, room] of this.games) {
      if (
        room.player1Id === socket.userId ||
        room.player2Id === socket.userId
      ) {
        if (room.game && !room.game.isGameFinished()) {
          room.game.handleInput({
            playerId: socket.userId!,
            direction: data.direction,
            timestamp: Date.now(),
          })
        }
        return
      }
    }
  }

  private handleQueueJoin(
    socket: AuthSocket,
    data: { mode: GameMode; settings?: typeof DEFAULT_GAME_SETTINGS }
  ): void {
    const queueKey = `${socket.userId}-${data.mode}`

    this.gameQueue.set(queueKey, {
      userId: socket.userId!,
      username: socket.username!,
      mode: data.mode,
      settings: data.settings || DEFAULT_GAME_SETTINGS,
      timestamp: Date.now(),
    })

    socket.emit('queue:joined', {
      mode: data.mode,
      position: this.gameQueue.size,
    })

    this.tryMatchmaking(data.mode)
  }

  private handleQueueLeave(socket: AuthSocket): void {
    const modes: GameMode[] = ['SINGLE_PLAYER', 'MULTIPLAYER', 'TOURNAMENT']

    for (const mode of modes) {
      const queueKey = `${socket.userId}-${mode}`
      this.gameQueue.delete(queueKey)
    }

    socket.emit('queue:left')
  }

  private tryMatchmaking(mode: GameMode): void {
    if (mode === 'SINGLE_PLAYER') {
      const queueEntries = Array.from(this.gameQueue.values()).filter(
        (e) => e.mode === 'SINGLE_PLAYER'
      )

      for (const entry of queueEntries) {
        const gameId = this.generateGameId()
        const game = this.createGame(
          gameId,
          entry.userId,
          entry.username,
          'ai-opponent',
          'AI Opponent',
          'SINGLE_PLAYER',
          entry.settings,
          true
        )

        const socket = this.userSockets.get(entry.userId)
        if (socket) {
          socket.emit('queue:matched', {
            gameId,
            opponent: {
              id: 'ai-opponent',
              username: 'AI Opponent',
              isAI: true,
            },
          })

          socket.join(gameId)
        }

        const queueKey = `${entry.userId}-SINGLE_PLAYER`
        this.gameQueue.delete(queueKey)
      }
    } else if (mode === 'MULTIPLAYER') {
      const queueEntries = Array.from(this.gameQueue.values()).filter(
        (e) => e.mode === 'MULTIPLAYER'
      )

      for (let i = 0; i < queueEntries.length - 1; i += 2) {
        const player1 = queueEntries[i]
        const player2 = queueEntries[i + 1]

        const gameId = this.generateGameId()
        const game = this.createGame(
          gameId,
          player1.userId,
          player1.username,
          player2.userId,
          player2.username,
          'MULTIPLAYER',
          player1.settings
        )

        const socket1 = this.userSockets.get(player1.userId)
        const socket2 = this.userSockets.get(player2.userId)

        if (socket1) {
          socket1.emit('queue:matched', {
            gameId,
            opponent: {
              id: player2.userId,
              username: player2.username,
            },
          })
          socket1.join(gameId)
        }

        if (socket2) {
          socket2.emit('queue:matched', {
            gameId,
            opponent: {
              id: player1.userId,
              username: player1.username,
            },
          })
          socket2.join(gameId)
        }

        const key1 = `${player1.userId}-MULTIPLAYER`
        const key2 = `${player2.userId}-MULTIPLAYER`
        this.gameQueue.delete(key1)
        this.gameQueue.delete(key2)
      }
    }
  }

  private handleGameJoin(
    socket: AuthSocket,
    data: { gameId: string }
  ): void {
    const room = this.games.get(data.gameId)
    if (!room) {
      socket.emit('error', { message: 'Game not found' })
      return
    }

    if (
      room.player1Id !== socket.userId &&
      room.player2Id !== socket.userId
    ) {
      room.spectators.add(socket.userId!)
    }

    socket.join(data.gameId)

    socket.emit('game:state', room.game.getSerializedState())
  }

  private handleGameReady(socket: AuthSocket, data: { gameId: string }): void {
    const room = this.games.get(data.gameId)
    if (!room) return

    const playerIndex =
      room.player1Id === socket.userId
        ? 0
        : room.player2Id === socket.userId
          ? 1
          : -1

    if (playerIndex === -1) return

    const gameState = room.game.getState()
    gameState.players[playerIndex].isReady = true

    if (gameState.players.every((p) => p.isReady)) {
      room.status = 'ready'
      room.game.start()
      this.io.to(data.gameId).emit('game:start', {
        gameId: data.gameId,
        timestamp: Date.now(),
      })
    } else {
      this.io.to(data.gameId).emit('game:ready', {
        playerId: socket.userId,
        username: socket.username,
      })
    }
  }

  private handleGameLeave(socket: AuthSocket, data: { gameId: string }): void {
    const room = this.games.get(data.gameId)
    if (!room) return

    if (room.player1Id === socket.userId || room.player2Id === socket.userId) {
      room.game.forfeit(socket.userId!)
    } else {
      room.spectators.delete(socket.userId!)
    }

    socket.leave(data.gameId)
  }

  private handleGamePause(socket: AuthSocket, data: { gameId: string }): void {
    const room = this.games.get(data.gameId)
    if (!room) return

    room.game.pause(socket.userId)
    this.io.to(data.gameId).emit('game:paused', {
      pausedBy: socket.username,
    })
  }

  private handleGameResume(socket: AuthSocket, data: { gameId: string }): void {
    const room = this.games.get(data.gameId)
    if (!room) return

    room.game.resume()
    this.io.to(data.gameId).emit('game:resumed')
  }

  private handleTournamentJoin(
    socket: AuthSocket,
    data: { tournamentId: string }
  ): void {
    socket.join(`tournament:${data.tournamentId}`)
    this.io
      .to(`tournament:${data.tournamentId}`)
      .emit('tournament:player-joined', {
        userId: socket.userId,
        username: socket.username,
      })
  }

  private handleTournamentLeave(
    socket: AuthSocket,
    data: { tournamentId: string }
  ): void {
    socket.leave(`tournament:${data.tournamentId}`)
    this.io
      .to(`tournament:${data.tournamentId}`)
      .emit('tournament:player-left', {
        userId: socket.userId,
        username: socket.username,
      })
  }

  private handleDisconnect(socket: AuthSocket): void {
    console.log(`[WebSocket] User disconnected: ${socket.username}`)

    this.userSockets.delete(socket.userId!)
    this.onlinePlayers.delete(socket.userId!)

    this.io.emit('player:offline', {
      userId: socket.userId,
      username: socket.username,
    })

    for (const [gameId, room] of this.games) {
      if (
        room.player1Id === socket.userId ||
        room.player2Id === socket.userId
      ) {
        setTimeout(() => {
          if (!this.userSockets.has(socket.userId!)) {
            room.game.forfeit(socket.userId!)
          }
        }, 30000)
      }
    }
  }

  private createGame(
    gameId: string,
    player1Id: string,
    player1Name: string,
    player2Id: string,
    player2Name: string,
    gameMode: GameMode,
    settings: typeof DEFAULT_GAME_SETTINGS,
    isAIGame: boolean = false
  ): PongGame {
    const game = new (require('./game').PongGame)(
      gameId,
      player1Id,
      player1Name,
      player2Id,
      player2Name,
      gameMode,
      settings,
      isAIGame
    )

    const room: GameRoom = {
      gameId,
      game,
      player1Id,
      player2Id: isAIGame ? undefined : player2Id,
      isAIGame,
      spectators: new Set(),
      status: 'waiting',
    }

    if (isAIGame) {
      room.ai = new (require('./game').PongAI)('MEDIUM')
    }

    game.setHandlers({
      onStateUpdate: (state) => {
        this.io.to(gameId).emit('game:state', JSON.stringify(state))
      },
      onScore: (playerIndex, score) => {
        this.io.to(gameId).emit('game:score', {
          playerIndex,
          score,
          scores: game.getState().score,
        })
      },
      onGameEnd: (winnerId, stats) => {
        room.status = 'finished'
        this.io.to(gameId).emit('game:end', {
          winnerId,
          stats,
        })

        this.saveGameToDatabase(gameId, game.getState(), stats)
          .catch((err) => console.error('[WebSocket] Error saving game:', err))
      },
      onError: (error) => {
        this.io.to(gameId).emit('error', { message: error })
      },
    })

    this.games.set(gameId, room)
    return game
  }

  private setupUpdateInterval(): void {
    this.updateInterval = setInterval(() => {
      for (const [gameId, room] of this.games) {
        if (room.isAIGame && room.ai && !room.game.isGameFinished()) {
          const input = room.ai.getNextInput(room.game.getState())
          if (input.direction !== 'stay') {
            room.game.handleInput({
              playerId: room.player2Id || 'ai-opponent',
              direction: input.direction,
              timestamp: Date.now(),
            })
          }
        }
      }

      for (const [gameId, room] of this.games) {
        if (
          room.status === 'finished' &&
          room.spectators.size === 0 &&
          (room.player1Id === 'ai-opponent' ||
            !this.userSockets.has(room.player1Id)) &&
          (room.player2Id === 'ai-opponent' ||
            !this.userSockets.has(room.player2Id || ''))
        ) {
          this.games.delete(gameId)
        }
      }
    }, 50)
  }

  private async saveGameToDatabase(
    gameId: string,
    state: any,
    stats: any
  ): Promise<void> {
    try {
      const game = await prisma.game.create({
        data: {
          id: gameId,
          playerOneId: state.players[0].id,
          playerTwoId: state.players[1].id,
          playerOneScore: state.score[0],
          playerTwoScore: state.score[1],
          winnerId: stats.winnerId,
          gameMode: 'MULTIPLAYER',
          status: 'COMPLETED',
          settings: state.settings,
          isAIGame: state.players[1].isAI || false,
          aiDifficulty: state.players[1].isAI ? 'MEDIUM' : null,
          startedAt: new Date(stats.startTime),
          endedAt: new Date(stats.endTime),
          durationSeconds: stats.duration,
        },
      })

      await prisma.gameResult.createMany({
        data: [
          {
            gameId,
            userId: state.players[0].id,
            score: state.score[0],
            isWinner: state.players[0].id === stats.winnerId,
            statistics: { stats: 'placeholder' },
          },
          {
            gameId,
            userId: state.players[1].id,
            score: state.score[1],
            isWinner: state.players[1].id === stats.winnerId,
            statistics: { stats: 'placeholder' },
          },
        ],
      })

      await Promise.all([
        this.updateUserStats(state.players[0].id, state.score[0], state.score[1]),
        this.updateUserStats(state.players[1].id, state.score[1], state.score[0]),
      ])
    } catch (error) {
      console.error('[WebSocket] Error saving game to database:', error)
    }
  }

  private async updateUserStats(
    userId: string,
    playerScore: number,
    opponentScore: number
  ): Promise<void> {
    const isWin = playerScore > opponentScore

    await prisma.user.update({
      where: { id: userId },
      data: {
        wins: {
          increment: isWin ? 1 : 0,
        },
        losses: {
          increment: !isWin ? 1 : 0,
        },
        winStreak: {
          increment: isWin ? 1 : 0,
        },
        experience: {
          increment: 10 + (isWin ? 5 : 0),
        },
      },
    })
  }

  private generateGameId(): string {
    return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  public getStats() {
    return {
      onlinePlayers: this.onlinePlayers.size,
      activeGames: this.games.size,
      queuedPlayers: this.gameQueue.size,
      spectators: Array.from(this.games.values()).reduce(
        (sum, room) => sum + room.spectators.size,
        0
      ),
    }
  }

  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    this.io.close()
  }
}

export function createWebSocketServer(port?: number): PongWebSocketServer {
  return new PongWebSocketServer(port)
}
