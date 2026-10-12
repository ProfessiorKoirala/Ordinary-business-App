import React, { useState } from 'react';
import { User } from '../types';

interface PasswordLoginScreenProps {
    user: User;
    onSuccess: (password: string) => boolean;
    onBack: () => void;
    onDeleteProfile?: () => void;
}

const PasswordLoginScreen: React.FC<PasswordLoginScreenProps> = ({ user, onSuccess, onBack, onDeleteProfile }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate network delay
        setTimeout(() => {
            if (onSuccess(password)) {
                // Success is handled by parent
            } else {
                setError('Incorrect password. Please try again.');
                setPassword('');
            }
            setLoading(false);
        }, 500);
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
                        Enter password for {user.name.split(' ')[0]}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <input
                            id="password-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                            className={`w-full px-6 py-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 transition-all font-black text-xl tracking-widest text-center ${error ? 'border-red-500 animate-shake' : 'border-gray-100 dark:border-gray-800 focus:border-black dark:focus:border-white'}`}
                        />
                        {error && (
                            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center mt-3 animate-fade-in">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full bg-black dark:bg-white text-white dark:text-black font-black py-5 rounded-[24px] shadow-2xl hover:bg-gray-900 dark:hover:bg-gray-100 active:scale-[0.98] transition-all uppercase italic tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Unlock Profile</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 flex flex-col items-center gap-6">
                    <button 
                        onClick={onBack} 
                        className="text-[10px] font-black text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white uppercase tracking-[0.3em] transition-colors"
                    >
                        Switch Business Profile
                    </button>
                    
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

export default PasswordLoginScreen;