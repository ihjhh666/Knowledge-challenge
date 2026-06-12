import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { searchUserById, sendFriendRequest, subscribeToFriends, respondToFriendRequest, deleteFriend, sendGameInvite, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Users, X, Search, UserPlus, Check, XCircle, Gamepad2, UserRound, Clock, Bell, Copy } from 'lucide-react';
import { useGame } from './GameContext';
import { useNavigate } from 'react-router-dom';

export function FriendsSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friendDetails, setFriendDetails] = useState<Record<string, any>>({});
  
  const playerId = storage.getPlayerId();
  const playerName = storage.getPlayerName() || 'لاعب مجهول';
  const { state: gameState } = useGame();

  useEffect(() => {
    if (!playerId) return;
    const unsub = subscribeToFriends(playerId, (f, p) => {
      setFriends(f);
      setPendingRequests(p);
      
      // Listen to user details for friends and requests
      const toFetch = [...f.map(friend => friend.friendId), ...p.map(req => req.fromId)];
      toFetch.forEach((id) => {
        if (id && !friendDetails[id]) {
          // Put a placeholder so we don't attach multiple listeners
          setFriendDetails(prev => ({ ...prev, [id]: {} }));
          
          import('firebase/firestore').then(({ doc, onSnapshot }) => {
            onSnapshot(doc(db as any, 'users', id), (uDoc) => {
              if (uDoc.exists()) {
                setFriendDetails(prev => ({ ...prev, [id]: uDoc.data() }));
              }
            });
          });
        }
      });
    });
    return unsub;
  }, [playerId]);

  const [friendStatus, setFriendStatus] = useState<{msg: string, type: 'success' | 'warn' | 'error'} | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const res = await searchUserById(searchQuery.trim());
    if (res && res.id !== playerId) {
        setSearchResults([res]);
    } else {
        setSearchResults([]);
    }
    setIsSearching(false);
  };

  const currentRoomData = gameState?.roomId ? {
    roomId: gameState.roomId,
    category: gameState.category,
    gameMode: gameState.gameMode,
  } : null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {friendStatus && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-max max-w-[90%] text-center px-4 py-2 rounded-xl text-sm font-bold animate-in slide-in-from-bottom-2 z-[60] shadow-lg ${friendStatus.type === 'success' ? 'bg-emerald-500 text-white' : friendStatus.type === 'error' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
             {friendStatus.msg}
          </div>
      )}

      <div className={`fixed top-0 bottom-0 right-0 w-full md:w-96 bg-slate-900 border-l border-slate-800 z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
               <Users className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg font-heading text-white">الأصدقاء</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-800">
          <button 
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'friends' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            القائمة ({friends.length})
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`relative flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'requests' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            الطلبات
            {pendingRequests.length > 0 && (
              <span className="absolute top-2 left-6 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'search' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            بحث
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
          
          {activeTab === 'search' && (
            <div className="space-y-4">
               <form onSubmit={handleSearch} className="relative">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="ابحث بواسطة معرف اللاعب (Player ID)..."
                   className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                 />
                 <button type="submit" className="absolute right-3 top-3 text-slate-400 hover:text-indigo-400" disabled={isSearching}>
                   <Search className={`w-5 h-5 ${isSearching ? 'animate-pulse' : ''}`} />
                 </button>
               </form>

               <div className="space-y-3 mt-4">
                 {searchResults.length === 0 && !isSearching && searchQuery && (
                   <div className="text-center text-slate-500 text-sm py-4">لم يتم العثور على أحد</div>
                 )}
               {searchResults.map(u => {
                   const isFriend = friends.some(f => f.friendId === u.id);
                   const hasSent = false; // Add logic if needed
                   
                   return (
                     <div key={u.id} className="bg-slate-800/50 p-3 rounded-2xl flex items-center justify-between border border-slate-700/50">
                       <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('open_player_profile', { detail: u.id }))}>
                         <img src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`} className="w-10 h-10 rounded-xl bg-slate-950 object-cover" alt="avatar" />
                         <div>
                           <div className="font-bold text-sm text-slate-200">{u.username}</div>
                           <div className="text-[10px] text-slate-500 font-mono">ID: {u.id}</div>
                         </div>
                       </div>
                       {!isFriend ? (
                         <button 
                           onClick={async () => {
                             const res = await sendFriendRequest(playerId, playerName || 'Unknown', u.id);
                             if (res) {
                               let type: 'success' | 'warn' | 'error' = 'warn';
                               if (res.success) type = 'success';
                               else if (res.code === 'error' || res.code === 'db_error') type = 'error';
                               setFriendStatus({ msg: res.message, type });
                               setTimeout(() => setFriendStatus(null), 3000);
                             }
                             // Don't filter out, they might want to see it or open profile
                             if (res && res.success) {
                               setSearchResults(prev => prev.filter(x => x.id !== u.id));
                             }
                           }}
                           title="إرسال طلب"
                           className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white p-2 rounded-lg transition-colors"
                         >
                           <UserPlus className="w-4 h-4" />
                         </button>
                       ) : (
                         <span className="text-xs text-emerald-400 font-bold px-2">صديق</span>
                       )}
                     </div>
                   );
                 })}
               </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-3">
              {pendingRequests.length === 0 && (
                <div className="text-center text-slate-400 text-sm py-10 flex flex-col items-center gap-3">
                  <Bell className="w-10 h-10 text-slate-700" />
                  لا توجد طلبات صداقة معلقة
                </div>
              )}
              {pendingRequests.map(req => {
                const details = friendDetails[req.fromId];
                const avatar = details?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.fromId}`;
                return (
                <div key={req.id} className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
                  <div 
                    className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.dispatchEvent(new CustomEvent('open_player_profile', { detail: req.fromId }))}
                  >
                     <img src={avatar} className="w-10 h-10 rounded-xl bg-slate-950 object-cover" alt="avatar" />
                     <div className="text-sm">
                       <div className="font-bold text-indigo-400 flex items-center gap-2">
                           {req.fromName}
                           <span className="text-[10px] text-slate-500 font-mono">ID: {req.fromId}</span>
                       </div>
                       <div className="text-xs text-slate-300 mt-0.5">أرسل لك طلب صداقة</div>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => respondToFriendRequest(req.id, true)}
                      className="flex-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" /> قبول
                    </button>
                    <button 
                      onClick={() => respondToFriendRequest(req.id, false)}
                      className="flex-1 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> رفض
                    </button>
                  </div>
                </div>
              )})}
            </div>
          )}

          {activeTab === 'friends' && (
             <div className="space-y-3">
               {friends.length === 0 && (
                 <div className="text-center text-slate-400 text-sm py-10 flex flex-col items-center gap-3">
                   <UserRound className="w-10 h-10 text-slate-700" />
                   ليس لديك أصدقاء بعد.<br/>ابحث عن أصدقاء لإضافتهم!
                 </div>
               )}
               {friends.map(friend => {
                 const details = friendDetails[friend.friendId];
                 const isOnline = details?.lastActive && (Date.now() - details.lastActive < 20000); // 20s
                 const name = details?.username || (friend.fromId === playerId ? friend.toId : friend.fromName);
                 const avatar = details?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.friendId}`;

                 return (
                   <div key={friend.id} className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50 flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('open_player_profile', { detail: friend.friendId }))}>
                         <div className="relative">
                           <img src={avatar} className="w-12 h-12 rounded-xl bg-slate-950 object-cover" alt="avatar" />
                           <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`}></div>
                         </div>
                         <div>
                           <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                               {name}
                               <span className="text-[10px] text-slate-500 font-mono font-normal">ID: {friend.friendId}</span>
                           </div>
                           <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                             {isOnline ? (
                               <span className="text-emerald-400">متصل الآن</span>
                             ) : (
                               <>
                                 <Clock className="w-3 h-3" />
                                 آخر ظهور: {details?.lastActive ? new Date(details.lastActive).toLocaleDateString() : 'غير معروف'}
                               </>
                             )}
                           </div>
                         </div>
                       </div>
                       
                       <button 
                         onClick={() => {
                           if (window.confirm('هل أنت متأكد من حذف هذا الصديق؟')) {
                             deleteFriend(friend.id);
                           }
                         }}
                         className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                         title="حذف الصديق"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                     
                     {currentRoomData && isOnline && (
                       <button
                         onClick={() => {
                           sendGameInvite(playerId, playerName, friend.friendId, currentRoomData);
                           alert('تم إرسال الدعوة!');
                         }}
                         className="w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors flex justify-center items-center gap-2 border border-indigo-500/20"
                       >
                         <Gamepad2 className="w-4 h-4" />
                         دعوة للغرفة الحالية
                       </button>
                     )}
                   </div>
                 );
               })}
             </div>
          )}
        </div>
      </div>
    </>
  );
}
