import React, { useRef, useState } from 'react';

export type GameCardTheme = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  themeStyle: string; // Used to identify custom visuals rendering
  primaryColor: string;
  glowColor: string;
  onClick: () => void;
};

export function GameCard({ card, compact = false, className = '' }: { card: GameCardTheme, compact?: boolean, className?: string }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  const getCustomVisuals = (themeStyle: string) => {
    switch (themeStyle) {
      case 'football':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-green-950"></div>
            {/* Field Lines */}
            <div className="absolute bottom-0 w-[200%] h-32 border-t border-white/20 -translate-x-1/4 skew-x-12" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 40px, transparent 40px, transparent 80px)'}}></div>
            {/* Stadium Lights */}
            <div className="absolute top-0 w-full h-full">
               <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/20 blur-3xl origin-top-left -rotate-12"></div>
               <div className="absolute top-0 right-1/4 w-32 h-32 bg-white/20 blur-3xl origin-top-right rotate-12"></div>
            </div>
            {/* Huge Ball */}
            <div className="absolute -right-8 -bottom-8 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-12 group-hover:rotate-0 group-hover:scale-110">⚽</div>
          </>
        );
      case 'hockey':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900 to-slate-900"></div>
            {/* Ice Scratches / reflections */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute top-1/4 left-0 w-full h-[2px] bg-white/30 rotate-12 blur-[1px]"></div>
            <div className="absolute bottom-1/3 left-0 w-full h-[1px] bg-white/20 -rotate-6 blur-[1px]"></div>
            {/* Huge Stick & Puck */}
            <div className="absolute -right-8 -bottom-8 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] -rotate-12 group-hover:-rotate-6 group-hover:scale-110">🏒</div>
            <div className="absolute left-1/4 bottom-8 text-6xl md:text-[80px] leading-none opacity-60 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:translate-x-8">⚫</div>
          </>
        );
      case 'fishing':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-cyan-950"></div>
            {/* Water depth */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            {/* Huge Fish */}
            <div className="absolute flex items-center justify-center -right-8 top-1/4 text-[120px] md:text-[160px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-45 group-hover:rotate-12 group-hover:scale-110 group-hover:-translate-y-4">🦈</div>
            {/* Waves */}
            <div className="absolute bottom-0 w-[200%] h-32 border-t-4 border-cyan-500/20 bg-cyan-900/50 rounded-[100%] animate-pulse" style={{ left: '-50%', transform: 'translateY(50%)' }}></div>
            <div className="absolute bottom-0 w-[150%] h-40 border-t-4 border-blue-400/20 bg-blue-900/50 rounded-[100%] animate-pulse delay-75" style={{ left: '-25%', transform: 'translateY(50%)' }}></div>
            {/* Bubbles */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 border border-white/40 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 right-1/4 w-4 h-4 border border-white/30 rounded-full animate-bounce delay-100"></div>
          </>
        );
      case 'king':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-purple-950"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-overlay"></div>
            {/* Sunburst / Rays */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(251,191,36,0.1)_10deg,transparent_20deg,rgba(251,191,36,0.1)_30deg,transparent_40deg,rgba(251,191,36,0.1)_50deg,transparent_60deg,rgba(251,191,36,0.1)_70deg,transparent_80deg,rgba(251,191,36,0.1)_90deg,transparent_100deg,rgba(251,191,36,0.1)_110deg,transparent_120deg,rgba(251,191,36,0.1)_130deg,transparent_140deg,rgba(251,191,36,0.1)_150deg,transparent_160deg,rgba(251,191,36,0.1)_170deg,transparent_180deg)] animate-[spin_60s_linear_infinite] pointer-events-none"></div>
            {/* Huge Crown */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_40px_rgba(251,191,36,0.5)] group-hover:scale-110">👑</div>
          </>
        );
      case 'domino':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-stone-900 to-black"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 mix-blend-overlay"></div>
            {/* Huge Domino Pieces */}
            <div className="absolute -right-8 bottom-0 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-12 group-hover:rotate-[20deg] group-hover:translate-x-4">🁫</div>
            <div className="absolute right-16 bottom-12 text-[100px] md:text-[140px] leading-none opacity-50 group-hover:opacity-80 transition-all duration-500 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] -rotate-12 group-hover:-rotate-6 group-hover:-translate-y-4">🁣</div>
          </>
        );
      case 'penalty':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-950 to-emerald-900"></div>
            {/* Goal Net Background */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05)), linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05))', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
            {/* Huge Ball & Motion */}
            <div className="absolute -right-4 -bottom-4 text-[120px] md:text-[160px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-300 drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] group-hover:scale-110 group-hover:-rotate-45">⚽</div>
            {/* Speed trail */}
            <div className="absolute right-12 bottom-12 w-32 h-8 bg-white/20 blur-xl -rotate-12 group-hover:opacity-0 transition-opacity"></div>
          </>
        );
      case 'chicken':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-600"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            {/* Speed lines */}
            <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0) 40px)' }}></div>
            {/* Huge Chicken */}
            <div className="absolute -right-4 bottom-0 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-300 drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:scale-110 group-hover:-translate-x-4">🐔</div>
            <div className="absolute right-24 bottom-4 text-6xl leading-none opacity-40 group-hover:opacity-0 transition-all duration-300 drop-shadow-2xl">💨</div>
          </>
        );
      case 'quiz':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-violet-950"></div>
            {/* Tech grid */}
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99,102,241,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            {/* Huge Brain */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_50px_rgba(99,102,241,0.6)] group-hover:scale-110 group-hover:rotate-6">🧠</div>
          </>
        );
      case 'famous':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-red-950 to-rose-900"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-amber-600/30 to-transparent"></div>
            {/* VS split */}
            <div className="absolute top-0 left-1/2 w-1 h-full bg-white/10 -skew-x-12 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            {/* Huge Trophy */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_40px_rgba(251,191,36,0.3)] group-hover:scale-110">🏆</div>
            <div className="absolute left-8 top-8 text-5xl md:text-6xl font-black italic text-white/10 -skew-x-6 drop-shadow-sm">VS</div>
          </>
        );
      case 'emoji':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600 to-pink-800"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
            {/* Colorful Glows */}
            <div className="absolute -top-10 left-0 w-40 h-40 bg-yellow-400/30 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-10 right-0 w-40 h-40 bg-cyan-400/30 blur-3xl rounded-full"></div>
            {/* Huge Jigsaw & Emojis */}
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:scale-110 group-hover:rotate-12">🧩</div>
            <div className="absolute left-1/4 top-1/4 text-5xl md:text-6xl leading-none opacity-40 group-hover:opacity-100 transition-all duration-500 drop-shadow-lg -rotate-12 group-hover:scale-125">😜</div>
            <div className="absolute left-1/2 bottom-8 text-4xl md:text-5xl leading-none opacity-30 group-hover:opacity-100 transition-all duration-500 drop-shadow-lg rotate-45 group-hover:-rotate-12 group-hover:scale-125">😎</div>
          </>
        );
      case 'logos':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950"></div>
            {/* Clean Corporate Grid */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            {/* Intersecting Tags / Logos */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[140px] md:text-[180px] leading-none opacity-50 group-hover:opacity-80 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] -rotate-12 group-hover:scale-110 group-hover:-rotate-6 text-indigo-400 mix-blend-color-dodge">🏷️</div>
            <div className="absolute right-12 top-4 w-16 h-16 border-4 border-slate-500/20 rounded-lg rotate-12 group-hover:border-slate-500/50 transition-colors"></div>
            <div className="absolute right-24 top-12 w-12 h-12 border-4 border-sky-500/20 rounded-full group-hover:border-sky-500/50 transition-colors"></div>
          </>
        );
      case 'sort':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-cyan-950"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
            {/* Ascending Cards */}
            <div className="absolute -right-8 bottom-0 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] rotate-6 group-hover:scale-110">📊</div>
            <div className="absolute left-1/4 top-1/4 text-6xl leading-none opacity-30 group-hover:opacity-60 transition-all duration-500 drop-shadow-lg -translate-y-4 group-hover:-translate-y-8">⬆️</div>
          </>
        );
      case 'proverbs':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-stone-900"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/textured-paper.png')] opacity-30 mix-blend-overlay"></div>
            {/* Ancient Vibe */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-overlay"></div>
            {/* Huge Manuscript / Items */}
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] -rotate-12 group-hover:rotate-0 group-hover:scale-110">🏺</div>
            <div className="absolute left-[30%] bottom-8 text-7xl leading-none opacity-60 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] rotate-45 group-hover:-translate-y-4 group-hover:scale-110">🖋️</div>
          </>
        );
      case 'science':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 to-teal-950"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/microbial-mat.png')] opacity-10 mix-blend-overlay"></div>
            {/* Huge Microscope/DNA */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_40px_rgba(20,184,166,0.3)] group-hover:scale-110 group-hover:-rotate-12">🔬</div>
            <div className="absolute left-1/4 top-8 text-6xl leading-none opacity-40 group-hover:opacity-80 transition-all duration-500 drop-shadow-lg group-hover:rotate-45 group-hover:scale-110">🧬</div>
          </>
        );
      case 'movies':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-black"></div>
            {/* Film Strip Borders */}
            <div className="absolute top-0 left-0 w-full h-10 bg-black/60 border-b-2 border-white/10 flex gap-3 p-1.5 overflow-hidden">
               {Array.from({length: 12}).map((_, i) => <div key={i} className="w-5 h-full bg-white/20 rounded-sm"></div>)}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-10 bg-black/60 border-t-2 border-white/10 flex gap-3 p-1.5 overflow-hidden">
               {Array.from({length: 12}).map((_, i) => <div key={i} className="w-5 h-full bg-white/20 rounded-sm"></div>)}
            </div>
            {/* Huge Clapperboard & Popcorn */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] rotate-12 group-hover:-rotate-6 group-hover:scale-110">🎬</div>
            <div className="absolute left-4 bottom-16 text-6xl md:text-[80px] leading-none opacity-60 group-hover:opacity-100 transition-all duration-500 drop-shadow-xl -rotate-12 group-hover:scale-125">🍿</div>
          </>
        );
      case 'history':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950 to-yellow-950"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] opacity-30 mix-blend-overlay"></div>
            {/* Huge Hourglass/Parchment */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)] group-hover:scale-110">📜</div>
            <div className="absolute left-1/4 top-12 text-6xl leading-none opacity-40 group-hover:opacity-80 transition-all duration-500 drop-shadow-xl rotate-12 group-hover:rotate-180">⌛</div>
          </>
        );
      case 'anime':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-rose-700 to-orange-950"></div>
            {/* Speed lines */}
            <div className="absolute inset-0 bg-[repeating-conic-gradient(rgba(255,255,255,0.05)_0_15deg,transparent_15deg_30deg)] animate-[spin_60s_linear_infinite]"></div>
            {/* Huge Swords/Flags */}
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_40px_rgba(244,63,94,0.4)] -rotate-12 group-hover:rotate-12 group-hover:scale-110">🎌</div>
            <div className="absolute left-4 bottom-8 text-7xl leading-none opacity-60 group-hover:opacity-100 transition-all duration-500 drop-shadow-2xl rotate-45 group-hover:-translate-y-4 group-hover:scale-110">⚔️</div>
          </>
        );
      case 'math':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-indigo-950"></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            {/* Huge Math object */}
            <div className="absolute -right-8 bottom-0 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_50px_rgba(59,130,246,0.3)] -rotate-12 group-hover:rotate-0 group-hover:scale-110">🧮</div>
            <div className="absolute left-1/4 top-1/4 text-6xl md:text-[80px] leading-none opacity-40 group-hover:opacity-80 transition-all duration-500 drop-shadow-xl rotate-45 group-hover:-rotate-45">📐</div>
          </>
        );
      case 'islamic':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-teal-950"></div>
            {/* Islamic Star Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-15 mix-blend-overlay"></div>
            {/* Huge Mosque */}
            <div className="absolute -right-8 bottom-0 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:-translate-y-4">🕌</div>
            <div className="absolute left-8 top-8 text-5xl md:text-[80px] leading-none opacity-50 group-hover:opacity-90 transition-all duration-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)] -rotate-12 group-hover:rotate-12">🌙</div>
          </>
        );
      case 'survival':
        return (
           <>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-800 to-red-950"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-overlay"></div>
            {/* Huge Fire and skull */}
            <div className="absolute -right-8 bottom-0 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_50px_rgba(234,88,12,0.5)] group-hover:scale-110 group-hover:-translate-y-4">🔥</div>
            <div className="absolute left-1/4 top-1/4 text-5xl md:text-6xl leading-none opacity-30 group-hover:opacity-70 transition-all duration-500 drop-shadow-lg group-hover:scale-125">💀</div>
           </>
        );
      case 'truefalse':
         return (
            <>
               <div className="absolute inset-0 flex">
                  <div className="relative flex-1 bg-gradient-to-br from-emerald-800 to-emerald-950 overflow-hidden">
                     <div className="absolute -left-10 top-1/2 -translate-y-1/2 text-[120px] leading-none opacity-40 group-hover:opacity-70 transition-all duration-500 group-hover:-translate-y-12">✅</div>
                  </div>
                  <div className="relative flex-1 bg-gradient-to-bl from-rose-800 to-rose-950 overflow-hidden">
                     <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[120px] leading-none opacity-40 group-hover:opacity-70 transition-all duration-500 group-hover:translate-y-12">❌</div>
                  </div>
               </div>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[100px] md:text-[140px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] group-hover:scale-125">⚖️</div>
            </>
         );
      default:
        return (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${card.primaryColor}`}></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 mix-blend-overlay"></div>
          </>
        );
    }
  };

  return (
    <button
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={card.onClick}
      className={`relative w-full text-right ${compact ? 'p-4 rounded-2xl min-h-[120px]' : 'p-6 md:p-8 rounded-3xl min-h-[180px] md:min-h-[220px]'} overflow-hidden group 
        transition-all duration-300 ease-out transform
        hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] shadow-xl 
        border border-slate-700/50 hover:border-white/20
        flex flex-col justify-end ${className}`}
      style={{
        boxShadow: isHovered ? `0 20px 40px -10px ${card.glowColor}40, 0 0 20px 0 ${card.glowColor}20` : '0 10px 30px -10px rgba(0,0,0,0.5)',
      }}
    >
      {/* Background & Custom Visuals */}
      {getCustomVisuals(card.themeStyle)}

      {/* Shine Effect (Glassmorphism highlight) */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
        style={{
          background: `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.3) 0%, transparent 100%)`
        }}
      />
      
      {/* Dark Gradient at bottom to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

      {/* Icon */}
      <div className={`relative z-10 ${compact ? 'w-10 h-10 text-2xl' : 'w-16 h-16 text-3xl'} mb-auto flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
        {card.icon}
      </div>

      {/* Text Content */}
      <div className={`relative z-10 ${compact ? 'mt-4' : 'mt-6'} transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300`}>
        <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-bold font-heading text-white drop-shadow-lg tracking-wide`}>{card.title}</h3>
        {card.subtitle && (
          <p className={`text-slate-300 ${compact ? 'text-xs mt-1' : 'text-sm mt-2'} opacity-80 group-hover:opacity-100 transition-opacity`}>
            {card.subtitle}
          </p>
        )}
      </div>

      {/* Side Glow Line */}
      <div 
         className={`absolute top-0 right-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
         style={{ backgroundColor: card.glowColor }}
      ></div>
    </button>
  );
}
