import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { GameProvider } from './components/GameContext';
import Home from './pages/Home';
import Room from './pages/Room';
import Updates from './pages/Updates';
import SoloPlay from './pages/SoloPlay';
import FishingSolo from './pages/FishingSolo';
import PenaltySolo from './pages/PenaltySolo';
import DominoSolo from './pages/DominoSolo';
import HockeySolo from './pages/HockeySolo';
import ChickenSolo from './pages/ChickenSolo';
import TrueFalseSolo from './pages/TrueFalseSolo';
import SurvivalSolo from './pages/SurvivalSolo';
import KingMode from './pages/KingMode';
import SentenceOrderSolo from './pages/SentenceOrderSolo';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import TermsOfService from './pages/TermsOfService';
import { AdBanner } from './components/AdBanner';
import { useOnlinePresence } from './hooks/useOnlinePresence';
import { Footer } from './components/Footer';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Achievements from './pages/Achievements';
import { AchievementSystem } from './components/AchievementSystem';

import Settings from './pages/Settings';
import { GameInvitesListener } from './components/GameInvitesListener';

import { GlobalProfileModal } from './components/GlobalProfileModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import { audio } from './lib/audio';

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

    // Supabase auth recovery interception for HashRouter
    if (window.location.hash.includes('type=recovery')) {
       // Let supabase initialize session, then redirect to reset-password
       setTimeout(() => {
          window.location.hash = '#/reset-password';
       }, 500);
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500/30 font-sans flex flex-col" dir="rtl">
      <AchievementSystem />
      <GlobalProfileModal />
      <UsernamePrompt />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
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
            <Route path="/sentence-order" element={<SentenceOrderSolo />} />
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
      </main>
      
      <div className="w-full bg-slate-950 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AdBanner dataAdSlot="6036873429" />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
