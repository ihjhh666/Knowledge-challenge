import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings2, RotateCcw, HomeIcon, Trophy, Target, LogOut } from 'lucide-react';
import { useGame } from '../components/GameContext';
import { storage } from '../lib/storage';
import { updateHockeyStats } from '../lib/firebase';

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playHitSound = () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
};

const playGoalSound = () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
};

const playWinSound = () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  [400, 500, 600, 800].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + i * 0.15);
    osc.stop(audioCtx.currentTime + i * 0.15 + 0.3);
  });
};

const playLoseSound = () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  [300, 250, 200, 150].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.2);
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime + i * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.2 + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + i * 0.2);
    osc.stop(audioCtx.currentTime + i * 0.2 + 0.4);
  });
};

const GOAL_LIMIT = 10;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;
const PUCK_RADIUS = 15;
const PADDLE_RADIUS = 30;
const GOAL_WIDTH = 140;

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

export default function HockeyRoom() {
  const navigate = useNavigate();
  const { state, isHost, playerId, leaveRoom, sendHockeyEvent, returnToLobby } = useGame();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [localGameState, setLocalGameState] = useState<'playing' | 'goal' | 'results'>('playing');
  
  // Track scores for player1 (Host) and player2 (Guest) explicitly
  const [player1Score, setPlayer1Score] = useState(0); 
  const [player2Score, setPlayer2Score] = useState(0); 
  
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);
  const [goalScorer, setGoalScorer] = useState<'player1' | 'player2' | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  const reqRef = useRef<number>();
  const puckTrailRef = useRef<{x: number, y: number, alpha: number}[]>([]);
  const screenShakeRef = useRef<number>(0);
  
  const puckRef = useRef<PhysicsEntity>({ 
    pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }, 
    vel: { x: 0, y: 0 }, 
    radius: PUCK_RADIUS, 
    mass: 1 
  });
  
  const hostPaddleRef = useRef<PhysicsEntity>({
    pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 },
    vel: { x: 0, y: 0 },
    radius: PADDLE_RADIUS,
    mass: Number.POSITIVE_INFINITY
  });
  
  const guestPaddleRef = useRef<PhysicsEntity>({
    pos: { x: CANVAS_WIDTH / 2, y: 60 },
    vel: { x: 0, y: 0 },
    radius: PADDLE_RADIUS,
    mass: Number.POSITIVE_INFINITY
  });
  
  const targetMyPosRef = useRef<Vec2 | null>(null);
  const targetOppPosRef = useRef<Vec2 | null>(null);
  
  const syncTimerRef = useRef<number>(0);
  const networkTickRef = useRef<number>(0);
  
  const myPaddleRef = isHost ? hostPaddleRef : guestPaddleRef;
  const oppPaddleRef = isHost ? guestPaddleRef : hostPaddleRef;
  
  const resetPositions = useCallback((serverIsHost: boolean) => {
    puckRef.current.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    puckRef.current.vel = { x: 0, y: serverIsHost ? -3 : 3 };
    hostPaddleRef.current.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 };
    hostPaddleRef.current.vel = { x: 0, y: 0 };
    guestPaddleRef.current.pos = { x: CANVAS_WIDTH / 2, y: 60 };
    guestPaddleRef.current.vel = { x: 0, y: 0 };
    targetMyPosRef.current = null;
    targetOppPosRef.current = null;
    puckTrailRef.current = [];
  }, []);

  const updateStats = (isWin: boolean, pScore: number, oScore: number) => {
    const pId = storage.getPlayerId();
    const pName = storage.getPlayerName() || 'لاعب مجهول';
    const pointsAwarded = isWin ? 10 : 2;
    updateHockeyStats(pId, pName, isWin, pScore, oScore, pointsAwarded);
  };

  const onGoalHost = (scorerIsHost: boolean) => {
    playGoalSound();
    
    let newScore1 = player1Score + (scorerIsHost ? 1 : 0);
    let newScore2 = player2Score + (!scorerIsHost ? 1 : 0);
    
    setPlayer1Score(newScore1);
    setPlayer2Score(newScore2);
    
    let gState: 'playing' | 'goal' | 'results' = 'goal';
    let gScorer: 'player1' | 'player2' = scorerIsHost ? 'player1' : 'player2';

    if (newScore1 >= GOAL_LIMIT || newScore2 >= GOAL_LIMIT) {
       gState = 'results';
       setLocalGameState('results');
       const won = (scorerIsHost && isHost) || (!scorerIsHost && !isHost);
       setWinner(scorerIsHost ? 'player1' : 'player2');
       if (won) playWinSound(); else playLoseSound();
       updateStats(won, isHost ? newScore1 : newScore2, isHost ? newScore2 : newScore1);
    } else {
       setLocalGameState('goal');
       setGoalScorer(gScorer);
       setCountdown(2);
       let left = 2;
       const tick = setInterval(() => {
           left--;
           setCountdown(left);
           if (left <= 0) {
               clearInterval(tick);
               resetPositions(scorerIsHost);
               setLocalGameState('playing');
               puckTrailRef.current = [];
           }
       }, 1000);
    }

    sendHockeyEvent({ 
      type: 'HOCKEY_SYNC', 
      state: { 
        puck: { x: puckRef.current.pos.x, y: puckRef.current.pos.y, vx: puckRef.current.vel.x, vy: puckRef.current.vel.y }, 
        paddle1: hostPaddleRef.current.pos, 
        paddle2: guestPaddleRef.current.pos, 
        score1: newScore1, 
        score2: newScore2, 
        gameState: gState,
        goalScorer: gScorer,
        winner: gState === 'results' ? (scorerIsHost ? 'player1' : 'player2') : null
      } 
    });
  };

  useEffect(() => {
    const handleHockeyEvent = (e: any) => {
      const msg = e.detail;
      
      if (msg.type === 'HOCKEY_ACTION') {
         if (msg.playerId !== playerId) {
            targetOppPosRef.current = { x: msg.paddle.x, y: msg.paddle.y };
         }
      } else if (msg.type === 'HOCKEY_SYNC' && !isHost) {
         const s = msg.state;
         
         // Error correction for puck (client prediction)
         const errX = s.puck.x - puckRef.current.pos.x;
         const errY = s.puck.y - puckRef.current.pos.y;
         const dist = Math.hypot(errX, errY);
         
         if (dist > 60 || localGameState !== 'playing') {
            puckRef.current.pos = { x: s.puck.x, y: s.puck.y };
         } else {
            puckRef.current.pos.x += errX * 0.3;
            puckRef.current.pos.y += errY * 0.3;
         }
         puckRef.current.vel = { x: s.puck.vx, y: s.puck.vy };
         
         // Host paddle update
         targetOppPosRef.current = { x: s.paddle1.x, y: s.paddle1.y };

         if (s.score1 !== player1Score) setPlayer1Score(s.score1);
         if (s.score2 !== player2Score) setPlayer2Score(s.score2);
         
         if (s.gameState === 'goal' && localGameState !== 'goal') {
            setLocalGameState('goal');
            playGoalSound();
            setGoalScorer(s.goalScorer);
            setCountdown(2);
            let left = 2;
            const tick = setInterval(() => { left--; setCountdown(left); if (left <= 0) clearInterval(tick); }, 1000);
         } else if (s.gameState === 'results' && localGameState !== 'results') {
            setLocalGameState('results');
            setWinner(s.winner);
            const won = s.winner === 'player2';
            if (won) playWinSound(); else playLoseSound();
            updateStats(won, s.score2, s.score1);
         } else if (s.gameState === 'playing' && localGameState !== 'playing') {
            setLocalGameState('playing');
         }
      } else if (msg.type === 'HOCKEY_RESTART') {
         setPlayer1Score(0);
         setPlayer2Score(0);
         setLocalGameState('playing');
         resetPositions(isHost);
      }
    };
    window.addEventListener('hockey_event', handleHockeyEvent);
    return () => window.removeEventListener('hockey_event', handleHockeyEvent);
  }, [isHost, playerId, localGameState, player1Score, player2Score]);

  const updatePhysics = (authoritative: boolean) => {
    const puck = puckRef.current;
    
    puck.vel.x *= 0.995;
    puck.vel.y *= 0.995;

    const MAX_SPEED = 30;
    const speedSq = puck.vel.x**2 + puck.vel.y**2;
    if (speedSq > MAX_SPEED**2) {
       const speed = Math.sqrt(speedSq);
       puck.vel.x = (puck.vel.x / speed) * MAX_SPEED;
       puck.vel.y = (puck.vel.y / speed) * MAX_SPEED;
    }

    const MIN_SPEED = 0.2;
    if (Math.abs(puck.vel.x) < MIN_SPEED && Math.abs(puck.vel.x) > 0) puck.vel.x = 0;
    if (Math.abs(puck.vel.y) < MIN_SPEED && Math.abs(puck.vel.y) > 0) puck.vel.y = 0;

    puck.pos.x += puck.vel.x;
    puck.pos.y += puck.vel.y;

    if (puck.pos.x - puck.radius <= 0) {
      puck.pos.x = puck.radius;
      puck.vel.x *= -0.8;
      if (Math.abs(puck.vel.x) > 1 && authoritative) { playHitSound(); screenShakeRef.current = 4; }
    } else if (puck.pos.x + puck.radius >= CANVAS_WIDTH) {
      puck.pos.x = CANVAS_WIDTH - puck.radius;
      puck.vel.x *= -0.8;
      if (Math.abs(puck.vel.x) > 1 && authoritative) { playHitSound(); screenShakeRef.current = 4; }
    }

    const goalLeft = (CANVAS_WIDTH - GOAL_WIDTH) / 2;
    const goalRight = goalLeft + GOAL_WIDTH;
    const inGoalX = puck.pos.x > goalLeft && puck.pos.x < goalRight;

    if (puck.pos.y - puck.radius <= 0) {
      if (inGoalX) {
        if (puck.pos.y < -puck.radius && authoritative) onGoalHost(true);
      } else {
        puck.pos.y = puck.radius;
        puck.vel.y *= -0.8;
        if (Math.abs(puck.vel.y) > 1 && authoritative) { playHitSound(); screenShakeRef.current = 4; }
      }
    } else if (puck.pos.y + puck.radius >= CANVAS_HEIGHT) {
      if (inGoalX) {
        if (puck.pos.y > CANVAS_HEIGHT + puck.radius && authoritative) onGoalHost(false);
      } else {
        puck.pos.y = CANVAS_HEIGHT - puck.radius;
        puck.vel.y *= -0.8;
        if (Math.abs(puck.vel.y) > 1 && authoritative) { playHitSound(); screenShakeRef.current = 4; }
      }
    }
    
    if (
      puck.pos.x < -puck.radius * 2 || 
      puck.pos.x > CANVAS_WIDTH + puck.radius * 2 ||
      puck.pos.y < -CANVAS_HEIGHT ||
      puck.pos.y > CANVAS_HEIGHT * 2 ||
      isNaN(puck.pos.x) || isNaN(puck.pos.y)
    ) {
      if (authoritative) resetPositions(true);
    }

    const collidePaddle = (paddle: PhysicsEntity) => {
      const dx = puck.pos.x - paddle.pos.x;
      const dy = puck.pos.y - paddle.pos.y;
      const distSq = dx*dx + dy*dy;
      const minRadius = puck.radius + paddle.radius;
      
      if (distSq <= minRadius*minRadius) {
        const dist = Math.sqrt(distSq);
        const overlap = minRadius - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        
        puck.pos.x += nx * overlap;
        puck.pos.y += ny * overlap;
        
        const dot = puck.vel.x*nx + puck.vel.y*ny;
        const bounce = 0.95; 
        const hitX = (paddle.vel.x || 0) * 1.0;
        const hitY = (paddle.vel.y || 0) * 1.0;
        
        if (dot < 0) {
           puck.vel.x = puck.vel.x - 2 * dot * nx * bounce;
           puck.vel.y = puck.vel.y - 2 * dot * ny * bounce;
           if ((Math.abs(dot) > 10 || Math.hypot(hitX, hitY) > 10) && authoritative) screenShakeRef.current = 8;
        }
        
        puck.vel.x += hitX;
        puck.vel.y += hitY;
        if (authoritative || Math.abs(dot) > 2) playHitSound();
      }
    };

    collidePaddle(hostPaddleRef.current);
    collidePaddle(guestPaddleRef.current);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    
    // Invert view for guest so they always play at the bottom
    if (!isHost) {
      ctx.translate(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.scale(-1, -1);
    }
    
    if (screenShakeRef.current > 0.5) {
      const shakeAmt = screenShakeRef.current;
      ctx.translate((Math.random() - 0.5) * shakeAmt, (Math.random() - 0.5) * shakeAmt);
      screenShakeRef.current *= 0.9;
    } else {
      screenShakeRef.current = 0;
    }

    const goalLeft = (CANVAS_WIDTH - GOAL_WIDTH) / 2;

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
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 80, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0; 
    
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
    drawChevron(60, CANVAS_HEIGHT * 3 / 4, 'rgba(16, 185, 129, 0.8)', 1); 
    drawChevron(CANVAS_WIDTH - 60, CANVAS_HEIGHT * 3 / 4, 'rgba(16, 185, 129, 0.8)', 1); 

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
    drawGoalArea(CANVAS_HEIGHT, 'rgba(16, 185, 129, 0.1)', -1); // Host goal

    const drawCircle = (x: number, y: number, r: number, color: string, border: string, glow: string) => {
      ctx.shadowColor = glow;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.shadowBlur = 0; 
      ctx.strokeStyle = border;
      ctx.stroke();
    };

    drawCircle(hostPaddleRef.current.pos.x, hostPaddleRef.current.pos.y, hostPaddleRef.current.radius, '#047857', '#34d399', '#10b981');
    drawCircle(guestPaddleRef.current.pos.x, guestPaddleRef.current.pos.y, guestPaddleRef.current.radius, '#be123c', '#fb7185', '#f43f5e');
    
    puckTrailRef.current.forEach(t => {
      if (!t) return;
      ctx.beginPath();
      ctx.arc(t.x, t.y, puckRef.current.radius * (0.4 + t.alpha * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${t.alpha * 0.5})`;
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgba(56, 189, 248, ${t.alpha})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    drawCircle(puckRef.current.pos.x, puckRef.current.pos.y, puckRef.current.radius, '#ffffff', '#e0f2fe', 'rgba(255, 255, 255, 1)');
    ctx.restore();
  };

  const gameLoop = useCallback(() => {
    if (localGameState !== 'playing' && localGameState !== 'goal') {
        reqRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    if (localGameState === 'playing') {
      puckTrailRef.current.push({ x: puckRef.current.pos.x, y: puckRef.current.pos.y, alpha: 1 });
      if (puckTrailRef.current.length > 8) {
        puckTrailRef.current.shift();
      }
      puckTrailRef.current.forEach(t => t.alpha -= 0.12);

      const p = myPaddleRef.current;
      if (targetMyPosRef.current) {
         let t = targetMyPosRef.current;
         p.vel.x = (t.x - p.pos.x);
         p.vel.y = (t.y - p.pos.y);
         p.pos.x = t.x;
         p.pos.y = t.y;
      } else {
         p.vel.x = 0;
         p.vel.y = 0;
      }
      
      const opp = oppPaddleRef.current;
      if (targetOppPosRef.current) {
         const t = targetOppPosRef.current;
         opp.vel.x = (t.x - opp.pos.x) * 0.4;
         opp.vel.y = (t.y - opp.pos.y) * 0.4;
         opp.pos.x += opp.vel.x;
         opp.pos.y += opp.vel.y;
      }

      updatePhysics(isHost);

      networkTickRef.current++;
      if (isHost) {
         if (networkTickRef.current % 3 === 0) {
             sendHockeyEvent({
                 type: 'HOCKEY_SYNC',
                 state: {
                     puck: { x: puckRef.current.pos.x, y: puckRef.current.pos.y, vx: puckRef.current.vel.x, vy: puckRef.current.vel.y },
                     paddle1: hostPaddleRef.current.pos,
                     paddle2: guestPaddleRef.current.pos,
                     score1: player1Score,
                     score2: player2Score,
                     gameState: localGameState
                 }
             });
         }
      } else {
         if (p.vel.x !== 0 || p.vel.y !== 0 || networkTickRef.current % 3 === 0) {
             sendHockeyEvent({
                type: 'HOCKEY_ACTION',
                paddle: { x: p.pos.x, y: p.pos.y, vx: p.vel.x, vy: p.vel.y }
             });
         }
      }
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) draw(ctx);
    }

    reqRef.current = requestAnimationFrame(gameLoop);
  }, [localGameState, isHost, player1Score, player2Score]);

  useEffect(() => {
    reqRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [gameLoop]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (localGameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    let wx = (e.clientX - rect.left) * scaleX;
    let wy = (e.clientY - rect.top) * scaleY;

    if (!isHost) {
        wx = CANVAS_WIDTH - wx;
        wy = CANVAS_HEIGHT - wy;
    }

    const pRadius = PADDLE_RADIUS;
    let targetX = Math.max(pRadius, Math.min(CANVAS_WIDTH - pRadius, wx));
    let targetY = wy;
    
    if (isHost) {
        targetY = Math.max(CANVAS_HEIGHT / 2 + pRadius, Math.min(CANVAS_HEIGHT - pRadius, targetY));
    } else {
        targetY = Math.max(pRadius, Math.min(CANVAS_HEIGHT / 2 - pRadius, targetY));
    }

    targetMyPosRef.current = { x: targetX, y: targetY };
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
    targetMyPosRef.current = null;
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  const handlePlayAgain = () => {
    if (!isHost) return;
    sendHockeyEvent({ type: 'HOCKEY_RESTART' });
    setPlayer1Score(0);
    setPlayer2Score(0);
    setLocalGameState('playing');
    resetPositions(true);
  };

  const localPlayerScore = isHost ? player1Score : player2Score;
  const localOppScore = isHost ? player2Score : player1Score;
  
  const goalText = (goalScorer === 'player1' && isHost) || (goalScorer === 'player2' && !isHost) ? 'هدف لك!' : 'هدف للخصم!';
  const goalColor = (goalScorer === 'player1' && isHost) || (goalScorer === 'player2' && !isHost) ? 'text-emerald-400' : 'text-rose-400';
  const goalShadow = (goalScorer === 'player1' && isHost) || (goalScorer === 'player2' && !isHost) ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';

  const localWon = winner === (isHost ? 'player1' : 'player2');

  return (
    <div className="w-full flex flex-col items-center select-none touch-none bg-slate-950 p-2 relative h-full">
      <div className="w-full max-w-md flex justify-between items-center px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 shadow-lg shrink-0 z-20">
         <div className="flex flex-col items-center gap-1">
            <span className="text-slate-400 text-xs font-bold bg-slate-950 px-2 py-0.5 rounded-full">الخصم</span>
            <span className="text-4xl font-mono font-bold text-rose-400 drop-shadow-md">{localOppScore}</span>
         </div>
         <div className="flex flex-col items-center flex-1 mx-4">
             <button onClick={handleLeave} className="text-slate-500 hover:text-white p-2 transition-colors active:scale-95">
                <LogOut className="w-5 h-5"/>
             </button>
             <span className="text-xs text-slate-500 font-bold tracking-wider mt-1">من {GOAL_LIMIT}</span>
         </div>
         <div className="flex flex-col items-center gap-1">
            <span className="text-slate-400 text-xs font-bold bg-slate-950 px-2 py-0.5 rounded-full">أنت</span>
            <span className="text-4xl font-mono font-bold text-emerald-400 drop-shadow-md">{localPlayerScore}</span>
         </div>
      </div>
          
      <div className="flex-1 w-full max-w-md relative bg-[#050b14] rounded-t-[40px] rounded-b-[40px] overflow-hidden flex justify-center items-center shadow-[0_0_60px_rgba(14,165,233,0.5),inset_0_0_40px_rgba(14,165,233,0.4)]"
         style={{ borderTop: '12px solid #ef4444', borderBottom: '12px solid #10b981', borderLeft: '12px solid #0ea5e9', borderRight: '12px solid #0ea5e9' }}
      >
         {localGameState === 'goal' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="absolute inset-0 rounded-3xl z-[-1]" style={{ boxShadow: `inset 0 0 100px ${goalShadow}` }}></div>
               <div className="animate-in slide-in-from-bottom-10 zoom-in duration-500 transform flex flex-col items-center">
                 <h2 className={`text-5xl md:text-6xl font-bold font-heading mb-6 drop-shadow-xl ${goalColor}`}>
                    {goalText}
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
            className="w-full h-auto max-h-[80vh] object-contain cursor-crosshair touch-none"
            style={{ touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
         />
      </div>

      {localGameState === 'results' && (
         <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <div className="bg-slate-900/90 p-6 md:p-8 rounded-3xl border border-slate-700 text-center w-full max-w-sm shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className={`absolute -left-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${localWon ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}></div>

                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-xl border-2 relative z-10 ${localWon ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-rose-500/20 border-rose-500/40'}`}>
                   {localWon ? <Trophy className="w-10 h-10 text-emerald-400 animate-bounce" /> : <Target className="w-10 h-10 text-rose-400" />}
                </div>
                
                <h2 className="text-3xl font-bold mb-1 text-white relative z-10">
                   {localWon ? 'أنت الفائز!' : 'هاردلك!'}
                </h2>
                
                <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl mt-4 mb-6 text-white grid grid-cols-2 gap-4 relative z-10">
                   <div className="bg-slate-800/80 rounded-xl p-3 text-center border-b-2 border-emerald-500/50 flex flex-col justify-center items-center">
                      <p className="text-slate-400 text-xs mb-1">النقاط (أنت)</p>
                      <p className="text-3xl font-bold font-mono text-emerald-300">{localPlayerScore}</p>
                   </div>
                   <div className="bg-slate-800/80 rounded-xl p-3 text-center border-b-2 border-rose-500/50 flex flex-col justify-center items-center">
                      <p className="text-slate-400 text-xs mb-1">النقاط (الخصم)</p>
                      <p className="text-3xl font-bold font-mono text-rose-300">{localOppScore}</p>
                   </div>
                </div>

                <div className="flex flex-col gap-3 relative z-10">
                  {isHost ? (
                     <>
                        <button 
                          onClick={handlePlayAgain} 
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 text-lg"
                        >
                          <RotateCcw className="w-5 h-5" /> إعادة اللعب
                        </button>
                        <button 
                          onClick={() => returnToLobby()} 
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl mt-2 select-none active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Settings2 className="w-5 h-5" /> تغيير الطور
                        </button>
                     </>
                  ) : (
                     <div className="text-center text-slate-400 py-4 font-bold bg-slate-800/50 rounded-xl border border-slate-700/50">
                        في انتظار المضيف ...
                     </div>
                  )}
                  <button 
                    onClick={handleLeave} 
                    className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-lg border border-slate-700/50"
                  >
                    <HomeIcon className="w-5 h-5" /> الخروج من الغرفة
                  </button>
                </div>
             </div>
         </div>
      )}
    </div>
  );
}
