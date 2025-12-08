'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer as TimerIcon, Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface TimerProps {
  isRunning: boolean;
  timeElapsed: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function Timer({ 
  isRunning, 
  timeElapsed, 
  onStart, 
  onPause, 
  onReset, 
  disabled = false 
}: TimerProps) {
  const HALF_TIME_DURATION = 60; // 1 Minute pro Halbzeit (TESTING)
  // const HALF_TIME_DURATION = 5 * 60; // 5 Minuten pro Halbzeit (PRODUCTION)
  const TOTAL_GAME_TIME = 2 * HALF_TIME_DURATION; // 2x1 Minuten für Tests
  
  const getCurrentHalf = (seconds: number): 1 | 2 => {
    return seconds < HALF_TIME_DURATION ? 1 : 2;
  };
  
  const getRemainingTime = (seconds: number): number => {
    if (seconds >= TOTAL_GAME_TIME) {
      return 0; // Spiel ist beendet, zeige 0:00
    }
    
    if (seconds < HALF_TIME_DURATION) {
      // 1. Halbzeit: von 5:00 runter zählen
      return HALF_TIME_DURATION - seconds;
    } else {
      // 2. Halbzeit: von 5:00 runter zählen
      return TOTAL_GAME_TIME - seconds;
    }
  };
  
  const formatTime = (seconds: number): string => {
    const remainingTime = getRemainingTime(seconds);
    const mins = Math.floor(Math.max(0, remainingTime) / 60);
    const secs = Math.max(0, remainingTime) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const isGameFinished = timeElapsed >= TOTAL_GAME_TIME;
  const currentHalf = getCurrentHalf(timeElapsed);
  const isHalfTimeBreak = timeElapsed >= HALF_TIME_DURATION && timeElapsed < HALF_TIME_DURATION + 1;
  const isFirstHalfFinished = timeElapsed >= HALF_TIME_DURATION && timeElapsed < TOTAL_GAME_TIME;

  return (
    <Card className="w-full">
      <CardHeader className="py-3 sm:py-4">
        <CardTitle className="text-center flex items-center justify-center gap-2 text-lg sm:text-xl">
          <TimerIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          Spielzeit (2 x 5 Min)
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-4">
        {/* Halbzeit-Anzeige */}
        <div className="mb-4 flex justify-center">
          <Badge 
            variant={isGameFinished ? "destructive" : "default"} 
            className={`text-lg px-4 py-2 ${
              isGameFinished ? 'bg-red-500' : 
              isFirstHalfFinished && !isGameFinished ? 'bg-yellow-500' : 
              currentHalf === 1 ? 'bg-green-500' : 'bg-blue-500'
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            {isGameFinished ? 'Spiel beendet' : 
             isFirstHalfFinished && currentHalf === 2 ? '2. Halbzeit' :
             currentHalf === 1 ? '1. Halbzeit' : '2. Halbzeit'}
          </Badge>
        </div>
        
        <div className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-mono ${
          isGameFinished ? 'text-red-600' : 
          getRemainingTime(timeElapsed) <= 60 ? 'text-orange-600' : 
          'text-blue-600'
        }`}>
          {formatTime(timeElapsed)}
        </div>
        
        {isGameFinished && (
          <div className="text-lg text-red-600 font-semibold mb-4">
            Spielzeit abgelaufen!
          </div>
        )}
        
        {isFirstHalfFinished && !isGameFinished && (
          <div className="text-lg text-yellow-600 font-semibold mb-4">
            1. Halbzeit beendet - 2. Halbzeit starten!
          </div>
        )}
        
        <div className="flex justify-center gap-3">
          <Button
            onClick={onStart}
            disabled={isRunning || isGameFinished}
            size="lg"
            className="h-12 w-12 sm:h-14 sm:w-14 bg-green-600 hover:bg-green-700"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <Button
            onClick={onPause}
            disabled={!isRunning || isGameFinished}
            size="lg"
            variant="outline"
            className="h-12 w-12 sm:h-14 sm:w-14"
          >
            <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <Button
            onClick={onReset}
            size="lg"
            variant="outline"
            className="h-12 w-12 sm:h-14 sm:w-14"
            disabled={isGameFinished}
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
        
        {/* Halbzeit-Fortschritt */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>1. Halbzeit</span>
            <span>2. Halbzeit</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                currentHalf === 1 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ 
                width: `${Math.min((timeElapsed / TOTAL_GAME_TIME) * 100, 100)}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5:00</span>
            <span className="text-center">0:00 / 5:00</span>
            <span>0:00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}