import React, { useState } from 'react';
import { Heart, Mail } from 'lucide-react';
import messagesData from '../data/messages.json';

interface NotesGalleryProps {
  onLetterClick: () => void;
}

const NotesGallery: React.FC<NotesGalleryProps> = ({ onLetterClick }) => {
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  React.useEffect(() => {
    setTimeout(() => setShowNotes(true), 500);
  }, []);

  const handleNoteClick = (id: number) => {
    setSelectedNote(selectedNote === id ? null : id);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
      <div className={`transform transition-all duration-1000 ${showNotes ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h1 className="text-4xl md:text-6xl font-dancing text-pink-300 text-center mb-8">
          Sana Özel Notlarım 💕
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
          {messagesData.notes.map((note, index) => (
            <div
              key={note.id}
              className={`transform transition-all duration-700 ${showNotes ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div
                className="group cursor-pointer"
                onClick={() => handleNoteClick(note.id)}
              >
                {/* Heart Button */}
                <div className="relative mb-4 flex justify-center">
                  <div className="relative">
                    <Heart
                      size={80}
                      className={`transition-all duration-300 ${
                        selectedNote === note.id
                          ? 'fill-pink-500 text-pink-500 scale-110'
                          : 'fill-pink-400 text-pink-400 group-hover:scale-105 group-hover:fill-pink-300'
                      }`}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">
                      {note.emoji}
                    </span>
                  </div>
                </div>
                
                {/* Note Title */}
                <h3 className="text-lg md:text-xl font-poppins text-pink-200 text-center mb-4 group-hover:text-pink-100 transition-colors">
                  {note.title}
                </h3>
                
                {/* Note Content */}
                <div
                  className={`transition-all duration-500 overflow-hidden ${
                    selectedNote === note.id
                      ? 'max-h-96 opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="bg-gradient-to-br from-pink-800/20 to-purple-800/20 backdrop-blur-sm border border-pink-500/20 rounded-lg p-6 mt-4">
                    <p className="text-pink-100 font-poppins leading-relaxed text-center">
                      {note.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Special Letter Button */}
        <div className="text-center">
          <button
            onClick={onLetterClick}
            className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Mail className="text-white group-hover:rotate-12 transition-transform duration-300" size={24} />
            <span className="text-white font-poppins font-medium text-lg">
              Özel Mektubum 💌
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesGallery;