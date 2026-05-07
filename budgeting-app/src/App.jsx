import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import AddTransactionModal from './components/AddTransactionModal';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { token, loading } = useApp();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  const { token, loading, showAddModal } = useApp();

  if (loading) return <div className="page-loading">Loading…</div>;

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/auth"
          element={token ? <Navigate to="/dashboard" replace /> : <Auth />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>}
        />
        <Route
          path="/transactions"
          element={<ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>}
        />
        <Route
          path="/budgets"
          element={<ProtectedRoute><Layout><Budgets /></Layout></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {showAddModal && <ProtectedRoute><AddTransactionModal /></ProtectedRoute>}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
