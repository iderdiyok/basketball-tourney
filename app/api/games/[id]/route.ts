import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Game from '@/lib/models/Game';
import { z } from 'zod';

const playerStatSchema = z.object({
  playerId: z.string(),
  points1: z.number(),
  points2: z.number(),
  points3: z.number(),
  total: z.number(),
});

const updateSchema = z.object({
  scoreA: z.number().optional(),
  scoreB: z.number().optional(),
  status: z.enum(['pending', 'live', 'finished']).optional(),
  playerStats: z.array(playerStatSchema).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const game = await Game.findById(params.id)
      .populate('teamA')
      .populate('teamB')
      .populate('playerStats.playerId');

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({ game });
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

    const game = await Game.findByIdAndUpdate(params.id, validatedData, {
      new: true,
    })
      .populate('teamA')
      .populate('teamB')
      .populate('playerStats.playerId');

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({ game });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
