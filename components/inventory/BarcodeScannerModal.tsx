
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Product } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import { triggerSuccessFeedback, isNative, startNativeScan, stopNativeScan } from '../../utils/nativeUtils';

interface BarcodeScannerModalProps {
    products: Product[];
    onClose: () => void;
    onAddProduct: (product: Product) => void;
}

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ products, onClose, onAddProduct }) => {
    const [scannedCode, setScannedCode] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [category, setCategory] = useState('General');
    const [error, setError] = useState<string | null>(null);
    const [isNativeScanning, setIsNativeScanning] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (isNative()) {
            handleNativeScan();
            return () => {
                stopNativeScan();
            };
        }

        const scanner = new Html5QrcodeScanner(
            "reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true,
            },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear scanner", error);
                });
            }
        };
    }, []);

    const handleNativeScan = async () => {
        setIsNativeScanning(true);
        const code = await startNativeScan();
        if (code) {
            onScanSuccess(code);
        }
        setIsNativeScanning(false);
    };

    function onScanSuccess(decodedText: string) {
        triggerSuccessFeedback();
        const existingProduct = products.find(p => p.barcode === decodedText);
        if (existingProduct) {
            setError(`Product with code ${decodedText} already exists: ${existingProduct.name}`);
            if (scannerRef.current) {
                try {
                    scannerRef.current.pause(true);
                } catch (e) {
                    console.warn("Pause failed", e);
                }
            }
        } else {
            setScannedCode(decodedText);
            setError(null);
            if (scannerRef.current) {
                try {
                    scannerRef.current.pause(true);
                } catch (e) {
                    console.warn("Pause failed", e);
                }
            }
        }
    }

    function onScanFailure(error: any) {
        // Silent failure for continuous scanning
    }

    const handleAdd = () => {
        if (scannedCode && name && price !== '' && price >= 0) {
            const newProduct: Product = {
                id: Date.now().toString(),
                name: name.trim(),
                barcode: scannedCode,
                price: Number(price),
                stock: quantity === '' ? 0 : Number(quantity),
                trackStock: true,
                category: category || 'General',
                isQuickAdd: false
            };
            onAddProduct(newProduct);
            handleReset();
        }
    };

    const handleReset = () => {
        setScannedCode(null);
        setName('');
        setPrice('');
        setQuantity('');
        setCategory('General');
        setError(null);
        if (scannerRef.current) {
            try {
                scannerRef.current.resume();
            } catch (e) {
                console.warn("Resume failed", e);
            }
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-950 rounded-t-[48px] sm:rounded-[48px] w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden shadow-2xl animate-slide-up transition-colors" 
                onClick={e => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-4 mb-2 shrink-0 sm:hidden"></div>
                
                <header className="px-8 pt-6 pb-4 border-b dark:border-gray-900 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">REGISTRY COMMAND</p>
                            <h2 className="text-2xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">Add via Scan</h2>
                        </div>
                        <button onClick={onClose} className="p-3 bg-gray-100 dark:bg-gray-900 rounded-2xl text-gray-400 active:scale-90 transition-all">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 no-scrollbar">
                    {isNativeScanning && (
                        <div className="scanner-ui fixed inset-0 z-[10000] flex flex-col items-center justify-center p-8">
                            <div className="w-64 h-64 border-4 border-white/50 rounded-[48px] relative">
                                <div className="absolute inset-0 border-4 border-blue-500 rounded-[48px] animate-pulse"></div>
                            </div>
                            <p className="mt-8 text-white font-black uppercase tracking-[0.3em] text-center">Align barcode within frame</p>
                            <button 
                                onClick={() => {
                                    stopNativeScan();
                                    setIsNativeScanning(false);
                                }}
                                className="mt-12 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest"
                            >
                                Cancel Scan
                            </button>
                        </div>
                    )}

                    {!scannedCode || error ? (
                        <div className="space-y-6">
                            <div className="overflow-hidden rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 relative aspect-square">
                                <div id="reader" className="w-full h-full"></div>
                                {!error && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                        <div className="w-64 h-64 border-2 border-blue-500 rounded-3xl"></div>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-[32px] border border-red-100 dark:border-red-900/30 text-center space-y-3">
                                    <p className="text-[11px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">{error}</p>
                                    <button 
                                        onClick={handleReset} 
                                        className="w-full py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
                                    >
                                        Try Another Code
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-6 pb-8">
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-900/20 text-center">
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">NEW BARCODE DETECTED</p>
                                <h3 className="text-2xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">{scannedCode}</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)}
                                        placeholder="ENTER NAME"
                                        className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                                        <input 
                                            type="number" 
                                            value={price} 
                                            onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                            placeholder="0.00"
                                            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Qty</label>
                                        <input 
                                            type="number" 
                                            value={quantity} 
                                            onChange={e => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                            placeholder="0"
                                            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                    <input 
                                        type="text" 
                                        value={category} 
                                        onChange={e => setCategory(e.target.value)}
                                        placeholder="GENERAL"
                                        className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={handleReset}
                                    className="flex-1 py-5 bg-gray-100 dark:bg-gray-900 text-gray-500 font-black rounded-2xl text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all"
                                >
                                    Rescan
                                </button>
                                <button 
                                    onClick={handleAdd}
                                    disabled={!name || price === ''}
                                    className="flex-[2] py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all disabled:opacity-50"
                                >
                                    Add Product
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="px-8 pb-12 pt-4 bg-white dark:bg-gray-950 border-t dark:border-gray-900 shrink-0">
                    <p className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.5em] text-center">
                        Scan a new barcode to register item
                    </p>
                </footer>
            </div>
            <style>{`
                #reader__scan_region {
                    background: transparent !important;
                }
                #reader__dashboard_section_csr button {
                    background: #000 !important;
                    color: #fff !important;
                    border: none !important;
                    padding: 10px 20px !important;
                    border-radius: 12px !important;
                    font-weight: 900 !important;
                    text-transform: uppercase !important;
                    font-size: 10px !important;
                    letter-spacing: 2px !important;
                    cursor: pointer !important;
                    margin: 10px !important;
                }
                .dark #reader__dashboard_section_csr button {
                    background: #fff !important;
                    color: #000 !important;
                }
                #reader video {
                    border-radius: 32px !important;
                    object-fit: cover !important;
                }
            `}</style>
        </div>,
        document.body
    );
};

export default BarcodeScannerModal;
