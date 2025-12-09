import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PlayerScoreData, TeamStats, ScorerAction } from '../../types/client'

// Scoring Engine Logic extracted from scorer page
export const calculatePlayerTotal = (player: PlayerScoreData): number => {
  return player.points1 + (player.points2 * 2) + (player.points3 * 3)
}

export const calculateTeamTotal = (players: PlayerScoreData[]): number => {
  return players.reduce((sum, player) => sum + player.total, 0)
}

export const addPointsToPlayer = (
  player: PlayerScoreData, 
  points: 1 | 2 | 3
): PlayerScoreData => {
  const updatedPlayer = { ...player }
  
  if (points === 1) updatedPlayer.points1++
  if (points === 2) updatedPlayer.points2++  
  if (points === 3) updatedPlayer.points3++
  
  updatedPlayer.total = calculatePlayerTotal(updatedPlayer)
  
  return updatedPlayer
}

export const removePointsFromPlayer = (
  player: PlayerScoreData,
  points: 1 | 2 | 3
): PlayerScoreData => {
  const updatedPlayer = { ...player }
  
  if (points === 1) updatedPlayer.points1 = Math.max(0, updatedPlayer.points1 - 1)
  if (points === 2) updatedPlayer.points2 = Math.max(0, updatedPlayer.points2 - 1)
  if (points === 3) updatedPlayer.points3 = Math.max(0, updatedPlayer.points3 - 1)
  
  updatedPlayer.total = calculatePlayerTotal(updatedPlayer)
  
  return updatedPlayer
}

export const updateTeamStats = (
  teamStats: TeamStats,
  playerId: string,
  points: 1 | 2 | 3,
  action: 'add' | 'remove' = 'add'
): TeamStats => {
  const updatedPlayers = teamStats.players.map(player => {
    if (player.playerId === playerId) {
      return action === 'add' 
        ? addPointsToPlayer(player, points)
        : removePointsFromPlayer(player, points)
    }
    return player
  })
  
  return {
    ...teamStats,
    players: updatedPlayers,
    totalScore: calculateTeamTotal(updatedPlayers)
  }
}

export const createScorerAction = (
  playerId: string,
  playerName: string,
  teamId: string,
  teamName: string,
  points: 1 | 2 | 3
): ScorerAction => ({
  type: 'points',
  playerId,
  playerName,
  teamId,
  teamName,
  points,
  timestamp: Date.now()
})

export const isValidScoringAction = (
  gameStatus: string,
  timeElapsed: number,
  isTimerRunning: boolean,
  FIRST_HALF_DURATION: number,
  SECOND_HALF_DURATION: number
): { valid: boolean; reason?: string } => {
  if (gameStatus === 'finished') {
    return { valid: false, reason: 'Spiel beendet' }
  }
  
  if (timeElapsed >= SECOND_HALF_DURATION) {
    return { valid: false, reason: 'Spielzeit abgelaufen' }
  }
  
  if (timeElapsed >= FIRST_HALF_DURATION && !isTimerRunning && timeElapsed < SECOND_HALF_DURATION) {
    return { valid: false, reason: 'Pause zwischen Halbzeiten' }
  }
  
  return { valid: true }
}

describe('Scoring Engine Logic', () => {
  const mockPlayer: PlayerScoreData = {
    playerId: 'player1',
    playerName: 'Test Player',
    points1: 2,
    points2: 1,
    points3: 1,
    total: 7 // 2*1 + 1*2 + 1*3 = 7
  }

  const mockTeamStats: TeamStats = {
    teamId: 'team1',
    teamName: 'Test Team',
    totalScore: 7,
    players: [mockPlayer]
  }

  describe('calculatePlayerTotal', () => {
    it('should calculate correct total points', () => {
      expect(calculatePlayerTotal(mockPlayer)).toBe(7)
      
      expect(calculatePlayerTotal({
        ...mockPlayer,
        points1: 0,
        points2: 0,
        points3: 0
      })).toBe(0)
      
      expect(calculatePlayerTotal({
        ...mockPlayer,
        points1: 5,
        points2: 3,
        points3: 2
      })).toBe(17) // 5*1 + 3*2 + 2*3 = 17
    })
  })

  describe('calculateTeamTotal', () => {
    it('should calculate correct team total', () => {
      const players = [
        { ...mockPlayer, total: 7 },
        { ...mockPlayer, playerId: 'player2', total: 5 },
        { ...mockPlayer, playerId: 'player3', total: 3 }
      ]
      
      expect(calculateTeamTotal(players)).toBe(15)
    })
    
    it('should handle empty players array', () => {
      expect(calculateTeamTotal([])).toBe(0)
    })
  })

  describe('addPointsToPlayer', () => {
    it('should add 1-point correctly', () => {
      const result = addPointsToPlayer(mockPlayer, 1)
      expect(result.points1).toBe(3)
      expect(result.points2).toBe(1)
      expect(result.points3).toBe(1)
      expect(result.total).toBe(8) // 3*1 + 1*2 + 1*3 = 8
    })

    it('should add 2-points correctly', () => {
      const result = addPointsToPlayer(mockPlayer, 2)
      expect(result.points1).toBe(2)
      expect(result.points2).toBe(2)
      expect(result.points3).toBe(1)
      expect(result.total).toBe(9) // 2*1 + 2*2 + 1*3 = 9
    })

    it('should add 3-points correctly', () => {
      const result = addPointsToPlayer(mockPlayer, 3)
      expect(result.points1).toBe(2)
      expect(result.points2).toBe(1)
      expect(result.points3).toBe(2)
      expect(result.total).toBe(10) // 2*1 + 1*2 + 2*3 = 10
    })
  })

  describe('removePointsFromPlayer', () => {
    it('should remove points correctly', () => {
      const result = removePointsFromPlayer(mockPlayer, 1)
      expect(result.points1).toBe(1)
      expect(result.total).toBe(6) // 1*1 + 1*2 + 1*3 = 6
    })

    it('should not go below 0', () => {
      const playerWithZeroPoints = {
        ...mockPlayer,
        points1: 0,
        points2: 0,
        points3: 0,
        total: 0
      }
      
      const result = removePointsFromPlayer(playerWithZeroPoints, 1)
      expect(result.points1).toBe(0)
      expect(result.total).toBe(0)
    })
  })

  describe('updateTeamStats', () => {
    it('should update team stats when adding points', () => {
      const result = updateTeamStats(mockTeamStats, 'player1', 3, 'add')
      
      expect(result.players[0].points3).toBe(2)
      expect(result.players[0].total).toBe(10)
      expect(result.totalScore).toBe(10)
    })

    it('should update team stats when removing points', () => {
      const result = updateTeamStats(mockTeamStats, 'player1', 1, 'remove')
      
      expect(result.players[0].points1).toBe(1)
      expect(result.players[0].total).toBe(6)
      expect(result.totalScore).toBe(6)
    })

    it('should not affect other players', () => {
      const teamWithMultiplePlayers = {
        ...mockTeamStats,
        players: [
          mockPlayer,
          { ...mockPlayer, playerId: 'player2', total: 5 }
        ],
        totalScore: 12
      }
      
      const result = updateTeamStats(teamWithMultiplePlayers, 'player1', 2, 'add')
      
      expect(result.players[0].points2).toBe(2) // Updated
      expect(result.players[1].points2).toBe(1) // Unchanged
    })
  })

  describe('isValidScoringAction', () => {
    const FIRST_HALF = 60
    const SECOND_HALF = 120

    it('should allow scoring during active game', () => {
      const result = isValidScoringAction('live', 30, true, FIRST_HALF, SECOND_HALF)
      expect(result.valid).toBe(true)
    })

    it('should prevent scoring when game is finished', () => {
      const result = isValidScoringAction('finished', 30, true, FIRST_HALF, SECOND_HALF)
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('Spiel beendet')
    })

    it('should prevent scoring when time is up', () => {
      const result = isValidScoringAction('live', 120, false, FIRST_HALF, SECOND_HALF)
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('Spielzeit abgelaufen')
    })

    it('should prevent scoring during halftime break', () => {
      const result = isValidScoringAction('live', 60, false, FIRST_HALF, SECOND_HALF)
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('Pause zwischen Halbzeiten')
    })
  })

  describe('createScorerAction', () => {
    it('should create valid scorer action', () => {
      const action = createScorerAction(
        'player1',
        'Test Player',
        'team1', 
        'Test Team',
        3
      )
      
      expect(action.type).toBe('points')
      expect(action.playerId).toBe('player1')
      expect(action.playerName).toBe('Test Player')
      expect(action.teamId).toBe('team1')
      expect(action.teamName).toBe('Test Team')
      expect(action.points).toBe(3)
      expect(action.timestamp).toBeTypeOf('number')
    })
  })
})