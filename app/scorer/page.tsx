'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Users, Clock, Play, Pause, CheckCircle, Home, ListChecks, Timer, Shield } from 'lucide-react';
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
  scheduledTime: string;
  scoreA: number;
  scoreB: number;
}

export default function ScorerSelectionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGames, setLoadingGames] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchTournaments();
  }, [session, status, router]);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments');
      const data = await res.json();
      
      if (data.success) {
        setTournaments(data.tournaments || []);
      } else {
        toast.error('Fehler beim Laden der Turniere');
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Turniere');
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async (tournamentId: string) => {
    if (!tournamentId) return;
    
    try {
      setLoadingGames(true);
      const res = await fetch(`/api/tournaments/${tournamentId}`);
      const data = await res.json();
      
      if (data.success && data.tournament.games) {
        // Sort games by scheduled time
        const sortedGames = data.tournament.games.sort((a: Game, b: Game) => 
          new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
        );
        setGames(sortedGames);
      } else {
        setGames([]);
        toast.error('Fehler beim Laden der Spiele');
      }
    } catch (error) {
      setGames([]);
      toast.error('Fehler beim Laden der Spiele');
      console.error('Error loading games:', error);
    } finally {
      setLoadingGames(false);
    }
  };

  const handleTournamentChange = (tournamentId: string) => {
    setSelectedTournament(tournamentId);
    setGames([]);
    if (tournamentId) {
      fetchGames(tournamentId);
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Lade Kampfgericht...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="w-8 h-8 text-orange-500" />
                <div>
                  <CardTitle className="text-2xl">Kampfgericht - Live Scoring</CardTitle>
                  <CardDescription>
                    Wählen Sie ein Turnier und Spiel für die Live-Übertragung
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Startseite
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tournament Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="w-6 h-6 text-blue-500" />
              Turnier auswählen
            </CardTitle>
            <CardDescription>
              Wählen Sie das Turnier aus, für das Sie das Scoring durchführen möchten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTournament} onValueChange={handleTournamentChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Turnier auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map((tournament) => (
                  <SelectItem key={tournament._id} value={tournament._id}>
                    {tournament.name} ({tournament.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Games List */}
        {selectedTournament && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-6 h-6 text-green-500" />
                Spiele des Turniers
              </CardTitle>
              <CardDescription>
                Klicken Sie auf "Scoring starten" um das Live-Scoring für ein Spiel zu öffnen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingGames ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Lade Spiele...</p>
                </div>
              ) : games.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Keine Spiele für dieses Turnier gefunden</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {games.map((game) => (
                    <Card key={game._id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Game Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(game.status)}
                              <h3 className="text-xl font-semibold">
                                {game.teamA.name} vs {game.teamB.name}
                              </h3>
                              {getStatusBadge(game.status)}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatTime(game.scheduledTime)}
                              </span>
                              
                              {(game.status === 'live' || game.status === 'finished') && (
                                <span className="font-medium text-gray-800">
                                  Stand: {game.scoreA} : {game.scoreB}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => router.push(`/scorer/${game._id}`)}
                              className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 px-6 py-2"
                              size="lg"
                            >
                              <ClipboardCheck className="w-5 h-5" />
                              Scoring starten
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}