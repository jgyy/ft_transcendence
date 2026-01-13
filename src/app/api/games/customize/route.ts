import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  BALL_SPEED_MULTIPLIERS,
  BALL_SIZE_MULTIPLIERS,
  PADDLE_SPEED_MULTIPLIERS,
  PADDLE_SIZE_MULTIPLIERS,
  GAME_THEMES,
  VALID_MAX_SCORES,
  POWER_UP_EFFECTS,
  THEME_COLORS
} from '@/lib/game-constants'

/**
 * GET /api/games/customize
 * Get available customization options
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      ballSpeed: {
        min: 1,
        max: 5,
        default: 3,
        multipliers: BALL_SPEED_MULTIPLIERS,
        description: 'Ball movement speed (1-5)'
      },
      ballSize: {
        min: 1,
        max: 5,
        default: 3,
        multipliers: BALL_SIZE_MULTIPLIERS,
        description: 'Ball size (1-5)'
      },
      paddleSpeed: {
        min: 1,
        max: 5,
        default: 3,
        multipliers: PADDLE_SPEED_MULTIPLIERS,
        description: 'Paddle movement speed (1-5)'
      },
      paddleSize: {
        min: 1,
        max: 5,
        default: 3,
        multipliers: PADDLE_SIZE_MULTIPLIERS,
        description: 'Paddle size (1-5)'
      },
      maxScore: {
        options: VALID_MAX_SCORES,
        default: 11,
        description: 'Score needed to win'
      },
      themes: {
        options: Object.keys(GAME_THEMES),
        colors: THEME_COLORS,
        default: 'classic',
        description: 'Visual theme'
      },
      powerUps: {
        enabled: false,
        default: false,
        types: Object.entries(POWER_UP_EFFECTS).map(
          ([key, effect]) => ({
            id: key,
            ...effect
          })
        ),
        description: 'Enable power-ups in game'
      },
      soundEnabled: {
        default: true,
        description: 'Enable game sounds'
      }
    })
  } catch (error) {
    console.error('Error fetching customization options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customization options' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/games/customize
 * Save user game customization preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate customization settings
    const settingsSchema = z.object({
      ballSpeed: z.number().int().min(1).max(5).optional(),
      ballSize: z.number().int().min(1).max(5).optional(),
      paddleSpeed: z.number().int().min(1).max(5).optional(),
      paddleSize: z.number().int().min(1).max(5).optional(),
      maxScore: z.enum(['5', '7', '11', '15', '21']).optional(),
      theme: z.enum(Object.values(GAME_THEMES) as [string, ...string[]]),
      powerUpsEnabled: z.boolean().optional(),
      soundEnabled: z.boolean().optional()
    })

    const validated = settingsSchema.parse(body)

    // Return validated settings (in a real app, these would be saved to DB per user)
    return NextResponse.json({
      settings: {
        ballSpeed: validated.ballSpeed ?? 3,
        ballSize: validated.ballSize ?? 3,
        paddleSpeed: validated.paddleSpeed ?? 3,
        paddleSize: validated.paddleSize ?? 3,
        maxScore: parseInt(validated.maxScore ?? '11'),
        theme: validated.theme,
        powerUpsEnabled: validated.powerUpsEnabled ?? false,
        soundEnabled: validated.soundEnabled ?? true
      },
      message: 'Settings validated'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid customization settings', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error processing customization:', error)
    return NextResponse.json(
      { error: 'Failed to process customization' },
      { status: 500 }
    )
  }
}
