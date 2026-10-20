import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MerchantPortal } from './pages/merchant/MerchantPortal';
import { CourierPortal } from './pages/courier/CourierPortal';
import { WarehousePortal } from './pages/warehouse/WarehousePortal';
import { OwnerPortal } from './pages/owner/OwnerPortal';
import { LoginPage } from './pages/auth/LoginPage';
import { PublicTrackingPage } from './pages/public/PublicTrackingPage';

export const App: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isPublicTrackingView, setIsPublicTrackingView] = useState<boolean>(false);

  // When role changes, set default tab
  React.useEffect(() => {
    if (user) {
      if (user.role === 'MERCHANT') setCurrentTab('dashboard');
      else if (user.role === 'COURIER') setCurrentTab('shift');
      else setCurrentTab('overview');
    }
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f3f8] flex items-center justify-center font-arabic">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-twsela-teal to-twsela-blue flex items-center justify-center font-bold text-xl text-white animate-pulse shadow-md">
            ت
          </div>
          <span className="text-xs font-bold text-navy">جاري تحميل منصة توصيلة...</span>
        </div>
      </div>
    );
  }

  // Public tracking mode
  if (isPublicTrackingView) {
    return <PublicTrackingPage onBackToPortal={() => setIsPublicTrackingView(false)} />;
  }

  // Unauthenticated user -> Login
  if (!isAuthenticated || !user) {
    return <LoginPage onOpenPublicTracking={() => setIsPublicTrackingView(true)} />;
  }

  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onOpenPublicTracking={() => setIsPublicTrackingView(true)}
    >
      {user.role === 'ADMIN' && <AdminDashboard activeTab={currentTab} />}
      {user.role === 'MERCHANT' && <MerchantPortal activeTab={currentTab} />}
      {user.role === 'COURIER' && <CourierPortal activeTab={currentTab} onNavigateTab={setCurrentTab} />}
      {user.role === 'WAREHOUSE' && <WarehousePortal activeTab={currentTab} onNavigateTab={setCurrentTab} />}
      {user.role === 'OWNER' && <OwnerPortal activeTab={currentTab} />}
    </AppShell>
  );
};

export default App;
