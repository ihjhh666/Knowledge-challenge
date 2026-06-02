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
  const kickStateRef = useRef(kickState);
  useEffect(() => { kickStateRef.current = kickState; }, [kickState]);
  const [announcement, setAnnouncement] = useState<{ text: string, color: string, sub: string } | null>(null);
  const [shake, setShake] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const idleRafRef = useRef<number>(0);
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

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(idleRafRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

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
    if (kickStateRef.current !== 'idle') return;
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
    if (kickStateRef.current !== 'idle' || gameState !== 'playing') return;
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
    const startY = ch - 50;
    
    const horizon = ch * 0.35;
    const endY = horizon + 30;
    const goalWidth = cw * 0.55;
    const halfGW = goalWidth / 2;
    const postPadding = 25;
    
    // Calculate fixed target X
    let targetX = cw / 2;
    if (kickDir === 'left') targetX = (cw / 2) - halfGW + postPadding;
    if (kickDir === 'right') targetX = (cw / 2) + halfGW - postPadding;
    
    if (hitPost) {
       targetX = kickDir === 'left' ? (cw / 2) - halfGW + 8 : (cw / 2) + halfGW - 8;
    } else if (forcedMiss) {
       targetX = kickDir === 'left' ? (cw / 2) - halfGW - 30 : (cw / 2) + halfGW + 30;
    }
    
    // Setup ball state for interpolation (using some unused vars like vx,vy,vz for post-hit physics)
    ball.current = {
      x: cw / 2, y: startY, z: 0, scale: 1,
      vx: 0, vy: 0, vz: 0,
      rotation: 0,
      hitPost,
      finalX: targetX
    };
    
    kickerActor.current = {
       x: cw / 2 + 35,
       y: startY + 30,
       state: 'runup'
    };
    
    goalie.current = {
      x: cw / 2, y: horizon + 30, width: 60, height: 120,
      state: 'idle',
      diveProgress: 0
    };

    let postHitHandled = false;
    const framesToGoal = 40; // ~660ms

    const animate = () => {
      animTime.current++;
      const t = animTime.current;
      
      // Kicker run-up phase (frames 1-15)
      if (t < 15) {
         kickerActor.current.state = 'runup';
         kickerActor.current.x -= 1;
         kickerActor.current.y -= 1;
      } else if (t === 15) {
         kickerActor.current.state = 'kick';
         if (soundEnabled) audio.kick();
         goalie.current.state = saveDir === 'left' ? 'dive_left' : (saveDir === 'right' ? 'dive_right' : 'center_save');
      }

      // Ball movement phase
      if (t > 15) {
         const bt = t - 15;
         
         // 1. Interpolation to target (bt: 1 -> framesToGoal)
         if (bt <= framesToGoal) {
             const progress = bt / framesToGoal;
             const easeOut = 1 - Math.pow(1 - progress, 3); // realistic deceleration
             
             ball.current.x = (cw / 2) + (targetX - (cw / 2)) * easeOut;
             ball.current.y = startY + (endY - startY) * easeOut;
             
             // Sine wave for realistic z-axis jump
             const peakHeight = forcedMiss ? 40 : 25;
             ball.current.z = Math.sin(progress * Math.PI) * peakHeight;
             
             ball.current.scale = Math.max(0.4, 1 - (easeOut * 0.6));
             ball.current.rotation += 25;
         } else {
             // 2. Post-reach physics (bounce, save, etc.)
             if (bt === framesToGoal + 1 && !postHitHandled) {
                postHitHandled = true;
                if (ball.current.hitPost) {
                   if (soundEnabled) audio.postHit();
                   ball.current.vx = (ball.current.x > cw / 2 ? 3 : -3);
                   ball.current.vy = 2;
                   ball.current.vz = 5;
                } else if (!isGoal && !forcedMiss) { // Save
                   ball.current.vx = (ball.current.x > cw / 2 ? 2 : -2);
                   ball.current.vy = 2;
                   ball.current.vz = 4;
                } else if (isGoal && !forcedMiss) { // Goal net hit
                   ball.current.vx = (Math.random() - 0.5) * 2;
                   ball.current.vy = -0.5;
                   ball.current.vz = 2;
                } else { // Miss
                   ball.current.vx = (ball.current.x > cw / 2 ? 2 : -2);
                   ball.current.vy = -3;
                   ball.current.vz = 3;
                }
             }
             
             // Apply post physics
             ball.current.x += ball.current.vx;
             ball.current.y += ball.current.vy;
             ball.current.vz -= 0.8; // gravity
             ball.current.z = Math.max(0, ball.current.z + ball.current.vz);
             
             if (isGoal && !forcedMiss && ball.current.z === 0) {
                 ball.current.vx *= 0.8;
                 ball.current.vy *= 0.8; // slow down in net
             }
         }

         // Goalie animation
         if (bt <= framesToGoal) {
            goalie.current.diveProgress = Math.min(1, Math.max(0, bt / framesToGoal));
            const maxJump = halfGW - 80; // stay strictly inside posts with rotation
            const jumpTarget = saveDir === 'left' ? -maxJump : (saveDir === 'right' ? maxJump : 0);
            goalie.current.x = (cw / 2) + (jumpTarget * goalie.current.diveProgress);
            
            const baseGY = ch * 0.35 + 30;
            if (saveDir !== 'center') {
                const jumpArc = Math.sin(goalie.current.diveProgress * Math.PI) * 10;
                goalie.current.y = baseGY - jumpArc;
            } else {
                goalie.current.y = baseGY;
            }
         }
      }
      
      drawCanvas();
      
      // framesToGoal(40) + runup(15) + wait(60) = 115 frames
      if (t < 115) {
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

    setTimeout(() => checkGameEnd(isGoal), 1000);
  };

  const checkGameEnd = (latestIsGoal: boolean) => {
    const currentHistory = [...history, { kicker: turnRole === 'kicker' ? 'player' : 'bot', isGoal: latestIsGoal }];
    const playerKicksTaken = currentHistory.filter((h: any) => h.kicker === 'player').length;
    const botKicksTaken = currentHistory.filter((h: any) => h.kicker === 'bot').length;
    
    const playerRemaining = Math.max(0, TOTAL_ROUNDS_NORMAL - playerKicksTaken);
    const botRemaining = Math.max(0, TOTAL_ROUNDS_NORMAL - botKicksTaken);
    
    // We also need the real scores since current state might be stale
    const realPlayerScore = currentHistory.filter((h: any) => h.kicker === 'player' && h.isGoal).length;
    const realBotScore = currentHistory.filter((h: any) => h.kicker === 'bot' && h.isGoal).length;

    let winner: 'player' | 'bot' | null = null;
    
    if (!isSuddenDeath) {
       if (realPlayerScore > realBotScore + botRemaining) winner = 'player';
       if (realBotScore > realPlayerScore + playerRemaining) winner = 'bot';
       
       if (playerKicksTaken === 5 && botKicksTaken === 5 && !winner) {
          if (realPlayerScore === realBotScore) {
             setIsSuddenDeath(true);
             setCurrentRound(6);
             setTurnRole('kicker');
             resetForNextAction();
             return;
          }
       }
    } else {
       if (playerKicksTaken === botKicksTaken) {
          if (realPlayerScore > realBotScore) winner = 'player';
          if (realBotScore > realPlayerScore) winner = 'bot';
       }
    }
    
    if (winner || (playerKicksTaken >= 5 && botKicksTaken >= 5 && !isSuddenDeath)) {
       if (!winner && realPlayerScore > realBotScore) winner = 'player';
       if (!winner && realBotScore > realPlayerScore) winner = 'bot';
       
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
     const cw = canvasRef.current?.width || 800;
     const ch = canvasRef.current?.height || 400;
     const startY = ch - 50;
     goalie.current = { x: cw / 2, y: ch * 0.35 + 30, width: 60, height: 120, state: 'idle', diveProgress: 0 };
     kickerActor.current = { x: cw / 2 + 35, y: startY + 30, state: 'idle' };
     ball.current = { x: cw / 2, y: startY, z: 0, scale: 1, vx: 0, vy: 0, vz: 0, rotation: 0, hitPost: false, finalX: 0 };
     
     setKickState('idle');
     setAnnouncement(null);
     drawCanvas(false);
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
    
    // Sky gradient - Night mode
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.3);
    skyGrad.addColorStop(0, '#020617'); // very dark blue
    skyGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);
    
    // Stadium Lights
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    ctx.moveTo(w*0.2, 0); ctx.lineTo(w*0.3, h*0.28); ctx.lineTo(w*0.5, h*0.28); ctx.lineTo(w*0.4, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w*0.8, 0); ctx.lineTo(w*0.7, h*0.28); ctx.lineTo(w*0.5, h*0.28); ctx.lineTo(w*0.6, 0);
    ctx.fill();

    // Stands
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(w/2, h*0.25, w*1.5, h*0.3, 0, Math.PI, 0);
    ctx.fill();
    
    // Crowd and flashes (deterministic positions with dynamic flashes)
    for(let i=0; i<400; i++) {
        const r1 = Math.abs(Math.sin(i * 123.45));
        const r2 = Math.abs(Math.cos(i * 678.90));
        
        ctx.beginPath();
        const fx = r1 * w;
        const fy = r2 * (h*0.25) + 10;
        
        if (Math.random() < 0.02 && kickStateRef.current === 'animating') {
            ctx.fillStyle = '#ffffff';
            ctx.arc(fx, fy, Math.random()*2.5 + 1.5, 0, Math.PI*2);
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            const fanType = r1;
            ctx.fillStyle = fanType > 0.8 ? '#991b1b' : (fanType > 0.6 ? '#1d4ed8' : '#334155'); 
            ctx.arc(fx, fy, 1.5, 0, Math.PI*2);
            ctx.fill();
        }
    }

    // Pitch
    const horizon = h * 0.35;
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, horizon, w, h - horizon);
    
    // Grass stripes (perspective approximation)
    ctx.fillStyle = '#047857';
    for (let i = 0; i < 10; i++) {
       const y = horizon + ((h - horizon) * Math.pow(i/10, 2));
       const nextY = horizon + ((h - horizon) * Math.pow((i+0.5)/10, 2));
       ctx.fillRect(0, y, w, nextY - y);
    }
    
    // Box Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w*0.05, h);
    ctx.lineTo(w*0.25, horizon + (h*0.12));
    ctx.lineTo(w*0.75, horizon + (h*0.12));
    ctx.lineTo(w*0.95, h);
    ctx.stroke();

    // Penalty Spot
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(w/2, h - 45, 10, 5, 0, 0, Math.PI*2);
    ctx.fill();

    // Goal Setup
    const goalCenter = w / 2;
    const goalTop = horizon - 45;
    const goalBottom = horizon + 45;
    const goalWidth = w * 0.55;
    const halfGW = goalWidth / 2;
    const goalDepthScale = 0.8;
    const goalBackW = goalWidth * goalDepthScale;
    const halfGBW = goalBackW / 2;
    const goalBackTop = goalTop + 10;
    const goalBackBottom = goalBottom - 15;

    // Goal Net (Back)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;

    // Draw realistic 3D net inside
    for (let i = 0; i <= 10; i++) {
        const nyFront = goalTop + ((goalBottom - goalTop) * (i/10));
        const nyBack = goalBackTop + ((goalBackBottom - goalBackTop) * (i/10));
        // Back wall
        ctx.beginPath(); ctx.moveTo(goalCenter - halfGBW, nyBack); ctx.lineTo(goalCenter + halfGBW, nyBack); ctx.stroke();
        // Side walls
        ctx.beginPath(); ctx.moveTo(goalCenter - halfGW, nyFront); ctx.lineTo(goalCenter - halfGBW, nyBack); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(goalCenter + halfGW, nyFront); ctx.lineTo(goalCenter + halfGBW, nyBack); ctx.stroke();
        // Roof
        const roofX = goalCenter - halfGBW + ((goalBackW) * (i/10));
        const roofFrontX = goalCenter - halfGW + ((goalWidth) * (i/10));
        ctx.beginPath(); ctx.moveTo(roofFrontX, goalTop); ctx.lineTo(roofX, goalBackTop); ctx.stroke();
    }
    // Vertical lines of net
    for (let i = 0; i <= 20; i++) {
        const nxFront = goalCenter - halfGW + (goalWidth * (i/20));
        const nxBack = goalCenter - halfGBW + (goalBackW * (i/20));
        ctx.beginPath(); ctx.moveTo(nxBack, goalBackTop); ctx.lineTo(nxBack, goalBackBottom); ctx.stroke();
    }

    // Goal Posts
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.fillRect(goalCenter - halfGW - 4, goalTop, 8, goalBottom - goalTop); // Left
    ctx.fillRect(goalCenter + halfGW - 4, goalTop, 8, goalBottom - goalTop); // Right
    ctx.fillRect(goalCenter - halfGW - 4, goalTop - 4, goalWidth + 8, 8); // Crossbar
    ctx.shadowBlur = 0;

    // Goalie
    let gX = w / 2;
    let gY = horizon + 30;
    let gh = 70; 
    let gw = 28; 
    let gState = 'idle';
    let gDive = 0;
    
    if (!initial && kickStateRef.current !== 'idle') {
       gX = goalie.current.x;
       gY = goalie.current.y;
       gState = goalie.current.state;
       gDive = goalie.current.diveProgress;
    }

    if (kickStateRef.current === 'result_shown' && history.length > 0 && history[history.length-1].isGoal) {
       gState = 'sad';
    }

    ctx.save();
    ctx.translate(gX, gY);
    if (!initial && kickStateRef.current !== 'idle') {
      if (gState === 'dive_left') ctx.rotate(-Math.PI / 2.5 * gDive);
      else if (gState === 'dive_right') ctx.rotate(Math.PI / 2.5 * gDive);
      else if (gState === 'sad') {
         ctx.translate(0, 30); 
      }
    }
    
    // Goalie Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 10, gw, 8, 0, 0, Math.PI*2);
    ctx.fill();

    const isPlayerGoalie = turnRole === 'goalie'; 
    ctx.fillStyle = isPlayerGoalie ? '#10b981' : '#f59e0b';
    roundRect(ctx, -gw/2, -gh + 20, gw, gh - 35, 6);
    
    // Shorts
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, -gw/2, -15, gw, 15, 4);

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(0, -gh + 8, 12, 0, Math.PI*2);
    ctx.fill();
    
    // Arms
    ctx.fillStyle = isPlayerGoalie ? '#10b981' : '#f59e0b';
    const armStretch = gDive * 20;
    if (gState === 'idle' || gState === 'center_save') {
        roundRect(ctx, -gw/2 - 10, -gh + 25, 10, 30, 4); 
        roundRect(ctx, gw/2, -gh + 25, 10, 30, 4); 
    } else if (gState === 'dive_left') {
        roundRect(ctx, -gw/2 - 15 - armStretch, -gh + 5 - armStretch*0.8, 15+armStretch, 10, 4); 
        roundRect(ctx, gw/2, -gh + 25, 10, 25, 4); 
    } else if (gState === 'dive_right') {
        roundRect(ctx, gw/2, -gh + 5 - armStretch*0.8, 15+armStretch, 10, 4); 
        roundRect(ctx, -gw/2 - 10, -gh + 25, 10, 25, 4); 
    } else if (gState === 'sad') {
        roundRect(ctx, -gw/2 - 10, -gh + 25, 10, -15, 4); 
        roundRect(ctx, gw/2, -gh + 25, 10, -15, 4);
    }

    // Gloves
    ctx.fillStyle = '#cbd5e1';
    if (gState === 'idle' || gState === 'center_save') {
        ctx.beginPath(); ctx.arc(-gw/2 - 5, -gh + 55, 7, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(gw/2 + 5, -gh + 55, 7, 0, Math.PI*2); ctx.fill();
    } else if (gState === 'dive_left') {
        ctx.beginPath(); ctx.arc(-gw/2 - 15 - armStretch, -gh + 10 - armStretch*0.8, 8, 0, Math.PI*2); ctx.fill();
    } else if (gState === 'dive_right') {
        ctx.beginPath(); ctx.arc(gw/2 + 15 + armStretch, -gh + 10 - armStretch*0.8, 8, 0, Math.PI*2); ctx.fill();
    } else if (gState === 'sad') {
        ctx.beginPath(); ctx.arc(-gw/2 - 5, -gh + 10, 7, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(gw/2 + 5, -gh + 10, 7, 0, Math.PI*2); ctx.fill();
    }

    ctx.restore();

    // Draw Ball Layer -------------------
    let bX = w / 2;
    const bInitialY = h - 50;
    let bY = bInitialY;
    let bZ = 0; 
    let bScale = 1;
    let bRot = 0;

    if (!initial && kickStateRef.current !== 'idle') {
       bX = ball.current.x;
       bY = ball.current.y;
       bZ = ball.current.z; 
       bScale = ball.current.scale;
       bRot = ball.current.rotation;
    }
    
    const bRadius = 14 * bScale;

    // Ball shadow (STAYS ON THE GROUND AT bY)
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    const shadowStretch = Math.max(0.1, 1 - (bZ * 0.02));
    ctx.ellipse(bX, bY, bRadius * 1.5 * shadowStretch, bRadius * 0.4 * shadowStretch, 0, 0, Math.PI*2);
    ctx.fill();

    // Actual drawn Ball
    const drawBY = bY - bZ; 
    ctx.save();
    ctx.translate(bX, drawBY);
    ctx.rotate((bRot * Math.PI) / 180);
    
    // Ball Body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, bRadius, 0, Math.PI*2);
    ctx.fill();
    
    // Texture (pentagons)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
        const tx = Math.cos(angle) * bRadius * 0.4;
        const ty = Math.sin(angle) * bRadius * 0.4;
        if (i === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5 * bScale;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle1 = (i * 2 * Math.PI / 5) - Math.PI / 2;
        const x1 = Math.cos(angle1) * bRadius * 0.4;
        const y1 = Math.sin(angle1) * bRadius * 0.4;
        const x2 = Math.cos(angle1) * bRadius;
        const y2 = Math.sin(angle1) * bRadius;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    ctx.restore();

    // Draw Kicker Actor Layer
    let kX = w / 2 + 35;
    let kY = bInitialY + 30;
    let kState = 'idle';
    if (!initial && kickStateRef.current !== 'idle') {
       kX = kickerActor.current.x;
       kY = kickerActor.current.y;
       kState = kickerActor.current.state;
    }
    
    if (kState !== 'idle' || initial || kickStateRef.current === 'idle') {
       ctx.save();
       ctx.translate(kX, kY);
       ctx.scale(0.4, 0.4);
       
       ctx.fillStyle = 'rgba(0,0,0,0.5)';
       ctx.beginPath();
       ctx.ellipse(0, 5, 25, 8, 0, 0, Math.PI * 2);
       ctx.fill();
       
       const isPlayerKicker = turnRole === 'kicker';
       const jerseyColor = isPlayerKicker ? '#dc2626' : '#2563eb';
       
       ctx.fillStyle = jerseyColor;
       roundRect(ctx, -15, -60, 30, 45, 8);
       
       ctx.fillStyle = 'rgba(255,255,255,0.9)';
       ctx.font = `bold 18px sans-serif`;
       ctx.textAlign = 'center';
       ctx.fillText(isPlayerKicker ? '10' : '9', 0, -32);
       
       ctx.fillStyle = '#ffffff';
       roundRect(ctx, -15, -15, 30, 15, 4);
       
       ctx.fillStyle = '#fca5a5';
       if (kState === 'runup') {
          const stepOffset = Math.sin(kX * 0.4) * 12;
          roundRect(ctx, -12, 0, 10, 20 + stepOffset, 5); 
          roundRect(ctx, 2, 0, 10, 20 - stepOffset, 5); 
       } else if (kState === 'kick') {
          roundRect(ctx, -12, 0, 10, 25, 5); 
          ctx.save(); ctx.translate(2, 0); ctx.rotate(-Math.PI / 4); roundRect(ctx, 0, 0, 10, 25, 5); ctx.restore();
       } else {
          roundRect(ctx, -12, 0, 10, 25, 5); 
          roundRect(ctx, 2, 0, 10, 25, 5); 
       }
       
       ctx.fillStyle = '#1e293b'; 
       ctx.beginPath();
       ctx.arc(0, -70, 12, 0, Math.PI*2);
       ctx.fill();
       
       ctx.fillStyle = jerseyColor;
       if (kState === 'runup') {
          const armOffset = Math.sin(kX * 0.4) * 10;
          roundRect(ctx, -22, -55, 10, 30 - armOffset, 5); 
          roundRect(ctx, 12, -55, 10, 30 + armOffset, 5); 
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
             const parent = canvasRef.current.parentElement;
             canvasRef.current.width = parent?.clientWidth || 800;
             canvasRef.current.height = parent?.clientHeight || 400;
             drawCanvas(true);
          }
       };
       resize();
       window.addEventListener('resize', resize);
       setTimeout(resize, 100);
       return () => window.removeEventListener('resize', resize);
    }
  }, [gameState, kickState]);

  useEffect(() => {
      let cancel = false;
      let tick = 0;
      const idleLoop = () => {
          if (cancel) return;
          if (gameState === 'playing' && kickState === 'idle') {
             tick++;
             if (tick % 15 === 0) {
                 drawCanvas();
             }
             idleRafRef.current = requestAnimationFrame(idleLoop);
          }
      };
      if (gameState === 'playing' && kickState === 'idle') {
          idleRafRef.current = requestAnimationFrame(idleLoop);
      }
      return () => { cancel = true; cancelAnimationFrame(idleRafRef.current); };
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
    <div className="max-w-2xl mx-auto p-2 flex flex-col h-[100dvh] justify-between pb-4 gap-2 animate-fade-in w-full">
      
      {/* Top Header controls only */}
      <div className="flex justify-between items-center px-4 pt-2">
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
      <div className={`relative w-full rounded-t-3xl overflow-hidden border-2 border-slate-700 shadow-xl bg-[#0f172a] shadow-slate-900/50 flex-1 min-h-[300px] md:min-h-[400px] max-h-[60vh] ${shake ? 'animate-shake' : ''}`}>
         <canvas 
           ref={canvasRef} 
           className="w-full h-full"
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

      {/* Compact HUD */}
      <div className="flex justify-between items-center bg-slate-900 border-2 border-slate-700 border-t-0 p-4 md:p-5 shadow-xl relative z-20">
        <div className="flex flex-col items-center gap-1 w-20">
            <span className="text-sm text-slate-400 font-bold tracking-wider">أنت</span>
            <span className="text-4xl md:text-5xl font-mono font-black text-emerald-400 leading-none">{playerScore}</span>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 space-y-3">
            <div className="flex items-center gap-3">
               <div className="bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-lg text-sm md:text-base font-bold text-slate-300">
                 {isSuddenDeath ? 'موت مفاجئ' : `جولة ${currentRound}/${TOTAL_ROUNDS_NORMAL}`}
               </div>
               <div className={`flex items-center gap-1.5 min-w-[80px] justify-center px-4 py-1.5 rounded-lg text-lg font-bold border transition-colors ${timeLeft <= 3 ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-sky-400'}`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-mono">{timeLeft.toString().padStart(2, '0')}</span>
               </div>
            </div>
            <div className="flex items-center justify-center gap-2">
               <div className={`px-5 py-2 rounded-full text-base font-bold flex items-center gap-2 ${turnRole === 'kicker' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {turnRole === 'kicker' ? <Goal className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  {turnRole === 'kicker' ? 'دورك: التسديد' : 'دورك: الحراسة'}
               </div>
            </div>
        </div>

        <div className="flex flex-col items-center gap-1 w-20">
            <span className="text-sm text-slate-400 font-bold tracking-wider">البوت</span>
            <span className="text-4xl md:text-5xl font-mono font-black text-rose-400 leading-none">{botScore}</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="bg-slate-800 border-2 border-slate-700 border-t-0 p-4 md:p-6 rounded-b-3xl relative z-10 shadow-2xl">
        <div className="grid grid-cols-3 gap-4 md:gap-6 h-28 md:h-32">
          <button
             onClick={() => handlePlayerAction('right')}
             disabled={kickState !== 'idle'}
             className="relative flex flex-col justify-center items-center h-full rounded-2xl bg-gradient-to-tl from-indigo-700 to-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:grayscale transition-all active:scale-90 shadow-[0_8px_0_rgb(49,46,129)] active:shadow-[0_0px_0_rgb(49,46,129)] active:translate-y-[8px] group"
          >
             <ChevronRight className="w-10 h-10 md:w-12 md:h-12 text-white/50 mb-1 group-hover:translate-x-2 transition-transform" />
             <span className="text-white font-bold text-xl md:text-2xl drop-shadow-md">يمين</span>
          </button>
          
          <button
             onClick={() => handlePlayerAction('center')}
             disabled={kickState !== 'idle'}
             className="relative flex flex-col justify-center items-center h-full rounded-2xl bg-gradient-to-t from-slate-700 to-slate-500 hover:to-slate-400 disabled:opacity-50 disabled:grayscale transition-all active:scale-90 shadow-[0_8px_0_rgb(51,65,85)] active:shadow-[0_0px_0_rgb(51,65,85)] active:translate-y-[8px] group border border-slate-500/50"
          >
             <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/50 mb-2 group-hover:scale-125 transition-transform" />
             <span className="text-white font-bold text-xl md:text-2xl drop-shadow-md">وسط</span>
          </button>
          
          <button
             onClick={() => handlePlayerAction('left')}
             disabled={kickState !== 'idle'}
             className="relative flex flex-col justify-center items-center h-full rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:grayscale transition-all active:scale-90 shadow-[0_8px_0_rgb(49,46,129)] active:shadow-[0_0px_0_rgb(49,46,129)] active:translate-y-[8px] group"
          >
             <ChevronLeft className="w-10 h-10 md:w-12 md:h-12 text-white/50 mb-1 group-hover:-translate-x-2 transition-transform" />
             <span className="text-white font-bold text-xl md:text-2xl drop-shadow-md">يسار</span>
          </button>
        </div>
      </div>
    </div>
  );
}

