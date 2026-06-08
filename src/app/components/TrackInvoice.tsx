import { useState, useMemo } from 'react';
import { Search, Eye, Download, Send, CheckCircle, FileText, X } from 'lucide-react';
import { useTC } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';

type InvoiceStatus = 'Draft' | 'Approved' | 'Processed' | 'Reminded' | 'Refused' | 'Paid' | 'Partially Paid' | 'Overdue';

interface Invoice {
  id: string;
  invoiceNo: string;
  client: string;
  shipmentId: string;
  amount: string;
  dueDate: string;
  status: InvoiceStatus;
}

const mockInvoices: Invoice[] = [
  { id: '1', invoiceNo: 'INV-2026-0847', client: 'Tiffany & Co.', shipmentId: 'MLCA-2026-001847', amount: '$245,650.00', dueDate: '2026-06-18', status: 'Processed' },
  { id: '2', invoiceNo: 'INV-2026-0846', client: 'Cartier International', shipmentId: 'MLCA-2026-001846', amount: '$187,200.00', dueDate: '2026-06-20', status: 'Approved' },
  { id: '3', invoiceNo: 'INV-2026-0845', client: 'UBS AG', shipmentId: 'MLCA-2026-001845', amount: '$312,800.00', dueDate: '2026-06-06', status: 'Overdue' },
  { id: '4', invoiceNo: 'INV-2026-0844', client: 'Van Cleef & Arpels', shipmentId: 'MLCA-2026-001844', amount: '$98,400.00', dueDate: '2026-06-03', status: 'Paid' },
  { id: '5', invoiceNo: 'INV-2026-0843', client: 'Royal Bank of Canada', shipmentId: 'MLCA-2026-001843', amount: '$145,500.00', dueDate: '2026-06-09', status: 'Reminded' },
  { id: '6', invoiceNo: 'INV-2026-0842', client: 'Bulgari', shipmentId: 'MLCA-2026-001842', amount: '$168,050.00', dueDate: '2026-06-22', status: 'Draft' },
  { id: '7', invoiceNo: 'INV-2026-0841', client: 'Sotheby\'s', shipmentId: 'MLCA-2026-001841', amount: '$92,300.00', dueDate: '2026-06-15', status: 'Partially Paid' },
  { id: '8', invoiceNo: 'INV-2026-0840', client: 'Christie\'s', shipmentId: 'MLCA-2026-001840', amount: '$410,000.00', dueDate: '2026-05-28', status: 'Refused' },
  { id: '9', invoiceNo: 'INV-2026-0839', client: 'Piaget SA', shipmentId: 'MLCA-2026-001839', amount: '$78,650.00', dueDate: '2026-06-25', status: 'Approved' },
  { id: '10', invoiceNo: 'INV-2026-0838', client: 'De Beers Group', shipmentId: 'MLCA-2026-001838', amount: '$526,000.00', dueDate: '2026-06-30', status: 'Draft' },
  { id: '11', invoiceNo: 'INV-2026-0837', client: 'Graff Diamonds', shipmentId: 'MLCA-2026-001837', amount: '$887,500.00', dueDate: '2026-05-15', status: 'Overdue' },
  { id: '12', invoiceNo: 'INV-2026-0836', client: 'Harry Winston', shipmentId: 'MLCA-2026-001836', amount: '$234,100.00', dueDate: '2026-06-10', status: 'Paid' },
];

const statusConfig: Record<InvoiceStatus, { color: string; bg: string; border: string }> = {
  'Draft':         { color: 'text-gray-400',   bg: 'bg-gray-500/15',   border: 'border-gray-500/30' },
  'Approved':      { color: 'text-blue-400',    bg: 'bg-blue-500/15',   border: 'border-blue-500/30' },
  'Processed':     { color: 'text-[#BAAB48]',   bg: 'bg-[#BAAB48]/15',  border: 'border-[#BAAB48]/30' },
  'Reminded':      { color: 'text-purple-400',  bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  'Refused':       { color: 'text-red-400',     bg: 'bg-red-500/15',    border: 'border-red-500/30' },
  'Paid':          { color: 'text-green-400',   bg: 'bg-green-500/15',  border: 'border-green-500/30' },
  'Partially Paid':{ color: 'text-teal-400',    bg: 'bg-teal-500/15',   border: 'border-teal-500/30' },
  'Overdue':       { color: 'text-orange-400',  bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
};

const allStatuses: InvoiceStatus[] = ['Draft', 'Approved', 'Processed', 'Reminded', 'Refused', 'Paid', 'Partially Paid', 'Overdue'];

export function TrackInvoice() {
  const tc = useTC();
  const [activeStatus, setActiveStatus] = useState<InvoiceStatus | null>(null);
  const [search, setSearch] = useState('');
  const [markedPaid, setMarkedPaid] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return mockInvoices.filter(inv => {
      const matchStatus = !activeStatus || inv.status === activeStatus;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        inv.invoiceNo.toLowerCase().includes(q) ||
        inv.client.toLowerCase().includes(q) ||
        inv.shipmentId.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [activeStatus, search]);

  const countByStatus = (s: InvoiceStatus) => mockInvoices.filter(i => i.status === s).length;

  const handleMarkPaid = (id: string) => {
    setMarkedPaid(prev => { const n = new Set(prev); n.add(id); return n; });
  };

  const totalFiltered = filtered.reduce((s, i) => {
    return s + parseFloat(i.amount.replace(/[$,]/g, ''));
  }, 0);

  return (
    <div className={`min-h-screen ${tc.pageBg} ${tc.text}`}>
      <NavBar />
      {/* MARKER-MAKE-KIT-INVOKED */}
      <div className="p-4 md:p-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="mb-1" style={{ fontSize: '22px', fontWeight: 600 }}>Track Invoice</h1>
          <p className={tc.subtext + ' text-sm'}>Manage and monitor invoice status across all shipments</p>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {allStatuses.map(status => {
            const cfg = statusConfig[status];
            const count = countByStatus(status);
            const isActive = activeStatus === status;
            return (
              <button
                key={status}
                onClick={() => setActiveStatus(isActive ? null : status)}
                className={`rounded-lg p-3 border text-left transition-all ${
                  isActive
                    ? `${cfg.bg} ${cfg.border} ring-2 ring-offset-1 ${tc.isDark ? 'ring-offset-[#1a1a1a]' : 'ring-offset-[#f5f5f5]'}`
                    : `${tc.cardBg} ${tc.border} ${tc.hoverBg}`
                }`}
                style={{ ringColor: 'transparent' }}
              >
                <div className={`text-xl mb-1 ${cfg.color}`} style={{ fontWeight: 700 }}>{count}</div>
                <div className={`text-xs ${isActive ? cfg.color : tc.subtext}`}>{status}</div>
              </button>
            );
          })}
        </div>

        {/* Search + filter bar */}
        <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-4 mb-4`}>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tc.isDark ? 'text-[#666]' : 'text-[#aaa]'}`} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search invoice, client, shipment..."
                className={`w-full border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#BAAB48] focus:ring-1 focus:ring-[#BAAB48] ${tc.inputBg}`}
              />
            </div>
            <div className="flex items-center gap-3">
              {activeStatus && (
                <button
                  onClick={() => setActiveStatus(null)}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border ${tc.border} ${tc.hoverBg} ${tc.subtext}`}
                >
                  <X className="w-3.5 h-3.5" />
                  Clear filter
                </button>
              )}
              <span className={tc.subtext + ' text-sm'}>
                {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
                {filtered.length > 0 && (
                  <span className="ml-2 text-[#BAAB48]" style={{ fontWeight: 600 }}>
                    ${(totalFiltered / 1000).toFixed(0)}K
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice table */}
        <div className={`${tc.cardBg} border ${tc.border} rounded-lg overflow-hidden`}>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${tc.border} ${tc.tableHeaderBg}`}>
                  {['Invoice No.', 'Client', 'Shipment ID', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`px-5 py-3.5 text-left text-xs ${tc.subtext}`} style={{ fontWeight: 500 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-5 py-12 text-center ${tc.subtext} text-sm`}>
                      No invoices match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map(inv => {
                    const cfg = statusConfig[inv.status];
                    const isPaid = markedPaid.has(inv.id);
                    return (
                      <tr key={inv.id} className={`border-b ${tc.border} ${tc.hoverBg} transition-colors`}>
                        <td className="px-5 py-4">
                          <code className="text-[#BAAB48] text-sm">{inv.invoiceNo}</code>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ fontWeight: 500 }}>{inv.client}</td>
                        <td className="px-5 py-4">
                          <code className={`text-xs ${tc.subtext}`}>{inv.shipmentId}</code>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ fontWeight: 600 }}>{inv.amount}</td>
                        <td className={`px-5 py-4 text-sm ${tc.subtext}`}>{inv.dueDate}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                            {isPaid ? 'Paid' : inv.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button title="View Invoice" className={`p-1.5 rounded ${tc.hoverBg} ${tc.subtext} transition-colors`}>
                              <Eye className="w-4 h-4" />
                            </button>
                            <button title="Download Invoice" className={`p-1.5 rounded ${tc.hoverBg} ${tc.subtext} transition-colors`}>
                              <Download className="w-4 h-4" />
                            </button>
                            <button title="Send Reminder" className={`p-1.5 rounded ${tc.hoverBg} text-[#BAAB48] transition-colors`}>
                              <Send className="w-4 h-4" />
                            </button>
                            {!isPaid && inv.status !== 'Paid' && (
                              <button
                                title="Mark as Paid"
                                onClick={() => handleMarkPaid(inv.id)}
                                className="p-1.5 rounded hover:bg-green-500/15 text-green-400 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className={`md:hidden divide-y ${tc.divider}`}>
            {filtered.length === 0 ? (
              <div className={`p-8 text-center text-sm ${tc.subtext}`}>No invoices match the current filters.</div>
            ) : (
              filtered.map(inv => {
                const cfg = statusConfig[inv.status];
                const isPaid = markedPaid.has(inv.id);
                return (
                  <div key={inv.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <code className="text-[#BAAB48] text-sm">{inv.invoiceNo}</code>
                        <div className="text-sm mt-0.5" style={{ fontWeight: 600 }}>{inv.client}</div>
                        <code className={`text-xs ${tc.subtext}`}>{inv.shipmentId}</code>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] border flex-shrink-0 ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                        {isPaid ? 'Paid' : inv.status}
                      </span>
                    </div>
                    <div className={`flex justify-between text-sm mb-3`}>
                      <span className={tc.subtext}>Amount</span>
                      <span style={{ fontWeight: 600 }}>{inv.amount}</span>
                    </div>
                    <div className={`flex justify-between text-sm mb-3`}>
                      <span className={tc.subtext}>Due Date</span>
                      <span>{inv.dueDate}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border ${tc.border} ${tc.hoverBg} ${tc.subtext}`}>
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border ${tc.border} ${tc.hoverBg} text-[#BAAB48]`}>
                        <Send className="w-3.5 h-3.5" /> Remind
                      </button>
                      {!isPaid && inv.status !== 'Paid' && (
                        <button
                          onClick={() => handleMarkPaid(inv.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-green-500/30 bg-green-500/10 text-green-400"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
