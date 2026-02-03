import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, Globe, Shield, Zap, X, Volume2, Mic, FileText, Layers } from 'lucide-react';

import { usePostHog } from 'posthog-js/react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const posthog = usePostHog();

  React.useEffect(() => {
    if (posthog) posthog.capture('landing_page_viewed');
  }, [posthog]);

  // SEO-optimized wording
  const H1_SUBTITLE = "The AI Note Taking App that turns 'huh?' into 'ohhh, got it.'";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const words = [
    "panic.",
    "cramming.",
    "chaos.",
    "all-nighters.",
  ];

  const [currentWord, setCurrentWord] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setCurrentWord((prev) => (prev + 1) % words.length);
        setFadeState('in');
      }, 500); // 500ms fade out
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-deepNavy font-sans overflow-x-hidden selection:bg-primaryGold selection:text-white">
      {/* Background Dots */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(#e5e7eb 1.2px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      {/* Navigation */}
      <nav className="w-full max-w-[1200px] mx-auto px-6 py-8 flex justify-between items-center animate-fade-in z-50 relative">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onStart}>
          <img src="/favicon-96x96.png" alt="Studymi" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-deepNavy lowercase">studymi</span>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={onStart} className="hidden md:block text-steelGray font-medium hover:text-deepNavy text-sm transition-colors">log in</button>
          <button
            onClick={onStart}
            className="bg-accentYellow text-deepNavy px-6 py-3 rounded-none font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-yellow-200/50"
          >
            sign up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pt-12 md:pt-20 pb-32 flex flex-col items-center text-center animate-slide-up relative z-10">

        {/* Main Headings */}
        <h1 className="text-5xl md:text-[80px] leading-[0.95] font-extrabold text-deepNavy mb-8 tracking-tighter min-h-[1.9em]">
          <span className="block">
            No <span className={`inline-block transition-all duration-500 ease-in-out ${fadeState === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {words[currentWord]}
            </span>
          </span>
          <span className="block text">
            Just Studymi.
          </span>
        </h1>
        <h2 className="text-steelGray text-lg md:text-xl max-w-lg mb-10 font-medium leading-relaxed">
          {H1_SUBTITLE}
        </h2>

        <button
          onClick={onStart}
          className="bg-accentYellow text-deepNavy px-10 py-4 rounded-none font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-200/40 flex items-center gap-3 group mb-4"
        >
          start learning <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-xs text-steelGray/60 font-bold tracking-widest uppercase mb-20">trusted by 120,000+ cool students</p>

        {/* The Hero Card - "Calmi" style connection screen */}
        <div className="w-full max-w-4xl relative">
          {/* Soft decorative blob behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-iceGray/50 rounded-none blur-3xl -z-10 opacity-60"></div>

          <div className="bg-white rounded-none shadow-2xl shadow-deepNavy/5 border border-softBorder p-2 flex flex-col items-center text-center relative overflow-hidden transition-transform hover:scale-[1.01] duration-700">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover rounded-none">
              <source src="/vid/compressed/main1.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        {/* Partner Logos */}
        <div className="mt-24 flex flex-col items-center gap-8">
          <p className="text-xs text-steelGray/60 font-bold tracking-widest uppercase">trusted by students at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <img src="/studentsat/harvard.webp" alt="Harvard" className="h-16 w-auto object-contain" />
            <img src="/studentsat/mit.webp" alt="MIT" className="h-16 w-auto object-contain" />
            <img src="/studentsat/sanford.webp" alt="Stanford" className="h-16 w-auto object-contain" />
            <img src="/studentsat/university-of-chicago.webp" alt="UChicago" className="h-16 w-auto object-contain" />
            <img src="/studentsat/Yale-Logo.webp" alt="Yale" className="h-16 w-auto object-contain" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full bg-[#FAFAFA] py-32 border-t border-softBorder/60 relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-20 text-center">
            <h2 className="text-4xl font-extrabold text-deepNavy mb-4 lowercase">all the good stuff</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      </section>

      {/* Testimonials */}
      <section className="w-full py-32 bg-white relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-deepNavy text-center mb-20 lowercase">what people are saying</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { q: "i'm... speechless. i used this for less than 5 minutes and i'm already crying. i really needed this. thank you so much.", u: "@mvggotz" },
              { q: "that sh*t works a little bit too well.", u: "@_rose_boy_1029" },
              { q: "this ateeeee.", u: "@aflynaaa" },
              { q: "i tried it and i can genuinely say—this is insane. i'm so amused by how good the ai is.", u: "@orianagxmez" },
              { q: "to be honest, i gave it a try and it's really good. i feel better now.", u: "@manzanitawoo" },
              { q: "guys, it works, i swear. this made my day.", u: "@alisson.music" }
            ].map((t, i) => (
              <div key={i} className="bg-iceGray/50 p-8 rounded-none hover:bg-iceGray transition-colors duration-300 flex flex-col gap-6">
                <p className="text-deepNavy font-medium text-lg leading-relaxed">"{t.q}"</p>
                <span className="text-steelGray/60 text-sm font-bold tracking-wide mt-auto">{t.u}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full py-32 bg-white border-t border-softBorder/60 relative z-10">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-deepNavy text-center mb-20 lowercase">frequently asked questions</h2>

          <div className="space-y-2">
            {[
              { q: "what is studymi?", a: "it's an intelligent learning companion that helps you understand complex topics by teaching them back to you, quizzing you, and creating study aids." },
              { q: "how does studymi work?", a: "simply upload your notes, audio, or just type a topic. studymi analyzes it and creates a personalized study plan with flashcards, mind maps, and quizzes." },
              { q: "can studymi help right before an exam?", a: "yes. it can generate rapid-revision summaries, quick quizzes, and focused study sets that help you absorb the essentials fast." },
              { q: "is my data secure and confidential?", a: "absolutely. your data is encrypted and private. we do not share your personal study materials with anyone." },
              { q: "does studymi support multiple languages?", a: "yes! studymi can process and communicate in multiple languages to support your learning journey." }
            ].map((item, i) => (
              <div key={i} className="border-b border-softBorder last:border-0">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center py-8 text-left group"
                >
                  <span className="font-bold text-xl text-deepNavy group-hover:text-primaryGold transition-colors">{item.q}</span>
                  <ChevronDown className={`w-6 h-6 text-steelGray transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-48 opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                  <p className="text-steelGray text-lg leading-relaxed pr-8">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-24 bg-white border-t border-softBorder relative z-10">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src="/favicon-96x96.png" alt="Studymi" className="w-8 h-8" />
              <span className="font-bold text-deepNavy lowercase text-xl tracking-tight">studymi</span>
            </div>
            <div className="max-w-xs">
              <p className="text-steelGray font-medium">be heard. be understood. be better.</p>
            </div>
            <button onClick={onStart} className="mt-8 bg-accentYellow text-deepNavy px-8 py-3 rounded-none font-bold text-sm shadow-lg shadow-yellow-200/50 hover:scale-105 transition-transform">
              try studymi free
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-bold text-deepNavy lowercase text-lg mb-2">socials</span>
            <a href="https://www.instagram.com/allen.codes/" target="_blank" rel="noopener noreferrer" className="text-steelGray hover:text-deepNavy transition-colors font-medium">instagram</a>
            <a href="https://x.com/allenjosephaj" target="_blank" rel="noopener noreferrer" className="text-steelGray hover:text-deepNavy transition-colors font-medium">twitter (x)</a>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-bold text-deepNavy lowercase text-lg mb-2">product</span>
            <a href="/pricing" className="text-steelGray hover:text-deepNavy transition-colors font-medium">pricing</a>
            <a href="/" className="text-steelGray hover:text-deepNavy transition-colors font-medium">sign in</a>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-bold text-deepNavy lowercase text-lg mb-2">legal</span>
            <a href="/privacy" className="text-steelGray hover:text-deepNavy transition-colors font-medium">privacy policy</a>
            <a href="/terms" className="text-steelGray hover:text-deepNavy transition-colors font-medium">terms of service</a>
            <a href="/disclaimer" className="text-steelGray hover:text-deepNavy transition-colors font-medium">ai disclaimer</a>
            <a href="/refund" className="text-steelGray hover:text-deepNavy transition-colors font-medium">refund policy</a>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 mt-20 pt-8 border-t border-softBorder flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-steelGray/40 uppercase tracking-widest">© 2025 POINK TECHNOLOGIES PRIVATE LIMITED</span>
            <span className="text-[10px] font-bold text-steelGray/40 uppercase tracking-widest">by allen joseph</span>
          </div>
        </div>
      </footer>
    </div>
  );
};