import React, { useState, useEffect, useRef } from 'react';
import { Target, Trophy, Clock, Fish as FishIcon, Medal, User, Crown, Volume2, VolumeX } from 'lucide-react';
import { useGame } from '../components/GameContext';
import { fishingAudio } from '../lib/fishingAudio';
import { updateFishingStats } from '../lib/firebase';
import { storage } from '../lib/storage';
import { RoomPlayer } from '../lib/types';
import { MatchEndScreen } from '../components/MatchEndScreen';

interface Fish {
  id: number;
  fType: 'normal' | 'medium' | 'rare' | 'legendary';
  points: number;
  color: string;
  yRatio: number;
  dir: number; // 1 for right, -1 for left
  speedRatio: number;
  timeOffset: number;
  localSpawnTime?: number; // client-side only
  pendingCatch?: boolean;
  
  // These are computed continuously during render, keep them for click detection
  x?: number;
  y?: number;
  size?: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  r: number;
  maxR: number;
  life: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export default function FishingRoom() {
  const { state, playerId, isHost, startGame, catchFish, spawnFish } = useGame();
  const [isMuted, setIsMuted] = useState(fishingAudio.isMuted());
  const [statsSaved, setStatsSaved] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const scoreRef = useRef(0);
  const fishCountRef = useRef(0);
  const fishesRef = useRef<Fish[]>([]);
  const textsRef = useRef<FloatingText[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  const [forceRender, setForceRender] = useState(0);

  useEffect(() => {
     if (state?.status === 'playing') {
        const int = setInterval(() => setForceRender(v => v + 1), 500);
        return () => clearInterval(int);
     }
  }, [state?.status]);

  const toggleMute = () => {
    setIsMuted(fishingAudio.toggleMute());
  };

  useEffect(() => {
    if (state?.status === 'playing') {
      setStatsSaved(false);
      fishingAudio.playInit();
    } else if (state?.status === 'finished') {
      const me = state.players[playerId];
      if (me && !statsSaved) {
        const sortedPlayers = (Object.values(state.players) as RoomPlayer[]).sort((a,b) => b.score - a.score);
        const isWin = sortedPlayers[0]?.id === playerId && me.score > 0;
        
        if (isWin) {
          setTimeout(() => fishingAudio.playWin(), 500);
        } else {
          fishingAudio.playGameOver();
        }

        updateFishingStats(
          storage.getPlayerId(),
          storage.getPlayerName() || me.username,
          isWin,
          me.score,
          Math.max(1, Math.floor(me.score / 25))
        );
        setStatsSaved(true);
      }
    }
  }, [state?.status]);

  useEffect(() => {
    const handleEvents = (e: Event) => {
        const ce = e as CustomEvent;
        const msg = ce.detail;
        if (msg.type === 'FISH_SPAWN') {
            const newFish: Fish = { ...msg.fish, localSpawnTime: window.performance.now() };
            fishesRef.current.push(newFish);
        } else if (msg.type === 'FISH_CATCH') {
            const index = fishesRef.current.findIndex(f => f.id === msg.fishId);
            if (index !== -1) {
                const f = fishesRef.current[index];
                fishesRef.current.splice(index, 1);
                
                fishingAudio.playCatch(f.fType);

                // Add particles
                const dpr = window.devicePixelRatio || 1;
                for (let p = 0; p < 8; p++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 3 + 1;
                    particlesRef.current.push({
                        id: Math.random(),
                        x: f.x || 0,
                        y: f.y || 0,
                        vx: Math.cos(angle) * speed * dpr,
                        vy: Math.sin(angle) * speed * dpr,
                        life: 1,
                        color: f.color
                    });
                }
                
                // Add points text at correct spot
                textsRef.current.push({
                  id: Math.random(),
                  x: f.x || 0,
                  y: f.y || 0,
                  text: `+${msg.points}`,
                  color: msg.playerId === playerId ? '#10b981' : '#f59e0b',
                  life: 1
                });
            }
        }
    };
    
    window.addEventListener('fishing_event', handleEvents);
    return () => window.removeEventListener('fishing_event', handleEvents);
  }, [playerId]);

  useEffect(() => {
     if (isHost && state?.status === 'playing') {
        const interval = setInterval(() => {
             const r = Math.random();
              let fType: 'normal'|'medium'|'rare'|'legendary' = 'normal';
              let pts = 10;
              let color = '#a78bfa'; // normal

              if (r < 0.05) { fType = 'legendary'; pts = 100; color = '#fbbf24'; }
              else if (r < 0.15) { fType = 'rare'; pts = 50; color = '#f472b6'; }
              else if (r < 0.40) { fType = 'medium'; pts = 25; color = '#38bdf8'; }

              const yRatio = 0.15 + Math.random() * 0.7; 
              const dir = Math.random() > 0.5 ? 1 : -1;
              
              const speedMap = { 'normal': 0.00015, 'medium': 0.0002, 'rare': 0.0003, 'legendary': 0.00045 };
              const speedRatio = speedMap[fType];
              
              const newFish = {
                  id: Math.random(),
                  yRatio,
                  dir,
                  speedRatio,
                  fType,
                  points: pts,
                  color,
                  timeOffset: Math.random() * 10000
              };
              spawnFish(newFish);
        }, 1200);
        return () => clearInterval(interval);
     }
  }, [isHost, state?.status]);

  useEffect(() => {
      if (state?.status !== 'playing') return;
      
      // Clear elements for fresh start
      fishesRef.current = [];
      textsRef.current = [];
      ripplesRef.current = [];
      particlesRef.current = [];

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      let width = 0;
      let height = 0;

      const resize = () => {
          const rect = canvas.parentElement?.getBoundingClientRect();
          if (rect) {
              width = rect.width;
              height = rect.height || 400; 
              canvas.width = width * dpr;
              canvas.height = height * dpr;
              ctx.scale(1, 1);
          }
      };
      
      window.addEventListener('resize', resize);
      resize();

      const bubbles = Array.from({length: 20}).map(() => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          s: Math.random() * 4 * dpr + 2 * dpr,
          v: Math.random() * 1.5 * dpr + 0.5 * dpr
      }));

      const drawFish = (f: Fish) => {
          if (f.x === undefined || f.y === undefined || f.size === undefined) return;
          ctx.save();
          ctx.translate(f.x, f.y);
          if (f.dir === -1) ctx.scale(-1, 1);

          ctx.fillStyle = f.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, f.size, f.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-f.size + 2 * dpr, 0);
          ctx.lineTo(-f.size - f.size * 0.8, -f.size * 0.6);
          ctx.lineTo(-f.size - f.size * 0.8, f.size * 0.6);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(f.size * 0.5, -f.size * 0.15, f.size * 0.15, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'black';
          ctx.beginPath();
          ctx.arc(f.size * 0.55, -f.size * 0.15, f.size * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
      };

      let lastTime = 0;
      const loop = (timestamp: number) => {
          if (!canvas) return;
          if (!lastTime) lastTime = timestamp;
          const dt = timestamp - lastTime;
          lastTime = timestamp;
          const scale = dt / 16.666;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          grad.addColorStop(0, '#020617');
          grad.addColorStop(1, '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          for(const b of bubbles) {
              b.y -= b.v * scale;
              if (b.y < -20) {
                  b.y = canvas.height + 20;
                  b.x = Math.random() * canvas.width;
              }
              ctx.beginPath();
              ctx.arc(b.x, b.y, b.s, 0, Math.PI * 2);
              ctx.fill();
          }

          const now = window.performance.now();
          for(let i = fishesRef.current.length - 1; i >= 0; i--) {
              const f = fishesRef.current[i];
              const elapsed = now - (f.localSpawnTime || now);
              
              const logicalX = f.dir === 1 ? -0.1 + f.speedRatio * elapsed : 1.1 - f.speedRatio * elapsed;
              f.x = logicalX * canvas.width;
              f.y = (f.yRatio * canvas.height) + Math.sin((now + f.timeOffset) / 300) * 15 * dpr + Math.cos((now + f.timeOffset) / 600) * 10 * dpr;
              
              const sizeMap: any = { 'normal': 20, 'medium': 22, 'rare': 25, 'legendary': 30 };
              f.size = sizeMap[f.fType] * dpr;
              
              drawFish(f);
              
              if (logicalX > 1.2 || logicalX < -0.2) {
                  fishesRef.current.splice(i, 1);
              }
          }
          
          ctx.lineWidth = 2 * dpr;
          for(let i = ripplesRef.current.length - 1; i >= 0; i--) {
              const r = ripplesRef.current[i];
              r.r += (r.maxR - r.r) * 0.1 * scale;
              r.life -= 0.03 * scale;
              if (r.life <= 0) {
                  ripplesRef.current.splice(i, 1);
                  continue;
              }
              ctx.strokeStyle = `rgba(255, 255, 255, ${r.life})`;
              ctx.beginPath();
              ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
              ctx.stroke();
          }

          for(let i = particlesRef.current.length - 1; i >= 0; i--) {
              const p = particlesRef.current[i];
              p.x += p.vx * scale;
              p.y += p.vy * scale;
              p.life -= 0.02 * scale;
              if (p.life <= 0) {
                  particlesRef.current.splice(i, 1);
                  continue;
              }
              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.life;
              ctx.beginPath();
              ctx.arc(p.x, p.y, 4 * dpr, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1;
          }
          
          for(let i = textsRef.current.length -1; i >= 0; i--) {
              const t = textsRef.current[i];
              t.y -= 1.5 * dpr * scale;
              t.life -= 0.02 * scale;
              if (t.life <= 0) {
                  textsRef.current.splice(i, 1);
                  continue;
              }
              ctx.font = `bold ${32 * dpr}px sans-serif`;
              ctx.fillStyle = t.color;
              ctx.strokeStyle = 'rgba(0,0,0,0.5)';
              ctx.lineWidth = 4 * dpr;
              ctx.globalAlpha = t.life;
              ctx.strokeText(t.text, t.x - 20 * dpr, t.y);
              ctx.fillText(t.text, t.x - 20 * dpr, t.y);
              ctx.globalAlpha = 1;
          }

          animationRef.current = requestAnimationFrame(loop);
      };

      animationRef.current = requestAnimationFrame(loop);

      return () => {
          window.removeEventListener('resize', resize);
          cancelAnimationFrame(animationRef.current);
      };
  }, [state?.status]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (state?.status !== 'playing') return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      const dpr = window.devicePixelRatio || 1;

      ripplesRef.current.push({
          id: Math.random(),
          x, y, r: 5 * dpr, maxR: 40 * dpr, life: 1
      });

      for(let i = fishesRef.current.length - 1; i >= 0; i--) {
          const f = fishesRef.current[i];
          if (f.x === undefined || f.y === undefined || f.size === undefined) continue;
          
          const dist = Math.hypot(f.x - x, f.y - y);
          if (dist < f.size * 2.0 && !f.pendingCatch) {
              f.pendingCatch = true;
              catchFish(f.id, f.points, f.fType);
              break;
          }
      }
  };

  if (!state) return null;

  if (state.status === 'finished') {
    const sortedPlayers = (Object.values(state.players) as RoomPlayer[]).sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <MatchEndScreen winner={winner} sortedPlayers={sortedPlayers} />
    );
  }

  return (
    <div className="flex flex-col space-y-4 h-[calc(100dvh-120px)] lg:h-auto lg:space-y-6 select-none touch-none">
        <div className="flex justify-between gap-4 shrink-0">
           {state.status === 'playing' && (
              <div className="bg-slate-800 border border-slate-700 px-4 py-3 md:px-6 md:py-4 rounded-2xl flex items-center gap-3 w-full">
                <div className={`p-2 md:p-3 rounded-xl ${(state.fishingTimeLeft || 0) <= 10 ? 'bg-red-500/20 animate-pulse' : 'bg-slate-900'}`}>
                  <Clock className={`w-5 h-5 md:w-6 md:h-6 ${(state.fishingTimeLeft || 0) <= 10 ? 'text-red-400' : 'text-emerald-400'}`} />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-slate-400">الوقت المتبقي</p>
                  <p className={`font-bold text-lg md:text-xl font-mono ${(state.fishingTimeLeft || 0) <= 10 ? 'text-red-400' : ''}`}>
                    00:{(state.fishingTimeLeft || 0).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            )}

            <button 
              onClick={toggleMute}
              className="bg-slate-800 p-3 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 aspect-square flex items-center justify-center shrink-0"
              title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
        </div>

        <div className="bg-slate-900 border-4 border-slate-800 p-1 rounded-3xl overflow-hidden relative shadow-2xl flex-1 flex min-h-[300px]">
           <canvas 
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-full bg-slate-950 rounded-2xl cursor-crosshair touch-none"
              style={{ display: 'block' }}
           />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-4 md:p-6 shrink-0 md:h-fit hidden lg:block space-y-4">
          <h3 className="font-bold text-lg border-b border-slate-700 pb-4">نتائج الصيد (مباشر)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(Object.values(state.players) as RoomPlayer[]).sort((a,b) => b.score - a.score).map((p, i) => (
              <div key={p.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-sm font-bold">{i + 1}</span>
                  <div className={`w-8 h-8 rounded-full ${p.id === playerId ? 'bg-indigo-500' : 'bg-slate-700'} flex items-center justify-center text-xs font-bold text-white`}>
                    {p.username.charAt(0)}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-200">{p.username}</span>
                  </div>
                </div>
                <span className="font-bold text-indigo-400">{p.score} <span className="text-xs text-slate-500">نقطة</span></span>
              </div>
            ))}
          </div>
        </div>

    </div>
  );
}
