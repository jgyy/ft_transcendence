import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const achievementId = params.id;
    const userId = session.user.id;

    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Achievement already unlocked' },
        { status: 409 }
      );
    }

    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
      include: { achievement: true },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: `You've unlocked: ${achievement.name}`,
        data: {
          achievementId,
          achievementName: achievement.name,
          achievementIcon: achievement.icon,
        },
      },
    });

    return NextResponse.json(userAchievement, { status: 201 });
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return NextResponse.json(
      { error: 'Failed to unlock achievement' },
      { status: 500 }
    );
  }
}
