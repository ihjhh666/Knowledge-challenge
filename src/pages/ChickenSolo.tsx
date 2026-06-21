import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon, RotateCcw, Trophy, Target, Clock } from 'lucide-react';
import { chickenAudio } from '../lib/chickenAudio';
import { storage } from '../lib/storage';
import { supabaseService } from '../services/supabaseService';
import { PlayBackground } from '../components/PlayBackground';

const WORLD_W = 1300;
const WORLD_H = 950;

type ChickenType = 'normal' | 'golden' | 'bonus_box';
type Chicken = { id: number; x: number; y: number; vx: number; vy: number; type: ChickenType; state: 'wandering' | 'magnet' | 'carried'; carrierId: string | null; wobble: number; targetX?: number; targetY?: number };
type Player = { id: string; name: string; isBot: boolean; x: number; y: number; vx: number; vy: number; color: string; score: number; carryingChicken: 'none' | ChickenType; speedMultiplier: number; barn: { x: number; y: number; w: number; h: number; glow?: number }; wobble: number; dir: number; stealCooldown?: number; targetX?: number; targetY?: number; lastVx?: number; lastVy?: number; };
type Particle = { id: number; x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; type: 'feather' | 'sparkle' | 'text' | 'dust'; text?: string; angle: number; rotSpeed: number; fontSize?: number };
type EnvObj = { type: 'tree' | 'bush' | 'hay' | 'crate' | 'pond' | 'flower' | 'rock'; x: number; y: number; w: number; h: number; seed: number };

export default function ChickenSolo() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameState, setGameState] = useState<'playing' | 'results'>('playing');
  const [timeLeft, setTimeLeft] = useState(180);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const [currentEventMessage, setCurrentEventMessage] = useState<string | null>(null);
  const [scores, setScores] = useState<{id: string, name: string, color: string, score: number}[]>([]);

  useEffect(() => {
     const handleResize = () => {
        if(canvasRef.current && canvasRef.current.parentElement) {
            canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
            canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
        }
     };
     handleResize();
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, []);

  const playersRef = useRef<Player[]>([]);
  const chickensRef = useRef<Chicken[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const envRef = useRef<EnvObj[]>([]);
  const timeRef = useRef<number>(180);
  const stateRef = useRef<'playing' | 'results'>('playing');
  const nextEventTimeRef = useRef<number>(30);
  const chickenSpawnTimersRef = useRef<number[]>([]);

  const inputRef = useRef({ dx: 0, dy: 0 });
  const isJoystickActiveRef = useRef(false);
  const joystickThumbDivRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef({ x: 0, y: 0, shake: 0 });

  const spawnParticles = (x: number, y: number, type: Particle['type'], count: number, opts?: {text?: string, color?: string}) => {
    for(let i=0; i<count; i++) {
       particlesRef.current.push({
          id: Math.random(), x, y,
          vx: (Math.random() - 0.5) * 150, vy: (Math.random() - 0.5) * 150 - (type === 'text' ? 50 : 0),
          life: 0, maxLife: type === 'text' ? 1.5 : 0.6 + Math.random()*0.4,
          size: type === 'feather' ? 6 + Math.random()*6 : type === 'text' ? (opts?.text?.includes('+') ? 32 : 24) : 3 + Math.random()*4,
          color: opts?.color || 'white', type, text: opts?.text,
          angle: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 10
       });
    }
  };

  const spawnChicken = (type: ChickenType) => {
     let x, y;
     let attempts = 0;
     do {
        x = 100 + Math.random() * (WORLD_W - 200);
        y = 100 + Math.random() * (WORLD_H - 200);
        attempts++;
     } while(attempts < 10 && (
         envRef.current.some(e => e.type === 'pond' && Math.hypot(e.x-x, e.y-y) < e.w) ||
         chickensRef.current.some(c => Math.hypot(c.x-x, c.y-y) < 100) // Prevent clustering
     ));

     chickensRef.current.push({
        id: Math.random(), x, y, vx: 0, vy: 0, type, state: 'wandering', carrierId: null, wobble: Math.random() * Math.PI
     });
     if (type === 'bonus_box' || type === 'golden') {
         spawnParticles(x, y, 'sparkle', 10, {color: 'yellow'});
     }
  };

  const scheduleChickenSpawn = () => {
      const delay = 2 + Math.random() * 3; // 2 to 5 seconds
      chickenSpawnTimersRef.current.push(delay);
  };

  const initGame = useCallback(() => {
    timeRef.current = 180;
    setTimeLeft(180);
    setGameState('playing');
    stateRef.current = 'playing';
    setIsWin(null);
    setCurrentEventMessage(null);
    nextEventTimeRef.current = 180 - (20 + Math.random() * 20);
    particlesRef.current = [];
    chickenSpawnTimersRef.current = [];

    // Environment Generation (Less dense)
    envRef.current = [];
    const addEnv = (type: EnvObj['type'], count: number) => {
       for(let i=0; i<count; i++) {
          const x = 150 + Math.random() * (WORLD_W - 300);
          const y = 150 + Math.random() * (WORLD_H - 300);
          if (x < 350 && y < 350) continue; 
          if (x > WORLD_W-350 && y < 350) continue; 
          if (x < 350 && y > WORLD_H-350) continue; 
          if (x > WORLD_W-350 && y > WORLD_H-350) continue; 
          envRef.current.push({ type, x, y, w: 40 + Math.random()*50, h: 40 + Math.random()*50, seed: Math.random() });
       }
    };
    addEnv('pond', 1);
    addEnv('tree', 8);
    addEnv('bush', 12);
    addEnv('hay', 6);
    addEnv('crate', 4);
    addEnv('rock', 8);
    addEnv('flower', 15);

    const pd = 120;
    const bw = 120, bh = 120;
    const pName = storage.getPlayerName() || 'أنت';
    playersRef.current = [
      { id: 'p1', name: pName, isBot: false, x: pd, y: WORLD_H - pd, vx: 0, vy: 0, color: '#3b82f6', score: 0, carryingChicken: 'none', speedMultiplier: 1, barn: { x: 30, y: WORLD_H - 150, w: bw, h: bh }, wobble: 0, dir: 1, stealCooldown: 0 },
      { id: 'b1', name: 'روبوت 1', isBot: true, x: pd, y: pd, vx: 0, vy: 0, color: '#ef4444', score: 0, carryingChicken: 'none', speedMultiplier: 1, barn: { x: 30, y: 30, w: bw, h: bh }, wobble: 0, dir: 1, stealCooldown: 0 },
      { id: 'b2', name: 'روبوت 2', isBot: true, x: WORLD_W - pd, y: pd, vx: 0, vy: 0, color: '#22c55e', score: 0, carryingChicken: 'none', speedMultiplier: 1, barn: { x: WORLD_W - 150, y: 30, w: bw, h: bh }, wobble: 0, dir: -1, stealCooldown: 0 },
      { id: 'b3', name: 'روبوت 3', isBot: true, x: WORLD_W - pd, y: WORLD_H - pd, vx: 0, vy: 0, color: '#eab308', score: 0, carryingChicken: 'none', speedMultiplier: 1, barn: { x: WORLD_W - 150, y: WORLD_H - 150, w: bw, h: bh }, wobble: 0, dir: -1, stealCooldown: 0 }
    ];

    chickensRef.current = [];
    for(let i=0; i<10; i++) spawnChicken(Math.random() > 0.95 ? 'golden' : 'normal');

    updateScores();
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const updateScores = () => {
     setScores(playersRef.current.map(p => ({
         id: p.id, name: p.name, color: p.color, score: p.score
     })).sort((a,b) => b.score - a.score));
  };

  const debugMetricsRef = useRef({ fps: 0, logic: 0, render: 0, frames: 0, lastFpsTime: performance.now(), inputLag: 0 });

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    const loop = (time: number) => {
      animationId = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (time - lastTime) / 1000); // Max 50ms per physics tick to prevent lag spikes
      lastTime = time;
      if (stateRef.current !== 'playing') return;
      
      const t0 = performance.now();
      update(dt);
      const t1 = performance.now();
      draw();
      const t2 = performance.now();
      
      debugMetricsRef.current.logic = t1 - t0;
      debugMetricsRef.current.render = t2 - t1;
    };
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const update = (dt: number) => {
    const players = playersRef.current;
    const chickens = chickensRef.current;
    const p1 = players[0];

    // Spawn Scheduled Chickens
    for (let i = chickenSpawnTimersRef.current.length - 1; i >= 0; i--) {
        chickenSpawnTimersRef.current[i] -= dt;
        if (chickenSpawnTimersRef.current[i] <= 0 && chickens.length < 10) { // Max 10 chickens active
            spawnChicken(Math.random() > 0.90 ? 'golden' : 'normal');
            chickenSpawnTimersRef.current.splice(i, 1);
        } else if (chickenSpawnTimersRef.current[i] <= 0) {
            chickenSpawnTimersRef.current.splice(i, 1); // Drop if reaching limit
        }
    }

    // Input -> Player 1 (Immediate response)
    const speed = 320 * p1.speedMultiplier; 
    const len = Math.hypot(inputRef.current.dx, inputRef.current.dy);
    if (len > 0) {
      const limit = 40;
      const normalizedFactor = Math.min(len / limit, 1.0);
      p1.vx = (inputRef.current.dx / len) * speed * normalizedFactor;
      p1.vy = (inputRef.current.dy / len) * speed * normalizedFactor;
      if (len > 5) {
          p1.dir = p1.vx > 0 ? 1 : -1;
      }
    } else {
      p1.vx = 0; p1.vy = 0;
    }

    // Bots logic
    for (let i = 1; i < players.length; i++) {
      const bot = players[i];
      const botSpeed = 280 * bot.speedMultiplier;
      if (bot.stealCooldown) bot.stealCooldown -= dt;

      if (bot.carryingChicken !== 'none') {
        // Return to barn smoothly
        const dx = (bot.barn.x + bot.barn.w/2) - bot.x;
        const dy = (bot.barn.y + bot.barn.h/2) - bot.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
          bot.vx = (dx / dist) * botSpeed;
          bot.vy = (dy / dist) * botSpeed;
        }
      } else {
        let nearestDist = Infinity;
        let targetChicken = null;
        
        // Find nearest wandering chicken
        for (const c of chickens) {
          if (c.state === 'wandering') {
            const dist = Math.hypot(c.x - bot.x, c.y - bot.y);
            if (dist < nearestDist) { nearestDist = dist; targetChicken = c; }
          }
        }
        
        if (targetChicken) {
          const dx = targetChicken.x - bot.x;
          const dy = targetChicken.y - bot.y;
          if (nearestDist > 5) {
            bot.vx = (dx / nearestDist) * botSpeed;
            bot.vy = (dy / nearestDist) * botSpeed;
          }
        } else {
          // Wander naturally
          if (!bot.targetX || Math.hypot(bot.targetX - bot.x, bot.targetY! - bot.y) < 20) {
             bot.targetX = 100 + Math.random() * (WORLD_W - 200);
             bot.targetY = 100 + Math.random() * (WORLD_H - 200);
          }
          const dx = bot.targetX - bot.x;
          const dy = bot.targetY! - bot.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 5) {
            bot.vx = (dx / dist) * botSpeed * 0.5;
            bot.vy = (dy / dist) * botSpeed * 0.5;
          }
        }
      }
      if (bot.vx !== 0) bot.dir = bot.vx > 0 ? 1 : -1;
    }

    // Move players & catch chickens
    for (const p of players) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.x = Math.max(25, Math.min(WORLD_W - 25, p.x));
      p.y = Math.max(25, Math.min(WORLD_H - 25, p.y));

      if (Math.hypot(p.vx, p.vy) > 10) {
         p.wobble += dt * 25; // Faster wobble for more dynamic look
         if (p.lastVx !== undefined && p.lastVy !== undefined) {
             const dot = (p.vx * p.lastVx + p.vy * p.lastVy) / (Math.hypot(p.vx, p.vy) * Math.hypot(p.lastVx, p.lastVy) || 1);
             if (dot < 0.2 && Math.hypot(p.lastVx, p.lastVy) > 50) {
                 spawnParticles(p.x, p.y + 15, 'dust', 4, {color: 'rgba(0,0,0,0.15)'});
             }
         }
         if (Math.random() < 0.25) spawnParticles(p.x, p.y + 15, 'dust', 1, {color: 'rgba(0,0,0,0.1)'});
      } else { 
         p.wobble += dt * 5; // Idle breathing
      }
      p.lastVx = p.vx;
      p.lastVy = p.vy;

      // Catch chickens
      if (p.carryingChicken === 'none') {
        for (let i = chickens.length - 1; i >= 0; i--) {
          const c = chickens[i];
          if (c.state === 'wandering') {
            if (Math.hypot(p.x - c.x, p.y - c.y) < 45) { // Faster/generous pickup
              if (c.type === 'bonus_box') {
                 p.score += 10;
                 if (!p.isBot) { chickenAudio.playWin(); cameraRef.current.shake = 10; }
                 spawnParticles(c.x, c.y, 'text', 1, {text: '+10', color: '#ec4899'});
                 spawnParticles(c.x, c.y, 'sparkle', 15, {color: 'magenta'});
                 chickens.splice(i, 1);
                 updateScores();
                 checkWinCondition();
              } else {
                 c.state = 'magnet';
                 c.carrierId = p.id;
                 p.carryingChicken = c.type;
                 if (!p.isBot) chickenAudio.playPickup();
                 spawnParticles(c.x, c.y, 'feather', 3, {color: c.type === 'golden' ? 'yellow' : 'white'});
                 spawnParticles(p.x, p.y - 30, 'text', 1, {text: '+1', color: 'rgba(255,255,255,0.9)'});
                 break;
              }
            }
          }
        }
      }

      // Drop in Barn
      if (p.carryingChicken !== 'none') {
        if (p.x > p.barn.x - 10 && p.x < p.barn.x + p.barn.w + 10 &&
            p.y > p.barn.y - 10 && p.y < p.barn.y + p.barn.h + 10) {
          
          let pts = 1;
          const cIdx = chickens.findIndex(ch => ch.carrierId === p.id);
          if (cIdx !== -1) {
              if (chickens[cIdx].type === 'golden') pts = 5;
              chickens.splice(cIdx, 1);
          }
          
          p.score += pts;
          p.carryingChicken = 'none';
          if (!p.isBot) { chickenAudio.playDrop(); cameraRef.current.shake = pts > 1 ? 20 : 12; }
          
          spawnParticles(p.barn.x + p.barn.w/2, p.barn.y - 10, 'text', 1, {text: `+${pts}`, color: pts > 1 ? '#fde047' : '#4ade80'});
          spawnParticles(p.barn.x + p.barn.w/2, p.barn.y + p.barn.h/2, 'sparkle', pts > 1 ? 25 : 10, {color: pts > 1 ? '#facc15' : '#60a5fa'});
          p.barn.glow = 1.0;

          scheduleChickenSpawn();
          updateScores();
          checkWinCondition();
        }
      }
      if (p.barn.glow) p.barn.glow = Math.max(0, p.barn.glow - dt * 2);
    }

    // Update Chickens
    for (const c of chickens) {
      if (c.state === 'wandering') {
         if(Math.random() < 0.02) {
             c.targetX = c.x + (Math.random()-0.5)*100;
             c.targetY = c.y + (Math.random()-0.5)*100;
         }
         if (c.targetX !== undefined && c.targetY !== undefined) {
             const dist = Math.hypot(c.targetX - c.x, c.targetY - c.y);
             if (dist > 5) {
                 c.vx += ((c.targetX - c.x)/dist * 60 - c.vx) * dt * 3;
                 c.vy += ((c.targetY - c.y)/dist * 60 - c.vy) * dt * 3;
             } else {
                 c.targetX = undefined;
             }
         }
         
         c.x += c.vx * dt; c.y += c.vy * dt;
         c.vx *= 0.85; c.vy *= 0.85;
         c.x = Math.max(20, Math.min(WORLD_W - 20, c.x));
         c.y = Math.max(20, Math.min(WORLD_H - 20, c.y));
         if (Math.hypot(c.vx, c.vy) > 5) c.wobble += dt * 18;

      } else if (c.state === 'magnet') {
         const carrier = players.find(p => p.id === c.carrierId);
         if (carrier) {
             const dx = carrier.x - c.x;
             const dy = carrier.y - c.y - 20;
             const dist = Math.hypot(dx, dy);
             if (dist < 15) {
                 c.state = 'carried';
             } else {
                 c.x += (dx / dist) * 800 * dt; // extremely fast pull
                 c.y += (dy / dist) * 800 * dt;
             }
         } else { c.state = 'wandering'; }
      } else if (c.state === 'carried') {
         const carrier = players.find(p => p.id === c.carrierId);
         if (carrier) { c.x = carrier.x; c.y = carrier.y - 30; c.wobble = carrier.wobble; }
      }
    }

    // Particles Update
    for(let i=particlesRef.current.length-1; i>=0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx * dt; pt.y += pt.vy * dt;
        pt.life += dt;
        pt.angle += pt.rotSpeed * dt;
        if(pt.type === 'text') {
            pt.vy -= 100 * dt; // Float up
            pt.vx *= 0.95;
        } else {
            pt.vy += 150 * dt; // gravity
        }
        if(pt.life >= pt.maxLife) particlesRef.current.splice(i, 1);
    }

    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
        if (canvas.width !== canvas.parentElement.clientWidth) canvas.width = canvas.parentElement.clientWidth;
        if (canvas.height !== canvas.parentElement.clientHeight) canvas.height = canvas.parentElement.clientHeight;
    }
    const cw = canvas?.width || 1000;
    const ch = canvas?.height || 750;
    
    // Zoom in for a closer, professional view
    let camScale = cw / 750;
    if (ch / camScale > WORLD_H) {
        camScale = ch / WORLD_H;
    }
    
    const viewW = cw / camScale;
    const viewH = ch / camScale;
    
    let targetCamX = p1.x - viewW / 2;
    let targetCamY = p1.y - viewH / 2;
    targetCamX = viewW > WORLD_W ? (WORLD_W - viewW) / 2 : Math.max(0, Math.min(WORLD_W - viewW, targetCamX));
    targetCamY = viewH > WORLD_H ? (WORLD_H - viewH) / 2 : Math.max(0, Math.min(WORLD_H - viewH, targetCamY));
    
    // Smooth camera follow without lag
    cameraRef.current.x += (targetCamX - cameraRef.current.x) * dt * 15;
    cameraRef.current.y += (targetCamY - cameraRef.current.y) * dt * 15;
    if (cameraRef.current.shake > 0) cameraRef.current.shake = Math.max(0, cameraRef.current.shake - dt * 30);
  };

  const executeRandomEvent = useCallback(() => {
      const events = ['EXPLOSION', 'GOLDEN', 'SPEED', 'BONUS_BOX'];
      const ev = events[Math.floor(Math.random() * events.length)];
      chickenAudio.playEventAlert();

      if (ev === 'EXPLOSION') {
         setCurrentEventMessage('انفجار دجاج! تضاعف العدد');
         for(let i=0; i<8; i++) spawnChicken('normal');
      } else if (ev === 'GOLDEN') {
         setCurrentEventMessage('ظهرت الدجاجة الذهبية! (5 نقاط)');
         spawnChicken('golden');
      } else if (ev === 'SPEED') {
         setCurrentEventMessage('جرعة سرعة للجميع!');
         playersRef.current.forEach(p => {
             p.speedMultiplier = 1.6;
             spawnParticles(p.x, p.y, 'sparkle', 10, {color: 'cyan'});
         });
         setTimeout(() => { playersRef.current.forEach(p => p.speedMultiplier = 1); }, 6000);
      } else if (ev === 'BONUS_BOX') {
         setCurrentEventMessage('صندوق مكافأة! يعطي 10 نقاط');
         spawnChicken('bonus_box');
      }
      setTimeout(() => setCurrentEventMessage(null), 3000);
  }, []);

  const checkWinCondition = useCallback(() => {
      const p1 = playersRef.current[0];
      const maxScore = Math.max(...playersRef.current.map(p => p.score));
      if (maxScore >= 50) endGame(p1.score >= 50 && p1.score === maxScore);
  }, []);

  const endGame = useCallback((won: boolean) => {
      stateRef.current = 'results';
      setGameState('results');
      setIsWin(won);
      updateScores();
      if (won) chickenAudio.playWin(); else chickenAudio.playLose();
      const pId = storage.getPlayerId();
      const pName = storage.getPlayerName() || 'أنت';
      supabaseService.updatePlayerStats(pId, pName, won, 0, 0, playersRef.current[0].score, '🐔 جمع الدجاج');
  }, []);

  useEffect(() => {
     if (gameState !== 'playing') return;
     const t = setInterval(() => {
        if (timeRef.current <= 0) {
           clearInterval(t);
           const p1Score = playersRef.current[0].score;
           const maxScore = Math.max(...playersRef.current.map(p => p.score));
           endGame(p1Score === maxScore);
           return;
        }
        timeRef.current--;
        setTimeLeft(timeRef.current);

        if (timeRef.current === Math.floor(nextEventTimeRef.current)) {
            executeRandomEvent();
            nextEventTimeRef.current = timeRef.current - (15 + Math.random() * 20);
        }
     }, 1000);
     return () => clearInterval(t);
  }, [gameState, endGame, executeRandomEvent]);

  // ======= DRAWING =======
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    
    if (canvas.parentElement) {
        if (canvas.width !== canvas.parentElement.clientWidth) canvas.width = canvas.parentElement.clientWidth;
        if (canvas.height !== canvas.parentElement.clientHeight) canvas.height = canvas.parentElement.clientHeight;
    }
    const cw = canvas.width;
    const ch = canvas.height;
    
    // Match camera zoom
    let camScale = cw / 750;
    if (ch / camScale > WORLD_H) {
        camScale = ch / WORLD_H;
    }
    
    const viewW = cw / camScale;
    const viewH = ch / camScale;

    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    
    // Dynamic scale to perfectly bound the world
    ctx.scale(camScale, camScale);
    let shakeX = 0; let shakeY = 0;
    if (cameraRef.current.shake > 0) {
        shakeX = (Math.random() - 0.5) * cameraRef.current.shake;
        shakeY = (Math.random() - 0.5) * cameraRef.current.shake;
    }
    ctx.translate(-cameraRef.current.x + shakeX, -cameraRef.current.y + shakeY);
    
    // Background 
    ctx.fillStyle = '#65a30d'; // vibrant grass
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    
    // Viewport Culling Bounds
    const cullMargin = 150;
    const viewLeft = cameraRef.current.x - cullMargin;
    const viewRight = cameraRef.current.x + viewW + cullMargin;
    const viewTop = cameraRef.current.y - cullMargin;
    const viewBottom = cameraRef.current.y + viewH + cullMargin;

    // Grass pattern (culled)
    ctx.fillStyle = '#84cc16'; 
    for(let i=0; i<150; i++) {
        const x = (Math.sin(i * 1234) * 0.5 + 0.5) * WORLD_W;
        const y = (Math.cos(i * 4321) * 0.5 + 0.5) * WORLD_H;
        if (x > viewLeft && x < viewRight && y > viewTop && y < viewBottom) {
            ctx.beginPath(); ctx.arc(x, y, 15 + (i%3)*10, 0, Math.PI * 2); ctx.fill();
        }
    }

    // World Borders (Fences)
    ctx.fillStyle = '#78350f'; ctx.fillRect(0, 0, WORLD_W, 12); ctx.fillRect(0, WORLD_H-12, WORLD_W, 12); ctx.fillRect(0, 0, 12, WORLD_H); ctx.fillRect(WORLD_W-12, 0, 12, WORLD_H);

    // Sort entities for Y-depth sorting & apply culling
    const renderList: any[] = [];
    envRef.current.forEach(e => {
        if (e.x > viewLeft && e.x < viewRight && e.y > viewTop && e.y < viewBottom) {
            renderList.push({ ...e, z: e.y + e.h/2 });
        }
    });
    playersRef.current.forEach(p => renderList.push({ type: 'player', ref: p, z: p.y }));
    chickensRef.current.forEach(c => { 
        if(c.state === 'wandering' && c.x > viewLeft && c.x < viewRight && c.y > viewTop && c.y < viewBottom) {
             renderList.push({ type: 'chicken', ref: c, z: c.y }); 
        }
    });
    renderList.sort((a,b) => a.z - b.z);

    // Barns drawn underneath entities mostly
    playersRef.current.forEach(p => {
       ctx.save();
       ctx.translate(p.barn.x, p.barn.y);
       
       // Barn Base Drop Shadow
       ctx.fillStyle = 'rgba(0,0,0,0.2)';
       ctx.beginPath(); ctx.roundRect(0, p.barn.h/2, p.barn.w, p.barn.h/2 + 20, 16); ctx.fill();

       // Barn walls
       ctx.fillStyle = p.color;
       ctx.beginPath(); ctx.roundRect(0, 40, p.barn.w, p.barn.h - 40, 12); ctx.fill();
       
       if (p.barn.glow) {
           ctx.shadowColor = p.color; ctx.shadowBlur = Math.sin(p.barn.glow * Math.PI) * 20;
           ctx.beginPath(); ctx.roundRect(-2, 38, p.barn.w+4, p.barn.h - 36, 14); ctx.stroke();
           ctx.shadowBlur = 0;
       }
       
       // Door
       ctx.fillStyle = '#451a03';
       ctx.beginPath(); ctx.arc(p.barn.w/2, p.barn.h, 25, Math.PI, Math.PI*2); ctx.fill();

       // Roof
       ctx.fillStyle = p.color; ctx.filter = 'brightness(1.1)';
       ctx.beginPath(); ctx.moveTo(-10, 50); ctx.lineTo(p.barn.w/2, -10); ctx.lineTo(p.barn.w+10, 50); ctx.closePath(); ctx.fill();
       ctx.filter = 'none';

       // Score Glow Text
       ctx.shadowColor = 'black'; ctx.shadowBlur = 4;
       ctx.fillStyle = 'white'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
       ctx.fillText(`${p.score}`, p.barn.w/2, -15);
       ctx.shadowBlur = 0;
       
       ctx.restore();
    });

    // Draw sorted entities
    renderList.forEach(item => {
       if (item.type === 'pond') {
           ctx.fillStyle = '#0ea5e9';
           ctx.beginPath(); ctx.ellipse(item.x, item.y, item.w, item.h * 0.7, 0, 0, Math.PI*2); ctx.fill();
           ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(item.x - item.w*0.3, item.y - item.h*0.2, item.w*0.2, item.h*0.1, 0, 0, Math.PI*2); ctx.fill();
       } else if (item.type === 'tree') {
           ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(item.x, item.y + 40, 30, 15, 0, 0, Math.PI*2); ctx.fill();
           ctx.fillStyle = '#451a03'; ctx.fillRect(item.x - 10, item.y, 20, 40); 
           ctx.fillStyle = '#15803d'; 
           ctx.beginPath(); ctx.arc(item.x, item.y - 20, 35, 0, Math.PI*2); ctx.fill();
           ctx.beginPath(); ctx.arc(item.x - 20, item.y, 30, 0, Math.PI*2); ctx.fill();
           ctx.beginPath(); ctx.arc(item.x + 20, item.y, 30, 0, Math.PI*2); ctx.fill();
       } else if (item.type === 'bush') {
           ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.arc(item.x, item.y, item.w*0.4, 0, Math.PI*2); ctx.fill();
       } else if (item.type === 'hay') {
           ctx.fillStyle = '#eab308'; ctx.fillRect(item.x - 20, item.y - 20, 40, 40);
           ctx.fillStyle = '#ca8a04'; ctx.fillRect(item.x - 15, item.y - 15, 30, 30);
       } else if (item.type === 'crate') {
           ctx.fillStyle = '#92400e'; ctx.fillRect(item.x - 20, item.y - 20, 40, 40);
           ctx.strokeStyle = '#b45309'; ctx.lineWidth = 4; ctx.strokeRect(item.x - 20, item.y - 20, 40, 40);
           ctx.beginPath(); ctx.moveTo(item.x-20, item.y-20); ctx.lineTo(item.x+20, item.y+20); ctx.stroke();
       } else if (item.type === 'rock') {
           ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(item.x, item.y+5, item.w/4, item.w/8, 0, 0, Math.PI*2); ctx.fill();
           ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.arc(item.x - 2, item.y, item.w/4, 0, Math.PI*2); ctx.fill();
           ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(item.x + 2, item.y - 2, item.w/5, 0, Math.PI*2); ctx.fill();
       } else if (item.type === 'flower') {
           ctx.save(); ctx.translate(item.x, item.y);
           ctx.fillStyle = '#15803d'; ctx.fillRect(-1, 0, 2, 8);
           const fColor = item.seed > 0.5 ? '#ef4444' : (item.seed > 0.2 ? '#3b82f6' : '#eab308');
           ctx.fillStyle = fColor;
           for(let i=0; i<4; i++) {
               ctx.rotate(Math.PI/2);
               ctx.beginPath(); ctx.ellipse(4, 0, 4, 3, 0, 0, Math.PI*2); ctx.fill();
           }
           ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
           ctx.restore();
       } else if (item.type === 'chicken') {
           const c = item.ref as Chicken;
           ctx.save(); ctx.translate(c.x, c.y); 
           
           ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 12, 14, 7, 0, 0, Math.PI*2); ctx.fill();

           const yOffset = Math.sin(c.wobble) * 6;
           ctx.translate(0, -yOffset);
           if (c.vx !== 0) ctx.scale(c.vx > 0 ? 1 : -1, 1);

           if (c.type === 'golden') {
               ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline='middle';
               ctx.shadowColor = 'yellow'; ctx.shadowBlur = 10; ctx.fillText('🐣', 0, 0); ctx.shadowBlur = 0;
           } else if (c.type === 'bonus_box') {
               ctx.font = '36px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline='middle';
               ctx.shadowColor = '#ec4899'; ctx.shadowBlur = 15; ctx.fillText('🎁', 0, 0); ctx.shadowBlur = 0;
           } else {
               ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI*2); ctx.fill(); // body slightly larger
               ctx.beginPath(); ctx.arc(14, -8, 12, 0, Math.PI*2); ctx.fill(); // head
               ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(24, -8); ctx.lineTo(34, -4); ctx.lineTo(24, 0); ctx.fill(); // beak
               ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(14, -18, 6, 0, Math.PI*2); ctx.fill(); // comb
               ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(16, -10, 2.5, 0, Math.PI*2); ctx.fill(); // eye
               ctx.fillStyle = '#e2e8f0'; ctx.save(); ctx.rotate(Math.sin(c.wobble * 2) * 0.5); ctx.beginPath(); ctx.ellipse(-4, 4, 11, 6, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
           }
           ctx.restore();
       } else if (item.type === 'player') {
           const p = item.ref as Player;
           ctx.save(); ctx.translate(p.x, p.y);
           
           ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 22, 22, 9, 0, 0, Math.PI*2); ctx.fill();

           ctx.translate(0, -Math.abs(Math.sin(p.wobble) * 7));
           ctx.rotate(Math.sin(p.wobble * 0.5) * 0.08); // Subtle body tilt
           ctx.scale(p.dir, 1);

           ctx.fillStyle = p.color; ctx.beginPath(); ctx.roundRect(-20, -14, 40, 32, 16); ctx.fill(); // body 
           ctx.save();
           ctx.rotate(Math.sin(p.wobble) * 0.1); // Head tilts a bit more
           ctx.beginPath(); ctx.arc(0, -25, 20, 0, Math.PI*2); ctx.fill(); // head
           ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.roundRect(6, -32, 18, 12, 6); ctx.fill(); // visor
           ctx.restore();
           
           ctx.fillStyle = p.color; ctx.filter = 'brightness(0.8)';
           if (p.carryingChicken !== 'none') {
               ctx.beginPath(); ctx.roundRect(0, -6, 22, 9, 4); ctx.fill();
               ctx.save(); ctx.scale(p.dir, 1); ctx.translate(0, -60);
               ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline='middle';
               if(p.carryingChicken === 'golden') { ctx.shadowColor='yellow'; ctx.shadowBlur=10; ctx.fillText('🐣', 0, 0); ctx.shadowBlur=0; } 
               else if (p.carryingChicken === 'bonus_box') { ctx.shadowColor='#ec4899'; ctx.shadowBlur=10; ctx.fillText('🎁', 0, 0); ctx.shadowBlur=0; } 
               else { ctx.fillText('🐔', 0, 0); }
               ctx.restore();
           } else {
               ctx.beginPath(); ctx.roundRect(-6, -6, 9, 22, 4); ctx.fill(); 
           }
           ctx.filter = 'none';
           ctx.restore();

           ctx.save(); ctx.translate(p.x, p.y - 75 - (p.carryingChicken !== 'none' ? 30 : 0));
           ctx.font = 'bold 15px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
           const textW = ctx.measureText(p.name).width + 16;
           ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.roundRect(-textW/2, -12, textW, 24, 12); ctx.fill();
           ctx.fillStyle = p.id === 'p1' ? '#38bdf8' : 'white'; ctx.fillText(p.name, 0, 1);
           if (p.id === 'p1') { ctx.fillStyle = 'rgba(56, 189, 248, 0.5)'; ctx.beginPath(); ctx.moveTo(-6, 15); ctx.lineTo(6, 15); ctx.lineTo(0, 22); ctx.fill(); }
           ctx.restore();
       }
    });

    // Draw Particles
    particlesRef.current.forEach(pt => {
        if (pt.x < viewLeft || pt.x > viewRight || pt.y < viewTop || pt.y > viewBottom) return;
        ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.angle);
        const alpha = Math.max(0, 1 - pt.life / pt.maxLife);
        ctx.globalAlpha = alpha;
        if (pt.type === 'text') {
            ctx.font = `bold ${pt.size}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.fillStyle = pt.color; ctx.shadowColor = 'black'; ctx.shadowBlur = 4;
            ctx.fillText(pt.text || '', 0, 0);
        } else if (pt.type === 'feather') {
            ctx.fillStyle = pt.color; ctx.beginPath(); ctx.ellipse(0, 0, pt.size, pt.size/3, 0, 0, Math.PI*2); ctx.fill();
        } else if (pt.type === 'sparkle' || pt.type === 'dust') {
            ctx.fillStyle = pt.color; ctx.beginPath(); ctx.arc(0, 0, pt.size, 0, Math.PI*2); ctx.fill();
            if(pt.type === 'sparkle') { ctx.shadowColor = pt.color; ctx.shadowBlur = 10; }
        }
        ctx.restore();
    });

    // Draw Minimap (Smaller for mobile)
    const miniSize = 90;
    const miniX = viewW - miniSize - 16 + cameraRef.current.x;
    const miniY = viewH - miniSize * (WORLD_H/WORLD_W) - 16 + cameraRef.current.y;
    ctx.save(); ctx.translate(miniX, miniY);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(0, 0, miniSize, miniSize * (WORLD_H/WORLD_W), 8); ctx.fill(); ctx.stroke();
    const scale = miniSize / WORLD_W;
    playersRef.current.forEach(p => {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x * scale, p.y * scale, 3, 0, Math.PI*2); ctx.fill();
        if (p.id === 'p1') { ctx.shadowColor = 'white'; ctx.shadowBlur = 4; ctx.stroke(); ctx.shadowBlur = 0; }
    });
    ctx.fillStyle = 'white';
    chickensRef.current.forEach(c => {
       if(c.type === 'golden') ctx.fillStyle = 'yellow'; else if(c.type === 'bonus_box') ctx.fillStyle = '#ec4899'; else ctx.fillStyle = 'white';
       ctx.beginPath(); ctx.arc(c.x * scale, c.y * scale, 1.5, 0, Math.PI*2); ctx.fill();
    });
    ctx.restore();
    
    ctx.restore();
  };

  // Fixed Joystick Handlers
  const handleJoystickDown = (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      isJoystickActiveRef.current = true;
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      let x = e.clientX - rect.left; 
      let y = e.clientY - rect.top;
      
      let inputDx = x - centerX;
      let inputDy = y - centerY;
      const dist = Math.hypot(inputDx, inputDy);
      const limit = 40;
      
      if (dist > limit) { 
          inputDx = (inputDx / dist) * limit;
          inputDy = (inputDy / dist) * limit;
      }
      
      inputRef.current = { dx: inputDx, dy: inputDy };
      
      if (joystickThumbDivRef.current) {
          joystickThumbDivRef.current.style.transition = 'none';
          joystickThumbDivRef.current.style.transform = `translate(${inputDx}px, ${inputDy}px)`;
      }
  };
  
  const handleJoystickMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isJoystickActiveRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      let x = e.clientX - rect.left; 
      let y = e.clientY - rect.top;
      
      let inputDx = x - centerX;
      let inputDy = y - centerY;
      
      const dist = Math.hypot(inputDx, inputDy);
      const limit = 40;
      
      if (dist > limit) { 
          inputDx = (inputDx / dist) * limit;
          inputDy = (inputDy / dist) * limit;
      }
      
      inputRef.current = { dx: inputDx, dy: inputDy };
      
      if (joystickThumbDivRef.current) {
          joystickThumbDivRef.current.style.transform = `translate(${inputDx}px, ${inputDy}px)`;
      }
  };
  
  const handleJoystickUp = (e: React.PointerEvent<HTMLDivElement>) => {
      isJoystickActiveRef.current = false;
      inputRef.current = { dx: 0, dy: 0 }; 
      e.currentTarget.releasePointerCapture(e.pointerId);
      
      if (joystickThumbDivRef.current) {
          joystickThumbDivRef.current.style.transition = 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
          joystickThumbDivRef.current.style.transform = `translate(0px, 0px)`;
      }
  };

  // We removed debugInfo state.
  return (
    <>
    <PlayBackground theme="chicken" />
    <div className="fixed inset-0 z-[100] w-full h-[100svh] bg-transparent flex flex-col touch-none overflow-hidden font-sans">
      
      {/* 1. Game Area (Top) - Maximized */}
      <div 
         className="relative w-full mx-auto overflow-hidden bg-transparent flex-1 border-b-[3px] border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col"
      >
        
        {/* Game Canvas matches Game Area size */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0 pointer-events-none" />

        {/* 6. HUD Layer */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {/* Top Info Bar */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex gap-2 pointer-events-auto">
               <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center bg-black/30 backdrop-blur-md text-white rounded-xl hover:bg-black/50 transition-all shadow-lg border border-white/10 active:scale-95">
                  <ChevronRight className="w-5 h-5" />
               </button>
               
               {/* Standings */}
               <div className="flex flex-col gap-1.5 bg-black/30 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-lg">
                   {scores.slice(0, 2).map((s) => (
                      <div key={s.id} className="flex items-center justify-between min-w-[70px]">
                         <div className="flex items-center gap-1.5">
                             <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: s.color}}></div>
                             <span className={`text-xs font-bold ${s.id === 'p1' ? 'text-white' : 'text-slate-300'}`}>{s.name.substring(0, 8)}</span>
                         </div>
                         <span className="text-white font-mono font-bold text-xs ml-2">{s.score}</span>
                      </div>
                   ))}
               </div>
            </div>

            <div className="flex flex-col items-end gap-2 pointer-events-auto">
               <div className="flex gap-1.5">
                   <div className="bg-black/30 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10 shadow-lg">
                      <Target className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-sm font-bold font-mono text-white">50</span>
                   </div>
                   <div className="bg-black/30 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10 shadow-lg">
                      <Clock className="w-3.5 h-3.5 text-white/70" />
                      <span className={`text-sm font-bold font-mono ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-slate-100'}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                   </div>
               </div>
               {currentEventMessage && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-gradient-to-r from-amber-500/80 to-orange-500/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg mt-1">
                     <span className="text-white font-bold text-[10px] sm:text-xs">{currentEventMessage}</span>
                  </div>
               )}
            </div>
          </div>
        </div>

        {/* 4. Fixed Mobile Joystick */}
        {gameState === 'playing' && (
          <div 
            className="absolute bottom-6 left-6 w-24 h-24 z-30 touch-none pointer-events-auto rounded-full bg-black/10 border-2 border-white/10 backdrop-blur-[2px] shadow-lg flex items-center justify-center p-0 m-0 opacity-60 active:opacity-100 transition-opacity"
            onPointerDown={handleJoystickDown} 
            onPointerMove={handleJoystickMove} 
            onPointerUp={handleJoystickUp} 
            onPointerCancel={handleJoystickUp}
          >
             <div 
                ref={joystickThumbDivRef}
                className="absolute rounded-full bg-white/70 shadow-md pointer-events-none"
                style={{ width: 32, height: 32, transform: 'translate(0px, 0px)' }} 
             />
          </div>
        )}

      </div>

      {/* 7. Ad Area - Fixed Height */}
      <div className="w-full h-[50px] md:h-[90px] bg-slate-900 flex shrink-0 items-center justify-center relative z-30">
          <span className="text-white/20 font-bold text-[10px] md:text-sm tracking-widest uppercase">AD AREA</span>
      </div>

      {gameState === 'results' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-slate-900/90 p-8 rounded-[2rem] shadow-2xl max-w-md w-full border border-slate-800 text-center animate-in zoom-in-95 duration-500">
              <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                 {isWin ? (
                    <>
                       <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping pointer-events-none"></div>
                       <div className="relative z-10 w-28 h-28 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.6)] border-4 border-slate-800">
                          <Trophy className="w-14 h-14 text-yellow-50" />
                       </div>
                    </>
                 ) : (
                    <div className="w-28 h-28 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700">
                       <span className="text-6xl grayscale opacity-50">🐔</span>
                    </div>
                 )}
              </div>
              <h2 className={`text-4xl font-black mb-2 tracking-tight ${isWin ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-200' : 'text-white'}`}>
                 {isWin ? 'مزرعة الأبطال!' : 'حظ أوفر!'}
              </h2>
              <p className="text-slate-400 text-lg mb-8 font-medium">
                 {isWin ? 'لقد جمعت الدجاج أسرع من الجميع.' : 'البوتات كانت أسرع منك هذه المرة.'}
              </p>

              <div className="bg-slate-800/50 rounded-2xl p-4 mb-8 border border-slate-700/50 space-y-3">
                 {scores.slice(0,3).map((s, idx) => (
                    <div key={s.id} className={`flex justify-between items-center p-3 rounded-xl ${s.id === 'p1' ? 'bg-slate-700 border border-slate-600' : 'bg-transparent'}`}>
                       <div className="flex items-center gap-3">
                           <span className="font-bold text-xl w-6 text-left" style={{color: s.color}}>#{idx+1}</span>
                           <span className="font-bold text-white">{s.name}</span>
                       </div>
                       <div className="font-mono text-xl font-bold bg-slate-900 px-3 py-1 rounded-lg text-white">
                          {s.score}
                       </div>
                    </div>
                 ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={initGame} className="bg-emerald-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg active:scale-95">
                    <RotateCcw className="w-6 h-6" /> العب مجدداً
                 </button>
                 <button onClick={() => navigate('/')} className="bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors shadow-lg border border-slate-700 active:scale-95">
                    <HomeIcon className="w-6 h-6" /> الرئيسية
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
    </>
  );
}

