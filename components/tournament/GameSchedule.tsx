'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { ClientGame } from '@/types/client';

interface GameScheduleProps {
  games: ClientGame[];
}

export function GameSchedule({ games }: GameScheduleProps) {
  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Ausstehend</Badge>;
      case 'live':
        return <Badge variant="default" className="bg-green-600">Live</Badge>;
      case 'finished':
        return <Badge variant="outline">Beendet</Badge>;
      default:
        return <Badge variant="secondary">Unbekannt</Badge>;
    }
  };

  const upcomingGames = games.filter(g => g.status === 'pending');
  const liveGames = games.filter(g => g.status === 'live');
  const finishedGames = games.filter(g => g.status === 'finished');

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          Spielplan
        </CardTitle>
        <p className="text-sm text-gray-600">Alle Spiele des Turniers</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          
          {/* Live Games */}
          {liveGames.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Spiele
              </h3>
              <div className="space-y-3">
                {liveGames.map((game) => (
                  <div key={game._id} className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center justify-between sm:justify-start sm:space-x-6">
                        <div className="text-center flex-1 sm:flex-initial">
                          <div className="font-semibold text-sm sm:text-base">{game.teamA.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600">vs</div>
                          <div className="font-semibold text-sm sm:text-base">{game.teamB.name}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold text-blue-600">{game.scoreA}</div>
                          <div className="text-xs sm:text-sm text-gray-600">:</div>
                          <div className="text-xl sm:text-2xl font-bold text-red-600">{game.scoreB}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end sm:text-right gap-3">
                        {getStatusBadge(game.status)}
                        <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(game.scheduledTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Games */}
          {upcomingGames.length > 0 && (
            <div>
              <h3 className="font-semibold text-blue-600 mb-3">Kommende Spiele</h3>
              <div className="space-y-3">
                {upcomingGames.map((game) => (
                  <div key={game._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="font-semibold text-sm sm:text-base">{game.teamA.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600">vs</div>
                          <div className="font-semibold text-sm sm:text-base">{game.teamB.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end sm:text-right gap-3">
                        {getStatusBadge(game.status)}
                        <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(game.scheduledTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finished Games */}
          {finishedGames.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-600 mb-3">Beendete Spiele</h3>
              <div className="space-y-3">
                {finishedGames.map((game) => (
                  <div key={game._id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center justify-between sm:justify-start sm:space-x-6">
                        <div className="text-center flex-1 sm:flex-initial">
                          <div className="font-semibold text-sm sm:text-base">{game.teamA.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600">vs</div>
                          <div className="font-semibold text-sm sm:text-base">{game.teamB.name}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-xl sm:text-2xl font-bold ${game.scoreA > game.scoreB ? 'text-green-600' : 'text-gray-600'}`}>
                            {game.scoreA}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">:</div>
                          <div className={`text-xl sm:text-2xl font-bold ${game.scoreB > game.scoreA ? 'text-green-600' : 'text-gray-600'}`}>
                            {game.scoreB}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end sm:text-right gap-3">
                        {getStatusBadge(game.status)}
                        <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(game.scheduledTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {games.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Noch keine Spiele geplant</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}