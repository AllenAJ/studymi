import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Instagram, Youtube, Facebook, Search, BookOpen, GraduationCap, Code, Stethoscope, Briefcase, Brain, Languages, Sparkles, FileText, BookMarked, Play, Globe, StickyNote, TrendingUp, Target, Zap, Lightbulb, Trophy, PenTool, Users, Twitter } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  name: string;
  gender: string;
  ageRange: string;
  referralSource: string;
  studyAreas: string[];
  goal: string;
  learningSources: string[];
  firstTopic: string;
  genZMode: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const posthog = usePostHog();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    gender: '',
    ageRange: '',
    referralSource: '',
    studyAreas: [],
    goal: '',
    learningSources: [],
    firstTopic: '',
    genZMode: false,
  });

  const totalSteps = 11;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
    }
  };

  const toggleArrayItem = (field: 'studyAreas' | 'learningSources', item: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true; // Welcome
      case 1: return data.name.trim().length > 0;
      case 2: return data.gender.length > 0;
      case 3: return data.ageRange.length > 0;
      case 4: return data.referralSource.length > 0;
      case 5: return data.studyAreas.length > 0;
      case 6: return data.goal.length > 0;
      case 7: return data.learningSources.length > 0;
      case 8: return true; // Info screen
      case 9: return true; // Optional input
      case 10: return true; // Final
      default: return true;
    }
  };

  const genderOptions = [
    { id: 'female', label: 'Female', icon: '👩' },
    { id: 'male', label: 'Male', icon: '👨' },
    { id: 'non-binary', label: 'Non-binary', icon: '🧑' },
    { id: 'other', label: 'Other', icon: '✨' },
  ];

  const ageOptions = [
    { id: 'under-18', label: 'Under 18' },
    { id: '18-24', label: '18-24' },
    { id: '25-34', label: '25-34' },
    { id: '35+', label: '35+' },
    { id: 'prefer-not', label: 'Prefer not to say' },
  ];

  const referralOptions = [
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { id: 'tiktok', label: 'TikTok', icon: Play, color: 'bg-black' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'bg-red-500' },
    { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'bg-black' },
    { id: 'google', label: 'Google', icon: Search, color: 'bg-blue-500' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { id: 'friend', label: 'Friend / Family', icon: Users, color: 'bg-green-500' },
    { id: 'other', label: 'Other', icon: Sparkles, color: 'bg-gray-500' },
  ];

  const studyOptions = [
    { id: 'school', label: 'School subjects', icon: BookOpen },
    { id: 'college', label: 'College / Exams', icon: GraduationCap },
    { id: 'coding', label: 'Coding', icon: Code },
    { id: 'medicine', label: 'Medicine / Nursing', icon: Stethoscope },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'self-improvement', label: 'Self-improvement', icon: Brain },
    { id: 'language', label: 'New language', icon: Languages },
    { id: 'other', label: 'Other', icon: Sparkles },
  ];

  const goalOptions = [
    { id: 'remember', label: 'Remember what I learn', icon: Brain },
    { id: 'exams', label: 'Score higher in exams', icon: Trophy },
    { id: 'faster', label: 'Learn faster', icon: Zap },
    { id: 'understand', label: 'Understand deeply', icon: Lightbulb },
    { id: 'confidence', label: 'Build confidence in a subject', icon: Target },
    { id: 'notes', label: 'Take useful notes', icon: PenTool },
  ];

  const sourceOptions = [
    { id: 'youtube', label: 'YouTube', icon: Youtube },
    { id: 'pdfs', label: 'PDFs', icon: FileText },
    { id: 'textbooks', label: 'Textbooks', icon: BookMarked },
    { id: 'courses', label: 'Courses', icon: Play },
    { id: 'wikipedia', label: 'Wikipedia / Google', icon: Globe },
    { id: 'notes', label: 'School notes', icon: StickyNote },
    { id: 'other', label: 'Other', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-deepNavy selection:bg-primaryGold selection:text-white">
      {/* Header with progress */}
      <div className="w-full max-w-2xl mx-auto px-6 pt-8">
        <div className="flex items-center gap-4">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-iceGray rounded-none transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-deepNavy" />
            </button>
          )}
          <div className="flex-1 h-1.5 bg-iceGray rounded-none overflow-hidden">
            <div
              className="h-full bg-deepNavy rounded-none transition-all duration-500"
              style={{ width: `${((step + 1) / totalSteps) * 100}% ` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-lg">

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center animate-slide-up">
              <div className="w-16 h-16 rounded-none bg-accentYellow mx-auto mb-10 shadow-lg shadow-yellow-200/50"></div>

              <h2 className="text-2xl font-bold text-deepNavy mb-6">hi friend</h2>

              <p className="text-lg text-deepNavy mb-4">we created studymi because learning can be... a lot</p>
              <p className="text-lg text-steelGray mb-4">sometimes you just need a smarter way to study</p>
              <p className="text-lg text-steelGray mb-4">
                whether you're cramming for exams,<br />
                mastering a new skill,<br />
                or just curious about the world
              </p>

              <p className="text-xl font-bold text-deepNavy mt-8 mb-4">we're here for you</p>

              <p className="text-steelGray mt-8">love,</p>
              <p className="text-2xl font-serif italic text-deepNavy">allen joseph</p>
            </div>
          )}

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="text-center animate-slide-up">
              <div className="w-12 h-12 rounded-none bg-accentYellow mx-auto mb-8 flex items-center justify-center text-2xl">👋</div>
              <h2 className="text-3xl font-extrabold text-deepNavy mb-4">what should we call you?</h2>
              <p className="text-steelGray mb-10">let's make this personal</p>

              <input
                autoFocus
                type="text"
                className="w-full text-center text-2xl border-b-2 border-softBorder focus:border-deepNavy outline-none py-4 bg-transparent text-deepNavy placeholder:text-steelGray/30 transition-colors font-bold"
                placeholder="your name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
              />
            </div>
          )}

          {/* Step 2: Gender */}
          {step === 2 && (
            <div className="text-center animate-slide-up">
              <h2 className="text-3xl font-extrabold text-deepNavy mb-4">how do you identify?</h2>
              <p className="text-steelGray mb-10">helps us personalize your experience</p>

              <div className="grid grid-cols-2 gap-4">
                {genderOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setData({ ...data, gender: option.id })}
                    className={`p-6 rounded-none border-2 transition-all duration-200 flex flex-col items-center gap-3 hover:scale-[1.02] ${data.gender === option.id
                      ? 'border-primaryGold bg-primaryGold/5'
                      : 'border-softBorder hover:border-primaryGold/50'
                      } `}
                  >
                    <span className="text-3xl">{option.icon}</span>
                    <span className={`font-bold ${data.gender === option.id ? 'text-primaryGold' : 'text-deepNavy'} `}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Age */}
          {step === 3 && (
            <div className="text-center animate-slide-up">
              <h2 className="text-3xl font-extrabold text-deepNavy mb-4">how many years young are you?</h2>
              <p className="text-steelGray mb-10">we tailor content to your stage of life</p>

              <div className="flex flex-col gap-3">
                {ageOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setData({ ...data, ageRange: option.id })}
                    className={`p-5 rounded-none border-2 transition-all duration-200 flex items-center justify-between hover:scale-[1.01] ${data.ageRange === option.id
                      ? 'border-primaryGold bg-primaryGold/5'
                      : 'border-softBorder hover:border-primaryGold/50'
                      } `}
                  >
                    <span className={`font-bold text-lg ${data.ageRange === option.id ? 'text-primaryGold' : 'text-deepNavy'} `}>
                      {option.label}
                    </span>
                    {data.ageRange === option.id && (
                      <div className="w-6 h-6 rounded-none bg-primaryGold flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Referral */}
          {step === 4 && (
            <div className="text-center animate-slide-up">
              <h2 className="text-3xl font-extrabold text-deepNavy mb-4">how did you hear about studymi?</h2>
              <p className="text-steelGray mb-10">helps us reach more learners like you</p>

              <div className="grid grid-cols-2 gap-3">
                {referralOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setData({ ...data, referralSource: option.id })}
                    className={`p-5 rounded-none border-2 transition-all duration-200 flex items-center gap-4 hover:scale-[1.02] ${data.referralSource === option.id
                      ? 'border-primaryGold bg-primaryGold/5'
                      : 'border-softBorder hover:border-primaryGold/50'
                      } `}
                  >
                    <div className={`w-10 h-10 rounded-none ${option.color} flex items-center justify-center text-white`}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <span className={`font-bold text-sm ${data.referralSource === option.id ? 'text-primaryGold' : 'text-deepNavy'} `}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Study Areas (Multi-select) */}
          {step === 5 && (
            <div className="text-center animate-slide-up">
              <h2 className="text-3xl font-extrabold text-deepNavy mb-4">what do you study?</h2>
              <p className="text-steelGray mb-10">select all that apply</p>

              <div className="grid grid-cols-2 gap-3">
                {studyOptions.map((option) => {
                  const isSelected = data.studyAreas.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleArrayItem('studyAreas', option.id)}
                      className={`p-5 rounded-none border-2 transition-all duration-200 flex items-center gap-4 hover:scale-[1.02] ${isSelected
                        ? 'border-primaryGold bg-primaryGold/5'
                        : 'border-softBorder hover:border-primaryGold/50'
                        } `}
                    >
                      <div className={`w-10 h-10 rounded-none ${isSelected ? 'bg-primaryGold text-white' : 'bg-iceGray text-deepNavy'} flex items-center justify-center transition-colors`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <span className={`font-bold text-sm text-left ${isSelected ? 'text-primaryGold' : 'text-deepNavy'} `}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 6: Goal (Single select) */}
          {step === 6 && (
            <div className="text-center animate-slide-up">
              <h2 className="text-3xl font-extrabold text-deepNavy mb-4">what's your current goal?</h2>
              <p className="text-steelGray mb-10">we'll optimize your experience around this</p>

              <div className="flex flex-col gap-3">
                {goalOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setData({ ...data, goal: option.id })}
                    className={`p - 5 rounded - none border - 2 transition - all duration - 200 flex items - center gap - 4 hover: scale - [1.01] ${data.goal === option.id
                      ? 'border-primaryGold bg-primaryGold/5'
                      : 'border-softBorder hover:border-primaryGold/50'
                      } `}
                  >
                    <div className={`w - 10 h - 10 rounded - none ${data.goal === option.id ? 'bg-primaryGold text-white' : 'bg-iceGray text-deepNavy'} flex items - center justify - center transition - colors`}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <span className={`font - bold ${data.goal === option.id ? 'text-primaryGold' : 'text-deepNavy'} `}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Learning Sources (Multi-select) */}
          {step === 7 && (
            <div className="text-center animate-slide-up">
              <h2 className="text-3xl font-extrabold text-deepNavy mb-4">where do you get your learning material?</h2>
              <p className="text-steelGray mb-10">select all that apply</p>

              <div className="grid grid-cols-2 gap-3">
                {sourceOptions.map((option) => {
                  const isSelected = data.learningSources.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleArrayItem('learningSources', option.id)}
                      className={`p-5 rounded-none border-2 transition-all duration-200 flex items-center gap-4 hover:scale-[1.02] ${isSelected
                        ? 'border-primaryGold bg-primaryGold/5'
                        : 'border-softBorder hover:border-primaryGold/50'
                        } `}
                    >
                      <div className={`w-10 h-10 rounded-none ${isSelected ? 'bg-primaryGold text-white' : 'bg-iceGray text-deepNavy'} flex items-center justify-center transition-colors`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <span className={`font-bold text-sm text-left ${isSelected ? 'text-primaryGold' : 'text-deepNavy'} `}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 8: How is this different */}
          {step === 8 && (
            <div className="text-center animate-slide-up">
              <div className="w-24 h-24 mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-iceGray rounded-none rotate-6"></div>
                <div className="absolute inset-0 bg-softBorder rounded-none -rotate-3"></div>
                <div className="absolute inset-0 bg-primaryGold rounded-none flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-extrabold text-deepNavy mb-8">how is studymi different from ChatGPT?</h2>

              <div className="text-left space-y-4 bg-iceGray/50 p-8 rounded-none">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-none bg-primaryGold mt-2 flex-shrink-0"></div>
                  <p className="text-deepNavy font-medium">Built specifically for <span className="font-bold">studying</span> and <span className="font-bold">long-term memory</span></p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-none bg-primaryGold mt-2 flex-shrink-0"></div>
                  <p className="text-deepNavy font-medium">Auto-generates <span className="font-bold">explanations, quizzes & flashcards</span></p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-none bg-primaryGold mt-2 flex-shrink-0"></div>
                  <p className="text-deepNavy font-medium">Tracks what you <span className="font-bold">forget</span> and reminds you <span className="font-bold">when to revise</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Step 9: First Topic */}
          {step === 9 && (
            <div className="text-center animate-slide-up">
              <div className="w-12 h-12 rounded-none bg-accentYellow mx-auto mb-8 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-deepNavy" />
              </div>
              <h2 className="text-3xl font-extrabold text-deepNavy mb-4">what do you want to learn first?</h2>
              <p className="text-steelGray mb-10">optional — you can skip this</p>

              <input
                type="text"
                className="w-full text-center text-xl border-b-2 border-softBorder focus:border-deepNavy outline-none py-4 bg-transparent text-deepNavy placeholder:text-steelGray/40 transition-colors"
                placeholder="e.g. Organic chemistry, Python, Macroeconomics..."
                value={data.firstTopic}
                onChange={(e) => setData({ ...data, firstTopic: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>
          )}

          {/* Step 10: Trust Screen + Final Setup */}
          {step === 10 && (
            <div className="text-center animate-slide-up">
              {/* Stats visualization */}
              <div className="w-full h-32 mb-8 relative">
                <div className="absolute inset-0 flex items-end justify-center gap-2 px-8">
                  {[20, 35, 50, 70, 95].map((height, i) => (
                    <div key={i} className="flex-1 bg-iceGray rounded-none relative overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primaryGold rounded-none transition-all duration-1000"
                        style={{ height: `${height}% `, transitionDelay: `${i * 100} ms` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <TrendingUp className="absolute bottom-4 right-4 w-8 h-8 text-primaryGold" />
              </div>

              <h2 className="text-2xl font-extrabold text-deepNavy mb-4">you're in good hands</h2>

              <div className="bg-iceGray/50 p-6 rounded-none mb-8">
                <p className="text-4xl font-extrabold text-primaryGold mb-2">3.4×</p>
                <p className="text-deepNavy font-medium">
                  Students who used <span className="font-bold">spaced learning + smart quizzes</span> improved recall in just 4 weeks
                </p>
              </div>

              <p className="text-steelGray text-sm mb-8">
                Powered by the same methods used by top performers worldwide.
              </p>

              {/* Gen Z Mode Toggle */}
              <div className="bg-white border-2 border-softBorder rounded-none p-6 flex items-center justify-between">
                <div className="text-left">
                  <p className="font-bold text-deepNavy">Gen Z Mode</p>
                  <p className="text-sm text-steelGray">Chill vibes, simple explanations ✨</p>
                </div>
                <button
                  onClick={() => setData({ ...data, genZMode: !data.genZMode })}
                  className={`w-14 h-8 rounded-none transition-colors relative ${data.genZMode ? 'bg-primaryGold' : 'bg-softBorder'} `}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-none shadow-md transition-transform duration-300 ${data.genZMode ? 'left-7' : 'left-1'} `} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer with CTA */}
      <div className="w-full max-w-lg mx-auto px-6 pb-10">
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full bg-deepNavy text-white py-5 rounded-none font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-deepNavy/20"
        >
          {step === 0 ? 'start' : step === 10 ? 'finish setup' : 'continue'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
