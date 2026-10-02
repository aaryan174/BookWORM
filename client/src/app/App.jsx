import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../contexts/ToastContext.jsx';
import { ThemeProvider } from '../contexts/ThemeContext.jsx';
import { AuthProvider, useAuthContext } from '../features/auth/context/AuthContext.jsx';
import { CartProvider } from '../features/cart/context/CartContext.jsx';
import { Navbar } from '../layouts/Navbar.jsx';
import { Footer } from '../layouts/Footer.jsx';

import { BookCatalogPage } from '../features/books/pages/BookCatalogPage.jsx';
import { BookDetailPage } from '../features/books/pages/BookDetailPage.jsx';
import { CartPage } from '../features/cart/pages/CartPage.jsx';
import { CheckoutPage } from '../features/checkout/pages/CheckoutPage.jsx';
import { OrderHistoryPage } from '../features/orders/pages/OrderHistoryPage.jsx';
import { LoginPage } from '../features/auth/pages/LoginPage.jsx';
import { RegisterPage } from '../features/auth/pages/RegisterPage.jsx';
import { SellerOnboardingPage } from '../features/seller/pages/SellerOnboardingPage.jsx';
import { SellerDashboardPage } from '../features/seller/pages/SellerDashboardPage.jsx';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage.jsx';

const ProtectedRoute = ({ children, requireRole }) => {
  const { isAuthenticated, loading, user } = useAuthContext();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireRole && !user?.roles?.includes(requireRole)) return <Navigate to="/" replace />;
  return children;
};

export const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<BookCatalogPage />} />
                    <Route path="/books/:id" element={<BookDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected Buyer-Only Routes */}
                    <Route path="/checkout" element={
                      <ProtectedRoute requireRole="buyer"><CheckoutPage /></ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute requireRole="buyer"><OrderHistoryPage /></ProtectedRoute>
                    } />

                  {/* Protected Seller Routes */}
                  <Route path="/seller/onboard" element={
                    <ProtectedRoute><SellerOnboardingPage /></ProtectedRoute>
                  } />
                  <Route path="/seller/dashboard" element={
                    <ProtectedRoute requireRole="seller"><SellerDashboardPage /></ProtectedRoute>
                  } />

                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute requireRole="admin"><AdminDashboardPage /></ProtectedRoute>
                  } />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </BrowserRouter>
);
};
