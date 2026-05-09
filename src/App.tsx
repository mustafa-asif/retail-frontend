/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/sonner';

import LoginPage from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import SalesPage from './pages/Sales';
import NewSalePage from './pages/NewSale';
import InventoryPage from './pages/Inventory';
import CustomersPage from './pages/Customers';
import ProductsPage from './pages/Products';
import AuditPage from './pages/Audit';
import SaleDetailsPage from './pages/SaleDetails';
import CustomerDetailsPage from './pages/CustomerDetails';
import AdminPage from './pages/Admin';
import FragmentationPage from './pages/Fragmentation';
import StoresPage from './pages/Stores';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="sales/new" element={<NewSalePage />} />
            <Route path="sales/:id" element={<SaleDetailsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerDetailsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="stores" element={<StoresPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="fragmentation" element={<FragmentationPage />} />
            {/* Add other routes here as they are created */}
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
