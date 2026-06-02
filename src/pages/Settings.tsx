import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Save, User as UserIcon, MonitorSmartphone, Volume2, PaintBucket, Gamepad2, Settings as SettingsIcon, Copy, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage, UserSettings as SettingsType } from '../lib/storage';
import { updateUserProfile } from '../lib/firebase';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsType>(storage.getSettings());
  const [username, setUsername] = useState(storage.getPlayerName() || '');
  const [avatar, setAvatar] = useState(storage.getPlayerAvatar());
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const playerId = storage.getPlayerId();

  useEffect(() => {
    // Sync local state when mounted
    setSettings(storage.getSettings());
    setUsername(storage.getPlayerName() || '');
    setAvatar(storage.getPlayerAvatar());
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Save locally
    storage.setSettings(settings);
    
    const newName = username.trim();
    if (newName.length >= 2) {
       storage.setPlayerName(newName);
    }
    storage.setPlayerAvatar(avatar);

    // Save to firebase
    await updateUserProfile(playerId, {
       username: newName.length >= 2 ? newName : (storage.getPlayerName() || 'لاعب مجهول'),
       avatarUrl: avatar
    });

    // We can also apply global dark mode here if we have it
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setTimeout(() => {
        setIsSaving(false);
    }, 500);
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
      setSettings({ ...settings, theme });
      if (theme === 'dark') {
         document.documentElement.classList.add('dark');
      } else {
         document.documentElement.classList.remove('dark');
      }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(playerId);
    alert('تم نسخ المعرف بنجاح!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
       alert('الرجاء اختيار صورة صالحة');
       return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
             const canvas = document.createElement('canvas');
             const MAX_SIZE = 256;
             let width = img.width;
             let height = img.height;

             if (width > height) {
                 if (width > MAX_SIZE) {
                     height *= MAX_SIZE / width;
                     width = MAX_SIZE;
                 }
             } else {
                 if (height > MAX_SIZE) {
                     width *= MAX_SIZE / height;
                     height = MAX_SIZE;
                 }
             }

             canvas.width = width;
             canvas.height = height;
             const ctx = canvas.getContext('2d');
             if (ctx) {
                 ctx.drawImage(img, 0, 0, width, height);
                 const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                 setAvatar(dataUrl);
             }
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => navigate('/')}
               className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
             >
               <ChevronRight className="w-5 h-5" />
             </button>
             <div className="flex items-center gap-2">
                 <SettingsIcon className="w-6 h-6 text-indigo-400" />
                 <h1 className="text-2xl font-bold font-heading">الإعدادات</h1>
             </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold transition-colors flex flex-row items-center gap-2 shadow-lg hover:shadow-indigo-500/20"
          >
            {isSaving ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : <Save className="w-5 h-5" />}
            حفظ
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            
            {/* Account Settings */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex items-center gap-2 text-sky-400 mb-4 border-b border-slate-800 pb-4">
                   <UserIcon className="w-5 h-5" />
                   <h2 className="text-lg font-bold">إعدادات الحساب</h2>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                   <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-2xl bg-slate-950 object-cover border-2 border-slate-700" />
                   <div className="flex gap-2">
                       <input 
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         ref={fileInputRef} 
                         onChange={handleImageUpload}
                       />
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="text-xs bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white px-4 py-2 rounded-lg transition-colors border border-indigo-500/30 flex items-center gap-2"
                       >
                           <Upload className="w-4 h-4" />
                           رفع صورة
                       </button>
                       <button 
                         onClick={() => setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random().toString(36).substring(7)}`)}
                         className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-colors border border-slate-700"
                       >
                           صورة عشوائية
                       </button>
                   </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400">اسم المستخدم</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors" 
                    />
                </div>

                <div className="space-y-2 pt-4">
                    <label className="text-sm font-bold text-slate-400">معرف اللاعب (Player ID)</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 font-mono text-center tracking-widest font-bold text-lg">
                           {playerId}
                        </div>
                        <button 
                          onClick={copyToClipboard}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-3 rounded-xl transition-colors border border-slate-700 flex items-center justify-center shrink-0"
                          title="نسخ المعرف"
                        >
                           <Copy className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sound Settings */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex flex-col space-y-6">
                    <div className="flex items-center gap-2 text-rose-400 mb-2 border-b border-slate-800 pb-4">
                       <Volume2 className="w-5 h-5" />
                       <h2 className="text-lg font-bold">إعدادات الصوت</h2>
                    </div>
                    
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="font-bold text-slate-300 group-hover:text-white transition-colors">الموسيقى المحيطية</span>
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-transform ${settings.soundEnabled ? 'right-1' : 'right-7'}`} />
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.soundEnabled} onChange={e => setSettings({...settings, soundEnabled: e.target.checked})} />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="font-bold text-slate-300 group-hover:text-white transition-colors">التأثيرات الصوتية (SFX)</span>
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${settings.sfxEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-transform ${settings.sfxEnabled ? 'right-1' : 'right-7'}`} />
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.sfxEnabled} onChange={e => setSettings({...settings, sfxEnabled: e.target.checked})} />
                    </label>
                </div>
            </div>

            {/* Graphics & Appearance */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex items-center gap-2 text-amber-400 mb-4 border-b border-slate-800 pb-4">
                   <PaintBucket className="w-5 h-5" />
                   <h2 className="text-lg font-bold">الرسوم والواجهة</h2>
                </div>
                
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-400 block mb-2">جودة الرسوم</label>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {['low', 'medium', 'high'].map(q => (
                            <button
                               key={q}
                               className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${settings.graphicsQuality === q ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                               onClick={() => setSettings({...settings, graphicsQuality: q as any})}
                            >
                               {q === 'low' ? 'منخفضة' : q === 'medium' ? 'متوسطة' : 'عالية'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    <label className="text-sm font-bold text-slate-400 block mb-2">المظهر</label>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                           className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${settings.theme === 'dark' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                           onClick={() => handleThemeChange('dark')}
                        >
                           داكن 🌙
                        </button>
                        <button
                           className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${settings.theme === 'light' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                           onClick={() => handleThemeChange('light')}
                        >
                           فاتح ☀️
                        </button>
                    </div>
                </div>
            </div>

            {/* Game Settings */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex flex-col space-y-6">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2 border-b border-slate-800 pb-4">
                       <Gamepad2 className="w-5 h-5" />
                       <h2 className="text-lg font-bold">إعدادات الألعاب</h2>
                    </div>
                    
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="font-bold text-slate-300 group-hover:text-white transition-colors">إظهار المؤثرات البصرية (VFX)</span>
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${settings.showVFX ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-transform ${settings.showVFX ? 'right-1' : 'right-7'}`} />
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.showVFX} onChange={e => setSettings({...settings, showVFX: e.target.checked})} />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group opacity-50 cursor-not-allowed">
                        <div>
                           <div className="font-bold text-slate-300">الاهتزاز (Haptics)</div>
                           <div className="text-[10px] text-slate-500 mt-1">يأتي قريباً...</div>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors relative bg-slate-800 border border-slate-700`}>
                            <div className={`absolute top-1 bottom-1 w-4 bg-slate-600 rounded-full transition-transform right-7`} />
                        </div>
                    </label>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}
