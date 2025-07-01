import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Heart } from 'lucide-react';
import messagesData from '../data/messages.json';

interface LetterProps {
  onBack: () => void;
}

const Letter: React.FC<LetterProps> = ({ onBack }) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showError, setShowError] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const { letter } = messagesData;

  useEffect(() => {
    // Bu efekt, sadece isUnlocked true olduğunda BİR KERE çalışmalıdır.
    if (isUnlocked) {
      setIsTyping(true);
      let index = 0;
      const content = letter.content;
      
      const typeWriter = () => {
        if (index < content.length) {
          setDisplayedText(content.slice(0, index + 1));
          index++;
          setTimeout(typeWriter, 50); // Yazma hızı
        } else {
          setIsTyping(false); // Yazma bitince durumu güncelle
        }
      };
      
      typeWriter();
    }
    // --> DÜZELTME: Bağımlılık dizisinden 'isTyping' kaldırıldı.
    // Bu sayede useEffect, setIsTyping çağrıldığında tekrar tetiklenmez.
  }, [isUnlocked, letter.content]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase().trim() === letter.password.toLowerCase()) {
      setIsUnlocked(true);
      setShowError(false);
    } else {
      setShowError(true);
      setPassword(''); // Hatalı giriş sonrası input'u temizle
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col">
      {/* Geri Dön Butonu */}
      <button
        onClick={onBack}
        className="self-start flex items-center space-x-2 text-pink-300 hover:text-pink-200 transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        <span className="font-poppins">Geri Dön</span>
      </button>

      <div className="flex-1 flex items-center justify-center">
        {!isUnlocked ? (
          /* Şifre Ekranı */
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-6">
                <Lock className="text-white" size={32} />
              </div>
              <h1 className="text-3xl md:text-4xl font-dancing text-pink-300 mb-4">
                Özel Mektubum 💌
              </h1>
              <p className="text-pink-200 font-poppins mb-6">
                Bu mektup sadece senin için yazıldı. Açmak için şifreyi gir:
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-pink-200 font-poppins mb-2">
                  {letter.passwordHint}
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-pink-500/30 rounded-lg text-white placeholder-pink-300/60 font-poppins focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Cevabını yaz..."
                  required
                />
              </div>
              
              {showError && (
                <div className="text-red-400 text-center font-poppins animate-pulse">
                  Yanlış cevap! Tekrar dene 💭
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-poppins font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Mektubu Aç 💕
              </button>
            </form>
          </div>
        ) : (
          /* Mektup İçeriği */
          <div className="w-full max-w-2xl">
            <div className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 backdrop-blur-lg border border-pink-500/20 rounded-lg p-8 md:p-12 shadow-2xl">
              <div className="text-center mb-8">
                <Heart className="inline-block text-pink-400 mb-4" size={40} />
                <h2 className="text-3xl md:text-4xl font-dancing text-pink-300">
                  Sana Özel Mektubum
                </h2>
              </div>
              
              <div className="letter-content">
                {/* <pre> tag'ı metindeki boşlukları ve satır atlamalarını korur */}
                <pre className="text-pink-100 font-poppins leading-relaxed whitespace-pre-wrap text-lg">
                  {displayedText}
                  {/* Yazma efekti sırasında yanıp sönen imleç */}
                  {isTyping && <span className="animate-pulse">|</span>}
                </pre>
              </div>
              
              {/* Yazma işlemi bittiğinde gösterilecek imza */}
              {!isTyping && (
                <div className="text-center mt-8 animate-fade-in">
                  <div className="inline-flex items-center space-x-2 text-pink-300">
                    <Heart size={20} className="fill-current" />
                    <span className="font-dancing text-xl">Sonsuz sevgiyle...</span>
                    <Heart size={20} className="fill-current" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Letter;