import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// 1. Tambahkan parameter allowedRoles di sini
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // Jika sistem masih mengecek localStorage, tampilkan loading sementara
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</div>;
  }

  // Jika tidak ada user (belum login), lempar paksa ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. TAMBAHAN BARU: Pengecekan Hak Akses (Role)
  // Jika rute meminta role tertentu, dan role user tidak ada di dalam daftar itu
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    alert("Akses Ditolak: Anda tidak memiliki hak akses ke halaman ini.");
    return <Navigate to="/dashboard" replace />; // Lempar kembali ke dashboard
  }

  // Jika aman, persilakan masuk ke halaman yang dituju
  return <Outlet />;
};

export default ProtectedRoute;