import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ExchangeRateProvider } from './contexts/ExchangeRateContext';

// Layout components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Auth components
import Login from './pages/Login';
import PrivateRoute from './utils/PrivateRoute';

// Page components
import Dashboard from './components/layout/Dashboard';
import CustomerList from './components/crm/CustomerList';
import CustomerForm from './components/crm/CustomerForm';
import ProductList from './components/inventory/ProductList';
import ProductForm from './components/inventory/ProductForm';
import QuotationList from './components/quotations/QuotationList';
import QuotationForm from './components/quotations/QuotationForm';
import InvoiceList from './components/invoices/InvoiceList';
import InvoiceForm from './components/invoices/InvoiceForm';
import POList from './components/po/POList';
import POForm from './components/po/POForm';
import TrashAlert from './components/trash/TrashAlert';

// Protected route wrapper
const ProtectedRoute = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;

const AppLayout = ({ children }) => {
  return (
    <ExchangeRateProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>
        <TrashAlert />
      </div>
    </ExchangeRateProvider>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Redirect root to dashboard (which is protected) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Customers */}
      <Route path="/customers" element={<ProtectedRoute><AppLayout><CustomerList /></AppLayout></ProtectedRoute>} />
      <Route path="/customers/add" element={<ProtectedRoute><AppLayout><CustomerForm /></AppLayout></ProtectedRoute>} />
      <Route path="/customers/edit/:id" element={<ProtectedRoute><AppLayout><CustomerForm /></AppLayout></ProtectedRoute>} />

      {/* Products */}
      <Route path="/products" element={<ProtectedRoute><AppLayout><ProductList /></AppLayout></ProtectedRoute>} />
      <Route path="/products/new" element={<ProtectedRoute><AppLayout><ProductForm /></AppLayout></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><AppLayout><ProductForm /></AppLayout></ProtectedRoute>} />
      <Route path="/products/edit/:id" element={<ProtectedRoute><AppLayout><ProductForm /></AppLayout></ProtectedRoute>} />

      {/* Quotations */}
      <Route path="/quotations" element={<ProtectedRoute><AppLayout><QuotationList /></AppLayout></ProtectedRoute>} />
      <Route path="/quotations/add" element={<ProtectedRoute><AppLayout><QuotationForm /></AppLayout></ProtectedRoute>} />
      <Route path="/quotations/edit/:id" element={<ProtectedRoute><AppLayout><QuotationForm /></AppLayout></ProtectedRoute>} />

      {/* Invoices */}
      <Route path="/invoices" element={<ProtectedRoute><AppLayout><InvoiceList /></AppLayout></ProtectedRoute>} />
      <Route path="/invoices/add" element={<ProtectedRoute><AppLayout><InvoiceForm /></AppLayout></ProtectedRoute>} />
      <Route path="/invoices/edit/:id" element={<ProtectedRoute><AppLayout><InvoiceForm /></AppLayout></ProtectedRoute>} />

      {/* Purchase Orders */}
      <Route path="/pos" element={<ProtectedRoute><AppLayout><POList /></AppLayout></ProtectedRoute>} />
      <Route path="/pos/add" element={<ProtectedRoute><AppLayout><POForm /></AppLayout></ProtectedRoute>} />
      <Route path="/pos/edit/:id" element={<ProtectedRoute><AppLayout><POForm /></AppLayout></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
