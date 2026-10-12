import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface PinLoginScreenProps {
    correctPin: string;
    onSuccess: () => void;
    onBack: () => void;
    onDeleteProfile?: () => void;
    user: { name: string; profilePicUrl?: string };
}

const PinDisplay: React.FC<{ pin: string; hasError: boolean }> = ({ pin, hasError }) => (
    <div className={`flex justify-center space-x-4 ${hasError ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map(i => (
            <div
                key={i}
                className={`w-5 h-5 rounded-full transition-all duration-200 ${
                    pin.length > i ? 'bg-primary scale-110' : 'bg-gray-300'
                } ${hasError ? '!bg-red-500' : ''}`}
            ></div>
        ))}
    </div>
);

const KeypadButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
    <button
        onClick={onClick}
        className="h-16 w-16 sm:h-20 sm:w-20 text-2xl sm:text-3xl font-semibold text-text-primary rounded-full flex items-center justify-center bg-white/50 hover:bg-white active:bg-gray-100 transition-colors shadow-sm"
    >
        {label}
    </button>
);

const PinLoginScreen: React.FC<PinLoginScreenProps> = ({ correctPin, onSuccess, onBack, onDeleteProfile, user }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === correctPin) {
                onSuccess();
            } else {
                setError('Incorrect PIN. Please try again.');
                setTimeout(() => {
                    setPin('');
                    setError('');
                }, 800);
            }
        }
    }, [pin, correctPin, onSuccess]);

    const handleKeyPress = (digit: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + digit);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 p-8 font-sans relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-[100px] -z-10 opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-50 dark:bg-purple-900/10 rounded-full blur-[100px] -z-10 opacity-60"></div>

            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-12">
                    <div className="relative inline-block mb-6">
                        <div className="w-28 h-28 rounded-[32px] overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                            <img 
                                src={user.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                                alt={user.name} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-black dark:bg-white text-white dark:text-black p-2 rounded-xl shadow-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                    
                    <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter italic uppercase leading-none">
                        Welcome Boss
                    </h1>
                    <p className="text-gray-400 dark:text-gray-600 font-bold uppercase tracking-[0.4em] text-[10px] mt-4">
                        Enter PIN for {user.name.split(' ')[0]}
                    </p>
                </div>
                
                <div className="mb-12">
                    <div className={`flex justify-center space-x-6 ${error ? 'animate-shake' : ''}`}>
                        {[0, 1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`w-6 h-6 rounded-full transition-all duration-300 ${
                                    pin.length > i ? 'bg-black dark:bg-white scale-125 shadow-lg' : 'bg-gray-100 dark:bg-gray-800'
                                } ${error ? '!bg-red-500' : ''}`}
                            ></div>
                        ))}
                    </div>
                    {error && (
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center mt-6 animate-fade-in">
                            {error}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-6 max-w-[320px] mx-auto">
                    {[ '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                        <button
                            key={digit}
                            onClick={() => handleKeyPress(digit)}
                            className="h-20 w-20 text-3xl font-black text-black dark:text-white rounded-3xl flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 active:scale-90 transition-all shadow-sm border border-gray-100 dark:border-gray-800"
                        >
                            {digit}
                        </button>
                    ))}
                    <button 
                        onClick={onBack} 
                        className="h-20 w-20 text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest flex items-center justify-center hover:text-black dark:hover:text-white transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => handleKeyPress('0')}
                        className="h-20 w-20 text-3xl font-black text-black dark:text-white rounded-3xl flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 active:scale-90 transition-all shadow-sm border border-gray-100 dark:border-gray-800"
                    >
                        0
                    </button>
                    <button 
                        onClick={handleBackspace} 
                        className="h-20 w-20 text-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                        </svg>
                    </button>
                </div>

                <div className="mt-12 flex flex-col items-center gap-6">
                    {onDeleteProfile && (
                        <button 
                            onClick={onDeleteProfile}
                            className="px-6 py-2 bg-red-50 dark:bg-red-900/10 text-red-400 hover:text-red-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            Delete Profile
                        </button>
                    )}
                </div>
            </div>

            <footer className="absolute bottom-10 left-0 right-0 flex justify-center opacity-10 pointer-events-none">
                <span className="text-black dark:text-white font-black text-[10px] uppercase tracking-[0.6em]">Ordinary Business Pro</span>
            </footer>
        </div>
    );
};

export default PinLoginScreen;