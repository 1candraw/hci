import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Jika sistem masih mengecek localStorage, tampilkan loading sementara
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</div>;
  }

  // Jika tidak ada user (belum login), lempar paksa ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada user (sudah login), persilakan masuk ke halaman yang dituju
  return <Outlet />;
};

export default ProtectedRoute;