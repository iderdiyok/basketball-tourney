'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface TeamScoreProps {
  teamName: string;
  score: number;
  color: 'blue' | 'red';
  isWinning?: boolean;
}

export function TeamScore({ teamName, score, color, isWinning }: TeamScoreProps) {
  const colorClasses = {
    blue: {
      header: 'bg-blue-600',
      text: 'text-blue-100',
      score: 'text-blue-600'
    },
    red: {
      header: 'bg-red-600', 
      text: 'text-red-100',
      score: 'text-red-600'
    }
  };

  return (
    <Card className={`relative ${isWinning ? 'ring-2 ring-yellow-400 shadow-lg' : ''}`}>
      {isWinning && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-yellow-400 rounded-full p-2">
            <Trophy className="w-4 h-4 text-yellow-800" />
          </div>
        </div>
      )}
      
      <CardHeader className={`${colorClasses[color].header} py-3 sm:py-4`}>
        <CardTitle className={`text-center text-lg sm:text-xl lg:text-2xl ${colorClasses[color].text}`}>
          {teamName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="text-center py-6 sm:py-8">
        <div className={`text-5xl sm:text-6xl lg:text-7xl font-bold ${colorClasses[color].score} transition-all duration-300`}>
          {score}
        </div>
        <div className="text-sm text-gray-600 mt-2">Punkte</div>
      </CardContent>
    </Card>
  );
}