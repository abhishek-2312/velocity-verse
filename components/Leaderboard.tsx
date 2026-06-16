// components/Leaderboard.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface ScoreEntry {
  _id: string;
  username: string;
  completionTime: number;
  shiftsUsed: number;
}

export default function Leaderboard({ levelId }: { levelId: string }) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`/api/scores/leaderboard?levelId=${levelId}`);
        const json = await res.json();
        if (json.success) setScores(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [levelId]);

  if (loading) return <div className="text-slate-500 text-xs animate-pulse">POLLING CURRENT STANDINGS SYSTEM MATRIX...</div>;

  return (
    <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 font-mono shadow-xl">
      <h3 className="text-xs font-bold tracking-widest text-pink-500 mb-3 uppercase">GLOBAL SIMULATION STANDINGS</h3>
      {scores.length === 0 ? (
        <div className="text-slate-600 text-xs text-center py-2">NO ATTEMPTS RECORDED IN DATABASE YET</div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {scores.map((score, index) => (
            <div key={score._id} className="flex justify-between items-center text-xs p-2 bg-slate-950 border border-slate-800 rounded">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">#{index + 1}</span>
                <span className="text-slate-300 font-bold">{score.username}</span>
              </div>
              <div className="flex gap-4 text-slate-400">
                <span>{score.shiftsUsed}S</span>
                <span className="font-bold text-emerald-400">{(score.completionTime / 1000).toFixed(2)}s</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}