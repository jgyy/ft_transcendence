import { prisma } from './prisma'
import {
  Tournament,
  TournamentStatus,
  Match,
  MatchStatus,
  MatchParticipant,
  User
} from '@prisma/client'

export interface BracketMatch {
  id: string
  round: number
  matchNumber: number
  player1: { id: string; username: string; avatarUrl?: string } | null
  player2: { id: string; username: string; avatarUrl?: string } | null
  winner: { id: string; username: string } | null
  status: MatchStatus
  startedAt?: Date
  completedAt?: Date
}

export interface TournamentBracket {
  id: string
  name: string
  status: TournamentStatus
  rounds: BracketMatch[][]
  currentRound: number
  totalRounds: number
  participants: Array<{ id: string; username: string; avatarUrl?: string }>
  winner?: { id: string; username: string }
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}

export function calculateTournamentRounds(playerCount: number): number {
  if (!isPowerOfTwo(playerCount)) {
    throw new Error('Player count must be a power of 2 (4, 8, 16, 32)')
  }
  return Math.log2(playerCount)
}

export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0
}

export function getValidTournamentSizes(): number[] {
  return [4, 8, 16, 32]
}

export async function generateBracket(
  tournamentId: string,
  participantIds: string[]
): Promise<void> {
  const playerCount = participantIds.length
  const rounds = calculateTournamentRounds(playerCount)

  const participants = await prisma.user.findMany({
    where: { id: { in: participantIds } },
    select: { id: true, ranking: true }
  })

  const seededIds = seedPlayers(
    participantIds,
    participants.reduce(
      (acc, p) => {
        acc[p.id] = p.ranking || 0
        return acc
      },
      {} as Record<string, number>
    )
  )

  for (let i = 0; i < playerCount; i += 2) {
    await prisma.match.create({
      data: {
        tournamentId,
        round: 1,
        matchNumber: Math.floor(i / 2) + 1,
        status: MatchStatus.PENDING,
        participants: {
          create: [
            {
              userId: seededIds[i]
            },
            {
              userId: seededIds[i + 1]
            }
          ]
        }
      }
    })
  }
}

function seedPlayers(
  playerIds: string[],
  rankings: Record<string, number>
): string[] {
  const sorted = [...playerIds].sort(
    (a, b) => rankings[b] - rankings[a]
  )

  const seeded: string[] = []
  const half = sorted.length / 2

  for (let i = 0; i < half; i++) {
    seeded.push(sorted[i])
    seeded.push(sorted[sorted.length - 1 - i])
  }

  return seeded
}

export async function getTournamentBracket(
  tournamentId: string
): Promise<TournamentBracket> {
  const tournament = await prisma.tournament.findUniqueOrThrow({
    where: { id: tournamentId },
    include: {
      participants: {
        select: { userId: true }
      },
      matches: {
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, username: true, avatarUrl: true }
              }
            }
          },
          winner: {
            select: { id: true, username: true }
          }
        },
        orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }]
      }
    }
  })

  const totalRounds = calculateTournamentRounds(tournament.participants.length)
  const brackets: BracketMatch[][] = []

  for (let round = 1; round <= totalRounds; round++) {
    const roundMatches = tournament.matches
      .filter((m) => m.round === round)
      .map((m) => ({
        id: m.id,
        round: m.round,
        matchNumber: m.matchNumber,
        player1: m.participants[0]?.user || null,
        player2: m.participants[1]?.user || null,
        winner: m.winner,
        status: m.status,
        startedAt: m.startedAt || undefined,
        completedAt: m.completedAt || undefined
      }))

    brackets.push(roundMatches)
  }

  const currentRound =
    tournament.matches.findIndex((m) => m.status === MatchStatus.IN_PROGRESS) >= 0
      ? tournament.matches.find((m) => m.status === MatchStatus.IN_PROGRESS)
        ?.round || totalRounds
      : tournament.matches.findIndex((m) => m.status === MatchStatus.PENDING) >= 0
        ? tournament.matches.find((m) => m.status === MatchStatus.PENDING)
          ?.round || 1
        : totalRounds

  return {
    id: tournament.id,
    name: tournament.name,
    status: tournament.status,
    rounds: brackets,
    currentRound,
    totalRounds,
    participants: tournament.participants.map((p) => ({
      id: p.userId,
      username: '',
      avatarUrl: undefined
    })),
    winner: tournament.winnerId
      ? { id: tournament.winnerId, username: '' }
      : undefined,
    createdAt: tournament.createdAt,
    startedAt: tournament.startedAt || undefined,
    completedAt: tournament.completedAt || undefined
  }
}

export async function advanceWinner(
  matchId: string,
  winnerId: string,
  playerOneScore: number,
  playerTwoScore: number
): Promise<void> {
  const match = await prisma.match.findUniqueOrThrow({
    where: { id: matchId },
    include: {
      tournament: true,
      participants: {
        include: { user: true }
      }
    }
  })

  if (match.status === MatchStatus.COMPLETED) {
    throw new Error('Match already completed')
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      status: MatchStatus.COMPLETED,
      winnerId,
      playerOneScore,
      playerTwoScore,
      completedAt: new Date()
    }
  })

  const tournament = match.tournament
  const totalRounds = calculateTournamentRounds(match.tournament.maxParticipants)

  if (match.round === totalRounds) {
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        status: TournamentStatus.COMPLETED,
        winnerId,
        completedAt: new Date()
      }
    })
    return
  }

  const nextRoundNumber = match.round + 1
  const matchesInNextRound = await prisma.match.count({
    where: {
      tournamentId: tournament.id,
      round: nextRoundNumber
    }
  })

  const nextMatchNumber = matchesInNextRound / 2 + 1

  let nextMatch = await prisma.match.findFirst({
    where: {
      tournamentId: tournament.id,
      round: nextRoundNumber,
      matchNumber: nextMatchNumber
    }
  })

  if (!nextMatch) {
    nextMatch = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        round: nextRoundNumber,
        matchNumber: nextMatchNumber,
        status: MatchStatus.PENDING,
        participants: {
          create: [
            {
              userId: winnerId,
              seeding: 1
            },
            {
              userId: '',
              seeding: 2
            }
          ]
        }
      }
    })
  } else {
    const existingParticipant = await prisma.matchParticipant.findFirst({
      where: { matchId: nextMatch.id, userId: { not: '' } }
    })

    if (existingParticipant) {
      await prisma.match.update({
        where: { id: nextMatch.id },
        data: { status: MatchStatus.READY }
      })
    } else {
      await prisma.matchParticipant.create({
        data: {
          matchId: nextMatch.id,
          userId: winnerId,
          seeding: 1
        }
      })
    }
  }
}

export async function getUserNextMatch(
  tournamentId: string,
  userId: string
): Promise<BracketMatch | null> {
  const match = await prisma.match.findFirst({
    where: {
      tournamentId,
      participants: {
        some: { userId }
      },
      status: {
        in: [MatchStatus.PENDING, MatchStatus.READY, MatchStatus.IN_PROGRESS]
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true }
          }
        }
      },
      winner: {
        select: { id: true, username: true }
      }
    }
  })

  if (!match) return null

  return {
    id: match.id,
    round: match.round,
    matchNumber: match.matchNumber,
    player1: match.participants[0]?.user || null,
    player2: match.participants[1]?.user || null,
    winner: match.winner,
    status: match.status,
    playerOneScore: match.playerOneScore || undefined,
    playerTwoScore: match.playerTwoScore || undefined,
    startedAt: match.startedAt || undefined,
    completedAt: match.completedAt || undefined
  }
}

export async function canUserJoinTournament(
  tournamentId: string,
  userId: string
): Promise<boolean> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { _count: { select: { participants: true } } }
  })

  if (!tournament || tournament.status !== TournamentStatus.PENDING) {
    return false
  }

  const isAlreadyParticipant = await prisma.tournamentParticipant.findUnique({
    where: {
      tournamentId_userId: { tournamentId, userId }
    }
  })

  if (isAlreadyParticipant) {
    return false
  }

  const hasRoom =
    tournament._count.participants < tournament.maxParticipants

  return hasRoom
}

export async function startTournament(
  tournamentId: string
): Promise<void> {
  const tournament = await prisma.tournament.findUniqueOrThrow({
    where: { id: tournamentId }
  })

  if (tournament.status !== TournamentStatus.PENDING) {
    throw new Error('Tournament is not in pending status')
  }

  const participants = await prisma.tournamentParticipant.findMany({
    where: { tournamentId },
    select: { userId: true }
  })

  if (!isPowerOfTwo(participants.length)) {
    throw new Error('Tournament must have power of 2 participants')
  }

  const participantIds = participants.map((p) => p.userId)

  await generateBracket(tournamentId, participantIds)

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      status: TournamentStatus.IN_PROGRESS,
      startedAt: new Date()
    }
  })
}

export async function getTournamentStats(tournamentId: string) {
  const tournament = await prisma.tournament.findUniqueOrThrow({
    where: { id: tournamentId },
    include: {
      participants: true,
      matches: {
        include: {
          participants: true,
          winner: true
        }
      }
    }
  })

  const completedMatches = tournament.matches.filter(
    (m) => m.status === MatchStatus.COMPLETED
  ).length
  const totalMatches = tournament.participants.length - 1

  return {
    totalParticipants: tournament.participants.length,
    completedMatches,
    totalMatches,
    progress: Math.round((completedMatches / totalMatches) * 100),
    winner: tournament.winner
  }
}
