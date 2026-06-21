import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../components/GameContext';
import { ChevronRight, Home as HomeIcon, RotateCcw, Volume2, VolumeX, Grid2X2, Trophy, Target, Settings2, Play } from 'lucide-react';
import { audio } from '../lib/audio';
import { storage } from '../lib/storage';

const BOARD_L = 120;
const BOARD_W = 60;
const GAP = 2;

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
  branch: any[], 
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

export default function DominoRoom() {
  const { state, playerId, isHost, sendDominoAction, requestRematch, returnToLobby, leaveRoom } = useGame();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<any | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  if (!state || !state.dominoState) return null;

  const hasDisconnectedOpponent = state.status === 'finished' && Object.keys(state.players).length < 2;

  const ds = state.dominoState;
  
  const [statsSaved, setStatsSaved] = useState(false);

  useEffect(() => {
    if (ds?.winnerId && !statsSaved) {
       import('../services/supabaseService').then(({ supabaseService }) => {
           const isWin = ds.winnerId === playerId;
           const pName = storage.getPlayerName() || 'أنت';
           let pScore = 0;
           if (ds.pointsMatch) pScore = ds.pointsMatch[playerId] || 10;
           supabaseService.updatePlayerStats(storage.getPlayerId(), pName, isWin, 0, 0, pScore, '🎲 الدومينو');
       });
       setStatsSaved(true);
    }
  }, [ds?.winnerId, statsSaved, playerId]);

  if (hasDisconnectedOpponent && !ds.winnerId) {
     ds.winnerId = playerId;
  }

  const isMyTurn = ds.turnId === playerId;
  
  const opponentId = Object.keys(state.players).find(id => id !== playerId) || ds.player2Id;
  const opponent = state.players[opponentId];
  
  const myTiles = ds.player1Id === playerId ? ds.player1Tiles : ds.player2Tiles;
  const opponentTilesLength = ds.player1Id === playerId ? ds.player2Tiles.length : ds.player1Tiles.length;
  
  const boneyard = ds.boneyard;
  const board = ds.board;
  
  const root = board.find((t: any) => t.type === 'root');
  const leftBranch = board.filter((t: any) => t.type === 'left');
  const rightBranch = board.filter((t: any) => t.type === 'right');

  const getLeftEnd = () => {
    if (leftBranch.length > 0) return leftBranch[leftBranch.length - 1].freeEnd;
    if (root) return root.freeEnd;
    return null;
  };

  const getRightEnd = () => {
    if (rightBranch.length > 0) return rightBranch[rightBranch.length - 1].freeEnd;
    if (root) return root.connectedVia; // For root, connectedVia is val1, freeEnd is val1
    return null;
  };

  const getPlayableEnds = (tile: any, currentLeft: number | null, currentRight: number | null) => {
    const ends = [];
    if (currentLeft !== null && (tile.val1 === currentLeft || tile.val2 === currentLeft)) ends.push('left');
    if (currentRight !== null && (tile.val1 === currentRight || tile.val2 === currentRight) && currentRight !== currentLeft) ends.push('right');
    if (currentRight !== null && (tile.val1 === currentRight || tile.val2 === currentRight) && currentRight === currentLeft) ends.push('right');
    return ends;
  };

  const hasPlayableTile = (hand: any[], curLeft: number | null, curRight: number | null) => {
    if (!root) return true;
    return hand.some(t => getPlayableEnds(t, curLeft, curRight).length > 0);
  };

  const checkEndGame = (newBoard: any[], newP1Tiles: any[], newP2Tiles: any[], newPassCount: number) => {
    let winnerId = null;
    let isBlocked = false;
    
    if (newP1Tiles.length === 0) winnerId = ds.player1Id;
    else if (newP2Tiles.length === 0) winnerId = ds.player2Id;
    else if (newPassCount >= 2 && boneyard.length === 0) {
      isBlocked = true;
      const p1Sum = newP1Tiles.reduce((acc, t) => acc + t.val1 + t.val2, 0);
      const p2Sum = newP2Tiles.reduce((acc, t) => acc + t.val1 + t.val2, 0);
      
      if (p1Sum < p2Sum) winnerId = ds.player1Id;
      else if (p2Sum < p1Sum) winnerId = ds.player2Id;
      else winnerId = 'draw';
    }
    
    if (winnerId) {
      const p1Sum = newP1Tiles.reduce((acc, t) => acc + t.val1 + t.val2, 0);
      const p2Sum = newP2Tiles.reduce((acc, t) => acc + t.val1 + t.val2, 0);
      
      let pointsMatch = { ...ds.pointsMatch };
      if (winnerId === ds.player1Id) pointsMatch[ds.player1Id] += (p2Sum || 10);
      if (winnerId === ds.player2Id) pointsMatch[ds.player2Id] += (p1Sum || 10);
      
      return { winnerId, isBlocked, pointsMatch };
    }
    
    return null;
  };

  const playTile = (tile: any, end: 'left' | 'right') => {
    if (!isMyTurn) return;
    if (!isMuted) audio.click();
    
    const currentEnd = end === 'left' ? getLeftEnd()! : getRightEnd()!;
    const connectedVia = (tile.val1 === currentEnd) ? tile.val1 : tile.val2;
    const freeEnd = (tile.val1 === currentEnd) ? tile.val2 : tile.val1;
    
    const newBoard = [...board, { piece: tile, connectedVia, freeEnd, type: end }];
    
    let newMyTiles = myTiles.filter((t: any) => t.id !== tile.id);
    let newP1Tiles = ds.player1Id === playerId ? newMyTiles : ds.player1Tiles;
    let newP2Tiles = ds.player2Id === playerId ? newMyTiles : ds.player2Tiles;
    
    const endResult = checkEndGame(newBoard, newP1Tiles, newP2Tiles, 0);
    
    setPendingChoice(null);
    sendDominoAction({
      board: newBoard,
      player1Tiles: newP1Tiles,
      player2Tiles: newP2Tiles,
      passCount: 0,
      turnId: endResult ? null : opponentId,
      winnerId: endResult?.winnerId,
      isBlocked: endResult?.isBlocked,
      pointsMatch: endResult?.pointsMatch || ds.pointsMatch
    });
  };

  const handleTileClick = (tile: any) => {
    if (!isMyTurn || state.dominoState?.winnerId) return;
    
    const ends = getPlayableEnds(tile, getLeftEnd(), getRightEnd());
    if (ends.length === 0) return;
    
    if (ends.length === 1) {
      playTile(tile, ends[0] as 'left' | 'right');
    } else {
      setPendingChoice(tile);
    }
  };

  const drawTile = () => {
    if (!isMyTurn || boneyard.length === 0) return;
    if (!isMuted) audio.click();
    
    const drawn = boneyard[0];
    const newBoneyard = boneyard.slice(1);
    
    let newMyTiles = [...myTiles, drawn];
    let newP1Tiles = ds.player1Id === playerId ? newMyTiles : ds.player1Tiles;
    let newP2Tiles = ds.player2Id === playerId ? newMyTiles : ds.player2Tiles;
    
    sendDominoAction({
      boneyard: newBoneyard,
      player1Tiles: newP1Tiles,
      player2Tiles: newP2Tiles
    });
  };

  const passTurn = () => {
    if (!isMyTurn) return;
    if (!isMuted) audio.click();
    
    const newPassCount = ds.passCount + 1;
    const endResult = checkEndGame(board, ds.player1Tiles, ds.player2Tiles, newPassCount);
    
    sendDominoAction({
      turnId: endResult ? null : opponentId,
      passCount: newPassCount,
      winnerId: endResult?.winnerId,
      isBlocked: endResult?.isBlocked,
      pointsMatch: endResult?.pointsMatch || ds.pointsMatch
    });
  };

  // UI Render Layer
  const visualTiles: any[] = [];
  if (root) {
    const isDouble = root.piece.val1 === root.piece.val2;
    visualTiles.push({
      id: root.piece.id,
      piece: root.piece,
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
    })));
    
    visualTiles.push(...rightRes.tiles.map((t, idx) => ({
      ...t,
      type: 'right',
      isEnd: idx === rightBranch.length - 1
    })));
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
  if (!ds.winnerId && isMyTurn) {
    canPlayerPlay = hasPlayableTile(myTiles, getLeftEnd(), getRightEnd());
    if (pendingChoice) {
       canPlayerPlayAnyEnd = getPlayableEnds(pendingChoice, getLeftEnd(), getRightEnd()).length > 0;
    }
  }

  return (
    <div className="flex-1 flex flex-col relative w-full h-[600px] lg:h-[calc(100vh-160px)] rounded-3xl overflow-hidden shadow-2xl bg-slate-950/20 backdrop-blur-sm border border-slate-700/50">
      <div className="shrink-0 p-3 md:p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800 shadow-xl z-20">
         <div className="flex items-center gap-3">
           <div className="text-sm font-bold text-slate-400 flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700 shadow-inner">
             <span>الخصم ({opponent?.username}):</span> <span className="text-white">{opponentTilesLength}</span> أحجار
           </div>
         </div>
         <div className="flex items-center gap-4 relative">
           {boneyard.length > 0 && (
             <div className="text-sm font-bold text-slate-400 flex items-center gap-2">
               أحجار السحب: <span className="text-emerald-400">{boneyard.length}</span>
             </div>
           )}
           <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 border border-slate-700 transition"
           >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400"/> : <Volume2 className="w-4 h-4 text-indigo-400"/>}
           </button>
           
           <div className="relative">
             <button
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 border border-slate-700 transition"
             >
               <Settings2 className="w-4 h-4 text-slate-300" />
             </button>
             {isMenuOpen && (
               <div className="absolute left-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 flex flex-col gap-1">
                 <button onClick={() => { setIsMenuOpen(false); requestRematch(); }} className="px-4 py-2 text-right hover:bg-slate-700 w-full text-slate-200">إعادة اللعب</button>
                 {isHost && <button onClick={() => { setIsMenuOpen(false); returnToLobby(); }} className="px-4 py-2 text-right hover:bg-slate-700 w-full text-slate-200">تغيير الطور</button>}
                 <button onClick={() => { setIsMenuOpen(false); leaveRoom(); navigate('/'); }} className="px-4 py-2 text-right hover:bg-slate-700 w-full text-rose-400">مغادرة الغرفة</button>
                 <button onClick={() => { setIsMenuOpen(false); navigate('/'); }} className="px-4 py-2 text-right hover:bg-slate-700 w-full text-slate-200">العودة للرئيسية</button>
               </div>
             )}
           </div>
         </div>
      </div>

      <div className="flex-1 min-h-0 relative bg-[#0f4d36] overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] z-0">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#146647] via-[#0f4d36] to-[#0a3122] z-0 pointer-events-none"></div>
         
         <div ref={boardRef} className="absolute inset-0 overflow-hidden flex items-center justify-center">
            <div 
               className="relative transition-transform duration-700 ease-out z-10"
               style={{ 
                  transform: `scale(${scale}) translate(${-offset.x}px, ${-offset.y}px)`,
                  width: 0, height: 0
               }}
            >
               {visualTiles.map((vt: any) => {
                  const isLeftEndNode = vt.type === 'left' && vt.isEnd;
                  const isRightEndNode = vt.type === 'right' && vt.isEnd;
                  const isRootEndL = vt.type === 'root' && leftBranch.length === 0;
                  const isRootEndR = vt.type === 'root' && rightBranch.length === 0;
                  
                  let hasHighlight = false;
                  if (pendingChoice && isMyTurn) {
                     const playableOnLeft = getPlayableEnds(pendingChoice, getLeftEnd(), getRightEnd()).includes('left');
                     const playableOnRight = getPlayableEnds(pendingChoice, getLeftEnd(), getRightEnd()).includes('right');
                     
                     if ((isLeftEndNode || isRootEndL) && playableOnLeft) hasHighlight = true;
                     if ((isRightEndNode || isRootEndR) && playableOnRight) hasHighlight = true;
                  }
               
                  return (
                  <div 
                    key={vt.id} 
                    className={`absolute drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] ${hasHighlight ? 'z-30' : 'z-10'}`}
                    style={{
                      left: '50%',
                      top: '50%',
                      width: BOARD_L,
                      height: BOARD_W,
                      transform: `translate(-50%, -50%) translate(${vt.x}px, ${vt.y}px) rotate(${vt.rotation}deg)`,
                      transition: 'all 0.6s ease'
                    }}
                  >
                     <DominoPieceUI 
                        val1={vt.piece.val1} 
                        val2={vt.piece.val2} 
                        horizontal={true} 
                        className={`w-full h-full opacity-[0.98] ${hasHighlight ? 'ring-[4px] ring-emerald-400 ring-offset-2 ring-offset-emerald-950 animate-pulse' : ''}`}
                     />
                  </div>
               )})}
            </div>
         </div>
         
         {pendingChoice && (
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
              <p className="text-xl md:text-2xl font-bold mb-6 text-center text-white">أين تريد وضع الحجر؟</p>
              <div className="mb-8">
                <DominoPieceUI horizontal={false} val1={pendingChoice.val1} val2={pendingChoice.val2} className="w-16 h-32 md:w-20 md:h-40 shadow-2xl" />
              </div>
              
              <div className="flex gap-4 w-full max-w-sm">
                 {canPlayerPlayAnyEnd && getPlayableEnds(pendingChoice, getLeftEnd(), getRightEnd()).includes('right') && (
                 <button onClick={() => playTile(pendingChoice, 'right')} className="flex-1 py-4 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 text-white shadow-lg flex flex-col items-center">
                   <span>يمين</span>
                   <span className="text-xs opacity-70">يقابل ({getRightEnd()})</span>
                 </button>
                 )}
                 {canPlayerPlayAnyEnd && getPlayableEnds(pendingChoice, getLeftEnd(), getRightEnd()).includes('left') && (
                 <button onClick={() => playTile(pendingChoice, 'left')} className="flex-1 py-4 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 text-white shadow-lg flex flex-col items-center">
                   <span>يسار</span>
                   <span className="text-xs opacity-70">يقابل ({getLeftEnd()})</span>
                 </button>
                 )}
              </div>
              <button onClick={() => setPendingChoice(null)} className="mt-6 px-6 py-3 w-full max-w-sm border-2 border-slate-600 rounded-xl font-bold hover:bg-slate-800 text-slate-300">إلغاء</button>
           </div>
         )}
         
         {ds.winnerId && (
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900/90 p-5 md:p-6 rounded-3xl border border-slate-700 text-center w-full max-w-sm shadow-2xl backdrop-blur-xl">
                 <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-xl border-2 ${ds.winnerId === playerId ? 'bg-emerald-500/20 border-emerald-500/40' : ds.winnerId === 'draw' ? 'bg-slate-800 border-slate-600' : 'bg-rose-500/20 border-rose-500/40'}`}>
                   {ds.winnerId === playerId && <Trophy className="w-8 h-8 md:w-10 md:h-10 text-emerald-400 animate-bounce" />}
                   {ds.winnerId !== playerId && ds.winnerId !== 'draw' && <Target className="w-8 h-8 md:w-10 md:h-10 text-rose-400" />}
                   {ds.winnerId === 'draw' && <Grid2X2 className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />}
                 </div>
                 
                 <h2 className="text-2xl md:text-3xl font-bold mb-1 text-white">
                    {hasDisconnectedOpponent ? 'انسحاب الخصم!' : ds.winnerId === playerId ? 'لقد فزت!' : ds.winnerId === 'draw' ? 'تعادل (انسداد)' : 'هاردلك!'}
                 </h2>
                 {ds.isBlocked && <p className="text-amber-400 mb-3 text-xs md:text-sm font-bold">تم الإغلاق - الأقل نقاطاً يفوز</p>}
                 {hasDisconnectedOpponent && <p className="text-emerald-400 mb-3 text-xs md:text-sm font-bold">فزت بسبب انسحاب الخصم</p>}
                 {!ds.isBlocked && !hasDisconnectedOpponent && <div className="mb-3"></div>}
                 
                 <div className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-2xl mt-4 mb-6 text-white grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/80 rounded-xl p-2 md:p-3 text-center border-b-2 border-emerald-500/50 flex flex-col items-center justify-center">
                       <p className="text-slate-400 text-[10px] md:text-xs mb-1">النقاط (أنت)</p>
                       <p className="text-xl md:text-2xl font-bold font-mono text-emerald-300">{ds.pointsMatch?.[playerId] || 0}</p>
                    </div>
                    <div className="bg-slate-800/80 rounded-xl p-2 md:p-3 text-center border-b-2 border-rose-500/50 flex flex-col items-center justify-center">
                       <p className="text-slate-400 text-[10px] md:text-xs mb-1">النقاط ({opponent?.username})</p>
                       <p className="text-xl md:text-2xl font-bold font-mono text-rose-300">{ds.pointsMatch?.[opponentId] || 0}</p>
                    </div>
                 </div>

                 <div className="flex flex-col gap-2.5">
                    {isHost ? (
                      <>
                        <button onClick={requestRematch} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 md:py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 text-sm md:text-base">
                          <RotateCcw className="w-4 h-4 md:w-5 md:h-5" /> إعادة اللعب
                        </button>
                        <button onClick={returnToLobby} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 md:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm md:text-base">
                          <Settings2 className="w-4 h-4 md:w-5 md:h-5" /> تغيير الطور
                        </button>
                        <button onClick={returnToLobby} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 md:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm md:text-base">
                          <Grid2X2 className="w-4 h-4 md:w-5 md:h-5" /> العودة إلى الغرفة
                        </button>
                        <button onClick={() => { leaveRoom(); navigate('/'); }} className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-3 md:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm md:text-base">
                          <HomeIcon className="w-4 h-4 md:w-5 md:h-5" /> العودة للرئيسية
                        </button>
                      </>
                    ) : (
                      <>
                         {state.rematchApprovals?.includes(playerId) ? (
                           <div className="bg-slate-800/80 text-emerald-400 p-3 md:p-3.5 rounded-xl font-bold text-sm md:text-base flex justify-center items-center gap-2 border border-slate-700/50">
                             <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                             في انتظار الهوست...
                           </div>
                         ) : (
                           <button onClick={requestRematch} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 md:py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm md:text-base">
                              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" /> طلب إعادة اللعب
                           </button>
                         )}
                         <button onClick={() => { leaveRoom(); navigate('/'); }} className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-3 md:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm md:text-base">
                            <HomeIcon className="w-4 h-4 md:w-5 md:h-5" /> العودة للرئيسية
                         </button>
                      </>
                    )}
                 </div>
              </div>
           </div>
         )}
         
      </div>

      <div className="shrink-0 flex justify-center py-2 h-14 bg-slate-900 border-t border-slate-800 relative z-20">
          {!ds.winnerId && isMyTurn && !canPlayerPlay && !pendingChoice && (
             <button 
               onClick={() => { boneyard.length > 0 ? drawTile() : passTurn() }}
               className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 px-8 py-2 rounded-full font-bold text-white flex items-center gap-2 shadow-lg"
             >
               {boneyard.length > 0 ? (
                 <>سحب حجر <Grid2X2 className="w-4 h-4"/></>
               ) : (
                 <>تمرير الدور <ChevronRight className="w-4 h-4"/></>
               )}
             </button>
          )}
          {!isMyTurn && !ds.winnerId && (
             <div className="px-6 py-2 bg-slate-950 border border-slate-800 rounded-full font-bold text-slate-400 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                دور ({opponent?.username})
             </div>
          )}
      </div>

      <div className="shrink-0 bg-slate-900 p-4 h-[120px] md:h-[150px] flex items-center overflow-x-auto overflow-y-hidden custom-scrollbar z-20 w-full relative shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
         <div className="flex gap-2 md:gap-4 mx-auto min-w-max h-full items-center">
           {myTiles.map((t: any) => {
             const playable = isMyTurn && getPlayableEnds(t, getLeftEnd(), getRightEnd()).length > 0;
             return (
               <div key={t.id} className="relative transition-transform hover:z-30 h-full flex items-center">
                 <DominoPieceUI 
                   val1={t.val1} 
                   val2={t.val2} 
                   onClick={() => handleTileClick(t)} 
                   horizontal={false}
                   className={`w-[50px] h-[100px] md:w-[60px] md:h-[120px] transition-all duration-300 ${!isMyTurn ? 'opacity-60 scale-95' : playable ? 'ring-[2px] ring-emerald-400 ring-offset-4 ring-offset-slate-900 -translate-y-2 hover:-translate-y-4 shadow-lg cursor-pointer' : 'opacity-80 scale-95 hover:-translate-y-1'}`}
                 />
               </div>
             );
           })}
         </div>
      </div>
    </div>
  );
}
