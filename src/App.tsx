import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './components/GameContext';
import Home from './pages/Home';
import Room from './pages/Room';
import SoloPlay from './pages/SoloPlay';
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
import FishingSolo from './pages/FishingSolo';

export default function App() {
  return (
    <HashRouter>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </HashRouter>
  );
}

function AppContent() {
  useOnlinePresence();
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500/30 font-sans flex flex-col" dir="rtl">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/solo" element={<SoloPlay />} />
          <Route path="/fishing" element={<FishingSolo />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
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
