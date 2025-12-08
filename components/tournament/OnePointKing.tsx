'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Medal, Trophy } from 'lucide-react';
import { PlayerStatistics } from '@/types/client';

interface OnePointKingProps {
  players: PlayerStatistics[];
  limit?: number;
}

export function OnePointKing({ players, limit = 5 }: OnePointKingProps) {
  const onePointKings = players
    .filter(p => p.gamesPlayed > 0 && p.points1Total > 0)
    .sort((a, b) => b.points1Total - a.points1Total)
    .slice(0, limit);

  if (onePointKings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-green-500" />
            Freiwürfe-König
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Noch keine Freiwürfe erzielt
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
          Freiwürfe-König
        </CardTitle>
        <p className="text-sm text-gray-600">Meiste Freiwürfe</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {onePointKings.map((stat, index) => (
            <div 
              key={stat.player._id} 
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                index === 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-green-200">
                  <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                </div>
                <div>
                  <div className="font-semibold text-sm sm:text-base">
                    {stat.player.name}
                    {stat.player.number && (
                      <span className="text-gray-500 ml-2">#{stat.player.number}</span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.team.name}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  {stat.gamesPlayed} Spiele
                </Badge>
                <div className="text-right">
                  <div className="font-bold text-lg text-green-600">{stat.points1Total}</div>
                  <div className="text-xs text-gray-600">1er</div>
                </div>
                {index === 0 && <Trophy className="w-5 h-5 text-yellow-500 ml-2" />}
                {index === 1 && <Medal className="w-5 h-5 text-gray-400 ml-2" />}
                {index === 2 && <Medal className="w-5 h-5 text-amber-600 ml-2" />}
              </div>
            </div>
          ))}
        </div>

        {onePointKings.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Durchschnitt: {(onePointKings[0]?.points1Total / onePointKings[0]?.gamesPlayed || 0).toFixed(1)} pro Spiel
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}