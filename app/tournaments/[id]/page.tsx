'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Calendar, 
  TrendingUp,
  Medal,
  Target,
  Zap,
  Home
} from 'lucide-react';
import { 
  ClientTournament, 
  ClientGame, 
  TeamRanking, 
  PlayerStatistics 
} from '@/types/client';

// Import new components
import { TopScorer } from '@/components/tournament/TopScorer';
import { OnePointKing } from '@/components/tournament/OnePointKing';
import { ThreePointKing } from '@/components/tournament/ThreePointKing';
import { GameSchedule } from '@/components/tournament/GameSchedule';

export default function TournamentPublicPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<ClientTournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed data
  const [rankings, setRankings] = useState<TeamRanking[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStatistics[]>([]);

  useEffect(() => {
    fetchTournament();
  }, [tournamentId]);

  useEffect(() => {
    if (tournament) {
      calculateRankings();
      calculatePlayerStatistics();
    }
  }, [tournament]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/tournaments/${tournamentId}`);
      
      if (!res.ok) {
        throw new Error('Turnier nicht gefunden');
      }
      
      const data = await res.json();
      setTournament(data.tournament);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Laden');
      console.error('Error fetching tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRankings = () => {
    if (!tournament) return;

    const teamRankings: TeamRanking[] = tournament.teams.map(team => {
      const teamGames = tournament.games.filter(game => 
        (game.teamA._id === team._id || game.teamB._id === team._id) && 
        game.status === 'finished'
      );

      let won = 0;
      let lost = 0;
      let drawn = 0;
      let totalScored = 0;
      let totalConceded = 0;

      // Helper function for tournament points calculation
      const getTournamentPoints = (ownScore: number, opponentScore: number) => 
        ownScore > opponentScore ? 2 : ownScore < opponentScore ? 0 : 1;

      teamGames.forEach(game => {
        const isTeamA = game.teamA._id === team._id;
        const ownScore = isTeamA ? game.scoreA : game.scoreB;
        const opponentScore = isTeamA ? game.scoreB : game.scoreA;

        totalScored += ownScore;
        totalConceded += opponentScore;

        if (ownScore > opponentScore) {
          won++;
        } else if (ownScore < opponentScore) {
          lost++;
        } else {
          drawn++;
        }
      });

      // Tournament points: Win = 2, Draw = 1, Loss = 0
      const points = won * 2 + drawn * 1 + lost * 0;
      const scoreDiff = totalScored - totalConceded;

      return {
        team,
        played: teamGames.length,
        won,
        lost,
        drawn,
        points,
        scoreDiff,
        totalScored,
        totalConceded,
      };
    });

    // Sort by points, then by score difference, then by total scored
    teamRankings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.scoreDiff !== a.scoreDiff) return b.scoreDiff - a.scoreDiff;
      return b.totalScored - a.totalScored;
    });

    setRankings(teamRankings);
  };

  const calculatePlayerStatistics = () => {
    if (!tournament) return;

    const playerStatsMap = new Map<string, {
      player: any;
      team: any;
      gamesPlayed: number;
      totalPoints: number;
      points1Total: number;
      points2Total: number;
      points3Total: number;
    }>();

    // Initialize all players
    tournament.teams.forEach(team => {
      team.players.forEach(player => {
        const playerId = String(player._id);
        playerStatsMap.set(playerId, {
          player,
          team,
          gamesPlayed: 0,
          totalPoints: 0,
          points1Total: 0,
          points2Total: 0,
          points3Total: 0,
        });
      });
    });

    // Aggregate stats from finished games
    const finishedGames = tournament.games.filter(game => game.status === 'finished');

    finishedGames.forEach(game => {
      if (game.playerStats && game.playerStats.length > 0) {
        game.playerStats.forEach(stat => {
          // Handle both populated and non-populated playerId
          let playerId;
          if (typeof stat.playerId === 'string') {
            playerId = stat.playerId;
          } else if (stat.playerId && typeof stat.playerId === 'object') {
            playerId = String((stat.playerId as any)._id || stat.playerId);
          } else {
            playerId = String(stat.playerId);
          }
          
          const existing = playerStatsMap.get(playerId);
          if (existing) {
            existing.gamesPlayed++;
            existing.totalPoints += stat.total;
            existing.points1Total += stat.points1;
            existing.points2Total += stat.points2;
            existing.points3Total += stat.points3;
          }
        });
      }
    });

    // Convert to array and calculate averages
    const playerStats: PlayerStatistics[] = Array.from(playerStatsMap.values()).map(stats => ({
      player: stats.player,
      team: stats.team,
      gamesPlayed: stats.gamesPlayed,
      totalPoints: stats.totalPoints,
      points1Total: stats.points1Total,
      points2Total: stats.points2Total,
      points3Total: stats.points3Total,
      avgPointsPerGame: stats.gamesPlayed > 0 ? stats.totalPoints / stats.gamesPlayed : 0,
    }));

    setPlayerStats(playerStats);
  };

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

  const getTopScorers = (limit: number = 5): PlayerStatistics[] => {
    return [...playerStats]
      .filter(p => p.gamesPlayed > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);
  };

  const getSpecialistKings = (type: 'points1Total' | 'points3Total', limit: number = 3): PlayerStatistics[] => {
    return [...playerStats]
      .filter(p => p.gamesPlayed > 0 && p[type] > 0)
      .sort((a, b) => b[type] - a[type])
      .slice(0, limit);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Turnier wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Turnier nicht gefunden</CardTitle>
            <CardDescription className="text-center">
              {error || 'Das angeforderte Turnier konnte nicht geladen werden.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button>
                <Home className="w-4 h-4 mr-2" />
                Zur Startseite
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{tournament.name}</h1>
                <p className="text-sm sm:text-base text-gray-600">Kategorie: {tournament.category}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href={`/tournaments/${tournamentId}/plan`}>
                <Button variant="default" size="sm" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Öffentlicher Spielplan
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Startseite
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <Tabs defaultValue="rankings" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 min-w-[300px]">
              <TabsTrigger value="rankings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Tabelle</span>
                <span className="sm:hidden">Tab.</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Spielplan</span>
                <span className="sm:hidden">Plan</span>
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Statistiken</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Rankings Tab */}
          <TabsContent value="rankings" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  Tabelle
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Turnierpunkte: Sieg = 2 Punkte, Unentschieden = 1 Punkt, Niederlage = 0 Punkte
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-xs sm:text-sm">Platz</TableHead>
                        <TableHead className="min-w-[120px] text-xs sm:text-sm">Team</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">Sp.</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">S</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">U</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">N</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">Pkt.</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">+/-</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">Körbe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankings.map((ranking, index) => (
                        <TableRow key={ranking.team._id}>
                          <TableCell className="text-center font-medium text-xs sm:text-sm py-2 sm:py-3">
                            {index + 1}
                            {index === 0 && <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 ml-1 inline" />}
                          </TableCell>
                          <TableCell className="font-semibold text-xs sm:text-sm py-2 sm:py-3">{ranking.team.name}</TableCell>
                          <TableCell className="text-center text-xs sm:text-sm py-2 sm:py-3">{ranking.played}</TableCell>
                          <TableCell className="text-center text-xs sm:text-sm py-2 sm:py-3">{ranking.won}</TableCell>
                          <TableCell className="text-center text-xs sm:text-sm py-2 sm:py-3">{ranking.drawn}</TableCell>
                          <TableCell className="text-center text-xs sm:text-sm py-2 sm:py-3">{ranking.lost}</TableCell>
                          <TableCell className="text-center font-bold text-xs sm:text-sm py-2 sm:py-3">{ranking.points}</TableCell>
                          <TableCell className={`text-center text-xs sm:text-sm py-2 sm:py-3 ${
                            ranking.scoreDiff >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {ranking.scoreDiff >= 0 ? '+' : ''}{ranking.scoreDiff}
                          </TableCell>
                          <TableCell className="text-center text-xs sm:text-sm py-2 sm:py-3 whitespace-nowrap">
                            {ranking.totalScored}:{ranking.totalConceded}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4 sm:space-y-6">
            <GameSchedule games={tournament.games} />
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              <TopScorer players={playerStats} />
              <OnePointKing players={playerStats} />
              <ThreePointKing players={playerStats} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}