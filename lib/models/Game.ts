import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayerStat {
  playerId: mongoose.Types.ObjectId;
  points1: number;
  points2: number;
  points3: number;
  total: number;
}

export interface IGame extends Document {
  tournamentId: mongoose.Types.ObjectId;
  teamA: mongoose.Types.ObjectId;
  teamB: mongoose.Types.ObjectId;
  scoreA: number;
  scoreB: number;
  status: 'pending' | 'live' | 'finished';
  playerStats: IPlayerStat[];
  scheduledTime?: Date;
  createdAt: Date;
}

const PlayerStatSchema = new Schema<IPlayerStat>({
  playerId: {
    type: Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  points1: {
    type: Number,
    default: 0,
  },
  points2: {
    type: Number,
    default: 0,
  },
  points3: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const GameSchema = new Schema<IGame>({
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
  },
  teamA: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  teamB: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  scoreA: {
    type: Number,
    default: 0,
  },
  scoreB: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'live', 'finished'],
    default: 'pending',
  },
  playerStats: [PlayerStatSchema],
  scheduledTime: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Game = mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);
export default Game;
