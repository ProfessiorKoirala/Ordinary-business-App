import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MainView, Order, OrderItem, Product, Creditor, Customer, Discount, Table, Vendor, BusinessSettings, OrderStatus, DeliveryPartner, BusinessProfile, Room, RoomCategory } from '../../types';
import AddProductModal from './AddProductModal';
import ContactSearchModal from './CreditorSearchModal';
import ConfirmationModal from '../ConfirmationModal';
import PlusCircleIcon from '../icons/PlusCircleIcon';
import ApplyDiscountModal from './ApplyDiscountModal';
import SettingsIcon from '../icons/SettingsIcon';
import { calculateOrderTotals } from '../../utils/calculationUtils';
import AssignPartnerModal from '../delivery/AssignPartnerModal';
import { triggerHapticFeedback } from '../../utils/nativeUtils';
import PrinterIcon from '../icons/PrinterIcon';
import { printOrder } from '../../utils/printUtils';
import OrderBarcodeScannerModal from './OrderBarcodeScannerModal';
import CameraIcon from '../icons/CameraIcon';

interface OrderEditorProps {
    order: Order;
    products: Product[];
    tables: Table[];
    creditors: Creditor[];
    customers: Customer[];
    vendors: Vendor[];
    deliveryPartners?: DeliveryPartner[];
    discounts: Discount[];
    rooms?: Room[];
    roomCategories?: RoomCategory[];
    allOrders: Order[];
    onUpdateOrder: (order: Order) => void;
    onBack: () => void;
    onCheckout: () => void;
    isVatEnabled: boolean;
    isKotEnabled: boolean;
    onSave?: () => void;
    onPrintKot?: (order: Order) => void;
    isTableOccupied?: boolean;
    onAddProductClick: () => void;
    isDesktop?: boolean;
    setCurrentView?: (view: MainView) => void;
    isEditing?: boolean;
    onUpdateAndSaveOrder?: (order: Order) => void;
    showFooter?: boolean;
    onUpdateSettings: (updates: Partial<BusinessSettings>) => void;
    businessSettings: BusinessSettings;
    onEditorToggle?: (isActive: boolean) => void;
    businessProfile: BusinessProfile;
}

const BackIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

const ChevronDownIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
);

const TimePicker12h: React.FC<{ value: string, onChange: (val: string) => void, label: string }> = ({ value, onChange, label }) => {
    const h24 = value ? parseInt(value.split(':')[0]) : 12;
    const minutes = value ? value.split(':')[1] : '00';
    const hours12 = h24 % 12 || 12;
    const ampm = h24 >= 12 ? 'PM' : 'AM';

    const handleHourChange = (h: number) => {
        let newH24 = h % 12;
        if (ampm === 'PM') newH24 += 12;
        onChange(`${newH24.toString().padStart(2, '0')}:${minutes}`);
    };

    const handleMinuteChange = (m: string) => {
        onChange(`${h24.toString().padStart(2, '0')}:${m}`);
    };

    const toggleAmpm = () => {
        let newH24 = h24;
        if (ampm === 'AM') newH24 += 12;
        else newH24 -= 12;
        onChange(`${newH24.toString().padStart(2, '0')}:${minutes}`);
    };

    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</p>
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700 shadow-sm">
                <select 
                    value={hours12} 
                    onChange={e => handleHourChange(parseInt(e.target.value))}
                    className="flex-1 bg-transparent text-[11px] font-black outline-none py-2 px-1 text-center dark:text-white"
                >
                    {Array.from({ length: 12 }).map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
                <span className="text-gray-400">:</span>
                <select 
                    value={minutes} 
                    onChange={e => handleMinuteChange(e.target.value)}
                    className="flex-1 bg-transparent text-[11px] font-black outline-none py-2 px-1 text-center dark:text-white"
                >
                    {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <button 
                    type="button"
                    onClick={toggleAmpm}
                    className={`px-3 py-2 rounded-lg text-[9px] font-black transition-all ${ampm === 'AM' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'}`}
                >
                    {ampm}
                </button>
            </div>
        </div>
    );
};

const OrderEditor: React.FC<OrderEditorProps> = (props) => {
    const { 
        order, products, tables, rooms = [], roomCategories = [], allOrders = [], creditors, customers, vendors, 
        deliveryPartners = [], discounts, onUpdateOrder, onBack, onCheckout, isVatEnabled, isKotEnabled, 
        onSave, onPrintKot, isTableOccupied, onAddProductClick, isDesktop, setCurrentView, 
        isEditing, onUpdateAndSaveOrder, onUpdateSettings, businessSettings, onEditorToggle, 
        businessProfile, showFooter = true
    } = props;
    
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [isScannerOpen, setScannerOpen] = useState(false);
    const [isContactModalOpen, setContactModalOpen] = useState(false);
    const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
    const [isQuickSettingsOpen, setQuickSettingsOpen] = useState(false);
    const [isBackConfirmOpen, setBackConfirmOpen] = useState(false);
    const [isPartnerModalOpen, setPartnerModalOpen] = useState(false);
    const [matchPopupContact, setMatchPopupContact] = useState<{ id: string, name: string, phone: string, type: string } | null>(null);

    // Track the initial state to allow reverting/discarding
    const initialOrderRef = useRef<string>(JSON.stringify(order));
    
    // STARTING CLOSED FOR CLEAN LOOK
    const [isContactExpanded, setContactExpanded] = useState(false);
    const [isRoomDetailsExpanded, setRoomDetailsExpanded] = useState(true);

    const today = new Date().toISOString().split('T')[0];
    const isFutureReservation = order.type === 'Room' && order.checkInDate && order.checkInDate > today;

    useEffect(() => {
        if (isFutureReservation) {
            setContactExpanded(false);
            setRoomDetailsExpanded(false);
        } else if (order.type === 'Room') {
            setContactExpanded(true);
            setRoomDetailsExpanded(true);
        }
    }, [order.id]);

    useEffect(() => {
        onEditorToggle?.(true);
        return () => onEditorToggle?.(false);
    }, [onEditorToggle]);

    useEffect(() => {
        if (order.type === 'Room' && order.checkInDate) {
            const today = new Date().toISOString().split('T')[0];
            if (order.checkInDate > today && order.roomBookingStatus === 'Checked-In') {
                onUpdateOrder({ ...order, roomBookingStatus: 'Reserved' });
            } else if (order.checkInDate === today && order.roomBookingStatus === 'Reserved') {
                // We don't auto check-in, but we could suggest it.
            }
        }
    }, [order.checkInDate]);

    const handleBackWithCheck = () => {
        const currentOrderStr = JSON.stringify(order);
        if (currentOrderStr !== initialOrderRef.current) {
            setBackConfirmOpen(true);
        } else {
            onBack();
        }
    };

    const handleDiscardAndGoBack = () => {
        try {
            // Explicitly revert the parent state to the original before closing
            const originalOrder = JSON.parse(initialOrderRef.current);
            onUpdateOrder(originalOrder);
            onBack();
        } catch (e) {
            console.error("Failed to restore original order", e);
            onBack();
        }
    };

    const handlePrintBill = () => {
        if (order.items.length === 0) return alert("Basket is empty.");
        printOrder(order, businessProfile, businessSettings.isVatEnabled);
    };

    const handleItemQuantityChange = (productId: string, change: 1 | -1) => {
        triggerHapticFeedback();
        const existingItem = order.items.find(item => item.product.id === productId);
        const productData = products.find(p => p.id === productId);
        
        if (!productData) return;

        let newItems: OrderItem[];
        if (existingItem) {
            const newQuantity = existingItem.quantity + change;
            
            if (change === 1 && productData.trackStock && newQuantity > (productData.stock || 0)) {
                // Using a state-based error instead of blocking alert
                return;
            }

            if (newQuantity <= 0) {
                newItems = order.items.filter(item => item.product.id !== productId);
            } else {
                newItems = order.items.map(item => item.product.id === productId ? { ...item, quantity: newQuantity } : item);
            }
        } else if (change === 1) {
            if (productData.trackStock && (productData.stock || 0) <= 0) {
                return;
            }
            newItems = [...order.items, { product: productData, quantity: 1, status: 'Active' }];
        } else {
            newItems = order.items;
        }
        onUpdateOrder({ ...order, items: newItems });
    };

    const handleAddItem = (product: Product) => { handleItemQuantityChange(product.id, 1); };
    
    const handleNameBlur = () => {
        if (!order.customerName || order.customerId || order.creditorId || order.vendorId) return;

        const name = order.customerName.toLowerCase().trim();
        const existing = [
            ...customers.map(c => ({...c, type: 'customer'})),
            ...creditors.map(c => ({...c, type: 'creditor'})),
            ...vendors.map(v => ({...v, type: 'vendor'}))
        ].find(c => c.name.toLowerCase() === name);

        if (existing) {
            setMatchPopupContact({ id: existing.id, name: existing.name, phone: existing.phone, type: existing.type });
        }
    };

    const handleConfirmMatch = () => {
        if (matchPopupContact) {
            onUpdateOrder({
                ...order,
                customerId: matchPopupContact.type === 'customer' ? matchPopupContact.id : undefined,
                creditorId: matchPopupContact.type === 'creditor' ? matchPopupContact.id : undefined,
                vendorId: matchPopupContact.type === 'vendor' ? matchPopupContact.id : undefined,
                customerName: matchPopupContact.name,
                customerPhone: matchPopupContact.phone
            });
            setMatchPopupContact(null);
        }
    };

    const calculateNights = (checkIn: string, checkOut: string) => {
        if (!checkIn || !checkOut) return 1;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 0 ? 1 : diffDays;
    };

    const [isCancelling, setIsCancelling] = useState(false);
    const [isChangingRoom, setIsChangingRoom] = useState(false);
    const [refundAmount, setRefundAmount] = useState(order.advanceAmount || 0);

    const availableRoomsForChange = useMemo(() => {
        if (!order.checkInDate || !order.checkOutDate) return [];
        
        const checkIn = new Date(`${order.checkInDate}T${order.checkInTime || '12:00'}`);
        const checkOut = new Date(`${order.checkOutDate}T${order.checkOutTime || '11:00'}`);

        return rooms.filter(r => {
            if (r.id === order.roomId) return false; // Current room
            if (r.status === 'Maintenance' || r.status === 'Dirty') return false;

            // Check for conflicts
            const conflicts = allOrders.filter(o => 
                o.id !== order.id && 
                o.roomId === r.id && 
                o.roomBookingStatus !== 'Checked-Out' &&
                o.roomBookingStatus !== 'Cancelled'
            ).some(o => {
                const oIn = new Date(`${o.checkInDate}T${o.checkInTime || '12:00'}`);
                const oOut = new Date(`${o.checkOutDate}T${o.checkOutTime || '11:00'}`);
                
                const gracePeriodMs = 60 * 60 * 1000;
                const oInWithGrace = new Date(oIn.getTime() - gracePeriodMs);

                return (checkIn < oOut && checkOut > oInWithGrace);
            });

            return !conflicts;
        });
    }, [order.checkInDate, order.checkOutDate, order.checkInTime, order.checkOutTime, rooms, allOrders, order.id, order.roomId]);

    const handleCancelReservation = (amountToRefund: number) => {
        const updatedOrder = {
            ...order,
            roomBookingStatus: 'Cancelled' as const,
            status: 'Cancelled' as const,
            isAdvanceRefunded: amountToRefund > 0,
            advanceAmount: order.advanceAmount - amountToRefund, // Remaining amount kept by hotel
            cancellationReason: 'User requested cancellation',
            refundedAmount: amountToRefund // We might need to add this to types, but for now we'll just adjust advanceAmount
        };
        onUpdateOrder(updatedOrder);
        setIsCancelling(false);
    };

    const handleChangeRoom = (newRoomId: string) => {
        const newRoom = rooms.find(r => r.id === newRoomId);
        const category = roomCategories.find(c => c.id === newRoom?.categoryId);
        const nights = order.nights || 1;
        
        const updatedOrder = {
            ...order,
            roomId: newRoomId,
            roomRent: (category?.price || 0) * nights
        };
        onUpdateOrder(updatedOrder);
        setIsChangingRoom(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let updatedOrder = { ...order, [name]: value };

        if (name === 'checkInDate' || name === 'checkOutDate' || name === 'checkInTime' || name === 'checkOutTime') {
            const nights = calculateNights(updatedOrder.checkInDate || '', updatedOrder.checkOutDate || '');
            updatedOrder.nights = nights;
            const room = rooms?.find(r => r.id === order.roomId);
            const category = roomCategories.find(c => c.id === room?.categoryId);
            updatedOrder.roomRent = (category?.price || 0) * nights;

            // Conflict Check Logic
            if (updatedOrder.roomId && updatedOrder.checkInDate && updatedOrder.checkOutDate) {
                const checkIn = new Date(`${updatedOrder.checkInDate}T${updatedOrder.checkInTime || '12:00'}`);
                const checkOut = new Date(`${updatedOrder.checkOutDate}T${updatedOrder.checkOutTime || '11:00'}`);

                const conflicts = allOrders.filter(o => 
                    o.id !== updatedOrder.id && 
                    o.roomId === updatedOrder.roomId && 
                    o.roomBookingStatus !== 'Checked-Out' &&
                    o.roomBookingStatus !== 'Cancelled'
                ).some(o => {
                    const oIn = new Date(`${o.checkInDate}T${o.checkInTime || '12:00'}`);
                    const oOut = new Date(`${o.checkOutDate}T${o.checkOutTime || '11:00'}`);
                    
                    // Add 1 hour grace period for tomorrow's check-in
                    const gracePeriodMs = 60 * 60 * 1000;
                    const oInWithGrace = new Date(oIn.getTime() - gracePeriodMs);

                    return (checkIn < oOut && checkOut > oInWithGrace);
                });

                if (conflicts) {
                    alert("Warning: This booking overlaps with an existing reservation (including 1hr grace period). Please adjust dates or times.");
                }
            }
        }

        onUpdateOrder(updatedOrder);
    };

    const { subtotal, discountAmount, taxAmount, grandTotal, amountDue } = useMemo(() => {
        const activeDiscounts = businessSettings.autoApplyProductOffers ? (discounts || []) : (discounts || []).filter(d => !d.productId);
        return calculateOrderTotals(order, businessSettings.isVatEnabled, activeDiscounts);
    }, [order, businessSettings.isVatEnabled, discounts, businessSettings.autoApplyProductOffers]);

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const deliveryStatuses: OrderStatus[] = ['Pending', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled', 'Returned'];

    const getPartnerName = (id?: string) => {
        if (!id) return "Assign Partner";
        return deliveryPartners.find(p => p.id === id)?.name || "Unknown Partner";
    };

    const isDelivery = order.type === 'Order';
    const totalItemCount = useMemo(() => order.items.reduce((sum, item) => sum + item.quantity, 0), [order.items]);

    const upcomingReservations = useMemo(() => {
        if (!order.roomId) return [];
        return allOrders.filter(o => 
            o.roomId === order.roomId && 
            o.roomBookingStatus === 'Reserved' && 
            o.id !== order.id &&
            o.status !== 'Cancelled'
        ).sort((a, b) => (a.checkInDate || '').localeCompare(b.checkInDate || ''));
    }, [allOrders, order.roomId, order.id]);

    const handleCheckInReservation = (reservation: Order) => {
        onUpdateOrder({
            ...reservation,
            roomBookingStatus: 'Checked-In',
            checkInDate: new Date().toISOString().split('T')[0],
            checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    };

    const handleFinalizeReservation = () => {
        onSave?.();
        onBack();
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 transition-colors font-sans overflow-hidden">
            {isProductModalOpen && <AddProductModal products={products} orderItems={order.items} onAddProduct={handleAddItem} onClose={() => setProductModalOpen(false)} discounts={discounts} />}
            {isContactModalOpen && <ContactSearchModal customers={customers} creditors={creditors} vendors={vendors} onSelectContact={(c, t) => { onUpdateOrder({...order, customerId: t === 'customer' ? c.id : undefined, creditorId: t === 'creditor' ? c.id : undefined, vendorId: t === 'vendor' ? c.id : undefined, customerName: c.name, customerPhone: c.phone, customerAddress: c.address}); setContactModalOpen(false); }} onClose={() => setContactModalOpen(false)} />}
            {isDiscountModalOpen && <ApplyDiscountModal discounts={discounts} onApply={(d) => { onUpdateOrder({...order, discount: d.value, discountType: d.type, appliedDiscountId: d.id, appliedDiscountName: d.name}); setDiscountModalOpen(false); }} onClose={() => setDiscountModalOpen(false)} />}
            {isPartnerModalOpen && (
                <AssignPartnerModal 
                    partners={deliveryPartners} 
                    onClose={() => setPartnerModalOpen(false)} 
                    onAssign={(id) => { onUpdateOrder({...order, deliveryPartnerId: id}); setPartnerModalOpen(false); }} 
                />
            )}
            
            {matchPopupContact && (
                <ConfirmationModal 
                    title="Same Person?"
                    message={`Found "${matchPopupContact.name}" with phone ${matchPopupContact.phone}. Is this the same person?`}
                    onConfirm={handleConfirmMatch}
                    onCancel={() => setMatchPopupContact(null)}
                    confirmText="Yes, Use Profile"
                    cancelText="No, New Client"
                />
            )}

            {isBackConfirmOpen && (
                <ConfirmationModal 
                    title="Unsaved Changes" 
                    message="You have modified the order. What would you like to do?" 
                    onConfirm={() => { onSave?.(); onBack(); }}
                    onCancel={() => setBackConfirmOpen(false)} 
                    onSecondaryAction={handleDiscardAndGoBack}
                    confirmText="Save & Go Back"
                    secondaryText="Discard & Go Back"
                    cancelText="Keep Editing"
                />
            )}

            <header className="px-6 pt-12 pb-4 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-950 z-30 border-b dark:border-gray-900 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={handleBackWithCheck} className="p-2 -ml-2 text-black dark:text-white active:scale-90 transition-all"><BackIcon /></button>
                    <h1 className="text-xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">
                        OB<span className="text-[#4B2A63] dark:text-blue-400"> Pro</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2 relative">
                    {isKotEnabled && (
                        <button 
                            onClick={() => onPrintKot?.(order)} 
                            className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 active:scale-90 transition-all flex items-center gap-1"
                            title="Print KOT"
                        >
                            <PrinterIcon className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase">KOT</span>
                        </button>
                    )}
                    <button onClick={handlePrintBill} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:scale-90 transition-all" title="Print Bill">
                        <PrinterIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onSave} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Save</button>
                    <button onClick={() => setQuickSettingsOpen(!isQuickSettingsOpen)} className={`p-2.5 rounded-xl transition-all ${isQuickSettingsOpen ? 'bg-black text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                        <SettingsIcon className="w-5 h-5" />
                    </button>
                    
                    {isQuickSettingsOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-3 z-50 animate-fade-in">
                            <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors">
                                <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">VAT Calculation</span>
                                <button 
                                    onClick={() => onUpdateSettings({ isVatEnabled: !businessSettings.isVatEnabled })}
                                    className={`w-10 h-6 rounded-full transition-all relative ${businessSettings.isVatEnabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${businessSettings.isVatEnabled ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-grow overflow-y-auto px-6 py-6 space-y-8 no-scrollbar pb-32">
                
                {(order.tableId || order.roomId) && (
                    <section className="animate-fade-in">
                        <div className="bg-black dark:bg-white p-6 rounded-[40px] shadow-2xl flex items-center justify-between overflow-hidden relative group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-white/40 dark:text-black/40 uppercase tracking-[0.4em] mb-1 italic">Active Location</p>
                                <h2 className="text-4xl font-black text-white dark:text-black italic uppercase tracking-tighter leading-none">
                                    {order.tableId ? `Table ${tables.find(t => t.id === order.tableId)?.name.replace(/\D/g, '') || '??'}` : `Room ${rooms.find(r => r.id === order.roomId)?.roomNumber || '??'}`}
                                </h2>
                            </div>
                            <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/10 dark:bg-black/10 flex items-center justify-center">
                                {order.tableId ? (
                                    <svg className="w-6 h-6 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197"/></svg>
                                ) : (
                                    <svg className="w-6 h-6 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                                )}
                            </div>
                            <div className="absolute -right-4 -bottom-8 text-[120px] font-black italic text-white/[0.03] dark:text-black/[0.03] select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                {order.tableId ? 'TBL' : 'RM'}
                            </div>
                        </div>
                    </section>
                )}

                {isDelivery && (
                    <section className="space-y-4 animate-fade-in">
                        <h2 className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.4em] px-1">Logistics Hub</h2>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-[32px] border border-gray-100 dark:border-gray-700 space-y-4 shadow-inner">
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Milestone</p>
                                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                                    {deliveryStatuses.map(s => (
                                        <button 
                                            key={s} 
                                            onClick={() => onUpdateOrder({...order, status: s})}
                                            className={`px-3 py-1.5 text-[9px] font-black rounded-full whitespace-nowrap transition-all ${order.status === s ? 'bg-black text-white' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700 shadow-sm'}`}
                                        >
                                            {s.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1 space-y-1">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">EST. DATE</p>
                                    <input 
                                        type="date" 
                                        value={order.deliveryDate || ''} 
                                        onChange={e => onUpdateOrder({...order, deliveryDate: e.target.value})}
                                        className="w-full bg-white dark:bg-gray-800 rounded-xl py-2 px-3 text-[11px] font-black uppercase outline-none shadow-sm border border-gray-100 dark:border-gray-700 text-black dark:text-white"
                                        style={{ colorScheme: 'light' }}
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">EST. TIME</p>
                                    <input 
                                        type="time" 
                                        value={order.deliveryTime || ''} 
                                        onChange={e => onUpdateOrder({...order, deliveryTime: e.target.value})}
                                        className="w-full bg-white dark:bg-gray-800 rounded-xl py-2 px-3 text-[11px] font-black uppercase outline-none shadow-sm border border-gray-100 dark:border-gray-700 text-black dark:text-white"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Rider</p>
                                    <button 
                                        onClick={() => setPartnerModalOpen(true)}
                                        className="w-full py-2 px-3 bg-white dark:bg-gray-800 rounded-xl text-left border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest italic shadow-sm truncate text-black dark:text-white"
                                    >
                                        {getPartnerName(order.deliveryPartnerId)}
                                    </button>
                                </div>
                                <div className="w-20 shrink-0">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Fee</p>
                                    <input 
                                        type="number" 
                                        value={order.deliveryFee || ''} 
                                        onChange={e => onUpdateOrder({...order, deliveryFee: parseFloat(e.target.value) || 0})}
                                        placeholder="0"
                                        className="w-full py-2 px-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black text-center outline-none shadow-sm text-black dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {order.type === 'Room' && (
                    <section className="space-y-4">
                        <button onClick={() => setRoomDetailsExpanded(!isRoomDetailsExpanded)} className="w-full flex justify-between items-center px-1 text-black dark:text-white">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em]">Room Details</h2>
                            <ChevronDownIcon isOpen={isRoomDetailsExpanded} />
                        </button>

                        {isRoomDetailsExpanded && (
                            <div className="space-y-6 animate-fade-in bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-inner">
                                {/* Quick Date Selectors */}
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            const today = new Date().toISOString().split('T')[0];
                                            const tomorrow = new Date();
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            const tomorrowStr = tomorrow.toISOString().split('T')[0];
                                            onUpdateOrder({ ...order, checkInDate: today, checkOutDate: tomorrowStr, roomBookingStatus: 'Checked-In' });
                                        }}
                                        className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${order.checkInDate === new Date().toISOString().split('T')[0] ? 'bg-black text-white shadow-xl' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'}`}
                                    >
                                        Stay Today
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const tomorrow = new Date();
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            const tomorrowStr = tomorrow.toISOString().split('T')[0];
                                            const dayAfter = new Date();
                                            dayAfter.setDate(dayAfter.getDate() + 2);
                                            const dayAfterStr = dayAfter.toISOString().split('T')[0];
                                            onUpdateOrder({ ...order, checkInDate: tomorrowStr, checkOutDate: dayAfterStr, roomBookingStatus: 'Reserved' });
                                        }}
                                        className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${order.checkInDate > new Date().toISOString().split('T')[0] ? 'bg-orange-500 text-white shadow-xl' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'}`}
                                    >
                                        Reserve Tomorrow
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Check-In Date</p>
                                        <input 
                                            type="date" 
                                            name="checkInDate"
                                            value={order.checkInDate || ''} 
                                            onChange={handleFormChange}
                                            className="w-full bg-white dark:bg-gray-800 rounded-xl py-3 px-4 text-[11px] font-black uppercase outline-none shadow-sm border border-gray-100 dark:border-gray-700 text-black dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Check-Out Date</p>
                                        <input 
                                            type="date" 
                                            name="checkOutDate"
                                            value={order.checkOutDate || ''} 
                                            onChange={handleFormChange}
                                            className="w-full bg-white dark:bg-gray-800 rounded-xl py-3 px-4 text-[11px] font-black uppercase outline-none shadow-sm border border-gray-100 dark:border-gray-700 text-black dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <TimePicker12h 
                                        label="Check-In Time"
                                        value={order.checkInTime || '12:00'}
                                        onChange={val => onUpdateOrder({...order, checkInTime: val})}
                                    />
                                    <TimePicker12h 
                                        label="Check-Out Time"
                                        value={order.checkOutTime || '11:00'}
                                        onChange={val => onUpdateOrder({...order, checkOutTime: val})}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Nights</p>
                                        <div className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-xl py-3 px-4 text-[11px] font-black text-center text-black dark:text-white">
                                            {order.nights || 1}
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Rent (Total)</p>
                                        <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-xl py-3 px-4 text-[11px] font-black text-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                                            ₹{(order.roomRent || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Summary Card */}
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Booking Summary</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${order.roomBookingStatus === 'Checked-In' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {order.roomBookingStatus}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[12px] font-black text-black dark:text-white uppercase">{order.customerName || 'Guest'}</p>
                                            <p className="text-[8px] font-bold text-gray-400 italic">{order.checkInDate} to {order.checkOutDate}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[14px] font-black text-black dark:text-white italic">₹{(order.roomRent || 0).toLocaleString()}</p>
                                            <p className="text-[8px] font-bold text-green-500 uppercase">Advance: ₹{(order.advanceAmount || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Advance Payment</p>
                                    <input 
                                        type="number" 
                                        name="advanceAmount"
                                        value={order.advanceAmount || ''} 
                                        onChange={e => onUpdateOrder({...order, advanceAmount: parseFloat(e.target.value) || 0})}
                                        placeholder="0"
                                        className="w-full bg-white dark:bg-gray-800 rounded-xl py-3 px-4 text-[11px] font-black uppercase outline-none shadow-sm border border-gray-100 dark:border-gray-700 text-black dark:text-white"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Booking Status</p>
                                    <div className="flex gap-2">
                                        {['Reserved', 'Checked-In', 'Checked-Out', 'Cancelled'].map(status => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => onUpdateOrder({...order, roomBookingStatus: status as any})}
                                                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${
                                                    order.roomBookingStatus === status 
                                                    ? 'bg-black text-white shadow-md' 
                                                    : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Advanced Management Actions */}
                                <div className="mt-6 pt-6 border-t dark:border-gray-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Advanced Actions</h3>
                                        <div className="flex gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => setIsChangingRoom(!isChangingRoom)}
                                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                            >
                                                Change Room
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setIsCancelling(!isCancelling)}
                                                className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                                            >
                                                Cancel Stay
                                            </button>
                                        </div>
                                    </div>

                                    {isChangingRoom && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700"
                                        >
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">Select New Room</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {availableRoomsForChange.length === 0 ? (
                                                    <p className="col-span-3 text-[9px] font-bold text-gray-400 text-center py-2 italic">No other available rooms for these dates</p>
                                                ) : (
                                                    availableRoomsForChange.map(r => (
                                                        <button
                                                            key={r.id}
                                                            type="button"
                                                            onClick={() => handleChangeRoom(r.id)}
                                                            className="p-3 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 text-[10px] font-black hover:border-primary transition-all"
                                                        >
                                                            R-{r.roomNumber}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {isCancelling && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20"
                                        >
                                            <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">Confirm Cancellation</p>
                                            <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 mb-4">Are you sure you want to cancel this reservation? This action will free up the room.</p>
                                            
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Refund Amount (Max: ₹{order.advanceAmount || 0})</p>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="number" 
                                                            value={refundAmount}
                                                            onChange={e => setRefundAmount(Math.min(order.advanceAmount || 0, parseFloat(e.target.value) || 0))}
                                                            className="flex-1 bg-white dark:bg-gray-800 rounded-xl py-3 px-4 text-[11px] font-black outline-none border border-red-100 dark:border-red-900/30 text-black dark:text-white"
                                                        />
                                                        <button 
                                                            onClick={() => setRefundAmount((order.advanceAmount || 0) / 2)}
                                                            className="px-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-[9px] font-black uppercase"
                                                        >
                                                            50%
                                                        </button>
                                                        <button 
                                                            onClick={() => setRefundAmount(order.advanceAmount || 0)}
                                                            className="px-3 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase"
                                                        >
                                                            Full
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelReservation(refundAmount)}
                                                    className="w-full py-3 bg-red-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                                                >
                                                    Confirm Cancellation & Refund ₹{refundAmount.toLocaleString()}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Calendar Style Availability View */}
                                <div className="mt-6 pt-6 border-t dark:border-gray-800">
                                    <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Availability Calendar</h3>
                                    <div className="grid grid-cols-7 gap-2">
                                        {Array.from({ length: 7 }).map((_, i) => {
                                            const date = new Date();
                                            date.setDate(date.getDate() + i);
                                            const dateStr = date.toISOString().split('T')[0];
                                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                            const dayNum = date.getDate();

                                            const dayBookings = allOrders.filter(o => 
                                                o.roomId === order.roomId && 
                                                o.checkInDate <= dateStr && 
                                                o.checkOutDate >= dateStr &&
                                                o.roomBookingStatus !== 'Checked-Out' &&
                                                o.roomBookingStatus !== 'Cancelled'
                                            );

                                            const isBooked = dayBookings.length > 0;
                                            const isToday = i === 0;

                                            return (
                                                <div key={dateStr} className="flex flex-col items-center gap-1">
                                                    <span className="text-[7px] font-black text-gray-400 uppercase">{dayName}</span>
                                                    <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                                                        isBooked 
                                                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' 
                                                        : 'bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400'
                                                    } ${isToday ? 'ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-gray-950' : ''}`}>
                                                        {dayNum}
                                                    </div>
                                                    {isBooked && (
                                                        <div className="w-1 h-1 rounded-full bg-orange-500" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-[7px] font-black text-gray-400 uppercase">Available</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                                            <span className="text-[7px] font-black text-gray-400 uppercase">Booked</span>
                                        </div>
                                    </div>
                                </div>
                                {upcomingReservations.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t dark:border-gray-800">
                                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest ml-1 italic">Upcoming Reservations</p>
                                        <div className="space-y-2">
                                            {upcomingReservations.map(res => (
                                                <div key={res.id} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm">
                                                    <div>
                                                        <p className="text-[10px] font-black text-black dark:text-white uppercase">{res.customerName || 'Guest'}</p>
                                                        <p className="text-[8px] font-bold text-gray-400 italic">{res.checkInDate} to {res.checkOutDate}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleCheckInReservation(res)}
                                                        className="px-4 py-2 bg-orange-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg active:scale-90 transition-all"
                                                    >
                                                        Check-In Now
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                )}

                <section className="space-y-4">
                    <button onClick={() => setContactExpanded(!isContactExpanded)} className="w-full flex justify-between items-center px-1 text-black dark:text-white">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em]">Client Profile</h2>
                        <ChevronDownIcon isOpen={isContactExpanded} />
                    </button>

                    {isContactExpanded && (
                        <div className="space-y-4 animate-fade-in">
                            <button 
                                onClick={() => setContactModalOpen(true)}
                                className="w-full flex items-center justify-center gap-3 p-5 bg-black dark:bg-white border border-black dark:border-white rounded-[28px] text-left active:scale-[0.98] transition-all shadow-xl"
                            >
                                <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center text-white dark:text-black">
                                    <UserIcon />
                                </div>
                                <span className="font-black uppercase text-xs tracking-[0.2em] text-white dark:text-black">Select Client from List</span>
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">or entry manually</span>
                                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
                            </div>

                            <div className="space-y-3">
                                <input 
                                    type="text" 
                                    name="customerName" 
                                    value={order.customerName} 
                                    onChange={handleFormChange} 
                                    onBlur={handleNameBlur}
                                    placeholder="CLIENT NAME" 
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-[24px] py-5 px-8 font-black uppercase tracking-widest text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all shadow-inner text-black dark:text-white placeholder:text-gray-400"
                                />
                                <input 
                                    type="tel" 
                                    name="customerPhone" 
                                    value={order.customerPhone} 
                                    onChange={handleFormChange} 
                                    placeholder="MOBILE NUMBER" 
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-[24px] py-5 px-8 font-black uppercase tracking-widest text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all shadow-inner text-black dark:text-white placeholder:text-gray-400"
                                />
                                    {isDelivery && (
                                        <input 
                                            type="text" 
                                            name="customerAddress" 
                                            value={order.customerAddress || ''} 
                                            onChange={handleFormChange} 
                                            placeholder="DELIVERY LOCATION / ADDRESS" 
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-[24px] py-5 px-8 font-black uppercase tracking-widest text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all shadow-inner text-black dark:text-white placeholder:text-gray-400"
                                        />
                                    )}
                                    {order.type === 'Room' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <select 
                                                name="idType"
                                                value={order.idType || ''} 
                                                onChange={handleFormChange}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-[24px] py-4 px-6 font-black uppercase tracking-widest text-[11px] focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all shadow-inner text-black dark:text-white"
                                            >
                                                <option value="">Select ID</option>
                                                <option value="National Identity">National Identity</option>
                                                <option value="Driving Licence">Driving Licence</option>
                                                <option value="Citizenship">Citizenship</option>
                                                <option value="Passport">Passport</option>
                                            </select>
                                            <input 
                                                type="text" 
                                                name="idNumber"
                                                value={order.idNumber || ''} 
                                                onChange={handleFormChange}
                                                placeholder="ID NUMBER"
                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-[24px] py-4 px-6 font-black uppercase tracking-widest text-[11px] focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all shadow-inner text-black dark:text-white placeholder:text-gray-400"
                                            />
                                        </div>
                                    )}
                                </div>
                        </div>
                    )}
                </section>

                <section className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.4em]">Items Basket</h2>
                            {totalItemCount > 0 && (
                                <span className="bg-[#4B2A63] text-white text-[8px] font-black px-1.5 py-0.5 rounded-md italic animate-fade-in shadow-sm">
                                    {totalItemCount} UNITS
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setScannerOpen(true)} className="flex items-center gap-1.5 text-[10px] font-black text-orange-500 uppercase tracking-widest">
                                <CameraIcon className="w-4 h-4" /> Scan
                            </button>
                            <button onClick={() => setProductModalOpen(true)} className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase tracking-widest">
                                <PlusCircleIcon className="w-4 h-4" /> Quick Add
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {order.items.length === 0 ? (
                            <div className="py-16 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] text-center bg-gray-50/50">
                                <p className="text-sm font-black text-black dark:text-white uppercase tracking-[0.3em] italic opacity-80">No items added</p>
                            </div>
                        ) : order.items.map(({ product, quantity, status = 'Active', returnedQuantity = 0 }) => {
                            const effectiveQty = quantity - returnedQuantity;
                            return (
                                <div key={product.id} className={`p-5 rounded-[36px] bg-gray-50 dark:bg-gray-900 flex flex-col gap-4 border shadow-sm transition-all ${status !== 'Active' || effectiveQty <= 0 ? 'opacity-50 grayscale border-gray-200' : 'border-gray-50 dark:border-gray-800'}`}>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-base font-black italic uppercase tracking-tight truncate leading-none mb-1.5 ${status === 'Cancelled' ? 'line-through' : ''} text-black dark:text-white`}>{product.name}</h4>
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                                {returnedQuantity > 0 ? `${returnedQuantity} Returned` : status !== 'Active' ? status : `₹${product.price.toLocaleString()}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center bg-white dark:bg-gray-800 p-1.5 rounded-2xl gap-4 shrink-0 shadow-sm ring-1 ring-black/5">
                                            <button onClick={() => handleItemQuantityChange(product.id, -1)} className="w-10 h-10 rounded-xl font-black text-lg text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-90 transition-all">-</button>
                                            <span className="font-black text-base italic min-w-[24px] text-center text-black dark:text-white">{quantity}</span>
                                            <button onClick={() => handleItemQuantityChange(product.id, 1)} className="w-10 h-10 rounded-xl font-black text-lg text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-90 transition-all">+</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="space-y-5 pt-4">
                    <h2 className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.4em] px-1">Settlement Summary</h2>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[48px] border border-gray-100 dark:border-gray-700 space-y-6 shadow-sm">
                         
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-black dark:text-white uppercase tracking-[0.2em]">Gross Total</span>
                            <span className="font-black text-2xl italic text-black dark:text-white tracking-tighter">{formatCurrency(subtotal)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-black dark:text-white uppercase tracking-[0.2em]">Offers Applied</span>
                            <button onClick={() => setDiscountModalOpen(true)} className={`px-5 py-2 ${discountAmount > 0 ? 'bg-green-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black'} text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg active:scale-90 transition-all`}>
                                {discountAmount > 0 ? 'Modify Offer' : 'Apply Offer'}
                            </button>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between items-center animate-fade-in text-green-500">
                                <span className="text-sm font-black uppercase tracking-[0.2em]">Empire Savings</span>
                                <span className="font-black text-2xl italic tracking-tighter">-{formatCurrency(discountAmount)}</span>
                            </div>
                        )}

                        {order.roomRent && order.roomRent > 0 && (
                            <div className="flex justify-between items-center animate-fade-in text-blue-600 dark:text-blue-400">
                                <span className="text-sm font-black uppercase tracking-[0.2em]">Room Rent</span>
                                <span className="font-black text-2xl italic tracking-tighter">{formatCurrency(order.roomRent)}</span>
                            </div>
                        )}

                        {order.type === 'Room' && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-black dark:text-white uppercase tracking-[0.2em]">Advance Payment</span>
                                <div className="flex gap-2">
                                    <input 
                                        type="number"
                                        value={order.advanceAmount || ''}
                                        onChange={(e) => onUpdateOrder({...order, advanceAmount: parseFloat(e.target.value) || 0})}
                                        placeholder="Amount"
                                        className="w-24 bg-white dark:bg-gray-800 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none border dark:border-gray-700 text-black dark:text-white"
                                    />
                                    <input 
                                        type="date"
                                        value={order.advancePaymentDate || ''}
                                        onChange={(e) => onUpdateOrder({...order, advancePaymentDate: e.target.value})}
                                        className="w-32 bg-white dark:bg-gray-800 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none border dark:border-gray-700 text-black dark:text-white"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-black dark:text-white uppercase tracking-[0.2em]">VAT (13%)</span>
                            <span className={`font-black text-2xl italic tracking-tighter ${businessSettings.isVatEnabled ? 'text-black dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                                {businessSettings.isVatEnabled ? formatCurrency(taxAmount) : 'OFF'}
                            </span>
                        </div>

                        <div className="pt-6 border-t-2 border-black dark:border-white flex justify-between items-end">
                            <div className="w-full">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[11px] font-black text-black dark:text-white uppercase tracking-[0.4em] leading-none">Grand Total</p>
                                    <p className="text-xl font-black text-black dark:text-white italic tracking-tighter leading-none">₹{Math.round(grandTotal).toLocaleString('en-IN')}</p>
                                </div>
                                
                                {order.type === 'Room' && order.advanceAmount && order.advanceAmount > 0 && (
                                    <div className="flex justify-between items-center mb-4 text-orange-600 dark:text-orange-400">
                                        <p className="text-[11px] font-black uppercase tracking-[0.4em] leading-none">Advance Paid</p>
                                        <p className="text-xl font-black italic tracking-tighter leading-none">-{formatCurrency(order.advanceAmount)}</p>
                                    </div>
                                )}

                                <p className="text-[11px] font-black text-black dark:text-white uppercase tracking-[0.4em] mb-2 leading-none">Net Amount Due</p>
                                <div className="flex justify-between items-baseline">
                                    <p className="text-6xl font-black text-black dark:text-white italic tracking-tighter leading-none">
                                        {Math.round(amountDue).toLocaleString('en-IN')}
                                    </p>
                                    <span className="text-3xl font-black italic text-black dark:text-white opacity-40 ml-1">₹</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {showFooter && (
                <footer className="shrink-0 p-6 bg-white dark:bg-gray-950 border-t dark:border-gray-900 z-40 flex flex-col gap-3">
                    {order.status === 'Completed' && (
                        <button 
                            onClick={() => printOrder(order, businessProfile, isVatEnabled)}
                            className="w-full py-5 bg-green-600 text-white font-black rounded-[32px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-[0.3em]"
                        >
                            <PrinterIcon className="w-5 h-5" /> Print Bill
                        </button>
                    )}
                    <div className="flex gap-3">
                        {order.roomBookingStatus === 'Reserved' ? (
                            <button 
                                onClick={handleFinalizeReservation}
                                className="flex-1 py-7 bg-orange-500 text-white font-black rounded-[36px] shadow-2xl active:scale-95 transition-all text-base uppercase tracking-[0.4em]"
                            >
                                Finalize Reservation
                            </button>
                        ) : (
                            <button 
                                onClick={() => onCheckout()} 
                                disabled={order.items.length === 0 && order.type !== 'Room'} 
                                className="flex-1 py-7 bg-black dark:bg-white text-white dark:text-black font-black rounded-[36px] shadow-2xl active:scale-95 transition-all text-base uppercase tracking-[0.4em] disabled:opacity-10"
                            >
                                Finalize Settlement
                            </button>
                        )}
                    </div>
                </footer>
            )}
            {isScannerOpen && (
                <OrderBarcodeScannerModal 
                    products={products}
                    onClose={() => setScannerOpen(false)}
                    onAddItem={(product) => handleAddItem(product)}
                />
            )}
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default OrderEditor;