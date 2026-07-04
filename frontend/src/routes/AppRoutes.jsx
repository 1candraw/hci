import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import Katalog from '../pages/katalog/Katalog';
import Dashboard from '../pages/dashboard/Dashboard';
import Saw from '../pages/saw/Saw';
import Transaksi from '../pages/transactions/Transaksi';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Semua rute di bawah ini akan dilindungi dan menggunakan bentuk DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          
          {/* Halaman Dashboard (Root) */}
         <Route path="/" element={<Dashboard />} />
          
          {/* Rute dummy untuk halaman lain agar Sidebar bisa diklik */}
          <Route path="/katalog" element={<Katalog />} />
          <Route path="/saw" element={<Saw />} />
          <Route path="/transaksi" element={<Transaksi />} />
          
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;