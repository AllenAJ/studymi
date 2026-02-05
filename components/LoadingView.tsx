import React from 'react';

export const LoadingView: React.FC = () => {
    return (
        <div className="min-h-screen bg-iceGray dark:bg-darkBg flex items-center justify-center relative overflow-hidden">
            {/* Decorative Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accentYellow/10 rounded-full blur-[80px] animate-pulse-slow"></div>

            <div className="flex flex-col items-center gap-12 relative z-10">
                {/* Logo Container */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-accentYellow blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
                    <div className="w-20 h-20 bg-accentYellow flex items-center justify-center p-4 shadow-2xl relative animate-bounce-subtle">
                        <img src="/favicon-96x96.png" alt="Studymi" className="w-full h-full object-contain" />
                    </div>
                </div>

                {/* Loading Indicator */}
                <div className="flex flex-col items-center gap-6">
                    <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-1.5 h-1.5 bg-deepNavy dark:bg-accentYellow rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            ></div>
                        ))}
                    </div>
                    <p className="text-deepNavy/40 dark:text-accentYellow/40 font-bold text-[10px] uppercase tracking-[0.3em] ml-1">
                        synchronizing
                    </p>
                </div>
            </div>

            {/* Footer Branding */}
            <div className="absolute bottom-12 flex items-center gap-2 opacity-20">
                <img src="/favicon-96x96.png" alt="Studymi" className="w-4 h-4 grayscale" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-deepNavy dark:text-white">studymi</span>
            </div>
        </div>
    );
};
