import React, { useState, useEffect } from 'react';
import { useGame } from '../components/GameContext';
import { RoomPlayer } from '../lib/types';
import { Check, X, Clock, Brain, Trophy, Crown, Mic, MicOff, UserMinus } from 'lucide-react';
import { audio } from '../lib/audio';
import { supabaseService } from '../services/supabaseService';
import { storage } from '../lib/storage';

import { MatchEndScreen } from '../components/MatchEndScreen';

export default function PlayingField() {
  const { state, submitAnswer, playerId, isHost, startGame, forceNextQuestion, transferHost, kickPlayer, mutePlayer } = useGame();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [statsSaved, setStatsSaved] = useState(false);

  useEffect(() => {
    if (state?.status === 'playing') {
      setSelectedAnswer(null);
      setTimeLeft(15);
      setStatsSaved(false); // Reset for next game
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
              // Wait a little extra bit for latency, then force it.
              setTimeout(() => {
                 forceNextQuestion();
              }, 1500);
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
      
      // Save stats once per game
      if (!statsSaved && state.players[playerId]) {
        const sortedPlayers = (Object.values(state.players) as RoomPlayer[]).sort((a, b) => b.score - a.score);
        const me = state.players[playerId];
        const isWin = sortedPlayers[0].id === playerId && me.score > 0;
        
        // Since we don't track correct/wrong answers specifically in the network state for the whole match efficiently here,
        // we can estimate them if we don't have them in the GameState. 
        // Wait, score is accumulated. In multiplayer we don't have exact correct answers count stored in `RoomPlayer`. 
        // We'll estimate based on score or just say correct = round / 2 (just for now) or let's not add correct counts if we don't know.
        // Actually, we can just save it with what we have. It will update the score!
        
        supabaseService.updatePlayerStats(
          storage.getPlayerId(),
          storage.getPlayerName() || me.username,
          isWin,
          0, // we don't have individual correct count in RoomPlayer yet
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
    const winner = sortedPlayers[0];

    return (
      <MatchEndScreen winner={winner} sortedPlayers={sortedPlayers} />
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
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
                      {p.username}
                      {p.level && <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[9px] px-1 py-0.5 rounded font-mono">Lvl {p.level}</span>}
                    </span>
                    <span className="block text-xs text-indigo-400">{p.score} pt</span>
                    {isHost && playerId !== p.id && (
                      <div className="flex gap-1 mt-1">
                        <button onClick={() => transferHost(p.id)} className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-700 bg-slate-700/50" title="ترقية">
                          <Crown className="w-3 h-3" />
                        </button>
                        <button onClick={() => mutePlayer(p.id, !p.isMuted)} className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-700 bg-slate-700/50" title={p.isMuted ? 'إلغاء الكتم' : 'كتم'}>
                          {p.isMuted ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                        </button>
                        <button onClick={() => kickPlayer(p.id)} className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700 bg-slate-700/50" title="طرد">
                          <UserMinus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
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
