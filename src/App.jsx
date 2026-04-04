import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { SimulationProvider, useSimulation } from './context/SimulationContext';

// Auth & Landing
import LandingPage from './components/LandingPage';
import AdminLogin from './components/AdminLogin';
import TermsPage from './components/TermsPage';
import AdminLayout from './components/admin/AdminLayout';
import WorkerLayout from './components/worker/WorkerLayout';
import PartnerDashboard from './components/partner/PartnerDashboard';
import PartnerLogin from './components/partner/PartnerLogin';

// Admin Modules
import IntelligencePage from './components/admin/IntelligencePage';
import ValidationPage from './components/admin/ValidationPage';
import ActuarialPage from './components/admin/ActuarialPage';
import AuditLogsPage from './components/admin/AuditLogsPage';
import ManualReviewQueue from './components/admin/ManualReviewQueue';
import AdminCRUDContainer from './components/admin/AdminCRUDContainer';

// Worker Modules
import HomeTab from './components/worker/HomeTab';
import PolicyTab from './components/worker/PolicyTab';
import ProofTab from './components/worker/ProofTab';

import './App.css';

const MainRouting = () => {
  const { userRole } = useSimulation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userRole) {
      const allowed = ['/', '/admin-login', '/partner-login'];
      if (!allowed.includes(window.location.pathname)) navigate('/');
    } else {
      // Redirect to respective portals on login
      const path = window.location.pathname;
      if (path === '/') {
        if (userRole === 'ADMIN') navigate('/admin/intelligence', { replace: true });
        if (userRole === 'WORKER') navigate('/worker/home', { replace: true });
        if (userRole === 'PARTNER') navigate('/partner/dashboard', { replace: true });
      }
    }
  }, [userRole, navigate]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/partner-login" element={<PartnerLogin />} />
      
      {/* 🏢 Admin High-Fidelity Portal (Midnight) */}
      <Route path="/admin" element={userRole === 'ADMIN' ? <AdminLayout /> : <Navigate to="/" />}>
         <Route path="intelligence" element={<IntelligencePage />} />
         <Route path="validation" element={<ValidationPage />} />
         <Route path="actuarial" element={<ActuarialPage />} />
         <Route path="management" element={<AdminCRUDContainer />} />
         <Route path="manual-review" element={<ManualReviewQueue />} />
         <Route path="audit" element={<AuditLogsPage />} />
      </Route>

      {/* 📱 Worker Logistics App (Midnight Full Screen) */}
      <Route path="/worker" element={userRole === 'WORKER' ? <WorkerLayout /> : <Navigate to="/" />}>
         <Route path="home" element={<HomeTab />} />
         <Route path="policy" element={<PolicyTab />} />
         <Route path="proof" element={<ProofTab />} />
      </Route>

      {/* 🏭 Partner Platform Portal (Midnight) */}
      <Route path="/partner/dashboard" element={userRole === 'PARTNER' ? <PartnerDashboard /> : <Navigate to="/" />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

import { NotificationProvider } from './components/shared/NotificationSystem';
import { SocketProvider } from './context/SocketContext';
import MobileToast from './components/shared/MobileToast';

import GigBot from './components/shared/GigBot';

function App() {
  const demoUserId = "60d21b4667d0d8992e610c85";
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return sessionStorage.getItem('earnsure_terms_accepted') === 'true';
  });
  const [goToAdminLogin, setGoToAdminLogin] = useState(false);

  const handleAccept = () => {
    sessionStorage.setItem('earnsure_terms_accepted', 'true');
    setTermsAccepted(true);
  };

  const handleDecline = () => {
    // Stay on terms page, don't proceed
    alert('You must accept the Terms & Conditions to use EarnSure.');
  };

  // Admin and Partner login pages bypass T&C (they have their own auth)
  const bypassRoutes = ['/admin-login', '/partner-login'];
  const isAuthRoute = bypassRoutes.includes(window.location.pathname);

  if (!termsAccepted && !isAuthRoute) {
    return (
      <TermsPage
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    );
  }

  return (
    <NotificationProvider>
      <SimulationProvider>
        <SocketProvider userId={demoUserId}>
          <div className="app-container midnight-logistics">
            <div className="glow-spot glow-orange"></div>
            <div className="glow-spot glow-cyan"></div>
            <div className="glow-spot glow-violet"></div>
            <MobileToast />
            <MainRouting />
            <GigBot />
          </div>
        </SocketProvider>
      </SimulationProvider>
    </NotificationProvider>
  );
}


export default App;

