import React, { useState, useEffect } from 'react';
import { generateStudySet } from './services/geminiService';
import { supabase, getProfile, upsertProfile, saveStudySet, getStudySets } from './services/supabase';
import { StudySet, InputType } from './types';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { StudyView } from './components/StudyView';
import { Onboarding, OnboardingData } from './components/Onboarding';
import { User } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [view, setView] = useState<'loading' | 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'study'>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userVibe, setUserVibe] = useState('focused');
  const [currentSet, setCurrentSet] = useState<StudySet | null>(null);
  const [history, setHistory] = useState<StudySet[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      } else {
        setView('landing');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserName('');
        setHistory([]);
        setView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    // Load profile
    const { data: profile } = await getProfile(userId);
    
    if (profile?.name) {
      setUserName(profile.name);
      setUserVibe(profile.vibe || 'focused');
      
      // Load study sets
      const { data: studySets } = await getStudySets(userId);
      if (studySets) {
        const mappedSets: StudySet[] = studySets.map((set: any) => ({
          id: set.id,
          title: set.title,
          summary: set.summary,
          keyConcepts: set.key_concepts,
          flashcards: set.flashcards.map((f: any, i: number) => ({ ...f, id: `fc-${i}` })),
          quiz: set.quiz.map((q: any, i: number) => ({ ...q, id: `q-${i}` })),
          mindMap: set.mind_map,
          createdAt: new Date(set.created_at).getTime(),
          type: set.input_type as InputType,
        }));
        setHistory(mappedSets);
      }
      
      setView('dashboard');
    } else {
      // New user, needs onboarding
      setView('onboarding');
    }
  };

  const handleStart = () => setView('auth');
  
  const handleAuthComplete = async (userId: string, email: string) => {
    // Check if user has completed onboarding
    const { data: profile } = await getProfile(userId);
    if (profile?.name) {
      setUserName(profile.name);
      setUserVibe(profile.vibe || 'focused');
      
      // Load study sets
      const { data: studySets } = await getStudySets(userId);
      if (studySets) {
        const mappedSets: StudySet[] = studySets.map((set: any) => ({
          id: set.id,
          title: set.title,
          summary: set.summary,
          keyConcepts: set.key_concepts,
          flashcards: set.flashcards.map((f: any, i: number) => ({ ...f, id: `fc-${i}` })),
          quiz: set.quiz.map((q: any, i: number) => ({ ...q, id: `q-${i}` })),
          mindMap: set.mind_map,
          createdAt: new Date(set.created_at).getTime(),
          type: set.input_type as InputType,
        }));
        setHistory(mappedSets);
      }
      
      setView('dashboard');
    } else {
      setView('onboarding');
    }
  };
  
  const handleOnboardingComplete = async (data: OnboardingData) => {
    setUserName(data.name);
    setUserVibe(data.genZMode ? 'chill' : 'focused');
    
    // Save profile to Supabase
    if (user) {
      await upsertProfile({
        id: user.id,
        email: user.email || '',
        name: data.name,
        gender: data.gender,
        age_range: data.ageRange,
        referral_source: data.referralSource,
        study_areas: data.studyAreas,
        goal: data.goal,
        learning_sources: data.learningSources,
        first_topic: data.firstTopic,
        vibe: data.genZMode ? 'chill' : 'focused',
      });
    }
    
    setView('dashboard');
  };

  const handleProcess = async (content: string, type: InputType, mimeType?: string, genZMode?: boolean) => {
    setIsProcessing(true);
    try {
      const newSet = await generateStudySet(content, type, genZMode, mimeType);
      setCurrentSet(newSet);
      setHistory(prev => [newSet, ...prev]);
      
      // Save to Supabase
      if (user) {
        const { data: savedSet } = await saveStudySet(user.id, newSet);
        if (savedSet) {
          // Update the ID with the database ID
          newSet.id = savedSet.id;
        }
      }
      
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserName('');
    setCurrentSet(null);
    setHistory([]);
    setView('landing');
  };

  // Loading state
  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accentYellow animate-pulse"></div>
          <p className="text-steelGray font-medium">Loading...</p>
        </div>
      </div>
    );
  }

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
