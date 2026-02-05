import React, { useState } from 'react';
import { ArrowRight, Mic, BookOpen, Sparkles, Languages, Check, ChevronRight } from 'lucide-react';

interface NativeLandingProps {
    onStart: () => void;
}

const ONBOARDING_STEPS = [
    {
        id: 1,
        question: "Never miss a word.",
        subtext: "Record and transcribe your lectures in real-time. summarized instantly so you can actually pay attention.",
        icon: <Mic className="w-16 h-16 text-primaryGold" />,
        color: "bg-primaryGold/10",
        image: "/vid/compressed/transcibe.mp4"
    },
    {
        id: 2,
        question: "Want to generate AI Summaries & Notes?",
        subtext: "The AI note taking app that turns 'huh?' into 'ohhh, got it.' convert PDFs, videos, and audio into structured study material.",
        icon: <Sparkles className="w-16 h-16 text-accentYellow" />,
        color: "bg-accentYellow/10",
        image: "/vid/compressed/insightshistory.mp4"
    },
    {
        id: 3,
        question: "Vibe with Gen Z Mode?",
        subtext: "Learn in the language you actually speak. Because studying doesn't have to be mid.",
        icon: <Languages className="w-16 h-16 text-deepNavy" />,
        color: "bg-deepNavy/10",
        image: "/vid/compressed/genz.mp4"
    },
    {
        id: 4,
        question: "Ready to crush your exams?",
        subtext: "Anki-style flashcards, visual mindmaps, and practice quizzes generated in one tap.",
        icon: <BookOpen className="w-16 h-16 text-accentYellow" />,
        color: "bg-accentYellow/10",
        image: "/vid/compressed/mindmap.mp4"
    }
];

export const NativeLanding: React.FC<NativeLandingProps> = ({ onStart }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onStart();
        }
    };

    const step = ONBOARDING_STEPS[currentStep];

    return (
        <div className="min-h-full w-full bg-white flex flex-col items-center pb-safe">
            {/* Dynamic Background */}
            <div className={`absolute inset-0 opacity-5 transition-colors duration-1000 ${step.id % 2 === 0 ? 'bg-primaryGold' : 'bg-deepNavy'}`}></div>

            {/* Progress Bar */}
            <div className="w-full px-6 pt-6 flex gap-2 z-10">
                {ONBOARDING_STEPS.map((_, index) => (
                    <div
                        key={index}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${index <= currentStep ? 'bg-deepNavy shadow-sm' : 'bg-softBorder/40'
                            }`}
                    />
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full flex flex-col px-8 pt-12 pb-12 z-10">
                {/* Badge */}
                <div className="flex items-center gap-2 mb-8 animate-fade-in">
                    <div className="px-3 py-1 bg-deepNavy text-white text-[10px] font-black uppercase tracking-[0.2em]">
                        all the good stuff
                    </div>
                </div>

                {/* Question & Icon */}
                <div className="flex flex-col gap-6 mb-12 animate-slide-up">
                    <div className={`w-20 h-20 ${step.color} rounded-3xl flex items-center justify-center animate-bounce-subtle`}>
                        {step.icon}
                    </div>
                    <h2 className="text-4xl font-extrabold text-deepNavy tracking-tighter leading-[0.95] lowercase">
                        {step.question}
                    </h2>
                    <p className="text-steelGray text-lg font-medium leading-relaxed opacity-80">
                        {step.subtext}
                    </p>
                </div>

                {/* Visual Preview */}
                <div className="flex-1 w-full relative mb-8 rounded-[2.5rem] overflow-hidden border border-softBorder shadow-2xl animate-scale-in">
                    <video
                        key={step.id}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src={step.image} type="video/mp4" />
                    </video>
                    {/* Soft overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-deepNavy/20 to-transparent"></div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="w-full px-8 pb-12 z-10">
                <button
                    onClick={handleNext}
                    className="w-full bg-deepNavy text-white py-6 rounded-[2rem] font-bold text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-deepNavy/20 group"
                >
                    {currentStep === ONBOARDING_STEPS.length - 1 ? (
                        <>start learning <Check className="w-6 h-6" /></>
                    ) : (
                        <>continue <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></>
                    )}
                </button>

                <div className="flex justify-between items-center mt-8 px-2">
                    <div className="flex items-center gap-2">
                        <img src="/favicon-96x96.png" alt="Studymi" className="w-5 h-5 opacity-40" />
                        <span className="text-[10px] font-bold text-steelGray/40 uppercase tracking-[0.2em]">studymi</span>
                    </div>
                    {currentStep < ONBOARDING_STEPS.length - 1 && (
                        <button
                            onClick={onStart}
                            className="text-steelGray/60 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-deepNavy transition-colors"
                        >
                            skip
                        </button>
                    )}
                </div>
            </div>

            {/* Decorative Blobs */}
            <div className="fixed -bottom-40 -left-40 w-80 h-80 bg-accentYellow/5 rounded-full blur-[100px] -z-10"></div>
            <div className="fixed top-20 -right-20 w-64 h-64 bg-primaryGold/5 rounded-full blur-[80px] -z-10"></div>
        </div>
    );
};
