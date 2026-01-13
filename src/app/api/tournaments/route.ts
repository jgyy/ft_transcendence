import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { isPowerOfTwo, getValidTournamentSizes } from '@/lib/tournament'

const createTournamentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  maxParticipants: z.number().int().min(4).max(32),
  gameSettings: z
    .object({
      ballSpeed: z.number().min(1).max(5).optional(),
      paddleSpeed: z.number().min(1).max(5).optional(),
      maxScore: z.number().int().min(1).optional(),
      theme: z.string().optional()
    })
    .optional()
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '10'))
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    const where: any = {}
    if (status !== 'all') {
      where.status = status
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        include: {
          organizer: {
            select: { id: true, username: true, avatarUrl: true }
          },
          winner: {
            select: { id: true, username: true }
          },
          _count: {
            select: { participants: true, matches: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.tournament.count({ where })
    ])

    return NextResponse.json({
      data: tournaments.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        status: t.status,
        maxParticipants: t.maxParticipants,
        currentParticipants: t._count.participants,
        matchesCompleted: t._count.matches,
        organizer: t.organizer,
        winner: t.winner,
        createdAt: t.createdAt,
        startedAt: t.startedAt,
        completedAt: t.completedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = createTournamentSchema.parse(body)

    if (!isPowerOfTwo(validated.maxParticipants)) {
      return NextResponse.json(
        {
          error: 'Tournament size must be power of 2',
          validSizes: getValidTournamentSizes()
        },
        { status: 400 }
      )
    }

    const tournament = await prisma.tournament.create({
      data: {
        name: validated.name,
        description: validated.description,
        maxParticipants: validated.maxParticipants,
        organizerId: session.user.id,
        gameSettings: validated.gameSettings || {}
      },
      include: {
        organizer: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    })

    await prisma.tournamentParticipant.create({
      data: {
        tournamentId: tournament.id,
        userId: session.user.id,
        seed: 1
      }
    })

    return NextResponse.json({
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      status: tournament.status,
      maxParticipants: tournament.maxParticipants,
      currentParticipants: 1,
      organizer: tournament.organizer,
      createdAt: tournament.createdAt
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating tournament:', error)
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    )
  }
}
