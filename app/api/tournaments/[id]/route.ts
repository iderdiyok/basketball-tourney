import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tournament from '@/lib/models/Tournament';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const tournament = await Tournament.findById(params.id)
      .populate({
        path: 'teams',
        populate: { path: 'players' },
      })
      .populate({
        path: 'games',
        populate: [
          { path: 'teamA' },
          { path: 'teamB' },
          { path: 'playerStats.playerId' },
        ],
      });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    return NextResponse.json({ tournament });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    const tournament = await Tournament.findByIdAndUpdate(
      params.id,
      validatedData,
      { new: true }
    );

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    return NextResponse.json({ tournament });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Import models
    const { Team, Player, Game } = await import('@/lib/models');

    // First, find all teams in this tournament
    const teams = await Team.find({ tournamentId: params.id });
    const teamIds = teams.map(team => team._id);

    // Delete all players in these teams
    await Player.deleteMany({ teamId: { $in: teamIds } });

    // Delete all games in this tournament
    await Game.deleteMany({ tournamentId: params.id });

    // Delete all teams in this tournament
    await Team.deleteMany({ tournamentId: params.id });

    // Finally, delete the tournament
    const tournament = await Tournament.findByIdAndDelete(params.id);

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tournament and all related data deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
