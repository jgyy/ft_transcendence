import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_ACHIEVEMENTS = [
  // Beginner achievements
  {
    name: 'First Steps',
    description: 'Play your first game',
    icon: '👣',
    category: 'Beginner',
    points: 10,
  },
  {
    name: 'Welcome to Pong',
    description: 'Complete the tutorial',
    icon: '🎮',
    category: 'Beginner',
    points: 15,
  },
  {
    name: 'Customizer',
    description: 'Customize your game settings',
    icon: '⚙️',
    category: 'Beginner',
    points: 10,
  },

  // Winning achievements
  {
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🏆',
    category: 'Winning',
    points: 25,
  },
  {
    name: 'Winning Streak',
    description: 'Win 5 games in a row',
    icon: '🔥',
    category: 'Winning',
    points: 50,
  },
  {
    name: 'Legendary Streak',
    description: 'Win 10 games in a row',
    icon: '⚡',
    category: 'Winning',
    points: 100,
  },

  // Competitive achievements
  {
    name: 'Tournament Rookie',
    description: 'Join your first tournament',
    icon: '🎯',
    category: 'Competitive',
    points: 30,
  },
  {
    name: 'Champion',
    description: 'Win a tournament',
    icon: '👑',
    category: 'Competitive',
    points: 75,
  },
  {
    name: 'Grand Master',
    description: 'Reach rank 1 on the leaderboard',
    icon: '💎',
    category: 'Competitive',
    points: 200,
  },

  // Social achievements
  {
    name: 'Social Butterfly',
    description: 'Add 5 friends',
    icon: '🦋',
    category: 'Social',
    points: 20,
  },
  {
    name: 'Friend Group',
    description: 'Add 10 friends',
    icon: '👥',
    category: 'Social',
    points: 40,
  },
  {
    name: 'Popular Player',
    description: 'Have 20 friends',
    icon: '⭐',
    category: 'Social',
    points: 60,
  },

  // Master achievements
  {
    name: 'Precision Master',
    description: 'Score 100 consecutive hits in a game',
    icon: '🎯',
    category: 'Master',
    points: 80,
  },
  {
    name: 'Level 10',
    description: 'Reach level 10',
    icon: '📈',
    category: 'Master',
    points: 100,
  },
  {
    name: 'Perfect Game',
    description: 'Win a game without losing a point',
    icon: '✨',
    category: 'Master',
    points: 150,
  },

  // Special achievements
  {
    name: 'AI Slayer',
    description: 'Beat the AI on the highest difficulty',
    icon: '🤖',
    category: 'Special',
    points: 120,
  },
  {
    name: 'Night Owl',
    description: 'Play 10 games between midnight and 6 AM',
    icon: '🌙',
    category: 'Special',
    points: 40,
  },
  {
    name: 'Speed Runner',
    description: 'Win a game in less than 30 seconds',
    icon: '💨',
    category: 'Special',
    points: 60,
  },
];

export async function POST(request: NextRequest) {
  try {
    // Verify request (optional: add authorization check)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}` && process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const achievement of DEFAULT_ACHIEVEMENTS) {
      const existing = await prisma.achievement.findUnique({
        where: { name: achievement.name },
      });

      if (!existing) {
        await prisma.achievement.create({
          data: {
            ...achievement,
            condition: {},
          },
        });
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    return NextResponse.json({
      message: 'Achievements initialized successfully',
      created: createdCount,
      skipped: skippedCount,
      total: DEFAULT_ACHIEVEMENTS.length,
    });
  } catch (error) {
    console.error('Error initializing achievements:', error);
    return NextResponse.json(
      { error: 'Failed to initialize achievements' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const count = await prisma.achievement.count();

    return NextResponse.json({
      message: 'Achievements status',
      initialized: count > 0,
      count,
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}
