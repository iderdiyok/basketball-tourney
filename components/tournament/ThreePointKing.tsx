'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Medal, Trophy } from 'lucide-react';
import { PlayerStatistics } from '@/types/client';

interface ThreePointKingProps {
  players: PlayerStatistics[];
  limit?: number;
}

export function ThreePointKing({ players, limit = 5 }: ThreePointKingProps) {
  const threePointKings = players
    .filter(p => p.gamesPlayed > 0 && p.points3Total > 0)
    .sort((a, b) => b.points3Total - a.points3Total)
    .slice(0, limit);

  if (threePointKings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-500" />
            3er-König
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Noch keine 3-Punkt-Würfe erzielt
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          3er-König
        </CardTitle>
        <p className="text-sm text-gray-600">Meiste 3-Punkt-Würfe (Distanzwürfe)</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {threePointKings.map((stat, index) => (
            <div 
              key={stat.player._id} 
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                index === 0 ? 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-purple-200">
                  <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
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
                  <div className="font-bold text-lg text-purple-600">{stat.points3Total}</div>
                  <div className="text-xs text-gray-600">3er</div>
                </div>
                {index === 0 && <Trophy className="w-5 h-5 text-yellow-500 ml-2" />}
                {index === 1 && <Medal className="w-5 h-5 text-gray-400 ml-2" />}
                {index === 2 && <Medal className="w-5 h-5 text-amber-600 ml-2" />}
              </div>
            </div>
          ))}
        </div>

        {threePointKings.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Durchschnitt: {(threePointKings[0]?.points3Total / threePointKings[0]?.gamesPlayed || 0).toFixed(1)} pro Spiel
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}