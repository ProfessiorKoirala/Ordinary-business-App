
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Product } from '../../types';
import CloseIcon from '../icons/CloseIcon';

import { triggerSuccessFeedback, isNative, startNativeScan, stopNativeScan } from '../../utils/nativeUtils';

interface OrderBarcodeScannerModalProps {
    products: Product[];
    onClose: () => void;
    onAddItem: (product: Product) => void;
}

const OrderBarcodeScannerModal: React.FC<OrderBarcodeScannerModalProps> = ({ products, onClose, onAddItem }) => {
    const [scannedCode, setScannedCode] = useState<string | null>(null);
    const [lastAdded, setLastAdded] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isNativeScanning, setIsNativeScanning] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const isProcessingRef = useRef(false);

    useEffect(() => {
        if (isNative()) {
            handleNativeScan();
            return () => {
                stopNativeScan();
            };
        }

        const scanner = new Html5QrcodeScanner(
            "order-reader",
            { 
                fps: 20, // Faster scanning
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
        while (true) {
            const code = await startNativeScan();
            if (code) {
                onScanSuccess(code);
                // Brief pause for continuous scanning
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                break; // User cancelled or error
            }
        }
        setIsNativeScanning(false);
    };

    function onScanSuccess(decodedText: string) {
        triggerSuccessFeedback();
        if (isProcessingRef.current) return;
        
        // Prevent double scans of the same item too quickly
        if (decodedText === lastAdded) {
            // Optional: could add a small timeout to allow rescanning same item
            // For now, let's just process it if it's been a second
        }

        isProcessingRef.current = true;
        const product = products.find(p => p.barcode === decodedText);
        
        if (product) {
            onAddItem(product);
            setSuccessMessage(`Added in basket`);
            setLastAdded(decodedText);
            setError(null);
            
            // Clear success message after 1.5s
            setTimeout(() => {
                setSuccessMessage(null);
                isProcessingRef.current = false;
            }, 1000);
        } else {
            setError(`Product with code ${decodedText} not found.`);
            // Pause briefly to let user see error
            if (scannerRef.current) {
                try {
                    scannerRef.current.pause(true);
                } catch (e) {
                    console.warn("Pause failed", e);
                }
            }
            setTimeout(() => {
                isProcessingRef.current = false;
            }, 2000);
        }
    }

    function onScanFailure(error: any) {
        // Silent failure for continuous scanning
    }

    const handleReset = () => {
        setScannedCode(null);
        setError(null);
        setSuccessMessage(null);
        isProcessingRef.current = false;
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
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-1">POS SCANNER</p>
                            <h2 className="text-2xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">Continuous Scan</h2>
                        </div>
                        <button onClick={onClose} className="p-3 bg-gray-100 dark:bg-gray-900 rounded-2xl text-gray-400 active:scale-90 transition-all">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 no-scrollbar relative">
                    {isNativeScanning && (
                        <div className="scanner-ui fixed inset-0 z-[10000] flex flex-col items-center justify-center p-8">
                            <div className="w-64 h-64 border-4 border-white/50 rounded-[48px] relative">
                                <div className="absolute inset-0 border-4 border-orange-500 rounded-[48px] animate-pulse"></div>
                            </div>
                            <p className="mt-8 text-white font-black uppercase tracking-[0.3em] text-center">Continuous POS Scanning Active</p>
                            <button 
                                onClick={() => {
                                    stopNativeScan();
                                    setIsNativeScanning(false);
                                }}
                                className="mt-12 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest"
                            >
                                Stop Scanning
                            </button>

                            {successMessage && (
                                <div className="mt-8 p-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest animate-bounce">
                                    {successMessage}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 relative aspect-square">
                        <div id="order-reader" className="w-full h-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <div className="w-64 h-64 border-2 border-orange-500 rounded-3xl"></div>
                        </div>

                        {/* Success Overlay */}
                        {successMessage && (
                            <div className="absolute inset-0 bg-green-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 text-center animate-fade-in z-10">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <p className="text-xl font-black uppercase tracking-widest italic">{successMessage}</p>
                                <p className="text-[10px] font-bold opacity-70 mt-2 uppercase tracking-[0.3em]">Ready for next item...</p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-[32px] border border-red-100 dark:border-red-900/30 text-center space-y-3 animate-fade-in">
                            <p className="text-[11px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">{error}</p>
                            <button 
                                onClick={handleReset} 
                                className="w-full py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
                            >
                                Resume Scanning
                            </button>
                        </div>
                    )}
                </div>

                <footer className="px-8 pb-12 pt-4 bg-white dark:bg-gray-950 border-t dark:border-gray-900 shrink-0">
                    <p className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.5em] text-center">
                        Scan item barcodes rapidly to build basket
                    </p>
                </footer>
            </div>
            <style>{`
                #order-reader__scan_region {
                    background: transparent !important;
                }
                #order-reader__dashboard_section_csr button {
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
                .dark #order-reader__dashboard_section_csr button {
                    background: #fff !important;
                    color: #000 !important;
                }
                #order-reader video {
                    border-radius: 32px !important;
                    object-fit: cover !important;
                }
            `}</style>
        </div>,
        document.body
    );
};

export default OrderBarcodeScannerModal;
