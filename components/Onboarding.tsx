import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (data: { name: string; goal: string; vibe: string }) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [vibe, setVibe] = useState('');

  const handleNext = () => {
    if (step < 2) {
      setStep(s => s + 1);
    } else {
      onComplete({ name, goal, vibe });
    }
  };

  const goals = [
    { id: 'exam', label: 'Ace an exam', icon: '📚' },
    { id: 'skill', label: 'Learn a new skill', icon: '🚀' },
    { id: 'work', label: 'Work project', icon: '💼' },
    { id: 'curious', label: 'Just curious', icon: '💡' },
  ];

  const vibes = [
    { id: 'focused', label: 'Focused & Direct', desc: 'No fluff, just facts.' },
    { id: 'chill', label: 'Chill & Gen Z', desc: 'Vibey, simple explanations.' },
    { id: 'academic', label: 'Academic', desc: 'Formal and detailed.' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans text-center animate-fade-in selection:bg-primaryGold selection:text-white">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12 justify-center">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${i <= step ? 'bg-deepNavy' : 'bg-iceGray'}`} />
          ))}
        </div>

        <div className="min-h-[400px] flex flex-col justify-between animate-slide-up">
          {/* Step 0: Name */}
          {step === 0 && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-accentYellow mx-auto mb-8 flex items-center justify-center text-2xl font-bold text-deepNavy">👋</div>
              <h2 className="text-4xl font-extrabold text-deepNavy mb-4">what should we call you?</h2>
              <p className="text-steelGray mb-12 text-lg">we want to keep things friendly.</p>
              
              <input 
                autoFocus
                type="text" 
                className="w-full text-center text-3xl border-b-2 border-softBorder focus:border-deepNavy outline-none py-4 bg-transparent text-deepNavy placeholder:text-steelGray/20 transition-colors font-bold"
                placeholder="your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleNext()}
              />
            </div>
          )}

          {/* Step 1: Goal */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-4xl font-extrabold text-deepNavy mb-4">what brings you here?</h2>
              <p className="text-steelGray mb-10 text-lg">helping us customize your experience.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`p-6 rounded-[24px] border-2 transition-all duration-200 flex flex-col items-center gap-4 hover:scale-[1.02] ${goal === g.id ? 'border-primaryGold bg-primaryGold/5' : 'border-softBorder hover:border-primaryGold/50'}`}
                  >
                    <span className="text-4xl">{g.icon}</span>
                    <span className={`font-bold ${goal === g.id ? 'text-primaryGold' : 'text-deepNavy'}`}>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Vibe */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-4xl font-extrabold text-deepNavy mb-4">pick your vibe</h2>
              <p className="text-steelGray mb-10 text-lg">how do you want studywithai to talk to you?</p>
              
              <div className="flex flex-col gap-4">
                {vibes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVibe(v.id)}
                    className={`p-6 rounded-[24px] border-2 transition-all duration-200 flex items-center justify-between text-left hover:scale-[1.01] ${vibe === v.id ? 'border-primaryGold bg-primaryGold/5' : 'border-softBorder hover:border-primaryGold/50'}`}
                  >
                    <div>
                      <h3 className={`font-bold text-lg ${vibe === v.id ? 'text-primaryGold' : 'text-deepNavy'}`}>{v.label}</h3>
                      <p className="text-steelGray text-sm">{v.desc}</p>
                    </div>
                    {vibe === v.id && (
                      <div className="w-8 h-8 rounded-full bg-primaryGold flex items-center justify-center text-white animate-scale-in">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12">
            <button 
              onClick={handleNext}
              disabled={(step === 0 && !name.trim()) || (step === 1 && !goal) || (step === 2 && !vibe)}
              className="bg-deepNavy text-white px-10 py-5 rounded-full font-bold w-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-xl shadow-deepNavy/20"
            >
              {step === 2 ? "finish setup" : "continue"} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};