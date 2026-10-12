import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppDataBackup } from '../types';
import { askLeo } from '../utils/leoAi';

interface LeoAIProps {
    appData: AppDataBackup;
}

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'leo';
}

const LeoAvatar = ({ size = 90 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Backpack (Green) */}
        <rect x="60" y="85" width="80" height="70" rx="15" fill="#22C55E" stroke="#064E3B" strokeWidth="3" />
        
        {/* Body/Vest (Blue) */}
        <rect x="70" y="90" width="60" height="80" rx="12" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="3" />
        <text x="85" y="140" fill="white" fontSize="20" fontWeight="950" fontFamily="Arial">OB</text>
        
        {/* Arms */}
        <path d="M 70 110 Q 35 130 45 165" stroke="#F59E0B" strokeWidth="16" strokeLinecap="round" />
        <path d="M 130 110 Q 165 130 155 165" stroke="#F59E0B" strokeWidth="16" strokeLinecap="round" />
        
        {/* Legs (Grey) */}
        <rect x="75" y="165" width="22" height="35" rx="6" fill="#374151" />
        <rect x="103" y="165" width="22" height="35" rx="6" fill="#374151" />
        
        {/* Shoes (Brown) */}
        <rect x="65" y="190" width="35" height="15" rx="8" fill="#451A03" />
        <rect x="100" y="190" width="35" height="15" rx="8" fill="#451A03" />
        
        {/* Head (Lion/Cat) */}
        <circle cx="100" cy="65" r="55" fill="#F59E0B" stroke="#92400E" strokeWidth="3" />
        
        {/* Ears */}
        <circle cx="55" cy="35" r="22" fill="#F59E0B" stroke="#92400E" strokeWidth="3" />
        <circle cx="145" cy="35" r="22" fill="#F59E0B" stroke="#92400E" strokeWidth="3" />
        <circle cx="55" cy="35" r="12" fill="#FECACA" />
        <circle cx="145" cy="35" r="12" fill="#FECACA" />
        
        {/* Face */}
        <circle cx="78" cy="65" r="12" fill="white" />
        <circle cx="122" cy="65" r="12" fill="white" />
        <circle cx="78" cy="65" r="6" fill="#059669" />
        <circle cx="122" cy="65" r="6" fill="#059669" />
        
        {/* Snout */}
        <path d="M 82 85 Q 100 100 118 85" stroke="#451A03" strokeWidth="4" fill="none" />
        <rect x="92" y="78" width="16" height="10" rx="4" fill="#451A03" />
        
        {/* Cap (Green) */}
        <path d="M 50 50 Q 100 5 150 50" fill="#22C55E" stroke="#064E3B" strokeWidth="3" />
        <rect x="45" y="45" width="110" height="22" rx="6" fill="#22C55E" stroke="#064E3B" strokeWidth="3" />
        <text x="72" y="40" fill="#064E3B" fontSize="22" fontWeight="1000" fontFamily="Arial" letterSpacing="2">LEO</text>
    </svg>
);

const LeoAI: React.FC<LeoAIProps> = ({ appData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = localStorage.getItem('leo_chat_history');
        return saved ? JSON.parse(saved) : [
            { id: '1', text: "Hi! I'm Leo, your offline business AI. Ask me about your sales, profit, expenses, or stock!", sender: 'leo' }
        ];
    });
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('leo_muted') === 'true');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastProactiveTime = useRef<number>(0);
    const lastProactiveCheck = useRef<string>('');
    const lastSentProactiveMsg = useRef<string>('');
    const audioCtxRef = useRef<AudioContext | null>(null);

    // --- Sound Effects ---
    const playSound = (type: 'typing' | 'send' | 'receive') => {
        if (isMuted && type !== 'send') return; // Always play send sound unless we want total silence
        try {
            if (type === 'typing') {
                if (!audioCtxRef.current) {
                    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                }
                const ctx = audioCtxRef.current;
                if (ctx.state === 'suspended') ctx.resume();

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, ctx.currentTime);
                gain.gain.setValueAtTime(0.02, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
                osc.start();
                osc.stop(ctx.currentTime + 0.03);
                return;
            }

            // Audio disabled for non-existent files
            const audioPath = '';

            if (audioPath) {
                const audio = new Audio(audioPath);
                audio.volume = 0.5;
                audio.play().catch(e => console.error("Audio play failed", e));
            }
        } catch (e) {
            console.error("Audio failed", e);
        }
    };

    // --- Proactive Logic ---
    useEffect(() => {
        if (!appData) return;

        const checkProactive = () => {
            const now = Date.now();
            // Only check every 5 minutes (300,000 ms)
            if (now - lastProactiveTime.current < 300000) return;

            const today = new Date().toISOString().split('T')[0];
            const target = appData.settings.dailySalesTarget || 0;
            const todaySales = appData.orders
                .filter(o => new Date(o.timestamp).toISOString().split('T')[0] === today)
                .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

            let proactiveMsg = '';

            // Priority 1: Target Met (only once per day)
            if (target > 0 && todaySales >= target && lastProactiveCheck.current !== today) {
                proactiveMsg = `Sir, I'm pleased to inform you that we have reached your daily sales target of ₹${target.toLocaleString()}! Current revenue is ₹${todaySales.toLocaleString()}. Excellent work!`;
                lastProactiveCheck.current = today;
            } else {
                // Priority 2: Low Stock (every 5 mins if still low)
                const lowStock = appData.products.filter(p => p.trackStock && (p.stock || 0) <= 5);
                if (lowStock.length > 0) {
                    proactiveMsg = `Sir, I noticed that ${lowStock[0].name} and ${lowStock.length - 1 > 0 ? `${lowStock.length - 1} other items` : 'some items'} are running very low on stock. We should restock them soon to avoid missing out on sales.`;
                }
            }

            if (proactiveMsg) {
                // If the message is the same as the last one, only send it once every 30 minutes
                if (proactiveMsg === lastSentProactiveMsg.current && now - lastProactiveTime.current < 1800000) return;

                const leoMsg: ChatMessage = { id: Date.now().toString(), text: proactiveMsg, sender: 'leo' };
                setMessages(prev => {
                    // Avoid duplicate consecutive proactive messages
                    if (prev.length > 0 && prev[prev.length - 1].text === proactiveMsg) return prev;
                    return [...prev, leoMsg];
                });
                playSound('receive');
                if (!isOpen) {
                    setHasUnread(true);
                }
                lastProactiveTime.current = now;
                lastSentProactiveMsg.current = proactiveMsg;
            }
        };

        // Initial check after 5 seconds
        const initialTimer = setTimeout(checkProactive, 5000);
        
        // Regular interval check every 5 minutes
        const interval = setInterval(checkProactive, 300000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [appData, isOpen]);

    useEffect(() => {
        localStorage.setItem('leo_chat_history', JSON.stringify(messages));
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setHasUnread(false);
        }
    }, [messages, isOpen]);

    useEffect(() => {
        localStorage.setItem('leo_muted', String(isMuted));
    }, [isMuted]);

    const handleSend = () => {
        if (!input.trim()) return;

        playSound('send');
        const userMsg: ChatMessage = { id: Date.now().toString(), text: input.trim(), sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput(''); // Clear immediately
        
        setIsTyping(true);
        
        // Simulate a tiny bit of "thinking" time for better UX
        setTimeout(() => {
            if (!appData) {
                const leoMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: "I'm sorry, I don't have access to your business data right now. Please try again in a moment.", sender: 'leo' };
                setMessages(prev => [...prev, leoMsg]);
                setIsTyping(false);
                playSound('receive');
                return;
            }
            const responseText = askLeo(userMsg.text, appData);
            const leoMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: responseText, sender: 'leo' };
            setMessages(prev => [...prev, leoMsg]);
            setIsTyping(false);
            playSound('receive');
            if (!isOpen) setHasUnread(true);
        }, 1200);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        if (e.target.value.length > input.length) {
            playSound('typing');
        }
    };

    const clearHistory = () => {
        const initialMsg = { id: '1', text: "Hi! I'm Leo, your offline business AI. Ask me about your sales, profit, expenses, or stock!", sender: 'leo' };
        setMessages([initialMsg]);
        localStorage.removeItem('leo_chat_history');
    };

    return (
        <>
            <style>{`
                .leo-bounce-hover:hover {
                    animation: leo-bounce-small 0.4s ease-in-out infinite;
                }
                @keyframes leo-bounce-small {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .typing-dot {
                    width: 4px;
                    height: 4px;
                    background: #4B2A63;
                    border-radius: 50%;
                    animation: typing 1.4s infinite;
                }
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-4px); }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .notification-badge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 10px;
                    height: 10px;
                    background-color: #EF4444;
                    border: 2px solid white;
                    border-radius: 50%;
                    animation: pulse-red 2s infinite;
                }
                @keyframes pulse-red {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>

            {/* Leo Button (Header Variant) */}
            <div className="relative">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border active:scale-90 transition-all overflow-hidden leo-bounce-hover ${isOpen ? 'bg-[#4B2A63] text-white border-[#4B2A63] shadow-lg shadow-purple-500/20' : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 shadow-sm shadow-green-500/10'}`}
                    aria-label="Ask Leo"
                >
                    <LeoAvatar size={24} />
                </button>
                {hasUnread && !isOpen && <div className="notification-badge" />}
            </div>

            {/* Chat Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[300] pointer-events-none">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/5 pointer-events-auto"
                        />
                        
                        {/* Dropdown Container */}
                        <div className="absolute top-[68px] right-4 w-[300px] sm:w-[340px] pointer-events-none flex flex-col items-end">
                            <motion.div 
                                initial={{ y: -10, opacity: 0, scale: 0.95, transformOrigin: 'top right' }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: -10, opacity: 0, scale: 0.95 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="w-full pointer-events-auto bg-[#E5DDD5] dark:bg-gray-950 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 rounded-[24px] overflow-hidden flex flex-col h-[500px]"
                            >
                                {/* Header */}
                                <div className="p-4 bg-[#075E54] text-white flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 rounded-full p-1">
                                            <LeoAvatar size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[13px] leading-none">Leo</h3>
                                            <p className="text-[9px] opacity-70 mt-1">{isTyping ? 'typing...' : 'online'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => setIsMuted(!isMuted)}
                                            className={`p-2 rounded-full transition-colors ${isMuted ? 'text-red-300 bg-red-500/20' : 'hover:bg-white/10 text-white'}`}
                                            title={isMuted ? "Unmute Leo" : "Mute Leo"}
                                        >
                                            {isMuted ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                            )}
                                        </button>
                                        <button 
                                            onClick={clearHistory}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                            title="Clear Chat"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={() => setIsOpen(false)} 
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#E5DDD5] dark:bg-gray-950 no-scrollbar" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'overlay', backgroundOpacity: 0.1 }}>
                                    {messages.map(m => (
                                        <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-2 px-3 rounded-lg text-[12px] leading-relaxed whitespace-pre-wrap shadow-sm relative ${
                                                m.sender === 'user' 
                                                    ? 'bg-[#DCF8C6] dark:bg-[#056162] text-black dark:text-white rounded-tr-none' 
                                                    : 'bg-white dark:bg-[#262d31] text-black dark:text-white rounded-tl-none'
                                            }`}>
                                                {m.text}
                                                <div className="text-[8px] opacity-40 text-right mt-1">
                                                    {new Date(parseInt(m.id) || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white dark:bg-[#262d31] p-3 rounded-lg rounded-tl-none shadow-sm flex gap-1 items-center">
                                                <div className="typing-dot"></div>
                                                <div className="typing-dot"></div>
                                                <div className="typing-dot"></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-2 bg-[#F0F0F0] dark:bg-[#1e2428] flex gap-2 shrink-0 items-center">
                                    <div className="flex-1 bg-white dark:bg-[#33383b] rounded-full px-4 py-2 flex items-center shadow-sm">
                                        <input 
                                            type="text" 
                                            value={input} 
                                            onChange={handleInputChange}
                                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                                            placeholder="Type a message"
                                            className="flex-1 bg-transparent outline-none text-[13px] text-black dark:text-white"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleSend} 
                                        className="bg-[#075E54] text-white w-10 h-10 rounded-full hover:bg-[#054c44] active:scale-95 transition-all flex items-center justify-center shrink-0 shadow-md"
                                    >
                                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default LeoAI;
