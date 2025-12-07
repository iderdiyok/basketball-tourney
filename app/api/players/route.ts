import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Player from '@/lib/models/Player';
import Team from '@/lib/models/Team';
import { z } from 'zod';

const playerSchema = z.object({
  name: z.string().min(1),
  teamId: z.string().min(1),
  number: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');

    const query = teamId ? { teamId } : {};

    const players = await Player.find(query).populate('teamId').sort({ number: 1 });

    return NextResponse.json({ players });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = playerSchema.parse(body);

    const player = await Player.create(validatedData);

    // Add player to team
    await Team.findByIdAndUpdate(validatedData.teamId, {
      $push: { players: player._id },
    });

    return NextResponse.json({ player }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
