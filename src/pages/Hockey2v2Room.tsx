import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings2, RotateCcw, HomeIcon, Trophy, Target, LogOut } from 'lucide-react';
import { useGame } from '../components/GameContext';
import { storage } from '../lib/storage';
import { updateHockeyStats } from '../lib/firebase';

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

const GOAL_LIMIT = 10;
const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 1000;
const PUCK_RADIUS = 16;
const PADDLE_RADIUS = 34;
const GOAL_WIDTH = 320;

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
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 120, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Face-off circles
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
      
      const drawChevron = (cx: number, cy: number, color: string, dir: number) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.beginPath();
          ctx.moveTo(cx - 20, cy - 10 * dir);
          ctx.lineTo(cx, cy + 10 * dir);
          ctx.lineTo(cx + 20, cy - 10 * dir);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(cx - 20, cy - 25 * dir);
          ctx.lineTo(cx, cy - 5 * dir);
          ctx.lineTo(cx + 20, cy - 25 * dir);
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

export default function Hockey2v2Room() {
  const navigate = useNavigate();
  const { state, isHost, playerId, leaveRoom, sendHockeyEvent, returnToLobby } = useGame();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [localGameState, setLocalGameState] = useState<'playing' | 'goal' | 'results'>('playing');
  
  const [player1Score, setPlayer1Score] = useState(0); 
  const [player2Score, setPlayer2Score] = useState(0); 
  
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);
  const [goalScorer, setGoalScorer] = useState<'player1' | 'player2' | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  const reqRef = useRef<number>();
  const puckTrailRef = useRef<{x: number, y: number, alpha: number}[]>([]);
  
  useEffect(() => {
     // Don't auto-win if 2v2 empty, since bots fill them. But if humans leave maybe end?

     // Actually in 2v2 we just let it play or wait if everyone leaves. We'll simplify.
  }, [state?.status, Object.keys(state?.players || {}).length, localGameState]);
  
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
  
  // Array of 4 paddles: [team1_1, team1_2, team2_1, team2_2]
  // Team 1 is host team (bottom), Team 2 is guest team (top)
  const paddlesRef = useRef<PhysicsEntity[]>([
    { pos: { x: CANVAS_WIDTH / 3, y: CANVAS_HEIGHT - 60 }, vel: { x: 0, y: 0 }, radius: PADDLE_RADIUS, mass: Number.POSITIVE_INFINITY },
    { pos: { x: (CANVAS_WIDTH / 3) * 2, y: CANVAS_HEIGHT - 60 }, vel: { x: 0, y: 0 }, radius: PADDLE_RADIUS, mass: Number.POSITIVE_INFINITY },
    { pos: { x: CANVAS_WIDTH / 3, y: 60 }, vel: { x: 0, y: 0 }, radius: PADDLE_RADIUS, mass: Number.POSITIVE_INFINITY },
    { pos: { x: (CANVAS_WIDTH / 3) * 2, y: 60 }, vel: { x: 0, y: 0 }, radius: PADDLE_RADIUS, mass: Number.POSITIVE_INFINITY }
  ]);
  
  // Who am I?
  const team1 = state?.hockeyState?.team1 || [];
  const team2 = state?.hockeyState?.team2 || [];
  let myIndex = -1;
  if (team1[0] === playerId) myIndex = 0;
  if (team1[1] === playerId) myIndex = 1;
  if (team2[0] === playerId) myIndex = 2;
  if (team2[1] === playerId) myIndex = 3;
  
  const isTeam1 = myIndex === 0 || myIndex === 1;
  
  const targetMyPosRef = useRef<Vec2 | null>(null);
  // We need to keep track of targets for all other paddles (for bots or incoming packets)
  const targetPaddlesPosRef = useRef<(Vec2 | null)[]>([null, null, null, null]);
  const lastLocalTargetTimeRef = useRef<number>(0);
  
  const syncTimerRef = useRef<number>(0);
  const lastLoopTimeRef = useRef<number>(0);
  
  const resetPositions = useCallback((serverIsTeam1: boolean = true) => {
    puckRef.current.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    puckRef.current.vel = { x: 0, y: serverIsTeam1 ? -3 : 3 };
    
    paddlesRef.current[0].pos = { x: CANVAS_WIDTH / 3, y: CANVAS_HEIGHT - 60 };
    paddlesRef.current[1].pos = { x: (CANVAS_WIDTH / 3) * 2, y: CANVAS_HEIGHT - 60 };
    paddlesRef.current[2].pos = { x: CANVAS_WIDTH / 3, y: 60 };
    paddlesRef.current[3].pos = { x: (CANVAS_WIDTH / 3) * 2, y: 60 };
    
    paddlesRef.current.forEach(p => p.vel = { x: 0, y: 0 });
    targetMyPosRef.current = null;
    targetPaddlesPosRef.current = [null, null, null, null];
    puckTrailRef.current = [];
  }, []);

  useEffect(() => {
    console.log("[Hockey2v2Room] Component mounted! Match started. isHost:", isHost);
    resetPositions(true); // force host to decide initial direction
    console.log("[Hockey2v2Room] Initial positions reset. Puck vel:", puckRef.current.vel);
  }, [resetPositions, isHost]);

  const updateStats = (isWin: boolean, pScore: number, oScore: number) => {
    const pId = storage.getPlayerId();
    const pName = storage.getPlayerName() || 'لاعب مجهول';
    const pointsAwarded = isWin ? 10 : 2;
    updateHockeyStats(pId, pName, isWin, pScore, oScore, pointsAwarded);
  };

  const onGoalHost = (scorerIsTeam1: boolean) => {
    playGoalSound();
    
    let newScore1 = player1Score + (scorerIsTeam1 ? 1 : 0);
    let newScore2 = player2Score + (!scorerIsTeam1 ? 1 : 0);
    
    setPlayer1Score(newScore1);
    setPlayer2Score(newScore2);
    
    let gState: 'playing' | 'goal' | 'results' = 'goal';
    let gScorer: 'player1' | 'player2' = scorerIsTeam1 ? 'player1' : 'player2';

    if (newScore1 >= GOAL_LIMIT || newScore2 >= GOAL_LIMIT) {
       gState = 'results';
       setLocalGameState('results');
       const won = (scorerIsTeam1 && isTeam1) || (!scorerIsTeam1 && !isTeam1);
       setWinner(scorerIsTeam1 ? 'player1' : 'player2');
       if (won) playWinSound(); else playLoseSound();
       updateStats(won, isTeam1 ? newScore1 : newScore2, isTeam1 ? newScore2 : newScore1);
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
               resetPositions(scorerIsTeam1);
               setLocalGameState('playing');
               puckTrailRef.current = [];
           }
       }, 1000);
    }

    sendHockeyEvent({ 
      type: 'HOCKEY_SYNC', 
      state: { 
        puck: { x: puckRef.current.pos.x, y: puckRef.current.pos.y, vx: puckRef.current.vel.x, vy: puckRef.current.vel.y }, 
        paddles: paddlesRef.current.map(p => ({x: p.pos.x, y: p.pos.y})),
        score1: newScore1, 
        score2: newScore2, 
        gameState: gState,
        goalScorer: gScorer,
        winner: gState === 'results' ? (scorerIsTeam1 ? 'player1' : 'player2') : null
      } 
    });
  };

  useEffect(() => {
    const handleHockeyEvent = (e: any) => {
      const msg = e.detail;
      
      if (msg.type === 'HOCKEY_ACTION') {
         if (msg.playerId !== playerId) {
            // Find which index this player is
            let idx = -1;
            if (team1[0] === msg.playerId) idx = 0;
            if (team1[1] === msg.playerId) idx = 1;
            if (team2[0] === msg.playerId) idx = 2;
            if (team2[1] === msg.playerId) idx = 3;
            if (idx !== -1) {
                targetPaddlesPosRef.current[idx] = { x: msg.paddle.x, y: msg.paddle.y };
            }
         }
      } else if (msg.type === 'HOCKEY_SYNC' && !isHost) {
         const s = msg.state;
         
         const errX = s.puck.x - puckRef.current.pos.x;
         const errY = s.puck.y - puckRef.current.pos.y;
         const dist = Math.hypot(errX, errY);
         
         if (dist > 30 || localGameState !== 'playing') {
            puckRef.current.pos = { x: s.puck.x, y: s.puck.y };
            puckRef.current.vel = { x: s.puck.vx, y: s.puck.vy };
         } else {
            puckRef.current.pos.x += errX * 0.5;
            puckRef.current.pos.y += errY * 0.5;
            puckRef.current.vel.x = s.puck.vx;
            puckRef.current.vel.y = s.puck.vy;
         }
         
         if (s.paddles) {
             s.paddles.forEach((pos: any, i: number) => {
                 if (i !== myIndex) {
                     targetPaddlesPosRef.current[i] = { x: pos.x, y: pos.y };
                 }
             });
         }

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
            const won = (isTeam1 && s.winner === 'player1') || (!isTeam1 && s.winner === 'player2');
            if (won) playWinSound(); else playLoseSound();
            updateStats(won, isTeam1 ? s.score1 : s.score2, isTeam1 ? s.score2 : s.score1);
         } else if (s.gameState === 'playing' && localGameState !== 'playing') {
            setLocalGameState('playing');
         }
      } else if (msg.type === 'HOCKEY_RESTART') {
         setPlayer1Score(0);
         setPlayer2Score(0);
         setLocalGameState('playing');
         resetPositions();
      }
    };
    window.addEventListener('hockey_event', handleHockeyEvent);
    return () => window.removeEventListener('hockey_event', handleHockeyEvent);
  }, [isHost, playerId, localGameState, player1Score, player2Score, myIndex, team1, team2, isTeam1]);

  const updatePhysics = (authoritative: boolean) => {
    const puck = puckRef.current;
    
    puck.vel.x *= 0.995;
    puck.vel.y *= 0.995;

    const MAX_SPEED = 35; // Slightly faster for 2v2 to make it exciting
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
      if (Math.abs(puck.vel.x) > 1 && authoritative) { playWallHitSound(Math.abs(puck.vel.x * 2)); screenShakeRef.current = 4; wallGlowRef.current.left = 1; }
    } else if (puck.pos.x + puck.radius >= CANVAS_WIDTH) {
      puck.pos.x = CANVAS_WIDTH - puck.radius;
      puck.vel.x *= -0.8;
      if (Math.abs(puck.vel.x) > 1 && authoritative) { playWallHitSound(Math.abs(puck.vel.x * 2)); screenShakeRef.current = 4; wallGlowRef.current.right = 1; }
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
        if (Math.abs(puck.vel.y) > 1 && authoritative) { playWallHitSound(Math.abs(puck.vel.y * 2)); screenShakeRef.current = 4; wallGlowRef.current.top = 1; }
      }
    } else if (puck.pos.y + puck.radius >= CANVAS_HEIGHT) {
      if (inGoalX) {
        if (puck.pos.y > CANVAS_HEIGHT + puck.radius && authoritative) onGoalHost(false);
      } else {
        puck.pos.y = CANVAS_HEIGHT - puck.radius;
        puck.vel.y *= -0.8;
        if (Math.abs(puck.vel.y) > 1 && authoritative) { playWallHitSound(Math.abs(puck.vel.y * 2)); screenShakeRef.current = 4; wallGlowRef.current.bottom = 1; }
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

    const collidePaddle = (paddle: PhysicsEntity, pIndex: number) => {
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
        
        puck.pos.x += nx * overlap;
        puck.pos.y += ny * overlap;
        
        const dot = puck.vel.x*nx + puck.vel.y*ny;
        const bounce = 0.95; 
        const tVelX = Math.max(-20, Math.min(20, paddle.vel.x || 0));
        const tVelY = Math.max(-20, Math.min(20, paddle.vel.y || 0));
        const hitX = tVelX * 0.5;
        const hitY = tVelY * 0.5;
        
        if (dot < 0) {
           puck.vel.x = puck.vel.x - 2 * dot * nx * bounce;
           puck.vel.y = puck.vel.y - 2 * dot * ny * bounce;
           if ((Math.abs(dot) > 10 || Math.hypot(hitX, hitY) > 10) && authoritative) screenShakeRef.current = 8;
        }
        
        puck.vel.x += hitX;
        puck.vel.y += hitY;
        const intensity = Math.abs(dot) + Math.hypot(hitX, hitY);
        if (authoritative || Math.abs(dot) > 2) {
            playHitSound(intensity);
            for (let i = 0; i < 5 + Math.min(10, intensity); i++) {
                particlesRef.current.push({
                    x: puck.pos.x - nx * puck.radius,
                    y: puck.pos.y - ny * puck.radius,
                    vx: (Math.random() - 0.5) * 15 + hitX * 0.5,
                    vy: (Math.random() - 0.5) * 15 + hitY * 0.5,
                    life: 1,
                    color: (pIndex === 0 || pIndex === 1) ? '#34d399' : '#fb7185',
                    size: Math.random() * 4 + 2
                });
            }
        }
      }
    };

    paddlesRef.current.forEach((pad, i) => collidePaddle(pad, i));

    // Paddle to paddle collision (prevents stacking/overlapping)
    for (let i = 0; i < paddlesRef.current.length; i++) {
        for (let j = i + 1; j < paddlesRef.current.length; j++) {
            const p1 = paddlesRef.current[i];
            const p2 = paddlesRef.current[j];
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
    
    // Invert view for guest team so they always play at the bottom
    if (!isTeam1) {
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
      
      if (isLocal) {
        ctx.beginPath();
        ctx.arc(x, y, r + 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    paddlesRef.current.forEach((pad, i) => {
        const isTeam1Pad = i === 0 || i === 1;
        const color1 = isTeam1Pad ? '#3b82f6' : '#fb7185';
        const color2 = isTeam1Pad ? '#1e3a8a' : '#881337';
        const glow = isTeam1Pad ? '#2563eb' : '#f43f5e';
        let label = '';
        if (i === myIndex) label = 'أنت (لاعب)';
        else if ((isTeam1Pad && isTeam1) || (!isTeam1Pad && !isTeam1)) label = 'زميلك';
        drawPaddle(pad.pos.x, pad.pos.y, pad.radius, color1, color2, glow, i === myIndex, label);
    });
    
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

  const updateBots = (dt: number) => {
      if (!isHost) return;
      
      const puck = puckRef.current;
      
      paddlesRef.current.forEach((pad, i) => {
          let botId = '';
          if (i === 0) botId = team1[0];
          if (i === 1) botId = team1[1];
          if (i === 2) botId = team2[0];
          if (i === 3) botId = team2[1];
          
          if (!botId?.startsWith('bot-')) return;
          
          const isTeam1Bot = i === 0 || i === 1;
          const defendY = isTeam1Bot ? CANVAS_HEIGHT - 60 : 60;
          const defendMinY = isTeam1Bot ? CANVAS_HEIGHT / 2 + 50 : PADDLE_RADIUS;
          const defendMaxY = isTeam1Bot ? CANVAS_HEIGHT - PADDLE_RADIUS : CANVAS_HEIGHT / 2 - 50;

          let targetX = pad.pos.x;
          let targetY = pad.pos.y;
          
          const puckDist = Math.hypot(puck.pos.x - pad.pos.x, puck.pos.y - pad.pos.y);
          
          // Role splitting in 2v2:
          // Bot index 0/2 tends to stay back (defender)
          // Bot index 1/3 tends to move forward (attacker)
          const isDefender = i === 0 || i === 2;
          
          if (isTeam1Bot) {
              if (puck.pos.y > CANVAS_HEIGHT / 2 - 100) {
                  // Puck is in our half
                  if (isDefender) {
                      // Defender guards the net, tracks puck horizontally but stays back
                      targetX = puck.pos.x;
                      targetY = Math.max(puck.pos.y + 40, CANVAS_HEIGHT - 120);
                  } else {
                      // Attacker chases the puck
                      targetX = puck.pos.x;
                      targetY = puck.pos.y;
                  }
              } else {
                  // Puck is in opponent's half
                  if (isDefender) {
                      targetX = CANVAS_WIDTH / 2;
                      targetY = CANVAS_HEIGHT - 80;
                  } else {
                      // Attacker stays ready near middle
                      targetX = Math.max(PADDLE_RADIUS, Math.min(CANVAS_WIDTH - PADDLE_RADIUS, puck.pos.x));
                      targetY = CANVAS_HEIGHT / 2 + 60;
                  }
              }
          } else {
              if (puck.pos.y < CANVAS_HEIGHT / 2 + 100) {
                  // Puck is in Team 2's half (top)
                  if (isDefender) {
                      targetX = puck.pos.x;
                      targetY = Math.min(puck.pos.y - 40, 120);
                  } else {
                      targetX = puck.pos.x;
                      targetY = puck.pos.y;
                  }
              } else {
                  // Puck is in opponent's half
                  if (isDefender) {
                      targetX = CANVAS_WIDTH / 2;
                      targetY = 80;
                  } else {
                      targetX = Math.max(PADDLE_RADIUS, Math.min(CANVAS_WIDTH - PADDLE_RADIUS, puck.pos.x));
                      targetY = CANVAS_HEIGHT / 2 - 60;
                  }
              }
          }
          
          targetY = Math.max(defendMinY, Math.min(defendMaxY, targetY));
          targetX = Math.max(PADDLE_RADIUS, Math.min(CANVAS_WIDTH - PADDLE_RADIUS, targetX));
          
          // Add some noise and error so bots aren't impossibly precise
          const errorX = (Math.random() - 0.5) * 40;
          const errorY = (Math.random() - 0.5) * 40;
          
          const speed = isDefender ? 0.08 : 0.12;
          pad.vel.x = (targetX + errorX - pad.pos.x) * speed;
          pad.vel.y = (targetY + errorY - pad.pos.y) * speed;
          
          pad.pos.x += pad.vel.x;
          pad.pos.y += pad.vel.y;
      });
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

      const now = performance.now();
      const dtLoop = Math.max(1, now - (lastLoopTimeRef.current || now - 16.66)) / 16.66;
      lastLoopTimeRef.current = now;
      
      if (myIndex !== -1) {
          const p = paddlesRef.current[myIndex];
          if (now - lastLocalTargetTimeRef.current > 50) {
             p.vel.x *= 0.5;
             p.vel.y *= 0.5;
             if (Math.abs(p.vel.x) < 0.1) p.vel.x = 0;
             if (Math.abs(p.vel.y) < 0.1) p.vel.y = 0;
          }
      }
      
      paddlesRef.current.forEach((pad, i) => {
          if (i === myIndex) return; // Handle local separately
          
          const t = targetPaddlesPosRef.current[i];
          if (t) {
             const interp = Math.min(1, 0.4 * dtLoop);
             pad.vel.x = (t.x - pad.pos.x) * interp;
             pad.vel.y = (t.y - pad.pos.y) * interp;
             pad.pos.x += pad.vel.x;
             pad.pos.y += pad.vel.y;
          }
      });
      
      updateBots(dtLoop);
      updatePhysics(isHost);

      if (now - syncTimerRef.current > 50) { // ~20 updates per second
          syncTimerRef.current = now;
          if (isHost) {
              sendHockeyEvent({
                  type: 'HOCKEY_SYNC',
                  state: {
                      puck: { x: puckRef.current.pos.x, y: puckRef.current.pos.y, vx: puckRef.current.vel.x, vy: puckRef.current.vel.y },
                      paddles: paddlesRef.current.map(p => ({x: p.pos.x, y: p.pos.y})),
                      score1: player1Score,
                      score2: player2Score,
                      gameState: localGameState
                  }
              });
          } else if (myIndex !== -1) {
              const p = paddlesRef.current[myIndex];
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
  }, [localGameState, isHost, player1Score, player2Score, myIndex, team1, team2]);

  useEffect(() => {
    reqRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [gameLoop]);

  useEffect(() => {
    let checkTimer: NodeJS.Timeout;
    if (localGameState === 'playing') {
       checkTimer = setInterval(() => {
           const p = puckRef.current.pos;
           const isM = (v: number) => isNaN(v) || v === null || v === undefined || !isFinite(v);
           let missing = false;
           
           if (isM(p.x) || isM(p.y)) missing = true;
           paddlesRef.current.forEach(pad => {
              if (isM(pad.pos.x) || isM(pad.pos.y)) missing = true;
           });
           
           const outOfBounds = p.x < -100 || p.x > CANVAS_WIDTH + 100 || p.y < -100 || p.y > CANVAS_HEIGHT + 100;
           const stagnant = Math.abs(puckRef.current.vel.x) < 0.2 && Math.abs(puckRef.current.vel.y) < 0.2;

           if (missing || outOfBounds || stagnant) {
               console.error("[Hockey2v2Room] Watchdog triggered! Puck:", p, "Vel:", puckRef.current.vel, "Stagnant:", stagnant, "OOB:", outOfBounds);
               resetPositions(isTeam1);
               if (stagnant || puckRef.current.vel.y === 0) {
                   puckRef.current.vel.y = isTeam1 ? -5 : 5;
               }
           }
       }, 2500);
    }
    return () => clearInterval(checkTimer);
  }, [localGameState, isTeam1, resetPositions]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (localGameState !== 'playing' || myIndex === -1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    let wx = (e.clientX - rect.left) * scaleX;
    let wy = (e.clientY - rect.top) * scaleY;

    if (!isTeam1) {
        wx = CANVAS_WIDTH - wx;
        wy = CANVAS_HEIGHT - wy;
    }

    const pRadius = PADDLE_RADIUS;
    let targetX = Math.max(pRadius, Math.min(CANVAS_WIDTH - pRadius, wx));
    let targetY = wy;
    
    if (isTeam1) {
        targetY = Math.max(CANVAS_HEIGHT / 2 + pRadius, Math.min(CANVAS_HEIGHT - pRadius, targetY));
    } else {
        targetY = Math.max(pRadius, Math.min(CANVAS_HEIGHT / 2 - pRadius, targetY));
    }

    const now = performance.now();
    const dt = Math.max(1, now - lastLocalTargetTimeRef.current);
    lastLocalTargetTimeRef.current = now;

    const p = paddlesRef.current[myIndex];
    
    if (targetMyPosRef.current) {
        const vx = ((targetX - targetMyPosRef.current.x) / dt) * 16.66;
        const vy = ((targetY - targetMyPosRef.current.y) / dt) * 16.66;
        p.vel = { x: vx, y: vy };
    }

    p.pos = { x: targetX, y: targetY };
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
    resetPositions();
  };

  const localPlayerScore = isTeam1 ? player1Score : player2Score;
  const localOppScore = isTeam1 ? player2Score : player1Score;
  
  const goalText = (goalScorer === 'player1' && isTeam1) || (goalScorer === 'player2' && !isTeam1) ? 'هدف لك!' : 'هدف للخصم!';
  const goalColor = (goalScorer === 'player1' && isTeam1) || (goalScorer === 'player2' && !isTeam1) ? 'text-blue-400' : 'text-rose-400';
  const goalShadow = (goalScorer === 'player1' && isTeam1) || (goalScorer === 'player2' && !isTeam1) ? 'rgba(59, 130, 246, 0.4)' : 'rgba(244, 63, 94, 0.4)';

  const localWon = winner === (isTeam1 ? 'player1' : 'player2');

  return (
    <div className="w-full flex flex-col items-center select-none touch-none bg-slate-950 p-2 relative h-full">
      <div className="w-full max-w-2xl flex justify-between items-center px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 shadow-lg shrink-0 z-20">
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
            <span className="text-4xl font-mono font-bold text-blue-400 drop-shadow-md">{localPlayerScore}</span>
         </div>
      </div>
          
      <div className="flex-1 w-full max-w-2xl relative bg-[#050b14] rounded-t-[40px] rounded-b-[40px] overflow-hidden flex justify-center items-center shadow-[0_0_60px_rgba(14,165,233,0.5),inset_0_0_40px_rgba(14,165,233,0.4)]"
         style={{ borderTop: '12px solid #ef4444', borderBottom: '12px solid #3b82f6', borderLeft: '12px solid #0ea5e9', borderRight: '12px solid #0ea5e9' }}
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
                <div className={`absolute -left-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${localWon ? 'bg-blue-500/10' : 'bg-rose-500/10'}`}></div>

                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-xl border-2 relative z-10 ${localWon ? 'bg-blue-500/20 border-blue-500/40' : 'bg-rose-500/20 border-rose-500/40'}`}>
                   {localWon ? <Trophy className="w-10 h-10 text-blue-400 animate-bounce" /> : <Target className="w-10 h-10 text-rose-400" />}
                </div>
                
                <h2 className="text-3xl font-bold mb-1 text-white relative z-10">
                   {state?.status === 'finished' && Object.keys(state.players).length < 2 ? 'انسحاب الخصم!' : localWon ? 'أنت الفائز!' : 'هاردلك!'}
                </h2>
                {state?.status === 'finished' && Object.keys(state.players).length < 2 && <p className="text-blue-400 mb-3 text-sm font-bold relative z-10">فزت بسبب انسحاب الخصم</p>}
                
                <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl mt-4 mb-6 text-white grid grid-cols-2 gap-4 relative z-10">
                   <div className="bg-slate-800/80 rounded-xl p-3 text-center border-b-2 border-blue-500/50 flex flex-col justify-center items-center">
                      <p className="text-slate-400 text-xs mb-1">النقاط (أنت)</p>
                      <p className="text-3xl font-bold font-mono text-blue-300">{localPlayerScore}</p>
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
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 text-lg"
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
