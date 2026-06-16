import mongoose, { Schema, Document } from 'mongoose';

export interface IScore extends Document {
  username: string;
  levelId: string;
  completionTime: number; 
  shiftsUsed: number;
  createdAt: Date;
}

const ScoreSchema: Schema = new Schema({
  username: { type: String, required: true },
  levelId: { type: String, required: true },
  completionTime: { type: Number, required: true },
  shiftsUsed: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Score || mongoose.model<IScore>('Score', ScoreSchema);