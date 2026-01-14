import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Get user's unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    // Create a map of unlocked achievement IDs
    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement.id));

    // Combine data
    const achievements = allAchievements.map((achievement) => {
      const unlocked = userAchievements.find(
        (ua) => ua.achievement.id === achievement.id
      );
      return {
        ...achievement,
        isUnlocked: unlockedIds.has(achievement.id),
        unlockedAt: unlocked?.unlockedAt || null,
      };
    });

    // Get stats
    const totalAchievements = allAchievements.length;
    const unlockedCount = userAchievements.length;
    const totalPoints = userAchievements.reduce(
      (sum, ua) => sum + (ua.achievement.points || 0),
      0
    );

    return NextResponse.json({
      achievements,
      stats: {
        total: totalAchievements,
        unlocked: unlockedCount,
        totalPoints,
        percentage: totalAchievements > 0
          ? Math.round((unlockedCount / totalAchievements) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user achievements' },
      { status: 500 }
    );
  }
}
