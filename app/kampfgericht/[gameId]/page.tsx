'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Home, Save, RotateCcw, Trophy } from 'lucide-react';
import { 
  ClientGame, 
  ScorerAction, 
  GameTimer, 
  TeamStats, 
  PlayerScoreData 
} from '@/types/client';

// Import new components
import { Timer } from '@/components/scorer/Timer';
import { TeamScore } from '@/components/scorer/TeamScore';
import { PlayerRow } from '@/components/scorer/PlayerRow';
import { GameControls } from '@/components/scorer/GameControls';

export default function KampfgerichtPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<ClientGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timer, setTimer] = useState<GameTimer>({ isRunning: false, timeElapsed: 0 });
  const [teamAStats, setTeamAStats] = useState<TeamStats>({ teamId: '', teamName: '', totalScore: 0, players: [] });
  const [teamBStats, setTeamBStats] = useState<TeamStats>({ teamId: '', teamName: '', totalScore: 0, players: [] });
  const [actionHistory, setActionHistory] = useState<ScorerAction[]>([]);

  useEffect(() => {
    if (!gameId) return;
    fetchGame();
  }, [gameId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimer(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isRunning]);

  const fetchGame = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/games/${gameId}`);
      const data = await res.json();
      
      if (res.ok) {
        setGame(data.game);
        initializeStats(data.game);
      } else {
        console.error('Failed to fetch game:', data.error);
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error fetching game:', error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const initializeStats = (game: ClientGame) => {
    const teamAPlayers: PlayerScoreData[] = game.teamA.players.map((player) => {
      const stats = game.playerStats?.find(s => s.playerId === player._id) || {
        playerId: player._id,
        points1: 0,
        points2: 0,
        points3: 0,
        total: 0
      };
      return {
        playerId: player._id,
        playerName: player.name,
        number: player.number,
        points1: stats.points1,
        points2: stats.points2,
        points3: stats.points3,
        total: stats.total
      };
    });

    const teamBPlayers: PlayerScoreData[] = game.teamB.players.map((player) => {
      const stats = game.playerStats?.find(s => s.playerId === player._id) || {
        playerId: player._id,
        points1: 0,
        points2: 0,
        points3: 0,
        total: 0
      };
      return {
        playerId: player._id,
        playerName: player.name,
        number: player.number,
        points1: stats.points1,
        points2: stats.points2,
        points3: stats.points3,
        total: stats.total
      };
    });

    setTeamAStats({
      teamId: game.teamA._id,
      teamName: game.teamA.name,
      totalScore: teamAPlayers.reduce((sum, p) => sum + p.total, 0),
      players: teamAPlayers
    });

    setTeamBStats({
      teamId: game.teamB._id,
      teamName: game.teamB.name,
      totalScore: teamBPlayers.reduce((sum, p) => sum + p.total, 0),
      players: teamBPlayers
    });

    // Set timer if game is already started
    if (game.status === 'live') {
      setTimer({ isRunning: false, timeElapsed: 0 });
    }
  };

  const startTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: true }));
    if (game && game.status === 'pending') {
      updateGameStatus('live');
    }
  };

  const pauseTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setTimer({ isRunning: false, timeElapsed: 0 });
  };

  const updateGameStatus = async (status: 'pending' | 'live' | 'finished') => {
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, timeElapsed: timer.timeElapsed })
      });

      if (res.ok) {
        setGame(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Error updating game status:', error);
    }
  };

  const addPoints = (playerId: string, points: 1 | 2 | 3) => {
    if (!game || game.status === 'finished') return;

    const action: ScorerAction = {
      type: 'points',
      playerId,
      points,
      timestamp: Date.now(),
      playerName: '',
      teamId: '',
      teamName: ''
    };

    // Update team A
    const teamAPlayer = teamAStats.players.find(p => p.playerId === playerId);
    if (teamAPlayer) {
      action.playerName = teamAPlayer.playerName;
      action.teamId = teamAStats.teamId;
      action.teamName = teamAStats.teamName;
      
      const updatedTeamA = {
        ...teamAStats,
        players: teamAStats.players.map(p => 
          p.playerId === playerId 
            ? {
                ...p,
                [`points${points}`]: p[`points${points}` as keyof PlayerScoreData] as number + 1,
                total: p.total + points
              }
            : p
        )
      };
      updatedTeamA.totalScore = updatedTeamA.players.reduce((sum, p) => sum + p.total, 0);
      setTeamAStats(updatedTeamA);
    }

    // Update team B
    const teamBPlayer = teamBStats.players.find(p => p.playerId === playerId);
    if (teamBPlayer) {
      action.playerName = teamBPlayer.playerName;
      action.teamId = teamBStats.teamId;
      action.teamName = teamBStats.teamName;
      
      const updatedTeamB = {
        ...teamBStats,
        players: teamBStats.players.map(p => 
          p.playerId === playerId 
            ? {
                ...p,
                [`points${points}`]: p[`points${points}` as keyof PlayerScoreData] as number + 1,
                total: p.total + points
              }
            : p
        )
      };
      updatedTeamB.totalScore = updatedTeamB.players.reduce((sum, p) => sum + p.total, 0);
      setTeamBStats(updatedTeamB);
    }

    setActionHistory(prev => [...prev, action]);
  };

  const undoLastAction = () => {
    if (actionHistory.length === 0) return;

    const lastAction = actionHistory[actionHistory.length - 1];
    if (!lastAction.points) return;
    
    // Revert team A
    const teamAPlayer = teamAStats.players.find(p => p.playerId === lastAction.playerId);
    if (teamAPlayer) {
      const updatedTeamA = {
        ...teamAStats,
        players: teamAStats.players.map(p => 
          p.playerId === lastAction.playerId 
            ? {
                ...p,
                [`points${lastAction.points}`]: Math.max(0, (p[`points${lastAction.points}` as keyof PlayerScoreData] as number) - 1),
                total: Math.max(0, p.total - lastAction.points!)
              }
            : p
        )
      };
      updatedTeamA.totalScore = updatedTeamA.players.reduce((sum, p) => sum + p.total, 0);
      setTeamAStats(updatedTeamA);
    }

    // Revert team B
    const teamBPlayer = teamBStats.players.find(p => p.playerId === lastAction.playerId);
    if (teamBPlayer) {
      const updatedTeamB = {
        ...teamBStats,
        players: teamBStats.players.map(p => 
          p.playerId === lastAction.playerId 
            ? {
                ...p,
                [`points${lastAction.points}`]: Math.max(0, (p[`points${lastAction.points}` as keyof PlayerScoreData] as number) - 1),
                total: Math.max(0, p.total - lastAction.points!)
              }
            : p
        )
      };
      updatedTeamB.totalScore = updatedTeamB.players.reduce((sum, p) => sum + p.total, 0);
      setTeamBStats(updatedTeamB);
    }

    setActionHistory(prev => prev.slice(0, -1));
  };

  const saveGame = async () => {
    if (!game) return;

    setSaving(true);
    try {
      const playerStats = [
        ...teamAStats.players.map(p => ({
          playerId: p.playerId,
          points1: p.points1,
          points2: p.points2,
          points3: p.points3,
          total: p.total
        })),
        ...teamBStats.players.map(p => ({
          playerId: p.playerId,
          points1: p.points1,
          points2: p.points2,
          points3: p.points3,
          total: p.total
        }))
      ];

      const res = await fetch(`/api/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'finished',
          scoreA: teamAStats.totalScore,
          scoreB: teamBStats.totalScore,
          timeElapsed: timer.timeElapsed,
          playerStats
        })
      });

      if (res.ok) {
        alert('Spiel erfolgreich gespeichert!');
        setGame(prev => prev ? { ...prev, status: 'finished' } : null);
        pauseTimer();
      } else {
        alert('Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Spiel wird geladen...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Spiel nicht gefunden</CardTitle>
            <CardDescription className="text-center">
              Das angeforderte Spiel konnte nicht geladen werden.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/admin')}>
              <Home className="w-4 h-4 mr-2" />
              Zum Admin-Bereich
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                <div>
                  <CardTitle className="text-lg sm:text-2xl">
                    🏀 Kampfgericht - Live Scoring
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {teamAStats.teamName} vs {teamBStats.teamName}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={
                  game.status === 'pending' ? 'secondary' :
                  game.status === 'live' ? 'default' : 'outline'
                }>
                  {game.status === 'pending' && 'Bereit'}
                  {game.status === 'live' && '🔴 Live'}
                  {game.status === 'finished' && '✅ Beendet'}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
                  <Home className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Score & Timer Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Team A Score */}
          <TeamScore 
            teamName={teamAStats.teamName}
            score={teamAStats.totalScore}
            color="blue"
            isWinning={teamAStats.totalScore > teamBStats.totalScore}
          />

          {/* Timer */}
          <Timer
            isRunning={timer.isRunning}
            timeElapsed={timer.timeElapsed}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
            disabled={game.status === 'finished'}
          />

          {/* Team B Score */}
          <TeamScore 
            teamName={teamBStats.teamName}
            score={teamBStats.totalScore}
            color="red"
            isWinning={teamBStats.totalScore > teamAStats.totalScore}
          />
        </div>

        {/* Game Controls */}
        <GameControls
          gameStatus={game.status}
          onUndo={undoLastAction}
          onSave={saveGame}
          canUndo={actionHistory.length > 0}
          isSaving={saving}
          lastAction={actionHistory.length > 0 ? actionHistory[actionHistory.length - 1].playerName : undefined}
        />

        {/* Player Scoring */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mt-6">
          {/* Team A Players */}
          <Card>
            <CardHeader className="bg-blue-600 text-white py-3">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Users className="w-5 h-5" />
                {teamAStats.teamName} - Spieler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {teamAStats.players.map((player) => (
                  <PlayerRow
                    key={player.playerId}
                    player={player}
                    onAddPoints={addPoints}
                    disabled={game.status === 'finished'}
                    teamColor="blue"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team B Players */}
          <Card>
            <CardHeader className="bg-red-600 text-white py-3">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Users className="w-5 h-5" />
                {teamBStats.teamName} - Spieler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {teamBStats.players.map((player) => (
                  <PlayerRow
                    key={player.playerId}
                    player={player}
                    onAddPoints={addPoints}
                    disabled={game.status === 'finished'}
                    teamColor="red"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}