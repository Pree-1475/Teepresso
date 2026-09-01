import { SettingsPage } from '@/features/settings/SettingsPage';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import '@/common/styles/globals.css';
import { Sidebar } from '@/common/components/layout/Sidebar';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { OfflineOrdersPage } from '@/features/orders/OfflineOrdersPage';
import { MockupsQueuePage } from '@/features/mockups/MockupsQueuePage';
import { ProductsAdminPage } from '@/features/products/ProductsAdminPage';
import { AddEditProductPage } from '@/features/products/AddEditProductPage';
import { StockOverviewPage } from '@/features/products/StockOverviewPage';
import { CustomersAdminPage } from '@/features/customers/CustomersAdminPage';
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import { DispatchPage } from '@/features/fulfillment/DispatchPage';
import { AttendancePage } from '@/features/attendance/AttendancePage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { UsersPage } from '@/features/auth/UsersPage';
import { CategoriesSnippetPage } from '@/features/snippets/CategoriesSnippetPage';
import { ColorsSnippetPage } from '@/features/snippets/ColorsSnippetPage';
import { SizesSnippetPage } from '@/features/snippets/SizesSnippetPage';
import { PatternsSnippetPage } from '@/features/snippets/PatternsSnippetPage';
import { SnippetsDashboardPage } from '@/features/snippets/SnippetsDashboardPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition-wrapper">
      <Routes location={location}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/offline-orders" element={<OfflineOrdersPage />} />
        <Route path="/mockups" element={<MockupsQueuePage />} />
        <Route path="/products" element={<ProductsAdminPage />} />
        <Route path="/products/add" element={<AddEditProductPage />} />
        <Route path="/products/edit/:id" element={<AddEditProductPage />} />
        <Route path="/stock-overview" element={<StockOverviewPage />} />
        <Route path="/snippets" element={<SnippetsDashboardPage />} />
        <Route path="/snippets/categories" element={<CategoriesSnippetPage />} />
        <Route path="/snippets/colors" element={<ColorsSnippetPage />} />
        <Route path="/snippets/sizes" element={<SizesSnippetPage />} />
        <Route path="/snippets/patterns" element={<PatternsSnippetPage />} />
        <Route path="/customers" element={<CustomersAdminPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </div>
  );
}

export function App() {
  const storedUser = localStorage.getItem('teepresso_user');
  const [user, setUser] = useState<{ role: string; name: string } | null>(
    storedUser ? JSON.parse(storedUser) : null
  );

  const handleLogin = (role: 'admin' | 'manager' | 'editor', name: string, email: string) => {
    const sessionUser = { role, name, email };
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
      <div className="erp-shell" style={{ flexDirection: 'row' }}>
        {/* Wagtail-style Left Sidebar */}
        <Sidebar onLogout={handleLogout} />

        {/* Main Column */}
        <div className="erp-main-col" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <main className="erp-workspace" style={{ flex: 1, overflowY: 'auto' }}>
            <AnimatedRoutes />
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
