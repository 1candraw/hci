import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    // Membungkus seluruh aplikasi dengan sistem navigasi
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;