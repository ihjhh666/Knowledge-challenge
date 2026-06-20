import React, { useState, useEffect, useRef } from 'react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { generateSortingQuestion, SortingQuestion, SortingItem } from '../lib/sortingData';
import { audio } from '../lib/audio';
import { getPlayerStats, updateStats } from '../lib/achievements';
import { notifyAchievements } from '../lib/firebase';
import { User, Medal, ArrowLeft, Trophy, Crown, Maximize2, AlertCircle, RefreshCw, BarChart, Flame, Heart } from 'lucide-react';
import { PlayBackground } from '../components/PlayBackground';
import { getHudStyle, getCardStyle, getButtonStyle } from '../lib/themeStyles';

export default function SortGame() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [question, setQuestion] = useState<SortingQuestion | null>(null);
  const [items, setItems] = useState<SortingItem[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [isChecking, setIsChecking] = useState(false);
  const [isError, setIsError] = useState(false);
  const [resultMessage, setResultMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const maxTime = 30;

  const seenIds = useRef<string[]>([]);
  const seenItems = useRef<string[]>([]);
  const lastCategory = useRef<string>('');
  const lastOrderType = useRef<'desc' | 'asc'>('desc');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !gameOver && !isChecking && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(pr => {
          if (pr <= 6 && pr > 1) {
            audio.sortCountdown();
          }
          if (pr <= 1) {
            handleTimeOut();
            return 0;
          }
          return pr - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, gameOver, isChecking, timeLeft]);

  const loadQuestion = () => {
    setIsChecking(false);
    setIsError(false);
    setResultMessage(null);
    setTimeLeft(maxTime);
    
    const newQ = generateSortingQuestion(seenIds.current, seenItems.current, lastCategory.current as any, lastOrderType.current);
    seenIds.current.push(newQ.id);
    newQ.items.forEach(i => seenItems.current.push(i.name));
    // Keep seenItems trimmed so we don't block everything eventually
    if (seenItems.current.length > 50) seenItems.current = seenItems.current.slice(-50);
    lastCategory.current = newQ.category;
    lastOrderType.current = newQ.order;
    
    setQuestion(newQ);
    // Shuffle
    setItems([...newQ.items].sort(() => 0.5 - Math.random()));
  };

  const handleTimeOut = () => {
    audio.sortTimeout();
    endGame();
  };

  const verifyOrder = () => {
    if (!question) return;
    setIsChecking(true);

    const isDesc = question.order === 'desc';
    let isCorrect = true;
    for (let i = 0; i < items.length - 1; i++) {
       if (isDesc) {
         if (items[i].value < items[i+1].value) isCorrect = false;
       } else {
         if (items[i].value > items[i+1].value) isCorrect = false;
       }
    }

    if (isCorrect) {
       audio.sortSuccess();
       confetti({
         particleCount: 100,
         spread: 70,
         origin: { y: 0.6 },
         colors: ['#06b6d4', '#4f46e5', '#10b981'] // cyan, indigo, emerald
       });
       setCorrectCount(prev => prev + 1);
       setStreak(prev => prev + 1);
       setResultMessage({ type: 'success', text: 'ترتيب ممتاز! إجابة صحيحة' });
       
       const timeBonus = Math.floor((timeLeft / maxTime) * 20);
       setScore(prev => prev + 50 + timeBonus);

       setTimeout(() => {
         setRound(prev => prev + 1);
         loadQuestion();
       }, 2000);
    } else {
       audio.sortError();
       setIsError(true);
       setStreak(0);
       setResultMessage({ type: 'error', text: 'ترتيب خاطئ! حظ أوفر في التالي' });
       
       setHearts(h => {
         const newHearts = h - 1;
         if (newHearts <= 0) {
           setTimeout(endGame, 2500);
         } else {
           setTimeout(() => {
             setRound(prev => prev + 1);
             loadQuestion();
           }, 2500);
         }
         return newHearts;
       });
    }
  };

  const endGame = () => {
    setGameOver(true);
    setIsPlaying(false);

    // Save Stats
    const stats = getPlayerStats();
    const isHighScore = score > (stats.sortHighScore || 0);
    const newMaxStreak = Math.max(streak, stats.sortBestStreak || 0);

    updateStats({
      sortRoundsPlayed: (stats.sortRoundsPlayed || 0) + 1,
      sortCorrectAnswers: (stats.sortCorrectAnswers || 0) + correctCount,
      sortHighScore: isHighScore ? score : stats.sortHighScore,
      sortBestStreak: newMaxStreak,
    });

    if (score > 0) {
      notifyAchievements('local', true, Math.floor(score / 5)); // Trigger achievement check & earn XP
    } else {
      notifyAchievements('local', false, 0); // Loss state
    }

    if (isHighScore && score > 0) {
       audio.sortHighscore();
    } else {
       audio.roundEnd();
    }
  };

  return (
    <>
    <PlayBackground theme="sort" />
    <div className="min-h-screen flex flex-col font-cairo text-right selection:bg-cyan-500/30 overflow-hidden relative z-10">

       {/* Header */}
       <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md">
         <div className="flex items-center gap-4">
           <User className="w-8 h-8 text-cyan-400" />
           <div className="flex flex-col">
             <span className="font-bold text-white leading-none">مرحباً بك</span>
             <span className="text-xs text-slate-400 mt-1">العب وفكر ورتب</span>
           </div>
         </div>
         <div className="flex items-center gap-3">
           <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
             <ArrowLeft className="w-6 h-6" />
           </button>
         </div>
       </header>

       {!isPlaying && !gameOver ? (
         <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="max-w-md w-full bg-slate-900/50 backdrop-blur-md border border-cyan-500/20 rounded-3xl p-8 text-center"
           >
             <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-6 rotate-3">
               <BarChart className="w-10 h-10 text-white transform -rotate-3" />
             </div>
             
             <h1 className="text-3xl font-black text-white mb-4">📊 رتب الأشياء</h1>
             <p className="text-slate-400 mb-8 leading-relaxed">
               اختبر معلوماتك عبر ترتيب العناصر حسب الحجم أو العدد أو العمر أو التاريخ أو السرعة أو أي معيار آخر.<br/>
               اسحب العناصر وضعها بالترتيب الصحيح لتحقيق أعلى سلسلة نقاط.
             </p>

             <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center justify-center">
                 <Crown className="w-6 h-6 text-yellow-500 mb-2" />
                 <span className="text-xs text-slate-400">أعلى نتيجة</span>
                 <span className="text-xl font-bold text-white mt-1">{getPlayerStats().sortHighScore || 0}</span>
               </div>
               <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center justify-center">
                 <Flame className="w-6 h-6 text-orange-500 mb-2" />
                 <span className="text-xs text-slate-400">أعلى سلسلة</span>
                 <span className="text-xl font-bold text-white mt-1">{getPlayerStats().sortBestStreak || 0}</span>
               </div>
             </div>

             <button
               onClick={() => {
                 setScore(0);
                 setRound(1);
                 setStreak(0);
                 setHearts(3);
                 setCorrectCount(0);
                 seenIds.current = [];
                 seenItems.current = [];
                 lastCategory.current = '';
                 setGameOver(false);
                 setIsPlaying(true);
                 loadQuestion();
                 audio.startGame(); // we can add a specific sorting start audio later
               }}
               className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xl shadow-lg shadow-cyan-900/50 hover:shadow-cyan-900/80 active:scale-95 transition-all"
             >
               ابدأ التحدي
             </button>
           </motion.div>
         </div>
       ) : gameOver ? (
         <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="max-w-md w-full bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 text-center"
           >
             <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
             <h2 className="text-3xl font-black text-white mb-2">انتهت اللعبة!</h2>
             <p className="text-slate-400 mb-8">لقد أجبت بشكل صحيح على {correctCount} سؤال</p>
             
             <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-white/5">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 mb-2">{score}</div>
                <div className="text-sm text-slate-400 uppercase tracking-widest font-bold">إجمالي النقاط</div>
             </div>

             <button
               onClick={() => {
                 setScore(0);
                 setRound(1);
                 setStreak(0);
                 setHearts(3);
                 setCorrectCount(0);
                 seenIds.current = [];
                 seenItems.current = [];
                 lastCategory.current = '';
                 setGameOver(false);
                 setIsPlaying(true);
                 loadQuestion();
                 audio.startGame();
               }}
               className="w-full py-4 rounded-xl bg-slate-800 text-white font-bold text-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 mb-4"
             >
               <RefreshCw className="w-5 h-5" />
               إعادة اللعب
             </button>
             <button
               onClick={() => navigate('/')}
               className="w-full py-4 rounded-xl border border-slate-700 text-slate-400 font-bold text-lg hover:bg-white/5 transition-colors"
             >
               العودة للرئيسية
             </button>
           </motion.div>
         </div>
       ) : (
         <div className={`flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 relative z-10 ${getCardStyle('sort')}`}>
           {/* Top Stats */}
           <div className={`flex items-center justify-between mb-8 mt-6 p-4 rounded-xl ${getHudStyle('sort')}`}>
             <div className="flex flex-col gap-1">
               <span className="text-slate-400 text-sm">محاولات</span>
               <div className="flex gap-1 items-center bg-slate-900/50 p-2 rounded-full border border-slate-700/50">
                 {[...Array(3)].map((_, i) => (
                   <Heart key={i} className={`w-5 h-5 ${i < hearts ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'text-slate-700'} transition-all`} />
                 ))}
               </div>
             </div>

             <div className="flex flex-col items-center justify-center">
               <span className="text-slate-400 text-sm">السؤال</span>
               <span className="text-2xl font-black text-white">{round}</span>
             </div>
             
             <div className="flex flex-col items-end">
               <span className="text-slate-400 text-sm">السلسلة</span>
               <div className="flex items-center gap-1">
                 <Flame className={`w-5 h-5 ${streak > 2 ? 'text-orange-500' : 'text-slate-600'}`} />
                 <span className="text-xl font-bold text-white">{streak}</span>
               </div>
             </div>

             <div className="flex flex-col items-end">
               <span className="text-slate-400 text-sm">النقاط</span>
               <span className="text-2xl font-black text-cyan-400">{score}</span>
             </div>
           </div>

           {/* Timer */}
           <div className="mb-8">
             <div className="flex justify-between text-sm mb-2 font-bold">
               <span className={timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}>
                 {timeLeft} ثانية
               </span>
               <span className="text-slate-400">الوقت المتبقي</span>
             </div>
             <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
               <motion.div 
                 className={`h-full rounded-full ${timeLeft <= 10 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                 initial={{ width: '100%' }}
                 animate={{ width: `${(timeLeft / maxTime) * 100}%` }}
                 transition={{ duration: 0.2 }}
               />
             </div>
           </div>

           <AnimatePresence mode="wait">
           {question && (
             <motion.div 
               key={question.id}
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: -20, opacity: 0 }}
               className="flex-1 flex flex-col"
             >
               <div className="text-center mb-6">
                 <div className="inline-flex px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-bold mb-4">
                   {question.title}
                 </div>
                 <h2 className="text-2xl md:text-3xl font-black text-white leading-normal">
                   {question.question}
                 </h2>
               </div>

               <div className="flex-1 mt-4 relative">
                 <Reorder.Group 
                   axis="y" 
                   onReorder={(newOrder) => {
                     let swapped = false;
                     for (let i=0; i<items.length; i++) {
                       if (items[i].id !== newOrder[i].id) {
                         swapped = true;
                         break;
                       }
                     }
                     if (swapped) audio.sortSwap();
                     setItems(newOrder);
                   }} 
                   values={items}
                   className={`space-y-3 ${isError ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
                 >
                   {items.map((item, index) => (
                     <Reorder.Item 
                       key={item.id || item.name} 
                       value={item}
                       onDragStart={() => audio.sortDrag()}
                       onPointerUp={() => audio.sortDrop()}
                       whileDrag={{ scale: 1.02, rotate: index % 2 === 0 ? 1 : -1, zIndex: 50 }}
                       className={`relative bg-slate-800/80 backdrop-blur border ${isChecking ? (isError ? 'border-rose-500/50 bg-rose-500/10' : 'border-emerald-500/50 bg-emerald-500/10') : 'border-slate-700'} rounded-2xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:bg-slate-700/50 transition-colors shadow-lg shadow-black/20`}
                     >
                       <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-black text-slate-400 shrink-0">
                         {index + 1}
                       </div>
                       <div className="flex-1 font-bold text-lg md:text-xl text-white">
                         {item.name}
                       </div>
                       <div className="w-6 h-6 text-slate-500">
                         <Maximize2 className="w-full h-full" />
                       </div>

                       {/* Reveal answer on checking */}
                       <AnimatePresence>
                         {isChecking && (
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className="absolute inset-y-0 left-4 flex items-center justify-center"
                           >
                              <div className={`text-white font-black px-3 py-1 rounded-xl text-sm md:text-base whitespace-nowrap shadow-lg ${isError ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                                {item.value} {question.formatValue}
                              </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </Reorder.Item>
                   ))}
                 </Reorder.Group>
               </div>

               <div className="mt-8 mb-4">
                 <AnimatePresence mode="wait">
                   {resultMessage && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className={`p-4 rounded-xl mb-4 font-bold text-center ${resultMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'}`}
                     >
                       {resultMessage.text}
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <button
                   onClick={verifyOrder}
                   disabled={isChecking}
                   className={`w-full py-5 rounded-2xl text-white font-black text-xl shadow-lg active:scale-95 transition-all disabled:scale-100 disabled:cursor-not-allowed ${isChecking ? (isError ? 'bg-rose-600 shadow-rose-900/50 opacity-100' : 'bg-emerald-600 shadow-emerald-900/50 opacity-100') : 'bg-cyan-600 shadow-cyan-900/50 hover:bg-cyan-500 disabled:opacity-50'}`}
                 >
                   {isChecking ? (isError ? 'الترتيب خاطئ' : 'إجابة صحيحة!') : 'تحقق من الإجابة'}
                 </button>
               </div>
             </motion.div>
           )}
           </AnimatePresence>
         </div>
       )}
    </div>
    </>
  );
}
