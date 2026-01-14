import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if users are friends
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            requesterId: currentUser.id,
            addresseeId: params.userId,
            status: 'ACCEPTED',
          },
          {
            requesterId: params.userId,
            addresseeId: currentUser.id,
            status: 'ACCEPTED',
          },
        ],
      },
    });

    // For now, allow messaging between any users (can be made friend-only)
    // if (!friendship) {
    //   return NextResponse.json(
    //     { error: 'You must be friends to send messages' },
    //     { status: 403 }
    //   );
    // }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get messages between the two users (ordered by creation date)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUser.id,
            recipientId: params.userId,
          },
          {
            senderId: params.userId,
            recipientId: currentUser.id,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Automatically mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: params.userId,
        recipientId: currentUser.id,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Get the other user's info
    const otherUser = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        isOnline: true,
        lastSeen: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.reverse(),
        user: otherUser,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
