import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login, Register } from './pages/Auth';
import { ProductBrowser } from './pages/ProductBrowser';
import { QuotationFlow } from './pages/QuotationFlow';
import { AdminPanel } from './pages/AdminPanel';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/seller'} replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/products" element={
            <ProtectedRoute>
              <ProductBrowser />
            </ProtectedRoute>
          } />
          <Route path="/seller" element={
            <ProtectedRoute requiredRole="seller">
              <QuotationFlow />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to={user?.role === 'admin' ? '/admin' : '/seller'} replace />} />
        </>
      )}
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
