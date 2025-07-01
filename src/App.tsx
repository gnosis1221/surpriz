// src/App.tsx

import React, { useState, useRef } from 'react';
import CandleScreen from './components/CandleScreen';
import NotesGallery from './components/NotesGallery';
import Letter from './components/Letter';
import Counter from './components/Counter';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'candles' | 'notes' | 'letter'>('candles');
  const [showFireworks, setShowFireworks] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // YENİ EKLEME: Müziğin durumunu takip etmek için state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const handlePlayMusic = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
      // play() bir Promise döndürür. Başarılı olduğunda state'i güncelle.
      audio.play()
        .then(() => {
          setIsMusicPlaying(true);
        })
        .catch(error => {
          console.error("Müzik çalınırken hata oluştu:", error);
        });
    }
  };

  const handleCandlesComplete = () => {
    setShowFireworks(true);
    setTimeout(() => {
      setCurrentScreen('notes');
      setShowFireworks(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black overflow-hidden relative">
      <audio ref={audioRef} src="/arkaplan-muzigi.mp3" loop hidden />
      
      <Counter />
      
      {currentScreen === 'candles' && (
        <CandleScreen 
          onComplete={handleCandlesComplete} 
          showFireworks={showFireworks}
          onPlayMusic={handlePlayMusic}
          // YENİ EKLEME: Müzik durumunu prop olarak yolluyoruz
          isMusicPlaying={isMusicPlaying}
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