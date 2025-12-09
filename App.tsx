import React, { useState, useEffect } from 'react';
import { generateStudySet } from './services/geminiService';
import { supabase, getProfile, upsertProfile, saveStudySet, getStudySets, deleteStudySet, deleteAllStudySets, submitFeedback } from './services/supabase';
import { StudySet, InputType } from './types';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { StudyView } from './components/StudyView';
import { Onboarding, OnboardingData } from './components/Onboarding';
import { LegalPage } from './components/LegalPage';
import { PricingPage } from './components/PricingPage';
import { User } from '@supabase/supabase-js';

type ViewType = 'loading' | 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'study' | 'privacy' | 'terms' | 'disclaimer' | 'refund' | 'pricing';

const App: React.FC = () => {
  // Check URL for legal pages on initial load
  const getInitialView = (): ViewType => {
    const path = window.location.pathname;
    if (path === '/privacy') return 'privacy';
    if (path === '/terms') return 'terms';
    if (path === '/disclaimer') return 'disclaimer';
    if (path === '/refund') return 'refund';
    if (path === '/pricing') return 'pricing';
    return 'loading';
  };

  const [view, setView] = useState<ViewType>(getInitialView());
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userVibe, setUserVibe] = useState<'focused' | 'chill'>('focused');
  const [isPremium, setIsPremium] = useState(false);
  const [currentSet, setCurrentSet] = useState<StudySet | null>(null);
  const [history, setHistory] = useState<StudySet[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle browser back/forward navigation and URL routing
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/privacy') setView('privacy');
      else if (path === '/terms') setView('terms');
      else if (path === '/disclaimer') setView('disclaimer');
      else if (path === '/refund') setView('refund');
      else if (path === '/pricing') setView('pricing');
      else if (path === '/' || path === '') {
        // Return to appropriate view based on auth state
        if (user) setView('dashboard');
        else setView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  // Navigate to legal page and update URL
  const navigateToLegal = (type: 'privacy' | 'terms' | 'disclaimer') => {
    window.history.pushState({}, '', `/${type}`);
    setView(type);
  };

  // Navigate back from legal pages
  const handleLegalBack = () => {
    window.history.pushState({}, '', '/');
    if (user) setView('dashboard');
    else setView('landing');
  };

  // Check auth state on mount
  useEffect(() => {
    // Skip auth redirect if on legal pages or pricing
    const isLegalPage = ['privacy', 'terms', 'disclaimer', 'refund', 'pricing'].includes(view);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // Only load user data and redirect if not on a legal page
        if (!isLegalPage) {
          loadUserData(session.user.id);
        }
      } else if (!isLegalPage) {
        // Only redirect to landing if not on a legal page
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

      // Save to Supabase with timeout
      if (user) {
        console.log('Saving to Supabase...', { userId: user.id, title: newSet.title });
        try {
          // Add 10 second timeout for save operation
          const savePromise = saveStudySet(user.id, newSet);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Save timeout')), 10000)
          );

          const result = await Promise.race([savePromise, timeoutPromise]) as any;

          if (result?.error) {
            console.error('Supabase save error:', result.error);
          } else if (result?.data) {
            console.log('Saved successfully:', result.data.id);
            // Update the set with the real ID from database
            newSet.id = result.data.id;
            // Force update history with the new ID to ensure consistent state
            setHistory(prev => prev.map(s => s.createdAt === newSet.createdAt ? { ...s, id: result.data.id } : s));
          }
        } catch (saveError: any) {
          console.error('Save failed:', saveError?.message || saveError);
          // Continue anyway - don't block the user
        }
      }

      console.log('Setting view to study...');
      setView('study');
    } catch (error) {
      console.error('Generation error:', error);
      alert(`Failed to generate study set: ${error instanceof Error ? error.message : String(error)}`);
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

  const handleDeleteStudySet = async (studySetId: string) => {
    const { error } = await deleteStudySet(studySetId);
    if (!error) {
      setHistory(prev => prev.filter(set => set.id !== studySetId));
    }
  };

  const handleSubmitFeedback = async (rating: number, text: string) => {
    if (user) {
      await submitFeedback(user.id, rating, text);
    }
  };

  const handleResetHistory = async () => {
    if (user) {
      const { error } = await deleteAllStudySets(user.id);
      if (!error) {
        setHistory([]);
      }
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, you'd want to call a server function to delete user data
    // For now, we'll just sign them out
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
          <div className="w-12 h-12 rounded-none bg-accentYellow animate-pulse"></div>
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
        user={user}
        onProcess={handleProcess}
        isProcessing={isProcessing}
        onLogout={handleLogout}
        history={history}
        onSelectHistory={handleSelectHistory}
        onDeleteStudySet={handleDeleteStudySet}
        onSubmitFeedback={handleSubmitFeedback}
        onResetHistory={handleResetHistory}
        onDeleteAccount={handleDeleteAccount}
        initialGenZMode={userVibe === 'chill'}
        isPremium={isPremium}
      />
    );
  }

  if (view === 'study' && currentSet) {
    return <StudyView studySet={currentSet} onBack={() => setView('dashboard')} />;
  }

  if (view === 'privacy') {
    return <LegalPage type="privacy" onBack={handleLegalBack} />;
  }

  if (view === 'terms') {
    return <LegalPage type="terms" onBack={handleLegalBack} />;
  }

  if (view === 'disclaimer') {
    return <LegalPage type="disclaimer" onBack={handleLegalBack} />;
  }

  if (view === 'refund') {
    return <LegalPage type="refund" onBack={handleLegalBack} />;
  }

  if (view === 'pricing') {
    return <PricingPage onBack={handleLegalBack} />;
  }

  return <LandingPage onStart={handleStart} />;
};

export default App;
