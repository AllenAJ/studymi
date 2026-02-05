import React, { useState } from 'react';
import { ArrowRight, Moon, Sun, Languages, ChevronRight } from 'lucide-react';

interface NativeLandingProps {
    onStart: (mode: 'signin' | 'signup') => void;
}

export const NativeLanding: React.FC<NativeLandingProps> = ({ onStart }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('studymi_darkMode');
            return saved !== null ? JSON.parse(saved) : false;
        }
        return false;
    });

    React.useEffect(() => {
        localStorage.setItem('studymi_darkMode', JSON.stringify(isDarkMode));
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className="min-h-screen w-full bg-iceGray dark:bg-darkBg flex flex-col relative overflow-hidden transition-colors duration-300">
            {/* Background Dots */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40" style={{
                backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}></div>

            {/* Top Right Controls */}
            <div className="absolute top-0 right-0 p-6 flex items-center gap-3 z-20" style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' }}>
                <div className="flex items-center gap-2 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md px-3 py-1.5 border border-softBorder dark:border-darkBorder shadow-sm">
                    <span className="text-xs font-bold text-deepNavy dark:text-white flex items-center gap-2">
                        <span className="text-lg">🇺🇸</span> EN
                    </span>
                </div>
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-10 h-10 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md border border-softBorder dark:border-darkBorder flex items-center justify-center text-deepNavy dark:text-white shadow-sm"
                >
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 pt-24 pb-12 z-10 text-center">
                {/* Mascot / Logo */}
                <div className="relative mb-10 animate-float">
                    <div className="absolute inset-0 bg-primaryGold/30 blur-[50px] rounded-full -z-10 animate-pulse-slow"></div>
                    <img 
                        src="/web-app-manifest-512x512.png" 
                        alt="Studymi Mascot" 
                        className="w-44 h-44 object-contain rounded-3xl drop-shadow-[0_20px_50px_rgba(245,158,11,0.3)]"
                    />
                </div>

                {/* Tagline */}
                <div className="space-y-4">
                    <h1 className="text-[40px] md:text-5xl font-extrabold text-deepNavy dark:text-white tracking-tight leading-[1.05] mb-2">
                        Transform your notes <br />
                        into your <span className="text-primaryGold drop-shadow-sm">AI Tutor</span>
                    </h1>
                    <p className="text-steelGray dark:text-darkMuted text-lg font-medium max-w-[300px] mx-auto leading-relaxed">
                        Personalized study sets, flashcards, and quizzes in one tap.
                    </p>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="w-full px-8 pb-16 z-10 flex flex-col items-center gap-6 safe-bottom">
                <button
                    onClick={() => onStart('signup')}
                    className="w-full bg-deepNavy dark:bg-white text-white dark:text-deepNavy py-5 rounded-none font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-deepNavy/20 group"
                >
                    Get Started - it's free
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                    onClick={() => onStart('signin')}
                    className="text-steelGray dark:text-darkMuted font-medium text-sm transition-colors"
                >
                    Already purchased? <span className="text-deepNavy dark:text-white font-bold underline decoration-primaryGold/50 underline-offset-4">Sign In</span>
                </button>
            </div>

            {/* Branded Footer Label */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-30 pointer-events-none">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-deepNavy dark:text-white">studymi</span>
                </div>
            </div>
        </div>
    );
};

