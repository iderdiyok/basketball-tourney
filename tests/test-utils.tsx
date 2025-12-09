import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { vi } from 'vitest'

// Mock providers wrapper for components that need context
const AllProviders = ({ children }: { children: ReactNode }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  )
}

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock data factories
export const createMockGame = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  tournamentId: '507f1f77bcf86cd799439012',
  teamA: {
    _id: '507f1f77bcf86cd799439013',
    name: 'Lakers',
    players: [
      {
        _id: '507f1f77bcf86cd799439014',
        name: 'Max Müller',
        number: 1
      },
      {
        _id: '507f1f77bcf86cd799439015',
        name: 'Leon Schmidt', 
        number: 2
      }
    ]
  },
  teamB: {
    _id: '507f1f77bcf86cd799439016',
    name: 'Bulls',
    players: [
      {
        _id: '507f1f77bcf86cd799439017',
        name: 'Noah Becker',
        number: 1
      },
      {
        _id: '507f1f77bcf86cd799439018',
        name: 'Ben Schulz',
        number: 2
      }
    ]
  },
  scoreA: 0,
  scoreB: 0,
  status: 'pending' as const,
  playerStats: [],
  ...overrides
})

export const createMockTournament = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439012',
  name: 'Test Tournament',
  category: 'U12',
  published: true,
  teams: [],
  games: [],
  ...overrides
})

export const createMockPlayerStats = (overrides = {}) => ({
  playerId: '507f1f77bcf86cd799439014',
  playerName: 'Max Müller',
  points1: 2,
  points2: 1,
  points3: 1,
  total: 7, // 2*1 + 1*2 + 1*3
  ...overrides
})

export const createMockTeamStats = (overrides = {}) => ({
  teamId: '507f1f77bcf86cd799439013',
  teamName: 'Lakers',
  totalScore: 10,
  players: [createMockPlayerStats()],
  ...overrides
})

// Mock API responses
export const mockApiResponse = (data: any, success = true) => ({
  data: success ? data : null,
  error: success ? null : 'Test error',
  success
})

// Mock timer state
export const createMockTimer = (overrides = {}) => ({
  isRunning: false,
  timeElapsed: 0,
  ...overrides
})