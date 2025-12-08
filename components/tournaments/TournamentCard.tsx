import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, Users, Eye } from 'lucide-react';
import Link from 'next/link';
import { ClientTournament } from '@/types/client';

interface TournamentCardProps {
  tournament: ClientTournament;
  variant?: 'default' | 'compact' | 'hero';
  showActions?: boolean;
}

export function TournamentCard({ 
  tournament, 
  variant = 'default',
  showActions = true 
}: TournamentCardProps) {
  const finishedGames = tournament.games?.filter(game => game.status === 'finished').length || 0;
  const totalGames = tournament.games?.length || 0;
  const isComplete = finishedGames === totalGames && totalGames > 0;
  const hasActiveGames = tournament.games?.some(game => game.status === 'pending' || game.status === 'live') || false;
  const totalPlayers = tournament.teams?.reduce((total, team) => total + (team.players?.length || 0), 0) || 0;

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{tournament.name}</CardTitle>
              <CardDescription className="text-sm">{tournament.category}</CardDescription>
            </div>
            <Badge variant={isComplete ? 'outline' : hasActiveGames ? 'default' : 'secondary'}>
              {isComplete ? 'Abgeschlossen' : hasActiveGames ? 'Live' : 'Ausstehend'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span>Teams: {tournament.teams?.length || 0}</span>
            <span>Spiele: {finishedGames}/{totalGames}</span>
            <span>Spieler: {totalPlayers}</span>
          </div>
          {showActions && (
            <Link href={`/tournaments/${tournament._id}`}>
              <Button size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Ansehen
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'hero') {
    return (
      <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-gray-200 hover:border-orange-300 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-orange-600 text-white py-8 relative">
          <div className="absolute top-4 right-4">
            <Trophy className="w-8 h-8 opacity-20" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">{tournament.name}</CardTitle>
          <CardDescription className="text-lg text-blue-100">
            Kategorie: {tournament.category}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{tournament.teams?.length || 0}</div>
                <div className="text-sm text-gray-600">Teams</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{finishedGames}/{totalGames}</div>
                <div className="text-sm text-gray-600">Spiele</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{totalPlayers}</div>
                <div className="text-sm text-gray-600">Spieler</div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <Badge variant={isComplete ? 'outline' : hasActiveGames ? 'default' : 'secondary'} className="text-base px-4 py-2">
                  {isComplete ? '🏆 Abgeschlossen' : hasActiveGames ? '🔴 Live' : '⏳ Ausstehend'}
                </Badge>
              </div>
              
              {showActions && (
                <Link href={`/tournaments/${tournament._id}`} className="block">
                  <Button size="lg" className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white">
                    <Eye className="w-5 h-5 mr-3" />
                    Turnier live verfolgen
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 hover:border-orange-300">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{tournament.name}</CardTitle>
            <CardDescription className="text-blue-100">
              Kategorie: {tournament.category}
            </CardDescription>
          </div>
          <Trophy className="w-6 h-6 text-orange-300" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Teams: {tournament.teams?.length || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Spiele: {finishedGames}/{totalGames}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Badge variant={isComplete ? 'outline' : hasActiveGames ? 'default' : 'secondary'}>
              {isComplete ? 'Abgeschlossen' : hasActiveGames ? 'Live' : 'Ausstehend'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {totalPlayers} Spieler
            </Badge>
          </div>
          
          {showActions && (
            <Link href={`/tournaments/${tournament._id}`} className="block">
              <Button className="w-full" size="lg">
                <Eye className="w-4 h-4 mr-2" />
                Turnier ansehen
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}