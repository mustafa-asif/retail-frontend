import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { InvoiceTemplate } from './InvoiceTemplate';

interface InvoicePreviewProps {
  data: {
    saleId: string | number;
    date: string;
    storeName: string;
    customerName: string;
    customerContact: string;
    items: Array<{
      name: string;
      qty: number;
      price: number;
      total: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
  };
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  // To avoid constant re-rendering of PDFViewer (which is heavy), we can potentially memoize
  return (
    <div className="w-full h-full min-h-[600px] rounded-xl overflow-hidden border border-slate-200">
      <PDFViewer width="100%" height="100%" className="border-none">
        <InvoiceTemplate {...data} />
      </PDFViewer>
    </div>
  );
}
