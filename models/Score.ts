// models/Score.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IScore extends Document {
  username: string;
  score?: number;
  endless?: boolean;
  levelId?: string;
  completionTime?: number;
  shiftsUsed?: number;
}

const ScoreSchema: Schema = new Schema({
  username: { type: String, required: true },
  score: { type: Number, default: 0 },         // New: Used for Endless Matrix Mode
  endless: { type: Boolean, default: false },   // New: Separates Endless from Campaign
  levelId: { type: String },                   // Campaign field
  completionTime: { type: Number },            // Campaign field
  shiftsUsed: { type: Number }                 // Campaign field
}, { timestamps: true });

// Prevents Mongoose from compiling duplicate models on hot-reloads
export default mongoose.models.Score || mongoose.model<IScore>('Score', ScoreSchema);