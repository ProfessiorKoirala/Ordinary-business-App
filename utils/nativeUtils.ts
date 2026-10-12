
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

/**
 * Triggers a light vibration for button clicks or small actions
 */
export const triggerHapticFeedback = async () => {
    if (Capacitor.isNativePlatform()) {
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
            console.warn('Haptics not available', e);
        }
    }
};

/**
 * Triggers a success vibration for scans or completed sales
 */
export const triggerSuccessFeedback = async () => {
    if (Capacitor.isNativePlatform()) {
        try {
            await Haptics.notification({ type: 'SUCCESS' as any });
        } catch (e) {
            console.warn('Haptics not available', e);
        }
    }
};

/**
 * Native sharing for receipts or reports
 */
export const shareData = async (title: string, text: string, url?: string) => {
    if (Capacitor.isNativePlatform()) {
        try {
            await Share.share({
                title,
                text,
                url,
                dialogTitle: 'Share Receipt',
            });
            return true;
        } catch (e) {
            console.error('Share failed', e);
            return false;
        }
    }
    return false; // Fallback to web behavior
};

/**
 * Check if running as a native app
 */
export const isNative = () => Capacitor.isNativePlatform();

/**
 * Starts a native barcode scan
 * Note: This requires the app to have camera permissions and the background to be transparent
 */
export const startNativeScan = async () => {
    if (isNative()) {
        try {
            const status = await BarcodeScanner.checkPermission({ force: true });
            if (status.granted) {
                // Hide the webview content to show the camera behind it
                await BarcodeScanner.hideBackground();
                document.body.classList.add('scanner-active');
                
                const result = await BarcodeScanner.startScan();
                
                // Show the webview content again
                await BarcodeScanner.showBackground();
                document.body.classList.remove('scanner-active');
                
                if (result.hasContent) {
                    return result.content;
                }
            }
        } catch (e) {
            console.error('Native scan failed', e);
            await BarcodeScanner.showBackground();
            document.body.classList.remove('scanner-active');
        }
    }
    return null;
};

export const stopNativeScan = async () => {
    if (isNative()) {
        await BarcodeScanner.showBackground();
        await BarcodeScanner.stopScan();
        document.body.classList.remove('scanner-active');
    }
};
