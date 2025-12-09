import React, { useState } from 'react';
import { Flashcard } from '../types';
import { ArrowLeft, ArrowRight, RotateCw, HelpCircle, CheckCircle2 } from 'lucide-react';

interface FlashcardViewProps {
  cards: Flashcard[];
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c - 1), 150);
    }
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center w-full py-4 animate-scale-in">
      <div className="flex items-center gap-4 mb-10 w-full max-w-lg">
        <span className="text-xs font-bold text-steelGray dark:text-darkMuted">01</span>
        <div className="h-1.5 flex-1 bg-softBorder dark:bg-darkBorder rounded-none overflow-hidden">
          <div 
            className="h-full bg-primaryGold transition-all duration-500 rounded-none" 
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
        <div className="text-steelGray dark:text-darkMuted text-xs font-bold">
          {cards.length < 10 ? `0${cards.length}` : cards.length}
        </div>
      </div>

      <div 
        className="relative w-full max-w-3xl h-[450px] perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-700 transform-style-3d transition-transform cubic-bezier(0.4, 0, 0.2, 1) ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute w-full h-full bg-white dark:bg-darkCard rounded-none shadow-soft border border-softBorder dark:border-darkBorder p-12 flex flex-col items-center justify-center backface-hidden hover:shadow-hover transition-all">
            <div className="w-12 h-12 bg-iceGray dark:bg-darkBorder rounded-none flex items-center justify-center mb-6">
                <HelpCircle className="w-6 h-6 text-deepNavy dark:text-white" />
            </div>
            <h3 className="text-steelGray dark:text-darkMuted text-xs font-bold uppercase tracking-widest mb-8">question</h3>
            <p className="text-3xl md:text-4xl text-center text-deepNavy dark:text-white font-bold leading-tight max-w-xl">
              {currentCard.front}
            </p>
            <div className="absolute bottom-8 text-steelGray dark:text-darkMuted text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-iceGray dark:bg-darkBorder px-5 py-2.5 rounded-none font-medium">
              <RotateCw className="w-4 h-4" /> tap to flip
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full bg-deepNavy dark:bg-[#000000] rounded-none shadow-modal p-12 flex flex-col items-center justify-center backface-hidden rotate-y-180 border border-deepNavy dark:border-darkBorder">
            <div className="w-12 h-12 bg-white/10 rounded-none flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-accentYellow" />
            </div>
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-8">answer</h3>
            <p className="text-2xl md:text-3xl text-center text-white font-medium leading-relaxed max-w-xl">
              {currentCard.back}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-12">
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          disabled={currentIndex === 0}
          className="w-16 h-16 rounded-none bg-white dark:bg-darkCard border border-softBorder dark:border-darkBorder hover:border-primaryGold dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center justify-center text-deepNavy dark:text-white transition-all active:scale-95 hover:text-primaryGold"
        >
          <ArrowLeft className="w-6 h-6 stroke-2" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          disabled={currentIndex === cards.length - 1}
          className="w-16 h-16 rounded-none bg-primaryGold text-white shadow-lg shadow-yellow-200/50 hover:bg-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
        >
          <ArrowRight className="w-6 h-6 stroke-2" />
        </button>
      </div>
    </div>
  );
};