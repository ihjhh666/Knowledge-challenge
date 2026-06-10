import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon, RotateCcw, Volume2, VolumeX, Grid2X2, Trophy, BrainCircuit, Target, Settings2, Play } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { storage } from '../lib/storage';
import { audio } from '../lib/audio';

type Domino = { id: string; val1: number; val2: number };

interface PlacedDomino {
  piece: Domino;
  connectedVia: number; 
  freeEnd: number; 
}

interface VisualTile {
  id: string;
  piece: Domino;
  x: number;
  y: number;
  rotation: number;
  isDouble: boolean;
  type: 'root' | 'left' | 'right';
  isEnd: boolean;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const generateTiles = (): Domino[] => {
  const tiles: Domino[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      tiles.push({ id: `${i}-${j}`, val1: i, val2: j });
    }
  }
  return tiles.sort(() => Math.random() - 0.5);
};

const BOARD_L = 120;
const BOARD_W = 60;
const GAP = 2;
const BOUND_X = 260;

const Dot = () => <div className="w-[18%] h-[18%] min-w-[7px] min-h-[7px] rounded-full bg-[#1e2328] shadow-[inset_0_-1px_3px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.5)]" />;
const DotGrid = ({ val }: { val: number }) => {
  if (val === 0) return <div className="w-full h-full" />;
  
  return (
    <div className="absolute inset-[15%] flex flex-col justify-between">
       {val === 1 && <div className="w-full h-full flex items-center justify-center"><Dot /></div>}
       {val === 2 && (
         <>
           <div className="flex justify-start"><Dot /></div>
           <div className="flex justify-end"><Dot /></div>
         </>
       )}
       {val === 3 && (
         <>
           <div className="flex justify-start"><Dot /></div>
           <div className="flex justify-center"><Dot /></div>
           <div className="flex justify-end"><Dot /></div>
         </>
       )}
       {val === 4 && (
         <>
           <div className="flex justify-between"><Dot /><Dot /></div>
           <div className="h-full"></div>
           <div className="flex justify-between"><Dot /><Dot /></div>
         </>
       )}
       {val === 5 && (
         <>
            <div className="flex justify-between"><Dot /><Dot /></div>
            <div className="flex justify-center items-center absolute inset-0"><Dot /></div>
            <div className="flex justify-between"><Dot /><Dot /></div>
         </>
       )}
       {val === 6 && (
         <>
           <div className="flex justify-between"><Dot /><Dot /></div>
           <div className="flex justify-between"><Dot /><Dot /></div>
           <div className="flex justify-between"><Dot /><Dot /></div>
         </>
       )}
    </div>
  );
};

const DominoPieceUI = ({ val1, val2, horizontal = false, isDouble = false, hidden = false, onClick, className = '' }: any) => {
  if (hidden) {
    return (
      <div 
        dir="ltr"
        className={`bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-indigo-500/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5),0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center rounded-[12px] md:rounded-[18px] overflow-hidden ${className}`}>
        <div className="opacity-30"><Grid2X2 className="w-6 h-6 text-indigo-200" /></div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      dir="ltr"
      className={`relative domino-piece bg-[#f4f1e1] shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_-4px_6px_rgba(0,0,0,0.2),inset_0_4px_6px_rgba(255,255,255,0.9)] border border-[#d6cfb3] rounded-[12px] md:rounded-[18px] flex overflow-hidden cursor-pointer select-none transition-transform ${horizontal ? 'flex-row' : 'flex-col'} ${className}`}
    >
      <div className="flex-1 relative w-full h-full">
        <DotGrid val={val1} />
      </div>
      <div className={`${horizontal ? 'w-[2px] h-[80%] my-auto' : 'w-[80%] h-[2px] mx-auto'} bg-gradient-to-br from-[#c1baa1] to-[#aba48a] shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)] shrink-0 rounded-full`} />
      <div className="flex-1 relative w-full h-full">
        <DotGrid val={val2} />
      </div>
    </div>
  );
};

function layoutBranch(
  branch: PlacedDomino[], 
  branchSide: 'left' | 'right',
  isDoubleRoot: boolean
) {
  let px = isDoubleRoot ? (branchSide === 'right' ? 30 : -30) : (branchSide === 'right' ? 60 : -60);
  let py = 0;
  let dx = branchSide === 'right' ? 1 : -1;
  let dy = 0;
  
  const results = [];
  const BOUND_X = 220;
  
  for (const dom of branch) {
    const isDouble = dom.piece.val1 === dom.piece.val2;
    const pieceLength = isDouble ? 60 : 120;
    
    let cx = px + (pieceLength / 2 + GAP) * dx;
    let cy = py + (pieceLength / 2 + GAP) * dy;
    
    let rot = 0;
    if (dx === 1) rot = 0;
    else if (dx === -1) rot = 180;
    else if (dy === 1) rot = 90;
    else if (dy === -1) rot = 270;
    
    if (isDouble) {
       rot = (rot + 90) % 360; 
    } else {
       if (dom.connectedVia !== dom.piece.val1) {
           rot = (rot + 180) % 360;
       }
    }
    
    let next_px = cx + (pieceLength / 2) * dx;
    let next_py = cy + (pieceLength / 2) * dy;
    let next_dx = dx;
    let next_dy = dy;
    
    if (!isDouble) {
        if (branchSide === 'right') {
            if (dx === 1 && next_px > BOUND_X) {
                next_dx = 0; next_dy = 1;
                next_px = cx + 30; next_py = cy + 30;
            } else if (dx === -1 && next_px < 60) {
                next_dx = 0; next_dy = 1;
                next_px = cx - 30; next_py = cy + 30;
            } else if (dy === 1) {
                next_dx = cx > 120 ? -1 : 1;
                next_dy = 0;
                next_px = cx + 30 * next_dx; 
                next_py = cy + 30;
            }
        } else {
            if (dx === -1 && next_px < -BOUND_X) {
                next_dx = 0; next_dy = -1;
                next_px = cx - 30; next_py = cy - 30;
            } else if (dx === 1 && next_px > -60) {
                next_dx = 0; next_dy = -1;
                next_px = cx + 30; next_py = cy - 30;
            } else if (dy === -1) {
                next_dx = cx < -120 ? 1 : -1;
                next_dy = 0;
                next_px = cx + 30 * next_dx;
                next_py = cy - 30;
            }
        }
    }
    
    results.push({
      id: dom.piece.id,
      piece: dom.piece,
      x: cx,
      y: cy,
      rotation: rot,
      isDouble
    });
    
    px = next_px;
    py = next_py;
    dx = next_dx;
    dy = next_dy;
  }
  
  return { tiles: results };
}

export default function DominoSolo() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  
  const [boneyard, setBoneyard] = useState<Domino[]>([]);
  const [playerHand, setPlayerHand] = useState<Domino[]>([]);
  const [botHand, setBotHand] = useState<Domino[]>([]);
  
  const [root, setRoot] = useState<Domino | null>(null);
  const [leftBranch, setLeftBranch] = useState<PlacedDomino[]>([]);
  const [rightBranch, setRightBranch] = useState<PlacedDomino[]>([]);
  
  const [turn, setTurn] = useState<'player' | 'bot'>('player');
  const [winner, setWinner] = useState<'player' | 'bot' | 'draw' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<Domino | null>(null);
  const [scoreEarned, setScoreEarned] = useState(0);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const getLeftEnd = () => {
    if (leftBranch.length > 0) return leftBranch[leftBranch.length - 1].freeEnd;
    if (root) return root.val1;
    return null;
  };

  const getRightEnd = () => {
    if (rightBranch.length > 0) return rightBranch[rightBranch.length - 1].freeEnd;
    if (root) return root.val2;
    return null;
  };

  const startGame = () => {
    const tiles = generateTiles();
    let pHand = tiles.slice(0, 7);
    let bHand = tiles.slice(7, 14);
    const bYard = tiles.slice(14);
    
    let maxDoubleVal = -1;
    let starter: 'player' | 'bot' | null = null;
    let startTile: Domino | null = null;
    
    const checkHand = (hand: Domino[], player: 'player' | 'bot') => {
      for (const t of hand) {
        if (t.val1 === t.val2 && t.val1 > maxDoubleVal) {
          maxDoubleVal = t.val1;
          starter = player;
          startTile = t;
        }
      }
    };
    checkHand(pHand, 'player');
    checkHand(bHand, 'bot');
    
    if (!starter) {
      let maxSum = -1;
      const checkSum = (hand: Domino[], player: 'player' | 'bot') => {
        for (const t of hand) {
          if (t.val1 + t.val2 > maxSum) {
             maxSum = t.val1 + t.val2;
             starter = player;
             startTile = t;
          }
        }
      }
      checkSum(pHand, 'player');
      checkSum(bHand, 'bot');
    }

    if (starter === 'player') {
       pHand = pHand.filter(t => t.id !== startTile!.id);
    } else {
       bHand = bHand.filter(t => t.id !== startTile!.id);
    }

    setPlayerHand(pHand);
    setBotHand(bHand);
    setBoneyard(bYard);
    
    setRoot(startTile!);
    setLeftBranch([]);
    setRightBranch([]);
    
    setGameState('playing');
    setTurn(starter === 'player' ? 'bot' : 'player');
    setWinner(null);
    setPendingChoice(null);
  };

  const playTileAudio = () => {
    if (!isMuted) audio.click(); 
  };

  const getPlayableEnds = (tile: Domino, currentLeft: number | null, currentRight: number | null) => {
    const ends = [];
    if (currentLeft !== null && (tile.val1 === currentLeft || tile.val2 === currentLeft)) ends.push('left');
    if (currentRight !== null && (tile.val1 === currentRight || tile.val2 === currentRight) && currentRight !== currentLeft) ends.push('right');
    if (currentRight !== null && (tile.val1 === currentRight || tile.val2 === currentRight) && currentRight === currentLeft) ends.push('right');
    return ends;
  };

  const hasPlayableTile = (hand: Domino[], curLeft: number | null, curRight: number | null) => {
    if (!root) return true;
    return hand.some(t => getPlayableEnds(t, curLeft, curRight).length > 0);
  };

  const handleTileClick = (tile: Domino) => {
    if (turn !== 'player' || gameState !== 'playing') return;
    
    const ends = getPlayableEnds(tile, getLeftEnd(), getRightEnd());
    if (ends.length === 0) return;
    
    if (ends.length === 1) {
      playTile(tile, ends[0] as 'left' | 'right', 'player');
    } else {
      setPendingChoice(tile);
    }
  };

  const playTile = (tile: Domino, end: 'left' | 'right', player: 'player' | 'bot') => {
    playTileAudio();

    if (end === 'left') {
      const currentEnd = getLeftEnd()!;
      const connectedVia = (tile.val1 === currentEnd) ? tile.val1 : tile.val2;
      const freeEnd = (tile.val1 === currentEnd) ? tile.val2 : tile.val1;
      setLeftBranch(prev => [...prev, { piece: tile, connectedVia, freeEnd }]);
    } else {
      const currentEnd = getRightEnd()!;
      const connectedVia = (tile.val1 === currentEnd) ? tile.val1 : tile.val2;
      const freeEnd = (tile.val1 === currentEnd) ? tile.val2 : tile.val1;
      setRightBranch(prev => [...prev, { piece: tile, connectedVia, freeEnd }]);
    }

    if (player === 'player') {
      const newHand = playerHand.filter(t => t.id !== tile.id);
      setPlayerHand(newHand);
      setPendingChoice(null);
      if (newHand.length === 0) {
        endGame('player', newHand, botHand);
        return;
      }
      setTurn('bot');
    } else {
      const newHand = botHand.filter(t => t.id !== tile.id);
      setBotHand(newHand);
      if (newHand.length === 0) {
        endGame('bot', playerHand, newHand);
        return;
      }
      setTurn('player');
    }
  };

  const drawTile = (player: 'player' | 'bot') => {
    if (boneyard.length === 0) return false;
    const drawn = boneyard[0];
    const newBoneyard = boneyard.slice(1);
    setBoneyard(newBoneyard);
    
    if (player === 'player') {
      setPlayerHand([...playerHand, drawn]);
    } else {
      setBotHand([...botHand, drawn]);
    }
    playTileAudio();
    return true;
  };

  const passTurn = (player: 'player' | 'bot') => {
    setTurn(player === 'player' ? 'bot' : 'player');
    setTimeout(() => checkBlocked(player === 'player' ? 'bot' : 'player'), 100);
  };

  const checkBlocked = (nextTurn: 'player' | 'bot') => {
    setBoneyard(currentBoneyard => {
      if (currentBoneyard.length > 0) return currentBoneyard;
      
      setPlayerHand(pHand => {
        setBotHand(bHand => {
          setLeftBranch(lBranch => {
            setRightBranch(rBranch => {
              const rootTile = root; // Will use external ref for root in this context if possible, but actually we will do a proper state access
              
              // We can't access root directly safely in this deep closure without passing it.
              return rBranch;
            });
            return lBranch;
          });
          return bHand;
        });
        return pHand;
      });
      return currentBoneyard;
    });
  };
  
  // Refined block check that runs after state settles
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // Check if the current player is blocked AND boneyard is empty
    if (boneyard.length === 0) {
       const activeHand = turn === 'player' ? playerHand : botHand;
       if (activeHand.length > 0 && !hasPlayableTile(activeHand, getLeftEnd(), getRightEnd())) {
          // Both blocked? Let's check the other hand too just to be sure.
          const otherHand = turn === 'player' ? botHand : playerHand;
          if (!hasPlayableTile(otherHand, getLeftEnd(), getRightEnd())) {
             endGame('draw', playerHand, botHand);
          } else {
             // Just pass turn
             passTurn(turn);
          }
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, playerHand, botHand, boneyard, leftBranch, rightBranch, gameState]);

  const handlePlayerDraw = () => {
    if (turn !== 'player' || gameState !== 'playing') return;
    if (hasPlayableTile(playerHand, getLeftEnd(), getRightEnd())) return;
    
    if (boneyard.length > 0) {
        drawTile('player');
    } else {
        passTurn('player');
    }
  };

  const getBotMove = (playable: Domino[]) => {
    if (difficulty === 'easy') {
      return playable[Math.floor(Math.random() * playable.length)];
    } else if (difficulty === 'medium') {
      return playable.sort((a, b) => (b.val1 + b.val2) - (a.val1 + a.val2))[0];
    } else {
      const doubles = playable.filter(t => t.val1 === t.val2);
      if (doubles.length > 0) {
        return doubles.sort((a, b) => (b.val1 + b.val2) - (a.val1 + a.val2))[0];
      }
      return playable.sort((a, b) => (b.val1 + b.val2) - (a.val1 + a.val2))[0];
    }
  };

  useEffect(() => {
    if (turn === 'bot' && gameState === 'playing') {
      const timer = setTimeout(() => {
        const lEnd = getLeftEnd();
        const rEnd = getRightEnd();
        
        const playable = botHand.filter(t => getPlayableEnds(t, lEnd, rEnd).length > 0);
        if (playable.length > 0) {
          const tile = getBotMove(playable);
          const ends = getPlayableEnds(tile, lEnd, rEnd);
          playTile(tile, ends[0] as 'left'|'right', 'bot');
        } else {
          if (boneyard.length > 0) {
            drawTile('bot');
          } else {
            passTurn('bot');
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, botHand, boneyard, gameState, leftBranch, rightBranch, root, difficulty]);

  const endGame = (winnerResult: 'player' | 'bot' | 'draw', pHand: Domino[], bHand: Domino[]) => {
    setGameState('results');
    
    let finalWinner = winnerResult;
    let score = 0;
    
    const pSum = pHand.reduce((acc, t) => acc + t.val1 + t.val2, 0);
    const bSum = bHand.reduce((acc, t) => acc + t.val1 + t.val2, 0);
    
    if (finalWinner === 'draw') {
       if (pSum < bSum) finalWinner = 'player';
       else if (bSum < pSum) finalWinner = 'bot';
    }
    
    setWinner(finalWinner);
    
    if (finalWinner === 'player') {
       score = bSum;
       if (score === 0) score = 10; 
       setScoreEarned(score);
       if (!isMuted) audio.win();
       updateStats(true, score);
    } else if (finalWinner === 'bot') {
       score = pSum;
       if (score === 0) score = 10;
       setScoreEarned(0);
       if (!isMuted) audio.wrong();
       updateStats(false, score);
    } else {
       setScoreEarned(0);
       updateStats(false, 0);
    }
  };

  const updateStats = (isWin: boolean, score: number) => {
    const pId = storage.getPlayerId();
    const pName = storage.getPlayerName() || 'لاعب مجهول';
    supabaseService.updatePlayerStats(pId, pName, isWin, 0, 0, score, '🎲 دومينو');
  };

  const visualTiles: VisualTile[] = [];
  if (root) {
    const isDouble = root.val1 === root.val2;
    visualTiles.push({
      id: root.id,
      piece: root,
      x: 0,
      y: 0,
      rotation: isDouble ? 90 : 0,
      isDouble,
      type: 'root',
      isEnd: leftBranch.length === 0 && rightBranch.length === 0
    });
    
    const leftRes = layoutBranch(leftBranch, 'left', isDouble);
    const rightRes = layoutBranch(rightBranch, 'right', isDouble);
    
    visualTiles.push(...leftRes.tiles.map((t, idx) => ({
      ...t,
      type: 'left',
      isEnd: idx === leftBranch.length - 1
    } as VisualTile)));
    
    visualTiles.push(...rightRes.tiles.map((t, idx) => ({
      ...t,
      type: 'right',
      isEnd: idx === rightBranch.length - 1
    } as VisualTile)));
  }

  useEffect(() => {
    if (visualTiles.length === 0 || !boardRef.current) return;
    
    const updateScale = () => {
      const padding = 120;
      const minX = Math.min(...visualTiles.map(t => t.x - 80));
      const maxX = Math.max(...visualTiles.map(t => t.x + 80));
      const minY = Math.min(...visualTiles.map(t => t.y - 80));
      const maxY = Math.max(...visualTiles.map(t => t.y + 80));
      
      const width = Math.max(maxX - minX + padding * 2, 400); 
      const height = Math.max(maxY - minY + padding * 2, 400);
      
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      
      if (boardRef.current) {
        const parentWidth = boardRef.current.clientWidth;
        const parentHeight = boardRef.current.clientHeight;
        
        const scaleX = parentWidth / width;
        const scaleY = parentHeight / height;
        let newScale = Math.min(1.0, Math.max(0.15, Math.min(scaleX, scaleY))); 
        
        if (window.innerWidth < 768) {
           newScale = Math.min(1.2, Math.max(0.25, Math.min(scaleX, scaleY)));
        }
        
        setScale(newScale);
        setOffset({ x: cx, y: cy });
      }
    };
    
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(boardRef.current);
    updateScale();
    
    return () => resizeObserver.disconnect();
  }, [visualTiles.length]);

  let canPlayerPlay = false;
  let canPlayerPlayAnyEnd = false;
  if (gameState === 'playing' && turn === 'player') {
    canPlayerPlay = hasPlayableTile(playerHand, getLeftEnd(), getRightEnd());
    if (pendingChoice) {
       canPlayerPlayAnyEnd = getPlayableEnds(pendingChoice, getLeftEnd(), getRightEnd()).length > 0;
    }
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col pt-12 items-center p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
        <div className="absolute -left-32 top-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 md:top-6 right-4 md:right-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900 rounded-xl px-4 py-2 z-10 border border-slate-700 shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
          <span className="hidden sm:inline">العودة للرئيسية</span>
        </button>
        
        <div className="relative z-10 flex flex-col items-center mt-8">
            <div className="bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center mb-6 md:mb-8 shadow-inner border border-emerald-500/20 relative">
               <div className="absolute inset-0 bg-emerald-400/20 rounded-3xl blur-md"></div>
               <Grid2X2 className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 drop-shadow-md relative z-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-2 md:mb-4 tracking-wide drop-shadow-md text-center">لعبة الدومينو</h1>
            <p className="text-slate-400 mb-10 text-center max-w-sm px-4 md:text-lg">ضع استراتيجيتك واهزم الذكاء الاصطناعي في هذه اللعبة الكلاسيكية المحسنة.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 transition-all hover:border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <Settings2 className="w-5 h-5 text-indigo-400" />
             اختر مستوى الصعوبة
          </h2>
          
          <div className="space-y-4 mb-8">
             <button
                onClick={() => setDifficulty('easy')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${difficulty === 'easy' ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'}`}
             >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${difficulty === 'easy' ? 'bg-sky-500/20' : 'bg-slate-800'}`}>
                      <BrainCircuit className="w-5 h-5" />
                   </div>
                   <span className="font-bold text-lg">سهل</span>
                </div>
                <span className="text-xs font-bold opacity-60">تدريب</span>
             </button>
             <button
                onClick={() => setDifficulty('medium')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${difficulty === 'medium' ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'}`}
             >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${difficulty === 'medium' ? 'bg-orange-500/20' : 'bg-slate-800'}`}>
                      <BrainCircuit className="w-5 h-5" />
                   </div>
                   <span className="font-bold text-lg">متوسط</span>
                </div>
                <span className="text-xs font-bold opacity-60">طبيعي</span>
             </button>
             <button
                onClick={() => setDifficulty('hard')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${difficulty === 'hard' ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(243,64,121,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'}`}
             >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${difficulty === 'hard' ? 'bg-rose-500/20' : 'bg-slate-800'}`}>
                      <BrainCircuit className="w-5 h-5" />
                   </div>
                   <span className="font-bold text-lg">صعب</span>
                </div>
                <span className="text-xs font-bold opacity-60">تحدي</span>
             </button>
          </div>

          <button 
             onClick={startGame}
             className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex justify-center items-center gap-2 active:scale-95 text-lg border border-emerald-400/20"
          >
             <Play className="w-6 h-6" />
             إبدأ اللعب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-800 p-3 shrink-0 z-20 shadow-md relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setGameState('setup')}
              className="p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <Grid2X2 className="w-4 h-4 text-emerald-400" />
              <h1 className="text-lg font-bold font-heading text-white hidden sm:block">الدومينو</h1>
            </div>
            <span className={`text-xs px-2 py-1 rounded-md hidden sm:block font-bold
               ${difficulty === 'easy' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 
                 difficulty === 'medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}
            >
              {difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 relative">
             <div className="bg-slate-950 border border-slate-800 px-3 md:px-4 py-2 rounded-xl text-sm font-bold flex gap-2 md:gap-4 shadow-inner items-center">
                <span className="text-slate-400 hidden sm:inline">أحجار السحب:</span>
                <span className="text-emerald-400 text-lg">{boneyard.length}</span>
             </div>
             <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 border border-slate-700 transition"
             >
                {isMuted ? <VolumeX className="w-5 h-5 text-slate-400"/> : <Volume2 className="w-5 h-5 text-indigo-400"/>}
             </button>
             
             <div className="relative">
               <button
                 onClick={() => setIsMenuOpen(!isMenuOpen)}
                 className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 border border-slate-700 transition"
               >
                 <Settings2 className="w-5 h-5 text-slate-300" />
               </button>
               {isMenuOpen && (
                 <div className="absolute left-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 flex flex-col gap-1">
                   <button onClick={() => { setIsMenuOpen(false); startGame(); }} className="px-4 py-2 text-right hover:bg-slate-700 w-full text-slate-200">إعادة اللعب</button>
                   <button onClick={() => { setIsMenuOpen(false); setGameState('setup'); }} className="px-4 py-2 text-right hover:bg-slate-700 w-full text-slate-200">تغيير الطور</button>
                   <button onClick={() => { setIsMenuOpen(false); navigate('/'); }} className="px-4 py-2 text-right hover:bg-slate-700 w-full text-slate-200">العودة للرئيسية</button>
                 </div>
               )}
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full min-h-0 bg-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {gameState === 'playing' ? (
          <>
            <div className="shrink-0 p-3 md:p-4 flex flex-col items-center justify-start h-[90px] md:h-[120px] bg-slate-900 border-b border-slate-800 relative shadow-xl z-20">
               <div className="absolute inset-0 bg-slate-950/20 pointer-events-none mix-blend-overlay"></div>
               <div className="text-xs md:text-sm font-bold text-slate-400 mb-2 flex items-center gap-2 bg-slate-800/80 px-4 py-1 rounded-full border border-slate-700 shadow-inner">
                 <BrainCircuit className="w-4 h-4" /> 
                 الخصم: <span className="text-white">{botHand.length}</span> أحجار
               </div>
               <div className="flex gap-1.5 md:gap-2 overflow-x-auto max-w-full px-4 custom-scrollbar pb-2 items-center">
                 {botHand.map((t, i) => (
                   <DominoPieceUI key={i} hidden horizontal={false} className="w-8 h-[45px] md:w-10 md:h-[60px]" />
                 ))}
               </div>
            </div>

            <div className="flex-1 min-h-0 relative bg-[#0f4d36] overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] z-0">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#146647] via-[#0f4d36] to-[#0a3122] z-0 pointer-events-none"></div>
               <div className="absolute inset-0 opacity-20 pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
               <div className="absolute inset-0 bg-black/20 mix-blend-overlay pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 2px, transparent 2px)', backgroundSize: '48px 48px' }}></div>
               
               <div ref={boardRef} className="absolute inset-0 overflow-hidden flex items-center justify-center">
                  <div 
                     className="relative transition-transform duration-700 ease-out z-10"
                     style={{ 
                        transform: `scale(${scale}) translate(${-offset.x}px, ${-offset.y}px)`,
                        width: 0, height: 0
                     }}
                  >
                     {visualTiles.map(vt => {
                        const isLeftEndNode = vt.type === 'left' && vt.isEnd;
                        const isRightEndNode = vt.type === 'right' && vt.isEnd;
                        const isRootEndL = vt.type === 'root' && leftBranch.length === 0;
                        const isRootEndR = vt.type === 'root' && rightBranch.length === 0;
                        
                        let hasHighlight = false;
                        if (pendingChoice && turn === 'player') {
                           const playableOnLeft = getPlayableEnds(pendingChoice, getLeftEnd(), getRightEnd()).includes('left');
                           const playableOnRight = getPlayableEnds(pendingChoice, getLeftEnd(), getRightEnd()).includes('right');
                           
                           if ((isLeftEndNode || isRootEndL) && playableOnLeft) hasHighlight = true;
                           if ((isRightEndNode || isRootEndR) && playableOnRight) hasHighlight = true;
                        }
                     
                        return (
                        <div 
                          key={vt.id} 
                          className={`absolute drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] ${hasHighlight ? 'z-30' : 'z-10'}`}
                          style={{
                            left: '50%',
                            top: '50%',
                            width: BOARD_L,
                            height: BOARD_W,
                            transform: `translate(-50%, -50%) translate(${vt.x}px, ${vt.y}px) rotate(${vt.rotation}deg)`,
                            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }}
                        >
                           <DominoPieceUI 
                              val1={vt.piece.val1} 
                              val2={vt.piece.val2} 
                              horizontal={true} 
                              className={`w-full h-full opacity-[0.98] ${hasHighlight ? 'ring-[6px] ring-emerald-400 ring-offset-4 ring-offset-emerald-950 animate-pulse shadow-[0_0_30px_rgba(52,211,153,0.8)]' : ''}`}
                           />
                        </div>
                     )})}
                  </div>
               </div>
               
               {pendingChoice && (
                 <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
                    <p className="text-xl md:text-3xl font-bold mb-8 text-center text-white drop-shadow-lg tracking-wide">أين تريد وضع الحجر؟</p>
                    <div className="drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)] mb-12">
                      <DominoPieceUI horizontal={false} val1={pendingChoice.val1} val2={pendingChoice.val2} className="w-20 h-40 md:w-28 md:h-56 shadow-2xl border-[3px]" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                       {canPlayerPlayAnyEnd && getPlayableEnds(pendingChoice, getLeftEnd(), getRightEnd()).includes('right') && (
                       <button onClick={() => playTile(pendingChoice, 'right', 'player')} className="flex-1 py-5 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center gap-2 border border-indigo-400/20 text-lg">
                         <span>جهة اليمين</span>
                         <span className="bg-indigo-900/50 px-3 py-1 rounded-lg text-sm">يقابل ({getRightEnd()})</span>
                       </button>
                       )}
                       {canPlayerPlayAnyEnd && getPlayableEnds(pendingChoice, getLeftEnd(), getRightEnd()).includes('left') && (
                       <button onClick={() => playTile(pendingChoice, 'left', 'player')} className="flex-1 py-5 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center gap-2 border border-indigo-400/20 text-lg">
                         <span>جهة اليسار</span>
                         <span className="bg-indigo-900/50 px-3 py-1 rounded-lg text-sm">يقابل ({getLeftEnd()})</span>
                       </button>
                       )}
                    </div>
                    <button onClick={() => setPendingChoice(null)} className="mt-8 px-8 py-4 w-full max-w-md border-2 border-slate-600 rounded-2xl font-bold hover:bg-slate-800 text-slate-300 transition text-lg shadow-md">إلغاء الرجوع لليد</button>
                 </div>
               )}
            </div>

            <div className="shrink-0 flex justify-center py-2 relative z-20 pointers-events-none h-14 md:h-16 bg-slate-900 border-t border-slate-800 border-b shadow-xl">
                {turn === 'player' && !canPlayerPlay && !pendingChoice && (
                   <button 
                     onClick={handlePlayerDraw}
                     className="bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)] px-10 py-2 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 text-white flex items-center gap-2 border border-emerald-400/30 text-lg"
                   >
                     {boneyard.length > 0 ? (
                       <>سحب حجر خفي <Grid2X2 className="w-5 h-5"/></>
                     ) : (
                       <>تمرير الدور <ChevronRight className="w-5 h-5"/></>
                     )}
                   </button>
                )}
                {turn === 'bot' && (
                   <div className="px-6 py-2 bg-slate-950 border border-slate-800 rounded-full font-bold text-slate-400 flex items-center gap-3 shadow-inner">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      الخصم يفكر في الحركة...
                   </div>
                )}
            </div>

            <div className="shrink-0 bg-slate-900 p-4 h-[150px] md:h-[200px] flex items-center overflow-x-auto overflow-y-hidden custom-scrollbar shadow-[0_-15px_40px_rgba(0,0,0,0.6)] z-20 w-full">
               <div className="flex gap-3 md:gap-5 mx-auto min-w-max pb-4 px-4 h-full items-center justify-center">
                 {playerHand.map((t) => {
                   const playable = turn === 'player' && getPlayableEnds(t, getLeftEnd(), getRightEnd()).length > 0;
                   return (
                     <div key={t.id} className="relative transition-transform hover:z-30 group h-full flex items-center">
                       <DominoPieceUI 
                         val1={t.val1} 
                         val2={t.val2} 
                         onClick={() => handleTileClick(t)} 
                         horizontal={false}
                         className={`w-[60px] h-[120px] md:w-[70px] md:h-[140px] transition-all duration-300 ${turn === 'bot' ? 'opacity-60 scale-90 grayscale-[0.5]' : playable ? 'ring-[3px] ring-emerald-400 ring-offset-4 ring-offset-slate-900 -translate-y-4 hover:-translate-y-8 shadow-[0_20px_40px_rgba(52,211,153,0.3)] hover:shadow-[0_30px_50px_rgba(52,211,153,0.5)] z-40' : 'opacity-80 scale-95 hover:-translate-y-2'}`}
                       />
                     </div>
                   );
                 })}
               </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-40 overflow-y-auto w-full flex items-center justify-center p-4">
             <div className="bg-slate-900/90 p-5 md:p-6 rounded-3xl border border-slate-700 text-center max-w-sm w-full mx-auto flex flex-col items-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                <div className={`absolute -left-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${winner === 'player' ? 'bg-emerald-500/10' : winner === 'bot' ? 'bg-rose-500/10' : 'bg-slate-400/10'}`}></div>

                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-4 shadow-xl relative z-10 border-2 ${winner === 'player' ? 'bg-emerald-500/20 border-emerald-500/40' : winner === 'bot' ? 'bg-rose-500/20 border-rose-500/40' : 'bg-slate-800 border-slate-600'}`}>
                  {winner === 'player' && <Trophy className="w-8 h-8 md:w-10 md:h-10 text-emerald-400 animate-bounce" />}
                  {winner === 'bot' && <Target className="w-8 h-8 md:w-10 md:h-10 text-rose-400" />}
                  {winner === 'draw' && <Grid2X2 className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />}
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold mb-1 text-white relative z-10">
                   {winner === 'player' ? 'أنت الفائز!' : winner === 'bot' ? 'لقد خسرت!' : 'انسداد (تعادل)'}
                </h2>
                {winner === 'draw' && <p className="text-amber-400 mb-3 text-xs md:text-sm font-bold relative z-10">تم الإغلاق - الأقل نقاطاً يفوز</p>}
                {winner !== 'draw' && <div className="mb-3"></div>}

                <div className="bg-slate-950/50 border border-slate-800/80 w-full p-4 rounded-2xl mt-4 mb-6 text-white grid grid-cols-2 gap-4 relative z-10">
                   <div className="bg-slate-800/80 rounded-xl p-3 text-center border-b-2 border-emerald-500/50 flex flex-col justify-center items-center">
                      <p className="text-slate-400 text-xs mb-1">النقاط المكتسبة</p>
                      <p className={`text-2xl font-bold font-mono ${winner === 'player' ? 'text-emerald-300' : 'text-slate-300'}`}>{winner === 'player' ? `+${scoreEarned}` : 0}</p>
                   </div>
                   <div className="bg-slate-800/80 rounded-xl p-3 text-center border-b-2 border-slate-500/50 flex flex-col justify-center items-center">
                      <p className="text-slate-400 text-xs mb-1">أحجارك المتبقية</p>
                      <p className="text-2xl font-bold font-mono text-slate-300">{playerHand.length}</p>
                   </div>
                </div>

                <div className="flex flex-col gap-3 w-full relative z-10">
                  <button
                    onClick={startGame}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 md:py-4 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-lg text-lg border border-emerald-500/20"
                  >
                    <RotateCcw className="w-5 h-5" />
                    جولة جديدة ({difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'})
                  </button>
                  
                  <button
                    onClick={() => setGameState('setup')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 md:py-4 rounded-xl transition-all duration-300 active:scale-95 border border-slate-700 flex items-center justify-center gap-2 shadow-sm text-lg"
                  >
                    <Settings2 className="w-5 h-5" />
                    تغيير الطور / الإعدادات
                  </button>

                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-4 md:py-4 rounded-xl transition-all duration-300 active:scale-95 border border-slate-700/50 flex items-center justify-center gap-2 shadow-sm text-lg"
                  >
                    <HomeIcon className="w-5 h-5" />
                    العودة للرئيسية
                  </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
