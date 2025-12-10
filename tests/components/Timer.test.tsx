import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Timer } from '../../components/scorer/Timer'

// Mock game data
const mockTimerProps = {
  isRunning: false,
  timeElapsed: 0,
  onStart: vi.fn(),
  onPause: vi.fn(),
  onReset: vi.fn(),
  disabled: false,
  currentHalf: 1
}

describe('Timer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render timer with initial time', () => {
    render(
      <Timer {...mockTimerProps} />
    )

    expect(screen.getByText('05:00')).toBeInTheDocument() // 5 minute countdown
    // Check for first half badge with specific styling
    const halfTimeBadges = screen.getAllByText('1. Halbzeit')
    const halfTimeBadge = halfTimeBadges.find(el => 
      el.className?.includes('bg-green-500') || el.parentElement?.className?.includes('bg-green-500')
    )
    expect(halfTimeBadge).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3) // Start, Pause, Reset buttons
  })

  it('should handle timer start', () => {
    render(
      <Timer {...mockTimerProps} />
    )

    // Get the start button (first button with play icon)
    const buttons = screen.getAllByRole('button')
    const startButton = buttons[0] // Start button is first
    fireEvent.click(startButton)

    expect(mockTimerProps.onStart).toHaveBeenCalledTimes(1)
  })

  it('should handle timer pause when running', () => {
    render(
      <Timer 
        {...mockTimerProps}
        isRunning={true}
      />
    )

    // Get the pause button (second button)
    const buttons = screen.getAllByRole('button')
    const pauseButton = buttons[1] // Pause button is second
    fireEvent.click(pauseButton)

    expect(mockTimerProps.onPause).toHaveBeenCalledTimes(1)
  })

  it('should handle reset', () => {
    render(
      <Timer 
        {...mockTimerProps}
        timeElapsed={150}
      />
    )

    // Get the reset button (third button)
    const buttons = screen.getAllByRole('button')
    const resetButton = buttons[2] // Reset button is third
    fireEvent.click(resetButton)

    expect(mockTimerProps.onReset).toHaveBeenCalledTimes(1)
  })

  it('should display second half correctly', () => {
    render(
      <Timer 
        {...mockTimerProps}
        timeElapsed={375}
        currentHalf={2}
      />
    )

    expect(screen.getByText('03:45')).toBeInTheDocument() // 600-375 = 225s => 3:45
    // Check for second half badge with specific styling
    const halfTimeBadges = screen.getAllByText('2. Halbzeit')
    const halfTimeBadge = halfTimeBadges.find(el => 
      el.className?.includes('bg-yellow-500') || el.parentElement?.className?.includes('bg-yellow-500')
    )
    expect(halfTimeBadge).toBeInTheDocument()
  })

  it('should show finished state when game is completed', () => {
    render(
      <Timer 
        {...mockTimerProps}
        timeElapsed={600}
      />
    )

    expect(screen.getByText('Spiel beendet')).toBeInTheDocument()
    expect(screen.getByText('Spielzeit abgelaufen!')).toBeInTheDocument()
  })

  it('should disable start button when running', () => {
    render(
      <Timer 
        {...mockTimerProps}
        isRunning={true}
      />
    )

    const buttons = screen.getAllByRole('button')
    const startButton = buttons[0]
    expect(startButton).toBeDisabled()
  })

  it('should disable buttons when finished', () => {
    render(
      <Timer 
        {...mockTimerProps}
        timeElapsed={600} // Game finished
      />
    )

    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('should show halftime message', () => {
    render(
      <Timer 
        {...mockTimerProps}
        timeElapsed={300} // End of first half
        currentHalf={1}
      />
    )

    expect(screen.getByText('1. Halbzeit beendet - 2. Halbzeit starten!')).toBeInTheDocument()
  })

  it('should display correct progress bar width', () => {
    const { container } = render(
      <Timer 
        {...mockTimerProps}
        timeElapsed={300} // Half way through game
      />
    )

    const progressBar = container.querySelector('.bg-green-500, .bg-blue-500')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveStyle('width: 50%') // 60/120 = 50%
  })

  it('should handle disabled prop', () => {
    render(
      <Timer 
        {...mockTimerProps}
        disabled={true}
      />
    )

    const buttons = screen.getAllByRole('button')
    // When timer is disabled, all buttons should be disabled
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('should display time correctly for edge cases', () => {
    const { rerender } = render(
      <Timer 
        {...mockTimerProps}
        timeElapsed={0}
      />
    )

    expect(screen.getByText('05:00')).toBeInTheDocument()

    rerender(
      <Timer 
        {...mockTimerProps}
        timeElapsed={299}
      />
    )
    
    expect(screen.getByText('00:01')).toBeInTheDocument()

    rerender(
      <Timer 
        {...mockTimerProps}
        timeElapsed={600}
      />
    )
    
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })
})