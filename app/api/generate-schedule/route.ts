import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Game from '@/lib/models/Game';
import Tournament from '@/lib/models/Tournament';
import Team from '@/lib/models/Team';
import { z } from 'zod';

const scheduleSchema = z.object({
  tournamentId: z.string().min(1),
});

// Generate round-robin schedule (Jeder gegen jeden)
function generateRoundRobin(teams: any[]) {
  const schedule = [];
  const n = teams.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      schedule.push({
        teamA: teams[i]._id,
        teamB: teams[j]._id,
      });
    }
  }

  return schedule;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = scheduleSchema.parse(body);

    const tournament = await Tournament.findById(validatedData.tournamentId);

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    const teams = await Team.find({ tournamentId: validatedData.tournamentId });

    if (teams.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 teams to generate schedule' },
        { status: 400 }
      );
    }

    // Clear existing games
    await Game.deleteMany({ tournamentId: validatedData.tournamentId });
    tournament.games = [];

    // Generate schedule
    const matches = generateRoundRobin(teams);

    // Create games
    const games = [];
    for (const match of matches) {
      const game = await Game.create({
        tournamentId: validatedData.tournamentId,
        teamA: match.teamA,
        teamB: match.teamB,
        status: 'pending',
      });
      games.push(game._id);
    }

    // Update tournament
    tournament.games = games;
    await tournament.save();

    return NextResponse.json(
      { message: 'Schedule generated successfully', gamesCount: games.length },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
