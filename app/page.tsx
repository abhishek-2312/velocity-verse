// app/page.tsx
'use client';

import React, { useState } from 'react';
import GameCanvas from '@/components/GameCanvas';
import LeaderboardPanel from '@/components/LeaderboardPanel';

export default function Home() {
  const [pilotName, setPilotName] = useState('');
  const [isReady, setIsReady] = useState(false);

  // Handle Pilot Login Gate
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-mono p-4">
        <div className="w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-xl text-center shadow-2xl">
          <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2 uppercase">
            VELOCITY MATRIX
          </h1>
          <p className="text-[10px] text-slate-500 mb-6 tracking-wider uppercase">ENTER PILOT CALLSIGN TO CONNECT</p>
          
          <input
            type="text"
            placeholder="PILOT_ID"
            maxLength={12}
            value={pilotName}
            onChange={(e) => setPilotName(e.target.value.replace(/\s+/g, '_'))}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-center text-cyan-400 text-sm font-bold tracking-widest focus:outline-none focus:border-cyan-500 uppercase mb-4"
          />

          <button
            disabled={!pilotName.trim()}
            onClick={() => setIsReady(true)}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 text-xs font-bold py-2.5 rounded tracking-widest uppercase transition"
          >
            CONNECT LINK
          </button>
        </div>
      </div>
    );
  }

  // Side-by-Side Live Flexbox Layout Deck
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
      <div className="flex flex-col lg:flex-row items-start justify-center gap-6 w-full max-w-5xl">
        
        {/* Game Canvas Column */}
        <div className="flex-1">
          <GameCanvas username={pilotName.toUpperCase()} />
        </div>

        {/* Live Leaderboard Sidebar Column */}
        <div className="w-full lg:w-auto shrink-0 lg:mt-8">
          <LeaderboardPanel />
        </div>

      </div>
    </div>
  );
}