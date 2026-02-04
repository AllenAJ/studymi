import React, { useEffect } from 'react';
import { ArrowRight, Sparkles, Check, Mic, Globe, FileText, Layers, X } from 'lucide-react';

// Declare Tally on window
declare global {
    interface Window {
        Tally: any;
    }
}

export const WaitlistPage: React.FC = () => {

    useEffect(() => {
        // Load Tally embed script
        const script = document.createElement('script');
        script.src = "https://tally.so/widgets/embed.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const openWaitlist = () => {
        if (window.Tally) {
            window.Tally.openPopup('EkKeDA', {
                layout: 'modal',
                width: 700,
                autoClose: 0,
                emoji: {
                    text: '👋',
                    animation: 'wave'
                }
            });
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
            {/* Header */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <img src="/favicon.svg" alt="Studymi Logo" className="w-8 h-8" />
                    <span className="font-bold text-xl text-deepNavy tracking-tight">studymi</span>
                </div>
                <div className="text-sm font-medium text-steelGray bg-iceGray px-4 py-2 rounded-full cursor-default select-none">
                    Coming Soon
                </div>
            </nav>

            {/* Hero */}
            <main className="flex-1 flex flex-col items-center p-6 text-center max-w-3xl mx-auto w-full">
                <div className="space-y-8 animate-slide-up w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-iceGray rounded-full text-sm font-medium text-deepNavy mb-4">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Opening soon for early access
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-deepNavy tracking-tight leading-[1.1]">
                        Master anything faster using AI that <span className="underline decoration-primaryGold decoration-4 underline-offset-4">teaches you back</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-steelGray max-w-2xl mx-auto leading-relaxed">
                        Stop passively reading. Start actively learning.
                        Join the waitlist to turn any content into an interactive tutor.
                    </p>

                    <div className="flex justify-center mt-12 mb-20 relative z-20">
                        <button
                            onClick={openWaitlist}
                            className="px-8 py-4 bg-primaryGold text-deepNavy font-bold hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[200px] text-lg rounded-none shadow-lg hover:shadow-primaryGold/20"
                        >
                            Join Waitlist <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Demo Video */}
                    <div className="w-full max-w-4xl mx-auto relative mb-24 group">
                        {/* Soft decorative blob behind */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-iceGray/50 rounded-none blur-3xl -z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>

                        <div className="bg-white rounded-none shadow-2xl shadow-deepNavy/10 border border-softBorder p-2 flex flex-col items-center text-center relative overflow-hidden transition-transform hover:scale-[1.01] duration-700">
                            <video autoPlay loop muted playsInline className="w-full h-full object-cover rounded-none bg-iceGray">
                                <source src="/vid/compressed/main1.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>

                    {/* Features Grid - Full Width Breakout */}
                    <div className="w-screen relative left-[calc(-50vw+50%)] bg-[#FAFAFA] py-24 border-t border-softBorder/60">
                        <div className="max-w-[1200px] mx-auto px-6">
                            <div className="mb-20 text-center">
                                <h2 className="text-4xl font-extrabold text-deepNavy mb-4 lowercase">all the good stuff</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                {/* Feature 1: Record and Transcribe */}
                                <div className="bg-white rounded-none p-8 md:p-10 border border-softBorder shadow-soft hover:shadow-hover transition-all duration-500 group flex flex-col gap-8">
                                    <div className="flex flex-col gap-4">
                                        <div className="w-14 h-14 bg-iceGray rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <Mic className="w-6 h-6 text-deepNavy" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-deepNavy mb-3 lowercase">Record & Transcribe Lectures</h3>
                                            <p className="text-steelGray text-base leading-relaxed">
                                                Record and transcribe your lectures, meetings, and classes with our AI note taking platform.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Image Placeholder */}
                                    <div className="w-full aspect-video bg-iceGray rounded-none flex items-center justify-center border-none overflow-hidden group-hover:border-primaryGold/30 transition-colors">
                                        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                            <source src="/vid/compressed/transcibe.mp4" type="video/mp4" />
                                        </video>
                                    </div>
                                </div>

                                {/* Feature 2: 100+ Languages */}
                                <div className="bg-white rounded-none p-8 md:p-10 border border-softBorder shadow-soft hover:shadow-hover transition-all duration-500 group flex flex-col gap-8">
                                    <div className="flex flex-col gap-4">
                                        <div className="w-14 h-14 bg-iceGray rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <Globe className="w-6 h-6 text-primaryGold" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-deepNavy mb-3 lowercase">Gen Z Mode</h3>
                                            <p className="text-steelGray text-base leading-relaxed">
                                                Because why not? Studying can be fun.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Image Placeholder */}
                                    <div className="w-full aspect-video bg-iceGray rounded-none flex items-center justify-center border-none overflow-hidden group-hover:border-primaryGold/30 transition-colors">
                                        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                            <source src="/vid/compressed/genz.mp4" type="video/mp4" />
                                        </video>
                                    </div>
                                </div>

                                {/* Feature 3: Summaries and Insights */}
                                <div className="bg-white rounded-none p-8 md:p-10 border border-softBorder shadow-soft hover:shadow-hover transition-all duration-500 group flex flex-col gap-8">
                                    <div className="flex flex-col gap-4">
                                        <div className="w-14 h-14 bg-iceGray rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <FileText className="w-6 h-6 text-deepNavy" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-deepNavy mb-3 lowercase">AI Summaries & Notes</h3>
                                            <p className="text-steelGray text-base leading-relaxed">
                                                Studymi generates concise summaries and organized notes from any PDF, audio, or video.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Image Placeholder */}
                                    <div className="w-full aspect-video bg-iceGray rounded-none flex items-center justify-center border-none overflow-hidden group-hover:border-primaryGold/30 transition-colors">
                                        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                            <source src="/vid/compressed/insightshistory.mp4" type="video/mp4" />
                                        </video>
                                    </div>
                                </div>

                                {/* Feature 4: Quizzes and Flashcards */}
                                <div className="bg-white rounded-none p-8 md:p-10 border border-softBorder shadow-soft hover:shadow-hover transition-all duration-500 group flex flex-col gap-8">
                                    <div className="flex flex-col gap-4">
                                        <div className="w-14 h-14 bg-iceGray rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <Layers className="w-6 h-6 text-accentYellow" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-deepNavy mb-3 lowercase">Mindmaps, Quizzes & Flashcards</h3>
                                            <p className="text-steelGray text-base leading-relaxed">
                                                Generate visual mindmaps, practice quizzes, and Anki-style flashcards instantly.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Image Placeholder */}
                                    <div className="w-full aspect-video bg-iceGray rounded-none flex items-center justify-center border-none overflow-hidden group-hover:border-primaryGold/30 transition-colors">
                                        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                            <source src="/vid/compressed/mindmap.mp4" type="video/mp4" />
                                        </video>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="p-8 text-center border-t border-softBorder/60 bg-white relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-4">
                    <p className="text-sm text-steelGray">
                        © {new Date().getFullYear()} Studymi. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm font-medium text-steelGray">
                        <a href="/privacy" className="hover:text-deepNavy transition-colors">Privacy</a>
                        <a href="/terms" className="hover:text-deepNavy transition-colors">Terms</a>
                        <a href="mailto:allenxavier45@gmail.com" className="hover:text-deepNavy transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
