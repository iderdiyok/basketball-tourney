'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, CheckCircle, ClipboardCheck, Home, Calendar, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface Tournament {
  _id: string;
  name: string;
  category: string;
  published: boolean;
}

interface Game {
  _id: string;
  teamA: { _id: string; name: string };
  teamB: { _id: string; name: string };
  status: 'pending' | 'live' | 'finished';
  scheduledTime?: string;
  scoreA: number;
  scoreB: number;
}

export default function TournamentPlanPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tournamentId) {
      fetchTournament();
      fetchGames();
    }
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`);
      const data = await res.json();
      
      if (res.ok && data.tournament) {
        setTournament(data.tournament);
      } else {
        toast.error('Turnier nicht gefunden');
        router.push('/');
      }
    } catch (error) {
      toast.error('Fehler beim Laden des Turniers');
      console.error('Error loading tournament:', error);
    }
  };

  const fetchGames = async () => {
    try {
      const res = await fetch(`/api/games?tournamentId=${tournamentId}`);
      const data = await res.json();
      
      if (res.ok && data.games) {
        // Sort games by scheduled time
        const sortedGames = data.games.sort((a: Game, b: Game) => {
          if (!a.scheduledTime || !b.scheduledTime) return 0;
          return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
        });
        setGames(sortedGames);
      } else {
        console.log('No games found or error:', data);
        setGames([]);
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Spiele');
      console.error('Error loading games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'live':
        return <Play className="w-4 h-4" />;
      case 'finished':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Ausstehend</Badge>;
      case 'live':
        return <Badge className="bg-red-500 hover:bg-red-600">Live</Badge>;
      case 'finished':
        return <Badge className="bg-green-500 hover:bg-green-600">Beendet</Badge>;
      default:
        return <Badge variant="secondary">Unbekannt</Badge>;
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isAdmin = !!session; // Vereinfacht: jeder eingeloggte User kann Admin-Aktionen sehen

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Lade Spielplan...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Turnier nicht gefunden
            </CardTitle>
            <CardDescription className="text-center">
              Das angeforderte Turnier konnte nicht geladen werden.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Zurück zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header - matching the main tournament page */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{tournament.name}</h1>
                <p className="text-sm sm:text-base text-gray-600">Kategorie: {tournament.category} • Spielplan</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/tournaments/${tournamentId}`)}
                className="w-full sm:w-auto"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Turnier Übersicht
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/')}
                className="w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-2" />
                Startseite
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Games List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Spielplan - {tournament.name}
            </CardTitle>
            <CardDescription>
              Alle Spiele dieses Turniers in chronologischer Reihenfolge
              {isAdmin && " • Als Administrator können Sie das Kampfgericht öffnen"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {games.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Noch keine Spiele geplant</p>
                <p className="text-gray-400 text-sm">
                  Der Spielplan wird vom Administrator erstellt
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {games.map((game, index) => (
                  <Card key={game._id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Game Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Spiel #{index + 1}
                            </span>
                            {getStatusIcon(game.status)}
                            <h3 className="text-xl font-semibold">
                              {game.teamA.name} vs {game.teamB.name}
                            </h3>
                            {getStatusBadge(game.status)}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            {game.scheduledTime && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(game.scheduledTime)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatTime(game.scheduledTime)}
                                </span>
                              </>
                            )}
                            
                            {(game.status === 'live' || game.status === 'finished') && (
                              <span className="font-semibold text-gray-800 text-lg">
                                Endstand: {game.scoreA} : {game.scoreB}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {/* Scoring Button - Only for Admin and when game is pending or live */}
                          {isAdmin && (game.status === 'pending' || game.status === 'live') && (
                            <Button
                              size="sm"
                              onClick={() => router.push(`/scorer/${game._id}`)}
                              className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                            >
                              <ClipboardCheck className="w-4 h-4" />
                              Kampfgericht
                            </Button>
                          )}
                          
                          {/* Show result for finished games */}
                          {game.status === 'finished' && (
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Spiel beendet</p>
                              <p className="font-semibold text-lg">
                                {game.scoreA > game.scoreB ? game.teamA.name : 
                                 game.scoreB > game.scoreA ? game.teamB.name : 
                                 'Unentschieden'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}