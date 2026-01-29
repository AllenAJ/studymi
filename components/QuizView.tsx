import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Check, X, RefreshCw, Trophy, ArrowRight } from 'lucide-react';

interface QuizViewProps {
  questions: QuizQuestion[];
}

export const QuizView: React.FC<QuizViewProps> = ({ questions }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    if (index === questions[currentQIndex].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(c => c + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-darkCard rounded-[40px] shadow-soft border border-softBorder dark:border-darkBorder max-w-2xl mx-auto text-center animate-scale-in">
        <div className="w-40 h-40 bg-iceGray dark:bg-primaryGold/20 rounded-full flex items-center justify-center mb-10 shadow-inner">
          <Trophy className="w-20 h-20 text-primaryGold dark:text-primaryGold stroke-[1.5]" />
        </div>
        <h2 className="text-4xl font-extrabold text-deepNavy dark:text-white mb-4">quiz complete</h2>
        <p className="text-steelGray dark:text-darkMuted text-xl mb-12 font-medium">
          you scored <span className="font-bold text-deepNavy dark:text-white text-2xl mx-1">{score}</span> out of <span className="font-bold text-deepNavy dark:text-white text-2xl mx-1">{questions.length}</span>.
          <br className="mb-2"/>
          {score === questions.length ? "perfect score! you're a genius." : "good effort, keep going."}
        </p>
        
        <button 
          onClick={resetQuiz}
          className="flex items-center gap-3 px-10 py-5 bg-deepNavy dark:bg-white text-white dark:text-deepNavy rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl"
        >
          <RefreshCw className="w-5 h-5" /> try again
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQIndex];

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up">
      <div className="mb-8 flex justify-between items-center px-4">
        <span className="text-xs font-bold tracking-widest uppercase text-steelGray dark:text-darkMuted bg-white dark:bg-darkCard px-3 py-1 rounded-full border border-softBorder dark:border-darkBorder">
          question {currentQIndex + 1} / {questions.length}
        </span>
        <span className="text-xs font-bold tracking-widest uppercase text-steelGray dark:text-darkMuted bg-white dark:bg-darkCard px-3 py-1 rounded-full border border-softBorder dark:border-darkBorder">
          score: {score}
        </span>
      </div>

      <div className="bg-white dark:bg-darkCard rounded-[40px] shadow-soft border border-softBorder dark:border-darkBorder overflow-hidden p-8 md:p-14">
        <h3 className="text-2xl md:text-3xl font-bold text-deepNavy dark:text-white mb-12 leading-snug">
          {currentQuestion.question}
        </h3>

        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => {
            let stateClass = "border-softBorder dark:border-darkBorder hover:border-primaryGold dark:hover:border-white hover:bg-iceGray dark:hover:bg-darkBorder/50";
            let icon = <div className="w-6 h-6 rounded-full border-2 border-softBorder dark:border-darkBorder" />;

            if (showResult) {
              if (index === currentQuestion.correctAnswerIndex) {
                stateClass = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-400";
                icon = <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white"><Check className="w-4 h-4" /></div>;
              } else if (index === selectedOption) {
                stateClass = "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-400";
                icon = <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white"><X className="w-4 h-4" /></div>;
              } else {
                stateClass = "border-softBorder dark:border-darkBorder opacity-40";
              }
            } else if (selectedOption === index) {
              stateClass = "border-primaryGold bg-yellow-50 dark:bg-primaryGold/10 dark:border-primaryGold text-deepNavy dark:text-white";
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showResult}
                className={`w-full text-left p-6 rounded-[24px] border-2 transition-all flex justify-between items-center group dark:text-white ${stateClass}`}
              >
                <span className="font-medium text-lg">{option}</span>
                <div className="flex-shrink-0 ml-4 transition-transform group-hover:scale-110">{icon}</div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="mt-10 flex justify-end animate-fade-in">
            <button
              onClick={nextQuestion}
              className="px-10 py-4 bg-primaryGold text-white rounded-full font-bold hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-200/50 flex items-center gap-2 hover:translate-x-1"
            >
              {currentQIndex < questions.length - 1 ? "next question" : "finish quiz"} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};