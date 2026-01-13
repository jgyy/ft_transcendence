import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/users/friends - Get user's friends list
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get accepted friendships
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: session.user.id, status: 'ACCEPTED' },
          { addresseeId: session.user.id, status: 'ACCEPTED' },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        addressee: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
    })

    // Extract friends from both directions
    const friends = friendships.map((f) =>
      f.requesterId === session.user.id ? f.addressee : f.requester
    )

    // Get pending friend requests
    const pendingRequests = await prisma.friendship.findMany({
      where: {
        addresseeId: session.user.id,
        status: 'PENDING',
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            isOnline: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        friends,
        pendingRequests: pendingRequests.map((r) => ({
          id: r.id,
          user: r.requester,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching friends:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users/friends - Send friend request
 */
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
    const { targetUserId } = body

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Target user ID required' },
        { status: 400 }
      )
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot add yourself as friend' },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: session.user.id,
          addresseeId: targetUserId,
        },
      },
    })

    if (existingFriendship) {
      return NextResponse.json(
        { success: false, error: 'Friendship request already sent' },
        { status: 409 }
      )
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: session.user.id,
        addresseeId: targetUserId,
        status: 'PENDING',
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: friendship,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error sending friend request:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
