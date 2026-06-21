import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Trophy, User } from 'lucide-react';

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 md:hidden pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </NavLink>

        <NavLink
          to="/rooms"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-bold">الغرف</span>
        </NavLink>

        <NavLink
          to="/leaderboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'
            }`
          }
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-bold">المتصدرين</span>
        </NavLink>

        <NavLink
          to="/account"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">الحساب</span>
        </NavLink>
      </div>
    </div>
  );
}
