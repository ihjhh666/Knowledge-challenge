import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Image as ImageIcon, Heart, Trophy, Flame, Target, Star } from 'lucide-react';
import { audio } from '../lib/audio';
import { getPlayerStats, updateStats } from '../lib/achievements';
import { calculateEarnedXp } from '../lib/level';
import { LOGOS_DATA, LogoItem } from '../lib/logosData';
import { PlayBackground } from '../components/PlayBackground';
import { getHudStyle, getCardStyle } from '../lib/themeStyles';

export default function LogoGame() {
  const navigate = useNavigate();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const [currentLogo, setCurrentLogo] = useState<LogoItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(15);
  const [maxTime, setMaxTime] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  
  const seenIds = useRef<Set<string>>(new Set());

  const [difficultyMode, setDifficultyMode] = useState<'normal'|'silhouette'>('normal');

  const generateOptions = (logo: LogoItem) => {
    let pool = LOGOS_DATA.filter(l => l.category === logo.category && l.id !== logo.id).map(l => l.name);
    if (pool.length < 3) {
      pool = LOGOS_DATA.filter(l => l.id !== logo.id).map(l => l.name);
    }
    
    pool = pool.sort(() => 0.5 - Math.random());
    const wrong = pool.slice(0, 3);
    
    return [logo.name, ...wrong].sort(() => 0.5 - Math.random());
  };

  const loadQuestion = useCallback(async () => {
    setIsLoadingQuestion(true);
    let logo: LogoItem | null = null;
    let isValid = false;
    let attempts = 0;

    while (!isValid && attempts < 10) {
      // Filter unseen logos
      let unseen = LOGOS_DATA.filter(l => !seenIds.current.has(l.id));
      if (unseen.length === 0) {
        seenIds.current.clear();
        unseen = LOGOS_DATA;
      }
      
      logo = unseen[Math.floor(Math.random() * unseen.length)];
      seenIds.current.add(logo.id);
      
      // Try loading image
      try {
        isValid = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = logo!.url;
        });
      } catch (e) {
        isValid = false;
      }
      
      attempts++;
    }

    if (!logo || !isValid) {
      // Failed to find any working logo after 10 tries... fallback
      handleEndGame();
      return;
    }
    
    setCurrentLogo(logo);
    setOptions(generateOptions(logo));
    
    const time = logo.difficulty === 3 ? 15 : logo.difficulty === 2 ? 12 : 10;
    setTimeLeft(time);
    setMaxTime(time);
    setSelectedAnswer(null);
    setIsLoadingQuestion(false);
  }, []);

  useEffect(() => {
    if (isPlaying && !gameOver && !currentLogo && !isLoadingQuestion) {
      loadQuestion();
    }
  }, [isPlaying, gameOver, currentLogo, isLoadingQuestion, loadQuestion]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && !gameOver && !selectedAnswer && !isLoadingQuestion) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAnswer(null, true);
            return 0;
          }
          if (prev === 4) audio.tick(); // Warning
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, gameOver, selectedAnswer]);

  const handleEndGame = () => {
    setGameOver(true);
    audio.roundEnd();
    
    const s = getPlayerStats();
    const xpEarned = calculateEarnedXp(true, score);

    updateStats({
      totalXp: (s.totalXp || 0) + xpEarned,
      logosRoundsPlayed: (s.logosRoundsPlayed || 0) + 1,
      logosCorrect: (s.logosCorrect || 0) + correctCount,
      logosBestStreak: Math.max(s.logosBestStreak || 0, maxStreak),
    });
  };

  const handleAnswer = (answer: string | null, timeout: boolean = false) => {
    if (selectedAnswer || !currentLogo) return;
    
    setSelectedAnswer(answer || "TIMEOUT");
    
    const isCorrect = !timeout && answer === currentLogo.name;
    
    if (isCorrect) {
      audio.correct();
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      
      if (newStreak > 0 && newStreak % 5 === 0) {
        audio.streak(1);
      }

      setCorrectCount(prev => prev + 1);
      
      const timeBonus = Math.floor((timeLeft / maxTime) * 10);
      const diffBonus = currentLogo.difficulty === 3 ? 30 : currentLogo.difficulty === 2 ? 20 : 10;
      const silhouetteBonus = difficultyMode === 'silhouette' ? 100 : 0;
      setScore(prev => prev + diffBonus + timeBonus + silhouetteBonus);

      setTimeout(() => {
        loadQuestion();
      }, 1200);

    } else {
      audio.wrong();
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
      <PlayBackground theme="logos" />
      <div className="min-h-screen text-white p-4 relative z-10" dir="rtl">
        <button onClick={() => navigate('/solo')} className="flex items-center gap-2 text-pink-500/80 hover:text-pink-400 font-bold mb-8 transition-colors drop-shadow-md">
          <ArrowRight className="w-5 h-5" /> عودة للأطوار
        </button>
        
        <div className="max-w-xl mx-auto text-center space-y-8 mt-12 bg-slate-900/80 backdrop-blur-md shadow-2xl p-8 rounded-3xl border border-pink-900/50">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-pink-500 to-rose-700 rounded-full flex items-center justify-center border-4 border-pink-500/30 shadow-xl shadow-pink-900/20">
            <ImageIcon className="w-12 h-12 text-white" />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold font-heading text-white mb-4">خمن الشعار</h1>
            <p className="text-slate-300 leading-relaxed max-w-md mx-auto">
              اختبر قوة ذاكرتك ومعرفتك بالعلامات التجارية والشركات بجميع الفئات. هل تتذكر شعار شركتك المفضلة بدون حروف؟
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center py-6 border-y border-slate-800/50">
            <div className="space-y-1">
              <Star className="w-6 h-6 text-pink-500 mx-auto" />
              <div className="text-sm font-bold text-white">مئات الشعارات</div>
              <div className="text-xs text-slate-400">من مختلف الفئات</div>
            </div>
            <div className="space-y-1 border-x border-slate-800/50">
              <Trophy className="w-6 h-6 text-yellow-500 mx-auto" />
              <div className="text-sm font-bold text-white">إنجازات حصرية</div>
              <div className="text-xs text-slate-400">ألقاب ونقاط</div>
            </div>
            <div className="space-y-1">
              <Target className="w-6 h-6 text-purple-500 mx-auto" />
              <div className="text-sm font-bold text-white">دقة وملاحظة</div>
              <div className="text-xs text-slate-400">اختبر عينيك</div>
            </div>
          </div>

          <div className="space-y-3">
             <div className="text-right text-slate-200 font-bold mb-2">اختر مستوى الصعوبة:</div>
             <button
               onClick={() => setDifficultyMode('normal')}
               className={`w-full p-4 rounded-xl border-2 font-bold transition-all backdrop-blur-sm ${difficultyMode === 'normal' ? 'bg-pink-500/30 border-pink-500 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}
             >
               <div className="text-lg">عادي</div>
               <div className="text-sm font-normal opacity-80 mt-1">عرض الشعار بألوانه الطبيعية</div>
             </button>
             <button
               onClick={() => setDifficultyMode('silhouette')}
               className={`w-full p-4 rounded-xl border-2 font-bold transition-all backdrop-blur-sm ${difficultyMode === 'silhouette' ? 'bg-purple-500/30 border-purple-500 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}
             >
               <div className="text-lg">مستحيل (ظل فقط)</div>
               <div className="text-sm font-normal opacity-80 mt-1">عرض الشعار كلون أسود داكن (للمحترفين)</div>
             </button>
          </div>

          <button
            onClick={() => {
              audio.startGame();
              setIsPlaying(true);
            }}
            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 active:scale-95 transition-all text-white font-bold py-5 rounded-2xl text-xl shadow-lg shadow-pink-900/50 hover:shadow-pink-900/80 mt-6"
          >
            ابدأ اللعب الآن
          </button>
        </div>
      </div>
      </>
    );
  }

  if (gameOver) {
    return (
      <>
      <PlayBackground theme="logos" />
      <div className="min-h-screen text-white p-4 flex flex-col items-center justify-center font-heading relative z-10" dir="rtl">
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-rose-600"></div>
          
          <div className="w-24 h-24 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Trophy className="w-12 h-12" />
          </div>
          
          <h2 className="text-4xl font-bold mb-2 text-white">انتهت اللعبة!</h2>
          <p className="text-slate-300 mb-8 bg-black/40 p-4 rounded-xl inline-block mt-2">لقد نفدت محاولاتك في التعرف على الشعارات.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 shadow-md">
              <div className="text-slate-400 text-sm mb-1">النتيجة</div>
              <div className="text-3xl font-bold font-mono text-yellow-400">{score}</div>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 shadow-md">
              <div className="text-slate-400 text-sm mb-1">إجابات صحيحة</div>
              <div className="text-3xl font-bold font-mono text-emerald-400">{correctCount}</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/solo')}
              className="flex-1 bg-slate-800/80 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors border border-slate-700/50 shadow-md"
            >
              عودة
            </button>
            <button
              onClick={() => {
                setGameOver(false);
                setScore(0);
                setLives(3);
                setStreak(0);
                setMaxStreak(0);
                setCorrectCount(0);
                seenIds.current.clear();
                audio.startGame();
                loadQuestion();
              }}
              className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all"
            >
              العب مجدداً
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (!currentLogo) return null;

  return (
    <>
    <PlayBackground theme="logos" />
    <div className="min-h-screen text-white flex flex-col font-heading relative z-10" dir="rtl">
      {/* Header */}
      <div className={`p-4 flex justify-between items-center shadow-lg sticky top-0 z-10 ${getHudStyle('logos')}`}>
        <div className="flex gap-1" dir="ltr">
          {[...Array(3)].map((_, i) => (
            <Heart key={i} className={`w-6 h-6 ${i < lives ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'text-slate-700/50'} transition-all duration-300`} />
          ))}
        </div>
        
        <div className="text-2xl font-bold font-mono text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
          {score}
        </div>
        
        <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full border border-white/10">
          <Flame className={`w-5 h-5 ${streak > 2 ? 'text-orange-400 fill-orange-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="font-mono font-bold text-white/80">{streak}</span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="h-1.5 w-full bg-slate-900 border-b border-cyan-500/20">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 3 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : timeLeft <= 7 ? 'bg-amber-500' : 'bg-cyan-500'}`}
          style={{ width: `${(timeLeft / maxTime) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full">
        <div className={`flex-1 flex flex-col items-center justify-center min-h-[300px] my-6 ${getCardStyle('logos')}`}>
          <div className={`relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center p-8 rounded-3xl border-4 transition-all duration-300
            ${selectedAnswer 
              ? (selectedAnswer === currentLogo.name 
                  ? 'border-emerald-500 bg-white drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]' 
                  : 'border-rose-500 bg-white drop-shadow-[0_0_30px_rgba(244,63,94,0.5)] animate-[shake_0.5s_ease-in-out]')
              : 'border-white bg-white shadow-xl'}`
          }>
            <img 
              src={currentLogo.url} 
              alt="Logo" 
              className={`max-w-full max-h-full object-contain ${difficultyMode === 'silhouette' ? 'brightness-0 contrast-200' : 'drop-shadow-lg'}`}
              loading="lazy"
            />
          </div>
          
          <div className="mt-8 text-center text-slate-400">
            الفئة: <span className="text-pink-400 font-bold ml-1">{currentLogo.category === 'apps' ? 'تطبيقات' : currentLogo.category === 'tech' ? 'تقنية' : currentLogo.category === 'cars' ? 'سيارات' : currentLogo.category === 'food' ? 'طعام' : 'ألعاب'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 pb-8">
          {options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentLogo.name;
            
            let btnState = 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-pink-500/50 text-white';
            
            if (selectedAnswer) {
              if (isCorrect) {
                btnState = 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] z-10 scale-105';
              } else if (isSelected) {
                btnState = 'bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] opacity-80';
              } else {
                btnState = 'bg-slate-900 border-slate-800 text-slate-500 opacity-50';
              }
            }
            
            return (
              <button
                key={idx}
                disabled={!!selectedAnswer}
                onClick={() => handleAnswer(option)}
                className={`p-5 rounded-2xl border-2 text-xl font-bold transition-all duration-300 w-full active:scale-95 hover:-translate-y-1 ${btnState}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
