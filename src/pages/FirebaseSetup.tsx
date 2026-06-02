import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Settings, Save, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FirebaseSetup() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  const [status, setStatus] = useState<{ type: 'idle' | 'testing' | 'success' | 'error', message: string }>({
    type: 'idle',
    message: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('custom_firebase_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) { }
    } else {
      setConfig({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({ ...prev, [e.target.name]: e.target.value.trim() }));
  };

  const handleSave = () => {
    localStorage.setItem('custom_firebase_config', JSON.stringify(config));
    setStatus({ type: 'success', message: 'تم حفظ الإعدادات بنجاح. سيتم الآن إعادة تحميل الصفحة لتطبيق التغييرات.' });
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  const testConnection = async () => {
    setStatus({ type: 'testing', message: 'جاري اختبار الاتصال...' });
    
    try {
      const tempApp = initializeApp(config, 'test-app-' + Date.now());
      const tempAuth = getAuth(tempApp);
      const tempDb = getFirestore(tempApp);
      
      if (tempAuth && tempDb) {
         setStatus({ type: 'success', message: 'Firebase Connected Successfully!' });
      } else {
         setStatus({ type: 'error', message: 'فشل في تهيئة أدوات Firebase.' });
      }
    } catch (error: any) {
      console.error('Test connection error:', error);
      setStatus({ type: 'error', message: `خطأ أثناء الاتصال: ${error.message || 'تأكد من صحة البيانات وتفعيل Authentication و Firestore.'}` });
    }
  };

  const fields = [
    { name: 'apiKey', label: 'API Key (VITE_FIREBASE_API_KEY)', type: 'text' },
    { name: 'authDomain', label: 'Auth Domain (VITE_FIREBASE_AUTH_DOMAIN)', type: 'text' },
    { name: 'projectId', label: 'Project ID (VITE_FIREBASE_PROJECT_ID)', type: 'text' },
    { name: 'storageBucket', label: 'Storage Bucket (VITE_FIREBASE_STORAGE_BUCKET)', type: 'text' },
    { name: 'messagingSenderId', label: 'Messaging Sender ID (VITE_FIREBASE_MESSAGING_SENDER_ID)', type: 'text' },
    { name: 'appId', label: 'App ID (VITE_FIREBASE_APP_ID)', type: 'text' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex pb-20 items-start justify-center p-4 pt-12 overflow-y-auto" dir="ltr">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative">
         <button onClick={() => navigate('/')} className="absolute top-4 right-4 text-slate-400 hover:text-white">
             Back to Home
         </button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Firebase Setup</h1>
            <p className="text-slate-400 text-sm mt-1">Configure your Firebase project credentials</p>
          </div>
        </div>

        {status.message && (
          <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${
            status.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
            status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
            'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
          }`}>
            {status.type === 'error' && <XCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            {status.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            {status.type === 'testing' && <RefreshCw className="w-5 h-5 shrink-0 mt-0.5 animate-spin" />}
            
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        <div className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-xs font-semibold text-slate-400 mb-1">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={(config as any)[field.name]}
                onChange={handleChange}
                placeholder={`Enter ${field.label}`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                spellCheck="false"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-800">
          <button
            onClick={testConnection}
            disabled={status.type === 'testing'}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${status.type === 'testing' ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
            Test Connection
          </button>
          
          <button
            onClick={handleSave}
            disabled={status.type === 'testing'}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-indigo-500/20 shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
