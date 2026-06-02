import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings2, RotateCcw, HomeIcon, Trophy, Target } from 'lucide-react';
import { storage } from '../lib/storage';
import { updateHockeyStats } from '../lib/firebase';

// Audio Context for sound effects
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playHitSound = (intensity: number) => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  const freq = 400 + Math.min(30, intensity) * 20; 
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
  
  const vol = Math.min(1, 0.2 + intensity * 0.04);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);

  const noiseOsc = audioCtx.createOscillator();
  const noiseGain = audioCtx.createGain();
  noiseOsc.type = 'square';
  noiseOsc.frequency.setValueAtTime(800, audioCtx.currentTime);
  noiseOsc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
  noiseGain.gain.setValueAtTime(vol * 0.4, audioCtx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
  noiseOsc.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);
  noiseOsc.start();
  noiseOsc.stop(audioCtx.currentTime + 0.05);
};

const playWallHitSound = (intensity: number) => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  const freq = 200 + Math.min(20, intensity) * 10;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.1);
  
  const vol = Math.min(1, 0.1 + intensity * 0.03);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
};

const playGoalSound = () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  [300, 450, 600, 900].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(freq * 0.8, audioCtx.currentTime + 0.8);
    
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
  });
};

const playWinSound = () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const notes = [
    { freq: 440, delay: 0 },
    { freq: 554.37, delay: 0.15 },
    { freq: 659.25, delay: 0.3 },
    { freq: 880, delay: 0.45 },
    { freq: 1108.73, delay: 0.6 }
  ];
  
  notes.forEach(({freq, delay}) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + delay + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.5);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + 0.5);
  });
};

const playLoseSound = () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const notes = [
    { freq: 400, delay: 0 },
    { freq: 380, delay: 0.2 },
    { freq: 350, delay: 0.4 },
    { freq: 300, delay: 0.6 },
  ];
  
  notes.forEach(({freq, delay}) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, audioCtx.currentTime + delay + 0.4);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + delay + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + 0.4);
  });
};

type GameState = 'setup' | 'playing' | 'goal' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard';

let GOAL_LIMIT = 10;
let CANVAS_WIDTH = 400;
let CANVAS_HEIGHT = 700;
let PUCK_RADIUS = 15;
let PADDLE_RADIUS = 30;
let GOAL_WIDTH = 140;

let bgCanvasCache: HTMLCanvasElement | null = null;
const getBgCanvas = () => {
   if (bgCanvasCache) return bgCanvasCache;
   const c = document.createElement('canvas');
   c.width = CANVAS_WIDTH;
   c.height = CANVAS_HEIGHT;
   const ctx = c.getContext('2d');
   if (ctx) {
      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#02040a';
      for (let i = 10; i < CANVAS_WIDTH; i += 20) {
        for (let j = 10; j < CANVAS_HEIGHT; j += 20) {
          ctx.beginPath();
          ctx.arc(i + (j % 40 === 0 ? 10 : 0), j, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const leftGlow = ctx.createLinearGradient(0, 0, 40, 0);
      leftGlow.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
      leftGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = leftGlow;
      ctx.fillRect(0, 0, 40, CANVAS_HEIGHT);

      const rightGlow = ctx.createLinearGradient(CANVAS_WIDTH, 0, CANVAS_WIDTH - 40, 0);
      rightGlow.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
      rightGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = rightGlow;
      ctx.fillRect(CANVAS_WIDTH - 40, 0, 40, CANVAS_HEIGHT);
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(56, 189, 248, 1)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT / 2);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH > 500 ? 120 : 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      if (CANVAS_WIDTH > 500) {
          const drawFaceoffCircle = (cx: number, cy: number, color: string) => {
              ctx.strokeStyle = color;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(cx, cy, 60, 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = color.replace('0.8', '0.2');
              ctx.beginPath();
              ctx.arc(cx, cy, 5, 0, Math.PI * 2);
              ctx.fill();
          };
          drawFaceoffCircle(120, CANVAS_HEIGHT * 0.2, 'rgba(239, 68, 68, 0.8)');
          drawFaceoffCircle(CANVAS_WIDTH - 120, CANVAS_HEIGHT * 0.2, 'rgba(239, 68, 68, 0.8)');
          drawFaceoffCircle(120, CANVAS_HEIGHT * 0.8, 'rgba(59, 130, 246, 0.8)');
          drawFaceoffCircle(CANVAS_WIDTH - 120, CANVAS_HEIGHT * 0.8, 'rgba(59, 130, 246, 0.8)');
      }
      
      const drawChevron = (cx: number, cy: number, color: string, dir: number) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.beginPath();
          ctx.moveTo(cx - 15, cy - 10 * dir);
          ctx.lineTo(cx, cy + 10 * dir);
          ctx.lineTo(cx + 15, cy - 10 * dir);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(cx - 15, cy - 25 * dir);
          ctx.lineTo(cx, cy - 5 * dir);
          ctx.lineTo(cx + 15, cy - 25 * dir);
          ctx.stroke();
          ctx.shadowBlur = 0;
      };
      
      drawChevron(60, CANVAS_HEIGHT / 4, 'rgba(239, 68, 68, 0.8)', -1);
      drawChevron(CANVAS_WIDTH - 60, CANVAS_HEIGHT / 4, 'rgba(239, 68, 68, 0.8)', -1); 
      drawChevron(60, CANVAS_HEIGHT * 3 / 4, 'rgba(59, 130, 246, 0.8)', 1); 
      drawChevron(CANVAS_WIDTH - 60, CANVAS_HEIGHT * 3 / 4, 'rgba(59, 130, 246, 0.8)', 1); 

      const drawGoalArea = (y: number, color: string, dir: number) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2, y, GOAL_WIDTH / 2, dir === 1 ? 0 : Math.PI, dir === 1 ? Math.PI : 0, false);
        ctx.fill();
        
        const glowStr = color.replace('0.1)', '0.8)');
        ctx.shadowColor = glowStr;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = glowStr;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2, y, GOAL_WIDTH / 2 + 10, dir === 1 ? 0 : Math.PI, dir === 1 ? Math.PI : 0, false);
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      drawGoalArea(0, 'rgba(239, 68, 68, 0.1)', 1); // Guest goal
      drawGoalArea(CANVAS_HEIGHT, 'rgba(59, 130, 246, 0.1)', -1); // Host goal
   }
   bgCanvasCache = c;
   return c;
};

interface Vec2 {
  x: number;
  y: number;
}

interface PhysicsEntity {
  pos: Vec2;
  vel: Vec2;
  radius: number;
  mass: number;
}

export default function HockeySolo() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const is2v2 = searchParams.get('mode') === '2v2';

  if (is2v2) {
      if (CANVAS_WIDTH !== 700) bgCanvasCache = null;
      CANVAS_WIDTH = 700;
      CANVAS_HEIGHT = 1000;
      PUCK_RADIUS = 16;
      PADDLE_RADIUS = 34;
      GOAL_WIDTH = 320;
  } else {
      if (CANVAS_WIDTH !== 400) bgCanvasCache = null;
      CANVAS_WIDTH = 400;
      CANVAS_HEIGHT = 700;
      PUCK_RADIUS = 15;
      PADDLE_RADIUS = 30;
      GOAL_WIDTH = 140;
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<GameState>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null);
  const [goalScorer, setGoalScorer] = useState<'player' | 'bot' | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  // References for mutable game state during requestAnimationFrame
  const reqRef = useRef<number>();
  const scoresRef = useRef({ player: 0, bot: 0 });
  const botStuckTimerRef = useRef<number>(0);
  const botLastPosRef = useRef<Vec2>({ x: 0, y: 0 });
  const puckStuckTimerRef = useRef<number>(0);
  const puckLastPosRef = useRef<Vec2>({ x: 0, y: 0 });
  const puckTrailRef = useRef<{x: number, y: number, alpha: number}[]>([]);
  const screenShakeRef = useRef<number>(0);
  const wallGlowRef = useRef({ left: 0, right: 0, top: 0, bottom: 0 });
  const puckAngleRef = useRef<number>(0);
  const particlesRef = useRef<{x: number, y: number, vx: number, vy: number, life: number, color: string, size: number}[]>([]);
  
  const puckRef = useRef<PhysicsEntity>({ 
    pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }, 
    vel: { x: 0, y: 0 }, 
    radius: PUCK_RADIUS, 
    mass: 1 
  });
  
  const playerPaddleRef = useRef<PhysicsEntity>({
    pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 },
    vel: { x: 0, y: 0 },
    radius: PADDLE_RADIUS,
    mass: Number.POSITIVE_INFINITY
  });
  
  const botPaddleRef = useRef<PhysicsEntity>({
    pos: { x: CANVAS_WIDTH / 2, y: 60 },
    vel: { x: 0, y: 0 },
    radius: PADDLE_RADIUS,
    mass: Number.POSITIVE_INFINITY
  });
  
  const friendBotRef = useRef<PhysicsEntity>({
    pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 150 },
    vel: { x: 0, y: 0 },
    radius: PADDLE_RADIUS,
    mass: Number.POSITIVE_INFINITY
  });

  const enemyFrontBotRef = useRef<PhysicsEntity>({
    pos: { x: CANVAS_WIDTH / 2, y: 150 },
    vel: { x: 0, y: 0 },
    radius: PADDLE_RADIUS,
    mass: Number.POSITIVE_INFINITY
  });
  
  const targetPlayerPosRef = useRef<Vec2 | null>(null);

  const resetPositions = useCallback((server: 'player' | 'bot') => {
    puckRef.current.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    puckRef.current.vel = { x: 0, y: server === 'bot' ? 3 : -3 };
    
    if (is2v2) {
      playerPaddleRef.current.pos = { x: CANVAS_WIDTH / 2 - 40, y: CANVAS_HEIGHT - 60 };
      friendBotRef.current.pos = { x: CANVAS_WIDTH / 2 + 40, y: CANVAS_HEIGHT - 60 };
      botPaddleRef.current.pos = { x: CANVAS_WIDTH / 2 - 40, y: 60 };
      enemyFrontBotRef.current.pos = { x: CANVAS_WIDTH / 2 + 40, y: 60 };
    } else {
      playerPaddleRef.current.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 };
      botPaddleRef.current.pos = { x: CANVAS_WIDTH / 2, y: 60 };
    }
    
    playerPaddleRef.current.vel = { x: 0, y: 0 };
    botPaddleRef.current.vel = { x: 0, y: 0 };
    friendBotRef.current.vel = { x: 0, y: 0 };
    enemyFrontBotRef.current.vel = { x: 0, y: 0 };
    
    targetPlayerPosRef.current = null;
    puckTrailRef.current = [];
  }, [is2v2]);

  const startGame = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    setScore(0, 0);
    setWinner(null);
    setGoalScorer(null);
    setGameState('playing');
    resetPositions('player');
  };

  const setScore = (p: number, b: number) => {
    scoresRef.current = { player: p, bot: b };
    setPlayerScore(p);
    setBotScore(b);
  };

  const updateStats = (isWin: boolean, pScore: number, bScore: number) => {
    const pId = storage.getPlayerId();
    const pName = storage.getPlayerName() || 'لاعب مجهول';
    const pointsAwarded = isWin ? 10 : 2;
    updateHockeyStats(pId, pName, isWin, pScore, bScore, pointsAwarded);
  };

  const onGoal = (scorer: 'player' | 'bot') => {
    playGoalSound();
    
    const newPlayerScore = scorer === 'player' ? scoresRef.current.player + 1 : scoresRef.current.player;
    const newBotScore = scorer === 'bot' ? scoresRef.current.bot + 1 : scoresRef.current.bot;
    
    setScore(newPlayerScore, newBotScore);
    
    if (newPlayerScore >= GOAL_LIMIT) {
      setWinner('player');
      setGameState('results');
      playWinSound();
      updateStats(true, newPlayerScore, newBotScore);
      return;
    } else if (newBotScore >= GOAL_LIMIT) {
      setWinner('bot');
      setGameState('results');
      playLoseSound();
      updateStats(false, newPlayerScore, newBotScore);
      return;
    }
    
    setGoalScorer(scorer);
    setGameState('goal');
    setCountdown(2);
    
    let left = 2;
    const tick = setInterval(() => {
        left--;
        setCountdown(left);
        if (left <= 0) {
            clearInterval(tick);
            resetPositions(scorer === 'player' ? 'player' : 'bot');
            setGameState('playing');
        }
    }, 1000);
  };

  const updateBot = () => {
    const puck = puckRef.current;
    const bot = botPaddleRef.current;
    let speed = 5.0; // base speed
    if (difficulty === 'easy') speed = 3.2;
    if (difficulty === 'medium') speed = 6.0;
    if (difficulty === 'hard') speed = 8.5;

    let targetX = CANVAS_WIDTH / 2;
    let targetY = 60; // default pos

    // Stuck detection
    const dxLast = bot.pos.x - botLastPosRef.current.x;
    const dyLast = bot.pos.y - botLastPosRef.current.y;
    if (Math.hypot(dxLast, dyLast) < 1.0 && puck.pos.y < CANVAS_HEIGHT / 2) {
       botStuckTimerRef.current += 1;
    } else {
       botStuckTimerRef.current = 0;
    }
    botLastPosRef.current = { x: bot.pos.x, y: bot.pos.y };

    // Bot attacks if puck is in its half, else returns to base
    if (puck.pos.y < CANVAS_HEIGHT / 2) {
      targetX = puck.pos.x;
      // In hard mode, try to hit strongly when near
      if (difficulty === 'hard' && puck.pos.y < CANVAS_HEIGHT / 3 && Math.abs(puck.pos.x - bot.pos.x) < 55) {
        targetY = puck.pos.y + 20;
        speed = 11.0; 
      } else {
        targetY = Math.max(bot.radius + 10, puck.pos.y - 30);
      }
    } else {
      if (difficulty === 'easy') {
          targetX = Math.max(CANVAS_WIDTH/4, Math.min(CANVAS_WIDTH*3/4, puck.pos.x)); // weakly follow
      } else if (difficulty === 'medium') {
          targetX = Math.max(CANVAS_WIDTH/4, Math.min(CANVAS_WIDTH*3/4, puck.pos.x)); 
      } else {
          targetX = puck.pos.x; // track tightly
      }
      targetY = 60; // fall back to defense line
    }
    
    // Bounds check for bot target
    targetX = Math.max(bot.radius, Math.min(CANVAS_WIDTH - bot.radius, targetX));
    targetY = Math.max(bot.radius, Math.min(CANVAS_HEIGHT/2 - bot.radius, targetY));

    // Move bot towards target
    const applyBotVelocity = (b: PhysicsEntity, tx: number, ty: number, s: number) => {
       const bdx = tx - b.pos.x;
       const bdy = ty - b.pos.y;
       const bdist = Math.hypot(bdx, bdy);
       if (bdist > 0) {
          const step = Math.min(bdist, s);
          const vx = (bdx / bdist) * step;
          const vy = (bdy / bdist) * step;
          b.pos.x += vx;
          b.pos.y += vy;
          b.vel = { x: vx, y: vy };
       } else {
          b.vel = { x: 0, y: 0 };
       }
    };
    
    if (is2v2) {
       // Friend bot (Defender for player)
       const fr = friendBotRef.current;
       let frTx = CANVAS_WIDTH / 2;
       let frTy = CANVAS_HEIGHT - 80;
       
       if (puck.pos.y > CANVAS_HEIGHT / 2) {
           // Puck is in our half. Friend bot defends the goal.
           frTx = puck.pos.x;
           frTy = Math.max(CANVAS_HEIGHT - 120, Math.min(CANVAS_HEIGHT - 40, puck.pos.y + 40));
       } else {
           // Puck is in enemy half. Friend bot stays ready at defense line.
           frTx = Math.max(PADDLE_RADIUS, Math.min(CANVAS_WIDTH - PADDLE_RADIUS, puck.pos.x));
           frTy = CANVAS_HEIGHT - 150;
       }
       frTx = Math.max(fr.radius, Math.min(CANVAS_WIDTH - fr.radius, frTx));
       applyBotVelocity(fr, frTx, frTy, speed * 0.9);
       
       // For enemy side, in 2v2 we split roles:
       // botPaddleRef -> Defender
       // enemyFrontBotRef -> Attacker
       
       // Override Defender (botPaddleRef)
       if (puck.pos.y < CANVAS_HEIGHT / 2 + 100) {
           // Puck in enemy half. Defender guards net.
           targetX = puck.pos.x;
           targetY = Math.min(120, Math.max(40, puck.pos.y - 40));
       } else {
           // Puck in our half. Defender stays at net.
           targetX = CANVAS_WIDTH / 2;
           targetY = 80;
       }
       targetX = Math.max(bot.radius, Math.min(CANVAS_WIDTH - bot.radius, targetX));
       targetY = Math.max(bot.radius, Math.min(CANVAS_HEIGHT/2 - bot.radius, targetY));
       applyBotVelocity(bot, targetX, targetY, speed);
       
       // Enemy Attacker
       const ef = enemyFrontBotRef.current;
       let efTx = CANVAS_WIDTH / 2;
       let efTy = CANVAS_HEIGHT / 2 - 100;
       
       if (puck.pos.y < CANVAS_HEIGHT / 2 + 100) {
           // Chase the puck actively
           efTx = puck.pos.x;
           efTy = puck.pos.y;
       } else {
           // Wait near middle
           efTx = Math.max(ef.radius, Math.min(CANVAS_WIDTH - ef.radius, puck.pos.x));
           efTy = CANVAS_HEIGHT / 2 - 80;
       }
       efTx = Math.max(ef.radius, Math.min(CANVAS_WIDTH - ef.radius, efTx));
       efTy = Math.max(ef.radius, Math.min(CANVAS_HEIGHT / 2 - ef.radius, efTy));
       applyBotVelocity(ef, efTx, efTy, speed * 0.9);
    } else {
       applyBotVelocity(bot, targetX, targetY, speed);
    }
  };

  const handleCollisions = () => {
    const puck = puckRef.current;
    const player = playerPaddleRef.current;
    const bot = botPaddleRef.current;

    // Apply friction to puck
    puck.vel.x *= 0.995;
    puck.vel.y *= 0.995;

    // Speed limit
    const MAX_SPEED = 35;
    const speedSq = puck.vel.x**2 + puck.vel.y**2;
    if (speedSq > MAX_SPEED**2) {
       const speed = Math.sqrt(speedSq);
       puck.vel.x = (puck.vel.x / speed) * MAX_SPEED;
       puck.vel.y = (puck.vel.y / speed) * MAX_SPEED;
    }

    // Puck limits
    const MIN_SPEED = 0.2;
    if (Math.abs(puck.vel.x) < MIN_SPEED && Math.abs(puck.vel.x) > 0) puck.vel.x = 0;
    if (Math.abs(puck.vel.y) < MIN_SPEED && Math.abs(puck.vel.y) > 0) puck.vel.y = 0;

    puck.pos.x += puck.vel.x;
    puck.pos.y += puck.vel.y;

    // Wall collision (Left/Right)
    if (puck.pos.x - puck.radius <= 0) {
      puck.pos.x = puck.radius;
      puck.vel.x *= -0.8;
      if (Math.abs(puck.vel.x) > 1) { playWallHitSound(Math.abs(puck.vel.x * 2)); screenShakeRef.current = 4; wallGlowRef.current.left = 1; }
    } else if (puck.pos.x + puck.radius >= CANVAS_WIDTH) {
      puck.pos.x = CANVAS_WIDTH - puck.radius;
      puck.vel.x *= -0.8;
      if (Math.abs(puck.vel.x) > 1) { playWallHitSound(Math.abs(puck.vel.x * 2)); screenShakeRef.current = 4; wallGlowRef.current.right = 1; }
    }

    // Goal detection vs Wall collision (Top/Bottom)
    const goalLeft = (CANVAS_WIDTH - GOAL_WIDTH) / 2;
    const goalRight = goalLeft + GOAL_WIDTH;
    const inGoalX = puck.pos.x > goalLeft && puck.pos.x < goalRight;

    if (puck.pos.y - puck.radius <= 0) {
      if (inGoalX) {
        if (puck.pos.y < -puck.radius) onGoal('player'); // Goal scored for player
      } else {
        puck.pos.y = puck.radius;
        puck.vel.y *= -0.8;
        if (Math.abs(puck.vel.y) > 1) { playWallHitSound(Math.abs(puck.vel.y * 2)); screenShakeRef.current = 4; wallGlowRef.current.top = 1; }
      }
    } else if (puck.pos.y + puck.radius >= CANVAS_HEIGHT) {
      if (inGoalX) {
        if (puck.pos.y > CANVAS_HEIGHT + puck.radius) onGoal('bot'); // Goal scored for bot
      } else {
        puck.pos.y = CANVAS_HEIGHT - puck.radius;
        puck.vel.y *= -0.8;
        if (Math.abs(puck.vel.y) > 1) { playWallHitSound(Math.abs(puck.vel.y * 2)); screenShakeRef.current = 4; wallGlowRef.current.bottom = 1; }
      }
    }
    
    // Out of bounds safety net
    if (
      puck.pos.x < -puck.radius * 2 || 
      puck.pos.x > CANVAS_WIDTH + puck.radius * 2 ||
      puck.pos.y < -CANVAS_HEIGHT ||
      puck.pos.y > CANVAS_HEIGHT * 2 ||
      isNaN(puck.pos.x) ||
      isNaN(puck.pos.y)
    ) {
      puck.pos.x = CANVAS_WIDTH / 2;
      puck.pos.y = CANVAS_HEIGHT / 2;
      puck.vel.x = 0;
      puck.vel.y = 0;
    }

    // Paddle Collisions
    const collidePaddle = (paddle: PhysicsEntity) => {
      const dx = puck.pos.x - paddle.pos.x;
      const dy = puck.pos.y - paddle.pos.y;
      const distSq = dx*dx + dy*dy;
      const minRadius = puck.radius + paddle.radius;
      
      if (distSq <= minRadius*minRadius) {
        let dist = Math.sqrt(distSq);
        let actDx = dx;
        let actDy = dy;
        if (dist === 0) {
            dist = 0.001;
            actDx = 0.001;
            actDy = 0;
        }
        const overlap = minRadius - dist;
        const nx = actDx / dist;
        const ny = actDy / dist;
        
        // Push out of collision
        puck.pos.x += nx * overlap;
        puck.pos.y += ny * overlap;
        
        // Reflect velocity with bounce factor and inherited paddle velocity
        const dot = puck.vel.x*nx + puck.vel.y*ny;
        
        // Paddle hit strength
        const bounce = 0.95; 
        const hitX = (paddle.vel.x || 0) * 1.0;
        const hitY = (paddle.vel.y || 0) * 1.0;
        
        if (dot < 0) {
           puck.vel.x = puck.vel.x - 2 * dot * nx * bounce;
           puck.vel.y = puck.vel.y - 2 * dot * ny * bounce;
           
           // Screen shake on hard hits
           if (Math.abs(dot) > 15 || Math.hypot(hitX, hitY) > 15) {
             screenShakeRef.current = 8;
           }
        }
        
        puck.vel.x += hitX;
        puck.vel.y += hitY;
        
        const intensity = Math.abs(dot) + Math.hypot(hitX, hitY);
        playHitSound(intensity);
        
        for (let i = 0; i < 5 + Math.min(10, intensity); i++) {
            particlesRef.current.push({
                x: puck.pos.x - nx * puck.radius,
                y: puck.pos.y - ny * puck.radius,
                vx: (Math.random() - 0.5) * 15 + hitX * 0.5,
                vy: (Math.random() - 0.5) * 15 + hitY * 0.5,
                life: 1,
                color: (paddle === playerPaddleRef.current || paddle === friendBotRef.current) ? '#3b82f6' : '#fb7185',
                size: Math.random() * 4 + 2
            });
        }
      }
    };

    collidePaddle(player);
    collidePaddle(bot);
    if (is2v2) {
       collidePaddle(friendBotRef.current);
       collidePaddle(enemyFrontBotRef.current);
    }

    // Paddle to paddle collision (prevents stacking/overlapping)
    const paddles = is2v2 ? [player, friendBotRef.current, bot, enemyFrontBotRef.current] : [player, bot];
    for (let i = 0; i < paddles.length; i++) {
        for (let j = i + 1; j < paddles.length; j++) {
            const p1 = paddles[i];
            const p2 = paddles[j];
            const dx = p2.pos.x - p1.pos.x;
            const dy = p2.pos.y - p1.pos.y;
            const distSq = dx*dx + dy*dy;
            const minDist = p1.radius + p2.radius;
            
            if (distSq < minDist * minDist) {
                let dist = Math.sqrt(distSq);
                let actDx = dx;
                let actDy = dy;
                if (dist === 0) {
                    dist = 0.001;
                    actDx = 0.001;
                    actDy = 0;
                }
                const overlap = (minDist - dist) / 2;
                const nx = actDx / dist;
                const ny = actDy / dist;
                
                p1.pos.x -= nx * overlap;
                p1.pos.y -= ny * overlap;
                p2.pos.x += nx * overlap;
                p2.pos.y += ny * overlap;
            }
        }
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.save();
    if (screenShakeRef.current > 0.5) {
      const shakeAmt = screenShakeRef.current;
      ctx.translate((Math.random() - 0.5) * shakeAmt, (Math.random() - 0.5) * shakeAmt);
      screenShakeRef.current *= 0.9;
    } else {
      screenShakeRef.current = 0;
    }

    const goalLeft = (CANVAS_WIDTH - GOAL_WIDTH) / 2;

    ctx.drawImage(getBgCanvas(), 0, 0);

    if (wallGlowRef.current.left > 0) {
        ctx.fillStyle = `rgba(56, 189, 248, ${wallGlowRef.current.left * 0.8})`;
        ctx.fillRect(0, 0, 10, CANVAS_HEIGHT);
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(56, 189, 248, 1)';
        ctx.fillRect(0, 0, 5, CANVAS_HEIGHT);
        ctx.shadowBlur = 0;
        wallGlowRef.current.left *= 0.9;
    }
    if (wallGlowRef.current.right > 0) {
        ctx.fillStyle = `rgba(56, 189, 248, ${wallGlowRef.current.right * 0.8})`;
        ctx.fillRect(CANVAS_WIDTH - 10, 0, 10, CANVAS_HEIGHT);
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(56, 189, 248, 1)';
        ctx.fillRect(CANVAS_WIDTH - 5, 0, 5, CANVAS_HEIGHT);
        ctx.shadowBlur = 0;
        wallGlowRef.current.right *= 0.9;
    }
    if (wallGlowRef.current.top > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${wallGlowRef.current.top * 0.8})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, 10);
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(239, 68, 68, 1)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, 5);
        ctx.shadowBlur = 0;
        wallGlowRef.current.top *= 0.9;
    }
    if (wallGlowRef.current.bottom > 0) {
        ctx.fillStyle = `rgba(16, 185, 129, ${wallGlowRef.current.bottom * 0.8})`;
        ctx.fillRect(0, CANVAS_HEIGHT - 10, CANVAS_WIDTH, 10);
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(16, 185, 129, 1)';
        ctx.fillRect(0, CANVAS_HEIGHT - 5, CANVAS_WIDTH, 5);
        ctx.shadowBlur = 0;
        wallGlowRef.current.bottom *= 0.9;
    }

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= 0.05;
        
        if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    const drawPaddle = (x: number, y: number, r: number, color1: string, color2: string, glow: string, isLocal: boolean, label: string) => {
      ctx.shadowColor = glow;
      ctx.shadowBlur = isLocal ? 25 : 15;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      
      const grad = ctx.createRadialGradient(x - r*0.3, y - r*0.3, r*0.1, x, y, r);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      
      ctx.fillStyle = grad;
      ctx.fill();
      
      ctx.shadowBlur = 0; 
      ctx.lineWidth = 4;
      ctx.strokeStyle = color1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, r * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();

      if (label) {
        ctx.fillStyle = 'white';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y - r - 15);
      }
    };

    drawPaddle(botPaddleRef.current.pos.x, botPaddleRef.current.pos.y, botPaddleRef.current.radius, '#fb7185', '#881337', '#f43f5e', false, is2v2 ? 'الخصم 1' : 'الخصم');
    drawPaddle(playerPaddleRef.current.pos.x, playerPaddleRef.current.pos.y, playerPaddleRef.current.radius, '#3b82f6', '#1e3a8a', '#2563eb', true, 'أنت');
    
    if (is2v2) {
       drawPaddle(friendBotRef.current.pos.x, friendBotRef.current.pos.y, friendBotRef.current.radius, '#3b82f6', '#1e3a8a', '#2563eb', false, 'زميلك');
       drawPaddle(enemyFrontBotRef.current.pos.x, enemyFrontBotRef.current.pos.y, enemyFrontBotRef.current.radius, '#fb7185', '#881337', '#f43f5e', false, 'الخصم 2');
    }
    
    puckTrailRef.current.forEach(t => {
      if (!t) return;
      ctx.beginPath();
      ctx.arc(t.x, t.y, puckRef.current.radius * (0.6 + t.alpha * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${t.alpha * 0.6})`;
      ctx.shadowBlur = 20;
      ctx.shadowColor = `rgba(56, 189, 248, ${t.alpha})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    const drawPuck = () => {
      const p = puckRef.current.pos;
      const r = puckRef.current.radius;
      
      const speed = Math.hypot(puckRef.current.vel.x, puckRef.current.vel.y);
      puckAngleRef.current += speed * 0.05;

      ctx.translate(p.x, p.y);
      ctx.rotate(puckAngleRef.current);

      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      
      const grad = ctx.createRadialGradient(-r*0.3, -r*0.3, r*0.1, 0, 0, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#e0f2fe');
      grad.addColorStop(1, '#7dd3fc');
      
      ctx.fillStyle = grad;
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -r*0.6);
      ctx.lineTo(0, r*0.6);
      ctx.moveTo(-r*0.6, 0);
      ctx.lineTo(r*0.6, 0);
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, r*0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();

      ctx.rotate(-puckAngleRef.current);
      ctx.translate(-p.x, -p.y);
    };

    drawPuck();
    
    ctx.restore();
  };

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing' && gameState !== 'goal') return;

    if (gameState === 'playing') {
      // Record trail
      puckTrailRef.current.push({ x: puckRef.current.pos.x, y: puckRef.current.pos.y, alpha: 1 });
      if (puckTrailRef.current.length > 8) {
        puckTrailRef.current.shift();
      }
      puckTrailRef.current.forEach(t => t.alpha -= 0.12);

      // Smoothly update player paddle pos to target
      if (targetPlayerPosRef.current) {
         const p = playerPaddleRef.current;
         const t = targetPlayerPosRef.current;
         
         // Direct position follow while deriving velocity for strong collisions
         p.vel.x = (t.x - p.pos.x);
         p.vel.y = (t.y - p.pos.y);
         
         p.pos.x = t.x;
         p.pos.y = t.y;
      } else {
         playerPaddleRef.current.vel = { x: 0, y: 0 };
      }

      updateBot();
      handleCollisions();
      
      // Puck stuck detection
      const px = puckRef.current.pos.x;
      const py = puckRef.current.pos.y;
      const pdxLast = px - puckLastPosRef.current.x;
      const pdyLast = py - puckLastPosRef.current.y;
      
      if (Math.hypot(pdxLast, pdyLast) < 1.0) {
         puckStuckTimerRef.current += 1;
      } else {
         puckStuckTimerRef.current = 0;
      }
      puckLastPosRef.current = { x: px, y: py };
      
      if (puckStuckTimerRef.current > 300 || botStuckTimerRef.current > 300) { // 5 seconds
          resetPositions('player');
          puckStuckTimerRef.current = 0;
          botStuckTimerRef.current = 0;
      }
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) draw(ctx);
    }

    reqRef.current = requestAnimationFrame(gameLoop);
  }, [difficulty, gameState]); // Note: difficulty inside updateBot

  useEffect(() => {
    if (gameState === 'playing' || gameState === 'goal') {
      reqRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [gameState, gameLoop]);

  // Touch/Mouse handling
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    let targetX = (e.clientX - rect.left) * scaleX;
    let targetY = (e.clientY - rect.top) * scaleY;

    // Constrain player paddle bounds
    const pRadius = playerPaddleRef.current.radius;
    targetX = Math.max(pRadius, Math.min(CANVAS_WIDTH - pRadius, targetX));
    targetY = Math.max(CANVAS_HEIGHT / 2 + pRadius, Math.min(CANVAS_HEIGHT - pRadius, targetY));

    targetPlayerPosRef.current = { x: targetX, y: targetY };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (typeof e.currentTarget.setPointerCapture === 'function') {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    handlePointerMove(e);
  };
  
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (typeof e.currentTarget.releasePointerCapture === 'function') {
       e.currentTarget.releasePointerCapture(e.pointerId);
    }
    targetPlayerPosRef.current = null;
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-center items-center p-2 md:p-4">
      {gameState === 'setup' && (
        <div className="max-w-md w-full bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-center backdrop-blur-xl">
           <div className="text-6xl mb-6 drop-shadow-xl animate-bounce">🏒</div>
           <h2 className="text-3xl font-bold text-white mb-2 font-heading">الهوكي</h2>
           <p className="text-slate-400 mb-8 font-bold">لاعب ضد الذكاء الاصطناعي {is2v2 ? '(2 ضد 2)' : '(1 ضد 1)'}</p>

           <div className="mb-8 text-right bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
             <h3 className="font-bold text-white mb-4 text-center">اختر مستوى الصعوبة</h3>
             <div className="space-y-3">
               {(['easy', 'medium', 'hard'] as const).map(level => (
                 <button
                   key={level}
                   onClick={() => setDifficulty(level)}
                   className={`w-full text-right px-6 py-4 rounded-xl font-bold flex justify-between items-center transition-all ${difficulty === level ? 'bg-blue-600 text-white shadow-lg border-2 border-blue-400/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
                 >
                   <span className="capitalize">{level === 'easy' ? 'سهل' : level === 'medium' ? 'متوسط' : 'صعب'}</span>
                   {difficulty === level && <div className="w-4 h-4 bg-white rounded-full"></div>}
                 </button>
               ))}
             </div>
           </div>

           <button 
             onClick={startGame}
             className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 text-xl flex items-center justify-center gap-2 border border-blue-400/20"
           >
             بدء اللعب
           </button>
           <button 
             onClick={() => navigate('/')}
             className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700"
           >
             العودة للرئيسية
           </button>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'goal') && (
        <div className={`flex flex-col items-center w-full ${is2v2 ? 'max-w-2xl' : 'max-w-md'} h-[90vh] max-h-[1000px] select-none touch-none`}>
          <div className="w-full flex justify-between items-center px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 shadow-lg shrink-0 relative z-20">
             <div className="flex flex-col items-center gap-1">
                <span className="text-slate-400 text-xs font-bold bg-slate-950 px-2 py-0.5 rounded-full">{is2v2 ? 'الخصوم (بوت)' : 'الخصم (بوت)'}</span>
                <span className="text-4xl font-mono font-bold text-rose-400 drop-shadow-md">{botScore}</span>
             </div>
             
             <div className="flex flex-col items-center flex-1 mx-4">
                 <button onClick={() => setGameState('setup')} className="text-slate-500 hover:text-white p-2 mb-1 transition-colors active:scale-95">
                    <RotateCcw className="w-6 h-6"/>
                 </button>
                 <span className="text-xs text-slate-500 font-bold tracking-wider">من {GOAL_LIMIT}</span>
             </div>
             
             <div className="flex flex-col items-center gap-1">
                <span className="text-slate-400 text-xs font-bold bg-slate-950 px-2 py-0.5 rounded-full">{is2v2 ? 'فريقك' : 'أنت'}</span>
                <span className="text-4xl font-mono font-bold text-emerald-400 drop-shadow-md">{playerScore}</span>
             </div>
          </div>
          
          <div 
             className="flex-1 w-full relative bg-[#050b14] rounded-[40px] overflow-hidden flex justify-center items-center touch-none animate-in fade-in zoom-in duration-700"
             style={{
                borderTop: '12px solid #ef4444',
                borderBottom: '12px solid #3b82f6',
                borderLeft: '12px solid #0ea5e9',
                borderRight: '12px solid #0ea5e9',
                boxShadow: '0 0 60px rgba(14, 165, 233, 0.5), inset 0 0 40px rgba(14, 165, 233, 0.4)'
             }}
          >
             {gameState === 'goal' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
                   <div className="absolute inset-0 rounded-3xl z-[-1]" style={{ boxShadow: `inset 0 0 100px ${goalScorer === 'player' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(244, 63, 94, 0.4)'}` }}></div>
                   <div className="animate-in slide-in-from-bottom-10 zoom-in duration-500 transform flex flex-col items-center">
                     <h2 className={`text-5xl md:text-6xl font-bold font-heading mb-6 drop-shadow-xl ${goalScorer === 'player' ? 'text-blue-400' : 'text-rose-400'}`}>
                        {goalScorer === 'player' ? 'هدف لك!' : 'هدف للخصم!'}
                     </h2>
                     <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                        {countdown}
                     </div>
                   </div>
                </div>
             )}
             
             <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full h-full object-contain cursor-crosshair touch-none"
                style={{ touchAction: 'none' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
             />
          </div>
        </div>
      )}

      {gameState === 'results' && (
         <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <div className="bg-slate-900/90 p-6 md:p-8 rounded-3xl border border-slate-700 text-center w-full max-w-sm shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className={`absolute -left-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${winner === 'player' ? 'bg-blue-500/10' : 'bg-rose-500/10'}`}></div>

                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-xl border-2 relative z-10 ${winner === 'player' ? 'bg-blue-500/20 border-blue-500/40' : 'bg-rose-500/20 border-rose-500/40'}`}>
                   {winner === 'player' && <Trophy className="w-10 h-10 text-blue-400 animate-bounce" />}
                   {winner === 'bot' && <Target className="w-10 h-10 text-rose-400" />}
                </div>
                
                <h2 className="text-3xl font-bold mb-1 text-white relative z-10">
                   {winner === 'player' ? (is2v2 ? 'فريقك الفائز!' : 'أنت الفائز!') : 'هاردلك!'}
                </h2>
                <div className="mb-4"></div>
                
                <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl mt-4 mb-6 text-white grid grid-cols-2 gap-4 relative z-10">
                   <div className="bg-slate-800/80 rounded-xl p-3 text-center border-b-2 border-blue-500/50 flex flex-col justify-center items-center">
                      <p className="text-slate-400 text-xs mb-1">النقاط ({is2v2 ? 'فريقك' : 'أنت'})</p>
                      <p className="text-3xl font-bold font-mono text-blue-300">{playerScore}</p>
                   </div>
                   <div className="bg-slate-800/80 rounded-xl p-3 text-center border-b-2 border-rose-500/50 flex flex-col justify-center items-center">
                      <p className="text-slate-400 text-xs mb-1">النقاط (الخصم)</p>
                      <p className="text-3xl font-bold font-mono text-rose-300">{botScore}</p>
                   </div>
                </div>

                <div className="flex flex-col gap-3 relative z-10">
                  <button 
                    onClick={startGame} 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 text-lg"
                  >
                    <RotateCcw className="w-5 h-5" /> إعادة اللعب
                  </button>
                  <button 
                    onClick={() => setGameState('setup')} 
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 text-lg"
                  >
                    <Settings2 className="w-5 h-5" /> تغيير الطور / الإعدادات
                  </button>
                  <button 
                    onClick={() => navigate('/')} 
                    className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-lg border border-slate-700/50"
                  >
                    <HomeIcon className="w-5 h-5" /> العودة للرئيسية
                  </button>
                </div>
             </div>
         </div>
      )}
    </div>
  );
}
