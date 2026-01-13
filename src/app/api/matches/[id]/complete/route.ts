import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { advanceWinner } from '@/lib/tournament'
import { z } from 'zod'

const completeMatchSchema = z.object({
  winnerId: z.string(),
  score1: z.number().int().min(0),
  score2: z.number().int().min(0)
})

/**
 * POST /api/matches/[id]/complete
 * Complete a tournament match and advance winner
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = completeMatchSchema.parse(body)

    // Get match
    const match = await prisma.match.findUnique({
      where: { id: id },
      include: {
        tournament: true,
        participants: {
          select: { userId: true }
        }
      }
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Verify user is participant in this match
    const isParticipant = match.participants.some(
      (p) => p.userId === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Not a participant in this match' },
        { status: 403 }
      )
    }

    // Verify winner is participant
    const isWinner = match.participants.some(
      (p) => p.userId === validated.winnerId
    )

    if (!isWinner) {
      return NextResponse.json(
        { error: 'Winner must be a match participant' },
        { status: 400 }
      )
    }

    // Complete match and advance winner
    await advanceWinner(
      id,
      validated.winnerId,
      validated.score1,
      validated.score2
    )

    // Update user statistics
    const loser = match.participants.find(
      (p) => p.userId !== validated.winnerId
    )?.userId

    if (loser) {
      await Promise.all([
        prisma.user.update({
          where: { id: validated.winnerId },
          data: {
            wins: { increment: 1 }
          }
        }),
        prisma.user.update({
          where: { id: loser },
          data: {
            losses: { increment: 1 }
          }
        })
      ])
    }

    return NextResponse.json({
      message: 'Match completed',
      winnerId: validated.winnerId,
      score: {
        player1: validated.score1,
        player2: validated.score2
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error completing match:', error)
    return NextResponse.json(
      { error: 'Failed to complete match' },
      { status: 500 }
    )
  }
}
