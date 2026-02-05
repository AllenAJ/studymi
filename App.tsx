import React, { useState, useEffect, useRef } from 'react';
import { generateStudySet } from './services/geminiService';
import { supabase, getProfile, upsertProfile, saveStudySet, getStudySets, deleteStudySet, deleteAllStudySets, submitFeedback } from './services/supabase';
import { StudySet, InputType } from './types';
import { LandingPage } from './components/LandingPage';
import { NativeLanding } from './components/NativeLanding';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { StudyView } from './components/StudyView';
import { Onboarding, OnboardingData } from './components/Onboarding';
import { LegalPage } from './components/LegalPage';
import { PricingPage } from './components/PricingPage';
import { WaitlistPage } from './components/WaitlistPage';
import { User } from '@supabase/supabase-js';
import { usePostHog } from 'posthog-js/react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { LoadingView } from './components/LoadingView';
import { OfflineView } from './components/OfflineView';

type ViewType = 'loading' | 'landing' | 'native_landing' | 'auth' | 'onboarding' | 'dashboard' | 'study' | 'privacy' | 'terms' | 'disclaimer' | 'refund' | 'pricing';

const App: React.FC = () => {
  const posthog = usePostHog();

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Check for updates every minute
        setInterval(() => {
          console.log('[PWA] Checking for updates...');
          r.update();
        }, 60000);
      }
    },
    onNeedRefresh() {
      console.log('[PWA] Update available, prompt showing.');
    },
    onOfflineReady() {
      console.log('[PWA] App ready for offline use.');
    }
  });

  // Check URL for legal pages on initial load
  const getInitialView = (): ViewType => {
    const path = window.location.pathname;
    if (path === '/privacy') return 'privacy';
    if (path === '/terms') return 'terms';
    if (path === '/disclaimer') return 'disclaimer';
    if (path === '/refund') return 'refund';
    if (path === '/pricing') return 'pricing';
    if (path === '/access') return 'auth';

    // Check if running in Capacitor native app
    const isNative = (window as any).Capacitor?.isNativePlatform?.() ?? false;
    if (isNative) return 'native_landing';

    return 'loading';
  };

  const [view, setView] = useState<ViewType>(getInitialView());
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userVibe, setUserVibe] = useState<'focused' | 'chill'>('focused');
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [currentSet, setCurrentSet] = useState<StudySet | null>(null);
  const [history, setHistory] = useState<StudySet[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Track page views
  useEffect(() => {
    if (posthog) {
      posthog.capture('$pageview');
    }
  }, [view, posthog]);

  // Handle browser back/forward navigation and URL routing
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/privacy') setView('privacy');
      else if (path === '/terms') setView('terms');
      else if (path === '/disclaimer') setView('disclaimer');
      else if (path === '/refund') setView('refund');
      else if (path === '/pricing') setView('pricing');
      else if (path === '/access') setView('auth');
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

  // Track last authenticated user to prevent redundant loads/redirects
  const lastAuthUser = useRef<string | null>(null);

  // Initialize Network and Splash Screen
  useEffect(() => {
    let mounted = true;

    const initAppShell = async () => {
      try {
        const isNative = (window as any).Capacitor?.isNativePlatform?.() ?? false;

        if (isNative) {
          try {
            const { Network } = await import('@capacitor/network');
            const status = await Network.getStatus();
            if (mounted) setIsOnline(status.connected);

            Network.addListener('networkStatusChange', status => {
              if (mounted) setIsOnline(status.connected);
            });
          } catch (e) {
            console.warn('[App] Network plugin init failed:', e);
          }
        }

        // Hide splash screen after initialization
        setTimeout(async () => {
          if (!mounted) return;

          if (isNative) {
            try {
              const { SplashScreen } = await import('@capacitor/splash-screen');
              await SplashScreen.hide();
            } catch (e) {
              console.warn('[App] SplashScreen hide failed:', e);
            }
          }
          setIsInitialLoad(false);

          // Safety fallback: if view is still 'loading' after 3 seconds, 
          // force check auth again or go to landing
          setTimeout(() => {
            if (mounted && view === 'loading') {
              console.warn('[App] Auth hang or slow load detected, forcing view update');
              supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user) {
                  loadUserData(session.user.id);
                } else {
                  const isNativeEnv = (window as any).Capacitor?.isNativePlatform?.() ?? false;
                  setView(isNativeEnv ? 'native_landing' : 'landing');
                }
              });
            }
          }, 3000);
        }, 800);
      } catch (err) {
        console.error('[App] Initialization error:', err);
        if (mounted) {
          setIsInitialLoad(false);
          const isNativeEnv = (window as any).Capacitor?.isNativePlatform?.() ?? false;
          if (view === 'loading') setView(isNativeEnv ? 'native_landing' : 'landing');
        }
      }
    };

    initAppShell();

    // Universal Safety Timeout - 6 seconds max for loading screen
    const safetyTimer = setTimeout(() => {
      if (mounted && (isInitialLoad || view === 'loading')) {
        console.warn('[App] Universal safety timeout reached');
        setIsInitialLoad(false);
        if (view === 'loading') {
          const isNativeEnv = (window as any).Capacitor?.isNativePlatform?.() ?? false;
          setView(isNativeEnv ? 'native_landing' : 'landing');
        }
      }
    }, 6000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
    };
  }, [view]);

  // Check auth state on mount
  useEffect(() => {
    // Skip auth redirect if on legal pages, pricing, or auth (admin access)
    const isLegalPage = ['privacy', 'terms', 'disclaimer', 'refund', 'pricing', 'auth'].includes(view);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (lastAuthUser.current !== session.user.id) {
          lastAuthUser.current = session.user.id;
          setUser(session.user);

          // Identify user in PostHog
          if (posthog) {
            posthog.identify(session.user.id, {
              email: session.user.email,
              name: session.user.user_metadata?.full_name
            });
          }

          // Only load user data and redirect if not on a legal page
          if (!isLegalPage) {
            loadUserData(session.user.id);
          }
        }
      } else if (!isLegalPage) {
        // Only redirect to landing if not on a legal page
        const isNative = (window as any).Capacitor?.isNativePlatform?.() ?? false;
        setView(isNative ? 'native_landing' : 'landing');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Only act if the user ID actually changed
        if (lastAuthUser.current !== session.user.id) {
          lastAuthUser.current = session.user.id;
          setUser(session.user);

          // Identify user
          if (posthog) {
            posthog.identify(session.user.id, {
              email: session.user.email,
              name: session.user.user_metadata?.full_name
            });
            posthog.capture('auth_complete');
          }

          loadUserData(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        lastAuthUser.current = null;
        setUser(null);
        setUserName('');
        setHistory([]);
        setView('landing');
        if (posthog) posthog.reset();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle deep links for OAuth callback (native app only)
  useEffect(() => {
    const setupDeepLinkListener = async () => {
      const isNative = (window as any).Capacitor?.isNativePlatform?.() ?? false;
      if (!isNative) return;

      const { App } = await import('@capacitor/app');

      // Handle deep links when app is opened via URL scheme
      App.addListener('appUrlOpen', async (event) => {
        console.log('[DeepLink] Received URL:', event.url);

        // Check if this is an auth callback
        if (event.url.includes('auth/callback') || event.url.includes('access_token')) {
          // Extract the URL fragment (everything after #)
          const urlFragment = event.url.split('#')[1];
          if (urlFragment) {
            // Parse the fragment as URL params
            const params = new URLSearchParams(urlFragment);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              console.log('[DeepLink] Setting session from tokens');
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (error) {
                console.error('[DeepLink] Error setting session:', error);
              } else {
                console.log('[DeepLink] Session set successfully');
                // Close the browser if it's still open
                try {
                  const { Browser } = await import('@capacitor/browser');
                  await Browser.close();
                } catch (e) {
                  console.log('[DeepLink] Browser close skipped:', e);
                }
              }
            }
          }
        }
      });
    };

    setupDeepLinkListener();
  }, []);

  const loadUserData = async (userId: string) => {
    // Load profile
    const { data: profile, error } = await getProfile(userId);

    if (error) {
      console.error('Error loading profile:', error);
      // Don't redirect to onboarding on error, stay on loading or show retry
      alert('Failed to load user profile. Please check your connection.');
      return;
    }

    if (profile?.name) {
      setUserName(profile.name);
      setUserVibe(profile.vibe || 'focused');
      // Fix: Load premium status from profile
      setIsPremium(profile.is_premium || false);
      setSubscriptionId(profile.subscription_id || null);

      // Load study sets
      const { data: studySets } = await getStudySets(userId);
      if (studySets) {
        const mappedSets: StudySet[] = studySets.map((set: any) => ({
          id: set.id,
          title: set.title,
          summary: set.summary,
          detailedNotes: set.detailed_notes,
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

  const handleStart = () => setView('auth');

  // Track successful checkout status from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      if (posthog) {
        posthog.capture('checkout_success');
      }
      // Clean up URL to avoid redundant tracking or confusing the user
      window.history.replaceState({}, '', window.location.origin);
    }
  }, [posthog]);

  const handleAuthComplete = async (userId: string, email: string) => {
    // Check if user has completed onboarding
    const { data: profile } = await getProfile(userId);
    if (profile?.name) {
      setUserName(profile.name);
      setUserVibe(profile.vibe || 'focused');
      // Fix: Load premium status from profile
      setIsPremium(profile.is_premium || false);
      setSubscriptionId(profile.subscription_id || null);

      // Load study sets
      const { data: studySets } = await getStudySets(userId);
      if (studySets) {
        const mappedSets: StudySet[] = studySets.map((set: any) => ({
          id: set.id,
          title: set.title,
          summary: set.summary,
          detailedNotes: set.detailed_notes,
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


  // Handle Offline State
  if (!isOnline) {
    return (
      <OfflineView
        onRetry={async () => {
          const isNative = (window as any).Capacitor?.isNativePlatform?.() ?? false;
          if (isNative) {
            try {
              const { Network } = await import('@capacitor/network');
              const status = await Network.getStatus();
              setIsOnline(status.connected);
            } catch (e) {
              console.warn('[App] Manual network check failed:', e);
            }
          } else {
            setIsOnline(navigator.onLine);
          }
        }}
      />
    );
  }

  // Loading state
  if (view === 'loading' || isInitialLoad) {
    return <LoadingView />;
  }

  const MainContent = () => {
    if (view === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} />;
    if (view === 'auth') return <AuthPage onComplete={handleAuthComplete} onBack={() => setView('landing')} />;
    if (view === 'dashboard') return (
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
        subscriptionId={subscriptionId}
      />
    );
    if (view === 'study' && currentSet) return <StudyView studySet={currentSet} onBack={() => setView('dashboard')} />;
    if (view === 'privacy') return <LegalPage type="privacy" onBack={handleLegalBack} />;
    if (view === 'terms') return <LegalPage type="terms" onBack={handleLegalBack} />;
    if (view === 'disclaimer') return <LegalPage type="disclaimer" onBack={handleLegalBack} />;
    if (view === 'refund') return <LegalPage type="refund" onBack={handleLegalBack} />;
    if (view === 'pricing') return <PricingPage onBack={handleLegalBack} />;
    if (view === 'native_landing') return <NativeLanding onStart={() => setView('auth')} />;
    return <LandingPage onStart={() => setView('auth')} />;
  };

  return (
    <div className="h-full w-full bg-iceGray dark:bg-darkBg overflow-y-auto overflow-x-hidden relative scroll-smooth">
      {/* PWA Update Notification - Global */}
      {needRefresh && (
        <div className="fixed top-0 left-0 right-0 z-[10000] p-4 bg-primaryGold text-deepNavy flex items-center justify-between shadow-2xl animate-slide-down safe-top">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Update available!</span>
          </div>
          <button
            onClick={() => updateServiceWorker(true)}
            className="bg-deepNavy text-white px-4 py-1.5 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Refresh
          </button>
        </div>
      )}
      <MainContent />
    </div>
  );
};

export default App;
