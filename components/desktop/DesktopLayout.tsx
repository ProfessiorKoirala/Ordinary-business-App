import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MainView, Order, Expense, Product, Creditor, Customer, Table, Payment, DeletedItem, Reminder, BusinessSettings, Holiday, AppDataBackup, User, Staff, Discount, BusinessProfile, Vendor, Purchase, VendorPayment, Attendance, Payroll, Notification, KOT, KOTItem, DeliveryPartner, OrderItem, OrderStatus, Tip } from '../../types';
import { mergeWithInitialData } from '../../utils/dataUtils';
import DesktopSidebar from './DesktopSidebar';
import DashboardScreen from '../../screens/DashboardScreen';
import SalesScreen from '../../screens/SalesScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import EditProfileScreen from '../../screens/EditProfileScreen';
import ExpensesScreen from '../../screens/ExpensesScreen';
import CustomersScreen from '../../screens/CustomersScreen';
import CreditorsScreen from '../../screens/CreditorsScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import AddCustomerModal from '../AddCustomerModal';
import AddCreditorModal from '../AddCreditorModal';
import CustomerDetailScreen from '../../screens/CustomerDetailScreen';
import CreditorDetailScreen from '../../screens/CreditorDetailScreen';
import RecycleBinScreen from '../../screens/RecycleBinScreen';
import CalculatorScreen from '../../screens/CalculatorScreen';
import BillsScreen from '../../screens/BillsScreen';
import { CalendarScreen } from '../../screens/CalendarScreen';
import AccountingScreen from '../../screens/AccountingScreen';
import InventoryScreen from '../../screens/InventoryScreen';
import AddEditProductModal from '../inventory/AddEditProductModal';
import AddEditStaffModal from '../staff/AddEditStaffModal';
import StaffManagementScreen from '../../screens/StaffManagementScreen';
import StaffDetailScreen from '../../screens/StaffDetailScreen';
import ReportsScreen from '../../screens/ReportsScreen';
import DiscountManagementScreen from '../../screens/DiscountManagementScreen';
import AddEditDiscountModal from '../discounts/AddEditDiscountModal';
import VendorsScreen from '../../screens/VendorsScreen';
import VendorDetailScreen from '../../screens/VendorDetailScreen';
import AddEditVendorModal from '../vendors/AddEditVendorModal';
import AddPurchaseModal from '../purchases/AddPurchaseModal';
import AddTableModal from '../sales/AddTableModal';
import OrdersScreen from '../../screens/OrdersScreen';
import HistoricalDataEntryScreen from '../../screens/HistoricalDataEntryScreen';
import CommunicationsScreen from '../../screens/CommunicationsScreen';
import AddExpenseModal from '../AddExpenseModal';
import { printKOT } from '../../utils/printUtils';
import KotListScreen from '../../screens/KotListScreen';
import TransactionsScreen from '../../screens/TransactionsScreen';
import TrackerScreen from '../../screens/TrackerScreen';
import WeatherScreen from '../../screens/WeatherScreen';
import NotesScreen from '../../screens/NotesScreen';
import NotificationsDrawer from '../notifications/NotificationsDrawer';
import AddContactModal from '../communications/AddContactModal';
import StockReportScreen from '../../screens/StockReportScreen';
import TipPoolScreen from '../../screens/TipPoolScreen';
import KitchenScreen from '../../screens/KitchenScreen';
import WaiterScreen from '../../screens/WaiterScreen';
import SystemNotificationsScreen from '../../screens/SystemNotificationsScreen';
import RoomManagementScreen from '../../screens/RoomManagementScreen';

interface DesktopLayoutProps {
    appData: AppDataBackup;
    setAppData: React.Dispatch<React.SetStateAction<AppDataBackup>>;
    activeUser: User;
    onUpdateUser: (updatedUser: User) => void;
    onLogout: () => void;
    onUpdateUserEmail: (oldUserId: string, migratedUser: User) => void;
    syncStatus: string;
    profileData: BusinessProfile;
    setProfileData: (updater: React.SetStateAction<BusinessProfile>) => void;
    onUpdateBusinessProfile: (profile: BusinessProfile) => void;
    pendingOrders: Order[]; // Adjusted type here to match MainScreen expectations if needed
    setPendingOrders: React.Dispatch<React.SetStateAction<Map<string, Order>>>;
    isVatEnabled: boolean;
    setIsVatEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    handleClearAllData: () => void;
    handleDeleteTable: (tableId: string) => void;
    onDeleteUser?: (userId: string) => void;
    onPremiumFeatureClick?: () => void;
    broadcastOrderUpdate: (order: Order) => void;
    handleUpdateKOTStatus: (kotId: string, status: OrderStatus) => void;
    handleSaveKOT: (order: Order, previousItems?: OrderItem[]) => KOT | null;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = (props) => {
    const { appData, setAppData, activeUser, onUpdateUser, onLogout, onUpdateUserEmail, syncStatus, profileData, setProfileData, onUpdateBusinessProfile, pendingOrders, setPendingOrders, isVatEnabled, setIsVatEnabled, handleClearAllData, handleDeleteTable, onDeleteUser, onPremiumFeatureClick, broadcastOrderUpdate, handleUpdateKOTStatus, handleSaveKOT } = props;
    
    const { 
        products = [], 
        orders = [], 
        payments = [], 
        expenses = [], 
        customers = [], 
        creditors = [], 
        staff = [], 
        reminders = [], 
        holidays = [], 
        settings, 
        deletedItems = [], 
        tables = [], 
        discounts = [], 
        vendors = [], 
        purchases = [], 
        vendorPayments = [], 
        deliveryPartners = [],
        attendance = [], 
        payrolls = [], 
        notifications = [], 
        kots = [],
        trackers = [],
        notes = [],
        noteCategories = [],
        tips = [],
        rooms = [],
        roomCategories = []
    } = appData;
    
    const [currentView, setCurrentView] = useState<MainView>(MainView.DASHBOARD);
    const contentRef = useRef<HTMLDivElement>(null);

    const [modal, setModal] = useState<'addCustomer' | 'addCreditor' | 'addProduct' | 'addStaff' | 'addDiscount' | 'addVendor' | 'addPurchase' | 'addTable' | 'addExpense' | 'addContact' | null>(null);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
    const [discountToEdit, setDiscountToEdit] = useState<Discount | null>(null);
    const [detailViewId, setDetailViewId] = useState<string | null>(null);
    const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
    const [preSelectedRoomId, setPreSelectedRoomId] = useState<string | null>(null);

    useEffect(() => { contentRef.current?.scrollTo(0, 0); }, [currentView, detailViewId]);

    const updateState = useCallback((key: keyof AppDataBackup, value: any) => {
        setAppData(prev => ({ ...prev, [key]: value }));
    }, [setAppData]);

    const goToDashboard = useCallback(() => { setCurrentView(MainView.DASHBOARD); }, []);

    const handleEditOrder = useCallback((order: Order) => {
        setOrderToEdit(order);
        setCurrentView(MainView.SALES);
    }, []);

    const handleUpdateAndSaveOrder = useCallback((updatedOrder: Order, tipData?: { amount: number; method: 'Cash' | 'Bank' }) => {
        if (tipData && tipData.amount > 0) {
            const distType = settings.defaultTipDistribution || 'POOL';
            const businessShare = distType === 'BUSINESS_ONLY' ? tipData.amount : (distType === 'SPLIT_50_50' ? tipData.amount / 2 : 0);
            const staffShare = distType === 'STAFF_ONLY' ? tipData.amount : (distType === 'SPLIT_50_50' ? tipData.amount / 2 : (distType === 'POOL' ? tipData.amount : 0));
            
            const newTip: Tip = {
                id: `tip-${Date.now()}`,
                amount: tipData.amount,
                date: new Date().toISOString().split('T')[0],
                timestamp: Date.now(),
                orderId: updatedOrder.id,
                paymentMethod: tipData.method,
                distributionType: distType,
                businessShare,
                staffShare,
                isDistributed: distType === 'BUSINESS_ONLY'
            };
            updateState('tips', [...tips, newTip]);
        }

        updateState('orders', orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setOrderToEdit(null);
        setCurrentView(MainView.ORDERS);
    }, [orders, tips, settings.defaultTipDistribution, updateState]);

    const handleDeleteOrder = useCallback((id: string) => { const order = orders.find(o => o.id === id); if (order) { updateState('deletedItems', [...deletedItems, { id: `del-${Date.now()}`, type: 'Order', data: order, deletedAt: Date.now() }]); updateState('orders', orders.filter(o => o.id !== id)); } }, [orders, deletedItems, updateState]);
    const handleDeleteExpense = useCallback((id: string) => { const expense = expenses.find(e => e.id === id); if (expense) { updateState('deletedItems', [...deletedItems, { id: `del-${Date.now()}`, type: 'Expense', data: expense, deletedAt: Date.now() }]); updateState('expenses', expenses.filter(e => e.id !== id)); } }, [expenses, deletedItems, updateState]);

    const handleRestore = useCallback((item: DeletedItem) => {
        setAppData(prev => {
            const keyMap: Record<string, keyof AppDataBackup> = { 'Order': 'orders', 'Expense': 'expenses', 'Customer': 'customers', 'Creditor': 'creditors', 'Product': 'products', 'Staff': 'staff', 'Vendor': 'vendors', 'Purchase': 'purchases', 'Tracker': 'trackers' };
            const targetKey = keyMap[item.type];
            if (!targetKey) return prev;
            return { ...prev, [targetKey]: [...(prev[targetKey] as any[]), item.data], deletedItems: prev.deletedItems.filter(i => i.id !== item.id) };
        });
    }, [setAppData]);

    const handlePermanentlyDelete = useCallback((itemId: string) => {
        setAppData(prev => ({ ...prev, deletedItems: prev.deletedItems.filter(i => i.id !== itemId) }));
    }, [setAppData]);

    const handleOrderComplete = useCallback((order: Order, upfrontPayment: number, tipData?: { amount: number; method: 'Cash' | 'Bank' }) => {
        const newProducts = [...products];
        order.items.forEach(item => { const prodIdx = newProducts.findIndex(p => p.id === item.product.id); if (prodIdx !== -1 && newProducts[prodIdx].trackStock) { newProducts[prodIdx] = { ...newProducts[prodIdx], stock: Math.max(0, (newProducts[prodIdx].stock || 0) - item.quantity) }; } });
        updateState('products', newProducts);
        if (upfrontPayment > 0) { updateState('payments', [...payments, { id: `adv-${Date.now()}`, creditorId: order.creditorId || 'none', amount: upfrontPayment, method: (order.paymentMethod === 'Bank' ? 'Bank' : 'Cash'), date: Date.now(), type: order.type === 'Order' ? 'Delivery Advance' : (order.paymentMethod === 'Credit' ? 'Credit Payment' : 'Direct Payment') }]); }
        
        if (tipData && tipData.amount > 0) {
            const distType = settings.defaultTipDistribution || 'POOL';
            const businessShare = distType === 'BUSINESS_ONLY' ? tipData.amount : (distType === 'SPLIT_50_50' ? tipData.amount / 2 : 0);
            const staffShare = distType === 'STAFF_ONLY' ? tipData.amount : (distType === 'SPLIT_50_50' ? tipData.amount / 2 : (distType === 'POOL' ? tipData.amount : 0));
            
            const newTip: Tip = {
                id: `tip-${Date.now()}`,
                amount: tipData.amount,
                date: new Date().toISOString().split('T')[0],
                timestamp: Date.now(),
                orderId: order.id,
                paymentMethod: tipData.method,
                distributionType: distType,
                businessShare,
                staffShare,
                isDistributed: distType === 'BUSINESS_ONLY'
            };
            updateState('tips', [...tips, newTip]);
        }

        updateState('orders', [...orders, order]);
        broadcastOrderUpdate(order);
        setPendingOrders(prev => { const newMap = new Map(prev); if (order.tableId) newMap.delete(order.tableId); newMap.delete(order.id); return newMap; });
        if (order.tableId) { updateState('tables', tables.map(t => t.id === order.tableId ? { ...t, status: 'Free' } : t)); }
    }, [orders, tables, products, updateState, setPendingOrders, payments, tips, settings.defaultTipDistribution, broadcastOrderUpdate]);

    const handleUpdateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => { 
        // Check in finalized orders
        const oldOrder = orders.find(o => o.id === orderId);
        if (oldOrder) {
            const updatedOrder = { ...oldOrder, status: newStatus, isUpdated: false };
            updateState('orders', orders.map(o => o.id === orderId ? updatedOrder : o)); 
            broadcastOrderUpdate(updatedOrder);
            return;
        }

        // Check in pending orders (drafts)
        setPendingOrders(prev => {
            const newMap = new Map<string, Order>(prev);
            let foundKey: string | null = null;
            let foundOrder: Order | null = null;

            for (const [key, order] of newMap.entries()) {
                if ((order as Order).id === orderId) {
                    foundKey = key;
                    foundOrder = order as Order;
                    break;
                }
            }

            if (foundOrder && foundKey) {
                const updatedOrder = { ...foundOrder, status: newStatus, isUpdated: false };
                newMap.set(foundKey, updatedOrder);
                broadcastOrderUpdate(updatedOrder);
                return newMap;
            }
            return prev;
        });
    }, [orders, updateState, broadcastOrderUpdate, setPendingOrders]);

    const handleAdvancedReturn = useCallback((orderId: string, updatedItems: OrderItem[], adjustment: number, status: any, logistics: { date: string, time: string, newFee: number }) => {
        const oldOrder = orders.find(o => o.id === orderId);
        if (!oldOrder) return;
        const newProducts = [...products];
        updatedItems.forEach(item => { const oldItem = oldOrder.items.find(i => i.product.id === item.product.id); const returnedDiff = (item.returnedQuantity || 0) - (oldItem?.returnedQuantity || 0); if (returnedDiff > 0) { const prodIdx = newProducts.findIndex(p => p.id === item.product.id); if (prodIdx !== -1 && newProducts[prodIdx].trackStock) { newProducts[prodIdx] = { ...newProducts[prodIdx], stock: (newProducts[prodIdx].stock || 0) + returnedDiff }; } } });
        updateState('products', newProducts);
        const updatedOrder = { ...oldOrder, items: updatedItems, status, deliveryDate: logistics.date, deliveryTime: logistics.time, deliveryFee: (oldOrder.deliveryFee || 0) + logistics.newFee, grandTotal: (oldOrder.grandTotal || 0) + adjustment };
        updateState('orders', orders.map(o => o.id === orderId ? updatedOrder : o));
        broadcastOrderUpdate(updatedOrder);
    }, [orders, products, updateState, broadcastOrderUpdate]);

    const handleExportData = useCallback(() => {
        try {
            const dataStr = JSON.stringify(appData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `empire-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            alert("Successfully downloaded! Now you can import it in another device and look at business report transactions and also can continue. Thank you!");
        } catch (e) {
            console.error("Export failed", e);
            alert("Failed to export data.");
        }
    }, [appData]);

    const handleImportData = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    const parsed = JSON.parse(content);
                    if (parsed && typeof parsed === 'object') {
                        const merged = mergeWithInitialData(parsed);
                        setAppData(merged);
                        alert("Data imported successfully!");
                    } else {
                        alert("Invalid backup file format.");
                    }
                } catch (err) {
                    console.error("Import failed", err);
                    alert("Failed to parse the backup file.");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, [setAppData]);

    const renderView = () => {
        const isDesktopView = true;
        switch(currentView) {
            case MainView.DASHBOARD: return <DashboardScreen isDesktop={isDesktopView} setCurrentView={setCurrentView} currentView={currentView} businessProfile={profileData} orders={orders} payments={payments} expenses={expenses} products={products} setIsMenuOpen={() => {}} unreadNotificationCount={notifications.filter(n=>!n.read).length} onOpenNotifications={() => setIsNotificationsOpen(true)} settings={settings} vendorPayments={vendorPayments} onUpdateBusinessProfile={onUpdateBusinessProfile} appData={appData} />;
            case MainView.SALES: return <SalesScreen isDesktop={isDesktopView} setCurrentView={setCurrentView} orderToEdit={orderToEdit} onUpdateAndSaveOrder={handleUpdateAndSaveOrder} products={products} tables={tables} creditors={creditors} customers={customers} vendors={vendors} deliveryPartners={deliveryPartners} onUpdateDeliveryPartners={(p)=>updateState('deliveryPartners', p)} discounts={discounts} isVatEnabled={isVatEnabled} isKotEnabled={settings.isKotEnabled} onOrderComplete={handleOrderComplete} onUpdateTableStatus={(id, status) => updateState('tables', tables.map(t => t.id === id ? {...t, status} : t))} rooms={rooms || []} roomCategories={roomCategories || []} preSelectedRoomId={preSelectedRoomId} onSavePendingOrder={(o) => { 
    const key = (o.type === 'Table' && o.tableId) ? o.tableId : o.id; 
    const existing = (pendingOrders as any).get(key) as Order | undefined;
    handleSaveKOT(o, existing ? existing.items : []);

    setPendingOrders(prev => { 
        const newMap = new Map<string, Order>(prev as any); 
        let updatedOrder = { ...o };
        if (existing && existing.status === 'Processing') {
            updatedOrder.isUpdated = true;
        }
        newMap.set(key, updatedOrder); 
        broadcastOrderUpdate(updatedOrder);
        return newMap as any; 
    }); 
}} onPrintKot={(order) => { const kot: KOT = { id: `kot-${Date.now()}`, orderId: order.id, type: 'NEW', kotNumber: 1, timestamp: Date.now(), items: order.items.map(i => ({ name: i.product.name, quantity: i.quantity })), tableName: order.tableId ? tables.find(t => t.id === order.tableId)?.name : (order.type === 'Takeaway' ? 'Takeaway' : 'Delivery') }; printKOT(kot, profileData); }} onReprintLatestKot={() => {}} pendingOrders={pendingOrders as any} orders={orders} onAddProductClick={() => setModal('addProduct')} onAddTableClick={() => setModal('addTable')} businessProfile={profileData} onDeleteTable={handleDeleteTable} onUpdateSettings={(s) => updateState('settings', s)} businessSettings={settings} onUpdateOrderStatus={handleUpdateOrderStatus} onHome={goToDashboard} onEditCancel={() => { setOrderToEdit(null); setCurrentView(MainView.ORDERS); }} />;
            case MainView.INVENTORY: return <InventoryScreen products={products} onAddProductClick={() => setModal('addProduct')} onEditProductClick={(p)=>{setProductToEdit(p); setModal('addProduct');}} onDeleteProduct={(id)=>updateState('products', products.filter(p=>p.id!==id))} onToggleQuickAdd={(id)=>updateState('products', products.map(p=>p.id===id?{...p,isQuickAdd:!p.isQuickAdd}:p))} businessProfile={profileData} onHome={goToDashboard} />;
            case MainView.EXPENSES: return <ExpensesScreen expenses={expenses} onAddClick={() => setModal('addExpense')} onEditClick={(e)=>{setExpenseToEdit(e); setModal('addExpense');}} onDeleteExpense={(id)=>updateState('expenses', expenses.filter(e=>e.id!==id))} businessProfile={profileData} onHome={goToDashboard} />;
            case MainView.PROFILE: return <ProfileScreen appData={appData} profileData={profileData} onBack={() => setCurrentView(MainView.DASHBOARD)} onLogout={onLogout} onEdit={() => setCurrentView(MainView.EDIT_PROFILE)} />;
            case MainView.EDIT_PROFILE: return <EditProfileScreen profileData={profileData} onCancel={() => setCurrentView(MainView.PROFILE)} onSave={(u, p) => { onUpdateUser(u); setProfileData(p); setCurrentView(MainView.PROFILE); }} activeUser={activeUser} />;
            case MainView.SETTINGS: return <SettingsScreen isVatEnabled={isVatEnabled} onVatToggle={() => setIsVatEnabled(p => !p)} businessSettings={settings} onUpdateBusinessSettings={(s) => updateState('settings', s)} onExportData={handleExportData} onImportData={handleImportData} onLogout={onLogout} activeUser={activeUser} onUpdateUserSettings={(u)=>onUpdateUser({...activeUser,...u})} setCurrentView={setCurrentView} onClearAllData={handleClearAllData} onDeleteUser={onDeleteUser} businessProfile={profileData} onUpdateBusinessProfile={(p)=>setProfileData(p)} onPremiumFeatureClick={onPremiumFeatureClick} />;
            case MainView.REPORTS: return <ReportsScreen orders={orders} expenses={expenses} products={products} payments={payments} onHome={goToDashboard} />;
            case MainView.ORDERS: return <OrdersScreen orders={orders} customers={customers} creditors={creditors} vendors={vendors} products={products} onViewBill={(o) => {}} onEditOrder={handleEditOrder} onDeleteOrder={handleDeleteOrder} onUpdateStatus={handleUpdateOrderStatus} onCancelOrder={(id) => handleUpdateOrderStatus(id, 'Cancelled')} onAddNewOrder={() => setCurrentView(MainView.SALES)} businessProfile={profileData} onViewKots={(o) => {}} onHome={goToDashboard} onProcessAdvancedReturn={handleAdvancedReturn} />;
            case MainView.BILLS: return <BillsScreen orders={orders} expenses={expenses} isVatEnabled={isVatEnabled} businessProfile={profileData} onDeleteOrder={handleDeleteOrder} onDeleteExpense={handleDeleteExpense} activeUser={activeUser} onHome={goToDashboard} />;
            case MainView.ACCOUNTING: return <AccountingScreen orders={orders} expenses={expenses} payments={payments} creditors={creditors} products={products} businessProfile={profileData} onHome={goToDashboard} />;
            case MainView.STAFF: return <StaffManagementScreen staff={staff} onAddClick={() => setModal('addStaff')} onViewStaff={(id) => { setDetailViewId(id); setCurrentView(MainView.STAFF_DETAIL); }} businessProfile={profileData} onHome={goToDashboard} />;
            case MainView.STAFF_DETAIL: {
                const member = staff.find(s => s.id === detailViewId);
                if (!member) return null;
                return <StaffDetailScreen staffMember={member} attendance={attendance} payrolls={payrolls} onBack={() => setCurrentView(MainView.STAFF)} onEditStaff={(s)=>{setStaffToEdit(s); setModal('addStaff');}} onDeleteStaff={(id)=>updateState('staff', staff.filter(s=>s.id!==id))} onUpdateStatus={(id, stat)=>updateState('staff', staff.map(s=>s.id===id?{...s,status:stat}:s))} onClockInOut={(id, type)=>updateState('attendance', [...attendance, {id:`att-${Date.now()}`, staffId:id, date:new Date().toISOString().split('T')[0], clockIn:type==='in'?Date.now():null, clockOut:type==='out'?Date.now():null, status:'Present'}])} onMarkLeave={(id, date, type, reason)=>updateState('attendance', [...attendance, {id:`att-${Date.now()}`, staffId:id, date, status:type, reason, clockIn:null, clockOut:null}])} onDeleteAttendance={(id)=>updateState('attendance', attendance.filter(a=>a.id!==id))} onPaySalary={(id, month, amount, bonus, taxDeduction)=>updateState('payrolls', [...payrolls, {id:`pay-${Date.now()}`, staffId:id, month, amount, bonus, taxDeduction, paidOn:Date.now()}])} businessProfile={profileData} holidays={holidays} settings={settings} />;
            }
            case MainView.CUSTOMERS: return <CustomersScreen customers={customers} onAddCustomerClick={() => setModal('addCustomer')} onViewCustomer={(id) => { setDetailViewId(id); setCurrentView(MainView.CUSTOMER_DETAIL); }} onConvertToCreditor={(c) => { updateState('creditors', [...creditors, { ...c, creditDisabled: false }]); updateState('customers', customers.filter(cust => cust.id !== c.id)); }} businessProfile={profileData} onHome={goToDashboard} />;
            case MainView.CUSTOMER_DETAIL: {
                const customer = customers.find(c => c.id === detailViewId);
                if (!customer) return null;
                return <CustomerDetailScreen customer={customer} orders={orders} onBack={() => setCurrentView(MainView.CUSTOMERS)} onConvertToCreditor={(c) => { updateState('creditors', [...creditors, { ...c, creditDisabled: false }]); updateState('customers', customers.filter(cust => cust.id !== c.id)); setCurrentView(MainView.CUSTOMERS); }} isVatEnabled={isVatEnabled} businessProfile={profileData} />;
            }
            case MainView.CREDITORS: return <CreditorsScreen creditors={creditors} onAddCreditorClick={() => setModal('addCreditor')} onToggleCreditStatus={(id) => updateState('creditors', creditors.map(c => c.id === id ? {...c, creditDisabled: !c.creditDisabled} : c))} onViewCreditor={(id) => { setDetailViewId(id); setCurrentView(MainView.CREDITOR_DETAIL); }} businessProfile={profileData} onHome={goToDashboard} />;
            case MainView.CREDITOR_DETAIL: {
                const creditor = creditors.find(c => c.id === detailViewId);
                if (!creditor) return null;
                return <CreditorDetailScreen creditor={creditor} orders={orders} payments={payments} onBack={() => setCurrentView(MainView.CREDITORS)} onCollectPayment={(id, data) => updateState('payments', [...payments, { ...data, id: `p-${Date.now()}`, creditorId: id, date: Date.now(), type: 'Credit Payment' }])} onReturnAdvance={(id, data) => updateState('payments', [...payments, { ...data, id: `p-${Date.now()}`, creditorId: id, date: Date.now(), type: 'Advance Return' }])} isVatEnabled={isVatEnabled} businessProfile={profileData} />;
            }
            case MainView.VENDORS: return <VendorsScreen vendors={vendors} onAddVendorClick={() => setModal('addVendor')} onAddPurchaseClick={() => setModal('addPurchase')} onViewVendor={(id) => { setDetailViewId(id); setCurrentView(MainView.VENDOR_DETAIL); }} businessProfile={profileData} onHome={goToDashboard} />;
            case MainView.VENDOR_DETAIL: {
                const vendor = vendors.find(v => v.id === detailViewId);
                if (!vendor) return null;
                return <VendorDetailScreen vendor={vendor} purchases={purchases} payments={vendorPayments} onBack={() => setCurrentView(MainView.VENDORS)} onRecordPayment={(id, data)=>updateState('vendorPayments', [...vendorPayments, {...data, id:`vp-${Date.now()}`, vendorId:id, date:Date.now(), type:'Vendor Payment'}])} onRecordAdvance={(id, data)=>updateState('vendorPayments', [...vendorPayments, {...data, id:`vp-${Date.now()}`, vendorId:id, date:Date.now(), type:'Advance Payment'}])} onDeletePurchase={(id)=>updateState('purchases', purchases.filter(p=>p.id!==id))} businessProfile={profileData} />;
            }
            case MainView.COMMUNICATIONS: return <CommunicationsScreen appData={appData} setAppData={setAppData} businessProfile={profileData} setCurrentView={setCurrentView} onAddContactClick={() => setModal('addContact')} onHome={goToDashboard} />;
            case MainView.TRACKER: return <TrackerScreen trackers={trackers} orders={orders} products={products} onBack={() => setCurrentView(MainView.DASHBOARD)} onAddTracker={(t) => updateState('trackers', [...trackers, { ...t, id: `tr-${Date.now()}` }])} onUpdateTracker={(t) => updateState('trackers', trackers.map(tr => tr.id === t.id ? t : tr))} onDeleteTracker={(id) => updateState('trackers', trackers.filter(tr => tr.id !== id))} onRecordExpense={(title, amount, category) => updateState('expenses', [...expenses, { id: `exp-${Date.now()}`, title, amount, category, date: new Date().toISOString().split('T')[0] }])} onRescheduleOrder={(id, date) => { const updatedOrder = { ...orders.find(o => o.id === id)!, deliveryDate: date }; updateState('orders', orders.map(o => o.id === id ? updatedOrder : o)); broadcastOrderUpdate(updatedOrder); }} onUpdateStatus={handleUpdateOrderStatus} onProcessAdvancedReturn={handleAdvancedReturn} businessProfile={profileData} onHome={goToDashboard} />;
            case MainView.NOTES: return <NotesScreen notes={notes} categories={noteCategories} onUpdateNotes={(n)=>updateState('notes', n)} onUpdateCategories={(c)=>updateState('noteCategories', c)} onBack={() => setCurrentView(MainView.DASHBOARD)} onHome={goToDashboard} />;
            case MainView.WEATHER: return <WeatherScreen onBack={() => setCurrentView(MainView.DASHBOARD)} bossName={activeUser.name} onHome={goToDashboard} />;
            case MainView.CALCULATOR: return <CalculatorScreen setCurrentView={setCurrentView} onHome={goToDashboard} isDesktop={isDesktopView} />;
            case MainView.RECYCLE_BIN: return <RecycleBinScreen deletedItems={deletedItems} onRestore={handleRestore} onPermanentlyDelete={handlePermanentlyDelete} onHome={goToDashboard} />;
            case MainView.DISCOUNTS: return <DiscountManagementScreen products={products} discounts={discounts} onAddClick={() => setModal('addDiscount')} onEditClick={(d) => { setDiscountToEdit(d); setModal('addDiscount'); }} onDelete={(id) => updateState('discounts', discounts.filter(d => d.id !== id))} onToggleStatus={(id) => updateState('discounts', discounts.map(d => d.id === id ? {...d, isActive: !d.isActive} : d))} onBack={() => setCurrentView(MainView.SETTINGS)} onHome={goToDashboard} />;
            case MainView.KOT_LIST: return <KotListScreen kots={kots || []} onBack={() => setCurrentView(MainView.DASHBOARD)} businessProfile={profileData} onHome={goToDashboard} />;
            case MainView.HISTORICAL_DATA_ENTRY: return <HistoricalDataEntryScreen onBack={() => setCurrentView(MainView.SETTINGS)} onAddHistoricalOrder={(o)=>updateState('orders', [...orders, o])} onAddHistoricalExpense={(e)=>updateState('expenses', [...expenses, {...e, id:`exp-${Date.now()}`}])} onAddHistoricalPurchase={(p)=>updateState('purchases', [...purchases, {...p, id:`pur-${Date.now()}`}])} vendors={vendors} products={products} isDesktop={isDesktopView} />;
            case MainView.CALENDAR: return <CalendarScreen orders={orders} expenses={expenses} payments={payments} reminders={reminders} creditors={creditors} onAddReminder={()=>{}} settings={settings} holidays={holidays} onAddHoliday={()=>{}} onDeleteReminder={()=>{}} onDeleteHoliday={()=>{}} onHome={goToDashboard} isDesktop={isDesktopView} />;
            case MainView.STOCK_REPORT: return <StockReportScreen orders={orders} products={products} purchases={purchases} onBack={() => setCurrentView(MainView.DASHBOARD)} onHome={goToDashboard} onUpdateProducts={(newProds) => updateState('products', newProds)} />;
            case MainView.KITCHEN: return <KitchenScreen kots={kots.filter(k => k.status !== 'Delivered')} tables={tables} onUpdateKOTStatus={handleUpdateKOTStatus} onHome={goToDashboard} />;
            case MainView.WAITER: return <WaiterScreen kots={kots.filter(k => k.status !== 'Delivered')} tables={tables} onUpdateKOTStatus={handleUpdateKOTStatus} onHome={goToDashboard} />;
            case MainView.ROOMS: 
                return (
                    <RoomManagementScreen 
                        rooms={rooms || []} 
                        categories={roomCategories || []} 
                        orders={orders || []}
                        onUpdateRooms={(newRooms) => updateState('rooms', newRooms)} 
                        onUpdateCategories={(newCats) => updateState('roomCategories', newCats)} 
                        onHome={goToDashboard} 
                        onSelectRoomForOrder={(roomId) => {
                            setOrderToEdit(null);
                            setPreSelectedRoomId(roomId);
                            setCurrentView(MainView.SALES);
                        }}
                        onUpdateOrder={(updatedOrder) => updateState('orders', orders.map(o => o.id === updatedOrder.id ? updatedOrder : o))}
                        onAddOrder={(newOrder) => updateState('orders', [...orders, newOrder])}
                    />
                );
            case MainView.TIP_POOL: 
                return (
                    <TipPoolScreen 
                        tips={tips} 
                        staff={staff} 
                        onAddTip={(tip) => updateState('tips', [...tips, { ...tip, id: `tip-${Date.now()}` }])} 
                        onDeleteTip={(id) => updateState('tips', tips.filter(t => t.id !== id))} 
                        onUpdateTip={(updatedTip) => updateState('tips', tips.map(t => t.id === updatedTip.id ? updatedTip : t))}
                        onHome={goToDashboard} 
                        businessProfile={profileData} 
                        defaultDistribution={settings.defaultTipDistribution || 'POOL'}
                    />
                );
            case MainView.SYSTEM_NOTIFICATIONS: return <SystemNotificationsScreen onBack={() => setCurrentView(MainView.DASHBOARD)} />;
            default: return <DashboardScreen isDesktop={isDesktopView} setCurrentView={setCurrentView} currentView={currentView} businessProfile={profileData} orders={orders} payments={payments} expenses={expenses} products={products} setIsMenuOpen={() => {}} unreadNotificationCount={notifications.filter(n=>!n.read).length} onOpenNotifications={() => setIsNotificationsOpen(true)} settings={settings} vendorPayments={vendorPayments} appData={appData} />;
        }
    };
    
    return (
        <div className="desktop-layout">
            <NotificationsDrawer isOpen={isNotificationsOpen} notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onMarkAsRead={(id)=>updateState('notifications', notifications.map(n=>n.id===id?{...n,read:true}:n))} onMarkAllAsRead={()=>updateState('notifications', notifications.map(n=>({...n,read:true})))} onClearAll={()=>updateState('notifications', [])} />
            <DesktopSidebar activeUser={activeUser} currentView={currentView} setCurrentView={setCurrentView} onLogout={onLogout} settings={settings} businessProfile={profileData} onUpdateBusinessProfile={onUpdateBusinessProfile} />
            <main ref={contentRef} className="desktop-main-content">
                {modal === 'addCustomer' && (
                    <AddCustomerModal onClose={() => setModal(null)} onSave={(data) => { updateState('customers', [...customers, { ...data, id: `c-${Date.now()}` }]); setModal(null); }} />
                )}
                {modal === 'addCreditor' && (
                    <AddCreditorModal onClose={() => setModal(null)} onSave={(data) => { updateState('creditors', [...creditors, { ...data, id: `cr-${Date.now()}`, creditDisabled: false }]); setModal(null); }} />
                )}
                {modal === 'addProduct' && (
                    <AddEditProductModal product={null} onClose={() => { setModal(null); setProductToEdit(null); }} onSave={(p) => { updateState('products', [...products, {...p, id: `p-${Date.now()}`}]); setModal(null); }} />
                )}
                {modal === 'addExpense' && (
                    <AddExpenseModal expense={null} onClose={() => { setModal(null); setExpenseToEdit(null); }} onSave={(e) => { updateState('expenses', [...expenses, {...e, id: `exp-${Date.now()}`}]); setModal(null); }} />
                )}
                {modal === 'addVendor' && (
                    <AddEditVendorModal vendor={null} onClose={() => setModal(null)} onSave={(v) => { updateState('vendors', [...vendors, {...v, id:`v-${Date.now()}`}]); setModal(null); }} />
                )}
                {modal === 'addPurchase' && (
                    <AddPurchaseModal vendors={vendors} onClose={() => setModal(null)} onSave={(p) => { updateState('purchases', [...purchases, {...p, id:`pur-${Date.now()}`}]); setModal(null); }} />
                )}
                {modal === 'addStaff' && (
                    <AddEditStaffModal staffMember={null} onClose={() => setModal(null)} onSave={(s) => { updateState('staff', [...staff, {...s, id:`staff-${Date.now()}`, status:'Active'}]); setModal(null); }} />
                )}
                {modal === 'addDiscount' && (
                    <AddEditDiscountModal products={products} discount={null} onClose={() => { setModal(null); setDiscountToEdit(null); }} onSave={(d) => { updateState('discounts', [...discounts, {...d, id:`disc-${Date.now()}`}]); setModal(null); }} />
                )}
                {modal === 'addContact' && (
                    <AddContactModal onClose={() => setModal(null)} onSave={(data) => {
                        const { type, ...rest } = data;
                        const key = type === 'Customer' ? 'customers' : type === 'Creditor' ? 'creditors' : 'vendors';
                        const idPrefix = type === 'Customer' ? 'c-' : type === 'Creditor' ? 'cr-' : 'v-';
                        const newItem = { ...rest, id: `${idPrefix}${Date.now()}`, creditDisabled: type === 'Creditor' ? false : undefined };
                        updateState(key, [...(appData[key] as any), newItem]);
                        setModal(null);
                    }} />
                )}
                {renderView()}
            </main>
        </div>
    );
};

export default DesktopLayout;