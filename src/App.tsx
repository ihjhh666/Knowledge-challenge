import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { GameProvider } from './components/GameContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import { AdBanner } from './components/AdBanner';
import { useOnlinePresence } from './hooks/useOnlinePresence';
import { Footer } from './components/Footer';
import { AchievementSystem } from './components/AchievementSystem';
import { GameInvitesListener } from './components/GameInvitesListener';
import { GlobalProfileModal } from './components/GlobalProfileModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { audio } from './lib/audio';
import { supabase } from './lib/supabase';
import BottomNav from './components/BottomNav';

// Lazy loading all other pages and modes
const Room = lazy(() => import('./pages/Room'));
const Rooms = lazy(() => import('./pages/Rooms'));
const Updates = lazy(() => import('./pages/Updates'));
const SoloPlay = lazy(() => import('./pages/SoloPlay'));
const FishingSolo = lazy(() => import('./pages/FishingSolo'));
const PenaltySolo = lazy(() => import('./pages/PenaltySolo'));
const DominoSolo = lazy(() => import('./pages/DominoSolo'));
const HockeySolo = lazy(() => import('./pages/HockeySolo'));
const ChickenSolo = lazy(() => import('./pages/ChickenSolo'));
const TrueFalseSolo = lazy(() => import('./pages/TrueFalseSolo'));
const SurvivalSolo = lazy(() => import('./pages/SurvivalSolo'));
const KingMode = lazy(() => import('./pages/KingMode'));
const SentenceOrderSolo = lazy(() => import('./pages/SentenceOrderSolo'));
const ProverbsSolo = lazy(() => import('./pages/ProverbsSolo'));
const LogoGame = lazy(() => import('./pages/LogoGame'));
const SortGame = lazy(() => import('./pages/SortGame'));
const FamousSolo = lazy(() => import('./pages/FamousSolo'));
const EmojiGuess = lazy(() => import('./pages/EmojiGuess'));
const IceSolo = lazy(() => import('./pages/IceSolo'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Account = lazy(() => import('./pages/Account'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Settings = lazy(() => import('./pages/Settings'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

function useGlobalAudio() {
  const location = useLocation();

  React.useEffect(() => {
    // Transition sound
    if (location.pathname !== '/' && location.pathname !== '/login') {
      audio.openModal();
    }
  }, [location.pathname]);

  React.useEffect(() => {
    let lastHovered: HTMLElement | null = null;
    
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button, a, [role="button"]');
      if (button && !button.hasAttribute('disabled')) {
        audio.click();
      }
    };

    const handleGlobalMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button, a, [role="button"]') as HTMLElement;
      if (button && button !== lastHovered && !button.hasAttribute('disabled')) {
        audio.hover();
        lastHovered = button;
      } else if (!button) {
        lastHovered = null;
      }
    };

    document.body.addEventListener('click', handleGlobalClick, { capture: true });
    document.body.addEventListener('mouseover', handleGlobalMouseOver, { passive: true });

    return () => {
      document.body.removeEventListener('click', handleGlobalClick, { capture: true });
      document.body.removeEventListener('mouseover', handleGlobalMouseOver);
    };
  }, []);
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <GameProvider>
          <GameInvitesListener />
          <AppContent />
        </GameProvider>
      </AuthProvider>
    </HashRouter>
  );
}

import { migrateUserData } from './lib/firebase';
import { storage } from './lib/storage';

import { UsernamePrompt } from './components/UsernamePrompt';

function AppContent() {
  useOnlinePresence();
  useGlobalAudio();

  const [isRecovering, setIsRecovering] = React.useState(true);

  React.useEffect(() => {
    // Apply theme on mount
    const settings = storage.getSettings();
    if (settings.theme === 'light') {
       document.documentElement.classList.add('light');
    } else {
       document.documentElement.classList.remove('light');
    }

    const checkMigration = async () => {
      let id = localStorage.getItem('know_player_id');
      if (id && id.startsWith('user_')) {
        const newId = Math.floor(10000000 + Math.random() * 90000000).toString();
        // save new ID locally immediately
        localStorage.setItem('know_player_id', newId);
        
        let avatar = localStorage.getItem('know_player_avatar');
        if (avatar && avatar.includes(id)) {
            localStorage.setItem('know_player_avatar', `https://api.dicebear.com/7.x/bottts/svg?seed=${newId}`);
        }

        // migrate in Firebase asynchronously
        await migrateUserData(id, newId);
      }
    };
    checkMigration();

    // Supabase auth recovery interception for HashRouter and PKCE
    const hashStr = window.location.hash;
    const url = new URL(window.location.href);
    
    let code = url.searchParams.get('code');
    if (!code && hashStr.includes('code=')) {
      const match = hashStr.match(/[?&]code=([^&]+)/);
      if (match) code = match[1];
    }
    
    const isImplicitRecovery = hashStr.includes('type=recovery') || hashStr.includes('access_token=');

    if (!code && !isImplicitRecovery) {
      setIsRecovering(false);
      return;
    }

    const handleRecovery = async () => {
      if (code) {
        try {
          // If strict mode causes this to run twice, only the first will succeed,
          // which is fine, because it establishes the session in Supabase client locally.
          await supabase.auth.exchangeCodeForSession(code);
        } catch (err) {
          console.log("Code exchange error (might be already exchanged):", err);
        }
      } 
      else if (isImplicitRecovery) {
        let paramsString = hashStr;
        const hashParts = hashStr.split('#');
        for (const part of hashParts) {
            if (part.includes('access_token=')) {
                paramsString = part;
                break;
            }
        }
        
        if (paramsString.includes('?')) {
            paramsString = paramsString.split('?')[1];
        } else if (paramsString.startsWith('/')) {
            paramsString = paramsString.replace(/^\/reset-password\/?/, '');
            if (paramsString.startsWith('?') || paramsString.startsWith('&') || paramsString.startsWith('#')) {
                paramsString = paramsString.substring(1);
            }
        }

        const params = new URLSearchParams(paramsString);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        if (accessToken && refreshToken) {
          try {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
          } catch (err) {
            console.log("Session set error:", err);
          }
        }
      }

      // Restore URL and redirect Hash Router to reset-password
      url.searchParams.delete('code');
      window.history.replaceState({}, document.title, url.pathname + url.search);
      window.location.hash = '#/reset-password';
      setIsRecovering(false);
    };
    
    handleRecovery();
  }, []);
  
  if (isRecovering) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white font-heading">جاري التحقق من الرابط...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500/30 font-sans flex flex-col" dir="rtl">
      <AchievementSystem />
      <GlobalProfileModal />
      <UsernamePrompt />
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/account" element={<Account />} />
              <Route path="/room/:roomId" element={<Room />} />
              <Route path="/updates" element={<Updates />} />
              <Route path="/solo" element={<SoloPlay />} />
              <Route path="/fishing" element={<FishingSolo />} />
              <Route path="/penalty" element={<PenaltySolo />} />
              <Route path="/domino" element={<DominoSolo />} />
              <Route path="/hockey-solo" element={<HockeySolo />} />
              <Route path="/chicken-solo" element={<ChickenSolo />} />
              <Route path="/king-mode" element={<KingMode />} />
              <Route path="/true-false" element={<TrueFalseSolo />} />
              <Route path="/survival" element={<SurvivalSolo />} />
              <Route path="/famous-solo" element={<FamousSolo />} />
              <Route path="/emoji-guess" element={<EmojiGuess />} />
              <Route path="/sentence-order" element={<SentenceOrderSolo />} />
              <Route path="/proverbs" element={<ProverbsSolo />} />
              <Route path="/logos" element={<LogoGame />} />
              <Route path="/sort" element={<SortGame />} />
              <Route path="/ice-slide" element={<IceSolo />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      
      <BottomNav />
      
      <div className="w-full bg-transparent px-4 py-8 mb-16 md:mb-0">
        <div className="max-w-4xl mx-auto">
          <AdBanner dataAdSlot="6036873429" />
        </div>
      </div>
      
      <div className="mb-16 md:mb-0">
        <Footer />
      </div>
    </div>
  );
}
