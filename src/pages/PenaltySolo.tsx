import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Trophy, Goal, Shield, Save, XOctagon, RotateCcw, Volume2, VolumeX, Home as HomeIcon, Activity, Clock, Star, Medal } from 'lucide-react';
import { updatePenaltyStats } from '../lib/firebase';
import { storage } from '../lib/storage';
import { audio } from '../lib/audio';

type Direction = 'left' | 'center' | 'right';
type BotDifficulty = 'easy' | 'medium' | 'hard';
type TurnRole = 'kicker' | 'goalie';

interface KickResult {
  kicker: 'player' | 'bot';
  direction: Direction;
  goalieDirection: Direction;
  isGoal: boolean;
}

const TOTAL_ROUNDS_NORMAL = 5;
const ALL_DIRECTIONS: Direction[] = ['left', 'center', 'right'];

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

export default function PenaltySolo() {
  const navigate = useNavigate();
  
  // Game Setup & Progression States
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup');
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Game States
  const [currentRound, setCurrentRound] = useState(1);
  const [turnRole, setTurnRole] = useState<TurnRole>('kicker'); // Player always starts by kicking round 1
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [history, setHistory] = useState<KickResult[]>([]);
  const [isSuddenDeath, setIsSuddenDeath] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  
  // Stats
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  // Visual/Animation States
  const [kickState, setKickState] = useState<'idle' | 'animating' | 'result_shown'>('idle');
  const [announcement, setAnnouncement] = useState<{ text: string, color: string, sub: string } | null>(null);
  const [shake, setShake] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<any>(0);
  
  // Physics & Drawing states
  const ball = useRef({ x: 0, y: 0, z: 0, scale: 1, vx: 0, vy: 0, vz: 0, rotation: 0, hitPost: false, finalX: 0 });
  const goalie = useRef({ x: 0, y: 0, width: 60, height: 120, state: 'idle' as 'idle' | 'dive_left' | 'dive_right' | 'center_save', diveProgress: 0 });
  const kickerActor = useRef({ x: 0, y: 0, state: 'idle' as 'idle' | 'runup' | 'kick' });
  const animTime = useRef(0);
  
  // Setup audio based on state
  useEffect(() => {
    audio.setEnabled(soundEnabled);
    if (soundEnabled && gameState === 'playing') {
       audio.startCrowd();
    } else {
       audio.stopCrowd();
    }
  }, [soundEnabled, gameState]);

  // Main 10-second action timer
  useEffect(() => {
    if (gameState === 'playing' && kickState === 'idle') {
      setTimeLeft(10);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeOut();
            return 0;
          }
          if (soundEnabled) audio.tick();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, kickState, turnRole, currentRound]);

  const startGame = (diff: BotDifficulty) => {
    setDifficulty(diff);
    setCurrentRound(1);
    setTurnRole('kicker');
    setPlayerScore(0);
    setBotScore(0);
    setHistory([]);
    setIsSuddenDeath(false);
    setKickState('idle');
    setAnnouncement(null);
    setGameState('playing');
    if (soundEnabled) audio.whistle();
  };

  const handleTimeOut = () => {
    if (turnRole === 'kicker') {
      startAnimation('center', 'left', true, false); 
    } else {
      const randomDir = ALL_DIRECTIONS[Math.floor(Math.random() * 3)];
      startAnimation(randomDir, randomDir, false, false); 
    }
  };

  const getBotDecision = (role: TurnRole, diff: BotDifficulty): Direction => {
    const r = Math.random();
    if (role === 'kicker') {
      if (diff === 'easy') {
         if (r < 0.4) return 'center';
         return r < 0.7 ? 'left' : 'right';
      }
      if (diff === 'medium') return ALL_DIRECTIONS[Math.floor(r * 3)];
      return ALL_DIRECTIONS[Math.floor(r * 3)];
    } else {
      if (diff === 'easy') {
         if (r < 0.5) return 'center';
         return r < 0.75 ? 'left' : 'right';
      } else if (diff === 'medium') {
         return ALL_DIRECTIONS[Math.floor(r * 3)];
      } else {
         if (r < 0.2) return 'cheated' as any; 
         return ALL_DIRECTIONS[Math.floor(r * 3)];
      }
    }
  };

  const handlePlayerAction = (dir: Direction) => {
    if (kickState !== 'idle' || gameState !== 'playing') return;
    clearInterval(timerRef.current);
    
    let playerDir = dir;
    let botDir = getBotDecision(turnRole === 'kicker' ? 'goalie' : 'kicker', difficulty);
    
    if (botDir === ('cheated' as any)) {
       botDir = playerDir;
    }

    const hitPost = turnRole === 'kicker' && Math.random() < 0.1 && botDir !== playerDir; 

    if (turnRole === 'kicker') {
       startAnimation(playerDir, botDir, false, hitPost);
    } else {
       startAnimation(botDir, playerDir, false, hitPost);
    }
  };

  const startAnimation = (kickDir: Direction, saveDir: Direction, forcedMiss: boolean, hitPost: boolean) => {
    setKickState('animating');
    
    const isGoal = !forcedMiss && kickDir !== saveDir && !hitPost;
    
    animTime.current = 0;
    
    const cw = canvasRef.current?.width || 800;
    const ch = canvasRef.current?.height || 400;
    
    const targetVx = kickDir === 'left' ? -22 : (kickDir === 'right' ? 22 : 0);
    
    // Initial positions
    ball.current = {
      x: cw / 2, y: ch - 80, z: 0, scale: 1,
      vx: targetVx + (Math.random() - 0.5) * 4,
      vy: -13,
      vz: forcedMiss ? 12 : 7,
      rotation: 0,
      hitPost,
      finalX: 0
    };
    
    kickerActor.current = {
       x: cw / 2 + 40,
       y: ch + 20,
       state: 'runup'
    };
    
    if (forcedMiss) {
       ball.current.vx = kickDir === 'left' ? -35 : 35;
    } else if (hitPost) {
       ball.current.vx = kickDir === 'left' ? -28 : 28;
    }
    
    goalie.current = {
      x: cw / 2, y: (ch * 0.3) + 20, width: 60, height: 120,
      state: saveDir === 'left' ? 'dive_left' : (saveDir === 'right' ? 'dive_right' : 'center_save'),
      diveProgress: 0
    };

    let postHitHandled = false;

    const animate = () => {
      animTime.current++;
      const t = animTime.current;
      
      // Kicker run-up phase (frames 1-15)
      if (t < 15) {
         kickerActor.current.state = 'runup';
         kickerActor.current.x -= 2; // Move left towards ball
         kickerActor.current.y -= 5.5; // Move forward
      } else if (t === 15) {
         kickerActor.current.state = 'kick';
         if (soundEnabled) audio.kick();
      }

      // Ball movement phase (frames 15+)
      if (t >= 15) {
         const bt = t - 15; // Ball time
         ball.current.x += ball.current.vx;
         ball.current.y += ball.current.vy;
         ball.current.z += ball.current.vz;
         ball.current.scale = Math.max(0.32, 1 - (ball.current.z * 0.05));
         ball.current.rotation += 25;
         
         if (ball.current.hitPost && bt > 12 && !postHitHandled) {
            postHitHandled = true;
            if (soundEnabled) audio.postHit();
            ball.current.vx = -ball.current.vx * 0.5;
            ball.current.vy = Math.abs(ball.current.vy) * 0.5;
            ball.current.vz = -3;
         }

         if (!isGoal && !hitPost && !forcedMiss && bt > 13) {
            ball.current.vx *= 0.5;
            ball.current.vy *= 0.5;
            ball.current.vz = -2;
         }
         
         if (bt < 20) {
            goalie.current.diveProgress = bt / 20;
            const jumpTarget = saveDir === 'left' ? -200 : (saveDir === 'right' ? 200 : 0);
            goalie.current.x = (cw / 2) + (jumpTarget * goalie.current.diveProgress);
         }
      }
      
      drawCanvas();
      
      if (t < 50) {
         rafRef.current = requestAnimationFrame(animate);
      } else {
         finalizeAction(isGoal, forcedMiss, hitPost);
      }
    };
    
    rafRef.current = requestAnimationFrame(animate);
  };

  const finalizeAction = (isGoal: boolean, forcedMiss: boolean, hitPost: boolean) => {
    setKickState('result_shown');
    
    if (isGoal) {
       setShake(true);
       setTimeout(() => setShake(false), 500);
       if (soundEnabled) {
          audio.whistle();
          audio.crowdCheer();
       }
       if (turnRole === 'kicker') {
         setPlayerScore(p => p + 1);
         setAnnouncement({ text: 'هدف!', color: 'text-emerald-400', sub: 'تسديدة رائعة!' });
         setCurrentStreak(s => {
            const newStreak = s + 1;
            setMaxStreak(m => Math.max(m, newStreak));
            return newStreak;
         });
       } else {
         setBotScore(b => b + 1);
         setAnnouncement({ text: 'هدف!', color: 'text-rose-400', sub: 'في الشباك!' });
         setCurrentStreak(0);
       }
    } else {
       if (soundEnabled) {
          if (!hitPost && !forcedMiss) audio.slide();
       }
       
       if (turnRole === 'kicker') {
          setAnnouncement({ text: 'ضاعت!', color: 'text-rose-400', sub: forcedMiss ? 'تسديدة خارج المرمى!' : hitPost ? 'في القائم!' : 'الحارس منع الكرة' });
          setCurrentStreak(0); // target missed
       } else {
          setShake(true);
          setTimeout(() => setShake(false), 500);
          if (soundEnabled) audio.crowdCheer();
          setAnnouncement({ text: 'تصدي!', color: 'text-emerald-400', sub: 'لقد أنقذت المرمى!' });
          setCurrentStreak(s => {
             const newStreak = s + 1;
             setMaxStreak(m => Math.max(m, newStreak));
             return newStreak;
          });
       }
    }
    
    setHistory(prev => [...prev, {
       kicker: turnRole === 'kicker' ? 'player' : 'bot',
       direction: 'center',
       goalieDirection: 'center',
       isGoal
    }]);

    setTimeout(() => checkGameEnd(), 2500);
  };

  const checkGameEnd = () => {
    const playerKicksTaken = history.filter(h => h.kicker === 'player').length;
    const botKicksTaken = history.filter(h => h.kicker === 'bot').length;
    
    const playerRemaining = Math.max(0, TOTAL_ROUNDS_NORMAL - playerKicksTaken);
    const botRemaining = Math.max(0, TOTAL_ROUNDS_NORMAL - botKicksTaken);

    let winner: 'player' | 'bot' | null = null;
    
    if (!isSuddenDeath) {
       if (playerScore > botScore + botRemaining) winner = 'player';
       if (botScore > playerScore + playerRemaining) winner = 'bot';
       
       if (playerKicksTaken === 5 && botKicksTaken === 5 && !winner) {
          if (playerScore === botScore) {
             setIsSuddenDeath(true);
             setCurrentRound(6);
             setTurnRole('kicker');
             resetForNextAction();
             return;
          }
       }
    } else {
       if (playerKicksTaken === botKicksTaken) {
          if (playerScore > botScore) winner = 'player';
          if (botScore > playerScore) winner = 'bot';
       }
    }
    
    if (winner || (playerKicksTaken === 5 && botKicksTaken === 5 && !isSuddenDeath)) {
       if (!winner && playerScore > botScore) winner = 'player';
       if (!winner && botScore > playerScore) winner = 'bot';
       
       if (winner) {
          endGame(winner);
          return;
       }
    }

    if (turnRole === 'kicker') {
       setTurnRole('goalie');
    } else {
       setTurnRole('kicker');
       setCurrentRound(prev => prev + 1);
    }
    resetForNextAction();
  };

  const resetForNextAction = () => {
     setKickState('idle');
     setAnnouncement(null);
     drawCanvas(true);
     if (soundEnabled) audio.whistle();
  };

  const endGame = (winner: 'player' | 'bot') => {
    setGameState('results');
    if (soundEnabled) {
       if (winner === 'player') {
          audio.crowdCheer();
          setTimeout(() => audio.win(), 500);
       }
       else audio.wrong();
    }
    
    const playerId = storage.getPlayerId();
    const playerName = storage.getPlayerName() || 'لاعب مجهول';
    const playerSaves = history.filter(h => h.kicker === 'bot' && !h.isGoal).length;
    
    updatePenaltyStats(
      playerId,
      playerName,
      winner === 'player',
      playerScore,
      playerSaves
    );
  };

  const drawCanvas = (initial = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.3);
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);
    
    // Stands
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(w/2, h*0.25, w*1.5, h*0.3, 0, Math.PI, 0);
    ctx.fill();
    // Fans
    for(let i=0; i<400; i++) {
        const fanType = Math.random();
        ctx.fillStyle = fanType > 0.8 ? '#dc2626' : (fanType > 0.5 ? '#eab308' : '#cbd5e1'); // red, yellow, or white shirts
        ctx.beginPath();
        const fx = Math.random() * w;
        const fy = Math.random() * (h*0.25) + 10;
        ctx.arc(fx, fy, Math.random()*2 + 1, 0, Math.PI*2);
        ctx.fill();
    }

    // Pitch
    const horizon = h * 0.28;
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, horizon, w, h - horizon);
    
    // Grass stripes (perspective approximation)
    ctx.fillStyle = '#047857';
    for (let i = 0; i < 10; i++) {
       const y = horizon + ((h - horizon) * Math.pow(i/10, 1.8));
       const nextY = horizon + ((h - horizon) * Math.pow((i+0.5)/10, 1.8));
       ctx.fillRect(0, y, w, nextY - y);
    }
    
    // Box Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w*0.1, h);
    ctx.lineTo(w*0.3, horizon + (h*0.15));
    ctx.lineTo(w*0.7, horizon + (h*0.15));
    ctx.lineTo(w*0.9, h);
    ctx.stroke();

    // Penalty Spot
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.ellipse(w/2, h*0.85, 8, 4, 0, 0, Math.PI*2);
    ctx.fill();

    // Goal
    const goalCenter = w / 2;
    const goalTop = horizon - 40;
    const goalBottom = horizon + 70;
    const goalWidth = w * 0.55;
    const halfGW = goalWidth / 2;
    
    // Goal Net
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 30; i++) {
       const nx = (goalCenter - halfGW) + (goalWidth * (i/30));
       ctx.beginPath();
       ctx.moveTo(nx, goalTop);
       ctx.lineTo(nx, goalBottom);
       ctx.stroke();
    }
    for (let j = 0; j <= 15; j++) {
       const ny = goalTop + ((goalBottom - goalTop) * (j/15));
       ctx.beginPath();
       ctx.moveTo(goalCenter - halfGW, ny);
       ctx.lineTo(goalCenter + halfGW, ny);
       ctx.stroke();
    }

    // Goal Posts
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillRect(goalCenter - halfGW - 6, goalTop, 12, goalBottom - goalTop);
    ctx.fillRect(goalCenter + halfGW - 6, goalTop, 12, goalBottom - goalTop);
    ctx.fillRect(goalCenter - halfGW - 6, goalTop - 6, goalWidth + 12, 12);
    ctx.shadowBlur = 0;

    // Goalie
    let gX = w / 2;
    let gY = horizon + 30;
    let gh = 100;
    let gw = 45;
    
    if (!initial) {
       gX = goalie.current.x;
       gY = goalie.current.y;
    }

    ctx.save();
    ctx.translate(gX, gY);
    if (!initial) {
      if (goalie.current.state === 'dive_left') ctx.rotate(-Math.PI / 3 * goalie.current.diveProgress);
      else if (goalie.current.state === 'dive_right') ctx.rotate(Math.PI / 3 * goalie.current.diveProgress);
    }
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 10, gw, 10, 0, 0, Math.PI*2);
    ctx.fill();

    // Torso jersey
    ctx.fillStyle = '#f59e0b';
    roundRect(ctx, -gw/2, -gh + 25, gw, gh - 45, 6);
    
    // Shorts
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, -gw/2, -20, gw, 20, 4);

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(0, -gh + 10, 14, 0, Math.PI*2);
    ctx.fill();
    
    // Hands/Arms
    ctx.fillStyle = '#f59e0b';
    const armStretch = goalie.current.diveProgress * 25;
    if (goalie.current.state === 'idle' || goalie.current.state === 'center_save') {
        roundRect(ctx, -gw/2 - 12, -gh + 30, 12, 35, 6); // Left arm
        roundRect(ctx, gw/2, -gh + 30, 12, 35, 6); // Right arm
    } else if (goalie.current.state === 'dive_left') {
        roundRect(ctx, -gw/2 - 20 - armStretch, -gh + 10 - armStretch*0.8, 20+armStretch, 12, 6); // Up stretched
        roundRect(ctx, gw/2, -gh + 30, 12, 30, 6); // Beside
    } else if (goalie.current.state === 'dive_right') {
        roundRect(ctx, gw/2, -gh + 10 - armStretch*0.8, 20+armStretch, 12, 6); // Up stretched
        roundRect(ctx, -gw/2 - 12, -gh + 30, 12, 30, 6); // Beside
    }

    // Gloves
    ctx.fillStyle = '#cbd5e1';
    if (goalie.current.state === 'idle' || goalie.current.state === 'center_save') {
        ctx.beginPath(); ctx.arc(-gw/2 - 6, -gh + 65, 8, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(gw/2 + 6, -gh + 65, 8, 0, Math.PI*2); ctx.fill();
    } else if (goalie.current.state === 'dive_left') {
        ctx.beginPath(); ctx.arc(-gw/2 - 20 - armStretch, -gh + 16 - armStretch*0.8, 10, 0, Math.PI*2); ctx.fill();
    } else {
        ctx.beginPath(); ctx.arc(gw/2 + 20 + armStretch, -gh + 16 - armStretch*0.8, 10, 0, Math.PI*2); ctx.fill();
    }

    ctx.restore();

    // Ball
    let bX = w / 2;
    let bY = h - 60;
    let bScale = 1;
    let bRot = 0;

    if (!initial) {
       bX = ball.current.x;
       bY = ball.current.y;
       bScale = ball.current.scale;
       bRot = ball.current.rotation;
    }
    
    const bRadius = 16 * bScale;

    // Ball Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(bX, Math.min(h - 10, bY + 40 * bScale + (initial ? 10 : 30)), bRadius * 1.5, bRadius * 0.4, 0, 0, Math.PI*2);
    ctx.fill();

    // Ball Body
    ctx.save();
    ctx.translate(bX, bY);
    ctx.rotate((bRot * Math.PI) / 180);
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, bRadius, 0, Math.PI*2);
    ctx.fill();
    
    // Soccer pattern approximation
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, -bRadius * 0.4);
    ctx.lineTo(bRadius * 0.4, -bRadius * 0.1);
    ctx.lineTo(bRadius * 0.25, bRadius * 0.4);
    ctx.lineTo(-bRadius * 0.25, bRadius * 0.4);
    ctx.lineTo(-bRadius * 0.4, -bRadius * 0.1);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5 * bScale;
    ctx.beginPath();
    ctx.moveTo(0, -bRadius * 0.4); ctx.lineTo(0, -bRadius);
    ctx.moveTo(bRadius * 0.4, -bRadius * 0.1); ctx.lineTo(bRadius * 0.9, -bRadius * 0.3);
    ctx.moveTo(bRadius * 0.25, bRadius * 0.4); ctx.lineTo(bRadius * 0.6, bRadius * 0.8);
    ctx.moveTo(-bRadius * 0.25, bRadius * 0.4); ctx.lineTo(-bRadius * 0.6, bRadius * 0.8);
    ctx.moveTo(-bRadius * 0.4, -bRadius * 0.1); ctx.lineTo(-bRadius * 0.9, -bRadius * 0.3);
    ctx.stroke();
    
    ctx.restore();

    // Draw Kicker Character
    let kX = w / 2 + 40;
    let kY = h + 10;
    let kState = 'idle';
    if (!initial && kickState !== 'idle') {
       kX = kickerActor.current.x;
       kY = kickerActor.current.y;
       kState = kickerActor.current.state;
    }
    
    if (kState !== 'idle' || initial || kickState === 'idle') {
       ctx.save();
       ctx.translate(kX, kY);
       
       // Drop shadow for kicker
       ctx.fillStyle = 'rgba(0,0,0,0.4)';
       ctx.beginPath();
       ctx.ellipse(0, 5, 20, 6, 0, 0, Math.PI * 2);
       ctx.fill();
       
       // Body
       ctx.fillStyle = '#dc2626'; // Red jersey for player, maybe alternate color? We use red.
       roundRect(ctx, -15, -60, 30, 45, 8);
       
       // Number on back
       ctx.fillStyle = 'rgba(255,255,255,0.8)';
       ctx.font = 'bold 20px sans-serif';
       ctx.textAlign = 'center';
       ctx.fillText('10', 0, -32);
       
       // Shorts
       ctx.fillStyle = '#ffffff';
       roundRect(ctx, -15, -15, 30, 15, 4);
       
       // Legs logic
       ctx.fillStyle = '#fca5a5';
       if (kState === 'runup') {
          // Running animation alternating
          const stepOffset = Math.sin(animTime.current * 0.8) * 10;
          roundRect(ctx, -12, 0, 10, 20 + stepOffset, 5); // left leg
          roundRect(ctx, 2, 0, 10, 20 - stepOffset, 5); // right leg
       } else if (kState === 'kick') {
          // Kicking pose
          roundRect(ctx, -12, 0, 10, 25, 5); // planted left leg
          
          ctx.save();
          ctx.translate(2, 0);
          ctx.rotate(-Math.PI / 4);
          roundRect(ctx, 0, 0, 10, 25, 5); // kicking right leg
          ctx.restore();
       } else {
          // Standing idle
          roundRect(ctx, -12, 0, 10, 25, 5); 
          roundRect(ctx, 2, 0, 10, 25, 5); 
       }
       
       // Head (Seen from back)
       ctx.fillStyle = '#1e293b'; // Hair
       ctx.beginPath();
       ctx.arc(0, -70, 12, 0, Math.PI*2);
       ctx.fill();
       
       // Shoulders and arms
       ctx.fillStyle = '#dc2626';
       if (kState === 'runup') {
          const armOffset = Math.sin(animTime.current * 0.8) * 10;
          roundRect(ctx, -22, -55, 10, 30 - armOffset, 5); // left arm
          roundRect(ctx, 12, -55, 10, 30 + armOffset, 5); // right arm
       } else if (kState === 'kick') {
          ctx.save(); ctx.translate(-22, -55); ctx.rotate(-Math.PI/6); roundRect(ctx, 0, 0, 10, 30, 5); ctx.restore();
          ctx.save(); ctx.translate(12, -55); ctx.rotate(Math.PI/4); roundRect(ctx, 0, 0, 10, 30, 5); ctx.restore();
       } else {
          roundRect(ctx, -22, -55, 10, 35, 5);
          roundRect(ctx, 12, -55, 10, 35, 5);
       }
       ctx.restore();
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current) {
       const resize = () => {
          if (canvasRef.current && kickState === 'idle') {
             canvasRef.current.width = canvasRef.current.parentElement?.clientWidth || 800;
             canvasRef.current.height = Math.min(canvasRef.current.width * 0.6, 500);
             drawCanvas(true);
          }
       };
       resize();
       window.addEventListener('resize', resize);
       setTimeout(resize, 100);
       return () => window.removeEventListener('resize', resize);
    }
  }, [gameState, kickState]);

  if (gameState === 'setup') {
    return (
      <div className="max-w-3xl mx-auto p-6 md:p-12 animate-fade-in">
        <header className="flex items-center gap-4 mb-12">
          <button onClick={() => navigate('/')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold font-heading text-emerald-400">ركلات الجزاء</h1>
            <p className="text-slate-400 mt-1">اختبر مهاراتك في التسديد وحراسة المرمى (لعب فردي)</p>
          </div>
        </header>

        <div className="bg-slate-800/80 p-8 rounded-3xl border border-slate-700 space-y-8 backdrop-blur-sm shadow-xl">
          <div className="text-center">
             <div className="bg-emerald-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
               <Goal className="w-12 h-12 text-emerald-400" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">اختر صعوبة البوت</h2>
             <p className="text-slate-400">ستلعب {TOTAL_ROUNDS_NORMAL} جولات. في كل جولة تسدد مرة وتتصدى مرة.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {(['easy', 'medium', 'hard'] as BotDifficulty[]).map(d => (
              <button
                key={d}
                onClick={() => startGame(d)}
                className="bg-slate-900 border border-slate-700 p-6 rounded-2xl hover:border-emerald-500 hover:bg-emerald-500/10 transition-all group flex flex-col items-center hover:scale-105"
              >
                <div className={`text-3xl mb-3 ${d === 'easy' ? 'text-green-400' : d === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {d === 'easy' ? '😊' : d === 'medium' ? '😐' : '🤖'}
                </div>
                <h3 className="font-bold text-white mb-1 text-lg">
                  {d === 'easy' ? 'سهل' : d === 'medium' ? 'متوسط' : 'صعب'}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    const isPlayerWin = playerScore > botScore;
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-12 text-center animate-fade-in relative z-10 w-full">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl ${
           isPlayerWin ? 'bg-emerald-500/20 shadow-emerald-500/20' : 'bg-rose-500/20 shadow-rose-500/20'
        }`}>
          {isPlayerWin ? <Trophy className="w-16 h-16 text-emerald-400" /> : <XOctagon className="w-16 h-16 text-rose-500" />}
        </div>
        
        <h2 className="text-5xl font-bold font-heading mb-4 text-white">
          {isPlayerWin ? 'انتصار رائع!' : 'حظ أوفر المرة القادمة'}
        </h2>
        
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl mt-8">
           <div className="flex justify-between items-center px-4 md:px-12">
              <div className="text-center w-1/3">
                 <p className="text-slate-400 mb-2 font-bold">أنت</p>
                 <p className={`text-6xl font-mono font-bold ${isPlayerWin ? 'text-emerald-400' : 'text-slate-300'}`}>{playerScore}</p>
              </div>
              <div className="text-4xl text-slate-600 font-black">-</div>
              <div className="text-center w-1/3">
                 <p className="text-slate-400 mb-2 font-bold">البوت ({difficulty})</p>
                 <p className={`text-6xl font-mono font-bold ${!isPlayerWin ? 'text-rose-400' : 'text-slate-300'}`}>{botScore}</p>
              </div>
           </div>
           
           <div className="mt-8 pt-8 border-t border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 rounded-xl p-4 flex flex-col items-center text-center">
                 <p className="text-slate-400 text-xs mb-1">طبيعة اللعب</p>
                 <p className="text-lg font-bold text-sky-400">
                    {difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'}
                 </p>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 flex flex-col items-center text-center">
                 <p className="text-slate-400 text-xs mb-1">تسجيل</p>
                 <p className="text-lg font-bold text-white">
                    {Math.round((history.filter(h => h.kicker === 'player' && h.isGoal).length / Math.max(1, history.filter(h => h.kicker === 'player').length)) * 100)}%
                 </p>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 flex flex-col items-center text-center">
                 <p className="text-slate-400 text-xs mb-1">التصديات</p>
                 <p className="text-lg font-bold text-white flex items-center gap-1">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    {history.filter(h => h.kicker === 'bot' && !h.isGoal).length}
                 </p>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 flex flex-col items-center text-center">
                 <p className="text-slate-400 text-xs mb-1 flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" />
                    أفضل سلسلة
                 </p>
                 <p className="text-lg font-bold text-amber-400">
                    {maxStreak}
                 </p>
              </div>
           </div>
           
           {/* Achievements section */}
           <div className="mt-4 flex flex-wrap justify-center gap-2">
              {maxStreak >= 5 && (
                 <div className="px-3 py-1 bg-amber-500/10 text-amber-400 text-sm font-bold border border-amber-500/20 rounded-full flex items-center gap-1">
                    <Medal className="w-4 h-4" /> مدفعجي (5 متتالية)
                 </div>
              )}
              {isPlayerWin && botScore === 0 && (
                 <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20 rounded-full flex items-center gap-1">
                    <Shield className="w-4 h-4" /> شباك نظيفة
                 </div>
              )}
              {history.filter(h => h.kicker === 'bot' && !h.isGoal).length >= 3 && (
                 <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-sm font-bold border border-indigo-500/20 rounded-full flex items-center gap-1">
                    <Shield className="w-4 h-4" /> جدار حديدي
                 </div>
              )}
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => startGame(difficulty)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <RotateCcw className="w-5 h-5" />
            إعادة المباراة
          </button>
          <button
            onClick={() => { setGameState('setup'); }}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <HomeIcon className="w-5 h-5" />
            تغيير الصعوبة
          </button>
        </div>
      </div>
    );
  }

  // Active playing view
  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col min-h-[100dvh] justify-center animate-fade-in pb-12 w-full gap-2">
      
      {/* Top Header controls only */}
      <div className="flex justify-between items-center px-2">
         <button onClick={() => setGameState('setup')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
            <ChevronRight className="w-4 h-4" />
            خروج
         </button>
         <button 
           onClick={() => setSoundEnabled(!soundEnabled)}
           className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
         >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
         </button>
      </div>

      {/* Main Canvas Area */}
      <div className={`relative w-full rounded-t-3xl overflow-hidden border-2 border-slate-700 shadow-xl bg-[#0f172a] shadow-slate-900/50 flex-1 min-h-[300px] md:min-h-[400px] ${shake ? 'animate-shake' : ''}`}>
         <canvas 
           ref={canvasRef} 
           className="w-full h-full object-cover"
         />
         
         {/* Overlays */}
         {kickState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 transition-opacity">
               <span key={timeLeft} className="text-8xl md:text-9xl font-black text-white/30 drop-shadow-2xl animate-pulse">
                  {timeLeft}
               </span>
            </div>
         )}
         {announcement && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in z-20">
               <h2 className={`text-5xl md:text-7xl font-bold font-heading mb-4 drop-shadow-2xl ${announcement.color} transform scale-110 animate-bounce`}>
                  {announcement.text}
               </h2>
               <p className="text-lg md:text-2xl text-white font-bold bg-slate-900/80 px-6 py-2 rounded-full border border-slate-700">
                  {announcement.sub}
               </p>
            </div>
         )}
      </div>

      {/* Compact HUD (Sits snugly between canvas and buttons) */}
      <div className="flex justify-between items-center bg-slate-900 border-2 border-slate-700 border-t-0 p-3 shadow-xl relative z-20">
        <div className="flex flex-col items-center gap-1 w-16">
            <span className="text-xs text-slate-400 font-bold tracking-wider">أنت</span>
            <span className="text-3xl font-mono font-black text-emerald-400 leading-none">{playerScore}</span>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 space-y-2">
            <div className="flex items-center gap-2">
               <div className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg text-xs md:text-sm font-bold text-slate-300">
                 {isSuddenDeath ? 'موت مفاجئ' : `جولة ${currentRound}/${TOTAL_ROUNDS_NORMAL}`}
               </div>
               <div className={`flex items-center gap-1 min-w-[70px] justify-center px-3 py-1 rounded-lg text-sm font-bold border transition-colors ${timeLeft <= 3 ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-sky-400'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono">{timeLeft.toString().padStart(2, '0')}</span>
               </div>
            </div>
            <div className="flex items-center justify-center gap-2">
               <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${turnRole === 'kicker' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {turnRole === 'kicker' ? <Goal className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  {turnRole === 'kicker' ? 'دورك: التسديد' : 'دورك: الحراسة'}
               </div>
            </div>
        </div>

        <div className="flex flex-col items-center gap-1 w-16">
            <span className="text-xs text-slate-400 font-bold tracking-wider">البوت</span>
            <span className="text-3xl font-mono font-black text-rose-400 leading-none">{botScore}</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="bg-slate-800 border-2 border-slate-700 border-t-0 p-4 rounded-b-3xl relative z-10 shadow-2xl">
        <div className="grid grid-cols-3 gap-3 md:gap-4 h-28 md:h-32">
          
          <button
             onClick={() => handlePlayerAction('right')}
             disabled={kickState !== 'idle'}
             className="relative flex flex-col justify-center items-center h-full rounded-2xl bg-gradient-to-tl from-indigo-700 to-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:grayscale transition-all active:scale-90 shadow-[0_6px_0_rgb(49,46,129)] active:shadow-[0_0px_0_rgb(49,46,129)] active:translate-y-[6px] group"
          >
             <ChevronRight className="w-8 h-8 md:w-12 md:h-12 text-white/50 mb-1 group-hover:translate-x-2 transition-transform" />
             <span className="text-white font-bold text-lg md:text-2xl drop-shadow-md">يمين</span>
          </button>
          
          <button
             onClick={() => handlePlayerAction('center')}
             disabled={kickState !== 'idle'}
             className="relative flex flex-col justify-center items-center h-full rounded-2xl bg-gradient-to-t from-slate-700 to-slate-500 hover:to-slate-400 disabled:opacity-50 disabled:grayscale transition-all active:scale-90 shadow-[0_6px_0_rgb(51,65,85)] active:shadow-[0_0px_0_rgb(51,65,85)] active:translate-y-[6px] group border border-slate-500/50"
          >
             <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white/50 mb-2 group-hover:scale-125 transition-transform" />
             <span className="text-white font-bold text-lg md:text-2xl drop-shadow-md">وسط</span>
          </button>
          
          <button
             onClick={() => handlePlayerAction('left')}
             disabled={kickState !== 'idle'}
             className="relative flex flex-col justify-center items-center h-full rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:grayscale transition-all active:scale-90 shadow-[0_6px_0_rgb(49,46,129)] active:shadow-[0_0px_0_rgb(49,46,129)] active:translate-y-[6px] group"
          >
             <ChevronLeft className="w-8 h-8 md:w-12 md:h-12 text-white/50 mb-1 group-hover:-translate-x-2 transition-transform" />
             <span className="text-white font-bold text-lg md:text-2xl drop-shadow-md">يسار</span>
          </button>
          
        </div>
      </div>
    </div>
  );
}

