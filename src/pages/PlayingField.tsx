import React, { useState, useEffect } from 'react';
import { useGame } from '../components/GameContext';
import { RoomPlayer } from '../lib/types';
import { Check, X, Clock, Brain, Trophy } from 'lucide-react';
import { audio } from '../lib/audio';

export default function PlayingField() {
  const { state, submitAnswer, playerId, isHost, startGame } = useGame();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (state?.status === 'playing') {
      setSelectedAnswer(null);
      setTimeLeft(15);
    }
  }, [state?.round, state?.status]);

  useEffect(() => {
    if (state?.status === 'playing') {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            if (!selectedAnswer && state.players[playerId] && !state.players[playerId].hasAnsweredCurrentRound) {
              submitAnswer('', 15000);
            }
            return 0;
          }
          if (prev <= 6 && prev > 1) {
            audio.tick();
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state?.status, selectedAnswer, state?.round]);

  useEffect(() => {
    if (state?.status === 'revealing') {
      const p = state.players[playerId];
      if (p?.lastAnswerSucceeded) {
        audio.correct();
      } else {
        audio.wrong();
      }
    } else if (state?.status === 'finished') {
      audio.win();
    }
  }, [state?.status]);

  if (!state) return null;

  if (state.status === 'finished') {
    const sortedPlayers = (Object.values(state.players) as RoomPlayer[]).sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <div className="bg-slate-800 p-8 md:p-12 rounded-3xl border border-slate-700 text-center max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="bg-emerald-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
          <Trophy className="w-12 h-12 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-4xl font-bold font-heading mb-4 bg-gradient-to-l from-emerald-400 to-teal-400 text-transparent bg-clip-text">اللعبة انتهت!</h2>
          <p className="text-xl text-slate-300">
            الفائز هو <span className="font-bold text-white">{winner.username}</span> برصيد {winner.score} نقطة
          </p>
        </div>

        <div className="space-y-4">
          {sortedPlayers.map((p, i) => (
            <div key={p.id} className="flex justify-between items-center p-4 bg-slate-900 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-4">
                <span className={`font-bold ${i === 0 ? 'text-emerald-400' : 'text-slate-500'}`}>#{i + 1}</span>
                <span className="font-bold">{p.username}</span>
              </div>
              <span className="text-indigo-400 font-bold">{p.score} نقطة</span>
            </div>
          ))}
        </div>

        {isHost && (
           <button 
             onClick={startGame}
             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all"
           >
             العب مرة أخرى
           </button>
        )}
      </div>
    );
  }

  const { currentQuestion, players, round, totalRounds } = state;
  const me = players[playerId];
  const allAnswered = (Object.values(players) as RoomPlayer[]).every(p => p.hasAnsweredCurrentRound);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="bg-slate-800 border border-slate-700 px-6 py-4 rounded-2xl flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <Brain className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">الجولة</p>
            <p className="font-bold text-xl">{round} <span className="text-slate-500">من {totalRounds}</span></p>
          </div>
        </div>

        {state.status === 'playing' && (
          <div className="bg-slate-800 border border-slate-700 px-6 py-4 rounded-2xl flex items-center gap-4 w-full md:w-auto">
            <div className={`p-3 rounded-xl ${timeLeft <= 5 ? 'bg-red-500/20 animate-pulse' : 'bg-slate-900'}`}>
              <Clock className={`w-6 h-6 ${timeLeft <= 5 ? 'text-red-400' : 'text-emerald-400'}`} />
            </div>
            <div>
              <p className="text-sm text-slate-400">الوقت المتبقي</p>
              <p className={`font-bold text-xl font-mono ${timeLeft <= 5 ? 'text-red-400' : ''}`}>
                00:{timeLeft.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-3">
          {currentQuestion && (
            <div className="bg-slate-800 p-6 md:p-12 rounded-3xl border border-slate-700 space-y-6 md:space-y-8">
              <h2 className="text-xl md:text-3xl font-bold font-heading text-center leading-relaxed">
                {currentQuestion.text}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedAnswer === opt;
                  const isRevealing = state.status === 'revealing';
                  const isCorrect = opt === currentQuestion.correctAnswer;
                  
                  let btnColor = "bg-slate-900 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-200";
                  
                  if (isRevealing) {
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
                      disabled={me?.hasAnsweredCurrentRound || isRevealing}
                      onClick={() => {
                        setSelectedAnswer(opt);
                        submitAnswer(opt, (15 - timeLeft) * 1000);
                      }}
                      className={`relative p-6 rounded-2xl border-2 transition-all font-bold text-lg text-right ${btnColor} ${me?.hasAnsweredCurrentRound && !isSelected && !isRevealing ? 'opacity-50' : ''}`}
                    >
                      {opt}
                      {isRevealing && isCorrect && <Check className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6" />}
                      {isRevealing && isSelected && !isCorrect && <X className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6" />}
                    </button>
                  );
                })}
              </div>

              {me?.hasAnsweredCurrentRound && state.status === 'playing' && (
                <div className="text-center text-slate-400 animate-pulse mt-4">
                  في انتظار باقي اللاعبين...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 h-fit space-y-4">
          <h3 className="font-bold text-lg border-b border-slate-700 pb-4">النقاط</h3>
          <div className="space-y-3">
            {(Object.values(players) as RoomPlayer[]).sort((a,b) => b.score - a.score).map((p, i) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-sm font-bold w-4">{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                    {p.username.charAt(0)}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-200">{p.username}</span>
                    <span className="block text-xs text-indigo-400">{p.score} pt</span>
                  </div>
                </div>
                {state.status === 'revealing' && (
                   <div>
                     {p.lastAnswerSucceeded ? (
                       <Check className="w-4 h-4 text-emerald-400" />
                     ) : (
                       <X className="w-4 h-4 text-red-400" />
                     )}
                   </div>
                )}
                {state.status === 'playing' && p.hasAnsweredCurrentRound && (
                  <Check className="w-4 h-4 text-slate-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
