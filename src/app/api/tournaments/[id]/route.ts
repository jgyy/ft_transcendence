import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTournamentBracket, getTournamentStats } from '@/lib/tournament'

/**
 * GET /api/tournaments/[id]
 * Get tournament details and bracket
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, username: true, avatarUrl: true }
        },
        winner: {
          select: { id: true, username: true }
        },
        participants: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                ranking: true
              }
            },
            joinedAt: true
          },
          orderBy: { joinedAt: 'asc' }
        },
        _count: {
          select: { matches: true }
        }
      }
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    const stats = await getTournamentStats(id)

    return NextResponse.json({
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      status: tournament.status,
      maxParticipants: tournament.maxParticipants,
      currentParticipants: tournament.participants.length,
      organizer: tournament.organizer,
      winner: tournament.winner,
      participants: tournament.participants.map((p) => ({
        id: p.user.id,
        username: p.user.username,
        avatarUrl: p.user.avatarUrl,
        ranking: p.user.ranking,
        joinedAt: p.joinedAt
      })),
      stats,
      gameSettings: tournament.gameSettings || {},
      createdAt: tournament.createdAt,
      startedAt: tournament.startedAt,
      completedAt: tournament.completedAt
    })
  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/tournaments/[id]
 * Update tournament (organizer only)
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

    const tournament = await prisma.tournament.findUnique({
      where: { id }
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Only organizer can update
    if (tournament.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only organizer can update tournament' },
        { status: 403 }
      )
    }

    // Can only update name/description if tournament hasn't started
    if (tournament.status !== 'REGISTRATION') {
      return NextResponse.json(
        { error: 'Cannot update started tournament' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const updated = await prisma.tournament.update({
      where: { id },
      data: {
        name: body.name || tournament.name,
        description: body.description || tournament.description
      },
      include: {
        organizer: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    })

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      status: updated.status,
      maxParticipants: updated.maxParticipants,
      organizer: updated.organizer
    })
  } catch (error) {
    console.error('Error updating tournament:', error)
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tournaments/[id]
 * Delete tournament (organizer only, before started)
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

    // Only organizer can delete
    if (tournament.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only organizer can delete tournament' },
        { status: 403 }
      )
    }

    // Can only delete pending tournaments
    if (tournament.status !== 'REGISTRATION') {
      return NextResponse.json(
        { error: 'Cannot delete started tournament' },
        { status: 400 }
      )
    }

    // Delete associated participants and matches
    await prisma.tournamentParticipant.deleteMany({
      where: { tournamentId: id }
    })

    const deleted = await prisma.tournament.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Tournament deleted',
      deletedId: deleted.id
    })
  } catch (error) {
    console.error('Error deleting tournament:', error)
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    )
  }
}
