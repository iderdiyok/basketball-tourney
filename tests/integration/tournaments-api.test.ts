import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createServer } from 'http'
import { NextApiHandler } from 'next'
import { connectToDatabase, closeDatabase, clearDatabase } from '../db-utils'

// Mock Next.js API route handler
const createTournamentHandler = (handler: NextApiHandler) => {
  const server = createServer(async (req, res) => {
    const mockReq = {
      ...req,
      query: {},
      body: {},
      method: req.method,
      url: req.url,
      headers: req.headers
    } as any

    const mockRes = {
      ...res,
      json: (data: any) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
      },
      status: (code: number) => {
        res.statusCode = code
        return mockRes
      }
    } as any

    // Parse URL params for dynamic routes
    if (req.url?.includes('/api/tournaments/')) {
      const id = req.url.split('/api/tournaments/')[1]?.split('?')[0]
      mockReq.query.id = id
    }

    // Parse JSON body
    if (req.method === 'PUT' || req.method === 'POST') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', () => {
        try {
          mockReq.body = JSON.parse(body)
        } catch (e) {
          mockReq.body = {}
        }
        handler(mockReq, mockRes)
      })
    } else {
      await handler(mockReq, mockRes)
    }
  })
  return server
}

// Import the actual API route handlers
const tournamentsHandler = require('../../../app/api/tournaments/route').GET
const tournamentByIdHandler = require('../../../app/api/tournaments/[id]/route').GET

describe('Tournaments API Integration Tests', () => {
  beforeAll(async () => {
    await connectToDatabase()
  })

  afterAll(async () => {
    await closeDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/tournaments', () => {
    it('should return empty array when no tournaments exist', async () => {
      const server = createTournamentHandler(tournamentsHandler)
      
      const response = await request(server)
        .get('/api/tournaments')
        .expect(200)

      expect(response.body).toEqual([])
    })

    it('should return tournaments with basic info', async () => {
      const { Tournament } = require('../../../lib/models')
      
      await Tournament.create({
        name: 'Test Tournament',
        teams: [],
        createdAt: new Date()
      })

      const server = createTournamentHandler(tournamentsHandler)
      
      const response = await request(server)
        .get('/api/tournaments')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toMatchObject({
        name: 'Test Tournament'
      })
    })
  })

  describe('GET /api/tournaments/[id]', () => {
    let tournamentId: string
    let teamA: any
    let teamB: any
    let teamC: any

    beforeEach(async () => {
      const { Tournament, Team, Player, Game } = require('../../../lib/models')
      
      const tournament = await Tournament.create({
        name: 'Complete Tournament',
        teams: []
      })
      tournamentId = tournament._id.toString()

      // Create teams with players
      teamA = await Team.create({
        name: 'Team Alpha',
        tournament: tournament._id,
        players: []
      })

      teamB = await Team.create({
        name: 'Team Beta',
        tournament: tournament._id,
        players: []
      })

      teamC = await Team.create({
        name: 'Team Gamma',
        tournament: tournament._id,
        players: []
      })

      // Add players to teams
      const playerA1 = await Player.create({
        name: 'Alice',
        number: 1,
        team: teamA._id,
        tournament: tournament._id,
        totalPoints: 15,
        points1Total: 5,
        points2Total: 3,
        points3Total: 1,
        gamesPlayed: 2
      })

      const playerA2 = await Player.create({
        name: 'Alex',
        number: 2,
        team: teamA._id,
        tournament: tournament._id,
        totalPoints: 12,
        points1Total: 4,
        points2Total: 2,
        points3Total: 2,
        gamesPlayed: 2
      })

      const playerB1 = await Player.create({
        name: 'Bob',
        number: 1,
        team: teamB._id,
        tournament: tournament._id,
        totalPoints: 10,
        points1Total: 6,
        points2Total: 1,
        points3Total: 1,
        gamesPlayed: 2
      })

      teamA.players = [playerA1._id, playerA2._id]
      teamB.players = [playerB1._id]
      await teamA.save()
      await teamB.save()

      // Create games with results
      await Game.create({
        tournament: tournament._id,
        teamA: teamA._id,
        teamB: teamB._id,
        scoreA: 15,
        scoreB: 10,
        gameState: 'finished'
      })

      await Game.create({
        tournament: tournament._id,
        teamA: teamA._id,
        teamB: teamC._id,
        scoreA: 12,
        scoreB: 12,
        gameState: 'finished'
      })

      await Game.create({
        tournament: tournament._id,
        teamA: teamB._id,
        teamB: teamC._id,
        scoreA: 8,
        scoreB: 6,
        gameState: 'finished'
      })
    })

    it('should return complete tournament data with rankings', async () => {
      const server = createTournamentHandler(tournamentByIdHandler)
      
      const response = await request(server)
        .get(`/api/tournaments/${tournamentId}`)
        .expect(200)

      expect(response.body).toMatchObject({
        name: 'Complete Tournament',
        teams: expect.arrayContaining([
          expect.objectContaining({
            name: 'Team Alpha',
            players: expect.any(Array)
          })
        ])
      })

      expect(response.body.rankings).toBeDefined()
      expect(response.body.rankings).toHaveLength(3)
    })

    it('should calculate team rankings correctly', async () => {
      const server = createTournamentHandler(tournamentByIdHandler)
      
      const response = await request(server)
        .get(`/api/tournaments/${tournamentId}`)
        .expect(200)

      const rankings = response.body.rankings
      
      // Team Alpha: 1 win (15-10), 1 draw (12-12) = 3 points
      // Team Beta: 1 loss (10-15), 1 win (8-6) = 2 points
      // Team Gamma: 1 draw (12-12), 1 loss (6-8) = 1 point
      
      expect(rankings[0]).toMatchObject({
        team: expect.objectContaining({ name: 'Team Alpha' }),
        points: 3,
        won: 1,
        drawn: 1,
        lost: 0
      })

      expect(rankings[1]).toMatchObject({
        team: expect.objectContaining({ name: 'Team Beta' }),
        points: 2,
        won: 1,
        drawn: 0,
        lost: 1
      })

      expect(rankings[2]).toMatchObject({
        team: expect.objectContaining({ name: 'Team Gamma' }),
        points: 1,
        won: 0,
        drawn: 1,
        lost: 1
      })
    })

    it('should calculate score differences correctly', async () => {
      const server = createTournamentHandler(tournamentByIdHandler)
      
      const response = await request(server)
        .get(`/api/tournaments/${tournamentId}`)
        .expect(200)

      const rankings = response.body.rankings
      
      // Team Alpha: (15+12) - (10+12) = 27-22 = +5
      const teamAlpha = rankings.find((r: any) => r.team.name === 'Team Alpha')
      expect(teamAlpha.scoreDiff).toBe(5)
      
      // Team Beta: (10+8) - (15+6) = 18-21 = -3
      const teamBeta = rankings.find((r: any) => r.team.name === 'Team Beta')
      expect(teamBeta.scoreDiff).toBe(-3)
    })

    it('should return player statistics correctly', async () => {
      const server = createTournamentHandler(tournamentByIdHandler)
      
      const response = await request(server)
        .get(`/api/tournaments/${tournamentId}`)
        .expect(200)

      expect(response.body.topScorers).toBeDefined()
      expect(response.body.topThreePointers).toBeDefined()
      expect(response.body.topOnePointers).toBeDefined()

      // Check top scorer
      const topScorer = response.body.topScorers[0]
      expect(topScorer).toMatchObject({
        name: 'Alice',
        totalPoints: 15
      })
    })

    it('should handle empty tournament correctly', async () => {
      const { Tournament } = require('../../../lib/models')
      
      const emptyTournament = await Tournament.create({
        name: 'Empty Tournament',
        teams: []
      })

      const server = createTournamentHandler(tournamentByIdHandler)
      
      const response = await request(server)
        .get(`/api/tournaments/${emptyTournament._id}`)
        .expect(200)

      expect(response.body).toMatchObject({
        name: 'Empty Tournament',
        teams: [],
        rankings: [],
        topScorers: [],
        topThreePointers: [],
        topOnePointers: []
      })
    })

    it('should return 404 for non-existent tournament', async () => {
      const server = createTournamentHandler(tournamentByIdHandler)
      const fakeId = '507f1f77bcf86cd799439011'
      
      await request(server)
        .get(`/api/tournaments/${fakeId}`)
        .expect(404)
    })

    it('should sort players by specialty correctly', async () => {
      const server = createTournamentHandler(tournamentByIdHandler)
      
      const response = await request(server)
        .get(`/api/tournaments/${tournamentId}`)
        .expect(200)

      // Check three-pointer leaders
      const threePointers = response.body.topThreePointers
      expect(threePointers[0].name).toBe('Alex') // 2 three-pointers
      
      // Check one-pointer leaders  
      const onePointers = response.body.topOnePointers
      expect(onePointers[0].name).toBe('Bob') // 6 one-pointers
    })

    it('should handle tiebreaker scenarios in rankings', async () => {
      // Create a scenario where teams have same points
      const { Tournament, Team, Game } = require('../../../lib/models')
      
      const tournament = await Tournament.create({
        name: 'Tiebreaker Tournament',
        teams: []
      })

      const team1 = await Team.create({
        name: 'Team 1',
        tournament: tournament._id,
        players: []
      })

      const team2 = await Team.create({
        name: 'Team 2', 
        tournament: tournament._id,
        players: []
      })

      // Both teams have 2 points, but different score differences
      await Game.create({
        tournament: tournament._id,
        teamA: team1._id,
        teamB: team2._id,
        scoreA: 20,
        scoreB: 10, // Team 1 wins by 10
        gameState: 'finished'
      })

      const server = createTournamentHandler(tournamentByIdHandler)
      
      const response = await request(server)
        .get(`/api/tournaments/${tournament._id}`)
        .expect(200)

      const rankings = response.body.rankings
      expect(rankings[0].team.name).toBe('Team 1') // Better score difference
      expect(rankings[0].scoreDiff).toBe(10)
      expect(rankings[1].scoreDiff).toBe(-10)
    })
  })
})