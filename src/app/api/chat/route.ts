import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get list of users you have conversations with (sorted by last message)
    const conversations = await prisma.$queryRaw<
      Array<{
        userId: string;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
        isOnline: boolean;
        lastMessageContent: string | null;
        lastMessageDate: Date | null;
        unreadCount: number;
      }>
    >`
      SELECT DISTINCT
        CASE
          WHEN m1."senderId" = ${user.id} THEN m1."recipientId"
          ELSE m1."senderId"
        END as "userId",
        u.username,
        u."displayName",
        u."avatarUrl",
        u."isOnline",
        m1.content as "lastMessageContent",
        m1."createdAt" as "lastMessageDate",
        COUNT(CASE WHEN m1."read" = false AND m1."recipientId" = ${user.id} THEN 1 END) as "unreadCount"
      FROM "Message" m1
      JOIN "User" u ON (
        (m1."senderId" = ${user.id} AND m1."recipientId" = u.id) OR
        (m1."recipientId" = ${user.id} AND m1."senderId" = u.id)
      )
      WHERE m1."createdAt" = (
        SELECT MAX(m2."createdAt")
        FROM "Message" m2
        WHERE (
          (m2."senderId" = ${user.id} AND m2."recipientId" = u.id) OR
          (m2."recipientId" = ${user.id} AND m2."senderId" = u.id)
        )
      )
      GROUP BY "userId", u.username, u."displayName", u."avatarUrl", u."isOnline", m1.content, m1."createdAt"
      ORDER BY m1."createdAt" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
