// components/GameCanvas.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  lane: number;
  nearMissChecked: boolean;
}

interface PowerUp {
  x: number;
  y: number;
  radius: number;
  type: 'shield';
  collected: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  alpha: number;
  color: string;
}

interface GameCanvasProps {
  username: string;
}

export default function GameCanvas({ username }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [hasShield, setHasShield] = useState(false);

  // Sync high score view from database or local backup on mount
  const refreshLocalHighScoreDisplay = () => {
    fetch('/api/scores')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data && json.data.length > 0) {
          const userRecord = json.data.find((s: any) => s.username === username);
          if (userRecord) {
            setHighScore(userRecord.score);
            localStorage.setItem(`vv_high_${username}`, userRecord.score.toString());
            return;
          }
        }
        const savedHighScore = localStorage.getItem(`vv_high_${username}`) || '0';
        setHighScore(parseInt(savedHighScore, 10));
      })
      .catch(() => {
        const savedHighScore = localStorage.getItem(`vv_high_${username}`) || '0';
        setHighScore(parseInt(savedHighScore, 10));
      });
  };

  useEffect(() => {
    refreshLocalHighScoreDisplay();
  }, [username, gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let currentScore = 0;
    let baseSpeed = 5.5;
    let speedMultiplier = 1;

    const lanes = [130, 250, 370];
    let currentLaneIndex = 1;
    let playerVisualY = lanes[currentLaneIndex];

    let obstacles: Obstacle[] = [];
    let powerups: PowerUp[] = [];
    let particles: Particle[] = [];
    let floatingTexts: FloatText[] = [];
    
    let nextObstacleTimer = 0;
    let nextPowerupTimer = 600;
    let localShieldActive = false;

    const resetGameplayEngine = () => {
      currentScore = 0;
      baseSpeed = 5.5;
      speedMultiplier = 1;
      currentLaneIndex = 1;
      playerVisualY = lanes[currentLaneIndex];
      obstacles = [];
      powerups = [];
      particles = [];
      floatingTexts = [];
      nextObstacleTimer = 0;
      nextPowerupTimer = 400;
      localShieldActive = false;
      setHasShield(false);
      setScore(0);
    };

    const spawnExplosion = (x: number, y: number, color: string, count = 15) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2 + Math.random() * 3,
          alpha: 1,
          color
        });
      }
    };

    const sendScoreToDatabase = (finalScore: number) => {
      console.log(`Sending score payload to server: ${finalScore}m for ${username}`);
      fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score: finalScore, endless: true })
      })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          console.log('Score securely logged into MongoDB cluster.');
        } else {
          console.error('API rejected score submission:', json.error);
        }
      })
      .catch(err => console.error('Network failure trying to talk to API:', err));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();

        if (gameState === 'START') {
          resetGameplayEngine();
          setGameState('PLAYING');
        } else if (gameState === 'PLAYING') {
          currentLaneIndex = (currentLaneIndex + 1) % lanes.length;
          spawnExplosion(150, playerVisualY, '#00ffff', 6);
        } else if (gameState === 'GAMEOVER') {
          resetGameplayEngine();
          setGameState('PLAYING');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const renderLoop = () => {
      if (gameState === 'PLAYING') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const currentSpeed = baseSpeed * speedMultiplier;

        playerVisualY += (lanes[currentLaneIndex] - playerVisualY) * 0.25;

        // Background grid aesthetics
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        const gridOffset = (Date.now() / 3) % 40;
        for (let x = -gridOffset; x < canvas.width; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        lanes.forEach(y => {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        });

        currentScore += 1;
        if (currentScore % 10 === 0) setScore(Math.floor(currentScore / 10));
        speedMultiplier = 1 + (currentScore / 3000);

        if (currentScore % 2 === 0) {
          particles.push({
            x: 140,
            y: playerVisualY + (Math.random() * 6 - 3),
            vx: -currentSpeed * 0.4 - Math.random() * 2,
            vy: Math.random() * 1 - 0.5,
            radius: 2 + Math.random() * 2,
            alpha: 0.8,
            color: localShieldActive ? '#00ffcc' : '#00ffff'
          });
        }

        // Generate barriers
        nextObstacleTimer -= currentSpeed;
        if (nextObstacleTimer <= 0) {
          const spawnLane = Math.floor(Math.random() * lanes.length);
          const wallW = 20 + Math.random() * 35;
          const wallH = 46;
          obstacles.push({
            x: canvas.width + 50,
            y: lanes[spawnLane] - wallH / 2,
            w: wallW,
            h: wallH,
            lane: spawnLane,
            nearMissChecked: false
          });
          nextObstacleTimer = 180 + Math.random() * 160;
        }

        // Generate Shields
        nextPowerupTimer -= currentSpeed;
        if (nextPowerupTimer <= 0 && !localShieldActive) {
          const itemLane = Math.floor(Math.random() * lanes.length);
          powerups.push({
            x: canvas.width + 50,
            y: lanes[itemLane],
            radius: 10,
            type: 'shield',
            collected: false
          });
          nextPowerupTimer = 800 + Math.random() * 800;
        }

        // Shield item handler
        for (let i = powerups.length - 1; i >= 0; i--) {
          const pu = powerups[i];
          pu.x -= currentSpeed;

          ctx.save();
          ctx.fillStyle = '#00ffaa';
          ctx.shadowColor = '#00ffaa';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(pu.x, pu.y, pu.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          const dx = 150 - pu.x;
          const dy = playerVisualY - pu.y;
          if (Math.sqrt(dx*dx + dy*dy) < 12 + pu.radius) {
            pu.collected = true;
            localShieldActive = true;
            setHasShield(true);
            floatingTexts.push({ x: 150, y: playerVisualY - 20, text: 'SHIELD ACTIVE', alpha: 1, color: '#00ffaa' });
            spawnExplosion(pu.x, pu.y, '#00ffaa', 12);
            powerups.splice(i, 1);
            continue;
          }
          if (pu.x + 30 < 0) powerups.splice(i, 1);
        }

        // Barrier updates and intersections
        ctx.save();
        ctx.fillStyle = '#ff3366';
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 10;

        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= currentSpeed;
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

          const playerX = 150;
          const playerY = playerVisualY;
          const pRadius = 12;

          const closestX = Math.max(obs.x, Math.min(playerX, obs.x + obs.w));
          const closestY = Math.max(obs.y, Math.min(playerY, obs.y + obs.h));
          const distX = playerX - closestX;
          const distY = playerY - closestY;
          const isColliding = (distX * distX + distY * distY) < (pRadius * pRadius);

          if (isColliding) {
            const finalScore = Math.floor(currentScore / 10);
            if (localShieldActive) {
              localShieldActive = false;
              setHasShield(false);
              spawnExplosion(playerX, playerY, '#00ffaa', 25);
              floatingTexts.push({ x: playerX, y: playerY - 30, text: 'SHIELD SHATTERED', alpha: 1, color: '#ffea00' });
              obstacles = [];
              break;
            } else {
              setGameState('GAMEOVER');
              spawnExplosion(playerX, playerY, '#ff3366', 30);
              sendScoreToDatabase(finalScore);
              return;
            }
          }

          // Near Miss Detector
          if (!obs.nearMissChecked && obs.x + obs.w < playerX) {
            obs.nearMissChecked = true;
            const laneDiff = Math.abs(lanes[currentLaneIndex] - lanes[obs.lane]);
            if (laneDiff <= 120) { 
              currentScore += 350;
              floatingTexts.push({ x: playerX, y: playerY - 25, text: '+35 NEAR MISS!', alpha: 1, color: '#ffcc00' });
              spawnExplosion(playerX + 20, playerY, '#ffcc00', 4);
            }
          }

          if (obs.x + obs.w < 0) obstacles.splice(i, 1);
        }
        ctx.restore();

        // Particle particle animations
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx; p.y += p.vy; p.alpha -= 0.025;
          if (p.alpha <= 0) { particles.splice(i, 1); continue; }
          ctx.save();
          ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }

        // Float notification typography overlay
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
          const t = floatingTexts[i];
          t.y -= 1; t.alpha -= 0.02;
          if (t.alpha <= 0) { floatingTexts.splice(i, 1); continue; }
          ctx.save();
          ctx.globalAlpha = t.alpha; ctx.fillStyle = t.color;
          ctx.font = 'black 11px monospace';
          ctx.shadowColor = t.color; ctx.shadowBlur = 4;
          ctx.fillText(t.text, t.x - 30, t.y);
          ctx.restore();
        }

        // Core avatar sphere
        ctx.save();
        ctx.beginPath();
        ctx.arc(150, playerVisualY, 12, 0, Math.PI * 2);
        if (localShieldActive) {
          ctx.fillStyle = '#00ffcc';
          ctx.shadowColor = '#00ffcc';
          ctx.shadowBlur = 18;
          ctx.fill();
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(150, playerVisualY, 20, 0, Math.PI * 2); ctx.stroke();
        } else {
          ctx.fillStyle = '#00ffff';
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 15;
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, username]);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="flex justify-between w-full max-w-3xl text-xs font-mono text-slate-400 px-2 tracking-widest uppercase">
        <div>PILOT: <span className="text-white font-bold">{username}</span></div>
        <div className="flex gap-4">
          {hasShield && <span className="text-emerald-400 font-bold animate-pulse">[SHIELD LOADED]</span>}
          <div>HI-SCORE: <span className="text-yellow-400 font-bold">{highScore}</span></div>
        </div>
        <div>SCORE: <span className="text-cyan-400 font-bold">{score}</span></div>
      </div>

      <div className="relative w-[800px] h-[500px]">
        <canvas ref={canvasRef} width={800} height={500} className="border-2 border-slate-800 bg-slate-950 rounded-lg shadow-2xl" />

        {gameState === 'START' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 font-mono text-center rounded-lg">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 tracking-tighter mb-2">VELOCITY MATRIX 2.0</h1>
            <p className="text-[10px] text-slate-500 max-w-xs mb-8 tracking-wider uppercase leading-relaxed">
              Shift tracks to collect emerald aegis shields. Skim past barriers for near-miss multiplier bonuses.
            </p>
            <span className="px-4 py-2 bg-cyan-950/40 border border-cyan-800/60 text-cyan-400 text-xs rounded animate-pulse font-bold tracking-widest uppercase">
              PRESS SPACEBAR TO ENGAGE HYPER-DRIVE
            </span>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 font-mono text-center rounded-lg">
            <h2 className="text-3xl font-black text-red-500 tracking-tighter uppercase mb-1">GRID SIGNAL TERMINATED</h2>
            <p className="text-xs text-slate-400 tracking-widest mb-6 uppercase">RUN RE-COMPILATION COMPLETE AT {score} METERS</p>
            <span className="px-4 py-2 bg-red-950/60 border border-red-700/60 text-red-200 text-xs rounded font-bold tracking-widest uppercase animate-pulse">
              PRESS SPACEBAR TO RE-INITIALIZE MATRIX
            </span>
          </div>
        )}
      </div>
    </div>
  );
}