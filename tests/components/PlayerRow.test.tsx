import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerRow } from '../../components/scorer/PlayerRow'

const mockPlayer = {
  playerId: 'player1',
  playerName: 'John Doe',
  number: 23,
  points1: 8,
  points2: 2,
  points3: 1,
  total: 15
}

const mockOnAddPoints = vi.fn()

describe('PlayerRow Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Team Blue Player', () => {
    it('should render player information correctly', () => {
      render(
        <PlayerRow
          player={mockPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="blue"
        />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument() // Total points
    })

    it('should display correct team styling for Team Blue', () => {
      const { container } = render(
        <PlayerRow
          player={mockPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="blue"
        />
      )

      const playerRow = container.firstChild as HTMLElement
      expect(playerRow).toHaveClass('bg-blue-50')
    })

    it('should handle 1-point scoring', () => {
      render(
        <PlayerRow
          player={mockPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="blue"
        />
      )

      const onePointButton = screen.getByRole('button', { name: '+1' })
      fireEvent.click(onePointButton)

      expect(mockOnAddPoints).toHaveBeenCalledWith('player1', 1)
    })

    it('should handle 2-point scoring', () => {
      render(
        <PlayerRow
          player={mockPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="blue"
        />
      )

      const twoPointButton = screen.getByRole('button', { name: '+2' })
      fireEvent.click(twoPointButton)

      expect(mockOnAddPoints).toHaveBeenCalledWith('player1', 2)
    })

    it('should handle 3-point scoring', () => {
      render(
        <PlayerRow
          player={mockPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="blue"
        />
      )

      const threePointButton = screen.getByRole('button', { name: '+3' })
      fireEvent.click(threePointButton)

      expect(mockOnAddPoints).toHaveBeenCalledWith('player1', 3)
    })
  })

  describe('Team Red Player', () => {
    const redPlayer = {
      ...mockPlayer,
      playerId: 'player2',
      playerName: 'Jane Smith'
    }

    it('should display correct team styling for Team Red', () => {
      const { container } = render(
        <PlayerRow
          player={redPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="red"
        />
      )

      const playerRow = container.firstChild as HTMLElement
      expect(playerRow).toHaveClass('bg-red-50')
    })

    it('should update correctly for red team', () => {
      render(
        <PlayerRow
          player={redPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="red"
        />
      )

      const twoPointButton = screen.getByRole('button', { name: '+2' })
      fireEvent.click(twoPointButton)

      expect(mockOnAddPoints).toHaveBeenCalledWith('player2', 2)
    })
  })

  describe('Disabled State', () => {
    it('should disable scoring when disabled prop is true', () => {
      render(
        <PlayerRow
          player={mockPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="blue"
          disabled={true}
        />
      )

      const onePointButton = screen.getByRole('button', { name: '+1' })
      const twoPointButton = screen.getByRole('button', { name: '+2' })
      const threePointButton = screen.getByRole('button', { name: '+3' })

      expect(onePointButton).toBeDisabled()
      expect(twoPointButton).toBeDisabled()
      expect(threePointButton).toBeDisabled()
    })

    it('should allow scoring when disabled is false', () => {
      render(
        <PlayerRow
          player={mockPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="blue"
          disabled={false}
        />
      )

      const onePointButton = screen.getByRole('button', { name: '+1' })
      expect(onePointButton).not.toBeDisabled()
    })
  })

  describe('Player Statistics Display', () => {
    it('should display player statistics correctly', () => {
      const playerWithStats = {
        playerId: 'player3',
        playerName: 'Statistics Player',
        number: 10,
        points1: 6,
        points2: 4,
        points3: 2,
        total: 20
      }

      render(
        <PlayerRow
          player={playerWithStats}
          onAddPoints={mockOnAddPoints}
          teamColor="blue"
        />
      )

      expect(screen.getByText('Statistics Player')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument() // Total points
    })

    it('should handle zero points correctly', () => {
      const newPlayer = {
        playerId: 'player4',
        playerName: 'New Player',
        number: 99,
        points1: 0,
        points2: 0,
        points3: 0,
        total: 0
      }

      render(
        <PlayerRow
          player={newPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="red"
        />
      )

      expect(screen.getByText('New Player')).toBeInTheDocument()
      // Check for total points display with specific class selector
      const totalPointsElements = screen.getAllByText('0')
      const totalPointsDisplay = totalPointsElements.find(el => 
        el.className.includes('text-2xl') && el.className.includes('font-bold')
      )
      expect(totalPointsDisplay).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      render(
        <PlayerRow
          player={mockPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="blue"
        />
      )

      expect(screen.getByRole('button', { name: '+1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '+2' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '+3' })).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(
        <PlayerRow
          player={mockPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="blue"
        />
      )

      const onePointButton = screen.getByRole('button', { name: '+1' })
      onePointButton.focus()
      expect(onePointButton).toHaveFocus()
    })
  })

  describe('Visual Styling', () => {
    it('should apply correct color classes for blue team', () => {
      const { container } = render(
        <PlayerRow
          player={mockPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="blue"
        />
      )

      const playerRow = container.firstChild as HTMLElement
      expect(playerRow).toHaveClass('text-blue-600', 'border-blue-200', 'bg-blue-50')
    })

    it('should apply correct color classes for red team', () => {
      const { container } = render(
        <PlayerRow
          player={mockPlayer}
          onAddPoints={mockOnAddPoints}
          teamColor="red"
        />
      )

      const playerRow = container.firstChild as HTMLElement
      expect(playerRow).toHaveClass('text-red-600', 'border-red-200', 'bg-red-50')
    })
  })
})