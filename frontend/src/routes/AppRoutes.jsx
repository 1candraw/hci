import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import PublicLayout from '../layouts/PublicLayout';
import Katalog from '../pages/katalog/Katalog';
import Dashboard from '../pages/dashboard/Dashboard';
import Saw from '../pages/saw/Saw';
import Transaksi from '../pages/transactions/Transaksi';
import AuditLog from '../pages/dashboard/AuditLog';
import MasterAlatBerat from '../pages/alatBerat/MasterAlatBerat';
import TransaksiDetail from '../pages/transactions/TransaksiDetail';

// ★ Halaman Publik (Guest Flow)
import LandingPage from '../pages/public/LandingPage';
import TrackingPage from '../pages/public/TrackingPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ── RUTE LOGIN ── */}
      <Route path="/login" element={<Login />} />

      {/* ── RUTE PUBLIK (tanpa login) ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
      </Route>

      {/* ── RUTE DASHBOARD (wajib login) ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* Rute umum semua role */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/katalog"   element={<Katalog />} />
          <Route path="/transaksi" element={<Transaksi />} />
          <Route path="/transaksi/:id" element={<TransaksiDetail />} />

          {/* Master Data: Sales & Manager */}
          <Route element={<ProtectedRoute allowedRoles={['Sales', 'Manager']} />}>
            <Route path="/master-alat-berat" element={<MasterAlatBerat />} />
          </Route>

          {/* SAW: Customer, Sales, Manager */}
          <Route element={<ProtectedRoute allowedRoles={['Customer', 'Sales', 'Manager']} />}>
            <Route path="/saw" element={<Saw />} />
          </Route>

          {/* Audit Log: Manager & Operasional */}
          <Route element={<ProtectedRoute allowedRoles={['Manager', 'Operasional']} />}>
            <Route path="/audit-log" element={<AuditLog />} />
          </Route>

        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;