import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, category, points } = body;

    // Validate input
    if (!name || !description || !icon || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const achievement = await prisma.achievement.create({
      data: {
        name,
        description,
        icon,
        category,
        points: points || 0,
        condition: {},
      },
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error: any) {
    console.error('Error creating achievement:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Achievement with this name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
}
