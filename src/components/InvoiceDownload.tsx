import React, { useRef } from 'react';
import { Download, Printer, Check, Receipt, Tag, ShieldCheck, Mail } from 'lucide-react';
import { Invoice, Tenant } from '../types';

interface InvoiceDownloadProps {
  invoice: Invoice;
  tenant: Tenant | undefined;
  onClose: () => void;
}

export const InvoiceDownload: React.FC<InvoiceDownloadProps> = ({ invoice, tenant, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handlePrint = () => {
    const printContent = invoiceRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      // Simple preview window print fallback that styles well
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${invoice.id}</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                body { font-family: 'Inter', sans-serif; padding: 40px; }
              </style>
            </head>
            <body>
              <div>${printContent}</div>
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleDownloadTxt = () => {
    // Generates a formal receipt text format matching enterprise specifications
    const delimiter = '='.repeat(60);
    const content = `
${delimiter}
B2B SAAS BILLING PORTAL - STATEMENT RECEIPT
${delimiter}
INVOICE ID:      ${invoice.id}
BILLING CYCLE:   ${invoice.billingCycle}
ISSUE DATE:      ${invoice.issueDate}
DUE DATE:        ${invoice.dueDate}
STATUS:          ${invoice.status}
PAYMENT METHOD:  ${invoice.paymentMethod}
BILLING REASON:  ${invoice.billingReason}

CLIENT INFORMATION:
ORGANIZATION:    ${tenant?.name || 'N/A'}
INDUSTRY:        ${tenant?.industry || 'N/A'}
ORGANIZATION ID: ${tenant?.id || 'N/A'}

TAX ID / REG:    TR-Enterprise-${tenant?.id?.slice(-4).toUpperCase()}

LINE ITEMS:
${invoice.lineItems.map((item, idx) => `${idx + 1}. ${item.desc} (Qty: ${item.qty}) | Unit: ${formatCurrency(item.unitPrice)} | Total: ${formatCurrency(item.total)}`).join('\n')}

${delimiter}
SUBTOTAL:        ${formatCurrency(invoice.subtotal)}
TAX (${invoice.taxRate * 100}% VAT/GST): ${formatCurrency(invoice.tax)}
GRAND TOTAL:     ${formatCurrency(invoice.amount)}
${invoice.refundAmount ? `REFUNDED AMOUNT:  ${formatCurrency(invoice.refundAmount)}` : ''}
${delimiter}
This document serves as proof of payment of the noted transaction.
Thank you for your business.
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${invoice.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Modal Header Actions */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Receipt className="text-indigo-400" size={18} />
            <span className="font-bold text-white text-sm">Corporate Invoice Explorer</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-750 rounded-lg hover:border-slate-700 hover:bg-slate-700/80 transition text-xs font-semibold text-slate-200 cursor-pointer"
            >
              <Download size={14} />
              <span>TXT Statement</span>
            </button>
            <button 
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition text-xs font-semibold cursor-pointer"
            >
              <Printer size={14} />
              <span>Print View</span>
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white ml-2 text-sm font-bold p-1 rounded hover:bg-slate-805"
            >
              Close
            </button>
          </div>
        </div>

        {/* Invoice Statement Canvas */}
        <div className="overflow-y-auto p-8" ref={invoiceRef}>
          <div className="space-y-6 text-slate-300 text-sm">
            
            {/* Upper Section */}
            <div className="flex justify-between items-start pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm tracking-wider">
                    L
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white">SaaSify Billing Engine</span>
                </div>
                <p className="text-xs text-slate-450 mt-2 max-w-xs leading-relaxed">
                  Global Financial Processing, Inc.<br />
                  100 Pine Street, suite 1420<br />
                  San Francisco, CA 94111, USA<br />
                  <span className="font-mono text-[10px] text-slate-500">FIN-REG ID: SF-99238-C</span>
                </p>
              </div>

              <div className="text-right">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                  invoice.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  invoice.status === 'OUTSTANDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  invoice.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  'bg-indigo-505/10 text-indigo-400 border-indigo-500/20'
                }`}>
                  {invoice.status}
                </span>
                <h2 className="text-2xl font-mono tracking-tight font-extrabold text-white mt-2">
                  {invoice.id}
                </h2>
                <p className="text-xs text-slate-450 mt-1">
                  Issue Date: <span className="font-medium text-slate-300">{invoice.issueDate}</span><br />
                  Due Date: <span className="font-medium text-slate-300">{invoice.dueDate}</span>
                </p>
              </div>
            </div>

            {/* Billing Target Addresses */}
            <div className="grid grid-cols-2 gap-8 py-2">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Invoiced To</p>
                <div className="mt-2 space-y-1">
                  <p className="font-bold text-white">{tenant?.name || 'External Subscription'}</p>
                  <p className="text-xs text-slate-400">
                    Segment: {tenant?.industry || 'B2B Client'}<br />
                    Tenant Token: <span className="font-mono text-slate-500">{tenant?.id || 'N/A'}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    TIN: REG-GST-US-{tenant?.id?.slice(-4).toUpperCase() || '7729'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Method & Context</p>
                <div className="mt-2 space-y-1 text-slate-350 text-xs">
                  <p>Payment Mode: <span className="font-semibold text-white">{invoice.paymentMethod}</span></p>
                  <p>Reason: <span className="font-semibold text-white">{invoice.billingReason}</span></p>
                  <p>Billing Tier Cycle: <span className="font-semibold text-white uppercase">{invoice.billingCycle}</span></p>
                </div>
              </div>
            </div>

            {/* List Table Items */}
            <div className="border border-slate-800 rounded-xl overflow-hidden mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-805 text-slate-400 text-xs uppercase font-extrabold">
                    <th className="py-2.5 px-4 font-semibold">Line Item / Product Definition</th>
                    <th className="py-2.5 px-4 text-center font-semibold">Qty</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Unit Price</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 font-medium text-slate-200">{item.desc}</td>
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">{item.qty}</td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 px-4 text-right font-semibold font-mono text-white">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations summaries */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2 text-xs font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-200">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({invoice.taxRate * 100}% VAT/GST):</span>
                  <span className="font-bold text-slate-200">{formatCurrency(invoice.tax)}</span>
                </div>
                {invoice.refundAmount && (
                  <div className="flex justify-between text-rose-450 font-semibold bg-rose-950/30 border border-rose-900/30 p-1.5 rounded">
                    <span>Refunded Value:</span>
                    <span>-{formatCurrency(invoice.refundAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-800 pt-2 text-sm text-white font-bold">
                  <span>Grand Total (USD):</span>
                  <span className="text-indigo-400 font-sans">{formatCurrency(invoice.amount)}</span>
                </div>
              </div>
            </div>

            {/* Guarantee footer note */}
            <div className="bg-slate-950 rounded-xl p-4.5 border border-slate-800 text-[11px] text-slate-450 flex items-start gap-3 mt-6">
              <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <p className="leading-relaxed">
                This invoice has been securely signed and sealed by the B2B multi-tenant clearing agency. All funds received via Stripe or Razorpay credit channels are bound by organization-level proration agreements. For refund disputes, contact your dedicated account executive.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
