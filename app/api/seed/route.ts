// app/api/seed/route.ts
export const dynamic = 'force-dynamic'; // Add this to unblock Vercel compilation!

import { NextResponse } from "next/server";
// ... the rest of your existing import and seed code continues below ...
// app/api/seed/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Level from '../../../models/Level';

export async function GET() {
  try {
    await dbConnect();
    await Level.deleteMany({});

    const seededLevels = await Level.insertMany([
      {
        levelId: "tutorial_1",
        name: "Sector Zero: Kinetic Management",
        playerStartX: 100,
        playerStartY: 250,
        playerSpeed: 4,
        initialCharges: 2, // Tight baseline requirement
        walls: [
          { x: 0, y: 0, w: 2000, h: 40 },
          { x: 0, y: 460, w: 2000, h: 40 },
          { x: 0, y: 0, w: 40, h: 500 },
          { x: 500, y: 40, w: 60, h: 260 },
          { x: 950, y: 200, w: 60, h: 260 },
          { x: 1700, y: 0, w: 40, h: 500 }
        ],
        items: [
          { x: 350, y: 250, radius: 10, type: 'shard' },     // Gives +2 charges
          { x: 700, y: 120, radius: 10, type: 'shard' },     // Pick up in mid-shaft descent
          { x: 1150, y: 380, radius: 12, type: 'boost' }      // Triggers hyper-velocity multiplier
        ],
        lasers: [
          { x: 1350, y: 40, w: 20, h: 420, cycleTime: 2400, onDuration: 1200 } // Phasing grid gate
        ],
        goal: { x: 1550, y: 180, w: 80, h: 100 }
      },
      {
        levelId: "tutorial_2",
        name: "Sector One: Automated Vectors",
        playerStartX: 100,
        playerStartY: 100,
        playerSpeed: 4.5,
        initialCharges: 1, // Must rely heavily on environmental paths
        walls: [
          { x: 0, y: 0, w: 2200, h: 40 },
          { x: 0, y: 460, w: 2200, h: 40 },
          { x: 0, y: 0, w: 40, h: 500 },
          { x: 400, y: 40, w: 400, h: 120 },
          { x: 400, y: 320, w: 400, h: 140 },
          { x: 1000, y: 120, w: 80, h: 340 },
          { x: 1450, y: 40, w: 80, h: 340 },
          { x: 1950, y: 0, w: 40, h: 500 }
        ],
        items: [
          { x: 250, y: 100, radius: 10, type: 'autoshift' }, // Instantly forces a 90° pivot down!
          { x: 600, y: 240, radius: 10, type: 'shard' },
          { x: 1200, y: 240, radius: 10, type: 'autoshift' } // Forces pivot out of vertical descent path
        ],
        lasers: [
          { x: 1150, y: 40, w: 250, h: 20, cycleTime: 3000, onDuration: 1500 }, // Intermittent beam path
          { x: 1650, y: 200, w: 20, h: 260, cycleTime: 2000, onDuration: 1000 }
        ],
        goal: { x: 1750, y: 320, w: 80, h: 100 }
      }
    ]);

    return NextResponse.json({ success: true, message: "Database upgraded and seeded successfully!" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}