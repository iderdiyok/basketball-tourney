import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  tournamentId: mongoose.Types.ObjectId;
  players: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const TeamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: true,
  },
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
  },
  players: [{
    type: Schema.Types.ObjectId,
    ref: 'Player',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Team = mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);
export default Team;
