import { NextRequest, NextResponse } from 'next/server'
import { getTournamentBracket } from '@/lib/tournament'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bracket = await getTournamentBracket(id)

    return NextResponse.json(bracket)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    console.error('Error fetching tournament bracket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament bracket' },
      { status: 500 }
    )
  }
}
