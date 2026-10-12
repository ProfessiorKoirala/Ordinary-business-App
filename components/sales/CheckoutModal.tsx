import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Order, Creditor, BusinessProfile } from '../../types';
import { calculateOrderTotals } from '../../utils/calculationUtils';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import { printOrder } from '../../utils/printUtils';
import PrinterIcon from '../icons/PrinterIcon';
import CloseIcon from '../icons/CloseIcon';
import ShareIcon from '../icons/ShareIcon';
import { Eye, EyeOff } from 'lucide-react';
import { shareBillAsText, shareOnWhatsApp } from '../../utils/shareUtils';
import { triggerHapticFeedback, triggerSuccessFeedback, shareData, isNative } from '../../utils/nativeUtils';
import ConfirmationModal from '../ConfirmationModal';
import PrintableBill from '../PrintableBill';

interface CheckoutModalProps {
    order: Order;
    creditors: Creditor[];
    onClose: () => void;
    onCompleteOrder: (paymentData: { 
        method: PaymentMethod; 
        upfrontPaymentAmount: number; 
        cashAmount?: number; 
        bankAmount?: number; 
        tip?: { amount: number; method: 'Cash' | 'Bank' };
    }) => void;
    isVatEnabled: boolean;
    businessProfile: BusinessProfile;
}

type PaymentMethod = 'Cash' | 'Bank' | 'Credit' | 'Split';
type DeliveryPaymentType = 'FULL' | 'PARTIAL' | 'POD';

const CheckoutModal: React.FC<CheckoutModalProps> = ({ order, creditors, onClose, onCompleteOrder, isVatEnabled, businessProfile }) => {
    const isDelivery = order.type === 'Order';
    const isDineIn = order.type === 'Table';
    const isTakeaway = order.type === 'Takeaway';
    const isRoom = order.type === 'Room';
    
    const isRegisteredCreditor = !!order.creditorId;
    const selectedCreditor = creditors.find(c => c.id === order.creditorId);
    const isCreditDisabled = selectedCreditor?.creditDisabled || false;
    const canUseCredit = isRegisteredCreditor && !isCreditDisabled;

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(isDelivery ? 'Cash' : 'Cash');
    const [deliveryPayType, setDeliveryPayType] = useState<DeliveryPaymentType>('FULL');
    const [partialAdvance, setPartialAdvance] = useState<number | ''>('');
    const [splitCash, setSplitCash] = useState<number | ''>('');
    const [splitBank, setSplitBank] = useState<number | ''>('');
    const [cashReceived, setCashReceived] = useState<number | ''>('');
    const [tipAmount, setTipAmount] = useState<number | ''>('');
    const [tipPaymentMethod, setTipPaymentMethod] = useState<'Cash' | 'Bank'>('Cash');
    const [localDeliveryFee, setLocalDeliveryFee] = useState<number>(order.deliveryFee || 0);
    const [animationStage, setAnimationStage] = useState<'idle' | 'processing' | 'succeeded'>('idle');
    const [showConfirmFinalize, setShowConfirmFinalize] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const { grandTotal } = useMemo(() => {
        return calculateOrderTotals({...order, deliveryFee: isDelivery ? localDeliveryFee : 0}, isVatEnabled);
    }, [order, isVatEnabled, localDeliveryFee, isDelivery]);

    const cashChange = useMemo(() => {
        if (paymentMethod !== 'Cash' || !cashReceived || cashReceived < grandTotal) return 0;
        return cashReceived - grandTotal;
    }, [cashReceived, grandTotal, paymentMethod]);

    const stats = useMemo(() => {
        let paidNow = 0;
        if (isDelivery) {
            if (deliveryPayType === 'FULL') paidNow = grandTotal;
            else if (deliveryPayType === 'PARTIAL') paidNow = Number(partialAdvance) || 0;
            else paidNow = 0;
        } else {
            paidNow = paymentMethod === 'Credit' ? 0 : grandTotal;
        }
        
        const validatedPaidNow = Math.min(paidNow, grandTotal);
        const remainingToCollect = Math.max(0, grandTotal - validatedPaidNow);
        const riderDuty = isDelivery ? localDeliveryFee : 0; 

        return { 
            paidNow: validatedPaidNow, 
            remaining: remainingToCollect,
            riderDuty
        };
    }, [isDelivery, deliveryPayType, partialAdvance, grandTotal, localDeliveryFee, paymentMethod]);

    const isPaymentDisabled = useMemo(() => {
        if (animationStage !== 'idle') return true;
        
        if (isDelivery) {
            if (deliveryPayType === 'PARTIAL') {
                if (!partialAdvance || partialAdvance <= 0 || partialAdvance >= grandTotal) return true;
            }
            if (deliveryPayType === 'POD') return false; 
        }
        
        if (paymentMethod === 'Split') {
            const c = Number(splitCash) || 0;
            const b = Number(splitBank) || 0;
            return Math.abs((c + b) - stats.paidNow) > 0.01;
        }

        if (paymentMethod === 'Cash' && (isDineIn || isTakeaway || isRoom)) {
            if (cashReceived !== '' && cashReceived < grandTotal) return true;
        }

        if (paymentMethod === 'Credit' && !canUseCredit) return true;

        return false;
    }, [isDelivery, deliveryPayType, partialAdvance, grandTotal, animationStage, paymentMethod, splitCash, splitBank, cashReceived, isDineIn, isTakeaway, canUseCredit, stats.paidNow]);

    const handlePrintCurrent = () => {
        const orderToPrint = {
            ...order,
            deliveryFee: isDelivery ? localDeliveryFee : 0,
            grandTotal,
            advanceAmount: stats.paidNow,
            paymentMethod: paymentMethod
        };
        printOrder(orderToPrint, businessProfile, isVatEnabled);
    };

    const handleFinalize = () => {
        triggerSuccessFeedback();
        setShowConfirmFinalize(false);
        setAnimationStage('processing');
        
        onCompleteOrder({
            method: paymentMethod,
            upfrontPaymentAmount: stats.paidNow,
            cashAmount: paymentMethod === 'Split' ? (Number(splitCash) || 0) : (paymentMethod === 'Cash' ? stats.paidNow : undefined),
            bankAmount: paymentMethod === 'Split' ? (Number(splitBank) || 0) : (paymentMethod === 'Bank' ? stats.paidNow : undefined),
            tip: tipAmount ? { amount: Number(tipAmount), method: tipPaymentMethod } : undefined
        });
        setTimeout(() => setAnimationStage('succeeded'), 1200);
    };

    const handleShare = async () => {
        triggerHapticFeedback();
        const billData = {
            ...order,
            deliveryFee: isDelivery ? localDeliveryFee : 0,
            grandTotal,
            advanceAmount: stats.paidNow,
            paymentMethod: paymentMethod
        };
        const billText = shareBillAsText(billData, businessProfile);
        
        if (isNative()) {
            await shareData('Receipt', billText);
        } else {
            shareOnWhatsApp(billText);
        }
    };

    const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-end justify-center font-sans animate-fade-in" onClick={onClose}>
            {showConfirmFinalize && (
                <ConfirmationModal 
                    title="Complete Transaction?"
                    message={`Are you sure you want to finalize this ${formatCurrency(grandTotal)} settlement? This will register the sale and update inventory.`}
                    onConfirm={handleFinalize}
                    onCancel={() => setShowConfirmFinalize(false)}
                    confirmText="Yes, Complete"
                    cancelText="No, Go Back"
                />
            )}
            <div className="bg-white dark:bg-gray-950 rounded-t-[48px] shadow-2xl w-full max-lg overflow-hidden animate-slide-up transition-colors" onClick={e => e.stopPropagation()}>
                {animationStage === 'succeeded' ? (
                    <div className="p-12 text-center flex flex-col gap-8 items-center animate-fade-in">
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="bg-green-50 dark:bg-green-900/20 p-10 rounded-full"
                        >
                            <CheckCircleIcon className="w-24 h-24 text-green-500" />
                        </motion.div>
                        
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">
                                {isDelivery ? 'DISPATCHED' : (paymentMethod === 'Credit' ? 'REGISTERED' : 'SETTLED')}
                            </h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Transaction Complete</p>
                        </div>

                        <div className="w-full max-w-xs space-y-4 pt-4">
                            <button 
                                onClick={() => {
                                    const finalOrderToPrint = {
                                        ...order,
                                        deliveryFee: isDelivery ? localDeliveryFee : 0,
                                        grandTotal,
                                        advanceAmount: stats.paidNow,
                                        paymentMethod: paymentMethod
                                    };
                                    printOrder(finalOrderToPrint, businessProfile, isVatEnabled, onClose);
                                }} 
                                className="w-full py-7 bg-black dark:bg-white text-white dark:text-black font-black rounded-[36px] shadow-2xl text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 transition-all hover:opacity-90"
                            >
                                <PrinterIcon className="w-6 h-6"/> Print Bill
                            </button>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={handleShare}
                                    className="py-5 bg-green-500 text-white font-black rounded-[28px] shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    <ShareIcon className="w-4 h-4"/> WhatsApp
                                </button>
                                <button 
                                    onClick={onClose} 
                                    className="py-5 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-black rounded-[28px] text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                                >
                                    Skip Print
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.6em] mt-4 italic">OB Pro Terminal v2.0</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <header className="px-10 pt-12 pb-6 flex justify-between items-start border-b dark:border-gray-800">
                            <div>
                                <h2 className="text-4xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">
                                    {isDelivery ? 'Logistics' : 'Settlement'}
                                </h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3">
                                    {isDelivery ? 'OB Pro Dispatch' : (isDineIn ? 'OB Pro Dine-In' : 'OB Pro POS')}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => {
                                        triggerHapticFeedback();
                                        setShowPreview(!showPreview);
                                    }}
                                    title="Toggle Bill Preview"
                                    className={`p-3 rounded-2xl transition-all active:scale-90 ${showPreview ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
                                >
                                    {showPreview ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                                </button>
                                <button 
                                    onClick={() => {
                                        triggerHapticFeedback();
                                        handlePrintCurrent();
                                    }}
                                    title="Print Current Bill"
                                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-black dark:text-white active:scale-90 transition-all border border-gray-100 dark:border-gray-700"
                                >
                                    <PrinterIcon className="w-6 h-6" />
                                </button>
                                <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 active:scale-90 transition-all">
                                    <CloseIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </header>

                        <main className="px-10 py-8 space-y-8 max-h-[65vh] overflow-y-auto no-scrollbar pb-12">
                            {showPreview ? (
                                <div className="flex flex-col items-center animate-fade-in py-4">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Thermal Bill Preview (80mm)</p>
                                    <div className="bg-white p-4 shadow-2xl border border-gray-100 dark:border-gray-800 max-w-[320px] w-full">
                                        <PrintableBill 
                                            order={{
                                                ...order,
                                                deliveryFee: isDelivery ? localDeliveryFee : 0,
                                                grandTotal,
                                                advanceAmount: stats.paidNow,
                                                paymentMethod: paymentMethod
                                            }} 
                                            businessProfile={businessProfile} 
                                            isVatEnabled={isVatEnabled} 
                                        />
                                    </div>
                                    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20 max-w-xs text-center">
                                        <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] leading-relaxed">
                                            This is a digital representation of the thermal receipt. Actual print quality depends on your printer.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={`grid ${isDelivery ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">TOTAL BILL</p>
                                        <p className="text-2xl font-black text-black dark:text-white italic">{formatCurrency(grandTotal)}</p>
                                    </div>
                                    {!isDelivery && paymentMethod === 'Cash' && cashChange > 0 && (
                                        <div className="text-right animate-fade-in">
                                            <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1">RETURN CHANGE</p>
                                            <p className="text-2xl font-black text-green-500 italic">{formatCurrency(cashChange)}</p>
                                        </div>
                                    )}
                                </div>
                                {isDelivery && (
                                    <div className={`p-6 rounded-[32px] border transition-colors ${stats.remaining > 0 ? 'bg-red-50 border-red-100 dark:bg-red-900/10' : 'bg-green-50 border-green-100 dark:bg-green-900/10'}`}>
                                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${stats.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            TO COLLECT
                                        </p>
                                        <p className={`text-2xl font-black italic ${stats.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(stats.remaining)}</p>
                                    </div>
                                )}
                            </div>

                            {isDelivery && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="space-y-4">
                                        <p className="text-xs font-black text-black dark:text-white uppercase tracking-widest ml-1">Advance Type</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'FULL', label: 'FULL PAYMENT' },
                                                { id: 'PARTIAL', label: 'PARTIAL ADV.' },
                                                { id: 'POD', label: 'PAY ON DEL.' }
                                            ].map(type => (
                                                <button 
                                                    key={type.id} 
                                                    onClick={() => setDeliveryPayType(type.id as DeliveryPaymentType)}
                                                    className={`py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${deliveryPayType === type.id ? 'bg-black text-white border-black' : 'bg-white dark:bg-gray-900 text-gray-400 border-gray-100 dark:border-gray-800'}`}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {deliveryPayType === 'PARTIAL' && (
                                        <div className="animate-fade-in space-y-1.5 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-900/20">
                                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">COLLECTED ADVANCE (₹)</p>
                                            <input 
                                                type="number"
                                                value={partialAdvance}
                                                onChange={e => setPartialAdvance(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                placeholder="Enter amount paid now..."
                                                className="w-full bg-white dark:bg-gray-800 rounded-2xl py-4 px-5 font-black text-xl outline-none border-2 border-transparent focus:border-blue-500 text-black dark:text-white shadow-sm"
                                            />
                                            <div className="flex justify-between items-center mt-3 px-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Balance to Collect:</span>
                                                <span className="text-sm font-black text-red-500 italic">{formatCurrency(stats.remaining)}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center ml-1">
                                            <p className="text-xs font-black text-black dark:text-white uppercase tracking-widest">Delivery Charge</p>
                                            <p className="text-[10px] font-black text-blue-600 uppercase">RIDER DUTY: {formatCurrency(stats.riderDuty)}</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-2 rounded-3xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex-1 flex gap-1 p-1">
                                                {[0, 40, 60, 100].map(fee => (
                                                    <button 
                                                        key={fee} 
                                                        onClick={() => setLocalDeliveryFee(fee)}
                                                        className={`flex-1 py-3 text-[10px] font-black rounded-2xl transition-all ${localDeliveryFee === fee ? 'bg-black text-white shadow-md' : 'text-gray-400'}`}
                                                    >
                                                        {fee === 0 ? 'FREE' : `₹${fee}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {stats.paidNow > 0 && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="flex justify-between items-center ml-1">
                                        <p className="text-xs font-black text-black dark:text-white uppercase tracking-widest">
                                            {isDelivery ? `Method for ${formatCurrency(stats.paidNow)} Advance` : 'Payment Method'}
                                        </p>
                                        {paymentMethod === 'Credit' && !canUseCredit && (
                                            <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">
                                                {!isRegisteredCreditor ? 'SELECT CREDITOR FIRST' : 'CREDIT DISABLED FOR THIS CREDITOR'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 p-1 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-700">
                                        {(['Cash', 'Bank', 'Split', 'Credit'] as PaymentMethod[]).map(m => (
                                            <button 
                                                key={m} 
                                                onClick={() => {
                                                    triggerHapticFeedback();
                                                    setPaymentMethod(m);
                                                }} 
                                                disabled={m === 'Credit' && !canUseCredit}
                                                className={`py-3.5 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${paymentMethod === m ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-400'} ${m === 'Credit' && !canUseCredit ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>

                                    {paymentMethod === 'Cash' && !isDelivery && (
                                        <div className="animate-fade-in space-y-1.5 mt-4">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">CASH RECEIVED</p>
                                            <input 
                                                type="number"
                                                value={cashReceived}
                                                onChange={e => setCashReceived(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                placeholder="Enter amount given by customer..."
                                                className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl py-4 px-5 font-black text-lg outline-none border-2 border-transparent focus:border-black text-black dark:text-white shadow-inner"
                                            />
                                        </div>
                                    )}

                                    {paymentMethod === 'Split' && (
                                        <div className="animate-fade-in grid grid-cols-2 gap-3 mt-4">
                                            <div className="space-y-1.5">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">CASH PORTION</p>
                                                <input 
                                                    type="number"
                                                    value={splitCash}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value);
                                                        setSplitCash(isNaN(val) ? '' : val);
                                                        if (!isNaN(val)) setSplitBank(Math.max(0, stats.paidNow - val));
                                                    }}
                                                    placeholder="0.00"
                                                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl py-4 px-5 font-black text-lg outline-none border-2 border-transparent focus:border-black text-black dark:text-white shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">BANK PORTION</p>
                                                <input 
                                                    type="number"
                                                    value={splitBank}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value);
                                                        setSplitBank(isNaN(val) ? '' : val);
                                                        if (!isNaN(val)) setSplitCash(Math.max(0, stats.paidNow - val));
                                                    }}
                                                    placeholder="0.00"
                                                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl py-4 px-5 font-black text-lg outline-none border-2 border-transparent focus:border-black text-black dark:text-white shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4 p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-[32px] border border-yellow-100 dark:border-yellow-900/20 animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-black text-yellow-600 uppercase tracking-widest ml-1">Add Tip (Optional)</p>
                                    {tipAmount !== '' && (
                                        <div className="flex gap-2">
                                            {(['Cash', 'Bank'] as const).map(m => (
                                                <button 
                                                    key={m} 
                                                    onClick={() => setTipPaymentMethod(m)}
                                                    className={`px-3 py-1 text-[8px] font-black rounded-full transition-all ${tipPaymentMethod === m ? 'bg-yellow-600 text-white' : 'bg-white dark:bg-gray-800 text-yellow-600'}`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="number"
                                    value={tipAmount}
                                    onChange={e => setTipAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    placeholder="0.00"
                                    className="w-full bg-white dark:bg-gray-800 rounded-2xl py-4 px-5 font-black text-xl outline-none border-2 border-transparent focus:border-yellow-500 text-black dark:text-white shadow-sm"
                                />
                            </div>
                        </>
                    )}
                </main>

                        <footer className="px-10 pb-12 pt-4 shrink-0 bg-white dark:bg-gray-950 border-t dark:border-gray-900">
                             <div className="flex justify-between items-center mb-6 px-1">
                                <div className="leading-none">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                        {paymentMethod === 'Credit' ? 'CREDIT VALUE' : (isDelivery ? 'COLLECTED NOW' : 'TOTAL PAYABLE')}
                                    </p>
                                    <p className="text-3xl font-black text-black dark:text-white italic">
                                        {formatCurrency(isDelivery ? stats.paidNow : grandTotal)}
                                    </p>
                                </div>
                                {isDelivery ? (
                                    <div className="text-right leading-none">
                                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">DUE AT DOOR</p>
                                        <p className="text-xl font-black text-red-500 italic">{formatCurrency(stats.remaining)}</p>
                                    </div>
                                ) : paymentMethod !== 'Credit' && (
                                    <div className="text-right leading-none">
                                        <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">SETTLED</p>
                                        <p className="text-xs font-bold text-gray-400 uppercase">NO DUE AMOUNT</p>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => setShowConfirmFinalize(true)} 
                                disabled={isPaymentDisabled} 
                                className={`w-full py-8 font-black rounded-[36px] transition-all shadow-2xl text-xs uppercase tracking-[0.5em] ${animationStage === 'processing' ? 'bg-green-50 text-white' : (paymentMethod === 'Credit' ? 'bg-purple-600 text-white' : 'bg-black dark:bg-white text-white dark:text-black')} disabled:opacity-10`}
                            >
                                {animationStage === 'processing' ? 'Validating...' : (paymentMethod === 'Credit' ? 'Finalize Credit Entry' : 'Finalize Settlement')}
                            </button>
                        </footer>
                    </div>
                )}
            </div>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>,
        document.body
    );
};

export default CheckoutModal;