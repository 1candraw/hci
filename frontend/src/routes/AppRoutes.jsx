import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import Katalog from '../pages/katalog/Katalog';
import Dashboard from '../pages/dashboard/Dashboard';
import Saw from '../pages/saw/Saw';
import Transaksi from '../pages/transactions/Transaksi';
import AuditLog from '../pages/dashboard/AuditLog';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* LAPIS 1: Pastikan user sudah login (berlaku untuk semua rute di dalamnya) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          
          {/* RUTE UMUM: Bisa diakses oleh SEMUA role yang sudah login */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/katalog" element={<Katalog />} />
          <Route path="/transaksi" element={<Transaksi />} />
          
          {/* LAPIS 2: RUTE KHUSUS (Pembatasan berdasarkan Hak Akses/Role) */}
          
          {/* Fitur SAW: Biasanya difokuskan untuk Customer, Sales, dan Manager */}
          <Route element={<ProtectedRoute allowedRoles={['Customer', 'Sales', 'Manager']} />}>
            <Route path="/saw" element={<Saw />} />
          </Route>

          {/* Fitur Audit Log: SANGAT RAHASIA, hanya untuk Manager dan Operasional */}
          <Route element={<ProtectedRoute allowedRoles={['Manager', 'Operasional']} />}>
            <Route path="/audit-log" element={<AuditLog />} />
          </Route>
          
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;