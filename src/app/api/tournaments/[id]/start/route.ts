import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startTournament, isPowerOfTwo } from '@/lib/tournament'

/**
 * POST /api/tournaments/[id]/start
 * Start tournament (organizer only)
 * Requires minimum participants and power of 2 count
 */
export async function POST(
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

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Check authorization
    if (tournament.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only organizer can start tournament' },
        { status: 403 }
      )
    }

    // Check status
    if (tournament.status !== 'REGISTRATION') {
      return NextResponse.json(
        { error: 'Tournament is already started' },
        { status: 400 }
      )
    }

    // Check participant count
    if (tournament._count.participants < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 participants' },
        { status: 400 }
      )
    }

    // Check if count is power of 2
    if (!isPowerOfTwo(tournament._count.participants)) {
      return NextResponse.json(
        {
          error: 'Participant count must be power of 2 (2, 4, 8, 16, 32)',
          currentCount: tournament._count.participants
        },
        { status: 400 }
      )
    }

    // Start tournament
    await startTournament(id)

    const updated = await prisma.tournament.findUnique({
      where: { id },
      include: {
        _count: {
          select: { participants: true, matches: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Tournament started',
      tournament: {
        id: updated?.id,
        status: updated?.status,
        participantCount: updated?._count.participants,
        matchCount: updated?._count.matches,
        startedAt: updated?.startedAt
      }
    })
  } catch (error) {
    console.error('Error starting tournament:', error)
    return NextResponse.json(
      { error: 'Failed to start tournament' },
      { status: 500 }
    )
  }
}
