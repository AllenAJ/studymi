import React from 'react';
import { ArrowLeft, CheckCircle2, Mic, Sparkles } from 'lucide-react';

interface PricingPageProps {
    onBack: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-iceGray dark:bg-darkBg font-sans text-deepNavy dark:text-darkText transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 bg-white/80 dark:bg-darkBg/80 backdrop-blur-lg border-b border-softBorder dark:border-darkBorder z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-none hover:bg-iceGray dark:hover:bg-darkCard transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-xl dark:text-white tracking-tight">studymi</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-deepNavy dark:text-white mb-6">Simple, transparent pricing</h1>
                    <p className="text-xl text-steelGray dark:text-darkMuted max-w-2xl mx-auto">
                        Choose the plan that fits your study needs. Unleash your full potential with Studymi.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white dark:bg-darkCard border border-softBorder dark:border-darkBorder rounded-none p-8 flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-deepNavy dark:text-white mb-2">Free</h3>
                            <p className="text-steelGray dark:text-darkMuted mb-6">For casual learners</p>
                            <div className="text-4xl font-extrabold text-deepNavy dark:text-white mb-2">$0</div>
                            <p className="text-sm text-steelGray dark:text-darkMuted">Forever free</p>
                        </div>

                        <div className="flex-1 space-y-4 mb-8">
                            {[
                                "3 study sets limit",
                                "Basic note generation",
                                "Standard support",
                                "Access to core features"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-steelGray dark:text-gray-500" />
                                    <span className="text-deepNavy dark:text-white">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full py-4 px-8 border-2 border-deepNavy dark:border-white text-deepNavy dark:text-white font-bold rounded-none hover:bg-iceGray dark:hover:bg-darkBorder/50 transition-colors"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Premium Plan */}
                    <div className="bg-deepNavy dark:bg-darkBg border border-deepNavy dark:border-softBorder rounded-none p-8 flex flex-col relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 bg-primaryGold text-white text-xs font-bold px-4 py-1.5 uppercase tracking-wider">
                            Best Value
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-2xl font-bold">Unlimited</h3>
                                <Sparkles className="w-5 h-5 text-primaryGold" />
                            </div>
                            <p className="text-gray-300 mb-6">For serious students</p>
                            <div className="flex items-baseline gap-1">
                                <div className="text-4xl font-extrabold">$7.99</div>
                                <span className="text-gray-400">/mo</span>
                            </div>
                            <p className="text-sm text-green-400 mt-2 font-medium">Billed annually ($95.88/year)</p>
                        </div>

                        <div className="flex-1 space-y-4 mb-8">
                            {[
                                "Unlimited study sets",
                                "Unlimited audio & YouTube uploads",
                                "Priority support",
                                "Early access to new features",
                                "Advanced AI models"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-primaryGold" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full py-4 px-8 bg-primaryGold text-white font-bold rounded-none hover:bg-yellow-500 transition-colors shadow-lg"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <h3 className="text-lg font-bold text-deepNavy dark:text-white mb-2">Enterprise / Schools</h3>
                    <p className="text-steelGray dark:text-darkMuted mb-6">Need bulk licenses for your institution? We offer custom pricing.</p>
                    <a href="mailto:allenxavier45@gmail.com" className="text-deepNavy dark:text-white underline font-medium hover:text-primaryGold dark:hover:text-primaryGold transition-colors">
                        Contact Sales
                    </a>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-darkCard border-t border-softBorder dark:border-darkBorder py-12">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="font-bold text-xl dark:text-white tracking-tight">studymi</span>
                        </div>
                        <p className="text-sm text-steelGray dark:text-darkMuted max-w-sm">
                            Empowering students with AI-driven tools to learn smarter, faster, and better.
                        </p>
                        <p className="text-sm text-steelGray dark:text-darkMuted mt-4">
                            © 2024 POINK TECHNOLOGIES PRIVATE LIMITED.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-deepNavy dark:text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-steelGray dark:text-darkMuted">
                            <li><a href="/terms" className="hover:text-deepNavy dark:hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="/privacy" className="hover:text-deepNavy dark:hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="/refund" className="hover:text-deepNavy dark:hover:text-white transition-colors">Refund Policy</a></li>
                            <li><a href="/disclaimer" className="hover:text-deepNavy dark:hover:text-white transition-colors">AI Disclaimer</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-deepNavy dark:text-white mb-4">product</h4>
                        <ul className="space-y-2 text-sm text-steelGray dark:text-darkMuted">
                            <li><a href="/pricing" className="hover:text-deepNavy dark:hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="/" className="hover:text-deepNavy dark:hover:text-white transition-colors">Login</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
};
