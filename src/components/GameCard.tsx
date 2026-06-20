import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';

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

export function GameCard({ card, compact = false, className = '', index = 0 }: { card: GameCardTheme, compact?: boolean, className?: string, index?: number }) {
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
      case 'penalty':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-green-950"></div>
            {/* Realistic Grass & Field */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)' }}></div>
            <div className="absolute bottom-0 w-[200%] h-40 border-t-2 border-white/30 -translate-x-1/4 skew-x-[20deg]" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 50px)'}}></div>
            {/* Stadium Lights & Crowd */}
            <div className="absolute top-0 w-full h-full overflow-hidden">
               {/* Crowd Dots */}
               <div className="absolute top-8 left-0 w-full h-20 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '10px 10px', animation: 'pulse 3s infinite alternate' }}></div>
               <div className="absolute -top-10 left-1/4 w-40 h-40 bg-white/30 blur-[40px] origin-top-left -rotate-12"></div>
               <div className="absolute -top-10 right-1/4 w-40 h-40 bg-white/30 blur-[40px] origin-top-right rotate-12"></div>
            </div>
            {/* Huge 3D Ball */}
            <div className="absolute -right-6 -bottom-6 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-700 drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)] group-hover:-rotate-45 group-hover:scale-110">⚽</div>
            {/* Motion Speed Line */}
            {themeStyle === 'penalty' && (
               <div className="absolute right-16 bottom-16 w-32 h-6 bg-white/30 blur-xl -rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
            )}
          </>
        );
      case 'hockey':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-sky-800 to-cyan-950"></div>
            {/* Ice Texture simulated by radial gradient */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)' , backgroundSize: '10px 10px'}}></div>
            {/* Ice Scratches & Field Markings */}
            <div className="absolute top-1/4 left-0 w-full h-[3px] bg-red-500/70 rotate-6 blur-[1px]"></div>
            <div className="absolute bottom-1/3 left-0 w-full h-[2px] bg-blue-500/60 -rotate-12 blur-[1px]"></div>
            <div className="absolute top-0 right-1/4 w-32 h-32 bg-white/20 blur-3xl rounded-full"></div>
            {/* Huge Stick & Puck & Motion */}
            <div className="absolute -right-8 -bottom-8 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] -rotate-12 group-hover:-rotate-[24deg] group-hover:scale-110">🏒</div>
            {/* Flying Puck with Trail */}
            <div className="absolute left-1/4 bottom-12 text-6xl md:text-[80px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-10 group-hover:translate-x-12 group-hover:-translate-y-4">⚫</div>
            <div className="absolute left-16 bottom-16 w-32 h-4 bg-white/20 blur-lg rotate-12 opacity-0 group-hover:opacity-100 transition-all duration-500 origin-left scale-x-0 group-hover:scale-x-100"></div>
          </>
        );
      case 'fishing':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-cyan-950"></div>
            {/* Water depth */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'linear-gradient(transparent 50%, rgba(255,255,255,0.05) 50%)', backgroundSize: '10px 10px'}}></div>
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
            <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.1) 2px, transparent 0)', backgroundSize: '20px 20px'}}></div>
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
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05)), linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05))', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px'}}></div>
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
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.2) 2px, transparent 0)', backgroundSize: '20px 20px'}}></div>
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
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-violet-950"></div>
            {/* Tech network */}
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99,102,241,0.2) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 100% 50%, transparent 20%, rgba(255,255,255,0.05) 21%, rgba(255,255,255,0.05) 34%, transparent 35%, transparent)', backgroundSize: '40px 40px'}}></div>
            {/* Moving light lines */}
            <div className="absolute top-1/4 -left-1/4 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent -rotate-12 animate-[sweep_4s_linear_infinite]"></div>
            <div className="absolute bottom-1/4 -left-1/4 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent rotate-6 animate-[sweep_3s_linear_infinite_reverse]"></div>
            {/* Knowledge Icons */}
            <div className="absolute top-4 left-6 text-2xl opacity-40 group-hover:opacity-80 transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-12 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">❓</div>
            <div className="absolute top-1/2 left-12 text-3xl opacity-30 group-hover:opacity-70 transition-all duration-300 group-hover:scale-125 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">💡</div>
            <div className="absolute bottom-6 left-24 text-2xl opacity-40 group-hover:opacity-90 transition-all duration-300 group-hover:-translate-y-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] -rotate-12">📚</div>
            {/* Huge Globe */}
            <div className="absolute -right-8 -bottom-8 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-700 drop-shadow-[0_0_40px_rgba(59,130,246,0.5)] rotate-[15deg] group-hover:rotate-0 group-hover:scale-110 origin-center">🌍</div>
          </>
        );
      case 'famous':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-950 via-amber-900 to-amber-950"></div>
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.1)), linear-gradient(-45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.1))', backgroundSize: '10px 10px'}}></div>
            {/* VS split effect */}
            <div className="absolute top-0 left-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-amber-300 to-transparent shadow-[0_0_15px_rgba(253,224,71,0.8)] -skew-x-[15deg]"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-amber-500/20 to-transparent"></div>
            {/* Huge VS text */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl md:text-[120px] font-black italic text-white/5 group-hover:text-amber-500/10 transition-colors duration-500 -skew-x-12 tracking-tighter">VS</div>
            {/* Gold Sparks */}
            <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-amber-300 rounded-full shadow-[0_0_5px_#fde047] opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-100"></div>
            <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_8px_#fef08a] opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-300"></div>
            {/* Huge Professional Trophy */}
            <div className="absolute -right-8 -bottom-4 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-700 drop-shadow-[0_20px_50px_rgba(251,191,36,0.6)] group-hover:scale-110 group-hover:-translate-y-2 origin-bottom">🏆</div>
          </>
        );
      case 'emoji':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-purple-600 to-pink-600"></div>
            {/* Playful polka dots */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
            {/* Colorful Glow Bubbles */}
            <div className="absolute -top-10 left-0 w-32 h-32 bg-yellow-300/50 blur-3xl rounded-full animate-pulse"></div>
            <div className="absolute -bottom-10 right-0 w-32 h-32 bg-cyan-300/50 blur-3xl rounded-full animate-[pulse_3s_infinite_reverse]"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-fuchsia-300/40 blur-3xl rounded-full"></div>
            {/* Emoji Bubbles */}
            <div className="absolute left-8 top-8 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white/40 group-hover:-translate-y-4 group-hover:scale-110 transition-all duration-300 origin-bottom">😂</div>
            <div className="absolute right-1/4 top-12 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white/40 group-hover:-translate-y-3 group-hover:scale-110 transition-all duration-300 origin-bottom rotate-12">🤩</div>
            <div className="absolute left-1/3 bottom-12 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white/40 group-hover:translate-y-2 group-hover:scale-125 transition-all duration-300 origin-top -rotate-12">🥳</div>
            {/* Huge Jigsaw & Joy */}
            <div className="absolute -right-8 bottom-0 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] group-hover:scale-110 group-hover:rotate-12 animate-[bounce_4s_infinite]">🧩</div>
          </>
        );
      case 'logos':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950"></div>
            {/* Digital Tech Grid & Data lines */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(56,189,248,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }}></div>
            {/* Neon Data Streams */}
            <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/80 to-transparent shadow-[0_0_10px_#22d3ee] animate-[sweep_3s_ease-in-out_infinite]"></div>
            <div className="absolute top-0 right-1/3 w-[2px] h-full bg-gradient-to-b from-transparent via-blue-500/80 to-transparent shadow-[0_0_15px_#3b82f6] animate-[sweep_2s_linear_infinite_reverse]"></div>
            {/* Intersecting Logo placeholders (Tech vibe) */}
            <div className="absolute right-12 top-8 w-16 h-16 border-[3px] border-cyan-500/30 rounded-xl rotate-12 backdrop-blur-sm group-hover:border-cyan-500/80 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] group-hover:rotate-0 transition-all duration-500"></div>
            <div className="absolute left-1/3 bottom-12 w-12 h-12 border-[3px] border-blue-500/30 rounded-full -rotate-12 backdrop-blur-sm group-hover:border-blue-500/80 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] group-hover:scale-125 transition-all duration-500"></div>
            <div className="absolute top-1/2 left-8 w-8 h-8 border-[2px] border-indigo-400/30 rotate-45 backdrop-blur-sm group-hover:border-indigo-400/80 group-hover:shadow-[0_0_15px_rgba(129,140,248,0.6)] group-hover:rotate-90 transition-all duration-500"></div>
            {/* Huge Tag / Brand Icon */}
            <div className="absolute -right-8 bottom-0 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-700 drop-shadow-[0_0_40px_rgba(56,189,248,0.5)] -rotate-[15deg] group-hover:rotate-0 group-hover:scale-110 group-hover:-translate-y-4">🏷️</div>
          </>
        );
      case 'sentence_order':
        return (
          <>
            {/* Elegant glassmorphism background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-sky-900 to-indigo-950"></div>
            
            {/* Ambient animated glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-400/20 blur-[60px] rounded-full animate-[pulse_4s_ease-in-out_infinite] group-hover:bg-cyan-400/40 transition-colors duration-700"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/20 blur-[60px] rounded-full animate-[pulse_5s_ease-in-out_infinite_reverse] group-hover:bg-indigo-500/40 transition-colors duration-700"></div>

            {/* Sweep light effect crossing the card - using simple continuous CSS animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl md:rounded-3xl mix-blend-overlay opacity-50 group-hover:opacity-100 transition-opacity">
               <div className="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-[25deg] animate-[sweep-x_5s_linear_infinite]"></div>
            </div>

            {/* Scattered blurred letters in background */}
            <div className="absolute top-6 left-8 text-3xl font-bold text-white/10 group-hover:text-cyan-300/20 rotate-12 transition-colors duration-500 blur-[1px] group-hover:rotate-45">أ</div>
            <div className="absolute bottom-1/3 left-1/4 text-5xl font-black text-white/5 group-hover:text-sky-300/20 -rotate-12 transition-colors duration-500 blur-[2px] group-hover:-translate-y-4">ج</div>
            <div className="absolute top-1/4 left-1/2 text-2xl font-bold text-white/10 group-hover:text-indigo-300/20 rotate-45 transition-colors duration-500 blur-[1px]">م</div>
            <div className="absolute bottom-8 right-1/3 text-6xl font-black text-white/5 group-hover:text-blue-300/20 -rotate-45 transition-colors duration-500 blur-[3px]">ل</div>

            {/* Glass sentence boxes */}
            <div className="absolute top-8 left-6 text-sm md:text-lg font-bold px-4 md:px-6 py-2 bg-white/5 border border-cyan-300/20 rounded-xl rotate-6 backdrop-blur-md shadow-[0_4px_15px_rgba(34,211,238,0.1)] group-hover:shadow-[0_8px_25px_rgba(34,211,238,0.3)] group-hover:-rotate-3 group-hover:-translate-y-2 group-hover:bg-cyan-400/10 transition-all duration-500 text-cyan-100">رتب</div>
            
            <div className="absolute top-1/2 right-12 text-sm md:text-lg font-bold px-4 md:px-6 py-2 bg-white/5 border border-indigo-300/20 rounded-xl -rotate-12 backdrop-blur-md shadow-[0_4px_15px_rgba(99,102,241,0.1)] group-hover:shadow-[0_8px_25px_rgba(99,102,241,0.3)] group-hover:rotate-3 group-hover:translate-x-4 group-hover:bg-indigo-400/10 transition-all duration-500 text-indigo-100">الكلمات</div>
            
            <div className="absolute bottom-1/4 left-10 text-sm md:text-lg font-bold px-4 md:px-6 py-2 bg-gradient-to-r from-sky-400/10 to-indigo-500/10 border border-sky-300/30 rounded-xl rotate-12 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.2)] group-hover:shadow-[0_0_35px_rgba(56,189,248,0.6)] group-hover:scale-110 group-hover:-translate-y-3 transition-all duration-500 text-white z-10 flex items-center gap-2">
               لتفوز <span className="text-sky-300 text-xl animate-pulse">✨</span>
            </div>
            
            {/* Sorting Navigation Path */}
            <div className="absolute left-[40%] top-1/3 w-[2px] h-20 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent rotate-45 pointer-events-none"></div>
            
            {/* Sorting Arrows */}
            <div className="absolute right-4 top-1/4 text-2xl md:text-3xl opacity-30 group-hover:opacity-100 text-cyan-300 group-hover:-translate-y-4 group-hover:scale-125 transition-all duration-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">⬆</div>
            <div className="absolute right-4 bottom-1/4 text-2xl md:text-3xl opacity-30 group-hover:opacity-100 text-indigo-300 group-hover:translate-y-4 group-hover:scale-125 transition-all duration-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">⬇</div>

            {/* Huge 3D Custom Icon: Flowing words / Blocks */}
            <div className="absolute -right-4 -bottom-4 text-[100px] md:text-[140px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-4 group-hover:-translate-x-2 origin-bottom z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)]">
               <div className="relative">
                  <span className="absolute -left-14 -top-8 text-5xl md:text-6xl rotate-[-20deg] drop-shadow-xl opacity-90 group-hover:text-cyan-200 transition-colors group-hover:scale-125 group-hover:-rotate-[-10deg] duration-500">🧩</span>
                  <span className="relative drop-shadow-2xl">📝</span>
               </div>
            </div>
          </>
        );
      case 'sort':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-cyan-950"></div>
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05))', backgroundSize: '20px 20px'}}></div>
            {/* Ascending Cards */}
            <div className="absolute -right-8 bottom-0 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] rotate-6 group-hover:scale-110">📊</div>
            <div className="absolute left-1/4 top-1/4 text-6xl leading-none opacity-30 group-hover:opacity-60 transition-all duration-500 drop-shadow-lg -translate-y-4 group-hover:-translate-y-8">⬆️</div>
          </>
        );
      case 'proverbs':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-stone-900"></div>
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
            {/* Ancient Vibe */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)', backgroundSize: '50px 50px'}}></div>
            {/* Huge Manuscript / Items */}
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] -rotate-12 group-hover:rotate-0 group-hover:scale-110">🏺</div>
            <div className="absolute left-[30%] bottom-8 text-7xl leading-none opacity-60 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] rotate-45 group-hover:-translate-y-4 group-hover:scale-110">🖋️</div>
          </>
        );
      case 'science':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-cyan-900 to-indigo-950"></div>
            {/* Hexagon Molecular Background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.4) 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
            <div className="absolute top-1/3 left-1/4 w-32 h-32 border border-teal-400/20 rounded-full animate-[spin_10s_linear_infinite]">
               <div className="absolute top-0 left-1/2 w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_10px_#2dd4bf]"></div>
               <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
            </div>
            {/* huge rotating atoms and test tubes */}
            <div className="absolute left-8 top-12 text-6xl opacity-50 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-[spin_8s_linear_infinite]">⚛️</div>
            <div className="absolute right-1/4 top-8 text-5xl opacity-40 group-hover:opacity-90 group-hover:-translate-y-4 transition-all duration-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)] rotate-12">🧪</div>
            {/* Huge DNA */}
            <div className="absolute -right-8 -bottom-8 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-700 drop-shadow-[0_0_40px_rgba(45,212,191,0.6)] group-hover:scale-110 group-hover:rotate-12 origin-bottom-right">🧬</div>
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
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px', backgroundPosition: '-2px -2px, -2px -2px, -1px -1px, -1px -1px'}}></div>
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
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900"></div>
            {/* Math Grid */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(147,197,253,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            {/* Neon Lines */}
            <div className="absolute top-1/3 left-0 w-full h-[2px] bg-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.8)] -rotate-12 transform origin-left group-hover:scale-y-150 transition-transform"></div>
            <div className="absolute bottom-1/4 left-0 w-full h-[1px] bg-indigo-400/50 shadow-[0_0_10px_rgba(129,140,248,0.8)] rotate-6 transform origin-right group-hover:scale-y-150 transition-transform"></div>
            {/* Glowing Numbers & Symbols */}
            <div className="absolute top-4 left-1/4 text-white/20 font-mono text-3xl group-hover:text-blue-300/80 group-hover:drop-shadow-[0_0_8px_rgba(147,197,253,0.8)] transition-all duration-300">π</div>
            <div className="absolute top-1/2 left-8 text-white/10 font-mono text-4xl group-hover:text-indigo-300/80 group-hover:drop-shadow-[0_0_10px_rgba(165,180,252,0.8)] transition-all duration-300 -rotate-12">∑</div>
            <div className="absolute bottom-8 left-1/3 text-white/20 font-mono text-2xl group-hover:text-cyan-300/80 group-hover:drop-shadow-[0_0_8px_rgba(103,232,249,0.8)] transition-all duration-300 rotate-12">√</div>
            <div className="absolute top-8 right-1/2 text-white/10 font-bold text-5xl group-hover:text-white/40 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.5)] transition-all duration-300 blur-[1px]">7</div>
            <div className="absolute bottom-1/2 left-1/4 text-white/10 font-bold text-6xl group-hover:text-white/30 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300 rotate-12">x²</div>
            <div className="absolute top-1/4 left-10 text-white/10 font-bold text-2xl group-hover:text-white/50 transition-all duration-300">%</div>
            <div className="absolute bottom-4 left-1/2 text-white/10 font-bold text-3xl group-hover:text-white/40 transition-all duration-300 -rotate-6">÷</div>
            {/* Huge 3D Calculator */}
            <div className="absolute -right-6 -bottom-6 text-[140px] md:text-[180px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_50px_rgba(59,130,246,0.5)] -rotate-12 group-hover:rotate-0 group-hover:scale-110">🧮</div>
          </>
        );
      case 'islamic':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-teal-950"></div>
            {/* Islamic Star Pattern */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(polygon(50%, 0%, 100%, 50%, 50%, 100%, 0%, 50%), rgba(255,255,255,0.1) 0%, transparent 100%)', backgroundSize: '40px 40px'}}></div>
            {/* Huge Mosque */}
            <div className="absolute -right-8 bottom-0 text-[140px] md:text-[180px] leading-none opacity-80 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:-translate-y-4">🕌</div>
            <div className="absolute left-8 top-8 text-5xl md:text-[80px] leading-none opacity-50 group-hover:opacity-90 transition-all duration-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)] -rotate-12 group-hover:rotate-12">🌙</div>
          </>
        );
      case 'survival':
        return (
           <>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-800 to-red-950"></div>
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0.2)), linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0.2))', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px'}}></div>
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
               <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent)', backgroundSize: '30px 30px'}}></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[100px] md:text-[140px] leading-none opacity-90 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] group-hover:scale-125">⚖️</div>
            </>
         );
      default:
        return (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${card.primaryColor}`}></div>
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05)), linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05))', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px'}}></div>
          </>
        );
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05, type: 'spring', bounce: 0.4 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={card.onClick}
      className={`relative w-full text-right ${compact ? 'p-4 rounded-2xl min-h-[120px]' : 'p-6 md:p-8 rounded-3xl min-h-[180px] md:min-h-[220px]'} overflow-hidden group hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-shadow duration-300 ease-out border border-slate-700/50 hover:border-white/20 flex flex-col justify-end ${className}`}
      style={{
        boxShadow: isHovered ? `0 20px 40px -10px ${card.glowColor}80, 0 0 30px 0 ${card.glowColor}40` : '0 10px 30px -10px rgba(0,0,0,0.5)',
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
    </motion.button>
  );
}
