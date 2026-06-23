import { useState, useRef } from 'react';
import { useParams } from 'react-router';
import {
  Download, Send, FileText, CheckCircle, Mail, AlertCircle, Calendar,
  Plus, Upload, Trash2, Pencil, X, Check, ChevronDown, Image as ImageIcon,
} from 'lucide-react';
import { useTC } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';

interface InvoiceItem { id: string; category: string; description: string; quantity: string; unitPrice: string; amount: string; }

interface Document {
  id: string;
  name: string;
  category: string;
  size: string;
  pages: number;
  source: 'system' | 'uploaded' | 'created';
  selected: boolean;
}

// ── Invoice Builder state ────────────────────────────────────────────────────
interface BuilderLine { id: string; description: string; qty: string; rate: string; }
interface BuilderData {
  invoiceNumber: string;
  senderName: string;
  senderAddress: string;
  clientName: string;
  clientAddress: string;
  date: string;
  dueDate: string;
  notes: string;
  lines: BuilderLine[];
}

const defaultBuilder: BuilderData = {
  invoiceNumber: 'INV-2026-001',
  senderName: 'MALCA-AMIT Group',
  senderAddress: '1 Lombard Street, London, EC3V 9AA',
  clientName: 'Tiffany & Co.',
  clientAddress: '200 Fifth Avenue, New York, NY 10010',
  date: '2026-06-10',
  dueDate: '2026-06-18',
  notes: 'Payment due within 14 days. Late payments subject to 1.5% monthly interest.',
  lines: [
    { id: '1', description: 'Secure transport - London to New York', qty: '1', rate: '125000' },
    { id: '2', description: 'Precious metals handling fee', qty: '125.5', rate: '450' },
  ],
};

// ────────────────────────────────────────────────────────────────────────────

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

const initialDocuments: Document[] = [
  { id: '1', name: 'Master Invoice - MLCA-2026-001847', category: 'Invoice', size: '2.1 MB', pages: 4, source: 'system', selected: true },
  { id: '2', name: 'Commercial Invoice - CI-2026-001847', category: 'Invoice', size: '1.8 MB', pages: 3, source: 'system', selected: true },
  { id: '3', name: 'Customs Declaration & Duty Receipt', category: 'Customs', size: '2.4 MB', pages: 6, source: 'system', selected: true },
  { id: '4', name: 'UK Export Authorization Certificate', category: 'Authorization', size: '1.5 MB', pages: 2, source: 'system', selected: true },
  { id: '5', name: 'US Import Authorization Certificate', category: 'Authorization', size: '1.6 MB', pages: 2, source: 'system', selected: true },
  { id: '6', name: 'Insurance Certificate & Policy', category: 'Insurance', size: '2.2 MB', pages: 5, source: 'system', selected: true },
  { id: '7', name: 'Bill of Lading - Lufthansa LH8234', category: 'Carrier', size: '1.3 MB', pages: 2, source: 'system', selected: false },
  { id: '8', name: 'Chain of Custody Documentation', category: 'Security', size: '3.8 MB', pages: 12, source: 'system', selected: false },
  { id: '9', name: 'Security Seal Verification Reports', category: 'Security', size: '2.9 MB', pages: 8, source: 'system', selected: false },
  { id: '10', name: 'Vault Storage Receipts', category: 'Logistics', size: '1.1 MB', pages: 2, source: 'system', selected: false },
];

const CATEGORY_COLORS_STATIC: Record<string, string> = {
  Customs: '#3b82f6',
  Authorization: '#a855f7',
  Insurance: '#22c55e',
  Carrier: '#f97316',
  Security: '#ef4444',
  Logistics: '#14b8a6',
};

function categoryPill(cat: string, accent: string) {
  const color = CATEGORY_COLORS_STATIC[cat] ?? accent;
  return { background: `${color}20`, color, border: `1px solid ${color}40` };
}

// ── Invoice Builder Modal ────────────────────────────────────────────────────
function InvoiceBuilderModal({ isDark, tc, onClose, onAdd }: {
  isDark: boolean;
  tc: ReturnType<typeof useTC>;
  onClose: () => void;
  onAdd: (name: string) => void;
}) {
  const ACCENT = tc.accent;
  const [data, setData] = useState<BuilderData>(defaultBuilder);
  const [logoName, setLogoName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const setField = (key: keyof BuilderData, val: string) =>
    setData(d => ({ ...d, [key]: val }));

  const addLine = () =>
    setData(d => ({ ...d, lines: [...d.lines, { id: Date.now().toString(), description: '', qty: '1', rate: '0' }] }));

  const updateLine = (id: string, key: keyof BuilderLine, val: string) =>
    setData(d => ({ ...d, lines: d.lines.map(l => l.id === id ? { ...l, [key]: val } : l) }));

  const removeLine = (id: string) =>
    setData(d => ({ ...d, lines: d.lines.filter(l => l.id !== id) }));

  const lineTotal = (l: BuilderLine) => {
    const qty = parseFloat(l.qty) || 0;
    const rate = parseFloat(l.rate) || 0;
    return qty * rate;
  };
  const grandTotal = data.lines.reduce((s, l) => s + lineTotal(l), 0);

  const inputCls: React.CSSProperties = {
    width: '100%',
    background: isDark ? '#111a28' : '#f5f8fc',
    border: `1px solid ${isDark ? '#2a3e54' : '#c8d8e8'}`,
    color: isDark ? '#c0cdd8' : '#1a2a38',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '12px',
    outline: 'none',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '680px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
          background: isDark ? '#0d1525' : '#ffffff',
          border: `1.5px solid ${isDark ? '#283548' : '#d8e2ec'}`,
          borderTop: `2px solid ${ACCENT}`,
          borderRadius: '14px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
          style={{
            background: isDark ? '#0d1525' : '#ffffff',
            borderBottom: `1px solid ${isDark ? '#1a2535' : '#eef2f6'}`,
          }}
        >
          <div>
            <div style={{ color: ACCENT, fontWeight: 700, fontSize: '13px' }}>Invoice Builder</div>
            <div style={{ color: isDark ? '#6a8090' : '#6a7a88', fontSize: '11px' }}>Design your custom invoice</div>
          </div>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', background: isDark ? '#1a2535' : '#f0f4f8', border: `1px solid ${isDark ? '#283548' : '#d0dae6'}`, color: isDark ? '#6a8090' : '#4a6070', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Logo upload */}
          <div>
            <div style={{ fontSize: '11px', color: isDark ? '#5a7090' : '#6a7a88', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company Branding</div>
            <div className="flex items-center gap-3">
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  width: '72px', height: '48px', borderRadius: '8px', cursor: 'pointer',
                  background: isDark ? '#111a28' : '#f5f8fc',
                  border: `2px dashed ${isDark ? '#2a3e54' : '#c8d8e8'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px',
                }}
              >
                <ImageIcon size={16} color={isDark ? '#4a6070' : '#8a9aaa'} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: isDark ? '#c0cdd8' : '#1a2a38' }}>
                  {logoName ?? 'Upload Logo'}
                </div>
                <div style={{ fontSize: '10px', color: isDark ? '#4a6070' : '#8a9aaa' }}>PNG, JPG, SVG — max 5MB</div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setLogoName(e.target.files?.[0]?.name ?? null)} />
            </div>
          </div>

          {/* Invoice meta */}
          <div>
            <div style={{ fontSize: '11px', color: isDark ? '#5a7090' : '#6a7a88', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice Details</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: isDark ? '#5a7090' : '#6a7a88', marginBottom: '4px' }}>Invoice No.</label>
                <input style={inputCls} value={data.invoiceNumber} onChange={e => setField('invoiceNumber', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: isDark ? '#5a7090' : '#6a7a88', marginBottom: '4px' }}>Issue Date</label>
                <input style={inputCls} type="date" value={data.date} onChange={e => setField('date', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: isDark ? '#5a7090' : '#6a7a88', marginBottom: '4px' }}>Due Date</label>
                <input style={inputCls} type="date" value={data.dueDate} onChange={e => setField('dueDate', e.target.value)} />
              </div>
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div style={{ fontSize: '11px', color: isDark ? '#5a7090' : '#6a7a88', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</div>
              <div className="space-y-2">
                <input style={inputCls} placeholder="Sender name / company" value={data.senderName} onChange={e => setField('senderName', e.target.value)} />
                <textarea
                  style={{ ...inputCls, resize: 'none', height: '60px' }}
                  placeholder="Address"
                  value={data.senderAddress}
                  onChange={e => setField('senderAddress', e.target.value)}
                />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: isDark ? '#5a7090' : '#6a7a88', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bill To</div>
              <div className="space-y-2">
                <input style={inputCls} placeholder="Client name / company" value={data.clientName} onChange={e => setField('clientName', e.target.value)} />
                <textarea
                  style={{ ...inputCls, resize: 'none', height: '60px' }}
                  placeholder="Address"
                  value={data.clientAddress}
                  onChange={e => setField('clientAddress', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div>
            <div style={{ fontSize: '11px', color: isDark ? '#5a7090' : '#6a7a88', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Line Items</div>
            <div style={{ background: isDark ? '#111a28' : '#f5f8fc', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isDark ? '#2a3e54' : '#c8d8e8'}` }}>
              {/* Column headers */}
              <div className="grid" style={{ gridTemplateColumns: '1fr 80px 90px 90px 32px', gap: '0', padding: '8px 12px', borderBottom: `1px solid ${isDark ? '#2a3e54' : '#c8d8e8'}` }}>
                {['Description', 'Qty', 'Rate ($)', 'Total', ''].map(h => (
                  <div key={h} style={{ fontSize: '9px', color: isDark ? '#4a6070' : '#8a9aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>
              {data.lines.map((line, i) => (
                <div
                  key={line.id}
                  className="grid items-center"
                  style={{ gridTemplateColumns: '1fr 80px 90px 90px 32px', gap: '0', padding: '6px 12px', borderBottom: i < data.lines.length - 1 ? `1px solid ${isDark ? '#1a2535' : '#e8f0f8'}` : undefined }}
                >
                  <input
                    style={{ ...inputCls, padding: '4px 6px', fontSize: '11px', marginRight: '6px' }}
                    placeholder="Description"
                    value={line.description}
                    onChange={e => updateLine(line.id, 'description', e.target.value)}
                  />
                  <input style={{ ...inputCls, padding: '4px 6px', fontSize: '11px', marginRight: '6px' }} value={line.qty} onChange={e => updateLine(line.id, 'qty', e.target.value)} />
                  <input style={{ ...inputCls, padding: '4px 6px', fontSize: '11px', marginRight: '6px' }} value={line.rate} onChange={e => updateLine(line.id, 'rate', e.target.value)} />
                  <div style={{ fontSize: '11px', fontWeight: 600, color: ACCENT, paddingRight: '6px' }}>
                    ${lineTotal(line).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <button onClick={() => removeLine(line.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '5px', background: 'transparent', border: 'none', cursor: 'pointer', color: isDark ? '#3a5060' : '#a0b0c0' }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2.5" style={{ borderTop: `1px solid ${isDark ? '#2a3e54' : '#c8d8e8'}` }}>
                <button
                  onClick={addLine}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: ACCENT, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                >
                  <Plus size={12} /> Add line
                </button>
                <div style={{ fontSize: '12px', fontWeight: 700, color: ACCENT }}>
                  Total: ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: isDark ? '#5a7090' : '#6a7a88', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes / Payment Terms</label>
            <textarea
              style={{ ...inputCls, resize: 'none', height: '56px' }}
              value={data.notes}
              onChange={e => setField('notes', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-1">
            <button onClick={onClose} style={{ flex: 1, padding: '9px', background: isDark ? '#1a2535' : '#f0f4f8', border: `1px solid ${isDark ? '#283548' : '#d0dae6'}`, color: isDark ? '#8a9aaa' : '#4a6070', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
              Cancel
            </button>
            <button
              onClick={() => { onAdd(`Custom Invoice - ${data.invoiceNumber}`); onClose(); }}
              style={{ flex: 2, padding: '9px', background: ACCENT, color: tc.isDark ? '#0B2B26' : '#DAF1DE', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Check size={13} /> Add to Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InvoicePackage() {
  const { shipmentId } = useParams();
  const tc = useTC();
  const ACCENT = tc.accent;
  const [recipientEmail, setRecipientEmail] = useState('finance@tiffany.com');
  const [showSuccess, setShowSuccess] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [showBuilder, setShowBuilder] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  const lastSentDate = '2026-06-05';
  const lastSentTime = '14:32';
  const dueDate = '2026-06-18';
  const daysSinceLastSent = Math.floor((new Date().getTime() - new Date(lastSentDate).getTime()) / (1000 * 60 * 60 * 24));

  const subtotal = invoiceItems.reduce((sum, item) => sum + parseFloat(item.amount.replace(/[$,]/g, '')), 0);
  const categoryTotals = invoiceItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount.replace(/[$,]/g, ''));
    return acc;
  }, {} as Record<string, number>);

  // Selection helpers
  const selectedDocs = documents.filter(d => d.selected);
  const allSelected = documents.length > 0 && documents.every(d => d.selected);
  const someSelected = documents.some(d => d.selected) && !allSelected;

  const toggleAll = () => setDocuments(docs => docs.map(d => ({ ...d, selected: !allSelected })));
  const toggleDoc = (id: string) => setDocuments(docs => docs.map(d => d.id === id ? { ...d, selected: !d.selected } : d));
  const removeDoc = (id: string) => setDocuments(docs => docs.filter(d => d.id !== id));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newDocs: Document[] = files.map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: f.name.replace(/\.[^.]+$/, ''),
      category: 'Invoice',
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      pages: 1,
      source: 'uploaded',
      selected: true,
    }));
    setDocuments(prev => [...prev, ...newDocs]);
    e.target.value = '';
  };

  const handleBuilderAdd = (name: string) => {
    const doc: Document = {
      id: `created-${Date.now()}`,
      name,
      category: 'Invoice',
      size: '0.4 MB',
      pages: 1,
      source: 'created',
      selected: true,
    };
    setDocuments(prev => [...prev, doc]);
  };

  const handleSend = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const sourceLabel: Record<Document['source'], { label: string; color: string }> = {
    system: { label: 'System', color: '#6a8aaa' },
    uploaded: { label: 'Uploaded', color: '#a855f7' },
    created: { label: 'Created', color: ACCENT },
  };

  return (
    <div className={`min-h-screen ${tc.pageBg} ${tc.text}`}>
      <NavBar />

      {showBuilder && (
        <InvoiceBuilderModal
          isDark={tc.isDark}
          tc={tc}
          onClose={() => setShowBuilder(false)}
          onAdd={handleBuilderAdd}
        />
      )}

      {/* Page header */}
      <div className={`${tc.headerBg} border-b px-4 md:px-8 py-4`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-1">Consolidated Invoice Package</h1>
            <div className={`flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs md:text-sm ${tc.subtext}`}>
              <span>Tracking: <code style={{ color: ACCENT }}>MLCA-2026-001847</code></span>
              <span className="hidden md:inline">·</span>
              <span>Client: Tiffany & Co.</span>
              <span className="hidden md:inline">·</span>
              <span>Due: June 18, 2026</span>
            </div>
          </div>
          <div>
            <div className={`text-xs ${tc.subtext}`}>Total Payable</div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: ACCENT }}>
              ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            {/* Category breakdown */}
            <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-5`}>
              <h2 style={{ fontSize: '15px', fontWeight: 600 }} className="mb-4">Cost Breakdown by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(categoryTotals).map(([cat, total]) => (
                  <div key={cat} className={`${tc.innerBg} border ${tc.border} rounded-lg p-3`}>
                    <div className={`text-xs ${tc.subtext} mb-1`}>{cat}</div>
                    <div className="text-sm" style={{ fontWeight: 600, color: ACCENT }}>
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
                      <td className="px-5 py-4 text-right" style={{ fontSize: '16px', fontWeight: 600, color: ACCENT }}>
                        ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={`md:hidden divide-y ${tc.divider}`}>
                {invoiceItems.map(item => (
                  <div key={item.id} className="p-4">
                    <div className="text-xs mb-1.5" style={{ color: ACCENT }}>{item.category}</div>
                    <div className="text-sm mb-2.5" style={{ fontWeight: 500 }}>{item.description}</div>
                    <div className={`space-y-1 text-sm ${tc.subtext}`}>
                      <div className="flex justify-between"><span>Quantity:</span><span className={tc.text}>{item.quantity}</span></div>
                      <div className="flex justify-between"><span>Unit Price:</span><span className={tc.text}>{item.unitPrice}</span></div>
                      <div className={`flex justify-between pt-2 border-t ${tc.border}`}>
                        <span>Amount:</span><span style={{ fontWeight: 600, color: ACCENT }}>{item.amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className={`p-4 ${tc.tableHeaderBg}`}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontWeight: 600 }}>Subtotal:</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: ACCENT }}>
                      ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-5">
            {/* Send panel */}
            <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-5`}>
              <h2 style={{ fontSize: '15px', fontWeight: 600 }} className="mb-4">Send to Client</h2>
              <div className={`${tc.innerBg} border ${tc.border} rounded-lg p-4 mb-4`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Mail className="w-3.5 h-3.5" style={{ color: ACCENT }} />
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
                    <Calendar className="w-3.5 h-3.5" style={{ color: ACCENT }} />
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
                  <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${tc.inputBg}`}
                    onFocus={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 1px ${ACCENT}`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }} />
                </div>

                {selectedDocs.length > 0 && (
                  <div className={`text-xs ${tc.subtext} px-1`}>
                    <span style={{ color: ACCENT, fontWeight: 600 }}>{selectedDocs.length}</span> of {documents.length} documents selected for sending
                  </div>
                )}

                <button onClick={handleSend} className="w-full px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm" style={{ fontWeight: 600, background: ACCENT, color: tc.isDark ? '#0B2B26' : '#DAF1DE' }}>
                  <Send className="w-4 h-4" />
                  {daysSinceLastSent < 2 ? 'Resend Package' : 'Send Package'} ({selectedDocs.length})
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

            {/* Package Contents with checkboxes */}
            <div className={`${tc.cardBg} border ${tc.border} rounded-lg overflow-hidden`}>
              {/* Header */}
              <div className={`px-5 py-4 border-b ${tc.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 style={{ fontSize: '15px', fontWeight: 600 }} className="flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: ACCENT }} />
                    Package Contents
                  </h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full`} style={{ background: tc.accentMuted, color: ACCENT, fontWeight: 600 }}>
                    {selectedDocs.length}/{documents.length} selected
                  </span>
                </div>

                {/* Add invoice buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBuilder(true)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      padding: '7px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      background: ACCENT, color: tc.isDark ? '#0B2B26' : '#DAF1DE', border: 'none',
                    }}
                  >
                    <Pencil size={11} /> Create Invoice
                  </button>
                  <button
                    onClick={() => uploadRef.current?.click()}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      padding: '7px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 500, cursor: 'pointer',
                      background: tc.isDark ? '#1a2535' : '#f0f4f8',
                      border: `1px solid ${tc.isDark ? '#283548' : '#d0dae6'}`,
                      color: tc.isDark ? '#8aa0b8' : '#4a6070',
                    }}
                  >
                    <Upload size={11} /> Upload Invoice
                  </button>
                  <input ref={uploadRef} type="file" accept=".pdf,.png,.jpg,.docx" multiple className="hidden" onChange={handleUpload} />
                </div>
              </div>

              {/* Select-all bar */}
              <div
                className={`px-4 py-2.5 flex items-center gap-3 border-b ${tc.border}`}
                style={{ background: tc.isDark ? '#111a28' : '#f8fafc' }}
              >
                <button
                  onClick={toggleAll}
                  style={{
                    width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                    background: allSelected ? ACCENT : someSelected ? `${ACCENT}60` : 'transparent',
                    border: `1.5px solid ${allSelected || someSelected ? ACCENT : (tc.isDark ? '#3a5060' : '#b0c0d0')}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {(allSelected || someSelected) && <Check size={10} color={allSelected ? (tc.isDark ? '#0B2B26' : '#DAF1DE') : ACCENT} strokeWidth={3} />}
                </button>
                <span style={{ fontSize: '11px', color: tc.isDark ? '#6a8090' : '#5a7080', flex: 1 }}>
                  {allSelected ? 'Deselect all' : 'Select all documents'}
                </span>
                {selectedDocs.length > 0 && (
                  <span style={{ fontSize: '10px', color: ACCENT, fontWeight: 600 }}>
                    {selectedDocs.length} ready to send
                  </span>
                )}
              </div>

              {/* Document list */}
              <div className="max-h-80 overflow-y-auto">
                {documents.map(doc => {
                  const sl = sourceLabel[doc.source];
                  const cpill = categoryPill(doc.category, ACCENT);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors border-b ${tc.border}`}
                      style={{
                        background: doc.selected
                          ? tc.accentFaint
                          : 'transparent',
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        style={{
                          width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, marginTop: '1px',
                          background: doc.selected ? ACCENT : 'transparent',
                          border: `1.5px solid ${doc.selected ? ACCENT : (tc.isDark ? '#3a5060' : '#b0c0d0')}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                      >
                        {doc.selected && <Check size={10} color={tc.isDark ? '#0B2B26' : '#DAF1DE'} strokeWidth={3} />}
                      </div>

                      {/* Doc info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs mb-1.5 truncate" style={{ fontWeight: 500, color: doc.selected ? (tc.isDark ? '#e0e0e0' : '#1a1a1a') : (tc.isDark ? '#8a9aaa' : '#4a5a68') }}>
                          {doc.name}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded text-[9px]" style={cpill}>{doc.category}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: `${sl.color}18`, color: sl.color, border: `1px solid ${sl.color}35` }}>{sl.label}</span>
                          <span className={`text-[10px] ${tc.subtext}`}>{doc.size} · {doc.pages}p</span>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={e => { e.stopPropagation(); removeDoc(doc.id); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '5px', background: 'transparent', border: 'none', cursor: 'pointer', color: tc.isDark ? '#3a5060' : '#a0b0c0', flexShrink: 0 }}
                        title="Remove"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment terms */}
            <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-5`}>
              <h2 style={{ fontSize: '15px', fontWeight: 600 }} className="mb-3">Payment Terms</h2>
              <div className="space-y-2.5 text-sm">
                {[['Payment Due Date', 'June 18, 2026'], ['Payment Terms', 'Net 14'], ['Currency', 'USD']].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className={tc.subtext}>{label}:</span>
                    <span style={{ fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
                <div className={`pt-3 border-t ${tc.border}`}>
                  <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: tc.accentFaint, border: `1px solid ${ACCENT}4d` }}>
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
                    <div className="text-xs" style={{ color: ACCENT }}>Late payments subject to 1.5% monthly interest charge</div>
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
