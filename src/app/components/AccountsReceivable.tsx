import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTC } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';

interface OutstandingPayment {
  id: string;
  client: string;
  shipmentId: string;
  trackingNumber: string;
  invoiceAmount: string;
  dueDate: string;
  daysOverdue: number;
  status: 'current' | 'overdue-30' | 'overdue-60' | 'overdue-90';
  invoiceCount: number;
}

const mockPayments: OutstandingPayment[] = [
  { id: '1', client: 'Tiffany & Co.', shipmentId: '1', trackingNumber: 'MLCA-2026-001847', invoiceAmount: '$2,469,650', dueDate: '2026-06-18', daysOverdue: 0, status: 'current', invoiceCount: 8 },
  { id: '2', client: 'Cartier International', shipmentId: '2', trackingNumber: 'MLCA-2026-001842', invoiceAmount: '$1,245,800', dueDate: '2026-05-25', daysOverdue: 10, status: 'overdue-30', invoiceCount: 6 },
  { id: '3', client: 'Van Cleef & Arpels', shipmentId: '3', trackingNumber: 'MLCA-2026-001838', invoiceAmount: '$890,400', dueDate: '2026-05-15', daysOverdue: 20, status: 'overdue-30', invoiceCount: 5 },
  { id: '4', client: 'Royal Bank of Canada', shipmentId: '4', trackingNumber: 'MLCA-2026-001835', invoiceAmount: '$3,150,000', dueDate: '2026-04-10', daysOverdue: 55, status: 'overdue-60', invoiceCount: 12 },
  { id: '5', client: 'UBS AG', shipmentId: '5', trackingNumber: 'MLCA-2026-001829', invoiceAmount: '$2,875,200', dueDate: '2026-03-18', daysOverdue: 78, status: 'overdue-90', invoiceCount: 10 },
  { id: '6', client: 'Bulgari', shipmentId: '6', trackingNumber: 'MLCA-2026-001822', invoiceAmount: '$1,680,500', dueDate: '2026-06-20', daysOverdue: 0, status: 'current', invoiceCount: 7 },
];

// agingData is built inside AccountsReceivable so it can reference ACCENT

const monthlyData = [
  { month: 'Jan', collected: 8500000, outstanding: 2100000 },
  { month: 'Feb', collected: 7800000, outstanding: 2400000 },
  { month: 'Mar', collected: 9200000, outstanding: 2800000 },
  { month: 'Apr', collected: 8900000, outstanding: 3100000 },
  { month: 'May', collected: 9600000, outstanding: 2900000 },
  { month: 'Jun', collected: 5400000, outstanding: 12400000 },
];

export function AccountsReceivable() {
  const navigate = useNavigate();
  const tc = useTC();
  const ACCENT = tc.accent;
  const agingData = [
    { name: 'Current', value: 4150150, color: ACCENT },
    { name: '1-30 Days', value: 2136200, color: '#8b7d3a' },
    { name: '31-60 Days', value: 3150000, color: '#f59e0b' },
    { name: '61-90 Days', value: 2875200, color: '#ef4444' },
  ];
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());

  const togglePayment = (id: string) => {
    const n = new Set(selectedPayments);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelectedPayments(n);
  };

  const getStatusInfo = (status: OutstandingPayment['status']) => {
    switch (status) {
      case 'current':     return { label: 'Current',          color: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'overdue-30':  return { label: '1-30 Days Overdue', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
      case 'overdue-60':  return { label: '31-60 Days Overdue', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'overdue-90':  return { label: '60+ Days Overdue', color: 'bg-red-600/20 text-red-500 border-red-600/30' };
    }
  };

  const totalOutstanding = mockPayments.reduce((sum, p) => sum + parseFloat(p.invoiceAmount.replace(/[$,]/g, '')), 0);

  return (
    <div className={`min-h-screen ${tc.pageBg} ${tc.text}`}>
      <NavBar />

      {/* Page header */}
      <div className={`${tc.headerBg} border-b px-4 md:px-8 py-4`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-0.5">Accounts Receivable</h1>
            <p className={`text-sm ${tc.subtext}`}>Outstanding payments and invoice management</p>
          </div>
          <div className="flex gap-5">
            <div>
              <div className={`text-xs ${tc.subtext}`}>Total Outstanding</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: ACCENT }}>
                ${(totalOutstanding / 1000000).toFixed(1)}M
              </div>
            </div>
            <div className={`w-px ${tc.isDark ? 'bg-[#333]' : 'bg-[#e5e5e5]'}`} />
            <div>
              <div className={`text-xs ${tc.subtext}`}>Overdue Accounts</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#ef4444' }}>
                {mockPayments.filter(p => p.daysOverdue > 0).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-5">
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-5`}>
            <h2 style={{ fontSize: '15px', fontWeight: 600 }} className="mb-4">Aging Analysis</h2>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={agingData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                  {agingData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tc.tooltipStyle} formatter={(v: number) => `$${(v / 1000000).toFixed(2)}M`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {agingData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="text-sm">
                    <div className={tc.subtext}>{item.name}</div>
                    <div style={{ fontWeight: 600 }}>${(item.value / 1000000).toFixed(1)}M</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-5`}>
            <h2 style={{ fontSize: '15px', fontWeight: 600 }} className="mb-4">Collection Performance</h2>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.isDark ? '#333' : '#e5e5e5'} />
                <XAxis dataKey="month" stroke={tc.isDark ? '#999' : '#888'} />
                <YAxis stroke={tc.isDark ? '#999' : '#888'} tickFormatter={v => `$${v / 1000000}M`} />
                <Tooltip contentStyle={tc.tooltipStyle} formatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
                <Bar dataKey="collected" fill={ACCENT} radius={[4, 4, 0, 0]} />
                <Bar dataKey="outstanding" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-5 mt-3">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: ACCENT }} /><span className={`text-sm ${tc.subtext}`}>Collected</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#ef4444]" /><span className={`text-sm ${tc.subtext}`}>Outstanding</span></div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`${tc.cardBg} border ${tc.border} rounded-lg overflow-hidden`}>
          <div className={`p-4 md:p-5 border-b ${tc.border} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Outstanding Invoices</h2>
              {selectedPayments.size > 0 && (
                <p className={`text-xs ${tc.subtext} mt-0.5`}>{selectedPayments.size} invoice{selectedPayments.size > 1 ? 's' : ''} selected</p>
              )}
            </div>
            {selectedPayments.size > 0 && (
              <button
                onClick={() => { const first = Array.from(selectedPayments)[0]; const p = mockPayments.find(p => p.id === first); if (p) navigate(`/invoice/${p.shipmentId}`); }}
                className="px-5 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                style={{ background: ACCENT, color: tc.isDark ? '#0B2B26' : '#DAF1DE' }}
              >
                <Send className="w-4 h-4" />
                Send Invoice Package
              </button>
            )}
          </div>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${tc.border} ${tc.tableHeaderBg}`}>
                  <th className="px-5 py-3.5 text-left">
                    <input type="checkbox" checked={selectedPayments.size === mockPayments.length}
                      onChange={e => setSelectedPayments(e.target.checked ? new Set(mockPayments.map(p => p.id)) : new Set())}
                      className="w-4 h-4 rounded" style={{ accentColor: ACCENT }} />
                  </th>
                  {['Client', 'Tracking Number', 'Amount', 'Due Date', 'Status', 'Invoices', 'Actions'].map(h => (
                    <th key={h} className={`px-5 py-3.5 text-left text-xs ${tc.subtext}`} style={{ fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockPayments.map(payment => {
                  const si = getStatusInfo(payment.status);
                  return (
                    <tr key={payment.id} className={`border-b ${tc.border} ${tc.hoverBg} transition-colors`}>
                      <td className="px-5 py-4">
                        <input type="checkbox" checked={selectedPayments.has(payment.id)} onChange={() => togglePayment(payment.id)} className="w-4 h-4 rounded" style={{ accentColor: ACCENT }} />
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ fontWeight: 500 }}>{payment.client}</td>
                      <td className="px-5 py-4"><code className="text-sm" style={{ color: ACCENT }}>{payment.trackingNumber}</code></td>
                      <td className="px-5 py-4 text-sm" style={{ fontWeight: 600 }}>{payment.invoiceAmount}</td>
                      <td className="px-5 py-4">
                        <div className="text-sm">{payment.dueDate}</div>
                        {payment.daysOverdue > 0 && (
                          <div className="text-red-400 flex items-center gap-1 mt-0.5 text-xs">
                            <AlertCircle className="w-3 h-3" />{payment.daysOverdue} days overdue
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs border ${si.color}`}>{si.label}</span>
                      </td>
                      <td className={`px-5 py-4 text-sm ${tc.subtext}`}>{payment.invoiceCount} files</td>
                      <td className="px-5 py-4">
                        <button onClick={() => navigate(`/invoice/${payment.shipmentId}`)} className="text-sm transition-colors" style={{ color: ACCENT }}>View Package</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className={`md:hidden divide-y ${tc.divider}`}>
            {mockPayments.map(payment => {
              const si = getStatusInfo(payment.status);
              return (
                <div key={payment.id} className="p-4">
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-start gap-2.5">
                      <input type="checkbox" checked={selectedPayments.has(payment.id)} onChange={() => togglePayment(payment.id)} className="mt-0.5 w-4 h-4 rounded" style={{ accentColor: ACCENT }} />
                      <div>
                        <div className="text-sm" style={{ fontWeight: 600 }}>{payment.client}</div>
                        <code className="text-xs" style={{ color: ACCENT }}>{payment.trackingNumber}</code>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] border flex-shrink-0 ${si.color}`}>{si.label}</span>
                  </div>
                  <div className={`space-y-1.5 text-sm mb-3 ml-6 ${tc.subtext}`}>
                    <div className="flex justify-between"><span>Amount:</span><span className={tc.text} style={{ fontWeight: 600 }}>{payment.invoiceAmount}</span></div>
                    <div className="flex justify-between"><span>Due Date:</span><span className={tc.text}>{payment.dueDate}</span></div>
                    {payment.daysOverdue > 0 && <div className="flex items-center gap-1 text-red-400 text-xs"><AlertCircle className="w-3 h-3" />{payment.daysOverdue} days overdue</div>}
                  </div>
                  <button onClick={() => navigate(`/invoice/${payment.shipmentId}`)} className={`w-full border ${tc.border} py-2 rounded-lg text-sm transition-colors ${tc.innerBg} ml-6`} style={{ width: 'calc(100% - 1.5rem)', color: ACCENT }}>
                    View Package
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
