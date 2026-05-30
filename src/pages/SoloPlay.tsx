import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Trophy, ChevronRight, X, Clock, Target } from 'lucide-react';
import { GENERAL_KNOWLEDGE_EXPANDED as GENERAL_KNOWLEDGE, FB_EXPANDED as FOOTBALL, MOVIES_EXPANDED as MOVIES, ANIME_EXPANDED as ANIME, SCI_EXPANDED as SCIENCE, HIST_EXPANDED as HISTORY, ISLAMIC_EXPANDED as ISLAMIC, MATH_EXPANDED as MATH } from '../lib/dynamicQuestions';
import { storage } from '../lib/storage';
import { audio } from '../lib/audio';

const CATEGORIES = [
  { id: 'general', name: 'معلومات عامة', icon: '🌍', data: GENERAL_KNOWLEDGE, color: 'from-blue-500 to-blue-700' },
  { id: 'football', name: 'كرة القدم', icon: '⚽', data: FOOTBALL, color: 'from-green-500 to-green-700' },
  { id: 'movies', name: 'الأفلام', icon: '🎬', data: MOVIES, color: 'from-purple-500 to-purple-700' },
  { id: 'anime', name: 'الأنمي', icon: '🎌', data: ANIME, color: 'from-red-500 to-red-700' },
  { id: 'science', name: 'العلوم', icon: '🔬', data: SCIENCE, color: 'from-teal-500 to-teal-700' },
  { id: 'history', name: 'التاريخ', icon: '📜', data: HISTORY, color: 'from-amber-500 to-amber-700' },
  { id: 'islamic', name: 'إسلاميات', icon: '🕌', data: ISLAMIC, color: 'from-emerald-500 to-emerald-700' },
  { id: 'math', name: 'رياضيات', icon: '🧮', data: MATH, color: 'from-blue-400 to-blue-600' }
];

export default function SoloPlay() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying && !showResult && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            audio.wrong();
            handleAnswer(""); // Time out
            return 0;
          }
          if (prev <= 6 && prev > 1) {
            audio.tick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, showResult, isFinished, currentQuestionIndex, lives]);

  const startGame = (category: typeof CATEGORIES[0]) => {
    setSelectedCategory(category);
    
    // Select 20 random questions from the pool
    const shuffled = [...category.data].sort(() => 0.5 - Math.random());
    const preparedQuestions = shuffled.slice(0, 20).map(q => {
      return {
        ...q,
        options: [q.correctAnswer, ...q.wrongOptions].sort(() => 0.5 - Math.random())
      }
    });

    setQuestions(preparedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(3);
    setIsPlaying(true);
    setIsFinished(false);
    setShowResult(false);
    setTimeLeft(15);
    setSelectedAnswer(null);
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const currentQ = questions[currentQuestionIndex];
    if (answer === currentQ.correctAnswer) {
      audio.correct();
      const timeBonus = Math.max(0, timeLeft * 10);
      setScore(prev => prev + 100 + timeBonus);
    } else {
      audio.wrong();
      setLives(prev => prev - 1);
    }

    setTimeout(() => {
      // If lost all lives
      if (answer !== currentQ.correctAnswer && lives <= 1) {
         audio.win(); // Or game over sound
         setIsFinished(true);
         return;
      }

      // Next question or end game
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowResult(false);
        setSelectedAnswer(null);
        setTimeLeft(15);
      } else {
        audio.win();
        setIsFinished(true);
      }
    }, 2000);
  };

  if (!isPlaying) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8 animate-fade-in">
        <header className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold font-heading">اللعب الفردي</h1>
            <p className="text-slate-400 mt-1">اختر قسماً لتبدأ اللعب</p>
          </div>
        </header>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => startGame(cat)}
              className={`bg-gradient-to-br ${cat.color} p-6 rounded-3xl text-right relative overflow-hidden group hover:scale-[1.02] transition-transform`}
            >
              <div className="absolute top-0 right-0 w-full h-full bg-black/10 pointer-events-none group-hover:bg-black/0 transition-colors"></div>
              <span className="text-4xl mb-4 block">{cat.icon}</span>
              <h3 className="text-xl font-bold font-heading text-white">{cat.name}</h3>
              <p className="text-white/80 text-sm mt-2">{cat.data.length} سؤال</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto p-6 md:p-12 text-center space-y-8 animate-fade-in">
        <div className="bg-emerald-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
          <Trophy className="w-12 h-12 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-4xl font-bold font-heading mb-4 text-emerald-400">نهاية التحدي!</h2>
          <p className="text-xl text-slate-300">لعبت في قسم <span className="font-bold text-white">{selectedCategory?.name}</span></p>
          <p className="mt-2 text-slate-400">وصلت إلى السؤال <span className="text-indigo-400 font-bold">{currentQuestionIndex + 1}</span></p>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl">
          <p className="text-slate-400 mb-2">مجموع نقاطك</p>
          <p className="text-5xl font-bold font-mono text-indigo-400">{score}</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => startGame(selectedCategory!)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all"
          >
            إعادة اللعب
          </button>
          <button
            onClick={() => setIsPlaying(false)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all border border-slate-700"
          >
            تغيير القسم
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-800 border border-slate-700 px-4 py-4 md:px-6 rounded-3xl gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedCategory?.color} shrink-0`}>
            <span className="text-xl">{selectedCategory?.icon}</span>
          </div>
          <div>
            <p className="text-sm text-slate-400">{selectedCategory?.name}</p>
            <p className="font-bold">السؤال {currentQuestionIndex + 1} / {questions.length}</p>
          </div>
          <div className="flex-1"></div>
          <div className={`sm:hidden flex items-center gap-2 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
            <Clock className="w-5 h-5" />
            <span className="font-bold font-mono text-lg">00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 w-full sm:w-auto border-t border-slate-700 sm:border-0 pt-4 sm:pt-0">
          <div className="flex items-center gap-1 text-rose-500">
             {[...Array(3)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 md:w-6 md:h-6 ${i < lives ? 'fill-current' : 'opacity-20'}`} viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
             ))}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs md:text-sm text-slate-400">النقاط</p>
            <p className="font-bold text-base md:text-lg text-indigo-400 font-mono">{score}</p>
          </div>
          <div className={`hidden sm:flex items-center gap-2 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
            <Clock className="w-6 h-6" />
            <span className="font-bold font-mono text-xl">00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 md:p-12 rounded-3xl border border-slate-700 space-y-6 md:space-y-8">
        <h2 className="text-xl md:text-3xl font-bold font-heading text-center leading-relaxed">
          {currentQ.text}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {currentQ.options.map((opt: string, idx: number) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = opt === currentQ.correctAnswer;
            
            let btnColor = "bg-slate-900 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-200";
            
            if (showResult) {
              if (isCorrect) {
                btnColor = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
              } else if (isSelected && !isCorrect) {
                btnColor = "bg-red-500/20 border-red-500 text-red-400";
              } else {
                btnColor = "bg-slate-900 border-slate-800 text-slate-600 opacity-50";
              }
            } else if (isSelected) {
              btnColor = "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20";
            }

            return (
              <button
                key={idx}
                disabled={showResult}
                onClick={() => handleAnswer(opt)}
                className={`relative p-6 rounded-2xl border-2 transition-all font-bold text-lg text-right ${btnColor}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
