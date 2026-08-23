import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/common/styles/globals.css';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { CartProvider } from '@/features/cart/context/CartContext';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { Header } from '@/common/components/layout/Header/Header';
import { Footer } from '@/common/components/layout/Footer/Footer';
import { AnnouncementBar } from '@/common/components/layout/AnnouncementBar/AnnouncementBar';

import HomePage from '@/features/home/HomePage';
import ProductPage from '@/features/catalog/ProductPage';
import ProductsPage from '@/features/catalog/ProductsPage';
import FestivePage from '@/features/catalog/FestivePage';
import CheckoutPage from '@/features/checkout/CheckoutPage';
import IndustriesPage from '@/features/catalog/IndustriesPage';
import HowItWorksPage from '@/features/support/HowItWorksPage';
import FabricGuidePage from '@/features/catalog/FabricGuidePage';
import FAQPage from '@/features/support/FAQPage';
import TrackOrderPage from '@/features/tracking/TrackOrderPage';
import ApproveMockupPage from '@/features/tracking/ApproveMockupPage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AnnouncementBar />
            <Header />
            <CartDrawer />
            <main style={{ flex: '1' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/festive" element={<FestivePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/industries" element={<IndustriesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/fabric-guide" element={<FabricGuidePage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
              <Route path="/approve-mockup" element={<ApproveMockupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
