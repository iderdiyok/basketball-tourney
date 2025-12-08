'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, RotateCcw, Home } from 'lucide-react';
import { toast } from 'sonner';
import { 
  ClientGame, 
  ScorerAction, 
  GameTimer, 
  TeamStats, 
  PlayerScoreData 
} from '@/types/client';
import {
  apiRequest,
  showSuccessToast,
  showErrorToast,
  validateGameId,
  getErrorMessage,
  LoadingState,
  createLoadingState,
  setLoadingState,
  setErrorState,
  setSuccessState
} from '@/lib/utils/errorHandling';

// Import new components
import { Timer } from '@/components/scorer/Timer';
import { TeamScore } from '@/components/scorer/TeamScore';
import { PlayerRow } from '@/components/scorer/PlayerRow';
import { GameControls } from '@/components/scorer/GameControls';

export default function ScorerPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  // Game data
  const [game, setGame] = useState<ClientGame | null>(null);
  const [loadingState, setLoadingStateLocal] = useState<LoadingState>(createLoadingState(true));
  const [saving, setSaving] = useState(false);

  // Timer state
  const [timer, setTimer] = useState<GameTimer>({
    isRunning: false,
    timeElapsed: 0,
  });

  // Scoring state
  const [teamAStats, setTeamAStats] = useState<TeamStats | null>(null);
  const [teamBStats, setTeamBStats] = useState<TeamStats | null>(null);
  const [actionHistory, setActionHistory] = useState<ScorerAction[]>([]);

  useEffect(() => {
    if (!validateGameId(gameId)) {
      setLoadingStateLocal(setErrorState('Ungültige Spiel-ID'));
      return;
    }
    fetchGame();
  }, [gameId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer.isRunning && timer.startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const newTimeElapsed = Math.floor((now - (timer.startTime || 0)) / 1000);
        
        // 1. Halbzeit Ende (1 Minute = 60 Sekunden für Tests)
        if (newTimeElapsed >= 60 && timer.timeElapsed < 60) {
          setTimer({ isRunning: false, timeElapsed: 60 }); // Timer stoppen bei exakt 60
          showSuccessToast('1. Halbzeit beendet', 'Bitte 2. Halbzeit manuell starten!');
          if (interval) clearInterval(interval);
          return;
        }
        
        // 2. Halbzeit Ende (2 Minuten = 120 Sekunden für Tests)  
        if (newTimeElapsed >= 120) {
          setTimer({ isRunning: false, timeElapsed: 120 }); // Timer stoppen bei exakt 120
          updateGameStatus('finished');
          
          // Automatisches Speichern bei Spielende
          setTimeout(() => {
            saveGame();
          }, 500); // Kurze Verzögerung für UI Update
          
          showSuccessToast('Spiel beendet', 'Spielzeit abgelaufen (2x1 Minuten - TEST) - Wird automatisch gespeichert!');
          if (interval) clearInterval(interval);
          return;
        }
        
        // Normales Update nur wenn unter den Limits
        setTimer(prev => ({
          ...prev,
          timeElapsed: newTimeElapsed,
        }));
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, timer.startTime, timer.timeElapsed]);

  const fetchGame = async () => {
    try {
      setLoadingStateLocal(setLoadingState(true));
      
      const response = await apiRequest<{ game: ClientGame }>(`/api/games/${gameId}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Spiel konnte nicht geladen werden');
      }
      
      const gameData = response.data.game;
      
      if (!gameData.teamA || !gameData.teamB) {
        throw new Error('Spieldaten sind unvollständig');
      }
      
      setGame(gameData);
      initializeTeamStats(gameData);
      
      // Timer startet NICHT automatisch - nur über Start-Button
      // Status 'live' bedeutet nicht automatischer Timer-Start
      
      setLoadingStateLocal(setSuccessState());
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setLoadingStateLocal(setErrorState(errorMessage));
      showErrorToast('Fehler beim Laden', errorMessage);
      console.error('Game fetch error:', error);
    }
  };

  const initializeTeamStats = (gameData: ClientGame) => {
    console.log('Initializing team stats with game data:', gameData);
    
    // Initialize team A stats
    const teamAPlayers: PlayerScoreData[] = gameData.teamA.players.map(player => {
      console.log('Processing Team A player:', player);
      const existingStat = gameData.playerStats.find(stat => stat.playerId === player._id);
      const points1 = existingStat?.points1 || 0;
      const points2 = existingStat?.points2 || 0;
      const points3 = existingStat?.points3 || 0;
      return {
        playerId: player._id,
        playerName: player.name, // Verwende player.name direkt
        points1,
        points2,
        points3,
        total: points1 + 2 * points2 + 3 * points3, // Tatsächliche Punkte
      };
    });

    // Initialize team B stats
    const teamBPlayers: PlayerScoreData[] = gameData.teamB.players.map(player => {
      console.log('Processing Team B player:', player);
      const existingStat = gameData.playerStats.find(stat => stat.playerId === player._id);
      const points1 = existingStat?.points1 || 0;
      const points2 = existingStat?.points2 || 0;
      const points3 = existingStat?.points3 || 0;
      return {
        playerId: player._id,
        playerName: player.name, // Verwende player.name direkt
        points1,
        points2,
        points3,
        total: points1 + 2 * points2 + 3 * points3, // Tatsächliche Punkte
      };
    });

    console.log('Team A players:', teamAPlayers);
    console.log('Team B players:', teamBPlayers);

    setTeamAStats({
      teamId: gameData.teamA._id,
      teamName: gameData.teamA.name,
      totalScore: teamAPlayers.reduce((sum, p) => sum + p.total, 0),
      players: teamAPlayers,
    });

    setTeamBStats({
      teamId: gameData.teamB._id,
      teamName: gameData.teamB.name,
      totalScore: teamBPlayers.reduce((sum, p) => sum + p.total, 0),
      players: teamBPlayers,
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setTimer(prev => {
      const currentElapsed = prev.timeElapsed || 0;
      
      // Debug-Ausgabe
      console.log(`startTimer aufgerufen - Aktuelle Zeit: ${currentElapsed}s, Halbzeit: ${currentElapsed < 60 ? '1' : '2'}`);
      
      return {
        ...prev,
        isRunning: true,
        startTime: Date.now() - (currentElapsed * 1000), // Berücksichtige bereits verstrichene Zeit
      };
    });
    
    // Update game status to live NUR beim ersten Start
    if (game && game.status === 'pending') {
      updateGameStatus('live');
    }
  };

  const pauseTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      startTime: undefined,
    }));
  };

  const resetTimer = () => {
    setTimer({
      isRunning: false,
      timeElapsed: 0,
    });
  };

  const addPoints = (playerId: string, points: 1 | 2 | 3) => {
    try {
      console.log('=== addPoints DEBUG START ===');
      console.log('Player ID:', playerId);
      console.log('Points:', points);
      
      if (!game || !teamAStats || !teamBStats) {
        showErrorToast('Fehler', 'Spielerdaten nicht verfügbar');
        return;
      }

      if (game.status === 'finished') {
        showErrorToast('Spiel beendet', 'Punkte können nicht mehr hinzugefügt werden');
        return;
      }
      
      // Prüfen ob Spielzeit abgelaufen ist (2 Minuten = 120 Sekunden für Tests)
      if (timer.timeElapsed >= 120) {
        showErrorToast('Spielzeit abgelaufen', 'Das Spiel ist bereits beendet (2x1 Minuten - TEST)');
        return;
      }

      // Exakte Spieler-Suche - nur EINE Übereinstimmung erlaubt
      const teamAPlayer = teamAStats.players.find(p => p.playerId === playerId);
      const teamBPlayer = teamBStats.players.find(p => p.playerId === playerId);
      
      console.log('Team A Player found:', teamAPlayer);
      console.log('Team B Player found:', teamBPlayer);
      
      // Stelle sicher, dass Spieler nur in einem Team ist
      if (teamAPlayer && teamBPlayer) {
        showErrorToast('Fehler', 'Spieler ist in beiden Teams - Daten-Inkonsistenz');
        return;
      }
      
      if (!teamAPlayer && !teamBPlayer) {
        showErrorToast('Fehler', 'Spieler nicht gefunden');
        return;
      }
      
      const isTeamA = !!teamAPlayer;
      const targetTeam = isTeamA ? teamAStats : teamBStats;
      const setTargetTeam = isTeamA ? setTeamAStats : setTeamBStats;
      const player = isTeamA ? teamAPlayer : teamBPlayer;
      
      console.log('Target Team:', targetTeam.teamName);
      console.log('Player:', player!.playerName);

      // Create action for history
      const action: ScorerAction = {
        type: 'points',
        playerId,
        playerName: player!.playerName,
        teamId: targetTeam.teamId,
        teamName: targetTeam.teamName,
        points,
        timestamp: Date.now(),
      };

      // Update player stats - nur für den EINEN Spieler
      const updatedPlayers = targetTeam.players.map(p => {
        if (p.playerId === playerId) {
          const newStats = { ...p };
          if (points === 1) newStats.points1++;
          if (points === 2) newStats.points2++;
          if (points === 3) newStats.points3++;
          // Tatsächliche Punkte berechnen: 1*points1 + 2*points2 + 3*points3
          newStats.total = newStats.points1 + 2 * newStats.points2 + 3 * newStats.points3;
          return newStats;
        }
        return p;
      });

      const updatedTeamStats = {
        ...targetTeam,
        players: updatedPlayers,
        totalScore: updatedPlayers.reduce((sum, p) => sum + p.total, 0),
      };

      setTargetTeam(updatedTeamStats);
      setActionHistory(prev => [...prev, action]);

      showSuccessToast(`${points} Punkt${points > 1 ? 'e' : ''} für ${player!.playerName} (${targetTeam.teamName})`);
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showErrorToast('Fehler beim Hinzufügen der Punkte', errorMessage);
      console.error('Add points error:', error);
    }
  };

  const undoLastAction = () => {
    if (actionHistory.length === 0) return;

    const lastAction = actionHistory[actionHistory.length - 1];
    
    if (lastAction.type === 'points' && lastAction.points) {
      // Find the team and player
      const isTeamA = teamAStats?.teamId === lastAction.teamId;
      const targetTeam = isTeamA ? teamAStats : teamBStats;
      const setTargetTeam = isTeamA ? setTeamAStats : setTeamBStats;
      
      if (!targetTeam) return;

      // Reverse the points
      const updatedPlayers = targetTeam.players.map(p => {
        if (p.playerId === lastAction.playerId) {
          const newStats = { ...p };
          if (lastAction.points === 1) newStats.points1--;
          if (lastAction.points === 2) newStats.points2--;
          if (lastAction.points === 3) newStats.points3--;
          // Tatsächliche Punkte berechnen: 1*points1 + 2*points2 + 3*points3
          newStats.total = newStats.points1 + 2 * newStats.points2 + 3 * newStats.points3;
          return newStats;
        }
        return p;
      });

      const updatedTeamStats = {
        ...targetTeam,
        players: updatedPlayers,
        totalScore: updatedPlayers.reduce((sum, p) => sum + p.total, 0),
      };

      setTargetTeam(updatedTeamStats);
      setActionHistory(prev => prev.slice(0, -1));

      toast.info(`Rückgängig: ${lastAction.points} Punkt${lastAction.points > 1 ? 'e' : ''} von ${lastAction.playerName}`);
    }
  };

  const updateGameStatus = async (status: 'pending' | 'live' | 'finished') => {
    if (!game) return;

    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Fehler beim Aktualisieren');
      
      setGame(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Spielstatus');
    }
  };

  const saveGame = async () => {
    if (!game || !teamAStats || !teamBStats) {
      showErrorToast('Fehler', 'Spielerdaten nicht vollständig');
      return;
    }

    try {
      setSaving(true);

      // Prepare player stats for API
      const playerStats = [
        ...teamAStats.players.map(p => ({
          playerId: p.playerId,
          points1: p.points1,
          points2: p.points2,
          points3: p.points3,
          total: p.total,
        })),
        ...teamBStats.players.map(p => ({
          playerId: p.playerId,
          points1: p.points1,
          points2: p.points2,
          points3: p.points3,
          total: p.total,
        })),
      ];

      const updateData = {
        scoreA: teamAStats.totalScore,
        scoreB: teamBStats.totalScore,
        playerStats,
        status: 'finished' as const,
      };

      const response = await apiRequest<{ game: ClientGame }>(`/api/games/${gameId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      if (!response.success) {
        throw new Error(response.error || 'Fehler beim Speichern');
      }

      showSuccessToast('Spiel erfolgreich gespeichert!', 
        `Endstand: ${teamAStats.teamName} ${teamAStats.totalScore} : ${teamBStats.totalScore} ${teamBStats.teamName}`);
      
      // Update local game state
      setGame(prev => prev ? { 
        ...prev, 
        scoreA: teamAStats.totalScore,
        scoreB: teamBStats.totalScore,
        status: 'finished',
        playerStats: playerStats,
      } : null);

      // Stop timer
      pauseTimer();

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showErrorToast('Fehler beim Speichern des Spiels', errorMessage);
      console.error('Save game error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loadingState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Spiel wird geladen...</p>
        </div>
      </div>
    );
  }

  if (loadingState.hasError || !game || !teamAStats || !teamBStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              {loadingState.hasError ? 'Fehler beim Laden' : 'Spiel nicht gefunden'}
            </CardTitle>
            <CardDescription className="text-center">
              {loadingState.error || 'Das angeforderte Spiel konnte nicht geladen werden.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button onClick={fetchGame} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Erneut versuchen
            </Button>
            <Button onClick={() => router.push('/admin')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Zurück zum Admin
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
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                <div>
                  <CardTitle className="text-lg sm:text-2xl">
                    {teamAStats.teamName} vs {teamBStats.teamName}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Kampfgericht - Live Scoring
                  </CardDescription>
                </div>
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
          onGoHome={() => router.push('/admin')}
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
                    disabled={game.status === 'finished' || timer.timeElapsed >= 120 || (timer.timeElapsed >= 60 && !timer.isRunning)}
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
                    disabled={game.status === 'finished' || timer.timeElapsed >= 120 || (timer.timeElapsed >= 60 && !timer.isRunning)}
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