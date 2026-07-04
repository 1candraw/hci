import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

// Membuat Context
export const AuthContext = createContext();

// Membuat Provider (Bungkus utama)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mengecek apakah user sudah pernah login sebelumnya saat web di-refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Fungsi Login
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    
    if (data.success) {
      // Simpan ke brankas browser (localStorage)
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      // Update gudang state
      setUser(data.data.user);
    }
    return data;
  };

  // Fungsi Logout
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};