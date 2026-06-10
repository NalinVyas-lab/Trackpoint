import { useState } from 'react';
import { X, Download, Eye, FileText, CheckCircle, ShieldCheck, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';
import { useTC } from '../contexts/ThemeContext';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  initialStatus: 'verified' | 'pending' | 'flagged';
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
  { id: '1', name: 'Commercial Invoice - CI-2026-001847', type: 'PDF', size: '2.4 MB', uploadedAt: '2026-06-04 06:20', initialStatus: 'pending' },
  { id: '2', name: 'Customs Declaration Form', type: 'PDF', size: '1.8 MB', uploadedAt: '2026-06-04 06:22', initialStatus: 'pending' },
  { id: '3', name: 'Duty Payment Receipt', type: 'PDF', size: '856 KB', uploadedAt: '2026-06-04 06:25', initialStatus: 'pending' },
  { id: '4', name: 'Insurance Certificate', type: 'PDF', size: '1.2 MB', uploadedAt: '2026-06-04 06:28', initialStatus: 'pending' },
  { id: '5', name: 'Authorization Certificate - Gold Bars', type: 'PDF', size: '3.1 MB', uploadedAt: '2026-06-04 06:30', initialStatus: 'pending' },
  { id: '6', name: 'Bill of Lading - LH8234', type: 'PDF', size: '1.5 MB', uploadedAt: '2026-06-04 06:32', initialStatus: 'pending' },
  { id: '7', name: 'Security Seal Verification', type: 'PDF', size: '2.8 MB', uploadedAt: '2026-06-04 06:35', initialStatus: 'flagged' },
  { id: '8', name: 'Chain of Custody Documentation', type: 'PDF', size: '1.9 MB', uploadedAt: '2026-06-04 06:38', initialStatus: 'pending' },
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

type DocStatus = 'pending' | 'confirming' | 'verified' | 'flagged';

export function MilestoneModal({ milestone, onClose }: MilestoneModalProps) {
  const tc = useTC();
  const ACCENT = tc.accent;

  // Per-document verification state
  const [docStatus, setDocStatus] = useState<Record<string, DocStatus>>(() =>
    Object.fromEntries(mockDocuments.map(d => [d.id, d.initialStatus as DocStatus]))
  );
  const [verifiedAt, setVerifiedAt] = useState<Record<string, string>>({});

  const startVerify = (id: string) =>
    setDocStatus(s => ({ ...s, [id]: 'confirming' }));

  const cancelVerify = (id: string) =>
    setDocStatus(s => ({ ...s, [id]: mockDocuments.find(d => d.id === id)?.initialStatus ?? 'pending' }));

  const confirmVerify = (id: string) => {
    const now = new Date();
    const ts = now.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
    setDocStatus(s => ({ ...s, [id]: 'verified' }));
    setVerifiedAt(v => ({ ...v, [id]: ts }));
  };

  const verifiedCount = Object.values(docStatus).filter(s => s === 'verified').length;
  const totalDocs = mockDocuments.length;
  const allVerified = verifiedCount === totalDocs;

  const statusMeta: Record<DocStatus, { label: string; icon: React.ElementType; pill: string; iconColor: string }> = {
    verified: { label: 'Verified', icon: ShieldCheck, pill: 'bg-green-500/15 text-green-400 border-green-500/30', iconColor: '#22c55e' },
    pending:  { label: 'Pending', icon: Clock, pill: 'bg-orange-500/15 text-orange-400 border-orange-500/30', iconColor: '#f97316' },
    flagged:  { label: 'Flagged', icon: ShieldAlert, pill: 'bg-red-500/15 text-red-400 border-red-500/30', iconColor: '#ef4444' },
    confirming: { label: 'Confirming…', icon: Clock, pill: '', iconColor: ACCENT },
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 md:p-8" onClick={onClose}>
      <div
        className={`${tc.cardBg} border ${tc.border} rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={e => e.stopPropagation()}
        style={{ borderTop: `2px solid ${ACCENT}` }}
      >
        {/* Header */}
        <div className={`p-4 md:p-6 border-b ${tc.border} flex items-start justify-between`}
          style={{ background: tc.isDark ? 'rgba(186,171,72,0.05)' : 'rgba(186,171,72,0.04)' }}
        >
          <div className="flex-1">
            <h2 style={{ fontSize: '16px', fontWeight: 600 }} className="mb-1">{milestone.description}</h2>
            <div className={`flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs md:text-sm ${tc.subtext}`}>
              <span>{milestone.date} at {milestone.time}</span>
              <span className="hidden md:inline">·</span>
              <span className="truncate">{milestone.location}</span>
            </div>
          </div>
          {/* Verification progress badge */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: allVerified ? 'rgba(34,197,94,0.12)' : tc.accentFaint,
                border: `1px solid ${allVerified ? 'rgba(34,197,94,0.3)' : tc.accentBorder}`,
              }}
            >
              {allVerified
                ? <ShieldCheck size={13} color="#22c55e" />
                : <ShieldAlert size={13} color={ACCENT} />
              }
              <span style={{ fontSize: '11px', fontWeight: 600, color: allVerified ? '#22c55e' : ACCENT }}>
                {verifiedCount}/{totalDocs} Verified
              </span>
            </div>
            <button onClick={onClose} className={`${tc.subtext} transition-colors flex-shrink-0`}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* OCR Data */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }} className="mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: ACCENT }} />
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
                <div className="mt-4 rounded-lg p-4 flex items-center justify-between" style={{ background: tc.accentFaint, border: `1px solid ${tc.accentBorder}` }}>
                  <span className={`text-sm ${tc.subtext}`}>Customs Duties Paid</span>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: ACCENT }}>{milestone.duties}</span>
                </div>
              )}

              {/* Verification progress bar */}
              <div className={`mt-4 ${tc.innerBg} border ${tc.border} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Document Verification</span>
                  <span style={{ fontSize: '11px', color: ACCENT, fontWeight: 600 }}>{verifiedCount}/{totalDocs}</span>
                </div>
                <div className={`rounded-full h-2 overflow-hidden ${tc.isDark ? 'bg-[#1a2535]' : 'bg-[#e8f0f8]'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(verifiedCount / totalDocs) * 100}%`, background: allVerified ? '#22c55e' : ACCENT }}
                  />
                </div>
                <div className={`text-xs mt-1.5 ${tc.subtext}`}>
                  {allVerified
                    ? '✓ All documents verified — package cleared'
                    : `${totalDocs - verifiedCount} document${totalDocs - verifiedCount !== 1 ? 's' : ''} awaiting verification`
                  }
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }} className="mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: ACCENT }} />
                Documents ({totalDocs})
              </h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5">
                {mockDocuments.map(doc => {
                  const status = docStatus[doc.id];
                  const meta = statusMeta[status];
                  const Icon = meta.icon;
                  const isConfirming = status === 'confirming';
                  const isVerified = status === 'verified';
                  const isFlagged = status === 'flagged';

                  return (
                    <div
                      key={doc.id}
                      className={`border rounded-lg transition-all overflow-hidden`}
                      style={{
                        background: isVerified
                          ? tc.isDark ? 'rgba(34,197,94,0.05)' : 'rgba(34,197,94,0.04)'
                          : isConfirming
                          ? tc.isDark ? 'rgba(186,171,72,0.07)' : 'rgba(186,171,72,0.05)'
                          : tc.isDark ? '#1a2028' : '#f8fafc',
                        borderColor: isVerified
                          ? 'rgba(34,197,94,0.25)'
                          : isConfirming
                          ? 'rgba(186,171,72,0.4)'
                          : isFlagged
                          ? 'rgba(239,68,68,0.3)'
                          : tc.isDark ? '#283548' : '#d8e4f0',
                      }}
                    >
                      {/* Main row */}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs mb-1 truncate" style={{ fontWeight: 500 }}>{doc.name}</div>
                            <div className={`flex items-center gap-2 text-[10px] ${tc.subtext}`}>
                              <span>{doc.type}</span><span>·</span><span>{doc.size}</span><span>·</span><span>{doc.uploadedAt}</span>
                            </div>
                            {isVerified && verifiedAt[doc.id] && (
                              <div className="text-[10px] text-green-400 mt-0.5" style={{ fontWeight: 500 }}>
                                Verified at {verifiedAt[doc.id]}
                              </div>
                            )}
                          </div>
                          {/* Status badge */}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] border flex items-center gap-1 flex-shrink-0 ${meta.pill}`}
                          >
                            <Icon size={9} />
                            {meta.label}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-1.5">
                          <button
                            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors"
                            style={{ background: ACCENT, color: tc.isDark ? '#0B2B26' : '#DAF1DE', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                          >
                            <Eye size={11} /> View
                          </button>
                          <button
                            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors"
                            style={{
                              background: tc.isDark ? '#1a2535' : '#f0f4f8',
                              border: `1px solid ${tc.isDark ? '#283548' : '#d0dae6'}`,
                              color: tc.isDark ? '#8aa0b8' : '#4a6070',
                              cursor: 'pointer',
                            }}
                          >
                            <Download size={11} /> Download
                          </button>

                          {/* Verify button — only when not yet verified */}
                          {!isVerified && !isConfirming && (
                            <button
                              onClick={() => startVerify(doc.id)}
                              className="ml-auto flex items-center justify-center gap-1 px-2.5 py-1.5 rounded text-xs transition-all"
                              style={{
                                background: isFlagged ? 'rgba(239,68,68,0.12)' : tc.accentFaint,
                                border: `1px solid ${isFlagged ? 'rgba(239,68,68,0.35)' : tc.accentBorder}`,
                                color: isFlagged ? '#ef4444' : ACCENT,
                                cursor: 'pointer',
                                fontWeight: 500,
                              }}
                            >
                              <ShieldCheck size={11} />
                              {isFlagged ? 'Override & Verify' : 'Verify'}
                            </button>
                          )}

                          {/* Verified checkmark */}
                          {isVerified && (
                            <div
                              className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded text-xs"
                              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
                            >
                              <CheckCircle size={11} /> Document Verified
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Confirmation panel — slides in */}
                      {isConfirming && (
                        <div
                          className="px-3 pb-3"
                          style={{ borderTop: `1px solid rgba(186,171,72,0.25)` }}
                        >
                          <div
                            className="rounded-lg p-3 mt-2"
                            style={{ background: tc.isDark ? 'rgba(186,171,72,0.08)' : 'rgba(186,171,72,0.06)', border: '1px solid rgba(186,171,72,0.2)' }}
                          >
                            <div className="flex items-start gap-2 mb-3">
                              <AlertTriangle size={13} color={ACCENT} style={{ flexShrink: 0, marginTop: '1px' }} />
                              <div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: ACCENT, marginBottom: '2px' }}>
                                  Confirm Document Verification
                                </div>
                                <div style={{ fontSize: '10px', color: tc.isDark ? '#6a8090' : '#6a7a88', lineHeight: 1.4 }}>
                                  By verifying, you confirm that <strong style={{ color: tc.isDark ? '#c0cdd8' : '#1a2a38' }}>{doc.name}</strong> has been reviewed and is authentic. This action will be logged.
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => cancelVerify(doc.id)}
                                style={{ flex: 1, padding: '6px', background: tc.isDark ? '#1a2535' : '#f0f4f8', border: `1px solid ${tc.isDark ? '#283548' : '#d0dae6'}`, color: tc.isDark ? '#8aa0b8' : '#4a6070', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => confirmVerify(doc.id)}
                                style={{ flex: 2, padding: '6px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                              >
                                <ShieldCheck size={12} /> Confirm & Mark Verified
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 md:p-5 border-t ${tc.border} flex flex-col sm:flex-row items-center justify-between gap-3`}>
          <div className="flex items-center gap-2">
            {allVerified ? (
              <div className="flex items-center gap-1.5 text-green-400" style={{ fontSize: '12px', fontWeight: 600 }}>
                <ShieldCheck size={15} /> All documents verified
              </div>
            ) : (
              <div className={`text-xs ${tc.subtext}`}>
                <span style={{ color: ACCENT, fontWeight: 600 }}>{verifiedCount}</span> of {totalDocs} documents verified
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className={`px-5 py-2 rounded-lg transition-colors text-sm ${tc.secondaryBtn}`}>Close</button>
            <button
              className="px-5 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              style={{ background: ACCENT, color: tc.isDark ? '#0B2B26' : '#DAF1DE', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: allVerified ? 1 : 0.5 }}
            >
              <Download size={15} /> Download All Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
