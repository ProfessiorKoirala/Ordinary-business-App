import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Table, KOT } from '../types';
import HomeIcon from '../components/icons/HomeIcon';
import { motion, AnimatePresence } from 'motion/react';

interface KitchenScreenProps {
    kots: KOT[];
    tables: Table[];
    onUpdateKOTStatus: (kotId: string, status: OrderStatus) => void;
    onHome: () => void;
}

const KitchenScreen: React.FC<KitchenScreenProps> = ({ kots, tables, onUpdateKOTStatus, onHome }) => {
    const [now, setNow] = useState(Date.now());
    const activeKots = kots.filter(k => {
        const isPendingOrProcessing = k.status === 'Pending' || k.status === 'Processing';
        if (!isPendingOrProcessing) return false;
        
        // If it has a table name, check if that table is still occupied
        if (k.tableName) {
            const table = tables.find(t => t.name === k.tableName);
            // If table is found and it's Free, hide the KOT (it was finalized/checked out)
            if (table && table.status === 'Free') return false;
        }
        return true;
    });
    const [lastKotTimestamp, setLastKotTimestamp] = useState(Math.max(0, ...activeKots.map(k => k.timestamp)));

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 10000); // Update every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const currentMaxTimestamp = Math.max(0, ...activeKots.map(k => k.timestamp));
        if (currentMaxTimestamp > lastKotTimestamp) {
            // Play sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio play blocked or failed:', e));
        }
        setLastKotTimestamp(currentMaxTimestamp);
    }, [activeKots, lastKotTimestamp]);

    const getElapsedTime = (timestamp: number) => {
        const diff = Math.floor((now - timestamp) / 60000);
        if (diff < 1) return 'Just now';
        return `${diff}m ago`;
    };

    return (
        <div className="p-4 pb-24 bg-gray-50 min-h-full font-sans">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-black text-black italic uppercase tracking-tighter">Kitchen <span className="text-[14px] bg-black text-white px-2 py-0.5 rounded ml-1">Display</span></h1>
                        <div className="flex gap-1.5">
                            <span className="bg-green-100 text-green-600 text-[8px] font-black px-2 py-0.5 rounded italic uppercase flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Live Sync
                            </span>
                            <span className="bg-blue-100 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded italic uppercase flex items-center gap-1">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                                Sound On
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MANAGE LIVE KOTS</p>
                </div>
                <button onClick={onHome} className="p-3 bg-white rounded-2xl text-gray-400 hover:text-black transition-all shadow-sm border border-gray-100">
                    <HomeIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                    {activeKots.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="col-span-full bg-white p-12 rounded-[32px] border border-gray-100 text-center flex flex-col items-center justify-center"
                        >
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            </div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No Active KOTs</p>
                            <p className="text-gray-300 text-xs mt-1">Waiting for new orders to arrive...</p>
                        </motion.div>
                    ) : (
                        activeKots.map(kot => {
                            const isProcessing = kot.status === 'Processing';
                            
                            return (
                                <motion.div 
                                    key={kot.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`bg-white rounded-[24px] overflow-hidden shadow-sm border-2 transition-all ${isProcessing ? 'border-blue-500 shadow-blue-100' : 'border-gray-100'}`}
                                >
                                    <div className={`p-2.5 flex justify-between items-center ${isProcessing ? 'bg-blue-500 text-white' : 'bg-gray-50 text-black'}`}>
                                        <div>
                                            <h3 className="font-black italic uppercase tracking-tighter text-lg leading-tight">{kot.tableName}</h3>
                                            <div className="flex items-center gap-1.5">
                                                <p className={`text-[9px] font-bold uppercase tracking-widest ${isProcessing ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    KOT #{kot.kotNumber} • {new Date(kot.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                                <span className={`w-0.5 h-0.5 rounded-full ${isProcessing ? 'bg-blue-200' : 'bg-gray-300'}`}></span>
                                                <p className={`text-[9px] font-black uppercase tracking-widest ${isProcessing ? 'text-white' : 'text-red-500'}`}>
                                                    {getElapsedTime(kot.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isProcessing ? 'bg-white text-blue-500' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {kot.status}
                                            </div>
                                            {kot.type === 'UPDATE' && (
                                                <div className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest animate-pulse shadow-sm">
                                                    Update
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <ul className="space-y-1.5 mb-4">
                                            {kot.items.map((item, idx) => (
                                                <li key={idx} className="flex justify-between items-start border-b border-gray-50 pb-1.5 last:border-0 last:pb-0">
                                                    <div className="text-sm">
                                                        <span className="font-black text-black">{item.quantity}x</span>
                                                        <span className="ml-1.5 font-bold text-gray-700">{item.name}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        <div className="flex gap-1.5">
                                            {kot.status === 'Pending' ? (
                                                <button 
                                                    onClick={() => onUpdateKOTStatus(kot.id, 'Processing')}
                                                    className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-black italic uppercase tracking-tighter text-xs active:scale-95 transition-all"
                                                >
                                                    Start
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => onUpdateKOTStatus(kot.id, 'Ready')}
                                                    className="flex-1 py-2 bg-green-500 text-white rounded-xl font-black italic uppercase tracking-tighter text-xs active:scale-95 transition-all"
                                                >
                                                    Done
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default KitchenScreen;
