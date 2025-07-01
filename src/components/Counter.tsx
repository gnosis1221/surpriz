import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const Counter: React.FC = () => {
  const [timeElapsed, setTimeElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const startDate = new Date('2025-06-21T00:00:00');
    
    const calculateTime = () => {
      const now = new Date();
      const difference = now.getTime() - startDate.getTime();
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeElapsed({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gradient-to-br from-pink-800/30 to-purple-800/30 backdrop-blur-sm border border-pink-500/20 rounded-lg p-4 shadow-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="text-pink-400" size={20} />
          <span className="text-pink-300 font-poppins text-sm font-medium">
            Birlikte Olduğumuz Süre
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-pink-500/20 rounded-md p-2">
            <div className="text-pink-200 font-bold text-lg font-poppins">
              {timeElapsed.days}
            </div>
            <div className="text-pink-300 text-xs font-poppins">Gün</div>
          </div>
          
          <div className="bg-purple-500/20 rounded-md p-2">
            <div className="text-purple-200 font-bold text-lg font-poppins">
              {timeElapsed.hours}
            </div>
            <div className="text-purple-300 text-xs font-poppins">Saat</div>
          </div>
          
          <div className="bg-pink-500/20 rounded-md p-2">
            <div className="text-pink-200 font-bold text-lg font-poppins">
              {timeElapsed.minutes}
            </div>
            <div className="text-pink-300 text-xs font-poppins">Dakika</div>
          </div>
          
          <div className="bg-purple-500/20 rounded-md p-2">
            <div className="text-purple-200 font-bold text-lg font-poppins">
              {timeElapsed.seconds}
            </div>
            <div className="text-purple-300 text-xs font-poppins">Saniye</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counter;