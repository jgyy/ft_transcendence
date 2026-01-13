import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/statistics/leaderboard - Get global leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'wins'

    // Build sort query
    const orderBy: any = {}
    switch (sortBy) {
      case 'ranking':
        orderBy.ranking = 'asc'
        break
      case 'winRate':
        // For win rate, we'll sort by wins DESC and losses ASC in combination
        orderBy.wins = 'desc'
        break
      case 'level':
        orderBy.level = 'desc'
        break
      default:
        orderBy.wins = 'desc'
    }

    // Get leaderboard
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        level: true,
        wins: true,
        losses: true,
        draws: true,
        ranking: true,
        experience: true,
      },
      orderBy,
      skip: offset,
      take: limit,
    })

    // Calculate additional stats
    const leaderboard = users.map((user, index) => {
      const totalGames = user.wins + user.losses + user.draws
      const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0

      return {
        ...user,
        position: offset + index + 1,
        totalGames,
        winRate,
      }
    })

    // Get total user count
    const totalUsers = await prisma.user.count()

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        total: totalUsers,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
