import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createServer } from 'http'
import { NextApiHandler } from 'next'
import { connectToDatabase, closeDatabase, clearDatabase } from '../db-utils'

// Mock Next.js API route for games
const createGameHandler = (handler: NextApiHandler) => {
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
    if (req.url?.includes('/api/games/')) {
      const id = req.url.split('/api/games/')[1]?.split('?')[0]
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
const gamesHandler = require('../../../app/api/games/route').GET
const gameByIdHandler = require('../../../app/api/games/[id]/route').PUT

describe('Games API Integration Tests', () => {
  beforeAll(async () => {
    await connectToDatabase()
  })

  afterAll(async () => {
    await closeDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/games', () => {
    it('should return empty array when no games exist', async () => {
      const server = createGameHandler(gamesHandler)
      
      const response = await request(server)
        .get('/api/games')
        .expect(200)

      expect(response.body).toEqual([])
    })

    it('should return games with populated team data', async () => {
      // Create test data
      const { Tournament, Team, Game } = require('../../../lib/models')
      
      const tournament = await Tournament.create({
        name: 'Test Tournament',
        teams: []
      })

      const teamA = await Team.create({
        name: 'Team A',
        tournament: tournament._id,
        players: []
      })

      const teamB = await Team.create({
        name: 'Team B', 
        tournament: tournament._id,
        players: []
      })

      const game = await Game.create({
        tournament: tournament._id,
        teamA: teamA._id,
        teamB: teamB._id,
        scoreA: 10,
        scoreB: 8,
        gameState: 'finished'
      })

      const server = createGameHandler(gamesHandler)
      
      const response = await request(server)
        .get('/api/games')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toMatchObject({
        scoreA: 10,
        scoreB: 8,
        gameState: 'finished',
        teamA: expect.objectContaining({
          name: 'Team A'
        }),
        teamB: expect.objectContaining({
          name: 'Team B'
        })
      })
    })
  })

  describe('PUT /api/games/[id]', () => {
    let gameId: string
    let tournament: any
    let teamA: any
    let teamB: any

    beforeEach(async () => {
      const { Tournament, Team, Game, Player } = require('../../../lib/models')
      
      tournament = await Tournament.create({
        name: 'Test Tournament',
        teams: []
      })

      teamA = await Team.create({
        name: 'Team A',
        tournament: tournament._id,
        players: []
      })

      teamB = await Team.create({
        name: 'Team B',
        tournament: tournament._id,
        players: []
      })

      // Add players to teams
      const playerA1 = await Player.create({
        name: 'Player A1',
        number: 1,
        team: teamA._id,
        tournament: tournament._id
      })

      const playerB1 = await Player.create({
        name: 'Player B1',
        number: 1,
        team: teamB._id,
        tournament: tournament._id
      })

      teamA.players.push(playerA1._id)
      teamB.players.push(playerB1._id)
      await teamA.save()
      await teamB.save()

      const game = await Game.create({
        tournament: tournament._id,
        teamA: teamA._id,
        teamB: teamB._id,
        scoreA: 0,
        scoreB: 0,
        gameState: 'not_started',
        currentHalf: 1,
        timeRemaining: 60
      })

      gameId = game._id.toString()
    })

    it('should update game timer state', async () => {
      const server = createGameHandler(gameByIdHandler)
      
      const response = await request(server)
        .put(`/api/games/${gameId}`)
        .send({
          gameState: 'running',
          timeRemaining: 55
        })
        .expect(200)

      expect(response.body).toMatchObject({
        gameState: 'running',
        timeRemaining: 55
      })
    })

    it('should handle player scoring correctly', async () => {
      const { Player } = require('../../../lib/models')
      const player = await Player.findOne({ team: teamA._id })

      const server = createGameHandler(gameByIdHandler)
      
      const response = await request(server)
        .put(`/api/games/${gameId}`)
        .send({
          action: 'add',
          playerId: player._id.toString(),
          team: 'teamA',
          pointValue: 2
        })
        .expect(200)

      expect(response.body).toMatchObject({
        scoreA: 2,
        scoreB: 0
      })

      // Check player stats were updated
      const updatedPlayer = await Player.findById(player._id)
      expect(updatedPlayer.totalPoints).toBe(2)
      expect(updatedPlayer.points2Total).toBe(1)
    })

    it('should handle undo scoring correctly', async () => {
      const { Player } = require('../../../lib/models')
      const player = await Player.findOne({ team: teamA._id })

      const server = createGameHandler(gameByIdHandler)
      
      // First add points
      await request(server)
        .put(`/api/games/${gameId}`)
        .send({
          action: 'add',
          playerId: player._id.toString(),
          team: 'teamA',
          pointValue: 3
        })
        .expect(200)

      // Then undo
      const response = await request(server)
        .put(`/api/games/${gameId}`)
        .send({
          action: 'remove',
          playerId: player._id.toString(),
          team: 'teamA',
          pointValue: 3
        })
        .expect(200)

      expect(response.body).toMatchObject({
        scoreA: 0,
        scoreB: 0
      })

      // Check player stats were reverted
      const updatedPlayer = await Player.findById(player._id)
      expect(updatedPlayer.totalPoints).toBe(0)
      expect(updatedPlayer.points3Total).toBe(0)
    })

    it('should handle halftime transition', async () => {
      const server = createGameHandler(gameByIdHandler)
      
      const response = await request(server)
        .put(`/api/games/${gameId}`)
        .send({
          gameState: 'halftime',
          currentHalf: 1,
          timeRemaining: 0
        })
        .expect(200)

      expect(response.body).toMatchObject({
        gameState: 'halftime',
        currentHalf: 1
      })
    })

    it('should handle second half start', async () => {
      const server = createGameHandler(gameByIdHandler)
      
      const response = await request(server)
        .put(`/api/games/${gameId}`)
        .send({
          gameState: 'running',
          currentHalf: 2,
          timeRemaining: 60
        })
        .expect(200)

      expect(response.body).toMatchObject({
        gameState: 'running',
        currentHalf: 2,
        timeRemaining: 60
      })
    })

    it('should handle game finish', async () => {
      const server = createGameHandler(gameByIdHandler)
      
      const response = await request(server)
        .put(`/api/games/${gameId}`)
        .send({
          gameState: 'finished',
          currentHalf: 2,
          timeRemaining: 0
        })
        .expect(200)

      expect(response.body).toMatchObject({
        gameState: 'finished'
      })
    })

    it('should prevent negative player statistics', async () => {
      const { Player } = require('../../../lib/models')
      const player = await Player.findOne({ team: teamA._id })

      const server = createGameHandler(gameByIdHandler)
      
      // Try to remove points when player has none
      const response = await request(server)
        .put(`/api/games/${gameId}`)
        .send({
          action: 'remove',
          playerId: player._id.toString(),
          team: 'teamA',
          pointValue: 1
        })
        .expect(200)

      // Should not go negative
      const updatedPlayer = await Player.findById(player._id)
      expect(updatedPlayer.totalPoints).toBe(0)
      expect(updatedPlayer.points1Total).toBe(0)
    })

    it('should return 404 for non-existent game', async () => {
      const server = createGameHandler(gameByIdHandler)
      const fakeId = '507f1f77bcf86cd799439011'
      
      await request(server)
        .put(`/api/games/${fakeId}`)
        .send({
          gameState: 'running'
        })
        .expect(404)
    })

    it('should validate required fields', async () => {
      const server = createGameHandler(gameByIdHandler)
      
      await request(server)
        .put(`/api/games/${gameId}`)
        .send({
          // Missing required fields for scoring
          action: 'add'
        })
        .expect(400)
    })

    it('should handle complex scoring sequence', async () => {
      const { Player } = require('../../../lib/models')
      const playerA = await Player.findOne({ team: teamA._id })
      const playerB = await Player.findOne({ team: teamB._id })

      const server = createGameHandler(gameByIdHandler)
      
      // Team A scores 3 points
      await request(server)
        .put(`/api/games/${gameId}`)
        .send({
          action: 'add',
          playerId: playerA._id.toString(),
          team: 'teamA',
          pointValue: 3
        })

      // Team B scores 2 points
      await request(server)
        .put(`/api/games/${gameId}`)
        .send({
          action: 'add',
          playerId: playerB._id.toString(),
          team: 'teamB',
          pointValue: 2
        })

      // Team A scores 1 point
      const finalResponse = await request(server)
        .put(`/api/games/${gameId}`)
        .send({
          action: 'add',
          playerId: playerA._id.toString(),
          team: 'teamA',
          pointValue: 1
        })

      expect(finalResponse.body).toMatchObject({
        scoreA: 4, // 3 + 1
        scoreB: 2
      })

      // Check individual player stats
      const updatedPlayerA = await Player.findById(playerA._id)
      const updatedPlayerB = await Player.findById(playerB._id)

      expect(updatedPlayerA.totalPoints).toBe(4)
      expect(updatedPlayerA.points1Total).toBe(1)
      expect(updatedPlayerA.points3Total).toBe(1)

      expect(updatedPlayerB.totalPoints).toBe(2)
      expect(updatedPlayerB.points2Total).toBe(1)
    })
  })
})