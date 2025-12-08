import React, { useState, useRef, useEffect } from 'react';
import { Mic, FileText, Sparkles, Clock, ThumbsUp, Home, ArrowRight, X, Star, Settings, Upload, Youtube, Moon, Sun, Crown, Info, Trash2, ToggleLeft, ToggleRight, Menu, BarChart2, Calendar, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { InputType, StudySet } from '../types';

interface DashboardProps {
  user: string;
  onProcess: (content: string, type: InputType, mimeType?: string, genZMode?: boolean) => void;
  isProcessing: boolean;
  onLogout: () => void;
  history: StudySet[];
  onSelectHistory: (set: StudySet) => void;
  onDeleteStudySet?: (id: string) => void;
  onSubmitFeedback?: (rating: number, text: string) => void;
  onResetHistory?: () => void;
  onDeleteAccount?: () => void;
  initialGenZMode?: boolean;
}

// Activity Bar Chart Component - Now uses real data
const ActivityChart: React.FC<{ history: StudySet[] }> = ({ history }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate activity for each day of the current week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const activityByDay = days.map((_, index) => {
    const dayStart = new Date(startOfWeek);
    dayStart.setDate(startOfWeek.getDate() + index);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const count = history.filter(set => {
      const created = new Date(set.createdAt);
      return created >= dayStart && created < dayEnd;
    }).length;

    return count;
  });

  const maxActivity = Math.max(...activityByDay, 1);
  const values = activityByDay.map(count => (count / maxActivity) * 100);

  return (
    <div className="flex items-end justify-between h-48 w-full gap-2 pt-4">
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
          <div className="relative w-full max-w-[24px] h-full bg-iceGray dark:bg-darkBorder rounded-full overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-primaryGold rounded-full transition-all duration-500 group-hover:bg-deepNavy dark:group-hover:bg-white"
              style={{ height: `${Math.max(values[i], 5)}%` }}
            ></div>
          </div>
          <span className="text-xs font-medium text-steelGray dark:text-darkMuted group-hover:text-deepNavy dark:group-hover:text-white transition-colors">{day}</span>
          <span className="text-[10px] text-steelGray/60 dark:text-darkMuted/60">{activityByDay[i]}</span>
        </div>
      ))}
    </div>
  );
};

// Stats Card Component
const StatsCard: React.FC<{ history: StudySet[] }> = ({ history }) => {
  // Calculate real stats
  const totalSets = history.length;
  const totalFlashcards = history.reduce((sum, set) => sum + (set.flashcards?.length || 0), 0);
  const totalQuizQuestions = history.reduce((sum, set) => sum + (set.quiz?.length || 0), 0);

  // Calculate this week's activity
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekSets = history.filter(set => new Date(set.createdAt) >= weekAgo).length;

  // Calculate previous week for comparison
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const lastWeekSets = history.filter(set => {
    const created = new Date(set.createdAt);
    return created >= twoWeeksAgo && created < weekAgo;
  }).length;

  const percentChange = lastWeekSets > 0
    ? Math.round(((thisWeekSets - lastWeekSets) / lastWeekSets) * 100)
    : thisWeekSets > 0 ? 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Study Sets Stat */}
      <div className="bg-white dark:bg-darkCard rounded-[32px] p-8 border border-softBorder dark:border-darkBorder shadow-soft flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
            <BookOpen className="w-6 h-6 text-blue-500" />
          </div>
          {percentChange !== 0 && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${percentChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {percentChange > 0 ? '+' : ''}{percentChange}%
            </span>
          )}
        </div>
        <div>
          <p className="text-3xl font-extrabold text-deepNavy dark:text-white mb-1">{totalSets}</p>
          <p className="text-sm text-steelGray dark:text-darkMuted font-medium">study sets created</p>
        </div>
      </div>

      {/* Flashcards Stat */}
      <div className="bg-white dark:bg-darkCard rounded-[32px] p-8 border border-softBorder dark:border-darkBorder shadow-soft flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-2xl">
            <Layers className="w-6 h-6 text-purple-500" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-extrabold text-deepNavy dark:text-white mb-1">{totalFlashcards}</p>
          <p className="text-sm text-steelGray dark:text-darkMuted font-medium">flashcards generated</p>
        </div>
      </div>

      {/* Quiz Questions Stat */}
      <div className="bg-white dark:bg-darkCard rounded-[32px] p-8 border border-softBorder dark:border-darkBorder shadow-soft flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-extrabold text-deepNavy dark:text-white mb-1">{totalQuizQuestions}</p>
          <p className="text-sm text-steelGray dark:text-darkMuted font-medium">quiz questions</p>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onProcess,
  isProcessing,
  onLogout,
  history,
  onSelectHistory,
  onDeleteStudySet,
  onSubmitFeedback,
  onResetHistory,
  onDeleteAccount,
  initialGenZMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'insights' | 'settings' | 'history'>('home');
  const [activeModal, setActiveModal] = useState<'voice' | 'text' | 'upload' | 'link' | 'feedback' | 'confirmDelete' | 'confirmReset' | 'confirmDeleteAccount' | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Initialize settings from localStorage
  const [isGenZMode, setIsGenZMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studymi_genZMode');
      return saved !== null ? JSON.parse(saved) : initialGenZMode;
    }
    return initialGenZMode;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studymi_darkMode');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [studySetToDelete, setStudySetToDelete] = useState<string | null>(null);

  // Loading State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);

  // Settings State - Initialize from localStorage
  const [analyticsCookies, setAnalyticsCookies] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studymi_analyticsCookies');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  // Upgrade Modal State
  const [isYearlyPlan, setIsYearlyPlan] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('studymi_genZMode', JSON.stringify(isGenZMode));
  }, [isGenZMode]);

  useEffect(() => {
    localStorage.setItem('studymi_darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('studymi_analyticsCookies', JSON.stringify(analyticsCookies));
  }, [analyticsCookies]);

  // Get current week date range
  const getWeekRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };

  // Dark Mode Logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Loading Animation Logic
  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      setLoadingProgress(0);
      setLoadingStep(0);

      interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 98) return 98;

          // Slower, more natural progress
          let increment = Math.random() * 1.2;

          // Slow down as we approach certain thresholds
          if (prev > 70) increment *= 0.5;
          if (prev > 85) increment *= 0.3;

          const next = prev + increment;

          // Update steps based on progress
          if (next > 15 && next <= 35) setLoadingStep(1);
          else if (next > 35 && next <= 55) setLoadingStep(2);
          else if (next > 55 && next <= 75) setLoadingStep(3);
          else if (next > 75 && next <= 90) setLoadingStep(4);
          else if (next > 90) setLoadingStep(5);

          return next;
        });
      }, 150);
    } else {
      // Smooth completion animation
      setLoadingProgress(100);
      setLoadingStep(6);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const loadingSteps = [
    "Reading your content...",
    "Identifying key concepts...",
    "Creating flashcards...",
    "Generating quiz questions...",
    "Building mind map...",
    "Saving your study set...",
    "All done! ✨"
  ];

  const tips = [
    "Fun Fact: The Feynman Technique works best when you explain it out loud.",
    "Tip: Try to identify gaps in your knowledge while quizzing.",
    "Did you know? Spaced repetition increases retention by 200%.",
    "Feynman says: 'If you can't explain it simply, you don't understand it well enough.'"
  ];

  const [currentTip, setCurrentTip] = useState(tips[0]);
  useEffect(() => {
    if (isProcessing) {
      setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    }
  }, [isProcessing]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64Content = base64data.split(',')[1];
          onProcess(base64Content, 'audio', 'audio/wav', isGenZMode);
          setActiveModal(null);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onProcess(textInput.trim(), activeModal === 'link' ? 'youtube' : 'text', undefined, isGenZMode);
      setActiveModal(null);
      setTextInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      const mimeType = file.type;
      const type: InputType = mimeType.includes('audio') ? 'audio' : 'pdf';

      onProcess(base64String, type, mimeType, isGenZMode);
      setActiveModal(null);
    };
    reader.readAsDataURL(file);
  };

  const closeModal = () => {
    setActiveModal(null);
    setIsRecording(false);
    setTextInput('');
    setStudySetToDelete(null);
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFeedbackSubmit = () => {
    if (onSubmitFeedback && feedbackRating > 0) {
      onSubmitFeedback(feedbackRating, feedbackText);
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setActiveModal(null);
        setFeedbackText('');
        setFeedbackRating(0);
        setFeedbackSubmitted(false);
      }, 2000);
    }
  };

  const handleDeleteStudySet = () => {
    if (studySetToDelete && onDeleteStudySet) {
      onDeleteStudySet(studySetToDelete);
      setActiveModal(null);
      setStudySetToDelete(null);
    }
  };

  const handleResetHistory = () => {
    if (onResetHistory) {
      onResetHistory();
      setActiveModal(null);
    }
  };

  const handleDeleteAccount = () => {
    if (onDeleteAccount) {
      onDeleteAccount();
      setActiveModal(null);
    }
  };

  const NavigationContent = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-6 mb-8 lg:justify-center">
          <img src="/favicon-96x96.png" alt="Studymi" className="w-10 h-10" />
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-steelGray">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-2 flex-1 w-full px-4">
          <button
            onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 ${activeTab === 'home' ? 'bg-black/5 dark:bg-white/10 text-deepNavy dark:text-white font-bold' : 'text-steelGray dark:text-darkMuted hover:bg-iceGray dark:hover:bg-darkBorder/50'}`}
          >
            <Home className="w-5 h-5" />
            <span className="lg:hidden text-sm">Home</span>
          </button>

          <button
            onClick={() => { setActiveTab('insights'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 ${activeTab === 'insights' ? 'bg-black/5 dark:bg-white/10 text-deepNavy dark:text-white font-bold' : 'text-steelGray dark:text-darkMuted hover:bg-iceGray dark:hover:bg-darkBorder/50'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="lg:hidden text-sm">Insights</span>
          </button>

          <button
            onClick={() => { setActiveTab('history'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 ${activeTab === 'history' ? 'bg-black/5 dark:bg-white/10 text-deepNavy dark:text-white font-bold' : 'text-steelGray dark:text-darkMuted hover:bg-iceGray dark:hover:bg-darkBorder/50'}`}
          >
            <Clock className="w-5 h-5" />
            <span className="lg:hidden text-sm">History</span>
          </button>

          <button
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 ${activeTab === 'settings' ? 'bg-black/5 dark:bg-white/10 text-deepNavy dark:text-white font-bold' : 'text-steelGray dark:text-darkMuted hover:bg-iceGray dark:hover:bg-darkBorder/50'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="lg:hidden text-sm">Settings</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 w-full px-4 mb-8">
          {/* Upgrade Button */}
          <button
            onClick={() => { setActiveModal('upgrade'); setIsSidebarOpen(false); }}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-softBorder dark:border-darkBorder text-deepNavy dark:text-white hover:bg-iceGray dark:hover:bg-darkBorder/50 transition-colors"
          >
            <Crown className="w-5 h-5 text-primaryGold" />
            <span className="lg:hidden text-sm font-medium">Upgrade plan</span>
          </button>

          <button
            onClick={() => { setActiveModal('feedback'); setIsSidebarOpen(false); }}
            className="flex items-center gap-4 p-3.5 rounded-xl text-steelGray dark:text-darkMuted hover:bg-iceGray dark:hover:bg-darkBorder/50 transition-colors"
          >
            <ThumbsUp className="w-5 h-5" />
            <span className="lg:hidden text-sm">Feedback</span>
          </button>

          <div className="w-full h-px bg-softBorder dark:bg-darkBorder my-2"></div>

          <button
            onClick={onLogout}
            className="flex items-center gap-4 p-3.5 rounded-xl text-steelGray dark:text-darkMuted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            <span className="lg:hidden text-sm font-medium">Log Out</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-iceGray dark:bg-darkBg font-sans flex text-deepNavy dark:text-darkText relative overflow-hidden transition-colors duration-300">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-24 bg-white dark:bg-darkBg border-r border-softBorder dark:border-darkBorder flex-col items-center py-8 z-50 shadow-soft">
        <NavigationContent />
      </aside>

      {/* Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-darkBg border-r border-softBorder dark:border-darkBorder py-8 animate-slide-right shadow-2xl">
            <NavigationContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-24 p-6 md:p-12 overflow-y-auto min-h-screen relative">

        {/* Top Controls Bar */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-deepNavy dark:text-white hover:bg-white/50 dark:hover:bg-darkCard rounded-full transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/favicon-96x96.png" alt="Studymi" className="w-6 h-6" />
              <span className="font-bold text-lg dark:text-white tracking-tight">studymi</span>
            </div>
          </div>

          <div className="hidden lg:block"></div>

          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            {/* Compact Upgrade Button */}
            <button
              onClick={() => setActiveModal('upgrade')}
              className="hidden sm:flex items-center gap-2 bg-deepNavy dark:bg-white text-white dark:text-deepNavy font-bold text-sm pl-3 pr-4 py-2.5 rounded-full shadow-sm hover:shadow-md hover:opacity-90 transition-all"
            >
              <Crown className="w-4 h-4" />
              <span className="hidden md:inline">Upgrade plan</span>
            </button>

            {/* Usage Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-white dark:bg-darkCard px-3 py-2 rounded-full border border-softBorder dark:border-darkBorder shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < history.length ? 'bg-primaryGold' : 'bg-softBorder dark:bg-darkBorder'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-deepNavy dark:text-white">{Math.min(history.length, 3)}/3</span>
              </div>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 rounded-full bg-white dark:bg-darkCard border border-softBorder dark:border-darkBorder flex items-center justify-center shadow-sm hover:scale-105 transition-transform text-steelGray dark:text-white"
            >
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2 bg-white/60 dark:bg-darkCard backdrop-blur-sm px-3 py-2 rounded-full border border-softBorder dark:border-darkBorder shadow-sm">
              <span className="text-xs font-bold text-deepNavy dark:text-darkText hidden md:inline">gen z</span>
              <button
                onClick={() => setIsGenZMode(!isGenZMode)}
                className={`w-9 h-5 rounded-full transition-colors relative ${isGenZMode ? 'bg-primaryGold' : 'bg-softBorder dark:bg-darkBorder'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${isGenZMode ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'home' && (
          <div className="w-full max-w-5xl mx-auto animate-slide-up pb-10">
            <div className="mb-12 hidden lg:block">
              <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-deepNavy dark:text-white">what's up, {user}?</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {[
                { id: 'voice', icon: Mic, label: 'Voice', sub: 'Record audio' },
                { id: 'text', icon: FileText, label: 'Text', sub: 'Paste notes' },
                { id: 'upload', icon: Upload, label: 'Upload', sub: 'PDF / Audio' },
                { id: 'link', icon: Youtube, label: 'YouTube', sub: 'Video summary' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModal(item.id as any)}
                  className="bg-white dark:bg-darkCard rounded-[20px] p-6 border border-softBorder dark:border-darkBorder hover:border-primaryGold dark:hover:border-primaryGold hover:shadow-hover transition-all group flex flex-col items-start gap-4"
                >
                  <div className="w-10 h-10 bg-iceGray dark:bg-darkBorder rounded-full flex items-center justify-center text-deepNavy dark:text-white group-hover:bg-primaryGold group-hover:text-white transition-colors">
                    <item.icon className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-deepNavy dark:text-white">{item.label}</h3>
                    <p className="text-xs text-steelGray dark:text-darkMuted">{item.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="w-full">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                <Clock className="w-5 h-5 text-primaryGold" /> recent vibes
              </h2>
              {history.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {history.slice(0, 5).map((set) => (
                    <div
                      key={set.id}
                      className="w-full bg-white dark:bg-darkCard p-5 rounded-[20px] border border-softBorder dark:border-darkBorder hover:border-primaryGold dark:hover:border-white/20 transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
                    >
                      <button
                        onClick={() => onSelectHistory(set)}
                        className="flex items-center gap-4 flex-1"
                      >
                        <div className="w-10 h-10 rounded-full bg-iceGray dark:bg-darkBorder flex items-center justify-center text-deepNavy dark:text-white group-hover:bg-primaryGold group-hover:text-white transition-colors">
                          {set.type === 'audio' ? <Mic className="w-4 h-4" /> :
                            set.type === 'youtube' ? <Youtube className="w-4 h-4" /> :
                              set.type === 'pdf' ? <Upload className="w-4 h-4" /> :
                                <FileText className="w-4 h-4" />}
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-base dark:text-white group-hover:text-primaryGold dark:group-hover:text-primaryGold transition-colors">{set.title}</h3>
                          <p className="text-xs text-steelGray dark:text-darkMuted font-medium">{new Date(set.createdAt).toLocaleDateString()}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        {onDeleteStudySet && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setStudySetToDelete(set.id); setActiveModal('confirmDelete'); }}
                            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 text-steelGray hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <ArrowRight className="w-4 h-4 text-steelGray group-hover:text-primaryGold transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-darkCard rounded-[24px] border border-softBorder dark:border-darkBorder border-dashed">
                  <p className="text-steelGray dark:text-darkMuted text-sm">No study sessions yet. Create your first one above!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="w-full max-w-5xl mx-auto animate-slide-up pb-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-deepNavy dark:text-white">your insights</h1>
                <p className="text-steelGray dark:text-darkMuted font-medium">track your learning progress</p>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-darkCard px-4 py-2 rounded-full border border-softBorder dark:border-darkBorder shadow-sm">
                <Calendar className="w-4 h-4 text-primaryGold" />
                <span className="text-sm font-bold text-deepNavy dark:text-white">{getWeekRange()}</span>
              </div>
            </div>

            {history.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <StatsCard history={history} />
                </div>

                <div className="bg-white dark:bg-darkCard rounded-[32px] p-8 border border-softBorder dark:border-darkBorder shadow-soft">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-iceGray dark:bg-darkBorder flex items-center justify-center">
                      <BarChart2 className="w-5 h-5 text-deepNavy dark:text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-deepNavy dark:text-white">this week</h3>
                      <p className="text-xs text-steelGray dark:text-darkMuted">daily activity</p>
                    </div>
                  </div>
                  <ActivityChart history={history} />
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-darkCard rounded-[32px] border border-softBorder dark:border-darkBorder">
                <BarChart2 className="w-16 h-16 text-softBorder dark:text-darkBorder mx-auto mb-4" />
                <h3 className="text-xl font-bold text-deepNavy dark:text-white mb-2">No data yet</h3>
                <p className="text-steelGray dark:text-darkMuted">Create your first study set to see insights!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto animate-slide-up mt-6">
            <div className="bg-white dark:bg-darkCard rounded-[40px] p-8 md:p-12 border border-softBorder dark:border-darkBorder shadow-soft">

              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primaryGold to-deepNavy p-0.5">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user}`} alt="avatar" className="w-full h-full rounded-full bg-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-deepNavy dark:text-white">{user || 'Guest User'}</h2>
                  <p className="text-sm text-steelGray dark:text-darkMuted">Free Plan • {history.length} study sets</p>
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-lg font-bold text-deepNavy dark:text-white mb-2">Privacy settings</h3>
                <p className="text-sm text-steelGray dark:text-darkMuted mb-6">Manage your preferences</p>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <ToggleRight className="w-8 h-8 text-steelGray opacity-50 cursor-not-allowed" />
                      <div>
                        <p className="font-bold text-deepNavy dark:text-white text-sm">Necessary cookies</p>
                        <p className="text-xs text-steelGray dark:text-darkMuted">Required for the app to function</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setAnalyticsCookies(!analyticsCookies)}>
                        {analyticsCookies ? (
                          <ToggleRight className="w-8 h-8 text-primaryGold" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-steelGray" />
                        )}
                      </button>
                      <div>
                        <p className="font-bold text-deepNavy dark:text-white text-sm">Analytics</p>
                        <p className="text-xs text-steelGray dark:text-darkMuted">Help us improve Studymi</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-lg font-bold text-deepNavy dark:text-white mb-6">Your stats</h3>
                <div className="bg-iceGray dark:bg-darkBg rounded-[24px] p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-extrabold text-deepNavy dark:text-white">{history.length}</p>
                      <p className="text-xs text-steelGray dark:text-darkMuted">Study sets</p>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-deepNavy dark:text-white">
                        {history.reduce((sum, set) => sum + (set.flashcards?.length || 0), 0)}
                      </p>
                      <p className="text-xs text-steelGray dark:text-darkMuted">Flashcards</p>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-deepNavy dark:text-white">
                        {history.reduce((sum, set) => sum + (set.quiz?.length || 0), 0)}
                      </p>
                      <p className="text-xs text-steelGray dark:text-darkMuted">Quiz Qs</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-deepNavy dark:text-white mb-6">Danger zone</h3>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => setActiveModal('confirmReset')}
                    disabled={history.length === 0}
                    className="w-full text-left px-6 py-4 rounded-xl border border-softBorder dark:border-darkBorder font-medium text-deepNavy dark:text-white text-sm hover:bg-iceGray dark:hover:bg-darkBorder/50 transition-colors flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear all study history ({history.length} sets)
                    <Info className="w-4 h-4 text-steelGray" />
                  </button>

                  <button
                    onClick={() => setActiveModal('confirmDeleteAccount')}
                    className="w-full text-left px-6 py-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex justify-between items-center"
                  >
                    Delete account
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="w-full max-w-4xl mx-auto animate-slide-up mt-6">
            <h2 className="text-3xl font-bold mb-2 dark:text-white px-4">full history</h2>
            <p className="text-steelGray dark:text-darkMuted mb-8 px-4">{history.length} study set{history.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 gap-4">
              {history.map((set) => (
                <div
                  key={set.id}
                  className="w-full bg-white dark:bg-darkCard p-6 rounded-[24px] border border-softBorder dark:border-darkBorder hover:border-primaryGold dark:hover:border-white/20 transition-all flex items-center justify-between group"
                >
                  <button
                    onClick={() => onSelectHistory(set)}
                    className="flex items-center gap-4 flex-1 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-iceGray dark:bg-darkBorder flex items-center justify-center text-deepNavy dark:text-white">
                      {set.type === 'audio' ? <Mic className="w-5 h-5" /> :
                        set.type === 'youtube' ? <Youtube className="w-5 h-5" /> :
                          set.type === 'pdf' ? <Upload className="w-5 h-5" /> :
                            <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg dark:text-white">{set.title}</h3>
                      <p className="text-xs text-steelGray dark:text-darkMuted">
                        {new Date(set.createdAt).toLocaleDateString()} • {set.flashcards?.length || 0} cards • {set.quiz?.length || 0} questions
                      </p>
                    </div>
                  </button>
                  {onDeleteStudySet && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setStudySetToDelete(set.id); setActiveModal('confirmDelete'); }}
                      className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 text-steelGray hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-darkCard rounded-[24px] border border-softBorder dark:border-darkBorder border-dashed">
                  <p className="text-steelGray dark:text-darkMuted">No study sets yet. Create your first one!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Text / Link Input Modal */}
      {(activeModal === 'text' || activeModal === 'link') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 glass-backdrop animate-fade-in" onClick={closeModal} />
          <div className="bg-white dark:bg-darkCard w-full max-w-2xl rounded-[32px] shadow-modal border border-softBorder dark:border-darkBorder p-8 relative animate-scale-in z-10">
            <button onClick={closeModal} className="absolute top-6 right-6 p-2 rounded-full hover:bg-iceGray dark:hover:bg-darkBorder transition-colors">
              <X className="w-6 h-6 text-steelGray dark:text-darkMuted" />
            </button>

            <h2 className="text-2xl font-bold mb-2 dark:text-white">{activeModal === 'link' ? 'YouTube Link' : 'Paste Notes'}</h2>
            <p className="text-steelGray dark:text-darkMuted text-sm mb-6">We'll analyze the content and create a study plan.</p>

            <textarea
              autoFocus
              className="w-full h-48 bg-iceGray dark:bg-darkBg rounded-2xl p-6 resize-none outline-none focus:ring-2 focus:ring-primaryGold/50 text-base leading-relaxed mb-6 dark:text-white placeholder:text-steelGray"
              placeholder={activeModal === 'link' ? "https://youtube.com/watch?v=..." : "Paste your content here..."}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />

            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isProcessing}
              className="w-full py-4 bg-primaryGold text-white rounded-full font-bold hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-200/50"
            >
              Analyze
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {activeModal === 'upload' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 glass-backdrop animate-fade-in" onClick={closeModal} />
          <div className="bg-white dark:bg-darkCard w-full max-w-md rounded-[40px] shadow-modal border border-softBorder dark:border-darkBorder p-12 relative animate-scale-in z-10 text-center">
            <button onClick={closeModal} className="absolute top-6 right-6 p-2 rounded-full hover:bg-iceGray dark:hover:bg-darkBorder transition-colors">
              <X className="w-6 h-6 text-steelGray dark:text-darkMuted" />
            </button>

            <h2 className="text-2xl font-bold mb-8 dark:text-white">Upload File</h2>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,audio/*"
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border-2 border-dashed border-softBorder dark:border-darkBorder rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-primaryGold hover:bg-primaryGold/5 dark:hover:bg-darkBorder/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-iceGray dark:bg-darkBorder rounded-full flex items-center justify-center text-steelGray dark:text-white group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-steelGray dark:text-darkMuted font-medium">Tap to select file</p>
            </button>
            <p className="mt-6 text-xs text-steelGray dark:text-darkMuted">Supports PDF & Audio (MP3, WAV)</p>
          </div>
        </div>
      )}

      {/* Voice Input Modal */}
      {activeModal === 'voice' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 glass-backdrop animate-fade-in" onClick={closeModal} />
          <div className="bg-white dark:bg-darkCard w-full max-w-md rounded-[40px] shadow-modal border border-softBorder dark:border-darkBorder p-12 relative animate-scale-in z-10 text-center">
            <button onClick={closeModal} className="absolute top-6 right-6 p-2 rounded-full hover:bg-iceGray dark:hover:bg-darkBorder transition-colors">
              <X className="w-6 h-6 text-steelGray dark:text-darkMuted" />
            </button>

            <h2 className="text-2xl font-bold mb-8 dark:text-white">Recording Session</h2>

            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-10 transition-all duration-300 ${isRecording ? 'bg-red-50 text-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-primaryGold text-white shadow-lg shadow-yellow-200/50'}`}>
              <Mic className={`w-12 h-12 ${isRecording ? 'animate-pulse' : ''}`} />
            </div>

            {!isRecording ? (
              <div className="space-y-4">
                <p className="text-steelGray dark:text-darkMuted mb-6">Tap the button below to start.</p>
                <button
                  onClick={startRecording}
                  className="w-full py-4 bg-deepNavy dark:bg-white text-white dark:text-deepNavy rounded-full font-bold hover:bg-opacity-90 transition-all shadow-lg"
                >
                  Start Recording
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-red-500 font-medium mb-6 animate-pulse">Listening...</p>
                <button
                  onClick={stopRecording}
                  className="w-full py-4 bg-white dark:bg-darkBg border-2 border-red-500 text-red-500 rounded-full font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                >
                  Stop & Process
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {activeModal === 'feedback' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 glass-backdrop animate-fade-in" onClick={() => !feedbackSubmitted && setActiveModal(null)} />
          <div className="bg-white dark:bg-darkCard w-full max-w-md rounded-[32px] shadow-modal border border-softBorder dark:border-darkBorder p-8 relative animate-scale-in z-10 text-center">
            {!feedbackSubmitted && (
              <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-iceGray dark:hover:bg-darkBorder transition-colors">
                <X className="w-6 h-6 text-steelGray dark:text-darkMuted" />
              </button>
            )}

            {feedbackSubmitted ? (
              <div className="py-8 animate-scale-in">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-deepNavy dark:text-white mb-2">Thank you!</h2>
                <p className="text-steelGray dark:text-darkMuted">Your feedback helps us improve.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Thoughts?</h2>
                <p className="text-steelGray dark:text-darkMuted text-sm mb-8">Help us make Studymi better for you.</p>

                <div className="flex justify-center gap-3 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${feedbackRating >= star ? 'fill-accentYellow text-accentYellow' : 'text-softBorder fill-iceGray dark:fill-white/5 dark:text-white/20'}`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  className="w-full h-32 bg-iceGray dark:bg-darkBg rounded-2xl p-4 resize-none outline-none focus:ring-2 focus:ring-primaryGold/50 text-sm mb-6 dark:text-white placeholder:text-steelGray"
                  placeholder="Tell us what you think..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />

                <button
                  onClick={handleFeedbackSubmit}
                  disabled={feedbackRating === 0}
                  className="w-full py-4 bg-primaryGold text-white rounded-full font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Feedback
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirm Delete Study Set Modal */}
      {activeModal === 'confirmDelete' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 glass-backdrop animate-fade-in" onClick={closeModal} />
          <div className="bg-white dark:bg-darkCard w-full max-w-sm rounded-[32px] shadow-modal border border-softBorder dark:border-darkBorder p-8 relative animate-scale-in z-10 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-white">Delete Study Set?</h2>
            <p className="text-steelGray dark:text-darkMuted text-sm mb-6">This action cannot be undone.</p>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 border border-softBorder dark:border-darkBorder rounded-full font-bold text-deepNavy dark:text-white hover:bg-iceGray dark:hover:bg-darkBorder transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudySet}
                className="flex-1 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset History Modal */}
      {activeModal === 'confirmReset' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 glass-backdrop animate-fade-in" onClick={closeModal} />
          <div className="bg-white dark:bg-darkCard w-full max-w-sm rounded-[32px] shadow-modal border border-softBorder dark:border-darkBorder p-8 relative animate-scale-in z-10 text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-white">Clear All History?</h2>
            <p className="text-steelGray dark:text-darkMuted text-sm mb-6">This will delete all {history.length} study sets. This cannot be undone.</p>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 border border-softBorder dark:border-darkBorder rounded-full font-bold text-deepNavy dark:text-white hover:bg-iceGray dark:hover:bg-darkBorder transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetHistory}
                className="flex-1 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Account Modal */}
      {activeModal === 'confirmDeleteAccount' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 glass-backdrop animate-fade-in" onClick={closeModal} />
          <div className="bg-white dark:bg-darkCard w-full max-w-sm rounded-[32px] shadow-modal border border-softBorder dark:border-darkBorder p-8 relative animate-scale-in z-10 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-white">Delete Account?</h2>
            <p className="text-steelGray dark:text-darkMuted text-sm mb-6">This will permanently delete your account and all data. This cannot be undone.</p>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 border border-softBorder dark:border-darkBorder rounded-full font-bold text-deepNavy dark:text-white hover:bg-iceGray dark:hover:bg-darkBorder transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {activeModal === 'upgrade' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 glass-backdrop animate-fade-in" onClick={closeModal} />
          <div className="bg-iceGray dark:bg-darkBg w-full max-w-3xl rounded-[32px] shadow-modal relative animate-scale-in z-10 overflow-hidden">
            <button onClick={closeModal} className="absolute top-6 right-6 text-steelGray hover:text-deepNavy dark:hover:text-white z-10">
              <X className="w-6 h-6" />
            </button>

            {/* Yearly/Monthly Toggle */}
            <div className="flex justify-center pt-8 pb-6">
              <div className="inline-flex bg-white dark:bg-darkCard rounded-full p-1.5 border border-softBorder dark:border-darkBorder shadow-sm">
                <button
                  onClick={() => setIsYearlyPlan(true)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${isYearlyPlan ? 'bg-deepNavy dark:bg-white text-white dark:text-deepNavy' : 'text-steelGray dark:text-darkMuted'}`}
                >
                  Yearly
                  <span className={`bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold transition-opacity duration-300 ${isYearlyPlan ? 'opacity-100' : 'opacity-50'}`}>Save 60%</span>
                </button>
                <button
                  onClick={() => setIsYearlyPlan(false)}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${!isYearlyPlan ? 'bg-deepNavy dark:bg-white text-white dark:text-deepNavy' : 'text-steelGray dark:text-darkMuted'}`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-darkCard mx-6 mb-6 rounded-[24px] border border-softBorder dark:border-darkBorder p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Side */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-deepNavy dark:bg-white rounded-2xl flex items-center justify-center">
                      <Mic className="w-8 h-8 text-white dark:text-deepNavy" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-extrabold text-deepNavy dark:text-white">Studymi</h3>
                        <Sparkles className="w-5 h-5 text-primaryGold" />
                      </div>
                      <p className="text-sm font-bold text-steelGray dark:text-darkMuted tracking-wider">UNLIMITED PLAN</p>
                    </div>
                  </div>

                  <p className="text-steelGray dark:text-darkMuted mb-8 leading-relaxed">
                    Get access to all features and benefits of the app. No limits, no restrictions.
                  </p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1 relative overflow-hidden">
                      <div className={`transition-all duration-500 ease-out ${isYearlyPlan ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-full absolute'}`}>
                        <span className="text-5xl font-extrabold text-deepNavy dark:text-white">$7.99</span>
                      </div>
                      <div className={`transition-all duration-500 ease-out ${!isYearlyPlan ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-full absolute'}`}>
                        <span className="text-5xl font-extrabold text-deepNavy dark:text-white">$18.99</span>
                      </div>
                      <span className="text-steelGray dark:text-darkMuted font-medium ml-1">/ per month</span>
                    </div>
                    {isYearlyPlan && (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2 animate-fade-in">
                        Billed as $95.88/year
                      </p>
                    )}
                  </div>

                  <button className="w-full flex items-center justify-center gap-3 bg-deepNavy dark:bg-white text-white dark:text-deepNavy font-bold py-4 px-8 rounded-2xl hover:opacity-90 transition-opacity">
                    Upgrade plan
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Right Side - Features */}
                <div className="flex-1">
                  <p className="text-steelGray dark:text-darkMuted font-medium mb-6">Everything in free plan plus</p>
                  <div className="space-y-4">
                    {[
                      "Unlimited note generations",
                      "Unlimited audio or phone calls",
                      "Unlimited podcasts and youtube videos",
                      "Unlimited quiz and flashcards",
                      "Support for 100+ languages",
                      "Best-in-class Transcription and Summarization",
                      "Customer support 24/7",
                      "Priority Access to new features",
                      "And more..."
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-deepNavy dark:text-white font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white/95 dark:bg-darkBg/95 backdrop-blur-md z-[150] flex flex-col items-center justify-center animate-fade-in transition-all">
          <div className="flex flex-col items-center text-center max-w-lg mx-6">

            {/* Animated Circle */}
            <div className="relative w-32 h-32 mb-10">
              <div className="absolute inset-0 rounded-full border-[6px] border-iceGray dark:border-darkBorder/50"></div>
              <svg className="absolute inset-0 transform -rotate-90 w-full h-full">
                <circle
                  cx="64" cy="64" r="61"
                  stroke={loadingStep === 6 ? "#22C55E" : "#F59E0B"}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={383}
                  strokeDashoffset={383 - (383 * loadingProgress) / 100}
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {loadingStep === 6 ? (
                  <CheckCircle2 className="w-12 h-12 text-green-500 animate-scale-in" />
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-deepNavy dark:text-white">{Math.round(loadingProgress)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Current Step Title */}
            <h3 className="text-2xl md:text-3xl font-extrabold mb-6 text-deepNavy dark:text-white min-h-[40px]">
              {loadingSteps[loadingStep]}
            </h3>

            {/* Step Progress List */}
            <div className="w-full max-w-sm bg-iceGray/50 dark:bg-darkBorder/30 rounded-2xl p-4 mb-6">
              <div className="space-y-2">
                {loadingSteps.slice(0, -1).map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-300 ${index < loadingStep
                      ? 'text-green-600 dark:text-green-400'
                      : index === loadingStep
                        ? 'text-deepNavy dark:text-white bg-white dark:bg-darkCard shadow-sm'
                        : 'text-steelGray/50 dark:text-darkMuted/50'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${index < loadingStep
                      ? 'bg-green-500 text-white'
                      : index === loadingStep
                        ? 'bg-primaryGold text-white'
                        : 'bg-softBorder dark:bg-darkBorder'
                      }`}>
                      {index < loadingStep ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : index === loadingStep ? (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      ) : (
                        <span className="text-[10px] font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fun Tip */}
            <div className="bg-white dark:bg-darkCard p-5 rounded-2xl border border-softBorder dark:border-darkBorder shadow-sm max-w-sm">
              <p className="text-steelGray dark:text-darkMuted text-sm font-medium leading-relaxed">
                💡 <span className="italic">"{currentTip}"</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
