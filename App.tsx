import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ShopLayout } from './components/ShopLayout';
import { ClientLayout } from './components/ClientLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Stores } from './pages/Stores';
import { Plans } from './pages/Plans';
import { Logs } from './pages/Logs';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';
import { Support } from './pages/Support';
import { Landing } from './pages/Landing';
import { EditPlan } from './pages/EditPlan';
import { Reports } from './pages/Reports';
import { SupportList } from './pages/SupportList';
import { Employees } from './pages/Employees';
import { Segments } from './pages/Segments';
import { RequirePermission } from './components/RequirePermission';

// Shop Pages
import { ShopLogin } from './pages/shop/ShopLogin';
import { ShopRegister } from './pages/shop/ShopRegister';
import { ShopDashboard } from './pages/shop/ShopDashboard';
import { ShopCalendar } from './pages/shop/ShopCalendar';
import { ShopServices } from './pages/shop/ShopServices';
import { ShopProfessionals } from './pages/shop/ShopProfessionals';
import { ShopReports } from './pages/shop/ShopReports';
import { ShopSubscription } from './pages/shop/ShopSubscription';
import { ShopSettings } from './pages/shop/ShopSettings';
import { ShopHours } from './pages/shop/ShopHours';
import { ShopPayments } from './pages/shop/ShopPayments';
import { ShopNotifications } from './pages/shop/ShopNotifications';
import { ShopSupport } from './pages/shop/ShopSupport';

// Client Pages
import { ClientShopLanding } from './pages/client/ClientShopLanding';
import { ClientSelectProfessional } from './pages/client/ClientSelectProfessional';
import { ClientSelectDateTime } from './pages/client/ClientSelectDateTime';
import { ClientPersonalData } from './pages/client/ClientPersonalData';
import { ClientPayment } from './pages/client/ClientPayment';
import { ClientConfirmation } from './pages/client/ClientConfirmation';
import { ClientMyAppointments } from './pages/client/ClientMyAppointments';
import { ClientTerms } from './pages/client/ClientTerms';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/shop-login" element={<ShopLogin />} />
          <Route path="/shop-register" element={<ShopRegister />} />

          {/* Client Routes (Public Booking Flow) */}
          <Route path="/client/:storeId" element={<ClientLayout />}>
            <Route index element={<ClientShopLanding />} />
            <Route path="professional" element={<ClientSelectProfessional />} />
            <Route path="datetime" element={<ClientSelectDateTime />} />
            <Route path="personal" element={<ClientPersonalData />} />
            <Route path="payment" element={<ClientPayment />} />
            <Route path="confirmation" element={<ClientConfirmation />} />
            <Route path="my-appointments" element={<ClientMyAppointments />} />
            <Route path="terms" element={<ClientTerms />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<RequirePermission permission="employees"><Employees /></RequirePermission>} />
            <Route path="/stores" element={<RequirePermission permission="stores"><Stores /></RequirePermission>} />
            <Route path="/plans" element={<RequirePermission permission="plans"><Plans /></RequirePermission>} />
            <Route path="/plans/edit/:id" element={<RequirePermission permission="plans"><EditPlan /></RequirePermission>} />
            <Route path="/logs" element={<RequirePermission permission="logs"><Logs /></RequirePermission>} />
            <Route path="/integrations" element={<RequirePermission permission="integrations"><Integrations /></RequirePermission>} />
            <Route path="/segments" element={<RequirePermission permission="settings"><Segments /></RequirePermission>} />
            <Route path="/settings" element={<RequirePermission permission="settings"><Settings /></RequirePermission>} />
            <Route path="/support" element={<SupportList />} />
            <Route path="/support/:id" element={<Support />} />
            <Route path="/reports" element={<RequirePermission permission="reports"><Reports /></RequirePermission>} />
          </Route>

          {/* Shop Routes */}
          <Route path="/shop" element={<ShopLayout />}>
            <Route index element={<Navigate to="/shop/dashboard" replace />} />
            <Route path="dashboard" element={<ShopDashboard />} />
            <Route path="calendar" element={<ShopCalendar />} />
            <Route path="services" element={<ShopServices />} />
            <Route path="professionals" element={<ShopProfessionals />} />
            <Route path="hours" element={<ShopHours />} />
            <Route path="payments" element={<ShopPayments />} />
            <Route path="reports" element={<ShopReports />} />
            <Route path="subscription" element={<ShopSubscription />} />
            <Route path="settings" element={<ShopSettings />} />
            <Route path="notifications" element={<ShopNotifications />} />
            <Route path="support" element={<ShopSupport />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;