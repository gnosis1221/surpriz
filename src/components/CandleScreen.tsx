import React, { useEffect, useRef, useState, useCallback } from 'react';
import Fireworks from './Fireworks';
import Confetti from './Confetti';
import { Mic, MicOff } from 'lucide-react';

interface CandleScreenProps {
  onComplete: () => void;
  showFireworks: boolean;
  onPlayMusic: () => void; // --> MÜZİK TETİKLEME PROPU EKLENDİ
}

interface Candle {
  x: number;
  y: number;
  lit: boolean;
  flame: { x: number; y: number; size: number };
}

// --> Değişiklik: Ayarları kolayca değiştirmek için sabitler tanımlandı
const BLOW_SENSITIVITY = 30; // Üflemeyi algılama hassasiyeti. Gerekirse artırıp azaltın.
const REQUIRED_BLOW_DURATION = 2000; // Mumun sönmesi için gereken üfleme süresi (ms).
const BLOW_RESET_TIME = 500; // Ses kesildikten ne kadar süre sonra üfleme sayacının sıfırlanacağı (ms).

const CandleScreen: React.FC<CandleScreenProps> = ({ onComplete, showFireworks, onPlayMusic }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const blowStartTimeRef = useRef<number | null>(null);

  const [candles, setCandles] = useState<Candle[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const [candlesInitialized, setCandlesInitialized] = useState(false);
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isListening, setIsListening] = useState(false);
  const [soundLevel, setSoundLevel] = useState(0);
  const [blowProgress, setBlowProgress] = useState(0);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  }, []);

  const blowOutCandle = useCallback(() => {
    setCandles(prevCandles => {
      const litCandles = prevCandles.filter(candle => candle.lit);
      if (litCandles.length === 0) return prevCandles;

      const randomIndex = Math.floor(Math.random() * litCandles.length);
      const candleToBlowOut = litCandles[randomIndex];

      const newCandles = prevCandles.map(candle =>
        candle === candleToBlowOut ? { ...candle, lit: false } : candle
      );

      const remainingLit = newCandles.filter(c => c.lit).length;
      if (remainingLit === 0) {
        setShowMessage(true);
        setTimeout(() => {
          onComplete();
          stopListening();
        }, 2000);
      }
      return newCandles;
    });
  }, [onComplete, stopListening]);

  const startListening = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // --> Değişiklik: Sadece düşük frekansları analiz edeceğiz.
    // Üfleme sesi genellikle düşük frekanslıdır. Bu, ortamdaki diğer seslerden ayırt etmeye yardımcı olur.
    const lowFreqRange = Math.floor(bufferLength * 0.2); // Frekans aralığının ilk %20'si

    const detectSound = () => {
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < lowFreqRange; i++) {
        sum += dataArray[i];
      }
      const averageLowFreq = sum / lowFreqRange;
      setSoundLevel(averageLowFreq);

      const now = Date.now();

      // --> Değişiklik: Zamanlayıcı mantığı basitleştirildi.
      if (averageLowFreq > BLOW_SENSITIVITY) {
        if (blowStartTimeRef.current === null) {
          blowStartTimeRef.current = now;
        }

        const blowDuration = now - blowStartTimeRef.current;
        const progress = Math.min(100, (blowDuration / REQUIRED_BLOW_DURATION) * 100);
        setBlowProgress(progress);

        if (blowDuration >= REQUIRED_BLOW_DURATION) {
          blowOutCandle();
          blowStartTimeRef.current = null; // Sıfırla
          setBlowProgress(0);
        }
      } else {
        if (blowStartTimeRef.current && (now - blowStartTimeRef.current > BLOW_RESET_TIME)) {
          blowStartTimeRef.current = null;
          setBlowProgress(0);
        }
      }
      animationFrameRef.current = requestAnimationFrame(detectSound);
    };

    detectSound();
  }, [blowOutCandle]);

  const initializeMicrophone = async () => {
    // --> Değişiklik: AudioContext'in askıda kalmasını engelleme
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Kullanıcı etkileşimiyle AudioContext'i başlat/devam ettir
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.5;

      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      microphone.connect(analyserRef.current);

      onPlayMusic(); 

      setMicPermission('granted');
      setIsListening(true);
      startListening();
    } catch (error) {
      console.error('Mikrofon erişimi reddedildi:', error);
      setMicPermission('denied');
    }
  };

  // Canvas çizim ve animasyon useEffect'i (içerik aynı, sadece ayırdım)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initCandles = (width: number, height: number) => {
      const newCandles: Candle[] = [];
      const centerX = width / 2;
      const centerY = height / 2;
      const cakeRadius = Math.min(width, height) * 0.15;
      for (let i = 0; i < 3; i++) {
        const angle = (i * 2 * Math.PI) / 7;
        const x = centerX + Math.cos(angle) * cakeRadius * 0.8;
        const y = centerY + Math.sin(angle) * cakeRadius * 0.8 - 60;
        newCandles.push({
          x,
          y,
          lit: true,
          flame: { x: x, y: y - 20, size: Math.random() * 3 + 5 }
        });
      }
      setCandles(newCandles);
      setCandlesInitialized(true);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (!candlesInitialized) {
        initCandles(canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // ... (Pasta ve mum çizim kodunuz burada, hiç değiştirilmedi)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const cakeRadius = Math.min(canvas.width, canvas.height) * 0.15;

      ctx.fillStyle = '#8B4513';
      ctx.fillRect(centerX - cakeRadius, centerY - 30, cakeRadius * 2, 60);
      ctx.fillStyle = '#FFB6C1';
      ctx.fillRect(centerX - cakeRadius, centerY - 40, cakeRadius * 2, 20);
      ctx.fillStyle = '#FF69B4';
      for (let i = 0; i < 5; i++) {
        const decorX = centerX - cakeRadius + (i * cakeRadius * 0.4) + 20;
        ctx.beginPath();
        ctx.arc(decorX, centerY - 30, 3, 0, 2 * Math.PI);
        ctx.fill();
      }

      candles.forEach((candle, index) => {
        ctx.fillStyle = '#FFFACD';
        ctx.fillRect(candle.x - 3, candle.y - 40, 6, 40);
        ctx.fillStyle = '#F0E68C';
        ctx.fillRect(candle.x - 3, candle.y - 45, 6, 5);

        if (candle.lit) {
          const time = Date.now() * 0.01;
          const flameSize = candle.flame.size + Math.sin(time + index) * 2;
          const flameX = candle.flame.x + Math.sin(time * 0.5 + index) * 1;
          const flameY = candle.flame.y + Math.sin(time * 0.3 + index) * 0.5;

          const soundEffect = soundLevel * 0.05;
          const flickerX = flameX + Math.sin(time * 3 + index) * soundEffect;
          const flickerY = flameY + Math.sin(time * 4 + index) * soundEffect;

          const gradient = ctx.createRadialGradient(flickerX, flickerY, 0, flickerX, flickerY, flameSize * 3);
          gradient.addColorStop(0, 'rgba(255, 255, 100, 0.9)');
          gradient.addColorStop(0.3, 'rgba(255, 200, 0, 0.7)');
          gradient.addColorStop(0.6, 'rgba(255, 100, 0, 0.5)');
          gradient.addColorStop(1, 'rgba(255, 0, 0, 0.1)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(flickerX, flickerY, flameSize * 3, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.ellipse(flickerX, flickerY, flameSize * 0.5, flameSize * 1.2, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#FF6347';
          ctx.beginPath();
          ctx.ellipse(flickerX, flickerY, flameSize * 0.3, flameSize * 0.8, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#FFFF00';
          ctx.beginPath();
          ctx.ellipse(flickerX, flickerY, flameSize * 0.1, flameSize * 0.4, 0, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [candles, candlesInitialized, soundLevel]);

  // Temizleme efekti
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return (
    <div className="relative w-full h-screen">
      <canvas
        ref={canvasRef}
        className="cursor-default"
        style={{ background: 'radial-gradient(circle, #1a1a2e 0%, #000000 100%)' }}
      />

      {/* Mikrofon İzin UI (Değişiklik yok) */}
      {micPermission === 'pending' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-gradient-to-br from-pink-900/90 to-purple-900/90 backdrop-blur-lg border border-pink-500/30 rounded-lg p-8 text-center max-w-md mx-4">
            <Mic className="text-pink-400 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-dancing text-pink-300 mb-4">Mikrofon İzni Gerekli 🎤</h2>
            <p className="text-pink-200 font-poppins mb-6">Mumları üfleyebilmek için mikrofonuna erişim izni ver.</p>
            <button
              onClick={initializeMicrophone}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-poppins font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Mikrofonu Aç 🎙️
            </button>
          </div>
        </div>
      )}

      {micPermission === 'denied' && (
        // ... (Reddedilme UI'ı aynı kalıyor)
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-gradient-to-br from-red-900/90 to-pink-900/90 backdrop-blur-lg border border-red-500/30 rounded-lg p-8 text-center max-w-md mx-4">
            <MicOff className="text-red-400 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-dancing text-red-300 mb-4">Mikrofon Erişimi Reddedildi 😔</h2>
            <p className="text-red-200 font-poppins mb-6">Tarayıcı ayarlarından mikrofon iznini aktifleştir ve sayfayı yenile.</p>
            <button onClick={() => window.location.reload()} className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-poppins font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
              Sayfayı Yenile 🔄
            </button>
          </div>
        </div>
      )}

      {/* Ana UI (Değişiklik yok) */}
      {!showMessage && micPermission === 'granted' && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center z-10 w-full px-4">
          <h1 className="text-3xl md:text-5xl font-dancing text-pink-300 mb-4">Dileğini Tut ve Mumları Üfle ✨</h1>
          <p className="text-base md:text-lg text-pink-200 font-poppins mb-4">
            Mumları söndürmek için mikrofona doğru üfle!
          </p>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <Mic className={`${isListening ? 'text-green-400' : 'text-gray-400'}`} size={20} />
            <span className={`font-poppins text-sm ${isListening ? 'text-green-400' : 'text-gray-400'}`}>
              {isListening ? 'Dinliyor...' : 'Mikrofon Kapalı'}
            </span>
          </div>

          {isListening && (
            <div className="mb-4">
              <div className="w-48 h-3 bg-gray-700 rounded-full mx-auto overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-100"
                  style={{ width: `${Math.min(100, (soundLevel / 50) * 100)}%` }} // Max değeri ayarladım
                />
              </div>
              <p className="text-xs text-pink-300 font-poppins">
                Ses Seviyesi: {soundLevel > BLOW_SENSITIVITY ? 'Üfleme Algılandı! 💨' : 'Sessizlik'}
              </p>
            </div>
          )}

          {blowProgress > 0 && (
            <div className="mb-4">
              <div className="w-48 h-4 bg-gray-700 rounded-full mx-auto overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-100"
                  style={{ width: `${blowProgress}%` }}
                />
              </div>
              <p className="text-sm text-yellow-300 font-poppins animate-pulse">
                Üfleniyor...
              </p>
            </div>
          )}

          <div className="text-pink-400 font-poppins text-sm">
            Kalan mumlar: {candles.filter(c => c.lit).length}
          </div>
        </div>
      )}

      {/* Tebrikler Mesajı (Değişiklik yok) */}
      {showMessage && (
        // ... (Tebrikler UI'ı aynı kalıyor)
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center animate-pulse">
            <h2 className="text-4xl md:text-6xl font-dancing text-yellow-300 mb-4">Tebrikler! 🎉</h2>
            <p className="text-xl md:text-2xl text-pink-300 font-poppins">Dileğin gerçek olsun...</p>
          </div>
        </div>
      )}

      {showFireworks && <Fireworks />}
      {showFireworks && <Confetti />}
    </div>
  );
};

export default CandleScreen;