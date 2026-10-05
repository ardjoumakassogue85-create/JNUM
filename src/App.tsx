import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { ProgrammePage } from './pages/ProgrammePage';
import { IntervenantsPage } from './pages/IntervenantsPage';
import { InscriptionPage } from './pages/InscriptionPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { PublicBadgePage } from './pages/PublicBadgePage';
import { VerifyPage } from './pages/VerifyPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminScannerPage } from './pages/admin/AdminScannerPage';
import { AdminSessionsPage } from './pages/admin/AdminSessionsPage';
import { LegalPage } from './pages/LegalPage';

// Helper component to scroll to top on page change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Layout wrapper conditionally displaying Navbar and Footer
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminOrScanner = location.pathname.startsWith('/admin') || location.pathname.startsWith('/verify');

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7] text-neutral-900 font-sans selection:bg-[#075B22] selection:text-white">
      {!isAdminOrScanner && <Navbar />}
      <div className="flex-1">{children}</div>
      {!isAdminOrScanner && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppLayout>
        <Routes>
          {/* Public Visitor Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/programme" element={<ProgrammePage />} />
          <Route path="/intervenants" element={<IntervenantsPage />} />
          <Route path="/inscription" element={<InscriptionPage />} />
          <Route path="/confirmation/:id" element={<ConfirmationPage />} />
          <Route path="/badge/:id" element={<PublicBadgePage />} />
          <Route path="/verify/:id" element={<VerifyPage />} />

          {/* Legal and Privacy */}
          <Route path="/mentions-legales" element={<LegalPage />} />
          <Route path="/confidentialite" element={<LegalPage />} />

          {/* Administration & Day-of QR Scanning */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/scan" element={<AdminScannerPage />} />
          <Route path="/admin/sessions" element={<AdminSessionsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
