import React, { useState, useMemo, useEffect } from 'react';
import { Room, RoomCategory, RoomBooking, MainView, Order, Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import HomeIcon from '../components/icons/HomeIcon';
import DoorIcon from '../components/icons/DoorIcon';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import UserPlusIcon from '../components/icons/UserPlusIcon';
import SettingsIcon from '../components/icons/SettingsIcon';
import BackIcon from '../components/icons/BackIcon';
import TrashIcon from '../components/icons/TrashIcon';
import PencilIcon from '../components/icons/PencilIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import CloseIcon from '../components/icons/CloseIcon';
import ShoppingBagIcon from '../components/icons/ShoppingBagIcon';

interface RoomManagementScreenProps {
    rooms: Room[];
    categories: RoomCategory[];
    orders: Order[];
    onUpdateRooms: (rooms: Room[]) => void;
    onUpdateCategories: (categories: RoomCategory[]) => void;
    onHome: () => void;
    onSelectRoomForOrder?: (roomId: string) => void;
    onUpdateOrder?: (order: Order) => void;
    onAddOrder?: (order: Order) => void;
}

const ChevronDownIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg 
        className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
    </svg>
);

const RoomManagementScreen: React.FC<RoomManagementScreenProps> = ({
    rooms,
    categories,
    orders,
    onUpdateRooms,
    onUpdateCategories,
    onHome,
    onSelectRoomForOrder,
    onUpdateOrder,
    onAddOrder
}) => {
    const [view, setView] = useState<'GRID' | 'CATEGORIES' | 'RESERVATIONS'>('GRID');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showCancelled, setShowCancelled] = useState(false);
    const [editingCategory, setEditingCategory] = useState<RoomCategory | null>(null);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
    const [editingReservation, setEditingReservation] = useState<Order | null>(null);
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

    const handleOpenReservation = (room: Room) => {
        setSelectedRoomForBooking(room);
        setEditingReservation(null);
        setIsReservationModalOpen(true);
    };

    const handleEditReservation = (order: Order) => {
        const room = rooms.find(r => r.id === order.roomId) || null;
        setSelectedRoomForBooking(room);
        setEditingReservation(order);
        setIsReservationModalOpen(true);
    };

    const handleSaveReservation = (reservationData: Partial<Order>) => {
        const today = new Date().toISOString().split('T')[0];
        const isForToday = reservationData.checkInDate === today;

        if (editingReservation) {
            onUpdateOrder?.({ ...editingReservation, ...reservationData } as Order);
        } else {
            const newOrder: Order = {
                id: `ord-${Date.now()}`,
                type: 'Room',
                status: 'Pending',
                timestamp: Date.now(),
                items: [],
                discount: 0,
                discountType: 'PERCENT',
                paymentStatus: 'Unpaid',
                roomBookingStatus: 'Reserved',
                ...reservationData
            } as Order;
            onAddOrder?.(newOrder);
        }

        if (isForToday && reservationData.roomId) {
            onUpdateRooms(rooms.map(r => r.id === reservationData.roomId ? { ...r, status: 'Reserved' } : r));
        }

        setIsReservationModalOpen(false);
    };

    const handleAddCategory = (category: Omit<RoomCategory, 'id'>) => {
        onUpdateCategories([...categories, { ...category, id: `cat-${Date.now()}` }]);
        setEditingCategory(null);
    };

    const handleUpdateCategory = (id: string, updates: Partial<RoomCategory>) => {
        onUpdateCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c));
        setEditingCategory(null);
    };

    const handleDeleteCategory = (id: string) => {
        if (confirm('Are you sure you want to delete this category?')) {
            onUpdateCategories(categories.filter(c => c.id !== id));
        }
    };

    const handleAddRoom = (room: Omit<Room, 'id'>) => {
        onUpdateRooms([...rooms, { ...room, id: `room-${Date.now()}` }]);
        setEditingRoom(null);
    };

    const handleUpdateRoom = (id: string, updates: Partial<Room>) => {
        onUpdateRooms(rooms.map(r => r.id === id ? { ...r, ...updates } : r));
        setEditingRoom(null);
    };

    const handleDeleteRoom = (id: string) => {
        if (confirm('Are you sure you want to delete this room?')) {
            onUpdateRooms(rooms.filter(r => r.id !== id));
        }
    };

    const renderHeader = () => (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <button onClick={onHome} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <HomeIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">ROOMS</h1>
            </div>
            
            <div className="relative">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    <span>{view === 'GRID' ? 'Rooms' : view === 'RESERVATIONS' ? 'Reservations' : 'Categories'}</span>
                    <ChevronDownIcon isOpen={isMenuOpen} />
                </button>

                <AnimatePresence>
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 p-2 z-50 overflow-hidden"
                            >
                                <div className="p-2 border-b dark:border-gray-700 mb-2">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Navigation</p>
                                </div>
                                <button onClick={() => { setView('GRID'); setIsMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'GRID' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>Rooms</button>
                                <button onClick={() => { setView('RESERVATIONS'); setIsMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'RESERVATIONS' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>Reservations</button>
                                <button onClick={() => { setView('CATEGORIES'); setIsMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'CATEGORIES' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>Categories</button>
                                
                                <div className="p-2 border-t dark:border-gray-700 mt-2 pt-2">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Actions</p>
                                    <button 
                                        onClick={() => { setEditingCategory({ id: '', name: '', price: 0 }); setIsMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-[10px] uppercase tracking-widest mb-2"
                                    >
                                        <PlusCircleIcon className="w-4 h-4" />
                                        <span>New Category</span>
                                    </button>
                                    <button 
                                        onClick={() => { setEditingRoom({ id: '', roomNumber: '', categoryId: categories[0]?.id || '', status: 'Available', hasAttachedBathroom: true, bedCount: 1, hasAC: false, isFoodIncluded: false }); setIsMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
                                    >
                                        <PlusCircleIcon className="w-4 h-4" />
                                        <span>New Room</span>
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    const renderMobileFAB = () => (
        <div className="sm:hidden fixed bottom-24 right-6 z-50 flex flex-col gap-3">
            <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setEditingCategory({ id: '', name: '', price: 0 })}
                className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center"
            >
                <PlusCircleIcon className="w-6 h-6" />
                <span className="absolute right-14 bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl">New Category</span>
            </motion.button>
            <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setEditingRoom({ id: '', roomNumber: '', categoryId: categories[0]?.id || '', status: 'Available', hasAttachedBathroom: true, bedCount: 1, hasAC: false, isFoodIncluded: false })}
                className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center"
            >
                <PlusCircleIcon className="w-7 h-7" />
                <span className="absolute right-16 bg-primary text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl">New Room</span>
            </motion.button>
        </div>
    );

    const renderRoomGrid = () => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        return (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {rooms.map(room => {
                    const category = categories.find(c => c.id === room.categoryId);
                    // Find active orders for this room
                    const roomOrders = orders.filter(o => o.roomId === room.id && o.status !== 'Completed' && o.status !== 'Cancelled');
                    
                    // Determine current status based on today's date
                    const currentOrder = roomOrders.find(o => {
                        if (!o.checkInDate) return false;
                        const checkIn = o.checkInDate;
                        const checkOut = o.checkOutDate || checkIn;
                        return today >= checkIn && today <= checkOut;
                    });

                    // Check for tomorrow's reservation
                    const reservedTomorrow = roomOrders.find(o => o.checkInDate === tomorrowStr && o.roomBookingStatus === 'Reserved');

                    const isReservedToday = currentOrder?.roomBookingStatus === 'Reserved';
                    const isOccupiedToday = currentOrder?.roomBookingStatus === 'Checked-In';
                    
                    // Logic: If reserved tomorrow, it's still available today unless occupied/reserved today.
                    // But we should show a warning if it's available today but reserved tomorrow.
                    const isAvailableToday = !isReservedToday && !isOccupiedToday && room.status === 'Available';

                    return (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative p-5 rounded-[32px] border-2 transition-all flex flex-col gap-4 shadow-sm ${
                                isOccupiedToday ? 'border-blue-100 bg-blue-50/30 dark:bg-blue-900/10 dark:border-blue-900/30' :
                                isReservedToday ? 'border-orange-100 bg-orange-50/30 dark:bg-orange-900/10 dark:border-orange-900/30' :
                                room.status === 'Dirty' ? 'border-red-100 bg-red-50/30 dark:bg-red-900/10 dark:border-red-900/30' :
                                'border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white italic tracking-tighter leading-none mb-1">{room.roomNumber}</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{category?.name}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                        isOccupiedToday ? 'bg-blue-500 text-white' :
                                        isReservedToday ? 'bg-orange-500 text-white' :
                                        room.status === 'Dirty' ? 'bg-red-500 text-white' :
                                        'bg-green-500 text-white'
                                    }`}>
                                        {isOccupiedToday ? 'Occupied' : isReservedToday ? 'Reserved' : room.status}
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Style Status */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-3 border dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Booking Schedule</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[7px] font-black text-gray-400 uppercase">Today</span>
                                        <div className={`h-1.5 rounded-full ${
                                            isOccupiedToday ? 'bg-blue-500' :
                                            isReservedToday ? 'bg-orange-500' :
                                            room.status === 'Dirty' ? 'bg-red-500' :
                                            'bg-green-500'
                                        }`} />
                                        <span className="text-[6px] font-bold text-gray-500 truncate">
                                            {isOccupiedToday ? 'Checked In' : isReservedToday ? 'Reserved' : room.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[7px] font-black text-gray-400 uppercase">Tomorrow</span>
                                        <div className={`h-1.5 rounded-full ${
                                            reservedTomorrow ? 'bg-orange-500' : 'bg-green-500'
                                        }`} />
                                        <span className="text-[6px] font-bold text-gray-500 truncate">
                                            {reservedTomorrow ? 'Reserved' : 'Available'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 dark:text-gray-400">
                                    <div className={`w-1 h-1 rounded-full ${room.hasAC ? 'bg-blue-400' : 'bg-gray-300'}`} />
                                    {room.hasAC ? 'AC' : 'Non-AC'}
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 dark:text-gray-400">
                                    <div className={`w-1 h-1 rounded-full ${room.hasAttachedBathroom ? 'bg-blue-400' : 'bg-gray-300'}`} />
                                    {room.hasAttachedBathroom ? 'Attached' : 'Common'}
                                </div>
                            </div>

                            <div className="mt-auto pt-2 flex gap-2">
                                {isOccupiedToday || isReservedToday ? (
                                    <button 
                                        onClick={() => onSelectRoomForOrder?.(room.id)}
                                        className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                    >
                                        Details
                                    </button>
                                ) : room.status === 'Dirty' ? (
                                    <button 
                                        onClick={() => onUpdateRooms(rooms.map(r => r.id === room.id ? { ...r, status: 'Available' } : r))}
                                        className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                    >
                                        Clean Room
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleOpenReservation(room)}
                                        className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all ${
                                            reservedTomorrow 
                                            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 shadow-orange-500/10' 
                                            : 'bg-primary text-white shadow-primary/20'
                                        }`}
                                    >
                                        {reservedTomorrow ? 'Book (Short)' : 'Book Now'}
                                    </button>
                                )}
                                <button 
                                    onClick={() => setEditingRoom(room)}
                                    className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'Unknown';
    };

    const handleCheckIn = (order: Order) => {
        const updatedOrder: Order = {
            ...order,
            roomBookingStatus: 'Checked-In',
            checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        onUpdateOrder?.(updatedOrder);
        
        // Also update room status
        const updatedRooms = rooms.map(r => 
            r.id === order.roomId ? { ...r, status: 'Occupied' as const } : r
        );
        onUpdateRooms(updatedRooms);
    };

    const renderReservationsList = () => {
        const filteredOrders = orders.filter(o => o.roomId);
        
        // Filter by selected date
        const dateFilteredOrders = filteredOrders.filter(o => {
            if (!o.checkInDate || !o.checkOutDate) return false;
            return selectedDate >= o.checkInDate && selectedDate <= o.checkOutDate;
        });

        const activeReservations = dateFilteredOrders
            .filter(o => o.status !== 'Completed' && o.status !== 'Cancelled')
            .sort((a, b) => (a.checkInDate || '').localeCompare(b.checkInDate || ''));
        
        const cancelledReservations = dateFilteredOrders
            .filter(o => o.status === 'Cancelled')
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        const displayReservations = showCancelled ? cancelledReservations : activeReservations;

        return (
            <div className="p-4 max-w-6xl mx-auto pb-32">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">Booking Log</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-primary"
                            />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Date</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-3 bg-white dark:bg-gray-800 p-1.5 sm:p-2 rounded-2xl border dark:border-gray-700 shadow-sm overflow-x-auto no-scrollbar">
                        <button 
                            onClick={() => setShowCancelled(false)}
                            className={`px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap ${!showCancelled ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30' : ''}`}
                        >
                            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${!showCancelled ? 'text-blue-600' : 'text-gray-400'}`}>
                                {activeReservations.length} Active
                            </span>
                        </button>
                        <button 
                            onClick={() => setShowCancelled(true)}
                            className={`px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap ${showCancelled ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30' : ''}`}
                        >
                            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${showCancelled ? 'text-red-600' : 'text-gray-400'}`}>
                                {cancelledReservations.length} Cancelled
                            </span>
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {displayReservations.length === 0 ? (
                        <div className="text-center py-20 sm:py-32 bg-white dark:bg-gray-800 rounded-[32px] sm:rounded-[40px] border-2 border-dashed dark:border-gray-700">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <DoorIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] sm:text-xs">No {showCancelled ? 'cancelled' : 'active'} reservations found</p>
                        </div>
                    ) : (
                        displayReservations.map(res => {
                            const room = rooms.find(r => r.id === res.roomId);
                            const isToday = res.checkInDate === new Date().toISOString().split('T')[0];
                            const isCheckedIn = res.roomBookingStatus === 'Checked-In';
                            const isCancelled = res.status === 'Cancelled';

                            return (
                                <motion.div
                                    key={res.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border-2 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 shadow-sm group hover:shadow-xl hover:-translate-y-1 ${
                                        isCancelled ? 'border-red-50 dark:border-red-900/10 opacity-80' :
                                        isCheckedIn ? 'border-blue-100 dark:border-blue-900/30' : 
                                        isToday ? 'border-orange-100 dark:border-orange-900/30' : 
                                        'border-gray-50 dark:border-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center border-2 transition-all shrink-0 ${
                                            isCancelled ? 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400' :
                                            isCheckedIn ? 'bg-blue-600 border-blue-600 text-white' : 
                                            'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white'
                                        }`}>
                                            <span className={`text-[6px] sm:text-[7px] font-black uppercase leading-none mb-1 ${isCheckedIn ? 'text-white/60' : 'text-gray-400'}`}>Room</span>
                                            <span className="text-lg sm:text-xl font-black italic leading-none">
                                                {room?.roomNumber || '??'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`text-sm sm:text-base font-black uppercase tracking-tight leading-none truncate ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                                                    {res.customerName || 'Walk-in Guest'}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-lg text-[6px] sm:text-[7px] font-black uppercase tracking-widest shrink-0 ${
                                                    isCancelled ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                                                    isCheckedIn ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'
                                                }`}>
                                                    {isCancelled ? 'Cancelled' : res.roomBookingStatus}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 dark:text-gray-400 truncate">{res.customerPhone || 'No Phone'}</span>
                                                </div>
                                                {isCancelled && res.isAdvanceRefunded !== undefined && (
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-1 h-1 rounded-full bg-red-400" />
                                                        <span className="text-[8px] sm:text-[9px] font-black text-red-500 uppercase">
                                                            {res.isAdvanceRefunded ? 'Refunded' : 'Kept'}
                                                        </span>
                                                    </div>
                                                )}
                                                {!isCancelled && !isCheckedIn && isToday && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCheckIn(res);
                                                        }}
                                                        className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 rounded-lg group/btn active:scale-95 transition-all"
                                                    >
                                                        <span className="text-[7px] font-black text-white uppercase tracking-widest">Check-In Now</span>
                                                    </button>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span className="text-[8px] sm:text-[9px] font-bold text-gray-400">ID: {res.id.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-12 flex-[1.5]">
                                        <div className="flex flex-col">
                                            <span className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-green-500" />
                                                Check-In
                                            </span>
                                            <p className="text-[10px] sm:text-[11px] font-black text-gray-900 dark:text-white leading-none">
                                                {res.checkInDate}
                                            </p>
                                            <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 mt-1 uppercase">
                                                At {res.checkInTime || '12:00 PM'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-red-500" />
                                                Check-Out
                                            </span>
                                            <p className="text-[10px] sm:text-[11px] font-black text-gray-900 dark:text-white leading-none">
                                                {res.checkOutDate}
                                            </p>
                                            <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 mt-1 uppercase">
                                                By {res.checkOutTime || '11:00 AM'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col md:flex flex-col">
                                            <span className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Stay Info</span>
                                            <p className="text-[10px] sm:text-[11px] font-black text-gray-900 dark:text-white leading-none">
                                                {res.nights || 0} Nights
                                            </p>
                                            <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 mt-1 uppercase">
                                                Rent: ₹{res.roomRent?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                        <button 
                                            onClick={() => onSelectRoomForOrder?.(res.roomId!)}
                                            className="flex-1 lg:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                        >
                                            {isCancelled ? 'View History' : 'Manage'}
                                        </button>
                                        {!isCancelled && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setOrderToCancel(res)}
                                                    className="p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl sm:rounded-2xl hover:bg-red-100 transition-colors"
                                                    title="Quick Cancel"
                                                >
                                                    <CloseIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    const renderCategoryManager = () => (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">Room Categories</h2>
                <button 
                    onClick={() => setEditingCategory({ id: '', name: '', price: 0 })}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>NEW CATEGORY</span>
                </button>
            </div>

            <div className="grid gap-4">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex items-center justify-between shadow-sm">
                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight">{cat.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">₹{cat.price.toLocaleString()} / night</p>
                            {cat.description && <p className="text-xs text-gray-400 mt-1">{cat.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setEditingCategory(cat)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCategoryEditModal = () => {
        if (!editingCategory) return null;
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl"
                >
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 tracking-tight uppercase">
                        {editingCategory.id ? 'Edit Category' : 'New Category'}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Category Name</label>
                            <input 
                                type="text" 
                                value={editingCategory.name}
                                onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary dark:text-white font-bold"
                                placeholder="e.g. Deluxe Suite"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price per Night (₹)</label>
                            <input 
                                type="number" 
                                value={editingCategory.price || ''}
                                onChange={e => setEditingCategory({ ...editingCategory, price: parseFloat(e.target.value) || 0 })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary dark:text-white font-bold"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Description (Optional)</label>
                            <textarea 
                                value={editingCategory.description || ''}
                                onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary dark:text-white font-bold h-24 resize-none"
                                placeholder="Details about the room..."
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-8">
                        <button onClick={() => setEditingCategory(null)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-black text-sm uppercase tracking-widest">Cancel</button>
                        <button 
                            onClick={() => editingCategory.id ? handleUpdateCategory(editingCategory.id, editingCategory) : handleAddCategory(editingCategory)}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            Save
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    };

    const renderRoomModal = () => {
        if (!editingRoom) return null;
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl"
                >
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 tracking-tight uppercase">
                        {editingRoom.id ? 'Edit Room' : 'Add New Room'}
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Room Number</label>
                                <input 
                                    type="text" 
                                    value={editingRoom.roomNumber}
                                    onChange={e => setEditingRoom({ ...editingRoom, roomNumber: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary dark:text-white font-bold"
                                    placeholder="e.g. 101"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Category</label>
                                <select 
                                    value={editingRoom.categoryId}
                                    onChange={e => setEditingRoom({ ...editingRoom, categoryId: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary dark:text-white font-bold"
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} (₹{c.price})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bed Count</label>
                                <input 
                                    type="number" 
                                    value={editingRoom.bedCount || 1}
                                    onChange={e => setEditingRoom({ ...editingRoom, bedCount: parseInt(e.target.value) || 1 })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary dark:text-white font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</label>
                                <select 
                                    value={editingRoom.status}
                                    onChange={e => setEditingRoom({ ...editingRoom, status: e.target.value as any })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary dark:text-white font-bold"
                                >
                                    <option value="Available">Available</option>
                                    <option value="Occupied">Occupied</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Dirty">Dirty</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={editingRoom.hasAttachedBathroom}
                                    onChange={e => setEditingRoom({ ...editingRoom, hasAttachedBathroom: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">Attached Bath</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={editingRoom.hasAC}
                                    onChange={e => setEditingRoom({ ...editingRoom, hasAC: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">AC Room</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={editingRoom.isFoodIncluded}
                                    onChange={e => setEditingRoom({ ...editingRoom, isFoodIncluded: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">Food Included</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-8">
                        <button onClick={() => setEditingRoom(null)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-black text-sm uppercase tracking-widest">Cancel</button>
                        <button 
                            onClick={() => editingRoom.id ? handleUpdateRoom(editingRoom.id, editingRoom) : handleAddRoom(editingRoom)}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            Save
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] dark:bg-gray-900 pb-32">
            {renderHeader()}
            {renderMobileFAB()}
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {view === 'GRID' && renderRoomGrid()}
                    {view === 'RESERVATIONS' && renderReservationsList()}
                    {view === 'CATEGORIES' && renderCategoryManager()}
                </motion.div>
            </AnimatePresence>

            {editingCategory && renderCategoryEditModal()}
            {editingRoom && renderRoomModal()}
            {isReservationModalOpen && (
                <ReservationModal 
                    room={selectedRoomForBooking}
                    rooms={rooms}
                    categories={categories}
                    existingReservation={editingReservation}
                    onClose={() => setIsReservationModalOpen(false)}
                    onSave={handleSaveReservation}
                />
            )}
            {orderToCancel && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-950 w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 p-8 space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <TrashIcon className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Cancel Booking?</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Are you sure you want to cancel this reservation for {orderToCancel.customerName}?</p>
                        </div>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => {
                                    const updatedOrder: Order = {
                                        ...orderToCancel,
                                        status: 'Cancelled' as const,
                                        roomBookingStatus: 'Cancelled' as const,
                                        isAdvanceRefunded: true,
                                        advanceAmount: 0,
                                        cancellationReason: 'Cancelled with refund'
                                    };
                                    onUpdateOrder?.(updatedOrder);
                                    setOrderToCancel(null);
                                }}
                                className="w-full py-4 bg-red-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                            >
                                Cancel & Refund Advance
                            </button>
                            <button 
                                onClick={() => {
                                    const updatedOrder: Order = {
                                        ...orderToCancel,
                                        status: 'Cancelled' as const,
                                        roomBookingStatus: 'Cancelled' as const,
                                        isAdvanceRefunded: false,
                                        cancellationReason: 'Cancelled without refund'
                                    };
                                    onUpdateOrder?.(updatedOrder);
                                    setOrderToCancel(null);
                                }}
                                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-3xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Cancel & Keep Advance
                            </button>
                            <button 
                                onClick={() => setOrderToCancel(null)}
                                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-3xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Don't Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

interface ReservationModalProps {
    room: Room | null;
    rooms: Room[];
    categories: RoomCategory[];
    existingReservation: Order | null;
    onClose: () => void;
    onSave: (data: Partial<Order>) => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ room, rooms, categories, existingReservation, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Order>>(existingReservation || {
        roomId: room?.id || '',
        customerName: '',
        customerPhone: '',
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        checkInTime: '12:00',
        checkOutTime: '11:00',
        advanceAmount: 0,
        roomRent: 0,
        nights: 1,
        roomBookingStatus: 'Reserved'
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (formData.checkInDate && formData.checkOutDate) {
            if (formData.checkOutDate <= formData.checkInDate) {
                setError('Check-out must be after check-in');
            } else {
                setError(null);
            }
        }
        
        const nights = calculateNights(formData.checkInDate || '', formData.checkOutDate || '');
        const selectedRoom = rooms.find(r => r.id === formData.roomId);
        const category = categories.find(c => c.id === selectedRoom?.categoryId);
        const rent = (category?.price || 0) * nights;
        
        setFormData(prev => ({ ...prev, nights, roomRent: rent }));
    }, [formData.checkInDate, formData.checkOutDate, formData.roomId]);

    const calculateNights = (checkIn: string, checkOut: string) => {
        if (!checkIn || !checkOut) return 1;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 0 ? 1 : diffDays;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-950 w-full max-w-lg rounded-3xl sm:rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[95vh]"
            >
                <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto no-scrollbar">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-black dark:text-white italic uppercase tracking-tighter">
                                {existingReservation ? 'Edit Reservation' : 'New Reservation'}
                            </h2>
                            <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Room Booking System</p>
                        </div>
                        <button onClick={onClose} className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Room</p>
                                <select 
                                    value={formData.roomId}
                                    onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-[11px] font-black outline-none border border-transparent focus:border-black dark:focus:border-white transition-all text-black dark:text-white"
                                >
                                    <option value="">Choose Room</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id}>Room {r.roomNumber}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</p>
                                <div className="w-full bg-orange-50 dark:bg-orange-900/20 rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-[11px] font-black text-center text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 uppercase tracking-widest">
                                    Reserved
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Name</p>
                            <input 
                                type="text"
                                placeholder="ENTER FULL NAME"
                                value={formData.customerName}
                                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-[11px] font-black uppercase outline-none border border-transparent focus:border-black dark:focus:border-white transition-all text-black dark:text-white"
                            />
                        </div>

                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</p>
                            <input 
                                type="tel"
                                placeholder="ENTER PHONE NUMBER"
                                value={formData.customerPhone}
                                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-[11px] font-black uppercase outline-none border border-transparent focus:border-black dark:focus:border-white transition-all text-black dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Check-In Date</p>
                                <input 
                                    type="date"
                                    value={formData.checkInDate}
                                    onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-[11px] font-black outline-none border border-transparent focus:border-black dark:focus:border-white transition-all text-black dark:text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Check-Out Date</p>
                                <input 
                                    type="date"
                                    value={formData.checkOutDate}
                                    onChange={e => setFormData({ ...formData, checkOutDate: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-[11px] font-black outline-none border border-transparent focus:border-black dark:focus:border-white transition-all text-black dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Nights</p>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-[11px] font-black text-center text-black dark:text-white">
                                    {formData.nights}
                                </div>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Rent</p>
                                <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-[11px] font-black text-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 italic">
                                    ₹{formData.roomRent?.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Advance Amount</p>
                            <input 
                                type="number"
                                placeholder="0.00"
                                value={formData.advanceAmount || ''}
                                onChange={e => setFormData({ ...formData, advanceAmount: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-[11px] font-black outline-none border border-transparent focus:border-black dark:focus:border-white transition-all text-black dark:text-white"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl border border-red-100 dark:border-red-900/30">
                                <p className="text-[8px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest text-center">
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 sm:py-4 bg-gray-100 dark:bg-gray-900 text-gray-400 rounded-2xl sm:rounded-3xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => onSave(formData)}
                            disabled={!formData.roomId || !formData.customerName || !!error}
                            className="flex-[2] py-3 sm:py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl sm:rounded-3xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl disabled:opacity-50"
                        >
                            {existingReservation ? 'Update' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RoomManagementScreen;
