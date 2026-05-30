import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, PublicRoom } from '../lib/firebase';

export default function DebugRooms() {
  const [allRooms, setAllRooms] = useState<PublicRoom[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  useEffect(() => {
    addLog("Mounting Debug component...");
    if (!db) {
      addLog("ERROR: target db is missing");
      return;
    }
    
    addLog("DB is available. Creating onSnapshot listener...");
    
    const unsubscribe = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      addLog(`onSnapshot triggered! Received ${snapshot.size} docs.`);
      
      const parsed: PublicRoom[] = [];
      snapshot.forEach(doc => {
         parsed.push(doc.data() as PublicRoom);
      });
      console.log("Debug parsed rooms:", parsed);
      setAllRooms(parsed);
    }, (err) => {
       addLog(`ERROR in onSnapshot: ${err.message}`);
    });

    return () => {
      addLog("Unmounting, removing listener.");
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">صفحة الـ Debug (فحص الغرف في Firestore)</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
           <h2 className="text-xl font-bold mb-4 text-emerald-400">سجل التتبع (Logs)</h2>
           <div className="space-y-2 text-sm font-mono text-slate-300">
             {logs.map((L, i) => (
                <div key={i} className="border-b border-white/5 pb-1">{L}</div>
             ))}
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
           <h2 className="text-xl font-bold mb-4 text-amber-400">جميع الغرف (بدون فلترة) ({allRooms.length})</h2>
           {allRooms.length === 0 ? (
             <p className="text-slate-500">لا توجد أي مستندات في مجموعة rooms حالياً.</p>
           ) : (
             <div className="space-y-4">
               {allRooms.map((room, i) => (
                 <div key={i} className="bg-slate-800 p-4 border border-slate-600 rounded-lg">
                   <p className="text-lg font-bold text-slate-100">{room.roomId}</p>
                   <pre className="text-xs text-slate-400 mt-2 overflow-x-auto" dir="ltr">
                     {JSON.stringify(room, null, 2)}
                   </pre>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
      <div className="mt-8 text-center">
        <a href="#/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold">العودة للرئيسية</a>
      </div>
    </div>
  );
}
