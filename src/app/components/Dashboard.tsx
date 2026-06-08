import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, TrendingUp, Package, Clock, CheckCircle, DollarSign, ArrowRight, Globe } from 'lucide-react';
import { useTC } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';
import { WorldMap } from './WorldMap';

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  value: string;
  status: 'In Transit' | 'Delivered' | 'Pending Authorization' | 'Active';
  eta: string;
  client: string;
}

const mockShipments: Shipment[] = [
  { id: '1', trackingNumber: 'MLCA-2026-001847', origin: 'London, UK', destination: 'New York, USA', value: '$2,450,000', status: 'In Transit', eta: '2026-06-08', client: 'Tiffany & Co.' },
  { id: '2', trackingNumber: 'MLCA-2026-001846', origin: 'Dubai, UAE', destination: 'Hong Kong', value: '$1,850,000', status: 'Pending Authorization', eta: '2026-06-10', client: 'Cartier International' },
  { id: '3', trackingNumber: 'MLCA-2026-001845', origin: 'Zurich, Switzerland', destination: 'Singapore', value: '$3,200,000', status: 'Active', eta: '2026-06-06', client: 'UBS AG' },
  { id: '4', trackingNumber: 'MLCA-2026-001844', origin: 'Paris, France', destination: 'Tokyo, Japan', value: '$980,000', status: 'Delivered', eta: '2026-06-03', client: 'Van Cleef & Arpels' },
  { id: '5', trackingNumber: 'MLCA-2026-001843', origin: 'New York, USA', destination: 'Sydney, Australia', value: '$1,450,000', status: 'In Transit', eta: '2026-06-09', client: 'Royal Bank of Canada' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const tc = useTC();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) navigate(`/tracking/${searchTerm}`);
  };

  const kpiData = [
    { label: 'Active', value: '127', icon: Package, trend: '+12%', color: 'text-blue-400' },
    { label: 'In Transit', value: '84', icon: TrendingUp, trend: '+8%', color: 'text-[#BAAB48]' },
    { label: 'Pending Auth', value: '23', icon: Clock, trend: '-5%', color: 'text-orange-400' },
    { label: 'Delivered', value: '456', icon: CheckCircle, trend: '+18%', color: 'text-green-400' },
    { label: 'Outstanding', value: '$12.4M', icon: DollarSign, trend: '+3%', color: 'text-red-400' },
  ];

  const getStatusColor = (status: Shipment['status']) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Pending Authorization': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Active': return 'bg-[#BAAB48]/20 text-[#BAAB48] border-[#BAAB48]/30';
    }
  };

  return (
    <div className={`min-h-screen ${tc.pageBg} ${tc.text}`}>
      <NavBar />

      <div className="p-4 md:p-8">
        {/* Page title + search */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="mb-0.5" style={{ fontSize: '22px', fontWeight: 600 }}>Operations Dashboard</h1>
            <p className={`text-sm ${tc.subtext}`}>Secure Logistics & Asset Management</p>
          </div>
          <form onSubmit={handleSearch} className="relative w-full sm:w-72 md:w-96">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tc.isDark ? 'text-[#666]' : 'text-[#aaa]'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search tracking number..."
              className={`w-full border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#BAAB48] focus:ring-1 focus:ring-[#BAAB48] ${tc.inputBg}`}
            />
          </form>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {kpiData.map(kpi => (
            <div key={kpi.label} className={`${tc.cardBg} border ${tc.border} rounded-lg p-4`}>
              <div className="flex items-start justify-between mb-2">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${kpi.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="mb-0.5" style={{ fontSize: '20px', fontWeight: 700 }}>{kpi.value}</div>
              <div className={`text-xs ${tc.subtext}`}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* World Map */}
        <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-[#BAAB48]" />
            <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Global Shipment Tracker</h2>
            <span className={`ml-auto text-xs ${tc.subtext}`}>5 routes · filter by status</span>
          </div>
          <WorldMap />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/tracking/MLCA-2026-001847')}
            className="bg-[#BAAB48] hover:bg-[#a89940] text-[#1a1a1a] rounded-lg p-5 flex items-center justify-between transition-colors"
          >
            <div className="text-left">
              <div style={{ fontSize: '15px', fontWeight: 600 }} className="mb-0.5">Track Shipment</div>
              <div className="text-xs opacity-80">View real-time tracking and milestones</div>
            </div>
            <ArrowRight className="w-5 h-5 flex-shrink-0" />
          </button>
          <button
            onClick={() => navigate('/accounts-receivable')}
            className={`${tc.cardBg} border ${tc.border} rounded-lg p-5 flex items-center justify-between transition-colors ${tc.hoverBg}`}
          >
            <div className="text-left">
              <div style={{ fontSize: '15px', fontWeight: 600 }} className="mb-0.5">Financial Dashboard</div>
              <div className={`text-xs ${tc.subtext}`}>Manage invoices and payments</div>
            </div>
            <ArrowRight className={`w-5 h-5 flex-shrink-0 ${tc.subtext}`} />
          </button>
        </div>

        {/* Recent Shipments */}
        <div className={`${tc.cardBg} border ${tc.border} rounded-lg overflow-hidden`}>
          <div className={`p-4 md:p-5 border-b ${tc.border}`}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Shipments</h2>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${tc.border} ${tc.tableHeaderBg}`}>
                  {['Tracking Number', 'Client', 'Route', 'Value', 'Status', 'ETA', 'Actions'].map(h => (
                    <th key={h} className={`px-5 py-3.5 text-left text-xs ${tc.subtext}`} style={{ fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockShipments.map(shipment => (
                  <tr key={shipment.id} className={`border-b ${tc.border} ${tc.hoverBg} transition-colors`}>
                    <td className="px-5 py-4">
                      <code className="text-[#BAAB48] text-sm">{shipment.trackingNumber}</code>
                    </td>
                    <td className="px-5 py-4 text-sm">{shipment.client}</td>
                    <td className="px-5 py-4">
                      <div className="text-sm">
                        <div>{shipment.origin}</div>
                        <div className={tc.subtext}>→ {shipment.destination}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ fontWeight: 600 }}>{shipment.value}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs border ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className={`px-5 py-4 text-sm ${tc.subtext}`}>{shipment.eta}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/tracking/${shipment.trackingNumber}`)}
                        className="text-[#BAAB48] hover:text-[#a89940] text-sm transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className={`md:hidden divide-y ${tc.divider}`}>
            {mockShipments.map(shipment => (
              <div key={shipment.id} className="p-4">
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <code className="text-[#BAAB48] text-sm">{shipment.trackingNumber}</code>
                    <div className="text-sm mt-0.5" style={{ fontWeight: 500 }}>{shipment.client}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] border flex-shrink-0 ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </div>
                <div className={`space-y-1.5 text-sm mb-3 ${tc.subtext}`}>
                  <div className="flex justify-between">
                    <span>Route:</span>
                    <span className={tc.text + ' text-right text-xs'}>{shipment.origin} → {shipment.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Value:</span>
                    <span className={tc.text} style={{ fontWeight: 600 }}>{shipment.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ETA:</span>
                    <span className={tc.text}>{shipment.eta}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/tracking/${shipment.trackingNumber}`)}
                  className={`w-full border ${tc.border} hover:border-[#BAAB48] text-[#BAAB48] py-2 rounded-lg text-sm transition-colors ${tc.innerBg}`}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
