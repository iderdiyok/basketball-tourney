'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Trophy, Users, UserPlus, Calendar, LogOut, Plus, ClipboardCheck, Clock, Play, CheckCircle, Home } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface Tournament {
  _id: string;
  name: string;
  category: string;
  published: boolean;
  teams?: any[];
  games?: any[];
}

interface Team {
  _id: string;
  name: string;
  players?: any[];
}

interface Player {
  _id: string;
  name: string;
  number?: number;
  teamId: any;
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

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedTournamentName, setSelectedTournamentName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [newTournament, setNewTournament] = useState({ name: '', category: '' });
  const [newTeam, setNewTeam] = useState({ name: '', tournamentId: '' });
  const [newPlayer, setNewPlayer] = useState({ name: '', teamId: '', number: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchTeams(selectedTournament);
      fetchGames(selectedTournament);
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments');
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (error) {
      toast.error('Fehler beim Laden der Turniere');
    }
  };

  const fetchTeams = async (tournamentId: string) => {
    try {
      const res = await fetch(`/api/teams?tournamentId=${tournamentId}`);
      const data = await res.json();
      setTeams(data.teams || []);

      const playersRes = await fetch(`/api/players`);
      const playersData = await playersRes.json();
      const filteredPlayers = playersData.players.filter((p: Player) => 
        data.teams.some((t: Team) => t._id === p.teamId._id || t._id === p.teamId)
      );
      setPlayers(filteredPlayers);
    } catch (error) {
      toast.error('Fehler beim Laden der Teams');
    }
  };

  const fetchGames = async (tournamentId: string) => {
    try {
      const res = await fetch(`/api/games?tournamentId=${tournamentId}`);
      const data = await res.json();
      setGames(data.games || []);
    } catch (error) {
      toast.error('Fehler beim Laden der Spiele');
      console.error('Error loading games:', error);
    }
  };

  const createTournament = async () => {
    if (!newTournament.name || !newTournament.category) {
      toast.error('Bitte alle Felder ausfüllen');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTournament),
      });

      if (res.ok) {
        toast.success('Turnier erstellt');
        setNewTournament({ name: '', category: '' });
        fetchTournaments();
      }
    } catch (error) {
      toast.error('Fehler beim Erstellen');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!newTeam.name || !selectedTournament) {
      toast.error('Bitte alle Felder ausfüllen');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTeam, tournamentId: selectedTournament }),
      });

      if (res.ok) {
        toast.success('Team erstellt');
        setNewTeam({ name: '', tournamentId: '' });
        fetchTeams(selectedTournament);
      }
    } catch (error) {
      toast.error('Fehler beim Erstellen');
    } finally {
      setLoading(false);
    }
  };

  const createPlayer = async () => {
    if (!newPlayer.name || !newPlayer.teamId) {
      toast.error('Bitte alle Felder ausfüllen');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlayer.name,
          teamId: newPlayer.teamId,
          number: newPlayer.number ? parseInt(newPlayer.number) : undefined,
        }),
      });

      if (res.ok) {
        toast.success('Spieler erstellt');
        setNewPlayer({ name: '', teamId: '', number: '' });
        fetchTeams(selectedTournament);
      }
    } catch (error) {
      toast.error('Fehler beim Erstellen');
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = async () => {
    if (!selectedTournament) {
      toast.error('Bitte Turnier auswählen');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: selectedTournament }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Spielplan erstellt: ${data.gamesCount} Spiele`);
        fetchGames(selectedTournament); // Reload games after generating schedule
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Fehler beim Erstellen des Spielplans');
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (tournamentId: string, published: boolean) => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !published }),
      });

      if (res.ok) {
        toast.success(published ? 'Turnier deaktiviert' : 'Turnier veröffentlicht');
        fetchTournaments();
      }
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
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
        return <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Ausstehend</span>;
      case 'live':
        return <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Live</span>;
      case 'finished':
        return <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Beendet</span>;
      default:
        return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">Unbekannt</span>;
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Laden...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Turnierverwaltung</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/')}>
                <Home className="w-4 h-4 mr-2" />
                Startseite
              </Button>
              <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!selectedTournament ? (
          // Tournament Selection View
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Neues Turnier erstellen</CardTitle>
                <CardDescription>
                  Lege ein neues Basketball-Turnier an
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tournament-name">Turniername</Label>
                    <Input
                      id="tournament-name"
                      value={newTournament.name}
                      onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                      placeholder="Weihnachtsturnier 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tournament-category">Kategorie</Label>
                    <Input
                      id="tournament-category"
                      value={newTournament.category}
                      onChange={(e) => setNewTournament({ ...newTournament, category: e.target.value })}
                      placeholder="U12"
                    />
                  </div>
                </div>
                <Button onClick={createTournament} disabled={loading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Turnier erstellen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Turnier auswählen</CardTitle>
                <CardDescription>
                  Wähle ein Turnier aus, um Teams, Spieler und Spielplan zu verwalten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {tournaments.map((tournament) => (
                    <Card 
                      key={tournament._id} 
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-orange-300"
                      onClick={() => {
                        setSelectedTournament(tournament._id);
                        setSelectedTournamentName(tournament.name);
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{tournament.name}</CardTitle>
                            <CardDescription>Kategorie: {tournament.category}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {tournament.teams?.length || 0} Teams • {tournament.games?.length || 0} Spiele
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                tournament.published
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {tournament.published ? 'Veröffentlicht' : 'Entwurf'}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  {tournaments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Noch keine Turniere vorhanden. Erstelle dein erstes Turnier oben.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Tournament Management View
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-orange-500" />
                      {selectedTournamentName}
                    </CardTitle>
                    <CardDescription>Verwalte Teams, Spieler und Spielplan für dieses Turnier</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedTournament('');
                      setSelectedTournamentName('');
                      setTeams([]);
                      setPlayers([]);
                      setGames([]);
                    }}
                  >
                    ← Zurück zu Turnieren
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="teams" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="teams">
                  <Users className="w-4 h-4 mr-2" />
                  Teams
                </TabsTrigger>
                <TabsTrigger value="players">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Spieler
                </TabsTrigger>
                <TabsTrigger value="schedule">
                  <Calendar className="w-4 h-4 mr-2" />
                  Spielplan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="teams" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Neues Team erstellen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Teamname</Label>
                      <Input
                        id="team-name"
                        value={newTeam.name}
                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        placeholder="Lakers"
                      />
                    </div>
                    <Button onClick={createTeam} disabled={loading}>
                      <Plus className="w-4 h-4 mr-2" />
                      Team erstellen
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Teams in diesem Turnier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team</TableHead>
                          <TableHead>Spieleranzahl</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teams.map((team) => (
                          <TableRow key={team._id}>
                            <TableCell className="font-medium">{team.name}</TableCell>
                            <TableCell>{team.players?.length || 0}</TableCell>
                          </TableRow>
                        ))}
                        {teams.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-gray-500 py-8">
                              Noch keine Teams für dieses Turnier erstellt
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="players" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Neuen Spieler erstellen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Team auswählen</Label>
                        <Select value={newPlayer.teamId} onValueChange={(value) => setNewPlayer({ ...newPlayer, teamId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Team wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map((t) => (
                              <SelectItem key={t._id} value={t._id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="player-name">Spielername</Label>
                        <Input
                          id="player-name"
                          value={newPlayer.name}
                          onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                          placeholder="Max Mustermann"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="player-number">Nummer</Label>
                        <Input
                          id="player-number"
                          type="number"
                          value={newPlayer.number}
                          onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                          placeholder="7"
                        />
                      </div>
                    </div>
                    <Button onClick={createPlayer} disabled={loading || !newPlayer.teamId || teams.length === 0}>
                      <Plus className="w-4 h-4 mr-2" />
                      Spieler erstellen
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Alle Spieler in diesem Turnier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Nummer</TableHead>
                          <TableHead>Team</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {players.map((player) => (
                          <TableRow key={player._id}>
                            <TableCell className="font-medium">{player.name}</TableCell>
                            <TableCell>{player.number || '-'}</TableCell>
                            <TableCell>{player.teamId?.name || '-'}</TableCell>
                          </TableRow>
                        ))}
                        {players.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                              Noch keine Spieler für dieses Turnier erstellt
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Spielplan generieren</CardTitle>
                    <CardDescription>
                      Erstellt automatisch einen "Jeder gegen jeden" Spielplan für alle Teams
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={generateSchedule} disabled={loading || teams.length < 2}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Spielplan generieren
                    </Button>
                    <p className="text-sm text-gray-600">
                      {teams.length >= 2 ? (
                        <span>
                          Erstellt {(teams.length * (teams.length - 1)) / 2} Spiele für {teams.length} Teams
                        </span>
                      ) : (
                        <span>Mindestens 2 Teams erforderlich für Spielplan-Generierung</span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                {games.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardCheck className="w-6 h-6 text-orange-500" />
                        Spielplan Übersicht
                      </CardTitle>
                      <CardDescription>
                        Alle Spiele dieses Turniers mit Scoring-Zugang
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {games.map((game) => (
                          <div key={game._id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                            <div className="flex items-center gap-4">
                              {getStatusIcon(game.status)}
                              <div>
                                <h4 className="font-semibold">
                                  {game.teamA.name} vs {game.teamB.name}
                                </h4>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  {getStatusBadge(game.status)}
                                  <span>Zeit: {formatTime(game.scheduledTime)}</span>
                                  {(game.status === 'live' || game.status === 'finished') && (
                                    <span className="font-medium">
                                      Stand: {game.scoreA} : {game.scoreB}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                onClick={() => router.push(`/scorer/${game._id}`)}
                                className="flex items-center gap-2"
                              >
                                <ClipboardCheck className="w-4 h-4" />
                                Scoring öffnen
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
