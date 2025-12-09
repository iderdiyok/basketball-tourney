import { describe, it, expect } from 'vitest'
import type { TeamRanking } from '../../types/client'

// Ranking Algorithm Logic extracted from tournament page
export const calculateTournamentPoints = (ownScore: number, opponentScore: number): number => {
  if (ownScore > opponentScore) return 2  // Win
  if (ownScore < opponentScore) return 0  // Loss
  return 1                                // Draw
}

export const calculateTeamStats = (games: any[], team: any) => {
  let won = 0
  let lost = 0
  let drawn = 0
  let totalScored = 0
  let totalConceded = 0

  games.forEach(game => {
    const isTeamA = game.teamA._id === team._id
    const ownScore = isTeamA ? game.scoreA : game.scoreB
    const opponentScore = isTeamA ? game.scoreB : game.scoreA

    totalScored += ownScore
    totalConceded += opponentScore

    if (ownScore > opponentScore) {
      won++
    } else if (ownScore < opponentScore) {
      lost++
    } else {
      drawn++
    }
  })

  const points = won * 2 + drawn * 1 + lost * 0
  const scoreDiff = totalScored - totalConceded

  return {
    team,
    played: games.length,
    won,
    lost,
    drawn,
    points,
    scoreDiff,
    totalScored,
    totalConceded,
  }
}

export const sortTeamRankings = (rankings: TeamRanking[]): TeamRanking[] => {
  return rankings.sort((a, b) => {
    // Primary: Points (descending)
    if (b.points !== a.points) return b.points - a.points
    // Secondary: Score difference (descending)
    if (b.scoreDiff !== a.scoreDiff) return b.scoreDiff - a.scoreDiff
    // Tertiary: Total scored (descending)
    return b.totalScored - a.totalScored
  })
}

export const calculatePlayerAverage = (totalPoints: number, gamesPlayed: number): number => {
  return gamesPlayed > 0 ? totalPoints / gamesPlayed : 0
}

export const sortPlayersByTotal = (players: any[]): any[] => {
  return players
    .filter(p => p.gamesPlayed > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
}

export const sortPlayersBySpecialty = (players: any[], specialty: 'points1Total' | 'points3Total'): any[] => {
  return players
    .filter(p => p.gamesPlayed > 0 && p[specialty] > 0)
    .sort((a, b) => b[specialty] - a[specialty])
}

describe('Ranking Algorithm Logic', () => {
  describe('calculateTournamentPoints', () => {
    it('should award 2 points for wins', () => {
      expect(calculateTournamentPoints(10, 5)).toBe(2)
      expect(calculateTournamentPoints(1, 0)).toBe(2)
      expect(calculateTournamentPoints(100, 99)).toBe(2)
    })

    it('should award 0 points for losses', () => {
      expect(calculateTournamentPoints(5, 10)).toBe(0)
      expect(calculateTournamentPoints(0, 1)).toBe(0)
      expect(calculateTournamentPoints(99, 100)).toBe(0)
    })

    it('should award 1 point for draws', () => {
      expect(calculateTournamentPoints(5, 5)).toBe(1)
      expect(calculateTournamentPoints(0, 0)).toBe(1)
      expect(calculateTournamentPoints(100, 100)).toBe(1)
    })
  })

  describe('calculateTeamStats', () => {
    const mockTeam = {
      _id: 'team1',
      name: 'Test Team'
    }

    const mockGames = [
      {
        teamA: { _id: 'team1' },
        teamB: { _id: 'team2' },
        scoreA: 10,
        scoreB: 5
      },
      {
        teamA: { _id: 'team2' },
        teamB: { _id: 'team1' },
        scoreA: 8,
        scoreB: 8
      },
      {
        teamA: { _id: 'team1' },
        teamB: { _id: 'team3' },
        scoreA: 3,
        scoreB: 7
      }
    ]

    it('should calculate stats correctly', () => {
      const stats = calculateTeamStats(mockGames, mockTeam)
      
      expect(stats.played).toBe(3)
      expect(stats.won).toBe(1)     // First game: 10-5 win
      expect(stats.drawn).toBe(1)   // Second game: 8-8 draw
      expect(stats.lost).toBe(1)    // Third game: 3-7 loss
      expect(stats.points).toBe(3)  // 1*2 + 1*1 + 1*0 = 3
      expect(stats.totalScored).toBe(21)     // 10 + 8 + 3 = 21
      expect(stats.totalConceded).toBe(20)   // 5 + 8 + 7 = 20
      expect(stats.scoreDiff).toBe(1)        // 21 - 20 = 1
    })

    it('should handle team as teamB correctly', () => {
      const gamesAsTeamB = [
        {
          teamA: { _id: 'team2' },
          teamB: { _id: 'team1' },
          scoreA: 5,
          scoreB: 10  // team1 wins as teamB
        }
      ]
      
      const stats = calculateTeamStats(gamesAsTeamB, mockTeam)
      expect(stats.won).toBe(1)
      expect(stats.totalScored).toBe(10)
      expect(stats.totalConceded).toBe(5)
    })

    it('should handle empty games array', () => {
      const stats = calculateTeamStats([], mockTeam)
      
      expect(stats.played).toBe(0)
      expect(stats.won).toBe(0)
      expect(stats.points).toBe(0)
      expect(stats.totalScored).toBe(0)
      expect(stats.scoreDiff).toBe(0)
    })
  })

  describe('sortTeamRankings', () => {
    const mockRankings: TeamRanking[] = [
      {
        team: { _id: 'team1', name: 'Team 1' } as any,
        played: 3,
        won: 1,
        lost: 2,
        drawn: 0,
        points: 2,
        scoreDiff: -5,
        totalScored: 10,
        totalConceded: 15
      },
      {
        team: { _id: 'team2', name: 'Team 2' } as any,
        played: 3,
        won: 3,
        lost: 0,
        drawn: 0,
        points: 6,
        scoreDiff: 10,
        totalScored: 25,
        totalConceded: 15
      },
      {
        team: { _id: 'team3', name: 'Team 3' } as any,
        played: 3,
        won: 1,
        lost: 2,
        drawn: 0,
        points: 2,
        scoreDiff: 5,
        totalScored: 20,
        totalConceded: 15
      }
    ]

    it('should sort by points first', () => {
      const sorted = sortTeamRankings([...mockRankings])
      
      expect(sorted[0].team.name).toBe('Team 2') // 6 points
      expect(sorted[1].points).toBe(2) // Tied at 2 points
      expect(sorted[2].points).toBe(2) // Tied at 2 points
    })

    it('should use score difference as tiebreaker', () => {
      const sorted = sortTeamRankings([...mockRankings])
      
      // Both Team 1 and Team 3 have 2 points, but Team 3 has better score diff (+5 vs -5)
      expect(sorted[1].team.name).toBe('Team 3')
      expect(sorted[2].team.name).toBe('Team 1')
    })

    it('should use total scored as final tiebreaker', () => {
      const tiedRankings: TeamRanking[] = [
        {
          ...mockRankings[0],
          team: { _id: 'teamA', name: 'Team A' } as any,
          points: 4,
          scoreDiff: 0,
          totalScored: 20
        },
        {
          ...mockRankings[1],
          team: { _id: 'teamB', name: 'Team B' } as any,
          points: 4,
          scoreDiff: 0,
          totalScored: 25
        }
      ]
      
      const sorted = sortTeamRankings(tiedRankings)
      expect(sorted[0].team.name).toBe('Team B') // Higher total scored
    })
  })

  describe('calculatePlayerAverage', () => {
    it('should calculate average correctly', () => {
      expect(calculatePlayerAverage(10, 2)).toBe(5)
      expect(calculatePlayerAverage(15, 3)).toBe(5)
      expect(calculatePlayerAverage(7, 4)).toBe(1.75)
    })

    it('should handle zero games', () => {
      expect(calculatePlayerAverage(10, 0)).toBe(0)
      expect(calculatePlayerAverage(0, 0)).toBe(0)
    })
  })

  describe('sortPlayersByTotal', () => {
    const mockPlayers = [
      { name: 'Player A', gamesPlayed: 2, totalPoints: 10 },
      { name: 'Player B', gamesPlayed: 0, totalPoints: 5 },  // Should be filtered out
      { name: 'Player C', gamesPlayed: 3, totalPoints: 15 },
      { name: 'Player D', gamesPlayed: 1, totalPoints: 8 }
    ]

    it('should filter players with no games and sort by total points', () => {
      const sorted = sortPlayersByTotal(mockPlayers)
      
      expect(sorted).toHaveLength(3) // Player B filtered out
      expect(sorted[0].name).toBe('Player C') // 15 points
      expect(sorted[1].name).toBe('Player A') // 10 points
      expect(sorted[2].name).toBe('Player D') // 8 points
    })
  })

  describe('sortPlayersBySpecialty', () => {
    const mockPlayers = [
      { name: 'Player A', gamesPlayed: 2, points1Total: 5, points3Total: 2 },
      { name: 'Player B', gamesPlayed: 0, points1Total: 3, points3Total: 1 }, // Should be filtered
      { name: 'Player C', gamesPlayed: 1, points1Total: 0, points3Total: 4 }, // Should be filtered for points1Total
      { name: 'Player D', gamesPlayed: 3, points1Total: 8, points3Total: 0 }  // Should be filtered for points3Total
    ]

    it('should sort by 1-point specialty correctly', () => {
      const sorted = sortPlayersBySpecialty(mockPlayers, 'points1Total')
      
      expect(sorted).toHaveLength(2) // Only A and D have games and points1Total > 0
      expect(sorted[0].name).toBe('Player D') // 8 points1Total
      expect(sorted[1].name).toBe('Player A') // 5 points1Total
    })

    it('should sort by 3-point specialty correctly', () => {
      const sorted = sortPlayersBySpecialty(mockPlayers, 'points3Total')
      
      expect(sorted).toHaveLength(2) // Only A and C have games and points3Total > 0
      expect(sorted[0].name).toBe('Player C') // 4 points3Total
      expect(sorted[1].name).toBe('Player A') // 2 points3Total
    })
  })
})