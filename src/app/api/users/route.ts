import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/users - List all users with pagination and search
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'wins'

    const skip = (page - 1) * limit

    // Build search query
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { displayName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}

    // Build sort query
    const orderBy: any = {}
    switch (sortBy) {
      case 'ranking':
        orderBy.ranking = 'asc'
        break
      case 'wins':
        orderBy.wins = 'desc'
        break
      case 'recent':
        orderBy.updatedAt = 'desc'
        break
      default:
        orderBy.username = 'asc'
    }

    // Get users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          isOnline: true,
          lastSeen: true,
          wins: true,
          losses: true,
          level: true,
          ranking: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    // Add calculated fields
    const usersWithStats = users.map((user) => ({
      ...user,
      winRate:
        user.wins + user.losses > 0
          ? Math.round((user.wins / (user.wins + user.losses)) * 100)
          : 0,
    }))

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
