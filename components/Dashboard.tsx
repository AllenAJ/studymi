import React, { useState, useRef, useEffect } from 'react';
import { Mic, FileText, Sparkles, Clock, ThumbsUp, Home, ArrowRight, X, Star, Settings, Upload, Youtube, Moon, Sun, Crown, Info, Trash2, ToggleLeft, ToggleRight, Menu, Flower, BarChart2, Calendar, CheckCircle2 } from 'lucide-react';
import { InputType, StudySet } from '../types';

interface DashboardProps {
  user: string;
  onProcess: (content: string, type: InputType, mimeType?: string, genZMode?: boolean) => void;
  isProcessing: boolean;
  onLogout: () => void;
  history: StudySet[];
  onSelectHistory: (set: StudySet) => void;
  initialGenZMode?: boolean;
}

// Mood Radar Chart Component
const MoodRadarChart = () => {
  const size = 300;
  const center = size / 2;
  const radius = 90;
  const levels = [0.2, 0.4, 0.6, 0.8, 1];
  const emotions = ['happiness', 'surprise', 'sadness', 'anger', 'fear', 'disgust'];
  // Dummy data
  const data = [0.8, 0.6, 0.3, 0.2, 0.4, 0.2]; 

  const angleSlice = (Math.PI * 2) / emotions.length;

  const getCoordinates = (r: number, i: number) => {
    const angle = i * angleSlice - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const points = data.map((val, i) => {
    const coords = getCoordinates(val * radius, i);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div className="flex justify-center items-center py-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Web */}
        {levels.map((level, i) => (
          <path
            key={i}
            d={emotions.map((_, j) => {
              const coords = getCoordinates(level * radius, j);
              return `${j === 0 ? 'M' : 'L'}${coords.x},${coords.y}`;
            }).join(' ') + 'Z'}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.2"
            className="text-softBorder dark:text-darkBorder"
          />
        ))}

        {/* Axes */}
        {emotions.map((emotion, i) => {
          const coords = getCoordinates(radius, i);
          const labelCoords = getCoordinates(radius + 25, i);
          return (
            <g key={i}>
              <line
                x1={center}
                y1={center}
                x2={coords.x}
                y2={coords.y}
                stroke="currentColor"
                strokeOpacity="0.2"
                className="text-softBorder dark:text-darkBorder"
              />
              <text
                x={labelCoords.x}
                y={labelCoords.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-bold fill-steelGray dark:fill-darkMuted uppercase tracking-wider"
              >
                {emotion}
              </text>
            </g>
          );
        })}

        {/* Data Blob */}
        <path
          d={`M${points}Z`}
          fill="rgba(245, 158, 11, 0.15)" // Yellow/Gold fill
          stroke="#F59E0B" // Gold stroke
          strokeWidth="2"
          className="dark:stroke-primaryGold dark:fill-primaryGold/20"
        />
        
        {/* Center Dot */}
        <circle cx={center} cy={center} r="4" fill="#F59E0B" className="dark:fill-primaryGold" />
      </svg>
    </div>
  );
};

// Activity Bar Chart Component
const ActivityChart = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const values = [30, 50, 20, 70, 45, 60, 35]; // percent
  
  return (
    <div className="flex items-end justify-between h-48 w-full gap-2 pt-4">
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
           <div className="relative w-full max-w-[24px] h-full bg-iceGray dark:bg-darkBorder rounded-full overflow-hidden">
             <div 
               className="absolute bottom-0 left-0 right-0 bg-primaryGold rounded-full transition-all duration-500 group-hover:bg-deepNavy dark:group-hover:bg-white"
               style={{ height: `${values[i]}%` }}
             ></div>
           </div>
           <span className="text-xs font-medium text-steelGray dark:text-darkMuted group-hover:text-deepNavy dark:group-hover:text-white transition-colors">{day}</span>
        </div>
      ))}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onProcess, isProcessing, onLogout, history, onSelectHistory, initialGenZMode = false }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'insights' | 'settings' | 'history'>('home');
  const [activeModal, setActiveModal] = useState<'voice' | 'text' | 'upload' | 'link' | 'feedback' | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGenZMode, setIsGenZMode] = useState(initialGenZMode);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Loading State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  
  // Settings State
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

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
      
      // Simulate progress
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) return 95;
          
          // Random increments to feel natural
          const increment = Math.random() * 2;
          const next = prev + increment;
          
          // Update steps based on progress
          if (next > 20 && next < 50) setLoadingStep(1);
          if (next > 50 && next < 80) setLoadingStep(2);
          if (next > 80) setLoadingStep(3);
          
          return next;
        });
      }, 100);
    } else {
      setLoadingProgress(100);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const loadingSteps = [
    "Analyzing content...",
    "Structuring key concepts...",
    "Drafting flashcards...",
    "Finalizing quiz..."
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
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const NavigationContent = () => {
    return (
      <div className="flex flex-col h-full">
         <div className="flex justify-between items-center px-6 mb-8 lg:justify-center">
            {/* Logo */}
            <div className="w-10 h-10 rounded-full bg-accentYellow shadow-lg flex items-center justify-center">
            </div>
            {/* Close button for mobile */}
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
           {/* Mobile Menu Trigger & Logo */}
           <div className="flex items-center gap-4 lg:hidden">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-deepNavy dark:text-white hover:bg-white/50 dark:hover:bg-darkCard rounded-full transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-accentYellow shadow-sm"></div>
                 <span className="font-bold text-lg dark:text-white tracking-tight">studywithai</span>
              </div>
           </div>

           {/* Desktop Spacer to push controls right */}
           <div className="hidden lg:block"></div>

           {/* Right Actions */}
           <div className="flex items-center gap-3 md:gap-4 ml-auto">
             <button className="hidden md:flex items-center gap-2 bg-deepNavy dark:bg-white text-white dark:text-deepNavy px-5 py-2.5 rounded-full text-xs font-bold hover:scale-105 transition-transform shadow-lg shadow-deepNavy/20 dark:shadow-none">
               <Crown className="w-3 h-3 text-accentYellow dark:text-deepNavy" />
               upgrade plan
             </button>

             <div className="h-6 w-px bg-softBorder dark:bg-darkBorder hidden md:block mx-1"></div>

             {/* Dark Mode Toggle */}
             <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 rounded-full bg-white dark:bg-darkCard border border-softBorder dark:border-darkBorder flex items-center justify-center shadow-sm hover:scale-105 transition-transform text-steelGray dark:text-white"
            >
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Gen Z Toggle */}
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
        </div>

        {activeTab === 'home' && (
          <div className="w-full max-w-5xl mx-auto animate-slide-up pb-10">
            <div className="mb-12 hidden lg:block">
              <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-deepNavy dark:text-white">what's up, {user}?</h1>
            </div>

            {/* Top Section: Inputs */}
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

            {/* Recent Vibes */}
            <div className="w-full">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                <Clock className="w-5 h-5 text-primaryGold" /> recent vibes
              </h2>
              {history.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {history.slice(0, 5).map((set) => (
                    <button 
                      key={set.id}
                      onClick={() => onSelectHistory(set)}
                      className="w-full bg-white dark:bg-darkCard p-5 rounded-[20px] border border-softBorder dark:border-darkBorder hover:border-primaryGold dark:hover:border-white/20 transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
                    >
                       <div className="flex items-center gap-4">
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
                       </div>
                       <ArrowRight className="w-4 h-4 text-steelGray group-hover:text-primaryGold transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                 <div className="text-center py-12 bg-white dark:bg-darkCard rounded-[24px] border border-softBorder dark:border-darkBorder border-dashed">
                   <p className="text-steelGray dark:text-darkMuted text-sm">No recent study sessions found.</p>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* [Insights, Settings, History Tabs Omitted for Brevity - Keeping Existing Implementation] */}
        {activeTab === 'insights' && (
          <div className="w-full max-w-5xl mx-auto animate-slide-up pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                 <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-deepNavy dark:text-white">weekly insights</h1>
                 <p className="text-steelGray dark:text-darkMuted font-medium">a check-in on your thoughts, patterns, and progress</p>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-darkCard px-4 py-2 rounded-full border border-softBorder dark:border-darkBorder shadow-sm">
                <Calendar className="w-4 h-4 text-primaryGold" />
                <span className="text-sm font-bold text-deepNavy dark:text-white">Dec 1 - Dec 7</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Mood Card */}
              <div className="md:col-span-2 bg-white dark:bg-darkCard rounded-[32px] p-8 border border-softBorder dark:border-darkBorder shadow-soft">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-full bg-iceGray dark:bg-darkBorder flex items-center justify-center">
                     <Flower className="w-5 h-5 text-primaryGold" />
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-deepNavy dark:text-white">emotional map</h3>
                     <p className="text-xs text-steelGray dark:text-darkMuted">your learning mood patterns</p>
                   </div>
                 </div>
                 <div className="py-2">
                   <MoodRadarChart />
                 </div>
              </div>

              {/* Stats Column */}
              <div className="flex flex-col gap-6">
                 {/* Convos Stat */}
                 <div className="bg-white dark:bg-darkCard rounded-[32px] p-8 border border-softBorder dark:border-darkBorder shadow-soft flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-2xl">
                          <Clock className="w-6 h-6 text-green-500" />
                       </div>
                       <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <div>
                       <p className="text-3xl font-extrabold text-deepNavy dark:text-white mb-1">2.4h</p>
                       <p className="text-sm text-steelGray dark:text-darkMuted font-medium">study time</p>
                    </div>
                 </div>

                 {/* Messages Stat */}
                 <div className="bg-white dark:bg-darkCard rounded-[32px] p-8 border border-softBorder dark:border-darkBorder shadow-soft flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-2xl">
                          <Mic className="w-6 h-6 text-purple-500" />
                       </div>
                    </div>
                    <div>
                       <p className="text-3xl font-extrabold text-deepNavy dark:text-white mb-1">14</p>
                       <p className="text-sm text-steelGray dark:text-darkMuted font-medium">convos completed</p>
                    </div>
                 </div>
              </div>

              {/* Activity Chart Card */}
              <div className="md:col-span-3 bg-white dark:bg-darkCard rounded-[32px] p-8 border border-softBorder dark:border-darkBorder shadow-soft mt-2">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-iceGray dark:bg-darkBorder flex items-center justify-center">
                         <BarChart2 className="w-5 h-5 text-deepNavy dark:text-white" />
                       </div>
                       <div>
                         <h3 className="font-bold text-lg text-deepNavy dark:text-white">study activity</h3>
                         <p className="text-xs text-steelGray dark:text-darkMuted">consistency is key</p>
                       </div>
                    </div>
                 </div>
                 <ActivityChart />
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto animate-slide-up mt-6">
             <div className="bg-white dark:bg-darkCard rounded-[40px] p-8 md:p-12 border border-softBorder dark:border-darkBorder shadow-soft">
                 
                 {/* Profile Header */}
                 <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primaryGold to-deepNavy p-0.5">
                       <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user}`} alt="avatar" className="w-full h-full rounded-full bg-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-deepNavy dark:text-white">{user || 'Guest User'}</h2>
                      <p className="text-sm text-steelGray dark:text-darkMuted">Student Plan</p>
                    </div>
                 </div>

                 {/* Privacy Settings */}
                 <div className="mb-12">
                   <h3 className="text-lg font-bold text-deepNavy dark:text-white mb-2">Privacy settings</h3>
                   <p className="text-sm text-steelGray dark:text-darkMuted mb-6">Manage your cookie and tracking preferences</p>
                   
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                           <ToggleRight className="w-8 h-8 text-steelGray opacity-50 cursor-not-allowed" />
                           <div>
                             <p className="font-bold text-deepNavy dark:text-white text-sm">Necessary cookies</p>
                             <p className="text-xs text-steelGray dark:text-darkMuted">Required for the website to function properly.</p>
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
                             <p className="font-bold text-deepNavy dark:text-white text-sm">Analytics cookies</p>
                             <p className="text-xs text-steelGray dark:text-darkMuted">Help us understand how visitors interact with our website.</p>
                           </div>
                         </div>
                      </div>
                   </div>
                 </div>

                 {/* Usage Analytics */}
                 <div className="mb-12">
                    <h3 className="text-lg font-bold text-deepNavy dark:text-white mb-6">Usage analytics</h3>
                    <div className="bg-iceGray dark:bg-darkBg rounded-[24px] p-6">
                       <div className="flex justify-between items-center mb-6">
                          <span className="bg-deepNavy dark:bg-white dark:text-deepNavy text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Free Plan</span>
                          <span className="text-sm font-bold text-deepNavy dark:text-white">0% used</span>
                       </div>
                       
                       <div className="flex justify-between items-end mb-2">
                         <span className="text-xs font-bold text-steelGray dark:text-darkMuted uppercase tracking-wide">Text usage</span>
                       </div>
                       <div className="h-2 w-full bg-white dark:bg-darkBorder rounded-full overflow-hidden mb-6">
                         <div className="h-full w-0 bg-primaryGold rounded-full" />
                       </div>

                       <button className="w-full bg-accentYellow text-deepNavy py-3 rounded-full font-bold text-sm hover:scale-[1.01] transition-transform shadow-sm">
                         Upgrade to Pro
                       </button>
                    </div>
                 </div>

                 {/* Danger Zone */}
                 <div>
                    <h3 className="text-lg font-bold text-deepNavy dark:text-white mb-6">Danger zone</h3>
                    <div className="flex flex-col gap-4">
                        <button className="w-full text-left px-6 py-4 rounded-xl border border-softBorder dark:border-darkBorder font-medium text-deepNavy dark:text-white text-sm hover:bg-iceGray dark:hover:bg-darkBorder/50 transition-colors flex justify-between items-center">
                           Reset chat history
                           <Info className="w-4 h-4 text-steelGray" />
                        </button>

                        <button className="w-full text-left px-6 py-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex justify-between items-center">
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
              <h2 className="text-3xl font-bold mb-8 dark:text-white px-4">full history</h2>
              <div className="grid grid-cols-1 gap-4">
                  {history.map((set) => (
                    <button 
                      key={set.id}
                      onClick={() => onSelectHistory(set)}
                      className="w-full bg-white dark:bg-darkCard p-6 rounded-[24px] border border-softBorder dark:border-darkBorder hover:border-primaryGold dark:hover:border-white/20 transition-all flex items-center justify-between group"
                    >
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-iceGray dark:bg-darkBorder flex items-center justify-center text-deepNavy dark:text-white">
                             {set.type === 'audio' ? <Mic className="w-5 h-5" /> : 
                            set.type === 'youtube' ? <Youtube className="w-5 h-5" /> :
                            set.type === 'pdf' ? <Upload className="w-5 h-5" /> :
                            <FileText className="w-5 h-5" />}
                         </div>
                         <div className="text-left">
                           <h3 className="font-bold text-lg dark:text-white">{set.title}</h3>
                           <p className="text-xs text-steelGray dark:text-darkMuted">{new Date(set.createdAt).toLocaleDateString()}</p>
                         </div>
                       </div>
                    </button>
                  ))}
                  {history.length === 0 && <p className="text-center text-steelGray dark:text-darkMuted">nothing here yet.</p>}
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
          <div className="absolute inset-0 glass-backdrop animate-fade-in" onClick={() => setActiveModal(null)} />
          <div className="bg-white dark:bg-darkCard w-full max-w-md rounded-[32px] shadow-modal border border-softBorder dark:border-darkBorder p-8 relative animate-scale-in z-10 text-center">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-iceGray dark:hover:bg-darkBorder transition-colors">
              <X className="w-6 h-6 text-steelGray dark:text-darkMuted" />
            </button>
            
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Thoughts?</h2>
            <p className="text-steelGray dark:text-darkMuted text-sm mb-8">Help us make studywithai better for you.</p>

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
              onClick={() => { setActiveModal(null); setFeedbackText(''); setFeedbackRating(0); }}
              className="w-full py-4 bg-primaryGold text-white rounded-full font-bold hover:opacity-90 transition-all shadow-lg"
            >
              Send Love
            </button>
          </div>
        </div>
      )}

      {/* Advanced Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white/95 dark:bg-darkBg/95 backdrop-blur-md z-[150] flex flex-col items-center justify-center animate-fade-in transition-all">
          <div className="flex flex-col items-center text-center max-w-md mx-6">
            
            {/* Animated Logo/Spinner */}
            <div className="relative w-28 h-28 mb-12">
              <div className="absolute inset-0 rounded-full border-[6px] border-iceGray dark:border-darkBorder/50"></div>
              <svg className="absolute inset-0 transform -rotate-90 w-full h-full">
                <circle 
                   cx="56" cy="56" r="53" 
                   stroke="#F59E0B" 
                   strokeWidth="6" 
                   fill="none" 
                   strokeLinecap="round"
                   strokeDasharray={333}
                   strokeDashoffset={333 - (333 * loadingProgress) / 100}
                   className="transition-all duration-300 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-4 h-4 rounded-full bg-accentYellow animate-pulse-slow"></div>
              </div>
            </div>
            
            {/* Steps Visualizer */}
            <div className="w-full flex justify-between mb-8 px-4 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-softBorder dark:bg-darkBorder -z-10"></div>
              {loadingSteps.map((_, index) => (
                <div key={index} className={`w-4 h-4 rounded-full border-2 transition-colors duration-500 ${index <= loadingStep ? 'bg-primaryGold border-primaryGold' : 'bg-white dark:bg-darkCard border-softBorder dark:border-darkBorder'}`}></div>
              ))}
            </div>

            <h3 className="text-3xl font-extrabold mb-4 text-deepNavy dark:text-white min-h-[40px] animate-slide-up">
              {loadingSteps[loadingStep]}
            </h3>
            
            {/* Random Tip */}
            <div className="bg-iceGray/50 dark:bg-darkBorder/30 p-6 rounded-2xl border border-softBorder/50 dark:border-darkBorder/50 animate-fade-in mt-6">
              <p className="text-steelGray dark:text-darkMuted text-sm font-medium leading-relaxed italic">
                 "{currentTip}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};