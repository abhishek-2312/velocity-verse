export const dynamic = 'force-dynamic'; // to kill the Next.js cache completely

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Level from '../../../../models/Level';

// ... rest of your existing GET function remains exactly the same

export async function GET(
  request: Request,
  { params }: { params: Promise<{ levelId: string }> } // Type adjusted for Next.js 16+
) {
  try {
    await dbConnect();
    
    // Crucial Next.js 16 Fix: We MUST await params before extracting levelId
    const { levelId } = await params;

    const level = await Level.findOne({ levelId });
    
    if (!level) {
      return NextResponse.json({ 
        success: false, 
        error: `Sector profile '${levelId}' not found in database records.` 
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: level }, { status: 200 });
  } catch (error: any) {
    console.error('Level fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}