import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { audio } from '../lib/audio';
import { Trophy, Home, Play, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../components/GameContext';
import { supabaseService } from '../services/supabaseService';
import { updatePlayerStats } from '../lib/firebase';
import { updateStats as doUpdateAchStats, getPlayerStats } from '../lib/achievements';
import { useAuth } from '../components/AuthContext';
import confetti from 'canvas-confetti';

type GameState = 'playing' | 'gameover';

interface Character {
  id: string;
  name: string;
  isBot: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  isJumping: boolean;
  dead: boolean;
  colorBody: string;
  score: number;
  timeSurvived: number;
  targetX?: number;
  targetY?: number;
  targetZ?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const PLATFORM_RADIUS = 350;
const GRAVITY = 1500;
const JUMP_FORCE = 600;
const ARM_HEIGHT = 40;
const ARM_WIDTH = 25;
const PLAYER_RADIUS = 15;
const MOVE_SPEED = 300;

const COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

export default function JumpRoom() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, playerId, isHost, sendJumpEvent, returnToLobby, requestRematch } = useGame();

  const [gameState, setGameState] = useState<GameState>('playing');
  const [aliveCount, setAliveCount] = useState(0);
  const [eliminationMsg, setEliminationMsg] = useState<string | null>(null);
  const [playerPlacement, setPlayerPlacement] = useState(0);
  const [statsSaved, setStatsSaved] = useState(false);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const [myScore, setMyScore] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const charsRef = useRef<Character[]>([]);
  const armRef = useRef({ angle: 0, speed: 1.5 });

  const inputsRef = useRef({ x: 0, y: 0, jump: false });
  const remoteInputs = useRef<{ [id: string]: { x: number, y: number, jump: boolean } }>({});
  
  const particlesRef = useRef<Particle[]>([]);
  const shakeRef = useRef(0);
  const timeRef = useRef(0);
  const stateRef = useRef<GameState>('playing');

  const myScoreRef = useRef({ score: 0, time: 0 });

  // Init chars
  useEffect(() => {
    if (!state?.players) return;
    if (charsRef.current.length === 0 && isHost) {
        const newChars: Character[] = [];
        let i = 0;
        
        state.players.forEach(p => {
            const angle = (i / state.players.length) * Math.PI * 2;
            const r = PLATFORM_RADIUS * 0.5;
            newChars.push({
                id: p.id,
                name: p.name,
                isBot: false,
                x: Math.cos(angle) * r,
                y: Math.sin(angle) * r,
                z: 0, vx: 0, vy: 0, vz: 0,
                isJumping: false, dead: false,
                colorBody: COLORS[i % COLORS.length],
                score: 0, timeSurvived: 0
            });
            i++;
        });

        // Fill bots
        const maxP = state.config?.maxPlayers || 8;
        while (i < maxP) {
             const angle = (i / maxP) * Math.PI * 2;
             const r = PLATFORM_RADIUS * 0.5;
             newChars.push({
                id: `bot_${i}`,
                name: `Bot ${i+1}`,
                isBot: true,
                x: Math.cos(angle) * r,
                y: Math.sin(angle) * r,
                z: 0, vx: 0, vy: 0, vz: 0,
                isJumping: false, dead: false,
                colorBody: COLORS[i % COLORS.length],
                score: 0, timeSurvived: 0
            });
            i++;
        }
        charsRef.current = newChars;
        setAliveCount(newChars.length);
    }
  }, [state?.players, isHost]);

  useEffect(() => {
    const handleJumpEvent = (e: any) => {
        const msg = e.detail;
        if (msg.type === 'JUMP_INPUT' && isHost) {
            remoteInputs.current[msg.playerId] = { x: msg.dx, y: msg.dy, jump: msg.jump };
        } else if (msg.type === 'JUMP_SYNC' && !isHost) {
            if (msg.arm) {
                armRef.current.angle = msg.arm.angle;
                armRef.current.speed = msg.arm.speed;
            }
            if (msg.chars) {
                if (charsRef.current.length === 0) {
                    charsRef.current = msg.chars;
                } else {
                    msg.chars.forEach((mc: any) => {
                        const localP = charsRef.current.find(c => c.id === mc.id);
                        if (localP) {
                            localP.dead = mc.dead;
                            localP.score = mc.score;
                            if (localP.id !== playerId) {
                                localP.targetX = mc.x;
                                localP.targetY = mc.y;
                                localP.targetZ = mc.z;
                                localP.isJumping = mc.isJumping;
                            } else {
                                // For self, if not syncing tightly, we can let local simulation run.
                                // But better to sync jump state if host says we fell.
                                if (mc.dead && !localP.dead) {
                                    localP.dead = true;
                                    shakeRef.current = 15;
                                    audio.playToneWithADSR('sawtooth', 200, 0.05, 0.2, 0.2, 0.2, 0.5);
                                    setGameState('gameover');
                                    stateRef.current = 'gameover';
                                }
                            }
                        }
                    });
                }
                const alives = msg.chars.filter((c: any) => !c.dead).length;
                setAliveCount(alives);
            }
            if (msg.state) {
                if (msg.state === 'gameover' && stateRef.current !== 'gameover') {
                    setGameState('gameover');
                    stateRef.current = 'gameover';
                    audio.playToneWithADSR('sine', 300, 0.1, 0.3, 0.2, 0.4, 0.5);
                }
            }
        }
    };
    window.addEventListener('jump_event', handleJumpEvent);
    return () => window.removeEventListener('jump_event', handleJumpEvent);
  }, [isHost, playerId]);

  const handleJump = useCallback(() => {
     if (stateRef.current !== 'playing') return;
     inputsRef.current.jump = true;
     if (!isHost) {
        sendJumpEvent({ type: 'JUMP_INPUT', playerId: playerId!, dx: inputsRef.current.x, dy: inputsRef.current.y, jump: true });
     }
  }, [isHost, playerId, sendJumpEvent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        switch(e.key.toLowerCase()) {
            case 'w': case 'arrowup': inputsRef.current.y = -1; break;
            case 's': case 'arrowdown': inputsRef.current.y = 1; break;
            case 'a': case 'arrowleft': inputsRef.current.x = -1; break;
            case 'd': case 'arrowright': inputsRef.current.x = 1; break;
            case ' ': handleJump(); break;
        }
        if (!isHost && playerId && e.key !== ' ') {
            sendJumpEvent({ type: 'JUMP_INPUT', playerId, dx: inputsRef.current.x, dy: inputsRef.current.y, jump: false });
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        switch(e.key.toLowerCase()) {
            case 'w': case 'arrowup': if (inputsRef.current.y < 0) inputsRef.current.y = 0; break;
            case 's': case 'arrowdown': if (inputsRef.current.y > 0) inputsRef.current.y = 0; break;
            case 'a': case 'arrowleft': if (inputsRef.current.x < 0) inputsRef.current.x = 0; break;
            case 'd': case 'arrowright': if (inputsRef.current.x > 0) inputsRef.current.x = 0; break;
            case ' ': inputsRef.current.jump = false; break;
        }
        if (!isHost && playerId && e.key !== ' ') {
            sendJumpEvent({ type: 'JUMP_INPUT', playerId, dx: inputsRef.current.x, dy: inputsRef.current.y, jump: false });
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isHost, playerId, handleJump, sendJumpEvent]);

  const handleJoystick = useCallback((dx: number, dy: number) => {
    inputsRef.current.x = dx;
    inputsRef.current.y = dy;
    if (!isHost && playerId) {
        sendJumpEvent({ type: 'JUMP_INPUT', playerId, dx, dy, jump: false });
    }
  }, [isHost, playerId, sendJumpEvent]);

  const drawPlatform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.translate(width / 2, height / 2 + 50);
    ctx.shadowColor = '#c026d3';
    ctx.shadowBlur = 50;
    ctx.scale(1, 0.5);

    ctx.fillStyle = '#4a044e';
    ctx.beginPath();
    ctx.arc(0, 40, PLATFORM_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, PLATFORM_RADIUS);
    grad.addColorStop(0, '#701a75');
    grad.addColorStop(1, '#2e1065');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, PLATFORM_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(217, 70, 239, 0.2)';
    ctx.lineWidth = 2;
    const step = 50;
    for (let i = -PLATFORM_RADIUS; i <= PLATFORM_RADIUS; i += step) {
        ctx.beginPath(); ctx.moveTo(i, -PLATFORM_RADIUS); ctx.lineTo(i, PLATFORM_RADIUS); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-PLATFORM_RADIUS, i); ctx.lineTo(PLATFORM_RADIUS, i); ctx.stroke();
    }
    
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 5;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, PLATFORM_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
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

  let tickCount = 0;

  const loop = useCallback((now: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = now;
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = now;

    const chars = charsRef.current;
    
    if (stateRef.current === 'playing') {
        timeRef.current += dt;

        if (isHost) {
            armRef.current.speed += dt * 0.05;
            armRef.current.angle += armRef.current.speed * dt;

            chars.forEach(c => {
                if (c.dead) {
                    c.z -= 800 * dt;
                    return;
                }

                // AI logic
                if (c.isBot) {
                    // Try to jump if arm is approaching
                    // angle diff
                    let aDiff = armRef.current.angle % (Math.PI*2) - Math.atan2(c.y, c.x);
                    if (aDiff < 0) aDiff += Math.PI * 2;
                    // very simple AI
                    if (aDiff > 0 && aDiff < 0.5 && c.z === 0) {
                        if (Math.random() < 0.8) {
                             c.vz = JUMP_FORCE;
                             c.isJumping = true;
                        }
                    }

                    // Bot move
                    if (Math.random() < 0.02) {
                        remoteInputs.current[c.id] = { dx: (Math.random()-0.5)*2, dy: (Math.random()-0.5)*2, jump: false };
                    }
                }

                let ix = 0, iy = 0;
                if (c.id === playerId) {
                    ix = inputsRef.current.x;
                    iy = inputsRef.current.y;
                    if (inputsRef.current.jump && c.z === 0) {
                        c.vz = JUMP_FORCE;
                        c.isJumping = true;
                        inputsRef.current.jump = false; // consume
                    }
                } else if (remoteInputs.current[c.id]) {
                    ix = remoteInputs.current[c.id].x;
                    iy = remoteInputs.current[c.id].y;
                    if (remoteInputs.current[c.id].jump && c.z === 0) {
                        c.vz = JUMP_FORCE;
                        c.isJumping = true;
                        remoteInputs.current[c.id].jump = false; // consume
                    }
                }

                let mag = Math.sqrt(ix * ix + iy * iy);
                if (mag > 1) mag = 1;
                c.vx = ix * MOVE_SPEED * (mag > 0 ? 1/mag : 0);
                c.vy = iy * MOVE_SPEED * (mag > 0 ? 1/mag : 0);

                c.x += c.vx * dt;
                c.y += c.vy * dt;

                if (c.isJumping) {
                    c.z += c.vz * dt;
                    c.vz -= GRAVITY * dt;
                    if (c.z <= 0) {
                        c.z = 0;
                        c.vz = 0;
                        c.isJumping = false;
                    }
                }

                const dist = Math.sqrt(c.x * c.x + c.y * c.y);
                if (dist > PLATFORM_RADIUS + 10) {
                    c.dead = true;
                    spawnParticles(c.x, c.y, '#ef4444');
                    if (c.id === playerId) {
                        shakeRef.current = 15;
                        audio.playToneWithADSR('sawtooth', 200, 0.05, 0.2, 0.2, 0.2, 0.5);
                    }
                }

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
                            if (c.id === playerId) {
                                shakeRef.current = 10;
                                audio.playToneWithADSR('square', 300, 0.05, 0.1, 0.1, 0.1, 0.2);
                            }
                        }
                    }
                }

                c.score += dt * 10;
                c.timeSurvived = timeRef.current;
            });

            const alives = chars.filter(c => !c.dead).length;
            if (alives !== aliveCount) setAliveCount(alives);

            if (alives <= 1 && chars.length > 1) {
                 setGameState('gameover');
                 stateRef.current = 'gameover';
                 setTimeout(() => {
                      sendJumpEvent({ type: 'JUMP_SYNC', state: 'gameover' });
                 }, 500);
            }

            tickCount++;
            if (tickCount % 3 === 0) {
                const charsData = chars.map(c => ({
                    id: c.id, x: c.x, y: c.y, z: c.z, 
                    isJumping: c.isJumping, dead: c.dead, score: Math.floor(c.score)
                }));
                sendJumpEvent({ type: 'JUMP_SYNC', arm: { angle: armRef.current.angle, speed: armRef.current.speed }, chars: charsData, state: stateRef.current });
            }

        } else {
            // Client: local simulation and interpolation
            chars.forEach(c => {
                 if (c.id === playerId && !c.dead) {
                     // Local prediction
                     let ix = inputsRef.current.x;
                     let iy = inputsRef.current.y;
                     if (inputsRef.current.jump && c.z === 0) {
                        c.vz = JUMP_FORCE;
                        c.isJumping = true;
                        inputsRef.current.jump = false;
                     }
                     
                     let mag = Math.sqrt(ix * ix + iy * iy);
                     if (mag > 1) mag = 1;
                     c.vx = ix * MOVE_SPEED * (mag > 0 ? 1/mag : 0);
                     c.vy = iy * MOVE_SPEED * (mag > 0 ? 1/mag : 0);
                     c.x += c.vx * dt;
                     c.y += c.vy * dt;

                     if (c.isJumping) {
                        c.z += c.vz * dt;
                        c.vz -= GRAVITY * dt;
                        if (c.z <= 0) {
                            c.z = 0;
                            c.vz = 0;
                            c.isJumping = false;
                        }
                     }
                     const dist = Math.sqrt(c.x * c.x + c.y * c.y);
                     if (dist > PLATFORM_RADIUS + 10) {
                         c.dead = true;
                         shakeRef.current = 15;
                         audio.playToneWithADSR('sawtooth', 200, 0.05, 0.2, 0.2, 0.2, 0.5);
                         spawnParticles(c.x, c.y, '#ef4444');
                     }
                     c.score += dt * 10;
                 } else {
                     // Interpolate others
                     if (c.targetX !== undefined) {
                         c.x += (c.targetX - c.x) * 0.3;
                         c.y += (c.targetY! - c.y) * 0.3;
                     }
                     if (c.targetZ !== undefined && !c.isJumping) {
                         c.z += (c.targetZ - c.z) * 0.3;
                     } else if (c.isJumping) {
                         // naive gravity for remote
                         c.z += c.vz * dt;
                         c.vz -= GRAVITY * dt;
                         if (c.z <= 0) { c.z = 0; c.vz = 0; c.isJumping = false; }
                     }
                     if (c.dead) c.z -= 800 * dt;
                 }
            });

            // Predict arm
            armRef.current.angle += armRef.current.speed * dt;
        }

        const myP = chars.find(c => c.id === playerId);
        if (myP) {
             setMyScore(Math.floor(myP.score));
             myScoreRef.current.score = myP.score;
             myScoreRef.current.time = myP.timeSurvived;
             if (myP.dead && !eliminationMsg) {
                 const place = chars.filter(c => c.timeSurvived > myP.timeSurvived || !c.dead).length;
                 setPlayerPlacement(place);
                 setEliminationMsg(`تم إقصاؤك! (المركز ${place})`);
                 if (place === 1 && aliveCount <= 1) {
                     // Wait, if place is 1, and dead? It means last man standing.
                 }
             }
        }
    } else if (stateRef.current === 'gameover') {
         if (!statsSaved && user && isWin === null) {
              const myP = chars.find(c => c.id === playerId);
              if (myP) {
                  const place = chars.filter(c => c.score > myP.score || !c.dead).length + 1;
                  setPlayerPlacement(place);
                  const isWinner = place === 1;
                  setIsWin(isWinner);
                  
                  if (isWinner) {
                      confetti({ particleCount: 150, spread: 100, colors: ['#c026d3', '#22d3ee', '#ffffff'] });
                      audio.playToneWithADSR('sine', 800, 0.05, 0.2, 0.5, 0.5, 0.5);
                  }
                  
                  const s = getPlayerStats();
                  doUpdateAchStats({
                      jumpMaxSurviveTime: Math.max(s.jumpMaxSurviveTime || 0, Math.floor(timeRef.current)),
                      jumpMaxScore: Math.max(s.jumpMaxScore || 0, Math.floor(myP.score))
                  });

                  updatePlayerStats(user.uid, user.displayName || 'Unknown', isWinner, 0, Math.floor(myP.score), 0, 'القفزة الأخيرة');
                  setStatsSaved(true);
              }
         }
         chars.forEach(c => {
             if (c.dead) c.z -= 800 * dt;
         });
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

        ctx.save();
        ctx.translate(width / 2, height / 2 + 50);
        ctx.scale(1, 0.5);

        // Draw Arm
        const ax = Math.cos(armRef.current.angle) * PLATFORM_RADIUS;
        const ay = Math.sin(armRef.current.angle) * PLATFORM_RADIUS;

        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = ARM_WIDTH;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(ax, ay);
        ctx.stroke();

        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = ARM_WIDTH;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#22d3ee';
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(ax, ay);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#0891b2';
        ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath(); ctx.arc(0, -30, 40, 0, Math.PI * 2); ctx.fill();

        // Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const pt = particlesRef.current[i];
            pt.life -= dt * 2;
            pt.x += pt.vx * dt; pt.y += pt.vy * dt;
            if (pt.life <= 0) {
                particlesRef.current.splice(i, 1);
            } else {
                ctx.fillStyle = pt.color;
                ctx.globalAlpha = pt.life;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4, 0, Math.PI*2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1.0;

        // Players sorted by depth (approx: sort by y)
        const sortedChars = [...chars].sort((a,b) => a.y - b.y);

        sortedChars.forEach(p => {
             // shadow
             if (!p.dead) {
                 ctx.fillStyle = 'rgba(0,0,0,0.4)';
                 ctx.beginPath();
                 const shadowRadius = Math.max(5, PLAYER_RADIUS - p.z * 0.1);
                 ctx.arc(p.x, p.y, shadowRadius, 0, Math.PI * 2);
                 ctx.fill();
             }
             // body
             ctx.fillStyle = p.colorBody;
             ctx.beginPath();
             ctx.arc(p.x, p.y - p.z, PLAYER_RADIUS, 0, Math.PI * 2);
             ctx.fill();
             // highlight
             ctx.fillStyle = 'rgba(255,255,255,0.4)';
             ctx.beginPath();
             ctx.arc(p.x, p.y - p.z - 5, PLAYER_RADIUS * 0.6, 0, Math.PI * 2);
             ctx.fill();
             
             // name
             if (p.z >= 0 && !p.dead) {
                 ctx.fillStyle = 'white';
                 ctx.font = 'bold 16px font-heading';
                 ctx.textAlign = 'center';
                 // Un-scale text by restoring y scale before drawing text or applying inverse transform
                 ctx.save();
                 ctx.translate(p.x, p.y - p.z - 25);
                 ctx.scale(1, 2);
                 ctx.fillText(p.name, 0, 0);
                 ctx.restore();
             }
        });

        ctx.restore(); // scale
        ctx.restore(); // shake
      }
    }

    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, aliveCount, isHost, playerId, sendJumpEvent, eliminationMsg, statsSaved, isWin, user]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, [loop]);

  return (
    <div className="absolute inset-0 bg-slate-950 text-white overflow-hidden rounded-3xl border border-slate-800">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-fuchsia-950 opacity-50"></div>
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(192, 38, 211, 0.1) 0%, transparent 60%)'}}></div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex gap-2">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-xl text-center">
              <div className="text-xs text-slate-400 font-bold mb-1">الناجون</div>
              <div className="text-xl font-black text-white">{aliveCount} / {charsRef.current.length}</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-xl text-center">
              <div className="text-xs text-slate-400 font-bold mb-1">نقاطي</div>
              <div className="text-xl font-black text-fuchsia-400">{myScore}</div>
            </div>
        </div>
        
        {eliminationMsg && gameState === 'playing' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500 text-red-100 font-bold px-6 py-2 rounded-full"
          >
            {eliminationMsg}
          </motion.div>
        )}
      </div>

      <div className="w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          className="max-w-full max-h-full object-contain"
        />

        <AnimatePresence>
          {gameState === 'gameover' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 z-40 pointer-events-auto"
            >
              <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
                {isWin ? (
                    <div className="text-6xl mb-6">🏆</div>
                ) : (
                    <div className="text-6xl mb-6">💥</div>
                )}
                <h2 className="text-4xl font-black text-white mb-2">{isWin ? 'الفوز العظيم!' : 'نهاية اللعبة'}</h2>
                <div className="text-fuchsia-400 font-mono text-2xl font-bold mb-8">
                  المركز: {playerPlacement}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={returnToLobby}
                    className="flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors"
                  >
                    <Home className="w-6 h-6" />
                    الغرفة
                  </button>
                  {isHost && (
                      <button
                        onClick={requestRematch}
                        className="flex flex-col items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-4 rounded-xl shadow-lg transition-colors"
                      >
                        <RotateCcw className="w-6 h-6" />
                        إعادة
                      </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Controls */}
      {gameState === 'playing' && (
        <div className="absolute bottom-8 left-0 right-0 px-8 flex justify-between items-end pointer-events-none z-30">
          <div className="w-32 h-32 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm pointer-events-auto relative shadow-[0_0_30px_rgba(34,211,238,0.1)] touch-none"
               onTouchStart={(e) => {
                 const rect = (e.target as HTMLElement).getBoundingClientRect();
                 const x = e.touches[0].clientX - rect.left - 64;
                 const y = e.touches[0].clientY - rect.top - 64;
                 handleJoystick(x/64, y/64);
               }}
               onTouchMove={(e) => {
                 const rect = (e.target as HTMLElement).getBoundingClientRect();
                 const x = e.touches[0].clientX - rect.left - 64;
                 const y = e.touches[0].clientY - rect.top - 64;
                 handleJoystick(x/64, y/64);
               }}
               onTouchEnd={() => handleJoystick(0,0)}
          >
            <div className="absolute top-1/2 left-1/2 w-12 h-12 -mt-6 -ml-6 bg-cyan-500/50 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)] pointer-events-none" 
                 style={{transform: `translate(${inputsRef.current.x * 32}px, ${inputsRef.current.y * 32}px)`}}
            />
          </div>

          <button 
            className="w-20 h-20 bg-fuchsia-600/80 hover:bg-fuchsia-500/90 rounded-full backdrop-blur shadow-[0_0_30px_rgba(217,70,239,0.5)] border-2 border-fuchsia-400 pointer-events-auto flex items-center justify-center active:scale-90 transition-transform touch-none select-none"
            onTouchStart={(e) => { e.preventDefault(); handleJump(); }}
            onMouseDown={handleJump}
          >
            <span className="text-lg font-black text-white pointer-events-none">JUMP</span>
          </button>
        </div>
      )}
    </div>
  );
}
