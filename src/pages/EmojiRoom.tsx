import React, { useState, useEffect } from 'react';
import { useGame } from '../components/GameContext';
import { RoomPlayer } from '../lib/types';
import { Check, X, Clock, Trophy, Crown, Mic, MicOff, UserMinus, Search } from 'lucide-react';
import { audio } from '../lib/audio';
import { supabaseService } from '../services/supabaseService';
import { storage } from '../lib/storage';
import { MatchEndScreen } from '../components/MatchEndScreen';

export default function EmojiRoom() {
  const { state, submitAnswer, playerId, isHost, forceNextQuestion, transferHost, kickPlayer, mutePlayer } = useGame();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [statsSaved, setStatsSaved] = useState(false);

  useEffect(() => {
    if (state?.status === 'playing') {
      setSelectedAnswer(null);
      setTimeLeft(15);
      setStatsSaved(false);
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
            if (isHost) {
              setTimeout(() => { forceNextQuestion(); }, 1500);
            }
            return 0;
          }
          if (prev <= 6 && prev > 1) audio.tick();
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state?.status, selectedAnswer, state?.round]);

  useEffect(() => {
    if (state?.status === 'revealing') {
      const p = state.players[playerId];
      if (p?.lastAnswerSucceeded) audio.correct();
      else audio.wrong();
    } else if (state?.status === 'finished') {
      audio.win();
      if (!statsSaved && state.players[playerId]) {
        const sortedPlayers = (Object.values(state.players) as RoomPlayer[]).sort((a, b) => b.score - a.score);
        const me = state.players[playerId];
        const isWin = sortedPlayers[0].id === playerId && me.score > 0;
        
        supabaseService.updatePlayerStats(
          storage.getPlayerId(),
          storage.getPlayerName() || me.username,
          isWin,
          0,
          0,
          me.score,
          state.category || 'عام'
        );
        setStatsSaved(true);
      }
    }
  }, [state?.status]);

  if (!state) return null;

  if (state.status === 'finished') {
    const sortedPlayers = (Object.values(state.players) as RoomPlayer[]).sort((a, b) => b.score - a.score);
    return <MatchEndScreen winner={sortedPlayers[0]} sortedPlayers={sortedPlayers} />;
  }

  const { currentQuestion, players, targetScore } = state;
  const me = players[playerId];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="bg-slate-800 border border-slate-700 px-6 py-4 rounded-2xl flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <Trophy className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">الهدف للفوز</p>
            <p className="font-bold text-xl">{targetScore} نقطة</p>
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
            <div className="bg-slate-800 p-6 md:p-12 rounded-3xl border border-slate-700 space-y-6 md:space-y-8 flex flex-col items-center">
              <div className="bg-indigo-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
                <Search className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-center leading-relaxed mb-8 tracking-widest bg-slate-900 p-6 rounded-3xl border border-slate-700 w-full">
                {currentQuestion.text}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedAnswer === opt;
                  const isRevealing = state.status === 'revealing';
                  const isCorrect = opt === currentQuestion.correctAnswer;
                  
                  let btnColor = "bg-slate-900 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-200";
                  
                  if (isRevealing) {
                    if (isCorrect) btnColor = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                    else if (isSelected && !isCorrect) btnColor = "bg-red-500/20 border-red-500 text-red-400";
                    else btnColor = "bg-slate-900 border-slate-800 text-slate-600 opacity-50";
                  } else if (isSelected) {
                    btnColor = "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20";
                  }

                  return (
                    <button
                      key={opt}
                      disabled={me?.hasAnsweredCurrentRound || isRevealing}
                      onClick={() => {
                        setSelectedAnswer(opt);
                        submitAnswer(opt, (15 - timeLeft) * 1000);
                      }}
                      className={`relative p-6 px-12 rounded-2xl border-4 transition-all font-bold text-xl text-center ${btnColor} ${me?.hasAnsweredCurrentRound && !isSelected && !isRevealing ? 'opacity-50' : ''}`}
                    >
                      {opt}
                      {isRevealing && isCorrect && <Check className="absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6" />}
                      {isRevealing && isSelected && !isCorrect && <X className="absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6" />}
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
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
                      {p.username}
                      {p.level && <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[9px] px-1 py-0.5 rounded font-mono">Lvl {p.level}</span>}
                    </span>
                    <span className="block text-xs text-indigo-400">{p.score} / {targetScore} pt</span>
                  </div>
                </div>
                {state.status === 'revealing' && (
                   <div>
                     {p.lastAnswerSucceeded ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
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
