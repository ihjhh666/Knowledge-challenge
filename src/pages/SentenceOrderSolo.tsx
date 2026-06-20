import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trophy, Zap, Clock, RefreshCcw, Check, X, Shield, Star, Crown } from 'lucide-react';
import { SENTENCES } from '../lib/sentencesData';
import { audio } from '../lib/audio';
import { storage } from '../lib/storage';
import { updateStats, getPlayerStats } from '../lib/achievements';
import { calculateLevel, calculateEarnedXp } from '../lib/level';
import { PlayBackground } from '../components/PlayBackground';

export default function SentenceOrderSolo() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [currentSentenceText, setCurrentSentenceText] = useState("");
  const [availableWords, setAvailableWords] = useState<{ id: string, text: string }[]>([]);
  const [selectedWords, setSelectedWords] = useState<{ id: string, text: string }[]>([]);
  
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(1);
  const [resultState, setResultState] = useState<'none' | 'correct' | 'wrong'>('none');
  const [gameOver, setGameOver] = useState(false);

  // Load a new sentence
  const loadNextSentence = () => {
    const randomIdx = Math.floor(Math.random() * SENTENCES.length);
    const sentence = SENTENCES[randomIdx];
    setCurrentSentenceText(sentence);
    
    const words = sentence.split(' ').filter(w => w.length > 0);
    // Shuffle words
    const shuffled = words.map((w, i) => ({ id: `${i}-${w}`, text: w })).sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setSelectedWords([]);
    
    // Dynamic time calculated by length
    const timeForSentence = Math.max(10, Math.min(60, words.length * 4));
    setTimeLeft(timeForSentence);
    setMaxTime(timeForSentence);
    setResultState('none');
  };

  useEffect(() => {
    if (isPlaying) {
      loadNextSentence();
    }
  }, [isPlaying]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && resultState === 'none' && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          if (prev <= 5) audio.tick();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, resultState, gameOver]);

  // Evaluate automatically whenever all words are placed
  useEffect(() => {
    if (isPlaying && resultState === 'none' && availableWords.length === 0 && selectedWords.length > 0) {
      checkAnswer();
    }
  }, [availableWords, selectedWords, isPlaying]);

  const handleTimeOut = () => {
    audio.wrong();
    setResultState('wrong');
    setWrongCount(prev => prev + 1);
    setTimeout(() => {
      loadNextSentence();
    }, 1500);
  };

  const checkAnswer = () => {
    const userSen = selectedWords.map(w => w.text).join(' ');
    if (userSen === currentSentenceText) {
      audio.correct();
      setResultState('correct');
      
      const newScore = 15 + Math.floor((timeLeft / maxTime) * 15);
      setScore(prev => prev + newScore);
      setCorrectCount(prev => prev + 1);
      
      setTimeout(() => {
        loadNextSentence();
      }, 1000);
    } else {
      audio.wrong();
      setResultState('wrong');
      setWrongCount(prev => prev + 1);
      
      // Let them retry after a short delay
      setTimeout(() => {
         setResultState('none');
         // Put words back to available
         setAvailableWords(prev => [...prev, ...selectedWords].sort(() => Math.random() - 0.5));
         setSelectedWords([]);
      }, 1000);
    }
  };

  const selectWord = (word: { id: string, text: string }) => {
    if (resultState !== 'none') return;
    setAvailableWords(prev => prev.filter(w => w.id !== word.id));
    setSelectedWords(prev => [...prev, word]);
    audio.click();
  };

  const deselectWord = (word: { id: string, text: string }) => {
    if (resultState !== 'none') return;
    setSelectedWords(prev => prev.filter(w => w.id !== word.id));
    setAvailableWords(prev => [...prev, word]);
    audio.click();
  };

  const finishGame = async () => {
    setGameOver(true);
    setIsPlaying(false);
    
    // Update generic XP and DB logic
    const totalXp = getPlayerStats().totalXp || 0;
    const earnedXps = Math.floor(score * 0.5) + correctCount * 10;
    
    const unlocked = updateStats({ 
      totalXp: totalXp + earnedXps,
      sentencesCorrect: (getPlayerStats().sentencesCorrect || 0) + correctCount,
      gamesPlayed: getPlayerStats().gamesPlayed + 1
    });
    
    // Check level up
    const currentLvl = calculateLevel(totalXp).level;
    const newLvl = calculateLevel(totalXp + earnedXps).level;
    if (newLvl > currentLvl) {
      setTimeout(() => audio.win(), 500);
    }
    
    // Update Firebase global stats
    const pid = storage.getPlayerId();
    const pname = storage.getPlayerName();
    if (pid && pname && (correctCount > 0 || wrongCount > 0)) {
       try {
           const { updatePlayerStats: updateFbStats } = await import('../lib/firebase');
           await updateFbStats(pid, pname, correctCount > wrongCount, correctCount, wrongCount, score, 'sentence_order');
       } catch (err) {
           console.error('Failed to update FB stats:', err);
       }
    }
  };

  if (!isPlaying && !gameOver) {
    return (
      <>
      <PlayBackground theme="sentence_order" />
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="max-w-md w-full text-center space-y-6">
          <button onClick={() => navigate('/solo')} className="w-12 h-12 bg-slate-900/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 hover:text-white mx-auto transition-colors">
            <ArrowRight className="w-6 h-6" />
          </button>
          <div className="w-24 h-24 bg-sky-500/20 rounded-3xl mx-auto flex items-center justify-center drop-shadow-xl animate-bounce backdrop-blur-md">
            <span className="text-5xl">🧩</span>
          </div>
          <h1 className="text-4xl font-bold text-white font-heading">رتب الجملة</h1>
          <p className="text-slate-300 backdrop-blur-sm p-4 rounded-xl bg-black/20 border border-white/5">
            أعد ترتيب الكلمات المبعثرة لتكوين جملة صحيحة قبل انتهاء الوقت المخصص. السرعة تمنحك نقاطاً أكثر!
          </p>
          <button
            onClick={() => setIsPlaying(true)}
            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-sky-500/20"
          >
            ابدأ التحدي
          </button>
        </div>
      </div>
      </>
    );
  }

  if (gameOver) {
    const earnedXps = Math.floor(score * 0.5) + correctCount * 10;
    return (
      <>
      <PlayBackground theme="sentence_order" />
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
           <div className="w-24 h-24 bg-amber-500/20 rounded-full mx-auto flex items-center justify-center mb-6">
             <Trophy className="w-12 h-12 text-amber-500" />
           </div>
           
           <h2 className="text-3xl font-bold text-white mb-2 font-heading">انتهى التحدي</h2>
           
           <div className="grid grid-cols-2 gap-4 my-8">
             <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
               <span className="block text-slate-400 text-sm mb-1">النقاط</span>
               <span className="text-3xl font-bold text-emerald-400 font-mono">{score}</span>
             </div>
             <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
               <span className="block text-slate-400 text-sm mb-1">XP مكتسب</span>
               <span className="text-3xl font-bold text-sky-400 font-mono">+{earnedXps}</span>
             </div>
             <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
               <span className="block text-slate-400 text-sm mb-1">جمل صحيحة</span>
               <span className="text-2xl font-bold text-green-400 font-mono">{correctCount}</span>
             </div>
             <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
               <span className="block text-slate-400 text-sm mb-1">أخطاء</span>
               <span className="text-2xl font-bold text-rose-400 font-mono">{wrongCount}</span>
             </div>
           </div>
           
           <div className="flex gap-4">
             <button
               onClick={() => {
                 setScore(0);
                 setCorrectCount(0);
                 setWrongCount(0);
                 setGameOver(false);
                 setIsPlaying(true);
               }}
               className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-xl transition-colors"
             >
               إعادة اللعب
             </button>
             <button
               onClick={() => navigate('/solo')}
               className="flex-1 bg-slate-800/80 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors border border-slate-700/50"
             >
               الأقسام
             </button>
           </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <PlayBackground theme="sentence_order" />
    <div className="min-h-screen p-4 flex flex-col max-w-4xl mx-auto space-y-6 relative z-10">
      <header className="flex justify-between items-center bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 p-4 rounded-3xl shrink-0 shadow-lg">
        <button onClick={finishGame} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-center">
             <span className="text-[10px] text-slate-400">النقاط</span>
             <span className="font-bold text-emerald-400">{score}</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-[10px] text-slate-400">صح</span>
             <span className="font-bold text-green-400">{correctCount}</span>
           </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold font-mono ${timeLeft <= 5 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-300'}`}>
          <Clock className="w-4 h-4" />
          {timeLeft}s
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-8">
         <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden shrink-0">
            <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-sky-500'}`} style={{ width: `${(timeLeft / maxTime) * 100}%` }}></div>
         </div>
         
         <div className="flex-1 flex flex-col justify-center gap-12">
            
            {/* منطقة الإجابة */}
            <div className={`min-h-[120px] p-6 rounded-3xl border-2 transition-all flex flex-wrap content-start gap-3 ${resultState === 'correct' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : resultState === 'wrong' ? 'bg-rose-500/10 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)] animate-shake' : 'bg-slate-900 border-slate-700 shadow-inner'}`}>
               {selectedWords.length === 0 && <span className="text-slate-500 text-center w-full mt-4 font-bold">اضغط على الكلمات بالأسفل لترتيبها هنا...</span>}
               {selectedWords.map((word) => (
                 <button
                   key={word.id}
                   onClick={() => deselectWord(word)}
                   disabled={resultState !== 'none'}
                   className="px-5 py-3 bg-sky-600 text-white font-bold rounded-2xl shadow-lg hover:bg-sky-500 transition-all text-lg"
                 >
                   {word.text}
                 </button>
               ))}
               {resultState === 'correct' && (
                 <div className="absolute inset-0 flex items-center justify-center right-0 left-0 mix-blend-overlay pointer-events-none">
                    <Check className="w-24 h-24 text-emerald-500 opacity-50" />
                 </div>
               )}
               {resultState === 'wrong' && (
                 <div className="absolute inset-0 flex items-center justify-center right-0 left-0 mix-blend-overlay pointer-events-none">
                    <X className="w-24 h-24 text-rose-500 opacity-50" />
                 </div>
               )}
            </div>

            {/* منطقة الكلمات المتاحة */}
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 min-h-[160px] flex flex-wrap content-start justify-center gap-3">
               {availableWords.map((word) => (
                 <button
                   key={word.id}
                   onClick={() => selectWord(word)}
                   disabled={resultState !== 'none'}
                   className="px-5 py-3 bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-2xl shadow-md hover:bg-slate-700 hover:border-slate-500 transition-all text-lg hover:-translate-y-1"
                 >
                   {word.text}
                 </button>
               ))}
            </div>

         </div>
      </div>
    </div>
    </>
  );
}
