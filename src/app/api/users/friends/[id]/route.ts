import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const body = await request.json()
    const { action } = body

    if (!['ACCEPT', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id },
    })

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: 'Friend request not found' },
        { status: 404 }
      )
    }

    if (friendship.addresseeId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (friendship.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Request already processed' },
        { status: 400 }
      )
    }

    if (action === 'ACCEPT') {
      const updated = await prisma.friendship.update({
        where: { id },
        data: { status: 'ACCEPTED' },
        include: {
          requester: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Friend request accepted',
      })
    } else {
      await prisma.friendship.delete({
        where: { id },
      })

      return NextResponse.json({
        success: true,
        message: 'Friend request rejected',
      })
    }
  } catch (error) {
    console.error('Error updating friend request:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const friendship = await prisma.friendship.findUnique({
      where: { id },
    })

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: 'Friendship not found' },
        { status: 404 }
      )
    }

    if (
      friendship.requesterId !== session.user.id &&
      friendship.addresseeId !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (friendship.status !== 'ACCEPTED') {
      return NextResponse.json(
        { success: false, error: 'Can only remove accepted friends' },
        { status: 400 }
      )
    }

    await prisma.friendship.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Friend removed',
    })
  } catch (error) {
    console.error('Error removing friend:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
