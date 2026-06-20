import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, Flame, Heart, ScrollText, Sparkles, BookOpen, Crown } from 'lucide-react';
import { generateProverbQuestions } from '../lib/proverbsData';
import { proverbsAudio } from '../lib/proverbsAudio';
import { storage } from '../lib/storage';
import { updateStats, getPlayerStats } from '../lib/achievements';
import { calculateLevel, calculateEarnedXp } from '../lib/level';
import { PlayBackground } from '../components/PlayBackground';
import { getHudStyle, getCardStyle } from '../lib/themeStyles';

// Pre-generate a list
let QUESTIONS_QUEUE = generateProverbQuestions(100);

function getNextQuestion() {
   if (QUESTIONS_QUEUE.length < 5) {
      QUESTIONS_QUEUE = [...QUESTIONS_QUEUE, ...generateProverbQuestions(100)];
   }
   return QUESTIONS_QUEUE.shift();
}

export default function ProverbsSolo() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [currentQ, setCurrentQ] = useState<any>(null);
  
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const parchmentStyle = {};

  const loadQuestion = useCallback(() => {
    const q = getNextQuestion();
    setCurrentQ(q);
    
    // Dynamic time based on difficulty
    const time = q.difficulty === 0 ? 15 : q.difficulty === 1 ? 20 : 25;
    setTimeLeft(time);
    setMaxTime(time);
    setSelectedAnswer(null);
  }, []);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      loadQuestion();
    }
  }, [isPlaying, gameOver, loadQuestion]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && !gameOver && !selectedAnswer) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAnswer(null, true);
            return 0;
          }
           // Low time sound
          if (prev === 4) proverbsAudio.playWrong(); // Soft warning ?
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, gameOver, selectedAnswer]);

  const handleEndGame = () => {
    setGameOver(true);
    proverbsAudio.playRoundComplete();
    const s = getPlayerStats();
    
    // Increase correct count and Best Streak
    // roundsplayed + 1
    const xpEarned = calculateEarnedXp(score);

    updateStats({
      totalXp: (s.totalXp || 0) + xpEarned,
      proverbsRoundsPlayed: (s.proverbsRoundsPlayed || 0) + 1,
      proverbsCorrect: (s.proverbsCorrect || 0) + correctCount,
      proverbsBestStreak: Math.max(s.proverbsBestStreak || 0, maxStreak),
    });
  };

  const handleAnswer = (answer: string | null, timeout: boolean = false) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer || "TIMEOUT");
    
    const isCorrect = !timeout && answer === currentQ.correctAnswer;
    
    if (isCorrect) {
      proverbsAudio.playCorrect();
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      
      if (newStreak > 0 && newStreak % 5 === 0) {
        proverbsAudio.playStreak();
      }

      setCorrectCount(prev => prev + 1);
      
      const timeBonus = Math.floor((timeLeft / maxTime) * 10);
      const diffBonus = currentQ.difficulty === 2 ? 30 : currentQ.difficulty === 1 ? 20 : 10;
      setScore(prev => prev + diffBonus + timeBonus);

      setTimeout(() => {
        loadQuestion();
      }, 1200);

    } else {
      proverbsAudio.playWrong();
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);

      setTimeout(() => {
        if (newLives <= 0) {
          handleEndGame();
        } else {
          loadQuestion();
        }
      }, 1500);
    }
  };

  if (!isPlaying) {
    return (
      <>
      <PlayBackground theme="proverbs" />
      <div className="min-h-screen text-white p-4 relative z-10" dir="rtl">
        <button onClick={() => navigate('/solo')} className="flex items-center gap-2 text-amber-500/80 hover:text-amber-400 font-bold mb-8 transition-colors drop-shadow-md">
          <ArrowRight className="w-5 h-5" /> عودة للأطوار
        </button>
        
        <div className="max-w-xl mx-auto text-center space-y-8 mt-12 bg-black/60 backdrop-blur-md p-8 rounded-3xl border border-amber-900/50 shadow-2xl">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-700 to-amber-900 rounded-full flex items-center justify-center border-4 border-amber-500/30 shadow-xl shadow-amber-900/20">
            <BookOpen className="w-12 h-12 text-amber-100" />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold font-heading text-amber-50 mb-4">أكمل المثل</h1>
            <p className="text-amber-200/60 leading-relaxed max-w-md mx-auto">
              اختبر حكمتك ومعرفتك بالأمثال الشعبية والعربية والتراثية الطور يعتمد على الدقة والمعرفة. أثبت أنك حكيم القرية!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center py-6 border-y border-amber-900/30">
            <div className="space-y-1">
              <ScrollText className="w-6 h-6 text-amber-500 mx-auto" />
              <div className="text-sm font-bold text-amber-100">آلاف الأمثال</div>
              <div className="text-xs text-amber-500/60">عربية وشعبية</div>
            </div>
            <div className="space-y-1 border-x border-amber-900/30">
              <Crown className="w-6 h-6 text-yellow-500 mx-auto" />
              <div className="text-sm font-bold text-yellow-100">إنجازات حصرية</div>
              <div className="text-xs text-amber-500/60">ألقاب تاريخية</div>
            </div>
            <div className="space-y-1">
              <Flame className="w-6 h-6 text-orange-500 mx-auto" />
              <div className="text-sm font-bold text-orange-100">ميزة السلسلة</div>
              <div className="text-xs text-amber-500/60">مكافآت خفية</div>
            </div>
          </div>

          <button
            onClick={() => {
              proverbsAudio.playRoundComplete();
              setIsPlaying(true);
            }}
            className="w-full py-4 text-xl font-bold rounded-2xl bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-lg shadow-amber-900/50 hover:from-amber-500 hover:to-amber-700 transition-all active:scale-95"
          >
            بداية التحدي
          </button>
        </div>
      </div>
      </>
    );
  }

  if (gameOver) {
    const xp = calculateEarnedXp(score);
    return (
      <>
      <PlayBackground theme="proverbs" />
      <div className="min-h-screen p-4 flex items-center justify-center font-sans relative z-10" dir="rtl">
        <div className="bg-black/60 border border-amber-900/50 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl backdrop-blur-md">
          <BookOpen className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-amber-50 mb-2">انتهت الجولة</h2>
          <p className="text-amber-200/60 mb-8">حكمتك أضاءت الدرب</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-amber-900/40 p-4 rounded-2xl border border-amber-700/50">
              <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{correctCount}</div>
              <div className="text-xs text-amber-400/80">إجابة صحيحة</div>
            </div>
            <div className="bg-amber-900/40 p-4 rounded-2xl border border-amber-700/50">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{score}</div>
              <div className="text-xs text-amber-400/80">نقطة</div>
            </div>
            <div className="bg-amber-900/40 p-4 rounded-2xl border border-amber-700/50">
              <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{maxStreak}</div>
              <div className="text-xs text-amber-400/80">أفضل سلسلة</div>
            </div>
            <div className="bg-amber-900/40 p-4 rounded-2xl border border-amber-700/50">
              <Crown className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">+{xp}</div>
              <div className="text-xs text-amber-400/80">خبرة XP</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => {
                setScore(0);
                setCorrectCount(0);
                setStreak(0);
                setMaxStreak(0);
                setLives(3);
                setGameOver(false);
                proverbsAudio.playRoundComplete();
              }}
              className="flex-1 py-4 font-bold rounded-2xl bg-amber-600 text-white hover:bg-amber-500 transition-colors shadow-lg"
            >
              العب مجدداً
            </button>
            <button
              onClick={() => navigate('/solo')}
              className="flex-1 py-4 font-bold rounded-2xl bg-slate-800/80 text-white hover:bg-slate-700 transition-colors border border-amber-900/50"
            >
              عودة للقائمة
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <PlayBackground theme="proverbs" />
    <div className="min-h-screen p-4 flex flex-col relative z-10" dir="rtl">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
        {/* Header HUD */}
        <div className={`flex items-center justify-between mb-8 p-4 rounded-xl ${getHudStyle('proverbs')}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setGameOver(true)} className="p-2 hover:bg-black/20 rounded-xl transition-colors">
              <ArrowRight className="w-5 h-5 opacity-80" />
            </button>
            <div className="flex bg-black/20 border border-white/10 px-4 py-2 rounded-xl gap-2 font-mono font-bold text-xl text-amber-300 items-center shadow-inner pt-2.5">
              <Zap className="w-5 h-5 text-amber-400" /> {score}
            </div>
          </div>
          
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                className={`w-7 h-7 sm:w-8 sm:h-8 ${i < lives ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-slate-800/50'} transition-all`} 
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/20 rounded-full h-3 max-w-sm mx-auto mb-8 border border-white/10 overflow-hidden shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-500' : 'bg-amber-600'}`}
            style={{ width: `${(timeLeft / maxTime) * 100}%` }}
          />
        </div>

        {streak >= 3 && (
          <div className="text-center mb-4 animate-bounce text-orange-600 font-bold flex items-center justify-center gap-2 drop-shadow-md">
            <Flame className="w-5 h-5" /> سلسلة {streak} متتالية!
          </div>
        )}

        {/* Question Card */}
        {currentQ && (
          <div className={`p-6 md:p-10 text-center shadow-lg mb-8 flex-1 flex flex-col justify-center relative ${getCardStyle('proverbs')}`}>
             
             {/* Subtitle based on category */}
             <div className="absolute top-4 right-4 bg-amber-900/30 text-amber-500 px-3 py-1 rounded-full text-xs font-bold border border-amber-700/50">
               {currentQ.category === 'wisdom' ? 'حكمة' : currentQ.category === 'proverb' ? 'مثل شعبي' : 'مقولة'}
             </div>

             <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold font-heading text-amber-50 leading-tight drop-shadow-md">
                 {currentQ.text}
             </h2>
          </div>
        )}

        {/* Options */}
        {currentQ && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
            {currentQ.options.map((opt: string, i: number) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === currentQ.correctAnswer;
              
              let styleClass = "bg-black/60 border-amber-900/50 text-amber-50 hover:bg-amber-900/40 hover:border-amber-700";
              
              if (selectedAnswer) {
                if (isCorrect) {
                  styleClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]";
                } else if (isSelected) {
                  styleClass = "bg-rose-500/20 border-rose-500 text-rose-400";
                } else {
                  styleClass = "bg-black/40 border-slate-800 text-slate-600 opacity-50";
                }
              }

              return (
                <button
                  key={i}
                  disabled={!!selectedAnswer}
                  onClick={() => handleAnswer(opt)}
                  className={`relative p-5 md:p-6 rounded-2xl border-2 text-lg md:text-xl font-bold font-heading transition-all ${styleClass}`}
                >
                  {opt}
                  {selectedAnswer && isCorrect && (
                    <Sparkles className="absolute top-1/2 left-4 -translate-y-1/2 w-6 h-6 text-emerald-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
