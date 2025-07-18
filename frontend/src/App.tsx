import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { RoomPage } from './pages/RoomPage';
import { AdminPage } from './pages/AdminPage';
import AdminLogin from './components/Admin/AdminLogin';
import AdminRegister from './components/Admin/AdminRegister';
import ForgotPassword from './components/Admin/ForgotPassword';
import ResetPassword from './components/Admin/ResetPassword';
import { ProtectedRoute } from './components/Common/ProtectedRoute';
import ManualScanQRCode from './components/Booking/ManualScanQRCode';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:id" element={<RoomPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/manual-scan" element={<ManualScanQRCode />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;