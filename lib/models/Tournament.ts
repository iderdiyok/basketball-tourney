import mongoose, { Document, Schema } from 'mongoose';

export interface ITournament extends Document {
  name: string;
  category: string;
  published: boolean;
  usePlayerNumbers?: boolean;
  teams: mongoose.Types.ObjectId[];
  games: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const TournamentSchema = new Schema<ITournament>({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  published: {
    type: Boolean,
    default: false,
  },
  teams: [{
    type: Schema.Types.ObjectId,
    ref: 'Team',
  }],
  games: [{
    type: Schema.Types.ObjectId,
    ref: 'Game',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Tournament = mongoose.models.Tournament || mongoose.model<ITournament>('Tournament', TournamentSchema);
export default Tournament;
