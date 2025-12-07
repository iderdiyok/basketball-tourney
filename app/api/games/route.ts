import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Game from '@/lib/models/Game';
import Tournament from '@/lib/models/Tournament';
import { z } from 'zod';

const gameSchema = z.object({
  tournamentId: z.string().min(1),
  teamA: z.string().min(1),
  teamB: z.string().min(1),
  scheduledTime: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const tournamentId = searchParams.get('tournamentId');

    const query = tournamentId ? { tournamentId } : {};

    const games = await Game.find(query)
      .populate('teamA')
      .populate('teamB')
      .populate('playerStats.playerId')
      .sort({ scheduledTime: 1 });

    return NextResponse.json({ games });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = gameSchema.parse(body);

    const game = await Game.create(validatedData);

    // Add game to tournament
    await Tournament.findByIdAndUpdate(validatedData.tournamentId, {
      $push: { games: game._id },
    });

    return NextResponse.json({ game }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
