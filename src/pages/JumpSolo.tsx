import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Trophy, RotateCcw, Home, Play } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { updatePlayerStats } from '../lib/firebase';
import { updateStats as doUpdateAchStats, getPlayerStats } from '../lib/achievements';
import { audio } from '../lib/audio';

const PLATFORM_RADIUS = 350;
const GRAVITY = 1500;
const JUMP_FORCE = 600;
const ARM_HEIGHT = 40;
const ARM_WIDTH = 25;
const PLAYER_RADIUS = 15;

export default function JumpSolo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const playerRef = useRef({
    x: 0, y: PLATFORM_RADIUS * 0.5, z: 0,
    vx: 0, vy: 0, vz: 0,
    isJumping: false, dead: false
  });
  
  const armRef = useRef({ angle: 0, speed: 1.5 });
  const inputsRef = useRef({ x: 0, y: 0, jump: false });
  const timeRef = useRef(0);
  const shakeRef = useRef(0);
  const particlesRef = useRef<any[]>([]);

  const handleJoystick = useCallback((dx: number, dy: number) => {
    inputsRef.current.x = dx;
    inputsRef.current.y = dy;
  }, []);

  const handleJump = useCallback(() => {
    if (!playerRef.current.isJumping && !playerRef.current.dead) {
      playerRef.current.vz = JUMP_FORCE;
      playerRef.current.isJumping = true;
      audio.playToneWithADSR('sine', 600, 0.05, 0.1, 0, 0.1, 0.1);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup': inputsRef.current.y = -1; break;
        case 's': case 'arrowdown': inputsRef.current.y = 1; break;
        case 'a': case 'arrowleft': inputsRef.current.x = -1; break;
        case 'd': case 'arrowright': inputsRef.current.x = 1; break;
        case ' ': handleJump(); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup': if (inputsRef.current.y < 0) inputsRef.current.y = 0; break;
        case 's': case 'arrowdown': if (inputsRef.current.y > 0) inputsRef.current.y = 0; break;
        case 'a': case 'arrowleft': if (inputsRef.current.x < 0) inputsRef.current.x = 0; break;
        case 'd': case 'arrowright': if (inputsRef.current.x > 0) inputsRef.current.x = 0; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleJump]);

  const startGame = () => {
    playerRef.current = { x: 0, y: PLATFORM_RADIUS * 0.5, z: 0, vx: 0, vy: 0, vz: 0, isJumping: false, dead: false };
    armRef.current = { angle: 0, speed: 1.5 };
    timeRef.current = 0;
    shakeRef.current = 0;
    particlesRef.current = [];
    setScore(0);
    setTime(0);
    setGameState('playing');
    lastTimeRef.current = performance.now();
  };

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
       particlesRef.current.push({
           x, y,
           vx: (Math.random() - 0.5) * 400,
           vy: (Math.random() - 0.5) * 400,
           life: 1,
           color
       });
    }
  };

  const drawPlatform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // We will do a pseudo-3D look by scaling the context y-axis
    ctx.save();
    ctx.translate(width / 2, height / 2 + 50); // Center
    
    // Draw outer glow
    ctx.shadowColor = '#c026d3';
    ctx.shadowBlur = 50;

    // Scale for pseudo 3D
    ctx.scale(1, 0.5);

    // Platform Base (Thickness)
    ctx.fillStyle = '#4a044e'; // fuchsia-950
    ctx.beginPath();
    ctx.arc(0, 40, PLATFORM_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Platform Top
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, PLATFORM_RADIUS);
    grad.addColorStop(0, '#701a75'); // fuchsia-900
    grad.addColorStop(1, '#2e1065'); // violet-950
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, PLATFORM_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Grid lines
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.2)'; // fuchsia-500
    ctx.lineWidth = 2;
    const step = 50;
    for (let i = -PLATFORM_RADIUS; i <= PLATFORM_RADIUS; i += step) {
        ctx.beginPath(); ctx.moveTo(i, -PLATFORM_RADIUS); ctx.lineTo(i, PLATFORM_RADIUS); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-PLATFORM_RADIUS, i); ctx.lineTo(PLATFORM_RADIUS, i); ctx.stroke();
    }
    
    // Draw Edge
    ctx.strokeStyle = '#e879f9'; // fuchsia-400
    ctx.lineWidth = 5;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#e879f9';
    ctx.beginPath();
    ctx.arc(0, 0, PLATFORM_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();
  };

  const loop = useCallback((now: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = now;
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = now;

    if (gameState === 'playing') {
      timeRef.current += dt;
      if (Math.floor(timeRef.current) > time) {
          setTime(Math.floor(timeRef.current));
          setScore(prev => prev + 10);
      }

      // Update arm
      armRef.current.speed += dt * 0.05; // gradually speed up
      armRef.current.angle += armRef.current.speed * dt;

      const p = playerRef.current;
      
      if (!p.dead) {
          // Movement
          const moveSpeed = 300;
          let mag = Math.sqrt(inputsRef.current.x * inputsRef.current.x + inputsRef.current.y * inputsRef.current.y);
          if (mag > 1) mag = 1;
          
          p.vx = inputsRef.current.x * moveSpeed * (mag > 0 ? 1/mag : 0);
          p.vy = inputsRef.current.y * moveSpeed * (mag > 0 ? 1/mag : 0);

          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Jumping
          if (p.isJumping) {
              p.z += p.vz * dt;
              p.vz -= GRAVITY * dt;
              if (p.z <= 0) {
                  p.z = 0;
                  p.vz = 0;
                  p.isJumping = false;
              }
          }

          // Check if out of bounds (fall off)
          const dist = Math.sqrt(p.x * p.x + p.y * p.y);
          if (dist > PLATFORM_RADIUS + 10) {
              p.dead = true;
              shakeRef.current = 15;
              audio.playToneWithADSR('sawtooth', 200, 0.05, 0.2, 0.2, 0.2, 0.5);
              spawnParticles(p.x, p.y, '#ef4444');
              setGameState('gameover');
              const s = getPlayerStats();
              doUpdateAchStats({
                  jumpMaxSurviveTime: Math.max(s.jumpMaxSurviveTime || 0, Math.floor(timeRef.current)),
                  jumpMaxScore: Math.max(s.jumpMaxScore || 0, score)
              });
              if (user) {
                  updatePlayerStats(user.uid, user.displayName || 'Unknown', false, 0, score, 0, 'القفزة الأخيرة');
              }
          }

          // Collision with arm
          // The arm is a line from center to edge at armRef.angle
          // We can check distance from player to that line segment.
          if (!p.dead && p.z < ARM_HEIGHT) {
              const dx = Math.cos(armRef.current.angle);
              const dy = Math.sin(armRef.current.angle);
              
              // Project player pos onto arm line
              const projLength = p.x * dx + p.y * dy;
              
              if (projLength > 0 && projLength < PLATFORM_RADIUS) {
                  // closest point on arm
                  const cx = projLength * dx;
                  const cy = projLength * dy;
                  
                  // distance from player to closest point
                  const distToArm = Math.sqrt((p.x - cx)**2 + (p.y - cy)**2);
                  
                  if (distToArm < PLAYER_RADIUS + ARM_WIDTH/2) {
                      // Hit!
                      // push player heavily in direction of arm movement
                      const pushX = -dy * armRef.current.speed * 400;
                      const pushY = dx * armRef.current.speed * 400;
                      p.x += pushX * dt;
                      p.y += pushY * dt;
                      shakeRef.current = 10;
                      audio.playToneWithADSR('square', 300, 0.05, 0.1, 0.1, 0.1, 0.2);
                  }
              }
          }
      } else {
         // Fall logic
         p.z -= 800 * dt;
      }
      
      // Update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
         const pt = particlesRef.current[i];
         pt.life -= dt * 2;
         pt.x += pt.vx * dt;
         pt.y += pt.vy * dt;
         if (pt.life <= 0) particlesRef.current.splice(i, 1);
      }
    }

    if (shakeRef.current > 0) {
        shakeRef.current -= dt * 50;
        if (shakeRef.current < 0) shakeRef.current = 0;
    }

    // DRAW
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);

        ctx.save();
        const shakeX = (Math.random() - 0.5) * shakeRef.current;
        const shakeY = (Math.random() - 0.5) * shakeRef.current;
        ctx.translate(shakeX, shakeY);

        drawPlatform(ctx, width, height);

        // Draw game elements (pseudo 3D scale)
        ctx.save();
        ctx.translate(width / 2, height / 2 + 50);
        
        ctx.scale(1, 0.5);

        // Arm
        const ax = Math.cos(armRef.current.angle) * PLATFORM_RADIUS;
        const ay = Math.sin(armRef.current.angle) * PLATFORM_RADIUS;

        // Draw Arm Shadow
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = ARM_WIDTH;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ax, ay);
        ctx.stroke();

        // Draw Arm
        ctx.strokeStyle = '#22d3ee'; // cyan-400
        ctx.lineWidth = ARM_WIDTH;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#22d3ee';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ax, ay);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Center Pillar
        ctx.fillStyle = '#0891b2'; // cyan-600
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#67e8f9'; // cyan-200
        ctx.beginPath();
        ctx.arc(0, -30, 40, 0, Math.PI * 2);
        ctx.fill();

        // Particles
        particlesRef.current.forEach(pt => {
           ctx.fillStyle = pt.color;
           ctx.globalAlpha = pt.life;
           ctx.beginPath();
           ctx.arc(pt.x, pt.y, 4, 0, Math.PI*2);
           ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // Player
        const p = playerRef.current;
        
        // Draw player shadow
        if (!p.dead) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            // Shadow gets smaller as z increases
            const shadowRadius = Math.max(5, PLAYER_RADIUS - p.z * 0.1);
            ctx.arc(p.x, p.y, shadowRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Player Body (shifted up by z)
        ctx.fillStyle = '#c026d3'; // fuchsia-600
        ctx.beginPath();
        ctx.arc(p.x, p.y - p.z, PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Player head/highlight
        ctx.fillStyle = '#e879f9'; // fuchsia-400
        ctx.beginPath();
        ctx.arc(p.x, p.y - p.z - 5, PLAYER_RADIUS * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // scale
        ctx.restore(); // shake
      }
    }

    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, time, user, score, handleJump]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, [loop]);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative flex flex-col">
      {/* Dynamic Sci-Fi Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-fuchsia-950 opacity-50"></div>
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(192, 38, 211, 0.1) 0%, transparent 60%)'}}></div>

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 flex justify-between items-center bg-gradient-to-b from-slate-950 to-transparent">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur"
        >
          <ArrowRight className="w-5 h-5" />
          <span className="font-bold hidden sm:block">الرئيسية</span>
        </button>
        <div className="flex flex-col items-center">
            <h1 className="text-xl md:text-3xl font-black font-heading tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            القفزة الأخيرة
            </h1>
            {gameState === 'playing' && (
                <div className="text-sm font-bold text-slate-400 mt-1">الوقت: {time} ثانية</div>
            )}
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 px-6 py-2 rounded-full backdrop-blur border border-fuchsia-500/30">
          <Trophy className="w-5 h-5 text-fuchsia-400" />
          <span className="font-bold font-mono text-xl">{score}</span>
        </div>
      </header>

      {/* Game Canvas */}
      <div className="flex-1 relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={1000}
          className="w-full h-full max-w-4xl max-h-[800px] object-contain"
        />

        <AnimatePresence>
          {gameState === 'menu' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 z-20"
            >
              <div className="bg-slate-900 border border-fuchsia-500/30 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(192,38,211,0.2)]">
                <div className="w-24 h-24 bg-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(217,70,239,0.5)]">
                  <span className="text-5xl">🌀</span>
                </div>
                <h2 className="text-3xl font-black mb-2">القفزة الأخيرة</h2>
                <p className="text-slate-400 mb-8 font-medium leading-relaxed">
                  تجاوز الذراع الدوارة بالقفز في الوقت المناسب. الذراع ستزيد سرعتها!
                </p>
                <button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(192,38,211,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Play className="w-6 h-6 fill-current" />
                  ابدأ التحدي
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 z-20"
            >
              <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                <div className="text-6xl mb-6">💥</div>
                <h2 className="text-4xl font-black text-white mb-2">تم إقصاؤك!</h2>
                <div className="text-fuchsia-400 font-mono text-2xl font-bold mb-8">
                  النقاط: {score}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/')}
                    className="flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors"
                  >
                    <Home className="w-6 h-6" />
                    الرئيسية
                  </button>
                  <button
                    onClick={startGame}
                    className="flex flex-col items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-4 rounded-xl shadow-lg transition-colors"
                  >
                    <RotateCcw className="w-6 h-6" />
                    العب مجدداً
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Controls */}
      {gameState === 'playing' && (
        <div className="fixed bottom-8 left-0 right-0 px-8 flex justify-between items-end pointer-events-none z-30">
          <div className="w-40 h-40 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm pointer-events-auto relative shadow-[0_0_30px_rgba(34,211,238,0.1)] touch-none"
               onTouchStart={(e) => {
                 const rect = (e.target as HTMLElement).getBoundingClientRect();
                 const x = e.touches[0].clientX - rect.left - 80;
                 const y = e.touches[0].clientY - rect.top - 80;
                 handleJoystick(x/80, y/80);
               }}
               onTouchMove={(e) => {
                 const rect = (e.target as HTMLElement).getBoundingClientRect();
                 const x = e.touches[0].clientX - rect.left - 80;
                 const y = e.touches[0].clientY - rect.top - 80;
                 handleJoystick(x/80, y/80);
               }}
               onTouchEnd={() => handleJoystick(0,0)}
          >
            <div className="absolute top-1/2 left-1/2 w-16 h-16 -mt-8 -ml-8 bg-cyan-500/50 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)] pointer-events-none transition-transform" 
                 style={{transform: `translate(${inputsRef.current.x * 40}px, ${inputsRef.current.y * 40}px)`}}
            />
          </div>

          <button 
            className="w-24 h-24 bg-fuchsia-600/80 hover:bg-fuchsia-500/90 rounded-full backdrop-blur shadow-[0_0_30px_rgba(217,70,239,0.5)] border-2 border-fuchsia-400 pointer-events-auto flex items-center justify-center active:scale-90 transition-transform touch-none select-none"
            onTouchStart={(e) => { e.preventDefault(); handleJump(); }}
            onMouseDown={handleJump}
          >
            <span className="text-xl font-black text-white tracking-widest pointer-events-none">JUMP</span>
          </button>
        </div>
      )}
    </div>
  );
}
