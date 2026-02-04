import React, { useState } from 'react';
import { StudySet } from '../types';
import { FlashcardView } from './FlashcardView';
import { QuizView } from './QuizView';
import { MindMapView } from './MindMapView';
import { TeachBackView } from './TeachBackView';
import { ArrowLeft, BookOpen, BrainCircuit, Layers, CheckCircle, GraduationCap, Menu, X, Moon, Sun } from 'lucide-react';
import { getVibeString } from '../services/genZUtils';

interface StudyViewProps {
  studySet: StudySet;
  onBack: () => void;
}

export const StudyView: React.FC<StudyViewProps> = ({ studySet, onBack }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz' | 'mindmap' | 'teach'>('summary');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize from localStorage
  const [isGenZMode, setIsGenZMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studymi_genZMode');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studymi_darkMode');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Save to localStorage and apply dark mode
  React.useEffect(() => {
    localStorage.setItem('studymi_darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  React.useEffect(() => {
    localStorage.setItem('studymi_genZMode', JSON.stringify(isGenZMode));
    if (isGenZMode) {
      document.documentElement.classList.add('genz-mode');
    } else {
      document.documentElement.classList.remove('genz-mode');
    }
  }, [isGenZMode]);

  const tabs = [
    { id: 'summary', label: getVibeString(isGenZMode, 'summary'), icon: BookOpen },
    { id: 'flashcards', label: getVibeString(isGenZMode, 'flashcards'), icon: Layers },
    { id: 'quiz', label: getVibeString(isGenZMode, 'quiz'), icon: CheckCircle },
    { id: 'mindmap', label: getVibeString(isGenZMode, 'mindmap'), icon: BrainCircuit },
    { id: 'teach', label: getVibeString(isGenZMode, 'teachback'), icon: GraduationCap },
  ];

  const SidebarContent = () => (
    <>
      <button onClick={onBack} className="w-10 h-10 rounded-none bg-iceGray dark:bg-darkBorder hover:bg-softBorder dark:hover:bg-darkBorder/80 flex items-center justify-center text-deepNavy dark:text-white mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Logo Dot */}
      <img src="/favicon-96x96.png" alt="Studymi" className="w-8 h-8 mb-8 hidden lg:block" />

      <div className="flex flex-col gap-3 w-full px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
              className={`flex lg:flex-col items-center gap-4 lg:gap-2 justify-start lg:justify-center p-3 lg:p-4 rounded-none transition-all duration-200 ${isActive ? 'bg-black/5 dark:bg-white/10 text-deepNavy dark:text-white font-bold' : 'text-steelGray dark:text-darkMuted hover:bg-white dark:hover:bg-darkBorder hover:text-deepNavy dark:hover:text-white'}`}
            >
              <tab.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
              <span className={`text-sm lg:text-[10px] lg:uppercase lg:tracking-wide lg:mt-2 ${isGenZMode ? 'lowercase' : ''}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );

  const MobileBottomNav = () => (
    <div className="lg:hidden fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-2 right-2 h-16 bg-white/90 dark:bg-darkCard/90 backdrop-blur-xl border border-softBorder dark:border-darkBorder rounded-2xl shadow-2xl flex items-center justify-between px-1 z-[60]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all flex-1 min-w-0 ${isActive ? 'text-primaryGold' : 'text-steelGray dark:text-darkMuted'}`}
          >
            <tab.icon className="w-6 h-6 stroke-2" />
            <span className={`text-[8px] font-extrabold mt-1 uppercase tracking-tighter text-center ${isGenZMode ? 'lowercase' : ''}`}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`min-h-screen bg-iceGray dark:bg-darkBg font-sans flex text-deepNavy dark:text-darkText overflow-hidden transition-colors duration-300 ${isGenZMode ? 'genz-mode' : ''}`}>
      {/* Decorative Sparkles for Gen Z Mode */}
      {isGenZMode && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="sparkle" style={{ top: '15%', left: '10%', animationDelay: '0s' }}></div>
          <div className="sparkle" style={{ top: '25%', left: '85%', animationDelay: '0.5s' }}></div>
          <div className="sparkle" style={{ top: '65%', left: '12%', animationDelay: '1s' }}></div>
          <div className="sparkle" style={{ top: '80%', left: '92%', animationDelay: '0.2s' }}></div>
        </div>
      )}

      {/* Mobile Top Actions (Slimmed Down) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 p-4 flex items-center justify-between z-40 safe-top pointer-events-none">
        <button
          onClick={onBack}
          className="p-3 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md rounded-none border border-softBorder dark:border-darkBorder shadow-lg text-deepNavy dark:text-white pointer-events-auto active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="px-4 py-2 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md rounded-none border border-softBorder dark:border-darkBorder shadow-sm text-xs font-bold text-deepNavy dark:text-white truncate max-w-[150px]">
          {studySet.title}
        </div>
        <div className="w-12"></div> {/* Spacer for symmetry */}
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-24 bg-white dark:bg-darkBg border-r border-softBorder dark:border-darkBorder flex-col items-center py-8 z-50 shadow-soft">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-darkBg border-l border-softBorder dark:border-darkBorder p-6 animate-slide-right shadow-2xl flex flex-col items-start">
            <button onClick={() => setIsMobileMenuOpen(false)} className="self-end mb-6 p-2 bg-iceGray dark:bg-darkBorder rounded-none">
              <X className="w-5 h-5 text-steelGray" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      <main className="flex-1 lg:ml-24 pt-20 lg:pt-6 p-4 md:p-12 min-h-screen overflow-y-auto pb-32">
        <MobileBottomNav />

        {/* Top Controls inside Main View */}
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 rounded-none bg-white dark:bg-darkCard border border-softBorder dark:border-darkBorder flex items-center justify-center shadow-sm hover:scale-105 transition-transform text-steelGray dark:text-white"
          >
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-3 bg-white/60 dark:bg-darkCard backdrop-blur-sm px-3 py-2 rounded-none border border-softBorder dark:border-darkBorder shadow-sm">
            <span className="text-xs font-bold text-deepNavy dark:text-darkText hidden sm:inline ml-1">gen z mode</span>
            <button
              onClick={() => setIsGenZMode(!isGenZMode)}
              className={`w-10 h-6 rounded-none transition-colors relative ${isGenZMode ? 'bg-primaryGold' : 'bg-softBorder dark:bg-darkBorder'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-none shadow-md transition-transform duration-300 ${isGenZMode ? 'left-5' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto animate-slide-up">
          {/* Header (Desktop) */}
          <div className="mb-10 hidden lg:block">
            <div className={`inline-flex items-center px-4 py-1.5 rounded-none bg-white dark:bg-darkCard border border-softBorder dark:border-darkBorder text-xs font-bold text-steelGray dark:text-darkMuted mb-6 uppercase tracking-widest shadow-sm ${isGenZMode ? 'lowercase' : ''}`}>
              {getVibeString(isGenZMode, 'study_session')}
            </div>
            <h1 className={`text-4xl md:text-5xl font-extrabold text-deepNavy dark:text-white leading-tight tracking-tight ${isGenZMode ? 'lowercase' : ''}`}>{studySet.title}</h1>
          </div>

          {/* Content Area */}
          <div className="animate-fade-in pb-20">
            {activeTab === 'summary' && (
              <div className="flex flex-col gap-8">
                <div className="bg-deepNavy dark:bg-darkCard rounded-none p-8 md:p-10 text-white shadow-xl border border-transparent dark:border-darkBorder">
                  <h3 className={`font-bold text-xl mb-8 flex items-center gap-3 ${isGenZMode ? 'lowercase' : ''}`}>
                    <div className="w-2 h-2 rounded-none bg-accentYellow"></div>
                    {getVibeString(isGenZMode, 'key_concepts')}
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {studySet.keyConcepts.map((concept, i) => (
                      <li key={i} className="flex items-start gap-4 group">
                        <span className="font-mono text-primaryGold text-lg font-bold group-hover:text-white transition-colors">0{i + 1}</span>
                        <span className="text-white/90 font-medium leading-relaxed">{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-darkCard rounded-none p-8 md:p-10 border border-softBorder dark:border-darkBorder shadow-soft">
                  <h2 className={`text-2xl font-bold mb-8 flex items-center gap-3 dark:text-white text-deepNavy ${isGenZMode ? 'lowercase' : ''}`}>
                    <BookOpen className="w-6 h-6 text-primaryGold fill-primaryGold/20" />
                    {getVibeString(isGenZMode, 'breakdown')}
                  </h2>
                  <div className="prose prose-lg text-deepNavy/80 dark:text-gray-300 leading-relaxed max-w-none prose-headings:text-deepNavy dark:prose-headings:text-white prose-strong:text-deepNavy dark:prose-strong:text-white prose-table:border-collapse prose-th:bg-black/5 dark:prose-th:bg-white/10 prose-th:p-3 prose-td:p-3 prose-td:border prose-td:border-softBorder dark:prose-td:border-darkBorder">
                    {studySet.detailedNotes ? (
                      <div dangerouslySetInnerHTML={{ __html: studySet.detailedNotes }} />
                    ) : (
                      studySet.summary
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'flashcards' && <FlashcardView cards={studySet.flashcards} />}
            {activeTab === 'quiz' && <QuizView questions={studySet.quiz} />}
            {activeTab === 'mindmap' && <MindMapView data={studySet.mindMap} />}
            {activeTab === 'teach' && <TeachBackView studySet={studySet} />}
          </div>
        </div>
      </main>
    </div>
  );
};