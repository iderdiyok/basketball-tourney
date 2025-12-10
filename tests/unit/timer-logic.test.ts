import { describe, it, expect, vi, beforeEach } from 'vitest'

// Import the Timer logic functions we need to test
// Since they're internal to the component, we'll test through the component behavior
// But first let's create standalone utility functions to test

// Timer utility functions to test (extracted from Timer component logic)
export const HALF_TIME_DURATION = 300 // 5 minutes per half
export const TOTAL_GAME_TIME = 2 * HALF_TIME_DURATION // 10 minutes total

export const getCurrentHalf = (seconds: number): 1 | 2 => {
  return seconds < HALF_TIME_DURATION ? 1 : 2
}

export const getRemainingTime = (seconds: number): number => {
  if (seconds >= TOTAL_GAME_TIME) {
    return 0 // Game finished
  }
  
  if (seconds < HALF_TIME_DURATION) {
    // First half: count down from HALF_TIME_DURATION
    return HALF_TIME_DURATION - seconds
  } else {
    // Second half: count down from TOTAL_GAME_TIME
    return TOTAL_GAME_TIME - seconds
  }
}

export const formatTime = (seconds: number): string => {
  const remainingTime = getRemainingTime(seconds)
  const mins = Math.floor(Math.max(0, remainingTime) / 60)
  const secs = Math.max(0, remainingTime) % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const isGameFinished = (timeElapsed: number): boolean => {
  return timeElapsed >= TOTAL_GAME_TIME
}

export const isHalfTimeBreak = (timeElapsed: number, isRunning: boolean): boolean => {
  return timeElapsed >= HALF_TIME_DURATION && !isRunning && timeElapsed < TOTAL_GAME_TIME
}

describe('Timer Logic Utils', () => {
  describe('getCurrentHalf', () => {
    it('should return 1 for first half', () => {
      expect(getCurrentHalf(0)).toBe(1)
      expect(getCurrentHalf(150)).toBe(1)
      expect(getCurrentHalf(299)).toBe(1)
    })

    it('should return 2 for second half', () => {
      expect(getCurrentHalf(300)).toBe(2)
      expect(getCurrentHalf(450)).toBe(2)
      expect(getCurrentHalf(599)).toBe(2)
      expect(getCurrentHalf(600)).toBe(2)
    })
  })

  describe('getRemainingTime', () => {
    it('should return correct remaining time for first half', () => {
      expect(getRemainingTime(0)).toBe(300)   // 5:00 remaining
      expect(getRemainingTime(150)).toBe(150) // 2:30 remaining
      expect(getRemainingTime(299)).toBe(1)   // 0:01 remaining
    })

    it('should return correct remaining time for second half', () => {
      expect(getRemainingTime(300)).toBe(300)  // 5:00 remaining in 2nd half
      expect(getRemainingTime(450)).toBe(150)  // 2:30 remaining
      expect(getRemainingTime(599)).toBe(1)    // 0:01 remaining
    })

    it('should return 0 when game is finished', () => {
      expect(getRemainingTime(600)).toBe(0)
      expect(getRemainingTime(750)).toBe(0)
    })
  })

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(0)).toBe('05:00')    // 5 minutes remaining
      expect(formatTime(150)).toBe('02:30')  // 2:30 remaining
      expect(formatTime(299)).toBe('00:01')  // 1 second remaining
      expect(formatTime(300)).toBe('05:00')  // Start of 2nd half
      expect(formatTime(599)).toBe('00:01')  // 1 second remaining
      expect(formatTime(600)).toBe('00:00')  // Game finished
    })

    it('should handle edge cases', () => {
      expect(formatTime(-1)).toBe('05:01')   // Negative time should show game length + 1
      expect(formatTime(9999)).toBe('00:00') // Way past game time should show 0:00
    })
  })

  describe('isGameFinished', () => {
    it('should return false during game', () => {
      expect(isGameFinished(0)).toBe(false)
      expect(isGameFinished(300)).toBe(false)
      expect(isGameFinished(599)).toBe(false)
    })

    it('should return true when game is finished', () => {
      expect(isGameFinished(600)).toBe(true)
      expect(isGameFinished(750)).toBe(true)
    })
  })

  describe('isHalfTimeBreak', () => {
    it('should detect halftime break correctly', () => {
      // During halftime break (300s elapsed, timer stopped)
      expect(isHalfTimeBreak(300, false)).toBe(true)
      expect(isHalfTimeBreak(305, false)).toBe(true)
      
      // Not halftime break (timer running)
      expect(isHalfTimeBreak(300, true)).toBe(false)
      
      // Not halftime break (first half)
      expect(isHalfTimeBreak(150, false)).toBe(false)
      
      // Not halftime break (game finished)
      expect(isHalfTimeBreak(600, false)).toBe(false)
    })
  })
})