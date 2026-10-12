import React, { useState, useMemo } from 'react';
import { Tip, Staff, BusinessProfile, TipDistributionType } from '../types';
import HomeIcon from '../components/icons/HomeIcon';
import { motion, AnimatePresence } from 'motion/react';

interface TipPoolScreenProps {
    tips: Tip[];
    staff: Staff[];
    onAddTip: (tip: Omit<Tip, 'id'>) => void;
    onDeleteTip: (id: string) => void;
    onUpdateTip: (tip: Tip) => void;
    onHome: () => void;
    businessProfile: BusinessProfile;
    defaultDistribution: TipDistributionType;
}

const TipPoolScreen: React.FC<TipPoolScreenProps> = ({ tips, staff, onAddTip, onDeleteTip, onUpdateTip, onHome, businessProfile, defaultDistribution }) => {
    const [amount, setAmount] = useState('');
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank'>('Cash');
    const [distributionType, setDistributionType] = useState<TipDistributionType>(defaultDistribution);
    const [isAdding, setIsAdding] = useState(false);

    const poolTips = useMemo(() => (tips || []).filter(t => !t.isDistributed), [tips]);
    const totalPool = useMemo(() => poolTips.reduce((sum, t) => sum + (t.amount || 0), 0), [poolTips]);
    const totalBusinessProfitFromTips = useMemo(() => (tips || []).reduce((sum, t) => sum + (t.businessShare || 0), 0), [tips]);

    const handleAdd = () => {
        if (!amount || isNaN(Number(amount))) return;
        const amt = Number(amount);
        
        const businessShare = distributionType === 'BUSINESS_ONLY' ? amt : (distributionType === 'SPLIT_50_50' ? amt / 2 : 0);
        const staffShare = distributionType === 'STAFF_ONLY' ? amt : (distributionType === 'SPLIT_50_50' ? amt / 2 : (distributionType === 'POOL' ? amt : 0));

        onAddTip({
            amount: amt,
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now(),
            staffId: selectedStaffId || undefined,
            notes,
            paymentMethod,
            distributionType,
            businessShare,
            staffShare,
            isDistributed: distributionType === 'BUSINESS_ONLY'
        });
        setAmount('');
        setSelectedStaffId('');
        setNotes('');
        setIsAdding(false);
    };

    const handleDistributePool = () => {
        if (poolTips.length === 0 || (staff || []).length === 0) return;
        
        const activeStaff = (staff || []).filter(s => s.status === 'Active');
        if (activeStaff.length === 0) return;

        const amountToDistribute = poolTips.reduce((sum, t) => sum + (t.staffShare || t.amount || 0), 0);
        const perStaff = amountToDistribute / activeStaff.length;

        // Mark all pool tips as distributed
        poolTips.forEach(tip => {
            onUpdateTip({
                ...tip,
                isDistributed: true,
                distributedAt: Date.now()
            });
        });

        alert(`Distributed ₹${amountToDistribute.toLocaleString()} equally among ${activeStaff.length} active staff members (₹${perStaff.toLocaleString()} each).`);
    };

    return (
        <div className="p-4 pb-24 bg-gray-50 min-h-full font-sans">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-black text-black italic uppercase tracking-tighter">Tip <span className="text-[14px] bg-black text-white px-2 py-0.5 rounded ml-1">Pool</span></h1>
                        <span className="bg-black text-white text-[8px] font-black px-2 py-0.5 rounded italic uppercase">Gratuity</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MANAGE STAFF TIPS & GRATUITY</p>
                </div>
                <button onClick={onHome} className="p-3 bg-white rounded-2xl text-gray-400 hover:text-black transition-all shadow-sm border border-gray-100">
                    <HomeIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-black text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Current Staff Pool</p>
                        <h2 className="text-4xl font-black italic tracking-tighter">₹{totalPool.toLocaleString()}</h2>
                        <button 
                            onClick={handleDistributePool}
                            disabled={totalPool <= 0 || (staff || []).length === 0}
                            className="mt-4 w-full py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all disabled:opacity-50"
                        >
                            Distribute to Staff
                        </button>
                    </div>
                    <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-green-600 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Business Tip Profit</p>
                        <h2 className="text-4xl font-black italic tracking-tighter">₹{totalBusinessProfitFromTips.toLocaleString()}</h2>
                        <p className="text-[8px] font-bold uppercase opacity-70 mt-2">Added to overall business health</p>
                    </div>
                    <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-black/10 rounded-full blur-3xl"></div>
                </div>

                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-white p-6 rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-black transition-all group"
                >
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                    </div>
                    <span className="font-black text-black italic uppercase tracking-tight">Add New Tip</span>
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
                            <h3 className="text-2xl font-black text-black italic uppercase tracking-tighter mb-6">Record Tip</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">Amount (₹)</label>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-gray-50 border-none rounded-3xl px-6 py-4 font-bold text-lg focus:ring-2 focus:ring-black transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">Distribution</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'POOL', label: 'Staff Pool' },
                                            { id: 'STAFF_ONLY', label: 'Staff Only' },
                                            { id: 'BUSINESS_ONLY', label: 'Business' },
                                            { id: 'SPLIT_50_50', label: '50/50 Split' }
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setDistributionType(type.id as TipDistributionType)}
                                                className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all ${distributionType === type.id ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">Assign to Staff (Optional)</label>
                                    <select 
                                        value={selectedStaffId}
                                        onChange={(e) => setSelectedStaffId(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-3xl px-6 py-4 font-bold focus:ring-2 focus:ring-black transition-all appearance-none"
                                    >
                                        <option value="">General Pool</option>
                                        {(staff || []).map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">Payment Method</label>
                                    <div className="flex gap-2">
                                        {(['Cash', 'Bank'] as const).map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setPaymentMethod(m)}
                                                className={`flex-1 py-3 rounded-2xl font-black italic uppercase tracking-tight transition-all ${paymentMethod === m ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">Notes</label>
                                    <input 
                                        type="text" 
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Table number, event, etc."
                                        className="w-full bg-gray-50 border-none rounded-3xl px-6 py-4 font-bold focus:ring-2 focus:ring-black transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button 
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-4 rounded-3xl font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAdd}
                                    className="flex-1 py-4 bg-black text-white rounded-3xl font-black italic uppercase tracking-tighter shadow-xl active:scale-95 transition-all"
                                >
                                    Save Tip
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 mb-2">Recent Tips</h3>
                {(tips || []).length === 0 ? (
                    <div className="bg-white p-12 rounded-[32px] border border-gray-100 text-center">
                        <p className="text-gray-400 font-bold">No tips recorded yet.</p>
                    </div>
                ) : (
                    (tips || []).slice().reverse().map(tip => {
                        const staffMember = (staff || []).find(s => s.id === tip.staffId);
                        return (
                            <div key={tip.id} className={`bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex items-center justify-between group ${tip.isDistributed ? 'opacity-60' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-lg ${tip.paymentMethod === 'Cash' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {tip.paymentMethod === 'Cash' ? 'C' : 'B'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-black italic uppercase tracking-tight">₹{(tip.amount || 0).toLocaleString()}</h4>
                                            <span className="text-[8px] font-black bg-gray-100 px-1.5 py-0.5 rounded uppercase">{(tip.distributionType || 'POOL').replace('_', ' ')}</span>
                                            {tip.isDistributed && <span className="text-[8px] font-black bg-green-100 text-green-600 px-1.5 py-0.5 rounded uppercase">Distributed</span>}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {staffMember ? `For: ${staffMember.name}` : 'General Pool'} • {new Date(tip.timestamp).toLocaleDateString()}
                                        </p>
                                        {tip.notes && <p className="text-[10px] text-gray-500 mt-1 italic">"{tip.notes}"</p>}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onDeleteTip(tip.id)}
                                    className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TipPoolScreen;
