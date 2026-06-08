import { X, Download, Eye, FileText, CheckCircle } from 'lucide-react';
import { useTC } from '../contexts/ThemeContext';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: 'verified' | 'pending' | 'flagged';
}

interface Milestone {
  id: string;
  date: string;
  time: string;
  location: string;
  status: 'completed' | 'current' | 'pending';
  type: 'checkpoint' | 'customs' | 'carrier' | 'authorization';
  description: string;
  duties?: string;
  invoices?: number;
  carrier?: string;
  documents?: number;
}

interface MilestoneModalProps {
  milestone: Milestone;
  onClose: () => void;
}

const mockDocuments: Document[] = [
  { id: '1', name: 'Commercial Invoice - CI-2026-001847', type: 'PDF', size: '2.4 MB', uploadedAt: '2026-06-04 06:20', status: 'verified' },
  { id: '2', name: 'Customs Declaration Form', type: 'PDF', size: '1.8 MB', uploadedAt: '2026-06-04 06:22', status: 'verified' },
  { id: '3', name: 'Duty Payment Receipt', type: 'PDF', size: '856 KB', uploadedAt: '2026-06-04 06:25', status: 'verified' },
  { id: '4', name: 'Insurance Certificate', type: 'PDF', size: '1.2 MB', uploadedAt: '2026-06-04 06:28', status: 'verified' },
  { id: '5', name: 'Authorization Certificate - Gold Bars', type: 'PDF', size: '3.1 MB', uploadedAt: '2026-06-04 06:30', status: 'verified' },
  { id: '6', name: 'Bill of Lading - LH8234', type: 'PDF', size: '1.5 MB', uploadedAt: '2026-06-04 06:32', status: 'verified' },
  { id: '7', name: 'Security Seal Verification', type: 'PDF', size: '2.8 MB', uploadedAt: '2026-06-04 06:35', status: 'verified' },
  { id: '8', name: 'Chain of Custody Documentation', type: 'PDF', size: '1.9 MB', uploadedAt: '2026-06-04 06:38', status: 'verified' },
];

const extractedData = {
  'Invoice Number': 'CI-2026-001847',
  'Invoice Date': 'June 2, 2026',
  'Invoice Amount': '$2,450,000.00',
  'Customs Duties': '$18,450.00',
  'Processing Fees': '$1,200.00',
  'Total Payable': '$2,469,650.00',
  'Cargo Description': 'Gold Bars (999.9 Fine)',
  'Total Weight': '125.5 kg',
  'Pieces': '42 units',
  'Container': 'Secure Vault Container #SVC-8847',
  'Seal Number': 'MLCA-2026-SEAL-001847',
};

export function MilestoneModal({ milestone, onClose }: MilestoneModalProps) {
  const tc = useTC();

  const docStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'verified': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':  return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'flagged':  return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 md:p-8" onClick={onClose}>
      <div
        className={`${tc.cardBg} border ${tc.border} rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 md:p-6 border-b ${tc.border} flex items-start justify-between`}>
          <div className="flex-1">
            <h2 style={{ fontSize: '16px', fontWeight: 600 }} className="mb-1">{milestone.description}</h2>
            <div className={`flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs md:text-sm ${tc.subtext}`}>
              <span>{milestone.date} at {milestone.time}</span>
              <span className="hidden md:inline">·</span>
              <span className="truncate">{milestone.location}</span>
            </div>
          </div>
          <button onClick={onClose} className={`${tc.subtext} hover:${tc.isDark ? 'text-[#e5e5e5]' : 'text-[#1a1a1a]'} transition-colors flex-shrink-0 ml-4`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* OCR Data */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }} className="mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#BAAB48]" />
                OCR Extracted Information
              </h3>
              <div className={`${tc.innerBg} border ${tc.border} rounded-lg p-4 space-y-2.5`}>
                {Object.entries(extractedData).map(([key, value]) => (
                  <div key={key} className={`flex justify-between items-center pb-2.5 border-b ${tc.border} last:border-0 last:pb-0`}>
                    <span className={`text-sm ${tc.subtext}`}>{key}</span>
                    <span className="text-sm" style={{ fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
              {milestone.duties && (
                <div className="mt-4 bg-[#BAAB48]/10 border border-[#BAAB48]/30 rounded-lg p-4 flex items-center justify-between">
                  <span className={`text-sm ${tc.subtext}`}>Customs Duties Paid</span>
                  <span className="text-[#BAAB48]" style={{ fontSize: '16px', fontWeight: 600 }}>{milestone.duties}</span>
                </div>
              )}
            </div>

            {/* Documents */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }} className="mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#BAAB48]" />
                Documents ({mockDocuments.length})
              </h3>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {mockDocuments.map(doc => (
                  <div key={doc.id} className={`${tc.innerBg} border ${tc.border} rounded-lg p-3 ${tc.hoverBg} transition-colors`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs mb-1 truncate" style={{ fontWeight: 500 }}>{doc.name}</div>
                        <div className={`flex items-center gap-2 text-[10px] ${tc.subtext}`}>
                          <span>{doc.type}</span><span>·</span><span>{doc.size}</span><span>·</span><span>{doc.uploadedAt}</span>
                        </div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] border flex items-center gap-0.5 flex-shrink-0 ${docStatusColor(doc.status)}`}>
                        <CheckCircle className="w-2.5 h-2.5" />{doc.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-[#BAAB48] hover:bg-[#a89940] text-[#1a1a1a] px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1.5 transition-colors">
                        <Eye className="w-3 h-3" />View
                      </button>
                      <button className={`flex-1 px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1.5 transition-colors ${tc.secondaryBtn}`}>
                        <Download className="w-3 h-3" />Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 md:p-5 border-t ${tc.border} flex flex-col sm:flex-row justify-end gap-2`}>
          <button onClick={onClose} className={`px-5 py-2 rounded-lg transition-colors text-sm ${tc.secondaryBtn}`}>Close</button>
          <button className="px-5 py-2 bg-[#BAAB48] hover:bg-[#a89940] text-[#1a1a1a] rounded-lg transition-colors flex items-center justify-center gap-2 text-sm" style={{ fontWeight: 600 }}>
            <Download className="w-4 h-4" />Download All Documents
          </button>
        </div>
      </div>
    </div>
  );
}
