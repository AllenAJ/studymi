import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineViewProps {
    onRetry: () => void;
}

export const OfflineView: React.FC<OfflineViewProps> = ({ onRetry }) => {
    return (
        <div className="min-h-screen bg-iceGray dark:bg-darkBg flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
            {/* Decorative Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-[80px]"></div>

            <div className="flex flex-col items-center gap-8 relative z-10 max-w-sm">
                {/* Icon Container */}
                <div className="w-24 h-24 bg-white dark:bg-darkCard rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-softBorder dark:border-darkBorder animate-bounce-subtle">
                    <WifiOff className="w-10 h-10 text-deepNavy dark:text-accentYellow" />
                </div>

                {/* Text Content */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-3xl font-extrabold text-deepNavy dark:text-white tracking-tighter leading-none lowercase">
                        connection lost
                    </h2>
                    <p className="text-steelGray dark:text-darkMuted text-base font-medium leading-relaxed px-4">
                        it seems you're offline. studymi needs an internet connection to sync your study sets and reach the ai.
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={onRetry}
                    className="bg-deepNavy text-white dark:bg-accentYellow dark:text-deepNavy px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all group"
                >
                    try again <RefreshCw className="w-5 h-5 group-active:animate-spin" />
                </button>
            </div>

            {/* Footer Branding */}
            <div className="absolute bottom-12 flex items-center gap-2 opacity-20">
                <img src="/favicon-96x96.png" alt="Studymi" className="w-4 h-4 grayscale" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-deepNavy dark:text-white">studymi</span>
            </div>
        </div>
    );
};
