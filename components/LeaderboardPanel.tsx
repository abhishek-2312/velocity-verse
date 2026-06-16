// components/LeaderboardPanel.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface ScoreEntry {
  username: string;
  score?: number;
  completionTime?: number;
}

export default function LeaderboardPanel() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch('/api/scores?endless=true');
        const json = await res.json();
        if (json.success) setScores(json.data);
      } catch (err) {
        console.error('Failed to parse leaderboard array:', err);
      }
    }
    fetchScores();
    const interval = setInterval(fetchScores, 10000); // Poll database every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-64 bg-slate-900/80 border border-slate-800 p-4 rounded-xl font-mono text-xs shadow-xl backdrop-blur-md">
      <h3 className="text-cyan-400 font-black tracking-widest text-center mb-4 uppercase">TOP MATRIX RUNS</h3>
      <div className="flex flex-col gap-2">
        {scores.length === 0 ? (
          <div className="text-slate-600 text-center uppercase py-4">NO SIGNAL CAPTURED</div>
        ) : (
          scores.map((entry, index) => (
            <div 
              key={index} 
              className={`flex justify-between items-center p-2 rounded ${
                index === 0 ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400' :
                index === 1 ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300' :
                index === 2 ? 'bg-pink-500/10 border border-pink-500/30 text-pink-400' : 'bg-slate-950/40 text-slate-400'
              }`}
            >
              <div className="flex gap-2 items-center">
                <span className="font-bold opacity-60">#{index + 1}</span>
                <span className="font-semibold tracking-tight max-w-[100px] truncate">{entry.username}</span>
              </div>
              <span className="font-bold tracking-wider">{entry.score || 0}m</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}