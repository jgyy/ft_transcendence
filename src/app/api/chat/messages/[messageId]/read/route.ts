import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
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

    // Get the message
    const message = await prisma.message.findUnique({
      where: { id: params.messageId },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Only the recipient can mark as read
    if (message.recipientId !== currentUser.id) {
      return NextResponse.json(
        { error: 'You cannot mark this message as read' },
        { status: 403 }
      );
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id: params.messageId },
      data: {
        read: true,
        readAt: new Date(),
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
    });

    // TODO: Emit read receipt via WebSocket
    // io.to(message.senderId).emit('chat:read', { messageId, recipientId: currentUser.id })

    return NextResponse.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
