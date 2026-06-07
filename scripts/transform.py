import os
import re

with open('src/pages/ChickenSolo.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace Imports
code = code.replace("import { updatePlayerStats } from '../lib/firebase';", 
"""import { updatePlayerStats } from '../lib/firebase';
import { useGame } from '../components/GameContext';
import { RoomPlayer } from '../lib/types';
import confetti from 'canvas-confetti';
import { Zap } from 'lucide-react';""")

# Component Signature
code = code.replace("export default function ChickenSolo() {",
"""export default function ChickenRoom() {
  const { state, playerId, isHost, handleMessage, returnToLobby, requestRematch, sendChickenEvent } = useGame();
""")

# Setup Refs
code = code.replace("const playersRef = useRef<Player[]>([]);",
"""const playersRef = useRef<Player[]>([]);
  const remoteInputs = useRef<{ [id: string]: { dx: number, dy: number, sprintIntent: boolean } }>({});
  const winnerRef = useRef<Player | null>(null);
  const eventMsgRef = useRef<string | null>(null);
  const frameCountRef = useRef(0);
""")

# Replace initGame
code = re.sub(
    r"const initGame = useCallback\(\(\) => \{.*?\n  \}, \[\]\);",
    """const initGame = useCallback(() => {
    timeRef.current = 180;
    setTimeLeft(180);
    setGameState('playing');
    stateRef.current = 'playing';
    setIsWin(null);
    setCurrentEventMessage(null);
    eventMsgRef.current = null;
    nextEventTimeRef.current = 180 - (20 + Math.random() * 20);
    particlesRef.current = [];
    chickenSpawnTimersRef.current = [];
    winnerRef.current = null;
    frameCountRef.current = 0;

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
    
    if (isHost) {
        addEnv('pond', 1); addEnv('tree', 8); addEnv('bush', 12); addEnv('hay', 6);
        addEnv('crate', 4); addEnv('rock', 8); addEnv('flower', 15);
    }
  }, [isHost]);
  
  const COLORS = ['#38bdf8', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
  const BARN_POSITIONS = [
      { x: 30, y: WORLD_H - 180 }, { x: WORLD_W - 150, y: 30 },
      { x: 30, y: 30 }, { x: WORLD_W - 150, y: WORLD_H - 180 },
      { x: WORLD_W / 2 - 60, y: 50 }, { x: WORLD_W / 2 - 60, y: WORLD_H - 180 }
  ];

  useEffect(() => {
    if (!state) return;
    const roomPlayers = Object.values(state.players) as RoomPlayer[];
    const bw = 120, bh = 120;
    
    const newPlayers: Player[] = [];
    roomPlayers.forEach((p, idx) => {
        const existing = playersRef.current.find(e => e.id === p.id);
        if (existing) {
            existing.name = p.username;
            newPlayers.push(existing);
        } else {
            const bPos = BARN_POSITIONS[idx % BARN_POSITIONS.length];
            let spawnX = bPos.x + bw/2;
            let spawnY = bPos.y + bh/2 + 70;
            if (bPos.y < WORLD_H / 2) spawnY -= 140;
            
            newPlayers.push({
                id: p.id, name: p.username, isBot: false,
                x: spawnX, y: Math.max(30, Math.min(WORLD_H-30, spawnY)), vx: 0, vy: 0,
                color: COLORS[idx % COLORS.length], score: 0, carryingChicken: 'none',
                speedMultiplier: 1, barn: { x: bPos.x, y: bPos.y, w: bw, h: bh, glow: 0 },
                wobble: 0, dir: spawnX < WORLD_W/2 ? 1 : -1, stealCooldown: 0
            });
        }
    });
    playersRef.current = newPlayers;
    
    if (isHost && chickensRef.current.length === 0) {
        for(let i=0; i<10; i++) spawnChicken(Math.random() > 0.95 ? 'golden' : 'normal');
    }
    updateScores();
  }, [state?.players, isHost]);

  useEffect(() => {
    const handleChickenEvent = (e: any) => {
        const msg = e.detail;
        if (msg.type === 'CHICKEN_INPUT' && isHost) {
            remoteInputs.current[msg.playerId] = { dx: msg.dx, dy: msg.dy, sprintIntent: msg.sprintIntent };
        } else if (msg.type === 'CHICKEN_SYNC' && !isHost) {
            if (msg.players) {
                msg.players.forEach((mp: any) => {
                    const localP = playersRef.current.find(p => p.id === mp.id);
                    if (localP) {
                        localP.x = mp.x; localP.y = mp.y;
                        localP.score = mp.score; localP.carryingChicken = mp.carryingChicken;
                        localP.dir = mp.dir; localP.wobble = mp.wobble;
                        localP.barn.glow = mp.barnGlow; localP.speedMultiplier = mp.speedMultiplier;
                        
                        // simple lerping
                        localP.vx = mp.vx; localP.vy = mp.vy;
                    }
                });
            }
            if (msg.chickens) chickensRef.current = msg.chickens;
            if (msg.env && envRef.current.length === 0) envRef.current = msg.env;
            if (msg.time !== undefined && Math.abs(timeRef.current - msg.time) > 2) {
                timeRef.current = msg.time;
                setTimeLeft(msg.time);
            }
            if (msg.state) {
                if (msg.state === 'results' && stateRef.current !== 'results') {
                    setGameState('results');
                    stateRef.current = 'results';
                    setIsWin(msg.winnerId === playerId);
                    if (msg.winnerId === playerId) {
                        chickenAudio.playWin();
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    } else chickenAudio.playLose();
                    updateScores();
                }
            }
            if (msg.eventMsg !== undefined) {
                if (msg.eventMsg !== eventMsgRef.current) {
                    setCurrentEventMessage(msg.eventMsg);
                    eventMsgRef.current = msg.eventMsg;
                    if (msg.eventMsg) chickenAudio.playEventAlert();
                }
            }
        }
    };
    window.addEventListener('chicken_event', handleChickenEvent);
    return () => window.removeEventListener('chicken_event', handleChickenEvent);
  }, [isHost, playerId, gameState]);
""", code, flags=re.DOTALL)

# Handle executeRandomEvent, checkWinCondition, endGame hooks
# For multiplayer, only Host executes logic

code = re.sub(
    r"const executeRandomEvent = useCallback\(\(\) => \{.*?\n  \}, \[\]\);",
    """const executeRandomEvent = useCallback(() => {
      if (!isHost) return;
      const events = ['EXPLOSION', 'GOLDEN', 'SPEED', 'BONUS_BOX'];
      const ev = events[Math.floor(Math.random() * events.length)];
      chickenAudio.playEventAlert();

      if (ev === 'EXPLOSION') {
         eventMsgRef.current = 'انفجار دجاج! تضاعف العدد';
         for(let i=0; i<8; i++) spawnChicken('normal');
      } else if (ev === 'GOLDEN') {
         eventMsgRef.current = 'ظهرت الدجاجة الذهبية! (5 نقاط)';
         spawnChicken('golden');
      } else if (ev === 'SPEED') {
         eventMsgRef.current = 'جرعة سرعة للجميع!';
         playersRef.current.forEach(p => {
             p.speedMultiplier = 1.6;
             spawnParticles(p.x, p.y, 'sparkle', 10, {color: 'cyan'});
         });
         setTimeout(() => { playersRef.current.forEach(p => p.speedMultiplier = 1); }, 6000);
      } else if (ev === 'BONUS_BOX') {
         eventMsgRef.current = 'صندوق مكافأة! يعطي 10 نقاط';
         spawnChicken('bonus_box');
      }
      setTimeout(() => { eventMsgRef.current = null; }, 3000);
  }, [isHost]);""", code, flags=re.DOTALL)

code = re.sub(
    r"const checkWinCondition = useCallback\(\(\) => \{.*?\n  \}, \[\]\);",
    """const checkWinCondition = useCallback(() => {
      if (!isHost) return;
      let winningPlayer = null;
      for (const p of playersRef.current) {
          if (p.score >= 50) winningPlayer = p;
      }
      if (winningPlayer) endGame(winningPlayer);
  }, [isHost]);""", code, flags=re.DOTALL)

code = re.sub(
    r"const endGame = useCallback\(\(won: boolean\) => \{.*?\n  \}, \[\]\);",
    """const endGame = useCallback((winnerPlayer: Player | null) => {
      if (!isHost) return;
      stateRef.current = 'results';
      setGameState('results');
      winnerRef.current = winnerPlayer;
      updateScores();
  }, [isHost]);""", code, flags=re.DOTALL)

# Re-link Interval (Host Only)
code = re.sub(
    r"useEffect\(\(\) => \{\n     if \(gameState !== 'playing'\) return;\n     const t = setInterval\(\(\) => \{.*?\n     \}, 1000\);\n     return \(\) => clearInterval\(t\);\n  \}, \[gameState, endGame, executeRandomEvent\]\);",
    """useEffect(() => {
     if (gameState !== 'playing' || !isHost) return;
     const t = setInterval(() => {
        if (timeRef.current <= 0) {
           clearInterval(t);
           const pList = [...playersRef.current].sort((a,b) => b.score - a.score);
           endGame(pList[0]);
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
  }, [gameState, endGame, executeRandomEvent, isHost]);""", code, flags=re.DOTALL)

# Re-write the `update` loop (the physics wrapper)
code = re.sub(
    r"const update = \(dt: number\) => \{.*?const canvas = canvasRef\.current;",
    """const update = (dt: number) => {
    frameCountRef.current++;
    const players = playersRef.current;
    const chickens = chickensRef.current;
    const localPlayer = players.find(p => p.id === playerId);

    if (localPlayer) {
        // Send input to host
        let dx = inputRef.current.dx;
        let dy = inputRef.current.dy;
        const sprintIntent = false; // Add sprint later if requested
        if (!isHost && frameCountRef.current % 2 === 0) {
            handleMessage({ type: 'CHICKEN_INPUT', playerId, dx, dy, sprintIntent });
        }
    }

    if (!isHost) {
        // CLIENT LOGIC: Just extrapolate positions
        for (const p of players) {
            p.x += p.vx * dt; p.y += p.vy * dt;
            p.vx *= 0.85; p.vy *= 0.85;
            p.x = Math.max(25, Math.min(WORLD_W - 25, p.x));
            p.y = Math.max(25, Math.min(WORLD_H - 25, p.y));
            if (Math.hypot(p.vx, p.vy) > 10) p.wobble += dt * 25; else p.wobble += dt * 5;
            if (p.barn.glow) p.barn.glow = Math.max(0, p.barn.glow - dt * 2);
        }
        for (const c of chickens) {
            if (c.state === 'wandering') {
                c.x += c.vx * dt; c.y += c.vy * dt;
                c.vx *= 0.85; c.vy *= 0.85;
                if (Math.hypot(c.vx, c.vy) > 5) c.wobble += dt * 18;
            } else if (c.state === 'magnet') {
                const carrier = players.find(p => p.id === c.carrierId);
                if (carrier) {
                    const cx = carrier.x - c.x; const cy = carrier.y - 20 - c.y;
                    const d = Math.hypot(cx, cy);
                    if (d > 15) { c.x += (cx/d)*800*dt; c.y += (cy/d)*800*dt; } else { c.state = 'carried'; }
                }
            } else if (c.state === 'carried') {
                const carrier = players.find(p => p.id === c.carrierId);
                if (carrier) { c.x = carrier.x; c.y = carrier.y - 30; c.wobble = carrier.wobble; }
            }
        }
        
    } else {
        // HOST LOGIC
        // Spawn Scheduled Chickens
        for (let i = chickenSpawnTimersRef.current.length - 1; i >= 0; i--) {
            chickenSpawnTimersRef.current[i] -= dt;
            if (chickenSpawnTimersRef.current[i] <= 0 && chickens.length < 15) {
                spawnChicken(Math.random() > 0.90 ? 'golden' : 'normal');
                chickenSpawnTimersRef.current.splice(i, 1);
            } else if (chickenSpawnTimersRef.current[i] <= 0) {
                chickenSpawnTimersRef.current.splice(i, 1);
            }
        }

        // Apply Input from all players
        for (const p of players) {
            let dx = 0; let dy = 0;
            if (p.id === playerId) {
                dx = inputRef.current.dx; dy = inputRef.current.dy;
            } else if (remoteInputs.current[p.id]) {
                dx = remoteInputs.current[p.id].dx; dy = remoteInputs.current[p.id].dy;
            }
            const speed = 320 * p.speedMultiplier;
            const len = Math.hypot(dx, dy);
            if (len > 0) {
                const limit = 40; const normalizedFactor = Math.min(len / limit, 1.0);
                p.vx = (dx / len) * speed * normalizedFactor;
                p.vy = (dy / len) * speed * normalizedFactor;
                if (len > 5) p.dir = p.vx > 0 ? 1 : -1;
            } else {
                p.vx = 0; p.vy = 0;
            }
        }

        // Move players & catch chickens
        for (const p of players) {
            p.x += p.vx * dt; p.y += p.vy * dt;
            p.x = Math.max(25, Math.min(WORLD_W - 25, p.x));
            p.y = Math.max(25, Math.min(WORLD_H - 25, p.y));

            if (Math.hypot(p.vx, p.vy) > 10) {
                p.wobble += dt * 25;
                if (p.lastVx !== undefined && p.lastVy !== undefined) {
                    const dot = (p.vx * p.lastVx + p.vy * p.lastVy) / (Math.hypot(p.vx, p.vy) * Math.hypot(p.lastVx, p.lastVy) || 1);
                    if (dot < 0.2 && Math.hypot(p.lastVx, p.lastVy) > 50) {
                        spawnParticles(p.x, p.y + 15, 'dust', 4, {color: 'rgba(0,0,0,0.15)'});
                    }
                }
                if (Math.random() < 0.25) spawnParticles(p.x, p.y + 15, 'dust', 1, {color: 'rgba(0,0,0,0.1)'});
            } else p.wobble += dt * 5;
            
            p.lastVx = p.vx; p.lastVy = p.vy;

            if (p.carryingChicken === 'none') {
                for (let i = chickens.length - 1; i >= 0; i--) {
                const c = chickens[i];
                if (c.state === 'wandering') {
                    if (Math.hypot(p.x - c.x, p.y - c.y) < 45) { // generous pickup
                    if (c.type === 'bonus_box') {
                        p.score += 10;
                        if (p.id === playerId) { chickenAudio.playWin(); cameraRef.current.shake = 10; }
                        spawnParticles(c.x, c.y, 'text', 1, {text: '+10', color: '#ec4899'});
                        spawnParticles(c.x, c.y, 'sparkle', 15, {color: 'magenta'});
                        chickens.splice(i, 1);
                        updateScores();
                        checkWinCondition();
                    } else {
                        c.state = 'magnet'; c.carrierId = p.id; p.carryingChicken = c.type;
                        if (p.id === playerId) chickenAudio.playPickup();
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
                
                p.score += pts; p.carryingChicken = 'none';
                if (p.id === playerId) { chickenAudio.playDrop(); cameraRef.current.shake = pts > 1 ? 20 : 12; }
                
                spawnParticles(p.barn.x + p.barn.w/2, p.barn.y - 10, 'text', 1, {text: `+${pts}`, color: pts > 1 ? '#fde047' : '#4ade80'});
                spawnParticles(p.barn.x + p.barn.w/2, p.barn.y + p.barn.h/2, 'sparkle', pts > 1 ? 25 : 10, {color: pts > 1 ? '#facc15' : '#60a5fa'});
                p.barn.glow = 1.0;

                scheduleChickenSpawn(); updateScores(); checkWinCondition();
                }
            }
            if (p.barn.glow) p.barn.glow = Math.max(0, p.barn.glow - dt * 2);
        }

        // Update Chickens
        for (const c of chickens) {
            if (c.state === 'wandering') {
                if(Math.random() < 0.02) { c.targetX = c.x + (Math.random()-0.5)*100; c.targetY = c.y + (Math.random()-0.5)*100; }
                if (c.targetX !== undefined && c.targetY !== undefined) {
                    const dist = Math.hypot(c.targetX - c.x, c.targetY - c.y);
                    if (dist > 5) {
                        c.vx += ((c.targetX - c.x)/dist * 60 - c.vx) * dt * 3;
                        c.vy += ((c.targetY - c.y)/dist * 60 - c.vy) * dt * 3;
                    } else { c.targetX = undefined; }
                }
                
                c.x += c.vx * dt; c.y += c.vy * dt;
                c.vx *= 0.85; c.vy *= 0.85;
                c.x = Math.max(20, Math.min(WORLD_W - 20, c.x)); c.y = Math.max(20, Math.min(WORLD_H - 20, c.y));
                if (Math.hypot(c.vx, c.vy) > 5) c.wobble += dt * 18;
            } else if (c.state === 'magnet') {
                const carrier = players.find(p => p.id === c.carrierId);
                if (carrier) {
                    const dx = carrier.x - c.x; const dy = carrier.y - c.y - 20;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 15) { c.state = 'carried'; } else {
                        c.x += (dx / dist) * 800 * dt; c.y += (dy / dist) * 800 * dt;
                    }
                } else c.state = 'wandering';
            } else if (c.state === 'carried') {
                const carrier = players.find(p => p.id === c.carrierId);
                if (carrier) { c.x = carrier.x; c.y = carrier.y - 30; c.wobble = carrier.wobble; }
            }
        }

        if (frameCountRef.current % 2 === 0) {
            handleMessage({
                type: 'CHICKEN_SYNC',
                players: players.map(p => ({
                    id: p.id, x: p.x, y: p.y, vx: p.vx, vy: p.vy,
                    score: p.score, carryingChicken: p.carryingChicken,
                    dir: p.dir, wobble: p.wobble, barnGlow: p.barn.glow, speedMultiplier: p.speedMultiplier
                })),
                chickens: chickens.map(c => ({...c})),
                env: frameCountRef.current < 10 ? envRef.current : undefined,
                time: timeRef.current,
                state: stateRef.current,
                winnerId: winnerRef.current?.id,
                eventMsg: eventMsgRef.current
            });
        }
    } // End Host Logic

    // Particles Match
    for(let i=particlesRef.current.length-1; i>=0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.life += dt; pt.angle += pt.rotSpeed * dt;
        if(pt.type === 'text') { pt.vy -= 100 * dt; pt.vx *= 0.95; } else { pt.vy += 150 * dt; }
        if(pt.life >= pt.maxLife) particlesRef.current.splice(i, 1);
    }

    const canvas = canvasRef.current;
""", code, flags=re.DOTALL)

# Now, we also need to change targetCamX to track localPlayer
code = re.sub(
    r"let targetCamX = p1\.x - viewW / 2;\n    let targetCamY = p1\.y - viewH / 2;",
    """const targetP = localPlayer || players[0];
    let targetCamX = targetP.x - viewW / 2;
    let targetCamY = targetP.y - viewH / 2;""", code)

# In ENDGAME VIEW: Wait, isWin uses `playerId === s.id`, change `p1` to `playerId`.
# we can just find 'p1' strings in UI and replace with `playerId`
code = code.replace("s.id === 'p1'", "s.id === playerId")
code = code.replace("p.id === 'p1'", "p.id === playerId")
# Also the Ad area needs to be totally removed from UI.
# Remove:
ad_pattern = r"\{/\* 7\. Ad Area - Fixed Height \*/\}.*?</p>" # Not exact, let's just find the div
code = re.sub(
    r"\{/\* 7\. Ad Area - Fixed Height \*/\}.*?</div>\n",
    "", code, flags=re.DOTALL
)

with open('src/pages/ChickenRoom.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done generating ChickenRoom.tsx")
