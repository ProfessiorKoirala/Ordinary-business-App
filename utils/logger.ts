export const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, data };
    console.log(`[OB-SYNC] ${timestamp}: ${message}`, data || '');
    
    // Store in window for console inspection
    (window as any).OB_PRO_LOGS = (window as any).OB_PRO_LOGS || [];
    (window as any).OB_PRO_LOGS.push(logEntry);
};
