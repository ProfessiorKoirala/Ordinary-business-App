
import React from 'react';
import { Product } from '../../types';

interface PrintableProductLabelProps {
    product: Partial<Product>;
    businessName: string;
}

const PrintableProductLabel: React.FC<PrintableProductLabelProps> = ({ product, businessName }) => {
    return (
        <div className="print-label-container" style={{
            width: '60mm',
            height: '40mm',
            padding: '10px',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            fontFamily: "'Inter', sans-serif",
            border: '1px solid #eee'
        }}>
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+128&family=Inter:wght@400;700;900&display=swap');
                
                @media print {
                    @page {
                        size: 60mm 40mm;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                    }
                    .print-label-container {
                        border: none !important;
                    }
                }
                `}
            </style>
            
            <div style={{ borderBottom: '2px solid black', paddingBottom: '4px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {businessName}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', margin: '2px 0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {product.name}
                    </div>
                    <div style={{ fontSize: '8px', color: '#666' }}>
                        #{product.productNumber}
                    </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '8px', backgroundColor: '#000', color: '#fff', padding: '2px 4px', borderRadius: '2px' }}>
                    <div style={{ fontSize: '6px', fontWeight: 700, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>MRP (Incl. Taxes)</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, lineHeight: 1.1 }}>₹{product.price?.toLocaleString() || '0'}</div>
                </div>
            </div>

            <div style={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: "'Libre Barcode 128', cursive", fontSize: '40px', margin: '0', lineHeight: '1' }}>
                    {product.barcode}
                </div>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px' }}>
                    {product.barcode}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', borderTop: '1px dashed #ccc', paddingTop: '4px' }}>
                {product.printDates !== false && (
                    <div style={{ fontSize: '6px', textAlign: 'right' }}>
                        Packed on: {new Date().toLocaleDateString()}<br />
                        Best Before: {product.bestBefore || '12 Months'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrintableProductLabel;
