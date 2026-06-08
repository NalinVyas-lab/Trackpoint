import { useState } from 'react';
import { useParams } from 'react-router';
import { Download, Send, FileText, CheckCircle, Mail, AlertCircle, Calendar } from 'lucide-react';
import { useTC } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';

interface InvoiceItem { id: string; category: string; description: string; quantity: string; unitPrice: string; amount: string; }
interface Document { id: string; name: string; category: string; size: string; pages: number; }

const invoiceItems: InvoiceItem[] = [
  { id: '1', category: 'Shipment Services', description: 'Secure transport - London to New York', quantity: '1', unitPrice: '$125,000.00', amount: '$125,000.00' },
  { id: '2', category: 'Shipment Services', description: 'Precious metals handling fee', quantity: '125.5 kg', unitPrice: '$450.00/kg', amount: '$56,475.00' },
  { id: '3', category: 'Shipment Services', description: 'Secure vault storage (72 hours)', quantity: '3 days', unitPrice: '$1,200.00/day', amount: '$3,600.00' },
  { id: '4', category: 'Insurance', description: 'Premium cargo insurance (999.9 fine gold)', quantity: '$2,450,000', unitPrice: '0.85%', amount: '$20,825.00' },
  { id: '5', category: 'Customs & Duties', description: 'Import duties and taxes', quantity: '1', unitPrice: '$18,450.00', amount: '$18,450.00' },
  { id: '6', category: 'Customs & Duties', description: 'Customs brokerage and processing', quantity: '1', unitPrice: '$1,200.00', amount: '$1,200.00' },
  { id: '7', category: 'Authorization', description: 'Export authorization certification (UK)', quantity: '1', unitPrice: '$2,500.00', amount: '$2,500.00' },
  { id: '8', category: 'Authorization', description: 'Import authorization certification (USA)', quantity: '1', unitPrice: '$2,800.00', amount: '$2,800.00' },
  { id: '9', category: 'Third-Party Carriers', description: 'Lufthansa Cargo LH8234 (Secure hold)', quantity: '1', unitPrice: '$8,500.00', amount: '$8,500.00' },
  { id: '10', category: 'Security', description: 'Armed security escort and monitoring', quantity: '1', unitPrice: '$4,800.00', amount: '$4,800.00' },
  { id: '11', category: 'Documentation', description: 'Chain of custody and compliance documentation', quantity: '1', unitPrice: '$1,500.00', amount: '$1,500.00' },
];

const documents: Document[] = [
  { id: '1', name: 'Master Invoice - MLCA-2026-001847', category: 'Invoice', size: '2.1 MB', pages: 4 },
  { id: '2', name: 'Commercial Invoice - CI-2026-001847', category: 'Invoice', size: '1.8 MB', pages: 3 },
  { id: '3', name: 'Customs Declaration & Duty Receipt', category: 'Customs', size: '2.4 MB', pages: 6 },
  { id: '4', name: 'UK Export Authorization Certificate', category: 'Authorization', size: '1.5 MB', pages: 2 },
  { id: '5', name: 'US Import Authorization Certificate', category: 'Authorization', size: '1.6 MB', pages: 2 },
  { id: '6', name: 'Insurance Certificate & Policy', category: 'Insurance', size: '2.2 MB', pages: 5 },
  { id: '7', name: 'Bill of Lading - Lufthansa LH8234', category: 'Carrier', size: '1.3 MB', pages: 2 },
  { id: '8', name: 'Chain of Custody Documentation', category: 'Security', size: '3.8 MB', pages: 12 },
  { id: '9', name: 'Security Seal Verification Reports', category: 'Security', size: '2.9 MB', pages: 8 },
  { id: '10', name: 'Vault Storage Receipts', category: 'Logistics', size: '1.1 MB', pages: 2 },
];

export function InvoicePackage() {
  const { shipmentId } = useParams();
  const tc = useTC();
  const [recipientEmail, setRecipientEmail] = useState('finance@tiffany.com');
  const [showSuccess, setShowSuccess] = useState(false);

  const lastSentDate = '2026-06-05';
  const lastSentTime = '14:32';
  const dueDate = '2026-06-18';
  const daysSinceLastSent = Math.floor((new Date().getTime() - new Date(lastSentDate).getTime()) / (1000 * 60 * 60 * 24));

  const subtotal = invoiceItems.reduce((sum, item) => sum + parseFloat(item.amount.replace(/[$,]/g, '')), 0);
  const categoryTotals = invoiceItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount.replace(/[$,]/g, ''));
    return acc;
  }, {} as Record<string, number>);

  const handleSend = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className={`min-h-screen ${tc.pageBg} ${tc.text}`}>
      <NavBar />

      {/* Page header */}
      <div className={`${tc.headerBg} border-b px-4 md:px-8 py-4`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-1">Consolidated Invoice Package</h1>
            <div className={`flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs md:text-sm ${tc.subtext}`}>
              <span>Tracking: <code className="text-[#BAAB48]">MLCA-2026-001847</code></span>
              <span className="hidden md:inline">·</span>
              <span>Client: Tiffany & Co.</span>
              <span className="hidden md:inline">·</span>
              <span>Due: June 18, 2026</span>
            </div>
          </div>
          <div>
            <div className={`text-xs ${tc.subtext}`}>Total Payable</div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: '#BAAB48' }}>
              ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: invoice details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Category breakdown */}
            <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-5`}>
              <h2 style={{ fontSize: '15px', fontWeight: 600 }} className="mb-4">Cost Breakdown by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(categoryTotals).map(([cat, total]) => (
                  <div key={cat} className={`${tc.innerBg} border ${tc.border} rounded-lg p-3`}>
                    <div className={`text-xs ${tc.subtext} mb-1`}>{cat}</div>
                    <div className="text-sm" style={{ fontWeight: 600, color: '#BAAB48' }}>
                      ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Line items */}
            <div className={`${tc.cardBg} border ${tc.border} rounded-lg overflow-hidden`}>
              <div className={`p-4 md:p-5 border-b ${tc.border}`}>
                <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Invoice Line Items</h2>
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${tc.border} ${tc.tableHeaderBg}`}>
                      {['Category', 'Description', 'Quantity', 'Unit Price', 'Amount'].map((h, i) => (
                        <th key={h} className={`px-5 py-3.5 text-xs ${tc.subtext} ${i >= 2 ? 'text-right' : 'text-left'}`} style={{ fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map(item => (
                      <tr key={item.id} className={`border-b ${tc.border} ${tc.hoverBg} transition-colors`}>
                        <td className={`px-5 py-3.5 text-sm ${tc.subtext}`}>{item.category}</td>
                        <td className="px-5 py-3.5 text-sm">{item.description}</td>
                        <td className="px-5 py-3.5 text-right text-sm">{item.quantity}</td>
                        <td className="px-5 py-3.5 text-right text-sm">{item.unitPrice}</td>
                        <td className="px-5 py-3.5 text-right text-sm" style={{ fontWeight: 600 }}>{item.amount}</td>
                      </tr>
                    ))}
                    <tr className={tc.tableHeaderBg}>
                      <td colSpan={4} className="px-5 py-4 text-right text-sm" style={{ fontWeight: 600 }}>Subtotal:</td>
                      <td className="px-5 py-4 text-right" style={{ fontSize: '16px', fontWeight: 600, color: '#BAAB48' }}>
                        ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={`md:hidden divide-y ${tc.divider}`}>
                {invoiceItems.map(item => (
                  <div key={item.id} className="p-4">
                    <div className="text-xs text-[#BAAB48] mb-1.5">{item.category}</div>
                    <div className="text-sm mb-2.5" style={{ fontWeight: 500 }}>{item.description}</div>
                    <div className={`space-y-1 text-sm ${tc.subtext}`}>
                      <div className="flex justify-between"><span>Quantity:</span><span className={tc.text}>{item.quantity}</span></div>
                      <div className="flex justify-between"><span>Unit Price:</span><span className={tc.text}>{item.unitPrice}</span></div>
                      <div className={`flex justify-between pt-2 border-t ${tc.border}`}>
                        <span>Amount:</span><span style={{ fontWeight: 600, color: '#BAAB48' }}>{item.amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className={`p-4 ${tc.tableHeaderBg}`}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontWeight: 600 }}>Subtotal:</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#BAAB48' }}>
                      ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: actions + docs */}
          <div className="space-y-5">
            {/* Send panel */}
            <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-5`}>
              <h2 style={{ fontSize: '15px', fontWeight: 600 }} className="mb-4">Send to Client</h2>

              <div className={`${tc.innerBg} border ${tc.border} rounded-lg p-4 mb-4`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Mail className="w-3.5 h-3.5 text-[#BAAB48]" />
                      <span className={`text-xs ${tc.subtext}`}>Last Sent</span>
                    </div>
                    <div className="text-sm" style={{ fontWeight: 600 }}>{lastSentDate} at {lastSentTime}</div>
                    <div className={`text-xs ${tc.subtext} mt-0.5`}>
                      {daysSinceLastSent === 0 ? 'Today' : daysSinceLastSent === 1 ? 'Yesterday' : `${daysSinceLastSent} days ago`}
                    </div>
                  </div>
                  {daysSinceLastSent < 2 && (
                    <div className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 flex-shrink-0">Recently Sent</div>
                  )}
                </div>
                <div className={`pt-3 border-t ${tc.border}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#BAAB48]" />
                    <span className={`text-xs ${tc.subtext}`}>Payment Due Date</span>
                  </div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>{dueDate}</div>
                  <div className={`text-xs ${tc.subtext} mt-0.5`}>
                    {Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                  </div>
                </div>
              </div>

              {daysSinceLastSent < 2 && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-orange-400">This package was sent recently. Avoid duplicate communications.</div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className={`text-xs ${tc.subtext} mb-1.5 block`}>Recipient Email</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#BAAB48] focus:ring-1 focus:ring-[#BAAB48] ${tc.inputBg}`}
                  />
                </div>
                <button onClick={handleSend} className="w-full bg-[#BAAB48] hover:bg-[#a89940] text-[#1a1a1a] px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm" style={{ fontWeight: 600 }}>
                  <Send className="w-4 h-4" />
                  {daysSinceLastSent < 2 ? 'Resend Invoice Package' : 'Send Invoice Package'}
                </button>
                <button className={`w-full px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm ${tc.secondaryBtn}`}>
                  <Download className="w-4 h-4" />
                  Download PDF Package
                </button>
              </div>

              {showSuccess && (
                <div className="mt-4 bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div style={{ fontWeight: 600 }} className="text-green-400 mb-0.5">Package Sent</div>
                    <div className="text-sm text-green-400/80">Sent to {recipientEmail}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Document list */}
            <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-5`}>
              <h2 style={{ fontSize: '15px', fontWeight: 600 }} className="mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#BAAB48]" />
                Package Contents ({documents.length})
              </h2>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {documents.map(doc => (
                  <div key={doc.id} className={`${tc.innerBg} border ${tc.border} rounded-lg p-3 ${tc.hoverBg} transition-colors`}>
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-3.5 h-3.5 text-[#BAAB48] flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs mb-1 truncate" style={{ fontWeight: 500 }}>{doc.name}</div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-[#BAAB48]/20 text-[#BAAB48]">{doc.category}</span>
                          <span className={tc.subtext}>{doc.size} · {doc.pages}p</span>
                        </div>
                      </div>
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment terms */}
            <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-5`}>
              <h2 style={{ fontSize: '15px', fontWeight: 600 }} className="mb-3">Payment Terms</h2>
              <div className="space-y-2.5 text-sm">
                {[
                  ['Payment Due Date', 'June 18, 2026'],
                  ['Payment Terms', 'Net 14'],
                  ['Currency', 'USD'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className={tc.subtext}>{label}:</span>
                    <span style={{ fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
                <div className={`pt-3 border-t ${tc.border}`}>
                  <div className="bg-[#BAAB48]/10 border border-[#BAAB48]/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#BAAB48] flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-[#BAAB48]">Late payments subject to 1.5% monthly interest charge</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
