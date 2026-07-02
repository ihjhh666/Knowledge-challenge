import React from 'react';
import { motion } from 'framer-motion';

interface PlayBackgroundProps {
  theme: string;
}

export function PlayBackground({ theme }: PlayBackgroundProps) {
  switch (theme) {
    case 'general':
    case 'quiz':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-fuchsia-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-950 via-purple-950 to-indigo-950"></div>
          
          <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")'}}></div>
          
          {/* Animated floating galaxies / planets */}
          {Array.from({length: 6}).map((_, i) => (
             <motion.div key={i} className="absolute text-5xl opacity-10 filter blur-[1px]"
                initial={{ x: Math.random() * 100 + 'vw', y: '110vh' }}
                animate={{ y: '-20vh', rotate: [-20, 20] }}
                transition={{ duration: 25 + Math.random() * 20, repeat: Infinity, ease: "easeInOut" }}
             >
                {i % 3 === 0 ? '🌍' : i % 3 === 1 ? '🪐' : '✨'}
             </motion.div>
          ))}
          
          <div className="absolute left-[10%] top-[20%] text-[150px] opacity-[0.03] rotate-[-15deg]">✨</div>
          <div className="absolute right-[15%] bottom-[15%] text-[180px] opacity-[0.03] rotate-[15deg]">🌎</div>
          
          <div className="absolute left-[5%] bottom-[10%] w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute right-[5%] top-[10%] w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]"></div>
        </div>
      );
      
    case 'football':
    case 'penalty':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-green-900 pointer-events-none perspective-[1000px]">
          <div className="absolute inset-0 bg-gradient-to-b from-green-950 to-green-800"></div>
          {/* Pitch grass pattern stripes */}
          <div className="absolute inset-x-0 bottom-0 h-full opacity-30 origin-bottom" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 80px)', transform: 'rotateX(60deg) scale(2)' }}></div>
          {/* Pitch markings */}
          <div className="absolute inset-x-0 bottom-0 h-full origin-bottom flex items-end justify-center pb-[10%]" style={{ transform: 'rotateX(60deg) scale(2)' }}>
            <div className="w-[60%] h-[40%] border-4 border-white/40 rounded-t-[50%] border-b-0 absolute bottom-[20%]"></div>
            <div className="w-full h-1 bg-white/40 absolute top-[40%]"></div>
            <div className="w-[30%] h-[30%] border-4 border-white/40 absolute bottom-0 border-b-0"></div>
          </div>
          
          {/* Stadium Lights */}
          <div className="absolute top-0 flex justify-between w-full px-[10%] py-10">
             <div className="flex gap-2">
                {[1,2,3,4].map(i => <div key={i} className="w-4 h-4 rounded-full bg-yellow-100 shadow-[0_0_40px_10px_rgba(255,255,255,0.8)]"></div>)}
             </div>
             <div className="flex gap-2">
                {[1,2,3,4].map(i => <div key={i} className="w-4 h-4 rounded-full bg-yellow-100 shadow-[0_0_40px_10px_rgba(255,255,255,0.8)]"></div>)}
             </div>
          </div>
          
          {/* Crowd simple dots */}
          <div className="absolute top-0 w-full h-[60%] opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 4px 4px, white 1px, transparent 0)', backgroundSize: '8px 8px' }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
        </div>
      );
      
    case 'science':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950"></div>
          {/* Hexagon pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.9' viewBox='0 0 60 103.9' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 103.9L0 86.6V51.9L30 34.6L60 51.9V86.6L30 103.9z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: '60px 103.9px' }}></div>
          
          {/* Animated Atoms/Molecules */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute right-[10%] top-[10%] w-[400px] h-[400px] border border-cyan-500/20 rounded-full border-dashed"></motion.div>
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute right-[10%] top-[10%] w-[200px] h-[400px] border border-fuchsia-500/20 rounded-full"></motion.div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute left-[10%] bottom-[10%] w-[300px] h-[300px] border border-indigo-500/20 rounded-full border-dashed"></motion.div>
          
          {/* Moving Particles */}
          {Array.from({length: 15}).map((_, i) => (
             <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-cyan-400"
                initial={{ x: Math.random() * 100 + 'vw', y: Math.random() * 100 + 'vh', opacity: 0.1 }}
                animate={{ 
                  x: [null, Math.random() * 100 + 'vw'], 
                  y: [null, Math.random() * 100 + 'vh'],
                  opacity: [0.1, 0.5, 0.1]
                }}
                transition={{ duration: 10 + Math.random() * 20, repeat: Infinity, ease: "linear" }}
             ></motion.div>
          ))}
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        </div>
      );
      
    case 'history':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-amber-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-stone-900 to-yellow-950"></div>
          {/* Aged paper texture via SVG filters and noise */}
          <div className="absolute inset-0 opacity-[0.2]" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/old-wall.png")'}}></div>
          {/* Faded Map Lines */}
          <div className="absolute inset-0 opacity-[0.1]" style={{backgroundImage: 'radial-gradient(circle at 30% 70%, transparent 10%, rgba(255,220,150,0.1) 11%, transparent 12%), radial-gradient(circle at 70% 30%, transparent 20%, rgba(255,220,150,0.1) 21%, transparent 22%)'}}></div>
          <svg className="absolute w-full h-full opacity-[0.05] stroke-amber-100" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0,50 Q25,30 50,50 T100,50" fill="none" strokeWidth="0.5" />
             <path d="M50,0 Q30,25 50,50 T50,100" fill="none" strokeWidth="0.5" />
          </svg>
          
          <div className="absolute left-[5%] top-[10%] text-[180px] opacity-[0.05] rotate-[-15deg] mix-blend-overlay">📜</div>
          <div className="absolute right-[5%] bottom-[10%] text-[160px] opacity-[0.05] rotate-[10deg] mix-blend-overlay">🗺️</div>
          
          <div className="absolute -top-10 -right-10 w-96 h-96 bg-amber-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-yellow-600/10 rounded-full blur-[100px]"></div>
        </div>
      );

    case 'math':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-slate-900 to-blue-950"></div>
          {/* Graph Grid pattern */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
          
          {/* Moving Equations */}
          {['x = (-b ± √(b² - 4ac)) / 2a', 'E = mc²', 'e^(iπ) + 1 = 0', 'a² + b² = c²', 'sin²(x) + cos²(x) = 1'].map((eq, i) => (
            <motion.div key={i} 
              initial={{ x: '-20%', y: 10 + i * 20 + 'vh', opacity: 0 }}
              animate={{ x: '120vw', opacity: [0, 0.1, 0.1, 0] }}
              transition={{ duration: 30 + i * 5, repeat: Infinity, ease: 'linear', delay: i * 3 }}
              className="absolute text-5xl font-mono text-cyan-200 whitespace-nowrap"
            >
               {eq}
            </motion.div>
          ))}
          
          {/* Geometric shapes */}
          <motion.div animate={{ rotate: 180 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute top-[20%] right-[15%] w-64 h-64 border-2 border-indigo-500/10 opacity-20"></motion.div>
          <motion.div animate={{ rotate: -180 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute bottom-[20%] left-[15%] w-0 h-0 border-l-[100px] border-l-transparent border-r-[100px] border-r-transparent border-b-[173px] border-b-cyan-500/10 opacity-20 origin-center"></motion.div>
          
          <div className="absolute inset-0 bg-sky-600/5 blur-[100px] rounded-full"></div>
        </div>
      );

    case 'movies':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-black pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-black to-slate-900/50"></div>
          {/* Movie Strip lines */}
          <div className="absolute top-0 left-4 w-12 h-[200%] flex flex-col justify-between py-4 opacity-20 border-x-4 border-white/20 animate-[slide-up_10s_linear_infinite]">
             {Array.from({length: 40}).map((_, i) => <div key={i} className="w-full h-4 bg-white/40 my-2 rounded-sm"></div>)}
          </div>
          <div className="absolute top-0 right-4 w-12 h-[200%] flex flex-col justify-between py-4 opacity-20 border-x-4 border-white/20 animate-[slide-up_10s_linear_infinite_reverse]">
             {Array.from({length: 40}).map((_, i) => <div key={i} className="w-full h-4 bg-white/40 my-2 rounded-sm"></div>)}
          </div>
          
          {/* Cinema Spotlights */}
          <motion.div animate={{ rotate: [-20, 20, -20] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[-10%] left-[10%] w-[30%] h-[150%] bg-gradient-to-t from-white/10 to-transparent blur-3xl origin-bottom"></motion.div>
          <motion.div animate={{ rotate: [20, -20, 20] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[-10%] right-[10%] w-[30%] h-[150%] bg-gradient-to-t from-white/10 to-transparent blur-3xl origin-bottom"></motion.div>
          
          {/* Subtle red glow in center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]"></div>
        </div>
      );

    case 'anime':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-950 via-slate-900 to-purple-950"></div>
          
          {/* Manga Speed Lines */}
          <div className="absolute inset-0 opacity-[0.1]" style={{backgroundImage: 'conic-gradient(from 0deg at 50% 50%, #fff 0 1deg, transparent 1deg 5deg, #fff 5deg 6deg, transparent 6deg 12deg, #fff 12deg 14deg, transparent 14deg 22deg, #fff 22deg 23deg, transparent 23deg 35deg, #fff 35deg 37deg, transparent 37deg 45deg, #fff 45deg 46deg, transparent 46deg 55deg, #fff 55deg 56deg, transparent 56deg 68deg, #fff 68deg 70deg, transparent 70deg 85deg, #fff 85deg 86deg, transparent 86deg 100deg, #fff 100deg 102deg, transparent 102deg 115deg, #fff 115deg 116deg, transparent 116deg 130deg, #fff 130deg 132deg, transparent 132deg 145deg, #fff 145deg 146deg, transparent 146deg 160deg, #fff 160deg 162deg, transparent 162deg 180deg, #fff 180deg 181deg, transparent 181deg 195deg, #fff 195deg 197deg, transparent 197deg 215deg, #fff 215deg 216deg, transparent 216deg 230deg, #fff 230deg 232deg, transparent 232deg 245deg, #fff 245deg 246deg, transparent 246deg 260deg, #fff 260deg 262deg, transparent 262deg 280deg, #fff 280deg 281deg, transparent 281deg 295deg, #fff 295deg 297deg, transparent 297deg 315deg, #fff 315deg 316deg, transparent 316deg 330deg, #fff 330deg 332deg, transparent 332deg 345deg, #fff 345deg 346deg, transparent 346deg 360deg)'}}></div>
          
          {/* Halftone dots overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '8px 8px'}}></div>
          
          {/* Japanese sparks/stars */}
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute right-[15%] top-[15%] w-8 h-8 rotate-45 bg-yellow-300 blur-sm"></motion.div>
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }} className="absolute left-[20%] bottom-[20%] w-6 h-6 rotate-45 bg-pink-300 blur-sm"></motion.div>
          
          <div className="absolute right-[5%] bottom-[10%] text-[150px] opacity-[0.03] font-bold rotate-[15deg]">ドドド</div>
          
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[100px]"></div>
        </div>
      );

    case 'islamic':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-emerald-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950"></div>
          {/* Islamic Pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0l10 10l10-10l10 10v20l-10-10l-10 10l10 10v20l-10-10l-10 10l-10-10l-10 10H0V40l10 10l10-10l-10-10V0h20zm0 60l-10-10l-10 10l-10-10v-20l10 10l10-10l-10-10V0l10 10l10-10l10 10v20l-10-10-10 10l10 10v20z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '80px 80px'}}></div>
          
          {/* Glowing Lantern */}
          <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-[15%] top-[-5%]">
             <div className="w-[2px] h-[150px] bg-amber-400/20 mx-auto"></div>
             <div className="text-[120px] opacity-10 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">🏮</div>
             <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-400/10 blur-[40px] rounded-full"></div>
          </motion.div>
          
          <div className="absolute left-[10%] bottom-[15%] text-[200px] opacity-[0.02]">🌙</div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400/5 blur-[120px] rounded-full"></div>
        </div>
      );

    case 'proverbs':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#020617] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#020617] to-fuchsia-950"></div>
          {/* Glassmorphism/neon subtle grids */}
          <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'linear-gradient(rgba(192,38,211,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
          
          <div className="absolute top-[20%] left-[20%] w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[20%] right-[15%] w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px]"></div>
          
          <div className="absolute right-[10%] top-[25%] text-[150px] opacity-[0.03] rotate-12 mix-blend-screen drop-shadow-[0_0_20px_rgba(217,70,239,0.2)]">✨</div>
          <div className="absolute left-[15%] bottom-[20%] text-[100px] opacity-[0.02] -rotate-12 mix-blend-screen drop-shadow-[0_0_20px_rgba(79,70,229,0.2)]">🔮</div>
        </div>
      );

    case 'sentence_order':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-amber-950 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cork-board.png')] opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/80 via-stone-900/90 to-black"></div>
          
          {/* Floating Sticky Notes / Paper pieces */}
          {Array.from({length: 6}).map((_, i) => (
             <motion.div key={i}
               className="absolute w-32 h-32 bg-yellow-100/10 rounded-sm shadow-xl border border-white/10"
               style={{ backgroundImage: 'linear-gradient(transparent 90%, rgba(0,0,0,0.1) 90%), linear-gradient(90deg, rgba(255,0,0,0.1) 10%, transparent 10%)', backgroundSize: '100% 20px, 20px 100%' }}
               initial={{ rotate: Math.random() * 60 - 30, x: Math.random() * 100 + 'vw', y: Math.random() * 100 + 'vh' }}
               animate={{
                  y: [null, Math.random() * 100 + 'vh'],
                  rotate: [null, Math.random() * 90 - 45]
               }}
               transition={{ duration: 20 + Math.random() * 20, repeat: Infinity, ease: 'linear' }}
             ></motion.div>
          ))}
          
          {/* Floating Arabic Letters */}
          {['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ر', 'س'].map((char, i) => (
             <motion.div key={char} 
                className="absolute text-6xl font-black text-amber-500/10 mix-blend-overlay drop-shadow-2xl"
                initial={{ x: Math.random() * 100 + 'vw', y: Math.random() * 100 + 'vh', rotate: Math.random() * 360 }}
                animate={{ 
                  y: [null, Math.random() * 100 + 'vh'],
                  rotate: [null, Math.random() * 360],
                  x: [null, Math.random() * 100 + 'vw']
                }}
                transition={{ duration: 30 + Math.random() * 20, repeat: Infinity, ease: 'linear' }}
             >
                {char}
             </motion.div>
          ))}
          
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-800/20 rounded-full blur-[100px]"></div>
        </div>
      );

    case 'famous':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black"></div>
          {/* Split VS Background - Red vs Blue */}
          <div className="absolute left-0 top-0 w-[50%] h-full bg-gradient-to-r from-red-900/20 to-transparent skew-x-[15deg]"></div>
          <div className="absolute right-0 top-0 w-[50%] h-full bg-gradient-to-l from-blue-900/20 to-transparent skew-x-[15deg]"></div>
          
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-black opacity-[0.03] italic drop-shadow-2xl">VS</div>
          
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>
      );

    case 'logos':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950"></div>
          
          {/* Digital Grid / Tech Nodes */}
          <div className="absolute inset-0 opacity-[0.1]" style={{backgroundImage: 'linear-gradient(rgba(56,189,248,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.2) 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
          <div className="absolute inset-0 opacity-[0.1]" style={{backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(56,189,248,0.5) 2px, transparent 0)', backgroundSize: '50px 50px'}}></div>
          
          {/* Scanning line */}
          <motion.div animate={{ y: ['-10vh', '110vh'] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="absolute left-0 w-full h-[2px] bg-cyan-500/50 shadow-[0_0_20px_5px_rgba(6,182,212,0.3)]"></motion.div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/5 rounded-full border-dashed animate-[spin_60s_linear_infinite]"></div>
          
          <div className="absolute left-[15%] top-[15%] text-[140px] opacity-[0.03] rotate-[-15deg]">™️</div>
          <div className="absolute right-[15%] bottom-[15%] text-[160px] opacity-[0.02] rotate-[10deg]">✨</div>
        </div>
      );

    case 'emoji':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-fuchsia-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-900/40 to-yellow-500/10"></div>
          
          {/* Bubbles */}
          {Array.from({length: 10}).map((_, i) => (
             <motion.div key={`bubble-${i}`} animate={{y: ['110vh', '-20vh']}} transition={{duration: 15 + Math.random() * 15, repeat: Infinity, ease: "linear", delay: Math.random() * 10}} className="absolute rounded-full border border-white/20 backdrop-blur-sm" style={{left: `${Math.random() * 100}%`, width: `${30 + Math.random() * 80}px`, height: `${30 + Math.random() * 80}px`, borderWidth: `${1 + Math.random() * 4}px`}}></motion.div>
          ))}
          
          {/* Moving Small Emojis */}
          {['😀', '🎉', '🌟', '🍕', '🎮', '💡', '🚀', '🎸', '🐶', '🎨'].map((emoji, i) => (
             <motion.div key={emoji} 
                className="absolute text-2xl opacity-20 filter blur-[0.5px]"
                initial={{ x: Math.random() * 100 + 'vw', y: Math.random() * 100 + 'vh' }}
                animate={{ 
                  x: [null, Math.random() * 100 + 'vw', Math.random() * 100 + 'vw'], 
                  y: [null, Math.random() * 100 + 'vh', Math.random() * 100 + 'vh'],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 40 + Math.random() * 20, repeat: Infinity, ease: "linear" }}
             >
                {emoji}
             </motion.div>
          ))}
          
          <div className="absolute right-[10%] top-[20%] text-[150px] opacity-[0.05] rotate-12 blur-sm">😜</div>
          <div className="absolute left-[10%] bottom-[20%] text-[120px] opacity-[0.04] -rotate-12 blur-sm">🤔</div>
        </div>
      );

    case 'sort':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-teal-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-emerald-900 to-cyan-950"></div>
          {/* Scale Marks */}
          <div className="absolute left-10 top-0 w-2 h-full bg-white/5 border-l border-white/10 flex flex-col justify-between py-10">
             {Array.from({length: 40}).map((_, i) => <div key={i} className={`h-[1px] bg-white/20 ${i % 5 === 0 ? 'w-12' : 'w-6'}`}></div>)}
          </div>
          
          {/* Moving Bar Charts */}
          <div className="absolute bottom-0 right-[20%] flex items-end gap-4 opacity-10">
             {[40, 70, 30, 90, 50].map((h, i) => (
                <motion.div key={i} animate={{ height: [`${h}%`, `${Math.random() * 100}%`, `${h}%`] }} transition={{ duration: 5 + i * 2, repeat: Infinity, ease: 'easeInOut' }} className="w-16 bg-white rounded-t-lg" style={{height: `${h}%`}}></motion.div>
             ))}
          </div>
          
          <div className="absolute left-[30%] top-[20%] text-[100px] opacity-[0.04] -rotate-12">↔️</div>
          
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        </div>
      );

    case 'survival':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-red-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-red-900 to-black"></div>
          
          {/* Heartbeat pulse overlay */}
          <motion.div animate={{ opacity: [0.05, 0.2, 0.05, 0.05] }} transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.1, 0.2, 1] }} className="absolute inset-0 bg-red-500 mix-blend-overlay"></motion.div>
          
          {/* Warning stripes */}
          <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'}}></div>
          
          {/* Vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]"></div>
          
          <div className="absolute left-[15%] top-[15%] text-[200px] opacity-[0.04] rotate-[-10deg]">🔥</div>
          <div className="absolute right-[15%] bottom-[15%] text-[150px] opacity-[0.03] rotate-[15deg]">💀</div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-600/10 rounded-full blur-[150px] mix-blend-overlay"></div>
        </div>
      );

    case 'king':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-black pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-950 via-black to-yellow-950/50"></div>
          
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] left-[5%] w-[800px] h-[800px] border border-yellow-500/10 rounded-full border-dashed opacity-50"></motion.div>
          
          <div className="absolute inset-0 opacity-[0.1]" style={{backgroundImage: 'radial-gradient(circle at center, rgba(250,204,21,0.2) 0%, transparent 70%)'}}></div>
          
          <div className="absolute left-[20%] top-[30%] text-[200px] opacity-[0.04] rotate-[-10deg]">👑</div>
          <div className="absolute right-[20%] bottom-[20%] text-[180px] opacity-[0.03] rotate-[15deg]">🏆</div>
        </div>
      );

    case 'chicken':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-orange-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900"></div>
          <div className="absolute inset-0 opacity-[0.1]" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")'}}></div>
          
          {Array.from({length: 10}).map((_, i) => (
             <motion.div key={i} className="absolute text-4xl opacity-10"
                initial={{ x: Math.random() * 100 + 'vw', y: Math.random() * 100 + 'vh' }}
                animate={{ 
                  x: [null, Math.random() * 100 + 'vw', Math.random() * 100 + 'vw'], 
                  y: [null, Math.random() * 100 + 'vh', Math.random() * 100 + 'vh']
                }}
                transition={{ duration: 30 + Math.random() * 20, repeat: Infinity, ease: "linear" }}
             >
                🐓
             </motion.div>
          ))}
          <div className="absolute left-[20%] top-[10%] text-[200px] opacity-[0.05] rotate-[20deg] mix-blend-overlay">🥚</div>
        </div>
      );

    case 'domino':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-stone-900 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-zinc-900 to-stone-950"></div>
          <div className="absolute inset-0 opacity-[0.15]" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-linen.png")'}}></div>
          
          <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 2px, transparent 2px, transparent 10px)'}}></div>
          
          <div className="absolute left-[15%] bottom-[15%] text-[150px] opacity-[0.04] rotate-[-25deg]">🁫</div>
          <div className="absolute right-[25%] top-[15%] text-[180px] opacity-[0.04] rotate-[35deg]">🁣</div>
        </div>
      );

    case 'fishing':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-sky-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-blue-900 to-indigo-950"></div>
          <div className="absolute inset-0 opacity-[0.1]" style={{backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(255,255,255,0.5), transparent 60%)'}}></div>
          
          {Array.from({length: 15}).map((_, i) => (
             <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-white opacity-20"
                initial={{ x: Math.random() * 100 + 'vw', y: '110vh' }}
                animate={{ 
                  y: '-10vh',
                  x: `calc(${Math.random() * 100}vw + ${Math.sin(i) * 50}px)`
                }}
                transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
             ></motion.div>
          ))}
          
          <div className="absolute left-[10%] top-[40%] text-[150px] opacity-[0.05] rotate-[15deg]">🐟</div>
          <div className="absolute right-[15%] bottom-[20%] text-[200px] opacity-[0.03] rotate-[-10deg]">🎣</div>
        </div>
      );

    case 'hockey':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-900 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-slate-900 to-blue-950"></div>
          <div className="absolute inset-0 opacity-[0.15]" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/ice-texture.png")'}}></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-4 border-rose-500/10 rounded-full opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-rose-500/20 rounded-full"></div>
          <div className="absolute inset-y-0 left-1/2 w-1 bg-red-500/10 -translate-x-1/2"></div>
        </div>
      );

    case 'true_false':
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-black pointer-events-none">
          <div className="absolute inset-0 flex">
            <div className="w-1/2 h-full bg-gradient-to-br from-emerald-950 to-emerald-900/50"></div>
            <div className="w-1/2 h-full bg-gradient-to-bl from-rose-950 to-rose-900/50"></div>
          </div>
          <div className="absolute inset-0 opacity-[0.1]" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
          
          <div className="absolute left-[15%] top-[50%] -translate-y-1/2 text-[250px] opacity-[0.04] rotate-[-5deg] font-black text-emerald-400 drop-shadow-[0_0_50px_rgba(16,185,129,0.5)]">✓</div>
          <div className="absolute right-[15%] top-[50%] -translate-y-1/2 text-[250px] opacity-[0.04] rotate-[5deg] font-black text-rose-400 drop-shadow-[0_0_50px_rgba(244,63,94,0.5)]">✗</div>
          
          {/* Beams */}
          <div className="absolute left-1/4 top-0 w-[100px] h-[150%] bg-white/5 -rotate-45 blur-2xl"></div>
          <div className="absolute right-1/4 top-0 w-[100px] h-[150%] bg-white/5 rotate-45 blur-2xl"></div>
        </div>
      );

    default:
      return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"></div>
        </div>
      );
  }
}
