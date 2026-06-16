// app/api/scores/leaderboard/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Score from '../../../../models/Score';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get('levelId') || 'tutorial_1';

    const topScores = await Score.find({ levelId })
      .sort({ completionTime: 1 })
      .limit(10);

    return NextResponse.json({ success: true, data: topScores }, { status: 200 });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch standings' }, { status: 500 });
  }
}