import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skull, ChevronRight, Trophy, Flame } from 'lucide-react';
import { CATEGORIES } from './SoloPlay';
import { storage } from '../lib/storage';
import { audio } from '../lib/audio';
import { supabaseService } from '../services/supabaseService';
import { tfQuestions } from '../lib/tfData';
import { PlayBackground } from '../components/PlayBackground';

// Helper to shuffle array
const shuffle = (array: any[]) => [...array].sort(() => 0.5 - Math.random());

export default function SurvivalSolo() {
  const navigate = useNavigate();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState(storage.getSurvivalHighScore() || 0); // Need to implement this in storage
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // If not playing and not finished, that means we are in the intro screen or we trigger start.
    // Let's just auto-start survival mode as soon as the user enters this component,
    // or we can have a pre-start screen. Let's make a pre-start screen.
  }, []);

  const startGame = () => {
    // Collect all 4-option questions
    let allQuestions: any[] = [];
    CATEGORIES.forEach(cat => {
      if (cat.id !== 'sentence_order' && cat.data && cat.data.length > 0) {
         const categoryQuestions = cat.data.map((q: any) => ({
            ...q,
            type: 'mcq',
            categoryName: cat.name,
            color: cat.color,
            icon: cat.icon,
            difficultyRank: q.text.length < 40 ? 0 : (q.text.length < 70 ? 1 : 2)
         }));
         allQuestions = [...allQuestions, ...categoryQuestions];
      }
    });

    const tfMapped = tfQuestions.map(q => ({
        ...q,
        type: 'tf',
        categoryName: 'صح أم خطأ',
        color: 'from-emerald-500 to-emerald-700',
        icon: '✅',
        text: q.question,
        correctAnswer: q.isTrue ? "صح" : "خطأ",
        wrongOptions: [q.isTrue ? "خطأ" : "صح"],
        difficultyRank: q.difficulty === 'easy' ? 0 : (q.difficulty === 'medium' ? 1 : 2)
    }));
    
    allQuestions = [...allQuestions, ...tfMapped];
    
    let unseenQuestions = allQuestions;
    let globalSeenQuestions: string[] = [];
    try {
      const stored = localStorage.getItem('seenQuestionsHistory');
      if (stored) globalSeenQuestions = JSON.parse(stored);
    } catch(e) {}

    // Filter out seen ones
    unseenQuestions = allQuestions.filter(q => !globalSeenQuestions.includes(q.text));
    if (unseenQuestions.length < 50) {
      unseenQuestions = allQuestions; // fallback if exhausted
    }

    // Sort broadly by difficulty rank to simulate increasing difficulty
    // We shuffle inside each difficulty bucket
    const easyBucket = shuffle(unseenQuestions.filter(q => q.difficultyRank === 0));
    const medBucket = shuffle(unseenQuestions.filter(q => q.difficultyRank === 1));
    const hardBucket = shuffle(unseenQuestions.filter(q => q.difficultyRank === 2));

    // Construct the ladder:
    let finalLadder = [
      ...easyBucket.slice(0, 15),
      ...medBucket.slice(0, 15),
      ...hardBucket.slice(0, 50),
      ...shuffle([...easyBucket.slice(15), ...medBucket.slice(15), ...hardBucket.slice(50)])
    ];

    // Build the format and update seen history
    const prepared = finalLadder.slice(0, 300).map(q => {
      // Add slowly to history just for the ones we pick now
      globalSeenQuestions.push(q.text);
      return {
        ...q,
        options: [q.correctAnswer, ...q.wrongOptions].sort(() => 0.5 - Math.random())
      };
    });

    if (globalSeenQuestions.length > 500) {
      globalSeenQuestions = globalSeenQuestions.slice(globalSeenQuestions.length - 500);
    }
    try {
      localStorage.setItem('seenQuestionsHistory', JSON.stringify(globalSeenQuestions));
    } catch(e) {}

    setQuestions(prepared);
    setCurrentIndex(0);
    setScore(0);
    setIsPlaying(true);
    setIsFinished(false);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const currentQ = questions[currentIndex];
    const isCorrect = answer === currentQ.correctAnswer;
    
    if (isCorrect) {
      audio.correct();
      setScore(prev => prev + 1);
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setShowResult(false);
          setSelectedAnswer(null);
        } else {
          finishGame(score + 1);
        }
      }, 1000);
    } else {
      audio.wrong();
      setTimeout(() => {
        finishGame(score);
      }, 1500);
    }
  };

  const finishGame = (finalScore: number) => {
    // audio.gameOver && audio.gameOver();
    setIsPlaying(false);
    setIsFinished(true);
    
    let newHighest = highestScore;
    if (finalScore > highestScore) {
      newHighest = finalScore;
      setHighestScore(newHighest);
      try {
        localStorage.setItem('survival_highscore', newHighest.toString());
      } catch(e) {}
    }

    const playerId = storage.getPlayerId();
    const playerName = storage.getPlayerName() || 'لاعب مجهول';
    
    // Using the current system to add XP/Points (Assuming updatePlayerStats handles XP correctly for high scores)
    // We treat this as a generic game completion where correct = finalScore
    supabaseService.updatePlayerStats(
      playerId,
      playerName,
      true, // consider it a "win" for participation XP
      finalScore, // correct count
      1, // wrong count (the 1 that ended it)
      finalScore * 50, // score based on correct answers
      'طور البقاء'
    );
  };

  if (!isPlaying && !isFinished) {
    return (
      <>
      <PlayBackground theme="survival" />
      <div className="max-w-3xl mx-auto p-4 md:p-12 space-y-8 animate-fade-in text-center relative z-10">
        <header className="flex items-center gap-4 justify-start mb-12">
          <button 
            onClick={() => navigate('/')}
            className="p-3 bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 rounded-xl transition-colors shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </header>

        <div className="bg-gradient-to-b from-rose-500/20 to-slate-900/80 backdrop-blur-xl border border-rose-500/30 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
          
          <div className="bg-rose-500/20 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-rose-500/20 relative">
             <Flame className="w-16 h-16 text-rose-500 animate-pulse" />
             <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl"></div>
          </div>
          
          <h1 className="text-5xl font-bold font-heading text-white mb-6 drop-shadow-lg">طور البقاء</h1>
          
          <div className="space-y-4 text-slate-300 text-lg mb-12 max-w-lg mx-auto bg-slate-950/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/50 shadow-xl">
            <p className="flex items-center gap-3"><span className="text-2xl">☠️</span> خطأ واحد يعني النهاية الفورية.</p>
            <p className="flex items-center gap-3"><span className="text-2xl">📈</span> تزداد الصعوبة تدريجياً.</p>
            <p className="flex items-center gap-3"><span className="text-2xl">⏱️</span> لا يوجد مؤقت، خذ وقتك للتفكير.</p>
            <p className="flex items-center gap-3"><span className="text-2xl">🏆</span> أعلى سلسلة تصمد فيها هي نتيجتك.</p>
          </div>

          <button
            onClick={startGame}
            className="w-full sm:w-auto px-16 py-5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-2xl font-bold rounded-2xl shadow-xl shadow-rose-600/50 transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
          >
            <Flame className="w-6 h-6" />
            بدء التحدي
          </button>
        </div>
      </div>
      </>
    );
  }

  if (isFinished) {
    return (
      <>
      <PlayBackground theme="survival" />
      <div className="max-w-xl mx-auto p-6 md:p-12 text-center space-y-8 animate-fade-in relative z-10">
        <div className="bg-rose-500/10 w-32 h-32 rounded-full flex items-center justify-center mx-auto relative backdrop-blur-sm">
          <Skull className="w-16 h-16 text-rose-500" />
          <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl"></div>
        </div>
        <div>
          <h2 className="text-5xl font-bold font-heading mb-4 text-rose-500 drop-shadow-lg">نهاية التحدي!</h2>
          <p className="text-xl text-slate-300 mb-8 bg-black/40 p-4 rounded-xl backdrop-blur-sm inline-block">لقد أجبت بشكل خاطئ وانتهت سلسلة البقاء.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl">
            <p className="text-slate-400 mb-2">النتيجة الحالية</p>
            <p className="text-6xl font-bold font-mono text-white drop-shadow-md">{score}</p>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl relative overflow-hidden shadow-xl">
            {score >= highestScore && score > 0 && (
               <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
            )}
            <p className="text-slate-400 mb-2">أعلى نتيجة</p>
            <p className="text-6xl font-bold font-mono text-yellow-500 drop-shadow-md">{highestScore}</p>
            {score >= highestScore && score > 0 && (
               <div className="absolute top-2 right-2 flex items-center gap-1 text-yellow-500 text-xs font-bold bg-yellow-500/20 px-2 py-1 rounded-full backdrop-blur-sm">
                 <Trophy className="w-3 h-3" />
                 رقم جديد!
               </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={startGame}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-rose-600/30 active:scale-95 text-lg"
          >
            إعادة اللعب
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all border border-slate-700/50 active:scale-95 text-lg shadow-lg"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
      </>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <>
    <PlayBackground theme="survival" />
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in relative z-10 transition-transform active:scale-[0.99] duration-75">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 px-6 py-4 rounded-3xl shadow-lg relative overflow-hidden">
         {/* Background effect */}
         {showResult && selectedAnswer === currentQ.correctAnswer && <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>}
         {showResult && selectedAnswer !== currentQ.correctAnswer && <div className="absolute inset-0 bg-rose-500/10 animate-pulse"></div>}
         
         <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${currentQ.color} shadow-lg`}>
               <span className="text-2xl block drop-shadow-md">{currentQ.icon}</span>
            </div>
            <div>
               <p className="text-sm text-slate-400 font-bold mb-1">{currentQ.categoryName}</p>
               <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-md font-bold ${currentQ.difficultyRank === 0 ? 'bg-emerald-500/20 text-emerald-400' : currentQ.difficultyRank === 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                     {currentQ.difficultyRank === 0 ? 'سهل' : currentQ.difficultyRank === 1 ? 'متوسط' : 'صعب'}
                  </span>
               </div>
            </div>
         </div>

         <div className="text-center relative z-10 w-32">
            <p className="text-xs text-slate-400 mb-1 font-bold">سلسلة البقاء الحالية</p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-4 inline-flex items-center justify-center gap-2 shadow-inner">
               <Flame className="w-5 h-5 text-rose-500" />
               <span className="font-bold text-2xl text-white font-mono leading-none">{score}</span>
            </div>
         </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-xl relative">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-center leading-relaxed text-white mb-10">
          {currentQ.text}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQ.options.map((opt: string, idx: number) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = opt === currentQ.correctAnswer;
            
            let btnColor = "bg-slate-950 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-200 shadow-sm";
            
            if (showResult) {
              if (isCorrect) {
                btnColor = "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10 scale-[1.02] transition-transform";
              } else if (isSelected && !isCorrect) {
                 btnColor = "bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] z-10 scale-[0.98] transition-transform";
              } else {
                 btnColor = "bg-slate-950 border-slate-800 text-slate-700 opacity-30 scale-95 transition-transform";
              }
            } else if (isSelected) {
               btnColor = "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20";
            }

            return (
              <button
                key={idx}
                disabled={showResult}
                onClick={() => handleAnswer(opt)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 font-bold text-lg text-right ${btnColor}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
