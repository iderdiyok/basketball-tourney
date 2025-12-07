import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Tournament, Team, Game } from '@/lib/models';
import { z } from 'zod';

const tournamentSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  published: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');

    const query = published === 'true' ? { published: true } : {};

    const tournaments = await Tournament.find(query)
      .populate('teams')
      .populate('games')
      .sort({ createdAt: -1 });

    return NextResponse.json({ tournaments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = tournamentSchema.parse(body);

    const tournament = await Tournament.create(validatedData);

    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
