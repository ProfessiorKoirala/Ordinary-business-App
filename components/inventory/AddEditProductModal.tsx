
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import { RefreshCw, Printer, Barcode as BarcodeIcon, Eye, EyeOff } from 'lucide-react';
import { printProductLabel } from '../../utils/printUtils';
import PrintableProductLabel from './PrintableProductLabel';

interface AddEditProductModalProps {
    product: Product | null;
    businessName: string;
    onClose: () => void;
    onSave: (data: Product) => void;
}

const Toggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string }> = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
        <label htmlFor="stock-toggle" className="text-[11px] font-black uppercase tracking-widest text-gray-500">{label}</label>
        <button
            type="button"
            id="stock-toggle"
            className={`${
                enabled ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
            } relative inline-flex items-center h-7 rounded-full w-12 transition-all active:scale-90`}
            onClick={() => onChange(!enabled)}
        >
            <span
                className={`${
                    enabled ? 'translate-x-6 bg-white dark:bg-black' : 'translate-x-1 bg-white'
                } inline-block w-5 h-5 transform rounded-full transition-transform shadow-sm`}
            />
        </button>
    </div>
);

const AddEditProductModal: React.FC<AddEditProductModalProps> = ({ product, businessName, onClose, onSave }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        name: '',
        category: '',
        price: 0,
        stock: 0,
        trackStock: true,
        barcode: '',
        productNumber: '',
        printDates: true,
        bestBefore: '12 Months',
    });

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                productNumber: product.productNumber || '',
            });
        } else {
            // Auto-generate for new products
            generateRandomCodes();
        }
    }, [product]);

    const generateRandomCodes = () => {
        const randomNum = Math.floor(100000 + Math.random() * 900000).toString();
        const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        setFormData(prev => ({
            ...prev,
            productNumber: `PRD-${randomNum}`,
            barcode: randomBarcode
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleToggleStock = (enabled: boolean) => {
        setFormData(prev => ({
            ...prev,
            trackStock: enabled,
            stock: enabled ? prev.stock : 0
        }));
    };

    const handlePrintLabel = () => {
        if (!formData.name || !formData.price) {
            alert("Please enter product name and price first.");
            return;
        }
        printProductLabel(formData, businessName);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || formData.price <= 0) {
            alert("Please provide a valid name and price.");
            return;
        }
        onSave({ ...formData, id: product?.id || '' });
    };

    const isEditMode = !!product;

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-900 rounded-t-[40px] sm:rounded-[48px] w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up" 
                onClick={e => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-4 shrink-0 sm:hidden"></div>

                <header className="px-8 pt-6 pb-2 flex justify-between items-start shrink-0">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1">INVENTORY EDITOR</p>
                        <h2 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">
                            {isEditMode ? 'Update' : 'Register'} Item
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowPreview(!showPreview)} 
                            className={`p-3 rounded-2xl transition-all active:scale-90 ${showPreview ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
                            title="Toggle Print Preview"
                        >
                            {showPreview ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                        </button>
                        <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 active:scale-90 transition-all">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                    {showPreview ? (
                        <div className="px-8 py-10 flex flex-col items-center animate-fade-in">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Label Preview (60mm x 40mm)</p>
                            <div className="shadow-2xl rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                                <PrintableProductLabel product={formData} businessName={businessName} />
                            </div>
                            <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20 max-w-xs text-center">
                                <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] leading-relaxed">
                                    This is exactly how your label will appear when printed. Ensure the name and price are correct.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ITEM NAME</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        placeholder="E.G. CLASSIC LATTE"
                                        required 
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CATEGORY</label>
                                    <input 
                                        type="text" 
                                        name="category" 
                                        value={formData.category} 
                                        onChange={handleChange} 
                                        placeholder="E.G. BEVERAGES"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PRODUCT #</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                name="productNumber" 
                                                value={formData.productNumber || ''} 
                                                onChange={handleChange} 
                                                placeholder="PRD-000000"
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none pr-12"
                                            />
                                            <button 
                                                type="button"
                                                onClick={generateRandomCodes}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">BARCODE / SKU</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                name="barcode" 
                                                value={formData.barcode || ''} 
                                                onChange={handleChange} 
                                                placeholder="CODE"
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none pr-12"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                                                <BarcodeIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PRICE (₹)</label>
                                        <input 
                                            type="number" 
                                            name="price" 
                                            value={formData.price || ''} 
                                            onChange={handleChange} 
                                            placeholder="0"
                                            required 
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-black text-lg focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                                        />
                                    </div>
                                    {formData.trackStock && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">INITIAL STOCK</label>
                                            <input 
                                                type="number" 
                                                name="stock" 
                                                value={formData.stock || ''} 
                                                onChange={handleChange} 
                                                placeholder="0"
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-black text-lg focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-3xl space-y-1">
                                    <Toggle enabled={formData.trackStock} onChange={handleToggleStock} label="Auto-Track Quantity" />
                                    <Toggle enabled={formData.printDates || false} onChange={(val) => setFormData(prev => ({ ...prev, printDates: val }))} label="Print Dates on Label" />
                                </div>

                                {formData.printDates && (
                                    <div className="animate-fade-in space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">BEST BEFORE / EXPIRY</label>
                                        <input 
                                            type="text" 
                                            name="bestBefore" 
                                            value={formData.bestBefore || ''} 
                                            onChange={handleChange} 
                                            placeholder="E.G. 12 MONTHS"
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                <div className="px-8 pb-10 pt-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800 shrink-0">
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            type="button" 
                            onClick={handlePrintLabel}
                            className="py-5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-black rounded-[28px] text-xs uppercase tracking-[0.3em] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Print Label
                        </button>
                        <button 
                            type="button"
                            onClick={handleSubmit}
                            className="py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[28px] text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all"
                        >
                            Save Item
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AddEditProductModal;
