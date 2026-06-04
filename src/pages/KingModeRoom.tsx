import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trophy, Crown, RefreshCcw, Settings, Lightbulb, Zap, Users } from 'lucide-react';
import { useGame } from '../components/GameContext';
import { audio } from '../lib/audio';
import confetti from 'canvas-confetti';
import { RoomPlayer } from '../lib/types';

interface Entity {
  id: string;
  name: string;
  isPlayer: boolean;
  isBot: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  speed: number;
  score: number;
  isKing: boolean;
  immunityTimer: number;
  energy: number;
}

const ARENA_RADIUS = 700;
const WIN_SCORE = 75;

export default function KingModeRoom() {
  const navigate = useNavigate();
  const { state, playerId, isHost, sendKingEvent, returnToLobby, requestRematch } = useGame();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const joystickBgRef = useRef<HTMLDivElement>(null);
  const joystickHandleRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [winner, setWinner] = useState<Entity | null>(null);

  // States for UI
  const [, setTick] = useState(0); // Force re-render periodically
  const [gameTime, setGameTime] = useState(0);

  // Input states
  const keys = useRef<{ [key: string]: boolean }>({});
  const joystick = useRef({ active: false, x: 0, y: 0, baseX: 0, baseY: 0, pointerId: -1 });
  const isSprintingActive = useRef(false);

  // Game state
  const entities = useRef<Entity[]>([]);
  const crown = useRef({ x: 0, y: 0, pickedUp: false, scale: 1 });
  const particles = useRef<any[]>([]);
  const frameCount = useRef(0);
  
  // Random Events State
  const activeEvent = useRef<{ type: string; msg: string; timer: number; duration: number } | null>(null);
  const nextEventTimer = useRef(600); // 10s initially
  const lastEventType = useRef<string | null>(null);
  
  const remoteInputs = useRef<{ [id: string]: { dx: number, dy: number, isSprinting: boolean } }>({});

  useEffect(() => {
    const handleKingEvent = (e: any) => {
        const msg = e.detail;
        if (msg.type === 'KING_INPUT' && isHost) {
            remoteInputs.current[msg.playerId] = { dx: msg.dx, dy: msg.dy, isSprinting: msg.isSprinting };
        } else if (msg.type === 'KING_SYNC' && !isHost) {
            // Hard sync for simplicity (extrapolation handles between frames)
            if (msg.entities) {
                // Keep local 'isPlayer' flag
                entities.current = msg.entities.map((ent: any) => ({
                    ...ent,
                    isPlayer: ent.id === playerId,
                    isBot: ent.id.startsWith('bot')
                }));
            }
            if (msg.crown) crown.current = msg.crown;
            if (msg.activeEvent !== undefined) activeEvent.current = msg.activeEvent;
            if (msg.gameState) {
                if (msg.gameState === 'won' || msg.gameState === 'lost') {
                   // Ensure local won/lost is accurate to the local player
                   let realGameState = 'lost';
                   if (msg.winner && msg.winner.id === playerId) realGameState = 'won';
                   if (gameState !== realGameState) {
                        setGameState(realGameState as 'won' | 'lost');
                        setWinner(msg.winner);
                        if (realGameState === 'won') {
                            audio.kingWin();
                            confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#ffffff', '#8b5cf6'] });
                        }
                   }
                }
            }
        }
    };
    window.addEventListener('king_event', handleKingEvent);
    return () => window.removeEventListener('king_event', handleKingEvent);
  }, [isHost, playerId, gameState]);

  const COLORS = ['#ef4444', '#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#eab308'];

  useEffect(() => {
    if (!state) return;
    
    // Initialize entities for all players
    const currentEntityIds = entities.current.map(e => e.id);
    const roomPlayers = Object.values(state.players) as RoomPlayer[];
    
    const newEntities: Entity[] = [];
    roomPlayers.forEach((p, idx) => {
      const existing = entities.current.find(e => e.id === p.id);
      if (existing) {
         existing.name = p.username;
         newEntities.push(existing);
      } else {
         // spawn points (cross formation)
         const spawnR = 300;
         const angle = (idx / Math.max(1, roomPlayers.length)) * Math.PI * 2;
         newEntities.push({
           id: p.id,
           name: p.username,
           isPlayer: p.id === playerId,
           isBot: p.id.startsWith('bot'),
           x: Math.cos(angle) * spawnR,
           y: Math.sin(angle) * spawnR,
           vx: 0, vy: 0,
           radius: 25,
           color: COLORS[idx % COLORS.length],
           speed: 8.5,
           score: 0,
           isKing: false,
           immunityTimer: 0,
           energy: 100
         });
      }
    });

    entities.current = newEntities;
    setTick(t => t + 1);
  }, [state?.players]);

  const setupGame = () => {
    activeEvent.current = null;
    lastEventType.current = null;
    nextEventTimer.current = Math.floor(Math.random() * 600 + 400);
    crown.current = { x: 0, y: 0, pickedUp: false, scale: 1 };
    particles.current = [];
    setGameTime(0);
    frameCount.current = 0;
    setGameState('playing');
    setWinner(null);
  };

  useEffect(() => {
    setupGame();
    
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const spawnParticles = (x: number, y: number, color: string, count: number = 15, speedMul: number = 1) => {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 5 + 2) * speedMul;
        particles.current.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            color,
            size: Math.random() * 4 + 2
        });
    }
  };

  const updatePhysics = () => {
    if (gameState !== 'playing') return;
    
    frameCount.current++;
    if (frameCount.current % 60 === 0) {
        setGameTime(t => t + 1);
    }
    // Force UI refresh occasionally (every 10 frames)
    if (frameCount.current % 10 === 0) setTick(t => t + 1);

    // Random Events Logic
    nextEventTimer.current--;
    if (nextEventTimer.current <= 0 && !activeEvent.current) {
        let events = [
           { type: 'speed_up', msg: 'عاصفة الرياح: سرعة مضاعفة!', duration: 600 },
           { type: 'slow_down', msg: 'موجة صقيع: تباطؤ للجميع!', duration: 400 },
           { type: 'fake_crown', msg: 'سراب التاج: التاج الحقيقي أم مزيف؟', duration: 400 },
           { type: 'double_points', msg: 'وقت التاج المضاعف: ×2 نقاط!', duration: 500 },
           { type: 'darkness', msg: 'عاصفة غامضة: الرؤية محدودة!', duration: 500 },
           { type: 'shield', msg: 'حماية مقدسة: درع عشوائي!', duration: 300 },
           { type: 'giant', msg: 'طاقة هائلة: منطقة التقاط التاج زادت!', duration: 500 }
        ];
        
        let diffEvents = events.filter(e => e.type !== lastEventType.current);
        let chosenEvent = diffEvents[Math.floor(Math.random() * diffEvents.length)];
        
        activeEvent.current = { ...chosenEvent, timer: chosenEvent.duration };
        lastEventType.current = chosenEvent.type;
        audio.eventStart();
        
        if (chosenEvent.type === 'shield') {
           const randEntity = entities.current[Math.floor(Math.random() * entities.current.length)];
           randEntity.immunityTimer = chosenEvent.duration;
           spawnParticles(randEntity.x, randEntity.y, '#3b82f6', 50, 3);
        }
        
        nextEventTimer.current = Math.floor(Math.random() * 900 + 600); // 10 to 25 seconds till next event
    }

    let globalSpeedMultiplier = 1;
    if (activeEvent.current) {
        activeEvent.current.timer--;
        if (activeEvent.current.type === 'speed_up') globalSpeedMultiplier = 1.8;
        if (activeEvent.current.type === 'slow_down') globalSpeedMultiplier = 0.5;
        if (activeEvent.current.timer <= 0) activeEvent.current = null;
    }

    // --- Input & Velocity Application (Runs for both Host and Clients for instant feel) ---
    entities.current.forEach(e => {
        let dx = 0; let dy = 0; let sprintIntent = false; let hasInput = false;

        if (e.id === playerId) {
            if (keys.current['w'] || keys.current['arrowup']) dy -= 1;
            if (keys.current['s'] || keys.current['arrowdown']) dy += 1;
            if (keys.current['a'] || keys.current['arrowleft']) dx -= 1;
            if (keys.current['d'] || keys.current['arrowright']) dx += 1;
            if (joystick.current.active) { dx = joystick.current.x; dy = joystick.current.y; }
            sprintIntent = keys.current[' '] || isSprintingActive.current || keys.current['shift'];
            hasInput = true;

            // Transmit input to Host every 2 frames
            if (!isHost && frameCount.current % 2 === 0) {
               sendKingEvent({ type: 'KING_INPUT', dx, dy, isSprinting: sprintIntent });
            }
        } else if (isHost && remoteInputs.current[e.id]) {
            const input = remoteInputs.current[e.id];
            dx = input.dx; dy = input.dy; sprintIntent = input.isSprinting;
            hasInput = true;
        }

        if (hasInput) {
            const len = Math.sqrt(dx * dx + dy * dy);
            const isSprinting = sprintIntent && e.energy > 5 && len > 0.1;
            let currentSpeed = e.speed * globalSpeedMultiplier;

            if (isSprinting) {
                e.energy = Math.max(0, e.energy - 1.5);
                currentSpeed *= 1.8;
                if (frameCount.current % 3 === 0) spawnParticles(e.x, e.y + 15, 'rgba(255,255,255,0.5)', 2, 0.2);
            } else {
                e.energy = Math.min(100, e.energy + 1.0);
            }

            if (len > 0) {
                let nx = dx; let ny = dy;
                // Normalize keyboard if length > 1
                if (!(e.id === playerId && joystick.current.active) && len > 0.1) {
                    nx = dx / len; ny = dy / len;
                }
                const targetVx = nx * currentSpeed * 1.35;
                const targetVy = ny * currentSpeed * 1.35;
                e.vx += (targetVx - e.vx) * 0.8;
                e.vy += (targetVy - e.vy) * 0.8;
            } else {
                e.vx *= 0.1; e.vy *= 0.1;
            }
        }
    });

    // --- Host Broadcast & Client Extrapolation ---
    if (isHost && frameCount.current % 2 === 0) {
       sendKingEvent({
          type: 'KING_SYNC',
          entities: entities.current,
          crown: crown.current,
          activeEvent: activeEvent.current,
          gameState,
          winner
       });
    }

    if (!isHost) {
        // Clients just extrapolate positions locally (host has authority)
        entities.current.forEach(e => {
           e.x += e.vx; e.y += e.vy;
           e.vx *= 0.82; e.vy *= 0.82;
        });
        return; // Skip host-only logic
    }

    // --- Host-Only Physics, Collisions, Events and Bot AI ---
    const king = entities.current.find(e => e.isKing);
    entities.current.forEach(bot => {
      if (!bot.isBot) return;
      
      let targetX = 0;
      let targetY = 0;
      
      // Bots manage their own sprint/energy
      let botWantsSprint = false;

      if (!crown.current.pickedUp) {
        targetX = crown.current.x;
        targetY = crown.current.y;
      } else if (bot.isKing) {
        // Run away from everyone else
        let fleeX = 0;
        let fleeY = 0;
        entities.current.forEach(other => {
            if (other === bot) return;
            const dist = Math.hypot(other.x - bot.x, other.y - bot.y);
            if (dist < 300) {
                fleeX += (bot.x - other.x) / dist;
                fleeY += (bot.y - other.y) / dist;
                if (dist < 150) botWantsSprint = true;
            }
        });
        
        // Also avoid edges
        const distFromCenter = Math.hypot(bot.x, bot.y);
        if (distFromCenter > ARENA_RADIUS - 100) {
           fleeX -= bot.x / distFromCenter * 2;
           fleeY -= bot.y / distFromCenter * 2;
        }

        targetX = bot.x + fleeX;
        targetY = bot.y + fleeY;
      } else {
        // Chase the king with some prediction and spacing so they don't form a single line
        if (king) {
            const indexOffset = (entities.current.indexOf(bot) - 1);
            // Bots aim slightly ahead or around the king
            targetX = king.x + (king.vx * 15) + Math.cos((frameCount.current + indexOffset * 100) / 30) * 80;
            targetY = king.y + (king.vy * 15) + Math.sin((frameCount.current + indexOffset * 100) / 30) * 80;

            const distToKing = Math.hypot(king.x - bot.x, king.y - bot.y);
            if (distToKing < 250) botWantsSprint = true;
        }
      }

      const dx = targetX - bot.x;
      const dy = targetY - bot.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      
      const isSprinting = botWantsSprint && bot.energy > 15 && len > 0;
      let currentSpeed = bot.speed * globalSpeedMultiplier;

      if (isSprinting) {
          bot.energy = Math.max(0, bot.energy - 1.2);
          currentSpeed *= 1.8;
          if (frameCount.current % 4 === 0) spawnParticles(bot.x, bot.y + 15, 'rgba(255,255,255,0.4)', 1, 0.2); // dust
      } else {
          bot.energy = Math.min(100, bot.energy + 0.5);
      }

      if (len > 0.1) {
          bot.vx += (dx / len) * currentSpeed * 0.35;
          bot.vy += (dy / len) * currentSpeed * 0.35;
      }
    });

    // Update positions & friction
    entities.current.forEach(e => {
       e.x += e.vx;
       e.y += e.vy;
       e.vx *= 0.82; // snappier movement
       e.vy *= 0.82;
       if (e.immunityTimer > 0) e.immunityTimer--;

       // Arena Boundary Collision
       const dist = Math.hypot(e.x, e.y);
       if (dist > ARENA_RADIUS - e.radius - 20) {
           const angle = Math.atan2(e.y, e.x);
           e.x = Math.cos(angle) * (ARENA_RADIUS - e.radius - 20);
           e.y = Math.sin(angle) * (ARENA_RADIUS - e.radius - 20);
           // Smooth edge slide
           const nx = Math.cos(angle);
           const ny = Math.sin(angle);
           const dot = e.vx * nx + e.vy * ny;
           e.vx -= dot * nx;
           e.vy -= dot * ny;
       }
    });

    // Entity Collisions
    for (let i = 0; i < entities.current.length; i++) {
        for (let j = i + 1; j < entities.current.length; j++) {
            const e1 = entities.current[i];
            const e2 = entities.current[j];
            const dx = e2.x - e1.x;
            const dy = e2.y - e1.y;
            const dist = Math.hypot(dx, dy);
            const minDist = e1.radius + e2.radius;

            if (dist < minDist) {
                // Resolve interpenetration
                const overlap = minDist - dist;
                const nx = dx / dist;
                const ny = dy / dist;
                
                e1.x -= nx * overlap * 0.5;
                e1.y -= ny * overlap * 0.5;
                e2.x += nx * overlap * 0.5;
                e2.y += ny * overlap * 0.5;

                // Elastic bounce
                const kx = e1.vx - e2.vx;
                const ky = e1.vy - e2.vy;
                const p = 2.0 * (nx * kx + ny * ky) / (2);
                e1.vx -= p * nx * 0.8;
                e1.vy -= p * ny * 0.8;
                e2.vx += p * nx * 0.8;
                e2.vy += p * ny * 0.8;

                // Crown Steal Logic
                if (e1.isKing && e2.immunityTimer <= 0 && !e2.isKing) {
                   e1.isKing = false;
                   e2.isKing = true;
                   e2.immunityTimer = 90; // 1.5 second immunity
                   spawnParticles(e2.x, e2.y, '#fbbf24', 20, 2);
                   if (e2.isPlayer) audio.kingCrownSteal();
                   else if (e1.isPlayer) audio.kingCrownLost();
                   else audio.kingCrownSteal();
                } else if (e2.isKing && e1.immunityTimer <= 0 && !e1.isKing) {
                   e2.isKing = false;
                   e1.isKing = true;
                   e1.immunityTimer = 90;
                   spawnParticles(e1.x, e1.y, '#fbbf24', 20, 2);
                   if (e1.isPlayer) audio.kingCrownSteal();
                   else if (e2.isPlayer) audio.kingCrownLost();
                   else audio.kingCrownSteal();
                }
            }
        }
    }

    // Sanity check: Ensure only one king exists
    let kingCount = 0;
    entities.current.forEach(e => {
        if (e.isKing) {
            kingCount++;
            if (kingCount > 1) {
                e.isKing = false; // Strip extra crowns if they happen
            }
        }
    });

    // Crown Pickup
    let pickupRange = 40;
    if (activeEvent.current && activeEvent.current.type === 'giant') {
        pickupRange = 120; // 3x pickup range
    }

    if (!crown.current.pickedUp) {
        crown.current.scale = 1.3 + Math.sin(Date.now() / 200) * 0.15;
        entities.current.forEach(e => {
            if (!crown.current.pickedUp) {
                const dist = Math.hypot(e.x - crown.current.x, e.y - crown.current.y);
                if (dist < e.radius + pickupRange) {
                    crown.current.pickedUp = true;
                    e.isKing = true;
                    e.immunityTimer = 60;
                    spawnParticles(e.x, e.y, '#fbbf24', 40, 2);
                    audio.kingCrownPickup();
                }
            }
        });
    }

    // Scoring
    // Add logic for double_points event
    let pointMultiplier = 1;
    if (activeEvent.current && activeEvent.current.type === 'double_points') {
        pointMultiplier = 2;
    }

    if (king) {
        const oldScore = Math.floor(king.score);
        king.score += (1 / 60) * pointMultiplier; // 1 point per second * multiplier
        if (Math.floor(king.score) > oldScore) {
            audio.kingTickScore();
        }
        if (king.score >= WIN_SCORE) {
            const finalState = king.isPlayer ? 'won' : 'lost';
            setGameState(finalState);
            setWinner(king);
            setTick(t => t+1); // force final render
            if (king.isPlayer) {
                audio.kingWin();
                confetti({
                   particleCount: 200,
                   spread: 120,
                   origin: { y: 0.6 },
                   colors: ['#fbbf24', '#f59e0b', '#ffffff', '#8b5cf6'] 
                });
            } else {
                audio.kingCrownLost(); // or game over sound
            }
            if (isHost) {
                sendKingEvent({
                    type: 'KING_SYNC',
                    entities: entities.current,
                    crown: crown.current,
                    activeEvent: activeEvent.current,
                    gameState: finalState,
                    winner: king
                });
            }
        }
    }

    // Particles
    particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
    });
    particles.current = particles.current.filter(p => p.life > 0);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear with dark ambient color
    ctx.fillStyle = '#0a0a16'; 
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    // Center camera
    ctx.translate(w / 2, h / 2);

    // Scale to fit arena, a bit of padding
    const scale = Math.min(w, h) / (ARENA_RADIUS * 2.1);
    ctx.scale(scale, scale);
    
    // 1. Draw Outer Arena Glow
    ctx.beginPath();
    ctx.arc(0, 0, ARENA_RADIUS + 10, 0, Math.PI * 2);
    ctx.shadowColor = '#6d28d9';
    ctx.shadowBlur = 40;
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.shadowBlur = 0;

    // 2. Arena Base Floor
    ctx.beginPath();
    ctx.arc(0, 0, ARENA_RADIUS, 0, Math.PI * 2);
    // Dark stone gradient
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, ARENA_RADIUS);
    grad.addColorStop(0, '#2d2b45');
    grad.addColorStop(0.7, '#1e1c32');
    grad.addColorStop(1, '#0f0e1f');
    ctx.fillStyle = grad;
    ctx.fill();

    // 3. Floor Patterns (Concentric rings & stone lines)
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)'; // faint purple
    ctx.lineWidth = 3;
    for (let r = 80; r <= ARENA_RADIUS - 20; r += 60) {
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke();
    }
    
    // 4. Center Crown Pedestal
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 15;
    ctx.stroke();
    // Inner ring
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI*2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 5. Outer Bezel / Wall
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#1e1b4b'; // Deep purple-black
    ctx.beginPath(); ctx.arc(0, 0, ARENA_RADIUS, 0, Math.PI*2); ctx.stroke();
    
    // Neon Ring on wall
    ctx.lineWidth = 6;
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#8b5cf6';
    ctx.beginPath(); ctx.arc(0, 0, ARENA_RADIUS - 10, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0;

    // 6. Draw Particles (under entities)
    particles.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Helper for rounded rect
    const drawRoundRect = (x:number,y:number,w:number,h:number,r:number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };

    // 7. Draw Entities (Characters)
    // Sort by Y to overlap correctly (pseudo depth)
    const sortedEntities = [...entities.current].sort((a,b) => (a.y === b.y ? 0 : a.y > b.y ? 1 : -1));

    sortedEntities.forEach(e => {
        const isDashing = e.isPlayer ? (keys.current[' '] || isSprintingActive.current || keys.current['shift']) : (e.speed > 6 && (Math.abs(e.vx)>2 || Math.abs(e.vy)>2));
        
        ctx.save();
        ctx.translate(e.x, e.y);

        // Floor shadow / Aura
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.ellipse(0, 15, e.radius, e.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Neon ring on floor
        ctx.beginPath();
        const pulse = e.isKing ? Math.sin(Date.now()/100) * 6 : Math.sin(Date.now()/150) * 3;
        const ringRadius = e.radius + 8 + pulse;
        ctx.ellipse(0, 15, ringRadius, ringRadius * 0.4, 0, 0, Math.PI * 2);
        
        ctx.strokeStyle = e.isKing ? '#f59e0b' : e.color;
        ctx.lineWidth = e.isKing ? 6 : 3;
        ctx.shadowColor = e.isKing ? '#fbbf24' : e.color;
        ctx.shadowBlur = e.isKing ? 20 : 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Big golden aura for the King BEHIND the body
        if (e.isKing) {
            const auraGlow = ctx.createRadialGradient(0, 0, e.radius, 0, 0, e.radius * 3);
            auraGlow.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
            auraGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
            ctx.fillStyle = auraGlow;
            ctx.beginPath();
            ctx.arc(0, 0, e.radius * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Spinning dashed ring
            ctx.save();
            ctx.rotate(Date.now() / 500);
            ctx.beginPath();
            ctx.arc(0, 0, e.radius + 25 + Math.sin(Date.now()/100)*5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
            ctx.lineWidth = 3;
            ctx.setLineDash([15, 15]);
            ctx.stroke();
            ctx.restore();
        }

        // Body
        ctx.fillStyle = e.isKing ? '#fbbf24' : e.color; // King gets a golden tint body
        drawRoundRect(-e.radius * 0.8, -e.radius*0.2, e.radius * 1.6, e.radius * 1.2, 8);
        ctx.fill();
        // Body shading
        ctx.fillStyle = e.isKing ? '#f59e0b' : 'rgba(0,0,0,0.2)'; 
        drawRoundRect(-e.radius * 0.8, e.radius*0.5, e.radius * 1.6, e.radius * 0.5, 8);
        ctx.fill();

        // Head
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(0, -e.radius, e.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Visor (dark glasses look)
        ctx.fillStyle = '#0f172a';
        drawRoundRect(-e.radius * 0.6 + (e.vx*1.5), -e.radius * 1.3 + (e.vy*1.5), e.radius * 1.2, e.radius * 0.6, 6);
        ctx.fill();
        // Eye shine inside visor
        ctx.fillStyle = isDashing ? '#fbbf24' : '#60a5fa'; // Eyes glow yellow when dashing
        ctx.fillRect(-e.radius * 0.3 + (e.vx*1.5), -e.radius * 1.1 + (e.vy*1.5), e.radius * 0.25, e.radius * 0.2);

        // Player Name
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 16px \"Heading\", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(e.name, 0, -e.radius - (e.isKing ? 55 : 20));

        // Crown on head
        if (e.isKing) {
            ctx.save();
            ctx.translate(0, -e.radius - 20);
            const bob = Math.sin(Date.now() / 150) * 4;
            ctx.translate(0, bob);
            drawCrown(ctx, 1.4);
            ctx.restore();

            // Immunity glow
            if (e.immunityTimer > 0) {
               ctx.beginPath();
               ctx.arc(0, -e.radius*0.5, e.radius + 20, 0, Math.PI*2);
               ctx.strokeStyle = 'rgba(251,191,36,0.8)';
               ctx.lineWidth = 5;
               ctx.shadowColor = '#fbbf24';
               ctx.shadowBlur = 15;
               ctx.stroke();
               ctx.shadowBlur = 0;
            }
        }
        ctx.restore();
    });

    // 8. Draw Crown Base
    if (!crown.current.pickedUp) {
        ctx.save();
        ctx.translate(crown.current.x, crown.current.y);
        ctx.scale(crown.current.scale, crown.current.scale);
        
        const bob = Math.sin(Date.now() / 200) * 8;
        ctx.translate(0, bob - 10);
        
        drawCrown(ctx, 2.5);
        ctx.restore();
    }

    if (activeEvent.current && activeEvent.current.type === 'fake_crown') {
        ctx.save();
        ctx.translate(-150, 150); // fake location roughly
        ctx.globalAlpha = 0.6;
        const bob = Math.sin(Date.now() / 200) * 8;
        ctx.translate(0, bob - 10);
        drawCrown(ctx, 2.5);
        ctx.restore();
    }

    // 9. Darkness Event Overlay
    if (activeEvent.current && activeEvent.current.type === 'darkness') {
        const player = entities.current.find(e => e.isPlayer);
        if (player) {
            ctx.save();
            const darkGrad = ctx.createRadialGradient(player.x, player.y, 80, player.x, player.y, ARENA_RADIUS);
            darkGrad.addColorStop(0, 'rgba(10, 10, 22, 0)');
            darkGrad.addColorStop(0.4, 'rgba(10, 10, 22, 0.95)');
            darkGrad.addColorStop(1, 'rgba(5, 5, 12, 1)');
            ctx.fillStyle = darkGrad;
            ctx.beginPath();
            ctx.arc(0, 0, ARENA_RADIUS + 200, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    ctx.restore();
  };

  const drawCrown = (ctx: CanvasRenderingContext2D, sizeScale: number = 1) => {
      ctx.fillStyle = '#fbb117'; // Rich Gold
      ctx.strokeStyle = '#ffd700'; // Light gold rim
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 15;
      
      const w = 18 * sizeScale;
      const h = 14 * sizeScale;
      
      ctx.beginPath();
      // Base
      ctx.moveTo(-w, h);
      ctx.lineTo(w, h);
      // Right edge
      ctx.lineTo(w + 6*sizeScale, -h*0.4);
      // Deep V
      ctx.lineTo(w*0.35, 0);
      // Tall center
      ctx.lineTo(0, -h*1.3);
      // Deep V left
      ctx.lineTo(-w*0.35, 0);
      // Left edge
      ctx.lineTo(-w - 6*sizeScale, -h*0.4);
      ctx.closePath();
      
      ctx.fill();
      ctx.stroke();
      
      // Jeweles
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ef4444'; // Red ruby
      ctx.beginPath(); ctx.arc(0, 0, 3*sizeScale, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#3b82f6'; // Blue sapphire
      ctx.beginPath(); ctx.arc(-w*0.6, -h*0.1, 2.5*sizeScale, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w*0.6, -h*0.1, 2.5*sizeScale, 0, Math.PI*2); ctx.fill();
  };

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        draw(); // redraw immediately
      }
    };
    window.addEventListener('resize', handleResize);
    // Initial delay to ensure container is sized
    setTimeout(handleResize, 50);

    let lastTime = performance.now();
    let accumulator = 0;
    const TIME_STEP = 1000 / 60;

    const loop = (timestamp: number) => {
      const dt = timestamp - lastTime;
      lastTime = timestamp;
      
      accumulator += dt;
      if (accumulator > 200) accumulator = 200; // prevent spiral of death

      while (accumulator >= TIME_STEP) {
          updatePhysics();
          accumulator -= TIME_STEP;
      }
      
      draw();
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState]);

  // Joystick handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (gameState !== 'playing') return;
    const touch = 'touches' in e ? e.touches[0] : (e as React.MouseEvent);
    
    // Ignore if clicking on buttons
    if (e.target instanceof Element && e.target.closest('button')) return;

    let bx = touch.clientX;
    let by = touch.clientY;

    if (joystickBgRef.current) {
         const rect = joystickBgRef.current.getBoundingClientRect();
         bx = rect.left + rect.width / 2;
         by = rect.top + rect.height / 2;
    }

    joystick.current = {
      active: true,
      baseX: bx,
      baseY: by,
      x: 0,
      y: 0,
      pointerId: 'identifier' in touch ? touch.identifier : 0
    };

    if (joystickBgRef.current) {
        joystickBgRef.current.style.boxShadow = '0 0 30px rgba(139, 92, 246, 0.4)';
        joystickBgRef.current.style.borderColor = 'rgba(139, 92, 246, 0.8)';
        joystickBgRef.current.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystick.current.active) return;
    e.preventDefault(); // prevent scrolling
    
    let touch = null;
    if ('touches' in e) {
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === joystick.current.pointerId) {
          touch = e.touches[i];
          break;
        }
      }
    } else {
      touch = e as React.MouseEvent;
    }

    if (!touch) return;

    const dx = touch.clientX - joystick.current.baseX;
    const dy = touch.clientY - joystick.current.baseY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const maxDist = 65; // Expected travel distance for larger UI
    
    if (dist > 0.1) {
        joystick.current.x = dx / Math.max(dist, maxDist);
        joystick.current.y = dy / Math.max(dist, maxDist);
    } else {
        joystick.current.x = 0;
        joystick.current.y = 0;
    }

    if (joystickHandleRef.current) {
        // limit visual translation to maxDist
        const visualDist = Math.min(dist, maxDist);
        const ratio = dist > 0 ? visualDist / dist : 0;
        joystickHandleRef.current.style.transform = `translate(${dx * ratio}px, ${dy * ratio}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
      if ('changedTouches' in e) {
         for (let i=0; i<e.changedTouches.length; i++) {
             if (e.changedTouches[i].identifier === joystick.current.pointerId) {
                 joystick.current.active = false;
                 joystick.current.x = 0;
                 joystick.current.y = 0;
                 joystick.current.pointerId = -1;
                 break;
             }
         }
      } else {
         joystick.current.active = false;
         joystick.current.x = 0;
         joystick.current.y = 0;
      }

      if (joystickHandleRef.current) {
          joystickHandleRef.current.style.transform = `translate(0px, 0px)`;
      }
      if (joystickBgRef.current) {
          joystickBgRef.current.style.boxShadow = 'none';
          joystickBgRef.current.style.borderColor = 'rgba(255,255,255,0.1)';
          joystickBgRef.current.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
      }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
  };

  const playerScore = Math.floor(entities.current.find(e => e.isPlayer)?.score || 0);
  const sortedLeaderboard = [...entities.current].sort((a,b) => b.score - a.score);

  return (
    <div className="relative w-full h-[70vh] min-h-[450px] lg:h-[700px] bg-[#0a0a16] flex flex-col font-sans overflow-hidden touch-none overscroll-none rounded-3xl border border-slate-800 shadow-xl" dir="rtl">
        
        {/* Top Header Overlay */}
        <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 pointer-events-none">
            
            <div className="flex flex-col items-center pointer-events-auto absolute left-1/2 -translate-x-1/2 top-4">
                 <h1 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-wide flex items-center gap-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                   <Crown className="w-8 h-8 text-amber-400" />
                   طور الملك
                   <Crown className="w-8 h-8 text-amber-400" />
                </h1>
                <p className="text-sm rounded-full bg-black/40 px-4 py-1 border border-white/10 text-amber-200 mt-2 hidden sm:block">كن الملك واجمع النقاط!</p>
                {activeEvent.current && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-indigo-600/90 backdrop-blur-md px-6 py-2 rounded-full border border-purple-400/50 shadow-[0_0_30px_rgba(139,92,246,0.6)]">
                            <span className="text-white font-bold text-sm sm:text-base whitespace-nowrap drop-shadow-md">
                                {activeEvent.current.msg}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <button className="pointer-events-auto h-12 w-12 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg">
                <Settings className="w-6 h-6 text-slate-300" />
            </button>
        </header>

        {/* HUD Elements */}
        {gameState === 'playing' && (
           <div className="absolute top-16 sm:top-24 left-2 sm:left-4 right-2 sm:right-4 bottom-2 sm:bottom-4 pointer-events-none flex justify-between items-start z-10">
                
                {/* Left: Leaderboard Container */}
                <div className="bg-[#15132b]/80 backdrop-blur-md rounded-3xl border border-[#2d2b45] p-2 sm:p-4 w-36 sm:w-60 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-2 sm:gap-3">
                   <h3 className="text-white font-bold text-xs sm:text-sm flex items-center justify-between mb-1 px-1">
                       ترتيب اللاعبين 
                       <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,1)]"></span>
                   </h3>
                   {sortedLeaderboard.map((e, index) => (
                       <div key={e.id} className={`flex items-center justify-between p-1.5 sm:p-2 rounded-2xl transition-colors ${e.isPlayer ? 'bg-[#312e52]/80 border border-[#48427a]' : 'hover:bg-white/5'}`}>
                          <div className="flex items-center gap-2 sm:gap-3">
                             <div 
                                className="w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-inner" 
                                style={{backgroundColor: e.color}}
                             >
                                 {index + 1}
                             </div>
                             <span className={`text-xs sm:text-sm font-bold truncate max-w-[50px] sm:max-w-max ${e.isPlayer ? 'text-white' : 'text-slate-300'}`}>
                                 {e.name}
                                 {e.isKing && <Crown className="inline-block w-3 h-3 sm:w-4 sm:h-4 text-amber-400 mr-1 sm:mr-2 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />}
                             </span>
                          </div>
                          <span className={`text-base sm:text-lg transition-all pr-1 sm:pr-2 ${e.isKing ? 'text-amber-400 font-black' : 'text-white font-bold'}`}>
                              {Math.floor(e.score)}
                          </span>
                       </div>
                   ))}
                </div>

                {/* Center: Active Score & Timer */}
                <div className="flex flex-col items-center mt-0 absolute left-1/2 -translate-x-1/2">
                    <div className="bg-[#15132b]/80 backdrop-blur-md rounded-2xl sm:rounded-[2rem] border border-[#2d2b45] px-6 py-2 sm:px-12 sm:py-4 shadow-2xl flex flex-col items-center transform transition-transform hover:scale-105">
                        <span className="text-slate-400 font-bold text-xs sm:text-sm mb-0 sm:mb-1">نقاطك</span>
                        <span className="text-3xl sm:text-6xl text-amber-400 font-black font-heading tracking-widest drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                            {playerScore}
                        </span>
                    </div>
                    <div className="mt-2 sm:mt-4 bg-[#15132b]/95 backdrop-blur-xl px-4 py-1 sm:px-6 sm:py-2 rounded-full border border-[#48427a] text-slate-200 font-bold flex items-center gap-2 sm:gap-3 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        <span className="text-base sm:text-xl">⏱️</span>
                        <span className="text-base sm:text-xl tracking-wider">{formatTime(gameTime)}</span>
                    </div>
                </div>

                {/* Right: Goal Box (Hidden on small mobile) */}
                <div className="hidden lg:block bg-[#15132b]/80 backdrop-blur-md rounded-3xl border border-[#2d2b45] p-4 w-40 shadow-2xl text-center">
                     <span className="text-white font-bold block mb-2 text-sm">هدف الفوز</span>
                     <p className="text-slate-400 text-[10px] mb-2">كن أول من يصل إلى</p>
                     <div className="text-4xl text-amber-400 font-black font-heading drop-shadow-lg">{WIN_SCORE}</div>
                     <span className="text-slate-400 text-xs mt-1 block">نقطة</span>
                </div>

                {/* Mobile Specific Overlay Controls */}
                <div className="md:hidden absolute bottom-6 left-6 w-32 h-32 rounded-full border border-white/20 flex items-center justify-center bg-black/30 pointer-events-auto transition-colors duration-200"
                     ref={joystickBgRef}
                     onTouchStart={handleTouchStart}
                     onTouchMove={handleTouchMove}
                     onTouchEnd={handleTouchEnd}
                     onTouchCancel={handleTouchEnd}
                >
                    <div ref={joystickHandleRef} className="w-14 h-14 bg-white/40 backdrop-blur-md shadow-2xl border border-white/40 rounded-full transition-transform duration-75" />
                </div>

                <div className="md:hidden absolute bottom-6 right-6 pointer-events-auto flex items-end justify-center">
                    <button 
                         className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${entities.current.find(e => e.isPlayer)?.energy! > 5 ? 'bg-amber-500 hover:bg-amber-400 text-white border-4 border-amber-600/50 shadow-[0_0_25px_rgba(245,158,11,0.6)]' : 'bg-slate-700 text-slate-400 border-4 border-slate-800'}`}
                         onPointerDown={() => isSprintingActive.current = true}
                         onPointerUp={() => isSprintingActive.current = false}
                         onPointerLeave={() => isSprintingActive.current = false}
                    >
                        <Zap className="w-8 h-8" fill="currentColor" />
                    </button>
                    {/* Energy bar ring could go here */}
                </div>

           </div>
        )}

        {/* Game Canvas Area */}
        <div 
           className="relative flex-1 select-none z-0 mt-8"
           ref={containerRef}
           onMouseDown={handleTouchStart}
           onMouseMove={handleTouchMove}
           onMouseUp={handleTouchEnd}
           onMouseLeave={handleTouchEnd}
        >
           <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
        </div>

        {/* Optional Tip Bar at Bottom */}
        {gameState === 'playing' && (
           <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="bg-[#15132b]/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-[#2d2b45] flex items-center gap-3 shadow-2xl">
                  <Lightbulb className="w-5 h-5 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]" />
                  <span className="text-slate-300 text-sm font-medium">نصيحة: احمل التاج واهرب واضغط "مسافة" أو زر البرق للركض السريع (يستهلك طاقة).</span>
              </div>
           </div>
        )}

        {/* Game Over Modal */}
        {gameState !== 'playing' && (
           <div className="absolute inset-0 bg-[#0f0e1f]/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
              <div className="bg-[#15132b] rounded-[2rem] p-8 max-w-sm w-full border border-[#2d2b45] shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden transform scale-100 transition-all">
                 <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600" />
                 
                 <div className="w-24 h-24 bg-[#1e1c32] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] border border-[#2d2b45]">
                     {gameState === 'won' ? (
                         <Trophy className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                     ) : (
                         <Crown className="w-12 h-12 text-slate-500" />
                     )}
                 </div>
                 
                 <h2 className="text-4xl font-black text-white mb-3 font-heading tracking-wide">
                     {gameState === 'won' ? 'أنت الملك!' : 'انتهت اللعبة'}
                 </h2>
                 <p className="text-slate-400 mb-8 font-medium bg-[#1e1c32]/50 p-4 rounded-2xl border border-[#2d2b45]">
                     {gameState === 'won' 
                         ? 'لقد سيطرت على الحلبة وحافظت على التاج ببراعة!' 
                         : `لقد فاز ${winner?.name} بالتاج، حظاً أوفر في المرة القادمة.`}
                 </p>
                 <div className="flex flex-col gap-3">
                     <button 
                        onClick={() => {
                            if (isHost) {
                                sendKingEvent({
                                    type: 'KING_SYNC',
                                    entities: entities.current.map(e => ({ ...e, score: 0, x: Math.random()*200 - 100, y: Math.random()*200 - 100, isKing: false })),
                                    crown: { x: 0, y: 0, pickedUp: false, scale: 1 },
                                    gameState: 'playing',
                                    winner: null
                                });
                                setupGame();
                            } else {
                                alert("في انتظار مالك الغرفة لإعادة اللعب");
                            }
                        }}
                        className={`w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 focus:ring-4 focus:ring-amber-500/50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 outline-none group shadow-lg drop-shadow-md ${!isHost && 'opacity-50'}`}
                     >
                        <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
                        {isHost ? 'العب مرة أخرى' : 'بانتظار المالك...'}
                     </button>
                     <button 
                        onClick={returnToLobby}
                        className="w-full bg-[#1e1c32] hover:bg-[#2d2b45] text-slate-300 font-bold flex items-center justify-center gap-2 py-4 rounded-2xl transition-colors outline-none border border-[#2d2b45]"
                     >
                        <ArrowRight className="w-5 h-5" />
                        العودة للغرفة
                     </button>
                 </div>
              </div>
           </div>
        )}
    </div>
  );
}
