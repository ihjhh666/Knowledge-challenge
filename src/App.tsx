import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { GameProvider } from './components/GameContext';
import Home from './pages/Home';
import Room from './pages/Room';
import SoloPlay from './pages/SoloPlay';
import FishingSolo from './pages/FishingSolo';
import PenaltySolo from './pages/PenaltySolo';
import DominoSolo from './pages/DominoSolo';
import HockeySolo from './pages/HockeySolo';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import TermsOfService from './pages/TermsOfService';
import DebugRooms from './pages/DebugRooms';
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

function AppContent() {
  useOnlinePresence();

  React.useEffect(() => {
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
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500/30 font-sans flex flex-col" dir="rtl">
      <AchievementSystem />
      <GlobalProfileModal />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/solo" element={<SoloPlay />} />
          <Route path="/fishing" element={<FishingSolo />} />
          <Route path="/penalty" element={<PenaltySolo />} />
          <Route path="/domino" element={<DominoSolo />} />
          <Route path="/hockey-solo" element={<HockeySolo />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/debug" element={<DebugRooms />} />
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
