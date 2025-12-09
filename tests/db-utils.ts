import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod: MongoMemoryServer | undefined

export const connectToTestDB = async () => {
  if (mongod) {
    return
  }
  
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  
  await mongoose.connect(uri)
}

export const disconnectFromTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  }
  
  if (mongod) {
    await mongod.stop()
    mongod = undefined
  }
}

export const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections
    
    for (const key in collections) {
      await collections[key].deleteMany({})
    }
  }
}

// Test data seeding helpers
export const seedTestTournament = async () => {
  const Tournament = (await import('../lib/models/Tournament')).default
  
  return await Tournament.create({
    name: 'Test Tournament',
    category: 'U12',
    published: true,
    teams: [],
    games: []
  })
}

export const seedTestTeams = async (tournamentId: string) => {
  const Team = (await import('../lib/models/Team')).default
  
  const teamA = await Team.create({
    name: 'Lakers',
    tournamentId,
    players: []
  })
  
  const teamB = await Team.create({
    name: 'Bulls', 
    tournamentId,
    players: []
  })
  
  return { teamA, teamB }
}

export const seedTestPlayers = async (teamId: string, count = 2) => {
  const Player = (await import('../lib/models/Player')).default
  
  const players = []
  for (let i = 1; i <= count; i++) {
    const player = await Player.create({
      name: `Player ${i}`,
      number: i,
      teamId
    })
    players.push(player)
  }
  
  return players
}

export const seedTestGame = async (tournamentId: string, teamAId: string, teamBId: string) => {
  const Game = (await import('../lib/models/Game')).default
  
  return await Game.create({
    tournamentId,
    teamA: teamAId,
    teamB: teamBId,
    scoreA: 0,
    scoreB: 0,
    status: 'pending',
    playerStats: []
  })
}