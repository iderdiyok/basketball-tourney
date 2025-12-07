import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/lib/models/Team';
import Tournament from '@/lib/models/Tournament';
import { z } from 'zod';

const teamSchema = z.object({
  name: z.string().min(1),
  tournamentId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const tournamentId = searchParams.get('tournamentId');

    const query = tournamentId ? { tournamentId } : {};

    const teams = await Team.find(query).populate('players').sort({ name: 1 });

    return NextResponse.json({ teams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = teamSchema.parse(body);

    const team = await Team.create(validatedData);

    // Add team to tournament
    await Tournament.findByIdAndUpdate(validatedData.tournamentId, {
      $push: { teams: team._id },
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
