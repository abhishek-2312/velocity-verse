import mongoose, { Schema, Document } from 'mongoose';

export interface IWall {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ILevel extends Document {
  levelId: string;
  name: string;
  playerStartX: number;
  playerStartY: number;
  playerSpeed: number;
  walls: IWall[];
  goal: { x: number; y: number; w: number; h: number };
}

const LevelSchema: Schema = new Schema({
  levelId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  playerStartX: { type: Number, default: 100 },
  playerStartY: { type: Number, default: 300 },
  playerSpeed: { type: Number, default: 4 },
  walls: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true }
  }],
  goal: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true }
  }
});

export default mongoose.models.Level || mongoose.model<ILevel>('Level', LevelSchema);