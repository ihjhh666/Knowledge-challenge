import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon, RotateCcw, Trophy, Target, Clock } from 'lucide-react';
import { chickenAudio } from '../lib/chickenAudio';
import { storage } from '../lib/storage';
import { updatePlayerStats } from '../lib/firebase';

const CANVAS_W = 1000;
const CANVAS_H = 750;
const WORLD_W = 1300;
const WORLD_H = 950;

type ChickenType = 'normal' | 'golden' | 'bonus_box';
type Chicken = { id: number; x: number; y: number; vx: number; vy: number; type: ChickenType; state: 'wandering' | 'carried'; carrierId: string | null; wobble: number; targetX?: number; targetY?: number };
type Player = { id: string; name: string; isBot: boolean; x: number; y: number; vx: number; vy: number; color: string; score: number; carryingChicken: 'none' | ChickenType; speedMultiplier: number; barn: { x: number; y: number; w: number; h: number }; wobble: number; dir: number; stealCooldown?: number; };
type Particle = { id: number; x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; type: 'feather' | 'sparkle' | 'text' | 'dust'; text?: string; angle: number; rotSpeed: number };
type EnvObj = { type: 'tree' | 'bush' | 'hay' | 'crate' | 'pond'; x: number; y: number; w: number; h: number; seed: number };

export default function ChickenSolo() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameState, setGameState] = useState<'playing' | 'results'>('playing');
  const [timeLeft, setTimeLeft] = useState(180);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const [currentEventMessage, setCurrentEventMessage] = useState<string | null>(null);
  const [scores, setScores] = useState<{id: string, name: string, color: string, score: number}[]>([]);

  const playersRef = useRef<Player[]>([]);
  const chickensRef = useRef<Chicken[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const envRef = useRef<EnvObj[]>([]);
  const timeRef = useRef<number>(180);
  const stateRef = useRef<'playing' | 'results'>('playing');
  const nextEventTimeRef = useRef<number>(30);
  const chickenSpawnTimersRef = useRef<number[]>([]);

  const inputRef = useRef({ dx: 0, dy: 0 });
  const [joystickActive, setJoystickActive] = useState(false);
  const joystickBaseRef = useRef<{x: number, y: number} | null>(null);
  const joystickThumbRef = useRef<{x: number, y: number} | null>(null);
  const cameraRef = useRef({ x: 0, y: 0 });

  const spawnParticles = (x: number, y: number, type: Particle['type'], count: number, opts?: {text?: string, color?: string}) => {
    for(let i=0; i<count; i++) {
       particlesRef.current.push({
          id: Math.random(), x, y,
          vx: (Math.random() - 0.5) * 150, vy: (Math.random() - 0.5) * 150 - (type === 'text' ? 50 : 0),
          life: 0, maxLife: type === 'text' ? 1.5 : 0.6 + Math.random()*0.4,
          size: type === 'feather' ? 6 + Math.random()*6 : type === 'text' ? 24 : 3 + Math.random()*4,
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

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    const loop = (time: number) => {
      animationId = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (time - lastTime) / 1000); // Max 50ms per physics tick to prevent lag spikes
      lastTime = time;
      if (stateRef.current !== 'playing') return;
      update(dt);
      draw();
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
      p1.vx = (inputRef.current.dx / len) * speed;
      p1.vy = (inputRef.current.dy / len) * speed;
      p1.dir = p1.vx > 0 ? 1 : -1;
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
          // Wonder near center
          const dx = (WORLD_W/2) - bot.x;
          const dy = (WORLD_H/2) - bot.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 5) {
            bot.vx = (dx / dist) * (botSpeed * 0.5);
            bot.vy = (dy / dist) * (botSpeed * 0.5);
          } else { bot.vx = 0; bot.vy = 0; }
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
         p.wobble += dt * 20; // Faster wobble for more dynamic look
         if (Math.random() < 0.1) spawnParticles(p.x, p.y + 15, 'dust', 1, {color: 'rgba(0,0,0,0.1)'});
      } else { p.wobble = 0; }

      // Catch chickens
      if (p.carryingChicken === 'none') {
        for (let i = chickens.length - 1; i >= 0; i--) {
          const c = chickens[i];
          if (c.state === 'wandering') {
            if (Math.hypot(p.x - c.x, p.y - c.y) < 40) { // Slightly generous catch radius
              if (c.type === 'bonus_box') {
                 p.score += 10;
                 if (!p.isBot) chickenAudio.playWin();
                 spawnParticles(c.x, c.y, 'text', 1, {text: '+10', color: '#ec4899'});
                 spawnParticles(c.x, c.y, 'sparkle', 15, {color: 'magenta'});
                 chickens.splice(i, 1);
                 updateScores();
                 checkWinCondition();
              } else {
                 c.state = 'carried';
                 c.carrierId = p.id;
                 p.carryingChicken = c.type;
                 if (!p.isBot) chickenAudio.playPickup();
                 spawnParticles(c.x, c.y, 'feather', 3, {color: c.type === 'golden' ? 'yellow' : 'white'});
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
          
          const pts = p.carryingChicken === 'golden' ? 5 : 1;
          p.score += pts;
          p.carryingChicken = 'none';
          if (!p.isBot) chickenAudio.playDrop();
          
          spawnParticles(p.x, p.y - 30, 'text', 1, {text: `+${pts}`, color: 'white'});
          spawnParticles(p.barn.x + p.barn.w/2, p.barn.y + p.barn.h/2, 'sparkle', 5, {color: 'white'});

          const cIdx = chickens.findIndex(ch => ch.carrierId === p.id);
          if (cIdx !== -1) chickens.splice(cIdx, 1);
          
          scheduleChickenSpawn();
          updateScores();
          checkWinCondition();
        }
      }
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
        if(pt.type !== 'text') pt.vy += 150 * dt; // gravity
        if(pt.life >= pt.maxLife) particlesRef.current.splice(i, 1);
    }

    // Camera follow smoothing (Closer Zoom)
    let targetCamX = p1.x - CANVAS_W / 2;
    let targetCamY = p1.y - CANVAS_H / 2;
    targetCamX = Math.max(0, Math.min(WORLD_W - CANVAS_W, targetCamX));
    targetCamY = Math.max(0, Math.min(WORLD_H - CANVAS_H, targetCamY));
    
    cameraRef.current.x += (targetCamX - cameraRef.current.x) * dt * 10;
    cameraRef.current.y += (targetCamY - cameraRef.current.y) * dt * 10;
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
      updatePlayerStats(pId, pName, won, 0, 0, playersRef.current[0].score, '🐔 جمع الدجاج');
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
    
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.save();
    
    // Smooth camera apply (No Zoom Scale for performance, elements are natively larger)
    ctx.translate(-cameraRef.current.x, -cameraRef.current.y);
    
    // Background 
    ctx.fillStyle = '#65a30d'; // vibrant grass
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    
    // Grid/pattern for grass details
    ctx.fillStyle = '#84cc16'; 
    for(let i=0; i<150; i++) {
        const x = (Math.sin(i * 1234) * 0.5 + 0.5) * WORLD_W;
        const y = (Math.cos(i * 4321) * 0.5 + 0.5) * WORLD_H;
        ctx.beginPath(); ctx.arc(x, y, 15 + (i%3)*10, 0, Math.PI * 2); ctx.fill();
    }

    // World Borders (Fences)
    ctx.fillStyle = '#78350f'; ctx.fillRect(0, 0, WORLD_W, 12); ctx.fillRect(0, WORLD_H-12, WORLD_W, 12); ctx.fillRect(0, 0, 12, WORLD_H); ctx.fillRect(WORLD_W-12, 0, 12, WORLD_H);

    // Sort entities for Y-depth sorting
    const renderList: any[] = [];
    envRef.current.forEach(e => renderList.push({ ...e, z: e.y + e.h/2 }));
    playersRef.current.forEach(p => renderList.push({ type: 'player', ref: p, z: p.y }));
    chickensRef.current.forEach(c => { if(c.state === 'wandering') renderList.push({ type: 'chicken', ref: c, z: c.y }); });
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
               ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI*2); ctx.fill(); // body 10% bigger
               ctx.beginPath(); ctx.arc(12, -6, 10, 0, Math.PI*2); ctx.fill(); // head
               ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(20, -6); ctx.lineTo(28, -3); ctx.lineTo(20, 0); ctx.fill(); // beak
               ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(12, -14, 5, 0, Math.PI*2); ctx.fill(); // comb
               ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(14, -8, 2, 0, Math.PI*2); ctx.fill(); // eye
               ctx.fillStyle = '#e2e8f0'; ctx.save(); ctx.rotate(Math.sin(c.wobble * 2) * 0.5); ctx.beginPath(); ctx.ellipse(-3, 3, 9, 5, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
           }
           ctx.restore();
       } else if (item.type === 'player') {
           const p = item.ref as Player;
           ctx.save(); ctx.translate(p.x, p.y);
           
           ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 22, 22, 9, 0, 0, Math.PI*2); ctx.fill();

           ctx.translate(0, -Math.abs(Math.sin(p.wobble) * 7));
           ctx.scale(p.dir, 1);

           ctx.fillStyle = p.color; ctx.beginPath(); ctx.roundRect(-17, -12, 34, 28, 14); ctx.fill(); // body increased 10%
           ctx.beginPath(); ctx.arc(0, -22, 18, 0, Math.PI*2); ctx.fill(); // head
           ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.roundRect(5, -28, 15, 11, 5); ctx.fill(); // visor
           
           ctx.fillStyle = p.color; ctx.filter = 'brightness(0.8)';
           if (p.carryingChicken !== 'none') {
               ctx.beginPath(); ctx.roundRect(0, -6, 22, 9, 4); ctx.fill();
               ctx.save(); ctx.scale(p.dir, 1); ctx.translate(0, -55);
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

    // Draw Minimap
    const miniSize = 140;
    const miniX = CANVAS_W - miniSize - 20 + cameraRef.current.x;
    const miniY = CANVAS_H - miniSize - 20 + cameraRef.current.y;
    ctx.save(); ctx.translate(miniX, miniY);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(0, 0, miniSize, miniSize * (WORLD_H/WORLD_W), 12); ctx.fill(); ctx.stroke();
    const scale = miniSize / WORLD_W;
    playersRef.current.forEach(p => {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x * scale, p.y * scale, 5, 0, Math.PI*2); ctx.fill();
        if (p.id === 'p1') { ctx.shadowColor = 'white'; ctx.shadowBlur = 4; ctx.stroke(); ctx.shadowBlur = 0; }
    });
    ctx.fillStyle = 'white';
    chickensRef.current.forEach(c => {
       if(c.type === 'golden') ctx.fillStyle = 'yellow'; else if(c.type === 'bonus_box') ctx.fillStyle = '#ec4899'; else ctx.fillStyle = 'white';
       ctx.beginPath(); ctx.arc(c.x * scale, c.y * scale, 2.5, 0, Math.PI*2); ctx.fill();
    });
    ctx.restore();
    ctx.restore();
  };

  // Joystick Input Handlers (Zero Lag direct response)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      setJoystickActive(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left; const y = e.clientY - rect.top;
      joystickBaseRef.current = { x, y }; joystickThumbRef.current = { x, y }; updateInput(x, y);
      e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!joystickActive || !joystickBaseRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      let x = e.clientX - rect.left; let y = e.clientY - rect.top;
      const base = joystickBaseRef.current;
      const dist = Math.hypot(x - base.x, y - base.y);
      if (dist > 40) { x = base.x + ((x - base.x)/dist)*40; y = base.y + ((y - base.y)/dist)*40; }
      joystickThumbRef.current = { x, y }; updateInput(x, y);
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      setJoystickActive(false); joystickBaseRef.current = null; joystickThumbRef.current = null;
      inputRef.current = { dx: 0, dy: 0 }; e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const updateInput = (tx: number, ty: number) => {
      if (!joystickBaseRef.current) return;
      inputRef.current = { dx: tx - joystickBaseRef.current.x, dy: ty - joystickBaseRef.current.y };
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:p-8 touch-none relative overflow-hidden font-sans">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col relative gap-4">
        
        {/* Modern Glassmorphic HUD overlaying Canvas directly */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
          <div className="flex gap-3 pointer-events-auto">
             <button onClick={() => navigate('/')} className="w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-md text-white rounded-2xl hover:bg-black/60 transition-all shadow-lg border border-white/10 active:scale-95">
                <ChevronRight className="w-6 h-6" />
             </button>
             
             {/* Standings */}
             <div className="hidden sm:flex flex-col gap-2 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg">
                 <div className="text-xs font-bold text-white/50 mb-1">الترتيب</div>
                 {scores.map((s, idx) => (
                    <div key={s.id} className="flex gap-3 items-center justify-between min-w-[120px]">
                       <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full" style={{backgroundColor: s.color}}></div>
                           <span className={`text-sm font-bold ${s.id === 'p1' ? 'text-white' : 'text-slate-300'}`}>{s.name}</span>
                       </div>
                       <span className="text-white font-mono font-bold">{s.score}</span>
                    </div>
                 ))}
             </div>
          </div>

          <div className="flex flex-col items-end gap-3 pointer-events-auto">
             <div className="flex gap-2">
                 <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/10 shadow-lg">
                    <Target className="w-5 h-5 text-sky-400" />
                    <span className="text-lg font-bold font-mono text-white">50</span>
                 </div>
                 <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/10 shadow-lg">
                    <Clock className="w-5 h-5 text-white/70" />
                    <span className={`text-lg font-bold font-mono ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-slate-100'}`}>
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                 </div>
             </div>
             {currentEventMessage && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300 bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-lg">
                   <span className="text-white font-bold text-sm md:text-base">{currentEventMessage}</span>
                </div>
             )}
          </div>
        </div>

        {/* Game Canvas Container */}
        <div className="flex-1 relative rounded-[2rem] overflow-hidden shadow-2xl bg-[#65a30d] border border-slate-800 pointer-events-auto touch-none">
            
            <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="w-full h-full object-cover" />
            
            {gameState === 'playing' && (
              <div 
                className="absolute inset-0 z-10 touch-none"
                onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
              >
                {joystickActive && joystickBaseRef.current && joystickThumbRef.current && (
                    <div className="absolute rounded-full border-2 border-white/20 bg-white/5 pointer-events-none transition-opacity"
                         style={{ left: joystickBaseRef.current.x - 60, top: joystickBaseRef.current.y - 60, width: 120, height: 120 }}>
                        <div className="absolute rounded-full bg-white/40 shadow-lg backdrop-blur-sm pointer-events-none"
                             style={{ left: 60 + (joystickThumbRef.current.x - joystickBaseRef.current.x) - 25, top:  60 + (joystickThumbRef.current.y - joystickBaseRef.current.y) - 25, width: 50, height: 50 }} />
                    </div>
                )}
             </div>
            )}
        </div>
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
  );
}

