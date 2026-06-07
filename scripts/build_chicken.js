const fs = require('fs');

const kingModeCode = fs.readFileSync('src/pages/KingModeRoom.tsx', 'utf-8');
const chickenSoloCode = fs.readFileSync('src/pages/ChickenSolo.tsx', 'utf-8');

// I will output a modified version of ChickenSolo as ChickenRoom.tsx.
// It will integrate multiplayer logic from KingModeRoom.

let chickenRoomCode = chickenSoloCode;

// Imports
chickenRoomCode = chickenRoomCode.replace(
  "import { updatePlayerStats } from '../lib/firebase';",
  `import { updatePlayerStats } from '../lib/firebase';
import { useGame } from '../components/GameContext';
import { RoomPlayer } from '../lib/types';
import confetti from 'canvas-confetti';`
);

// Component declaration
chickenRoomCode = chickenRoomCode.replace(
  "export default function ChickenSolo() {",
  `export default function ChickenRoom() {
  const { state, playerId, isHost, handleMessage, returnToLobby, requestRematch } = useGame();
  
  // Create a helper to send events easily
  const sendChickenEvent = useCallback((msg) => {
      handleMessage(msg);
  }, [handleMessage]);
`
);

// We need to keep track of network inputs
chickenRoomCode = chickenRoomCode.replace(
  "const playersRef = useRef<Player[]>([]);",
  `const playersRef = useRef<Player[]>([]);
  const remoteInputs = useRef<{ [id: string]: { dx: number, dy: number, sprintIntent: boolean } }>({});
  const winnerRef = useRef<Player | null>(null);`
);

// Replace initGame logic with room players instead of bots
// Replace the initGame definition:
chickenRoomCode = chickenRoomCode.replace(
  /const initGame = useCallback\(\(\) => \{[\s\S]*?\}, \[\]\);/,
  `const initGame = useCallback(() => {
    timeRef.current = 180;
    setTimeLeft(180);
    setGameState('playing');
    stateRef.current = 'playing';
    setIsWin(null);
    setCurrentEventMessage(null);
    nextEventTimeRef.current = 180 - (20 + Math.random() * 20);
    particlesRef.current = [];
    chickenSpawnTimersRef.current = [];
    winnerRef.current = null;

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
    
    // Use seeded random or deterministic positions for environment so it matches across clients, 
    // or we just send it once from host. Let's just let host generate and sync.
    // Actually, for simplicity, we let host generate and sync it once!
    if (isHost) {
        addEnv('pond', 1);
        addEnv('tree', 8);
        addEnv('bush', 12);
        addEnv('hay', 6);
        addEnv('crate', 4);
        addEnv('rock', 8);
        addEnv('flower', 15);
    }

  }, [isHost]);

  const COLORS = ['#38bdf8', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
  const BARN_POSITIONS = [
      { x: 30, y: WORLD_H - 150 }, // Bottom Left
      { x: WORLD_W - 150, y: 30 }, // Top Right
      { x: 30, y: 30 }, // Top Left
      { x: WORLD_W - 150, y: WORLD_H - 150 }, // Bottom Right
      { x: WORLD_W / 2 - 60, y: 30 }, // Top Mid
      { x: WORLD_W / 2 - 60, y: WORLD_H - 150 } // Bottom Mid
  ];

  useEffect(() => {
    if (!state) return;
    const roomPlayers = Object.values(state.players) as RoomPlayer[];
    const bw = 120, bh = 120;
    
    // Only add new players to maintain existing state when possible
    const newPlayers: Player[] = [];
    roomPlayers.forEach((p, idx) => {
        const existing = playersRef.current.find(e => e.id === p.id);
        if (existing) {
            existing.name = p.username;
            newPlayers.push(existing);
        } else {
            const bPos = BARN_POSITIONS[idx % BARN_POSITIONS.length];
            // Spawn just outside their barn
            let spawnX = bPos.x + bw/2;
            let spawnY = bPos.y + bh/2;
            if (bPos.y < WORLD_H / 2) spawnY += bh; else spawnY -= 40;
            if (bPos.x < WORLD_W / 2) spawnX += bw; else spawnX -= 40;
            
            newPlayers.push({
                id: p.id,
                name: p.username,
                isBot: false,
                x: spawnX,
                y: spawnY,
                vx: 0, Mathvy: 0,
                color: COLORS[idx % COLORS.length],
                score: 0,
                carryingChicken: 'none',
                speedMultiplier: 1,
                barn: { x: bPos.x, y: bPos.y, w: bw, h: bh },
                wobble: 0,
                dir: spawnX < WORLD_W/2 ? 1 : -1,
                stealCooldown: 0
            });
        }
    });
    playersRef.current = newPlayers;
    
    if (isHost && chickensRef.current.length === 0) {
        for(let i=0; i<10; i++) spawnChicken(Math.random() > 0.95 ? 'golden' : 'normal');
    }
    updateScores();
  }, [state?.players, isHost]);`
);


chickenRoomCode = chickenRoomCode.replace(
  /useEffect\(\(\) => \{[\s\S]*?window.addEventListener\('king_event'.*?\}/,
  `// Sync Logic`
);

// We need the handleChickenEvent hook:
chickenRoomCode = chickenRoomCode.replace(
  "const updateScores = () => {",
  `useEffect(() => {
    const handleChickenEvent = (e: any) => {
        const msg = e.detail;
        if (msg.type === 'CHICKEN_INPUT' && isHost) {
            remoteInputs.current[msg.playerId] = { dx: msg.dx, dy: msg.dy, sprintIntent: msg.sprintIntent };
        } else if (msg.type === 'CHICKEN_SYNC' && !isHost) {
            if (msg.players) {
                // Update players
                msg.players.forEach((mp: any) => {
                    const localP = playersRef.current.find(p => p.id === mp.id);
                    if (localP) {
                        localP.x = mp.x;
                        localP.y = mp.y;
                        localP.vx = mp.vx;
                        localP.vy = mp.vy;
                        localP.score = mp.score;
                        localP.carryingChicken = mp.carryingChicken;
                        localP.dir = mp.dir;
                        localP.wobble = mp.wobble;
                        localP.barn.glow = mp.barnGlow;
                        localP.speedMultiplier = mp.speedMultiplier;
                    }
                });
            }
            if (msg.chickens) {
                chickensRef.current = msg.chickens;
            }
            if (msg.env && envRef.current.length === 0) {
                envRef.current = msg.env;
            }
            if (msg.time) {
                timeRef.current = msg.time;
                setTimeLeft(msg.time);
            }
            if (msg.state) {
                if (msg.state === 'results' && stateRef.current !== 'results') {
                    setGameState('results');
                    stateRef.current = 'results';
                    setIsWin(msg.winnerId === playerId);
                    if (msg.winnerId === playerId) chickenAudio.playWin(); else chickenAudio.playLose();
                    updateScores();
                }
            }
            if (msg.eventMsg) {
                setCurrentEventMessage(msg.eventMsg);
                if (msg.eventMsg.includes('ذهبية') || msg.eventMsg.includes('انفجار') || msg.eventMsg.includes('سرعة')) {
                    chickenAudio.playEventAlert();
                }
            } else {
                setCurrentEventMessage(null);
            }
        }
    };
    window.addEventListener('chicken_event', handleChickenEvent);
    return () => window.removeEventListener('chicken_event', handleChickenEvent);
  }, [isHost, playerId, gameState]);

  const updateScores = () => {`
);

fs.writeFileSync('scripts/out_step1.js', chickenRoomCode);
