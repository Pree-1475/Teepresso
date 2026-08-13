import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/common/styles/globals.css';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { Header } from '@/common/components/layout/Header/Header';
import { Footer } from '@/common/components/layout/Footer/Footer';
import { AnnouncementBar } from '@/common/components/layout/AnnouncementBar/AnnouncementBar';

import HomePage from '@/features/home/HomePage';
import DesignPage from '@/features/order-flow/DesignPage';
import ProductsPage from '@/features/catalog/ProductsPage';
import CustomKurtasPage from '@/features/catalog/CustomKurtasPage';
import BulkOrdersPage from '@/features/order-flow/BulkOrdersPage';
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
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AnnouncementBar />
          <Header />
          <main style={{ flex: '1' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/design" element={<DesignPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/custom-kurtas" element={<CustomKurtasPage />} />
              <Route path="/bulk-orders" element={<BulkOrdersPage />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
