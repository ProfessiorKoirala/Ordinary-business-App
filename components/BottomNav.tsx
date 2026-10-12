
import React from 'react';
import { MainView } from '../types';
import HomeIcon from './icons/HomeIcon';
import SalesIcon from './icons/SalesIcon';
import ExpenseIcon from './icons/ExpenseIcon';
import BoxIcon from './icons/BoxIcon';
import { triggerHaptic, HapticPatterns } from '../utils/hapticUtils';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { view: MainView.DASHBOARD, label: "Home", Icon: HomeIcon },
  { view: MainView.SALES, label: "Sales", Icon: SalesIcon },
  { view: MainView.EXPENSES, label: "Expenses", Icon: ExpenseIcon },
  { view: MainView.INVENTORY, label: "Inventory", Icon: BoxIcon },
];

interface BottomNavProps {
    currentView: MainView;
    setCurrentView: (view: MainView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
    return (
        <div className="fixed bottom-6 left-0 right-0 px-8 z-50 flex justify-center pointer-events-none">
            <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 dark:border-gray-800 p-2 flex items-center gap-1 pointer-events-auto max-w-sm w-full transition-colors duration-500">
                {navItems.map((item) => {
                    const isActive = currentView === item.view;
                    
                    return (
                        <button
                            key={item.view}
                            onClick={() => {
                                triggerHaptic(HapticPatterns.LIGHT);
                                setCurrentView(item.view);
                            }}
                            className="relative flex-1 flex items-center justify-center h-12 outline-none group"
                        >
                            {/* Static Background Effect */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="absolute inset-0 rounded-[24px] bg-black dark:bg-white shadow-lg"
                                    />
                                )}
                            </AnimatePresence>

                            {/* Content */}
                            <div className="relative z-10 flex items-center justify-center w-full h-full px-3">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key="icon-or-active"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex items-center gap-2"
                                    >
                                        <item.Icon 
                                            className={`w-5 h-5 transition-colors duration-500 ${
                                                isActive 
                                                    ? 'text-white dark:text-black' 
                                                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                            }`} 
                                        />
                                        {isActive && (
                                            <motion.span
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: 'auto', opacity: 1 }}
                                                className="text-[11px] font-bold tracking-tight text-white dark:text-black whitespace-nowrap overflow-hidden"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNav;
