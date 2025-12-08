// Client-side TypeScript interfaces for Basketball Tournament

export interface ClientTournament {
  _id: string;
  name: string;
  category: string;
  published: boolean;
  teams: ClientTeam[];
  games: ClientGame[];
  createdAt: string;
}

export interface ClientTeam {
  _id: string;
  name: string;
  tournamentId: string;
  players: ClientPlayer[];
  createdAt: string;
}

export interface ClientPlayer {
  _id: string;
  name: string;
  teamId: ClientTeam | string;
  number?: number;
  createdAt: string;
}

export interface ClientPlayerStat {
  playerId: string;
  points1: number;
  points2: number;
  points3: number;
  total: number;
}

export interface ClientGame {
  _id: string;
  tournamentId: string;
  teamA: ClientTeam;
  teamB: ClientTeam;
  scoreA: number;
  scoreB: number;
  status: 'pending' | 'live' | 'finished';
  playerStats: ClientPlayerStat[];
  scheduledTime?: string;
  createdAt: string;
}

// Scorer Interface specific types
export interface ScorerAction {
  type: 'points' | 'undo';
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  points?: 1 | 2 | 3;
  timestamp: number;
}

export interface GameTimer {
  isRunning: boolean;
  timeElapsed: number; // in seconds
  startTime?: number;
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  totalScore: number;
  players: PlayerScoreData[];
}

export interface PlayerScoreData {
  playerId: string;
  playerName: string;
  number?: number;
  points1: number;
  points2: number;
  points3: number;
  total: number;
}

// Tournament public view types
export interface TeamRanking {
  team: ClientTeam;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  points: number; // Turnierpunkte (Sieg = 2, Unentschieden = 1, Niederlage = 0)
  scoreDiff: number;
  totalScored: number;
  totalConceded: number;
}

export interface PlayerStatistics {
  player: ClientPlayer;
  team: ClientTeam;
  gamesPlayed: number;
  totalPoints: number;
  points1Total: number;
  points2Total: number;
  points3Total: number;
  avgPointsPerGame: number;
}