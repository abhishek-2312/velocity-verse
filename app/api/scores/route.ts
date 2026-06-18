// app/api/scores/route.ts
export const dynamic = 'force-dynamic'; // Tells Next.js to skip pre-rendering this at build time

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
// MUST be spelled exactly 'GET' and have 'export'
export async function GET(request: Request) {
  try {
    // 🛡️ Check where the request is coming from
    const originHost = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    // If there is an origin, ensure it matches your own domain host
    if (originHost && !originHost.includes(host || '')) {
      return NextResponse.json({ success: false, error: "Access Denied: External scraping blocked." }, { status: 403 });
    }

    // If someone tries to open the link directly in a blank tab, referer is usually empty
    if (!referer) {
      return NextResponse.json({ success: false, error: "Access Denied: Direct browser links blocked." }, { status: 403 });
    }

    await dbConnect();
    const scores = await Score.find({ endless: true }).sort({ score: -1 }).limit(5);
    return NextResponse.json({ success: true, data: scores });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}