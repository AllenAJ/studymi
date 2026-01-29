import React, { useState } from 'react';
import { ArrowRight, ChevronDown, Globe, Shield, Zap, X, Volume2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-deepNavy font-sans overflow-x-hidden selection:bg-primaryGold selection:text-white">
      {/* Navigation */}
      <nav className="w-full max-w-[1200px] mx-auto px-6 py-8 flex justify-between items-center animate-fade-in z-50 relative">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onStart}>
          <div className="w-3 h-3 rounded-full bg-accentYellow shadow-[0_0_12px_rgba(255,228,77,0.4)]"></div>
          <span className="text-xl font-bold tracking-tight text-deepNavy lowercase">studymi</span>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={onStart} className="hidden md:block text-steelGray font-medium hover:text-deepNavy text-sm transition-colors">log in</button>
          <button 
            onClick={onStart}
            className="bg-accentYellow text-deepNavy px-6 py-3 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-yellow-200/50"
          >
            sign up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pt-12 md:pt-20 pb-32 flex flex-col items-center text-center animate-slide-up relative">
        
        {/* Main Headings */}
        <h1 className="text-5xl md:text-[80px] leading-[0.95] font-extrabold text-deepNavy mb-8 tracking-tighter lowercase">
          it's not cramming.<br />
          it's just studymi.
        </h1>
        <p className="text-steelGray text-lg md:text-xl max-w-lg mb-10 font-medium leading-relaxed">
          your wise, witty ai built to help you master your studies, notes, and complex topics.
        </p>
        
        <button 
          onClick={onStart}
          className="bg-accentYellow text-deepNavy px-10 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-200/40 flex items-center gap-3 group mb-4"
        >
          start learning <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <p className="text-xs text-steelGray/60 font-bold tracking-widest uppercase mb-20">trusted by 120,000+ cool students</p>

        {/* The Hero Card - "Calmi" style connection screen */}
        <div className="w-full max-w-4xl relative">
            {/* Soft decorative blob behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-iceGray/50 rounded-full blur-3xl -z-10 opacity-60"></div>

            <div className="bg-white rounded-[40px] shadow-2xl shadow-deepNavy/5 border border-softBorder p-8 md:p-16 flex flex-col items-center text-center relative overflow-hidden transition-transform hover:scale-[1.01] duration-700">
                
                {/* Connecting State */}
                <div className="flex flex-col items-center gap-8 mb-12">
                   <p className="text-xs font-bold text-steelGray uppercase tracking-widest animate-pulse">connecting...</p>
                   
                   {/* The Yellow Dot Avatar */}
                   <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-accentYellow shadow-[0_20px_40px_rgba(255,204,0,0.2)] flex items-center justify-center animate-pulse-slow relative">
                       <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20"></div>
                   </div>

                   <div className="space-y-2 max-w-md">
                       <p className="text-xl md:text-2xl font-bold text-deepNavy leading-tight">
                         okay, so it sounds like you're feeling pretty shook about that physics exam.
                       </p>
                       <p className="text-steelGray text-lg">what's been going on?</p>
                   </div>
                </div>

                {/* Fake Controls */}
                <div className="flex items-center gap-6">
                    <button className="w-14 h-14 rounded-full bg-iceGray hover:bg-softBorder transition-colors flex items-center justify-center text-deepNavy">
                        <Volume2 className="w-6 h-6" />
                    </button>
                    
                    <button className="w-16 h-16 rounded-full bg-accentYellow hover:scale-105 transition-transform shadow-lg shadow-yellow-200 flex items-center justify-center text-deepNavy">
                        <div className="w-4 h-4 bg-deepNavy rounded-[2px]"></div>
                    </button>

                    <button className="w-14 h-14 rounded-full bg-iceGray hover:bg-softBorder transition-colors flex items-center justify-center text-deepNavy">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
        
        {/* Partner Logos */}
        <div className="mt-24 flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale hover:opacity-50 transition-opacity">
           {/* Simple text representations for logos to keep it clean/no external assets */}
           <span className="text-2xl font-serif font-bold tracking-tight">Harvard</span>
           <span className="text-2xl font-sans font-black tracking-tighter">MIT</span>
           <span className="text-2xl font-serif italic font-bold">Stanford</span>
           <span className="text-2xl font-mono font-bold">Coursera</span>
           <span className="flex items-center gap-1 font-bold text-2xl"><div className="w-6 h-6 bg-current rounded-tl-lg rounded-br-lg"></div>Notion</span>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full bg-[#FAFAFA] py-32 border-t border-softBorder/60">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-20 text-center">
            <h2 className="text-4xl font-extrabold text-deepNavy mb-4 lowercase">all the good stuff</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-[40px] p-10 md:p-14 flex flex-col justify-between min-h-[400px] border border-softBorder shadow-soft hover:shadow-hover transition-all duration-500 group">
               <div className="w-16 h-16 bg-iceGray rounded-full flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                  <Globe className="w-7 h-7 text-primaryGold" />
               </div>
               <div>
                 <h3 className="text-3xl font-bold text-deepNavy mb-4 lowercase">whenever, wherever</h3>
                 <p className="text-steelGray text-lg leading-relaxed">
                   never need a friend at 3 a.m. again. just start yapping with studymi, your conversational ai for learning that's ready 24/7.
                 </p>
               </div>
            </div>

            {/* Card 2 - Dark */}
            <div className="bg-deepNavy rounded-[40px] p-10 md:p-14 flex flex-col justify-between min-h-[400px] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primaryGold/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-10 border border-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 relative z-10">
                  <Shield className="w-7 h-7 text-accentYellow" />
               </div>
               <div className="relative z-10">
                 <h3 className="text-3xl font-bold text-white mb-4 lowercase">safe & sound</h3>
                 <p className="text-white/70 text-lg leading-relaxed">
                   spill all the tea — studymi's got you. your sessions are secure and confidential.
                 </p>
               </div>
            </div>

            {/* Card 3 - Full Width */}
            <div className="bg-white rounded-[40px] p-10 md:p-14 border border-softBorder shadow-soft hover:shadow-hover transition-all duration-500 md:col-span-2 flex flex-col md:flex-row items-center gap-12 group overflow-hidden">
               <div className="flex-1">
                 <div className="w-16 h-16 bg-iceGray rounded-full flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                    <Zap className="w-7 h-7 text-deepNavy" />
                 </div>
                 <h3 className="text-3xl font-bold text-deepNavy mb-4 lowercase">remembers everything</h3>
                 <p className="text-steelGray text-lg leading-relaxed">
                   studymi keeps your whole story in mind. it learns from every conversation, getting to know you better.
                 </p>
               </div>
               
               {/* Visual for Card 3 */}
               <div className="w-full md:w-1/2 bg-iceGray rounded-[32px] h-64 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #F59E0B 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                  {/* Abstract UI representation */}
                  <div className="w-4/5 bg-white rounded-2xl shadow-xl p-6 transform translate-y-8 transition-transform group-hover:translate-y-6 duration-500">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          <div className="w-2 h-2 rounded-full bg-accentYellow"></div>
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      </div>
                      <div className="space-y-3">
                          <div className="h-2 w-3/4 bg-iceGray rounded-full"></div>
                          <div className="h-2 w-1/2 bg-iceGray rounded-full"></div>
                          <div className="h-2 w-5/6 bg-iceGray rounded-full"></div>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-32 bg-white">
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
               <div key={i} className="bg-iceGray/50 p-8 rounded-[32px] hover:bg-iceGray transition-colors duration-300 flex flex-col gap-6">
                 <p className="text-deepNavy font-medium text-lg leading-relaxed">"{t.q}"</p>
                 <span className="text-steelGray/60 text-sm font-bold tracking-wide mt-auto">{t.u}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full py-32 bg-white border-t border-softBorder/60">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-deepNavy text-center mb-20 lowercase">frequently asked questions</h2>
          
          <div className="space-y-2">
            {[
              { q: "what is studymi?", a: "it's an intelligent learning companion that helps you understand complex topics by teaching them back to you, quizzing you, and creating study aids." },
              { q: "how does studymi work?", a: "simply upload your notes, audio, or just type a topic. studymi analyzes it and creates a personalized study plan with flashcards, mind maps, and quizzes." },
              { q: "is studymi a replacement for traditional therapy?", a: "no, studymi is an educational tool designed for learning and study support, not a medical or psychological service." },
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
      <footer className="w-full py-24 bg-white border-t border-softBorder">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
           <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-2 mb-6">
               <div className="w-3 h-3 rounded-full bg-accentYellow"></div>
               <span className="font-bold text-deepNavy lowercase text-xl tracking-tight">studymi</span>
             </div>
             <div className="max-w-xs">
                <p className="text-steelGray font-medium">be heard. be understood. be better.</p>
             </div>
             <button onClick={onStart} className="mt-8 bg-accentYellow text-deepNavy px-8 py-3 rounded-full font-bold text-sm shadow-lg shadow-yellow-200/50 hover:scale-105 transition-transform">
                try studymi free
             </button>
           </div>
           
           <div className="flex flex-col gap-4">
             <span className="font-bold text-deepNavy lowercase text-lg mb-2">socials</span>
             <a href="#" className="text-steelGray hover:text-deepNavy transition-colors font-medium">instagram</a>
             <a href="#" className="text-steelGray hover:text-deepNavy transition-colors font-medium">tiktok</a>
             <a href="#" className="text-steelGray hover:text-deepNavy transition-colors font-medium">twitter (x)</a>
             <a href="#" className="text-steelGray hover:text-deepNavy transition-colors font-medium">linkedin</a>
           </div>

           <div className="flex flex-col gap-4">
             <span className="font-bold text-deepNavy lowercase text-lg mb-2">legal</span>
             <a href="#" className="text-steelGray hover:text-deepNavy transition-colors font-medium">privacy policy</a>
             <a href="#" className="text-steelGray hover:text-deepNavy transition-colors font-medium">terms of service</a>
             <a href="#" className="text-steelGray hover:text-deepNavy transition-colors font-medium">ai disclaimer</a>
           </div>
        </div>
        
        <div className="max-w-[1200px] mx-auto px-6 mt-20 pt-8 border-t border-softBorder flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-steelGray/40 uppercase tracking-widest">
           <span>© 2025 studymi</span>
           <span>by allen joseph</span>
        </div>
      </footer>
    </div>
  );
};