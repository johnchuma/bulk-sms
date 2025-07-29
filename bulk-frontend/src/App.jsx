import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClients from './pages/admin/AdminClients';
import AdminTransactions from './pages/admin/AdminTransactions';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientContacts from './pages/client/ClientContacts';
import ClientSMS from './pages/client/ClientSMS';

// Layout
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="clients" element={<AdminClients />} />
                      <Route path="transactions" element={<AdminTransactions />} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Client Routes */}
            <Route
              path="/client/*"
              element={
                <ProtectedRoute allowedRoles={['client', 'client_user']}>
                  <ClientLayout>
                    <Routes>
                      <Route path="dashboard" element={<ClientDashboard />} />
                      <Route path="contacts" element={<ClientContacts />} />
                      <Route path="sms" element={<ClientSMS />} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </ClientLayout>
                </ProtectedRoute>
              }
            />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
