// models/Level.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IWall {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface IItemModifier {
  x: number;
  y: number;
  radius: number;
  type: 'shard' | 'boost' | 'autoshift';
}

export interface ILaserGrid {
  x: number;
  y: number;
  w: number;
  h: number;
  cycleTime: number;   // Total duration of a loop in milliseconds (e.g., 3000)
  onDuration: number;  // How long the laser stays active per cycle (e.g., 1500)
}

export interface ILevel extends Document {
  levelId: string;
  name: string;
  playerStartX: number;
  playerStartY: number;
  playerSpeed: number;
  initialCharges: number;
  walls: IWall[];
  items: IItemModifier[];
  lasers: ILaserGrid[];
  goal: { x: number; y: number; w: number; h: number };
}

const LevelSchema: Schema = new Schema({
  levelId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  playerStartX: { type: Number, default: 100 },
  playerStartY: { type: Number, default: 250 },
  playerSpeed: { type: Number, default: 4 },
  initialCharges: { type: Number, default: 3 },
  walls: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true }
  }],
  items: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    radius: { type: Number, default: 10 },
    type: { type: String, enum: ['shard', 'boost', 'autoshift'], required: true }
  }],
  lasers: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    cycleTime: { type: Number, default: 2000 },
    onDuration: { type: Number, default: 1000 }
  }],
  goal: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true }
  }
});

export default mongoose.models.Level || mongoose.model<ILevel>('Level', LevelSchema);