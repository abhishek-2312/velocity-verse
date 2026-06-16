// app/api/scores/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Score from '../../../models/Score';

// MUST be spelled exactly 'POST' and have 'export'
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { username, score, endless } = body;

    if (endless) {
      const existingScore = await Score.findOne({ username, endless: true });
      if (existingScore) {
        if (score > existingScore.score) {
          existingScore.score = score;
          await existingScore.save();
        }
      } else {
        await Score.create({ username, score, endless: true });
      }
    }
    return NextResponse.json({ success: true, message: "Score synced." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// MUST be spelled exactly 'GET' and have 'export'
export async function GET() {
  try {
    await dbConnect();
    const scores = await Score.find({ endless: true }).sort({ score: -1 }).limit(5);
    return NextResponse.json({ success: true, data: scores });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}