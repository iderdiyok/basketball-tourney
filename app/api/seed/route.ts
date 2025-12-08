import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import User from '@/lib/models/User';
import Tournament from '@/lib/models/Tournament';
import Team from '@/lib/models/Team';
import Player from '@/lib/models/Player';
import Game from '@/lib/models/Game';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.deleteMany({});
    const adminUser = await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    });

    // Clear existing data
    await Tournament.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
    await Game.deleteMany({});

    // Create tournament
    const tournament = await Tournament.create({
      name: 'Weihnachtsturnier 2024',
      category: 'U12',
      published: true,
    });

    // Create teams
    const teamNames = ['Lakers', 'Bulls', 'Warriors', 'Celtics'];
    const teams = [];

    for (const name of teamNames) {
      const team = await Team.create({
        name,
        tournamentId: tournament._id,
      });
      teams.push(team);
    }

    // Update tournament teams
    tournament.teams = teams.map((t) => t._id);

    // Create players (6 per team = 24 total) with unique names and numbers
    const playerNames = [
      // Lakers Team
      'Max Müller', 'Leon Schmidt', 'Felix Wagner', 'Paul Fischer', 'Jonas Weber', 'Luca Meyer',
      // Bulls Team  
      'Noah Becker', 'Ben Schulz', 'Elias Hoffmann', 'Finn Schäfer', 'Tom Koch', 'Luis Richter',
      // Warriors Team
      'Theo Klein', 'Leo Wolf', 'Anton Neumann', 'Emil Schwarz', 'Oskar Zimmermann', 'Henry Braun',
      // Celtics Team
      'Jakob Krüger', 'Samuel Hartmann', 'David Lange', 'Moritz Schmitt', 'Adrian Werner', 'Julian Peters',
    ];

    let playerIndex = 0;
    for (let teamIdx = 0; teamIdx < teams.length; teamIdx++) {
      const team = teams[teamIdx];
      const teamPlayers = [];
      for (let i = 0; i < 6; i++) {
        const player = await Player.create({
          name: playerNames[playerIndex],
          teamId: team._id,
          number: i + 1, // Nummer 1-6 pro Team (kann in Teams doppelt vorkommen)
        });
        teamPlayers.push(player._id);
        playerIndex++;
      }
      team.players = teamPlayers;
      await team.save();
    }

    // Generate schedule (round-robin)
    const games = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const game = await Game.create({
          tournamentId: tournament._id,
          teamA: teams[i]._id,
          teamB: teams[j]._id,
          status: 'pending',
        });
        games.push(game._id);
      }
    }

    tournament.games = games;
    await tournament.save();

    return NextResponse.json(
      {
        message: 'Database seeded successfully',
        data: {
          admin: { username: 'admin', password: 'admin123' },
          tournament: tournament.name,
          teamsCount: teams.length,
          playersCount: 24,
          gamesCount: games.length,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
