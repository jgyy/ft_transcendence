import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canUserJoinTournament } from '@/lib/tournament'

/**
 * POST /api/tournaments/[id]/join
 * Join a tournament
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

    // Check tournament exists
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

    // Check if user can join
    const canJoin = await canUserJoinTournament(
      id,
      session.user.id
    )

    if (!canJoin) {
      return NextResponse.json(
        {
          error: 'Cannot join tournament',
          reason:
            tournament.status !== 'REGISTRATION'
              ? 'Tournament is not accepting participants'
              : tournament._count.participants >=
                  tournament.maxParticipants
                ? 'Tournament is full'
                : 'Already a participant'
        },
        { status: 400 }
      )
    }

    // Add user to tournament with seed based on current participant count
    const seed = tournament._count.participants + 1
    const participant = await prisma.tournamentParticipant.create({
      data: {
        tournamentId: id,
        userId: session.user.id,
        seed
      },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Successfully joined tournament',
      participant: {
        id: participant.user.id,
        username: participant.user.username,
        avatarUrl: participant.user.avatarUrl,
        joinedAt: participant.joinedAt
      }
    })
  } catch (error) {
    console.error('Error joining tournament:', error)
    return NextResponse.json(
      { error: 'Failed to join tournament' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tournaments/[id]/join
 * Leave a tournament
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

    const tournament = await prisma.tournament.findUnique({
      where: { id }
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Cannot leave if tournament has started
    if (tournament.status !== 'REGISTRATION') {
      return NextResponse.json(
        { error: 'Cannot leave started tournament' },
        { status: 400 }
      )
    }

    // Cannot leave if organizer
    if (tournament.organizerId === session.user.id) {
      return NextResponse.json(
        { error: 'Organizer cannot leave tournament' },
        { status: 400 }
      )
    }

    // Remove participant
    const deleted = await prisma.tournamentParticipant.delete({
      where: {
        tournamentId_userId: {
          tournamentId: id,
          userId: session.user.id
        }
      }
    })

    return NextResponse.json({
      message: 'Successfully left tournament'
    })
  } catch (error) {
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Not a participant in this tournament' },
        { status: 404 }
      )
    }

    console.error('Error leaving tournament:', error)
    return NextResponse.json(
      { error: 'Failed to leave tournament' },
      { status: 500 }
    )
  }
}
