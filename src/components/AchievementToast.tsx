import React, { useEffect, useState } from 'react';
import { Achievement } from '../lib/achievements';
import { X } from 'lucide-react';

interface Props {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for transition
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const rarityConfigs = {
    common: {
      border: 'border-slate-500',
      bg: 'bg-slate-800',
      text: 'text-slate-300',
      glow: '',
      titleColor: 'text-white'
    },
    medium: {
      border: 'border-sky-500',
      bg: 'bg-blue-900',
      text: 'text-blue-300',
      glow: 'shadow-blue-500/50',
      titleColor: 'text-sky-100'
    },
    rare: {
      border: 'border-purple-500',
      bg: 'bg-purple-900',
      text: 'text-purple-300',
      glow: 'shadow-purple-500/50',
      titleColor: 'text-purple-100'
    },
    legendary: {
      border: 'border-amber-400',
      bg: 'bg-gradient-to-r from-amber-900 via-yellow-700 to-amber-900',
      text: 'text-amber-200',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse',
      titleColor: 'text-amber-100'
    }
  };

  const config = rarityConfigs[achievement.rarity];
  const Icon = achievement.icon;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-95'}`}>
      <div className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 shadow-xl w-80 md:w-96 overflow-hidden ${config.border} ${config.bg} ${config.glow}`}>
        {/* Glow effect for legendary */}
        {achievement.rarity === 'legendary' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        )}
        
        <div className={`p-3 rounded-full border border-white/20 shadow-inner bg-white/10 shrink-0 ${achievement.rarity === 'legendary' ? 'animate-bounce' : ''}`}>
          <Icon className={`w-8 h-8 ${config.text}`} />
        </div>
        
        <div className="flex-1 min-w-0 z-10 text-right">
          <p className="text-xs uppercase tracking-widest font-bold opacity-80 mb-0.5 text-white/70">
            إنجاز جديد ({
              achievement.rarity === 'common' ? 'عادية' : 
              achievement.rarity === 'medium' ? 'متوسطة' : 
              achievement.rarity === 'rare' ? 'نادرة' : 'أسطورية'
            })
          </p>
          <h4 className={`font-bold text-lg truncate ${config.titleColor}`}>{achievement.title}</h4>
          <p className="text-sm truncate opacity-90 text-white/80">{achievement.description}</p>
        </div>

        <button 
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          className="absolute top-2 left-2 p-1 bg-white/10 rounded-full hover:bg-white/20 transition opacity-50 hover:opacity-100"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
