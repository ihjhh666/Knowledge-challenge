import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Save, User as UserIcon, Settings as SettingsIcon, Copy, Upload, LogOut, Shield, Bell, Info, ShieldAlert, FileText, Mail, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage, UserSettings as SettingsType } from '../lib/storage';
import { updateUserProfile } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [settings, setSettings] = useState<SettingsType>(storage.getSettings());
  const [username, setUsername] = useState(storage.getPlayerName() || '');
  const [avatar, setAvatar] = useState(storage.getPlayerAvatar());
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const playerId = storage.getPlayerId();

  // Get shortId from localStorage or default
  // Actually shortId is loaded from Profile stats normally, but playerId is fallback
  const [shortId, setShortId] = useState(playerId.substring(0, 8));

  useEffect(() => {
    setSettings(storage.getSettings());
    setUsername(storage.getPlayerName() || '');
    setAvatar(storage.getPlayerAvatar());
    
    // Attempt to grab shortId from Firestore if possible, but fallback is local UUID segment
    import('../lib/firebase').then(({ searchUserById }) => {
        searchUserById(playerId).then(u => {
           if (u && (u as any).shortId) setShortId((u as any).shortId);
        });
    });
  }, [playerId]);

  const handleSave = async () => {
    console.log("SAVE_USERNAME_STARTED");
    setIsSaving(true);
    storage.setSettings(settings);
    
    const newName = username.trim();
    let updatedName = storage.getPlayerName() || 'لاعب مجهول';
    if (newName.length >= 2) {
       storage.setPlayerName(newName);
       updatedName = newName;
    }
    storage.setPlayerAvatar(avatar);

    try {
      await updateUserProfile(playerId, {
         username: updatedName,
         playerName: updatedName,
         avatarUrl: avatar
      });

      // Update Supabase Database records
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
         await supabase.from('players').update({
            username: updatedName,
            avatar_url: avatar
         }).eq('id', sessionData.session.user.id);
         
         await supabase.auth.updateUser({
            data: { username: updatedName, avatar_url: avatar }
         });
      }

      console.log("SAVE_USERNAME_SUCCESS");
      
      if (settings.theme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }

      setTimeout(() => {
          setIsSaving(false);
          alert('تم الحفظ بنجاح');
      }, 500);
    } catch (err) {
      console.error("SAVE_USERNAME_ERROR", err);
      setIsSaving(false);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortId);
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

  const handleLogout = async () => {
      console.log("LOGOUT_STARTED");
      if (confirm('هل تريد تسجيل الخروج؟\n\nلن يتم حذف حسابك أو إنجازاتك أو أصدقائك. يمكنك تسجيل الدخول مرة أخرى في أي وقت.')) {
         try {
           await logout();
           console.log("LOGOUT_SUCCESS");
           navigate('/login');
         } catch (err) {
           console.error("LOGOUT_ERROR", err);
           alert('حدث خطأ أثناء تسجيل الخروج');
         }
      } else {
         console.log("LOGOUT_CANCELED");
      }
  };

  const Toggle = ({ label, checked, onChange, desc }: any) => (
      <label className="flex items-center justify-between cursor-pointer group py-2">
          <div>
             <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
             {desc && <span className="block text-xs text-slate-500 mt-1">{desc}</span>}
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-indigo-500' : 'bg-slate-700'}`}>
              <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-transform ${checked ? 'right-1' : 'right-7'}`} />
          </div>
          <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
      </label>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 overflow-y-auto" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
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
             <span className="hidden sm:inline">حفظ الإعدادات</span>
           </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
            
            {/* Account Settings */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-5">
                   <UserIcon className="w-48 h-48 -mr-12 -mt-12" />
                </div>
                <div className="flex items-center gap-2 text-sky-400 mb-4 border-b border-slate-800 pb-4 relative">
                   <UserIcon className="w-5 h-5" />
                   <h2 className="text-lg font-bold">الحساب</h2>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 relative">
                   <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-2xl bg-slate-950 object-cover border-2 border-slate-700 shrink-0 shadow-lg" />
                   <div className="flex flex-col gap-3 w-full">
                       <input 
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         ref={fileInputRef} 
                         onChange={handleImageUpload}
                       />
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="w-full justify-center text-sm bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-4 py-3 rounded-xl transition-colors border border-indigo-500/20 flex items-center gap-2 font-bold"
                       >
                           <Upload className="w-4 h-4" />
                           تعديل الصورة
                       </button>
                   </div>
                </div>

                <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-400">اسم المستخدم</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors" 
                    />
                </div>

                <div className="space-y-2 pt-2 relative">
                    <label className="text-sm font-bold text-slate-400">معرف اللاعب (Player ID)</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-slate-300 font-mono text-center tracking-widest font-bold text-lg cursor-not-allowed">
                           {shortId}
                        </div>
                        <button 
                          onClick={copyToClipboard}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-4 rounded-xl transition-colors border border-slate-700 flex items-center justify-center shrink-0"
                          title="نسخ المعرف"
                        >
                           <Copy className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                <div className="pt-4 border-t border-slate-800/50 relative">
                    <button 
                      onClick={handleLogout}
                      className="w-full justify-center text-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-4 py-3 rounded-xl transition-colors flex items-center gap-2 font-bold"
                    >
                        <LogOut className="w-5 h-5" />
                        تسجيل الخروج
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                
                {/* Privacy */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2 border-b border-slate-800 pb-4">
                       <Shield className="w-5 h-5" />
                       <h2 className="text-lg font-bold">الخصوصية</h2>
                    </div>
                    
                    <Toggle 
                       label="إظهار الملف الشخصي للعامة" 
                       checked={settings.privacyShowProfile} 
                       onChange={(v: boolean) => setSettings({...settings, privacyShowProfile: v})} 
                    />
                    <Toggle 
                       label="إظهار إنجازاتي" 
                       checked={settings.privacyShowAchievements} 
                       onChange={(v: boolean) => setSettings({...settings, privacyShowAchievements: v})} 
                    />
                    <Toggle 
                       label="السماح بطلبات الصداقة" 
                       checked={settings.privacyAllowFriendRequests} 
                       onChange={(v: boolean) => setSettings({...settings, privacyAllowFriendRequests: v})} 
                    />
                    <Toggle 
                       label="إظهار حالة السكوت (آخر ظهور)" 
                       checked={settings.privacyShowLastSeen} 
                       onChange={(v: boolean) => setSettings({...settings, privacyShowLastSeen: v})} 
                    />
                </div>

                {/* Notifications */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 text-amber-400 mb-2 border-b border-slate-800 pb-4">
                       <Bell className="w-5 h-5" />
                       <h2 className="text-lg font-bold">الإشعارات</h2>
                    </div>
                    
                    <Toggle 
                       label="تنبيهات طلبات الصداقة" 
                       checked={settings.notifyFriendRequests} 
                       onChange={(v: boolean) => setSettings({...settings, notifyFriendRequests: v})} 
                    />
                    <Toggle 
                       label="تنبيهات الإنجازات" 
                       checked={settings.notifyAchievements} 
                       onChange={(v: boolean) => setSettings({...settings, notifyAchievements: v})} 
                    />
                    <Toggle 
                       label="إشعارات المكافآت اليومية" 
                       checked={settings.notifyDailyRewards} 
                       onChange={(v: boolean) => setSettings({...settings, notifyDailyRewards: v})} 
                    />
                </div>
                
                {/* About */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-4">
                       <Info className="w-5 h-5" />
                       <h2 className="text-lg font-bold">حول التطبيق</h2>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm font-bold text-slate-300 py-2">
                        <span>إصدار التطبيق</span>
                        <span className="text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded-md">v1.0.0</span>
                    </div>
                    
                    <button onClick={() => navigate('/privacy')} className="w-full flex items-center justify-between py-2.5 text-slate-300 hover:text-white transition-colors group">
                        <div className="flex items-center gap-3 font-bold text-sm">
                           <ShieldAlert className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" /> سياسة الخصوصية
                        </div>
                        <div className="bg-slate-800 p-1.5 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                          <ChevronRight className="w-4 h-4 text-slate-500 rotate-180 group-hover:text-indigo-400" />
                        </div>
                    </button>
                    
                    <button onClick={() => navigate('/terms')} className="w-full flex items-center justify-between py-2.5 text-slate-300 hover:text-white transition-colors group border-t border-slate-800/50">
                        <div className="flex items-center gap-3 font-bold text-sm">
                           <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" /> شروط الاستخدام
                        </div>
                        <div className="bg-slate-800 p-1.5 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                          <ChevronRight className="w-4 h-4 text-slate-500 rotate-180 group-hover:text-indigo-400" />
                        </div>
                    </button>
                    
                    <button onClick={() => navigate('/contact')} className="w-full flex items-center justify-between py-2.5 text-slate-300 hover:text-white transition-colors group border-t border-slate-800/50">
                        <div className="flex items-center gap-3 font-bold text-sm">
                           <Mail className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" /> اتصل بنا
                        </div>
                        <div className="bg-slate-800 p-1.5 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                          <ChevronRight className="w-4 h-4 text-slate-500 rotate-180 group-hover:text-indigo-400" />
                        </div>
                    </button>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
}
