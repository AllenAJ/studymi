import React, { useState } from 'react';
import { gradeTeachBack } from '../services/geminiService';
import { TeachBackFeedback, StudySet } from '../types';
import { Send, Loader2, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';

interface TeachBackViewProps {
  studySet: StudySet;
}

export const TeachBackView: React.FC<TeachBackViewProps> = ({ studySet }) => {
  const [explanation, setExplanation] = useState('');
  const [feedback, setFeedback] = useState<TeachBackFeedback | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  const handleSubmit = async () => {
    if (!explanation.trim()) return;
    setIsGrading(true);
    try {
      const result = await gradeTeachBack(studySet.title, studySet.summary, explanation);
      setFeedback(result);
    } catch (error) {
      console.error(error);
      alert("Something went wrong grading your explanation.");
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
      {!feedback ? (
        <div className="bg-white dark:bg-darkCard rounded-none shadow-soft border border-softBorder dark:border-darkBorder p-8 md:p-14 relative overflow-hidden">
          <div className="mb-10 max-w-2xl">
            <div className="w-16 h-16 bg-iceGray dark:bg-darkBorder rounded-none flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-deepNavy dark:text-white" />
            </div>
            <h2 className="text-3xl font-bold text-deepNavy dark:text-white mb-3">teach it back</h2>
            <p className="text-steelGray dark:text-darkMuted text-lg leading-relaxed">
              explain "<span className="font-semibold text-deepNavy dark:text-white">{studySet.title}</span>" in your own words. imagine you're teaching a 5-year-old.
            </p>
          </div>

          <div className="relative">
            <textarea
              className="w-full h-80 p-8 bg-iceGray dark:bg-darkBg border border-transparent rounded-none focus:ring-4 focus:ring-primaryGold/20 focus:bg-white dark:focus:bg-darkCard focus:border-softBorder dark:focus:border-darkBorder outline-none resize-none text-deepNavy dark:text-white text-xl leading-relaxed placeholder:text-steelGray/40 transition-all shadow-inner"
              placeholder="start typing your explanation here..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
            
            <div className="absolute bottom-6 right-6">
              <button
                onClick={handleSubmit}
                disabled={isGrading || !explanation.trim()}
                className="bg-deepNavy dark:bg-white text-white dark:text-deepNavy h-16 w-16 rounded-none shadow-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primaryGold hover:text-white dark:hover:bg-primaryGold dark:hover:text-white"
              >
                {isGrading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8 ml-1" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Score Card */}
          <div className="bg-white dark:bg-darkCard rounded-none shadow-soft border border-softBorder dark:border-darkBorder p-8 md:p-12 flex flex-col md:flex-row items-center gap-16">
            <div className="relative w-48 h-48 flex-shrink-0">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="96" cy="96" r="88" stroke="#DDE3EA" strokeWidth="16" fill="none" className="dark:stroke-darkBorder" />
                 <circle 
                   cx="96" cy="96" r="88" 
                   stroke={feedback.score > 70 ? "#F59E0B" : "#FFE44D"} 
                   strokeWidth="16" 
                   fill="none" 
                   strokeLinecap="round"
                   strokeDasharray={552} 
                   strokeDashoffset={552 - (552 * feedback.score) / 100}
                   className="transition-all duration-1000 ease-out"
                 />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-5xl font-extrabold text-deepNavy dark:text-white tracking-tight">{feedback.score}</span>
                 <span className="text-sm font-bold text-steelGray dark:text-darkMuted uppercase tracking-widest mt-1">score</span>
               </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-4xl font-extrabold text-deepNavy dark:text-white mb-6">
                {feedback.score > 80 ? "excellent work." : feedback.score > 50 ? "getting there." : "needs some love."}
              </h3>
              <p className="text-steelGray dark:text-darkMuted text-xl leading-relaxed">{feedback.feedback}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Missing Concepts */}
            <div className="bg-[#FFF8F8] dark:bg-red-900/10 rounded-none p-10 border border-red-100 dark:border-red-900/20">
              <h4 className="font-bold text-red-900 dark:text-red-400 mb-8 flex items-center gap-3 text-lg">
                <AlertCircle className="w-6 h-6" /> missed concepts
              </h4>
              <ul className="space-y-4">
                {feedback.missingConcepts.length > 0 ? (
                  feedback.missingConcepts.map((concept, i) => (
                    <li key={i} className="flex items-start gap-3 text-red-800/80 dark:text-red-300 font-medium">
                      <div className="w-2 h-2 rounded-none bg-red-400 mt-2 flex-shrink-0" />
                      {concept}
                    </li>
                  ))
                ) : (
                  <li className="text-red-800 italic opacity-60">none! you covered everything.</li>
                )}
              </ul>
            </div>

            {/* Model Correction */}
            <div className="bg-[#FFFBEB] dark:bg-yellow-900/10 rounded-none p-10 border border-yellow-100 dark:border-yellow-900/20">
              <h4 className="font-bold text-deepNavy dark:text-white mb-8 flex items-center gap-3 text-lg">
                <CheckCircle2 className="w-6 h-6 text-primaryGold" /> simpler version
              </h4>
              <p className="text-deepNavy/80 dark:text-gray-300 leading-relaxed font-medium">
                {feedback.correction}
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-12 pb-8">
            <button 
              onClick={() => { setFeedback(null); setExplanation(''); }}
              className="px-10 py-4 rounded-none border-2 border-softBorder dark:border-darkBorder text-deepNavy dark:text-white font-bold hover:bg-deepNavy dark:hover:bg-white hover:text-white dark:hover:text-deepNavy hover:border-deepNavy dark:hover:border-white transition-colors text-lg"
            >
              try another explanation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};