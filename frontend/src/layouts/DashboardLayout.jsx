import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/layout/Sidebar';

const DashboardLayout = () => {
  return (
    <div style={styles.container}>
      {/* Sidebar di kiri */}
      <Sidebar />
      
      {/* Area kanan (Navbar + Konten) */}
      <div style={styles.mainArea}>
        <Navbar />
        
        {/* Outlet adalah area tempat konten halaman (Dashboard, Katalog, dll) akan dirender */}
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' },
  mainArea: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' },
  content: { flex: 1, padding: '2rem', overflowY: 'auto' }
};

export default DashboardLayout;