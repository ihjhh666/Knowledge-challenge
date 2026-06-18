import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, XCircle, CheckCircle, Sparkles, Trophy, Clock, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { storage } from '../lib/storage';
import { generateFamousQuestions, FamousQuestion } from '../data/famousData';
import { updateStats as doUpdateAchStats, getPlayerStats } from '../lib/achievements';
import { tfAudio } from '../lib/tfAudio';

// Helper for sound
function safePlayObject(audioFunc: () => void) {
  if (storage.getSettings().sfxEnabled && audioFunc) {
    audioFunc();
  }
}

// Particle explosion for correct answers
const ConfettiExplosion = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
      {[...Array(20)].map((_, i) => (
        <motion.div
           key={i}
           initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
           animate={{ 
             opacity: 0, 
             scale: Math.random() * 1.5 + 0.5,
             x: (Math.random() - 0.5) * window.innerWidth * 0.8,
             y: (Math.random() - 0.5) * window.innerHeight * 0.8 
           }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="absolute w-4 h-4 rounded-full"
           style={{ backgroundColor: ['#10B981', '#34D399', '#FCD34D', '#F59E0B'][Math.floor(Math.random() * 4)] }}
        />
      ))}
    </div>
  );
};

export default function FamousSolo() {
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<FamousQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | null>(null);
  
  // Effects
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Generate questions avoiding repeats
    setQuestions(generateFamousQuestions(answeredIds));
    
    // Add achievement listener
    const handleAch = () => {
       safePlayObject(tfAudio.achievement);
    };
    window.addEventListener('achievement_unlocked', handleAch);
    return () => window.removeEventListener('achievement_unlocked', handleAch);
  }, []);

  useEffect(() => {
    // Timer Logic
    if (selectedAnswer !== null || gameOver || questions.length === 0) {
       if (timerRef.current) clearInterval(timerRef.current);
       return;
    }

    setTimeLeft(15);
    timerRef.current = setInterval(() => {
       setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleAnswer(null, true);
            return 0;
          }
          return prev - 1;
       });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, selectedAnswer, gameOver, questions.length]);

  const handleAnswer = (answer: 'A' | 'B' | null, isTimeOut: boolean = false) => {
    if (selectedAnswer !== null || gameOver) return;
    
    const currentQ = questions[currentIndex];
    
    // Mark as answered
    setAnsweredIds(prev => {
      const newSet = new Set(prev);
      newSet.add(currentQ.id);
      return newSet;
    });

    setSelectedAnswer(answer || (currentQ.correct === 'A' ? 'B' : 'A')); // If timeout, choose wrong answer visually for processing
    
    const isCorrect = !isTimeOut && answer === currentQ.correct;

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 800);

      const multiplier = getComboMultiplier(streak + 1);
      const basePoints = 15;
      const timeBonus = Math.floor(timeLeft / 2);
      
      setScore(s => s + (basePoints + timeBonus) * multiplier);
      
      setStreak(s => {
        const newStreak = s + 1;
        setBestStreak(bs => Math.max(bs, newStreak));
        if (storage.getSettings().sfxEnabled) {
           if (newStreak === 15) tfAudio.comboLegendary();
           else if (newStreak === 10) tfAudio.comboLegendary();
           else if (newStreak === 5) tfAudio.comboExcellent();
           else if (newStreak === 3) tfAudio.comboGood();
           else tfAudio.correct();
        }
        return newStreak;
      });
      setCorrectCount(c => c + 1);
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setStreak(0);
      setWrongCount(w => w + 1);
      
      safePlayObject(tfAudio.wrong);

      setHearts(h => {
        const newHearts = h - 1;
        if (newHearts <= 0) {
          endGame();
        } else {
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 500);
          if (storage.getSettings().sfxEnabled) {
             if (newHearts === 1) setTimeout(() => tfAudio.lastHeart(), 200);
             else setTimeout(() => tfAudio.loseHeart(), 200);
          }
        }
        return newHearts;
      });
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      if (hearts > 1 || isCorrect) {
        setCurrentIndex(i => i + 1);
        if (currentIndex > questions.length - 10) {
          setQuestions(q => [...q, ...generateFamousQuestions(answeredIds)]);
        }
      }
    }, 1500);
  };

  const getComboMultiplier = (currentStreak: number) => {
     if (currentStreak >= 15) return 4;
     if (currentStreak >= 10) return 3;
     if (currentStreak >= 5) return 2;
     return 1;
  };

  const getEvaluation = (correct: number) => {
    if (correct >= 30) return { title: 'أسطورة المعرفة', color: 'text-purple-400', blur: 'bg-purple-400/20' };
    if (correct >= 20) return { title: 'ممتاز', color: 'text-emerald-400', blur: 'bg-emerald-400/20' };
    if (correct >= 10) return { title: 'جيد', color: 'text-amber-400', blur: 'bg-amber-400/20' };
    return { title: 'مبتدئ', color: 'text-slate-400', blur: 'bg-slate-400/20' };
  };

  const endGame = async () => {
    setGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const localStats = getPlayerStats();
    const isNewRecord = score > 0 && score > (localStats.famousHighScore || 0);

    if (storage.getSettings().sfxEnabled) {
      if (isNewRecord) {
        tfAudio.newRecord();
      } else {
        setTimeout(() => tfAudio.lose(), 500);
      }
    }

    const addedXp = score * 10;
    
    doUpdateAchStats({
      famousRoundsPlayed: (localStats.famousRoundsPlayed || 0) + 1,
      famousCorrectAnswers: (localStats.famousCorrectAnswers || 0) + correctCount,
      famousBestStreak: Math.max(localStats.famousBestStreak || 0, Math.max(streak, bestStreak)),
      famousHighScore: Math.max(localStats.famousHighScore || 0, score),
      totalXp: (localStats.totalXp || 0) + addedXp
    });
  };

  const currentQ = questions[currentIndex];

  if (!questions.length) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl">جاري التحميل...</div>;

  const currentMultiplier = getComboMultiplier(streak);
  const isTimeExpiring = timeLeft <= 3 && !selectedAnswer && !gameOver;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Confetti Explosion */}
      {showConfetti && <ConfettiExplosion />}

      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/10 bg-slate-900/50 sticky top-0 z-50 backdrop-blur-md">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        {/* Timer */}
        {!gameOver && (
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold transition-colors ${
            isTimeExpiring ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-white/10 text-slate-200'
          }`}>
             <Clock className="w-5 h-5" />
             <span className="text-xl font-mono w-6 text-center">{timeLeft}</span>
          </div>
        )}

        <div className="flex gap-4 items-center">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
               {currentMultiplier > 1 && (
                 <span className="text-sm font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">x{currentMultiplier}</span>
               )}
               <div className="text-xl font-bold font-mono text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">{score}</div>
            </div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">النقاط</div>
          </div>
          
          <div className={`flex gap-1.5 items-center px-3 py-1.5 rounded-2xl border transition-colors ${
            hearts === 1 ? 'bg-rose-500/20 border-rose-500/40 animate-pulse' : 'bg-slate-800/50 border-slate-700/50'
          }`}>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{ 
                  scale: i < hearts ? [1, 1.2, 1] : 1,
                  opacity: i < hearts ? 1 : 0.2
                }}
                transition={{ duration: 0.3 }}
              >
                <Heart 
                  className={`w-6 h-6 transition-colors ${
                    i < hearts 
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' 
                      : 'text-slate-700 fill-slate-800'
                  }`} 
                />
              </motion.div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] pb-24 relative">
        
        {/* Flashing effect for damage */}
        <AnimatePresence>
          {isFlashing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-rose-500/20 pointer-events-none z-10 box-shadow-[inset_0_0_100px_rgba(244,63,94,0.5)] border-[8px] border-rose-500"
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!gameOver ? (
            <motion.div 
              key={currentIndex}
              initial={{ x: 50, opacity: 0 }}
              animate={{ opacity: 1, x: isShaking ? [-10, 10, -10, 10, 0] : 0 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center gap-6 z-20"
            >
              {/* Category Info with difficulty indicator */}
              <div className="flex gap-2 items-center">
                 <div className="bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-lg flex items-center gap-2">
                   <span className="text-sm font-bold text-slate-300">{currentQ.category}</span>
                 </div>
                 <div className={`px-3 py-2 rounded-full text-xs font-bold ${
                   currentQ.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                   currentQ.difficulty === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                   currentQ.difficulty === 'hard' ? 'bg-amber-500/20 text-amber-400' :
                   'bg-rose-500/20 text-rose-400'
                 }`}>
                    {currentQ.difficulty === 'easy' ? 'سهل' :
                     currentQ.difficulty === 'medium' ? 'متوسط' :
                     currentQ.difficulty === 'hard' ? 'صعب' : 'نادر'}
                 </div>
              </div>

              {/* Question Text */}
              <h2 className="text-center text-3xl md:text-4xl font-extrabold font-heading text-white drop-shadow-md leading-tight max-w-2xl px-4">
                {currentQ.question}
              </h2>

              <div className="text-center text-sm mb-2 text-emerald-400 font-bold opacity-80 bg-emerald-900/30 px-4 py-1.5 rounded-full border border-emerald-500/20">
                (الوحدة: {currentQ.unit})
              </div>

              {/* Streak info inline */}
              {streak > 1 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-2 mb-2"
                >
                  <span>🔥</span>
                  متتالية x{streak}
                  {currentMultiplier > 1 && <span className="text-white ml-2">({currentMultiplier}x نقطة)</span>}
                </motion.div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-2 px-2">
                 {/* Option A */}
                 <OptionCard
                    option="A"
                    entity={currentQ.optionA}
                    isSelected={selectedAnswer === 'A'}
                    showAnswer={selectedAnswer !== null}
                    isCorrect={currentQ.correct === 'A'}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleAnswer('A')}
                 />
                 
                 {/* Option B */}
                 <OptionCard
                    option="B"
                    entity={currentQ.optionB}
                    isSelected={selectedAnswer === 'B'}
                    showAnswer={selectedAnswer !== null}
                    isCorrect={currentQ.correct === 'B'}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleAnswer('B')}
                 />
              </div>

            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-slate-700/50 p-6 md:p-10 rounded-3xl w-full max-w-md flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
              
              {/* Evaluation Badge */}
              {(() => {
                const evalData = getEvaluation(correctCount);
                return (
                  <div className="mb-6 relative">
                     <div className={`absolute -inset-4 rounded-full blur-2xl ${evalData.blur}`}></div>
                     <h3 className={`text-3xl md:text-4xl font-black font-heading relative z-10 ${evalData.color} drop-shadow-lg`}>
                       {evalData.title}
                     </h3>
                  </div>
                );
              })()}

              <h2 className="text-2xl font-bold mb-6 text-white relative z-10">انتهت الجولة!</h2>

              <div className="grid grid-cols-2 gap-4 w-full mb-8 relative z-10">
                <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/80">
                  <div className="text-2xl font-bold text-indigo-400 mb-1">{score}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">النقاط</div>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/80">
                  <div className="text-2xl font-bold text-amber-400 mb-1">{bestStreak}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">أعلى متتالية</div>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/80">
                  <div className="text-xl font-bold text-emerald-400 mb-1">{correctCount}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">صحيح</div>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/80">
                  <div className="text-xl font-bold text-rose-400 mb-1">{wrongCount}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">خاطئ</div>
                </div>
              </div>

              <div className="text-center w-full mb-8 bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 relative z-10">
                <div className="text-sm text-indigo-300 font-bold mb-1 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> XP المكتسبة
                </div>
                <div className="text-3xl font-bold text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                  +{score * 10}
                </div>
              </div>

              <div className="space-y-3 w-full relative z-10">
                <button 
                  onClick={() => {
                    setQuestions(generateFamousQuestions(answeredIds));
                    setCurrentIndex(0);
                    setHearts(3);
                    setScore(0);
                    setStreak(0);
                    setBestStreak(0);
                    setCorrectCount(0);
                    setWrongCount(0);
                    setGameOver(false);
                    setSelectedAnswer(null);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95 text-lg"
                >
                  العب مرة أخرى
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-transform active:scale-95 border border-slate-700"
                >
                  العودة للرئيسية
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function OptionCard({ option, entity, isSelected, showAnswer, isCorrect, disabled, onClick }: any) {
  let stateStyles = "bg-slate-800/80 border-slate-700 hover:bg-slate-750 hover:border-slate-500";
  
  if (showAnswer) {
    if (isCorrect) {
      stateStyles = "bg-emerald-500/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] saturate-150 z-10 scale-105";
    } else if (isSelected && !isCorrect) {
      stateStyles = "bg-rose-500/20 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)] saturate-150";
    } else {
      stateStyles = "bg-slate-800/50 border-slate-700 opacity-50 grayscale";
    }
  } else if (isSelected) {
    stateStyles = "bg-indigo-500/20 border-indigo-500";
  }

  return (
    <motion.button
      whileHover={!disabled ? { y: -5, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full h-56 md:h-72 flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 overflow-hidden group ${stateStyles}`}
    >
      {/* Background Image if available */}
      {entity.image && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity mix-blend-overlay"
          style={{ backgroundImage: `url(${entity.image})` }}
        />
      )}
      {entity.image && <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />}

      <div className="relative z-10 flex flex-col items-center w-full h-full justify-center">
        {!entity.image && (
          <div className="text-6xl md:text-8xl mb-4 drop-shadow-2xl grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-300">
             {entity.emoji}
          </div>
        )}
        {entity.image && !entity.emoji && (
          <div className="w-20 h-20 mb-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-sm">
            <ImageIcon className="w-10 h-10 text-white/50" />
          </div>
        )}

        <h3 className="text-2xl md:text-3xl font-bold font-heading text-white text-center break-words w-full px-2 drop-shadow-lg leading-tight">
          {entity.name}
        </h3>
        
        {/* Value explicitly revealed */}
        <AnimatePresence>
           {showAnswer && (
             <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.8 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               className={`absolute bottom-6 left-0 w-full text-center font-black text-4xl md:text-5xl tracking-tight drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] ${isCorrect ? 'text-emerald-400' : 'text-slate-300'}`}
             >
               {entity.value.toLocaleString('en-US')}
             </motion.div>
           )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAnswer && isCorrect && isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: [1, 1.5, 1], opacity: 1, rotate: 0 }}
            className="absolute top-4 right-4 text-emerald-400 bg-emerald-950/50 p-2 rounded-full border border-emerald-500/50 backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.5)] z-20"
          >
             <CheckCircle className="w-8 h-8" />
          </motion.div>
        )}
        {showAnswer && !isCorrect && isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: 45 }}
            animate={{ scale: [1, 1.5, 1], opacity: 1, rotate: 0 }}
            className="absolute top-4 right-4 text-rose-400 bg-rose-950/50 p-2 rounded-full border border-rose-500/50 backdrop-blur-sm shadow-[0_0_20px_rgba(244,63,94,0.5)] z-20"
          >
             <XCircle className="w-8 h-8" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
