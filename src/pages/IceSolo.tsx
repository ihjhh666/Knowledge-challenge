import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { audio } from '../lib/audio';
import { triggerStatUpdate } from '../components/AchievementSystem';
import { Trophy, ChevronRight, Play, RotateCcw, Target, Zap, Snowflake, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type GameState = 'menu' | 'playing' | 'gameover';

interface Tile {
  r: number;
  c: number;
  state: 0 | 1 | 2; // 0=Normal, 1=Cracked, 2=Broken
  crackTimer?: number;
}

interface Character {
  id: string;
  name: string;
  isBot: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  falling: boolean;
  fallScale: number;
  angle: number;
  dead: boolean;
  colorBody: string;
  colorBelly: string;
  hatType: number;
  ix: number;
  iy: number;
  aiChangeTimer: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  isTrail?: boolean;
  angle?: number;
}

const ROWS = 12;
const COLS = 12;
const TILE_SIZE = 60;
const GRID_W = COLS * TILE_SIZE;
const GRID_H = ROWS * TILE_SIZE;

const ACCEL = 300; // px/s^2 (lower for better control)
const FRICTION = 0.98; // smoother slide

export default function IceSolo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  
  const [aliveCount, setAliveCount] = useState(6);
  const [eliminationMsg, setEliminationMsg] = useState<string | null>(null);
  const [playerPlacement, setPlayerPlacement] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const tilesRef = useRef<Tile[]>([]);
  const charsRef = useRef<Character[]>([]);
  const inputsRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const joystickRef = useRef({ active: false, startX: 0, startY: 0, curX: 0, curY: 0, dx: 0, dy: 0 });
  const cameraRef = useRef({ x: GRID_W / 2, y: GRID_H / 2 });
  const shakeRef = useRef(0);

  const gameTimeRef = useRef(0);
  const nextCrackTimeRef = useRef(0);
  const scoreTimerRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;
      if (key === 'ArrowUp' || key === 'w') inputsRef.current.y = -1;
      if (key === 'ArrowDown' || key === 's') inputsRef.current.y = 1;
      if (key === 'ArrowLeft' || key === 'a') inputsRef.current.x = -1;
      if (key === 'ArrowRight' || key === 'd') inputsRef.current.x = 1;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const { key } = e;
      if (key === 'ArrowUp' || key === 'w') inputsRef.current.y = 0;
      if (key === 'ArrowDown' || key === 's') inputsRef.current.y = 0;
      if (key === 'ArrowLeft' || key === 'a') inputsRef.current.x = 0;
      if (key === 'ArrowRight' || key === 'd') inputsRef.current.x = 0;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = useCallback(() => {
    const initialTiles: Tile[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        initialTiles.push({ r, c, state: 0 });
      }
    }
    cameraRef.current = { x: GRID_W / 2, y: GRID_H / 2 + 100 };
    tilesRef.current = initialTiles;
    
    const chars: Character[] = [];
    chars.push({
      id: 'player', name: 'أنت', isBot: false,
      x: GRID_W / 2, y: GRID_H / 2 + 100, vx: 0, vy: 0,
      radius: 12, falling: false, fallScale: 1, angle: 0, dead: false,
      colorBody: '#1e293b', colorBelly: '#f8fafc', hatType: 0, ix: 0, iy: 0, aiChangeTimer: 0
    });
    
    const botNames = ['Frost', 'Ice', 'Snow', 'Polar', 'Freeze'];
    const botColors = [
        { body: '#0284c7', belly: '#e0f2fe' }, { body: '#4338ca', belly: '#e0e7ff' },
        { body: '#b91c1c', belly: '#fee2e2' }, { body: '#c026d3', belly: '#fae8ff' },
        { body: '#047857', belly: '#d1fae5' }
    ];
    for(let i=0; i<5; i++) {
        chars.push({
            id: `bot_${i}`, name: botNames[i], isBot: true,
            x: GRID_W/2 + (Math.random()-0.5)*400, y: GRID_H/2 + (Math.random()-0.5)*400,
            vx: 0, vy: 0, radius: 12, falling: false, fallScale: 1, angle: 0, dead: false,
            colorBody: botColors[i].body, colorBelly: botColors[i].belly, hatType: i+1,
            ix: 0, iy: 0, aiChangeTimer: Math.random()
        });
    }
    charsRef.current = chars;
    
    inputsRef.current = { x: 0, y: 0 };
    particlesRef.current = [];
    shakeRef.current = 0;
    gameTimeRef.current = 0;
    nextCrackTimeRef.current = 3;
    scoreTimerRef.current = 0;
    joystickRef.current = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, dx: 0, dy: 0 };
    
    setScore(0);
    setLevel(1);
    setTimeSurvived(0);
    setEarnedXp(0);
    setAliveCount(6);
    setEliminationMsg(null);
    setPlayerPlacement(0);
    
    setGameState('playing');
    audio.tick();
  }, []);

  const endGame = useCallback(() => {
    setGameState('gameover');
    audio.wrong();
    
    const finalTime = Math.floor(gameTimeRef.current);
    const finalScore = finalTime * 10 + (level * 50);
    const xp = Math.floor(finalScore / 5);
    
    setScore(finalScore);
    setTimeSurvived(finalTime);
    setEarnedXp(xp);
    
    if (user?.user_metadata?.account_type !== 'guest') {
      import('../lib/achievements').then(({ getPlayerStats }) => {
        const stats = getPlayerStats();
        triggerStatUpdate({
          iceMaxSurviveTime: Math.max(stats.iceMaxSurviveTime || 0, finalTime),
          iceMaxLevelReached: Math.max(stats.iceMaxLevelReached || 0, level),
          totalXp: (stats.totalXp || 0) + xp
        });
        if (level >= 10) {
          triggerStatUpdate({ iceFlawlessWins: (stats.iceFlawlessWins || 0) + 1 });
        }
      });
    }
  }, [level, user]);

  const createSnow = (x: number, y: number, amount: number) => {
    for (let i = 0; i < amount; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 150,
        vy: (Math.random() - 0.5) * 150,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.5,
        size: 1 + Math.random() * 4
      });
    }
  };

  const update = useCallback((dt: number) => {
    if (gameState !== 'playing') return;
    
    if (shakeRef.current > 0) {
        shakeRef.current = Math.max(0, shakeRef.current - dt * 30);
    }
    
    gameTimeRef.current += dt;
    scoreTimerRef.current += dt;
    
    const curLevel = Math.min(10, 1 + Math.floor(gameTimeRef.current / 15));
    if (curLevel > level) {
      setLevel(curLevel);
      audio.click();
    }
    
    if (scoreTimerRef.current >= 1) {
      scoreTimerRef.current -= 1;
      setScore(s => s + 10 * curLevel);
      setTimeSurvived(Math.floor(gameTimeRef.current));
    }

    const chars = charsRef.current;
    let currentAlive = chars.filter(c => !c.dead).length;
    let playerAlive = chars.find(c => c.id === 'player' && !c.dead);

    chars.forEach(p => {
        if (p.dead) return;
        
        if (p.falling) {
            p.fallScale -= dt * 2;
            p.vx *= 0.9;
            p.vy *= 0.9;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.fallScale <= 0) {
                p.dead = true;
                currentAlive--;
                setAliveCount(currentAlive);
                
                if (!p.isBot) {
                    setPlayerPlacement(currentAlive + 1);
                    endGame();
                } else if (currentAlive === 1 && playerAlive) {
                    setPlayerPlacement(1);
                    endGame();
                }
                
                setEliminationMsg(`تم إقصاء ${p.name}`);
                setTimeout(() => setEliminationMsg(null), 2500);
            }
            return;
        }

        let ix = 0;
        let iy = 0;
        
        if (!p.isBot) {
            ix = inputsRef.current.x;
            iy = inputsRef.current.y;
            if (joystickRef.current.active) {
               ix = joystickRef.current.dx;
               iy = joystickRef.current.dy;
            }
        } else {
            p.aiChangeTimer -= dt;
            
            // Predict if about to fall
            const nextTc = Math.floor((p.x + p.vx * 0.5) / TILE_SIZE);
            const nextTr = Math.floor((p.y + p.vy * 0.5) / TILE_SIZE);
            const nextTile = tilesRef.current.find(t => t.c === nextTc && t.r === nextTr);
            const dangerAhead = !nextTile || nextTile.state > 0;

            if (p.aiChangeTimer <= 0 || dangerAhead) {
                p.aiChangeTimer = 0.4 + Math.random() * 0.8;
                const tc = Math.floor(p.x / TILE_SIZE);
                const tr = Math.floor(p.y / TILE_SIZE);
                const myTile = tilesRef.current.find(t => t.c === tc && t.r === tr);
                
                if (dangerAhead || (myTile && myTile.state !== 0) || p.x < 100 || p.x > GRID_W - 100 || p.y < 100 || p.y > GRID_H - 100) {
                    // Evade edges or cracks, go to safe zone
                    let bestDx = GRID_W/2 - p.x;
                    let bestDy = GRID_H/2 - p.y;
                    
                    // Human mistake occasional
                    if (Math.random() > 0.1) {
                        const safeTiles = tilesRef.current.filter(t => t.state === 0);
                        if (safeTiles.length > 0) {
                            let nearestSafe = safeTiles[0];
                            let minDist = Infinity;
                            for (const t of safeTiles) {
                                const txc = t.c * TILE_SIZE + TILE_SIZE/2;
                                const tyc = t.r * TILE_SIZE + TILE_SIZE/2;
                                const d = Math.sqrt((txc - p.x)**2 + (tyc - p.y)**2);
                                if (d < minDist) { minDist = d; nearestSafe = t; }
                            }
                            if (minDist < 300) { // Only if we found a nearby safe tile
                                bestDx = (nearestSafe.c * TILE_SIZE + TILE_SIZE/2) - p.x;
                                bestDy = (nearestSafe.r * TILE_SIZE + TILE_SIZE/2) - p.y;
                            }
                        }
                    }
                    
                    const l = Math.sqrt(bestDx*bestDx + bestDy*bestDy) || 1;
                    p.ix = (bestDx/l) + (Math.random()-0.5)*0.3;
                    p.iy = (bestDy/l) + (Math.random()-0.5)*0.3;
                } else {
                    // Wander or target player Occasionally
                    if (Math.random() < 0.2 && playerAlive && !playerAlive.falling) {
                        const dx = playerAlive.x - p.x;
                        const dy = playerAlive.y - p.y;
                        const l = Math.sqrt(dx*dx + dy*dy) || 1;
                        p.ix = dx/l;
                        p.iy = dy/l;
                    } else {
                        p.ix = (Math.random() - 0.5) * 1.5;
                        p.iy = (Math.random() - 0.5) * 1.5;
                    }
                }
            }
            ix = p.ix;
            iy = p.iy;
        }

        const len = Math.sqrt(ix*ix + iy*iy);
        if (len > 1) { ix /= len; iy /= len; }

        p.vx += ix * ACCEL * dt;
        p.vy += iy * ACCEL * dt;
        
        const frictionFactor = Math.pow(FRICTION, dt * 60); 
        p.vx *= frictionFactor;
        p.vy *= frictionFactor;
        
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Boundary Collision (Soft Bounce)
        let bounced = false;
        if (p.x < p.radius) { p.x = p.radius; p.vx *= -0.6; bounced = true; }
        if (p.x > GRID_W - p.radius) { p.x = GRID_W - p.radius; p.vx *= -0.6; bounced = true; }
        if (p.y < p.radius) { p.y = p.radius; p.vy *= -0.6; bounced = true; }
        if (p.y > GRID_H - p.radius) { p.y = GRID_H - p.radius; p.vy *= -0.6; bounced = true; }
        
        if (bounced) {
            createSnow(p.x, p.y, 8);
            if (!p.isBot && Math.sqrt(p.vx*p.vx + p.vy*p.vy) > 50) audio.tick(); 
        }

        const tc = Math.floor(p.x / TILE_SIZE);
        const tr = Math.floor(p.y / TILE_SIZE);
        
        let isOverSafeTile = false;
        if (tc >= 0 && tc < COLS && tr >= 0 && tr < ROWS) {
          const tile = tilesRef.current.find(t => t.c === tc && t.r === tr);
          if (tile && tile.state < 2) {
            isOverSafeTile = true;
          }
        }
        
        if (!isOverSafeTile && !p.falling) {
          p.falling = true;
          audio.click();
          if (!p.isBot) shakeRef.current = 15;
          else shakeRef.current = 5;
        }
        
        const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        if (!p.falling && speed > 40) {
           particlesRef.current.push({
               x: p.x, y: p.y + 12, vx: 0, vy: 0,
               life: 0, maxLife: 1.8, size: Math.min(speed * 0.04, 6),
               isTrail: true, angle: p.angle
           });
        }
    });

    for (let i = 0; i < chars.length; i++) {
        const p1 = chars[i];
        if (p1.dead || p1.falling) continue;
        for (let j = i + 1; j < chars.length; j++) {
            const p2 = chars[j];
            if (p2.dead || p2.falling) continue;
            
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const minDist = p1.radius + p2.radius;
            
            if (dist > 0 && dist < minDist) {
                const nx = dx / dist;
                const ny = dy / dist;
                const overlap = minDist - dist;
                
                // Separate
                p1.x -= nx * overlap * 0.5;
                p1.y -= ny * overlap * 0.5;
                p2.x += nx * overlap * 0.5;
                p2.y += ny * overlap * 0.5;
                
                // Exchange velocity (elastic collision)
                const vdx = p2.vx - p1.vx;
                const vdy = p2.vy - p1.vy;
                const dotProduct = vdx * nx + vdy * ny;
                
                if (dotProduct < 0) {
                    const restitution = 0.5; // bouncy ice!
                    const impulse = -(1 + restitution) * dotProduct / 2;
                    p1.vx -= nx * impulse;
                    p1.vy -= ny * impulse;
                    p2.vx += nx * impulse;
                    p2.vy += ny * impulse;
                    
                    if (Math.abs(dotProduct) > 20) {
                        createSnow(p1.x + nx * p1.radius, p1.y + ny * p1.radius, 4);
                        if (!p1.isBot || !p2.isBot) {
                           audio.tick(); // light hit sound
                           shakeRef.current = Math.min(8, Math.abs(dotProduct) * 0.05);
                        }
                    }
                }
            }
        }
    }

    // Process tiles cracking
    if (gameTimeRef.current > nextCrackTimeRef.current && currentAlive > 0) {
        const interval = Math.max(0.3, 2.0 - (curLevel * 0.15));
        nextCrackTimeRef.current = gameTimeRef.current + interval;
        
        const safeTiles = tilesRef.current.filter(t => t.state === 0);
        if (safeTiles.length > 0) {
            const count = Math.min(safeTiles.length, 1 + Math.floor(curLevel / 3));
            for (let i = 0; i < count; i++) {
                const picked = safeTiles[Math.floor(Math.random() * safeTiles.length)];
                picked.state = 1;
                picked.crackTimer = Math.max(0.8, 3.0 - (curLevel * 0.2));
            }
        }
    }

    // Process crack timers
    tilesRef.current.forEach(t => {
      if (t.state === 1 && t.crackTimer !== undefined) {
          t.crackTimer -= dt;
          if (t.crackTimer <= 0) {
              t.state = 2; // Broken
              createSnow(t.c * TILE_SIZE + TILE_SIZE/2, t.r * TILE_SIZE + TILE_SIZE/2, 24);
              audio.click(); // crack sound
          }
      }
    });

    // Ambient Snow
    if (Math.random() < 0.2) {
        particlesRef.current.push({
            x: Math.random() * GRID_W,
            y: -10, // Start just above
            vx: Math.random() * 20 - 10,
            vy: Math.random() * 20 + 20,
            life: 0,
            maxLife: 3 + Math.random() * 2,
            size: 1 + Math.random() * 2,
            isTrail: false
        });
    }

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const part = particlesRef.current[i];
      part.life += dt;
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      if (part.life >= part.maxLife) {
        particlesRef.current.splice(i, 1);
      }
    }

    let playerTarget = charsRef.current.find(c => c.id === 'player');
    if (!playerTarget || playerTarget.dead) {
        playerTarget = charsRef.current.find(c => !c.dead);
    }
    
    if (playerTarget) {
        cameraRef.current.x += (playerTarget.x - cameraRef.current.x) * 5 * dt;
        cameraRef.current.y += (playerTarget.y - cameraRef.current.y) * 5 * dt;
    }

  }, [gameState, level, endGame]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#020617'); // slate-950
    bgGrad.addColorStop(1, '#0f172a'); // slate-900
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    
    ctx.save();
    
    const shake = shakeRef.current;
    const shakeOffsetX = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const shakeOffsetY = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    
    // Follow camera logic
    const cam = cameraRef.current;
    let baseOffsetX = width / 2 - cam.x;
    let baseOffsetY = (height / 2 + 35) - cam.y; // Shift center down slightly due to top UI
    
    const PADDING = 0;

    let minOffsetX = width - GRID_W - PADDING;
    let maxOffsetX = PADDING;
    if (width > GRID_W + PADDING * 2) {
       minOffsetX = maxOffsetX = (width - GRID_W) / 2;
    }
    
    let minOffsetY = height - GRID_H - PADDING;
    let maxOffsetY = PADDING; // top UI overlay, so map goes to 0
    if (height > GRID_H + PADDING * 2) {
       minOffsetY = maxOffsetY = (height - GRID_H) / 2;
    }
    
    const offsetX = Math.max(minOffsetX, Math.min(maxOffsetX, baseOffsetX)) + shakeOffsetX;
    const offsetY = Math.max(minOffsetY, Math.min(maxOffsetY, baseOffsetY)) + shakeOffsetY;
    
    ctx.translate(offsetX, offsetY);
    
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, GRID_W, GRID_H, 16);
    ctx.clip();
    
    const rinkGrad = ctx.createRadialGradient(GRID_W/2, GRID_H/2, 0, GRID_W/2, GRID_H/2, GRID_W);
    rinkGrad.addColorStop(0, '#0369a1'); // sky-700
    rinkGrad.addColorStop(1, '#082f49'); // sky-900
    ctx.fillStyle = rinkGrad;
    ctx.fillRect(0, 0, GRID_W, GRID_H);

    const time = Date.now() / 3000;
    const shineOffset = (time % 2) * GRID_W * 2 - GRID_W;
    const shineGrad = ctx.createLinearGradient(shineOffset, 0, shineOffset + GRID_W, GRID_H);
    shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shineGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.03)');
    shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    shineGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.03)');
    shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shineGrad;
    ctx.fillRect(0, 0, GRID_W, GRID_H);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for(let i=0; i<8; i++) {
        ctx.moveTo(Math.sin(i)*GRID_W, 0);
        ctx.lineTo(Math.cos(i)*GRID_W, GRID_H);
        ctx.moveTo(0, Math.cos(i*2)*GRID_H);
        ctx.lineTo(GRID_W, Math.sin(i*2)*GRID_H);
    }
    ctx.stroke();

    ctx.shadowColor = '#bae6fd';
    ctx.shadowBlur = 40;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, GRID_W - 6, GRID_H - 6);
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 1; c < COLS; c++) {
        ctx.moveTo(c * TILE_SIZE, 0);
        ctx.lineTo(c * TILE_SIZE, GRID_H);
    }
    for (let r = 1; r < ROWS; r++) {
        ctx.moveTo(0, r * TILE_SIZE);
        ctx.lineTo(GRID_W, r * TILE_SIZE);
    }
    ctx.stroke();
    
    ctx.restore();

    tilesRef.current.forEach(t => {
       const tx = t.c * TILE_SIZE;
       const ty = t.r * TILE_SIZE;
       
       if (t.state === 1) {
           let shakeX = 0;
           let shakeY = 0;
           if (t.crackTimer! < 1.0) {
               shakeX = (Math.random() - 0.5) * 4;
               shakeY = (Math.random() - 0.5) * 4;
           }

           ctx.fillStyle = 'rgba(2, 132, 199, 0.6)';
           ctx.fillRect(tx + shakeX, ty + shakeY, TILE_SIZE, TILE_SIZE);
           
           ctx.shadowColor = '#020617';
           ctx.shadowBlur = 4;
           ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
           ctx.lineWidth = 2;
           ctx.lineCap = 'round';
           ctx.lineJoin = 'round';
           ctx.beginPath();
           ctx.moveTo(tx + TILE_SIZE/2 + shakeX, ty + TILE_SIZE/2 + shakeY);
           ctx.lineTo(tx + 5 + shakeX, ty + 8 + shakeY);
           ctx.moveTo(tx + TILE_SIZE/2 + shakeX, ty + TILE_SIZE/2 + shakeY);
           ctx.lineTo(tx + TILE_SIZE - 5 + shakeX, ty + 5 + shakeY);
           ctx.moveTo(tx + TILE_SIZE/2 + shakeX, ty + TILE_SIZE/2 + shakeY);
           ctx.lineTo(tx + TILE_SIZE - 8 + shakeX, ty + TILE_SIZE - 5 + shakeY);
           ctx.moveTo(tx + TILE_SIZE/2 + shakeX, ty + TILE_SIZE/2 + shakeY);
           ctx.lineTo(tx + 8 + shakeX, ty + TILE_SIZE - 8 + shakeY);
           ctx.stroke();
           ctx.shadowBlur = 0;

           ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
           ctx.lineWidth = 1;
           ctx.stroke();
           
           if (t.crackTimer! < 0.6) {
               ctx.fillStyle = `rgba(239, 68, 68, ${Math.sin(Date.now()/50)*0.5 + 0.3})`;
               ctx.fillRect(tx + shakeX, ty + shakeY, TILE_SIZE, TILE_SIZE);
           }
       } else if (t.state === 2) {
           ctx.fillStyle = '#020617'; 
           ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
           
           const depthGrad = ctx.createRadialGradient(tx + TILE_SIZE/2, ty + TILE_SIZE/2, 0, tx + TILE_SIZE/2, ty + TILE_SIZE/2, TILE_SIZE);
           depthGrad.addColorStop(0, '#020617');
           depthGrad.addColorStop(1, '#0f172a');
           ctx.fillStyle = depthGrad;
           ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
           
           ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
           ctx.beginPath();
           ctx.moveTo(tx, ty); ctx.lineTo(tx + 10, ty); ctx.lineTo(tx, ty + 10); ctx.fill();
           ctx.beginPath();
           ctx.moveTo(tx + TILE_SIZE, ty); ctx.lineTo(tx + TILE_SIZE - 15, ty); ctx.lineTo(tx + TILE_SIZE, ty + 8); ctx.fill();
           ctx.beginPath();
           ctx.moveTo(tx, ty + TILE_SIZE); ctx.lineTo(tx + 12, ty + TILE_SIZE); ctx.lineTo(tx, ty + TILE_SIZE - 12); ctx.fill();
           
           ctx.shadowColor = '#0ea5e9';
           ctx.shadowBlur = 10;
           ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
           ctx.lineWidth = 2;
           ctx.strokeRect(tx+2, ty+2, TILE_SIZE-4, TILE_SIZE-4);
           ctx.shadowBlur = 0;
           
           ctx.strokeStyle = 'rgba(2, 6, 23, 0.8)';
           ctx.lineWidth = 4;
           ctx.strokeRect(tx, ty, TILE_SIZE, TILE_SIZE);
       }
    });

    ctx.lineJoin = 'round';
    
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 25;
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.4)';
    ctx.lineWidth = 16;
    ctx.strokeRect(-8, -8, GRID_W + 16, GRID_H + 16);
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 4;
    ctx.strokeRect(-2, -2, GRID_W + 4, GRID_H + 4);

    const borderFrost = ctx.createLinearGradient(0, 0, 20, 0);
    borderFrost.addColorStop(0, 'rgba(255,255,255,0.4)');
    borderFrost.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = borderFrost;
    ctx.fillRect(0, 0, 20, GRID_H); 
    
    const borderFrostR = ctx.createLinearGradient(GRID_W, 0, GRID_W - 20, 0);
    borderFrostR.addColorStop(0, 'rgba(255,255,255,0.4)');
    borderFrostR.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = borderFrostR;
    ctx.fillRect(GRID_W - 20, 0, 20, GRID_H); 
    
    const borderFrostT = ctx.createLinearGradient(0, 0, 0, 20);
    borderFrostT.addColorStop(0, 'rgba(255,255,255,0.4)');
    borderFrostT.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = borderFrostT;
    ctx.fillRect(0, 0, GRID_W, 20); 
    
    const borderFrostB = ctx.createLinearGradient(0, GRID_H, 0, GRID_H - 20);
    borderFrostB.addColorStop(0, 'rgba(255,255,255,0.4)');
    borderFrostB.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = borderFrostB;
    ctx.fillRect(0, GRID_H - 20, GRID_W, 20); 

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-16, -16, GRID_W + 32, GRID_H + 32);

    particlesRef.current.forEach(part => {
        if (part.isTrail) {
            ctx.save();
            ctx.translate(part.x, part.y);
            if (part.angle !== undefined) ctx.rotate(part.angle);
            ctx.fillStyle = `rgba(255, 255, 255, ${(1 - part.life/part.maxLife) * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, part.size * 0.6, part.size * 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    });

    charsRef.current.forEach(p => {
        if (p.dead && p.fallScale <= 0) return;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(Math.max(0, p.fallScale) * 1.2, Math.max(0, p.fallScale) * 1.2);

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const isMoving = speed > 20;

        if (p.angle === undefined) p.angle = 0;

        if (isMoving && !p.falling) {
            let targetAngle = Math.atan2(p.vy, p.vx) + Math.PI / 2;
            let diff = targetAngle - p.angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            p.angle += diff * 0.15;
        } else if (p.falling) {
            p.angle += 0.1;
        }

        ctx.rotate(p.angle);

        if (!p.falling) {
            if (speed > 50) {
               if (Math.random() < 0.3) createSnow(p.x, p.y + p.radius, 1);
            } else if (speed < 5) {
                if (Math.random() < 0.05) createSnow(p.x + (Math.random()-0.5)*10, p.y + (Math.random()-0.5)*10, 1);
            }
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(0, 12, 14, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        const wiggle = isMoving && !p.falling ? Math.sin(Date.now() / 80) : 0;
        
        ctx.save(); 
        if (isMoving && !p.falling) ctx.rotate(wiggle * 0.1); 

        if (!p.isBot && level >= 3) {
            ctx.shadowColor = level >= 7 ? '#fcd34d' : '#38bdf8';
            ctx.shadowBlur = 10 + (Math.sin(Date.now()/150) * 5 + 5);
            ctx.fillStyle = level >= 7 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(56, 189, 248, 0.2)';
            ctx.beginPath();
            ctx.ellipse(0, 0, 18, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(-6, 12 + wiggle * 3, 4, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(6, 12 - wiggle * 3, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        const breathe = !isMoving && !p.falling ? Math.sin(Date.now() / 200 + p.x) * 0.5 : 0;
        
        ctx.fillStyle = p.colorBody;
        ctx.beginPath();
        ctx.ellipse(0, 0 + breathe, 14, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.colorBelly;
        ctx.beginPath();
        ctx.ellipse(0, 4 + breathe, 10, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        if (p.hatType <= 1) {
            const scarfColors = p.isBot ? ['#94a3b8', '#64748b'] : ['#0ea5e9', '#ef4444', '#8b5cf6', '#f59e0b', '#10b981'];
            const scarfColor = p.isBot ? scarfColors[0] : scarfColors[Math.min(Math.floor((level - 1) / 2), 4)];
            ctx.fillStyle = scarfColor;
            ctx.beginPath();
            ctx.ellipse(0, -3 + breathe, 12, 3.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(8, -1 + breathe);
            ctx.lineTo(16 + (isMoving ? wiggle*4 : 0), 8 + breathe + speed*0.05);
            ctx.lineTo(10 + (isMoving ? wiggle*2 : 0), 10 + breathe + speed*0.05);
            ctx.lineTo(6, 2 + breathe);
            ctx.fill();
        } else {
             ctx.fillStyle = p.colorBelly;
             ctx.beginPath();
             ctx.ellipse(0, -14 + breathe, 6, 4, 0, 0, Math.PI * 2);
             ctx.fill();
        }

        ctx.fillStyle = p.colorBody;
        ctx.beginPath();
        ctx.ellipse(0, -10 + breathe*1.5, 13, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-5, -12 + breathe*1.5, 4, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -12 + breathe*1.5, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        const lookY = isMoving ? -13 : -12;
        ctx.beginPath();
        ctx.arc(-5, lookY + breathe*1.5, 1.5, 0, Math.PI * 2);
        ctx.arc(5, lookY + breathe*1.5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-3, -7 + breathe*1.5);
        ctx.lineTo(3, -7 + breathe*1.5);
        ctx.lineTo(0, -3 + breathe*1.5);
        ctx.fill();

        ctx.restore();
        
        ctx.restore();
        
        if (!p.falling && gameState === 'playing' && p.isBot) {
            ctx.save();
            ctx.translate(p.x, p.y - 35);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = 'bold 12px "Cairo", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, 0, 0);
            ctx.restore();
        } else if (!p.falling && gameState === 'playing' && !p.isBot) {
            ctx.save();
            ctx.translate(p.x, p.y - 35);
            ctx.fillStyle = 'rgba(134, 239, 172, 1)';
            ctx.font = 'bold 12px "Cairo", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, 0, 0);
            ctx.restore();
        }
    });

    particlesRef.current.forEach(part => {
       if (!part.isTrail) {
           ctx.fillStyle = `rgba(255, 255, 255, ${1 - part.life/part.maxLife})`;
           ctx.beginPath();
           ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
           ctx.fill();
       }
    });

    ctx.restore();
    
    if (gameState === 'playing' || gameState === 'gameover') {
         ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
         ctx.fillRect(0, 0, width, 70);
         
         const gradUI = ctx.createLinearGradient(0, 0, 0, 70);
         gradUI.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
         gradUI.addColorStop(1, 'rgba(56, 189, 248, 0)');
         ctx.fillStyle = gradUI;
         ctx.fillRect(0, 0, width, 70);
         
         ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
         ctx.lineWidth = 1;
         ctx.beginPath();
         ctx.moveTo(0, 70);
         ctx.lineTo(width, 70);
         ctx.stroke();
         
         ctx.font = 'bold 22px "Cairo", sans-serif';
         ctx.shadowColor = '#0ea5e9';
         ctx.shadowBlur = 10;
         
         ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
         ctx.textAlign = 'right';
         ctx.fillText(`🎯 ${score}`, width - 20, 44);
         
         ctx.textAlign = 'left';
         ctx.fillText(`👥 ${aliveCount}/6`, 20, 44);
         
         ctx.textAlign = 'center';
         ctx.fillStyle = '#bae6fd';
         ctx.font = 'bold 24px "Cairo", sans-serif';
         const timeText = `⏱️ ${Math.floor(gameTimeRef.current)}`;
         ctx.fillText(timeText, width / 2, 45);
         
         ctx.shadowBlur = 0;
    }
    
    const joy = joystickRef.current;
    if (joy.active && gameState === 'playing') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(joy.startX, joy.startY, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(224, 242, 254, 0.8)';
        ctx.beginPath();
        ctx.arc(joy.curX, joy.curY, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
  }, [gameState, score, aliveCount]);

  const loop = useCallback((time: number) => {
    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = time;
    
    update(dt);
    
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            const rect = canvasRef.current.parentElement!.getBoundingClientRect();
            if (canvasRef.current.width !== rect.width || canvasRef.current.height !== rect.height) {
                canvasRef.current.width = rect.width;
                canvasRef.current.height = rect.height;
            }
            draw(ctx, canvasRef.current.width, canvasRef.current.height);
        }
    }
    
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  const handlePointerDown = (e: React.PointerEvent) => {
     if (gameState !== 'playing') return;
     const rect = canvasRef.current?.getBoundingClientRect();
     if (!rect) return;
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;
     
     if (y < rect.height * 0.2) return; 
     
     joystickRef.current = {
         active: true,
         startX: x,
         startY: y,
         curX: x,
         curY: y,
         dx: 0,
         dy: 0,
     };
     (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
      const joy = joystickRef.current;
      if (!joy.active) return;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      let dx = x - joy.startX;
      let dy = y - joy.startY;
      const maxDist = 70; // Increased for better resolution
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist > maxDist) {
          dx = (dx / dist) * maxDist;
          dy = (dy / dist) * maxDist;
      }
      
      joy.curX = joy.startX + dx;
      joy.curY = joy.startY + dy;
      
      joy.dx = dx / maxDist;
      joy.dy = dy / maxDist;
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
      joystickRef.current.active = false;
      joystickRef.current.dx = 0;
      joystickRef.current.dy = 0;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="fixed inset-0 z-[100] w-full h-[100svh] overflow-hidden bg-slate-950 font-sans touch-none" dir="rtl">
        <div className="absolute inset-0 z-0">
            <canvas 
               ref={canvasRef}
               className="w-full h-full touch-none outline-none"
               onPointerDown={handlePointerDown}
               onPointerMove={handlePointerMove}
               onPointerUp={handlePointerUp}
               onPointerCancel={handlePointerUp}
               tabIndex={0}
            />
        </div>

        <AnimatePresence>
            {gameState === 'playing' && eliminationMsg && (
               <motion.div 
                  key={eliminationMsg}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-rose-500/90 text-white px-6 py-2 rounded-full font-bold shadow-lg backdrop-blur"
               >
                  {eliminationMsg}
               </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {gameState === 'menu' && (
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
                >
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg rotate-3">
                                <Snowflake className="w-10 h-10 text-white" />
                            </div>
                            
                            <h1 className="text-3xl font-bold font-heading text-white mb-2">الجليد المنزلق</h1>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                تزلج للنجاة! تفادى الثقوب وابق كآخر ناجٍ لتربح!
                            </p>
                            
                            <div className="space-y-3">
                                <button
                                   onClick={startGame}
                                   className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Play className="w-5 h-5" />
                                    <span>بدء اللعب</span>
                                </button>
                                
                                <button
                                   onClick={() => navigate('/')}
                                   className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-2xl transition-all active:scale-95"
                                >
                                    عودة للرئيسية
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {gameState === 'gameover' && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto"
                >
                    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 max-w-md w-full shadow-2xl my-auto">
                        <div className="text-center mb-8">
                            {playerPlacement === 1 ? (
                                <>
                                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-lg">
                                        <Trophy className="w-10 h-10 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold font-heading text-white mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">🏆 المركز الأول!</h2>
                                    <p className="text-amber-200/80">مبروك، أنت الناجي الأخير!</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-red-600 rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-lg -rotate-6">
                                        <Snowflake className="w-10 h-10 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold font-heading text-white mb-2">
                                        {playerPlacement === 2 ? '🥈 المركز الثاني' : playerPlacement === 3 ? '🥉 المركز الثالث' : `المركز ${playerPlacement}`}
                                    </h2>
                                    <p className="text-slate-400">سقطت في الجليد.</p>
                                </>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 text-center">
                                <div className="text-rose-400 mb-1"><Target className="w-6 h-6 mx-auto" /></div>
                                <div className="text-sm text-slate-400 mb-1">النقاط</div>
                                <div className="text-2xl font-bold font-mono text-white">{score}</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 text-center">
                                <div className="text-sky-400 mb-1"><Star className="w-6 h-6 mx-auto" /></div>
                                <div className="text-sm text-slate-400 mb-1">الصمود</div>
                                <div className="text-2xl font-bold font-mono text-white">{timeSurvived} ث</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 text-center">
                                <div className="text-amber-400 mb-1"><Trophy className="w-6 h-6 mx-auto" /></div>
                                <div className="text-sm text-slate-400 mb-1">المستوى</div>
                                <div className="text-2xl font-bold font-mono text-white">{level}</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 text-center">
                                <div className="text-emerald-400 mb-1"><Zap className="w-6 h-6 mx-auto" /></div>
                                <div className="text-sm text-slate-400 mb-1">+ XP</div>
                                <div className="text-2xl font-bold font-mono text-white">{earnedXp}</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                               onClick={startGame}
                               className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                                <span>العب مرة أخرى</span>
                            </button>
                            
                            <button
                               onClick={() => navigate('/')}
                               className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <ChevronRight className="w-5 h-5" />
                                <span>عودة للرئيسية</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
