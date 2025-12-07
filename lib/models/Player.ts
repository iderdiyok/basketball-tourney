import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer extends Document {
  name: string;
  teamId: mongoose.Types.ObjectId;
  number?: number;
  createdAt: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  name: {
    type: String,
    required: true,
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  number: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Player = mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);
export default Player;
