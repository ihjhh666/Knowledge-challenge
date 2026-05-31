import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Target, Trophy, Clock, Fish as FishIcon, Medal, User, Waves, Volume2, VolumeX } from 'lucide-react';
import { updateFishingStats } from '../lib/firebase';
import { storage } from '../lib/storage';
import { fishingAudio } from '../lib/fishingAudio';

type Difficulty = 'easy' | 'medium' | 'hard';
type BotDifficulty = 'easy' | 'medium' | 'hard';

interface Fish {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  fType: 'normal' | 'medium' | 'rare' | 'legendary';
  points: number;
  color: string;
  flipped: boolean;
  baseY: number; 
  timeOffset: number;
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

interface Bot {
  id: string;
  name: string;
  score: number;
  fishCount: number;
}

export default function FishingSolo() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup');
  
  // Settings
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [duration, setDuration] = useState<number>(60);
  const [botsCount, setBotsCount] = useState<number>(0);
  const [botsDiff, setBotsDiff] = useState<BotDifficulty>('medium');
  const [isMuted, setIsMuted] = useState(fishingAudio.isMuted());
  
  // Game State
  const [score, setScore] = useState(0);
  const [fishCount, setFishCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [bots, setBots] = useState<Bot[]>([]);
  
  // We need refs to keep React out of the hot path for drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef(0);
  const fishCountRef = useRef(0);
  const fishesRef = useRef<Fish[]>([]);
  const textsRef = useRef<FloatingText[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const toggleMute = () => {
    setIsMuted(fishingAudio.toggleMute());
  };

  // Constants
  const diffSettings = {
    easy: { spawnMs: 800, maxFish: 15, vxMult: 1, probs: { n: 0.6, m: 0.25, r: 0.1, l: 0.05 } },
    medium: { spawnMs: 1200, maxFish: 10, vxMult: 1.5, probs: { n: 0.7, m: 0.2, r: 0.08, l: 0.02 } },
    hard: { spawnMs: 1800, maxFish: 6, vxMult: 2.5, probs: { n: 0.85, m: 0.12, r: 0.025, l: 0.005 } },
  };

  const startGame = () => {
    fishingAudio.playInit();
    setScore(0);
    setFishCount(0);
    scoreRef.current = 0;
    fishCountRef.current = 0;
    fishesRef.current = [];
    textsRef.current = [];
    ripplesRef.current = [];
    particlesRef.current = [];
    setTimeLeft(duration);
    timeRef.current = duration;
    
    // Init bots
    const newBots: Bot[] = [];
    const botNames = ['أحمد', 'خالد', 'سارة', 'عمر', 'نورة'];
    for(let i=0; i<botsCount; i++) {
        newBots.push({
            id: `bot-${i}`,
            name: `${botNames[i % botNames.length]} (بوت)`,
            score: 0,
            fishCount: 0
        });
    }
    setBots(newBots);
    setGameState('playing');
  };

  const endGame = () => {
    setGameState('results');
    setScore(scoreRef.current);
    setFishCount(fishCountRef.current);
    fishingAudio.playGameOver();
  };

  // Bot logic
  useEffect(() => {
    if (gameState === 'playing' && botsCount > 0) {
      const interval = setInterval(() => {
         setBots(prev => prev.map(bot => {
           let chance = 0.3;
           if (botsDiff === 'medium') chance = 0.5;
           if (botsDiff === 'hard') chance = 0.8;
           
           if (Math.random() < chance) {
             const typeRoll = Math.random();
             let pts = 10;
             if (typeRoll > 0.95) pts = 100;
             else if (typeRoll > 0.8) pts = 50;
             else if (typeRoll > 0.5) pts = 25;
             return { ...bot, score: bot.score + pts, fishCount: bot.fishCount + 1 };
           }
           return bot;
         }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, botsCount, botsDiff]);

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          timeRef.current = t - 1;
          if (t <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]); // Removed endGame dependency to avoid re-triggering

  useEffect(() => {
      if (gameState === 'results') {
          const allPlayers = [
              { id: 'player', name: storage.getPlayerName() || 'أنت', score: scoreRef.current, fishCount: fishCountRef.current },
              ...bots
          ].sort((a, b) => b.score - a.score);
          
          const isWin = allPlayers[0].id === 'player';
          
          if (isWin) {
            setTimeout(() => fishingAudio.playWin(), 500);
          }

          const pId = storage.getPlayerId();
          const pName = storage.getPlayerName() || 'لاعب مجهول';
          
          updateFishingStats(pId, pName, isWin, scoreRef.current, fishCountRef.current);
      }
  }, [gameState]); // Note: Bots array is fixed inside results because results is only set once

  // Canvas Drawing Logic
  useEffect(() => {
      if (gameState !== 'playing' || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      let lastSpawn = 0;
      let bubbles: any[] = [];
      
      const resize = () => {
          const rect = canvas.parentElement!.getBoundingClientRect();
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          bubbles = [];
          for(let i = 0; i < 20; i++) {
              bubbles.push({
                  x: Math.random() * canvas.width,
                  y: Math.random() * canvas.height,
                  s: (Math.random() * 5 + 2) * dpr,
                  v: (Math.random() * 1 + 0.5) * dpr
              });
          }
      };
      window.addEventListener('resize', resize);
      resize();

      const drawFish = (f: Fish) => {
          ctx.save();
          ctx.translate(f.x, f.y);
          if (f.flipped) ctx.scale(-1, 1);
          
          ctx.beginPath();
          ctx.fillStyle = f.color;
          // Body
          ctx.ellipse(0, 0, f.size, f.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Tail
          ctx.beginPath();
          ctx.moveTo(-f.size * 0.7, 0);
          ctx.lineTo(-f.size * 1.5, -f.size * 0.7);
          ctx.lineTo(-f.size * 1.5, f.size * 0.7);
          ctx.fill();
          
          // Eye
          ctx.beginPath();
          ctx.fillStyle = '#fff';
          ctx.arc(f.size * 0.4, -f.size * 0.15, f.size * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = '#000';
          ctx.arc(f.size * 0.45, -f.size * 0.15, f.size * 0.1, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
      };

      let lastTime = 0;
      const loop = (timestamp: number) => {
          if (!canvas) return;
          if (!lastTime) lastTime = timestamp;
          const dt = timestamp - lastTime;
          lastTime = timestamp;
          const scale = dt / 16.666; // normalize to ~60fps
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw water background
          const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(1, '#0284c7');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Bubbles
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

          const setts = diffSettings[difficulty];
          
          // Spawn
          if (timestamp - lastSpawn > setts.spawnMs && fishesRef.current.length < setts.maxFish) {
              lastSpawn = timestamp;
              const roll = Math.random();
              const p = setts.probs;
              let fType: Fish['fType'];
              let pts, color, sizeBase;
              
              if (roll < p.l) { fType = 'legendary'; pts = 100; color = '#fbbf24'; sizeBase = 35; }
              else if (roll < p.l + p.r) { fType = 'rare'; pts = 50; color = '#a855f7'; sizeBase = 28; }
              else if (roll < p.l + p.r + p.m) { fType = 'medium'; pts = 25; color = '#f97316'; sizeBase = 32; }
              else { fType = 'normal'; pts = 10; color = '#34d399'; sizeBase = 25; }
              
              const size = sizeBase * dpr;
              const fromLeft = Math.random() > 0.5;
              const baseY = Math.random() * (canvas.height - 100 * dpr) + 50 * dpr;
              
              const vxBase = (Math.random() * 1.5 + 1) * setts.vxMult * dpr;
              const vx = fromLeft ? vxBase : -vxBase;
              
              fishesRef.current.push({
                  id: Math.random(),
                  x: fromLeft ? -50 : canvas.width + 50,
                  y: baseY,
                  vx,
                  vy: 0,
                  size,
                  fType,
                  points: pts,
                  color,
                  flipped: !fromLeft,
                  baseY,
                  timeOffset: Math.random() * 1000
              });
          }

          // Update & Draw Fishes
          for(let i = fishesRef.current.length - 1; i >= 0; i--) {
              const f = fishesRef.current[i];
              f.x += f.vx * scale;
              // more natural wave motion: double sine
              f.y = f.baseY + Math.sin((timestamp + f.timeOffset) / 300) * 15 * dpr + Math.cos((timestamp + f.timeOffset) / 600) * 10 * dpr;
              
              drawFish(f);
              
              // Remove off screen
              if ((f.vx > 0 && f.x > canvas.width + 100) || (f.vx < 0 && f.x < -100)) {
                  fishesRef.current.splice(i, 1);
              }
          }
          
          // Draw Ripples
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

          // Draw Particles
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
          
          // Draw floating texts
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
              // slight text stroke
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
  }, [gameState, difficulty]);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || gameState !== 'playing') return;
      
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      // Add ripple effect on click
      ripplesRef.current.push({
          id: Math.random(),
          x, y, r: 5 * dpr, maxR: 40 * dpr, life: 1
      });

      for(let i = fishesRef.current.length - 1; i >= 0; i--) {
          const f = fishesRef.current[i];
          const dist = Math.hypot(f.x - x, f.y - y);
          // Hitbox is slightly larger for easier touch control
          if (dist < f.size * 2.0) {
              fishesRef.current.splice(i, 1);
              scoreRef.current += f.points;
              fishCountRef.current += 1;
              
              fishingAudio.playCatch(f.fType);
              
              // Only sync React state every roughly 10 points or quickly (just use standard state, it's fine for simple UI overlay)
              setScore(scoreRef.current);
              setFishCount(fishCountRef.current);
              
              // Particles
              for (let p = 0; p < 8; p++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = Math.random() * 3 + 1;
                  particlesRef.current.push({
                      id: Math.random(),
                      x: f.x,
                      y: f.y,
                      vx: Math.cos(angle) * speed * dpr,
                      vy: Math.sin(angle) * speed * dpr,
                      life: 1,
                      color: f.color
                  });
              }

              textsRef.current.push({
                  id: Math.random(),
                  x: f.x,
                  y: f.y,
                  text: `+${f.points}`,
                  color: f.color,
                  life: 1
              });
              break;
          }
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col p-4 md:p-8" dir="rtl">
      <header className="flex items-center gap-4 max-w-4xl mx-auto w-full mb-8">
        <button 
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-heading flex items-center gap-2 text-sky-400">
            <Waves className="w-8 h-8" />
            صيد السمك
          </h1>
          <p className="text-slate-400 mt-1">تحدَّ نفسك أو البوتات في صيد الأسماك</p>
        </div>
        <button 
          onClick={toggleMute}
          className="bg-slate-800 p-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col">
        {gameState === 'setup' && (
           <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-12 shadow-xl animate-fade-in max-w-2xl mx-auto w-full">
              <h2 className="text-2xl font-bold font-heading mb-6 border-b border-slate-700 pb-4">إعدادات اللعبة</h2>
              
              <div className="space-y-8">
                  <div>
                      <h3 className="text-lg font-bold mb-3 text-slate-300">الصعوبة (مستوى الأسماك)</h3>
                      <div className="flex gap-3">
                          <button onClick={() => setDifficulty('easy')} className={`flex-1 py-3 font-bold rounded-xl border ${difficulty === 'easy' ? 'bg-sky-600 border-sky-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>سهل</button>
                          <button onClick={() => setDifficulty('medium')} className={`flex-1 py-3 font-bold rounded-xl border ${difficulty === 'medium' ? 'bg-sky-600 border-sky-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>متوسط</button>
                          <button onClick={() => setDifficulty('hard')} className={`flex-1 py-3 font-bold rounded-xl border ${difficulty === 'hard' ? 'bg-sky-600 border-sky-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>صعب</button>
                      </div>
                  </div>
                  
                  <div>
                      <h3 className="text-lg font-bold mb-3 text-slate-300">الوقت</h3>
                      <div className="flex gap-3">
                          <button onClick={() => setDuration(60)} className={`flex-1 py-3 font-bold rounded-xl border ${duration === 60 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>60 ثانية</button>
                          <button onClick={() => setDuration(90)} className={`flex-1 py-3 font-bold rounded-xl border ${duration === 90 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>90 ثانية</button>
                          <button onClick={() => setDuration(120)} className={`flex-1 py-3 font-bold rounded-xl border ${duration === 120 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>120 ثانية</button>
                      </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                      <div>
                        <h3 className="text-lg font-bold mb-3 text-slate-300">عدد البوتات</h3>
                        <div className="flex flex-wrap gap-2">
                            {[0, 1, 3, 5].map(num => (
                                <button key={num} onClick={() => setBotsCount(num)} className={`px-4 py-2 font-bold rounded-lg border ${botsCount === num ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>{num === 0 ? 'بدون' : num}</button>
                            ))}
                        </div>
                      </div>
                      
                      {botsCount > 0 && (
                          <div>
                            <h3 className="text-lg font-bold mb-3 text-slate-300">صعوبة البوتات</h3>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setBotsDiff('easy')} className={`px-4 py-2 font-bold rounded-lg border ${botsDiff === 'easy' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>سهل</button>
                                <button onClick={() => setBotsDiff('medium')} className={`px-4 py-2 font-bold rounded-lg border ${botsDiff === 'medium' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>متوسط</button>
                                <button onClick={() => setBotsDiff('hard')} className={`px-4 py-2 font-bold rounded-lg border ${botsDiff === 'hard' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>صعب</button>
                            </div>
                          </div>
                      )}
                  </div>
                  
                  <button 
                      onClick={startGame}
                      className="w-full bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-xl py-5 rounded-2xl transition-transform active:scale-95 shadow-lg shadow-sky-500/25 mt-4"
                  >
                      ابدأ الصيد!
                  </button>
              </div>
           </div>
        )}

        {gameState === 'playing' && (
           <div className="flex-1 flex flex-col md:flex-row gap-6 animate-fade-in relative max-h-[80vh]">
               
               <div className="flex-1 relative bg-slate-900 border-4 border-sky-900 rounded-3xl overflow-hidden shadow-2xl">
                   <canvas
                       ref={canvasRef}
                       onPointerDown={handleCanvasPointerDown}
                       className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
                   />
                   
                   {/* Top Bar overlay */}
                   <div className="absolute top-4 inset-x-4 flex justify-between pointer-events-none">
                       <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-xl font-bold text-white shadow-lg">
                           <Clock className="w-5 h-5 text-indigo-400" />
                           {timeLeft}
                       </div>
                       
                       <div className="flex gap-2">
                           <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-xl font-bold text-white shadow-lg">
                               <FishIcon className="w-5 h-5 text-sky-400" />
                               {fishCount}
                           </div>
                           <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-xl font-bold text-emerald-400 shadow-lg">
                               <Target className="w-5 h-5" />
                               {score}
                           </div>
                       </div>
                   </div>
               </div>

               {botsCount > 0 && (
                   <div className="w-full md:w-64 bg-slate-800 border border-slate-700 rounded-3xl p-4 flex flex-col gap-3 shadow-xl h-48 md:h-auto overflow-y-auto shrink-0">
                       <h3 className="font-bold text-slate-300 border-b border-slate-700 pb-2 mb-2 text-center">المتصدرون</h3>
                       
                       {[
                           { id: 'player', name: 'أنت', score, isMe: true },
                           ...bots
                       ].sort((a, b) => b.score - a.score).map((p, idx) => (
                           <div key={p.id} className={`flex items-center gap-3 p-2 rounded-xl ${p.isMe ? 'bg-sky-500/20 border border-sky-500/30' : 'bg-slate-900'}`}>
                               <div className="w-6 h-6 rounded bg-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                                   {idx + 1}
                               </div>
                               <div className="flex-1 truncate">
                                   <div className={`text-sm font-bold truncate ${p.isMe ? 'text-sky-400' : 'text-slate-300'}`}>{p.name}</div>
                               </div>
                               <div className="font-mono text-emerald-400 font-bold text-sm shrink-0">
                                   {p.score}
                               </div>
                           </div>
                       ))}
                   </div>
               )}
           </div>
        )}

        {gameState === 'results' && (
           <div className="max-w-2xl mx-auto w-full bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-xl animate-fade-in text-center">
                <div className="bg-sky-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-12 h-12 text-sky-400" />
                </div>
                
                <h2 className="text-4xl font-bold font-heading mb-8 text-white">النتيجة النهائية</h2>
                
                {botsCount === 0 ? (
                    <div className="flex justify-center gap-8 mb-8">
                        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl flex-1">
                            <p className="text-slate-400 mb-1">النقاط</p>
                            <p className="text-4xl font-bold font-mono text-emerald-400">{scoreRef.current}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl flex-1">
                            <p className="text-slate-400 mb-1">الأسماك</p>
                            <p className="text-4xl font-bold font-mono text-sky-400">{fishCountRef.current}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden mb-8">
                        {[
                           { id: 'player', name: storage.getPlayerName() || 'أنت', score: scoreRef.current, fishCount: fishCountRef.current, isMe: true },
                           ...bots
                       ].sort((a, b) => b.score - a.score).map((p, idx) => (
                          <div key={p.id} className={`flex items-center gap-4 p-4 border-b border-slate-800 last:border-0 ${p.isMe ? 'bg-sky-500/10' : ''}`}>
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-lg shrink-0 ${idx === 0 ? 'bg-amber-500 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-800 text-slate-400'}`}>
                                 {idx + 1}
                             </div>
                             <div className="flex-1 text-right">
                                 <div className={`font-bold text-lg truncate ${p.isMe ? 'text-sky-400' : 'text-white'}`}>{p.name}</div>
                             </div>
                             <div className="flex flex-col items-end shrink-0">
                                <span className="font-mono text-emerald-400 font-bold text-xl">{p.score}</span>
                                <span className="text-xs text-slate-500">{p.fishCount} سمكة</span>
                             </div>
                          </div> 
                       ))}
                    </div>
                )}
                
                <div className="flex gap-4">
                    <button
                        onClick={() => setGameState('setup')}
                        className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl transition-all"
                    >
                        إعادة اللعب
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-all border border-slate-600"
                    >
                        الصفحة الرئيسية
                    </button>
                </div>
           </div>
        )}
      </main>
    </div>
  );
}
