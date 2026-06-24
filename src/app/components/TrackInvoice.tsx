import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, Eye, Download, CheckCircle, Bell, X, Upload, MoreHorizontal, Package, AlertCircle, RefreshCw, Server } from 'lucide-react';
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
  numFiles: number;
}

interface OutstandingInvoice {
  id: string;
  invoiceNo: string;
  client: string;
  shipmentId: string;
  amount: string;
  dueDate: string;
  daysOverdue: number;
  status: 'current' | 'overdue';
  numFiles: number;
}

const mockInvoices: Invoice[] = [
  { id: '1',  invoiceNo: 'INV-2026-0847', client: 'Tiffany & Co.',        shipmentId: 'MLCA-2026-001847', amount: '$245,650.00',  dueDate: '2026-06-18', status: 'Processed',      numFiles: 7  },
  { id: '2',  invoiceNo: 'INV-2026-0846', client: 'Cartier International', shipmentId: 'MLCA-2026-001846', amount: '$187,200.00',  dueDate: '2026-06-20', status: 'Approved',        numFiles: 4  },
  { id: '3',  invoiceNo: 'INV-2026-0845', client: 'UBS AG',                shipmentId: 'MLCA-2026-001845', amount: '$312,800.00',  dueDate: '2026-06-06', status: 'Overdue',         numFiles: 9  },
  { id: '4',  invoiceNo: 'INV-2026-0844', client: 'Van Cleef & Arpels',    shipmentId: 'MLCA-2026-001844', amount: '$98,400.00',   dueDate: '2026-06-03', status: 'Paid',            numFiles: 5  },
  { id: '5',  invoiceNo: 'INV-2026-0843', client: 'Royal Bank of Canada',  shipmentId: 'MLCA-2026-001843', amount: '$145,500.00',  dueDate: '2026-06-09', status: 'Reminded',        numFiles: 6  },
  { id: '6',  invoiceNo: 'INV-2026-0842', client: 'Bulgari',               shipmentId: 'MLCA-2026-001842', amount: '$168,050.00',  dueDate: '2026-06-22', status: 'Draft',           numFiles: 3  },
  { id: '7',  invoiceNo: 'INV-2026-0841', client: "Sotheby's",             shipmentId: 'MLCA-2026-001841', amount: '$92,300.00',   dueDate: '2026-06-15', status: 'Partially Paid',  numFiles: 11 },
  { id: '8',  invoiceNo: 'INV-2026-0840', client: "Christie's",            shipmentId: 'MLCA-2026-001840', amount: '$410,000.00',  dueDate: '2026-05-28', status: 'Refused',         numFiles: 8  },
  { id: '9',  invoiceNo: 'INV-2026-0839', client: 'Piaget SA',             shipmentId: 'MLCA-2026-001839', amount: '$78,650.00',   dueDate: '2026-06-25', status: 'Approved',        numFiles: 3  },
  { id: '10', invoiceNo: 'INV-2026-0838', client: 'De Beers Group',        shipmentId: 'MLCA-2026-001838', amount: '$526,000.00',  dueDate: '2026-06-30', status: 'Draft',           numFiles: 12 },
  { id: '11', invoiceNo: 'INV-2026-0837', client: 'Graff Diamonds',        shipmentId: 'MLCA-2026-001837', amount: '$887,500.00',  dueDate: '2026-05-15', status: 'Overdue',         numFiles: 10 },
  { id: '12', invoiceNo: 'INV-2026-0836', client: 'Harry Winston',         shipmentId: 'MLCA-2026-001836', amount: '$234,100.00',  dueDate: '2026-06-10', status: 'Paid',            numFiles: 6  },
];

const outstandingInvoices: OutstandingInvoice[] = [
  { id: 'o1', invoiceNo: 'INV-2026-0847-O', client: 'Tiffany & Co.',        shipmentId: 'MLCA-2026-001847', amount: '$2,469,650', dueDate: '2026-06-18', daysOverdue: 0,  status: 'current', numFiles: 8  },
  { id: 'o2', invoiceNo: 'INV-2026-0842-O', client: 'Cartier International', shipmentId: 'MLCA-2026-001842', amount: '$1,245,800', dueDate: '2026-05-25', daysOverdue: 10, status: 'overdue', numFiles: 6  },
  { id: 'o3', invoiceNo: 'INV-2026-0838-O', client: 'Van Cleef & Arpels',    shipmentId: 'MLCA-2026-001838', amount: '$890,400',   dueDate: '2026-05-15', daysOverdue: 20, status: 'overdue', numFiles: 5  },
  { id: 'o4', invoiceNo: 'INV-2026-0835-O', client: 'Royal Bank of Canada',  shipmentId: 'MLCA-2026-001835', amount: '$3,150,000', dueDate: '2026-04-10', daysOverdue: 55, status: 'overdue', numFiles: 12 },
  { id: 'o5', invoiceNo: 'INV-2026-0829-O', client: 'UBS AG',                shipmentId: 'MLCA-2026-001829', amount: '$2,875,200', dueDate: '2026-03-18', daysOverdue: 78, status: 'overdue', numFiles: 10 },
  { id: 'o6', invoiceNo: 'INV-2026-0822-O', client: 'Bulgari',               shipmentId: 'MLCA-2026-001822', amount: '$1,680,500', dueDate: '2026-06-20', daysOverdue: 0,  status: 'current', numFiles: 7  },
];

const buildStatusConfig = (accent: string): Record<InvoiceStatus, { color: string; bg: string; border: string; accentStyle?: React.CSSProperties }> => ({
  'Draft':          { color: 'text-gray-400',   bg: 'bg-gray-500/15',   border: 'border-gray-500/30' },
  'Approved':       { color: 'text-blue-400',    bg: 'bg-blue-500/15',   border: 'border-blue-500/30' },
  'Processed':      { color: '', bg: '', border: '', accentStyle: { color: accent, background: `${accent}26`, borderColor: `${accent}4d` } },
  'Reminded':       { color: 'text-purple-400',  bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  'Refused':        { color: 'text-red-400',     bg: 'bg-red-500/15',    border: 'border-red-500/30' },
  'Paid':           { color: 'text-green-400',   bg: 'bg-green-500/15',  border: 'border-green-500/30' },
  'Partially Paid': { color: 'text-teal-400',    bg: 'bg-teal-500/15',   border: 'border-teal-500/30' },
  'Overdue':        { color: 'text-orange-400',  bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
});

const allStatuses: InvoiceStatus[] = ['Draft', 'Approved', 'Processed', 'Reminded', 'Refused', 'Paid', 'Partially Paid', 'Overdue'];

const INITIAL_REMINDER_COUNTS: Record<string, number> = { '5': 1 };

// ─── Mark as Paid Modal ───────────────────────────────────────────────────────
interface MarkPaidModalProps {
  invoiceNo: string;
  onClose: () => void;
  onConfirm: () => void;
  accent: string;
  tc: ReturnType<typeof useTC>;
}

function MarkPaidModal({ invoiceNo, onClose, onConfirm, accent, tc }: MarkPaidModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl border ${tc.border} shadow-2xl`}
        style={{ background: tc.isDark ? '#1c1c1c' : '#fff' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${tc.border}`}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Confirm Payment</h2>
            <p className={`text-xs mt-0.5 ${tc.subtext}`}>{invoiceNo}</p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${tc.hoverBg} ${tc.subtext} transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5">
          <p className={`text-sm mb-4 ${tc.subtext}`}>
            Upload receipt or proof of payment to confirm. Drag &amp; drop or click to browse.
          </p>

          {/* Drop zone */}
          <div
            className="rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-3 cursor-pointer transition-all"
            style={{
              borderColor: dragOver ? accent : file ? `${accent}80` : tc.isDark ? '#333' : '#ddd',
              background: dragOver
                ? `${accent}10`
                : file
                ? `${accent}08`
                : tc.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{ background: file ? `${accent}20` : tc.isDark ? '#2a2a2a' : '#f0f0f0' }}
            >
              <Upload className="w-5 h-5" style={{ color: file ? accent : tc.isDark ? '#666' : '#aaa' }} />
            </div>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: accent }}>{file.name}</p>
                <p className={`text-xs mt-0.5 ${tc.subtext}`}>{(file.size / 1024).toFixed(1)} KB · Click to replace</p>
              </div>
            ) : (
              <div className="text-center">
                <p className={`text-sm font-medium ${tc.text}`}>Drop file here or click to browse</p>
                <p className={`text-xs mt-0.5 ${tc.subtext}`}>PDF, PNG, JPG up to 20MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }}
          />
        </div>

        {/* Modal footer */}
        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${tc.border}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm border ${tc.border} ${tc.hoverBg} ${tc.subtext} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={() => { if (file) onConfirm(); }}
            disabled={!file}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: file ? accent : tc.isDark ? '#2a2a2a' : '#e5e5e5',
              color: file ? '#1a1505' : tc.isDark ? '#555' : '#aaa',
              cursor: file ? 'pointer' : 'not-allowed',
            }}
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Actions Dropdown ─────────────────────────────────────────────────────────
interface ActionsDropdownProps {
  id: string;
  invoiceNo: string;
  isPaid: boolean;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onMarkPaid: () => void;
  tc: ReturnType<typeof useTC>;
  accent: string;
}

function ActionsDropdown({ id, invoiceNo, isPaid, openMenuId, setOpenMenuId, onMarkPaid, tc, accent }: ActionsDropdownProps) {
  const isOpen = openMenuId === id;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, setOpenMenuId]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpenMenuId(isOpen ? null : id)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${tc.border} ${tc.hoverBg} ${tc.subtext}`}
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
        Actions
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-1 w-44 rounded-xl border ${tc.border} shadow-xl z-50 overflow-hidden`}
          style={{ background: tc.isDark ? '#1c1c1c' : '#fff' }}
        >
          <button
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm ${tc.hoverBg} ${tc.text} transition-colors`}
            onClick={() => setOpenMenuId(null)}
          >
            <Eye className="w-4 h-4" style={{ color: accent }} />
            View Invoice
          </button>
          <button
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm ${tc.hoverBg} ${tc.text} transition-colors`}
            onClick={() => setOpenMenuId(null)}
          >
            <Download className="w-4 h-4" style={{ color: accent }} />
            Download Invoice
          </button>
          {!isPaid && (
            <>
              <div className={`mx-3 border-b ${tc.border}`} />
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-green-400 hover:bg-green-500/10 transition-colors"
                onClick={() => { setOpenMenuId(null); onMarkPaid(); }}
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Paid
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function TrackInvoice() {
  const navigate = useNavigate();
  const tc = useTC();
  const ACCENT = tc.accent;
  const statusConfig = buildStatusConfig(ACCENT);

  // ERP sync state
  const [erpSyncing, setErpSyncing] = useState(false);
  const [erpSyncDone, setErpSyncDone] = useState(false);
  const handleErpSync = () => {
    setErpSyncing(true); setErpSyncDone(false);
    setTimeout(() => { setErpSyncing(false); setErpSyncDone(true); setTimeout(() => setErpSyncDone(false), 2500); }, 1600);
  };

  // Tab state
  const [activeTab, setActiveTab] = useState<'all' | 'outstanding'>('all');

  // All Invoices filters
  const [activeStatus, setActiveStatus] = useState<InvoiceStatus | null>(null);
  const [search, setSearch] = useState('');

  // Paid / reminder state
  const [markedPaid, setMarkedPaid] = useState<Set<string>>(new Set());
  const [reminderCounts, setReminderCounts] = useState<Record<string, number>>(INITIAL_REMINDER_COUNTS);
  const [overrideReminded, setOverrideReminded] = useState<Set<string>>(new Set());

  // Actions dropdown
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Mark as Paid modal
  const [paidModal, setPaidModal] = useState<{ id: string; invoiceNo: string } | null>(null);

  const getEffectiveStatus = (inv: Invoice): InvoiceStatus => {
    if (markedPaid.has(inv.id)) return 'Paid';
    if (overrideReminded.has(inv.id)) return 'Reminded';
    return inv.status;
  };

  const filtered = useMemo(() => {
    return mockInvoices.filter(inv => {
      const effective = getEffectiveStatus(inv);
      const matchStatus = !activeStatus || effective === activeStatus;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        inv.invoiceNo.toLowerCase().includes(q) ||
        inv.client.toLowerCase().includes(q) ||
        inv.shipmentId.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus, search, markedPaid, overrideReminded]);

  const countByStatus = (s: InvoiceStatus) =>
    mockInvoices.filter(inv => getEffectiveStatus(inv) === s).length;

  const handleSendReminder = (inv: Invoice) => {
    setReminderCounts(prev => ({ ...prev, [inv.id]: (prev[inv.id] || 0) + 1 }));
    const effective = getEffectiveStatus(inv);
    if (effective !== 'Reminded') {
      setOverrideReminded(prev => { const n = new Set(prev); n.add(inv.id); return n; });
    }
  };

  const handleSendReminderOutstanding = (id: string) => {
    setReminderCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const getStatusLabel = (inv: Invoice): string => {
    const effective = getEffectiveStatus(inv);
    const count = reminderCounts[inv.id] || 0;
    if (effective === 'Reminded' && count > 0) return `Reminded (${count})`;
    return effective;
  };

  const getStatusCfg = (inv: Invoice) => statusConfig[getEffectiveStatus(inv)];

  const isInvPaid = (inv: Invoice) => {
    const eff = getEffectiveStatus(inv);
    return eff === 'Paid';
  };

  // Tab style helpers
  const tabStyle = (tab: 'all' | 'outstanding') => ({
    color: activeTab === tab ? ACCENT : tc.isDark ? '#888' : '#666',
    borderBottom: activeTab === tab ? `2px solid ${ACCENT}` : '2px solid transparent',
    fontWeight: activeTab === tab ? 700 : 500,
    paddingBottom: '10px',
    paddingTop: '10px',
    paddingLeft: '4px',
    paddingRight: '4px',
    fontSize: '14px',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginRight: '24px',
  });

  return (
    <div className={`min-h-screen ${tc.pageBg} ${tc.text}`}>
      <NavBar />

      {/* Page header */}
      <div className={`${tc.headerBg} border-b px-4 md:px-8 py-5`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-0.5" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Invoice Tracking
            </h1>
            <p className={`text-sm ${tc.subtext}`}>Manage and monitor invoice status across all shipments</p>
          </div>
          <button
            onClick={handleErpSync}
            disabled={erpSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex-shrink-0"
            style={{
              background: erpSyncDone ? 'rgba(34,197,94,0.15)' : '#BAAB48',
              color: erpSyncDone ? '#22c55e' : '#111111',
              border: erpSyncDone ? '1px solid rgba(34,197,94,0.35)' : 'none',
              opacity: erpSyncing ? 0.7 : 1,
              cursor: erpSyncing ? 'not-allowed' : 'pointer',
            }}
          >
            {erpSyncDone
              ? <><CheckCircle size={14} /> Synced</>
              : <>{erpSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Server size={14} />} Sync Invoices With ERP</>
            }
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8">

        {/* Tabs */}
        <div className={`border-b ${tc.border} mb-6 flex`}>
          <button style={tabStyle('all')} onClick={() => setActiveTab('all')}>
            All Invoices
          </button>
          <button style={tabStyle('outstanding')} onClick={() => setActiveTab('outstanding')}>
            Outstanding Invoices
          </button>
        </div>

        {/* ── ALL INVOICES TAB ─────────────────────────────────── */}
        {activeTab === 'all' && (
          <>
            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              {allStatuses.map(status => {
                const cfg = statusConfig[status];
                const count = countByStatus(status);
                const isActive = activeStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setActiveStatus(isActive ? null : status)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all`}
                    style={
                      isActive
                        ? cfg.accentStyle
                          ? { background: cfg.accentStyle.background, borderColor: cfg.accentStyle.borderColor, color: cfg.accentStyle.color }
                          : undefined
                        : { background: tc.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderColor: tc.isDark ? '#333' : '#ddd', color: tc.isDark ? '#888' : '#666' }
                    }
                    {...(!isActive || cfg.accentStyle ? {} : { className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${cfg.bg} ${cfg.border} ${cfg.color}` })}
                  >
                    {status}
                    <span
                      className="inline-flex items-center justify-center rounded-full"
                      style={{
                        minWidth: '18px',
                        height: '18px',
                        padding: '0 4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        background: isActive
                          ? cfg.accentStyle ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.15)'
                          : tc.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
              {activeStatus && (
                <button
                  onClick={() => setActiveStatus(null)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs ${tc.border} ${tc.subtext}`}
                  style={{ background: 'transparent' }}
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Search bar */}
            <div className={`${tc.cardBg} border ${tc.border} rounded-xl p-3 mb-4`}>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tc.isDark ? 'text-[#666]' : 'text-[#aaa]'}`} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search invoice, client, shipment..."
                    className={`w-full border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none ${tc.inputBg}`}
                    onFocus={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 1px ${ACCENT}`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                  />
                </div>
                <span className={`${tc.subtext} text-sm`}>
                  {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* All Invoices Table */}
            <div className={`${tc.cardBg} border ${tc.border} rounded-xl overflow-hidden`}>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${tc.border} ${tc.tableHeaderBg}`}>
                      {['Invoice No.', 'Client', 'Shipment ID', 'Amount', 'Due Date', 'Status', 'No. of Files', 'Actions', 'Send Reminder', 'View Package'].map(h => (
                        <th key={h} className={`px-4 py-3.5 text-left text-xs ${tc.subtext} whitespace-nowrap`} style={{ fontWeight: 500 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={10} className={`px-5 py-12 text-center ${tc.subtext} text-sm`}>
                          No invoices match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(inv => {
                        const cfg = getStatusCfg(inv);
                        const statusLabel = getStatusLabel(inv);
                        const reminderCount = reminderCounts[inv.id] || 0;
                        const paid = isInvPaid(inv);

                        return (
                          <tr key={inv.id} className={`border-b ${tc.border} ${tc.hoverBg} transition-colors`}>
                            <td className="px-4 py-3.5">
                              <code className="text-sm font-semibold" style={{ color: ACCENT }}>{inv.invoiceNo}</code>
                            </td>
                            <td className="px-4 py-3.5 text-sm" style={{ fontWeight: 600 }}>{inv.client}</td>
                            <td className="px-4 py-3.5">
                              <code className={`text-xs ${tc.subtext}`}>{inv.shipmentId}</code>
                            </td>
                            <td className="px-4 py-3.5 text-sm font-bold">{inv.amount}</td>
                            <td className={`px-4 py-3.5 text-sm ${tc.subtext}`}>{inv.dueDate}</td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs border ${cfg.accentStyle ? '' : `${cfg.color} ${cfg.bg} ${cfg.border}`}`}
                                style={cfg.accentStyle ?? undefined}
                              >
                                {statusLabel}
                              </span>
                            </td>
                            <td className={`px-4 py-3.5 text-sm ${tc.subtext}`}>{inv.numFiles} files</td>
                            <td className="px-4 py-3.5">
                              <ActionsDropdown
                                id={inv.id}
                                invoiceNo={inv.invoiceNo}
                                isPaid={paid}
                                openMenuId={openMenuId}
                                setOpenMenuId={setOpenMenuId}
                                onMarkPaid={() => setPaidModal({ id: inv.id, invoiceNo: inv.invoiceNo })}
                                tc={tc}
                                accent={ACCENT}
                              />
                            </td>
                            <td className="px-4 py-3.5">
                              <button
                                onClick={() => handleSendReminder(inv)}
                                className="flex items-center gap-1.5 rounded-lg border transition-all"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  borderColor: reminderCount > 0 ? '#7c3aed60' : tc.isDark ? '#2a2a2a' : '#ddd',
                                  background: reminderCount > 0 ? 'rgba(124,58,237,0.1)' : tc.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                  color: reminderCount > 0 ? '#a78bfa' : tc.isDark ? '#888' : '#666',
                                }}
                                title={`Send reminder (${reminderCount} sent)`}
                              >
                                <Bell className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                                <span>Remind</span>
                                {reminderCount > 0 && (
                                  <span
                                    className="flex items-center justify-center rounded-full"
                                    style={{ minWidth: '16px', height: '16px', background: '#7c3aed', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '0 4px' }}
                                  >
                                    {reminderCount}
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3.5">
                              <button
                                onClick={() => navigate(`/invoice/${inv.shipmentId}`)}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                                style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
                              >
                                <Package className="w-3.5 h-3.5" />
                                View
                              </button>
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
                    const cfg = getStatusCfg(inv);
                    const statusLabel = getStatusLabel(inv);
                    const reminderCount = reminderCounts[inv.id] || 0;
                    const paid = isInvPaid(inv);

                    return (
                      <div key={inv.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <code className="text-sm font-semibold" style={{ color: ACCENT }}>{inv.invoiceNo}</code>
                            <div className="text-sm mt-0.5 font-semibold">{inv.client}</div>
                            <code className={`text-xs ${tc.subtext}`}>{inv.shipmentId}</code>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] border flex-shrink-0 ${cfg.accentStyle ? '' : `${cfg.color} ${cfg.bg} ${cfg.border}`}`}
                            style={cfg.accentStyle ?? undefined}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={tc.subtext}>Amount</span>
                          <span className="font-bold">{inv.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={tc.subtext}>Due Date</span>
                          <span>{inv.dueDate}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-3">
                          <span className={tc.subtext}>Files</span>
                          <span>{inv.numFiles} files</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => navigate(`/invoice/${inv.shipmentId}`)}
                            className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                            style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
                          >
                            <Package className="w-3.5 h-3.5" /> View Package
                          </button>
                          <button
                            onClick={() => handleSendReminder(inv)}
                            className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs border transition-all"
                            style={{
                              borderColor: reminderCount > 0 ? '#7c3aed60' : tc.isDark ? '#333' : '#ddd',
                              background: reminderCount > 0 ? 'rgba(124,58,237,0.1)' : 'transparent',
                              color: reminderCount > 0 ? '#a78bfa' : tc.isDark ? '#888' : '#666',
                            }}
                          >
                            <Bell className="w-3.5 h-3.5" />
                            Remind {reminderCount > 0 && `(${reminderCount})`}
                          </button>
                          {!paid && (
                            <button
                              onClick={() => setPaidModal({ id: inv.id, invoiceNo: inv.invoiceNo })}
                              className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs border border-green-500/30 bg-green-500/10 text-green-400"
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
          </>
        )}

        {/* ── OUTSTANDING INVOICES TAB ─────────────────────────── */}
        {activeTab === 'outstanding' && (
          <div className={`${tc.cardBg} border ${tc.border} rounded-xl overflow-hidden`}>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${tc.border} ${tc.tableHeaderBg}`}>
                    {['Invoice No.', 'Client', 'Shipment ID', 'Amount', 'Due Date', 'Status', 'No. of Files', 'Actions', 'Send Reminder', 'View Package'].map(h => (
                      <th key={h} className={`px-4 py-3.5 text-left text-xs ${tc.subtext} whitespace-nowrap`} style={{ fontWeight: 500 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {outstandingInvoices.map(inv => {
                    const reminderCount = reminderCounts[inv.id] || 0;
                    const isCurrent = inv.status === 'current';
                    return (
                      <tr key={inv.id} className={`border-b ${tc.border} ${tc.hoverBg} transition-colors`}>
                        <td className="px-4 py-3.5">
                          <code className="text-sm font-semibold" style={{ color: ACCENT }}>{inv.invoiceNo}</code>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold">{inv.client}</td>
                        <td className="px-4 py-3.5">
                          <code className={`text-xs ${tc.subtext}`}>{inv.shipmentId}</code>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-bold">{inv.amount}</td>
                        <td className="px-4 py-3.5">
                          <div className={`text-sm ${tc.subtext}`}>{inv.dueDate}</div>
                          {inv.daysOverdue > 0 && (
                            <div className="flex items-center gap-1 text-red-400 text-xs mt-0.5">
                              <AlertCircle className="w-3 h-3" />
                              {inv.daysOverdue}d overdue
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {isCurrent ? (
                            <span className="px-2.5 py-1 rounded-full text-xs border bg-green-500/15 text-green-400 border-green-500/30">
                              Current
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs border bg-red-500/15 text-red-400 border-red-500/30">
                              Overdue {inv.daysOverdue}d
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3.5 text-sm ${tc.subtext}`}>{inv.numFiles} files</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button title="View Invoice" className={`p-1.5 rounded ${tc.hoverBg} ${tc.subtext} transition-colors`}>
                              <Eye className="w-4 h-4" />
                            </button>
                            <button title="Download Invoice" className={`p-1.5 rounded ${tc.hoverBg} ${tc.subtext} transition-colors`}>
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleSendReminderOutstanding(inv.id)}
                            className="flex items-center gap-1.5 rounded-lg border transition-all"
                            style={{
                              padding: '5px 10px',
                              fontSize: '11px',
                              fontWeight: 500,
                              borderColor: reminderCount > 0 ? '#7c3aed60' : tc.isDark ? '#2a2a2a' : '#ddd',
                              background: reminderCount > 0 ? 'rgba(124,58,237,0.1)' : tc.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                              color: reminderCount > 0 ? '#a78bfa' : tc.isDark ? '#888' : '#666',
                            }}
                          >
                            <Bell className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                            <span>Remind</span>
                            {reminderCount > 0 && (
                              <span
                                className="flex items-center justify-center rounded-full"
                                style={{ minWidth: '16px', height: '16px', background: '#7c3aed', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '0 4px' }}
                              >
                                {reminderCount}
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => navigate(`/invoice/${inv.shipmentId}`)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                            style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
                          >
                            <Package className="w-3.5 h-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className={`md:hidden divide-y ${tc.divider}`}>
              {outstandingInvoices.map(inv => {
                const reminderCount = reminderCounts[inv.id] || 0;
                const isCurrent = inv.status === 'current';
                return (
                  <div key={inv.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <code className="text-sm font-semibold" style={{ color: ACCENT }}>{inv.invoiceNo}</code>
                        <div className="text-sm mt-0.5 font-semibold">{inv.client}</div>
                        <code className={`text-xs ${tc.subtext}`}>{inv.shipmentId}</code>
                      </div>
                      {isCurrent ? (
                        <span className="px-2 py-1 rounded-full text-[10px] border bg-green-500/15 text-green-400 border-green-500/30 flex-shrink-0">Current</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-[10px] border bg-red-500/15 text-red-400 border-red-500/30 flex-shrink-0">Overdue {inv.daysOverdue}d</span>
                      )}
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={tc.subtext}>Amount</span>
                      <span className="font-bold">{inv.amount}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={tc.subtext}>Due Date</span>
                      <span>{inv.dueDate}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className={tc.subtext}>Files</span>
                      <span>{inv.numFiles} files</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/invoice/${inv.shipmentId}`)}
                        className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
                      >
                        <Package className="w-3.5 h-3.5" /> View Package
                      </button>
                      <button
                        onClick={() => handleSendReminderOutstanding(inv.id)}
                        className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs border transition-all"
                        style={{
                          borderColor: reminderCount > 0 ? '#7c3aed60' : tc.isDark ? '#333' : '#ddd',
                          background: reminderCount > 0 ? 'rgba(124,58,237,0.1)' : 'transparent',
                          color: reminderCount > 0 ? '#a78bfa' : tc.isDark ? '#888' : '#666',
                        }}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        Remind {reminderCount > 0 && `(${reminderCount})`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mark as Paid Modal */}
      {paidModal && (
        <MarkPaidModal
          invoiceNo={paidModal.invoiceNo}
          onClose={() => setPaidModal(null)}
          onConfirm={() => {
            setMarkedPaid(prev => { const n = new Set(prev); n.add(paidModal.id); return n; });
            setPaidModal(null);
          }}
          accent={ACCENT}
          tc={tc}
        />
      )}
    </div>
  );
}
