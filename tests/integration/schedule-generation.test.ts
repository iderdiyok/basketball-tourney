import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createServer } from 'http'
import { NextApiHandler } from 'next'
import { connectToDatabase, closeDatabase, clearDatabase } from '../db-utils'

// Mock Next.js API route handler
const createScheduleHandler = (handler: NextApiHandler) => {
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

    // Parse JSON body
    if (req.method === 'POST') {
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

// Import the actual API route handler
const generateScheduleHandler = require('../../../app/api/generate-schedule/route').POST

describe('Generate Schedule API Integration Tests', () => {
  beforeAll(async () => {
    await connectToDatabase()
  })

  afterAll(async () => {
    await closeDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('POST /api/generate-schedule', () => {
    it('should generate round-robin schedule for 4 teams', async () => {
      const { Tournament, Team } = require('../../../lib/models')
      
      const tournament = await Tournament.create({
        name: 'Test Tournament',
        teams: []
      })

      const teams = []
      for (let i = 1; i <= 4; i++) {
        const team = await Team.create({
          name: `Team ${i}`,
          tournament: tournament._id,
          players: []
        })
        teams.push(team)
        tournament.teams.push(team._id)
      }
      await tournament.save()

      const server = createScheduleHandler(generateScheduleHandler)
      
      const response = await request(server)
        .post('/api/generate-schedule')
        .send({
          tournamentId: tournament._id.toString()
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('6 games') // n*(n-1)/2 = 4*3/2 = 6 games

      // Verify games were created
      const { Game } = require('../../../lib/models')
      const games = await Game.find({ tournament: tournament._id })
      expect(games).toHaveLength(6)

      // Verify all teams play against each other exactly once
      const matchups = new Set()
      games.forEach(game => {
        const teamAId = game.teamA.toString()
        const teamBId = game.teamB.toString()
        const matchup = [teamAId, teamBId].sort().join('-')
        expect(matchups.has(matchup)).toBe(false) // No duplicate matchups
        matchups.add(matchup)
      })
    })

    it('should generate correct schedule for 3 teams', async () => {
      const { Tournament, Team } = require('../../../lib/models')
      
      const tournament = await Tournament.create({
        name: 'Small Tournament',
        teams: []
      })

      for (let i = 1; i <= 3; i++) {
        const team = await Team.create({
          name: `Team ${i}`,
          tournament: tournament._id,
          players: []
        })
        tournament.teams.push(team._id)
      }
      await tournament.save()

      const server = createScheduleHandler(generateScheduleHandler)
      
      const response = await request(server)
        .post('/api/generate-schedule')
        .send({
          tournamentId: tournament._id.toString()
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('3 games') // 3*2/2 = 3 games

      const { Game } = require('../../../lib/models')
      const games = await Game.find({ tournament: tournament._id })
      expect(games).toHaveLength(3)
    })

    it('should generate correct schedule for 6 teams', async () => {
      const { Tournament, Team } = require('../../../lib/models')
      
      const tournament = await Tournament.create({
        name: 'Large Tournament',
        teams: []
      })

      for (let i = 1; i <= 6; i++) {
        const team = await Team.create({
          name: `Team ${i}`,
          tournament: tournament._id,
          players: []
        })
        tournament.teams.push(team._id)
      }
      await tournament.save()

      const server = createScheduleHandler(generateScheduleHandler)
      
      const response = await request(server)
        .post('/api/generate-schedule')
        .send({
          tournamentId: tournament._id.toString()
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('15 games') // 6*5/2 = 15 games

      const { Game } = require('../../../lib/models')
      const games = await Game.find({ tournament: tournament._id })
      expect(games).toHaveLength(15)
    })

    it('should handle tournament with insufficient teams', async () => {
      const { Tournament, Team } = require('../../../lib/models')
      
      const tournament = await Tournament.create({
        name: 'Tiny Tournament',
        teams: []
      })

      // Only create 1 team
      const team = await Team.create({
        name: 'Lonely Team',
        tournament: tournament._id,
        players: []
      })
      tournament.teams.push(team._id)
      await tournament.save()

      const server = createScheduleHandler(generateScheduleHandler)
      
      const response = await request(server)
        .post('/api/generate-schedule')
        .send({
          tournamentId: tournament._id.toString()
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('mindestens 2 Teams')
    })

    it('should prevent duplicate schedule generation', async () => {
      const { Tournament, Team, Game } = require('../../../lib/models')
      
      const tournament = await Tournament.create({
        name: 'Test Tournament',
        teams: []
      })

      for (let i = 1; i <= 3; i++) {
        const team = await Team.create({
          name: `Team ${i}`,
          tournament: tournament._id,
          players: []
        })
        tournament.teams.push(team._id)
      }
      await tournament.save()

      // Create one game manually first
      await Game.create({
        tournament: tournament._id,
        teamA: tournament.teams[0],
        teamB: tournament.teams[1],
        scoreA: 0,
        scoreB: 0,
        gameState: 'not_started'
      })

      const server = createScheduleHandler(generateScheduleHandler)
      
      const response = await request(server)
        .post('/api/generate-schedule')
        .send({
          tournamentId: tournament._id.toString()
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('bereits Spiele')
    })

    it('should return 404 for non-existent tournament', async () => {
      const server = createScheduleHandler(generateScheduleHandler)
      const fakeId = '507f1f77bcf86cd799439011'
      
      const response = await request(server)
        .post('/api/generate-schedule')
        .send({
          tournamentId: fakeId
        })
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('nicht gefunden')
    })

    it('should validate request body', async () => {
      const server = createScheduleHandler(generateScheduleHandler)
      
      const response = await request(server)
        .post('/api/generate-schedule')
        .send({
          // Missing tournamentId
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('should initialize games with correct default values', async () => {
      const { Tournament, Team, Game } = require('../../../lib/models')
      
      const tournament = await Tournament.create({
        name: 'Test Tournament',
        teams: []
      })

      for (let i = 1; i <= 4; i++) {
        const team = await Team.create({
          name: `Team ${i}`,
          tournament: tournament._id,
          players: []
        })
        tournament.teams.push(team._id)
      }
      await tournament.save()

      const server = createScheduleHandler(generateScheduleHandler)
      
      await request(server)
        .post('/api/generate-schedule')
        .send({
          tournamentId: tournament._id.toString()
        })
        .expect(200)

      // Check game initialization
      const games = await Game.find({ tournament: tournament._id })
      
      games.forEach(game => {
        expect(game.scoreA).toBe(0)
        expect(game.scoreB).toBe(0)
        expect(game.gameState).toBe('not_started')
        expect(game.currentHalf).toBe(1)
        expect(game.timeRemaining).toBe(60) // 1 minute for testing
        expect(game.teamA).toBeDefined()
        expect(game.teamB).toBeDefined()
        expect(game.teamA).not.toEqual(game.teamB) // Teams should be different
      })
    })

    it('should ensure each team plays every other team exactly once', async () => {
      const { Tournament, Team, Game } = require('../../../lib/models')
      
      const tournament = await Tournament.create({
        name: 'Test Tournament',
        teams: []
      })

      const teamIds = []
      for (let i = 1; i <= 5; i++) {
        const team = await Team.create({
          name: `Team ${i}`,
          tournament: tournament._id,
          players: []
        })
        teamIds.push(team._id.toString())
        tournament.teams.push(team._id)
      }
      await tournament.save()

      const server = createScheduleHandler(generateScheduleHandler)
      
      await request(server)
        .post('/api/generate-schedule')
        .send({
          tournamentId: tournament._id.toString()
        })
        .expect(200)

      const games = await Game.find({ tournament: tournament._id })
      
      // Check that each team appears in the correct number of games
      const teamGameCount = {}
      games.forEach(game => {
        const teamAId = game.teamA.toString()
        const teamBId = game.teamB.toString()
        
        teamGameCount[teamAId] = (teamGameCount[teamAId] || 0) + 1
        teamGameCount[teamBId] = (teamGameCount[teamBId] || 0) + 1
      })

      // Each team should play against 4 other teams (n-1 games per team)
      teamIds.forEach(teamId => {
        expect(teamGameCount[teamId]).toBe(4)
      })

      // Total should be 10 games for 5 teams: 5*4/2 = 10
      expect(games).toHaveLength(10)
    })

    it('should handle very small edge case with 2 teams', async () => {
      const { Tournament, Team, Game } = require('../../../lib/models')
      
      const tournament = await Tournament.create({
        name: 'Minimal Tournament',
        teams: []
      })

      for (let i = 1; i <= 2; i++) {
        const team = await Team.create({
          name: `Team ${i}`,
          tournament: tournament._id,
          players: []
        })
        tournament.teams.push(team._id)
      }
      await tournament.save()

      const server = createScheduleHandler(generateScheduleHandler)
      
      const response = await request(server)
        .post('/api/generate-schedule')
        .send({
          tournamentId: tournament._id.toString()
        })
        .expect(200)

      expect(response.body.message).toContain('1 games') // Only 1 possible game

      const games = await Game.find({ tournament: tournament._id })
      expect(games).toHaveLength(1)
      expect(games[0].teamA).not.toEqual(games[0].teamB)
    })
  })
})