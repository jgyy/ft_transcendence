import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  VALID_MAX_SCORES,
  GAME_THEMES,
  DEFAULT_GAME_SETTINGS
} from '@/lib/game-constants'

const preferencesSchema = z.object({
  ballSpeed: z.number().int().min(1).max(5).optional(),
  ballSize: z.number().int().min(1).max(5).optional(),
  paddleSpeed: z.number().int().min(1).max(5).optional(),
  paddleSize: z.number().int().min(1).max(5).optional(),
  maxScore: z.number().int().refine((val) => VALID_MAX_SCORES.includes(val)).optional(),
  theme: z.enum(Object.values(GAME_THEMES) as [string, ...string[]]).optional(),
  powerUpsEnabled: z.boolean().optional(),
  soundEnabled: z.boolean().optional()
})

type GamePreferences = z.infer<typeof preferencesSchema>

/**
 * GET /api/users/[id]/preferences
 * Get user's game preferences
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Users can only see their own preferences
    if (id !== session.user.id) {
      return NextResponse.json(
        { error: 'Cannot access other user preferences' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        gamePreferences: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return stored preferences or defaults
    const preferences = user.gamePreferences || DEFAULT_GAME_SETTINGS

    return NextResponse.json({
      userId: user.id,
      preferences
    })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/[id]/preferences
 * Update user's game preferences
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Users can only update their own preferences
    if (id !== session.user.id) {
      return NextResponse.json(
        { error: 'Cannot update other user preferences' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = preferencesSchema.parse(body)

    // Get current preferences
    const user = await prisma.user.findUnique({
      where: { id },
      select: { gamePreferences: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Merge with existing preferences
    const currentPreferences = (user.gamePreferences as Record<string, unknown>) || DEFAULT_GAME_SETTINGS
    const updatedPreferences = {
      ...currentPreferences,
      ...validated
    }

    // Update user preferences
    const updated = await prisma.user.update({
      where: { id },
      data: {
        gamePreferences: updatedPreferences
      },
      select: {
        id: true,
        gamePreferences: true
      }
    })

    return NextResponse.json({
      userId: updated.id,
      preferences: updated.gamePreferences,
      message: 'Preferences updated successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid preferences', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/[id]/preferences
 * Reset user's game preferences to defaults
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Users can only reset their own preferences
    if (id !== session.user.id) {
      return NextResponse.json(
        { error: 'Cannot reset other user preferences' },
        { status: 403 }
      )
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        gamePreferences: DEFAULT_GAME_SETTINGS
      },
      select: {
        id: true,
        gamePreferences: true
      }
    })

    return NextResponse.json({
      userId: updated.id,
      preferences: updated.gamePreferences,
      message: 'Preferences reset to defaults'
    })
  } catch (error) {
    console.error('Error resetting preferences:', error)
    return NextResponse.json(
      { error: 'Failed to reset preferences' },
      { status: 500 }
    )
  }
}
