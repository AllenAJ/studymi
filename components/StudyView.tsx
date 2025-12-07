import React, { useState } from 'react';
import { StudySet } from '../types';
import { FlashcardView } from './FlashcardView';
import { QuizView } from './QuizView';
import { MindMapView } from './MindMapView';
import { TeachBackView } from './TeachBackView';
import { ArrowLeft, BookOpen, BrainCircuit, Layers, CheckCircle, GraduationCap, Menu, X, Moon, Sun } from 'lucide-react';

interface StudyViewProps {
  studySet: StudySet;
  onBack: () => void;
}

export const StudyView: React.FC<StudyViewProps> = ({ studySet, onBack }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz' | 'mindmap' | 'teach'>('summary');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGenZMode, setIsGenZMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply Dark Mode effect locally if toggled here (or inherit from global context ideally, but keeping it simple)
  // Note: For full app consistency, global state is better, but this handles local toggle for now.
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const tabs = [
    { id: 'summary', label: 'Summary', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'quiz', label: 'Quiz', icon: CheckCircle },
    { id: 'mindmap', label: 'Mind Map', icon: BrainCircuit },
    { id: 'teach', label: 'Teach Back', icon: GraduationCap },
  ];

  const SidebarContent = () => (
    <>
      <button onClick={onBack} className="w-10 h-10 rounded-full bg-iceGray dark:bg-darkBorder hover:bg-softBorder dark:hover:bg-darkBorder/80 flex items-center justify-center text-deepNavy dark:text-white mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" />
      </button>
      
      {/* Logo Dot */}
      <div className="w-8 h-8 rounded-full bg-accentYellow mb-8 hidden lg:block shadow-md"></div>

      <div className="flex flex-col gap-3 w-full px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
              className={`flex lg:flex-col items-center gap-4 lg:gap-2 justify-start lg:justify-center p-3 lg:p-4 rounded-xl transition-all duration-200 ${isActive ? 'bg-black/5 dark:bg-white/10 text-deepNavy dark:text-white font-bold' : 'text-steelGray dark:text-darkMuted hover:bg-white dark:hover:bg-darkBorder hover:text-deepNavy dark:hover:text-white'}`}
            >
              <tab.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
              <span className="text-sm lg:text-[10px] lg:uppercase lg:tracking-wide lg:mt-2">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-iceGray dark:bg-darkBg font-sans flex text-deepNavy dark:text-darkText overflow-hidden transition-colors duration-300">
       
       {/* Mobile Header */}
       <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-darkCard border-b border-softBorder dark:border-darkBorder z-50 flex items-center justify-between px-4">
         <button onClick={onBack} className="p-2 -ml-2">
           <ArrowLeft className="w-6 h-6 text-deepNavy dark:text-white" />
         </button>
         <span className="font-bold text-sm text-deepNavy dark:text-white truncate max-w-[200px]">{studySet.title}</span>
         <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2">
           <Menu className="w-6 h-6 text-deepNavy dark:text-white" />
         </button>
       </header>

       {/* Sidebar Navigation (Desktop) */}
       <aside className="hidden lg:flex fixed left-0 top-0 h-full w-24 bg-white dark:bg-darkBg border-r border-softBorder dark:border-darkBorder flex-col items-center py-8 z-50 shadow-soft">
          <SidebarContent />
       </aside>

       {/* Mobile Drawer */}
       {isMobileMenuOpen && (
         <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-darkBg border-l border-softBorder dark:border-darkBorder p-6 animate-slide-right shadow-2xl flex flex-col items-start">
               <button onClick={() => setIsMobileMenuOpen(false)} className="self-end mb-6 p-2 bg-iceGray dark:bg-darkBorder rounded-full">
                 <X className="w-5 h-5 text-steelGray" />
               </button>
               <SidebarContent />
            </div>
         </div>
       )}

       <main className="flex-1 lg:ml-24 pt-20 lg:pt-6 p-4 md:p-12 min-h-screen overflow-y-auto">
         
         {/* Top Controls inside Main View */}
         <div className="flex justify-end gap-3 mb-6">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 rounded-full bg-white dark:bg-darkCard border border-softBorder dark:border-darkBorder flex items-center justify-center shadow-sm hover:scale-105 transition-transform text-steelGray dark:text-white"
            >
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-3 bg-white/60 dark:bg-darkCard backdrop-blur-sm px-3 py-2 rounded-full border border-softBorder dark:border-darkBorder shadow-sm">
              <span className="text-xs font-bold text-deepNavy dark:text-darkText hidden sm:inline ml-1">gen z mode</span>
              <button 
                onClick={() => setIsGenZMode(!isGenZMode)}
                className={`w-10 h-6 rounded-full transition-colors relative ${isGenZMode ? 'bg-primaryGold' : 'bg-softBorder dark:bg-darkBorder'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${isGenZMode ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
         </div>

         <div className="max-w-6xl mx-auto animate-slide-up">
           {/* Header (Desktop) */}
           <div className="mb-10 hidden lg:block">
             <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white dark:bg-darkCard border border-softBorder dark:border-darkBorder text-xs font-bold text-steelGray dark:text-darkMuted mb-6 uppercase tracking-widest shadow-sm">
               study session
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold text-deepNavy dark:text-white leading-tight tracking-tight">{studySet.title}</h1>
           </div>

           {/* Content Area */}
           <div className="animate-fade-in pb-20">
             {activeTab === 'summary' && (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white dark:bg-darkCard rounded-[40px] p-8 md:p-10 border border-softBorder dark:border-darkBorder shadow-soft">
                   <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 dark:text-white text-deepNavy">
                     <BookOpen className="w-6 h-6 text-primaryGold fill-primaryGold/20" />
                     The Breakdown
                   </h2>
                   <div className="prose prose-lg text-deepNavy/80 dark:text-gray-300 leading-relaxed max-w-none">
                     {studySet.summary}
                   </div>
                 </div>
                 
                 <div className="bg-deepNavy dark:bg-darkCard rounded-[40px] p-8 md:p-10 text-white shadow-xl h-fit border border-transparent dark:border-darkBorder">
                   <h3 className="font-bold text-xl mb-8 flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-accentYellow"></div>
                     Key Concepts
                   </h3>
                   <ul className="space-y-6">
                     {studySet.keyConcepts.map((concept, i) => (
                       <li key={i} className="flex items-start gap-4 group">
                         <span className="font-mono text-primaryGold text-lg font-bold group-hover:text-white transition-colors">0{i+1}</span>
                         <span className="text-white/90 font-medium leading-relaxed">{concept}</span>
                       </li>
                     ))}
                   </ul>
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