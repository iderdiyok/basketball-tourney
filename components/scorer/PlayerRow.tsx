'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayerScoreData } from '@/types/client';

interface PlayerRowProps {
  player: PlayerScoreData;
  onAddPoints: (playerId: string, points: 1 | 2 | 3) => void;
  disabled?: boolean;
  teamColor: 'blue' | 'red';
}

export function PlayerRow({ 
  player, 
  onAddPoints, 
  disabled = false,
  teamColor 
}: PlayerRowProps) {
  const colorClasses = {
    blue: 'text-blue-600 border-blue-200 bg-blue-50',
    red: 'text-red-600 border-red-200 bg-red-50'
  };

  return (
    <div className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${colorClasses[teamColor]}`}>
      {/* Player Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold text-lg sm:text-xl">{player.playerName}</div>
            <div className="text-sm text-gray-500">Spieler</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl sm:text-2xl lg:text-3xl font-bold ${teamColor === 'blue' ? 'text-blue-600' : 'text-red-600'}`}>
            {player?.total}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Punkte</div>
        </div>
      </div>

      {/* Score Buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
        <Button
          onClick={() => onAddPoints(player.playerId, 1)}
          disabled={disabled}
          size="lg"
          variant="outline"
          className="h-16 sm:h-14 text-lg font-bold hover:bg-green-50 hover:border-green-300 hover:text-green-700"
        >
          +1
        </Button>
        <Button
          onClick={() => onAddPoints(player.playerId, 2)}
          disabled={disabled}
          size="lg"
          variant="outline"
          className="h-16 sm:h-14 text-lg font-bold hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
        >
          +2
        </Button>
        <Button
          onClick={() => onAddPoints(player.playerId, 3)}
          disabled={disabled}
          size="lg"
          variant="outline"
          className="h-16 sm:h-14 text-lg font-bold hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
        >
          +3
        </Button>
      </div>

      {/* Point Breakdown */}
      <div className="flex justify-between text-sm text-gray-600 bg-white rounded px-3 py-2">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          1er: <span className="font-semibold">{player.points1}</span>
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          2er: <span className="font-semibold">{player.points2}</span>
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          3er: <span className="font-semibold">{player.points3}</span>
        </span>
      </div>
    </div>
  );
}