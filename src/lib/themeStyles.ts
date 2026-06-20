export type ThemeState = 'idle' | 'selected' | 'correct' | 'wrong' | 'disabled';

export const getHudStyle = (theme: string) => {
  switch (theme) {
    case 'football': return 'bg-black/90 border-b-4 border-green-500 shadow-[0_4px_20px_rgba(34,197,94,0.2)] font-mono text-white uppercase tracking-wider rounded-b-2xl sm:rounded-2xl';
    case 'science': return 'bg-cyan-950/60 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] rounded-t-3xl rounded-b-xl text-cyan-50 backdrop-blur-md relative overflow-hidden';
    case 'history': return 'bg-stone-900/90 border-b-4 border-amber-700 shadow-xl rounded-t-sm rounded-b-xl text-amber-50 bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")]';
    case 'movies': return 'bg-black border-y-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.3)] rounded-lg text-red-50';
    case 'anime': return 'bg-pink-600 border-4 border-black shadow-[6px_6px_0px_#000] rounded-xl text-white font-black';
    case 'islamic': return 'bg-emerald-950/90 border-b-2 border-amber-400/50 rounded-b-3xl rounded-t-lg text-amber-50 backdrop-blur-md';
    case 'math': return 'bg-slate-900 border border-sky-400/30 rounded-xl text-sky-100 font-mono shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]';
    case 'sentence_order': return 'bg-purple-950/80 border border-purple-500/30 rounded-2xl text-purple-50 backdrop-blur-xl';
    case 'proverbs': return 'bg-amber-950/90 border-2 border-amber-800 rounded-lg text-amber-50 shadow-xl';
    case 'logos': return 'bg-blue-950/40 border border-cyan-500/30 rounded-3xl text-cyan-50 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.1)]';
    case 'famous': return 'bg-gradient-to-r from-red-950/80 via-black to-blue-950/80 border-b border-white/10 rounded-2xl text-white backdrop-blur-lg';
    case 'emoji': return 'bg-yellow-400/90 border-4 border-yellow-500 shadow-[0_8px_0_rgba(234,179,8,1)] rounded-3xl text-yellow-950 font-black';
    case 'sort': return 'bg-teal-950/80 border border-emerald-500/30 rounded-xl text-emerald-50 backdrop-blur-md shadow-lg shadow-emerald-900/20';
    case 'survival': return 'bg-red-950/80 border border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.5)] rounded-2xl text-white backdrop-blur-md';
    case 'true_false': return 'bg-indigo-950/80 border border-indigo-500/30 rounded-xl text-indigo-50 backdrop-blur-md shadow-[0_0_30px_rgba(79,70,229,0.2)]';
    case 'king': return 'bg-yellow-950/90 border-b-4 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.3)] rounded-2xl text-yellow-50 backdrop-blur-lg';
    case 'chicken': return 'bg-orange-900/80 border-2 border-orange-500/50 rounded-xl text-orange-50 shadow-lg';
    case 'domino': return 'bg-stone-950/90 border-4 border-stone-800 rounded-lg text-stone-100 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]';
    case 'fishing': return 'bg-blue-950/80 border border-sky-400/30 rounded-2xl text-sky-50 backdrop-blur-xl shadow-[0_0_30px_rgba(14,165,233,0.2)]';
    case 'hockey': return 'bg-sky-950/90 border-b-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-xl text-white backdrop-blur-md';
    default: return 'bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-xl text-white';
  }
};

export const getCardStyle = (theme: string) => {
  switch (theme) {
    case 'football': return 'bg-green-800/90 border-2 border-white/20 shadow-2xl rounded-xl text-white relative overflow-hidden bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]';
    case 'science': return 'bg-cyan-950/40 border border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.15)] rounded-3xl backdrop-blur-md text-cyan-50 relative overflow-hidden';
    case 'history': return 'bg-amber-100 border-[12px] border-amber-900/80 shadow-2xl rounded-sm text-amber-950 bg-[url("https://www.transparenttextures.com/patterns/cream-paper.png")]';
    case 'movies': return 'bg-zinc-900 border-x-[16px] border-dashed border-zinc-950 shadow-2xl rounded-sm text-white relative';
    case 'anime': return 'bg-white border-8 border-black shadow-[12px_12px_0px_#000] rounded-2xl text-black font-black transform md:-rotate-1 relative overflow-hidden';
    case 'islamic': return 'bg-emerald-900/90 border-2 border-amber-500/40 rounded-t-[100px] rounded-b-2xl shadow-[0_0_50px_rgba(16,185,129,0.1)] text-amber-50 pt-16 relative overflow-hidden bg-[url("https://www.transparenttextures.com/patterns/arabesque.png")]';
    case 'math': return 'bg-[#1a4731] border-[16px] border-amber-800/90 rounded-lg shadow-2xl text-white font-mono bg-[url("https://www.transparenttextures.com/patterns/stardust.png")] relative';
    case 'sentence_order': return 'bg-yellow-50/95 border-b-4 border-r-4 border-yellow-200 shadow-xl rounded-none text-slate-800 bg-[url("https://www.transparenttextures.com/patterns/lined-paper.png")] relative';
    case 'proverbs': return 'bg-stone-100 border-4 border-amber-900/80 shadow-2xl rounded-sm text-stone-900 bg-[url("https://www.transparenttextures.com/patterns/old-wall.png")]';
    case 'logos': return 'bg-slate-900/60 border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)] rounded-[3rem] backdrop-blur-xl text-white relative';
    case 'famous': return 'bg-black/60 border border-white/10 shadow-2xl rounded-3xl text-white backdrop-blur-xl';
    case 'emoji': return 'bg-white border-4 border-fuchsia-200 shadow-[0_10px_0_rgba(245,208,254,1)] rounded-[3rem] text-slate-800 relative overflow-hidden';
    case 'sort': return 'bg-slate-900/90 border-[3px] border-emerald-500/30 shadow-2xl rounded-2xl text-white relative';
    case 'survival': return 'bg-black/80 border border-red-500/30 shadow-[0_0_40px_rgba(220,38,38,0.2)] rounded-3xl text-white backdrop-blur-xl relative overflow-hidden';
    case 'true_false': return 'bg-indigo-950/60 border border-indigo-400/30 shadow-[0_0_40px_rgba(79,70,229,0.2)] rounded-[2.5rem] backdrop-blur-xl text-white relative overflow-hidden';
    case 'king': return 'bg-gradient-to-b from-yellow-900/80 to-black/90 border-2 border-yellow-500 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.2)] text-white relative';
    case 'chicken': return 'bg-amber-100 border-[8px] border-orange-800 shadow-2xl rounded-3xl text-orange-950 bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")]';
    case 'domino': return 'bg-stone-100 border-8 border-stone-800 shadow-2xl rounded-sm text-stone-950 relative';
    case 'fishing': return 'bg-sky-950/60 border border-blue-400/40 shadow-[0_0_50px_rgba(14,165,233,0.2)] rounded-[3rem] backdrop-blur-md text-white relative overflow-hidden';
    case 'hockey': return 'bg-slate-100 border-[12px] border-sky-900 shadow-2xl rounded-3xl text-slate-900 bg-[url("https://www.transparenttextures.com/patterns/ice-texture.png")] relative';
    default: return 'bg-slate-800 border border-slate-700 rounded-3xl text-white';
  }
};

export const getButtonStyle = (theme: string, state: ThemeState) => {
  const isIdle = state === 'idle';
  const isSelected = state === 'selected';
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isDisabled = state === 'disabled';

  let base = 'relative px-6 py-4 rounded-xl border-2 transition-all font-bold text-lg md:text-xl text-center flex items-center justify-center min-h-[80px] ';
  
  if (isDisabled && !isSelected && !isCorrect && !isWrong) {
    base += 'opacity-50 cursor-not-allowed scale-95 ';
  } else if (!isDisabled) {
    base += 'hover:-translate-y-1 active:scale-95 ';
  }

  if (isCorrect) return base + 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] z-10 scale-105';
  if (isWrong) return base + 'bg-red-500 text-white border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.5)] z-10 scale-95 opacity-80';

  switch (theme) {
    case 'football':
      if (isSelected) return base + 'bg-white text-green-900 border-white shadow-lg';
      return base + 'bg-green-900/50 border-white/30 text-white hover:bg-green-800 hover:border-white/60';
    
    case 'science':
      if (isSelected) return base + 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.8)]';
      return base + 'bg-cyan-950/60 border-cyan-800/50 text-cyan-100 hover:border-cyan-400 hover:bg-cyan-900 shadow-inner';
      
    case 'history':
      if (isSelected) return base + 'bg-amber-900 text-amber-50 border-amber-950 shadow-inner';
      return base + 'bg-amber-100/50 border-amber-900/30 text-amber-950 hover:bg-amber-200 hover:border-amber-900/60';
      
    case 'movies':
      if (isSelected) return base + 'bg-red-600 text-white border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.8)]';
      return base + 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white hover:border-zinc-500';
      
    case 'anime':
      if (isSelected) return base + 'bg-yellow-400 text-black border-black border-4 shadow-[4px_4px_0_#000] translate-x-1 translate-y-1';
      return base + 'bg-white text-black border-black border-4 shadow-[8px_8px_0_#000] hover:shadow-[4px_4px_0_#000] hover:translate-x-1 hover:translate-y-1 font-black';
      
    case 'islamic':
      if (isSelected) return base + 'bg-amber-500 text-emerald-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)]';
      return base + 'bg-emerald-950/50 border-amber-500/30 text-amber-100 hover:bg-emerald-800 hover:border-amber-400 transition-colors';
      
    case 'math':
      if (isSelected) return base + 'bg-indigo-500 text-white border-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.8)]';
      return base + 'bg-black/30 border-white/20 text-white font-mono hover:bg-black/50 hover:border-white/40 border-dashed';

    case 'emoji':
      if (isSelected) return base + 'bg-purple-500 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)]';
      return base + 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900 hover:bg-fuchsia-100 hover:border-fuchsia-400 shadow-[0_4px_0_rgba(245,208,254,1)] hover:shadow-none hover:translate-y-1 rounded-2xl';

    case 'true_false':
      if (isSelected) return base + 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.8)] scale-105';
      return base + 'bg-indigo-950/50 border-indigo-500/30 text-indigo-100 hover:bg-indigo-900 hover:border-indigo-400';

    case 'king':
      if (isSelected) return base + 'bg-yellow-500 text-black border-yellow-300 shadow-[0_0_25px_rgba(234,179,8,0.8)] scale-105';
      return base + 'bg-yellow-950/50 border-yellow-700 text-yellow-100 hover:bg-yellow-900/80 hover:border-yellow-500';

    case 'chicken':
      if (isSelected) return base + 'bg-orange-500 text-white border-orange-300 shadow-xl';
      return base + 'bg-white border-orange-300 text-orange-900 hover:bg-orange-50 font-black shadow-[0_4px_0_rgba(249,115,22,1)] hover:translate-y-1 hover:shadow-none';

    case 'domino':
      if (isSelected) return base + 'bg-stone-800 text-white border-stone-950 shadow-[0_0_15px_rgba(0,0,0,0.5)]';
      return base + 'bg-white border-stone-800 text-stone-900 hover:bg-stone-100 shadow-[4px_4px_0_rgba(28,25,23,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none font-bold rounded-sm';

    case 'fishing':
      if (isSelected) return base + 'bg-sky-500 text-white border-sky-300 shadow-[0_0_20px_rgba(14,165,233,0.8)]';
      return base + 'bg-sky-950/50 border-sky-500/30 text-sky-100 hover:bg-sky-900 hover:border-sky-400';

    case 'hockey':
      if (isSelected) return base + 'bg-sky-600 text-white border-sky-400 shadow-[0_0_20px_rgba(2,132,199,0.8)] scale-105';
      return base + 'bg-white/80 border-sky-200 text-sky-900 hover:bg-white hover:border-sky-400';

    default:
      if (isSelected) return base + 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30';
      return base + 'bg-slate-900 border-slate-700 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800 shadow-sm';
  }
};
