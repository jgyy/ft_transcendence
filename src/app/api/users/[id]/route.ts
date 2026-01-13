import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        level: true,
        experience: true,
        wins: true,
        losses: true,
        draws: true,
        winStreak: true,
        highestStreak: true,
        ranking: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const totalGames = user.wins + user.losses + user.draws
    const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0

    const recentGames = await prisma.game.findMany({
      where: {
        OR: [{ playerOneId: userId }, { playerTwoId: userId }],
      },
      select: {
        id: true,
        playerOneId: true,
        playerTwoId: true,
        playerOneScore: true,
        playerTwoScore: true,
        winnerId: true,
        gameMode: true,
        createdAt: true,
        playerOne: {
          select: { username: true, avatarUrl: true },
        },
        playerTwo: {
          select: { username: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...user,
          totalGames,
          winRate,
          recentGames,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.id !== id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const allowedFields = ['displayName', 'bio', 'avatarUrl']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (updateData.displayName && updateData.displayName.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Display name too long' },
        { status: 400 }
      )
    }

    if (updateData.bio && updateData.bio.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Bio too long' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
