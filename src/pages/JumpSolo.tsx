import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Trophy, RotateCcw, Home, Play, Users } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { storage } from '../lib/storage';
import { updatePlayerStats } from '../lib/firebase';
import { updateStats as doUpdateAchStats, getPlayerStats } from '../lib/achievements';
import { audio } from '../lib/audio';
import { PLATFORM_RADIUS, ARM_HEIGHT, ARM_WIDTH, PLAYER_RADIUS, GRAVITY, JUMP_FORCE, drawFuturisticArena, drawArm, drawFuturisticPlayer } from '../lib/jumpGraphics';
import { Joystick } from '../components/Joystick';

export default function JumpSolo() {
  console.log("JumpSolo Component Rendered");
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'victory'>('menu');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [aliveCount, setAliveCount] = useState(8);
  const [debugMsg, setDebugMsg] = useState('');

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const renderCountRef = useRef(0);
  
  const playerRef = useRef({
    x: 0, y: PLATFORM_RADIUS * 0.5, z: 0,
    vx: 0, vy: 0, vz: 0,
    isJumping: false, dead: false
  });
  
  const botsRef = useRef<any[]>([]);
  const armRef = useRef({ angle: 0, speed: 1.5 });
  const inputsRef = useRef({ x: 0, y: 0, jump: false });
  const timeRef = useRef(0);
  const shakeRef = useRef(0);
  const particlesRef = useRef<any[]>([]);
  
  // Camera
  const camRef = useRef({ x: 0, y: 0 });

  const handleJoystick = useCallback((dx: number, dy: number) => {
    inputsRef.current.x = dx;
    inputsRef.current.y = dy;
  }, []);

  // Prevent scrolling while in the game
  useEffect(() => {
    if (canvasRef.current) {
      console.log("Canvas Created", canvasRef.current.width, canvasRef.current.height);
      console.log("Canvas client size:", canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    } else {
      console.log("Canvas is NULL on mount");
      setDebugMsg("Canvas is NULL");
    }
    
    const timeout = setTimeout(() => {
      if (renderCountRef.current === 0) {
        setDebugMsg("Game Loop Did Not Start. requestAnimationFrame failed.");
      } else {
        console.log("Game loop is running. Render count:", renderCountRef.current);
        if (!canvasRef.current || canvasRef.current.clientWidth === 0) {
           setDebugMsg("Canvas client width is 0. Canvas is not visible.");
        }
      }
    }, 2000);

    const preventDefault = (e: TouchEvent) => {
      // Don't prevent default if it's a click on a button, but mostly we want to prevent scrolling
      if (e.touches && e.touches.length > 0) {
         e.preventDefault();
      }
    };
    
    // Use passive: false to allow preventDefault
    document.addEventListener('touchmove', preventDefault, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventDefault);
    };
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
    camRef.current = { x: 0, y: 0 };
    particlesRef.current = [];
    
    // Init Bots
    const newBots = [];
    const types = ['blue', 'red', 'green', 'purple', 'gold', 'snow', 'robot'];
    for(let i=0; i<7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const r = PLATFORM_RADIUS * 0.5;
        newBots.push({
            id: `bot_${i}`,
            name: `Bot ${i+1}`,
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r,
            z: 0, vx: 0, vy: 0, vz: 0,
            isJumping: false, dead: false,
            difficulty: i < 2 ? 'easy' : (i < 5 ? 'normal' : 'hard'),
            characterType: types[i % types.length]
        });
    }
    botsRef.current = newBots;
    setAliveCount(8);

    setScore(0);
    setTime(0);
    setGameState('playing');
    lastTimeRef.current = performance.now();
  };

  const spawnParticles = (x: number, y: number, color: string, count: number = 15) => {
    for (let i = 0; i < count; i++) {
       particlesRef.current.push({
           x, y,
           vx: (Math.random() - 0.5) * 400,
           vy: (Math.random() - 0.5) * 400,
           life: 1,
           color
       });
    }
  };

  const updateCharacter = (c: any, dt: number, isBot: boolean, nowTime: number) => {
      if (c.dead) {
          c.z -= 800 * dt;
          return;
      }

      // Jumping physics
      if (c.isJumping) {
          c.z += c.vz * dt;
          c.vz -= GRAVITY * dt;
          if (c.z <= 0) {
              c.z = 0;
              c.vz = 0;
              c.isJumping = false;
              spawnParticles(c.x, c.y, 'rgba(34, 211, 238, 0.5)', 5); // landing dust
              if (!isBot) audio.playNoise(0.2, 100, 0.1);
          }
      }

      // Check fall off
      const dist = Math.sqrt(c.x * c.x + c.y * c.y);
      if (dist > PLATFORM_RADIUS + 10) {
          c.dead = true;
          spawnParticles(c.x, c.y, '#ef4444', 20);
          if (!isBot) {
              shakeRef.current = 15;
              audio.playToneWithADSR('sawtooth', 200, 0.05, 0.2, 0.2, 0.2, 0.5);
          }
      }

      // Collision with arm
      if (!c.dead && c.z < ARM_HEIGHT) {
          const dx = Math.cos(armRef.current.angle);
          const dy = Math.sin(armRef.current.angle);
          const projLength = c.x * dx + c.y * dy;
          
          if (projLength > 0 && projLength < PLATFORM_RADIUS) {
              const cx = projLength * dx;
              const cy = projLength * dy;
              const distToArm = Math.sqrt((c.x - cx)**2 + (c.y - cy)**2);
              
              if (distToArm < PLAYER_RADIUS + ARM_WIDTH/2) {
                  const pushX = -dy * armRef.current.speed * 400;
                  const pushY = dx * armRef.current.speed * 400;
                  c.x += pushX * dt;
                  c.y += pushY * dt;
                  if (!isBot) {
                      shakeRef.current = 10;
                      audio.playToneWithADSR('square', 300, 0.05, 0.1, 0.1, 0.1, 0.2);
                  }
              }
          }
      }

      // Movement Trail
      const speed = Math.sqrt(c.vx*c.vx + c.vy*c.vy);
      if (speed > 10 && c.z === 0 && Math.random() < 0.3) {
          particlesRef.current.push({
             x: c.x, y: c.y,
             vx: 0, vy: 0,
             life: 0.4,
             color: isBot ? 'rgba(59, 130, 246, 0.3)' : 'rgba(217, 70, 239, 0.3)'
          });
      }
  };

  const loop = useCallback((now: number) => {
    try {
      if (!lastTimeRef.current) {
        console.log("Game Loop Started");
        lastTimeRef.current = now;
      }
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;
      
      if (renderCountRef.current === 0) {
        console.log("Player inside loop:", playerRef.current);
        console.log("Canvas context exists?", !!canvasRef.current?.getContext('2d'));
      }
      renderCountRef.current++;


      if (gameState === 'playing') {
        timeRef.current += dt;
        if (Math.floor(timeRef.current) > time) {
            setTime(Math.floor(timeRef.current));
            setScore(prev => prev + 10);
        }

        // Speed curve
        let targetSpeed = 1.5;
        if (timeRef.current < 20) targetSpeed = 1.5;
        else if (timeRef.current < 40) targetSpeed = 2.5;
        else if (timeRef.current < 60) targetSpeed = 3.5;
        else targetSpeed = 4.5 + (timeRef.current - 60) * 0.05;

        armRef.current.speed += (targetSpeed - armRef.current.speed) * dt;
        armRef.current.angle += armRef.current.speed * dt;

        const p = playerRef.current;
        
        if (!p.dead) {
            const maxSpeed = 350;
            let ix = inputsRef.current.x;
            let iy = inputsRef.current.y;
            
            let mag = Math.sqrt(ix * ix + iy * iy);
            if (mag > 1) {
                ix /= mag;
                iy /= mag;
            }
            
            const targetVx = ix * maxSpeed;
            const targetVy = iy * maxSpeed;
            
            // Gradual acceleration and deceleration for smooth feel
            p.vx += (targetVx - p.vx) * 25 * dt;
            p.vy += (targetVy - p.vy) * 25 * dt;
            
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }
        
        updateCharacter(p, dt, false, timeRef.current);

        // Bot AI
        botsRef.current.forEach(b => {
            if (!b.dead) {
                // Smart Movement
                if (!(b as any).targetPos || Math.random() < 0.01) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * (PLATFORM_RADIUS - 50);
                    (b as any).targetPos = {
                        x: Math.cos(angle) * radius,
                        y: Math.sin(angle) * radius
                    };
                }
                
                // Avoid grouping
                let avoidX = 0, avoidY = 0;
                botsRef.current.forEach(other => {
                    if (other !== b && !other.dead) {
                       const dx = b.x - other.x;
                       const dy = b.y - other.y;
                       const dist = Math.sqrt(dx*dx + dy*dy);
                       if (dist < 40 && dist > 0) {
                           avoidX += (dx/dist);
                           avoidY += (dy/dist);
                       }
                    }
                });

                const tx = (b as any).targetPos.x - b.x;
                const ty = (b as any).targetPos.y - b.y;
                const tdist = Math.sqrt(tx*tx + ty*ty);
                
                const speed = b.difficulty === 'hard' ? 250 : b.difficulty === 'normal' ? 200 : 150;
                
                if (tdist > 10) {
                    const moveX = (tx/tdist) + avoidX * 2;
                    const moveY = (ty/tdist) + avoidY * 2;
                    const mdist = Math.sqrt(moveX*moveX + moveY*moveY);
                    b.vx += ((moveX/(mdist||1)) * speed - b.vx) * 10 * dt;
                    b.vy += ((moveY/(mdist||1)) * speed - b.vy) * 10 * dt;
                }

                b.x += b.vx * dt;
                b.y += b.vy * dt;

                // AI Jump Prediction
                // Distance to center
                const distFromCenter = Math.sqrt(b.x*b.x + b.y*b.y);
                if (distFromCenter < PLATFORM_RADIUS) {
                    // Angle of bot relative to center
                    let botAngle = Math.atan2(b.y, b.x);
                    if (botAngle < 0) botAngle += Math.PI * 2;
                    
                    let armA = armRef.current.angle % (Math.PI * 2);
                    if (armA < 0) armA += Math.PI * 2;
                    
                    let aDiff = botAngle - armA;
                    if (aDiff < 0) aDiff += Math.PI * 2;
                    
                    const timeToImpact = aDiff / armRef.current.speed;
                    
                    let jumpThreshold = 0;
                    if (b.difficulty === 'easy') jumpThreshold = 0.35 + Math.random()*0.2;
                    if (b.difficulty === 'normal') jumpThreshold = 0.45 + Math.random()*0.1;
                    if (b.difficulty === 'hard') jumpThreshold = 0.5 + Math.random()*0.05;
      
                    if (timeToImpact > 0 && timeToImpact < jumpThreshold && !b.isJumping && b.z === 0) {
                        const errorChance = b.difficulty === 'easy' ? 0.15 : b.difficulty === 'normal' ? 0.05 : 0.01;
                        if (Math.random() < errorChance) { /* human error */ }
                        else {
                            b.vz = JUMP_FORCE;
                            b.isJumping = true;
                        }
                    }
                }
            }
            updateCharacter(b, dt, true, timeRef.current);
        });

        // Count alive
        let aliveCountNow = (p.dead ? 0 : 1) + botsRef.current.filter(b => !b.dead).length;
        if (aliveCountNow !== aliveCount) setAliveCount(aliveCountNow);

        if (p.dead && gameState === 'playing') {
            setGameState('gameover');
            const s = getPlayerStats();
            doUpdateAchStats({
                jumpMaxSurviveTime: Math.max(s.jumpMaxSurviveTime || 0, Math.floor(timeRef.current)),
                jumpMaxScore: Math.max(s.jumpMaxScore || 0, score)
            });
            updatePlayerStats(storage.getPlayerId(), storage.getPlayerName() || 'Unknown', false, 0, score, 0, 'القفزة الأخيرة');
        } else if (!p.dead && aliveCountNow === 1 && gameState === 'playing') {
            setGameState('victory');
            audio.playToneWithADSR('sine', 800, 0.05, 0.2, 0.5, 0.5, 0.5);
            const s = getPlayerStats();
            doUpdateAchStats({
                jumpMaxSurviveTime: Math.max(s.jumpMaxSurviveTime || 0, Math.floor(timeRef.current)),
                jumpMaxScore: Math.max(s.jumpMaxScore || 0, score)
            });
            updatePlayerStats(storage.getPlayerId(), storage.getPlayerName() || 'Unknown', true, 0, score, 0, 'القفزة الأخيرة');
        }

        // Update particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
           const pt = particlesRef.current[i];
           pt.life -= dt * 2;
           pt.x += pt.vx * dt;
           pt.y += pt.vy * dt;
           if (pt.life <= 0) particlesRef.current.splice(i, 1);
        }
        
        // Camera smooth follow
        const zoom = 1.5;
        const targetCamX = -p.x * zoom;
        const targetCamY = -(p.y - p.z * 0.3) * (zoom * 0.5);
        camRef.current.x += (targetCamX - camRef.current.x) * 0.15;
        camRef.current.y += (targetCamY - camRef.current.y) * 0.15;
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
          
          ctx.translate(width / 2 + camRef.current.x, height / 2 + 50 + camRef.current.y);
          ctx.scale(1.5, 1.5 * 0.5); // Isometric scale with 1.5x zoom

          drawFuturisticArena(ctx, timeRef.current);
          drawArm(ctx, armRef.current.angle, timeRef.current);

          // Particles
          particlesRef.current.forEach(pt => {
             ctx.fillStyle = pt.color;
             ctx.globalAlpha = pt.life;
             ctx.beginPath();
             ctx.arc(pt.x, pt.y, 4, 0, Math.PI*2);
             ctx.fill();
          });
          ctx.globalAlpha = 1.0;

          // Draw bots
          botsRef.current.forEach(b => {
             drawFuturisticPlayer(ctx, b.x, b.y, b.z, b.vx, b.vy, b.isJumping, b.dead, '#3b82f6', timeRef.current, false, b.name, b.characterType);
          });

          // Draw Player
          const p = playerRef.current;
          drawFuturisticPlayer(ctx, p.x, p.y, p.z, p.vx, p.vy, p.isJumping, p.dead, '#c026d3', timeRef.current, gameState === 'victory', 'أنت', 'neon');

          ctx.restore(); // scale & camera & shake
        }
      }
    } catch (err: any) {
      console.error("Error in JumpSolo loop:", err);
      if (!debugMsg) setDebugMsg(err.message || String(err));
    }
    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, time, aliveCount, user, score, handleJump, debugMsg]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, [loop]);

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] z-[9999] bg-slate-950 text-white overflow-hidden flex flex-col touch-none">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-fuchsia-950 opacity-50"></div>
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(192, 38, 211, 0.1) 0%, transparent 60%)'}}></div>

      {/* Neon HUD */}
      <header className="relative z-10 p-4 sm:p-6 flex justify-between items-start bg-gradient-to-b from-slate-950 to-transparent">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur border border-slate-800"
        >
          <ArrowRight className="w-5 h-5" />
          <span className="font-bold hidden sm:block">الرئيسية</span>
        </button>
        
        <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl md:text-3xl font-black font-heading tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
               القفزة الأخيرة
            </h1>
            {gameState === 'playing' && (
                <div className="flex gap-4 items-center">
                    <div className="bg-slate-900/80 px-4 py-1.5 rounded-full backdrop-blur border border-cyan-500/30 flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-cyan-400">{aliveCount} أحياء</span>
                    </div>
                    <div className="bg-slate-900/80 px-4 py-1.5 rounded-full backdrop-blur border border-fuchsia-500/30 font-bold text-fuchsia-400">
                        ⏱️ {time} ث
                    </div>
                </div>
            )}
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900/80 px-6 py-2 rounded-full backdrop-blur border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
          <Trophy className="w-5 h-5 text-fuchsia-400" />
          <span className="font-bold font-mono text-xl text-fuchsia-100">{score}</span>
        </div>
      </header>

      {/* Game Canvas */}
      <div className="flex-1 w-full relative flex items-center justify-center min-h-[50vh]">
        <canvas
          ref={canvasRef}
          width={1000}
          height={800}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: 'block' }}
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
                  تجاوز الذراع الدوارة بالقفز في الوقت المناسب. البقاء للأفضل!
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
                    className="flex flex-col items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-colors"
                  >
                    <RotateCcw className="w-6 h-6" />
                    العب مجدداً
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'victory' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 z-20"
            >
              <div className="bg-slate-900 border border-amber-500/50 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_80px_rgba(245,158,11,0.3)]">
                <div className="text-6xl mb-6 animate-bounce">🏆</div>
                <h2 className="text-4xl font-black text-white mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">أنت الفائز!</h2>
                <div className="text-amber-400 font-mono text-2xl font-bold mb-2">
                  النقاط: {score}
                </div>
                <div className="text-slate-400 mb-8">
                  صمدت لمدة {time} ثانية
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
                    className="flex flex-col items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-colors"
                  >
                    <RotateCcw className="w-6 h-6" />
                    العب مجدداً
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {debugMsg && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-900/80 text-white p-4 rounded-xl border border-red-500 z-50 text-center pointer-events-none">
            <h3 className="font-bold text-lg mb-2">Game Initialization Failed</h3>
            <pre className="text-xs text-left whitespace-pre-wrap">{debugMsg}</pre>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      {gameState === 'playing' && (
        <div className="absolute bottom-8 left-0 right-0 px-8 flex justify-between items-end pointer-events-none z-30" dir="ltr">
          <Joystick 
             onMove={(x, y) => handleJoystick(x, y)}
             onEnd={() => handleJoystick(0, 0)}
          />

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
