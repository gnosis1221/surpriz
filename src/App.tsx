// src/App.tsx

import React, { useState, useRef } from 'react'; // useRef'i import ettik
import CandleScreen from './components/CandleScreen';
import NotesGallery from './components/NotesGallery';
import Letter from './components/Letter';
import Counter from './components/Counter';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'candles' | 'notes' | 'letter'>('candles');
  const [showFireworks, setShowFireworks] = useState(false);

  // --- MÜZİK MANTIĞI BURAYA TAŞINDI ---
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayMusic = () => {
    const audio = audioRef.current;
    if (audio) {
      // Ses seviyesini isterseniz ayarlayabilirsiniz (0.0 ile 1.0 arası)
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.error("Müzik çalınırken hata oluştu:", error);
      });
    }
  };
  // ------------------------------------

  const handleCandlesComplete = () => {
    setShowFireworks(true);
    setTimeout(() => {
      setCurrentScreen('notes');
      setShowFireworks(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black overflow-hidden relative">
      {/* --- MÜZİK ELEMENTİ ARTIK BURADA, HEP AKTİF --- */}
      <audio ref={audioRef} src="/arkaplan-muzigi.mp3" loop hidden />
      
      <Counter />
      
      {currentScreen === 'candles' && (
        <CandleScreen 
          onComplete={handleCandlesComplete} 
          showFireworks={showFireworks}
          // Müziği başlatma fonksiyonunu prop olarak yolluyoruz
          onPlayMusic={handlePlayMusic}
        />
      )}
      
      {currentScreen === 'notes' && (
        <NotesGallery onLetterClick={() => setCurrentScreen('letter')} />
      )}
      
      {currentScreen === 'letter' && (
        <Letter onBack={() => setCurrentScreen('notes')} />
      )}
    </div>
  );
}

export default App;