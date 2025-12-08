import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Eye, Trophy, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ClientGame } from '@/types/client';

interface GameCardProps {
  game: ClientGame;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  gameNumber?: number;
}

export function GameCard({ 
  game, 
  variant = 'default',
  showActions = true,
  gameNumber 
}: GameCardProps) {
  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'live': return 'default';
      case 'finished': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ Ausstehend';
      case 'live': return '🔴 Live';
      case 'finished': return '✅ Beendet';
      default: return status;
    }
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">
                {game.teamA.name} vs {game.teamB.name}
              </div>
              <Badge variant={getStatusColor(game.status)}>
                {getStatusText(game.status)}
              </Badge>
            </div>
            
            {game.status === 'finished' && game.scoreA !== undefined && game.scoreB !== undefined && (
              <div className="text-lg font-bold">
                {game.scoreA} : {game.scoreB}
              </div>
            )}
            
            {showActions && game.status === 'pending' && (
              <Link href={`/kampfgericht/${game._id}`}>
                <Button size="sm" variant="outline">
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {gameNumber && <span className="text-sm text-gray-500">Spiel {gameNumber}</span>}
                <Trophy className="w-4 h-4 text-orange-500" />
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3" />
                {game.scheduledTime ? formatDateTime(game.scheduledTime) : 'Zeit TBD'}
              </CardDescription>
            </div>
            <Badge variant={getStatusColor(game.status)}>
              {getStatusText(game.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Teams */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-semibold text-blue-600">{game.teamA.name}</div>
                {game.status === 'finished' && game.scoreA !== undefined && (
                  <div className="text-2xl font-bold text-blue-600">{game.scoreA}</div>
                )}
              </div>
              <div className="flex items-center justify-center">
                <span className="text-gray-400 font-bold">VS</span>
              </div>
              <div>
                <div className="font-semibold text-red-600">{game.teamB.name}</div>
                {game.status === 'finished' && game.scoreB !== undefined && (
                  <div className="text-2xl font-bold text-red-600">{game.scoreB}</div>
                )}
              </div>
            </div>

            {/* Game Time - Commented out until timeElapsed is added to ClientGame */}
            {/* {(game.status === 'live' || game.status === 'finished') && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Spielzeit: 00:00</span>
              </div>
            )} */}

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2">
                {game.status === 'pending' && (
                  <Link href={`/kampfgericht/${game._id}`} className="flex-1">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-2" />
                      Spiel starten
                    </Button>
                  </Link>
                )}
                
                {game.status === 'live' && (
                  <Link href={`/kampfgericht/${game._id}`} className="flex-1">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      <Eye className="w-4 h-4 mr-2" />
                      Live verfolgen
                    </Button>
                  </Link>
                )}
                
                {game.status === 'finished' && (
                  <Link href={`/kampfgericht/${game._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Ergebnisse ansehen
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            {gameNumber && (
              <div className="text-xs text-gray-500 mb-1">Spiel {gameNumber}</div>
            )}
            <Badge variant={getStatusColor(game.status)}>
              {getStatusText(game.status)}
            </Badge>
          </div>
          
          {/* Teams and Score */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <div className="font-semibold text-sm md:text-base">{game.teamA.name}</div>
              {game.status === 'finished' && game.scoreA !== undefined && (
                <div className="text-xl md:text-2xl font-bold text-blue-600 mt-1">{game.scoreA}</div>
              )}
            </div>
            <div className="text-center">
              <div className="text-xs md:text-sm text-gray-600">vs</div>
              {game.status === 'finished' && game.scoreA !== undefined && game.scoreB !== undefined && (
                <div className="text-xs md:text-sm text-gray-600 mt-1">:</div>
              )}
            </div>
            <div className="text-center">
              <div className="font-semibold text-sm md:text-base">{game.teamB.name}</div>
              {game.status === 'finished' && game.scoreB !== undefined && (
                <div className="text-xl md:text-2xl font-bold text-red-600 mt-1">{game.scoreB}</div>
              )}
            </div>
          </div>

          {/* Time info */}
          <div className="text-xs md:text-sm text-gray-600 text-center">
            {game.scheduledTime ? formatDateTime(game.scheduledTime) : 'Zeit TBD'}
            {/* {(game.status === 'live' || game.status === 'finished') && (
              <div className="mt-1">Spielzeit: 00:00</div>
            )} */}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="pt-2">
              {game.status === 'pending' && (
                <Link href={`/kampfgericht/${game._id}`}>
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    <Play className="w-3 h-3 mr-2" />
                    Spiel starten
                  </Button>
                </Link>
              )}
              
              {game.status === 'live' && (
                <Link href={`/kampfgericht/${game._id}`}>
                  <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                    <Eye className="w-3 h-3 mr-2" />
                    Live verfolgen
                  </Button>
                </Link>
              )}
              
              {game.status === 'finished' && (
                <Link href={`/kampfgericht/${game._id}`}>
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="w-3 h-3 mr-2" />
                    Ergebnis ansehen
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}