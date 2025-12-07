import React, { useState } from 'react';
import { generateStudySet } from './services/geminiService';
import { StudySet, InputType } from './types';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { StudyView } from './components/StudyView';
import { Onboarding } from './components/Onboarding';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'onboarding' | 'dashboard' | 'study'>('landing');
  const [userName, setUserName] = useState('');
  const [userVibe, setUserVibe] = useState('focused');
  const [currentSet, setCurrentSet] = useState<StudySet | null>(null);
  const [history, setHistory] = useState<StudySet[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStart = () => setView('auth');
  const handleAuthComplete = () => setView('onboarding');
  
  const handleOnboardingComplete = (data: { name: string; goal: string; vibe: string }) => {
    setUserName(data.name);
    setUserVibe(data.vibe);
    setView('dashboard');
  };

  const handleProcess = async (content: string, type: InputType, mimeType?: string, genZMode?: boolean) => {
    setIsProcessing(true);
    try {
      const newSet = await generateStudySet(content, type, genZMode, mimeType);
      setCurrentSet(newSet);
      setHistory(prev => [newSet, ...prev]);
      setView('study');
    } catch (error) {
      console.error(error);
      alert("Failed to generate study set. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectHistory = (set: StudySet) => {
    setCurrentSet(set);
    setView('study');
  };

  const handleLogout = () => {
    setUserName('');
    setCurrentSet(null);
    setView('landing');
  };

  if (view === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (view === 'auth') {
    return <AuthPage onComplete={handleAuthComplete} onBack={() => setView('landing')} />;
  }

  if (view === 'dashboard') {
    return (
      <Dashboard 
        user={userName || 'Friend'} 
        onProcess={handleProcess} 
        isProcessing={isProcessing} 
        onLogout={handleLogout} 
        history={history}
        onSelectHistory={handleSelectHistory}
        initialGenZMode={userVibe === 'chill'}
      />
    );
  }

  if (view === 'study' && currentSet) {
    return <StudyView studySet={currentSet} onBack={() => setView('dashboard')} />;
  }

  return <LandingPage onStart={handleStart} />;
};

export default App;