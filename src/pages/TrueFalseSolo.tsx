import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, XCircle, CheckCircle, ShieldAlert, Sparkles, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { storage } from '../lib/storage';
import { getRandomTFQuestions, TFQuestion } from '../lib/tfData';
import { updateTFStats } from '../lib/firebase';
import { getPlayerStats } from '../lib/achievements';
import { tfAudio } from '../lib/tfAudio';

export default function TrueFalseSolo() {
  const [questions, setQuestions] = useState<TFQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // start game
    setQuestions(getRandomTFQuestions(200)); // big batch
    
    const handleAch = () => {
       if (storage.getSettings().sfxEnabled) tfAudio.achievement();
    };
    window.addEventListener('achievement_unlocked', handleAch);
    return () => window.removeEventListener('achievement_unlocked', handleAch);
  }, []);

  const handleAnswer = (answer: boolean) => {
    if (selectedAnswer !== null || gameOver) return;
    
    setSelectedAnswer(answer);
    const currentQ = questions[currentIndex];
    const isCorrect = answer === currentQ.isTrue;

    if (isCorrect) {
      setScore(s => s + 10 + streak * 2);
      setStreak(s => {
        const newStreak = s + 1;
        setBestStreak(bs => Math.max(bs, newStreak));
        if (storage.getSettings().sfxEnabled) {
           if (newStreak === 10) tfAudio.comboLegendary();
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
      
      if (storage.getSettings().sfxEnabled) {
          tfAudio.wrong();
      }

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
          setQuestions(q => [...q, ...getRandomTFQuestions(100)]);
        }
      }
    }, 1200);
  };

  const endGame = async () => {
    setGameOver(true);
    const playerId = storage.getPlayerId();
    
    // Check local stats to see if this is a new high score
    const localStats = getPlayerStats();
    const isNewRecord = score > 0 && score > (localStats.tfHighScore || 0);

    if (storage.getSettings().sfxEnabled) {
      if (isNewRecord) {
        tfAudio.newRecord();
      } else {
        tfAudio.lose();
      }
    }

    if (playerId) {
      await updateTFStats(playerId, correctCount, wrongCount + 1, Math.max(bestStreak, streak), score);
      // Wait, updateTFStats updates the firebase, we should also trigger local achievement
    }
  };

  const currentQ = questions[currentIndex];

  if (!questions.length) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/10 bg-slate-900/50 sticky top-0 z-50 backdrop-blur-md">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 ml-2" />
          <span className="font-bold">رجوع</span>
        </button>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart 
              key={i} 
              className={`w-6 h-6 transition-all duration-300 ${
                i < hearts 
                  ? hearts === 1 
                    ? 'text-rose-500 fill-rose-500 animate-[pulse_0.5s_ease-in-out_infinite]' 
                    : 'text-rose-500 fill-rose-500'
                  : 'text-slate-600 scale-75'
              }`} 
            />
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 flex flex-col min-h-[calc(100vh-80px)]">
        {/* Top Stats */}
        <div className="flex justify-between items-center mb-8 bg-slate-900/40 p-4 rounded-2xl border border-white/5 relative">
          <div className="flex flex-col">
            <span className="text-slate-400 text-sm">النقاط</span>
            <span className="text-3xl font-bold text-amber-400">{score}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-sm">السلسلة 🔥</span>
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {streak >= 10 && <motion.span initial={{ opacity:0, scale: 0.5 }} animate={{ opacity:1, scale:1 }} className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md font-bold">أسطورية 👑</motion.span>}
                {streak >= 5 && streak < 10 && <motion.span initial={{ opacity:0, scale: 0.5 }} animate={{ opacity:1, scale:1 }} className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md font-bold">ممتازة ⚡</motion.span>}
                {streak >= 3 && streak < 5 && <motion.span initial={{ opacity:0, scale: 0.5 }} animate={{ opacity:1, scale:1 }} className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-md font-bold">جيدة 🔥</motion.span>}
              </AnimatePresence>
              <span className={`text-2xl font-bold ${streak >= 10 ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : streak >= 5 ? 'text-amber-400' : 'text-orange-400'}`}>{streak}</span>
            </div>
          </div>
        </div>

        {!gameOver ? (
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1, ...(isShaking ? { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } } : {}) }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-center items-center relative"
            >
              <div 
                className={`bg-gradient-to-br p-8 rounded-3xl border shadow-2xl text-center w-full max-w-lg mb-12 transition-colors duration-300 ${
                  isFlashing 
                    ? 'from-rose-900/80 to-red-900/80 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]'
                    : 'from-indigo-900/50 to-purple-900/50 border-indigo-500/20'
                }`}
              >
                <ShieldAlert className={`w-12 h-12 mx-auto mb-6 opacity-50 ${isFlashing ? 'text-rose-400' : 'text-indigo-400'}`} />
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">{currentQ?.question}</h2>
              </div>

              <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                <button
                  onClick={() => handleAnswer(true)}
                  disabled={selectedAnswer !== null}
                  className={`relative overflow-hidden p-8 rounded-3xl font-bold text-3xl transition-all duration-300 transform active:scale-95 ${
                    selectedAnswer === true
                      ? currentQ.isTrue 
                        ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-105'
                        : 'bg-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.5)] scale-95'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:-translate-y-1'
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <CheckCircle className="w-8 h-8" /> صح
                  </span>
                </button>

                <button
                  onClick={() => handleAnswer(false)}
                  disabled={selectedAnswer !== null}
                  className={`relative overflow-hidden p-8 rounded-3xl font-bold text-3xl transition-all duration-300 transform active:scale-95 ${
                    selectedAnswer === false
                      ? !currentQ.isTrue 
                        ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-105'
                        : 'bg-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.5)] scale-95'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:-translate-y-1'
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                     خطأ <XCircle className="w-8 h-8" />
                  </span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 flex flex-col justify-center items-center text-center"
          >
            <Sparkles className="w-20 h-20 text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <h1 className="text-5xl font-extrabold text-white mb-4">انتهت الجولة!</h1>
            
            <div className="bg-slate-900/60 p-6 rounded-3xl w-full max-w-sm mb-8 border border-white/5 space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-slate-400">النقاط المكتسبة</span>
                <span className="font-bold text-amber-400">{score}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-slate-400">الإجابات الصحيحة</span>
                <span className="font-bold text-emerald-400">{correctCount}</span>
              </div>
               <div className="flex justify-between items-center text-lg">
                <span className="text-slate-400">أفضل سلسلة</span>
                <span className="font-bold text-orange-400">{Math.max(streak, bestStreak)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setQuestions(getRandomTFQuestions(200));
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
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold transition-colors"
              >
                العب مرة أخرى
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
