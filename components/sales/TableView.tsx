import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MainView, Table, Order, DeliveryPartner, OrderStatus, Room } from '../../types';
import AddIcon from '../icons/AddIcon';
import TrashIcon from '../icons/TrashIcon';
import SearchIcon from '../icons/SearchIcon';
import DoorIcon from '../icons/DoorIcon';
import { SalesSegment } from '../../screens/SalesScreen';
import DeliveryPartnerManager from '../delivery/DeliveryPartnerManager';
import AddPartnerModal from '../delivery/AddPartnerModal';
import { triggerHapticFeedback } from '../../utils/nativeUtils';
import HomeIcon from '../icons/HomeIcon';
import CalendarIcon from '../icons/CalendarIcon';

const TableCard: React.FC<{ table: Table; onClick: () => void; onDelete: (e: React.MouseEvent) => void; isOccupied: boolean }> = ({ table, onClick, onDelete, isOccupied }) => {
    const tableNum = table.name.replace(/\D/g, '').padStart(2, '0');

    return (
        <button
            onClick={() => {
                triggerHapticFeedback();
                onClick();
            }}
            className={`relative group p-6 rounded-[40px] transition-all duration-500 active:scale-95 text-center w-full h-44 flex flex-col items-center justify-center gap-1 overflow-hidden border-2 ${
                isOccupied 
                ? 'bg-black dark:bg-white border-black dark:border-white shadow-[0_20px_50px_rgba(0,0,0,0.2)]' 
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm'
            }`}
        >
            {/* Background Watermark */}
            <span className={`absolute -right-2 -bottom-4 text-[120px] font-black italic select-none transition-all duration-700 pointer-events-none ${
                isOccupied 
                ? 'text-white/5 dark:text-black/5 scale-110 -rotate-12' 
                : 'text-black/[0.02] dark:text-white/[0.02]'
            }`}>
                {tableNum}
            </span>

            <div className="relative z-10 flex flex-col items-center">
                 <div className={`mb-2 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isOccupied ? 'bg-white/10 dark:bg-black/10' : 'bg-gray-50 dark:bg-gray-800'
                }`}>
                    <svg className={`w-5 h-5 ${isOccupied ? 'text-white dark:text-black' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197"/>
                    </svg>
                </div>
                <h3 className={`text-3xl font-black italic uppercase tracking-tighter leading-none ${isOccupied ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}>
                    T-{tableNum}
                </h3>
                <div className="flex items-center gap-1.5 mt-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-gray-200'}`}></div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${isOccupied ? 'text-white/60 dark:text-black/60' : 'text-gray-300'}`}>
                        {isOccupied ? 'Occupied' : 'Free'}
                    </span>
                </div>
            </div>

            <div 
                onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-all active:scale-75 ${
                    isOccupied 
                    ? 'text-white/20 hover:text-white dark:text-black/20 dark:hover:text-black' 
                    : 'text-gray-200 hover:text-red-500'
                }`}
            >
                <TrashIcon className="w-4 h-4" />
            </div>
        </button>
    );
};

const RoomCard: React.FC<{ 
    room: Room; 
    onClick: () => void; 
    isOccupiedToday: boolean; 
    isReservedToday: boolean; 
    isReservedTomorrow: boolean;
    isDirty: boolean;
    yesterdayStatus: 'Available' | 'Occupied' | 'Reserved' | 'Dirty';
    todayStatus: 'Available' | 'Occupied' | 'Reserved' | 'Dirty';
    tomorrowStatus: 'Available' | 'Occupied' | 'Reserved' | 'Dirty';
    nextReservation?: Order;
}> = ({ room, onClick, isOccupiedToday, isReservedToday, isReservedTomorrow, isDirty, yesterdayStatus, todayStatus, tomorrowStatus, nextReservation }) => {
    const statusColor = isOccupiedToday ? 'bg-blue-600 border-blue-600 shadow-[0_20px_50px_rgba(37,99,235,0.3)]' : 
                        isReservedToday ? 'bg-orange-500 border-orange-500 shadow-[0_20px_50px_rgba(249,115,22,0.3)]' :
                        isDirty ? 'bg-red-500 border-red-500 shadow-[0_20px_50px_rgba(239,68,68,0.3)]' :
                        'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-sm';

    const DayIndicator: React.FC<{ status: 'Available' | 'Occupied' | 'Reserved' | 'Dirty'; label: string }> = ({ status, label }) => {
        const colors = {
            Available: 'bg-green-500',
            Occupied: 'bg-blue-600',
            Reserved: 'bg-orange-500',
            Dirty: 'bg-red-500'
        };
        return (
            <div className="flex flex-col items-center gap-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${colors[status] || 'bg-gray-200'}`}></div>
                <span className={`text-[6px] font-black uppercase tracking-tighter ${(isOccupiedToday || isReservedToday || isDirty) ? 'text-white/40' : 'text-gray-300'}`}>{label}</span>
            </div>
        );
    };

    return (
        <button
            onClick={() => {
                triggerHapticFeedback();
                onClick();
            }}
            className={`relative group p-5 rounded-[40px] transition-all duration-500 active:scale-95 text-center w-full h-60 flex flex-col items-center justify-between overflow-hidden border-2 ${statusColor}`}
        >
            <div className="absolute top-4 left-5 flex gap-2">
                <DayIndicator status={yesterdayStatus} label="Y" />
                <DayIndicator status={todayStatus} label="T" />
                <DayIndicator status={tomorrowStatus} label="N" />
            </div>

            <span className={`absolute -right-2 -bottom-4 text-[100px] font-black italic select-none transition-all duration-700 pointer-events-none ${
                (isOccupiedToday || isReservedToday || isDirty)
                ? 'text-white/5 dark:text-black/5 scale-110 -rotate-12' 
                : 'text-black/[0.02] dark:text-white/[0.02]'
            }`}>
                {room.roomNumber}
            </span>

            <div className="relative z-10 flex flex-col items-center w-full">
                 <div className={`mb-1 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    (isOccupiedToday || isReservedToday || isDirty) ? 'bg-white/10 dark:bg-black/10' : 'bg-gray-50 dark:bg-gray-800'
                }`}>
                    <DoorIcon className={`w-4 h-4 ${(isOccupiedToday || isReservedToday || isDirty) ? 'text-white dark:text-black' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-2xl font-black italic uppercase tracking-tighter leading-none ${(isOccupiedToday || isReservedToday || isDirty) ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}>
                    R-{room.roomNumber}
                </h3>
                <p className={`text-[8px] font-black uppercase tracking-widest mt-1 opacity-40 ${(isOccupiedToday || isReservedToday || isDirty) ? 'text-white' : 'text-black dark:text-white'}`}>
                    {room.categoryName}
                </p>
            </div>

            {/* Next Reservation Info */}
            {nextReservation && (
                <div className={`relative z-10 w-full mt-2 p-2 rounded-2xl text-left ${
                    (isOccupiedToday || isReservedToday || isDirty) ? 'bg-white/10' : 'bg-orange-50 dark:bg-orange-900/10'
                }`}>
                    <p className={`text-[7px] font-black uppercase tracking-widest mb-0.5 ${(isOccupiedToday || isReservedToday || isDirty) ? 'text-white/60' : 'text-orange-600'}`}>Next Guest</p>
                    <p className={`text-[9px] font-black truncate ${(isOccupiedToday || isReservedToday || isDirty) ? 'text-white' : 'text-black dark:text-white'}`}>
                        {nextReservation.customerName || 'Guest'}
                    </p>
                    <p className={`text-[7px] font-bold ${(isOccupiedToday || isReservedToday || isDirty) ? 'text-white/40' : 'text-gray-400'}`}>
                        {nextReservation.checkInDate} @ {nextReservation.checkInTime}
                    </p>
                </div>
            )}

            {/* Mini Calendar Status */}
            <div className={`relative z-10 w-full grid grid-cols-2 gap-1 px-2 py-1.5 rounded-2xl ${
                (isOccupiedToday || isReservedToday || isDirty) ? 'bg-black/10' : 'bg-gray-50 dark:bg-gray-800/50'
            }`}>
                <div className="flex flex-col items-center gap-0.5">
                    <span className={`text-[6px] font-black uppercase ${(isOccupiedToday || isReservedToday || isDirty) ? 'text-white/40' : 'text-gray-400'}`}>Today</span>
                    <div className={`w-full h-1 rounded-full ${
                        isOccupiedToday ? 'bg-white' : 
                        isReservedToday ? 'bg-white' : 
                        isDirty ? 'bg-white' : 
                        'bg-green-500'
                    }`} />
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <span className={`text-[6px] font-black uppercase ${(isOccupiedToday || isReservedToday || isDirty) ? 'text-white/40' : 'text-gray-400'}`}>Tmrw</span>
                    <div className={`w-full h-1 rounded-full ${
                        isReservedTomorrow ? (isOccupiedToday || isReservedToday || isDirty ? 'bg-white/60' : 'bg-orange-500') : 
                        'bg-green-500'
                    }`} />
                </div>
            </div>

            <div className="relative z-10 flex items-center gap-1.5 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${(isOccupiedToday || isReservedToday || isDirty) ? 'bg-white animate-pulse' : 'bg-green-400'}`}></div>
                <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${(isOccupiedToday || isReservedToday || isDirty) ? 'text-white' : 'text-gray-300'}`}>
                    {isOccupiedToday ? 'Occupied' : isReservedToday ? 'Reserved' : isDirty ? 'Dirty' : 'Available'}
                </span>
            </div>
        </button>
    );
};

const TakeawayCard: React.FC<{ order: Order; onClick: () => void }> = ({ order, onClick }) => {
    const orderNum = order.id.slice(-4).toUpperCase();
    return (
        <button
            onClick={() => {
                triggerHapticFeedback();
                onClick();
            }}
            className="relative group p-6 rounded-[40px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm transition-all active:scale-95 text-center w-full h-44 flex flex-col items-center justify-center gap-1 overflow-hidden"
        >
            <span className="absolute -right-2 -bottom-4 text-[120px] font-black italic text-black/[0.02] dark:text-white/[0.02] select-none pointer-events-none">
                {orderNum}
            </span>
            <div className="relative z-10">
                <div className="mb-2 w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-black dark:text-white truncate max-w-[120px] mx-auto">
                    {order.customerName || 'Takeaway'}
                </h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 italic">#{orderNum}</p>
                <p className="text-[12px] font-black text-primary dark:text-blue-400 uppercase tracking-widest mt-1">₹{(order.grandTotal || 0).toLocaleString()}</p>
            </div>
        </button>
    );
};

const OrderCard: React.FC<{ 
    order: Order; 
    onClick: () => void; 
    partnerName?: string;
    onStatusChange?: (status: OrderStatus) => void;
    showSwitcher?: boolean;
}> = ({ order, onClick, partnerName, onStatusChange, showSwitcher = true }) => {
    const orderNum = order.id.slice(-4).toUpperCase();
    const time = new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'Pending': return 'bg-gray-100 text-gray-500';
            case 'Processing': return 'bg-blue-100 text-blue-600';
            case 'Out for Delivery': return 'bg-orange-100 text-orange-600';
            case 'Completed': return 'bg-green-100 text-green-600';
            case 'Returned': return 'bg-purple-100 text-purple-600';
            case 'Cancelled': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-50 text-gray-400';
        }
    };

    const statuses: OrderStatus[] = ['Pending', 'Processing', 'Out for Delivery', 'Completed'];

    return (
        <div 
            onClick={() => {
                triggerHapticFeedback();
                onClick();
            }}
            className={`p-5 rounded-[40px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md flex flex-col gap-4 cursor-pointer active:scale-[0.99]`}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center shadow-inner">
                         <span className="font-black text-xs italic">{time}</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">#{orderNum}</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 truncate max-w-[120px]">
                            {order.customerName || 'Walk-in'}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-black text-sm text-black dark:text-white">₹{(order.grandTotal || 0).toLocaleString()}</p>
                    {partnerName && (
                        <span className="text-[7px] font-black bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest mt-1 inline-block">{partnerName}</span>
                    )}
                </div>
            </div>

            {showSwitcher && (
                <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    {statuses.map(s => (
                        <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); onStatusChange?.(s); }}
                            className={`flex-1 py-2 rounded-xl text-[7px] font-black uppercase tracking-tighter transition-all ${
                                order.status === s 
                                ? 'bg-black text-white shadow-sm scale-105' 
                                : 'text-gray-300 hover:text-gray-500'
                            }`}
                        >
                            {s.replace('Out for ', '')}
                        </button>
                    ))}
                </div>
            )}
            
            <div className="flex justify-between items-center px-1">
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${getStatusColor(order.status)}`}>
                    {order.status}
                </span>
                {!showSwitcher && (
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">TAP TO EDIT</span>
                )}
            </div>
        </div>
    );
};

interface TableViewProps {
    tables: Table[];
    rooms?: Room[];
    onSelectTable: (table: Table) => void;
    onSelectRoom?: (room: Room) => void;
    onBack: () => void;
    onAddTableClick: () => void;
    onDeleteTable: (tableId: string) => void;
    onReprintLatestKot?: (tableId: string) => void;
    isKotEnabled?: boolean;
    isRoomsEnabled?: boolean;
    isDesktop?: boolean;
    setCurrentView?: (view: MainView) => void;
    onEditorToggle?: (isActive: boolean) => void;
    activeSegment: SalesSegment;
    setActiveSegment: (segment: SalesSegment) => void;
    pendingOrders: Order[];
    orders: Order[];
    onAddDeliveryOrder: () => void;
    onAddTakeawayOrder: () => void;
    onSelectExistingOrder: (order: Order) => void;
    deliveryPartners: DeliveryPartner[];
    onUpdateDeliveryPartners: (partners: DeliveryPartner[]) => void;
    onUpdateOrderStatus?: (id: string, status: OrderStatus) => void;
    onHome?: () => void;
    syncStatus?: string;
}

const TableView: React.FC<TableViewProps> = (props) => {
    const { 
        tables, rooms = [], onSelectTable, onSelectRoom, onAddTableClick, onDeleteTable, 
        activeSegment, setActiveSegment, pendingOrders, orders,
        onAddDeliveryOrder, onAddTakeawayOrder, onSelectExistingOrder,
        deliveryPartners, onUpdateDeliveryPartners, onUpdateOrderStatus,
        onHome, syncStatus, setCurrentView, isRoomsEnabled, onEditorToggle
    } = props;

    const [isPartnerManagerOpen, setIsPartnerManagerOpen] = useState(false);
    const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const isAnyModalOpen = isPartnerManagerOpen || isAddPartnerModalOpen || isReservationModalOpen;
        onEditorToggle?.(isAnyModalOpen);
    }, [isPartnerManagerOpen, isAddPartnerModalOpen, isReservationModalOpen, onEditorToggle]);

    const filteredTables = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return tables;
        return tables.filter(t => t.name.toLowerCase().includes(query));
    }, [tables, searchQuery]);

    const filteredRooms = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return rooms;
        return rooms.filter(r => r.roomNumber.toLowerCase().includes(query));
    }, [rooms, searchQuery]);

    const deliveryList = useMemo(() => {
        const registered = orders.filter(o => o.type === 'Order');
        const registeredIds = new Set(registered.map(o => o.id));
        const uniquePending = pendingOrders.filter(o => o.type === 'Order' && !registeredIds.has(o.id));
        const combined = [...uniquePending, ...registered];
        
        const filtered = combined.filter(o => o.status !== 'Completed' && o.status !== 'Returned' && o.status !== 'Cancelled');
        
        const query = searchQuery.toLowerCase().trim();
        if (!query) return filtered.sort((a, b) => b.timestamp - a.timestamp);
        
        return filtered
            .filter(o => 
                o.customerName?.toLowerCase().includes(query) || 
                o.id.toLowerCase().includes(query) ||
                o.customerPhone?.includes(query)
            )
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [pendingOrders, orders, searchQuery]);

    const takeawayDrafts = useMemo(() => {
         const drafts = pendingOrders.filter(o => o.type === 'Takeaway');
         const query = searchQuery.toLowerCase().trim();
         if (!query) return drafts;
         return drafts.filter(o => 
            o.customerName?.toLowerCase().includes(query) || 
            o.id.toLowerCase().includes(query) ||
            o.customerPhone?.includes(query)
         );
    }, [pendingOrders, searchQuery]);

    const roomStats = useMemo(() => {
        const stats = {
            total: rooms.length,
            available: 0,
            occupied: 0,
            reserved: 0,
            dirty: 0,
            maintenance: 0
        };

        const today = new Date().toISOString().split('T')[0];

        rooms.forEach(room => {
            const isOccupiedToday = orders.some(o => o.roomId === room.id && o.type === 'Room' && o.status === 'Pending' && o.roomBookingStatus === 'Checked-In');
            const isReservedToday = orders.some(o => o.roomId === room.id && o.type === 'Room' && o.status === 'Pending' && o.roomBookingStatus === 'Reserved' && o.checkInDate === today);
            const isDirty = room.status === 'Dirty';
            const isMaintenance = room.status === 'Maintenance';

            if (isOccupiedToday) stats.occupied++;
            else if (isReservedToday) stats.reserved++;
            else if (isDirty) stats.dirty++;
            else if (isMaintenance) stats.maintenance++;
            else stats.available++;
        });

        return stats;
    }, [rooms, orders]);

    const isTableOccupied = (tableId: string) => {
        const order = pendingOrders.find(o => o.tableId === tableId);
        return !!(order && order.items.length > 0);
    };

    const isRoomOccupied = (roomId: string) => {
        const order = pendingOrders.find(o => o.roomId === roomId);
        return !!(order && order.items.length > 0);
    };

    const deliveryStats = useMemo(() => {
        const toCollect = (deliveryPartners || []).reduce((sum, p) => sum + p.balanceToCollect, 0);
        const toPay = (deliveryPartners || []).reduce((sum, p) => sum + p.balanceToPay, 0);
        return { toCollect, toPay };
    }, [deliveryPartners]);

    const getPartnerName = (id?: string) => {
        if (!id) return undefined;
        return deliveryPartners.find(p => p.id === id)?.name;
    };

    const handleAddPartner = (partner: Omit<DeliveryPartner, 'id' | 'totalOrdersHandled' | 'balanceToPay' | 'balanceToCollect'>) => {
        const newPartner: DeliveryPartner = {
            ...partner,
            id: `dp-${Date.now()}`,
            totalOrdersHandled: 0,
            balanceToPay: 0,
            balanceToCollect: 0
        };
        onUpdateDeliveryPartners([...deliveryPartners, newPartner]);
        setIsAddPartnerModalOpen(false);
    };

    return (
        <div className="bg-[#F8F9FB] dark:bg-gray-950 h-full font-sans overflow-hidden flex flex-col transition-colors">
            {isPartnerManagerOpen && (
                <div 
                    className="fixed inset-0 z-[110]"
                    onTouchStart={e => e.stopPropagation()}
                    onTouchMove={e => e.stopPropagation()}
                    onTouchEnd={e => e.stopPropagation()}
                >
                    <DeliveryPartnerManager 
                        partners={deliveryPartners} 
                        onUpdate={onUpdateDeliveryPartners} 
                        onClose={() => setIsPartnerManagerOpen(false)} 
                    />
                </div>
            )}

            {isAddPartnerModalOpen && (
                <div 
                    className="fixed inset-0 z-[120]"
                    onTouchStart={e => e.stopPropagation()}
                    onTouchMove={e => e.stopPropagation()}
                    onTouchEnd={e => e.stopPropagation()}
                >
                    <AddPartnerModal 
                        onClose={() => setIsAddPartnerModalOpen(false)} 
                        onSave={handleAddPartner} 
                    />
                </div>
            )}

            {isReservationModalOpen && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onTouchStart={e => e.stopPropagation()}
                    onTouchMove={e => e.stopPropagation()}
                    onTouchEnd={e => e.stopPropagation()}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsReservationModalOpen(false)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-950 rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-900 flex flex-col"
                    >
                        <div className="p-6 sm:p-8 border-b dark:border-gray-900 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-black dark:text-white leading-none">Reservations</h2>
                                <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">Upcoming Bookings Summary</p>
                            </div>
                            <button onClick={() => setIsReservationModalOpen(false)} className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all">
                                <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-4 sm:p-8 flex-1 overflow-y-auto no-scrollbar space-y-4">
                            {[...pendingOrders, ...orders]
                                .filter(o => o.type === 'Room' && o.roomBookingStatus !== 'Cancelled' && o.roomBookingStatus !== 'Checked-Out')
                                .sort((a, b) => a.checkInDate.localeCompare(b.checkInDate))
                                .map(res => (
                                    <div 
                                        key={res.id} 
                                        onClick={() => {
                                            const room = rooms?.find(r => r.id === res.roomId);
                                            if (room) {
                                                onSelectRoom?.(room);
                                                setIsReservationModalOpen(false);
                                            }
                                        }}
                                        className="group p-4 sm:p-5 bg-gray-50 dark:bg-gray-900/50 rounded-[28px] sm:rounded-[32px] border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-500 transition-all cursor-pointer active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                                                <DoorIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] sm:text-[10px] font-black text-orange-500 uppercase tracking-widest">Room {rooms?.find(r => r.id === res.roomId)?.roomNumber}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${res.roomBookingStatus === 'Checked-In' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                                        {res.roomBookingStatus}
                                                    </span>
                                                </div>
                                                <h3 className="text-base sm:text-lg font-black text-black dark:text-white uppercase truncate">{res.customerName || 'Guest'}</h3>
                                                <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 italic">{res.checkInDate} to {res.checkOutDate}</p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 dark:border-gray-800">
                                            <p className="text-lg sm:text-xl font-black text-black dark:text-white italic leading-none">₹{res.roomRent?.toLocaleString()}</p>
                                            <p className="text-[8px] sm:text-[9px] font-black text-green-500 uppercase mt-1">Paid: ₹{res.advanceAmount?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            {[...pendingOrders, ...orders].filter(o => o.type === 'Room' && o.roomBookingStatus !== 'Cancelled' && o.roomBookingStatus !== 'Checked-Out').length === 0 && (
                                <div className="py-12 text-center opacity-30">
                                    <p className="text-[10px] font-black uppercase tracking-widest italic">No upcoming reservations</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-900 flex justify-end shrink-0">
                            <button 
                                onClick={() => setIsReservationModalOpen(false)}
                                className="w-full sm:w-auto px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                            >
                                Close Summary
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <header className="px-6 pt-12 pb-6 sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md z-20 shrink-0 border-b dark:border-gray-800">
                 <div className="flex items-center justify-between mb-8">
                    {!isSearchOpen ? (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-1.5">
                                 <h1 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">OB Sales</h1>
                                 {syncStatus === 'Reloading from Cloud...' && (
                                    <div className="flex items-center gap-1 ml-1 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
                                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-[7px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">Syncing</span>
                                    </div>
                                 )}
                            </div>
                            <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.4em] mt-2 italic leading-none">Terminal Control</p>
                        </div>
                    ) : (
                        <div className="flex-1 animate-scale-in mr-4">
                            <input 
                                autoFocus
                                type="text"
                                placeholder={`Search ${activeSegment.toLowerCase()}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-inner placeholder:text-gray-400 text-black dark:text-white"
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        {setCurrentView && !isSearchOpen && (
                            <button 
                                onClick={() => setCurrentView(MainView.KITCHEN)}
                                className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-500 hover:text-red-600 transition-all shadow-sm active:scale-90"
                                title="Kitchen Display"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V4h-4v4a2 2 0 002 2zm3 0h5.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                        )}
                        {onHome && !isSearchOpen && (
                            <button onClick={onHome} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm">
                                <HomeIcon className="w-5 h-5" />
                            </button>
                        )}
                        <button 
                            onClick={() => {
                                setIsSearchOpen(!isSearchOpen);
                                if (isSearchOpen) setSearchQuery('');
                            }}
                            className={`p-3 rounded-2xl active:scale-90 transition-all ${isSearchOpen ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-50 dark:bg-gray-800 text-black dark:text-white'}`}
                        >
                            <SearchIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'TABLES', label: 'Dine-In' },
                        ...(isRoomsEnabled ? [{ id: 'ROOMS', label: 'Rooms' }] : []),
                        { id: 'DELIVERY', label: 'Delivery' },
                        { id: 'TAKEAWAY', label: 'Takeaway' }
                    ].map(seg => (
                        <button 
                            key={seg.id} 
                            onClick={() => {
                                triggerHapticFeedback();
                                setActiveSegment(seg.id as SalesSegment);
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeSegment === seg.id ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl' : 'text-gray-400'
                            }`}
                        >
                            {seg.label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 no-scrollbar" style={{ touchAction: 'pan-y' }}>
                {activeSegment === 'DELIVERY' && (
                    <section className="mt-8 mb-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-[32px] border border-green-100 dark:border-green-900/20">
                                <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">TO COLLECT</p>
                                <p className="text-xl font-black text-green-600 italic leading-none">₹{deliveryStats.toCollect.toLocaleString()}</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-[32px] border border-red-100 dark:border-red-900/20">
                                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">TO PAY</p>
                                <p className="text-xl font-black text-red-600 italic leading-none">₹{deliveryStats.toPay.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 mb-8">
                            <button 
                                onClick={() => setIsPartnerManagerOpen(true)}
                                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[32px] font-black uppercase tracking-[0.3em] text-[11px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                Manage OB Partners
                            </button>
                            <button 
                                onClick={() => setIsAddPartnerModalOpen(true)}
                                className="w-full py-4 bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest italic shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <AddIcon className="w-4 h-4 text-gray-400" /> 
                                <span className="text-gray-500">Quick Add Partner</span>
                            </button>
                        </div>
                    </section>
                )}

                {activeSegment === 'TABLES' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-8 animate-fade-in pb-40">
                        {filteredTables.map(table => (
                            <TableCard 
                                key={table.id} 
                                table={table} 
                                isOccupied={isTableOccupied(table.id)}
                                onClick={() => onSelectTable(table)}
                                onDelete={(e) => { e.stopPropagation(); onDeleteTable(table.id); }}
                            />
                        ))}
                        {!searchQuery && (
                            <button 
                                onClick={onAddTableClick}
                                className="p-5 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-3 group hover:border-black dark:hover:border-white transition-all h-44"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 group-hover:text-black dark:group-hover:text-white transition-all shadow-sm">
                                    <AddIcon className="w-6 h-6" />
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">New Table</span>
                            </button>
                        )}
                    </div>
                )}

                {activeSegment === 'ROOMS' && (
                    <div className="mt-8 animate-fade-in">
                        <div className="flex items-center justify-between mb-6 px-1">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Room Inventory</h2>
                            <button 
                                onClick={() => setIsReservationModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-orange-100 dark:border-orange-900/30 active:scale-95 transition-all"
                            >
                                <CalendarIcon className="w-3.5 h-3.5" />
                                <span>Upcoming Reservations</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-5 gap-2 mb-8 px-1">
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Available</p>
                                <p className="text-xl font-black text-green-500 italic leading-none">{roomStats.available}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Occupied</p>
                                <p className="text-xl font-black text-blue-500 italic leading-none">{roomStats.occupied}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Reserved</p>
                                <p className="text-xl font-black text-orange-500 italic leading-none">{roomStats.reserved}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Dirty</p>
                                <p className="text-xl font-black text-red-500 italic leading-none">{roomStats.dirty}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                                <p className="text-xl font-black text-black dark:text-white italic leading-none">{roomStats.total}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-40">
                            {filteredRooms.map(room => {
                                const today = new Date().toISOString().split('T')[0];
                                const todayStr = today;
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                const tomorrowStr = tomorrow.toISOString().split('T')[0];
                                const yesterday = new Date();
                                yesterday.setDate(yesterday.getDate() - 1);
                                const yesterdayStr = yesterday.toISOString().split('T')[0];

                                const allRoomOrders = [...pendingOrders, ...orders].filter(o => o.roomId === room.id && o.status !== 'Cancelled');
                                
                                const getStatusForDate = (dateStr: string) => {
                                    const order = allRoomOrders.find(o => o.checkInDate <= dateStr && (o.checkOutDate || dateStr) >= dateStr);
                                    if (order) {
                                        return order.roomBookingStatus === 'Checked-In' ? 'Occupied' : 'Reserved';
                                    }
                                    return room.status === 'Dirty' && dateStr === today ? 'Dirty' : 'Available';
                                };

                                const currentOrder = allRoomOrders.find(o => 
                                    o.checkInDate <= today && (o.checkOutDate || today) >= today
                                );
                                
                                const tomorrowOrder = allRoomOrders.find(o => o.checkInDate === tomorrowStr);

                                // Find the very next reservation (after today)
                                const nextReservation = allRoomOrders
                                    .filter(o => o.checkInDate > today)
                                    .sort((a, b) => a.checkInDate.localeCompare(b.checkInDate))[0];

                                const isOccupiedToday = currentOrder?.roomBookingStatus === 'Checked-In';
                                const isReservedToday = currentOrder?.roomBookingStatus === 'Reserved';
                                const isReservedTomorrow = tomorrowOrder?.roomBookingStatus === 'Reserved' || tomorrowOrder?.roomBookingStatus === 'Checked-In';
                                const isDirty = room.status === 'Dirty';

                                return (
                                    <RoomCard 
                                        key={room.id} 
                                        room={room} 
                                        onClick={() => onSelectRoom?.(room)}
                                        isOccupiedToday={isOccupiedToday}
                                        isReservedToday={isReservedToday}
                                        isReservedTomorrow={isReservedTomorrow}
                                        isDirty={isDirty}
                                        yesterdayStatus={getStatusForDate(yesterdayStr) as any}
                                        todayStatus={getStatusForDate(todayStr) as any}
                                        tomorrowStatus={getStatusForDate(tomorrowStr) as any}
                                        nextReservation={nextReservation}
                                    />
                                );
                            })}
                            {rooms.length === 0 && (
                                <div className="col-span-full py-20 text-center opacity-30">
                                    <p className="text-[10px] font-black uppercase tracking-widest italic">No rooms configured</p>
                                    <p className="text-[8px] mt-1">Go to Room Management to add rooms</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeSegment === 'DELIVERY' && (
                    <div className="space-y-4 animate-fade-in pb-40">
                        <div className="flex justify-between items-center mb-2 px-1">
                             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Active Shipments</h3>
                             <button onClick={onAddDeliveryOrder} className="text-[9px] font-black text-blue-600 uppercase underline underline-offset-4 tracking-widest">+ NEW ORDER</button>
                        </div>
                        {deliveryList.length > 0 ? deliveryList.map(order => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                partnerName={getPartnerName(order.deliveryPartnerId)}
                                onClick={() => onSelectExistingOrder(order)}
                                onStatusChange={(s) => onUpdateOrderStatus?.(order.id, s)}
                            />
                        )) : (
                            <div className="py-20 text-center opacity-30">
                                <p className="text-[10px] font-black uppercase tracking-widest italic">No active deliveries</p>
                            </div>
                        )}
                    </div>
                )}

                {activeSegment === 'TAKEAWAY' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-8 animate-fade-in pb-40">
                        {takeawayDrafts.map(order => (
                            <TakeawayCard 
                                key={order.id} 
                                order={order} 
                                onClick={() => onSelectExistingOrder(order)}
                            />
                        ))}
                        <button 
                            onClick={onAddTakeawayOrder}
                            className="p-5 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-3 group hover:border-black dark:hover:border-white transition-all h-44"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 group-hover:text-black dark:group-hover:text-white transition-all shadow-sm">
                                <AddIcon className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">New Takeaway</span>
                        </button>
                    </div>
                )}
            </main>
            
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default TableView;