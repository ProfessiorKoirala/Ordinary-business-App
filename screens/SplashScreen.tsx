import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  message?: string;
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ message, onComplete }) => {
    const [phase, setPhase] = useState<'initial' | 'branding' | 'final'>('initial');

    useEffect(() => {
        // Phase 1: Centered Logo Branding
        const timer1 = setTimeout(() => setPhase('branding'), 100);
        
        // Phase 2: Sequential Slogan starts
        const timer2 = setTimeout(() => setPhase('final'), 2200);

        // Completion: Call onComplete after all animations finish
        const completionTimer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 8000); 

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(completionTimer);
        };
    }, [onComplete]);

    return (
        <div className="flex flex-col h-[100dvh] bg-white dark:bg-gray-950 overflow-hidden transition-colors relative">
            {/* Phase 1: Centered Logo Branding - OB Pro */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 transform ${phase === 'branding' ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
                <div className="relative inline-block text-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-[70px] sm:text-[90px] font-black text-black dark:text-white tracking-tighter leading-none italic uppercase">
                            OB
                        </h1>
                        <span className="bg-black dark:bg-white text-white dark:text-black text-[18px] sm:text-[24px] font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl italic uppercase tracking-tighter shadow-xl">Pro</span>
                    </div>
                    <div className="h-1.5 sm:h-2 w-24 sm:w-32 bg-black dark:bg-white mx-auto mt-4 sm:mt-6 rounded-full animate-width-expand"></div>
                </div>
                <div className="mt-8 sm:mt-12 flex gap-3 sm:gap-4">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-black dark:bg-white rounded-full animate-bounce"></div>
                </div>
            </div>

            {/* Phase 2: Sequential High-Impact Slogan */}
            <div className={`flex-1 flex flex-col transition-all duration-1000 ${phase === 'final' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'}`}>
                <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8">
                    <div className="flex flex-col items-center gap-8 sm:gap-12">
                        <div className="flex flex-col items-center gap-6 sm:gap-8 text-center">
                             <div className="relative group">
                                <span className={`text-6xl sm:text-9xl font-handwriting text-[#2D2A4A] dark:text-white inline-block px-6 py-4 sm:px-10 sm:py-6 transition-all duration-1000 delay-300 transform ${phase === 'final' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                    Empower
                                </span>
                                {phase === 'final' && (
                                    <svg className="absolute inset-0 w-full h-full -rotate-2 scale-125" viewBox="0 0 160 80" fill="none">
                                        <path 
                                            d="M10,40 C10,10 150,10 150,40 C150,70 10,70 15,40" 
                                            stroke="currentColor" 
                                            strokeWidth="4" 
                                            strokeLinecap="round"
                                            className="animate-draw-path text-black dark:text-white"
                                            style={{ strokeDasharray: 1000, strokeDashoffset: 1000, animationDelay: '1s' }}
                                        />
                                    </svg>
                                )}
                             </div>

                             <div className="space-y-8 sm:space-y-12 text-center">
                                <p className={`text-4xl sm:text-6xl font-handwriting text-[#2D2A4A] dark:text-gray-200 leading-tight transition-all duration-1000 delay-[1200ms] ${phase === 'final' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                    your business empire
                                </p>
                                
                                <div className="relative inline-block">
                                    <span className={`text-6xl sm:text-8xl font-handwriting font-bold text-[#2D2A4A] dark:text-white uppercase tracking-wider transition-all duration-1000 delay-[2200ms] ${phase === 'final' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                        PRO!
                                    </span>
                                    {phase === 'final' && (
                                        <svg className="absolute -bottom-4 left-0 w-full h-6" viewBox="0 0 100 10" preserveAspectRatio="none">
                                            <path 
                                                d="M0,5 Q50,0 100,8" 
                                                stroke="currentColor" 
                                                strokeWidth="8" 
                                                strokeLinecap="round"
                                                className="animate-draw-path text-black dark:text-white"
                                                style={{ strokeDasharray: 100, strokeDashoffset: 100, animationDelay: '3s' }}
                                            />
                                        </svg>
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>

                    {message && (
                        <div className="mt-16 sm:mt-24 flex items-center gap-4 sm:gap-5 animate-fade-in [animation-delay:4s]">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-black dark:bg-white rounded-full animate-ping"></div>
                            <p className="text-gray-400 dark:text-gray-500 font-black text-[10px] sm:text-[12px] uppercase tracking-[0.45em]">{message}</p>
                        </div>
                    )}
                </main>

                <footer className="p-8 sm:p-12 pb-12 sm:pb-16 flex flex-col items-center gap-4 transition-all duration-1000 delay-[3500ms]" style={{ opacity: phase === 'final' ? 1 : 0 }}>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-gray-300 dark:text-gray-700 font-black text-[10px] tracking-[0.5em] uppercase leading-none">Developed by</span>
                        <span className="text-black dark:text-white font-black text-2xl tracking-tighter italic leading-none uppercase">Ordinary Business</span>
                    </div>
                    <div className="flex gap-4">
                        <a href="/privacy" className="text-[8px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a>
                        <a href="/terms" className="text-[8px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </footer>
            </div>
            
            <style>{`
                @keyframes draw { to { stroke-dashoffset: 0; } }
                .animate-draw-path { animation: draw 1.2s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 1s ease-out forwards; }
                @keyframes width-expand { from { width: 0; opacity: 0; } to { width: 128px; opacity: 1; } }
                .animate-width-expand { animation: width-expand 1s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.5s; }
            `}</style>
        </div>
    );
};

export default SplashScreen;