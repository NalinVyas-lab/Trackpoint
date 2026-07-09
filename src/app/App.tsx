import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './contexts/ThemeContext';
import { Dashboard } from './components/Dashboard';
import { ShipmentTracking } from './components/ShipmentTracking';
import { ShipmentList } from './components/ShipmentList';
import { AccountsReceivable } from './components/AccountsReceivable';
import { InvoicePackage } from './components/InvoicePackage';
import { TrackInvoice } from './components/TrackInvoice';

/* MARKER-MAKE-KIT-INVOKED */

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/track-invoice" element={<TrackInvoice />} />
          <Route path="/tracking" element={<ShipmentList />} />
          <Route path="/tracking/:trackingNumber" element={<ShipmentTracking />} />
          <Route path="/accounts-receivable" element={<AccountsReceivable />} />
          <Route path="/invoice/:shipmentId" element={<InvoicePackage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
