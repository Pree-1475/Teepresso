import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/common/styles/globals.css';
import { Sidebar } from '@/common/components/layout/Sidebar';
import { Topbar } from '@/common/components/layout/Topbar';

import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { OfflineOrdersPage } from '@/features/orders/OfflineOrdersPage';
import { MockupsQueuePage } from '@/features/mockups/MockupsQueuePage';
import { ProductsAdminPage } from '@/features/products/ProductsAdminPage';
import { CustomersAdminPage } from '@/features/customers/CustomersAdminPage';
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import { DispatchPage } from '@/features/fulfillment/DispatchPage';
import { AttendancePage } from '@/features/attendance/AttendancePage';
import { ReportsPage } from '@/features/reports/ReportsPage';

export function App() {
  // Check if session is stored in localStorage
  const storedUser = localStorage.getItem('teepresso_user');
  const [user, setUser] = useState<{ role: string; name: string } | null>(
    storedUser ? JSON.parse(storedUser) : null
  );

  const handleLogin = (role: 'admin' | 'manager' | 'editing_team' | 'dispatch_team', name: string) => {
    const sessionUser = { role, name };
    localStorage.setItem('teepresso_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('teepresso_user');
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="admin-layout">
        <Sidebar onLogout={handleLogout} />
        <div className="admin-main-content">
          <Topbar />
          <Routes>
            {/* Common overview page */}
            <Route path="/" element={<DashboardPage />} />
            
            {/* Orders pipeline */}
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/offline-orders" element={<OfflineOrdersPage />} />
            
            {/* Mockups and assets */}
            <Route path="/mockups" element={<MockupsQueuePage />} />
            
            {/* Product catalog and customer administration */}
            <Route path="/products" element={<ProductsAdminPage />} />
            <Route path="/customers" element={<CustomersAdminPage />} />
            
            {/* Operations sub-consoles */}
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/dispatch" element={<DispatchPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            
            {/* Analytics & financials */}
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
