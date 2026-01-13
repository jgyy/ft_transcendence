import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_GAME_SETTINGS } from '@/lib/game-constants'
import { z } from 'zod'

const createGameSchema = z.object({
  mode: z.enum(['SINGLE_PLAYER', 'MULTIPLAYER', 'TOURNAMENT']),
  opponentId: z.string().optional(), // For multiplayer
  settings: z.object({}).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where: any = {
      OR: [
        { playerOneId: session.user.id },
        { playerTwoId: session.user.id },
      ],
    }

    if (status) {
      where.status = status
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          playerOne: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          playerTwo: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          winner: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.game.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        games,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = createGameSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      )
    }

    const { mode, opponentId, settings } = validation.data

    if (mode === 'MULTIPLAYER' && !opponentId) {
      return NextResponse.json(
        { success: false, error: 'Opponent ID required for multiplayer' },
        { status: 400 }
      )
    }

    if (mode === 'MULTIPLAYER' && opponentId) {
      const opponent = await prisma.user.findUnique({
        where: { id: opponentId },
      })

      if (!opponent) {
        return NextResponse.json(
          { success: false, error: 'Opponent not found' },
          { status: 404 }
        )
      }
    }

    const game = await prisma.game.create({
      data: {
        playerOneId: session.user.id,
        playerTwoId: mode === 'MULTIPLAYER' ? opponentId : undefined,
        gameMode: mode,
        status: 'WAITING',
        settings: settings || DEFAULT_GAME_SETTINGS,
        isAIGame: mode === 'SINGLE_PLAYER',
        aiDifficulty: mode === 'SINGLE_PLAYER' ? 'MEDIUM' : null,
      },
      include: {
        playerOne: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        playerTwo: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: game,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
