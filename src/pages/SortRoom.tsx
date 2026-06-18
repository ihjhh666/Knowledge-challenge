import React, { useState, useEffect } from 'react';
import { useGame } from '../components/GameContext';
import { RoomPlayer } from '../lib/types';
import { Check, X, Clock, Trophy, Crown, Mic, MicOff, UserMinus, BarChart, Eye } from 'lucide-react';
import { audio } from '../lib/audio';
import { supabaseService } from '../services/supabaseService';
import { storage } from '../lib/storage';
import { MatchEndScreen } from '../components/MatchEndScreen';
import { Reorder, motion } from 'framer-motion';

export default function SortRoom() {
  const { state, submitAnswer, playerId, isHost, forceNextQuestion, transferHost, kickPlayer, mutePlayer } = useGame();
  const [items, setItems] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [statsSaved, setStatsSaved] = useState(false);
  const [hasSubmittedLocal, setHasSubmittedLocal] = useState(false);

  // Sync sorting data to local state for shuffling when new round starts
  useEffect(() => {
    if (state?.status === 'playing' && state.currentQuestion?.sortingData) {
      // Create a shuffled copy
      const shuffled = [...state.currentQuestion.sortingData].sort(() => Math.random() - 0.5);
      setItems(shuffled);
      setTimeLeft(30);
      setStatsSaved(false);
      setHasSubmittedLocal(false);
    }
  }, [state?.round, state?.status, state?.currentQuestion]);

  useEffect(() => {
    if (state?.status === 'playing' && !hasSubmittedLocal) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleConfirmSort(true); // Forced submtion
             if (isHost) {
              setTimeout(() => { forceNextQuestion(); }, 2000);
            }
            return 0;
          }
           if (prev <= 6 && prev > 1) audio.tick();
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state?.status, state?.round, items, hasSubmittedLocal]);

  useEffect(() => {
    if (state?.status === 'revealing') {
       // On reveal, show correct order
       if (state.currentQuestion?.sortingData) {
          setItems(state.currentQuestion.sortingData); 
       }
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

  const handleConfirmSort = (forced = false) => {
    if (state?.status !== 'playing' || hasSubmittedLocal) return;

    const originalOrderStr = JSON.stringify(state.currentQuestion?.sortingData.map((i:any) => i.id));
    const currentOrderStr = JSON.stringify(items.map((i:any) => i.id));
    
    // We submit whether it's correct.
    const isCorrect = originalOrderStr === currentOrderStr;
    const answerStr = isCorrect ? state?.currentQuestion?.correctAnswer || 'correct' : 'wrong';

    setHasSubmittedLocal(true);
    submitAnswer(answerStr, (30 - timeLeft) * 1000);
  };

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
            <div className={`p-3 rounded-xl ${timeLeft <= 10 ? 'bg-red-500/20 animate-pulse' : 'bg-slate-900'}`}>
              <Clock className={`w-6 h-6 ${timeLeft <= 10 ? 'text-red-400' : 'text-emerald-400'}`} />
            </div>
            <div>
              <p className="text-sm text-slate-400">الوقت المتبقي</p>
              <p className={`font-bold text-xl font-mono ${timeLeft <= 10 ? 'text-red-400' : ''}`}>
                00:{timeLeft.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-3">
          {currentQuestion && currentQuestion.sortingData && (
            <div className="bg-slate-800 p-6 md:p-12 rounded-3xl border border-slate-700 space-y-6 md:space-y-8 flex flex-col items-center">
              <div className="bg-indigo-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-2 border border-indigo-500/30">
                <BarChart className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-center leading-relaxed max-w-xl mx-auto">
                {currentQuestion.text}
              </h2>

              <div className="w-full relative mt-4">
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-6 w-1 h-3/4 bg-gradient-to-b from-emerald-500 to-rose-500 rounded-full hidden md:block">
                    <div className="absolute -right-8 -top-4 text-xs font-bold text-emerald-400 bg-slate-900 px-2 py-1 rounded-md">الأعلى</div>
                    <div className="absolute -right-8 -bottom-4 text-xs font-bold text-rose-400 bg-slate-900 px-2 py-1 rounded-md">الأقل</div>
                 </div>

                 {state.status === 'playing' && !hasSubmittedLocal ? (
                    <Reorder.Group 
                      axis="y" 
                      values={items} 
                      onReorder={setItems} 
                      className="space-y-3 relative z-10 w-full"
                    >
                      {items.map((item, index) => (
                        <Reorder.Item key={item.id} value={item} className="w-full">
                          <div className="w-full bg-slate-900/80 hover:bg-slate-800 border border-indigo-500/30 p-4 shadow-sm backdrop-blur-sm cursor-grab active:cursor-grabbing flex items-center justify-between rounded-2xl group transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-black">
                                {index + 1}
                              </div>
                              <span className="font-bold text-lg text-slate-100">{item.name}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 flex flex-col gap-1 items-center px-4">
                              <div className="w-4 h-0.5 bg-current rounded-full" />
                              <div className="w-4 h-0.5 bg-current rounded-full" />
                              <div className="w-4 h-0.5 bg-current rounded-full" />
                            </div>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                 ) : (
                    <div className="space-y-3 w-full">
                      {items.map((item, index) => {
                         const isCorrect = state.status === 'revealing' || state.status === 'finished' ? true : false;
                         return (
                           <div key={item.id} className="w-full bg-emerald-500/10 border border-emerald-500/30 p-4 shadow-sm flex items-center justify-between rounded-2xl transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 text-emerald-400 font-black">
                                {index + 1}
                              </div>
                              <span className="font-bold text-lg text-emerald-100">{item.name}</span>
                            </div>
                            {(state.status === 'revealing' || state.status === 'finished') && (
                              <div className="text-emerald-400 text-sm font-bold font-mono">
                                {item.value} {currentQuestion.sortingData.unit}
                              </div>
                            )}
                          </div>
                         )
                      })}
                    </div>
                 )}
              </div>

               {state.status === 'playing' && !hasSubmittedLocal ? (
                  <button
                    onClick={() => handleConfirmSort(false)}
                    className="mt-6 w-full py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg active:scale-95 text-lg"
                  >
                    تأكيد الإجابة
                  </button>
               ) : (
                  <div className="mt-8 text-center text-slate-400 animate-pulse bg-slate-900 px-6 py-3 rounded-full border border-slate-700 inline-flex items-center gap-2">
                    <Eye className="w-4 h-4" />
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
